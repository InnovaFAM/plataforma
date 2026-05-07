'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { onSignInWithEmailOtp } from '@/server/actions/auth/handleSignIn'
import { FormItem, Form } from '@/components/ui/Form'
import OtpInput from '@/components/shared/OtpInput'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { OtpVerificationProps } from './OtpVerification'

interface OtpVerificationFormProps extends OtpVerificationProps {
    setOtpVerified: (message: string) => void
    setMessage: (message: string) => void
}

type OtpFormProps = {
    otp: string
}

const OTP_LENGTH = 8

const validationSchema = z.object({
    otp: z.string().min(OTP_LENGTH, { message: 'Please enter a valid OTP' }),
})

const OtpVerificationForm = (props: OtpVerificationFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { setMessage, setOtpVerified } = props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<OtpFormProps>({
        resolver: zodResolver(validationSchema),
    })

    const onOtpSend = async ({ otp }: { otp: string }) => {
        setSubmitting(true)
        try {
            onSignInWithEmailOtp({
                email: props.destination,
                cognitoSession: props.cognitoSession,
                code: otp,
            }).then((data) => {
                if (data?.error) {
                    setMessage(data.error as string)
                    setSubmitting(false)
                    setOtpVerified('no verificado')
                }
                setOtpVerified('verificado correctamente')
            })
        } catch (errors) {
            setMessage?.(
                typeof errors === 'string' ? errors : 'Some error occured!',
            )
            setSubmitting(false)
        }
    }

    return (
        <Form onSubmit={handleSubmit(onOtpSend)}>
            <FormItem
                invalid={Boolean(errors.otp)}
                errorMessage={errors.otp?.message}
            >
                <Controller
                    name="otp"
                    control={control}
                    render={({ field }) => (
                        <OtpInput
                            placeholder=""
                            inputClass="h-[42px]"
                            length={OTP_LENGTH}
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
                {isSubmitting ? 'Verificando...' : 'Verificar Código'}
            </Button>
        </Form>
    )
}

export default OtpVerificationForm
