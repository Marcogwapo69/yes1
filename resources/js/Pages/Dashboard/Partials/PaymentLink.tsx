import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { ChangeEvent, FormEvent, useState } from 'react'
import axios from 'axios'

const PaymentLink = () => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const initPayload = {
        name: '',
        agent_name: '',
        agent_phone: '',
        email: '',
        amount: ''
    }

    const [invoicePayload, setInvoicePayload] = useState(initPayload)

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setInvoicePayload(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const [processing, setProcessing] = useState<boolean>(false)
    const [sendInvoiceStatus, setSendInvoiceStatus] = useState<string | null>(
        null
    )
    const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setProcessing(true)

        axios
            .post('/create-payment-link', {
                name: invoicePayload.name,
                agent_name: invoicePayload.agent_name,
                agent_phone: invoicePayload.agent_phone,
                email: invoicePayload.email,
                amount: invoicePayload.amount
            })
            .then(response => {
                setProcessing(false)

                // if (response.data.success === true) {
                setSendInvoiceStatus('success')
                setInvoicePayload(initPayload)
                setErrors({})
                // }
            })
            .catch(error => {
                setProcessing(false)
                // console.log(error.response.data.message)

                setErrors(error.response.data.errors)
            })
    }

    return (
        <form
            className="mx-auto -mt-2 flex w-[40%] flex-col gap-4"
            onSubmit={event => handleOnSubmit(event)}
        >
            <header className="mb-2">
                <h2 className="text-2xl font-bold">Payment Link</h2>
                <p className="text-gray-500">
                    This will send an email with a payment link to the
                    recipient's email address.
                </p>
            </header>
            {Object.keys(errors).length != 0 ? (
                <div className="w-full rounded-xl border border-red-200 bg-red-200/20 p-4 text-left dark:border-red-700">
                    <div className="pb-4 font-semibold text-red-600 dark:text-red-200">
                        Something went wrong:
                    </div>
                    {Object.keys(errors).map((key, index) => (
                        <p
                            className="flex items-center gap-x-2 py-1 text-red-500 dark:text-red-300"
                            key={index}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="h-5 w-5 self-start md:self-center"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>{errors[key]}</span>
                        </p>
                    ))}
                </div>
            ) : null}

            <div className="flex w-full gap-2">
                <div className="flex flex-1 flex-col gap-1">
                    <Label
                        htmlFor="name"
                        className="font-medium"
                    >
                        Customer's name
                    </Label>
                    <Input
                        id="name"
                        type="text"
                        className="rounded-xl bg-gray-50"
                        placeholder="Juan Dela Cruz"
                        name="name"
                        onChange={handleChange}
                        value={invoicePayload.name}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                    <Label
                        htmlFor="email"
                        className="font-medium"
                    >
                        Customer's email address
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        className="rounded-xl bg-gray-50"
                        placeholder="Destination email address"
                        name="email"
                        onChange={handleChange}
                        value={invoicePayload.email}
                    />
                </div>
            </div>

            <div className="flex w-full gap-2">
                <div className="flex flex-1 flex-col gap-1">
                    <Label
                        htmlFor="agent_name"
                        className="font-medium"
                    >
                        Agent's name
                    </Label>
                    <Input
                        id="agent_name"
                        type="text"
                        className="rounded-xl bg-gray-50"
                        placeholder="Name of the agent"
                        name="agent_name"
                        onChange={handleChange}
                        value={invoicePayload.agent_name}
                    />
                </div>

                <div className="flex flex-1 flex-col gap-1">
                    <Label
                        htmlFor="agent_phone"
                        className="font-medium"
                    >
                        Agent's phone number
                    </Label>
                    <Input
                        id="agent_phone"
                        type="number"
                        className="rounded-xl bg-gray-50"
                        placeholder="09761234567"
                        name="agent_phone"
                        onChange={handleChange}
                        value={invoicePayload.agent_phone}
                        pattern="[0-9]*[.,]?[0-9]*"
                        inputMode="numeric"
                        onKeyDown={e => {
                            // Prevent user from typing '-' or 'e' (scientific notation), etc.
                            if (
                                e.key === '-' ||
                                e.key === 'e' ||
                                e.key === '+'
                            ) {
                                e.preventDefault()
                            }
                        }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <Label
                    htmlFor="amount"
                    className="font-medium"
                >
                    Amount to collect (Philippine Peso)
                </Label>
                <Input
                    id="amount"
                    type="number"
                    className="rounded-xl bg-gray-50"
                    placeholder="Specify the amount the customer needs to pay"
                    name="amount"
                    pattern="[0-9]*[.,]?[0-9]*"
                    inputMode="numeric"
                    onKeyDown={e => {
                        // Prevent user from typing '-' or 'e' (scientific notation), etc.
                        if (e.key === '-' || e.key === 'e' || e.key === '+') {
                            e.preventDefault()
                        }
                    }}
                    value={invoicePayload.amount}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Button
                    type="submit"
                    size="lg"
                    disabled={processing ? true : false}
                >
                    {processing ? 'Processing...' : 'Send Payment Link'}
                </Button>
            </div>

            {sendInvoiceStatus === 'success' && (
                <div className="flex flex-col gap-2 rounded-lg bg-gray-100 p-6 font-medium text-green-600">
                    <h4 className="text-start text-xl font-bold text-green-600">
                        Payment Link Sent
                    </h4>
                    <p className="">
                        The payment link was sent to the email address provided.
                    </p>
                </div>
            )}
        </form>
    )
}

export default PaymentLink
