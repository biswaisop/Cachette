from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class UploadInitiate(BaseModel):
    filename: str
    size: int
    content_type: str
    folder_id: Optional[UUID] = None

class UploadInitiateResponse(BaseModel):
    file_id: UUID
    upload_mode: str #single or multipart
    put_url: Optional[str] = None #if single
    upload_id: Optional[str] = None #if multipart

class CompletePart(BaseModel):
    part_number: int
    etag: int

class CompleteUpload(BaseModel):
    parts: list[CompletePart]