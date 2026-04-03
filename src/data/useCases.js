import { useEffect, useState } from "react";
import { getCases, subscribeCases } from "./casesStorage.js";

export function useCases() {
  const [cases, setCases] = useState(getCases);

  useEffect(() => subscribeCases(() => setCases(getCases())), []);

  return cases;
}
