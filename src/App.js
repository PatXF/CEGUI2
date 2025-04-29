import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import GreetingPage from "./GreetingPage";
import EditorPage from "./EditorPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GreetingPage />} />
        <Route path="/editor" element={<EditorPage />} />
      </Routes>
    </Router>
  );
};

export default App;
