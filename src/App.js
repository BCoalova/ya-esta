import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import StoreProvider from './context/StoreContext'
import './App.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import Appnavbar from './components/navbar/Navbar';
import Main from './components/main/Main'
import AppFooter from './components/footer/Footer';

const App = () => {
    return(
        <Router>
            <StoreProvider>
                <Appnavbar />
                <Main />
                <AppFooter
                    copy="&copy; Copyright 2020"
                />
            </StoreProvider>
        </Router>
    )
}

export default App;