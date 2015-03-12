var React = require('react');

var Logo = React.createClass({

	render: function() {
	    return (
	    	<div className="logo">
	    		<img src="/images/logo-bars-trans.png" style={{width:'120px'}} />
	    		<table style={{marginTop:'-10px',marginLeft:'-5px'}}> 
	    			<tr>
		        		<td>
		        			<img src="/images/dot_logo.png" style={{width:'40px'}} />
		        		</td>
		        		<td>
				        	<h4>
					        	<a style={{color:'#000'}}>
						        	Travel Data<br /> 
						        	Analytics
					        	</a>
				        	</h4>
				        </td>
			       	</tr>
			    </table>
	    	</div>
	    );
	}
});

module.exports = Logo;