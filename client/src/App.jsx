import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateInquiry from './pages/inquiry/createInquiry';
import Home from './pages/Home';
import inquirysinglecard from './components/Inquiry/inquirysinglecard'
import ResponseInquiry from './pages/inquiry/responseinquiry';

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/inquiry/create" element={<CreateInquiry />}/>
            <Route path="/inquiry/response/:id" element={<ResponseInquiry />}/>
           
        </Routes>
    );
}

export default App;