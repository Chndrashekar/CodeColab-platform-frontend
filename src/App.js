import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Editor from './Editor';

function App() {
    return (
        <Router>
            <div className="App">
                <header className="app-banner">
                    <div className="header-content">
                        <span className="owner-info">ⓒ Chandrashekar Guru</span>
                        <span className="header-title">Code Colab</span>
                    </div>
                </header>
                <div className='content'>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/:sessionId" element={<Editor />} />
                    </Routes>
                </div>
                
            </div>
        </Router>
    );
}

const Home = () => {
    const createSession = () => {
        const sessionId = Math.random().toString(36).substring(7);
        window.location.href = `/${sessionId}`;
    };

    createSession();
};

export default App;
