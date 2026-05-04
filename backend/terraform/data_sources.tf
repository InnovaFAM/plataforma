data "aws_caller_identity" "current" {}


data "aws_dynamodb_table" "core_business" {
  name = "CoreBusiness_${var.aws_env}"
}

data "aws_cognito_user_pool" "nextjs_app_pool" {
  user_pool_id = local.user_pool_id
}
