var React = require('react'),
    Link = require('react-router').Link,
    
    // -- Stores
    UserStore = require('../../stores/UserStore');

    
function getSessionUserfromStore(){
    return {
        sessionUser: UserStore.getSessionUser(),
    }
};

var Header = React.createClass({
    getInitialState: function() {
        return getSessionUserfromStore();
    },

    componentDidMount: function() {
        UserStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        UserStore.removeChangeListener(this._onChange);
    },
    _onChange :function(){
        this.setState(getSessionUserfromStore());
    },
    
    _renderUserAdmin :function(){
        
        if(this.state.sessionUser.sysadmin){

            return(
                <li role="presentation">            
                    <Link to="userAdmin">
                        <i className="fa fa-calendar"></i>
                        &nbsp;User Admin
                    </Link>
                </li>
            )

        }else if(this.state.sessionUser.admin){

            return(
                <li role="presentation">      
                    <Link to="userAdmin">
                        <i className="fa fa-calendar"></i>
                        &nbsp;User Admin
                    </Link>
                </li>
            )
        
        }
        return ( <span /> )
    },
    _renderDataSources :function(){
        
        if(this.state.sessionUser.sysadmin){

            return(
                <li role="presentation">
                    <Link to="datasourceList">
                        <i className="fa fa-inbox"></i>
                        &nbsp;Data Management
                    </Link>
                </li>
            )

        }else if(this.state.sessionUser.admin){

            var agencyId = this.state.sessionUser.agency[0] ? this.state.sessionUser.agency[0].id : 7;
            
            return(
                <li role="presentation">
                    <Link to="datasourceSingle" params={{agencyId:agencyId}}> 
                        <i className="fa fa-inbox"></i>
                        &nbsp;Data Management
                    </Link>
                </li>
            )
        }
        return ( <span /> )
    },

    render: function() {
        
        return (
                        
            <li className="hidden-xs dropdown">
                <a href="#" title="Account" id="account" className="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    <i className="fa fa-user"></i>
                </a>
                <ul id="account-menu" className="dropdown-menu account" role="menu">
                    <li role="presentation" className="account-picture">
                        
                        {this.state.sessionUser.name}
                    </li>
                    <li role="presentation">
                        <a href="form_account.html" className="link">
                            <a href="">
                                <i className="fa fa-user"></i>
                                &nbsp;Profile
                            </a>
                        </a>
                    </li>
                    {this._renderUserAdmin()}
                    {this._renderDataSources()}
                    <li role="presentation">
                        <a href="/Task_5B_Report_Pooled_Fund_Continuous_Counts_and_Wim_Analytics.pdf" className="link">
                            <a href="/Task_5B_Report_Pooled_Fund_Continuous_Counts_and_Wim_Analytics.pdf" target="_blank">
                                <i className="fa fa-book"></i>
                                &nbsp;User's Guide
                            </a>
                        </a>
                    </li>
                </ul>
            </li>
                        
        );
    }
});

module.exports = Header;
