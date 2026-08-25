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
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type AddItemButtonProps = {
	mode?: "task" | "issue";
	onAdd?: (
		title: string,
		description: string,
		priority: string,
		status: string,
		assignedTo?: string,
	) => void | Promise<void>;
};

type TeamMember = { id: string; name: string; email: string; role: string };

const AddItemButton = ({ mode = "task", onAdd }: AddItemButtonProps) => {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [priority, setPriority] = useState("Low");
	const [status, setStatus] = useState("pending");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [open, setOpen] = useState(false);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [assigneeQuery, setAssigneeQuery] = useState("");
	const [teamError, setTeamError] = useState("");

	useEffect(() => {
		if (!open) return;
		const token = localStorage.getItem("bug_tracker_token");
		if (!token) return;
		fetch("/api/team/users", { headers: { Authorization: `Bearer ${token}` } })
			.then(async (response) => {
				const payload = await response.json();
				if (!response.ok)
					throw new Error(payload.error ?? "Unable to load team members");
				setTeamMembers(payload);
			})
			.catch((requestError) =>
				setTeamError(
					requestError instanceof Error
						? requestError.message
						: "Unable to load team members",
				),
			);
	}, [open]);

	const handleSubmit = async () => {
		if (!title.trim()) {
			setError("Add a title before creating this item.");
			return;
		}
		if (mode === "issue" && description.trim().length < 10) {
			setError("Add at least 10 characters describing the issue.");
			return;
		}
		setError("");
		setIsSubmitting(true);
		try {
			const assignee = teamMembers.find(
				(member) =>
					`${member.name} - ${member.email}` === assigneeQuery ||
					member.name === assigneeQuery ||
					member.email === assigneeQuery,
			);
			if (onAdd) {
				await onAdd(title, description, priority, status, assignee?.id);
			} else if (mode === "issue") {
				localStorage.setItem(
					"bug_tracker_pending_issue",
					JSON.stringify({ title, description, priority }),
				);
				router.push("/issues");
			} else {
				localStorage.setItem(
					"bug_tracker_pending_task",
					JSON.stringify({
						title,
						description,
						priority,
						status,
						assignedTo: assignee?.id,
					}),
				);
				router.push("/board");
			}
			setTitle("");
			setDescription("");
			setPriority("Low");
			setStatus("pending");
			setAssigneeQuery("");
			setOpen(false);
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<button className="mt-3.5 flex items-center space-x-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600" />
				}
			>
				<Plus size={20} />
				<span>{mode === "issue" ? "New issue" : "Create a task"}</span>
			</PopoverTrigger>
			<PopoverContent className="w-100 rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
				<PopoverHeader>
					<PopoverDescription>
						Create a new item for your tracker.
					</PopoverDescription>
				</PopoverHeader>
				<label className="flex flex-col gap-1">
					<span className="text-xs font-medium">
						{mode === "issue" ? "Issue title" : "Title"}
					</span>
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
					<span className="text-xs font-medium">Assign to team member</span>
					<input
						list="team-members"
						value={assigneeQuery}
						onChange={(event) => setAssigneeQuery(event.target.value)}
						placeholder="Search by name or email"
						className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 outline-none transition focus:border-blue-500 focus:bg-white"
					/>
					<datalist id="team-members">
						{teamMembers.map((member) => (
							<option
								key={member.id}
								value={`${member.name} - ${member.email}`}
							/>
						))}
					</datalist>
					{teamError && (
						<span className="text-xs text-red-600">{teamError}</span>
					)}
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
				{mode === "task" && <span className="text-xs font-medium">Status</span>}
				{mode === "task" && (
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
				)}
				{error && <p className="text-xs font-medium text-red-600">{error}</p>}
				<button
					type="button"
					disabled={isSubmitting}
					className="mt-2 rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white transition hover:bg-blue-600"
					onClick={handleSubmit}
				>
					{isSubmitting
						? "Creating..."
						: mode === "issue"
							? "Create issue"
							: "Create item"}
				</button>
			</PopoverContent>
		</Popover>
	);
};

export default AddItemButton;
