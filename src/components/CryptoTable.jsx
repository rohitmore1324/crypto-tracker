import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateAssets, setLoading, setError } from "../features/crypto/cryptoSlice";
import PriceChart from "./PriceChart";
import { useTheme } from "../context/ThemeContext";

const CryptoTable = () => {
    const dispatch = useDispatch();
    const { assets, loading, error } = useSelector((state) => state.crypto);
    const [selectedCrypto, setSelectedCrypto] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const { isDarkMode } = useTheme();

    const fetchData = useCallback(async () => {
        try {
            dispatch(setLoading(true));

            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h&locale=en",
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched data:', data);

            if (!Array.isArray(data)) {
                throw new Error('Invalid data format received');
            }

            const formattedData = data.map(coin => ({
                id: coin.id,
                name: coin.name,
                symbol: coin.symbol.toUpperCase(),
                price: coin.current_price,
                change24h: coin.price_change_percentage_24h,
                marketCap: coin.market_cap,
                volume24h: coin.total_volume,
                image: coin.image,
                sparkline: coin.sparkline_in_7d?.price || [],
                rank: coin.market_cap_rank
            }));

            console.log('Formatted data:', formattedData);
            dispatch(updateAssets(formattedData));
            dispatch(setError(null));
            setRetryCount(0);
        } catch (err) {
            console.error("Error fetching data:", err);
            dispatch(setError(err.message || "Failed to fetch data. Please try again."));

            if (retryCount < 3) {
                console.log(`Retrying... Attempt ${retryCount + 1} of 3`);
                setTimeout(() => {
                    setRetryCount(prev => prev + 1);
                    fetchData();
                }, 3000);
            }
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch, retryCount]);

    useEffect(() => {
        console.log('Initial data fetch...');
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRetry = () => {
        console.log('Manual retry triggered'); // Debug log
        setRetryCount(0);
        fetchData();
    };

    if (loading && assets.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {selectedCrypto && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                        {selectedCrypto.name} Price Chart
                    </h2>
                    <PriceChart symbol={selectedCrypto.symbol} isDarkMode={isDarkMode} />
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-16">
                                Rank
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-48">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                                Change (24h)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-40">
                                Market Cap
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {assets.map((asset) => (
                            <tr
                                key={asset.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                                onClick={() => setSelectedCrypto(asset)}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {asset.rank}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={asset.image}
                                                alt={asset.name}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                        <div className="ml-4 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {asset.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {asset.symbol}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <div className="truncate">
                                        ${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </td>
                                <td
                                    className={`px-6 py-4 whitespace-nowrap text-sm ${asset.change24h >= 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                        }`}
                                >
                                    <div className="truncate">
                                        {asset.change24h.toFixed(2)}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    <div className="truncate">
                                        ${(asset.marketCap / 1e9).toFixed(2)}B
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {loading && assets.length > 0 && (
                <div className="flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Updating data...</span>
                </div>
            )}
        </div>
    );
};

export default CryptoTable; 