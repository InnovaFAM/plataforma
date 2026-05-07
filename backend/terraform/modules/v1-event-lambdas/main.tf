
resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${var.lambda_name}"
  retention_in_days = var.log_retention_in_days

  tags = var.tags
}

data "aws_ecr_image" "lambda" {
  repository_name = "${var.lambda_name}-${var.aws_env}"
  image_tag       = "latest"
}

resource "aws_lambda_function" "lambda" {
  function_name = "innovafam-${var.lambda_name}-${var.aws_env}"

  package_type = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri

  role          = aws_iam_role.lambda_role.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

    environment {
      variables = var.environment_variables
    }

  dynamic "vpc_config" {
    for_each = length(var.subnet_ids) > 0 && length(var.security_group_ids) > 0 ? [1] : []

    content {
      subnet_ids         = var.subnet_ids
      security_group_ids = var.security_group_ids
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.this,
    aws_iam_role_policy_attachment.lambda_basic_execution,
  ]

  tags = var.tags
}
