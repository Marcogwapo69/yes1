import InputError from '@/Components/InputError'
import TextInput from '@/Components/TextInput'
import { Button } from '@/Components/ui/button'
import GuestLayout from '@/Layouts/GuestLayout'
import { Head, Link, useForm } from '@inertiajs/react'
import { FormEventHandler } from 'react'

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: ''
    })

    const submit: FormEventHandler = e => {
        e.preventDefault()

        post(route('password.email'))
    }

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-4 text-sm text-gray-600">
                Feeling forgetful? Drop your email, and we’ll help you reset
                your password—so you can forget it all over again!
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <TextInput
                    id="email"
                    type="email"
                    name="email"
                    placeholder="juandelacruz@example.com"
                    value={data.email}
                    className="mt-1 block w-full"
                    isFocused={true}
                    onChange={e => setData('email', e.target.value)}
                />

                <InputError
                    message={errors.email}
                    className="mt-2"
                />

                <div className="mt-4 flex flex-col items-center justify-end gap-2">
                    <Button className="w-full py-6 font-bold">
                        Email Password Reset Link
                    </Button>
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Back to sign in
                    </Link>
                </div>
            </form>
        </GuestLayout>
    )
}
