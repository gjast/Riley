import { useEffect, useState } from "react";
import { getLandingServices, subscribeCases } from "./casesStorage.js";

export function useLandingServices() {
  const [items, setItems] = useState(getLandingServices);

  useEffect(() => subscribeCases(() => setItems(getLandingServices())), []);

  return items;
}
