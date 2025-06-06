// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/routes.jsx";

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
}


