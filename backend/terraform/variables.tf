variable "aws_env" {
  description = "environment: stage / prod"
  type    = string
}

variable "aws_region" {
  description = "AWS N.V. Region"
  default     = "us-east-1"
  type        = string
}