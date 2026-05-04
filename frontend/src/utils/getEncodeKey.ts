export const getEncodeKey = (key: string): string => {
    return btoa(unescape(encodeURIComponent(key)))
}
