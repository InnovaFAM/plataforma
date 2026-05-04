variable "api_gateway_id" {
  description = "API Gateway ID"
  type        = string
}

variable "route_keys" {
  description = "Route Keys"
  type        = list(string)
}

variable "aws_env" {
  description = "AWS environment"
  type        = string
}

variable "execution_arn" {
  description = "ACA Execution ARN"
  type        = string
}

variable "role_arn" {
  description = "ACA Role ARN"
  type        = string
}

variable "authorizer_id" {
  description = "API GW v2 Authorizer ID"
  type        = string
  default     = null
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

variable "lambda_name" {
  description = "Lambda Function Name"
  type        = string
}

variable "request_parameters" {
  description = "Use Request Parameters or not"
  default     = {}
}

variable "tags" {
  description = "Tags for lambda function"
  default     = {}
}

variable "environment_variables" {
  description = "Lambda environment variables"
  default     = {}
}

variable "vpc_config" {
  description = "Lambda with vpc config"
  default     = {}
}
