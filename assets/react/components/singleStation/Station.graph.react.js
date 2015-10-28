var React = require('react'),
	stationgraph = require('../../utils/dependencies/stationgraph');

var StationGraph = React.createClass({


	componentDidMount:function(){
		
		stationgraph.grapher('#wimGraph').drawGraph(this.props.selectedStation, this.props.type,this.props.fips);
	    
	},

	render: function() {
		console.log('stationgraph render');
	    return (
	    	<div >
                <div id="wimGraph" />
                Station Graph
            </div>
	    );
	}
});

module.exports = StationGraph;