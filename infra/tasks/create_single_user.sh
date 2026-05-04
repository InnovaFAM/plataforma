#!/usr/bin/env bash
set -euo pipefail

# Uso:
# ./create-cognito-user.sh <region> <user_pool_id> <email> <password> [name]
#
# Ejemplo:
# ./create-cognito-user.sh us-east-1 us-east-1_ABC123 user@dominio.com 'MiPassword123!' 'Patricio'

REGION="${1:-}"
USER_POOL_ID="${2:-}"
EMAIL="${3:-}"
PASSWORD="${4:-}"
NAME="${5:-}"

if [[ -z "$REGION" || -z "$USER_POOL_ID" || -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Uso: $0 <region> <user_pool_id> <email> <password> [name]"
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "Error: aws CLI no está instalado o no está en PATH"
  exit 1
fi

echo "Creando usuario en Cognito: $EMAIL"

if [[ -n "$NAME" ]]; then
  aws cognito-idp admin-create-user \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes \
      Name=email,Value="$EMAIL" \
      Name=email_verified,Value=true \
      Name=name,Value="$NAME" \
    --message-action SUPPRESS
else
  aws cognito-idp admin-create-user \
    --region "$REGION" \
    --user-pool-id "$USER_POOL_ID" \
    --username "$EMAIL" \
    --user-attributes \
      Name=email,Value="$EMAIL" \
      Name=email_verified,Value=true \
    --message-action SUPPRESS
fi

echo "Asignando password permanente..."
aws cognito-idp admin-set-user-password \
  --region "$REGION" \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL" \
  --password "$PASSWORD" \
  --permanent

echo "Verificando usuario..."
aws cognito-idp admin-get-user \
  --region "$REGION" \
  --user-pool-id "$USER_POOL_ID" \
  --username "$EMAIL"

echo "Usuario creado correctamente: $EMAIL"
