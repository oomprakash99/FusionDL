import React,{Component} from "react";
import {NavLink} from "react-router-dom";
import Header from "../components/header";
import css from '../css/materialize.css';
class RegisterPage extends Component{


    render(){   

        return(
            <div>
            <Header></Header>
                <h1>This is a signup page</h1>
                <NavLink to ="/contact">Contact US</NavLink>
            </div>
        )
    }
}
export default RegisterPage;