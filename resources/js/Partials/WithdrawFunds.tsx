import Modal from '@/Components/Modal'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from '@/Components/ui/select'
import { PiHandWithdrawDuotone } from 'react-icons/pi'
import axios from 'axios'
import { ChangeEvent, useState } from 'react'

const WithdrawFunds = ({
    isModalOpen,
    setIsModalOpen
}: {
    isModalOpen: boolean
    setIsModalOpen: (isOpen: boolean) => void
}) => {
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    const payoutChannels = [
        {
            name: 'RCBC',
            value: 'PH_RCBC'
        },
        {
            name: 'Union Bank of the Philippines',
            value: 'PH_UBP'
        },
        {
            name: 'BPI',
            value: 'PH_BPI'
        },
        {
            name: 'Security Bank',
            value: 'PH_SEC'
        },
        {
            name: 'Own Bank, The Rural Bank of Cavite City, Inc.',
            value: 'PH_OWN'
        },
        {
            name: 'BDO',
            value: 'PH_BDO'
        },
        {
            name: 'Asia United Bank',
            value: 'PH_AUB'
        }
    ]

    const initWithdrawalPayloadState = {
        channel_code: '',
        account_number: '',
        name: '',
        amount: ''
    }
    const [withdrawalPayload, setWithdrawalPayload] = useState(
        initWithdrawalPayloadState
    )

    const [processing, setProcessing] = useState<boolean>(false)
    const [withdrawalStatus, setWithdrawalStatus] = useState<string | null>(
        null
    )
    const handleOnSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setProcessing(true)
        axios
            .post('/withdraw', {
                channel_code: withdrawalPayload.channel_code,
                amount: withdrawalPayload.amount,
                account_number: withdrawalPayload.account_number,
                name: withdrawalPayload.name
            })
            .then(response => {
                console.log(response)
                setProcessing(false)
                if (response.data.status === 'success') {
                    setWithdrawalStatus('success')
                }
            })
            .catch(error => {
                setProcessing(false)
                setErrors(error.response.data.errors)
            })
    }

    const handleWithdrawalOptionChange = (value: string) => {
        setWithdrawalPayload({ ...withdrawalPayload, channel_code: value })
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setWithdrawalPayload(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    // Close withdrawal modal.
    const onModalClose = () => {
        // setIsModalOpen(false)
        setWithdrawalPayload(initWithdrawalPayloadState)
        setErrors({})

        // Delay setting the withdrawal status to null
        setTimeout(() => {
            setWithdrawalStatus(null)
        }, 2000)
    }

    return (
        <Modal
            maxWidth="md"
            show={isModalOpen}
            onClose={onModalClose}
        >
            {withdrawalStatus === 'success' && (
                <div className="flex flex-col gap-2 p-8">
                    <header className="mb-3 flex flex-col items-center gap-2">
                        <h2 className="text-lg font-bold text-gray-900">
                            Withdraw Funds
                        </h2>
                        <p className="">
                            You have requested a withdrawal from your online
                            account to your bank account. You will receive an
                            email notification confirming whether the withdrawal
                            was successful or not.
                        </p>
                    </header>

                    <Button
                        type="button"
                        size="lg"
                        onClick={onModalClose}
                    >
                        Close
                    </Button>
                </div>
            )}

            {withdrawalStatus === null && (
                <form
                    className="flex flex-col gap-4 p-6"
                    onSubmit={event => handleOnSubmit(event)}
                >
                    <header className="mb-3 flex items-center gap-3">
                        <PiHandWithdrawDuotone size="42" />
                        <div className="flex flex-col gap-1">
                            <h2 className="text-lg font-bold text-gray-900">
                                Withdraw Funds
                            </h2>
                            <p>
                                Easily withdraw millions from to your bank
                                account.
                            </p>
                        </div>
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

                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="bank"
                            className="font-medium"
                        >
                            Bank
                        </Label>
                        <Select
                            value={withdrawalPayload.channel_code}
                            onValueChange={handleWithdrawalOptionChange}
                        >
                            <SelectTrigger
                                id="bank"
                                className="rounded-xl bg-gray-100"
                            >
                                <SelectValue placeholder="Select destination bank" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Available Bank</SelectLabel>
                                    {payoutChannels.map(
                                        (
                                            payoutChannel: {
                                                name: string
                                                value: string
                                            },
                                            index: number
                                        ) => (
                                            <SelectItem
                                                key={index}
                                                value={payoutChannel.value}
                                            >
                                                {payoutChannel.name}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="account_number"
                            className="font-medium"
                        >
                            Account #
                        </Label>
                        <Input
                            id="account_number"
                            type="number"
                            className="rounded-xl bg-gray-50"
                            placeholder="Enter your account #"
                            name="account_number"
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
                            onChange={handleChange}
                            value={withdrawalPayload.account_number}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="name"
                            className="font-medium"
                        >
                            Account holder name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            className="rounded-xl bg-gray-50"
                            placeholder="Needs to match the registered account name exactly."
                            name="name"
                            onChange={handleChange}
                            value={withdrawalPayload.name}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="amount"
                            className="font-medium"
                        >
                            Amount in PHP (Philippine Peso)
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            className="rounded-xl bg-gray-50"
                            placeholder="How many millions you want to withdraw?"
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
                            value={withdrawalPayload.amount}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing ? true : false}
                        >
                            {processing ? 'Processing...' : 'Withdraw'}
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            variant="ghost"
                            onClick={() => {
                                setIsModalOpen(false)
                                setProcessing(false)
                                setErrors({})
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    )
}

export default WithdrawFunds
