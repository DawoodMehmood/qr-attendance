import { useEffect, useState } from "react";
import { Redirect }           from "expo-router";
import { auth, db }           from "../src/firebase";
import { doc, getDoc }        from "firebase/firestore";

export default function Index() {
  const [target, setTarget] = useState(null);
  useEffect(() => {
    const u = auth.currentUser;
    if (!u) return setTarget("/login");
    getDoc(doc(db, "users", u.uid)).then((snap) => {
      if (!snap.exists()) return setTarget("/login");
      setTarget(
        snap.data().isAdmin
          ? "/admin/classrooms"
          : "/student/attendance"
      );
    });
  }, []);
  if (!target) return null;
  return <Redirect href={target} />;
}
