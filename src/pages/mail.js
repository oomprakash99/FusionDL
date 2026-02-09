
import React,{Component} from "react";
import { Switch,Route,NavLink } from 'react-router-dom';

import InboxPage from "./inbox";
import SentPage from './sent';
import DraftPage from './draft';
import TrashPage from './trash';

class MailPage extends Component{

render(){

    return(
        
        <div className="main">
        <div className="head"></div>
        <div className="sidebar-maincontent">
        <div className="sidebar">
            
            <div>
                <NavLink to="/mail/inbox" className="button">Go to Inbox</NavLink>
            </div>

            <div>
                <NavLink to="/mail/sent" className="button">Go to Sent</NavLink>
            </div>

            <div>
                <NavLink to="/mail/draft" className="button">Go to Draft</NavLink>
            </div>

            <div>
                <NavLink to="/mail/trash" className="button">Go to Trash </NavLink>
            </div>
            </div>
            
            <div className="maincontent">
                <div>
                    
            <Switch>
                <Route path="/mail/inbox" component={InboxPage}></Route>
                <Route path="/mail/sent" component={SentPage}></Route>
                <Route path="/mail/draft" component={DraftPage}></Route>
                <Route path="/mail/trash" component={TrashPage}></Route>
            </Switch>
                        
                    
                </div>
            </div>
            
            
            </div>
        </div>
        
        )
}
}
export default MailPage;