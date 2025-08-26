const PageHeader = ({ title, balance }: { title: string; balance: string }) => {
    return (
        <header className="flex w-full justify-between">
            <h2 className="text-xl font-bold leading-tight text-gray-800">
                {title}
            </h2>
            {balance !== '' && (
                <div className="flex items-center gap-4 text-xl font-bold">
                    <span>Outstanding Balance: </span>
                    <span className="text-gray-500">₱ {balance}</span>
                </div>
            )}
        </header>
    )
}

export default PageHeader
