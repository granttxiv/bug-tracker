"use client";
import NavHeader from "./header/page";
import AddItemButton from "./modules/addItem/page";

export default function Home() {
	return (
		<div className="flex flex-col flex-1 font-sans bg-gray-100 min-h-screen">
			<NavHeader className="bg-black w-full text-center" />
			<div className="flex justify-end p-4">
				<AddItemButton />
			</div>
		</div>
	);
}
