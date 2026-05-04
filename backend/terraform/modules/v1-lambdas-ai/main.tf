data "aws_ecr_image" "lambda" {
  repository_name = "${var.lambda_name}-${var.aws_env}"
  image_tag       = "latest"
}

resource "aws_lambda_function" "lambda" {
  function_name = "innovafam-${var.lambda_name}-${var.aws_env}"
  package_type  = "Image"
  image_uri     = data.aws_ecr_image.lambda.image_uri
  role          = aws_iam_role.role.arn
  timeout       = var.timeout
  memory_size   = var.memory_size

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}

resource "aws_lambda_permission" "lambda_permission" {
  statement_id  = "AllowExecutionFromS3Bucket"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda.function_name
  principal     = "s3.amazonaws.com"

  source_arn = var.source_arn
}
