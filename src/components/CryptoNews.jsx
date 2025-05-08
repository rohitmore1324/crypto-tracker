import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const CryptoNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { isDarkMode } = useTheme();

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                'https://min-api.cryptocompare.com/data/v2/news/?lang=EN',
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            setNews(data.Data.slice(0, 5)); // Get top 5 news articles
            setError(null);
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Failed to load news. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Update news every 5 minutes
        const interval = setInterval(fetchNews, 300000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchNews}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Latest News</h2>
            <div className="space-y-4">
                {news.map((item) => (
                    <div
                        key={item.id}
                        className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-4 last:pb-0"
                    >
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                        >
                            <div className="flex items-start space-x-3">
                                {item.imageurl && (
                                    <img
                                        src={item.imageurl}
                                        alt={item.title}
                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/64';
                                        }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {item.body}
                                    </p>
                                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        {new Date(item.published_on * 1000).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CryptoNews; 