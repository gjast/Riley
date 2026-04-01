import Accordion from "../../../components/Accordion";
import Title from "../../../components/Title";

const FAQ_ITEMS = [
  { id: 1, question: "How long does a project take?", answer: "7–30 days depending on scope." },
  { id: 2, question: "What is included in the price?", answer: "Design, dev, revisions, deployment." },
  { id: 3, question: "How do I start?", answer: "Fill out the Start form with your details." },
];

export default function FAQ() {
  return (
    <div
      id="faq"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[812px] flex-col items-center gap-8 sm:w-[calc(100%-3rem)] sm:gap-9 md:gap-[32px] lg:w-[calc(100%-100px)]"
    >
      <Title title="FAQ" description="" />
      <Accordion items={FAQ_ITEMS} />
    </div>
  );
}