"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Plus, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
	{ href: "/dashboard", label: "Overview" },
	{ href: "/issues", label: "Issues" },
	{ href: "/board", label: "Board" },
	{ href: "/backlog", label: "Backlog" },
];

const getInitials = (name?: string) => {
	const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const NavHeader = ({ className = "" }: { className?: string }) => {
	const pathname = usePathname();
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [profileInitials, setProfileInitials] = useState("?");
	const [user, setUser] = useState("");

	useEffect(() => {
		const readProfile = () => {
			try {
				const storedUser = localStorage.getItem("bug_tracker_user") as string;
				setUser(storedUser);
				const parsedUser = storedUser
					? (JSON.parse(storedUser) as { name?: string })
					: null;
				setProfileInitials(getInitials(parsedUser?.name));
			} catch {
				setUser("");
				setProfileInitials("?");
			}
		};
		readProfile();
		window.addEventListener("storage", readProfile);
		return () => window.removeEventListener("storage", readProfile);
	}, []);

	const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const query = search.trim();
		if (query) router.push(`/issues?search=${encodeURIComponent(query)}`);
	};

	return (
		<header className={`border-b border-slate-200 bg-white ${className}`}>
			<nav
				className="mx-auto flex min-h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6"
				aria-label="Primary navigation"
			>
				<Link
					href="/"
					className="flex shrink-0 items-center gap-2 text-slate-900"
				>
					<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-800 text-sm font-black text-white">
						B
					</span>
					<span className="hidden text-sm font-bold tracking-tight sm:inline">
						TrackMe
					</span>
				</Link>

				<div className="hidden h-8 w-px bg-slate-200 md:block" />
				<form
					onSubmit={submitSearch}
					className="relative hidden max-w-xs flex-1 md:block"
				>
					<Search
						size={16}
						className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
					/>
					<input
						aria-label="Search"
						placeholder="Search issues"
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
					/>
				</form>

				<div className="hidden items-center gap-1 lg:flex">
					{user
						? navigation.map((item) => {
								const isActive =
									pathname === item.href ||
									pathname.startsWith(`${item.href}/`);
								return (
									<Link
										key={item.href}
										href={item.href}
										className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
									>
										{item.label}
									</Link>
								);
							})
						: null}
				</div>

				<div className="ml-auto flex items-center gap-2">
					{user ? (
						<>
							<Link
								href="/issues"
								className="hidden items-center gap-1.5 rounded-lg bg-blue-800 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:inline-flex"
							>
								<Plus size={16} />
								Create
							</Link>
							<Link
								href="/settings"
								aria-label="Open settings"
								className={`flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 ring-2 ring-white transition hover:bg-slate-200 ${pathname === "/settings" ? "ring-blue-200" : ""}`}
							>
								{profileInitials}
							</Link>
						</>
					) : null}
					<button
						type="button"
						onClick={() => setIsOpen((value) => !value)}
						aria-label={
							isOpen ? "Close navigation menu" : "Open navigation menu"
						}
						className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
					>
						{isOpen ? <X size={20} /> : <Menu size={20} />}
					</button>
				</div>
			</nav>

			{isOpen && (
				<div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
					<form onSubmit={submitSearch} className="relative mb-3">
						<Search
							size={16}
							className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
						/>
						<input
							aria-label="Search"
							placeholder="Search issues"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 text-sm outline-none focus:border-blue-500"
						/>
					</form>
					<div className="grid gap-1">
						{user
							? navigation.map((item) => (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`rounded-lg px-3 py-2 text-sm font-medium ${pathname === item.href ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
									>
										{item.label}
									</Link>
								))
							: " "}
					</div>
				</div>
			)}
		</header>
	);
};

export default NavHeader;
