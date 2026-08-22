"use client";
import { useForm } from "react-hook-form";

const Login = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	return (
		<>
			<form onSubmit={handleSubmit((data) => console.log(data))} className="flex flex-col gap-4 max-w-sm mx-auto mt-10 ">
				<input
					type="email"
					placeholder="Email"
          className="outline"
					{...register("email", { required: "Email is required" })}
				/>
				{/* {errors.email && <p>{errors.email.message}</p>} */}

				<input
					type="password"
					placeholder="Password"
					{...register("password", { required: "Password is required" })}
				/>
				{/* {errors.password && <p>{errors.password.message}</p>} */}

				<button type="submit" className="bg-blue-800 text-white py-2 px-4 rounded">
					Login
				</button>
			</form>
		</>
	);
};

export default Login;
