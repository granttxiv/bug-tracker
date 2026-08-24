"use client";

import { Plus } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

type AddItemButtonProps = {
	onAdd: (
		title: string,
		description: string,
		priority: string,
		status: string,
	) => void;
};

const AddItemButton = ({ onAdd }: AddItemButtonProps) => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("Low");
	const [status, setStatus] = useState("pending");
	const [open, setOpen] = useState(false);

	const handleSubmit = () => {
		if (!title.trim()) return;
		onAdd(title, description, priority, status);
		setTitle("");
		setDescription("");
		setPriority("Low");
		setStatus("pending");
		setOpen(false);
	};
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button className="mt-3.5 flex items-center space-x-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600" />
				}
			>
				<Plus size={20} />
				<span>Create a task</span>
			</PopoverTrigger>
			<PopoverContent className="w-100 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
				<PopoverHeader>
					<PopoverDescription>
						Create a new item for your tracker.
					</PopoverDescription>
				</PopoverHeader>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Title</span>
					<input
						className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
						placeholder="Enter a title"
						type="text"
						required
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Description</span>
					<textarea
						className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
						placeholder="Enter a description"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Priority</span>
					<select
						className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
						value={priority}
						onChange={(e) => setPriority(e.target.value)}
					>
						<option>Low</option>
						<option>Medium</option>
						<option>High</option>
					</select>
				</label>
				<span className="text-xs font-medium">Status</span>
				<label className="flex gap-2 items-center">
					<label className="text-xs items-center">
						<input
							type="radio"
							name="status"
							value="pending"
							required
							checked={status === "pending"}
							onChange={(e) => setStatus(e.target.value)}
							className="mr-2 accent-blue-700"
						/>
						Pending
					</label>

					<label className="text-xs">
						<input
							type="radio"
							name="status"
							value="in-progress"
							required
							checked={status === "in-progress"}
							onChange={(e) => setStatus(e.target.value)}
							className="mr-2 accent-yellow-500"
						/>
						In Progress
					</label>

					<label className="text-xs ">
						<input
							type="radio"
							name="status"
							value="completed"
							checked={status === "completed"}
							onChange={(e) => setStatus(e.target.value)}
							className="mr-2 accent-green-700"
						/>
						Completed
					</label>
				</label>
				<button
					className="mt-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
					onClick={handleSubmit}
				>
					Create item
				</button>
			</PopoverContent>
		</Popover>
	);
};

export default AddItemButton;
