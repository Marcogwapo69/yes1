import { paymentChannels } from '@/data/payment_channels'
import { FormEvent, useEffect, useState } from 'react'

// UI Components
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from '@/Components/ui/select'
import { Switch } from '@/Components/ui/switch'
import { Label } from '@/Components/ui/label'
import { usePage } from '@inertiajs/react'
import axios from 'axios'
import useCounterStore from '@/store/store'

const GeneratePaymentCode = () => {
    const payment_code_commission = usePage().props.payment_code_commission
    const account_type = usePage().props.auth.user.business.account_type
    const can_send_sms_notification = usePage().props.can_send_sms_notification

    const { refreshTransaction } = useCounterStore()

    const handlePaymentOptionChange = (value: string) => {
        setPaymentOption(value)
    }

    const [processing, setProcessing] = useState<Boolean>(false)
    const [newPaymentCode, setNewPaymentCode] = useState<Boolean>(true)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [xenditError, setXenditError] = useState<string | null>(null)

    const [paymentOption, setPaymentOption] = useState('')
    const [agentName, setAgentName] = useState('')
    const [agentPhone, setAgentPhone] = useState('')
    const [name, setName] = useState('')
    const [amount, setAmount] = useState<string>('')
    const [commission, setCommission] = useState('')
    const [isSingleUseCode, setIsSingleUseCode] = useState<boolean>(false)
    const [paymentCode, setPaymentCode] = useState<string | null>(null)
    const [isSendCommission, setIsSendCommission] = useState<boolean>(false)
    const [canSendSmsNotification, setCanSendSmsNotification] =
        useState<boolean>(false)
    const [smsMessage, setSmsMessage] = useState<string>('')

    // Generate payment code
    const generatePaymentCode = (event: FormEvent) => {
        event.preventDefault()
        setProcessing(true)
        axios
            .post('/generate-payment-code', {
                payment_option: paymentOption,
                account_type: account_type,
                agent_name: agentName,
                agent_phone: agentPhone,
                send_notification: canSendSmsNotification,
                sms_message: smsMessage,
                name: name,
                amount: amount,
                commission: commission,
                is_single_use: isSingleUseCode,
                is_send_commission: isSendCommission
            })
            .then(response => {
                setPaymentCode(response.data.payment_code)
                setProcessing(false)

                setNewPaymentCode(false)
                setXenditError(null)
                setErrors({})

                setPaymentOption('')
                setAgentName('')
                setAgentPhone('')
                setName('')
                setAmount('')
                setCommission('')

                // Increment the newRecord value in our global store
                // to determine if a new record was inserted.
                refreshTransaction()
            })
            .catch(error => {
                setErrors({})
                setXenditError(null)

                try {
                    const err = JSON.parse(error.response.data.message)

                    if (err) {
                        setXenditError(err.message)
                        setProcessing(false)
                        return
                    }
                } catch (err) {
                    setErrors(error.response.data.errors)
                    setProcessing(false)
                }
            })
    }

    // Reusable function to remove errors dynamically
    const removeErrorIfFieldFilled = (
        fieldName: string,
        fieldValue: string
    ) => {
        if (fieldValue !== '') {
            setErrors(prevErrors => {
                const { [fieldName]: _, ...rest } = prevErrors // Remove the field's error
                return rest
            })
        }
    }

    useEffect(() => {
        removeErrorIfFieldFilled('payment_option', paymentOption)
        removeErrorIfFieldFilled('agent_name', agentName)
        removeErrorIfFieldFilled('agent_phone', agentPhone)
        removeErrorIfFieldFilled('name', name)
        removeErrorIfFieldFilled('amount', amount)
    }, [paymentOption, agentName, agentPhone, name, amount])

    return (
        <>
            <div className="order-2 flex max-w-xl flex-1 flex-col gap-2 text-gray-900">
                <header className="mb-2 text-2xl font-bold">
                    <h2>Generate Payment Code</h2>
                </header>
                {xenditError !== null && (
                    <div className="w-full rounded-xl border border-red-200 bg-red-200/20 p-4 text-left dark:border-red-700">
                        <div className="pb-4 font-semibold text-red-600 dark:text-red-200">
                            Something went wrong:
                        </div>
                        <p className="flex items-center gap-x-2 py-1 text-red-500 dark:text-red-300">
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
                            <span>{xenditError}</span>
                        </p>
                    </div>
                )}
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
                <form
                    onSubmit={generatePaymentCode}
                    className="flex flex-col gap-3"
                >
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="payment-option">Payment Option</Label>
                        <Select
                            value={paymentOption}
                            onValueChange={handlePaymentOptionChange}
                            disabled={newPaymentCode === true ? false : true}
                        >
                            <SelectTrigger className="rounded-xl bg-gray-50 shadow-sm">
                                <SelectValue placeholder="Select payment option" />
                            </SelectTrigger>
                            <SelectContent id="payment-option">
                                <SelectGroup>
                                    <SelectLabel>Payment Options</SelectLabel>
                                    {paymentChannels.map(
                                        (
                                            paymentChannel: {
                                                name: string
                                                value: string
                                            },
                                            index: number
                                        ) => (
                                            <SelectItem
                                                key={index}
                                                value={paymentChannel.value}
                                            >
                                                {paymentChannel.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="agent-name">Agent's Name</Label>
                        <Input
                            id="agent-name"
                            placeholder="Juan Dela Cruz"
                            value={agentName}
                            onChange={e => setAgentName(e.target.value)}
                            disabled={newPaymentCode === true ? false : true}
                            className="rounded-xl bg-gray-50 outline-none ring-0"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="agent-number">Agent's Phone #</Label>
                        <Input
                            id="agent-number"
                            type="number"
                            placeholder="09271234567"
                            value={agentPhone}
                            onChange={e => setAgentPhone(e.target.value)}
                            disabled={newPaymentCode === true ? false : true}
                            className="rounded-xl bg-gray-50 outline-none ring-0"
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

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="customer-name">Customer's Name</Label>
                        <Input
                            id="customer-name"
                            placeholder="Aling Puring"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            disabled={newPaymentCode === true ? false : true}
                            className="rounded-xl bg-gray-50 outline-none ring-0"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label htmlFor="amount">Amount to be Paid</Label>
                        <Input
                            id="amount"
                            className="rounded-xl bg-gray-50"
                            placeholder="Amount (PHP)"
                            type="number"
                            value={amount ?? ''}
                            disabled={newPaymentCode === true ? false : true}
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
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>

                    {account_type === 'main_account' && isSendCommission && (
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="commission">
                                Commission Amount
                            </Label>
                            <Input
                                id="commission"
                                type="number"
                                placeholder="100"
                                value={commission}
                                onChange={e => setCommission(e.target.value)}
                                disabled={
                                    newPaymentCode === true ? false : true
                                }
                                className="rounded-xl bg-gray-50 outline-none ring-0"
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
                    )}

                    {can_send_sms_notification === true &&
                        account_type === 'main_account' &&
                        canSendSmsNotification && (
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="amount">
                                    Compose SMS notification message
                                </Label>
                                <textarea
                                    className="rounded-xl border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows={5}
                                    value={smsMessage}
                                    onChange={e =>
                                        setSmsMessage(e.target.value)
                                    }
                                    maxLength={160}
                                    placeholder="SMS message is up to 160 characters."
                                ></textarea>
                            </div>
                        )}

                    {/* Send commission option switches */}
                    {account_type === 'main_account' && (
                        <>
                            {/* <div className="flex flex-col">
                                <Label
                                    htmlFor="code_reusable"
                                    className="flex items-center gap-2"
                                >
                                    <Switch
                                        id="code_reusable"
                                        checked={isSingleUseCode}
                                        onCheckedChange={() => {
                                            setIsSingleUseCode(!isSingleUseCode)
                                        }}
                                    />
                                    Multi-use payment code
                                </Label>
                            </div> */}

                            <div className="flex flex-col">
                                <Label
                                    htmlFor="send_commission"
                                    className="flex items-center gap-2"
                                >
                                    <Switch
                                        id="send_commission"
                                        checked={isSendCommission}
                                        onCheckedChange={() => {
                                            setIsSendCommission(
                                                !isSendCommission
                                            )
                                        }}
                                    />
                                    Send commission
                                </Label>
                            </div>
                        </>
                    )}

                    {can_send_sms_notification === true &&
                        account_type === 'main_account' && (
                            <div className="flex flex-col">
                                <Label
                                    htmlFor="can_send_sms_notification"
                                    className="flex items-center gap-2"
                                >
                                    <Switch
                                        id="can_send_sms_notification"
                                        checked={canSendSmsNotification}
                                        onCheckedChange={() => {
                                            setCanSendSmsNotification(
                                                !canSendSmsNotification
                                            )

                                            setSmsMessage('')
                                        }}
                                    />
                                    Send SMS Notification to Agent
                                </Label>
                            </div>
                        )}

                    <Button
                        type="submit"
                        className="rounded-xl p-6 text-sm font-bold uppercase transition duration-300 ease-in-out active:scale-95"
                        disabled={
                            processing ||
                            name === '' ||
                            agentName === '' ||
                            paymentOption === '' ||
                            amount === null ||
                            amount === ''
                                ? true
                                : false
                        }
                    >
                        Generate
                    </Button>
                    {paymentOption && name && amount !== null && (
                        <Button
                            type="reset"
                            variant="secondary"
                            className="p-6 text-sm font-bold uppercase transition duration-300 ease-in-out active:scale-95"
                            onClick={() => {
                                setPaymentOption('')
                                setAgentName('')
                                setName('')
                                setAmount('')
                                setIsSendCommission(false)
                                setErrors({})
                                setXenditError(null)
                            }}
                        >
                            Reset
                        </Button>
                    )}
                </form>
            </div>

            <div className="order-1 flex flex-1 flex-col justify-center gap-2 md:order-2">
                <header className="mb-2">
                    <h3 className="text-lg font-bold">Payment Code</h3>
                    <p className="text-gray-500">
                        {paymentCode
                            ? 'Kindly present this code to your customer to process the payment through the selected payment channel.'
                            : 'Code for payment processing will be implemented here after successful creation.'}
                    </p>
                </header>
                <code
                    className={`h-[200px] select-all place-content-center rounded-lg border-4 border-dashed p-2 text-center text-5xl font-black md:h-full ${
                        paymentCode
                            ? 'border-gray-300 bg-gray-100 text-black'
                            : 'border-gray-300 bg-gray-100 text-gray-500'
                    }`}
                >
                    {paymentCode || '---'}
                </code>
                {!newPaymentCode && (
                    <Button
                        className="p-6 text-sm font-bold uppercase"
                        onClick={() => {
                            setNewPaymentCode(true)
                            setPaymentCode(null)
                            setIsSendCommission(false)
                            setCanSendSmsNotification(false)
                        }}
                    >
                        New Payment Code
                    </Button>
                )}
            </div>
        </>
    )
}

export default GeneratePaymentCode
