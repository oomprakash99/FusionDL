
import axios from "axios";
import React,{Component} from "react";

class DraftPage extends Component{


onDeleteUser(){
    const url="https://reqres.in/api/users/2"

    axios.delete(url)
    .then((response)=>{
        const serverData =response.data;
        console.log(serverData);
        alert("successfully Deleted");
    })
        .catch((error)=>{
            console.log(error)
            alert("something went wrong");

        })
    
}
render(){

    return(
        <div>
    
        <h1>This is a Draft page</h1>
        <button onClick={()=>this.onDeleteUser()}>Delete User</button>
        </div>
        
        )
}
}
export default DraftPage;