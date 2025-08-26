import { Head, usePage } from '@inertiajs/react'

const Failed = () => {
    const appName = usePage().props.app_name

    return (
        <>
            <Head title={`Failed Payment - ` + appName} />
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-tl from-teal-300 to-gray-100">
                <div className="flex flex-col gap-4">
                    <header className="text-center text-5xl font-bold">
                        <h2>Commission Failed to Send to Agent's GCash</h2>
                    </header>
                </div>
            </div>
        </>
    )
}

export default Failed
