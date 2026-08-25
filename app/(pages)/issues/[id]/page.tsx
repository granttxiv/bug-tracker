  "use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	ArrowLeft,
	CalendarDays,
	CheckCircle2,
	Clock3,
	MessageSquare,
	MoreHorizontal,
	Send,
	UserRound,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";

type Ticket = {
	id: string;
	title: string;
	description: string;
	type: string;
	priority: string;
	status: string;
	updatedAt: string;
	assignedUser?: { name?: string } | null;
};

type Comment = { id: string; body: string; createdAt: string };
type Activity = {
	id: string;
	action: string;
	createdAt: string;
	newValue?: { status?: string } | null;
};

const statusLabel = (status: string) =>
	status === "in_progress"
		? "In progress"
		: status.charAt(0).toUpperCase() + status.slice(1);
const statusClasses: Record<string, string> = {
	new: "bg-sky-100 text-sky-700",
	acknowledged: "bg-sky-100 text-sky-700",
	triaged: "bg-violet-100 text-violet-700",
	in_progress: "bg-amber-100 text-amber-700",
	resolved: "bg-emerald-100 text-emerald-700",
	closed: "bg-slate-200 text-slate-700",
};
const priorityClasses: Record<string, string> = {
	critical: "bg-red-100 text-red-700",
	high: "bg-red-100 text-red-700",
	medium: "bg-amber-100 text-amber-700",
	low: "bg-emerald-100 text-emerald-700",
};

