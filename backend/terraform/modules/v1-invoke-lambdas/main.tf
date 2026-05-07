data "aws_ecr_image" "lambda" {
  repository_name = "${var.lambda_name}-${var.aws_env}"
  image_tag       = "latest"
}

resource "aws_lambda_function" "lambda" {
  function_name = "innovafam-${var.lambda_name}-${var.aws_env}"
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri
  role          = aws_iam_role.notifications_role.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}
