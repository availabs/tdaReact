var React = require('react'),
    RouteHandler = require('react-router').RouteHandler,

    // -- App Templates
    Sidebar = require('../components/layout/Sidebar.react'),
    Logo = require('../components/layout/Logo.react'),
    Header = require('../components/layout/Header.react'),

    // -- Stores
    AppStore = require('../stores/AppStore'),
    AgencyStore = require('../stores/AgencyStore'),
    UserStore = require('../stores/UserStore'),
    JobStore = require('../stores/JobStore');

function getState(){
  
  return {

      menu:AppStore.getMenu(),
      agencies : AgencyStore.getAll(),
      currentAgency : AgencyStore.getSelectedAgency(),
      agencyOverview : AgencyStore.getAgencyOverview(),
      agencyOverviewDay : AgencyStore.getAgencyOverviewDay(),
      sessionUser : UserStore.getSessionUser(),
      activeJobs : JobStore.getAll()
  
  };

} 

var App = React.createClass({
 
  getInitialState: function(){   
    return getState();
  },
  
  componentDidMount: function() {
      
      AppStore.addChangeListener(this._onChange);
      AgencyStore.addChangeListener(this._onChange);
      UserStore.addChangeListener(this._onChange);
      JobStore.addChangeListener(this._onChange)
  
  },

  componentWillUnmount: function() {
  
      AppStore.removeChangeListener(this._onChange);
      AgencyStore.removeChangeListener(this._onChange);
      UserStore.removeChangeListener(this._onChange);
      JobStore.removeChangeListener(this._onChange);
  
  },
  
  _onChange: function(){
    this.setState(getState())
  },

  render: function() {
    return (
        <div>
            <Logo />
            <Sidebar menuItems={this.state.menu} />
            <div className="wrap">
                <Header />
                  <RouteHandler
                    agencies={this.state.agencies}
                    currentAgency = {this.state.currentAgency}
                    agencyOverview = {this.state.agencyOverview}
                    agencyOverviewDay = {this.state.agencyOverviewDay}
                    sessionUser={this.state.sessionUser}
                    activeJobs = {this.state.activeJobs}
                  />
            </div>
        </div>
    );
  },

  
  _populateMenu: function(){
       
    return {
        menu: [
            
            
        ]
    }
  }

});

module.exports = App;