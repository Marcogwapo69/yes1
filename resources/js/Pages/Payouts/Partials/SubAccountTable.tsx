import { Label } from '@/Components/ui/label'
import { Input } from '@/Components/ui/input'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/Components/ui/table'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem
} from '@/Components/ui/select'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { PaginatedData } from '@/types/payout'
import { router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import Modal from '@/Components/Modal'
import axios from 'axios'

const SubAccountTable = () => {
    const [requestPayout, setRequestPayout] = useState(false)
    const [processing, setProcessing] = useState(false)

    // Close the request modal.
    const closeModal = () => {
        setRequestPayout(false)
        setErrors({})
        setPayoutPayload(initRequestState)
    }

    const payoutChannels = [
        {
            name: 'Bank of the Philippine Island (BPI)',
            value: 'PH_BPI'
        },
        {
            name: 'Union Bank of the Philippines',
            value: 'PH_UBP'
        },
        {
            name: 'Asia United Bank',
            value: 'PH_AUB'
        },
        {
            name: 'RCBC',
            value: 'PH_RCBC'
        },
        {
            name: 'Banco De Oro Unibank, Inc (BDO)',
            value: 'PH_BDO'
        }
    ]

    const initRequestState = {
        channel_code: '',
        account_number: '',
        account_holder_name: '',
        amount: ''
    }

    const [payoutPayload, setPayoutPayload] = useState(initRequestState)
    const [payouts, setPayouts] = useState<PaginatedData>({
        current_page: 1,
        data: [],
        first_page_url: '',
        from: 0,
        next_page_url: '',
        path: '',
        per_page: 0,
        prev_page_url: '',
        to: 0
    })

    // Pagination request
    const paginateRequest = (page: string) => {
        axios.get(page).then(response => {
            setPayouts(response.data)
        })
    }

    // Cycle through next/prev pages.
    const changePage = (page: string) => {
        switch (page) {
            case 'next':
                paginateRequest(payouts.next_page_url)
                break

            default:
                paginateRequest(payouts.prev_page_url)
                break
        }
    }

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [xenditError, setXenditError] = useState<string | null>(null)
    const submit = (event: FormEvent) => {
        event.preventDefault()
        setProcessing(true)
        axios
            .post('/payouts', payoutPayload)
            .then(response => {
                setProcessing(false)
                closeModal()

                router.get('/payouts-page')
            })
            .catch(error => {
                console.log(error)

                // setErrors({})
                // setErrors(err.response.data.errors)
                setProcessing(false)
                if (error.response) {
                    // Server responded with a status other than 2xx
                    console.error('Server Error:', error.response.data.message)
                    setXenditError(error.response.data.message)
                } else if (error.request) {
                    // Request was made but no response was received
                    console.error('Network Error:', error.request)
                    alert('Network error, please try again.')
                } else {
                    // Something else went wrong
                    console.error('Error:', error.message)
                    alert('An unexpected error occurred.')
                }
            })
    }

    const handlePayoutOptionChange = (value: string) => {
        setPayoutPayload({ ...payoutPayload, channel_code: value })
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setPayoutPayload(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    useEffect(() => {
        axios
            .get('/payouts')
            .then(response => {
                setPayouts(response.data)
            })
            .catch(err => {
                setErrors({})
                setErrors(err.response.data.errors)
                setProcessing(false)
            })
    }, [])

    return (
        <>
            <Button
                className="self-end"
                onClick={() => setRequestPayout(true)}
            >
                Request Payout
            </Button>
            <Modal
                maxWidth="md"
                show={requestPayout}
                onClose={closeModal}
                closeable={false}
            >
                <form
                    className="flex flex-col gap-4 p-6"
                    onSubmit={submit}
                >
                    <header className="mb-3">
                        <h2 className="text-lg font-bold text-gray-900">
                            Request Payout
                        </h2>
                        <p>Fill out your banking details to receive payouts.</p>
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

                    <div className="flex flex-col gap-1">
                        <Label className="font-medium">Destination Bank</Label>
                        <Select
                            value={payoutPayload.channel_code}
                            onValueChange={handlePayoutOptionChange}
                        >
                            <SelectTrigger className="rounded-xl bg-gray-100">
                                <SelectValue placeholder="Select destination bank" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Payout Channels</SelectLabel>
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
                            className="font-medium"
                            htmlFor="account-number"
                        >
                            Account number
                        </Label>
                        <Input
                            id="account-number"
                            type="number"
                            className="bg-gray-50"
                            placeholder="Bank account #"
                            name="account_number"
                            value={payoutPayload.account_number}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label
                            className="font-medium"
                            htmlFor="account-holder-name"
                        >
                            Account holder name
                        </Label>
                        <Input
                            id="account-holder-name"
                            type="text"
                            className="bg-gray-50"
                            placeholder="Account holder name must be the same in bank account"
                            name="account_holder_name"
                            value={payoutPayload.account_holder_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <Label
                            htmlFor="amount"
                            className="font-medium"
                        >
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            className="bg-gray-50"
                            placeholder="How many millions you want this time?"
                            name="amount"
                            value={payoutPayload.amount}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-2 self-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing ? true : false}
                        >
                            Submit Payout Request
                        </Button>
                    </div>
                </form>
            </Modal>
            <Table>
                <TableCaption>
                    List of your recent payout requests.
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-fit font-bold">
                            Reference
                        </TableHead>
                        <TableHead className="w-fit">Payout Channel</TableHead>
                        <TableHead className="w-fit">Amount</TableHead>
                        <TableHead className="w-fit">Status</TableHead>
                        <TableHead className="text-right">
                            Requested At
                        </TableHead>
                        <TableHead className="text-right">Paid At</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payouts?.data.map((payout, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <code className="select-all font-bold">
                                    {payout.reference_id}
                                </code>
                            </TableCell>
                            <TableCell>{payout.channel_code}</TableCell>
                            <TableCell>{payout.amount}</TableCell>
                            <TableCell>
                                {payout.status === 'PAID' && (
                                    <span className="rounded-md bg-green-300 px-3 py-1 text-xs font-bold uppercase text-green-700">
                                        Paid
                                    </span>
                                )}

                                {payout.status === 'PENDING' && (
                                    <span className="rounded-md bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700">
                                        Pending
                                    </span>
                                )}

                                {payout.status === 'FAILED' && (
                                    <span className="rounded-md bg-red-400 px-3 py-1 text-xs font-bold uppercase text-white">
                                        Failed
                                    </span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {payout.formatted_created_at}
                            </TableCell>
                            <TableCell className="text-right">
                                {payout.formatted_paid_at}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-end gap-2">
                <Button
                    variant="outline"
                    onClick={() => changePage('prev')}
                    disabled={payouts.prev_page_url === null}
                    className="text-xs font-bold"
                >
                    Prev
                </Button>
                <Button
                    variant="outline"
                    onClick={() => changePage('next')}
                    disabled={payouts.next_page_url === null}
                    className="text-xs font-bold"
                >
                    Next
                </Button>
            </div>
        </>
    )
}

export default SubAccountTable
