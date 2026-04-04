import { useEffect, useState } from "react";
import {
  getLandingServiceByKey,
  subscribeCases,
} from "./casesStorage.js";

export function useLandingServiceByKey(key) {
  const [service, setService] = useState(() =>
    key ? getLandingServiceByKey(key) : null,
  );

  useEffect(() => {
    if (!key) {
      setService(null);
      return undefined;
    }
    setService(getLandingServiceByKey(key));
    return subscribeCases(() => setService(getLandingServiceByKey(key)));
  }, [key]);

  return service;
}
