from dns.query import _remaining
import uuid
from fastapi import APIRouter, HTTPException, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user, get_s3_service, rate_limit_user, general_limiter
from app.models.user import User
from app.models.file import File
from app.schema.file import UploadInitiate, UploadInitiateResponse
from app.service.s3_service import s3_service
from app.config import settings

router = APIRouter(prefix="/files", tags = ["files"])

@router.post("/uploads/initate", response_model = UploadInitiateResponse, dependencies=[Depends(rate_limit_user(general_limiter))])
async def initiate_upload(
    body: UploadInitiate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    s3: s3_service = Depends(get_s3_service),
):
    if body.size > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail = f"file exceeds max size of {settings.MAX_FILE_SIZE} bytes")
    
    if current_user.storage_used + body.size > current_user.storage_quota_bytes:
        remaining = current_user.storage_quota_bytes - current_user.storage_used
        raise HTTPException(413, f"Storage quota exceeded. {remaining} bytes remaining")

    file_id = uuid.uuid4()
    key = f"users/{current_user.id}/{file_id}"

    fil_row = File(
        id = file_id,
        owner_id = current_user.id,
        s3_key = key,
        filename = body.filename,
        size = body.size,
        content_type = body.content_type,
        status = "uploading",
        folder_id = body.folder_id
    )
    db.add(fil_row)
    await db.commit()

    if body.size < settings.MULTIPART_THRESHOLD:
        put_url = await s3.generate_put_url(key, body.content_type)
        return UploadInitiateResponse(
            file_id = file_id,
            upload_mode = "single",
            put_url = put_url
        )
    else:
        upload_id = await s3.create_multipart_upload(key, body.content_type)
        return UploadInitiateResponse(
            file_id = file_id,
            upload_mode = "multipart",
            upload_id = upload_id
        )
    