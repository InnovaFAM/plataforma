import ServiceDetailsRoleAssignmentSearch from './ServiceDetailsRoleAssignmentSearch'
import Button from '@/components/ui/Button'
import useTranslation from '@/utils/hooks/useTranslation'
import { useServicesStore } from '../../_store/servicesStore'
import { Select } from '@/components/ui'

const statusOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Confirmado', value: 'confirmado' },
    { label: 'Disponible', value: 'disponible' },
    { label: 'No Disponible', value: 'no disponible' },
    { label: 'Propuesto', value: 'propuesto' },
]

const annexOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con anexo', value: 'true' },
    { label: 'Sin anexo', value: 'false' },
]

const complianceOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con Cumplimiento', value: 'true' },
    { label: 'Sin Cumplimiento', value: 'false' },
]

const evaluationOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Con Evaluación', value: 'true' },
    { label: 'Sin Evaluación', value: 'false' },
]

const ServiceDetailsRoleAssignmentTableTools: React.FC = () => {
    const t = useTranslation()

    const { roleAssignmentFilterData, setRoleAssignmentFilterData } =
        useServicesStore()

    const setRoleAssignmentSearchValue = useServicesStore(
        (state) => state.setRoleAssignmentSearchValue,
    )

    const handleInputChange = (query: string) => {
        setRoleAssignmentSearchValue(query)
    }

    const handleResetFilters = () => {
        setRoleAssignmentFilterData({
            annexes: 'all',
            compliance: 'all',
            evaluation: 'all',
            status: 'all',
        })
        setRoleAssignmentSearchValue('')
    }

    return (
        <div className="grid grid-cols-8 grid-rows-1 md:items-center md:justify-between gap-2">
            <ServiceDetailsRoleAssignmentSearch
                onInputChange={handleInputChange}
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Estado"
                options={statusOptions}
                value={
                    statusOptions.find(
                        (o) => o.value === roleAssignmentFilterData.status,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        status: option?.value || 'all',
                    })
                }
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Cumplimiento"
                options={complianceOptions}
                value={
                    complianceOptions.find(
                        (o) => o.value === roleAssignmentFilterData.compliance,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        compliance: option?.value || 'all',
                    })
                }
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Evaluación"
                options={evaluationOptions}
                value={
                    evaluationOptions.find(
                        (o) => o.value === roleAssignmentFilterData.evaluation,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        evaluation: option?.value || 'all',
                    })
                }
            />
            <Select
                className="flex-1/4"
                isClearable
                placeholder="Anexo"
                options={annexOptions}
                value={
                    annexOptions.find(
                        (o) => o.value === roleAssignmentFilterData.annexes,
                    ) ?? null
                }
                onChange={(option) =>
                    setRoleAssignmentFilterData({
                        ...roleAssignmentFilterData,
                        annexes: option?.value || 'all',
                    })
                }
            />
            <Button
                variant="default"
                type="button"
                className="w-full"
                onClick={handleResetFilters}
            >
                {t('services.filter.resetButton')}
            </Button>
        </div>
    )
}

export default ServiceDetailsRoleAssignmentTableTools
