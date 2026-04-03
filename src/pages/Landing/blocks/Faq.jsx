import { useTranslation } from "react-i18next";
import Accordion from "../../../components/Accordion";
import Title from "../../../components/Title";

export default function FAQ() {
  const { t } = useTranslation();

  const raw = t("faq.items", { returnObjects: true });
  const faqItems = Array.isArray(raw)
    ? raw.map((item, idx) => ({
        id: idx + 1,
        question: item.question,
        answer: item.answer,
      }))
    : [];

  return (
    <div
      id="faq"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[812px] flex-col items-center gap-8 sm:w-[calc(100%-3rem)] sm:gap-9 md:gap-[32px] lg:w-[calc(100%-100px)]"
    >
      <Title title={t("faq.title")} description="" />
      <Accordion items={faqItems} />
    </div>
  );
}