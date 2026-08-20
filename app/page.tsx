"use client";
import NavHeader from "./header/page";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 items-center font-sans bg-gray-100 min-h-screen">
			<NavHeader className="bg-black" />
		</div>
	);
}
