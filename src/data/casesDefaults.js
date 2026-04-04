/** Shared image until per-case assets exist; still passed through props. */
export const CASE_PREVIEW_IMG = "/imgs/case/1.png";

const DESCRIPTION =
  "Experienced UI/UX and web designer with proven track record delivering clean, high-conversion interfaces and user-centered digital products. Specializing in modern websites, mobile apps, and intuitive design systems.";

/** Кейсы только для сетки на главной и страниц /portfolio/:caseId */
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

/**
 * Внешний вид плитки «Услуги» на лендинге — в коде, не в админке.
 * Тексты — из locales (services.items.*), клик — /services/:key (карточки в landingServices.portfolioCards).
 */
export const LANDING_SERVICE_CARD_LAYOUT = {
  web: {
    img: "/imgs/serv/web.png",
    position: "justify-start items-end",
    positionImg: "h-auto pb-[15px]",
  },
  landing: {
    img: "/imgs/serv/land.png",
    position: "justify-end items-end",
    positionImg: "h-full",
  },
  logotypes: {
    img: "/imgs/serv/logo.png",
    position: "justify-end items-start",
    positionImg: "h-full",
  },
  illustrations: {
    img: "/imgs/serv/pen.png",
    position: "justify-end items-start",
    positionImg: "h-full",
  },
};

const SERVICE_CARD = {
  description: DESCRIPTION,
  href: "#",
};

/** Карточки на /services/:key — отдельно от кейсов. */
export const DEFAULT_LANDING_SERVICES = [
  {
    key: "web",
    portfolioCards: [
      { title: "Веб — этап 1", ...SERVICE_CARD },
      { title: "Веб — этап 2", ...SERVICE_CARD },
      { title: "Веб — этап 3", ...SERVICE_CARD },
    ],
  },
  {
    key: "landing",
    portfolioCards: [
      { title: "Лендинг — блок 1", ...SERVICE_CARD },
      { title: "Лендинг — блок 2", ...SERVICE_CARD },
    ],
  },
  {
    key: "logotypes",
    portfolioCards: [
      { title: "Логотипы — концепты", ...SERVICE_CARD },
      { title: "Логотипы — финал", ...SERVICE_CARD },
    ],
  },
  {
    key: "illustrations",
    portfolioCards: [
      { title: "Иллюстрации — серия 1", ...SERVICE_CARD },
      { title: "Иллюстрации — серия 2", ...SERVICE_CARD },
    ],
  },
];

export const DEFAULT_CASES = [...DEFAULT_CASES_MAIN];

/** Ключи услуг (для редиректа /portfolio/service-* → /services/*). */
export const LANDING_SERVICE_KEYS = DEFAULT_LANDING_SERVICES.map((s) => s.key);
