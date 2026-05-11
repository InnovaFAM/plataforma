terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.26.0"
    }
  }

  backend "s3" {}
}

locals {
  common_tags = {
    Env       = var.aws_env
    Terraform = "true"
    Scope     = "fam-api"
  }
  user_pool_id  = one(data.aws_cognito_user_pools.nextjs_app_pool.ids)
  user_pool_arn = data.aws_cognito_user_pool.nextjs_app_pool.arn
  app_client_id = one(data.aws_cognito_user_pool_clients.nextjs_web_client.client_ids)
  execution_uri = "arn:aws:execute-api:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${aws_apigatewayv2_api.fam_api.id}"

  template_prefix = "innovafam-${var.aws_env}"

  ses_identity_arn = "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:identity/${var.from_email}"

  notification_templates = {
    SERVICE_CONFIRMED = {
      subject = "Servicio confirmado: {{serviceCode}}"
      title   = "Servicio confirmado"
      body    = "El servicio {{serviceCode}} ha sido confirmado correctamente."
      action  = "Ver servicio"
    }

    SERVICE_PROPOSED = {
      subject = "Nuevo servicio propuesto: {{serviceCode}}"
      title   = "Nuevo servicio propuesto"
      body    = "Se ha creado el servicio {{serviceCode}} en estado propuesto."
      action  = "Revisar servicio"
    }

    SERVICE_ROLE_COLLAB_PROPOSED = {
      subject = "Colaborador propuesto para {{roleName}}"
      title   = "Colaborador propuesto para un rol"
      body    = "El colaborador {{collaboratorName}} fue asignado como propuesto al rol {{roleName}} del servicio {{serviceCode}}."
      action  = "Revisar asignación"
    }

    SERVICE_TERMINATION_15 = {
      subject = "Servicio próximo a terminar en 15 días: {{serviceCode}}"
      title   = "Servicio próximo a terminar"
      body    = "El servicio {{serviceCode}} finalizará en 15 días, con fecha de término {{endDate}}."
      action  = "Ver servicio"
    }

    SERVICE_TERMINATION_10 = {
      subject = "Servicio próximo a terminar en 10 días: {{serviceCode}}"
      title   = "Servicio próximo a terminar"
      body    = "El servicio {{serviceCode}} finalizará en 10 días, con fecha de término {{endDate}}."
      action  = "Ver servicio"
    }

    SERVICE_TERMINATED = {
      subject = "Servicio terminado: {{serviceCode}}"
      title   = "Servicio terminado"
      body    = "El servicio {{serviceCode}} terminó el día {{endDate}}. Han pasado {{daysAfterTermination}} días desde su término."
      action  = "Ver servicio"
    }

    MAX_HH_SUPERATED = {
      subject = "Horas hombre máximas superadas - {{month}}"
      title   = "Horas hombre máximas superadas"
      body    = "Se ha superado la cantidad máxima de horas hombre para el mes {{month}}. HH máxima: {{maxHH}}. HH actual: {{currentHH}}."
      action  = "Ver reporte"
    }

    COLLAB_VACATION_APPROVED = {
      subject = "Vacaciones aprobadas para {{collaboratorName}}"
      title   = "Vacaciones aprobadas"
      body    = "Se han aprobado vacaciones para {{collaboratorName}} desde {{startDate}} hasta {{endDate}}."
      action  = "Ver colaborador"
    }

    COLLAB_TERMINATION = {
      subject = "Colaborador desvinculado: {{collaboratorName}}"
      title   = "Colaborador desvinculado"
      body    = "El colaborador {{collaboratorName}} ha sido desvinculado de la empresa con fecha {{terminationDate}}."
      action  = "Ver colaborador"
    }

    COLLAB_ABSENCE = {
      subject = "Colaborador {{collaboratorName}} actualizó ausencia"
      title   = "Actualización de ausencia"
      body    = "El colaborador {{collaboratorName}} ha actualizado su ausencia en la empresa desde {{startDate}} hasta {{endDate}}. Motivo: {{reason}}"
      action  = "Ver colaborador"
    }

    COLLAB_PERMISSION = {
      subject = "Colaborador {{collaboratorName}} actualizó permiso"
      title   = "Actualización de permiso"
      body    = "El colaborador {{collaboratorName}} ha actualizado su permiso en la empresa desde {{startDate}} hasta {{endDate}}. Motivo: {{reason}}"
      action  = "Ver colaborador"
    }

    COLLAB_LICENCE = {
      subject = "Colaborador {{collaboratorName}} actualizó licencia"
      title   = "Actualización de licencia"
      body    = "Se ha actualizado la licencia del colaborador {{collaboratorName}} desde {{startDate}} hasta {{endDate}}. Motivo: {{reason}}"
      action  = "Ver colaborador"
    }

    CERTIFICATE_EXPIRATION = {
      subject = "Certificado vencido: {{certificateName}}"
      title   = "Certificado vencido"
      body    = "El certificado {{certificateName}} del colaborador {{collaboratorName}} venció el día {{expirationDate}}."
      action  = "Ver colaborador"
    }

    CERTIFICATE_EXPIRATION_PLUS = {
      subject = "Varios certificados vencidos para {{collaboratorName}}"
      title   = "Varios certificados vencidos"
      body    = "El colaborador {{collaboratorName}} tiene varios certificados vencidos."
      action  = "Ver colaborador"
    }
  }

  ses_template_arns = [
    for notification_type, template in local.notification_templates :
    "arn:aws:ses:${var.aws_region}:${data.aws_caller_identity.current.account_id}:template/${local.template_prefix}-${lower(replace(notification_type, "_", "-"))}"
  ]

  app_secrets = jsondecode(data.aws_secretsmanager_secret_version.app_secrets.secret_string)
}

provider "aws" {
  region = var.aws_region
}
