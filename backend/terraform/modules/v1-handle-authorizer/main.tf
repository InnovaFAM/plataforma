data "aws_ecr_image" "lambda" {
  repository_name = "v1-handle-authorizer-${var.aws_env}"
  image_tag       = "latest"
}

resource "aws_lambda_function" "lambda" {
  function_name = "innovafam-v1-handle-authorizer-${var.aws_env}"
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri
  role          = aws_iam_role.handle_authorizer_role.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}

resource "aws_lambda_permission" "authorizer_lambda_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = var.source_arn
}
