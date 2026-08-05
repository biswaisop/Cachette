import boto3
from botocore.exceptions import ClientError
from app.config import settings

s3_client = boto3.client("s3", region_name = settings.AWS_REGION)


def generate_upload_url(s3_key: str, content_type: str, expires_in: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        "put_object",
        Params = {
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": s3_key,
            "ContentType": content_type
        },
        ExpiresIn = expires_in 
    )

def generate_download_url(s3_key: str, expires_in: int = 3600) -> str:
    return s3_client.generate_presigned_url(
        "get_object",
        Params = {
            "Bucket": settings.S3_BUCKET_NAME,
            "Key": s3_key
        },
        ExpiresIn = expires_in
    )

def delete_object(s3_key: str) -> None:
    s3_client.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)

from typing import Any

import aioboto3
from botocore.exceptions import ClientError

class S3_Service:
    def __init__(self) -> None:
        self.bucket = settings.S3_BUCKET_NAME

        if not self.bucket:
            raise RuntimeError("AWS_S3_BUCKET environment variable is not set.")

        self.region = settings.AWS_REGION
        self._session = aioboto3.Session()

    async def _client(self):
        return self._session.client(
            "s3",
            region_name=self.region
        )

    # ------------------------------------------------------------------
    # Multipart Upload
    # ------------------------------------------------------------------

    async def create_multipart_upload(
            self, 
            *,
            key: str,
            content_type: str | None = None
    ) -> str:
        params: dict[str, any] = {
            "Bucket": self.bucket,
            "Key": key
        }

        if content_type:
            params["ContentType"] = content_type

        try:
            async with self._client() as client:
                response = await client.create_multipart_upload(**params)
                return response["Uploaded"]

        except ClientError as e:
            raise RuntimeError(
                f"failed to create multipart upload: {e}"
            ) from e

    async def generate_part_upload_url(
            self, 
            *,
            key: str,
            upload_id: str,
            part_number: int,
            expires_in: int = 900,
    ) -> str:
        try:
            async with await self._client() as client:
                return await client.generate_presigned_url(
                    ClientMethod="upload_part",
                    Params={
                        "Bucket": self.bucket,
                        "Key": key,
                        "UploadId": upload_id,
                        "PartNumber": part_number,
                    },
                    ExpiresIn=expires_in,
                )
        except ClientError as e:
            raise RuntimeError(
                f"Failed to generate presigned upload URL: {e}"
            ) from e

    async def abort_multipart_upload(
        self,
        *,
        key: str,
        upload_id: str,
    ):
        try:
            async with await self._client() as client:
                return await client.abort_multipart_upload(
                    Bucket=self.bucket,
                    Key=key,
                    UploadId=upload_id,
                )

        except ClientError as e:
            raise RuntimeError(
                f"Failed to abort multipart upload: {e}"
            ) from e

# ------------------------------------------------------------------
# Downloads
# ------------------------------------------------------------------

async def  generate_download_url(
        self, 
        *,
        key: str,
        expires_in: int = 3600
) -> str:
    try:
        async with await self._client() as client:
            return await client.generate_presigned_url(
                ClientMethod = "get_object",
                params = {
                    "Bucket":self.bucket,
                    "Key": key,
                }, 
                ExpiresIn = expires_in,
            )
        
    except ClientError as e:
            raise RuntimeError(
                f"Failed to generate download URL: {e}"
            ) from e

# ------------------------------------------------------------------
# Delete
# ------------------------------------------------------------------

    async def delete_object(
        self,
        *,
        key: str,
    ):
        try:
            async with await self._client() as client:
                return await client.delete_object(
                    Bucket=self.bucket,
                    Key=key,
                )

        except ClientError as e:
            raise RuntimeError(
                f"Failed to delete object: {e}"
            ) from e

# ------------------------------------------------------------------
# Exists
# ------------------------------------------------------------------

    async def object_exists(
        self,
        *,
        key: str,
    ) -> bool:
        try:
            async with await self._client() as client:
                await client.head_object(
                    Bucket=self.bucket,
                    Key=key,
                )
                return True

        except ClientError as e:
            code = e.response.get("Error", {}).get("Code")

            if code in ("404", "NoSuchKey", "NotFound"):
                return False

            raise RuntimeError(
                f"Failed to check object existence: {e}"
            ) from e