import React from 'react'
import Style from "./App.module.css"
import {BrowserRouter, Routes, Route} from "react-router-dom"
import Login from './Components/login'
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import CreateAccount from './Components/createAccount';
import MainPage from './Components/mainPage';
import ProtectedRoute from './Components/protectedRoute';

function App() {
  return <>
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<GoogleOAuthProvider clientId='1060507592574-4rd8f30c3s68qe277a15ic82g736sgur.apps.googleusercontent.com'><Login/></GoogleOAuthProvider>}/>
    <Route path='/createAccount' element={<GoogleOAuthProvider clientId='1060507592574-4rd8f30c3s68qe277a15ic82g736sgur.apps.googleusercontent.com'><CreateAccount/></GoogleOAuthProvider>}/>
    <Route path='/mainPage' element={<ProtectedRoute><MainPage/></ProtectedRoute>}/>
  </Routes>
  </BrowserRouter>
  </>
}

export default App
