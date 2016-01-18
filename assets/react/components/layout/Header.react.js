var React = require('react'),
    
    // -- Stores
    
    // -- Components
    AgencyMenu = require('./AgencyMenu.react'),
    UserMenu = require('./UserMenu.react'),
    Logo = require('./Logo.react');




var MenuSearch = React.createClass({
    render:function(){
        return (
            <li className="visible-phone-landscape">
                <a href="#" id="search-toggle">
                    <i class="fa fa-search"></i>
                </a>
            </li>
        )
    }
})



var Header = React.createClass({

    render: function() {
        
        return (
            <header className="page-header">
                
                <div className="navbar">
                    <ul className="nav navbar-nav navbar-right pull-right">
                        <Logo />
                        <AgencyMenu  
                            agencies={this.props.agencies}
                            currentAgency = {this.props.currentAgency} />
                        <UserMenu />
                        
                        <li className="visible-xs">
                            <a href="#" className="btn-navbar" data-toggle="collapse" data-target=".sidebar" title="">
                                <i className="fa fa-bars"></i>
                            </a>
                        </li>

                        <li className="hidden-xs" title="Log Out"><a href="/logout"><i className="fa fa-sign-out"></i></a></li>
                    </ul>
                </div>
            </header>
        );
    }
});

module.exports = Header;
