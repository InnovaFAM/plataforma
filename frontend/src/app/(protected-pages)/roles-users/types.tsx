export type Filter = {
    status: 'activo' | 'inactivo' | 'pendiente'
    role: string
}

export type TPermission = {
    [key: string]: boolean
}

type TUserRole = Pick<TUser, 'sk' | 'name' | 'pictureUrl'>

export type TSystemRole = {
    sk: string
    name: string
    description: string
    permissions: TPermission
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

export type TEditUser = Partial<
    Pick<TUser, 'name' | 'phoneNumber' | 'parentId' | 'lastLogin' | 'status'>
>

export type TRolesUsersData = {
    roles: TSystemRole[]
    users: TUser[]
}

export type TUserActivity = {
    sk: string
    category: string
    data: any
}

export type TUserNotification = {
    type: string
    createdAt: string
    payload: any
}
