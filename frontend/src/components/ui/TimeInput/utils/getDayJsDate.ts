import dayjs from 'dayjs'
import 'dayjs/locale/es' // Importa el idioma español
dayjs.locale('es') // Establece el idioma globalmente
export const getDayJsDate = (
    date?: Date | string | null,
    format: string = 'DD/MM/YYYY',
) => {
    if (!date) {
        return null
    }

    const dayjsDate = dayjs(date)

    if (!dayjsDate.isValid()) {
        return null
    }

    return dayjsDate.format(format)
}
