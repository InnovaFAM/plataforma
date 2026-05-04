'use client'

import React, { useState } from 'react'
import SignIn from '@/components/auth/SignIn'
import {
    onStartSignInWithEmailOtp,
    StartEmailOtpResult,
} from '@/server/actions/auth/handleOTP'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSearchParams } from 'next/navigation'
import type { OnSignInPayload } from '@/components/auth/SignIn'
import OtpVerification from '@/components/auth/OtpVerification'
import type { OtpVerificationProps } from '@/components/auth/OtpVerification'

const SignInClient: React.FC = () => {
    const [dataOtp, setDataOtp] = useState<
        StartEmailOtpResult | OtpVerificationProps | undefined
    >()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get(REDIRECT_URL_KEY)

    const handleSendCode = ({ values, setSubmitting }: OnSignInPayload) => {
        setSubmitting(true)
        onStartSignInWithEmailOtp(values.email).then((data) => {
            setSubmitting(false)
            setDataOtp(data)
        })
    }

    return dataOtp ? (
        <OtpVerification {...(dataOtp as OtpVerificationProps)} />
    ) : (
        <SignIn onSignIn={handleSendCode} />
    )
}

export default SignInClient
