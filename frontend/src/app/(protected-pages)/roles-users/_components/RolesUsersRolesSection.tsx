'use client'

import UsersAvatarGroup from '@/components/shared/UsersAvatarGroup'
import { TSystemRole } from '../types'
import { Skeleton } from '@/components/ui'

interface RolesUsersRolesSectionProps {
    roleList: TSystemRole[]
}

const RolesUsersRolesSection = ({ roleList }: RolesUsersRolesSectionProps) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {roleList.length > 0 ? (
                roleList.map((role) => (
                    <div
                        key={role.sk}
                        className="flex flex-col justify-between rounded-2xl p-5 bg-gray-200 dark:bg-gray-600 min-h-35"
                    >
                        <div className="flex items-center justify-between">
                            <h6 className="font-bold">{role.name}</h6>
                        </div>
                        <p className="mt-2">{role.description}</p>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex flex-col">
                                <div className="-ml-2">
                                    <UsersAvatarGroup
                                        avatarProps={{
                                            className:
                                                'cursor-pointer -mr-2 border-2 border-white dark:border-gray-500',
                                            size: 28,
                                        }}
                                        avatarGroupProps={{ maxCount: 3 }}
                                        chained={false}
                                        users={role.users?.map((user) => ({
                                            name: user.name,
                                            img: user.pictureUrl || '',
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <>
                    <Skeleton className="rounded-2xl min-h-40" />
                    <Skeleton className="rounded-2xl min-h-40" />
                    <Skeleton className="rounded-2xl min-h-40" />
                    <Skeleton className="rounded-2xl min-h-40" />
                    <Skeleton className="rounded-2xl min-h-40" />
                    <Skeleton className="rounded-2xl min-h-40" />
                </>
            )}
        </div>
    )
}

export default RolesUsersRolesSection
