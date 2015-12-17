var React = require('react'),
    Filters = require('../../layout/Filters.react'),

	// -- compoinents
	AdtGraph = require('../graphs/Adt.graph.react'),
    MadtGraph = require('../graphs/Madt.graph.react');

var ClassPanel = React.createClass({

	render: function() {
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