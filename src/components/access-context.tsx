"use client";

import { UserAccess } from "@/enums/enums";
import React, { createContext, useContext, useMemo, useState } from "react";

type UserAccessContextValue = {
  userAccess: UserAccess;
  setUserAccess: React.Dispatch<React.SetStateAction<UserAccess>>;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
};

const UserAccessContext = createContext<UserAccessContextValue | null>(null);

export function UserAccessProvider({
  children,
  initialUserAccess,
  initialUserId,
}: {
  children: React.ReactNode;
  initialUserAccess: UserAccess;
  initialUserId?: string | null;
}) {
  const [userAccess, setUserAccess] = useState<UserAccess>(initialUserAccess);
  const [userId, setUserId] = useState<string | null>(initialUserId ?? null);

  const value = useMemo(
    () => ({
      userAccess,
      setUserAccess,
      userId,
      setUserId,
    }),
    [userAccess, userId],
  );

  return (
    <UserAccessContext.Provider value={value}>
      {children}
    </UserAccessContext.Provider>
  );
}

export function useUserAccess() {
  const ctx = useContext(UserAccessContext);
  if (!ctx) {
    throw new Error("useUserAccess must be used within a UserAccessProvider");
  }
  return ctx;
}
