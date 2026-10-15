
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
    const pathname = usePathname();

    // Pages where navbar should be hidden
    const hideNavbarPages = [
        "/student/login",
        "/student/register",
        "/admin/login",
    ];

    if (hideNavbarPages.includes(pathname)) {
        return null;
    }

    return <Navbar />;
}
