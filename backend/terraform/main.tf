terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.26.0"
    }
  }

  backend "s3" {}
}

locals {
  common_tags = {
    Env       = var.aws_env
    Terraform = "true"
    Scope     = "fam-api"
  }
  user_pool_id  = "us-east-1_oZA3Ps6eH"
  app_client_id = "3u45tat2fj0q3plp1v3i60d6ug"
  execution_uri = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.fam_api.id}"
}

provider "aws" {
  region = var.aws_region
}
