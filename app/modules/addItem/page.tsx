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

const AddItemButton = () => {
	return (
		<Popover>
			<PopoverTrigger
				render={
					<button className="flex w-45 items-center space-x-2 rounded-2xl bg-blue-500 px-5 py-3.5 font-semibold text-white hover:bg-blue-600 mt-3.5" />
				}
			>
				<Plus size={20} />
				<span>Create a task</span>
			</PopoverTrigger>
			<PopoverContent>
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
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Description</span>
					<textarea
						className="rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500"
						placeholder="Enter a description"
						rows={3}
					/>
				</label>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">Priority</span>
					<select className="rounded border border-gray-300 px-2 py-1.5 outline-none focus:border-blue-500">
						<option>Low</option>
						<option>Medium</option>
						<option>High</option>
					</select>
				</label>
				<span className="text-xs font-medium">Status</span>
				<label className="flex gap-2 items-center">
					<label className="text-xs items-center">
						<input type="radio" name="status" value="pending" className="mr-2 accent-blue-700" />
						Pending
					</label>

					<label className="text-xs">
						<input type="radio" name="status" value="in-progress" className="mr-2 accent-yellow-500" />
						In Progress
					</label>

					<label className="text-xs ">
						<input type="radio" name="status" value="completed" className="mr-2 accent-green-700" />
						Completed
					</label>
				</label>
				<button className="rounded bg-blue-500 px-3 py-1.5 font-medium text-white hover:bg-blue-600">
					Create item
				</button>
			</PopoverContent>
		</Popover>
	);
};

export default AddItemButton;
