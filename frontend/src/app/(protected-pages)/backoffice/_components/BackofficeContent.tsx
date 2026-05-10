'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { listBackOfficeClients } from '@/server/actions/backoffice/list-clients'
import { listBackOfficeHolidays } from '@/server/actions/backoffice/list-holidays'
import { listBackOfficeRoles } from '@/server/actions/backoffice/list-roles'
import { listBackOfficeChores } from '@/server/actions/backoffice/list-chores'
import { backOfficeKeys } from '@/server/actions/backoffice/backoffice-keys'
import { listBackOfficeDivisions } from '@/server/actions/backoffice/list-divisions'
import { listBackOfficeCertificates } from '@/server/actions/backoffice/list-certificates'
import { listBackOfficeShifts } from '@/server/actions/backoffice/actions-shifts'
import { useProtectedQueryFn } from '@/hooks/useProtectedQueryFn'
import { TBackOfficeDialogDelete } from '../types'
import BackOfficeAffix from './BackOfficeAffix'
import BackOfficeCertificatesTable from './tables/BackOfficeCertificatesTable'
import BackOfficeRolesTable from './tables/BackOfficeRolesTable'
import BackOfficeClientsTable from './tables/BackOfficeClientsTable'
import BackOfficeHolidaysTable from './tables/BackOfficeHolidaysTable'
import BackOfficeChoresTable from './tables/BackOfficeChoresTable'
import BackOfficeDivisionTable from './tables/BackOfficeDivisionTable'
import BackOfficeShiftsTable from './tables/BackOfficeShiftsTable'
import DialogDeleteBackOfficeItem from './DialogDeleteBackOfficeItem'

const NAVIGATION_ELEMENTS = [
    {
        label: 'backOffice.navigationItems.certifications',
        id: 'backOffice_certifications',
    },
    {
        label: 'backOffice.navigationItems.roles',
        id: 'backOffice_roles',
    },
    {
        label: 'backOffice.navigationItems.clients',
        id: 'backOffice_clients',
    },
    {
        label: 'backOffice.navigationItems.holidays',
        id: 'backOffice_holidays',
    },
    {
        label: 'backOffice.navigationItems.chores',
        id: 'backOffice_chores',
    },
    {
        label: 'backOffice.navigationItems.divisions',
        id: 'backOffice_divisions',
    },
    {
        label: 'backOffice.navigationItems.shifts',
        id: 'backOffice_shifts',
    },
]

