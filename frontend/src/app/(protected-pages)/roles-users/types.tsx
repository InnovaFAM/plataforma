export type Filter = {
    status: 'activo' | 'inactivo' | 'pendiente'
    role: string
}

type Permission = {
    [key: string]: 'read' | 'write' | 'deny' | 'allow'
}

type TUserRole = Pick<TUser, 'sk' | 'name' | 'pictureUrl'>

export type TSystemRole = {
    sk: string
    name: string
    description: string
    permissions: Permission[]
    users?: TUserRole[]
}

export type TUser = {
    sk: string
    name: string
    email: string
    pictureUrl: string
    phoneNumber: string
    status: 'activo' | 'inactivo' | 'pendiente'
    parentId: string
    lastLogin?: string
    role?: TSystemRole
}

export type TNewUser = Pick<
    TUser,
    'name' | 'email' | 'phoneNumber' | 'parentId'
>

export type TRolesUsersData = {
    roles: TSystemRole[]
    users: TUser[]
}

type TUserActivityData = {
    [key: string]: unknown
}

export type TUserActivity = {
    sk: string
    category: string
    data: TUserActivityData
}
