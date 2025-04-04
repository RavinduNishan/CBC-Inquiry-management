import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CreateInquiry from './pages/inquiry/createInquiry';
import Home from './pages/Home';
import inquirysinglecard from './components/Inquiry/inquirysinglecard'
import ResponseInquiry from './pages/inquiry/responseinquiry';
import IndexBlade from './components/dashboard/IndexBlade';
import  {FormBlade } from './components/dashboard/FormBlade';
import  {LoginBlade}  from './components/dashboard/LoginBlade';
import TableBlade from './components/dashboard/tableBlade';
import UiElementsBlade from './components/dashboard/UiElimentsBlade';
import Header from './components/dashboard/dashboardlayouts/Header';
// import Sidebar from './components/dashboard/dashboardlayouts/Sidebar'; 
import Master from './components/dashboard/dashboardlayouts/Master';
import CreateUser from './pages/user/createuser';


const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/inquiry/create" element={<CreateInquiry />}/>
            <Route path="/inquiry/response/:id" element={<ResponseInquiry />}/>
            <Route path="/dash" element={<IndexBlade />}/>
            <Route path ="/dash/form" element={<FormBlade />}/>
            <Route path ="/dash/login" element={<LoginBlade />}/>
            <Route path ="/dash/table" element={<TableBlade />}/>
            <Route path ="/dash/ui" element={<UiElementsBlade />}/>
            <Route path ="/dash/header" element={<Header />}/>
            {/* <Route path ="/dash/sidebar" element={<Sidebar />}/> */}
            <Route path ="/dash/master" element={<Master />}/>
            <Route path='/user/create' element={<CreateUser />}/>
        </Routes>
    );
}

export default App;