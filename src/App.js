import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";
import Home from "./components/Home";
import Profile from "./components/Profile";
import CreateRequest from "./components/CreateRequest";







function App() {
  return (
    <div className="App">
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


        <Route path="/Home" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/create-request" element={<CreateRequest />} />
        



      </Routes>
    </div>
  );
}

export default App;


