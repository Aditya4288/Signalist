"use server";

import { Watchlist } from "@/database/models/watchlist.model";
import { connectToDatabase } from "@/database/mongoose";
import { auth } from "../better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addToWatchlist(symbol: string, company: string) {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Check if already in watchlist
        const existing = await Watchlist.findOne({
            userId,
            symbol: symbol.toUpperCase(),
        });
        if (existing) {
            return { success: false, error: "Stock already in watchlist" };
        }

        // Add to watchlist
        await Watchlist.create({
            userId,
            symbol: symbol.toUpperCase(),
            company,
            addedAt: new Date(),
        });

        revalidatePath("/watchlist");
        revalidatePath(`/stocks/${symbol}`);

        return { success: true };
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        return { success: false, error: "Failed to add to watchlist" };
    }
}

export async function removeFromWatchlist(symbol: string) {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });

        revalidatePath("/watchlist");
        revalidatePath(`/stocks/${symbol}`);

        return { success: true };
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        return { success: false, error: "Failed to remove from watchlist" };
    }
}

export async function getWatchlist() {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return [];
        }

        const userId = session.user.id;

        const watchlist = await Watchlist.find({ userId })
            .sort({ addedAt: -1 })
            .lean();

        return watchlist.map((item) => ({
            userId: item.userId,
            symbol: item.symbol,
            company: item.company,
            addedAt: item.addedAt,
        }));
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        return [];
    }
}

export async function isInWatchlist(symbol: string): Promise<boolean> {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({ headers: await headers() });
        if (!session?.user) {
            return false;
        }

        const userId = session.user.id;

        const exists = await Watchlist.exists({
            userId,
            symbol: symbol.toUpperCase(),
        });

        return !!exists;
    } catch (error) {
        console.error("Error checking watchlist:", error);
        return false;
    }
}

export async function getWatchlistWithData(): Promise<StockWithData[]> {
    try {
        const watchlist = await getWatchlist();

        if (!watchlist || watchlist.length === 0) {
            return [];
        }

        // Fetch stock data for each watchlist item
        const FINNHUB_API_KEY =
            process.env.FINNHUB_API_KEY ?? process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

        const stocksWithData = await Promise.all(
            watchlist.map(async (item) => {
                try {
                    // Fetch quote data
                    const quoteRes = await fetch(
                        `https://finnhub.io/api/v1/quote?symbol=${item.symbol}&token=${FINNHUB_API_KEY}`,
                        { next: { revalidate: 60 } }
                    );
                    const quote: QuoteData = await quoteRes.json();

                    // Fetch profile data for market cap
                    const profileRes = await fetch(
                        `https://finnhub.io/api/v1/stock/profile2?symbol=${item.symbol}&token=${FINNHUB_API_KEY}`,
                        { next: { revalidate: 3600 } }
                    );
                    const profile: ProfileData = await profileRes.json();

                    // Fetch financials for P/E ratio
                    const financialsRes = await fetch(
                        `https://finnhub.io/api/v1/stock/metric?symbol=${item.symbol}&metric=all&token=${FINNHUB_API_KEY}`,
                        { next: { revalidate: 3600 } }
                    );
                    const financials: FinancialsData = await financialsRes.json();

                    const currentPrice = quote.c || 0;
                    const changePercent = quote.dp || 0;
                    const marketCap = profile.marketCapitalization || 0;
                    const peRatio = financials.metric?.peNormalizedAnnual || 0;

                    return {
                        ...item,
                        currentPrice,
                        changePercent,
                        priceFormatted: currentPrice
                            ? `$${currentPrice.toFixed(2)}`
                            : "N/A",
                        changeFormatted: changePercent
                            ? `${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%`
                            : "N/A",
                        marketCap: marketCap ? formatMarketCap(marketCap) : "N/A",
                        peRatio: peRatio ? peRatio.toFixed(2) : "N/A",
                    };
                } catch (error) {
                    console.error(`Error fetching data for ${item.symbol}:`, error);
                    return {
                        ...item,
                        currentPrice: 0,
                        changePercent: 0,
                        priceFormatted: "N/A",
                        changeFormatted: "N/A",
                        marketCap: "N/A",
                        peRatio: "N/A",
                    };
                }
            })
        );

        return stocksWithData;
    } catch (error) {
        console.error("Error fetching watchlist with data:", error);
        return [];
    }
}

function formatMarketCap(marketCapBillions: number): string {
    if (marketCapBillions >= 1000) {
        return `$${(marketCapBillions / 1000).toFixed(2)}T`;
    }
    return `$${marketCapBillions.toFixed(2)}B`;
}

export async function getWatchlistSymbolsByEmail(
    email: string
): Promise<string[]> {
    if (!email) return [];
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;

        if (!db) throw new Error("MongoDB connection not found");

        // Better Auth stores users in the "user" collection
        const user = await db
            .collection("user")
            .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) return [];

        const userId = (user.id as string) || String(user._id || "");
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error("getWatchlistSymbolsByEmail error:", err);
        return [];
    }
}