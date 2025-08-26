import { Head, usePage } from '@inertiajs/react'

const Success = () => {
    const appName = usePage().props.app_name

    return (
        <>
            <Head title={`Successful Payment - ` + appName} />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-tl from-teal-300 to-gray-100">
                <div className="flex flex-col gap-4">
                    <header className="text-center text-5xl font-bold">
                        <h2>Commission Sent To Agent's GCash</h2>
                    </header>
                </div>
            </div>
        </>
    )
}

export default Success
