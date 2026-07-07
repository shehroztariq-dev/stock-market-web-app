import { cache } from "react";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

/** Current signed-in user (deduplicated per request), or null. */
export const getSessionUser = cache(async (): Promise<User | null> => {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return null;
    const { id, name, email } = session.user;
    return { id, name, email };
  } catch (e) {
    console.error("getSessionUser failed:", (e as Error).message);
    return null;
  }
});
