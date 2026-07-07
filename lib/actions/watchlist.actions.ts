"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Watchlist } from "@/db/models/watchlist.model";
import { connectToDatabase } from "@/db/mongoose";
import { getSessionUser } from "@/lib/session";

type ActionResult = { success: true } | { success: false; error: string };

const symbolSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9.\-^:]{1,15}$/, "Invalid stock symbol");

const addSchema = z.object({
  symbol: symbolSchema,
  company: z.string().trim().min(1).max(120),
});

export async function addToWatchlist(
  symbol: string,
  company: string,
): Promise<ActionResult> {
  const parsed = addSchema.safeParse({ symbol, company });
  if (!parsed.success) return { success: false, error: "Invalid stock" };

  const user = await getSessionUser();
  if (!user) return { success: false, error: "Please sign in again" };

  try {
    await connectToDatabase();
    // Upsert keeps this idempotent (double-clicks, multiple tabs).
    await Watchlist.updateOne(
      { userId: user.id, symbol: parsed.data.symbol },
      {
        $setOnInsert: {
          company: parsed.data.company,
          addedAt: new Date(),
        },
      },
      { upsert: true },
    );
    revalidatePath("/watchlist");
    return { success: true };
  } catch (e) {
    console.error("addToWatchlist failed:", (e as Error).message);
    return { success: false, error: "Could not update your watchlist" };
  }
}

export async function removeFromWatchlist(
  symbol: string,
): Promise<ActionResult> {
  const parsed = symbolSchema.safeParse(symbol);
  if (!parsed.success) return { success: false, error: "Invalid stock" };

  const user = await getSessionUser();
  if (!user) return { success: false, error: "Please sign in again" };

  try {
    await connectToDatabase();
    await Watchlist.deleteOne({ userId: user.id, symbol: parsed.data });
    revalidatePath("/watchlist");
    return { success: true };
  } catch (e) {
    console.error("removeFromWatchlist failed:", (e as Error).message);
    return { success: false, error: "Could not update your watchlist" };
  }
}
