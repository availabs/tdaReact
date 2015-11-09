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
    JobStore = require('../stores/JobStore')
    StationStore = require('../stores/StationStore'),
    StateWideStore = require('../stores/StatewideStore'),
    HpmsStore = require('../stores/HpmsStore');

function getState(){
  
  return {

      menu:AppStore.getMenu(),
      agencies : AgencyStore.getAll(),
      currentAgency : AgencyStore.getSelectedAgency(),
      agencyOverview : AgencyStore.getAgencyOverview(),
      agencyOverviewDay : AgencyStore.getAgencyOverviewDay(),
      sessionUser : UserStore.getSessionUser(),
      activeJobs : JobStore.getAll(),
      selectedState : StateWideStore.getSelectedState(),
      selectedStation : StateWideStore.getSelectedStation(),
      hpmsData : HpmsStore.getStateData(),
      activeFilters : StateWideStore.activeFilters(),
      uploadJobs : AgencyStore.getUploads()
  
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
      JobStore.addChangeListener(this._onChange);
      StationStore.addChangeListener(this._onChange);
      StateWideStore.addChangeListener(this._onChange);
      HpmsStore.addChangeListener(this._onChange);
  
  },

  componentWillUnmount: function() {
  
      AppStore.removeChangeListener(this._onChange);
      AgencyStore.removeChangeListener(this._onChange);
      UserStore.removeChangeListener(this._onChange);
      JobStore.removeChangeListener(this._onChange);
      StationStore.removeChangeListener(this._onChange);
      StateWideStore.removeChangeListener(this._onChange);
      HpmsStore.removeChangeListener(this._onChange);
  
  },
  
  _onChange: function(){
    this.setState(getState())
  },

  render: function() {
    return (
        <div>
            <div className="wrap">
                <Header  
                    agencies={this.state.agencies}
                    currentAgency = {this.state.currentAgency} />
                    
                  <RouteHandler
                    agencies={this.state.agencies}
                    currentAgency = {this.state.currentAgency}
                    agencyOverview = {this.state.agencyOverview}
                    agencyOverviewDay = {this.state.agencyOverviewDay}
                    sessionUser={this.state.sessionUser}
                    activeJobs = {this.state.activeJobs}
                    selectedState = {this.state.selectedState}
                    selectedStation = {this.state.selectedStation}
                    
                    hpmsData = {this.state.hpmsData}
                    activeFilters = {this.state.activeFilters}
                    uploads = {this.state.uploadJobs} />
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