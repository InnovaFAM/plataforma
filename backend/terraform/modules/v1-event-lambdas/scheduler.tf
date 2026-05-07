resource "aws_scheduler_schedule" "this" {
  count = var.create_schedule ? 1 : 0

  name        = substr("${var.lambda_name}-schedule-${var.aws_env}", 0, 64)
  description = "Schedule for ${var.lambda_name}"

  schedule_expression          = var.schedule_expression
  schedule_expression_timezone = var.schedule_timezone

  state = var.schedule_enabled ? "ENABLED" : "DISABLED"

  flexible_time_window {
    mode = "OFF"
  }

  target {
    arn      = aws_lambda_function.lambda.arn
    role_arn = aws_iam_role.scheduler_role.arn

    input = var.schedule_payload == null ? null : jsonencode(var.schedule_payload)

    retry_policy {
      maximum_event_age_in_seconds = var.maximum_event_age_in_seconds
      maximum_retry_attempts       = var.maximum_retry_attempts
    }
  }
}
