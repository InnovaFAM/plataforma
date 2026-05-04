const getUserAnnexesColor = (annex: boolean) => {
    if (annex) return 'bg-green-100'

    return 'bg-red-100'
}

export default getUserAnnexesColor
