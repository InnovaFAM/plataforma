variable "aws_env" {
  description = "environment: stage / prod"
  type    = string
}

variable "aws_region" {
  description = "AWS N.V. Region"
  default     = "us-east-1"
  type        = string
}

variable "from_email" {
  description = "Email address to use as the sender for notifications"
  type        = string
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "innovafam"
}

variable "platform_name" {
  type    = string
  default = "SIGES InnovaFAM"
}

variable "app_url" {
  type = string
  default = "https://siges.innovafam.cl"
}
