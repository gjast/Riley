import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Navigate, useParams } from "react-router-dom";

const MotionPage = motion.div;
const MotionBlock = motion.div;
import Footer from "../Landing/blocks/Footer";
import Header from "./blocks/Header";
import Cart from "./blocks/Cart";
import { getCaseById, LANDING_SERVICE_KEYS } from "../../data/cases";

const easeSlide = [0.22, 1, 0.36, 1];
const easeFade = [0.4, 0, 0.2, 1];

export default function Portfolio() {
  const { caseId } = useParams();
  const reducedMotion = useReducedMotion();

  const legacyKey = /^service-(.+)$/.exec(caseId || "")?.[1];
  if (legacyKey && LANDING_SERVICE_KEYS.includes(legacyKey)) {
    return <Navigate to={`/services/${legacyKey}`} replace />;
  }

  const caseData = caseId ? getCaseById(caseId) : null;

  if (!caseData) {
    return <Navigate to="/" replace />;
  }

  const { img, cards } = caseData;

  return (
    <MotionPage
      className="mb-[62px] flex flex-col items-center pt-[calc(25px+42px+32px)]"
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: reducedMotion ? 0 : 0.45,
        ease: easeSlide,
      }}
    >
      <Header />

      <main className="my-[32px] flex w-[calc(100%-2rem)] max-w-[986px] flex-col items-center justify-center gap-[64px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-100px)]">
        {cards.map((card, index) => (
          <MotionBlock
            key={`${caseId}-${index}`}
            className="w-full"
            initial={reducedMotion ? false : { opacity: 0, y: 80 }}
            whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{
              once: true,
              amount: 0.1,
              margin: "0px",
            }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    delay: index * 0.1,
                    opacity: { duration: 0.38, ease: easeFade },
                    y: { duration: 0.78, ease: easeSlide },
                  }
            }
          >
            <Cart
              img={card.img ?? img}
              title={card.title}
              description={card.description}
              href={card.href}
              eagerImage={index === 0}
            />
          </MotionBlock>
        ))}
      </main>

      <Footer />
    </MotionPage>
  );
}
