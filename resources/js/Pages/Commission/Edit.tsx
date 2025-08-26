import { BusinessAccount } from '@/types/business-accounts'
import { Head, usePage } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { ChangeEvent, FormEvent, useState } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import PageHeader from '@/Partials/PageHeader'
import axios from 'axios'

interface Props {
    balance: string
    commission: Commission
}

interface Commission {
    id: number
    percentage: number
}

const Edit = ({ balance, commission }: Props) => {
    const [rate, setRate] = useState<Commission>(commission)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target
        setRate(prevRate => ({
            ...prevRate,
            percentage: Number(value)
        }))
    }

    const [successMessage, setSuccessMessage] = useState<string>('')
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [processing, setProcessing] = useState<Boolean>(false)
    const updateRate = (event: FormEvent) => {
        event.preventDefault()
        setProcessing(true)

        axios
            .patch(`/commissions/${rate.id}`, {
                rate: rate.percentage
            })
            .then(response => {
                setProcessing(false)
                setSuccessMessage(response.data.message)
            })
            .catch(error => {
                setErrors(error.response.data.errors)
                setProcessing(false)
            })
    }

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Business Accounts"
                    balance={balance}
                />
            }
        >
            <Head title="Business Accounts" />
            <div className="py-12">
                <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 flex flex-col justify-between">
                            <header className="flex flex-col gap-2">
                                <h2 className="text-2xl font-black">
                                    Commission Rate
                                </h2>
                                <p className="">
                                    You can set the commission rate here.
                                </p>
                            </header>

                            <form
                                className="mt-4 flex w-[400px] flex-col gap-4"
                                onSubmit={updateRate}
                            >
                                {Object.keys(errors).length != 0 ? (
                                    <div className="w-full rounded-xl border border-red-200 bg-red-200/20 p-4 text-left dark:border-red-700">
                                        <div className="pb-4 font-semibold text-red-600 dark:text-red-200">
                                            Something went wrong:
                                        </div>
                                        {Object.keys(errors).map(
                                            (key, index) => (
                                                <p
                                                    className="flex items-center gap-x-2 py-1 text-red-500 dark:text-red-300"
                                                    key={index}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        className="h-5 w-5 shrink-0 self-start md:self-center"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <span>{errors[key]}</span>
                                                </p>
                                            )
                                        )}
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="rate"
                                        className="font-medium"
                                    >
                                        Rate in percentage(%)
                                    </Label>
                                    <Input
                                        id="rate"
                                        type="text"
                                        className="bg-gray-50"
                                        name="commission"
                                        placeholder="Commission rate in %"
                                        value={rate.percentage}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="submit"
                                        className="order-2 self-end"
                                        disabled={processing ? true : false}
                                    >
                                        Update
                                    </Button>
                                </div>

                                {successMessage !== '' && (
                                    <div className="flex justify-center gap-2">
                                        <p className="w-full rounded-lg bg-green-100 py-2 text-center font-medium text-green-600">
                                            {successMessage}
                                        </p>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default Edit
