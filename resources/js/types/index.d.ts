export interface User {
    id: number
    business: Business
    name: string
    email: string
    email_verified_at?: string
}

export interface Business {
    id: number
    user_id: number
    account_type: string
    business_id: string
    created_at: string
    updated_at: string
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User
    }
    balance: string
    app_name: string
}
