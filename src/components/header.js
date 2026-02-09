import React, {Component} from "react";
import {NavLink} from 'react-router-dom';
import css from '../css/materialize.css';

class Header extends Component{

    render(){
        return(
            <nav>
                <div className="nav-wrapper">
                    <NavLink to="/"className="brand-logo">OMG !</NavLink>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><NavLink to="/">Home</NavLink></li>
                        <li><NavLink to="/contact">Contact</NavLink></li>
                        <li><NavLink to="/login">Login</NavLink></li>
                    </ul>
                </div>
            </nav>

        )
    }
}
export default Header;