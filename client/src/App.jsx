import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateInquiry from './pages/createInquiry';
import Home from './pages/Home';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/inquiry/create" element={<CreateInquiry />} />
        </Routes>
    );
}

export default App;