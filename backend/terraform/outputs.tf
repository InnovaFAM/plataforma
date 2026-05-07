output "ses_sender_email" {
  value = aws_ses_email_identity.sender.email
}

output "ses_notification_template_names" {
  value = {
    for notification_type, resource in aws_ses_template.notification :
    notification_type => resource.name
  }
}

output "ses_send_policy_arn" {
  value = aws_iam_policy.ses_send_notification_templates.arn
}
