variable "aws_env" {
  description = "AWS environment"
  type        = string
}

variable "tags" {
  description = "Tags for lambda function"
  default     = {}
}

variable "memory_size" {
  description = "Lambda Function Memory Size"
  type        = number
  default     = 128
}

variable "timeout" {
  description = "Lambda Function Timeout"
  type        = number
  default     = 5
}

variable "environment_variables" {
  description = "Lambda environment variables"
  default     = {}
}

variable "source_arn" {
  description = "Source arn for permissions"
}

variable "bucket_s3" {
  description = "bucket s3 for permissions"
}
