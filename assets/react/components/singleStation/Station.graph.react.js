var React = require('react'),
	stationgraph = require('../../utils/dependencies/stationgraph');

var StationGraph = React.createClass({

	getInitialState:function(){
		return {
			stationId:this.props.selectedStation
		}
	},

	componentDidMount:function(){
		stationgraph.grapher('#wimGraph_'+this.state.stationId).drawGraph(this.state.stationId, this.props.type,this.props.fips);
	},

	componentWillReceiveProps : function(nextProps){

		if(this.props.selectedStation !== nextProps.selectedStation ){
			this.setState({stationId:nextProps.selectedStation})
			d3.select('#graphDIV').remove();
			d3.selectAll('#legendDIV').remove();
			console.log('test123',stationgraph)
			stationgraph.grapher('#wimGraph_'+this.state.stationId).drawGraph(this.state.stationId, this.props.type,this.props.fips);
		}
	},

	shouldComponentUpdate:function(){
		return false;
	},


	render: function() {
		return (
	    	<div >
                <div id={"wimGraph_"+this.state.stationId} />
               
            </div>
	    );
	}
});

module.exports = StationGraph;