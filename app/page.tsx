import Link from "next/link";

const featureCards = [
	{
		title: "Dashboard",
		description:
			"Track sprint health, resolutions, and team velocity from one view.",
		href: "/dashboard",
	},
	{
		title: "Board",
		description:
			"Move work across statuses and understand where priorities are stalled.",
		href: "/board",
	},
	{
		title: "Issues",
		description:
			"Filter, triage, and review the bug backlog without losing context.",
		href: "/issues",
	},
	{
		title: "Backlog",
		description: "Shape upcoming work with clear ownership and prioritization.",
		href: "/backlog",
	},
];

const highlights = [
	"Team-focused issue tracking",
	"Prioritized sprint visibility",
	"Fast backlog and board workflows",
];

export default function Home() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 px-5 py-8 md:px-8 md:py-12">
			<div className="mx-auto max-w-6xl">
				<section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
					<div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
						<div className="flex flex-col justify-center">
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
								Bug Tracker
							</p>
							<h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
								Ship better work with a clearer view of every issue.
							</h1>
							<p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
								Keep delivery moving with a single place for release health,
								team updates, and the full lifecycle of every bug.
							</p>

							<div className="mt-7 flex flex-wrap gap-3">
								<Link
									href="/dashboard"
									className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
								>
									Open dashboard
								</Link>
								<Link
									href="/issues"
									className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
								>
									Review issues
								</Link>
							</div>

							<div className="mt-8 flex flex-wrap gap-3">
								{highlights.map((item) => (
									<span
										key={item}
										className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600"
									>
										{item}
									</span>
								))}
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm sm:col-span-2">
								<p className="text-sm text-slate-300">Sprint health</p>
								<div className="mt-3 flex items-end justify-between gap-3">
									<h2 className="text-4xl font-bold">+18.2%</h2>
									<span className="rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300">
										On track
									</span>
								</div>
							</div>
							<div className="rounded-2xl bg-blue-50 p-5 shadow-sm">
								<p className="text-sm text-slate-500">Open issues</p>
								<h2 className="mt-3 text-4xl font-bold text-blue-700">42</h2>
							</div>
							<div className="rounded-2xl bg-emerald-50 p-5 shadow-sm">
								<p className="text-sm text-slate-500">Resolved</p>
								<h2 className="mt-3 text-4xl font-bold text-emerald-600">94</h2>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{featureCards.map((card) => (
						<Link
							key={card.title}
							href={card.href}
							className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
						>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
								Workspace
							</p>
							<h3 className="mt-4 text-xl font-semibold text-slate-900">
								{card.title}
							</h3>
							<p className="mt-2 text-sm leading-6 text-slate-600">
								{card.description}
							</p>
						</Link>
					))}
				</section>
			</div>
		</main>
	);
}
