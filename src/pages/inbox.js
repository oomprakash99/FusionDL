
import React,{Component} from "react";
import axios from "axios";

class InboxPage extends Component{

constructor(props){
    super(props);
    this.state ={
        username : "",
        job : ""
    }
}

onHandleInput = (event) => {
    this.setState({
        [event.target.name] : event.target.value
    })

}



onSubmitUser(){
    const url = "https://reqres.in/api/users";
    
    axios.post(url, this.state)

    .then((response)=>{
        const serverData = response.data;
        console.log(serverData);
        alert("Successfully user profile created")
    } )

    
    .catch((error)=>{
        console.log(error)
        alert("Failed to create profile,Try Later")

    })

    
}

render(){
    return(
        <div>
        <h1>This is a Inbox page</h1>
        <div>
            <label>Enter Your username :</label>
            <input type="text" placeholder ="Please enter your username"
            onChange={this.onHandleInput} name="username"/>
            </div>
            <div>
                <label>Enter your job :</label>
                <input type="text" placeholder="Please enter your job"
                onChange={this.onHandleInput} name="job"/>
            </div>
            <button onClick = {() => this.onSubmitUser() }>Submit</button>
            </div>
        
        )
}
}

export default InboxPage;