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
		var displayStyle  = {

			position:'fixed',
			left:this.props.config.x,
			top:this.props.config.y,
			display:this.props.config.display,
			backgroundColor:'white',
			paddingRight:'5',
			paddingLeft:'5',
			borderTop:'5px solid black',
			minWidth:'100px',
			borderRadius:'4px',
			zIndex:1000
		
		},
		headerStyle = {
			fontWeight:700,
			width:'100%',
			color:'#000'
		},
		closeStyle = {
			marginTop:'-30px',
			color:'#000',
			fontSize:'1.5em',
			cursor:'pointer'
		},

		bodyStyle = {
			width:'100%',
			color:'#000'
		};

		//<i style={closeStyle} className="fa fa-close pull-right" onClick={this._Close}></i>
		return (
			<div className="ToolTip" style={displayStyle}>
				<h4 className="TT_Title" style={headerStyle}></h4>
		    	<span className="TT_Content" style={bodyStyle}></span>
			</div>
		);
	}
});

module.exports = ToolTip;