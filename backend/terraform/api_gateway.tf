
resource "aws_apigatewayv2_api" "fam_api" {
  name           = "innovafam-api-${var.aws_env}"
  protocol_type  = "HTTP"

  cors_configuration {
    max_age        = 86400
    allow_origins = ["http://localhost:3000", "https://siges.innovafam.cl"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  allow_credentials = true
    expose_headers = []
  }

  tags = local.common_tags
}

resource "aws_apigatewayv2_deployment" "fam_api" {
  api_id = aws_apigatewayv2_api.fam_api.id

  triggers = {
    redeployment = sha1(join(",", tolist([])))
  }

  depends_on = [
    module.get_init_lambda.aws_apigatewayv2_route,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_apigatewayv2_authorizer" "authorizer" {
  api_id           = aws_apigatewayv2_api.fam_api.id
  name             = "innovafam-api-token-authorizer"
  authorizer_type  = "JWT"

  identity_sources = ["$request.header.Authorization"]

  jwt_configuration {
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${local.user_pool_id}"
    audience = [local.app_client_id]
  }
  authorizer_result_ttl_in_seconds = 0

  depends_on = [
    module.handle_authorizer
  ]
}

resource "aws_apigatewayv2_stage" "fam_api_v1" {
  api_id         = aws_apigatewayv2_api.fam_api.id
  name           = "innovafam-v1-${var.aws_env}"
  auto_deploy    = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_fam_logs.arn
    format          = "{ \"requestId\":\"$context.requestId\", \"ip\": \"$context.identity.sourceIp\",\"requestTime\":\"$context.requestTime\", \"httpMethod\":\"$context.httpMethod\",\"routeKey\":\"$context.routeKey\", \"status\":\"$context.status\",\"protocol\":\"$context.protocol\", \"responseLength\":\"$context.responseLength\", \"error\": \"$context.error.message\", \"authorizer_error\": \"$context.authorizer.error\", \"integration_error\": \"$context.integrationErrorMessage\" }"
  }

  tags = local.common_tags
}

resource "aws_cloudwatch_log_group" "api_fam_logs" {
  name              = "innovafam-v1-${var.aws_env}"
  retention_in_days = 30

  tags = local.common_tags
}
