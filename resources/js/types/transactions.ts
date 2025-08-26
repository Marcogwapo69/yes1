export interface Transaction {
    current_page: number
    data: Record[]
    first_page_url: string
    from: number
    next_page_url: string
    path: string
    per_page: number
    prev_page_url: string
    to: number
}

export interface Record {
    channel_code: string
    payment_code: string
    agent_name: string
    name: string
    amount: number
    status: string
    created_at: string
    formatted_created_at: string
    formatted_updated_at: string
}
