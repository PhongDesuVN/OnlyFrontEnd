// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/routes.jsx";
// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import Staff from "./Pages/Staff_phong";
import HomePage from "./Pages/HomePage_phong";

export default function App() {
  function App() {

    console.log("App component loaded");

    // Return the main content of the app
    return (
        <BrowserRouter>
          <AppRoutes/>
        </BrowserRouter>
    );
  }
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>

  );
}

