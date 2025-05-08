import CryptoTable from "./components/CryptoTable";
import ThemeProvider from "./context/ThemeContext";
import ThemeToggle from "./components/ThemeToggle";
import CryptoNews from "./components/CryptoNews";

function App() {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Crypto Tracker
                        </h1>
                        <ThemeToggle />
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3">
                            <CryptoTable />
                        </div>
                        <div className="lg:col-span-1">
                            <CryptoNews />
                        </div>
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default App; 