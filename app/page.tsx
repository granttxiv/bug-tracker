"use client";
import { useState } from "react";
import NavHeader from "./header/page";
import AddItemButton from "./modules/addItem/page";

type Task = {
	id: string;
	title: string;
	description: string;
	priority: string;
	status: string;
};

export default function Home() {
	const [tasks, setTasks] = useState<Task[]>([]);

	const handleAddTask = (
		title: string,
		description: string,
		priority: string,
		status: string,
	) => {
		setTasks((prev) => [
			...prev,
			{ id: crypto.randomUUID(), title, description, priority, status },
		]);
	};	

	return (
		<div className="flex flex-col flex-1 font-sans bg-gray-100 min-h-screen">
			<NavHeader className="bg-black w-full text-center" />
			<div className="flex justify-end p-4">
				<AddItemButton onAdd={handleAddTask} />
			</div>

			<div className="flex flex-col gap-2 px-4">
				{tasks.map((task) => (
					<div key={task.id} className="bg-white rounded-xl p-4 shadow-sm">
						<h3 className="font-semibold">{task.title}</h3>
						<p className="text-sm text-gray-600">{task.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}
