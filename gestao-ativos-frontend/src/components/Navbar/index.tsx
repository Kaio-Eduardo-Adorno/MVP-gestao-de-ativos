"use client";

import { clearAuth } from "@/utils/auth.utils";
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  Dropdown,
  Avatar,
  DropdownItem,
  DropdownDivider,
  DropdownHeader,
} from "flowbite-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userNome, setUserNome] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const nome = localStorage.getItem("userNome");
    const email = localStorage.getItem("userEmail");
    if (email && nome) {
      setUserNome(nome);
      setUserEmail(email);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();

    router.push("/login");
  };

  return (
    <Navbar fluid rounded className="border-b dark:border-gray-800">
      <NavbarBrand as={Link} href="/">
        <FaChartLine className="mr-2 h-6 w-6 text-blue-600 dark:text-blue-400" />
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Gestão de ativos
        </span>
      </NavbarBrand>

      <div className="flex gap-2 md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={<Avatar alt="Menu do usuário" rounded />}
        >
          <DropdownHeader>
            <span className="block text-sm text-gray-900 dark:text-white">
              Logado como
            </span>
            {userNome && (
              <span className="block truncate text-sm font-bold text-gray-900 dark:text-white">
                {userNome}
              </span>
            )}
            {userEmail && (
              <span className="block truncate text-xs text-gray-900 dark:text-white">
                {userEmail}
              </span>
            )}
          </DropdownHeader>

          <DropdownDivider />

          <DropdownItem
            onClick={handleLogout}
            className="font-medium text-red-600 dark:text-red-500"
          >
            Logout
          </DropdownItem>
        </Dropdown>

        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink as={Link} href="/" active={pathname === "/"}>
          Carteira
        </NavbarLink>
        <NavbarLink as={Link} href="/ativos" active={pathname === "/ativos"}>
          Mercado
        </NavbarLink>
        <NavbarLink as={Link} href="/ordens" active={pathname === "/ordens"}>
          Minhas Ordens
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
