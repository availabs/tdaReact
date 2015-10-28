var React = require('react'),

    TonnageGraph = require('../graphs/Tonnage.graph.react'),
    MadTonnageGraph = require('../graphs/MadTonnage.graph.react');

var WimPanel = React.createClass({

	render: function() {
	    return (
	    	<div>
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