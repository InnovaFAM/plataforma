## Backend

Python Serverless with AWS in Terraform


## Testing
Cada lambda debe ser trabajado como un projecto único, cada proyecto tiene su propio scope.
 dfd
 dfd
- Cada proyecto tiene su propia carpeta de test que puede ejecutarse y probarse.

## Setup

- Cara proyecto usa *uv* para manejar los ambientes, se debe crear un ambiente propio
- Instalar las librerías usando ``uv sync``.

## Deployment

- Ejecutar ``sh tasks/switch_env {stage/prod}``
- Crear _requirements.txt_ en cada proyecto usando: ``uv export --format requirements-txt --output-file requirements.txt --no-dev --no-hashes``
- Ejecutar ``sh tasks/build_lambdas``
- Ejecutar ``sh tasks/deploy``
