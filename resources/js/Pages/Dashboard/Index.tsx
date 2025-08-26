import { Head, usePage } from '@inertiajs/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs'
import { useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Partials/PageHeader'
import RecentPayments from '@/Components/RecentPayments'
import GeneratePaymentCode from '@/Pages/Dashboard/Partials/GeneratePaymentCode'
import SendInvoice from './Partials/SendInvoice'
import PaymentLInk from './Partials/PaymentLink'
import MayaPayments from './Partials/MayaPayments'
import QRPayments from './Partials/QRPayments'

export default function Dashboard() {
    const balance = usePage().props.balance
    const invoicing = usePage().props.invoicing
    const payment_link = usePage().props.payment_link
    const account_type = usePage().props.auth.user.business.account_type
    const user_id = usePage().props.auth.user.id

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Dashboard"
                    balance={balance}
                />
            }
        >
            <Head title="Transactions" />

            <div className="py-12">
                <div className="container mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-8 flex flex-col gap-8 md:flex-row">
                            <Tabs
                                defaultValue="payment_code"
                                className="flex w-full flex-col items-center justify-center"
                            >
                                <TabsList>
                                    <TabsTrigger value="payment_code">
                                        Payment Code
                                    </TabsTrigger>

                                    <TabsTrigger value="ewallet_maya">
                                        e-Wallet Payment
                                    </TabsTrigger>

                                    {/* <TabsTrigger value="qr_payment">
                                        QR Code Payment
                                    </TabsTrigger> */}

                                    {invoicing === true && (
                                        <TabsTrigger value="invoicing">
                                            Invoicing
                                        </TabsTrigger>
                                    )}

                                    {account_type === 'main_account' &&
                                        payment_link === true && (
                                            <TabsTrigger value="payment_link">
                                                Payment Link
                                            </TabsTrigger>
                                        )}
                                </TabsList>
                                <TabsContent
                                    value="payment_code"
                                    className="mt-4 flex w-full gap-8 md:flex-row"
                                >
                                    <GeneratePaymentCode />
                                </TabsContent>
                                {invoicing === true && (
                                    <TabsContent
                                        value="invoicing"
                                        className="w-full"
                                    >
                                        <SendInvoice />
                                    </TabsContent>
                                )}

                                {account_type === 'main_account' &&
                                    payment_link === true && (
                                        <TabsContent
                                            value="payment_link"
                                            className="w-full"
                                        >
                                            <PaymentLInk />
                                        </TabsContent>
                                    )}

                                <TabsContent
                                    value="ewallet_maya"
                                    className="w-full"
                                >
                                    <MayaPayments />
                                </TabsContent>

                                {/* <TabsContent
                                    value="qr_payment"
                                    className="w-full"
                                >
                                    <QRPayments />
                                </TabsContent> */}
                            </Tabs>
                        </div>

                        {/* Transactions */}
                        <Tabs
                            defaultValue="recent_payments"
                            className="mt-8 flex w-full flex-col items-center justify-center"
                        >
                            <TabsList className="grid w-[400px] grid-cols-2">
                                <TabsTrigger value="recent_payments">
                                    Recent Payments
                                </TabsTrigger>
                                <TabsTrigger value="multi_use_code">
                                    Multi-Use Payment Codes
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent
                                value="recent_payments"
                                className="mt-4 w-full"
                            >
                                <RecentPayments userId={user_id} />
                            </TabsContent>
                            <TabsContent
                                value="multi_use_code"
                                className="mt-6 w-full"
                            >
                                <p className="rounded-lg bg-red-100 py-3 text-center font-medium text-red-600">
                                    This feature is not yet complete. Wag
                                    masyadong excited.
                                </p>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
