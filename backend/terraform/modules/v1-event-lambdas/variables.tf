variable "lambda_name" {
  type        = string
  description = "Lambda function name."
}

variable "aws_env" {
  type        = string
  description = "Application environment, for example stage, prod, dev."
}

variable "notifications_lambda_arn" {
  type        = string
  description = "arn lambda notifications"
  default     = null
}

variable "timeout" {
  type        = number
  description = "Lambda timeout in seconds."
  default     = 60
}

variable "memory_size" {
  type        = number
  description = "Lambda memory size in MB."
  default     = 512
}

variable "environment_variables" {
  type        = map(string)
  description = "Extra Lambda environment variables."
  default     = {}
}

variable "create_schedule" {
  type        = bool
  description = "Whether to create an EventBridge Scheduler schedule."
  default     = true
}

variable "schedule_enabled" {
  type        = bool
  description = "Whether the schedule is enabled."
  default     = true
}

variable "schedule_expression" {
  type        = string
  description = "EventBridge Scheduler expression."
  default     = "cron(0 9 * * ? *)"
}

variable "schedule_timezone" {
  type        = string
  description = "Timezone for EventBridge Scheduler."
  default     = "America/Santiago"
}

variable "schedule_payload" {
  type        = any
  description = "Optional JSON payload sent to the Lambda."
  default     = null
}

variable "maximum_retry_attempts" {
  type        = number
  description = "Maximum retry attempts for EventBridge Scheduler."
  default     = 2
}

variable "maximum_event_age_in_seconds" {
  type        = number
  description = "Maximum event age in seconds."
  default     = 3600
}

variable "log_retention_in_days" {
  type        = number
  description = "CloudWatch log retention in days."
  default     = 14
}

variable "subnet_ids" {
  type        = list(string)
  description = "Optional subnet IDs if Lambda runs inside VPC."
  default     = []
}

variable "security_group_ids" {
  type        = list(string)
  description = "Optional security group IDs if Lambda runs inside VPC."
  default     = []
}

variable "tags" {
  type        = map(string)
  description = "Common tags."
  default     = {}
}
