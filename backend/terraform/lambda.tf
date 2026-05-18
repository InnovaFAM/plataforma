module "get_init_lambda" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/"
  role_arn       = aws_iam_role.lambda_default_role.arn

  lambda_name = "v1-get-init"
  route_keys   = ["GET /"]
  tags        = local.common_tags

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "collabs_certificates_ai" {
  source = "./modules/v1-lambdas-ai"

  source_arn  = aws_s3_bucket.innovafam_bucket.arn
  aws_env     = var.aws_env
  tags        = local.common_tags
  timeout     = 90
  memory_size = 512
  bucket_s3   = aws_s3_bucket.innovafam_bucket.arn
  lambda_name = "v1-collabs-certificates-ai"

  environment_variables = {
    ENV : var.aws_env
  }
}

module "services_ai" {
  source = "./modules/v1-lambdas-ai"

  source_arn  = aws_s3_bucket.innovafam_bucket.arn
  aws_env     = var.aws_env
  tags        = local.common_tags
  timeout     = 90
  memory_size = 512
  bucket_s3   = aws_s3_bucket.innovafam_bucket.arn
  lambda_name = "v1-services-ai"

  environment_variables = {
    ENV : var.aws_env
  }
}

module "handle_authorizer" {
  source = "./modules/v1-handle-authorizer"

  source_arn  = "${aws_apigatewayv2_api.fam_api.execution_arn}/authorizers/*"
  aws_env     = var.aws_env
  tags        = local.common_tags
  timeout     = 15
  memory_size = 128

  environment_variables = {
    ENV : var.aws_env
    COGNITO_USER_POOL_ID: local.user_pool_id
    COGNITO_APP_CLIENT_ID: local.app_client_id
  }
}

module "notifications" {
  source = "./modules/v1-invoke-lambdas"
  lambda_name = "v1-notifications"
  aws_env     = var.aws_env
  tags        = local.common_tags
  timeout     = 90
  memory_size = 128

  environment_variables = {
    ENV : var.aws_env
    FROM_EMAIL: var.from_email
  }
}

module "exports" {
  source = "./modules/v1-invoke-lambdas"
  lambda_name = "v1-exports"
  aws_env     = var.aws_env
  tags        = local.common_tags
  timeout     = 300
  memory_size = 256
  bucket_s3   = aws_s3_bucket.innovafam_bucket.arn

  environment_variables = {
    ENV: var.aws_env
    EXPORT_BUCKET: aws_s3_bucket.innovafam_bucket.bucket
    FROM_EMAIL: var.from_email
  }
}

module "daily_tasks" {
  source = "./modules/v1-event-lambdas"
  notifications_lambda_arn = module.notifications.lambda_arn

  aws_env     = var.aws_env
  tags        = local.common_tags
  lambda_name = "v1-daily-tasks"

  timeout     = 300
  memory_size = 512

  schedule_expression = "cron(0 9 * * ? *)"
  schedule_timezone   = "America/Santiago"

  environment_variables = {
    ENV = var.aws_env
  }

  schedule_payload = {
    job = "SERVICE_NOTIFICATIONS"
  }
}

module "analytics_event" {
  source = "./modules/v1-event-lambdas"
  notifications_lambda_arn = module.notifications.lambda_arn

  aws_env     = var.aws_env
  tags        = local.common_tags
  lambda_name = "v1-analytics-event"

  timeout     = 300
  memory_size = 512

  schedule_expression = "cron(0 21 * * ? *)"
  schedule_timezone   = "America/Santiago"

  environment_variables = {
    ENV = var.aws_env
  }

  schedule_payload = {
    mode = "full"
  }
}


module "sync_buk" {
  source = "./modules/v1-event-lambdas"

  aws_env     = var.aws_env
  tags        = local.common_tags
  lambda_name = "v1-sync-buk"

  timeout     = 900
  memory_size = 1024

  schedule_expression = "cron(0 2 ? * SAT *)"
  schedule_timezone   = "America/Santiago"

  environment_variables = {
    ENV = var.aws_env
    BUK_API_KEY: local.app_secrets["BUK_API_KEY"]
  }

  schedule_payload = {
    mode = "full"
  }
}

module "checks" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/checks*"
  role_arn       = aws_iam_role.lambda_default_role.arn
  timeout        = 12

  lambda_name = "v1-checks"
  route_keys   = ["ANY /checks/{proxy+}", "ANY /checks"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "certificates" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/certificates*"
  role_arn       = aws_iam_role.certificates_role.arn
  authorizer_id  = aws_apigatewayv2_authorizer.authorizer.id
  timeout        = 30

  lambda_name = "v1-certificates"
  route_keys   = ["ANY /certificates/{proxy+}", "ANY /certificates"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
    TABLE_NAME : data.aws_dynamodb_table.core_business.name
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "analytics" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/analytics*"
  role_arn       = aws_iam_role.lambda_default_role.arn
  authorizer_id  = aws_apigatewayv2_authorizer.authorizer.id
  timeout        = 30

  lambda_name = "v1-analytics"
  route_keys   = ["ANY /analytics/{proxy+}", "ANY /analytics"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "backoffice" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/backoffice*"
  role_arn       = aws_iam_role.certificates_role.arn
  authorizer_id  = aws_apigatewayv2_authorizer.authorizer.id
  timeout        = 30

  lambda_name = "v1-backoffice"
  route_keys   = ["ANY /backoffice/{proxy+}", "ANY /backoffice"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "users" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/users*"
  role_arn       = aws_iam_role.users_role.arn
  timeout        = 30

  lambda_name = "v1-users"
  route_keys   = ["OPTIONS /users", "OPTIONS /users/{proxy+}", "ANY /users/{proxy+}", "ANY /users"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
    COGNITO_USER_POOL_ID : local.user_pool_id
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "services" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/services*"
  role_arn       = aws_iam_role.certificates_role.arn
  authorizer_id  = aws_apigatewayv2_authorizer.authorizer.id
  timeout        = 30

  lambda_name = "v1-services"
  route_keys   = ["ANY /services/{proxy+}", "ANY /services"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "collabs" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/*/collabs*"
  role_arn       = aws_iam_role.certificates_role.arn
  authorizer_id  = aws_apigatewayv2_authorizer.authorizer.id
  timeout        = 30

  lambda_name = "v1-collabs"
  route_keys   = ["ANY /collabs/{proxy+}", "ANY /collabs"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}

module "webhooks_buk" {
  source = "./modules/api-gateway-lambdas"

  api_gateway_id = aws_apigatewayv2_api.fam_api.id
  aws_env        = var.aws_env
  execution_arn  = "${local.execution_uri}/${aws_apigatewayv2_stage.fam_api_v1.name}/POST/webhooks/buk"
  role_arn       = aws_iam_role.lambda_default_role.arn
  timeout        = 50

  lambda_name = "v1-post-webhooks-buk"
  route_keys   = ["POST /webhooks/buk"]
  tags        = local.common_tags

  environment_variables = {
    ENV : var.aws_env
    BUK_API_KEY: local.app_secrets["BUK_API_KEY"]
  }

  depends_on = [
    aws_apigatewayv2_api.fam_api,
    aws_apigatewayv2_stage.fam_api_v1,
    aws_iam_role.lambda_default_role,
  ]
}
