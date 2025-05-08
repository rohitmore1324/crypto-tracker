import { useEffect, useRef, useState } from "react";

const PriceChart = ({ symbol, isDarkMode }) => {
    const containerRef = useRef(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    const initializeChart = () => {
        if (window.TradingView) {
            try {
                const tradingViewSymbol = `BINANCE:${symbol}USDT`;

                new window.TradingView.widget({
                    container_id: containerRef.current.id,
                    symbol: tradingViewSymbol,
                    interval: "D",
                    timezone: "Etc/UTC",
                    theme: isDarkMode ? "dark" : "light",
                    style: "1",
                    locale: "en",
                    toolbar_bg: isDarkMode ? "#1f2937" : "#f1f3f6",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    save_image: false,
                    height: 500,
                    width: "100%",
                    hide_side_toolbar: false,
                    studies: ["RSI@tv-basicstudies", "MASimple@tv-basicstudies"],
                    show_popup_button: true,
                    popup_width: "1000",
                    popup_height: "650",
                    symbol_search: true,
                    autosize: true,
                    withdateranges: true,
                    hide_volume: false,
                    support_host: "https://www.tradingview.com",
                    overrides: {
                        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
                        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
                        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
                        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
                        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
                        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350"
                    }
                });
                setError(null);
            } catch (err) {
                console.error("Error initializing TradingView widget:", err);
                setError("Failed to load price chart. Please try again.");
            }
        } else {
            setError("TradingView widget failed to load. Please try again.");
        }
    };

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;

        script.onload = () => {
            initializeChart();
        };

        script.onerror = () => {
            setError("Failed to load TradingView script. Please check your internet connection.");
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, [symbol, isDarkMode, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError(null);
    };

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                <p>{error}</p>
                <button
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="relative">
            <div id={`tradingview_${symbol}`} ref={containerRef} />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50" style={{ display: "none" }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        </div>
    );
};

export default PriceChart; 