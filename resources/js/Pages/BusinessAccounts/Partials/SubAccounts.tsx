import { FormEvent, useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Link, router, useForm } from '@inertiajs/react'

// UI Components
import Modal from '@/Components/Modal'
import { Button } from '@/Components/ui/button'
import { Checkbox } from '@/Components/ui/checkbox'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/Components/ui/table'
import { Label } from '@/Components/ui/label'
import { Input } from '@/Components/ui/input'

// Icons
import { TbTransfer } from 'react-icons/tb'
import { PiPasswordFill } from 'react-icons/pi'

// Types
import { BusinessAccount } from '@/types/business-accounts'
import InputError from '@/Components/InputError'

interface Props {
    accounts: BusinessAccount[]

    // Prop to pass to BusinessAccounts.tsx to disable the add
    // account button when selecting accounts to delete.
    onDisableAddButton: (isDisabled: boolean) => void
}

const SubAccounts = ({ accounts, onDisableAddButton }: Props) => {
    const [subAccounts, setSubAccounts] = useState<BusinessAccount[] | []>([])

    const [selectedAccount, setSelectedAccount] = useState<string[]>([])
    const toggleSelectAll = (isChecked: boolean) => {
        if (isChecked) {
            // Add all business_ids to the array
            const allBusinessIds = subAccounts.map(
                account => account.business_id
            )
            setSelectedAccount(allBusinessIds)
            onDisableAddButton(true)
        } else {
            // Clear the array
            setSelectedAccount([])
            onDisableAddButton(false)
        }
    }

    useEffect(() => {
        if (accounts) {
            setSubAccounts(accounts)
        }
    }, [])

    // Check if all selected accounts' ID is included in the selectedAccount state.
    const isAllSelected =
        subAccounts.length > 0 &&
        subAccounts.every(account =>
            selectedAccount.includes(account.business_id)
        )

    // Add/Remove the selected account ID to the selectedAccount state for batch deletion.
    const selectAccount = (businessId: string) => {
        setSelectedAccount(prevAccounts => {
            const updatedAccounts = prevAccounts.includes(businessId)
                ? prevAccounts.filter(id => id !== businessId) // Remove if already selected
                : [...prevAccounts, businessId] // Add if not selected

            // Disable the 'Add account' button only if at least one account is selected.
            if (updatedAccounts.length >= 1) {
                onDisableAddButton(true)
            } else {
                onDisableAddButton(false)
            }

            return updatedAccounts
        })
    }

    // Transfer fund from main account to sub account or vice-versa.
    const transferDetailsInitState = {
        business_name: '',
        business_id: '',
        amount: ''
    }
    const [transferDetails, setTransferDetails] = useState(
        transferDetailsInitState
    )
    const showConfirmDialog = (
        business_name: string,
        business_id: string,
        amount: string
    ) => {
        setConfirmTransferFund(true)
        setTransferDetails({
            business_name: business_name,
            business_id: business_id,
            amount: amount
        })
    }

    const [isTransferring, setIsTransferring] = useState<boolean>(false)
    const transferFund = () => {
        setIsTransferring(true)
        axios
            .post('/transfer', {
                business_id: transferDetails.business_id,
                amount: transferDetails.amount
            })
            .then(response => {
                if (response.data.success === true) {
                    closeModal()
                    router.get('businesses')
                }

                setIsTransferring(false)
            })
            .catch(error => {
                console.log(error)
                setIsTransferring(false)
            })
    }

    // Delete all selected accounts.
    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false)
    const deleteAccounts = () => {
        setIsDeletingAccount(true)
        axios
            .delete('/delete-accounts', {
                params: {
                    business_ids: selectedAccount
                }
            })
            .then(response => {
                if (response.data.success === true) {
                    closeModal()
                    router.get('accounts')
                }
            })
            .catch(error => {
                console.log(error)
                setIsDeletingAccount(false)
            })
    }

    const [confirmTransferFund, setConfirmTransferFund] = useState(false)
    const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
    const closeModal = () => {
        setConfirmTransferFund(false)
        setConfirmDeleteAccount(false)
    }

    const passwordInput = useRef<HTMLInputElement>(null)
    const passwordConfirmInput = useRef<HTMLInputElement>(null)
    const [userId, setUserId] = useState<number>(0)
    const [isPasswordReset, setIsPasswordReset] = useState(false)
    const { data, setData, errors, put, reset, processing } = useForm({
        user_id: userId,
        password: '',
        password_confirmation: ''
    })

    useEffect(() => {
        setData('user_id', userId)
    }, [userId])

    const handleSubmitResetPassword = (event: FormEvent) => {
        event.preventDefault()

        put(route('manual-password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setIsPasswordReset(false)
            },
            onError: errors => {
                if (errors.password) {
                    reset('password', 'password_confirmation')
                    passwordInput.current?.focus()
                }
            }
        })
    }

    return (
        <>
            {subAccounts?.length > 0 ? (
                <>
                    <Modal
                        maxWidth="md"
                        show={confirmTransferFund}
                        onClose={closeModal}
                        closeable={false}
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Confirm Fund Transfer
                            </h2>
                            <form className="flex flex-col gap-2">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="amount">
                                        Amount to transfer
                                    </Label>
                                    <Input
                                        className="rounded-xl"
                                        id="amount"
                                        type="number"
                                        pattern="[0-9]*[.,]?[0-9]*"
                                        inputMode="numeric"
                                        placeholder="Specify amount to transfer"
                                        required
                                        value={transferDetails.amount}
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
                                        onChange={event =>
                                            setTransferDetails({
                                                business_name:
                                                    transferDetails.business_name,
                                                business_id:
                                                    transferDetails.business_id,
                                                amount: event.target.value
                                            })
                                        }
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-auto flex-shrink-0 flex-grow-0"
                                    onClick={transferFund}
                                    disabled={isTransferring ? true : false}
                                >
                                    {isTransferring
                                        ? 'Processing...'
                                        : 'Continue'}
                                </Button>
                                <Button
                                    type="button"
                                    className="w-auto flex-shrink-0 flex-grow-0"
                                    onClick={() => {
                                        setConfirmTransferFund(false)
                                        setTransferDetails(
                                            transferDetailsInitState
                                        )
                                    }}
                                    disabled={isTransferring ? true : false}
                                >
                                    Cancel
                                </Button>
                            </form>
                        </div>
                    </Modal>

                    {/* Password reset */}
                    <Modal
                        maxWidth="md"
                        show={isPasswordReset}
                        onClose={closeModal}
                        closeable={false}
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Password Reset
                            </h2>
                            <form
                                className="flex flex-col gap-2"
                                onSubmit={handleSubmitResetPassword}
                            >
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">
                                        New password
                                    </Label>
                                    <Input
                                        className="rounded-xl"
                                        ref={passwordInput}
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={e =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mb-1"
                                    />
                                    <Label htmlFor="confirm">
                                        Re-type password
                                    </Label>
                                    <Input
                                        className="rounded-xl"
                                        ref={passwordConfirmInput}
                                        id="confirm"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mb-1"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="secondary"
                                    className="w-auto flex-shrink-0 flex-grow-0"
                                    disabled={processing ? true : false}
                                >
                                    {processing ? 'Processing...' : 'Continue'}
                                </Button>
                                <Button
                                    type="button"
                                    className="w-auto flex-shrink-0 flex-grow-0"
                                    onClick={() => {
                                        setIsPasswordReset(false)
                                        setUserId(0)
                                        reset()
                                    }}
                                    disabled={processing ? true : false}
                                >
                                    Cancel
                                </Button>
                            </form>
                        </div>
                    </Modal>

                    <Modal
                        maxWidth="md"
                        show={confirmDeleteAccount}
                        onClose={closeModal}
                        closeable={false}
                    >
                        <div className="flex flex-col gap-4 p-6">
                            <h2 className="text-lg font-bold text-gray-900">
                                Delete{' '}
                                {selectedAccount.length === 1
                                    ? 'sub-account'
                                    : 'sub-accounts'}
                            </h2>
                            <p>
                                You are about to delete the selected{' '}
                                {selectedAccount.length === 1
                                    ? 'sub-account'
                                    : 'sub-accounts'}
                                .{' '}
                                {selectedAccount.length === 1
                                    ? 'Sub-account'
                                    : 'Sub-accounts'}{' '}
                                with remaining balances will{' '}
                                <strong>not</strong> be deleted. Please transfer
                                any remaining balances to the main account
                                before proceeding with deletion.
                            </p>
                            <Button
                                variant="outline"
                                className="w-auto flex-shrink-0 flex-grow-0"
                                onClick={deleteAccounts}
                                disabled={isDeletingAccount ? true : false}
                            >
                                {isDeletingAccount
                                    ? 'Processing...'
                                    : 'Continue'}
                            </Button>
                            <Button
                                className="w-auto flex-shrink-0 flex-grow-0"
                                onClick={() => setConfirmDeleteAccount(false)}
                                disabled={isDeletingAccount ? true : false}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                    {selectedAccount.length > 0 && (
                        <Button
                            variant="destructive"
                            className="mb-4 max-w-max grow-0"
                            onClick={() => setConfirmDeleteAccount(true)}
                        >
                            <span>
                                Delete{' '}
                                {selectedAccount.length === 1
                                    ? 'account'
                                    : 'accounts'}
                            </span>
                        </Button>
                    )}
                    <Table>
                        <TableCaption>List of sub-accounts</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Checkbox
                                        checked={isAllSelected}
                                        onCheckedChange={isChecked =>
                                            toggleSelectAll(Boolean(isChecked))
                                        }
                                    />
                                </TableHead>
                                <TableHead className="w-fit font-bold">
                                    Business ID
                                </TableHead>
                                <TableHead className="w-fit">
                                    Business name
                                </TableHead>

                                <TableHead>Agent name</TableHead>
                                <TableHead className="text-right">
                                    Balance
                                </TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {subAccounts?.map((account, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedAccount.includes(
                                                account.business_id
                                            )}
                                            onCheckedChange={() =>
                                                selectAccount(
                                                    account.business_id
                                                )
                                            }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <code className="select-all font-bold">
                                            <Link
                                                href={route('businesses.show', {
                                                    id: account.id
                                                })}
                                            >
                                                {account.business_id}
                                            </Link>
                                        </code>
                                    </TableCell>

                                    <TableCell className="font-semibold">
                                        {account.business_name}
                                    </TableCell>

                                    <TableCell className="">
                                        {account.user.name}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                            currency: 'PHP'
                                        }).format(Number(account.balance))}
                                    </TableCell>
                                    <TableCell className="flex justify-end gap-2">
                                        <Button
                                            size="icon"
                                            title="Reset password"
                                            onClick={() => {
                                                setIsPasswordReset(true)
                                                setUserId(account.user.id)
                                            }}
                                        >
                                            <PiPasswordFill />
                                        </Button>
                                        <Button
                                            size="icon"
                                            title="Transfer balance to main account."
                                            onClick={() =>
                                                showConfirmDialog(
                                                    account.business_name,
                                                    account.business_id,
                                                    account.balance
                                                )
                                            }
                                            disabled={
                                                Number(account.balance) === 0
                                                    ? true
                                                    : false
                                            }
                                        >
                                            <TbTransfer />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </>
            ) : (
                <p className="flex items-center justify-center gap-4 rounded-xl border border-orange-200 bg-orange-100 px-12 py-3 text-lg text-orange-600">
                    <svg
                        className="size-12 shrink-0"
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 256 256"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"
                            opacity="0.2"
                        ></path>
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216ZM80,108a12,12,0,1,1,12,12A12,12,0,0,1,80,108Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,176,108Zm-1.08,64a8,8,0,1,1-13.84,8c-7.47-12.91-19.21-20-33.08-20s-25.61,7.1-33.08,20a8,8,0,1,1-13.84-8c10.29-17.79,27.39-28,46.92-28S164.63,154.2,174.92,172Z"></path>
                    </svg>
                    <span>
                        No sub-accounts yet. Add more businesses so you can lay
                        on the bed of cash!
                    </span>
                </p>
            )}
        </>
    )
}

export default SubAccounts
