"use client";
import { useState } from "react";
import NavHeader from "./header/page";
import AddItemButton from "./modules/addItem/page";
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
	pending: "bg-blue-500",
	"in-progress": "bg-yellow-500",
	completed: "bg-green-500",
};

const priorityColor: Record<string, string> = {
	High: "bg-red-500",
	Medium: "bg-yellow-500",
	Low: "bg-green-500",
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
		<div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
			<div>
				<h3 className="font-semibold">{task.title}</h3>
				<p className="text-sm text-gray-600">{task.description}</p>
			</div>
			<div className="flex gap-2 items-start">
				<p
					className={`text-sm text-black border w-fit rounded-2xl px-2 ${priorityColor[task.priority]}`}
				>
					Priority: {task.priority}
				</p>
				<p
					className={`text-sm text-black border w-fit rounded-2xl px-2 ${statusColor[task.status]}`}
				>
					Status: {statusLabel[task.status]}
				</p>
				<Popover>
					<PopoverTrigger
						render={<button className="text-gray-500 cursor-pointer" />}
					>
						<EllipsisVertical size={18} />
					</PopoverTrigger>
					<PopoverContent className="w-32 p-1 bg-white">
						<button
							className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-100"
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

export default function Home() {
	const [tasks, setTasks] = useState<Task[]>([]);

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
		console.log("Edit not implemented yet", task);
	};

	return (
		<div className="flex flex-col flex-1 font-sans bg-gray-100 min-h-screen">
			<NavHeader className="bg-black w-full text-center" />
			<div className="flex justify-end p-4">
				<AddItemButton onAdd={handleAddTask} />
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mb-4">
				{STATUSES.map((s) => (
					<div
						key={s}
						className="flex flex-col border-gray-300 border-2 rounded-xl p-3  min-h-[320px]"
					>
						<h2 className="text-lg font-semibold mb-2 capitalize">
							{statusLabel[s]}
						</h2>
						<div className="flex flex-col gap-2">
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
