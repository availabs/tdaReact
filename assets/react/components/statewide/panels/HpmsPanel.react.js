var React = require('react'),
	HpmsTypeGraph = require('../graphs/HpmsType.graph.react');

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
	    	<div >
                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_vdt' />
                    <HpmsTypeGraph  hpmsData={this.props.hpmsData} selectedState={this.props.selectedState} groupKey='route_length' />
            </div>
	    );
	}
});

module.exports = HpmsPanel;