'use strict';

var React = require('react'),
    
    //--Components
    DashPanel = require('../components/statewide/panels/DashPanel.react'),
    ClassPanel = require('../components/statewide/panels/ClassPanel.react'),
    WimPanel = require('../components/statewide/panels/WimPanel.react'),
    HpmsPanel = require('../components/statewide/panels/HpmsPanel.react'),
    EnforcementPanel = require('../components/statewide/panels/EnforcementPanel.react'),
    SingleStationPanel = require('../components/statewide/panels/SingleStationPanel.react'),

    WidgetHeader = require('../components/WidgetHeader.react'),
    
    

    
    
    
    
    StateWideMap =require('../components/statewide/StateWideMap.react'),

    //--Stores
    StationStore = require('../stores/StationStore'),
    StateWideStore = require('../stores/StatewideStore'),
    HpmsStore = require('../stores/HpmsStore'),
    Filters = require('../components/layout/Filters.react');

    //--Utils


var StateIndex = React.createClass({
    
    getInitialState: function() {
        return {
            activeComponent:'dash'
        };
    },
    

    _setActiveComponent : function(e){
        this.setState({activeComponent:e.target.getAttribute('value')})
    },

    
    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    render: function() {
        // var mapStyle ={
           
        // };
        var activeStation = '',
            type='class',
            wimGraphs = <span />;
       

        var currentPanel = <span />;
        switch(this.state.activeComponent){


            case 'dash':
                currentPanel = <DashPanel selectedStation={this.props.selectedStation} stations={this.props.stations} currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} selectedStation={this.props.selectedStation} activeFilters={this.props.activeFilters} />;
            break;

            case 'class':
                currentPanel = <ClassPanel currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} selectedStation={this.props.selectedStation} activeFilters={this.props.activeFilters} />;
            break;

            case 'wim':
                currentPanel = <WimPanel currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} selectedStation={this.props.selectedStation} activeFilters={this.props.activeFilters} />;
            break;

            case 'hpms':
                currentPanel = <HpmsPanel hpmsData={this.props.hpmsData} currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} selectedStation={this.props.selectedStation} activeFilters={this.props.activeFilters} />;
            break;

            case 'enforcement':
                currentPanel = <EnforcementPanel selectedStation={this.props.selectedStation} stations={this.props.stations} currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} selectedStation={this.props.selectedStation} activeFilters={this.props.activeFilters} />;
            break;

        
        }

        return (
            <div className="content container">
                <div className="row">
                    
                    <div className="col-xs-6" >
                        <section className="widget whitesmoke no-padding mapaffix"  >
                            <div className="body no-margin">
                                <StateWideMap
                                    selectedStation = {this.props.selectedStation}
                                    activeView={this.state.activeComponent}
                                    agency={this.props.currentAgency.datasource}
                                    selectedState={this.props.selectedState}
                                    filters={this.props.activeFilters}
                                    stations={this.props.stations} />
                            </div>
                        </section>
                    </div>
                

                    <div className="col-xs-6">
                        <section className="widget">
                            <header>
                                
                                <ul className="nav nav-tabs" onClick={this._setActiveComponent} style={{cursor:'pointer'}}>
                                    <li value="dash" className={this.state.activeComponent === 'dash' ? 'active' : ''}>
                                        <a value="dash">Overview</a>
                                    </li>
                                    <li value="class" className={this.state.activeComponent === 'class' ? 'active' : ''}>
                                        <a value="class">Class</a>
                                    </li>
                                    <li value="wim" className={this.state.activeComponent === 'wim' ? 'active' : ''}>
                                        <a  value="wim">WIM</a>
                                    </li>
                                    <li className={this.state.activeComponent === 'hpms' ? 'active' : ''}>
                                        <a  value="hpms">HPMS</a>
                                    </li>
                                    <li className={this.state.activeComponent === 'enforcement' ? 'active' : ''}>
                                        <a  value="enforcement">Enforcement</a>
                                    </li>
                                    {activeStation}
                                </ul>
                            </header>
                           
                            <div className="body">
                                
                                {currentPanel}       

                            </div>
                        </section>
                                                
                        

                        

                    </div>
                   
                    
                </div>
                
            </div>
            
        );
    },

    
    

    

});

module.exports = StateIndex;


