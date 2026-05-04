'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'
import useTranslation from '@/utils/hooks/useTranslation'

export type OnSignInPayload = {
    values: SignInFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
}

export type OnSignIn = (payload: OnSignInPayload) => void

interface SignInFormProps extends CommonProps {
    setMessage: (message: string) => void
    onSignIn?: OnSignIn
}

type SignInFormSchema = {
    email: string
}

const validationSchema = z.object({
    email: z
        .email({ message: 'Formato de correo inválido' })
        .min(1, { message: 'El correo es obligatorio' }),
})

const SignInForm = (props: SignInFormProps) => {
    const t = useTranslation()
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { className, setMessage, onSignIn } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {},
        resolver: zodResolver(validationSchema),
    })

    const handleSignIn = async (values: SignInFormSchema) => {
        if (onSignIn) {
            onSignIn({ values, setSubmitting, setMessage })
        }
    }

    return (
        <div className={className}>
            <Form onSubmit={handleSubmit(handleSignIn)}>
                <FormItem
                    label={t('auth.email')}
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder={t('auth.email')}
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
                <Button
                    block
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    variant="solid"
                    type="submit"
                >
                    {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
            </Form>
        </div>
    )
}

export default SignInForm
