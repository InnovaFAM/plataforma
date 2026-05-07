output "lambda_name" {
  value = aws_lambda_function.lambda.function_name
}

output "lambda_arn" {
  value = aws_lambda_function.lambda.arn
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_role.arn
}

output "scheduler_role_arn" {
  value = aws_iam_role.scheduler_role.arn
}

output "schedule_arn" {
  value = var.create_schedule ? aws_scheduler_schedule.this[0].arn : null
}
