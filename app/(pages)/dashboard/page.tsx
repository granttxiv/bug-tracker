"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/loading-spinner";

type Ticket = {
	id: string;
	title: string;
	priority: string;
	status: string;
	assignedUser?: { name?: string } | null;
	createdAt: string;
	updatedAt: string;
};

const statusLabel = (status: string) =>
	status === "in_progress"
		? "In progress"
		: status.charAt(0).toUpperCase() + status.slice(1);
const priorityClasses: Record<string, string> = {
	critical: "bg-red-100 text-red-700",
	high: "bg-red-100 text-red-700",
	medium: "bg-amber-100 text-amber-700",
	low: "bg-emerald-100 text-emerald-700",
};

export default function Dashboard() {
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("bug_tracker_token")
			: null;
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [isLoading, setIsLoading] = useState(Boolean(token));
	const [error, setError] = useState(
		token ? "" : "Please sign in to view your dashboard.",
	);

	useEffect(() => {
		if (!token) return;
		fetch("/api/tickets?limit=100", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (response) => {
				const payload = await response.json();
				if (!response.ok)
					throw new Error(payload.error ?? "Unable to load dashboard");
				setTickets(payload.tickets ?? []);
			})
			.catch((requestError) =>
				setError(
					requestError instanceof Error
						? requestError.message
						: "Unable to load dashboard",
				),
			)
			.finally(() => setIsLoading(false));
	}, [token]);

	const counts = {
		total: tickets.length,
		open: tickets.filter(
			(ticket) => !["resolved", "closed"].includes(ticket.status),
		).length,
		inProgress: tickets.filter((ticket) => ticket.status === "in_progress")
			.length,
		resolved: tickets.filter((ticket) =>
			["resolved", "closed"].includes(ticket.status),
		).length,
	};
	const recentTickets = [...tickets]
		.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
		.slice(0, 5);
	const days = Array.from({ length: 7 }, (_, index) => {
		const date = new Date();
		date.setDate(date.getDate() - (6 - index));
		return date;
	});
	const activityByDay = days.map(
		(day) =>
			tickets.filter(
				(ticket) =>
					new Date(ticket.updatedAt).toDateString() === day.toDateString(),
			).length,
	);
	const maxActivity = Math.max(...activityByDay, 1);

	const downloadReport = () => {
		const csv = [
			"Metric,Value",
			`Total issues,${counts.total}`,
			`Open,${counts.open}`,
			`In progress,${counts.inProgress}`,
			`Resolved,${counts.resolved}`,
		].join("\n");
		const link = document.createElement("a");
		link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
		link.download = "bug-tracker-dashboard.csv";
		link.click();
		URL.revokeObjectURL(link.href);
	};

	if (isLoading)
		return (
			<main className="min-h-screen bg-slate-100 p-8 text-slate-900">
				<div className="mx-auto max-w-7xl">
					<LoadingSpinner label="Loading dashboard" />
				</div>
			</main>
		);
	if (error)
		return (
			<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
				<p className="mx-auto max-w-7xl rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
					{error}
				</p>
			</main>
		);

	return (
		<main className="min-h-screen bg-slate-100 p-6 text-slate-900">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
							Product dashboard
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">
							Workspace overview
						</h1>
						<p className="mt-2 text-sm text-slate-500">
							Live ticket activity from your workspace.
						</p>
					</div>
					<button
						type="button"
						onClick={downloadReport}
						className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
					>
						Download report
					</button>
				</header>
				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: "Total issues", value: counts.total },
						{ label: "Open", value: counts.open },
						{ label: "In progress", value: counts.inProgress },
						{ label: "Resolved", value: counts.resolved },
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<p className="text-sm text-slate-500">{stat.label}</p>
							<h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
						</div>
					))}
				</section>
				<section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-500">Ticket activity</p>
						<h3 className="mt-2 text-xl font-semibold">Last seven days</h3>
						<div className="mt-6 flex h-52 items-end justify-between gap-3">
							{activityByDay.map((value, index) => (
								<div
									key={days[index].toISOString()}
									className="flex flex-1 flex-col items-center gap-3"
								>
									<div className="flex h-40 w-full items-end justify-center rounded-t-2xl bg-slate-100 p-1">
										<div
											className="w-full rounded-t-xl bg-linear-to-t from-blue-700 to-cyan-400"
											style={{
												height: `${Math.max((value / maxActivity) * 100, value ? 8 : 0)}%`,
											}}
										/>
									</div>
									<span className="text-xs font-medium text-slate-500">
										{days[index].toLocaleDateString(undefined, {
											weekday: "short",
										})}
									</span>
								</div>
							))}
						</div>
					</div>
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-500">Issue split</p>
						<h3 className="mt-2 text-xl font-semibold">Status overview</h3>
						<div className="mt-6 space-y-5">
							{[
								["Open", counts.open, "bg-blue-600"],
								["In progress", counts.inProgress, "bg-amber-500"],
								["Resolved", counts.resolved, "bg-emerald-500"],
							].map(([label, value, color]) => (
								<div key={label as string}>
									<div className="mb-1 flex items-center justify-between text-sm">
										<span className="text-slate-600">{label}</span>
										<span className="font-semibold">
											{counts.total
												? Math.round((Number(value) / counts.total) * 100)
												: 0}
											%
										</span>
									</div>
									<div className="h-2.5 rounded-full bg-slate-100">
										<div
											className={`h-2.5 rounded-full ${color}`}
											style={{
												width: `${counts.total ? (Number(value) / counts.total) * 100 : 0}%`,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-sm text-slate-500">Latest tickets</p>
							<h3 className="text-xl font-semibold">Recent issues</h3>
						</div>
						<Link
							href="/issues"
							className="text-sm font-medium text-blue-700 hover:text-blue-600"
						>
							View all
						</Link>
					</div>
					{recentTickets.length === 0 ? (
						<p className="py-8 text-sm text-slate-500">
							No tickets have been created yet.
						</p>
					) : (
						<div className="overflow-hidden rounded-2xl border border-slate-200">
							<table className="min-w-full divide-y divide-slate-200 text-left">
								<thead className="bg-slate-50 text-sm text-slate-500">
									<tr>
										<th className="px-4 py-3 font-medium">Issue</th>
										<th className="px-4 py-3 font-medium">Priority</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium">Owner</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 bg-white text-sm">
									{recentTickets.map((ticket) => (
										<tr key={ticket.id} className="hover:bg-slate-50">
											<td className="px-4 py-3 font-medium text-slate-800">
												<Link
													href={`/issues/${ticket.id}`}
													className="hover:text-blue-700"
												>
													{ticket.title}
												</Link>
											</td>
											<td className="px-4 py-3">
												<span
													className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[ticket.priority] ?? "bg-slate-100 text-slate-700"}`}
												>
													{ticket.priority}
												</span>
											</td>
											<td className="px-4 py-3 text-slate-600">
												{statusLabel(ticket.status)}
											</td>
											<td className="px-4 py-3 text-slate-600">
												{ticket.assignedUser?.name ?? "Unassigned"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</main>
	);
}
