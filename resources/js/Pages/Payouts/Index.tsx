import { Head, usePage } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Partials/PageHeader'
import SubAccountTable from './Partials/SubAccountTable'
import MainAccountTable from './Partials/MainAccountTable'

const Payouts = () => {
    const account_type = usePage().props.auth.user.business.account_type
    const balance = usePage().props.balance

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Payouts"
                    balance={balance}
                />
            }
        >
            <Head title="Payouts" />

            <div className="py-12">
                <div className="container mx-auto sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        {account_type === 'sub_account' && <SubAccountTable />}

                        {account_type === 'main_account' && (
                            <MainAccountTable />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Payouts
