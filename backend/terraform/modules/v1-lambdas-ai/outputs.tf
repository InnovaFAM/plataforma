output "invoke_arn" {
  value       = aws_lambda_function.lambda.invoke_arn
  description = "Invoke ARN"
}

output "arn" {
  value       = aws_lambda_function.lambda.arn
  description = "Lambda ARN"
}
