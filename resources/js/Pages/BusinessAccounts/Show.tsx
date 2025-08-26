import { ChangeEvent, FormEvent, useState } from 'react'
import { Head, usePage, router } from '@inertiajs/react'

// Layouts and Partials
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Partials/PageHeader'

// Types
import { BusinessAccount } from '@/types/business-accounts'
import RecentPayments from '@/Components/RecentPayments'

interface Props {
    balance: string
    business: BusinessAccount
}

const Show = ({ balance, business }: Props) => {
    const appName = usePage().props.app_name
    const [addAccount, setAddAccount] = useState(false)

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={business.business_name}
                    balance={balance}
                />
            }
        >
            <Head title="Business Account" />

            <div className="py-12">
                <div className="container mx-auto flex flex-col gap-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <RecentPayments userId={business.user.id} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Show
