import { connectToDatabase } from "@/database/mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";

export const getAuth = async () => {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;

    if (!db) {
        throw new Error("MongoDB connection not found");
    }

    const secret = process.env.BETTER_AUTH_SECRET;
    const baseURL = process.env.BETTER_AUTH_URL;

    if (!secret) {
        throw new Error("BETTER_AUTH_SECRET is not defined");
    }

    if (!baseURL) {
        throw new Error("BETTER_AUTH_URL is not defined");
    }

    return betterAuth({
        database: mongodbAdapter(db),
        secret,
        baseURL,
        emailAndPassword: {
            enabled: true,
            disableSignUp: false,
            requireEmailVerification: false,
            minPasswordLength: 8,
            maxPasswordLength: 128,
            autoSignIn: true,
        },
        plugins: [nextCookies()],
    });
};

export const auth = await getAuth();