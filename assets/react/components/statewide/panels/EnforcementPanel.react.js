var React = require('react'),
	EnforcementTable = require('../../enforcement/EnforcementTable.react');

var HpmsPanel = React.createClass({

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
	    		<EnforcementTable stations={this.props.stations} agency={this.props.currentAgency.datasource} selectedState={this.props.selectedState} />
            </div>
	    );
	}
});

module.exports = HpmsPanel;