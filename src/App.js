import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Editor from './Editor';

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/:sessionId" element={<Editor />} />
                </Routes>
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
