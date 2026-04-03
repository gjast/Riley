import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import StartItem from "../../../components/StartItem";
import PresetTextField from "../../../components/PresetTextField";
import Textarea from "../../../components/Textarea";
import Input from "../../../components/Input";
import CTA from "../../../components/CTA";

const START_SERVICE_LAYOUT = [
	{
		key: "web",
		img: "/imgs/starts/i1.svg",
		position: "bottom-0 right-0 w-[231px] h-[112px]",
	},
	{
		key: "logotype",
		img: "/imgs/starts/i2.svg",
		position: "bottom-0 right-[50%] translate-x-[50%] w-[212px] h-[112px]",
	},
	{
		key: "landing",
		img: "/imgs/starts/i3.svg",
		position: "bottom-0 left-[50%] translate-x-[-50%] w-[196px] h-[113px]",
	},
];

const BUDGET_PRESETS = ["$100", "$250", "$500", "$750", "$1000+"];

const DEADLINE_PRESETS = ["7d", "12d", "14d", "21d", "30d"];

/** Макс. длина строки значения (включая $ или d) */
const MAX_FIELD_CHARS = 10;
/** Цифр после $ (итого с $ не больше MAX_FIELD_CHARS) */
const BUDGET_MAX_DIGITS = 9;
const DEADLINE_MAX_DAYS = 365;
/** Дней не больше трёх цифр + суффикс d */
const DEADLINE_MAX_DIGITS = 3;

function formatBudgetValue(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, BUDGET_MAX_DIGITS);
	if (!digits) return "";
	const out = `$${digits}`;
	return out.length > MAX_FIELD_CHARS ? out.slice(0, MAX_FIELD_CHARS) : out;
}

function formatDeadlineValue(raw) {
	const digits = raw.replace(/\D/g, "").slice(0, DEADLINE_MAX_DIGITS);
	if (!digits) return "";
	let n = parseInt(digits, 10);
	if (Number.isNaN(n)) return "";
	n = Math.min(Math.max(n, 0), DEADLINE_MAX_DAYS);
	const out = `${n}d`;
	return out.length > MAX_FIELD_CHARS ? out.slice(0, MAX_FIELD_CHARS) : out;
}

const INITIAL_STATE = {
	budget: "",
	budgetHint: "$750",
	deadline: "",
	deadlineHint: "7d",
	name: "",
	desc: "",
	activeIndex: 0,
};

export default function Start() {
	const { t } = useTranslation();
	const [form, setForm] = useState(INITIAL_STATE);

	const serviceItems = START_SERVICE_LAYOUT.map((item) => ({
		...item,
		title: t(`start.serviceLabels.${item.key}`),
	}));

	const setField = useCallback(
		(key) => (value) => {
			setForm((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const handleClear = useCallback(() => {
		setForm(INITIAL_STATE);
	}, []);

	const pickBudgetPreset = useCallback((hint) => {
		setForm((prev) => ({ ...prev, budgetHint: hint, budget: "" }));
	}, []);

	const pickDeadlinePreset = useCallback((hint) => {
		setForm((prev) => ({ ...prev, deadlineHint: hint, deadline: "" }));
	}, []);

	const handleBudgetChange = useCallback((raw) => {
		setForm((prev) => ({ ...prev, budget: formatBudgetValue(raw) }));
	}, []);

	const handleDeadlineChange = useCallback((raw) => {
		setForm((prev) => ({ ...prev, deadline: formatDeadlineValue(raw) }));
	}, []);

	return (
		<div
			id="process"
			className="mx-auto flex w-[calc(100%-2rem)] max-w-[812px] flex-col items-center justify-center gap-8 sm:w-[calc(100%-3rem)] sm:gap-10 md:gap-12 lg:w-[calc(100%-100px)] lg:gap-[48px]"
		>
			<Title title={t("start.title")} description={t("start.description")} />

			<div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3 md:gap-[12px] lg:grid-cols-3">
				{serviceItems.map((item, idx) => (
					<div
						key={item.key}
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
				<PresetTextField
					label={t("start.budgetLabel")}
					value={form.budget}
					onChange={handleBudgetChange}
					hintPlaceholder={form.budgetHint}
					onPresetPick={pickBudgetPreset}
					presets={BUDGET_PRESETS}
					inputMode="numeric"
				/>
				<PresetTextField
					label={t("start.deadlineLabel")}
					value={form.deadline}
					onChange={handleDeadlineChange}
					hintPlaceholder={form.deadlineHint}
					onPresetPick={pickDeadlinePreset}
					presets={DEADLINE_PRESETS}
					inputMode="numeric"
				/>
				<Input
					label={t("start.contactLabel")}
					value={form.name}
					onChange={setField("name")}
					placeholder="@username"
				/>
				<Textarea
					label={t("start.commentLabel")}
					value={form.desc}
					onChange={setField("desc")}
					placeholder={t("start.placeholderComment")}
				/>
				<div className="mt-3 flex w-full flex-col-reverse gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<button
						type="button"
						onClick={handleClear}
						className="h-[42px] w-full rounded-[10px] bg-[#141517] px-5 text-[16px] font-medium leading-[150%] tracking-[-0.02em] text-[#A1A1AA] transition-[background-color,transform] duration-300 hover:bg-[#2a2f38] active:scale-95 sm:w-auto sm:px-6 md:text-[18px] md:px-[24px] cursor-pointer"
					>
						{t("start.clear")}
					</button>
					<CTA
						text={t("header.CTA")}
						onClick={handleClear}
						className="w-full sm:w-auto"
					/>
				</div>
			</div>
		</div>
	);
}
