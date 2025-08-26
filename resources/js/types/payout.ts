import { User } from '@/types/index'

export interface Payout {
    id: number
    reference_id: string
    channel_code: string
    account_number: string
    account_holder_name: string
    channel_properties: string
    user: User
    amount: number
    is_approved: number
    status: string
    formatted_created_at: string
    formatted_paid_at: string
}

export interface PaginatedData {
    current_page: number
    data: Payout[]
    first_page_url: string
    from: number
    next_page_url: string
    path: string
    per_page: number
    prev_page_url: string
    to: number
}
