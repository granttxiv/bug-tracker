"use client";

import { Plus } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
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
					<button className="flex w-45 items-center space-x-2 rounded-2xl bg-blue-800 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 mt-3.5" />
				}
			>
				<Plus size={20} />
				<span>Create a task</span>
			</PopoverTrigger>
			<PopoverContent className="w-100 bg-white p-4 rounded-lg shadow-lg">
				<PopoverHeader>
					<PopoverDescription>
						Create a new item for your tracker.
					</PopoverDescription>
				</PopoverHeader>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Title</span>
					<input
						className="rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500"
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
						className="rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500"
						placeholder="Enter a description"
						rows={3}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Priority</span>
					<select
						className="rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500"
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
					className="rounded bg-blue-500 px-3 py-1.5 font-medium text-white hover:bg-blue-600"
					onClick={handleSubmit}
				>
					Create item
				</button>
			</PopoverContent>
		</Popover>
	);
};

export default AddItemButton;
