"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

type LoginFormValues = {
	email: string;
	password: string;
};

const Login = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>();

	const onSubmit = async (data: LoginFormValues) => {
		console.log(data);	
		try {
			const response = await axios.post("/api/auth/login", data);
			console.log("Login response:", response);
			if (response.status === 200) {
				// Handle successful login, e.g., store token, redirect, etc.
				router.push("/dashboard");
			}
		} catch (error) {
			console.error("Login error:", error);
		}
	};

	return (
		<div className="min-h-screen w-full flex items-center justify-center bg-[#EFE8E2] p-6">
			<div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-[#F4F1EC] rounded-[28px] shadow-xl overflow-hidden">
				{/* Left: form */}
				<div className="flex flex-col justify-center px-10 py-14 sm:px-16">
					<h1 className="text-4xl font-bold text-[#221D1E] tracking-tight">
						Hello Again!
					</h1>

					<form
						onSubmit={handleSubmit(onSubmit)}
						className="mt-10 flex flex-col gap-4 max-w-sm"
						noValidate
					>
						<div>
							<input
								type="email"
								placeholder="Email"
								className="w-full h-12 px-4 rounded-lg bg-white border border-[#E3DED6] text-sm text-[#221D1E] placeholder:text-[#9C9791] outline-none focus:ring-2 focus:ring-blue-800 transition"
								{...register("email", { required: "Email is required" })}
							/>
							{errors.email && (
								<p className="mt-1 text-xs text-[#B4443E]">
									{/* {errors.email.message} */}
								</p>
							)}
						</div>

						<div>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									placeholder="Password"
									className="w-full h-12 px-4 pr-11 rounded-lg bg-white border border-[#E3DED6] text-sm text-[#221D1E] placeholder:text-[#9C9791] outline-none focus:ring-2 focus:ring-blue-800 transition"
									{...register("password", {
										required: "Password is required",
									})}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									aria-label={showPassword ? "Hide password" : "Show password"}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9C9791] hover:text-[#221D1E] transition"
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							</div>
							{errors.password && (
								<p className="mt-1 text-xs text-[#B4443E]">
									{/* {errors.password.message} */}
								</p>
							)}
						</div>

						<div className="flex justify-end">
							<button
								type="button"
								className="text-xs text-[#6B655F] hover:text-[#221D1E] transition"
							>
								Recovery Password
							</button>
						</div>

						<button
							type="submit"
							className="mt-2 h-12 rounded-lg bg-blue-800 text-white text-sm font-semibold hover:bg-blue-900 active:scale-[0.99] transition"
						>
							Sign In
						</button>
					</form>
				</div>

				{/* Right: illustration */}
				<div className="relative hidden lg:block m-3 rounded-3xl overflow-hidden">
					<SunsetIllustration />

					<p className="absolute left-8 bottom-16 right-8 text-white text-lg font-medium drop-shadow-sm">
						Finally, all your work in one place.
					</p>

					<div className="absolute left-8 bottom-8 flex gap-2 justify-center items-center">
						<NavCircle>
							<ArrowLeft size={16} />
						</NavCircle>
						<NavCircle>
							<ArrowRight size={16} />
						</NavCircle>
					</div>
				</div>
			</div>
		</div>
	);
};

const NavCircle = ({ children }: { children: React.ReactNode }) => (
	<button
		type="button"
		className="w-9 h-9 rounded-full border border-white/70 text-white flex items-center justify-center hover:bg-white/10 transition"
	>
		{children}
	</button>
);

const SunsetIllustration = () => (
	<svg
		viewBox="0 0 600 760"
		className="absolute inset-0 w-full h-full"
		preserveAspectRatio="xMidYMid slice"
	>
		<defs>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#5A4066" />
				<stop offset="45%" stopColor="#D98A5E" />
				<stop offset="70%" stopColor="#F0B979" />
				<stop offset="100%" stopColor="#8B7FBE" />
			</linearGradient>
			<linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stopColor="#C7B7DE" />
				<stop offset="100%" stopColor="#7C6AA6" />
			</linearGradient>
			<radialGradient id="sun" cx="50%" cy="50%" r="50%">
				<stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.95" />
				<stop offset="60%" stopColor="#FBDFA0" stopOpacity="0.5" />
				<stop offset="100%" stopColor="#FBDFA0" stopOpacity="0" />
			</radialGradient>
		</defs>

		<rect x="0" y="0" width="600" height="760" fill="url(#sky)" />
		<circle cx="230" cy="300" r="150" fill="url(#sun)" />
		<circle cx="230" cy="300" r="65" fill="#FFF3D9" />

		{/* far hills */}
		<path
			d="M0 430 Q120 380 260 420 T600 400 V500 H0 Z"
			fill="#3B2E4A"
			opacity="0.55"
		/>

		{/* water */}
		<path d="M0 430 Q150 470 300 435 T600 430 V760 H0 Z" fill="url(#water)" />
		<path
			d="M0 445 Q160 480 320 448 T600 450"
			fill="none"
			stroke="#F0B979"
			strokeOpacity="0.4"
			strokeWidth="3"
		/>

		{/* near dark ridge */}
		<path
			d="M320 470 C400 420 470 440 520 500 C560 545 600 540 600 540 V760 H300 Z"
			fill="#231B2E"
		/>
		<path
			d="M0 520 C60 480 130 500 180 540 C220 570 260 560 300 540 V760 H0 Z"
			fill="#2C2237"
		/>

		{/* bare trees */}
		{[
			{ x: 110, s: 1 },
			{ x: 175, s: 0.8 },
			{ x: 400, s: 0.9 },
			{ x: 470, s: 1.1 },
			{ x: 545, s: 0.75 },
		].map((t, i) => (
			<g key={i} transform={`translate(${t.x} 600) scale(${t.s})`}>
				<rect x="-3" y="0" width="6" height="90" fill="#1B1420" />
				<path
					d="M0 0 C-18 10 -30 0 -34 -14 M0 0 C18 10 30 0 34 -14 M0 20 C-14 28 -24 20 -28 8 M0 20 C14 28 24 20 28 8 M0 -14 L0 -34"
					stroke="#1B1420"
					strokeWidth="4"
					fill="none"
					strokeLinecap="round"
				/>
			</g>
		))}
	</svg>
);

export default Login;
