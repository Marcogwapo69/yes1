import { Head, usePage } from '@inertiajs/react'
import CardPaymentForm from '@/Partials/CardPaymentForm'

const CardsPayment = () => {
    const appName = usePage().props.app_name

    return (
        <>
            <Head title={`Submit Payment - ` + appName} />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-tl from-teal-300 to-gray-100">
                <div className="flex flex-col gap-4">
                    <header className="text-center text-3xl font-bold">
                        <h2>{appName}</h2>
                    </header>

                    <CardPaymentForm />
                </div>
            </div>
        </>
    )
}

export default CardsPayment
