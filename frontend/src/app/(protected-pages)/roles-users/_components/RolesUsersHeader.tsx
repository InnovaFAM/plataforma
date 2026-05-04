'use client'
import Button from '@/components/ui/Button'
import useTranslation from '@/utils/hooks/useTranslation'
import { useRolesUsersStore } from '../_store/rolesUsersStore'

const RolesUsersHeader = () => {
    const t = useTranslation()
    const setShowCreateModal = useRolesUsersStore(
        (state) => state.setShowCreateModal,
    )

    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <h4>{t('rolesUsers.header.title')}</h4>
                <div>
                    <Button
                        variant="solid"
                        onClick={() => setShowCreateModal(true)}
                    >
                        {t('rolesUsers.header.createButton')}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default RolesUsersHeader
