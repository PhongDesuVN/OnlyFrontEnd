// src/App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./Routes/routes.jsx";
import "./App.css";

export default function App() {
    console.log("App component loaded");

    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}
