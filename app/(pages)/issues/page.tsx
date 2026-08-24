"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Filter, Plus, Search } from "lucide-react";

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

const issueData: Issue[] = [
	{
		id: "BUG-1042",
		title: "Login redirect loop after successful sign in",
		project: "Authentication",
		priority: "High",
		status: "In progress",
		assignee: "Ava Patel",
		updatedAt: "2 hours ago",
		description:
			"Users are being sent back to the login screen after successful authentication when a saved session is present.",
	},
	{
		id: "BUG-1078",
		title: "CSV export truncates rows above 10k records",
		project: "Exports",
		priority: "High",
		status: "Review",
		assignee: "Noah Chen",
		updatedAt: "1 day ago",
		description:
			"Large exports are silently dropping records at the end of the CSV output when streaming from the backend.",
	},
	{
		id: "BUG-1120",
		title: "Board filters reset on page refresh",
		project: "Board",
		priority: "Medium",
		status: "Open",
		assignee: "Liam Johnson",
		updatedAt: "3 hours ago",
		description:
			"Users lose the selected filter state when the board is refreshed, forcing them to reapply preferences.",
	},
	{
		id: "BUG-1089",
		title: "Profile avatar upload appears blurred",
		project: "Profile",
		priority: "Low",
		status: "Closed",
		assignee: "Emma Lopez",
		updatedAt: "4 days ago",
		description:
			"Upload previews render softly blurred for images captured on mobile devices and uploaded at high resolution.",
	},
	{
		id: "BUG-1096",
		title: "Settings save button stays disabled after validation",
		project: "Settings",
		priority: "Medium",
		status: "Open",
		assignee: "Sophia Nguyen",
		updatedAt: "30 minutes ago",
		description:
			"After a user corrects a form error, the save button remains disabled until the form is blurred or interacted with again.",
	},
	{
		id: "BUG-1104",
		title: "Backlog ordering changes between sessions",
		project: "Backlog",
		priority: "Low",
		status: "Review",
		assignee: "Ethan Ross",
		updatedAt: "5 hours ago",
		description:
			"Stored priority order is not retained when the backlog is reopened in a different browser tab or session.",
	},
];

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

	const filteredIssues = issueData.filter((issue) => {
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
						<Link
							href="/addItem"
							className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
						>
							<Plus size={16} />
							New issue
						</Link>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-4">
					{[
						{ label: "Total issues", value: "128", change: "+12%" },
						{ label: "Open", value: "42", change: "+4" },
						{ label: "In review", value: "18", change: "+3" },
						{ label: "Resolved", value: "94", change: "+23%" },
					].map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<p className="text-sm text-slate-500">{stat.label}</p>
							<div className="mt-4 flex items-end justify-between gap-4">
								<h2 className="text-3xl font-bold">{stat.value}</h2>
								<span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
									{stat.change}
								</span>
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
															{issue.title}
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
