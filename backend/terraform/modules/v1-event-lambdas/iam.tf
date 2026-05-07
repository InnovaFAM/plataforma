data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "lambda_role" {
  name               = substr("${var.lambda_name}-lambda-role-${var.aws_env}", 0, 64)
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "event_lambda" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem", "dynamodb:Query"]
    resources = ["*"]
  }

  dynamic "statement" {
      for_each = var.notifications_lambda_arn != null ? [var.notifications_lambda_arn] : []

      content {
        effect = "Allow"

        actions = [
          "lambda:InvokeFunction",
        ]

        resources = [
          statement.value,
        ]
      }
    }
}

data "aws_iam_policy_document" "scheduler_assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "scheduler_role" {
  name               = substr("${var.lambda_name}-scheduler-role-${var.aws_env}", 0, 64)
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume_role.json

  tags = var.tags
}

data "aws_iam_policy_document" "scheduler_invoke_lambda" {
  statement {
    effect = "Allow"

    actions = [
      "lambda:InvokeFunction",
    ]

    resources = [
      aws_lambda_function.lambda.arn,
    ]
  }
}

resource "aws_iam_policy" "scheduler_invoke_lambda" {
  name   = substr("${var.lambda_name}-scheduler-policy-${var.aws_env}", 0, 64)
  policy = data.aws_iam_policy_document.scheduler_invoke_lambda.json

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "scheduler_invoke_lambda" {
  role       = aws_iam_role.scheduler_role.name
  policy_arn = aws_iam_policy.scheduler_invoke_lambda.arn
}


resource "aws_iam_role_policy" "event_lambda_policy" {
  name = "${var.lambda_name}-${var.aws_env}-event-lambda-policy"
  policy = data.aws_iam_policy_document.event_lambda.json
  role = aws_iam_role.lambda_role.id
}
