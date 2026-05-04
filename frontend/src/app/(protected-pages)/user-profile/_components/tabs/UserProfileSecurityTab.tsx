'use client'

import {
    TbAlertTriangle,
    TbCircleCheck,
    TbMail,
    TbShieldLock,
} from 'react-icons/tb'

type UserProfileSecurityTabProps = {
    email?: string
}

const UserProfileSecurityTab = ({ email }: UserProfileSecurityTabProps) => {
    return (
        <div>
            <h4 className="mb-2 text-lg font-semibold">
                Acceso sin contraseña
            </h4>

            <p className="mb-4 text-sm text-gray-500">
                Ahora el ingreso a la plataforma se realiza mediante un código
                de un solo uso enviado a tu correo electrónico. Ya no necesitas
                recordar una contraseña para acceder.
            </p>

            {email && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    <span className="font-semibold">
                        Correo de acceso actual:
                    </span>{' '}
                    {email}
                </div>
            )}

            <div className="space-y-4">
                <section className="rounded-xl border border-gray-200 bg-white p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <TbMail className="text-lg text-blue-600" />
                        <h5 className="font-semibold text-gray-900">
                            ¿Cómo funciona?
                        </h5>
                    </div>

                    <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-600">
                        <li>
                            Ingresa tu correo electrónico al iniciar sesión.
                        </li>
                        <li>
                            Recibirás un código de verificación de un solo uso.
                        </li>
                        <li>
                            Ingresa ese código para acceder de forma segura a la
                            plataforma.
                        </li>
                    </ol>
                </section>

                <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <TbShieldLock className="text-lg text-emerald-600" />
                        <h5 className="font-semibold text-gray-900">
                            Mantén tu correo seguro
                        </h5>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                            <TbCircleCheck className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                Protege tu cuenta de correo con una contraseña
                                robusta o passkey.
                            </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                            <TbCircleCheck className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                Activa verificación en dos pasos en tu proveedor
                                de correo.
                            </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                            <TbCircleCheck className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                Mantén actualizados tus métodos de recuperación.
                            </span>
                        </div>

                        <div className="flex items-start gap-2 text-sm text-gray-700">
                            <TbCircleCheck className="mt-0.5 shrink-0 text-emerald-600" />
                            <span>
                                Nunca compartas tu código de acceso con otras
                                personas.
                            </span>
                        </div>
                    </div>
                </section>

                <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <div className="mb-3 flex items-center gap-2">
                        <TbAlertTriangle className="text-lg text-amber-600" />
                        <h5 className="font-semibold text-gray-900">
                            ¿Qué pasa si pierdes acceso a tu correo?
                        </h5>
                    </div>

                    <div className="space-y-2 text-sm text-gray-700">
                        <p>
                            Por temas de seguridad el correo no se puede
                            cambiar. Para realizar cambios, cree un nuevo
                            usuario y luego solicite una migración al
                            administrador.
                        </p>
                        <p>
                            Si ya no puedes ingresar a tu correo y tampoco
                            tienes una sesión activa, deberás contactar al
                            equipo de soporte para validar tu identidad y
                            actualizar tu correo de acceso.
                        </p>
                        <p>
                            Por seguridad, no podremos enviar códigos de acceso
                            a direcciones de correo no verificadas y fuera de
                            Beaumer Group.
                        </p>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default UserProfileSecurityTab
