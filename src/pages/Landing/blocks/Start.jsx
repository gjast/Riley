import { useState, useRef, useEffect, useCallback } from "react";
import Title from "../../../components/Title";
import StartItem from "../../../components/StartItem";
import Dropdown from "../../../components/Dropdown";
import Textarea from "../../../components/Textarea";
import Input from "../../../components/Input";
import CTA from "../../../components/CTA";

const SERVICE_ITEMS = [
	{
		img: "/imgs/starts/i1.svg",
		title: "Web",
		position: "bottom-0 right-0 w-[231px] h-[112px]",
	},
	{
		img: "/imgs/starts/i2.svg",
		title: "Logotype",
		position: "bottom-0 right-[50%] translate-x-[50%] w-[212px] h-[112px]",
	},
	{
		img: "/imgs/starts/i3.svg",
		title: "Landing",
		position: "bottom-0 left-[50%] translate-x-[-50%] w-[196px] h-[113px]",
	},
];

const INITIAL_STATE = {
	budget: "$750",
	deadline: "7d",
	name: "",
	desc: "",
	activeIndex: 0,
};

export default function Start() {
	const [form, setForm] = useState(INITIAL_STATE);
	const dropdownRef = useRef(null);

	const setField = useCallback(
		(key) => (value) => {
			setForm((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const handleClear = useCallback(() => {
		setForm(INITIAL_STATE);
	}, []);

	useEffect(() => {
		const handleClick = (e) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div
			id="process"
			className="mx-auto flex w-[calc(100%-2rem)] max-w-[812px] flex-col items-center justify-center gap-8 sm:w-[calc(100%-3rem)] sm:gap-10 md:gap-12 lg:w-[calc(100%-100px)] lg:gap-[48px]"
		>
			<Title
				title="Start a Project"
				description="Choose a service and provide your project details."
			/>

			<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-[12px] lg:grid-cols-3">
				{SERVICE_ITEMS.map((item, idx) => (
					<div
						key={item.title}
						role="button"
						tabIndex={0}
						onClick={() => setField("activeIndex")(idx)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setField("activeIndex")(idx);
							}
						}}
						className="cursor-pointer"
					>
						<StartItem
							img={item.img}
							title={item.title}
							active={form.activeIndex === idx}
							position={item.position}
						/>
					</div>
				))}
			</div>

			<div className="flex w-full max-w-full flex-col gap-3 sm:gap-[12px]">
				<Dropdown
					label="Budget:"
					value={form.budget}
					onChange={setField("budget")}
					options={["$100", "$250", "$500", "$750", "$1000+"]}
				/>
				<Dropdown
					label="Deadline"
					value={form.deadline}
					onChange={setField("deadline")}
					options={["7d", "12d", "14d", "21d", "30d"]}
				/>
				<Input
					label="Contact Address"
					value={form.name}
					onChange={setField("name")}
					placeholder="@username"
				/>
				<Textarea
					label="Comment"
					value={form.desc}
					onChange={setField("desc")}
					placeholder="Describe your project..."
				/>
				<div className="mt-3 flex w-full flex-col-reverse gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<button
						type="button"
						onClick={handleClear}
						className="h-[42px] w-full rounded-[10px] bg-[#141517] px-5 text-[16px] font-medium leading-[150%] tracking-[-0.02em] text-[#A1A1AA] transition-[background-color,transform] duration-300 hover:bg-[#2a2f38] active:scale-95 sm:w-auto sm:px-6 md:text-[18px] md:px-[24px]"
					>
						Clear
					</button>
					<CTA
						text="Make an order"
						onClick={handleClear}
						className="w-full sm:w-auto"
					/>
				</div>
			</div>
		</div>
	);
}
