from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.service.s3_service import S3_Service

security_scheme = HTTPBearer(auto_error=False)

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
        db: AsyncSession = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate":"Bearer"}
    )

    if credentials is None:
        raise credentials_exception


    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = await db.get(User, user_id)
    if user is None:
        raise credentials_exception

    return user

def get_s3_service() -> S3_Service:
    return S3_Service()