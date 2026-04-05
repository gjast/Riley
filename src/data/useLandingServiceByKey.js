import { useLayoutEffect, useState } from "react";
import {
  getLandingServiceByKey,
  subscribeCases,
} from "./casesStorage.js";

export function useLandingServiceByKey(key) {
  const k = key ? String(key) : "";
  const [service, setService] = useState(() =>
    k ? getLandingServiceByKey(k) : null,
  );

  useLayoutEffect(() => {
    const sync = () => setService(k ? getLandingServiceByKey(k) : null);
    if (!k) {
      sync();
      return undefined;
    }
    const unsub = subscribeCases(sync);
    sync();
    return unsub;
  }, [k]);

  return service;
}
