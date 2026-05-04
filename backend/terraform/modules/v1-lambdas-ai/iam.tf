data "aws_iam_policy_document" "assume_role" {
  version = "2012-10-17"

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      identifiers = ["lambda.amazonaws.com"]
      type        = "Service"
    }
  }
}

resource "aws_iam_role" "role" {
  name               = "v1-innovafam-${var.lambda_name}-${var.aws_env}"
  description        = "Role v1 services ai for ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  tags               = var.tags
}

resource "aws_iam_role_policy_attachment" "aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "connections_policy" {
  version = "2012-10-17"

  statement {
    effect    = "Allow"
    actions   = ["dynamodb:GetItem", "dynamodb:Query", "dynamodb:PutItem"]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:GetObjectVersion"]
    resources = ["${var.bucket_s3}/", "${var.bucket_s3}/*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["textract:StartDocumentTextDetection", "textract:GetDocumentTextDetection"]
    resources = ["*"]
  }

  statement {
    effect    = "Allow"
    actions   = ["bedrock:InvokeModel", "bedrock:Converse"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "connections_policy" {
  name   = "v1-innovafam-${var.lambda_name}-${var.aws_env}"
  policy = data.aws_iam_policy_document.connections_policy.json
  role   = aws_iam_role.role.id
}
