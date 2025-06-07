import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import './App.css';
import Staff from "./Pages/Staff_phong";
import HomePage from "./Pages/HomePage_phong";

function App() {
  return (
    <>
      {/* <Staff /> */}
      <HomePage />
    </>
  );
}

export default App;