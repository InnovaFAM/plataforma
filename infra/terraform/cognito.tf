resource "aws_cognito_user_pool" "nextjs_app_pool" {
  name = "${var.cognito_pool_name}-${var.aws_env}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  admin_create_user_config {
    allow_admin_create_user_only = true
  }

  sign_in_policy {
    allowed_first_auth_factors = [
      "PASSWORD",
      "EMAIL_OTP"
    ]
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 7
  }

  account_recovery_setting {
    recovery_mechanism {
      name = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  tags = local.common_tags
}

resource "aws_cognito_user_pool_client" "nextjs_web_client" {
  name = "${var.cognito_client_name}-${var.aws_env}"
  user_pool_id = aws_cognito_user_pool.nextjs_app_pool.id

  generate_secret = true

  callback_urls = [
    "http://localhost:3000/api/auth/callback/cognito",
    "https://yourdomain.com/api/auth/callback/cognito"
  ]

  logout_urls = [
    "http://localhost:3000",
    "https://yourdomain.com"
  ]

  supported_identity_providers = [
    "COGNITO"
  ]

  explicit_auth_flows = [
    "ALLOW_USER_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  access_token_validity  = 10
  id_token_validity      = 10
  refresh_token_validity = 1

  prevent_user_existence_errors = "ENABLED"

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }
}

resource "aws_cognito_identity_pool" "nextjs_identity_pool" {
  identity_pool_name = "${var.cognito_identity_pool_name}-${var.aws_env}"
  allow_unauthenticated_identities = true

  cognito_identity_providers {
    client_id = aws_cognito_user_pool_client.nextjs_web_client.id
    provider_name = local.provider_name
  }

  tags = local.common_tags
}
