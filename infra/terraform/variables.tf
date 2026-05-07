locals {
  account_id = data.aws_caller_identity.current.account_id
  provider_name = "cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.nextjs_app_pool.id}"

  common_tags = {
    Env         = var.aws_env
    Terraform   = "true"
    Scope  = "innovafam-infra"
  }
}



variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "innovafam"
}


variable "bucket_name" {
  description = "Bucket Name for Infrastructure"
  default     = "innovafam-infrastructure"
  type        = string
}

variable "aws_region" {
  description = "AWS N.V. Region"
  default     = "us-east-1"
  type        = string
}

variable "aws_env" {
  description = "environment: stage / prod"
  type    = string
}


# Cognito Configuration Variables
variable "cognito_pool_name" {
  description = "Name of the Cognito User Pool"
  type        = string
  default     = "nextjs-app-pool"
}

variable "cognito_client_name" {
  description = "Name of the Cognito User Pool Client"
  type        = string
  default     = "nextjs-web-client"
}

variable "cognito_identity_pool_name" {
  description = "Name of the Cognito Identity Pool"
  type        = string
  default     = "nextjs-identity-pool"
}
