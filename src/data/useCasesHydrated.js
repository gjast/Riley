import { useSyncExternalStore } from "react";
import { getCasesHydrated, subscribeCases } from "./casesStorage.js";

/** true после первого завершения hydrateCasesFromServer (успех или ошибка сети). */
export function useCasesHydrated() {
  return useSyncExternalStore(subscribeCases, getCasesHydrated, getCasesHydrated);
}
