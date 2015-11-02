var React = require('react'),
	HpmsTypeGraph = require('../graphs/HpmsType.graph.react');

var HpmsPanel = React.createClass({

	render: function() {
	    return (
	    	<div >
                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_vdt' />
                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_length' />
            </div>
	    );
	}
});

module.exports = HpmsPanel;