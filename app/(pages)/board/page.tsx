"use client";
import { useState } from "react";
import AddItemButton from "../../(components)/addItem/page";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

type Task = {
	id: string;
	title: string;
	description: string;
	priority: string;
	status: string;
};

const STATUSES = ["pending", "in-progress", "completed"] as const;

const statusLabel: Record<string, string> = {
	pending: "Pending",
	"in-progress": "In Progress",
	completed: "Completed",
};

const statusColor: Record<string, string> = {
	pending: "bg-sky-100 text-sky-700",
	"in-progress": "bg-amber-100 text-amber-700",
	completed: "bg-emerald-100 text-emerald-700",
};

const priorityColor: Record<string, string> = {
	High: "bg-red-100 text-red-700",
	Medium: "bg-amber-100 text-amber-700",
	Low: "bg-emerald-100 text-emerald-700",
};

function TaskCard({
	task,
	onDelete,
	onEdit,
}: {
	task: Task;
	onDelete: (id: string) => void;
	onEdit: (task: Task) => void;
}) {
	return (
		<div className="flex justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
			<div className="min-w-0">
				<p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
					Task
				</p>
				<h3 className="font-semibold text-slate-800">{task.title}</h3>
				<p className="mt-1 text-sm leading-5 text-slate-500">
					{task.description}
				</p>
			</div>
			<div className="flex gap-2 items-start">
				<p
					className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${priorityColor[task.priority]}`}
				>
					{task.priority}
				</p>
				<p
					className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[task.status]}`}
				>
					{statusLabel[task.status]}
				</p>
				<Popover>
					<PopoverTrigger
						render={<button className="text-gray-500 cursor-pointer" />}
					>
						<EllipsisVertical size={18} />
					</PopoverTrigger>
					<PopoverContent className="w-32 p-1 bg-white">
						<button
							className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100"
							onClick={() => onEdit(task)}
						>
							<Pencil size={14} />
							Edit
						</button>
						<button
							className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-50"
							onClick={() => onDelete(task.id)}
						>
							<Trash2 size={14} />
							Delete
						</button>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

export default function Board() {
	const [tasks, setTasks] = useState<Task[]>(() => {
		if (typeof window === "undefined") return [];
		const pendingTask = localStorage.getItem("bug_tracker_pending_task");
		if (!pendingTask) return [];
		localStorage.removeItem("bug_tracker_pending_task");
		return [{ id: crypto.randomUUID(), ...JSON.parse(pendingTask) }];
	});

	const handleAddTask = (
		title: string,
		description: string,
		priority: string,
		status: string,
	) => {
		setTasks((prev) => [
			...prev,
			{ id: crypto.randomUUID(), title, description, priority, status },
		]);
	};

	const handleDeleteTask = (id: string) => {
		setTasks((prev) => prev.filter((task) => task.id !== id));
	};

	const handleEditTask = (task: Task) => {
		const title = window.prompt("Update task title", task.title)?.trim();
		if (!title) return;
		setTasks((prev) =>
			prev.map((item) => (item.id === task.id ? { ...item, title } : item)),
		);
	};

	return (
		<div className="min-h-screen flex-1 bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-7xl">
				<header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
							Product workspace
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">Board</h1>
						<p className="mt-2 text-sm text-slate-500">
							Move work forward and keep blockers visible.
						</p>
					</div>
					<div className="flex justify-end">
						<AddItemButton onAdd={handleAddTask} />
					</div>
				</header>
			</div>

			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-3">
				{STATUSES.map((s) => (
					<div
						key={s}
						className="flex min-h-120 flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3"
					>
						<div className="mb-3 flex items-center justify-between">
							<h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-600">
								{statusLabel[s]}
							</h2>
							<span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-400">
								{tasks.filter((task) => task.status === s).length}
							</span>
						</div>
						<div className="flex flex-col gap-3">
							{tasks
								.filter((task) => task.status === s)
								.map((task) => (
									<TaskCard
										key={task.id}
										task={task}
										onDelete={handleDeleteTask}
										onEdit={handleEditTask}
									/>
								))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
