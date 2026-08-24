import { LoaderCircle } from "lucide-react";

type LoadingSpinnerProps = {
	label?: string;
	centered?: boolean;
};

export default function LoadingSpinner({
	label = "Loading",
	centered = true,
}: LoadingSpinnerProps) {
	return (
		<div
			className={
				centered
					? "flex min-h-48 w-full flex-col items-center justify-center gap-3 text-base text-slate-500"
					: "flex items-center gap-2 text-xs text-slate-500"
			}
			role="status"
			aria-live="polite"
		>
			<LoaderCircle
				size={centered ? 40 : 16}
				className="animate-spin text-blue-700"
				aria-hidden="true"
			/>
			<span>{label}</span>
		</div>
	);
}
