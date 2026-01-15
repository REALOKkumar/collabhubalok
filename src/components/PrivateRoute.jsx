import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  // While checking auth state
  if (user === undefined) {
    return <div>Loading...</div>;
  }

  // If not logged in
  if (!user) {
    return <Navigate to="/" />;
  }

  // If logged in
  return children;
}
