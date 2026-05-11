terraform {
  required_version = ">= 1.14.6"

  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "6.36.0"
    }
  }
  backend "s3" {}
}

data "aws_caller_identity" "current" {}

provider "aws" {
  region = var.aws_region
}

/*
## Descomentar sólo para la base de infra.
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name           = "terraform-locks"
  hash_key       = "LockID"
  billing_mode   = "PAY_PER_REQUEST"

  attribute {
    name = "LockID"
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }
}
*/
