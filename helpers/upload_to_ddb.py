import boto3
import csv
import json
import os

# --- CONFIGURACIÓN ---
# Asegúrate de que este nombre coincida con tu tabla en AWS
TABLE_NAME = "CoreBusiness_stage"
REGION = "us-east-1"
CSV_FILE = "dummy_data_rut.csv"

# Campos que sabemos que son JSON (listas u objetos) en el CSV
JSON_FIELDS = ['permissions', 'manager', 'dates']


def upload_csv_to_dynamodb():
    # 1. Inicializar cliente DynamoDB
    try:
        dynamodb = boto3.resource('dynamodb', region_name=REGION)
        table = dynamodb.Table(TABLE_NAME)
        # Verificar conexión ligera
        print(f"Conectando a la tabla: {table.table_name}...")
        table.load()
    except Exception as e:
        print(f"❌ Error al conectar con AWS: {e}")
        print("Asegúrate de tener tus credenciales configuradas (aws configure)")
        return

    # 2. Leer y Procesar CSV
    if not os.path.exists(CSV_FILE):
        print(f"❌ No se encontró el archivo {CSV_FILE}")
        return

    print(f"Leyendo archivo {CSV_FILE}...")

    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        total_rows = len(rows)

        print(f"Iniciando carga de {total_rows} registros...")

        # 3. Usar Batch Writer (Más rápido y barato)
        with table.batch_writer() as batch:
            count = 0
            for row in rows:
                # A. Limpieza: Eliminar claves con valores vacíos
                clean_item = {k: v for k, v in row.items() if v is not None and v != ""}

                # B. Transformación: Parsear campos JSON string a objetos Python
                for field in JSON_FIELDS:
                    if field in clean_item:
                        try:
                            # Ejemplo: convierte "['*:*']" (str) -> ['*:*'] (list)
                            clean_item[field] = json.loads(clean_item[field])
                        except json.JSONDecodeError:
                            print(f"⚠️ Error parseando JSON en campo '{field}' para PK: {clean_item.get('pk')}")
                            # Si falla, dejamos el string original o lo borramos según prefieras

                # C. Inserción
                batch.put_item(Item=clean_item)
                count += 1

                # Feedback visual cada 10 items
                if count % 10 == 0:
                    print(f"   -> Procesados {count}/{total_rows} items...", end='\r')

    print(f"\n✅ Carga completada exitosamente. Total insertados: {count}")


if __name__ == "__main__":
    upload_csv_to_dynamodb()