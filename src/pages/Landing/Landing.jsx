import Header from "../../components/Header";
import MotionReveal from "../../components/MotionReveal";
import LineItem from "../../components/LineItem";
import Hero from "./blocks/Hero";
import LogoLoop from "./blocks/LogoLoop";
import Services from "./blocks/Services";
import Cases from "./blocks/Cases";
import Start from "./blocks/Start";
import Faq from "./blocks/Faq";
import Footer from "./blocks/Footer";
const LINE_ITEMS = [
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },

  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
  },
];

const sectionScrollRevealClass =
  "w-full flex justify-center";

export default function Landing() {
  return (
    <div className="flex flex-col items-center">
      <Header />

      <div className="flex w-full justify-center">
        <Hero />
      </div>

      <LogoLoop
        logos={LINE_ITEMS}
        gap={16}
        speed={30}
        logoHeight={86}
        renderItem={(item) => (
          <LineItem img={item.img} width={item.width} height={item.height} />
        )}
      />

      <div className="mb-[64px] mt-[96px] flex w-full flex-col items-center justify-center gap-[96px]">
        <MotionReveal className={sectionScrollRevealClass}>
          <Services />
        </MotionReveal>
        <MotionReveal className={sectionScrollRevealClass}>
          <Cases />
        </MotionReveal>
        <MotionReveal className={sectionScrollRevealClass}>
          <Start />
        </MotionReveal>
        <MotionReveal className={sectionScrollRevealClass}>
          <Faq />
        </MotionReveal>
        <MotionReveal className={sectionScrollRevealClass}>
          <Footer />
        </MotionReveal>
      </div>
    </div>
  );
}
