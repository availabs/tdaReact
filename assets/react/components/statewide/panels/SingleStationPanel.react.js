var React = require('react'),

	// -- compoinents
	StationCountByTimeGraph = require('../../singleStation/CountByTime.graph.react'),
    StationAvgHourGraph = require('../../singleStation/AvgHour.graph.react'),
    VehicleClassPie = require('../../singleStation/VehicleClassPie.graph.react'),
    LoadSpectraGraph =  require('../../singleStation/LoadSpectra.graph.react'),
    SingleStationGraph =  require('../../singleStation/Station.graph.react');

var SingleStationPanel = React.createClass({

	render: function() {
		var type = 'class',
			wimGraphs = null;
		if(d3.select(".station_"+this.props.selectedStation).classed("type_WIM")){
            type='wim';
            wimGraphs = (
                <LoadSpectraGraph
                    fips={this.props.selectedState} 
                    selectedStation={this.props.selectedStation} 
                    filters={this.props.activeFilters}/>
            )

        }

       

	    return (
	    	<div>
                {this.props.selectedStation} {type}

                {wimGraphs}
                
                <SingleStationGraph 
                    fips={this.props.selectedState} 
                    selectedStation={this.props.selectedStation} 
                    filters={this.props.activeFilters}
                    type = {type} />


                <StationCountByTimeGraph 
                    fips={this.props.selectedState} 
                    selectedStation={this.props.selectedStation} 
                    filters={this.props.activeFilters}/>

                <StationAvgHourGraph 
                    fips={this.props.selectedState} 
                    selectedStation={this.props.selectedStation} 
                    filters={this.props.activeFilters}/>
                
            </div>
	    );
	}
});

module.exports = SingleStationPanel;