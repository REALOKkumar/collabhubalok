



import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar"; // Navbar import karein
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateRequest from "./components/CreateRequest";
import "./App.css";

function App() {
  const location = useLocation();

  return (
    <div className="App">
      {/* Agar path "/" (Login page) nahi hai, tabhi Navbar dikhao */}
      {location.pathname !== "/" && <Navbar />}

      <Routes>
        <Route path="/" element={<AuthForm />} />

        <Route
          path="/Dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Inhe bhi PrivateRoute ke andar rakhna achha rahega */}
        <Route 
          path="/Home" 
          element={
            <PrivateRoute><Home /></PrivateRoute>
          } 
        />
        <Route 
          path="/Profile" 
          element={
            <PrivateRoute><Profile /></PrivateRoute>
          } 
        />
        <Route 
          path="/CreateRequest" 
          element={
            <PrivateRoute><CreateRequest /></PrivateRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;