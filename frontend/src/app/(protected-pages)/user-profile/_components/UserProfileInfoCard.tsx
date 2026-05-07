'use client'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Avatar, Button, Input, Upload } from '@/components/ui'
import classNames from '@/utils/classNames'
import useCurrentSession from '@/utils/hooks/useCurrentSession'
import dayjs from 'dayjs'
import { useEffect, useRef, useState } from 'react'
import { toast, Notification } from '@/components/ui'
import { TbCameraPlus, TbPencil } from 'react-icons/tb'
import { IoCloseSharp } from 'react-icons/io5'
import useTranslation from '@/utils/hooks/useTranslation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TUser } from '../../roles-users/types'
import { updatePhoneNumber } from '@/server/actions/users/update-user'
import { usersKeys } from '@/server/actions/users/users-keys'
import { signOut } from 'next-auth/react'

type TFormValues = Pick<TUser, 'phoneNumber'>

const UserProfileInfoCard = () => {
    const t = useTranslation()
    const queryClient = useQueryClient()
    const { session } = useCurrentSession()
    const [editMode, setEditMode] = useState(false)
    const [phone, setPhone] = useState(session?.user.phoneNumber || '')
    const [avatarFile, setAvatarFile] = useState<File | File[] | null>(null)
    const [isPhoneNumberUpdated, setIsPhoneNumberUpdated] = useState(false)
    const [countdown, setCountdown] = useState<number>(5)
    const countdownRef = useRef<number | null>(null)

    const updatePhoneNumberMutation = useMutation({
        mutationFn: async (data: TFormValues) => {
            const response = await updatePhoneNumber(
                session?.user.id || 'no user_id',
                data.phoneNumber,
            )

            if (!response.success) {
                throw new Error(response.error)
            }

            return response.data
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: usersKeys.update(session?.user.id || ''),
            })
            toast.push(
                <Notification
                    title={t(
                        'userProfile.profileInfoCard.messages.phoneNumber.success',
                    )}
                    type="success"
                />,
            )
            setIsPhoneNumberUpdated(true)
            setEditMode(false)
        },
        onError: (error: Error) => {
            toast.push(
                <Notification
                    title={
                        error.message ||
                        t(
                            'userProfile.profileInfoCard.messages.phoneNumber.error',
                        )
                    }
                    type="danger"
                />,
            )
        },
    })

    const isPending = updatePhoneNumberMutation.isPending

    const handleSave = () => {
        updatePhoneNumberMutation.mutate({ phoneNumber: phone })
    }

    const handleCancel = () => {
        setEditMode(false)
        setPhone(session?.user.phoneNumber || '')
        setAvatarFile(null)
    }

    useEffect(() => {
        if (isPhoneNumberUpdated) {
            if (countdown <= 0) {
                signOut({ callbackUrl: '/login' })
                return
            }

            countdownRef.current = window.setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1)
            }, 1000)
        }
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current)
            }
        }
    }, [isPhoneNumberUpdated, countdown])

    return (
        <AdaptiveCard className="relative">
            <div className="absolute top-4 right-4">
                <Button
                    customColorClass={({ active }) =>
                        classNames(
                            'bg-gray-100 hover:ring-0 hover:text-gray-600 hover:bg-gray-200 transition-colors',
                            active
                                ? 'bg-gray-400 text-gray-700'
                                : 'bg-gray-100 hover:ring-0 text-gray-700',
                        )
                    }
                    variant="plain"
                    shape="circle"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                        if (editMode) {
                            handleCancel()
                        } else {
                            setEditMode(true)
                        }
                    }}
                >
                    {editMode ? <IoCloseSharp /> : <TbPencil />}
                </Button>
            </div>
            <div className="flex flex-col gap-4 items-start">
                <div className="flex flex-col gap-4 items-center self-center">
                    {editMode ? (
                        <Upload
                            showList={false}
                            onChange={(file) => setAvatarFile(file)}
                            className="h-auto min-h-0 w-auto min-w-0 rounded-full cursor-pointer flex items-center justify-center"
                        >
                            <Avatar
                                size={64}
                                src={
                                    session?.user.image ||
                                    (Array.isArray(avatarFile)
                                        ? URL.createObjectURL(avatarFile[0])
                                        : avatarFile
                                          ? URL.createObjectURL(avatarFile)
                                          : undefined) ||
                                    undefined
                                }
                            >
                                <TbCameraPlus />
                            </Avatar>
                        </Upload>
                    ) : (
                        <Avatar
                            size={64}
                            src={session?.user.image || undefined}
                        >
                            {!session?.user.image ? (
                                <p className="text-lg">
                                    {session?.user.name?.charAt(0)}
                                </p>
                            ) : null}
                        </Avatar>
                    )}

                    <h3 className="text-lg font-bold">{session?.user.name}</h3>
                </div>
                <div className="flex flex-col gap-6 w-full mt-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-500">
                            {t('userProfile.profileInfoCard.email')}
                        </span>
                        <b className="text-black">
                            {session?.user.email ||
                                t('userProfile.profileInfoCard.noEmail')}
                        </b>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-500">
                            {t('userProfile.profileInfoCard.phone')}
                        </span>
                        {editMode ? (
                            <Input
                                value={phone}
                                placeholder="+123456789"
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        ) : (
                            <b className="text-black">
                                {phone ||
                                    t('userProfile.profileInfoCard.noPhone')}
                            </b>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-500">
                            {t('userProfile.profileInfoCard.lastOnline')}
                        </span>
                        <b className="text-black">
                            {session &&
                                dayjs(session.user.lastLogin).format(
                                    'DD MMM YYYY hh:mm A',
                                )}
                        </b>
                    </div>
                </div>
                {isPhoneNumberUpdated && (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-500">
                            {t(
                                'userProfile.profileInfoCard.messages.phoneNumber.success',
                            )}
                        </span>
                        <b className="text-black">
                            Cerrando Sesión...({countdown})
                        </b>
                    </div>
                )}

                {editMode && (
                    <div className="flex gap-2 mt-4 self-end">
                        <Button
                            variant="default"
                            disabled={isPending}
                            onClick={handleCancel}
                        >
                            Cancelar
                        </Button>

                        <Button
                            variant="solid"
                            loading={isPending}
                            disabled={isPending}
                            onClick={handleSave}
                        >
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                )}
            </div>
        </AdaptiveCard>
    )
}

export default UserProfileInfoCard
