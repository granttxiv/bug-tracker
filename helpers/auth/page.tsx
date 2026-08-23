"use client";
import NavHeader from "@/app/layouts/header/page";
import { usePathname } from "next/navigation";

const AuthLogic = () => {
	const pathname = usePathname();

	return (
		<>
			{pathname !== "/login" && (
				<NavHeader className="bg-black w-full text-center" />
			)}
		</>
	);
};

export default AuthLogic;
