import { useState, ChangeEvent, FormEvent } from 'react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import axios from 'axios'

const QRPayments = () => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPayload(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const [processing, setProcessing] = useState<boolean>(false)
    const initPayload = {
        name: '',
        email: '',
        agent_name: '',
        agent_phone: '',
        amount: ''
    }

    const [payload, setPayload] = useState(initPayload)
    const [payloadResponse, setPayloadResponse] = useState<{
        [key: string]: string
    }>({})
    const handleOnSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setProcessing(true)

        axios
            .post('/create-qr-code', {
                name: payload.name,
                email: payload.email,
                agent_name: payload.agent_name,
                agent_phone: payload.agent_phone,
                amount: payload.amount
            })
            .then(response => {
                setProcessing(false)
                setPayload(initPayload)
                setErrors({})

                setPayloadResponse(response.data)
            })
            .catch(error => {
                setProcessing(false)
                setErrors(error.response.data.errors)
            })
    }

    return (
        <div className="mx-auto flex w-full flex-col gap-4 lg:flex-row">
            <form
                className="mx-auto -mt-2 flex w-full flex-1 flex-col gap-4 xl:w-3/5"
                onSubmit={event => handleOnSubmit(event)}
            >
                <header className="mb-2">
                    <h2 className="text-2xl font-bold">QR Code Payments</h2>
                    <p className="text-gray-500">
                        This will generate a QR code that the customer can scan
                        to pay.
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
                            value={payload.name}
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
                            value={payload.email}
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
                            value={payload.agent_name}
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
                            value={payload.agent_phone}
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
                            if (
                                e.key === '-' ||
                                e.key === 'e' ||
                                e.key === '+'
                            ) {
                                e.preventDefault()
                            }
                        }}
                        value={payload.amount}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Button
                        type="submit"
                        size="lg"
                        disabled={processing ? true : false}
                    >
                        {processing ? 'Processing...' : 'Generate QR Code'}
                    </Button>
                </div>
            </form>

            <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 rounded-xl bg-gray-50 py-4">
                {payloadResponse.qrCode ? (
                    <>
                        <img
                            className="w-3/4 rounded-xl"
                            src={payloadResponse.qrCode}
                            alt="QR Code"
                        />

                        <span className="text-2xl font-bold">
                            Amount to collect:{' '}
                            {Number(payloadResponse.amount).toLocaleString(
                                'en-PH',
                                { style: 'currency', currency: 'PHP' }
                            )}
                        </span>
                    </>
                ) : (
                    <span>This is where the QR code will be displayed.</span>
                )}

                {payloadResponse.qrCode && (
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            onClick={() => setPayloadResponse({})}
                        >
                            New QR Code
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QRPayments
