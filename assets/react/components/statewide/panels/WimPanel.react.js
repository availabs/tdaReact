var React = require('react'),
    Filters = require('../../layout/Filters.react'),
    TonnageGraph = require('../graphs/Tonnage.graph.react'),
    MadTonnageGraph = require('../graphs/MadTonnage.graph.react');

var WimPanel = React.createClass({

	render: function() {
        console.log()
        if(!this.props.selectedState){
            return (
                <div style={{height:300,textAlign:'center',paddingTop:50}}>
                    <h4>Ctl+Click a state on the map to start.</h4>
                </div>
            )
        }
	    return (
	    	<div>
                <Filters  
                    agency={this.props.currentAgency.datasource}
                    selectedState={this.props.selectedState} 
                />
                <TonnageGraph 
                    agency={this.props.currentAgency.datasource}
                    selectedState={this.props.selectedState}
                    filters={this.props.activeFilters} />

                <MadTonnageGraph 
                    agency={this.props.currentAgency.datasource}
                    selectedState={this.props.selectedState}
                    filters={this.props.activeFilters} />

                 <MadTonnageGraph 
                    agency={this.props.currentAgency.datasource}
                    selectedState={this.props.selectedState}
                    filters={this.props.activeFilters} 
                    index="2"
                    type="season" />
            </div>
	    );
	}
});

module.exports = WimPanel;