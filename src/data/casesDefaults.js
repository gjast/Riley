/** Shared image until per-case assets exist; still passed through props. */
export const CASE_PREVIEW_IMG = "/imgs/case/1.png";

const DESCRIPTION =
  "Experienced UI/UX and web designer with proven track record delivering clean, high-conversion interfaces and user-centered digital products. Specializing in modern websites, mobile apps, and intuitive design systems.";

/**
 * Landing grid + portfolio detail cards for each case (factory defaults).
 * @type {Array<{
 *   id: string;
 *   img: string;
 *   title: string;
 *   cards: Array<{ title: string; description: string; href: string; img?: string }>;
 * }>}
 */
export const DEFAULT_CASES = [
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
