import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../components/Header";
import MotionReveal from "../../components/MotionReveal";
import LineItem from "../../components/LineItem";
import { useScrollToSection } from "../../hooks/useScrollToSection";
import Hero from "./blocks/Hero";
import LogoLoop from "./blocks/LogoLoop";
import Services from "./blocks/Services";
import Cases from "./blocks/Cases";
import Start from "./blocks/Start";
import Faq from "./blocks/Faq";
import Footer from "./blocks/Footer";

/** Логотипы в карусели: задайте href и при необходимости ariaLabel для каждого партнёра. */
const LINE_ITEMS = [
  {
    img: "/imgs/coop/1.png",
    width: "144px",
    height: "52px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/4.png",
    width: "150px",
    height: "34px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/3.png",
    width: "144px",
    height: "52px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/5.png",
    width: "108px",
    height: "46px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/6.png",
    width: "144px",
    height: "52px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/7.png",
    width: "144px",
    height: "42px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
  {
    img: "/imgs/coop/8.png",
    width: "124px",
    height: "42px",
    href: "https://example.com",
    ariaLabel: "Partner",
  },
];

const sectionScrollRevealClass =
  "w-full flex justify-center";

export default function Landing() {
  const location = useLocation();
  const scrollToSection = useScrollToSection();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "").trim();
    if (!id) return;
    const t = window.setTimeout(() => scrollToSection(id), 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash, scrollToSection]);

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
          <LineItem
            img={item.img}
            width={item.width}
            height={item.height}
            href={item.href}
            ariaLabel={item.ariaLabel}
          />
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
