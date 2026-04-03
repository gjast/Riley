import { useTranslation } from "react-i18next";
import Title from "../../../components/Title";
import Servic from "../../../components/Servic";

const SERVICES_LAYOUT = [
  {
    key: "web",
    position: "justify-start items-end",
    img: "./imgs/serv/web.png",
    positionImg: "h-auto pb-[15px]",
  },
  {
    key: "landing",
    position: "justify-end items-end",
    positionImg: "h-full",
    img: "./imgs/serv/land.png",
  },
  {
    key: "logotypes",
    position: "justify-end items-start",
    positionImg: "h-full",
    img: "./imgs/serv/logo.png",
  },
  {
    key: "illustrations",
    position: "justify-end items-start",
    positionImg: "h-full",
    img: "./imgs/serv/pen.png",
  },
];

export default function Services() {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className="mx-auto flex w-[calc(100%-2rem)] max-w-[1440px] flex-col items-center justify-center gap-[48px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]"
    >
      <Title title={t("services.title")} description={t("services.description")} />

      <div className="grid w-full grid-cols-1 gap-4 sm:gap-4 md:grid-cols-4 md:gap-[16px]">
        {SERVICES_LAYOUT.map((item) => (
          <div key={item.key} className="min-w-0">
            <Servic
              title={t(`services.items.${item.key}.title`)}
              price={t(`services.items.${item.key}.price`)}
              position={item.position}
              img={item.img}
              positionImg={item.positionImg}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
