var React = require('react'),
	EnforcementTable = require('../../enforcement/EnforcementTable.react');

var HpmsPanel = React.createClass({

	render: function() {
	    return (
	    	<div>
	    		<EnforcementTable currentAgency={this.props.currentAgency} selectedState={this.props.selectedState} />
            </div>
	    );
	}
});

module.exports = HpmsPanel;