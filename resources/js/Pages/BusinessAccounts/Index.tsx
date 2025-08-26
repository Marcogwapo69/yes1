import { ChangeEvent, FormEvent, useState } from 'react'
import { Head, usePage, router } from '@inertiajs/react'
import { MdAdd } from 'react-icons/md'
import axios from 'axios'

// Layouts and Partials
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import SubAccounts from '@/Pages/BusinessAccounts/Partials/SubAccounts'
import PageHeader from '@/Partials/PageHeader'

// UI Components
import Modal from '@/Components/Modal'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'

// Types
import { BusinessAccount } from '@/types/business-accounts'

interface Props {
    balance: string
    accounts: BusinessAccount[]
}

interface Props {
    balance: string
    accounts: BusinessAccount[]
}

const BusinessAccounts = ({ balance, accounts }: Props) => {
    const appName = usePage().props.app_name
    const [addAccount, setAddAccount] = useState(false)

    const initState = {
        business_id: '',
        business_name: '',
        agent_name: '',
        email: '',
        password: ''
    }

    const [newBusiness, setNewBusiness] = useState(initState)
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setNewBusiness(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [processing, setProcessing] = useState<Boolean>(false)
    const addNewBusiness = (event: FormEvent) => {
        event.preventDefault()
        setProcessing(true)
        axios
            .post('/businesses', newBusiness)
            .then(response => {
                if (response.data.status === 'success') {
                    setAddAccount(false)
                    setNewBusiness(initState)
                    setProcessing(false)

                    router.get('/businesses')
                }
            })
            .catch(err => {
                setErrors({})
                setErrors(err.response.data.errors)
                setProcessing(false)
            })
    }

    const closeModal = () => {
        setAddAccount(false)
        setNewBusiness(initState)
        setErrors({})
    }

    const [isAddAccountDisabled, setIsAddAccountDisabled] =
        useState<boolean>(false)
    const handleMessageChange = (isDisabled: boolean) => {
        setIsAddAccountDisabled(isDisabled)
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
                <div className="container mx-auto flex flex-col gap-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col overflow-hidden bg-white p-6 shadow-sm sm:rounded-lg">
                        <div className="mb-4 flex justify-between">
                            <h2 className="text-2xl font-black">
                                Sub-Accounts
                            </h2>
                            <button
                                type="button"
                                className="border-none bg-none"
                                title="Add sub-account"
                                onClick={() => setAddAccount(true)}
                                disabled={isAddAccountDisabled}
                            >
                                <MdAdd
                                    size="32"
                                    className="hover:text-gray-400"
                                />
                            </button>
                        </div>
                        <Modal
                            maxWidth="md"
                            show={addAccount}
                            onClose={closeModal}
                        >
                            <form
                                className="flex flex-col gap-4 p-6"
                                onSubmit={addNewBusiness}
                            >
                                <header className="mb-3">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Add {appName} Sub-Account
                                    </h2>
                                    <p>
                                        If you are rich and have a lot of
                                        business, feel free to add your
                                        sub-account here.
                                    </p>
                                </header>

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
                                            )
                                        )}
                                    </div>
                                ) : null}

                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="business-id"
                                        className="font-medium"
                                    >
                                        Business ID
                                    </Label>
                                    <Input
                                        id="business-id"
                                        type="text"
                                        className="bg-gray-50"
                                        placeholder="Enter the sub-account ID"
                                        name="business_id"
                                        value={newBusiness.business_id}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="business-name"
                                        className="font-medium"
                                    >
                                        Business name
                                    </Label>
                                    <Input
                                        id="business-name"
                                        type="text"
                                        className="bg-gray-50"
                                        name="business_name"
                                        placeholder="Tell me the name of this business empire!"
                                        value={newBusiness.business_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="agent-name"
                                        className="font-medium"
                                    >
                                        Agent name
                                    </Label>
                                    <Input
                                        id="agent-name"
                                        type="text"
                                        className="bg-gray-50"
                                        name="agent_name"
                                        placeholder="Enter the name of your billionaire agent"
                                        value={newBusiness.agent_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="agent-email"
                                        className="font-medium"
                                    >
                                        Agent email address
                                    </Label>
                                    <Input
                                        id="agent-email"
                                        type="email"
                                        className="bg-gray-50"
                                        placeholder="The super-secret email of your agent. Psst... Must be real"
                                        name="email"
                                        value={newBusiness.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Label
                                        htmlFor="password"
                                        className="font-medium"
                                    >
                                        Default password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="bg-gray-50"
                                        placeholder="Don't make it like 12345, don't be lazy!"
                                        name="password"
                                        value={newBusiness.password}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="submit"
                                        className="order-2 self-end"
                                        disabled={processing ? true : false}
                                    >
                                        Add Account
                                    </Button>
                                    <Button
                                        className="order-1"
                                        variant="outline"
                                        type="button"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Modal>
                        <SubAccounts
                            accounts={accounts}
                            onDisableAddButton={handleMessageChange}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}

export default BusinessAccounts
