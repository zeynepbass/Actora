"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/features/auth/session";
import { fetchUser } from "./api";

export const userQueryKey = (id) => ["user", id];

/** Fresh profile data for the signed-in account. */
export function useCurrentUser() {
  const userId = useSession()?.kullanici?.id;
  return useQuery({
    queryKey: userQueryKey(userId),
    queryFn: () => fetchUser(userId),
    enabled: Boolean(userId),
  });
}
