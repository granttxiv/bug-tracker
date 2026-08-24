"use client";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

type SignupProps = {
	name: string;
	email: string;
	password: string;
	company: string;
};

const Register = () => {
	const [show, setShow] = useState(false);
	const [fname, setFname] = useState("");
	const [lname, setLname] = useState("");
	const { handleSubmit, register, reset } = useForm<SignupProps>();

	const onSubmit = async (data: SignupProps) => {
		reset();
		data.name = fname + lname;
		try {	
			const response = await axios.post("api/auth/register", { ...data });
			console.log(response, "response");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<input
					type="text"
					placeholder="Firstname"
					{...register("name")}
					required
					onChange={(e) => {
						setFname(e.target.value);
					}}
				/>
				<input
					type="text"
					placeholder="Lastname"
					{...register("name")}
					required
					onChange={(e) => {
						setLname(e.target.value);
					}}
				/>
				<input
					type="email"
					placeholder="Email"
					{...register("email")}
					required
				/>
				<div className="relative">
					<input
						type={show ? "text" : "password"}
						placeholder="password"
						{...register("password")}
						required
					/>
					<button
						onClick={() => {
							setShow((v) => !v);
						}}
					>
						{show ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
				</div>
				<input
					type="text"
					placeholder="Company name"
					{...register("company")}
					required
				/>
			</form>
		</>
	);
};

export default Register;
