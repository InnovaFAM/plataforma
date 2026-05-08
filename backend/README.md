# Backend

Backend serverless de Innovafam construido con **Python** sobre **AWS Lambda**, usando Terraform para la infraestructura asociada. Cada Lambda debe tratarse como un proyecto con su propio scope, dependencias y pruebas.

## Stack principal

- **Python**
- **AWS Lambda**
- **Amazon API Gateway**
- **Amazon DynamoDB**
- **Amazon S3**
- **Amazon SES**
- **Amazon EventBridge**
- **AWS Secrets Manager**
- **AWS Lambda Powertools**
- **Terraform**
- **uv** para manejo de ambientes y dependencias

## Requisitos

Antes de comenzar, asegúrate de tener instalado:

- Python compatible con las Lambdas del proyecto.
- `uv`
- Docker, si la Lambda se empaqueta como imagen.
- AWS CLI configurado.
- Terraform, cuando corresponda desplegar infraestructura.
- Credenciales AWS para el ambiente correspondiente.

## Organización

Cada Lambda debe manejarse como un proyecto independiente:

```txt
backend/
├── lambdas/
│   ├── lambda-a/
│   │   ├── app/
│   │   ├── tests/
│   │   ├── pyproject.toml
│   │   └── requirements.txt
│   └── lambda-b/
│       ├── app/
│       ├── tests/
│       ├── pyproject.toml
│       └── requirements.txt
├── tasks/
└── README.md
```

La estructura exacta puede variar, pero se recomienda mantener aislamiento por Lambda para facilitar desarrollo, testing y despliegue.

## Setup local

Entrar a la carpeta de la Lambda que se desea trabajar:

```bash
cd backend/<ruta-de-la-lambda>
```

Crear/sincronizar ambiente con `uv`:

```bash
uv sync
```

Activar el ambiente virtual si corresponde:

```bash
source .venv/bin/activate
```

## Ejecución de tests

Cada Lambda debe tener su propia carpeta de tests.

```bash
uv run pytest
```

o, si el ambiente ya está activado:

```bash
pytest
```

## Generación de requirements

Antes de construir o desplegar una Lambda, generar el archivo `requirements.txt` desde el proyecto correspondiente:

```bash
uv export --format requirements-txt --output-file requirements.txt --no-dev --no-hashes
```

## Ejecución local de Lambdas

Para probar una Lambda localmente, se recomienda mantener eventos JSON de ejemplo por caso de uso.

Ejemplo:

```bash
python -m app.main events/example.json
```

o usando Docker, si la Lambda está empaquetada como imagen:

```bash
docker build -t innovafam-lambda .
docker run --rm -p 9000:8080 innovafam-lambda
```

Invocación local contra Runtime Interface Emulator:

```bash
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" \
  -d @events/example.json
```

## Deployment

Flujo general de despliegue:

```bash
sh tasks/switch_env {stage/prod}
```

Generar `requirements.txt` en cada proyecto Lambda:

```bash
uv export --format requirements-txt --output-file requirements.txt --no-dev --no-hashes
```

Construir imágenes o artefactos:

```bash
sh tasks/build_lambdas
```

Desplegar:

```bash
sh tasks/deploy
```

## Variables y secretos

Los secretos no deben quedar hardcodeados en el código ni versionados en el repositorio.

Usar preferentemente:

- AWS Secrets Manager para API keys, tokens y credenciales.
- Variables de entorno para referencias no sensibles.
- ARN o nombre del secret como variable de entorno cuando la Lambda deba leer secretos en runtime.

Ejemplo:

```env
AWS_ENV=stage
BUK_API_KEY_SECRET_ARN=arn:aws:secretsmanager:...
```

## Buenas prácticas

- Una Lambda debe tener una responsabilidad clara.
- Mantener tipado y validaciones de entrada con Pydantic cuando aplique.
- Agregar logs estructurados.
- Evitar permisos IAM amplios cuando se puedan limitar por recurso.
- Mantener eventos de prueba versionados para debugging.
- Separar handlers, servicios, repositorios y modelos.
- No almacenar secretos en código fuente.
- Mantener pruebas unitarias por Lambda.

## Notas

Esta carpeta contiene la lógica backend/serverless. La infraestructura se define en `infra` y la aplicación web en `frontend`.
