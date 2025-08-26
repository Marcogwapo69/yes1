import Modal from '@/Components/Modal'
import { Button } from '@/Components/ui/button'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/Components/ui/table'
import { PaginatedData } from '@/types/payout'
import axios from 'axios'
import { useEffect, useState } from 'react'

const MainAccountTable = () => {
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

    const [processingId, setProcessingId] = useState<number>(0)
    const [payoutApproved, setPayoutApproved] = useState<boolean>(false)

    // Approve the payout request.
    const approveRequest = (id: number) => {
        setProcessingId(id)

        axios
            .post('/approve-payout', {
                id: id
            })
            .then(response => {
                setProcessingId(0)
                setPayouts(prevItems => ({
                    ...prevItems,
                    data: prevItems.data.map(item =>
                        item.id === id ? { ...item, is_approved: 1 } : item
                    )
                }))

                setPayoutApproved(true)
            })
            .catch(err => {
                setProcessingId(0)
            })
    }

    // Deny the payout request.
    const denyRequest = (id: number) => {
        setProcessingId(id)

        axios
            .post('/deny-payout', {
                id: id
            })
            .then(response => {
                setProcessingId(0)
                setPayouts(prevItems => ({
                    ...prevItems,
                    data: prevItems.data.filter(item => item.id !== id)
                }))
            })
            .catch(err => {
                setProcessingId(0)
            })
    }

    useEffect(() => {
        axios
            .get('/payouts')
            .then(response => {
                console.log(response)

                setPayouts(response.data)
            })
            .catch(err => {})
    }, [])

    return (
        <>
            <Modal
                maxWidth="md"
                show={payoutApproved}
                onClose={() => setPayoutApproved(false)}
            >
                <div className="flex flex-col gap-4 p-6">
                    <header>
                        <h2 className="text-lg font-bold text-gray-900">
                            Payout Approved!
                        </h2>
                    </header>
                    <p>
                        The receiver should receive an email detailing the
                        status of the payout.
                    </p>
                    <p>
                        You will also receive an email notifying you if the fund
                        transfer is successful or not.
                    </p>
                    <Button
                        type="button"
                        onClick={() => setPayoutApproved(false)}
                    >
                        Okay, got it!
                    </Button>
                </div>
            </Modal>
            <Table>
                <TableCaption>List of recent payout requests.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-fit font-bold">
                            Reference
                        </TableHead>
                        <TableHead className="w-fit">Bank</TableHead>
                        <TableHead className="w-fit">Account #</TableHead>
                        <TableHead className="w-fit">Account Name</TableHead>
                        <TableHead className="w-fit">Amount</TableHead>
                        <TableHead>Requested At</TableHead>
                        <TableHead>Paid At</TableHead>
                        <TableHead className="w-fit">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payouts?.data?.map((payout, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <code className="select-all font-bold">
                                    {payout.reference_id}
                                </code>
                            </TableCell>
                            <TableCell>{payout.channel_code}</TableCell>
                            <TableCell>{payout.account_number}</TableCell>
                            <TableCell>{payout.account_holder_name}</TableCell>
                            <TableCell>{payout.amount}</TableCell>
                            <TableCell>{payout.formatted_created_at}</TableCell>
                            <TableCell>{payout.formatted_paid_at}</TableCell>
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
                                <div className="flex justify-between">
                                    <Button
                                        size="sm"
                                        className="text-xs font-bold"
                                        onClick={() =>
                                            approveRequest(payout.id)
                                        }
                                        disabled={
                                            processingId === payout.id
                                                ? true
                                                : false ||
                                                    payout.is_approved === 1
                                                  ? true
                                                  : false
                                        }
                                    >
                                        Approve
                                    </Button>
                                    {payout.is_approved !== 1 && (
                                        <Button
                                            className="text-xs font-bold"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                denyRequest(payout.id)
                                            }
                                        >
                                            Deny
                                        </Button>
                                    )}
                                </div>
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

export default MainAccountTable
