#!/usr/bin/env bash
set -euo pipefail

# Configurables por env var si quieres sobrescribir
AWS_REGION="${AWS_REGION:-us-east-1}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BUILD_PLATFORM="${BUILD_PLATFORM:-linux/amd64}"

# Parseo de argumentos (requiere --env / -e). --lambda / -l es opcional.
ENVIRONMENT=""
LAMBDA_NAME=""

usage() {
  cat <<EOF
Uso: $0 --env <env> [--lambda <lambda-name>]
  -e, --env      entorno requerido (ej: stage, prod)
  -l, --lambda   nombre de carpeta bajo lambdas/ (opcional). Si no se pasa, se procesan todas.
  -h, --help     muestra esta ayuda
EOF
  exit "${1:-0}"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -e|--env)
      if [[ -n "${2:-}" && "${2:0:1}" != "-" ]]; then
        ENVIRONMENT="$2"
        shift
      else
        echo "Error: --env requiere un argumento (ej: stage o prod)" >&2
        exit 1
      fi
      ;;
    -l|--lambda)
      if [[ -n "${2:-}" && "${2:0:1}" != "-" ]]; then
        LAMBDA_NAME="$2"
        shift
      else
        echo "Error: --lambda requiere un argumento (ej: handle-messages)" >&2
        exit 1
      fi
      ;;
    -h|--help)
      usage 0
      ;;
    *)
      echo "Argumento desconocido: $1" >&2
      usage 1
      ;;
  esac
  shift
done

if [[ -z "$ENVIRONMENT" ]]; then
  echo "Error: Debes pasar --env (ej: --env stage)." >&2
  usage 1
fi

# Validar env simple: solo letras, numeros, guiones y guion bajo
if ! [[ "$ENVIRONMENT" =~ ^[a-z0-9_-]+$ ]]; then
  echo "Error: ambiente inválido. Usa solo [a-z0-9_-]." >&2
  exit 1
fi

# Si se pasó --lambda, validar nombre (evitar ../ etc.)
if [[ -n "$LAMBDA_NAME" ]]; then
  if ! [[ "$LAMBDA_NAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
    echo "Error: nombre de lambda inválido. Usa solo [A-Za-z0-9._-]." >&2
    exit 1
  fi
  if [[ ! -d "lambdas/${LAMBDA_NAME}" ]]; then
    echo "Error: la lambda especificada no existe: lambdas/${LAMBDA_NAME}" >&2
    exit 1
  fi
fi

# Obtener account id (fallará si no tienes credenciales configuradas)
ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)"
if [[ -z "$ACCOUNT_ID" ]]; then
  echo "Error: no pude obtener AWS Account (asegúrate de tener aws-cli configurado)." >&2
  exit 1
fi

echo "🔐 Logueando en ECR (${AWS_REGION})..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Montar la lista de directorios a procesar
DIRS_TO_PROCESS=()
if [[ -n "$LAMBDA_NAME" ]]; then
  DIRS_TO_PROCESS=("lambdas/${LAMBDA_NAME}")
else
  # glob vs nullglob: si no hay coincidencias, el patrón queda sin expandir en some shells.
  # Aseguramos comportamiento esperado listando con for loop y comprobando -d
  for d in lambdas/*; do
    if [[ -d "$d" ]]; then
      DIRS_TO_PROCESS+=("$d")
    fi
  done
fi

if [[ ${#DIRS_TO_PROCESS[@]} -eq 0 ]]; then
  echo "No se encontraron carpetas bajo lambdas/ para procesar." >&2
  exit 1
fi

BUILT_COUNT=0
SKIPPED_COUNT=0

for LAMBDA_DIR in "${DIRS_TO_PROCESS[@]}"; do
  FUNC_NAME="$(basename "$LAMBDA_DIR")"

  # Nombre del repo: siempre <funcion>-<env> (las carpetas NUNCA traen el env)
  REPO_NAME="${FUNC_NAME}-${ENVIRONMENT}"
  REPO_URI="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}"

  # Crear repo si no existe
  if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "➜ Creando repo ECR: $REPO_NAME"
    aws ecr create-repository --repository-name "$REPO_NAME" --image-tag-mutability MUTABLE --region "$AWS_REGION"
  fi

  DOCKERFILE="${LAMBDA_DIR}/Dockerfile"
  if [[ ! -f "$DOCKERFILE" ]]; then
    echo "❌ No encontré Dockerfile en ${LAMBDA_DIR}, saltando ${FUNC_NAME}."
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  # Heurística: si Dockerfile referencia rutas fuera del contexto (../) o rutas absolutas,
  # usar contexto "lambdas" en lugar de la carpeta de la lambda.
  USE_CONTEXT="${LAMBDA_DIR}"
  if grep -qE '(^|[[:space:]])\.\./|(^|[[:space:]])/[^[:space:]]+' "$DOCKERFILE"; then
    echo "⚠️  Dockerfile de ${FUNC_NAME} parece referenciar rutas fuera de su carpeta; usando contexto 'lambdas'."
    USE_CONTEXT="lambdas"
  fi

  echo "➜ Construyendo y subiendo: ${REPO_NAME}:${IMAGE_TAG} (context: ${USE_CONTEXT})"
  docker build --provenance=false --platform "$BUILD_PLATFORM" -t "${REPO_URI}:${IMAGE_TAG}" -f "${DOCKERFILE}" "${USE_CONTEXT}"
  docker push "${REPO_URI}:${IMAGE_TAG}"

  BUILT_COUNT=$((BUILT_COUNT + 1))
done

echo "✅ Build & push finalizado (ambiente: ${ENVIRONMENT})."
echo "   Imágenes construidas: ${BUILT_COUNT}. Saltadas: ${SKIPPED_COUNT}."
