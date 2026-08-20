"use client";

import Link from "next/link";
import WatchlistButton from "./WatchlistButton";
import { WATCHLIST_TABLE_HEADER } from "@/lib/constants";
import { removeFromWatchlist } from "@/lib/actions/watchlist.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => {
    const router = useRouter();

    const handleWatchlistChange = async (symbol: string, isAdded: boolean) => {
        if (!isAdded) {
            try {
                const result = await removeFromWatchlist(symbol);
                if (result.success) {
                    toast.success("Stock removed from watchlist");
                    router.refresh();
                } else {
                    toast.error(result.error || "Failed to remove from watchlist");
                }
            } catch (error) {
                toast.error("Failed to remove from watchlist");
            }
        }
    };

    return (
        <div className="watchlist-table">
            <table className="w-full">
                <thead>
                <tr className="table-header-row">
                    {WATCHLIST_TABLE_HEADER.map((header) => (
                        <th
                            key={header}
                            className="table-header px-4 py-3 text-left text-sm font-medium"
                        >
                            {header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {watchlist.map((stock) => (
                    <tr key={stock.symbol} className="table-row">
                        <td className="table-cell px-4 py-4">
                            <Link
                                href={`/stocks/${stock.symbol}`}
                                className="hover:text-yellow-500 transition-colors"
                            >
                                {stock.company}
                            </Link>
                        </td>
                        <td className="table-cell px-4 py-4">
                            <Link
                                href={`/stocks/${stock.symbol}`}
                                className="hover:text-yellow-500 transition-colors"
                            >
                                {stock.symbol}
                            </Link>
                        </td>
                        <td className="table-cell px-4 py-4">{stock.priceFormatted}</td>
                        <td
                            className={`table-cell px-4 py-4 ${
                                stock.changePercent && stock.changePercent > 0
                                    ? "text-green-500"
                                    : stock.changePercent && stock.changePercent < 0
                                        ? "text-red-500"
                                        : "text-gray-400"
                            }`}
                        >
                            {stock.changeFormatted}
                        </td>
                        <td className="table-cell px-4 py-4">{stock.marketCap}</td>
                        <td className="table-cell px-4 py-4">{stock.peRatio}</td>
                        <td className="table-cell px-4 py-4">
                            <button className="add-alert">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                </svg>
                                Add Alert
                            </button>
                        </td>
                        <td className="table-cell px-4 py-4">
                            <WatchlistButton
                                symbol={stock.symbol}
                                company={stock.company}
                                isInWatchlist={true}
                                type="icon"
                                onWatchlistChange={handleWatchlistChange}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default WatchlistTable;