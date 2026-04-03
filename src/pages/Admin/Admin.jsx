import { useCallback, useState } from "react";
import { getAdminToken } from "../../data/adminSession";
import AdminLogin from "./blocks/AdminLogin";
import AdminEditor from "./AdminEditor";

export default function Admin() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));

  const handleLoggedIn = useCallback(() => setAuthed(true), []);

  const handleLogout = useCallback(() => {
    setAuthed(false);
  }, []);

  if (!authed) {
    return <AdminLogin onLoggedIn={handleLoggedIn} />;
  }

  return <AdminEditor onLogout={handleLogout} />;
}
