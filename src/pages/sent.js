
import React,{Component} from "react";
import axios from "axios";

class SentPage extends Component{
    constructor(props){
        super(props);
        this.state={
            name:"",
            job:""
        }
    }

onHandleInput = (event)=>{
    this.setState({
        [event.target.name] : event.target.value
    })
}
onUpdateUser =(event)=>{
    const url="https://reqres.in/api/users/2";

    axios.put(url,this.state)
    .then((response)=>{
        var serverData = response.data;
        console.log(serverData)
        alert("successfully Updated")
    })



    .catch((error)=>{
        console.log(error)
        alert("Something went Wrong")
    })
}



render(){

    return(
        <div>
        <h1>This is a Sent page</h1>
        <div>
            <label>Update Your Name :</label>
            <input type="text" placeholder="Update your name here"onChange={this.onHandleInput}name="name"/>
        
        </div>
        <div>
            <label>Update your job</label>
            <input type="text" placeholder="Update your job role"onChange={this.onHandleInput} name="job"/>
        </div>
        <button onClick={()=> this.onUpdateUser()}>Update</button>
        </div>
        
        )
}
}
export default SentPage;