const BackOfficeContent = () => {
    const { protectedQueryFn } = useProtectedQueryFn()
    const queryClient = useQueryClient()

    const [onModalOpen, setOnModalOpen] = useState(false)
    const [deleteData, setDeleteData] =
        useState<TBackOfficeDialogDelete | null>(null)
    const [rolesToken, setRolesToken] = useState<string | undefined>(undefined)
    const [certificationsToken, setCertificationsToken] = useState<
        string | undefined
    >(undefined)
    const [clientsToken, setClientsToken] = useState<string | undefined>(
        undefined,
    )
    const [holidaysToken, setHolidaysToken] = useState<string | undefined>(
        undefined,
    )
    const [choresToken, setChoresToken] = useState<string | undefined>(
        undefined,
    )
    const [divisionsToken, setDivisionsToken] = useState<string | undefined>(
        undefined,
    )
    const [shiftsToken, setShiftsToken] = useState<string | undefined>(
        undefined,
    )

    const { data: BackOfficeShifts, isLoading: isLoadingShifts } = useQuery({
        queryKey: backOfficeKeys.shifts,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeShifts(shiftsToken)),
    })

    const { data: BackOfficeCertificates, isLoading: isLoadingCertificates } =
        useQuery({
            queryKey: backOfficeKeys.certifications,
            queryFn: async () =>
                protectedQueryFn(() =>
                    listBackOfficeCertificates(certificationsToken),
                ),
        })

    const { data: BackOfficeChores, isLoading: isLoadingChores } = useQuery({
        queryKey: backOfficeKeys.chores,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeChores(choresToken)),
    })

    const { data: BackOfficeClients, isLoading: isLoadingClients } = useQuery({
        queryKey: backOfficeKeys.clients,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeClients(clientsToken)),
    })

    const { data: BackOfficeDivisions, isLoading: isLoadingDivisions } =
        useQuery({
            queryKey: backOfficeKeys.divisions,
            queryFn: async () =>
                protectedQueryFn(() => listBackOfficeDivisions(divisionsToken)),
        })

    const { data: BackOfficeHolidays, isLoading: isLoadingHolidays } = useQuery(
        {
            queryKey: backOfficeKeys.holidays,
            queryFn: async () =>
                protectedQueryFn(() => listBackOfficeHolidays(holidaysToken)),
        },
    )

    const { data: BackOfficeRoles, isLoading: isLoadingRoles } = useQuery({
        queryKey: backOfficeKeys.roles,
        queryFn: async () =>
            protectedQueryFn(() => listBackOfficeRoles(rolesToken)),
    })

    const handleDelete = (data: TBackOfficeDialogDelete) => {
        setDeleteData(data)
        setOnModalOpen(true)
    }

    const invalidateQuery = async () => {
        if (deleteData?.itemType) {
            const queryKey = [
                `backoffice-${deleteData.itemType.toLowerCase()}`,
            ] as const
            await queryClient.invalidateQueries({
                queryKey: queryKey,
            })
        }

        setDeleteData(null)
        setOnModalOpen(false)
    }

    return (
        <div className="relative flex flex-col min-h-screen gap-4 w-full mt-12 px-4 md:px-8">
            <div className="grow">
                <div className="flex flex-col xl:flex-row gap-8 max-w-full overflow-x-hidden">
                    <div className="flex flex-col gap-12 flex-5 min-w-0">
                        <BackOfficeCertificatesTable
                            onDelete={handleDelete}
                            data={BackOfficeCertificates?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[0].id}
                            lastEvaluatedKey={
                                BackOfficeCertificates?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingCertificates}
                            onFetch={setCertificationsToken}
                        />

                        <BackOfficeRolesTable
                            onDelete={handleDelete}
                            data={BackOfficeRoles?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[1].id}
                            lastEvaluatedKey={
                                BackOfficeRoles?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingRoles}
                            onFetch={setRolesToken}
                        />

                        <BackOfficeClientsTable
                            onDelete={handleDelete}
                            data={BackOfficeClients?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[2].id}
                            lastEvaluatedKey={
                                BackOfficeClients?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingClients}
                            onFetch={setClientsToken}
                        />

                        <BackOfficeHolidaysTable
                            onDelete={handleDelete}
                            data={BackOfficeHolidays?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[3].id}
                            lastEvaluatedKey={
                                BackOfficeHolidays?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingHolidays}
                            onFetch={setHolidaysToken}
                        />

                        <BackOfficeChoresTable
                            onDelete={handleDelete}
                            data={BackOfficeChores?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[4].id}
                            lastEvaluatedKey={
                                BackOfficeChores?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingChores}
                            onFetch={setChoresToken}
                        />

                        <BackOfficeDivisionTable
                            onDelete={handleDelete}
                            data={BackOfficeDivisions?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[5].id}
                            lastEvaluatedKey={
                                BackOfficeDivisions?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingDivisions}
                            onFetch={setDivisionsToken}
                        />
                        <BackOfficeShiftsTable
                            onDelete={handleDelete}
                            data={BackOfficeShifts?.data?.items || []}
                            id={NAVIGATION_ELEMENTS[6].id}
                            lastEvaluatedKey={
                                BackOfficeShifts?.data?.last_evaluated_key
                            }
                            isLoading={isLoadingShifts}
                            onFetch={setShiftsToken}
                        />
                    </div>
                    <div className="hidden xl:flex flex-col gap-4 w-32 sticky top-20 self-start h-max">
                        <BackOfficeAffix elements={NAVIGATION_ELEMENTS} />
                    </div>
                </div>
            </div>

            {onModalOpen && (
                <DialogDeleteBackOfficeItem
                    isOpen={onModalOpen}
                    data={deleteData}
                    onClose={() => {
                        setDeleteData(null)
                        setOnModalOpen(false)
                    }}
                    onDeleted={invalidateQuery}
                />
            )}
        </div>
    )
}

export default BackOfficeContent
