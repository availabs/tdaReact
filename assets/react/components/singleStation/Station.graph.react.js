var React = require('react'),
	stationgraph = require('../../utils/dependencies/stationgraph');

var StationGraph = React.createClass({

	getInitialState:function(){
		return {
			stationId:this.props.selectedStation
		}
	},

	componentDidMount:function(){
		console.log('station graph mount agency',this.props.agency)
		stationgraph.grapher( '#wimGraph_'+this.state.stationId, this.props.agency).drawGraph(this.state.stationId, this.props.type,this.props.fips,this.props.agency);
	},

	componentWillReceiveProps : function(nextProps){

		if(this.props.selectedStation !== nextProps.selectedStation ){
			this.setState({stationId:nextProps.selectedStation})
			d3.select('#graphDIV').remove();
			d3.selectAll('#legendDIV').remove();
			
			stationgraph.grapher('#wimGraph_'+this.state.stationId, this.props.agency).drawGraph(this.state.stationId, this.props.type,this.props.fips,this.props.agency);
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