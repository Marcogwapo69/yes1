import { useEffect, useState } from 'react'
import { addDays, format } from 'date-fns'
import axios from 'axios'
import useCounterStore from '@/store/store'
import { cn } from '@/lib/utils'

// UI Components
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Calendar } from '@/Components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/Components/ui/popover'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/Components/ui/table'

// Icons and Types
import { Calendar as CalendarIcon } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Transaction } from '@/types/transactions'

const RecentPayments = ({ userId }: { userId: number }) => {
    const { newRecord } = useCounterStore()

    // Pagination request
    const paginateRequest = (page: string) => {
        axios
            .get(page, {
                params: {
                    user_id: userId
                }
            })
            .then(response => {
                setTransactions(response.data.records)
            })
    }

    // Cycle through next/prev pages.
    const changePage = (page: string) => {
        switch (page) {
            case 'next':
                paginateRequest(transactions.next_page_url)
                break

            default:
                paginateRequest(transactions.prev_page_url)
                break
        }
    }

    const [query, setQuery] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const clearSearch = () => {
        setDebouncedQuery('')
        setQuery('')
    }

    // Fetch transactions made
    const [totalActive, setTotalActive] = useState(0)
    const [totalCompleted, setTotalCompleted] = useState(0)
    const [transactions, setTransactions] = useState<Transaction>({
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

    // Get recent transactions.
    const getTransactions = () => {
        axios
            .get('/transactions', {
                params: {
                    user_id: userId
                }
            })
            .then(response => {
                setTransactions(response.data.records)
                setTotalActive(response.data.total_active)
                setTotalCompleted(response.data.total_completed)

                setDate(initDateRange)
                setIsFilteringDate(false)
            })
            .catch(error => {})
    }

    // Default date range for the filter.
    const initDateRange = {
        from: new Date(), // Today's date
        to: addDays(new Date(), 7) // 7 days from today
    }
    const [date, setDate] = useState<DateRange | undefined>(initDateRange)

    // Filter records by selected date ranges.
    const [isFilteringDate, setIsFilteringDate] = useState(false)
    const filterByDate = () => {
        setIsFilteringDate(true)
        axios
            .get('/filter-by-date', {
                params: {
                    ...date,
                    query_string: debouncedQuery,
                    user_id: userId
                }
            })
            .then(response => {
                setTransactions(response.data.records)
                setTotalActive(response.data.total_active)
                setTotalCompleted(response.data.total_completed)
            })
            .catch(err => {
                // console.log(err)
            })
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query)
        }, 400)

        return () => {
            clearTimeout(handler)
        }
    }, [query])

    useEffect(() => {
        if (debouncedQuery) {
            // Perform the search API call
            axios
                .get('/search/' + debouncedQuery, {
                    params: {
                        user_id: userId
                    }
                })
                .then(response => {
                    setTransactions(response.data.records)
                    setTotalActive(response.data.total_active)
                    setTotalCompleted(response.data.total_completed)
                })
                .catch(error => {
                    // console.log(error)
                })
        } else {
            getTransactions()
        }
    }, [debouncedQuery])

    // Initial load of transactions or trigger a
    // refresh when new data are inserted.
    useEffect(() => {
        getTransactions()
    }, [newRecord])

    return (
        <div className="flex flex-col gap-2">
            <header className="mb-2 text-2xl font-bold">
                <h2>Recent Transactions</h2>
            </header>

            <div className="mb-4 flex items-center justify-between">
                {/* Search field */}
                <div
                    className={`group relative flex flex-col rounded-xl border border-gray-200 bg-gray-100 lg:w-[500px]`}
                >
                    <Input
                        className="w-10/12 rounded-xl border-none bg-transparent focus:ring-0 group-focus:border group-focus:border-blue-500"
                        type="text"
                        placeholder="Search for payment code, agent, or name of the customer."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <Button
                        disabled={query === '' ? true : false}
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-xl px-4 text-xs font-bold uppercase"
                        onClick={clearSearch}
                    >
                        Clear
                    </Button>
                </div>

                {/* Date filter */}
                <div className="flex items-center gap-2">
                    <span className="font-bold">Select records</span>
                    <div className={cn('grid gap-2')}>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={'outline'}
                                    className={cn(
                                        'w-[300px] justify-start text-left font-normal',
                                        !date && 'text-muted-foreground'
                                    )}
                                >
                                    <CalendarIcon />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, 'LLL dd, y')}{' '}
                                                - {format(date.to, 'LLL dd, y')}
                                            </>
                                        ) : (
                                            format(date.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0"
                                align="start"
                            >
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button
                        className="text-xs font-bold uppercase"
                        onClick={filterByDate}
                    >
                        Filter
                    </Button>
                    <Button
                        variant="outline"
                        className="text-xs font-bold uppercase"
                        onClick={() => {
                            getTransactions()
                            clearSearch()
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </div>

            {transactions.data.length > 0 ? (
                <>
                    <Table>
                        <TableCaption>
                            List of your recent transactions.
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-fit font-bold">
                                    Reference
                                </TableHead>
                                <TableHead className="font-bold">
                                    Status
                                </TableHead>
                                <TableHead className="font-bold">
                                    Agent Name
                                </TableHead>
                                <TableHead className="font-bold">
                                    Name
                                </TableHead>
                                <TableHead className="font-bold">
                                    Amount
                                </TableHead>
                                <TableHead className="text-right font-bold">
                                    Created At
                                </TableHead>
                                <TableHead className="text-right font-bold">
                                    Paid At
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.map((transaction, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <code className="select-all font-bold">
                                            {transaction.payment_code}
                                        </code>
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        <span
                                            className={`rounded-md px-2 py-1 text-xs ${transaction.status === 'COMPLETED' || transaction.status === 'PAID' ? 'bg-green-300 text-green-700' : 'bg-gray-200'}`}
                                        >
                                            {transaction.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {transaction.agent_name}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        {transaction.name}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.amount.toLocaleString(
                                            'en-PH',
                                            {
                                                style: 'currency',
                                                currency: 'PHP'
                                            }
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {transaction.formatted_created_at}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {transaction.formatted_updated_at}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TableCell className="font-bold">
                                    Unpaid
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    ₱{totalActive}
                                </TableCell>
                                <TableCell
                                    colSpan={2}
                                    className="text-right font-bold"
                                ></TableCell>
                                <TableCell className="font-bold">
                                    Paid
                                </TableCell>
                                <TableCell className="text-right font-bold">
                                    ₱{totalCompleted}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => changePage('prev')}
                            disabled={transactions.prev_page_url === null}
                            className="text-xs font-bold"
                        >
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => changePage('next')}
                            disabled={transactions.next_page_url === null}
                            className="text-xs font-bold"
                        >
                            Next
                        </Button>
                    </div>
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
                        You see that sad face on the left? That means{' '}
                        <strong>YOU'RE STILL POOR</strong>. So, create some
                        payment codes, get paid, and let that Ferrari roar in
                        your garage!
                    </span>
                </p>
            )}
        </div>
    )
}

export default RecentPayments
