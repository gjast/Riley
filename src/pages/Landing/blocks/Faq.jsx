import Accordion from "../../../components/Accordion";
import Title from "../../../components/Title";

const FAQ_ITEMS = [
	{
		id: 1,
		question: "What kind of projects do you take on?",
		answer:
			"I work on landing pages, SaaS interfaces, dashboards, and redesigns. The focus is on structured, product-oriented design.",
	},
	{
		id: 2,
		question: "Do you handle both UX and UI?",
		answer:
			"Yes, I work with flows, layout logic, and interface design. The focus is on usability and clear interaction, not just visuals.",
	},
	{
		id: 3,
		question: "How is the project structured?",
		answer:
			"Each project follows a defined workflow: brief, structure, interface design, and refinement. The process adapts to the scope and complexity.",
	},
	{
		id: 4,
		question: "Can you redesign an existing product?",
		answer:
			"Yes, from targeted UX improvements to full redesigns. I work with both existing products and new concepts.",
	},
	{
		id: 5,
		question: "Do you prepare files for development?",
		answer:
			"Yes, designs are structured and ready for implementation. This includes components, auto layout, and clear hierarchy.",
	},
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