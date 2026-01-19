import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

// Components
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import CreatePost from './components/CreatePost'; // Your local component
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Navbar from "./components/Navbar"; // Added from remote

import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="app-main">
      {/* Show Navbar on all pages EXCEPT Login ("/") */}
      {location.pathname !== "/" && <Navbar />}

      <Routes>
        {/* 1. Public Route: Login/Signup */}
        <Route path="/" element={<AuthForm />} />

        {/* 2. Protected Routes */}
        <Route 
          path="/home" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Your 'Create' Route */}
        <Route 
          path="/create" 
          element={
            <PrivateRoute>
              <CreatePost />
            </PrivateRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />

        {/* Catch-all: Redirect unknown URLs to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;