var React = require('react'),
	EnforcementTable = require('../../enforcement/EnforcementTable.react');

var HpmsPanel = React.createClass({

	render: function() {
	    return (
	    	<div>
	    		<EnforcementTable stations={this.props.stations} agency={this.props.currentAgency.datasource} selectedState={this.props.selectedState} />
            </div>
	    );
	}
});

module.exports = HpmsPanel;