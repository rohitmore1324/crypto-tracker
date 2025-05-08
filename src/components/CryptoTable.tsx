import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../store'
import { updateAssets, setLoading, setError } from '../features/crypto/cryptoSlice'
import PriceChart from './PriceChart'

const CryptoTable = () => {
    const dispatch = useDispatch()
    const { assets, loading, error } = useSelector((state: RootState) => state.crypto)
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'marketCap',
        direction: 'desc'
    })
    const [retryCount, setRetryCount] = useState(0)
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

    const fetchData = async () => {
        try {
            dispatch(setLoading(true))
            const response = await fetch(
                'https://api.coingecko.com/api/v3/coins/markets?' +
                new URLSearchParams({
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: '20',
                    page: '1',
                    sparkline: 'true',
                    price_change_percentage: '24h',
                    locale: 'en'
                }).toString(),
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received')
            }

            const formattedData = data.map((coin: any) => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol.toUpperCase(),
                price: coin.current_price,
                change24h: coin.price_change_percentage_24h,
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                image: coin.image,
                sparkline: coin.sparkline_in_7d?.price || [],
                lastUpdated: new Date(coin.last_updated)
            }))

            dispatch(updateAssets(formattedData))
            dispatch(setError(null))
            setRetryCount(0)
            setLastUpdate(new Date())
        } catch (err) {
            console.error('Error fetching data:', err)
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
            dispatch(setError(errorMessage))

            if (retryCount < 3) {
                setRetryCount(prev => prev + 1)
                setTimeout(fetchData, 5000)
            }
        } finally {
            dispatch(setLoading(false))
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000) // Update every 30 seconds

        return () => clearInterval(interval)
    }, [dispatch])

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const sortedAssets = [...assets].sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name)
        }
        return sortConfig.direction === 'asc'
            ? a[sortConfig.key as keyof typeof a] - b[sortConfig.key as keyof typeof b]
            : b[sortConfig.key as keyof typeof b] - a[sortConfig.key as keyof typeof a]
    })

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
        if (seconds < 60) return `${seconds}s ago`
        const minutes = Math.floor(seconds / 60)
        if (minutes < 60) return `${minutes}m ago`
        const hours = Math.floor(minutes / 60)
        if (hours < 24) return `${hours}h ago`
        return `${Math.floor(hours / 24)}d ago`
    }

    if (loading && assets.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error && assets.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-2">Error loading data</div>
                <div className="text-gray-400 text-sm mb-4">{error}</div>
                {retryCount < 3 && (
                    <div className="text-gray-400 text-sm">
                        Retrying in 5 seconds... (Attempt {retryCount + 1}/3)
                    </div>
                )}
                {retryCount >= 3 && (
                    <button
                        onClick={() => {
                            setRetryCount(0)
                            fetchData()
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Retry Now
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Top Cryptocurrencies</h2>
                <div className="text-sm text-gray-400">
                    Last updated: {formatTimeAgo(lastUpdate)}
                </div>
            </div>
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => handleSort('name')}>
                            Name
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => handleSort('price')}>
                            Price
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => handleSort('change24h')}>
                            24h Change
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => handleSort('marketCap')}>
                            Market Cap
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300" onClick={() => handleSort('volume24h')}>
                            Volume (24h)
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Price Chart
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                    {sortedAssets.map((asset) => {
                        const chartData = asset.sparkline.map((price, index) => ({
                            time: new Date(Date.now() - (asset.sparkline.length - index) * 3600000).toISOString(),
                            value: price
                        }))

                        return (
                            <tr key={asset.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img className="h-8 w-8 rounded-full" src={asset.image} alt={asset.name} />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-white">{asset.name}</div>
                                            <div className="text-sm text-gray-400">{asset.symbol}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="text-sm text-white">${asset.price.toLocaleString()}</div>
                                    <div className="text-xs text-gray-400">
                                        Updated {formatTimeAgo(asset.lastUpdated)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${asset.change24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {asset.change24h >= 0 ? '↑' : '↓'} {Math.abs(asset.change24h).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                                    ${(asset.marketCap / 1e9).toFixed(2)}B
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                                    ${(asset.volume24h / 1e9).toFixed(2)}B
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="h-20 w-48">
                                        <PriceChart
                                            data={chartData}
                                            color={asset.change24h >= 0 ? '#10B981' : '#EF4444'}
                                            height={80}
                                        />
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {loading && assets.length > 0 && (
                <div className="flex items-center justify-center p-4 border-t border-gray-700">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-400">Updating data...</span>
                </div>
            )}
        </div>
    )
}

export default CryptoTable
