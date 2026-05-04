import boto3

s3_client = boto3.client("s3")


def get_obj_metadata(bucket: str, key: str) -> dict[str, str]:
    obj = s3_client.head_object(Bucket=bucket, Key=key)
    return obj["Metadata"]
