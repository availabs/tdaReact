var React = require('react');

var ToolTip = React.createClass({
 
	getDefaultProps:function(){
		return {
			config:{
				x:0,
				y:0,
				display:'none',
				content:'test 4123123 default',
				title:'Tooltip Title default',
			},
			size:{
				width:200,
				height:200
			}
		}
	},

	_Close:function(){
		d3.select('.ToolTip').style({display:'none'});
	},

	render: function() {
		

		//<i style={closeStyle} className="fa fa-close pull-right" onClick={this._Close}></i>
		return (
			<div id="nytg-tooltip">
                <div id="nytg-tooltipContainer">
                    <div className="nytg-department"></div>
                    <div className="nytg-rule"></div>
                    <div className="nytg-name"></div>
                    <div className="nytg-discretion"></div>
                    <div className="nytg-valuesContainer">
                        <span className="nytg-value"></span>
                        <span className="nytg-change"></span>
                    </div>
                    <div className="nytg-chart"></div>
                    <div className="nytg-tail"></div>
                </div>
            </div>
		);
	}
});

module.exports = ToolTip;