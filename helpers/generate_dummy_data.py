import csv
import json
import random
from datetime import datetime, timedelta

# --- CONFIGURACIÓN ---
OUTPUT_FILE = 'dummy_data_rut.csv'  # Nombre archivo actualizado
TOTAL_COLLABS = 30
ASSIGNED_COUNT = 20
SERVICES = [
    {"name": "Servicio_Transformacion_Digital", "client": "Banco_Estado", "rut": "60111222-3"},
    {"name": "Servicio_Mantencion_Legacy", "client": "Minera_Escondida", "rut": "70333444-K"}
]
ROLES = ["Admin", "Usuario Avanzado", "Usuario PyC", "Usuario Operaciones", "Usuario Analytics"]

# Encabezados del CSV
HEADERS = [
    'pk', 'sk', 'parentId', 'entityId',
    'name', 'email', 'rut', 'phoneNumber', 'address',
    'permissions', 'description',
    'startDate', 'endDate', 'status', 'manager',
    'positionName', 'budget',
    'type', 'reason',
    'dates', 'institution'
]


def get_iso_date(offset_days=0):
    return (datetime.now() + timedelta(days=offset_days)).strftime("%Y-%m-%d")


rows = []

# 1. GENERAR ROLES
perm_map = {
    "Admin": ["*:*"],
    "Usuario Analytics": ["reports:read"]
}
for r in ROLES:
    rows.append({
        'pk': f"ROLE#{r}",
        'sk': 'METADATA',
        'name': r,
        'description': f"Rol de {r}",
        'permissions': json.dumps(perm_map.get(r, ["dashboard:read"]))
    })

# 2. GENERAR HOLIDAYS
rows.append({
    'pk': 'CONFIG#holidays',
    'sk': 'YEAR#2025',
    'dates': json.dumps(["2025-01-01", "2025-05-01", "2025-09-18", "2025-12-25"])
})

# 3. GENERAR CLIENTES Y SERVICIOS
service_positions_map = {}

for s in SERVICES:
    # Cliente
    rows.append({
        'pk': f"CLIENT#{s['rut']}",
        'sk': 'METADATA',
        'name': s['client'],
        'rut': s['rut']
    })

    # Servicio
    manager_data = [{"name": "Jefe Proyecto Cliente", "email": f"jp@{s['client'].lower()}.cl"}]
    rows.append({
        'pk': f"SERVICE#{s['name']}",
        'sk': 'METADATA',
        'parentId': f"CLIENT#{s['rut']}",
        'entityId': f"SERVICE#{s['name']}",
        'name': s['name'],
        'status': "Ejecución",
        'startDate': "2024-01-01",
        'endDate': "2025-12-31",
        'manager': json.dumps(manager_data)
    })

    # 4. CARGOS DEL SERVICIO
    positions = ["Desarrollador_FullStack", "QA_Automation", "Tech_Lead", "Scrum_Master"]
    service_positions_map[s['name']] = positions

    for pos in positions:
        rows.append({
            'pk': f"SERVICE#{s['name']}",
            'sk': f"POSITION#{pos}",
            'positionName': pos,
            'description': f"Cargo {pos} para {s['name']}",
            'startDate': "2024-01-01",
            'endDate': "2025-12-31"
        })

# 5. GENERAR COLABORADORES (30 PAX) - CAMBIO DE PK A RUT
for i in range(1, TOTAL_COLLABS + 1):
    rut_num = 15000000 + i
    rut = f"{rut_num}-9"  # RUT Ficticio
    email = f"collab{i:02d}@empresa.com"
    name = f"Colaborador {i:02d}"

    # --- CAMBIO IMPORTANTE: PK ahora usa el RUT ---
    collab_pk = f"COLLAB#{rut}"

    # Collab Profile
    rows.append({
        'pk': collab_pk,  # <--- AQUI EL CAMBIO
        'sk': 'METADATA',
        'parentId': 'ORG#MyCompany',
        'entityId': collab_pk,
        'name': name,
        'email': email,
        'rut': rut,
        'phoneNumber': f"5690000{i:04d}",
        'address': "Calle Falsa 123"
    })

    # 6. ASIGNACIONES (WORK)
    if i <= ASSIGNED_COUNT:
        srv = random.choice(SERVICES)
        pos_name = random.choice(service_positions_map[srv['name']])
        start_date = "2024-03-01"

        rows.append({
            'pk': collab_pk,  # <--- La asignación cuelga del RUT
            'sk': f"POSITION#{pos_name}",
            # GSI Keys para el Gantt (esto no cambia)
            'parentId': f"SERVICE#{srv['name']}",
            'entityId': start_date,

            # Payload
            'startDate': start_date,
            'endDate': "2024-12-31",
            'type': "PRINCIPAL",
            'positionName': pos_name
        })

    # 7. TIME OFF
    if random.random() > 0.8:
        off_start = get_iso_date(10)
        rows.append({
            'pk': collab_pk,  # <--- La licencia cuelga del RUT
            'sk': f"TIMEOFF#{off_start}",
            'parentId': 'ORG#MyCompany',
            'entityId': f"TIMEOFF#{off_start}",
            'startDate': off_start,
            'endDate': get_iso_date(15),
            'type': "LICENCIA_MEDICA",
            'reason': "Gripe fuerte"
        })

# --- GUARDAR CSV ---
with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=HEADERS)
    writer.writeheader()
    writer.writerows(rows)

print(f"✅ Archivo '{OUTPUT_FILE}' generado correctamente usando RUT como PK.")