"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Bell,
	Check,
	Globe,
	Lock,
	ShieldCheck,
	Sparkles,
	UserCircle2,
} from "lucide-react";

type ToggleKey = "productUpdates" | "securityAlerts" | "weeklyDigest";

type FormState = {
	displayName: string;
	email: string;
	timezone: string;
	language: string;
	officeHours: string;
	productUpdates: boolean;
	securityAlerts: boolean;
	weeklyDigest: boolean;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
	displayName: "Ava Patel",
	email: "ava@bugtracker.io",
	timezone: "UTC-05:00",
	language: "English (US)",
	officeHours: "9:00 AM - 5:00 PM",
	productUpdates: true,
	securityAlerts: true,
	weeklyDigest: false,
};

const tabs = [
	{ label: "Profile", icon: UserCircle2 },
	{ label: "Notifications", icon: Bell },
	{ label: "Security", icon: ShieldCheck },
	{ label: "Appearance", icon: Sparkles },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateForm = (values: FormState): FormErrors => {
	const errors: FormErrors = {};

	if (!values.displayName.trim()) {
		errors.displayName = "Display name is required.";
	} else if (values.displayName.trim().length < 2) {
		errors.displayName = "Use at least 2 characters.";
	}

	if (!values.email.trim()) {
		errors.email = "Email is required.";
	} else if (!emailPattern.test(values.email)) {
		errors.email = "Enter a valid email address.";
	}

	if (!values.timezone.trim()) {
		errors.timezone = "Timezone is required.";
	}

	if (!values.language.trim()) {
		errors.language = "Language is required.";
	}

	return errors;
};

export default function SettingsPage() {
	const router = useRouter();
	const [form, setForm] = useState<FormState>(initialForm);
	const [activeTab, setActiveTab] = useState("Profile");
	const [lastSaved, setLastSaved] = useState("Loading profile...");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [accentColor, setAccentColor] = useState("bg-blue-600");

	useEffect(() => {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("bug_tracker_token")
				: null;

		if (!token) {
			router.push("/login");
			return;
		}

		fetch("/api/auth/me", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (response) => {
				if (!response.ok) {
					throw new Error("Unable to load profile");
				}
				const payload = await response.json();
				setForm((current) => ({
					...current,
					displayName: payload.user?.name ?? current.displayName,
					email: payload.user?.email ?? current.email,
				}));
				setLastSaved("Profile synced");
			})
			.catch(() => {
				setLastSaved("Profile unavailable");
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [router]);

	const errors = useMemo(() => validateForm(form), [form]);
	const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
	const isValid = Object.keys(errors).length === 0;
	const saveDisabled = !isDirty || !isValid || isLoading || isSaving;

	const updateField = <K extends keyof FormState>(
		key: K,
		value: FormState[K],
	) => {
		setForm((current) => ({
			...current,
			[key]: value,
		}));
	};

	const resetChanges = () => {
		setForm(initialForm);
		setLastSaved("Changes reset");
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!isValid) {
			setLastSaved("Please fix the highlighted fields");
			return;
		}

		const token =
			typeof window !== "undefined"
				? localStorage.getItem("bug_tracker_token")
				: null;
		if (!token) {
			router.push("/login");
			return;
		}

		setIsSaving(true);
		try {
			const response = await fetch("/api/auth/me", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: form.displayName,
					email: form.email,
				}),
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error ?? "Unable to save profile");
			}

			if (typeof window !== "undefined") {
				localStorage.setItem(
					"bug_tracker_user",
					JSON.stringify({
						...JSON.parse(localStorage.getItem("bug_tracker_user") ?? "{}"),
						email: result.user.email,
						name: result.user.name,
					}),
				);
			}

			setLastSaved(
				`Saved at ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`,
			);
		} catch (error) {
			setLastSaved(
				error instanceof Error ? error.message : "Unable to save profile",
			);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<main className="min-h-screen bg-slate-100 p-5 text-slate-900 md:p-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
							Workspace settings
						</p>
						<h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
					</div>

					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={resetChanges}
							className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
						>
							Reset
						</button>
						<button
							type="submit"
							form="settings-form"
							disabled={saveDisabled}
							className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
						>
							Save changes
						</button>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[240px_1fr]">
					<aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
						<p className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
							Preferences
						</p>
						<nav className="mt-4 space-y-2">
							{tabs.map(({ label, icon: Icon }) => (
								<button
									key={label}
									type="button"
									onClick={() => setActiveTab(label)}
									className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
										activeTab === label
											? "bg-blue-50 text-blue-700"
											: "text-slate-600 hover:bg-slate-100"
									}`}
								>
									<Icon size={16} />
									{label}
								</button>
							))}
						</nav>
					</aside>

					<form
						id="settings-form"
						onSubmit={handleSubmit}
						className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
					>
						<div className="flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
							<div>
								<p className="text-sm text-slate-500">Account details</p>
								<h2 className="mt-1 text-2xl font-semibold">{activeTab}</h2>
							</div>
							<div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
								<Check size={14} />
								{lastSaved}
							</div>
						</div>

						{activeTab === "Profile" && (
							<div className="mt-6 grid gap-6 md:grid-cols-2">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-slate-700">
										Display name
									</label>
									<input
										value={form.displayName}
										onChange={(event) =>
											updateField("displayName", event.target.value)
										}
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
										aria-invalid={Boolean(errors.displayName)}
									/>
									{errors.displayName && (
										<p className="mt-2 text-xs font-medium text-red-600">
											{errors.displayName}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										Email
									</label>
									<input
										type="email"
										value={form.email}
										onChange={(event) =>
											updateField("email", event.target.value)
										}
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
										aria-invalid={Boolean(errors.email)}
									/>
									{errors.email && (
										<p className="mt-2 text-xs font-medium text-red-600">
											{errors.email}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										Timezone
									</label>
									<select
										value={form.timezone}
										onChange={(event) =>
											updateField("timezone", event.target.value)
										}
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
										aria-invalid={Boolean(errors.timezone)}
									>
										<option value="UTC-08:00">Pacific Time (UTC-08:00)</option>
										<option value="UTC-05:00">Eastern Time (UTC-05:00)</option>
										<option value="UTC+00:00">
											Greenwich Mean Time (UTC+00:00)
										</option>
										<option value="UTC+01:00">
											Central European Time (UTC+01:00)
										</option>
									</select>
									{errors.timezone && (
										<p className="mt-2 text-xs font-medium text-red-600">
											{errors.timezone}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										Language
									</label>
									<select
										value={form.language}
										onChange={(event) =>
											updateField("language", event.target.value)
										}
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
										aria-invalid={Boolean(errors.language)}
									>
										<option value="English (US)">English (US)</option>
										<option value="English (UK)">English (UK)</option>
										<option value="Spanish">Spanish</option>
										<option value="French">French</option>
									</select>
									{errors.language && (
										<p className="mt-2 text-xs font-medium text-red-600">
											{errors.language}
										</p>
									)}
								</div>

								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-slate-700">
										Office hours
									</label>
									<input
										value={form.officeHours}
										onChange={(event) =>
											updateField("officeHours", event.target.value)
										}
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
									/>
								</div>
							</div>
						)}

						{activeTab === "Notifications" && (
							<div className="mt-6 space-y-4">
								{[
									{
										key: "productUpdates",
										label: "Product updates",
										description: "Release notes and feature announcements.",
									},
									{
										key: "securityAlerts",
										label: "Security alerts",
										description: "Important account and system notifications.",
									},
									{
										key: "weeklyDigest",
										label: "Weekly digest",
										description: "Summary of team activity and sprint status.",
									},
								].map(({ key, label, description }) => {
									const typedKey = key as ToggleKey;
									return (
										<div
											key={key}
											className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4"
										>
											<div>
												<p className="font-medium text-slate-800">{label}</p>
												<p className="mt-1 text-sm text-slate-500">
													{description}
												</p>
											</div>
											<button
												type="button"
												onClick={() => updateField(typedKey, !form[typedKey])}
												className={`relative h-7 w-12 rounded-full transition ${
													form[typedKey] ? "bg-blue-700" : "bg-slate-300"
												}`}
												aria-label={label}
											>
												<span
													className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
														form[typedKey] ? "left-6" : "left-1"
													}`}
												/>
											</button>
										</div>
									);
								})}
							</div>
						)}

						{activeTab === "Security" && (
							<div className="mt-6 grid gap-6 md:grid-cols-2">
								<div className="md:col-span-2">
									<label className="flex items-center gap-2 text-sm font-medium text-slate-700">
										<Lock size={16} />
										Current password
									</label>
									<input
										type="password"
										defaultValue="••••••••"
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										New password
									</label>
									<input
										type="password"
										placeholder="Minimum 8 characters"
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										Confirm password
									</label>
									<input
										type="password"
										placeholder="Retype your password"
										className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
									/>
								</div>
							</div>
						)}

						{activeTab === "Appearance" && (
							<div className="mt-6 grid gap-6 md:grid-cols-2">
								<div>
									<label className="flex items-center gap-2 text-sm font-medium text-slate-700">
										<Globe size={16} />
										Theme
									</label>
									<div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
										<div className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
											<span className="text-sm font-medium text-slate-700">
												Light mode
											</span>
											<span className="rounded-full bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-600">
												Default
											</span>
										</div>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700">
										Accent color
									</label>
									<div className="mt-2 flex gap-3">
										{[
											"bg-blue-600",
											"bg-violet-600",
											"bg-emerald-600",
											"bg-amber-500",
										].map((color) => (
											<button
												key={color}
												type="button"
												onClick={() => setAccentColor(color)}
												className={`h-9 w-9 rounded-full ${color} ring-2 shadow-sm ${accentColor === color ? "ring-slate-900" : "ring-white"}`}
												aria-label="Accent color"
												aria-pressed={accentColor === color}
											/>
										))}
									</div>
								</div>
							</div>
						)}
					</form>
				</div>
			</div>
		</main>
	);
}
