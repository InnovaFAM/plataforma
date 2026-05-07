resource "aws_ses_email_identity" "sender" {
  email = var.from_email
}

resource "aws_ses_template" "notification" {
  for_each = local.notification_templates

  name    = "${local.template_prefix}-${lower(replace(each.key, "_", "-"))}"
  subject = each.value.subject

  html = <<HTML
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${each.value.title}</title>
  </head>

  <body style="margin:0;padding:0;background:#f6f8fb;font-family:Arial,sans-serif;color:#0f172a;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f6f8fb;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:28px 32px;background:#0f172a;color:#ffffff;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;">
                  ${each.value.title}
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">
                  Hola {{recipientName}},
                </p>

                <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#334155;">
                  ${each.value.body}
                </p>

                <p style="margin:0 0 24px;">
                  <a href="{{actionUrl}}"
                     style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold;font-size:14px;">
                    ${each.value.action}
                  </a>
                </p>

                <p style="margin:0;font-size:13px;line-height:1.5;color:#64748b;">
                  Este correo fue generado automáticamente por {{appName}}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
HTML

  text = <<TEXT
${each.value.title}

Hola {{recipientName}},

${each.value.body}

${each.value.action}:
{{actionUrl}}

Este correo fue generado automáticamente por {{appName}}.
TEXT
}
