import { getWatchlistWithData } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import SearchCommand from "@/components/SearchCommand";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import WatchlistTable from "@/components/WatchlistTable";
import WatchlistNews from "@/components/WatchlistNews";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
    const watchlist = await getWatchlistWithData();
    const initialStocks = await searchStocks();

    // Get news for watchlist symbols
    const symbols = watchlist.map((item) => item.symbol);
    const news = symbols.length > 0 ? await getNews(symbols) : await getNews();

    if (!watchlist || watchlist.length === 0) {
        return (
            <div className="watchlist-empty-container">
                <div className="watchlist-empty">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="watchlist-star"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                        />
                    </svg>
                    <h2 className="empty-title">Your Watchlist is Empty</h2>
                    <p className="empty-description">
                        Start tracking your favorite stocks by adding them to your
                        watchlist. Search for stocks and click the star icon to add them.
                    </p>
                    <SearchCommand
                        renderAs="button"
                        label="Add Stock"
                        initialStocks={initialStocks}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="watchlist-container">
            <div className="watchlist">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="watchlist-title">My Watchlist</h1>
                    <SearchCommand
                        renderAs="button"
                        label="Add Stock"
                        initialStocks={initialStocks}
                    />
                </div>
                <WatchlistTable watchlist={watchlist} />
            </div>

            <div className="watchlist-alerts">
                <h2 className="watchlist-title">Related News</h2>
                <WatchlistNews news={news} />
            </div>
        </div>
    );
}