var React = require('react'),
    Router = require('react-router'),
    Link = require('react-router').Link,
    
    //--Utils
    stnCardMeta = require('../utils/data/stnCardMeta');
    
    //--Actions
    ClientActionsCreator = require('../actions/ClientActionsCreator')

    //--Stores
    StateWideStore = require('../stores/StatewideStore'),
    StationStore = require('../stores/StationStore'),

    //--Components
    Loading = require('../components/layout/Loading.react'),
    CountByTimeGraph = require('../components/singleStation/CountByTimeGraph.react'),
    AvgHourGraph = require('../components/singleStation/AvgHourGraph.react'),
    VehicleClassPie = require('../components/singleStation/VehicleClassPie.react'),
    StationInfo = require('../components/singleStation/StationInfo.react'),
    YearlyHighestDays = require('../components/reports/YearlyHighestDays.report.react'),
    AdtChangeReport = require('../components/singleStation/AdtChangeReport.react');


var SingleStation = React.createClass({
    mixins: [Router.State],

    statics: {
        
        willTransitionTo: function (transition, params) {
            
            if(params.stationId && params.fips){
               ClientActionsCreator.setSelectedStation(params.stationId,params.fips);

            }
        }
    
    },

    getInitialState:function(){

        return {
            filters:StateWideStore.activeFilters(),
            selectedStationId:StateWideStore.getSelectedStation(),
            stationdData:StateWideStore.getClassByHour(),
            selectedStationMeta:StationStore.getSelectedStation(),

        }        
    
    },
     componentDidMount: function() {

        StateWideStore.addChangeListener(this._onChange);
        StationStore.addChangeListener(this._onChange);

       
    },
    
    componentWillUnmount: function() {
        
        StateWideStore.removeChangeListener(this._onChange);
        StationStore.removeChangeListener(this._onChange);
        
    },

    _onChange:function(){
        this.setState({
            filters:StateWideStore.activeFilters(),
            selectedStationId:StateWideStore.getSelectedStation(),
            stationdData:StateWideStore.getClassByHour(),
            selectedStationMeta:StationStore.getSelectedStation()
        })
    },
    renderData:function(){
        return (
            <div>
                <div className="row">
                    <div className="col-lg-3">
                          
                        <VehicleClassPie stationData={this.state.stationdData} filters={this.state.filters} />                       
                        
                    </div>
                    <div className="col-lg-3">
                          
                        <AdtChangeReport stationData={this.state.stationdData} filters={this.state.filters} />                       
                        
                    </div>
                    <div className="col-lg-3">
                          
                        <StationInfo stationInfo={this.state.selectedStationMeta.properties} />                       
                        
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-6">
                            
                        <CountByTimeGraph stationData={this.state.stationdData} filters={this.state.filters} />                       
                        
                    </div>
                    <div className="col-lg-6">
                            
                        <AvgHourGraph stationData={this.state.stationdData} filters={this.state.filters} />                       
                        
                    </div>
                </div>
                <div className="row">
                    <div className="col-lg-12">
                            
                        <YearlyHighestDays stationData={this.state.stationdData} filters={this.state.filters} stationInfo={this.state.selectedStationMeta.properties} />
                    </div>
                </div>
            </div>
        )
    },
    renderLoading:function(){
        return (
            <Loading />
        )
    },
   
    render: function() {
        //console.log('station data',this.state.stationdData.initialized())

        var stationLocation = this.state.selectedStationMeta.properties ? this.state.selectedStationMeta.properties.station_location : '';
        var stationRoute = this.state.selectedStationMeta.properties ? stnCardMeta.posted_route_sign_abbr[this.state.selectedStationMeta.properties.posted_route_sign]+'-'+ parseInt(this.state.selectedStationMeta.properties.posted_sign_route_num) : "";
        var display = this.state.stationdData.initialized() ? this.renderData() : this.renderLoading();


        return (
        	<div className="content container">
            	<h2 className="page-title" style={{color:'#000'}}>Station {this.state.selectedStationId} <small style={{color:'#333'}}>{stationRoute} - {stationLocation}</small></h2>
            	{display}
        	</div>
        );
    }
});

module.exports = SingleStation;