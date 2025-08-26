import { User } from '@/types/index'

export interface BusinessAccount {
    id: number
    user_id: number
    user: User
    account_type: string
    business_id: string
    business_name: string
    balance: string
    created_at: string
    updated_at: string
}
