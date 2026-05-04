export interface ICognitoAccessTokenPayload {
    sub: string // Subject (ID del usuario)
    iss: string // Issuer (URL del emisor)
    client_id: string // Audience (Client ID)
    origin_jti?: string // Opcional: JWT ID
    token_use: 'access' | 'id' // Tipo de token
    scope?: string // Permisos
    auth_time: number // Tiempo de autenticación
    exp: number // Tiempo de expiración (timestamp en segundos)
    iat: number // Tiempo de emisión (timestamp en segundos)
    email?: string // Email del usuario (si está incluido)
    // Agrega aquí cualquier otro claim personalizado que Cognito pueda incluir
    // Por ejemplo, si tienes grupos personalizados:
    // 'cognito:groups'?: string[];
}

export const decodeCognitoAccessToken = (
    token: string,
): ICognitoAccessTokenPayload | null => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            console.error('Formato de token JWT inválido: no tiene 3 partes.')
            return null
        }

        const payloadBase64 = parts[1]

        const payloadString = Buffer.from(payloadBase64, 'base64').toString(
            'utf-8',
        )

        const payload = JSON.parse(payloadString)

        if (typeof payload.exp !== 'number') {
            console.error(
                'El payload decodificado no contiene un tiempo de expiración válido (exp).',
            )
            return null
        }

        return payload as ICognitoAccessTokenPayload
    } catch (error) {
        console.error('Error al decodificar el AccessToken:', error)
        return null
    }
}
