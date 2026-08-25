"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Filter, Search } from "lucide-react";
import AddItemButton from "../../(components)/addItem/page";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { apiClient } from "@/app/api/requestProcessor";

type Issue = {
	id: string;
	title: string;
	project: string;
	priority: "High" | "Medium" | "Low";
	status: "Open" | "In progress" | "Review" | "Closed";
	assignee: string;
	updatedAt: string;
	description: string;
};

type ApiTicket = {
	id: string;
	title: string;
	description: string;
	type: string;
	priority: string;
	status: string;
	assignedUser?: { name?: string } | null;
	updatedAt: string;
};

const normalizeTicket = (ticket: ApiTicket): Issue => ({
	id: ticket.id,
	title: ticket.title,
	project: ticket.type.replaceAll("_", " "),
	priority:
		ticket.priority === "critical"
			? "High"
			: ((ticket.priority.charAt(0).toUpperCase() +
					ticket.priority.slice(1)) as Issue["priority"]),
	status:
		ticket.status === "in_progress"
			? "In progress"
			: ticket.status === "new"
				? "Open"
				: ticket.status === "resolved" || ticket.status === "closed"
					? "Closed"
					: "Review",
	assignee: ticket.assignedUser?.name ?? "Unassigned",
	updatedAt: new Date(ticket.updatedAt).toLocaleString(),
	description: ticket.description,
});

const filters = ["All", "Open", "In progress", "Review", "Closed"] as const;

const priorityClasses: Record<Issue["priority"], string> = {
	High: "bg-red-100 text-red-700",
	Medium: "bg-yellow-100 text-yellow-700",
	Low: "bg-emerald-100 text-emerald-700",
};

const statusClasses: Record<Issue["status"], string> = {
	Open: "bg-sky-100 text-sky-700",
	"In progress": "bg-amber-100 text-amber-700",
	Review: "bg-violet-100 text-violet-700",
	Closed: "bg-emerald-100 text-emerald-700",
};

