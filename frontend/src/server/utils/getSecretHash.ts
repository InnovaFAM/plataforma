import crypto from 'crypto'

const getSecretHash = (username: string) => {
    return crypto
        .createHmac('sha256', process.env.COGNITO_CLIENT_SECRET!)
        .update(username + process.env.COGNITO_CLIENT_ID!)
        .digest('base64')
}

export default getSecretHash
