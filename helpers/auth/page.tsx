"use client";
import NavHeader from "@/app/layouts/header/page";
import { usePathname } from "next/navigation";

const AuthLogic = () => {
	const pathname = usePathname();

	return (
		<>
			{pathname !== "/login" && pathname !== "/register" && (
				<NavHeader className="w-full" />
			)}
		</>
	);
};

export default AuthLogic;
