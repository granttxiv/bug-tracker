"use client";

import { useEffect, useState } from "react";
import { Check, EllipsisVertical, Pencil, Trash2, X } from "lucide-react";
import AddItemButton from "../../(components)/addItem/page";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type Ticket = {
	id: string;
	title: string;
	description: string;
	priority: string;
	status: string;
};
const statuses = ["new", "in_progress", "resolved"] as const;
const statusLabel: Record<string, string> = {
	new: "To do",
	in_progress: "In progress",
	resolved: "Resolved",
};
const statusColor: Record<string, string> = {
	new: "bg-sky-100 text-sky-700",
	in_progress: "bg-amber-100 text-amber-700",
	resolved: "bg-emerald-100 text-emerald-700",
};
const priorityColor: Record<string, string> = {
	critical: "bg-red-100 text-red-700",
	high: "bg-red-100 text-red-700",
	medium: "bg-amber-100 text-amber-700",
	low: "bg-emerald-100 text-emerald-700",
};

export default function Board() {
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("bug_tracker_token")
			: null;
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(Boolean(token));
	const [error, setError] = useState(
		token ? "" : "Please sign in to view your board.",
	);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editingTitle, setEditingTitle] = useState("");
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		if (!token) return;
		fetch("/api/tickets?limit=100", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (response) => {
				const payload = await response.json();
				if (!response.ok)
					throw new Error(payload.error ?? "Unable to load board");
				setTickets(payload.tickets ?? []);
			})
			.catch((requestError) =>
				setError(
					requestError instanceof Error
						? requestError.message
						: "Unable to load board",
				),
			)
			.finally(() => setIsLoading(false));
	}, [token]);

	const createTicket = async (
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
			throw new Error(payload.error ?? "Unable to create ticket");
		setTickets((current) => [...current, payload]);
	};
	const updateTicket = async (id: string, updates: Record<string, string>) => {
		if (!token) return;
		const response = await fetch(`/api/tickets/${id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(updates),
		});
		const payload = await response.json();
		if (!response.ok)
			throw new Error(payload.error ?? "Unable to update ticket");
		setTickets((current) =>
			current.map((ticket) =>
				ticket.id === id ? { ...ticket, ...payload } : ticket,
			),
		);
	};
	const startEditing = (ticket: Ticket) => {
		setEditingId(ticket.id);
		setEditingTitle(ticket.title);
	};
	const cancelEditing = () => {
		setEditingId(null);
		setEditingTitle("");
	};
	const saveEditing = async () => {
		const title = editingTitle.trim();
		if (!editingId || title.length < 5) return;
		await updateTicket(editingId, { title });
		cancelEditing();
	};
	const deleteTicket = async (id: string) => {
		if (!token) return;
		const response = await fetch(`/api/tickets/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) {
			const payload = await response.json();
			setError(payload.error ?? "Unable to delete ticket");
			return;
		}
		setTickets((current) => current.filter((ticket) => ticket.id !== id));
		setDeletingId(null);
	};

	if (isLoading)
		return (
			<main className="min-h-screen bg-slate-100 p-8">
				<LoadingSpinner label="Loading board" />
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
		<main className="min-h-screen flex-1 bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-7xl">
				<header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
							Product workspace
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">Board</h1>
						<p className="mt-2 text-sm text-slate-500">
							Live tickets grouped by workflow status.
						</p>
					</div>
					<AddItemButton onAdd={createTicket} />
				</header>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{statuses.map((status) => {
						const columnTickets = tickets.filter(
							(ticket) => ticket.status === status,
						);
						return (
							<section
								key={status}
								className="flex min-h-120 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3"
							>
								<div className="mb-3 flex items-center justify-between">
									<h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
										{statusLabel[status]}
									</h2>
									<span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-400">
										{columnTickets.length}
									</span>
								</div>
								<div className="flex flex-col gap-3">
									{columnTickets.map((ticket) => (
										<article
											key={ticket.id}
											className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
										>
											<div className="flex items-start justify-between gap-2">
												<div className="min-w-0">
													<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
														{ticket.id}
													</p>
													{editingId === ticket.id ? (
														<div className="mt-1 flex items-center gap-1">
															<input
																value={editingTitle}
																onChange={(event) =>
																	setEditingTitle(event.target.value)
																}
																autoFocus
																aria-label="Edit ticket title"
																className="min-w-0 flex-1 rounded-lg border border-blue-300 px-2 py-1 text-sm font-semibold text-slate-800 outline-none ring-2 ring-blue-100"
															/>
															<button
																type="button"
																onClick={saveEditing}
																aria-label="Save ticket title"
																className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
															>
																<Check size={15} />
															</button>
															<button
																type="button"
																onClick={cancelEditing}
																aria-label="Cancel ticket edit"
																className="rounded p-1 text-slate-400 hover:bg-slate-100"
															>
																<X size={15} />
															</button>
														</div>
													) : (
														<h3 className="mt-1 font-semibold text-slate-800">
															{ticket.title}
														</h3>
													)}
													<p className="mt-1 text-sm leading-5 text-slate-500">
														{ticket.description}
													</p>
												</div>
												<Popover>
													<PopoverTrigger
														render={
															<button
																className="text-slate-400 hover:text-slate-700"
																aria-label="Ticket actions"
															/>
														}
													>
														<EllipsisVertical size={18} />
													</PopoverTrigger>
													<PopoverContent className="w-32 bg-white p-1">
														<button
															type="button"
															onClick={() => {
																startEditing(ticket);
															}}
															className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100"
														>
															<Pencil size={14} />
															Edit
														</button>
														<button
															type="button"
															onClick={() => setDeletingId(ticket.id)}
															className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
														>
															<Trash2 size={14} />
															Delete
														</button>
														{deletingId === ticket.id && (
															<div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-700">
																<span>Delete this ticket?</span>
																<div className="flex gap-1">
																	<button
																		type="button"
																		onClick={() => deleteTicket(ticket.id)}
																		className="rounded bg-red-600 px-2 py-1 font-semibold text-white hover:bg-red-700"
																	>
																		Yes
																	</button>
																	<button
																		type="button"
																		onClick={() => setDeletingId(null)}
																		className="rounded bg-white px-2 py-1 font-semibold text-slate-600 hover:bg-slate-100"
																	>
																		No
																	</button>
																</div>
															</div>
														)}
													</PopoverContent>
												</Popover>
											</div>
											<div className="mt-4 flex items-center justify-between gap-2">
												<span
													className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityColor[ticket.priority] ?? "bg-slate-100 text-slate-700"}`}
												>
													{ticket.priority}
												</span>
												<select
													aria-label="Ticket status"
													value={ticket.status}
													onChange={(event) =>
														updateTicket(ticket.id, {
															status: event.target.value,
														})
													}
													className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${statusColor[ticket.status] ?? "bg-slate-100 text-slate-700"}`}
												>
													{statuses.map((option) => (
														<option key={option} value={option}>
															{statusLabel[option]}
														</option>
													))}
												</select>
											</div>
										</article>
									))}
								</div>
							</section>
						);
					})}
				</div>
			</div>
		</main>
	);
}
