resource "aws_kms_key" "secrets" {
  description             = "KMS key for ${var.project_name} secrets manager - ${var.aws_env}"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name        = "${var.project_name}-${var.aws_env}-secrets-kms"
    Environment = var.aws_env
    Project     = var.project_name
  }
}

resource "aws_kms_alias" "secrets" {
  name          = "alias/${var.project_name}-${var.aws_env}-secrets"
  target_key_id = aws_kms_key.secrets.key_id
}

resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.project_name}/${var.aws_env}/app-secrets"
  description = "Application secrets for ${var.project_name} - ${var.aws_env}"

  kms_key_id = aws_kms_key.secrets.arn

  recovery_window_in_days = 7

  tags = {
    Name        = "${var.project_name}-${var.aws_env}-app-secrets"
    Environment = var.aws_env
    Project     = var.project_name
  }
}
