import React from 'react'
import {Routes,Route,BrowserRouter} from "react-router-dom"
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import { ThemeProvider } from './context/ThemeContext'

const MainRoutes = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />}/>
          <Route path='/register' element={<Register />}/> 
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default MainRoutes
