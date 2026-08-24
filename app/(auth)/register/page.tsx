"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type SignupFormValues = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	company: string;
};

const inputClass =
	"h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100";

const Register = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting },
	} = useForm<SignupFormValues>();

	const onSubmit = async (data: SignupFormValues) => {
		setSubmitError("");
		try {
			const response = await axios.post("/api/auth/register", {
				name: `${data.firstName} ${data.lastName}`.trim(),
				email: data.email,
				password: data.password,
				company: data.company,
			});
			if (response.status === 201) router.push("/dashboard");
		} catch (error) {
			setSubmitError(
				axios.isAxiosError(error)
					? (error.response?.data?.error ??
							"Unable to create your account. Please try again.")
					: "Unable to create your account. Please try again.",
			);
		}
	};

	return (
		<div className="min-h-screen w-full bg-linear-to-br from-slate-100 via-white to-slate-200 px-5 py-8 md:px-8 md:py-12">
			<div className="mx-auto grid min-h-160 max-w-5xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
				<section className="flex flex-col justify-center px-6 py-12 sm:px-14">
					<Link
						href="/"
						className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700"
					>
						Bug Tracker
					</Link>
					<h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
						Set up your workspace
					</h1>
					<p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
						Create an account and give your team a clearer view of the work
						ahead.
					</p>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-8 grid max-w-md gap-4"
						noValidate
					>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field label="First name" error={errors.firstName?.message}>
								<input
									className={inputClass}
									placeholder="Alex"
									{...register("firstName", {
										required: "First name is required",
									})}
								/>
							</Field>
							<Field label="Last name" error={errors.lastName?.message}>
								<input
									className={inputClass}
									placeholder="Morgan"
									{...register("lastName", {
										required: "Last name is required",
									})}
								/>
							</Field>
						</div>
						<Field label="Work email" error={errors.email?.message}>
							<input
								type="email"
								className={inputClass}
								placeholder="you@company.com"
								{...register("email", { required: "Email is required" })}
							/>
						</Field>
						<Field label="Password" error={errors.password?.message}>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									className={`${inputClass} pr-11`}
									placeholder="At least 8 characters"
									{...register("password", {
										required: "Password is required",
										minLength: {
											value: 8,
											message: "Use at least 8 characters",
										},
									})}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((value) => !value)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
						</Field>
						<Field label="Company name" error={errors.company?.message}>
							<input
								className={inputClass}
								placeholder="Acme Inc."
								{...register("company")}
							/>
						</Field>
						{submitError && (
							<p className="text-sm text-red-600">{submitError}</p>
						)}
						<button
							type="submit"
							disabled={isSubmitting}
							className="h-12 rounded-xl bg-blue-700 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSubmitting ? "Creating account..." : "Create account"}
						</button>
						<p className="text-center text-sm text-slate-500">
							Already have an account?{" "}
							<Link
								href="/login"
								className="font-semibold text-blue-700 hover:text-blue-600"
							>
								Sign in
							</Link>
						</p>
					</form>
				</section>

				<aside className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
					<div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
					<div className="relative">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
							Built for momentum
						</p>
						<h2 className="mt-5 max-w-sm text-4xl font-black leading-tight tracking-tight">
							Less hunting. More shipping.
						</h2>
						<p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
							Bring issues, owners, and progress into one focused workspace.
						</p>
					</div>
					<div className="relative space-y-3 text-sm">
						{[
							"One view for every issue",
							"Clear ownership across the team",
							"Progress you can act on",
						].map((item) => (
							<div
								key={item}
								className="flex items-center gap-3 rounded-2xl bg-white/10 p-4"
							>
								<span className="h-2 w-2 rounded-full bg-cyan-300" />
								{item}
							</div>
						))}
					</div>
				</aside>
			</div>
		</div>
	);
};

const Field = ({
	label,
	error,
	children,
}: {
	label: string;
	error?: string;
	children: React.ReactNode;
}) => (
	<label className="block text-sm font-medium text-slate-700">
		{label}
		<span className="mt-2 block">{children}</span>
		{error && (
			<span className="mt-1 block text-xs font-normal text-red-600">
				{error}
			</span>
		)}
	</label>
);

export default Register;
