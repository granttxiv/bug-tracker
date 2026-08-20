"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

const NavHeader = ({ className }: { className: string }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<>
			<nav className={`p-4 ${className}`}>
				<div className="container mx-auto flex items-center justify-between px-4 w-full">
					<Link href="/" className="text-white font-bold text-lg">
						Bug Tracker
					</Link>
					<nav className="flex-nowrap items-center space-x-4 whitespace-nowrap hidden sm:flex">
						<Link href="/backlog" className="text-white hover:text-gray-300">
							Backlog
						</Link>
						<Link href="/board" className="text-white hover:text-gray-300">
							Board
						</Link>
						<Link href="/issues" className="text-white hover:text-gray-300">
							Issues
						</Link>
						<Link href="/dashboard" className="text-white hover:text-gray-300">
							Dashboard
						</Link>
						<Link href="/settings" className="text-white hover:text-gray-300">
							Settings
						</Link>
						<div className="flex items-center space-x-2">
							<Image
								src="/images.png"
								alt="Profile"
								width={32}
								height={32}
								className="rounded-full cursor-pointer"
								onClick={() => setIsOpen((prev) => !prev)}
							/>
						</div>
						{/* {isOpen && (
							<div className="absolute right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
								<Link
									href="/profile"
									className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
								>
									Profile
								</Link>
								<Link
									href="/logout"
									className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
								>
									Logout
								</Link>
							</div>
						)} */}
					</nav>
					<div className="sm:hidden">
						<button
							onClick={() => setIsOpen((prev) => !prev)}
							className="text-white focus:outline-none"
						>
							<Menu size={24} />
						</button>
					</div>

				</div>
			</nav>
		</>
	);
};

export default NavHeader;
