import React,{Component} from "react";
import {NavLink} from "react-router-dom";
import Header from "../components/header";

class LoginPage extends Component{


    constructor(props){
        super(props);
        this.state = {
            username:"",
            password:"",
            isVisible: true,
            showPassword: false
        }
    }

onHandleInput = (event) => {
    //Property Method
    //console.log(event.target.value,event.target.name);
    this.setState({
        [event.target.name] : event.target.value
    })
}

onSubmit(){
console.log(this.state)

this.props.history.push("/signup");

}
showImage(){
    this.setState({isVisible:true})

}

hideImage(){
    this.setState({isVisible:false})

}
showPassword(status){
    this.setState({
        showPassword : status
    })
}

    render(){
        
        return(
            <div id="login-page">
                 <Header></Header>
                <h1>Login Page</h1>
                <button onClick={()=> this.showImage()}>Show image</button>
                <button onClick={()=> this.hideImage()}>Hide image</button>


                {
                
                this.state.isVisible && <div>
                    <img src={require("../image/download.jfif").default} className="image" alt="profile"/></div>}

                <div className="space-bottom">
                    <label className="label">Enter Your Email ID : </label>
                    <input className="input" type="email" placeholder="Enter your Email.." onChange={this.onHandleInput}name="username" />
                </div>

                <div className="space-bottom">
                    <label className="label">Enter Your Password</label>
                    <input className={this.state.showPassword ?"input border-red": "input"} 
                    type={this.state.showPassword ? "text" : "password"} placeholder="Enter your password.." onChange={this.onHandleInput} name="password"/>

                   {
                   this.state.showPassword ? 
                   <img src={require("../image/eye.png").default} className="icon" onClick={() => this.showPassword(false)}alt=""/>
                   :
                   <img src={require("../image/open-eye.png").default} className="icon" onClick={()=> this.showPassword(true)}alt=""/>
                    }
                
                
                </div>
                <button onClick={()=>this.onSubmit()}>Login</button>
                <div>
                    <h2>Your Email id is {this.state.username}</h2>
                    <h2>Your password is {this.state.password}</h2>
                </div>
                <NavLink to ="/">Go Back</NavLink>
                </div>
        )
    }
}
export default LoginPage;