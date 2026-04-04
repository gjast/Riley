import { useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import StartItem from "../../../components/StartItem";
import PresetTextField from "../../../components/PresetTextField";
import Textarea from "../../../components/Textarea";
import Input from "../../../components/Input";
import CTA from "../../../components/CTA";
import { submitStartForm } from "../../../api/submitStartForm";

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

/** Пока не трогали поле — видно как значение; при фокусе сбрасывается до «@» */
const CONTACT_FIELD_DEFAULT = "@username";

/** Telegram: один @ в начале, без пробелов в нике, до 32 символов после @ */
const MAX_CONTACT_USERNAME = 32;

function formatContactHandle(raw) {
	let v = String(raw ?? "");
	if (v === CONTACT_FIELD_DEFAULT) {
		return v;
	}
	if (!v.startsWith("@")) {
		v = `@${v.replace(/@/g, "")}`;
	}
	let rest = v.slice(1).replace(/@/g, "").replace(/\s/g, "");
	if (rest.length > MAX_CONTACT_USERNAME) {
		rest = rest.slice(0, MAX_CONTACT_USERNAME);
	}
	return `@${rest}`;
}

const INITIAL_STATE = {
	budget: "$750",
	budgetHint: "$750",
	deadline: "7d",
	deadlineHint: "7d",
	name: CONTACT_FIELD_DEFAULT,
	desc: "",
	activeIndex: 0,
};

export default function Start() {
	const { t } = useTranslation();
	const [form, setForm] = useState(INITIAL_STATE);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState(null);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const contactInputRef = useRef(null);

	const serviceItems = useMemo(
		() =>
			START_SERVICE_LAYOUT.map((item) => ({
				...item,
				title: t(`start.serviceLabels.${item.key}`),
			})),
		[t],
	);

	const setField = useCallback(
		(key) => (value) => {
			setForm((prev) => ({ ...prev, [key]: value }));
			setSubmitError(null);
			setSubmitSuccess(false);
		},
		[],
	);

	const handleClear = useCallback(() => {
		setForm(INITIAL_STATE);
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const pickBudgetPreset = useCallback((hint) => {
		setForm((prev) => ({
			...prev,
			budgetHint: hint,
			budget: hint,
		}));
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const pickDeadlinePreset = useCallback((hint) => {
		setForm((prev) => ({
			...prev,
			deadlineHint: hint,
			deadline: hint,
		}));
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const handleBudgetChange = useCallback((raw) => {
		setForm((prev) => ({ ...prev, budget: formatBudgetValue(raw) }));
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const handleDeadlineChange = useCallback((raw) => {
		setForm((prev) => ({ ...prev, deadline: formatDeadlineValue(raw) }));
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const handleContactChange = useCallback((raw) => {
		setForm((prev) => ({ ...prev, name: formatContactHandle(raw) }));
		setSubmitError(null);
		setSubmitSuccess(false);
	}, []);

	const handleContactFocus = useCallback((e) => {
		if (e.target.value !== CONTACT_FIELD_DEFAULT) return;
		setForm((prev) => ({ ...prev, name: "@" }));
		setSubmitError(null);
		setSubmitSuccess(false);
		queueMicrotask(() => {
			const el = contactInputRef.current;
			if (el && el.value === "@") {
				el.setSelectionRange(1, 1);
			}
		});
	}, []);

	const contactFilled =
		form.name.length > 1 && form.name !== CONTACT_FIELD_DEFAULT;

	const isFormComplete =
		form.budget.trim().length > 0 &&
		form.deadline.trim().length > 0 &&
		contactFilled &&
		form.desc.trim().length > 0;

	const handleSubmit = useCallback(async () => {
		setSubmitError(null);
		setSubmitSuccess(false);

		if (!form.budget.trim()) {
			setSubmitError("start.validationBudget");
			return;
		}
		if (!form.deadline.trim()) {
			setSubmitError("start.validationDeadline");
			return;
		}
		if (!contactFilled) {
			setSubmitError("start.validationContact");
			return;
		}
		if (!form.desc.trim()) {
			setSubmitError("start.validationComment");
			return;
		}

		const serviceTitle =
			serviceItems[form.activeIndex]?.title?.trim() || "";

		setSubmitting(true);
		try {
			const { ok, data } = await submitStartForm({
				service: serviceTitle,
				budget: form.budget.trim(),
				deadline: form.deadline.trim(),
				contact: form.name.trim(),
				comment: form.desc.trim(),
			});

			if (ok) {
				setSubmitSuccess(true);
				setForm(INITIAL_STATE);
				window.setTimeout(() => setSubmitSuccess(false), 6000);
			} else {
				const code = data?.error;
				if (code === "telegram_not_configured") {
					setSubmitError("start.errorTelegramConfig");
				} else if (code === "validation_failed") {
					setSubmitError("start.validationGeneric");
				} else {
					setSubmitError("start.errorSend");
				}
			}
		} catch {
			setSubmitError("start.errorNetwork");
		} finally {
			setSubmitting(false);
		}
	}, [form, serviceItems, contactFilled]);

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
						onClick={() => {
							setField("activeIndex")(idx);
						}}
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
					ref={contactInputRef}
					label={t("start.contactLabel")}
					value={form.name}
					onChange={handleContactChange}
					onFocus={handleContactFocus}
					placeholder="@username"
				/>
				<Textarea
					label={t("start.commentLabel")}
					value={form.desc}
					onChange={setField("desc")}
					placeholder={t("start.placeholderComment")}
				/>

				{submitError ? (
					<p
						className="text-[15px] leading-[150%] text-red-400"
						role="alert"
					>
						{t(submitError)}
					</p>
				) : null}
				{submitSuccess ? (
					<p className="text-[15px] leading-[150%] text-emerald-400" role="status">
						{t("start.submitSuccess")}
					</p>
				) : null}

				<div className="mt-3 flex w-full flex-col-reverse gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
					<button
						type="button"
						onClick={handleClear}
						disabled={submitting}
						className="h-[42px] w-full cursor-pointer rounded-[10px] bg-[#141517] px-5 text-[16px] font-medium leading-[150%] tracking-[-0.02em] text-[#A1A1AA] transition-[background-color,transform] duration-300 hover:bg-[#2a2f38] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:px-6 md:text-[18px] md:px-[24px]"
					>
						{t("start.clear")}
					</button>
					<CTA
						text={submitting ? t("start.submitting") : t("header.CTA")}
						onClick={handleSubmit}
						disabled={submitting || !isFormComplete}
						className="w-full sm:w-auto"
					/>
				</div>
			</div>
		</div>
	);
}
