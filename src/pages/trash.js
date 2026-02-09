
import React,{Component} from "react";
import ChildComponent from "../components/child";

class TrashPage extends Component{

    constructor(props){
        super(props);
        this.state ={
            message:''
        }
    }
    onReceiveValue=(value) =>{
        this.setState({
            message:value
        })
    }

render(){
    const data={
        name:"Mr.ABC",
        age:"22"
    }

    return(
        <div>
        <h2>Received User name -{this.state.message}</h2>
        <h1>This is a Trash page</h1>
        <ChildComponent information={data} callback={this.onReceiveValue}></ChildComponent>
        </div>
        
        )
}
}
export default TrashPage;