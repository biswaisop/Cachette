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