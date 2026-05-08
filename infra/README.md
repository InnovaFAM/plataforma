# Infra

Infraestructura como código de Innovafam usando **Terraform**. Esta carpeta contiene la definición de recursos AWS necesarios para ejecutar frontend, backend, autenticación, storage, base de datos, Lambdas, permisos, networking y servicios administrados del proyecto.

## Stack principal

- **Terraform**
- **AWS**
- **AWS Lambda**
- **Amazon API Gateway**
- **Amazon DynamoDB**
- **Amazon S3**
- **Amazon CloudFront**
- **Amazon Route 53**
- **AWS IAM**
- **AWS KMS**
- **AWS Secrets Manager**
- **Amazon ECR**
- **Amazon SES**
- **Amazon EventBridge**
- **Amazon Cognito**, si aplica al ambiente

## Requisitos

Antes de comenzar, asegúrate de tener instalado:

- Terraform.
- AWS CLI configurado.
- Credenciales AWS con permisos suficientes.
- Acceso al backend remoto del state, si el proyecto usa S3/DynamoDB para state locking.
- Docker, si se publican imágenes Lambda en ECR desde el flujo de despliegue.

## Ambientes

La infraestructura debe parametrizarse por ambiente usando variables como:

```hcl
var.aws_env
```

Valores comunes:

```txt
stage
prod
```

Ejemplo de uso:

```bash
terraform plan -var="aws_env=stage"
```

```bash
terraform apply -var="aws_env=stage"
```

## Estructura sugerida

```txt
infra/
├── environments/
│   ├── stage/
│   └── prod/
├── modules/
│   ├── api-gateway/
│   ├── lambda/
│   ├── dynamodb/
│   ├── s3/
│   ├── cloudfront/
│   ├── secrets-manager/
│   └── iam/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
└── README.md
```

La estructura real puede variar, pero se recomienda separar módulos reutilizables de configuración específica por ambiente.

## Comandos básicos

Inicializar Terraform:

```bash
terraform init
```

Revisar formato:

```bash
terraform fmt -recursive
```

Validar configuración:

```bash
terraform validate
```

Ver plan de cambios:

```bash
terraform plan -var="aws_env=stage"
```

Aplicar cambios:

```bash
terraform apply -var="aws_env=stage"
```

Destruir recursos, solo cuando corresponda:

```bash
terraform destroy -var="aws_env=stage"
```

## Manejo de state

El state de Terraform debe mantenerse remoto y protegido.

Configuración recomendada:

- S3 para almacenar el `terraform.tfstate`.
- DynamoDB para lock del state.
- Cifrado con KMS.
- Versionamiento habilitado en el bucket de state.

Si aparece un error de lock y estás seguro de que no existe otro proceso de Terraform ejecutándose:

```bash
terraform force-unlock <LOCK_ID>
```

Usar `-lock=false` solo como último recurso.

## Variables sensibles

No almacenar secretos directamente en archivos `.tfvars` versionados.

Para secretos, usar:

- AWS Secrets Manager.
- Variables sensibles inyectadas por CI/CD.
- SSM Parameter Store, si aplica.
- `sensitive = true` en variables Terraform cuando corresponda.

Ejemplo:

```hcl
variable "buk_api_key" {
  description = "BUK API Key"
  type        = string
  sensitive   = true
}
```

## Convenciones de naming

Los recursos deben incluir el ambiente en su nombre para evitar colisiones:

```hcl
"${var.project_name}-${var.aws_env}-resource-name"
```

Ejemplo:

```txt
fam-stage-notifications-lambda
fam-prod-services-table
```

## Tags recomendados

Aplicar tags comunes a todos los recursos que lo soporten:

```hcl
tags = {
  Project     = var.project_name
  Environment = var.aws_env
  ManagedBy   = "terraform"
}
```

## Buenas prácticas

- Ejecutar `terraform fmt -recursive` antes de subir cambios.
- Revisar siempre `terraform plan` antes de aplicar.
- Evitar `resources = ["*"]` salvo cuando sea estrictamente necesario.
- Separar módulos reutilizables de configuración por ambiente.
- Usar KMS para cifrado cuando aplique.
- Mantener outputs claros para integrar frontend/backend.
- No exponer secretos en outputs.
- Usar data sources para recursos creados por otros proyectos cuando corresponda.

## Troubleshooting

### State lock

```bash
terraform force-unlock <LOCK_ID>
```

### Plan muestra cambios inesperados

Revisar:

```bash
terraform state list
terraform state show <resource>
```

### Recurso creado manualmente

Importar al state cuando corresponda:

```bash
terraform import <resource_address> <resource_id>
```

## Notas

Esta carpeta contiene la infraestructura del proyecto. La lógica backend vive en `backend` y la aplicación web en `frontend`.
