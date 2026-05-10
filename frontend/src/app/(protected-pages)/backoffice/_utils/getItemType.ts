export const getItemType = (itemType: string) => {
    switch (itemType) {
        case 'certs':
            return 'certificados'
        case 'chores':
            return 'faenas'
        case 'roles':
            return 'roles'
        case 'clients':
            return 'clientes'
        case 'holidays':
            return 'feriados'
        case 'divisions':
            return 'divisiones'
        case 'shifts':
            return 'turnos'
    }
}
