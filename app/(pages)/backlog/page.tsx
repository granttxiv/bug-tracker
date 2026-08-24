"use client";

import Link from "next/link";
import { ChevronDown, Circle, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";

const backlogItems = [
	{
		id: "BUG-1120",
		title: "Board filters reset on page refresh",
		type: "Bug",
		priority: "Medium",
		owner: "LJ",
	},
	{
		id: "BUG-1104",
		title: "Backlog ordering changes between sessions",
		type: "Bug",
		priority: "Low",
		owner: "ER",
	},
	{
		id: "TASK-204",
		title: "Add saved filters for triage views",
		type: "Task",
		priority: "High",
		owner: "AM",
	},
	{
		id: "TASK-198",
		title: "Document the release checklist",
		type: "Task",
		priority: "Low",
		owner: "SN",
	},
];

const priorityColor: Record<string, string> = {
	High: "text-red-600",
	Medium: "text-amber-600",
	Low: "text-emerald-600",
};

export default function Backlog() {
	const [view, setView] = useState("Sprint backlog");
	const [items, setItems] = useState(backlogItems);
	const [showDetails, setShowDetails] = useState(false);

	const addIssue = () => {
		setItems((current) => [
			...current,
			{
				id: `TASK-${200 + current.length}`,
				title: "New backlog item",
				type: "Task",
				priority: "Medium",
				owner: "AM",
			},
		]);
	};

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
							Prioritize upcoming work and keep the next sprint ready.
						</p>
					</div>
					<Link
						href="/addItem"
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
					>
						<Plus size={16} />
						Create issue
					</Link>
				</header>

				<section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() =>
									setView((value) =>
										value === "Sprint backlog"
											? "Future backlog"
											: "Sprint backlog",
									)
								}
								className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
							>
								{view} <ChevronDown size={15} />
							</button>
							<span className="text-sm text-slate-400">
								{items.length} items
							</span>
						</div>
						<button
							type="button"
							onClick={() => setShowDetails((value) => !value)}
							className="text-slate-400 transition hover:text-slate-700"
							aria-label="More backlog actions"
						>
							<MoreHorizontal size={19} />
						</button>
					</div>
					<div className="flex items-center gap-3 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
						<span className="w-7" />
						<span className="flex-1">Issue</span>
						<span className="hidden w-24 sm:block">Type</span>
						<span className="w-20">Priority</span>
						<span className="w-12 text-right">Owner</span>
					</div>
					<div className="divide-y divide-slate-100">
						{items.map((item) => (
							<div
								key={item.id}
								className="group flex items-center gap-3 px-5 py-4 transition hover:bg-blue-50/40"
							>
								<Circle size={16} className="shrink-0 text-slate-300" />
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-slate-800">
										{item.title}
									</p>
									<p className="mt-1 text-xs font-medium text-slate-400">
										{item.id}
									</p>
								</div>
								<span className="hidden w-24 text-xs text-slate-500 sm:block">
									{item.type}
								</span>
								<span
									className={`w-20 text-xs font-semibold ${priorityColor[item.priority]}`}
								>
									{item.priority}
								</span>
								<span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
									{item.owner}
								</span>
							</div>
						))}
					</div>
					<button
						type="button"
						onClick={addIssue}
						className="flex w-full items-center gap-2 border-t border-slate-100 px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-blue-700"
					>
						<Plus size={16} />
						Add an issue
					</button>
					{showDetails && (
						<p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
							Backlog actions are ready for review. Use the view selector to
							switch between sprint and future work.
						</p>
					)}
				</section>
			</div>
		</main>
	);
}
