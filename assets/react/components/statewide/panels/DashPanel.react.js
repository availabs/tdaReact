var React = require('react'),
	DashTable = require('../dash/dashtable.react');

var DashPanel = React.createClass({

	render: function() {

	    return (
	    	<div>
	    		<DashTable stations={this.props.stations} agency={this.props.currentAgency.datasource} selectedState={this.props.selectedState} />
            </div>
	    );
	}
});

module.exports = DashPanel;