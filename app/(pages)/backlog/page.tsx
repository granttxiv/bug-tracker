"use client";

import { useEffect, useState } from "react";
import { Check, Circle, Pencil, X } from "lucide-react";
import AddItemButton from "../../(components)/addItem/page";
import LoadingSpinner from "@/components/ui/loading-spinner";

type Ticket = {
	id: string;
	title: string;
	type: string;
	priority: string;
	status: string;
	assignedUser?: { name?: string } | null;
};
const backlogStatuses = ["new", "acknowledged", "triaged"];
const priorityColor: Record<string, string> = {
	critical: "text-red-600",
	high: "text-red-600",
	medium: "text-amber-600",
	low: "text-emerald-600",
};

export default function Backlog() {
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("bug_tracker_token")
			: null;
	const [items, setItems] = useState<Ticket[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const [editingPriority, setEditingPriority] = useState("medium");
	const [isLoading, setIsLoading] = useState(Boolean(token));
	const [error, setError] = useState(
		token ? "" : "Please sign in to view your backlog.",
	);

	useEffect(() => {
		if (!token) return;
		fetch("/api/tickets?limit=100", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (response) => {
				const payload = await response.json();
				if (!response.ok)
					throw new Error(payload.error ?? "Unable to load backlog");
				setItems(
					(payload.tickets ?? []).filter((ticket: Ticket) =>
						backlogStatuses.includes(ticket.status),
					),
				);
			})
			.catch((requestError) =>
				setError(
					requestError instanceof Error
						? requestError.message
						: "Unable to load backlog",
				),
			)
			.finally(() => setIsLoading(false));
	}, [token]);

	const createIssue = async (
		title: string,
		description: string,
		priority: string,
		_status: string,
		assignedTo?: string,
	) => {
		if (!token) return;
		const response = await fetch("/api/tickets", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				title,
				description,
				type: "bug",
				priority: priority.toLowerCase(),
				assignedTo,
			}),
		});
		const payload = await response.json();
		if (!response.ok)
			throw new Error(payload.error ?? "Unable to create issue");
		setItems((current) => [...current, payload]);
	};
	const saveEdit = async () => {
		if (!token || !editingId || editingTitle.trim().length < 5) return;
		const response = await fetch(`/api/tickets/${editingId}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				title: editingTitle.trim(),
				priority: editingPriority,
			}),
		});
		const payload = await response.json();
		if (!response.ok) {
			setError(payload.error ?? "Unable to update issue");
			return;
		}
		setItems((current) =>
			current.map((item) =>
				item.id === editingId ? { ...item, ...payload } : item,
			),
		);
		setEditingId(null);
	};

	if (isLoading)
		return (
			<main className="min-h-screen bg-slate-100 p-8">
				<LoadingSpinner label="Loading backlog" />
			</main>
		);
	if (error)
		return (
			<main className="min-h-screen bg-slate-100 p-5 md:p-8">
				<p className="mx-auto max-w-7xl rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
					{error}
				</p>
			</main>
		);
	return (
		<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
							Product workspace
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">Backlog</h1>
						<p className="mt-2 text-sm text-slate-500">
							Live tickets waiting to be triaged.
						</p>
					</div>
					<AddItemButton mode="issue" onAdd={createIssue} />
				</header>
				<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
						<div>
							<h2 className="font-semibold">Backlog</h2>
							<p className="mt-1 text-sm text-slate-400">
								{items.length} issue{items.length === 1 ? "" : "s"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
						<span className="w-7" />
						<span className="flex-1">Issue</span>
						<span className="hidden w-24 sm:block">Type</span>
						<span className="w-20">Priority</span>
						<span className="w-12 text-right">Owner</span>
					</div>
					<div className="divide-y divide-slate-100">
						{items.length === 0 ? (
							<p className="px-5 py-10 text-center text-sm text-slate-500">
								No tickets are waiting in the backlog.
							</p>
						) : (
							items.map((item) => (
								<div
									key={item.id}
									className="group flex items-center gap-3 px-5 py-4 transition hover:bg-blue-50/40"
								>
									<Circle size={16} className="shrink-0 text-slate-300" />
									<div className="min-w-0 flex-1">
										{editingId === item.id ? (
											<div className="flex flex-wrap gap-2">
												<input
													value={editingTitle}
													onChange={(event) =>
														setEditingTitle(event.target.value)
													}
													autoFocus
													className="min-w-48 flex-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-sm outline-none"
												/>
												<select
													value={editingPriority}
													onChange={(event) =>
														setEditingPriority(event.target.value)
													}
													className="rounded-lg border border-slate-200 px-2 text-xs"
												>
													<option value="low">Low</option>
													<option value="medium">Medium</option>
													<option value="high">High</option>
													<option value="critical">Critical</option>
												</select>
												<button
													type="button"
													onClick={saveEdit}
													aria-label="Save issue"
												>
													<Check size={16} className="text-emerald-600" />
												</button>
												<button
													type="button"
													onClick={() => setEditingId(null)}
													aria-label="Cancel editing"
												>
													<X size={16} className="text-slate-400" />
												</button>
											</div>
										) : (
											<p className="truncate text-sm font-semibold text-slate-800">
												{item.title}
											</p>
										)}
										<p className="mt-1 text-xs font-medium text-slate-400">
											{item.id}
										</p>
									</div>
									<span className="hidden w-24 text-xs capitalize text-slate-500 sm:block">
										{item.type.replaceAll("_", " ")}
									</span>
									<span
										className={`w-20 text-xs font-semibold ${priorityColor[item.priority] ?? "text-slate-600"}`}
									>
										{item.priority}
									</span>
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
										{item.assignedUser?.name?.slice(0, 2).toUpperCase() ?? "--"}
									</span>
									{editingId !== item.id && (
										<button
											type="button"
											onClick={() => {
												setEditingId(item.id);
												setEditingTitle(item.title);
												setEditingPriority(item.priority);
											}}
											aria-label={`Edit ${item.id}`}
											className="rounded-lg p-2 text-slate-400 opacity-0 transition hover:bg-white hover:text-blue-700 group-hover:opacity-100 focus:opacity-100"
										>
											<Pencil size={15} />
										</button>
									)}
								</div>
							))
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
