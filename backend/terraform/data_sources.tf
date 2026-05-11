data "aws_caller_identity" "current" {}


data "aws_dynamodb_table" "core_business" {
  name = "CoreBusiness_${var.aws_env}"
}

data "aws_cognito_user_pools" "nextjs_app_pool" {
  name = "nextjs-app-pool-${var.aws_env}"
}

data "aws_cognito_user_pool_clients" "nextjs_web_client" {
  user_pool_id = local.user_pool_id
}

data "aws_cognito_user_pool" "nextjs_app_pool" {
  user_pool_id = local.user_pool_id
}

data "aws_secretsmanager_secret" "app_secrets" {
  name = "${var.project_name}/${var.aws_env}/app-secrets"
}

data "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = data.aws_secretsmanager_secret.app_secrets.id
}
