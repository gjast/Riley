import { useLayoutEffect, useState } from "react";
import {
  getCasesForLandingGrid,
  subscribeCases,
} from "./casesStorage.js";

export function useCases() {
  const [cases, setCases] = useState(getCasesForLandingGrid);

  // Подписка до useEffect: иначе быстрый ответ GET /api/cases может вызвать notify
  // до mount-effect — Cases остаётся с hydrated=true и cases=[] до жёсткой перезагрузки.
  useLayoutEffect(() => {
    const sync = () => setCases(getCasesForLandingGrid());
    const unsub = subscribeCases(sync);
    sync();
    return unsub;
  }, []);

  return cases;
}
