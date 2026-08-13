import uuid
from sqlalchemy import Column, Integer, String, DateTime, func, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

DEFAULT_STORAGE_QUOTA_BYTES = 5 * 1024 ** 3  # 5GB free tier default


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    storage_used = Column(BigInteger, nullable=False, default=5 * 1024**3, server_default=str(5 * 1024**3))
    storage_quota_bytes = Column(
        BigInteger,
        nullable=False,
        default=DEFAULT_STORAGE_QUOTA_BYTES,
        server_default=str(DEFAULT_STORAGE_QUOTA_BYTES),
    )
    

    files = relationship("File", back_populates="owner")