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

resource "aws_iam_role" "notifications_role" {
  name = "${var.lambda_name}-${var.aws_env}"
  description = "Role for ${var.lambda_name}on ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "notifications_aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.notifications_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "notifications_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = ["ses:SendEmail", "ses:SendTemplatedEmail"]
    resources = ["*"]
  }

  dynamic "statement" {
    for_each = var.bucket_s3 != null ? [var.bucket_s3] : []

    content {
      effect = "Allow"
      actions = ["s3:PutObject"]
      resources = ["${statement.value}/", "${statement.value}/*"]
    }
  }
}

resource "aws_iam_role_policy" "notifications_policy" {
  name = "${var.lambda_name}-${var.aws_env}"
  policy = data.aws_iam_policy_document.notifications_policy.json
  role = aws_iam_role.notifications_role.id
}
