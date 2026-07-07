import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import type { Db } from "mongodb";
import { connectToDatabase } from "@/db/mongoose";

const createAuth = (db: Db) =>
  betterAuth({
    database: mongodbAdapter(db),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
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

type AuthInstance = ReturnType<typeof createAuth>;

// Cache the in-flight promise (not just the result) so concurrent first
// requests don't each build their own instance.
let authPromise: Promise<AuthInstance> | null = null;

export const getAuth = (): Promise<AuthInstance> => {
  if (!authPromise) {
    authPromise = (async () => {
      const mongoose = await connectToDatabase();
      const db = mongoose.connection.db;
      if (!db) throw new Error("MongoDB connection not found");
      return createAuth(db as unknown as Db);
    })().catch((err) => {
      authPromise = null; // allow retry after a failed connection
      throw err;
    });
  }
  return authPromise;
};
