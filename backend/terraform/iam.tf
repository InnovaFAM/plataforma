data "aws_iam_policy_document" "lambda_default_assume_role" {
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

resource "aws_iam_role" "lambda_default_role" {
  name = "innovafam-lambda-default-${var.aws_env}"
  description = "Role Lambda Default for ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_default_assume_role.json
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "aca_assetplan_aws_xray_policy" {
  role       = aws_iam_role.lambda_default_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess"
}

resource "aws_iam_role_policy_attachment" "lambda_default_role_aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.lambda_default_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "lambda_default_role_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:Query", "dynamodb:Scan", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "lambda_default_role_policy" {
  name = "innovafam-lambda-default-${var.aws_env}"
  policy = data.aws_iam_policy_document.lambda_default_role_policy.json
  role = aws_iam_role.lambda_default_role.id
}

// v1-certificates
resource "aws_iam_role" "certificates_role" {
  name = "innovafam-certificates-${var.aws_env}"
  description = "Role Lambda v1-certificates for ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_default_assume_role.json
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "certificates_aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.certificates_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "certificates_role_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:Query", "dynamodb:Scan", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = ["dynamodb:DeleteItem"]
    resources = [data.aws_dynamodb_table.core_business.arn]

    condition {
        test     = "ForAllValues:StringLike"
        variable = "dynamodb:LeadingKeys"
        values   = ["CERTS#ROLES", "COLLABS#*"]
    }
  }
}

resource "aws_iam_role_policy" "certificates_role_policy" {
  name = "innovafam-certificates-${var.aws_env}"
  policy = data.aws_iam_policy_document.certificates_role_policy.json
  role = aws_iam_role.certificates_role.id
}


// v1-users
resource "aws_iam_role" "users_role" {
  name = "innovafam-users-${var.aws_env}"
  description = "Role Lambda v1-users for ${var.aws_env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_default_assume_role.json
  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "users_aws_lambda_basic_execution_policy" {
  role       = aws_iam_role.users_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_iam_policy_document" "users_role_policy" {
  version = "2012-10-17"

  statement {
    effect = "Allow"
    actions = ["dynamodb:Query", "dynamodb:Scan", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "cognito-idp:AdminCreateUser"
    ]
    resources = [
      data.aws_cognito_user_pool.nextjs_app_pool.arn
    ]
  }
}

resource "aws_iam_role_policy" "users_role_policy" {
  name = "innovafam-users-${var.aws_env}"
  policy = data.aws_iam_policy_document.users_role_policy.json
  role = aws_iam_role.users_role.id
}
