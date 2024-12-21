import React from "react";
import Login from "./Pages/Login";
import Main from "./Pages/Main";
import { Route, Routes } from "react-router-dom";
import Signup from "./Pages/Signup";

function App() {
  return (
 
 <Routes>
   <Route path="/"  element={<Login />} />
   <Route path="/signup"  element={<Signup />} />
    <Route path="/Main/*"  element={<Main />}/> 
 </Routes>
  
  );
}

export default App;
