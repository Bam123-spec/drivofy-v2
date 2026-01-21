export default async function SitePage({ params }: { params: { domain: string } }) {
    const domain = params.domain

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900">Welcome to {domain}</h1>
                <p className="text-gray-500">This is a white-labeled site hosted on Drivofy.</p>
                <div className="p-4 bg-white rounded-lg shadow border border-gray-200">
                    <p className="text-sm font-mono text-gray-600">Subdomain: {domain}</p>
                </div>
            </div>
        </div>
    )
}