const IssuesPage = () => {
	const [activeFilter, setActiveFilter] =
		useState<(typeof filters)[number]>("All");
	const [search, setSearch] = useState(() =>
		typeof window === "undefined"
			? ""
			: (new URLSearchParams(window.location.search).get("search") ?? ""),
	);
	const [showFilters, setShowFilters] = useState(true);
	const [actionMessage, setActionMessage] = useState("");
	const [issues, setIssues] = useState<Issue[]>([]);
	const [isLoading, setIsLoading] = useState(
		() =>
			typeof window !== "undefined" &&
			Boolean(localStorage.getItem("bug_tracker_token")),
	);
	const [apiError, setApiError] = useState(() =>
		typeof window !== "undefined" && !localStorage.getItem("bug_tracker_token")
			? "Please sign in to view your issues."
			: "",
	);

	useEffect(() => {
		const token = localStorage.getItem("bug_tracker_token");
		if (!token) return;
		fetch("/api/tickets?limit=100", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (response) => {
				const payload = await response.json();
				if (!response.ok)
					throw new Error(payload.error ?? "Unable to load issues");
				setIssues((payload.tickets as ApiTicket[]).map(normalizeTicket));
			})
			.catch((error) =>
				setApiError(
					error instanceof Error ? error.message : "Unable to load issues",
				),
			)
			.finally(() => setIsLoading(false));
	}, []);

	const exportIssues = () => {
		const csv = [
			"ID,Title,Project,Priority,Status,Assignee",
			...filteredIssues.map((issue) =>
				[
					issue.id,
					issue.title,
					issue.project,
					issue.priority,
					issue.status,
					issue.assignee,
				]
					.map((value) => `"${value.replaceAll('"', '""')}"`)
					.join(","),
			),
		].join("\n");
		const link = document.createElement("a");
		link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
		link.download = "bug-tracker-issues.csv";
		link.click();
		URL.revokeObjectURL(link.href);
		setActionMessage(
			`Exported ${filteredIssues.length} issue${filteredIssues.length === 1 ? "" : "s"}.`,
		);
	};

	const filteredIssues = issues.filter((issue) => {
		const matchesFilter =
			activeFilter === "All" ? true : issue.status === activeFilter;
		const matchesSearch = `${issue.title} ${issue.project} ${issue.assignee}`
			.toLowerCase()
			.includes(search.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	return (
		<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
							Issue tracker
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">
							All issues
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setShowFilters((value) => !value)}
							aria-pressed={showFilters}
							className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
						>
							<Filter size={16} />
							Filter
						</button>
						<AddItemButton
							mode="issue"
							onAdd={async (
								title,
								description,
								priority,
								_status,
								assignedTo,
							) => {
								const token = localStorage.getItem("bug_tracker_token");
								const response = await apiClient.post(
									"/api/tickets",
									{
										title,
										description,
										type: "bug",
										priority: priority.toLowerCase(),
										assignedTo,
									},
									{ headers: { Authorization: `Bearer ${token}` } },
								);
								setIssues((current) => [
									normalizeTicket(response.data),
									...current,
								]);
								setActionMessage("Issue created successfully.");
							}}
						/>
					</div>
				</header>
				{isLoading && (
					<div className="rounded-xl border border-slate-200 bg-white p-5">
						<LoadingSpinner label="Loading issues" />
					</div>
				)}
				{apiError && (
					<p className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
						{apiError}
					</p>
				)}

				<section className="grid gap-4 md:grid-cols-4">
					{[
						{ label: "Total issues", value: issues.length },
						{
							label: "Open",
							value: issues.filter((issue) => issue.status === "Open").length,
						},
						{
							label: "In progress",
							value: issues.filter((issue) => issue.status === "In progress")
								.length,
						},
						{
							label: "Resolved",
							value: issues.filter((issue) => issue.status === "Closed").length,
						},
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<p className="text-sm text-slate-500">{stat.label}</p>
							<div className="mt-4 flex items-end justify-between gap-4">
								<h2 className="text-3xl font-bold">{stat.value}</h2>
							</div>
						</div>
					))}
				</section>

				<section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
						{showFilters && (
							<div className="flex flex-wrap gap-2">
								{filters.map((filter) => (
									<button
										key={filter}
										type="button"
										onClick={() => setActiveFilter(filter)}
										className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
											activeFilter === filter
												? "bg-blue-700 text-white"
												: "bg-slate-100 text-slate-600 hover:bg-slate-200"
										}`}
									>
										{filter}
									</button>
								))}
							</div>
						)}

						<label className="relative block w-full max-w-sm">
							<Search
								size={16}
								className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
							/>
							<input
								type="text"
								value={search}
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search issues"
								className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
							/>
						</label>
					</div>

					<div
						id="issue-table"
						className="mt-5 overflow-hidden rounded-2xl border border-slate-200"
					>
						<table className="min-w-full divide-y divide-slate-200 text-left">
							<thead className="bg-slate-50 text-sm text-slate-500">
								<tr>
									<th className="px-4 py-3 font-medium">Issue</th>
									<th className="px-4 py-3 font-medium">Project</th>
									<th className="px-4 py-3 font-medium">Priority</th>
									<th className="px-4 py-3 font-medium">Status</th>
									<th className="px-4 py-3 font-medium">Assignee</th>
									<th className="px-4 py-3 font-medium">Updated</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-200 bg-white text-sm">
								{filteredIssues.length > 0 ? (
									filteredIssues.map((issue) => (
										<tr key={issue.id} className="align-top hover:bg-slate-50">
											<td className="px-4 py-4">
												<div className="flex items-start gap-3">
													<div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
														{issue.id.slice(-2)}
													</div>
													<div>
														<p className="font-semibold text-slate-800">
															<Link
																href={`/issues/${issue.id}`}
																className="font-semibold text-slate-800 hover:text-blue-700"
															>
																{issue.title}
															</Link>
														</p>
														<p className="mt-1 text-xs text-slate-500">
															{issue.id}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-4 text-slate-600">
												{issue.project}
											</td>
											<td className="px-4 py-4">
												<span
													className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[issue.priority]}`}
												>
													{issue.priority}
												</span>
											</td>
											<td className="px-4 py-4">
												<span
													className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[issue.status]}`}
												>
													{issue.status}
												</span>
											</td>
											<td className="px-4 py-4 text-slate-600">
												{issue.assignee}
											</td>
											<td className="px-4 py-4 text-slate-600">
												{issue.updatedAt}
											</td>
										</tr>
									))
								) : (
									<tr>
										<td
											colSpan={6}
											className="px-4 py-10 text-center text-slate-500"
										>
											No issues match the current filter.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<h2 className="text-xl font-semibold">Issue summary</h2>
							<Link
								href="#issue-table"
								className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-600"
							>
								Open details
								<ArrowUpRight size={16} />
							</Link>
						</div>

						<div className="space-y-4">
							{filteredIssues.slice(0, 3).map((issue) => (
								<div key={issue.id} className="rounded-2xl bg-slate-50 p-4">
									<div className="flex items-center justify-between gap-3">
										<p className="font-semibold text-slate-800">
											{issue.title}
										</p>
										<span
											className={`rounded-full px-2 py-1 text-[10px] font-semibold ${priorityClasses[issue.priority]}`}
										>
											{issue.priority}
										</span>
									</div>
									<p className="mt-2 text-sm text-slate-600">
										{issue.description}
									</p>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-500">Operations</p>
						<h2 className="mt-2 text-xl font-semibold">Quick actions</h2>

						<div className="mt-5 space-y-3">
							<button
								type="button"
								onClick={() => {
									setActiveFilter("In progress");
									setActionMessage("Showing issues currently in progress.");
								}}
								className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
							>
								<span>Assign to sprint</span>
								<ArrowUpRight size={16} />
							</button>
							<button
								type="button"
								onClick={exportIssues}
								className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
							>
								<span>Export issue list</span>
								<ArrowUpRight size={16} />
							</button>
							<button
								type="button"
								onClick={() => {
									navigator.clipboard?.writeText(window.location.href);
									setActionMessage("Issue report link copied.");
								}}
								className="flex w-full items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100"
							>
								<span>Share report</span>
								<ArrowUpRight size={16} />
							</button>
						</div>
						{actionMessage && (
							<p className="mt-3 text-xs font-medium text-emerald-600">
								{actionMessage}
							</p>
						)}
					</div>
				</section>
			</div>
		</main>
	);
};

export default IssuesPage;
