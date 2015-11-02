var React = require('react'),

	// -- compoinents
	AdtGraph = require('../graphs/Adt.graph.react'),
    MadtGraph = require('../graphs/Madt.graph.react');

var ClassPanel = React.createClass({

	render: function() {
	    return (
	    	<div>
                
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
	    );
	}
});

module.exports = ClassPanel;