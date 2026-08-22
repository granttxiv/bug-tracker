"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";

const Login = () => {
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();

	const onSubmit = (data) => console.log(data);

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
								className="w-full h-12 px-4 rounded-lg bg-white border border-[#E3DED6] text-sm text-[#221D1E] placeholder:text-[#9C9791] outline-none focus:ring-2 focus:ring-[#9C6577] transition"
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
									className="w-full h-12 px-4 pr-11 rounded-lg bg-white border border-[#E3DED6] text-sm text-[#221D1E] placeholder:text-[#9C9791] outline-none focus:ring-2 focus:ring-[#9C6577] transition"
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
							className="mt-2 h-12 rounded-lg bg-[#9C6577] text-white text-sm font-semibold hover:bg-[#8A5769] active:scale-[0.99] transition"
						>
							Sign In
						</button>

						<div className="flex items-center gap-3 mt-4">
							<div className="h-px flex-1 bg-[#E3DED6]" />
							<span className="text-xs text-[#9C9791]">Or continue with</span>
							<div className="h-px flex-1 bg-[#E3DED6]" />
						</div>

						<div className="flex items-center justify-center gap-3 mt-2">
							<SocialButton label="Continue with Google" dark={undefined}>
								<GoogleIcon />
							</SocialButton>
							<SocialButton label="Continue with Apple" dark>
								<AppleIcon />
							</SocialButton>
							<SocialButton label="Continue with Facebook" dark={undefined}>
								<FacebookIcon />
							</SocialButton>
						</div>
					</form>
				</div>

				{/* Right: illustration */}
				<div className="relative hidden lg:block m-3 rounded-3xl overflow-hidden">
					<SunsetIllustration />

					<p className="absolute left-8 bottom-16 right-8 text-white text-lg font-medium drop-shadow-sm">
						Finally, all your work in one place.
					</p>

					<div className="absolute left-8 bottom-8 flex gap-2">
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

const SocialButton = ({ children, label, dark }) => (
	<button
		type="button"
		aria-label={label}
		className={`w-12 h-12 rounded-xl border flex items-center justify-center transition ${
			dark
				? "bg-[#221D1E] border-[#221D1E] hover:opacity-90"
				: "bg-white border-[#E3DED6] hover:border-[#9C9791]"
		}`}
	>
		{children}
	</button>
);

const NavCircle = ({ children }) => (
	<button
		type="button"
		className="w-9 h-9 rounded-full border border-white/70 text-white flex items-center justify-center hover:bg-white/10 transition"
	>
		{children}
	</button>
);

const GoogleIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20">
		<path
			fill="#4285F4"
			d="M19.6 10.2c0-.7-.06-1.36-.17-2H10v3.79h5.38c-.23 1.24-.94 2.3-2 3v2.48h3.23c1.9-1.75 2.99-4.32 2.99-7.27z"
		/>
		<path
			fill="#34A853"
			d="M10 20c2.7 0 4.96-.9 6.61-2.43l-3.23-2.48c-.9.6-2.04.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H1.06v2.56A9.998 9.998 0 0 0 10 20z"
		/>
		<path
			fill="#FBBC05"
			d="M4.41 11.94A5.99 5.99 0 0 1 4.09 10c0-.67.12-1.32.32-1.94V5.5H1.06A9.998 9.998 0 0 0 0 10c0 1.61.39 3.14 1.06 4.5l3.35-2.56z"
		/>
		<path
			fill="#EA4335"
			d="M10 3.96c1.47 0 2.79.5 3.82 1.49l2.87-2.87C14.95.9 12.7 0 10 0 6.09 0 2.71 2.24 1.06 5.5l3.35 2.56C5.2 5.71 7.4 3.96 10 3.96z"
		/>
	</svg>
);

const AppleIcon = () => (
	<svg width="18" height="18" viewBox="0 0 20 20" fill="white">
		<path d="M14.94 5.19c-.83.98-2.16 1.75-3.49 1.64-.17-1.33.47-2.72 1.24-3.58C13.52 2.25 14.94 1.6 16.1 1.5c.14 1.4-.4 2.77-1.16 3.69zM16.08 6.9c-1.93-.11-3.57 1.1-4.5 1.1-.94 0-2.35-1.04-3.88-1.02-2 .03-3.84 1.16-4.86 2.95-2.08 3.6-.54 8.93 1.49 11.85.99 1.44 2.17 3.05 3.73 2.99 1.49-.06 2.06-.96 3.86-.96 1.8 0 2.31.96 3.88.93 1.6-.03 2.62-1.46 3.6-2.9 1.13-1.66 1.6-3.28 1.62-3.36-.04-.02-3.12-1.2-3.15-4.76-.03-2.98 2.44-4.41 2.55-4.48-1.4-2.06-3.57-2.29-4.34-2.34z" />
	</svg>
);

const FacebookIcon = () => (
	<svg width="20" height="20" viewBox="0 0 20 20">
		<path
			fill="#1877F2"
			d="M20 10a10 10 0 1 0-11.56 9.88v-6.99H5.9V10h2.54V7.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V10h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 20 10z"
		/>
	</svg>
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
