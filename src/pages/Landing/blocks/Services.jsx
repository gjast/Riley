import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import Servic from "../../../components/Servic";
import { useLandingServices } from "../../../data/useLandingServices";

export default function Services() {
  const { t } = useTranslation();
  const landingServices = useLandingServices();

  return (
    <section
      id="services"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[1440px] flex-col items-center justify-center gap-[48px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]"
    >
      <Title title={t("services.title")} description={t("services.description")} />

      <div className="grid w-full grid-cols-1 gap-4 sm:gap-4 md:grid-cols-4 md:gap-[16px]">
        {landingServices.map((item) => (
          <div key={item.key} className="min-w-0">
            <Servic
              title={
                item.title.trim() ||
                t(`services.items.${item.key}.title`)
              }
              price={
                item.price.trim() ||
                t(`services.items.${item.key}.price`)
              }
              position={item.position}
              img={item.img}
              positionImg={item.positionImg}
              to={`/portfolio/${item.portfolioCaseId}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
