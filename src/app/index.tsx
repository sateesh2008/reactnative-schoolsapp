import { useState } from "react";
import LoginScreen from "../screens/LoginScreen";
import ParentPortalScreen from "../screens/ParentPortalScreen";
import TeacherPortalScreen from "../screens/TeacherPortalScreen";

export default function Index() {
  const [role, setRole] = useState(null);

  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  if (role === 'Teacher') {
    return <TeacherPortalScreen onLogout={() => setRole(null)} />;
  }

  return <ParentPortalScreen onLogout={() => setRole(null)} />;
}
