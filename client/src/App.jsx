import React from 'react';
import {Routers, Route} from 'react-router-dom';
const App =()=>{
    return(
        <Routers>
            <Route path="/" element={<h1>Home</h1>} />
            <Route path="/about" element={<h1>About</h1>} />
            <Route path="/contact" element={<h1>Contact</h1>} />
            <Route path="/services" element={<h1>Services</h1>} />
            <Route path="/products" element={<h1>Products</h1>} /> 
        </Routers>
    )
}

export default App;