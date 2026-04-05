import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import Servic from "../../../components/Servic";
import {
  LANDING_SERVICE_CARD_LAYOUT,
  LANDING_SERVICE_KEYS,
} from "../../../data/cases";

/** Плитки услуг на лендинге фиксированы в коде (раскладка + ключи); не скрываем при пустом API. */
export default function Services() {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[1440px] flex-col items-center justify-center gap-[48px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]"
    >
      <Title title={t("services.title")} description={t("services.description")} />

      <div className="grid w-full grid-cols-1 gap-4 sm:gap-4 md:grid-cols-4 md:gap-[16px]">
        {LANDING_SERVICE_KEYS.map((key, index) => {
          const layout = LANDING_SERVICE_CARD_LAYOUT[key];
          if (!layout) return null;
          return (
            <div key={key} className="min-w-0">
              <Servic
                title={t(`services.items.${key}.title`)}
                price={t(`services.items.${key}.price`)}
                position={layout.position}
                img={layout.img}
                positionImg={layout.positionImg}
                to={`/services/${key}`}
                eagerImage={index < 2}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
