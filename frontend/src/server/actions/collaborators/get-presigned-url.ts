'use server'

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function getCertificatePresignedUrl(fileKey: string) {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileKey,
        })

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60 * 5,
        })

        return { success: true, presignedUrl }
    } catch (error) {
        console.error('Error generando presigned URL de descarga:', error)
        return {
            success: false,
            error: 'Error interno al generar la URL de descarga',
        }
    }
}
