data "aws_ecr_image" "lambda" {
  repository_name = "${var.lambda_name}-${var.aws_env}"
  image_tag       = "latest"
}

resource "aws_lambda_function" "lambda" {
  function_name = "innovafam-${var.lambda_name}-${var.aws_env}"
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri
  role          = var.role_arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  dynamic "vpc_config" {
    for_each = length(var.vpc_config) > 0 ? [1] : []
    content {
      security_group_ids = var.vpc_config.security_group_ids
      subnet_ids         = var.vpc_config.subnet_ids
    }
  }

  dynamic "environment" {
    for_each = length(var.environment_variables) > 0 ? [1] : []
    content {
      variables = var.environment_variables
    }
  }

  tags = var.tags
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id                 = var.api_gateway_id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.lambda.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
  request_parameters     = var.request_parameters
}

resource "aws_apigatewayv2_route" "route" {
  for_each           = toset(var.route_keys)

  api_id             = var.api_gateway_id
  route_key          = each.value
  target             = join("/", ["integrations", aws_apigatewayv2_integration.lambda_integration.id])
  authorization_type = var.authorizer_id == null ? "NONE" : "JWT"
  authorizer_id      = var.authorizer_id
}

resource "aws_lambda_permission" "permission" {
  statement_id  = "apigw-persmission-${var.lambda_name}-${var.aws_env}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.execution_arn
}
