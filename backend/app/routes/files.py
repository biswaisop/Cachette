from app import dependencies
from dns.query import _remaining
import uuid
from fastapi import APIRouter, HTTPException, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user, get_s3_service, rate_limit_user, general_limiter
from app.models.user import User
from app.models.file import File
from app.schema.file import UploadInitiate, UploadInitiateResponse, CompleteUpload, CompletePart
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

@router.post("/uploads/{file_id}, part-url", dependencies = [Depends(rate_limit_user(general_limiter))])
async def get_part_url(
    file_id: uuid.UUID,
    part_number: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    s3: s3_service = Depends(get_s3_service)
):
    file_row = await db.get(File, file_id)
    if not file_row or file_row.owner_id != current_user.id:
        raise HTTPException(400, "file not found")
    if file_row.status != "uploading":
        raise HTTPException(400, "upload not in progress")

    url = await s3.generate_part_upload_url(
        file_row.s3_key,
        file_row.upload_id,
        part_number
    )

    return {"part_number": part_number, "url": url}


@router.post("/uploads/{file_id}/complete", dependencies = [Depends(rate_limit_user(general_limiter))])
async def complete_upload(
    file_id: uuid.UUID,
    body: CompleteUpload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    s3: s3_service = Depends(get_s3_service)
):
    file_row = await db.get(File, file_id)
    if not file_row or file_row.owner_id != current_user.id:
        raise HTTPException(400, "file not found")
    
    await s3.complete_multipart_upload(
        file_row.s3_key,
        file_row.upload_id,
        [{"PartNumber": p.part_number, "ETag": p.etag} for p in body.parts]
    )

    if current_user.storage_used + file_row.size > current_user.storage_quota_bytes:
        await s3.delete_object(file_row.s3_key)
        await db.delete(file_row)
        await db.commit()
        raise HTTPException(403, "Storage quota exceeded")
    
    file_row.satatus = "active"
    current_user.storage_used += file_row.size
    await db.commit()

    return {"file_id": file_id, "status": "active"}

@router.post("/upload/{file_id}/abort", dependencies = [Depends(rate_limit_user(general_limiter))])
async def abort_upload(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    s3: s3_service = Depends(get_s3_service)
):
    file_row = await db.get(File, file_id)
    if not file_row or file_row.owner_id != current_user.id:
        raise HTTPException(404, "File not found")
    
    if file_row.upload_id:
        await s3.abort_multipart_upload(file_row.s3_key, file_row.upload_id)
    await db.delete(file_row)
    await db.commit()
    return {"status": "aborted"}
    
    
@router.delete("/{file_id}", dependencies = [Depends(rate_limit_user(general_limiter))])
async def delete_file(
    file_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    s3: s3_service = Depends(get_s3_service)
):
    file_row = await db.get(File, file_id)
    if not file_row or file_row.owner_id != current_user.id:
        raise HTTPException(404, "File not found")

    await s3.delete_object(file_row.s3_key)
    current_user.storage_used -= file_row.size
    await db.delete(file_row)
    await db.commit()
    return {"status": "deleted"}