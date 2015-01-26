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
                                Profile
                            </a>
                        </a>
                    </li>
                    <li role="presentation">
                      
                            <Link to="userAdmin">
                                <i className="fa fa-calendar"></i>
                                User Admin
                            </Link>
                        
                    </li>
                    <li role="presentation">
                        <a href="#" className="link">
                            <i className="fa fa-inbox"></i>
                            Inbox
                        </a>
                    </li>
                </ul>
            </li>
                        
        );
    }
});

module.exports = Header;
