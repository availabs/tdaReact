'use strict';

var React = require('react'),
    
    //--Components
    WidgetHeader = require('../components/WidgetHeader.react'),
    AdtGraph = require('../components/statewide/graphs/Adt.graph.react'),
    MadtGraph = require('../components/statewide/graphs/Madt.graph.react'),
    HpmsTypeGraph = require('../components/statewide/graphs/HpmsType.graph.react'),
    
    TonnageGraph = require('../components/statewide/graphs/Tonnage.graph.react'),
    MadTonnageGraph = require('../components/statewide/graphs/MadTonnage.graph.react'),
    
    StationCountByTimeGraph = require('../components/singleStation/CountByTime.graph.react'),
    StationAvgHourGraph = require('../components/singleStation/AvgHour.graph.react'),
    VehicleClassPie = require('../components/singleStation/VehicleClassPie.graph.react'),
    LoadSpectraGraph =  require('../components/singleStation/LoadSpectra.graph.react'),
    
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
            activeComponent:'classCounts'
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
       

        if(this.props.selectedStation){

            if(d3.select(".station_"+this.props.selectedStation).classed("type_WIM")){
                type='wim';
                wimGraphs = (
                    <LoadSpectraGraph
                        fips={this.props.selectedState} 
                        selectedStation={this.props.selectedStation} 
                        filters={this.props.activeFilters}/>
                )

            }

            activeStation = (
                <li>
                    <a href="#selection" data-toggle="tab" value="selection">Station {this.props.selectedStation}</a>
                </li>
            )
        }


        return (
            <div className="content container">
                <div className="row">
                    
                    <div className="col-xs-6" >
                        <section className="widget whitesmoke no-padding mapaffix"  >
                            <div className="body no-margin">
                                <StateWideMap 
                                    activeView={this.state.activeComponent}
                                    agency={this.props.currentAgency.datasource}
                                    selectedState={this.props.selectedState}
                                    filters={this.props.activeFilters} />
                            </div>
                        </section>
                    </div>
                

                    <div className="col-xs-6">
                        <section className="widget widget-tabs">
                            <header>
                                
                                <ul className="nav nav-tabs" onClick={this._setActiveComponent}>
                                    <li value="classCounts" className='active'>
                                        <a href="#classCounts" data-toggle="tab" value="classCounts" aria-expanded="true">Class</a>
                                    </li>
                                    <li value="wim">
                                        <a href="#wim" data-toggle="tab" value="wim">WIM</a>
                                    </li>
                                    <li>
                                        <a href="#hpms" data-toggle="tab" value="hpms">HPMS</a>
                                    </li>
                                    {activeStation}
                                </ul>
                            </header>
                            <section style={{backgroundColor:'#fff',padding:'10px'}}>
                                <Filters
                                    agency={this.props.currentAgency.datasource}
                                    selectedState={this.props.selectedState} />
                            </section>
                            <div className="body tab-content">
                                <div id="classCounts" className="tab-pane clearfix active">
                                    <AdtGraph
                                        agency={this.props.currentAgency.datasource}
                                        selectedState={this.props.selectedState} 
                                        filters={this.props.activeFilters} />

                                    <MadtGraph
                                        agency={this.props.currentAgency.datasource}  
                                        selectedState={this.props.selectedState} 
                                        filters={this.props.activeFilters}
                                        index='0' />

                                    <MadtGraph
                                        agency={this.props.currentAgency.datasource}
                                        selectedState={this.props.selectedState} 
                                        filters={this.props.activeFilters}
                                        graphType='season' 
                                        index='1' />

                                </div>
                                <div id="wim" className="tab-pane clearfix">
                                 WIM
                                    

                                </div>
                                <div id="hpms" className="tab-pane clearfix">
                                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_vdt' />

                                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_length' />
                                </div>
                                <div id="selection" className="tab-pane clearfix">
                                    {this.props.selectedStation} {type}

                                    {wimGraphs}
                                    
                                    <VehicleClassPie
                                        fips={this.props.selectedState} 
                                        selectedStation={this.props.selectedStation} 
                                        filters={this.props.activeFilters}/>

                                    <StationCountByTimeGraph 
                                        fips={this.props.selectedState} 
                                        selectedStation={this.props.selectedStation} 
                                        filters={this.props.activeFilters}/>

                                    <StationAvgHourGraph 
                                        fips={this.props.selectedState} 
                                        selectedStation={this.props.selectedStation} 
                                        filters={this.props.activeFilters}/>
                                    
                                </div>

                               

                            </div>
                        </section>
                                                
                        

                        

                    </div>
                   
                    
                </div>
                
            </div>
            
        );
    },

    
    

    

});

module.exports = StateIndex;


