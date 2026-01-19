import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Ensure this path matches your file structure
import { onAuthStateChanged } from 'firebase/auth';

const PrivateRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Stop loading once we know the status
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // 1. If still checking with Firebase, show a Loading text instead of blank screen
  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
  }

  // 2. If no user found, kick them back to Login
  if (!user) {
    return <Navigate to="/" />;
  }

  // 3. If user exists, show the protected page (Home, Dashboard, etc.)
  return children;
};

export default PrivateRoute;