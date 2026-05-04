data "aws_iam_policy_document" "assume_role" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "handle_authorizer_role" {
  name = "v1-innovafam-api-handle-authorizer-${var.aws_env}"
  description = "Role handle-authorizer for ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "handle_authorizer_aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.handle_authorizer_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "handle_authorizer_connections_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:GetItem"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "handle_authorizer_connections_policy" {
  name = "v1-innovafam-api-handle-authorizer-${var.aws_env}"
  policy = data.aws_iam_policy_document.handle_authorizer_connections_policy.json
  role = aws_iam_role.handle_authorizer_role.id
}