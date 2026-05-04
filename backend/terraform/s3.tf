resource "aws_s3_bucket" "innovafam_bucket" {
  bucket = "innovafam-${var.aws_env}"

  tags = local.common_tags
}

resource "aws_s3_bucket_cors_configuration" "innovafam_cors" {
  bucket = aws_s3_bucket.innovafam_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "POST", "GET"]

    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.innovafam_bucket.id

  lambda_function {
    lambda_function_arn = module.collabs_certificates_ai.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "collabs/"
    filter_suffix     = ".pdf"
  }

  lambda_function {
    lambda_function_arn = module.services_ai.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "services/"
    filter_suffix     = ".pdf"
  }

  lambda_function {
    lambda_function_arn = module.collabs_certificates_ai.arn
    events              = ["s3:ObjectCreated:*"]
    filter_prefix       = "collabs/"
    filter_suffix     = ".jpg"
  }

  depends_on = [module.collabs_certificates_ai]
}
