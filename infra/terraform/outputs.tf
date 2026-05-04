# Export outputs
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.nextjs_app_pool.id
}

output "cognito_user_pool_arn" {
  value = aws_cognito_user_pool.nextjs_app_pool.arn
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.nextjs_web_client.id
}

output "cognito_client_secret" {
  value = aws_cognito_user_pool_client.nextjs_web_client.client_secret
  sensitive = true
}

output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.nextjs_identity_pool.id
}

output "cognito_issuer" {
  value = "https://cognito-idp.${var.aws_env}.amazonaws.com/${aws_cognito_user_pool.nextjs_app_pool.id}"
}

output "cognito_user_pool_name" {
  value = aws_cognito_user_pool.nextjs_app_pool.name
}
