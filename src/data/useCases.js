import { useEffect, useState } from "react";
import {
  getCasesForLandingGrid,
  subscribeCases,
} from "./casesStorage.js";

export function useCases() {
  const [cases, setCases] = useState(getCasesForLandingGrid);

  useEffect(
    () => subscribeCases(() => setCases(getCasesForLandingGrid())),
    [],
  );

  return cases;
}
