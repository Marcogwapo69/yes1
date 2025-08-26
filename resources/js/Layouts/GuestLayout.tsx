import { usePage } from '@inertiajs/react'
import { PropsWithChildren } from 'react'

export default function Guest({ children }: PropsWithChildren) {
    const appName = usePage().props.app_name
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-tl from-teal-300 to-gray-100 pt-6 sm:justify-center sm:pt-0">
            <header className="mb-8 text-center">
                <h2 className="text-3xl font-black">{appName}</h2>
                <p className="text-lg">
                    Your Complete Payment Solution, Simplified.
                </p>
            </header>

            <div className="relative mt-6 w-full border-4 border-black bg-white p-10 shadow-2xl sm:max-w-md sm:rounded-2xl">
                <svg
                    className="absolute -top-2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 transform rounded-2xl border-4 border-black bg-white p-3 shadow-xl"
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M192,96a64,64,0,1,1-64-64A64,64,0,0,1,192,96Z"
                        opacity="0.2"
                    ></path>
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
                {children}
            </div>
        </div>
    )
}
