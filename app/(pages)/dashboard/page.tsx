const stats = [
	{ label: "Total issues", value: "128", change: "+12%", tone: "blue" },
	{ label: "In progress", value: "18", change: "+4", tone: "amber" },
	{ label: "Resolved", value: "94", change: "+23%", tone: "green" },
	{ label: "Avg. fix time", value: "3.4d", change: "-18%", tone: "purple" },
];

const sprintData = [
	{ day: "Mon", value: 42 },
	{ day: "Tue", value: 58 },
	{ day: "Wed", value: 66 },
	{ day: "Thu", value: 48 },
	{ day: "Fri", value: 76 },
	{ day: "Sat", value: 62 },
	{ day: "Sun", value: 88 },
];

const issues = [
	{
		title: "Login redirect loop",
		priority: "High",
		status: "In progress",
		owner: "Ava",
	},
	{
		title: "CSV export fails on large datasets",
		priority: "High",
		status: "Review",
		owner: "Noah",
	},
	{
		title: "Board filters persist incorrectly",
		priority: "Medium",
		status: "Queued",
		owner: "Liam",
	},
	{
		title: "Profile avatar upload is blurry",
		priority: "Low",
		status: "Resolved",
		owner: "Emma",
	},
];

const activity = [
	{
		name: "Ava Patel",
		task: "Fixed auth redirect edge case",
		time: "18 min ago",
	},
	{
		name: "Noah Chen",
		task: "Reviewed backlog cleanup request",
		time: "31 min ago",
	},
	{
		name: "Emma Lopez",
		task: "Updated onboarding analytics",
		time: "1 hr ago",
	},
	{
		name: "Liam Johnson",
		task: "Closed duplicate bug report",
		time: "2 hrs ago",
	},
];

const toneClasses: Record<string, string> = {
	blue: "bg-blue-100 text-blue-700",
	amber: "bg-amber-100 text-amber-700",
	green: "bg-emerald-100 text-emerald-700",
	purple: "bg-violet-100 text-violet-700",
};

const priorityClasses: Record<string, string> = {
	High: "bg-red-100 text-red-700",
	Medium: "bg-yellow-100 text-yellow-700",
	Low: "bg-emerald-100 text-emerald-700",
};

const Dashboard = () => {
	return (
		<main className="min-h-screen bg-slate-100 p-6 text-slate-900">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
							Product dashboard
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">
							Good morning, Alex
						</h1>
					</div>
					<div className="flex items-center gap-3">
						<button className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
							This week
						</button>
						<button className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600">
							+ New report
						</button>
					</div>
				</header>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
						>
							<div className="flex items-start justify-between gap-4">
								<div>
									<p className="text-sm text-slate-500">{stat.label}</p>
									<h2 className="mt-3 text-3xl font-bold">{stat.value}</h2>
								</div>
								<span
									className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[stat.tone]}`}
								>
									{stat.change}
								</span>
							</div>
						</div>
					))}
				</section>

				<section className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-6 flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500">Sprint velocity</p>
								<h3 className="text-xl font-semibold">Weekly workload</h3>
							</div>
							<p className="text-sm font-medium text-emerald-600">
								+18.2% vs last week
							</p>
						</div>

						<div className="flex h-52 items-end justify-between gap-3">
							{sprintData.map((item) => (
								<div
									key={item.day}
									className="flex flex-1 flex-col items-center gap-3"
								>
									<div className="flex h-40 w-full items-end justify-center rounded-t-2xl bg-slate-100 p-1">
										<div
											className="w-full rounded-t-xl bg-linear-to-t from-blue-700 to-cyan-400"
											style={{ height: `${item.value}%` }}
										/>
									</div>
									<span className="text-xs font-medium text-slate-500">
										{item.day}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-500">Issue split</p>
						<h3 className="mt-2 text-xl font-semibold">Status overview</h3>

						<div className="mt-6 space-y-5">
							<div>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="text-slate-600">Open</span>
									<span className="font-semibold">42%</span>
								</div>
								<div className="h-2.5 rounded-full bg-slate-100">
									<div className="h-2.5 w-[42%] rounded-full bg-blue-600" />
								</div>
							</div>

							<div>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="text-slate-600">In progress</span>
									<span className="font-semibold">31%</span>
								</div>
								<div className="h-2.5 rounded-full bg-slate-100">
									<div className="h-2.5 w-[31%] rounded-full bg-amber-500" />
								</div>
							</div>

							<div>
								<div className="mb-1 flex items-center justify-between text-sm">
									<span className="text-slate-600">Resolved</span>
									<span className="font-semibold">27%</span>
								</div>
								<div className="h-2.5 rounded-full bg-slate-100">
									<div className="h-2.5 w-[27%] rounded-full bg-emerald-500" />
								</div>
							</div>
						</div>
					</div>
				</section>

				<section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<div className="mb-4 flex items-center justify-between">
							<div>
								<p className="text-sm text-slate-500">Latest tasks</p>
								<h3 className="text-xl font-semibold">Recent bugs</h3>
							</div>
							<a
								href="#"
								className="text-sm font-medium text-blue-700 hover:text-blue-600"
							>
								View all
							</a>
						</div>

						<div className="overflow-hidden rounded-2xl border border-slate-200">
							<table className="min-w-full divide-y divide-slate-200 text-left">
								<thead className="bg-slate-50 text-sm text-slate-500">
									<tr>
										<th className="px-4 py-3 font-medium">Issue</th>
										<th className="px-4 py-3 font-medium">Priority</th>
										<th className="px-4 py-3 font-medium">Status</th>
										<th className="px-4 py-3 font-medium">Owner</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200 bg-white text-sm">
									{issues.map((issue) => (
										<tr key={issue.title} className="hover:bg-slate-50">
											<td className="px-4 py-3 font-medium text-slate-800">
												{issue.title}
											</td>
											<td className="px-4 py-3">
												<span
													className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClasses[issue.priority]}`}
												>
													{issue.priority}
												</span>
											</td>
											<td className="px-4 py-3 text-slate-600">
												{issue.status}
											</td>
											<td className="px-4 py-3 text-slate-600">
												{issue.owner}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
						<p className="text-sm text-slate-500">Team activity</p>
						<h3 className="mt-2 text-xl font-semibold">Recent updates</h3>

						<div className="mt-5 space-y-4">
							{activity.map((item) => (
								<div
									key={item.name}
									className="flex gap-3 rounded-2xl bg-slate-50 p-3"
								>
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
										{item.name.charAt(0)}
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-slate-800">{item.name}</p>
										<p className="text-sm text-slate-600">{item.task}</p>
									</div>
									<span className="text-xs text-slate-400">{item.time}</span>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</main>
	);
};

export default Dashboard;
