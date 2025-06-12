import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { VisitorProvider } from './context/VisitorContext';
import Analytics from './services/analytics';

// Layouts
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProjectsPage from './pages/ProjectsPage';
import ContactPage from './pages/ContactPage';
import FreelancePage from './pages/FreelancePage';

// Styles
import './styles/Global.css';

const App = () => {
  useEffect(() => {
    Analytics.init();
  }, []);

  return (
    <ThemeProvider>
      <VisitorProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300">
            <Header />
            
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/freelance" element={<FreelancePage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </Router>
      </VisitorProvider>
    </ThemeProvider>
  );
};

export default App;

