'use server'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})

export async function getUploadUrl(filename: string, contentType: string) {
    try {
        const fileKey = `services/${filename.replace(/\s+/g, '_')}`

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: fileKey,
            ContentType: contentType,
        })

        const presignedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 60,
        })

        return { success: true, presignedUrl, fileKey }
    } catch (error) {
        console.error('Error generando presigned URL:', error)
        return {
            success: false,
            error: 'Error interno al generar la URL de subida',
        }
    }
}
