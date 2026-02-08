"use client";

import { CommunityMemberStatus, UserAccess } from "@/enums/enums";
import React, { createContext, useContext, useMemo, useState } from "react";

type UserAccessContextValue = {
  userAccess: UserAccess;
  setUserAccess: React.Dispatch<React.SetStateAction<UserAccess>>;
  userStatus: CommunityMemberStatus | null;
  setUserStatus: React.Dispatch<React.SetStateAction<CommunityMemberStatus>>;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
  isCommunityPrivate: boolean;
};

const UserAccessContext = createContext<UserAccessContextValue | null>(null);

export function UserAccessProvider({
  children,
  initialUserAccess,
  initialUserStatus,
  initialUserId,
  initialIsCommunityPrivate = false,
}: {
  children: React.ReactNode;
  initialUserAccess: UserAccess;
  initialUserStatus?: CommunityMemberStatus | null;
  initialUserId?: string | null;
  initialIsCommunityPrivate?: boolean;
}) {
  const [userAccess, setUserAccess] = useState<UserAccess>(initialUserAccess);
  const [userStatus, setUserStatus] = useState<CommunityMemberStatus>(initialUserStatus ?? CommunityMemberStatus.ACTIVE);
  const [userId, setUserId] = useState<string | null>(initialUserId ?? null);
  const [isCommunityPrivate] = useState(initialIsCommunityPrivate);

  const value = useMemo(
    () => ({
      userAccess,
      setUserAccess,
      userStatus,
      setUserStatus,
      userId,
      setUserId,
      isCommunityPrivate,
    }),
    [userAccess, userStatus, userId, isCommunityPrivate],
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