export default function IssueDetailPage() {
	const params = useParams<{ id: string }>();
	const token =
		typeof window !== "undefined"
			? localStorage.getItem("bug_tracker_token")
			: null;
	const [ticket, setTicket] = useState<Ticket | null>(null);
	const [comments, setComments] = useState<Comment[]>([]);
	const [activities, setActivities] = useState<Activity[]>([]);
	const [commentBody, setCommentBody] = useState("");
	const [isLoading, setIsLoading] = useState(Boolean(token));
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(
		token ? "" : "Please sign in to view this issue.",
	);

	useEffect(() => {
		if (!token) return;
		const headers = { Authorization: `Bearer ${token}` };
		Promise.all([
			fetch(`/api/tickets/${params.id}`, { headers }),
			fetch(`/api/tickets/${params.id}/comments`, { headers }),
			fetch(`/api/tickets/${params.id}/activities`, { headers }),
		])
			.then(async ([ticketResponse, commentsResponse, activitiesResponse]) => {
				const ticketPayload = await ticketResponse.json();
				const commentsPayload = await commentsResponse.json();
				const activitiesPayload = await activitiesResponse.json();
				if (!ticketResponse.ok)
					throw new Error(ticketPayload.error ?? "Unable to load issue");
				setTicket(ticketPayload);
				setComments(commentsResponse.ok ? commentsPayload : []);
				setActivities(activitiesResponse.ok ? activitiesPayload : []);
			})
			.catch((requestError) =>
				setError(
					requestError instanceof Error
						? requestError.message
						: "Unable to load issue",
				),
			)
			.finally(() => setIsLoading(false));
	}, [params.id, token]);

	const submitComment = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!commentBody.trim() || !token) return;
		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/tickets/${params.id}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					body: commentBody.trim(),
					type: "public_reply",
				}),
			});
			const payload = await response.json();
			if (!response.ok)
				throw new Error(payload.error ?? "Unable to add comment");
			setComments((current) => [...current, payload]);
			setCommentBody("");
		} catch (requestError) {
			setError(
				requestError instanceof Error
					? requestError.message
					: "Unable to add comment",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const resolveIssue = async () => {
		if (!ticket || !token) return;
		const response = await fetch(`/api/tickets/${ticket.id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ status: "resolved" }),
		});
		const payload = await response.json();
		if (response.ok) setTicket(payload);
		else setError(payload.error ?? "Unable to resolve issue");
	};

	if (isLoading)
		return (
			<main className="min-h-screen bg-slate-100 p-8 text-slate-900">
				<div className="mx-auto max-w-6xl">
					<LoadingSpinner label="Loading issue" />
				</div>
			</main>
		);
	if (error || !ticket)
		return (
			<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
				<div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
					<p className="text-sm text-red-600">{error || "Issue not found"}</p>
					<Link
						href="/issues"
						className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
					>
						<ArrowLeft size={16} />
						Back to issues
					</Link>
				</div>
			</main>
		);

	return (
		<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-6xl space-y-5">
				<Link
					href="/issues"
					className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-700"
				>
					<ArrowLeft size={16} />
					Back to issues
				</Link>
				<header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
					<div className="flex items-start justify-between gap-5">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
								{ticket.id} <span className="px-2 text-slate-300">/</span>{" "}
								{ticket.type.replaceAll("_", " ")}
							</p>
							<h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight">
								{ticket.title}
							</h1>
						</div>
						<button
							type="button"
							aria-label="More issue actions"
							className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
						>
							<MoreHorizontal size={20} />
						</button>
					</div>
					<div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
						<span
							className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusClasses[ticket.status] ?? "bg-slate-100 text-slate-700"}`}
						>
							{statusLabel(ticket.status)}
						</span>
						<span
							className={`rounded-full px-3 py-1.5 text-xs font-semibold ${priorityClasses[ticket.priority] ?? "bg-slate-100 text-slate-700"}`}
						>
							{ticket.priority} priority
						</span>
						<span className="inline-flex items-center gap-2 text-sm text-slate-500">
							<UserRound size={16} />
							{ticket.assignedUser?.name ?? "Unassigned"}
						</span>
						<span className="inline-flex items-center gap-2 text-sm text-slate-500">
							<Clock3 size={16} />
							Updated {new Date(ticket.updatedAt).toLocaleString()}
						</span>
					</div>
				</header>
				<div className="grid gap-5 lg:grid-cols-[1fr_320px]">
					<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
						<div className="flex items-center gap-2">
							<MessageSquare size={18} className="text-blue-700" />
							<h2 className="text-lg font-semibold">Description</h2>
						</div>
						<p className="mt-5 text-sm leading-7 text-slate-600">
							{ticket.description}
						</p>
						<div className="mt-8 border-t border-slate-100 pt-6">
							<h2 className="text-lg font-semibold">Comments</h2>
							<div className="mt-5 space-y-4">
								{comments.length === 0 ? (
									<p className="text-sm text-slate-500">No comments yet.</p>
								) : (
									comments.map((comment) => (
										<div
											key={comment.id}
											className="rounded-xl bg-slate-50 p-4"
										>
											<p className="text-sm text-slate-700">{comment.body}</p>
											<p className="mt-2 text-xs text-slate-400">
												{new Date(comment.createdAt).toLocaleString()}
											</p>
										</div>
									))
								)}
							</div>
							<form onSubmit={submitComment} className="mt-6 flex gap-2">
								<input
									value={commentBody}
									onChange={(event) => setCommentBody(event.target.value)}
									placeholder="Add a comment"
									className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white"
								/>
								<button
									type="submit"
									disabled={isSubmitting || !commentBody.trim()}
									aria-label="Send comment"
									className="rounded-xl bg-blue-700 px-3 text-white transition hover:bg-blue-600 disabled:opacity-50"
								>
									<Send size={16} />
								</button>
							</form>
						</div>
						<div className="mt-8 border-t border-slate-100 pt-6">
							<h2 className="text-lg font-semibold">Activity</h2>
							<div className="mt-5 space-y-4">
								{activities.length === 0 ? (
									<p className="text-sm text-slate-500">No activity yet.</p>
								) : (
									activities.map((activity) => (
										<div key={activity.id} className="flex gap-3">
											<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
												A
											</div>
											<div>
												<p className="text-sm font-medium text-slate-800">
													Issue {activity.action}
												</p>
												<p className="mt-1 text-xs text-slate-500">
													{new Date(activity.createdAt).toLocaleString()}
												</p>
											</div>
										</div>
									))
								)}
							</div>
						</div>
					</section>
					<aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<h2 className="text-lg font-semibold">Issue details</h2>
						<dl className="mt-5 space-y-5 text-sm">
							<div>
								<dt className="text-slate-400">Project</dt>
								<dd className="mt-1 font-medium text-slate-800">
									{ticket.type.replaceAll("_", " ")}
								</dd>
							</div>
							<div>
								<dt className="text-slate-400">Assignee</dt>
								<dd className="mt-1 font-medium text-slate-800">
									{ticket.assignedUser?.name ?? "Unassigned"}
								</dd>
							</div>
							<div>
								<dt className="text-slate-400">Priority</dt>
								<dd className="mt-1 font-medium text-slate-800">
									{ticket.priority}
								</dd>
							</div>
							<div>
								<dt className="text-slate-400">Last updated</dt>
								<dd className="mt-1 inline-flex items-center gap-2 font-medium text-slate-800">
									<CalendarDays size={15} />
									{new Date(ticket.updatedAt).toLocaleString()}
								</dd>
							</div>
						</dl>
						{ticket.status !== "resolved" && ticket.status !== "closed" && (
							<button
								type="button"
								onClick={resolveIssue}
								className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
							>
								<CheckCircle2 size={16} />
								Mark as resolved
							</button>
						)}
					</aside>
				</div>
			</div>
		</main>
	);
}
