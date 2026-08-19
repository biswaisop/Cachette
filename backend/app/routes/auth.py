from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.db.session import get_db
from app.schema.user import UserCreate, UserLogin, UserOut, TokenResponse
from app.service.auth_service import create_user, authenticate_user, create_refresh_token, create_tokens_for_user
from app.core.security import decode_token
from app.service.auth_service import get_user_by_email
from app.models.user import User
from app.dependencies import get_current_user, rate_limit, auth_limiter, general_limiter, rate_limit_user


router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit(auth_limiter, lambda r: r.client.host))])
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await create_user(db, user_data)
    return user

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limit(auth_limiter, lambda r: r.client.host))])
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, credentials.email, credentials.password)
    return create_tokens_for_user(user)

@router.post("/refresh", response_model=TokenResponse, dependencies=[Depends(rate_limit(auth_limiter, lambda r: r.client.host))])
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = UUID(payload["sub"])
    token_ver = payload.get("ver")
    result = await db.get(User, user_id)
    if not result or token_ver != result.token_version:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    return create_tokens_for_user(result)

@router.get("/me", response_model=UserOut, dependencies=[Depends(rate_limit_user(general_limiter))])
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user