import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ResponseInquiry from './pages/inquiry/responseinquiry';
import { LoginBlade } from './components/dashboard/LoginBlade';
import Master from './components/dashboard/dashboardlayouts/Master';


const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginBlade />} />
                    <Route path="/dashboard" element={<Master />} />
                    <Route path="/dashboard/*" element={<Master />} />
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/inquiry/response/:id" element={<ResponseInquiry />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;