"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { apiClient } from "@/app/api/requestProcessor";

type LoginFormValues = {
	email: string;
	password: string;
};

const Login = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [recoveryMessage, setRecoveryMessage] = useState("");
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>();

	const onSubmit = async (data: LoginFormValues) => {
		setSubmitError("");
		try {
			const response = await apiClient.post("/api/auth/login", data);
			if (response.status === 200) {
				localStorage.setItem("bug_tracker_token", response.data.token);
				localStorage.setItem(
					"bug_tracker_user",
					JSON.stringify(response.data.user),
				);
				router.push("/dashboard");
			}
		} catch (error) {
			setSubmitError(
				axios.isAxiosError(error)
					? (error.response?.data?.error ??
							"Unable to sign in. Please try again.")
					: "Unable to sign in. Please try again.",
			);
		}
	};

	return (
		<div className="min-h-screen w-full bg-linear-to-br from-slate-100 via-white to-slate-200 px-5 py-8 md:px-8 md:py-12">
			<div className="mx-auto grid min-h-160 max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
				{/* Left: form */}
				<div className="flex flex-col justify-center px-6 py-12 sm:px-14">
					<Link
						href="/"
						className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-800"
					>
						Bug Tracker
					</Link>
					<h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
						Welcome back
					</h1>
					<p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
						Sign in to keep your team moving and stay close to every issue.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 flex max-w-sm flex-col gap-4"
						noValidate
					>
						<div>
							<label
								htmlFor="login-email"
								className="mb-2 block text-sm font-medium text-slate-700"
							>
								Email address
							</label>
							<input
								id="login-email"
								type="email"
								placeholder="you@company.com"
								className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
								{...register("email", { required: "Email is required" })}
							/>
							{errors.email && (
								<p className="mt-1 text-xs text-red-600">
									{errors.email.message}
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="login-password"
								className="mb-2 block text-sm font-medium text-slate-700"
							>
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="login-password"
									placeholder="Enter your password"
									className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white focus:ring-4 focus:ring-blue-100"
									{...register("password", {
										required: "Password is required",
									})}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-xs text-red-600">
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="flex justify-between gap-4">
							<button
								type="button"
								onClick={() =>
									setRecoveryMessage(
										"Password recovery is not configured yet. Contact your workspace admin.",
									)
								}
								className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
							>
								Forgot password?
							</button>
							<Link
								href="/register"
								className="text-xs font-semibold text-blue-700 transition hover:text-blue-700"
							>
								Create account
							</Link>
						</div>
						{recoveryMessage && (
							<p className="text-xs text-slate-500">{recoveryMessage}</p>
						)}
						{submitError && (
							<p className="text-sm text-red-600">{submitError}</p>
						)}

						<button
							type="submit"
							className="mt-2 h-12 rounded-xl bg-blue-800 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
						>
							Sign In
						</button>
					</form>
				</div>

				{/* Right: illustration */}
				<div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
					<div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
					<div className="relative">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
							Workspace pulse
						</p>
						<h2 className="mt-5 max-w-md text-4xl font-black leading-tight tracking-tight">
							Keep every fix in view.
						</h2>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
							A calmer way to triage work, share context, and ship with
							confidence.
						</p>
					</div>
					<div className="relative grid grid-cols-2 gap-3">
						<div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">
							<p className="text-sm text-slate-300">Issue tracking</p>
							<p className="mt-2 text-3xl font-bold">Focused</p>
						</div>
						<div className="rounded-2xl bg-emerald-400/15 p-5">
							<p className="text-sm text-emerald-200">Team workflow</p>
							<p className="mt-2 text-3xl font-bold text-emerald-300">Clear</p>
						</div>
						<div className="col-span-2 flex items-center justify-between rounded-2xl bg-blue-600 p-5">
							<div>
								<p className="text-sm text-blue-100">Sprint health</p>
								<p className="mt-1 text-2xl font-bold">On track</p>
							</div>
							<span className="text-3xl font-black">Live</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default Login;
