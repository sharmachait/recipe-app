import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipeApp from './components/RecipeApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RecipeApp />} />
      </Routes>
    </Router>
  );
}

export default App;