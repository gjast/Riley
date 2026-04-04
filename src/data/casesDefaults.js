/** Shared image until per-case assets exist; still passed through props. */
export const CASE_PREVIEW_IMG = "/imgs/case/1.png";

const DESCRIPTION =
  "Experienced UI/UX and web designer with proven track record delivering clean, high-conversion interfaces and user-centered digital products. Specializing in modern websites, mobile apps, and intuitive design systems.";

/**
 * Кейсы для сетки на главной + скрытые service-* для /portfolio (excludeFromCasesGrid).
 */
const DEFAULT_CASES_MAIN = [
  {
    id: "case-1",
    img: CASE_PREVIEW_IMG,
    title: "Gambler (WEB + Illustrations)",
    cards: [
      {
        title: "Gambler — Discovery & UX",
        description: DESCRIPTION,
        href: "#",
      },
      {
        title: "Gambler — Web & Illustrations",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Gambler — Handoff & QA", description: DESCRIPTION, href: "#" },
    ],
  },
  {
    id: "case-2",
    img: CASE_PREVIEW_IMG,
    title: "Frosty White Casino (WEB + Mobile)",
    cards: [
      {
        title: "Frosty White — Product UI",
        description: DESCRIPTION,
        href: "#",
      },
      {
        title: "Frosty White — Mobile flows",
        description: DESCRIPTION,
        href: "#",
      },
      {
        title: "Frosty White — Design system",
        description: DESCRIPTION,
        href: "#",
      },
    ],
  },
  {
    id: "case-3",
    img: CASE_PREVIEW_IMG,
    title: "Relay — Marketing site",
    cards: [
      {
        title: "Relay — Hero & narrative",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Relay — Components", description: DESCRIPTION, href: "#" },
      { title: "Relay — Motion & polish", description: DESCRIPTION, href: "#" },
    ],
  },
  {
    id: "case-4",
    img: CASE_PREVIEW_IMG,
    title: "Neon Slots (WEB)",
    cards: [
      { title: "Neon Slots — Lobby", description: DESCRIPTION, href: "#" },
      {
        title: "Neon Slots — Game chrome",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Neon Slots — Promotions", description: DESCRIPTION, href: "#" },
    ],
  },
  {
    id: "case-5",
    img: CASE_PREVIEW_IMG,
    title: "Atlas Fintech (App)",
    cards: [
      { title: "Atlas — Onboarding", description: DESCRIPTION, href: "#" },
      { title: "Atlas — Dashboard", description: DESCRIPTION, href: "#" },
      {
        title: "Atlas — Settings & support",
        description: DESCRIPTION,
        href: "#",
      },
    ],
  },
  {
    id: "case-6",
    img: CASE_PREVIEW_IMG,
    title: "Pulse Fitness (iOS)",
    cards: [
      { title: "Pulse — Training hub", description: DESCRIPTION, href: "#" },
      {
        title: "Pulse — Activity tracking",
        description: DESCRIPTION,
        href: "#",
      },
      {
        title: "Pulse — Social & challenges",
        description: DESCRIPTION,
        href: "#",
      },
    ],
  },
  {
    id: "case-7",
    img: CASE_PREVIEW_IMG,
    title: "Northwind SaaS (Dashboard)",
    cards: [
      { title: "Northwind — Analytics", description: DESCRIPTION, href: "#" },
      {
        title: "Northwind — Tables & filters",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Northwind — Billing", description: DESCRIPTION, href: "#" },
    ],
  },
  {
    id: "case-8",
    img: CASE_PREVIEW_IMG,
    title: "Lumen Travel (WEB + App)",
    cards: [
      {
        title: "Lumen — Search & booking",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Lumen — Trip detail", description: DESCRIPTION, href: "#" },
      {
        title: "Lumen — Profile & loyalty",
        description: DESCRIPTION,
        href: "#",
      },
    ],
  },
  {
    id: "case-9",
    img: CASE_PREVIEW_IMG,
    title: "Vault Security (Brand + WEB)",
    cards: [
      {
        title: "Vault — Identity & brand",
        description: DESCRIPTION,
        href: "#",
      },
      { title: "Vault — Marketing pages", description: DESCRIPTION, href: "#" },
      { title: "Vault — Resources hub", description: DESCRIPTION, href: "#" },
    ],
  },
];

/** Услуги на лендинге: клик ведёт на /portfolio/:portfolioCaseId */
export const DEFAULT_LANDING_SERVICES = [
  {
    key: "web",
    title: "",
    price: "",
    img: "./imgs/serv/web.png",
    portfolioCaseId: "service-web",
    position: "justify-start items-end",
    positionImg: "h-auto pb-[15px]",
  },
  {
    key: "landing",
    title: "",
    price: "",
    img: "./imgs/serv/land.png",
    portfolioCaseId: "service-landing",
    position: "justify-end items-end",
    positionImg: "h-full",
  },
  {
    key: "logotypes",
    title: "",
    price: "",
    img: "./imgs/serv/logo.png",
    portfolioCaseId: "service-logotypes",
    position: "justify-end items-start",
    positionImg: "h-full",
  },
  {
    key: "illustrations",
    title: "",
    price: "",
    img: "./imgs/serv/pen.png",
    portfolioCaseId: "service-illustrations",
    position: "justify-end items-start",
    positionImg: "h-full",
  },
];

const SERVICE_CARD = {
  description: DESCRIPTION,
  href: "#",
};

/** Кейсы портфолио для услуг (не показываются в сетке Cases на главной). */
export const DEFAULT_SERVICE_PORTFOLIO_CASES = [
  {
    id: "service-web",
    img: CASE_PREVIEW_IMG,
    title: "Веб — портфолио",
    excludeFromCasesGrid: true,
    cards: [
      { title: "Веб — этап 1", ...SERVICE_CARD },
      { title: "Веб — этап 2", ...SERVICE_CARD },
      { title: "Веб — этап 3", ...SERVICE_CARD },
    ],
  },
  {
    id: "service-landing",
    img: CASE_PREVIEW_IMG,
    title: "Лендинг — портфолио",
    excludeFromCasesGrid: true,
    cards: [
      { title: "Лендинг — блок 1", ...SERVICE_CARD },
      { title: "Лендинг — блок 2", ...SERVICE_CARD },
    ],
  },
  {
    id: "service-logotypes",
    img: CASE_PREVIEW_IMG,
    title: "Логотипы — портфолио",
    excludeFromCasesGrid: true,
    cards: [
      { title: "Логотипы — концепты", ...SERVICE_CARD },
      { title: "Логотипы — финал", ...SERVICE_CARD },
    ],
  },
  {
    id: "service-illustrations",
    img: CASE_PREVIEW_IMG,
    title: "Иллюстрации — портфолио",
    excludeFromCasesGrid: true,
    cards: [
      { title: "Иллюстрации — серия 1", ...SERVICE_CARD },
      { title: "Иллюстрации — серия 2", ...SERVICE_CARD },
    ],
  },
];

export const DEFAULT_CASES = [
  ...DEFAULT_CASES_MAIN,
  ...DEFAULT_SERVICE_PORTFOLIO_CASES,
];
