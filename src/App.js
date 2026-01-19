import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import CreatePost from './components/CreatePost';
import PrivateRoute from "./components/PrivateRoute";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateRequest from "./components/CreateRequest";

import './App.css'; // Your global styles




function App() {
  return (
    <Router>
      <div className="app-main">
        <Routes>
          {/* 1. Public Route: Login/Signup */}
          <Route path="/" element={<AuthForm />} />

          {/* 2. Protected Routes (Only logged-in users can access) */}
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

          {/* Catch-all: Redirect unknown URLs to Home or Login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;