import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import Case from "../../../components/Case";
import { useCasesHydrated } from "../../../data/useCasesHydrated";
import { useCases } from "../../../data/useCases";

export default function Cases() {
  const { t } = useTranslation();
  const hydrated = useCasesHydrated();
  const cases = useCases();

  if (!hydrated || cases.length === 0) {
    return null;
  }

  return (
    <div
      id="cases"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[1440px] flex-col items-center justify-center gap-8 sm:w-[calc(100%-3rem)] sm:gap-10 md:gap-12 lg:w-[calc(100%-100px)] lg:gap-[48px]"
    >
      <Title title={t("cases.title")} description={t("cases.description")} />

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-[24px]">
        {cases.map((item, index) => (
          <Case
            key={item.id}
            img={item.img}
            title={item.title}
            to={`/portfolio/${item.id}`}
            eager={index < 4}
          />
        ))}
      </div>
    </div>
  );
}
