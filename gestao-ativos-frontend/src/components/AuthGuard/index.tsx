"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // App Router usa next/navigation
import { Spinner } from "flowbite-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token && pathname !== "/login") {
      router.push("/login");
    } else {
      setIsLoggedIn(true);
    }
  }, [router, pathname]);

  if (!isLoggedIn)
    return (
      <div className="flex max-h-screen min-h-screen max-w-screen min-w-screen items-center justify-center">
        <Spinner className="h-24 w-24" />
      </div>
    );

  return <>{children}</>;
}
