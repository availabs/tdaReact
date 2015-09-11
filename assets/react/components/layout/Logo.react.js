var React = require('react'),
	Link = require('react-router').Link;

var Logo = React.createClass({

	render: function() {
	    return (
	    	<div className="logo" style={{display:'block'}}>

	    		<Link to='/' style={{color:'#000'}}>
	    		<img src="/images/logo-bars-trans.png" style={{width:'50px'}} />
	    		<table style={{marginTop:'-10px',marginLeft:'-5px'}}> 
	    			<tr>
		        		<td>
		        			<img src="/images/dot_logo.png" style={{width:'20px'}} />
		        		</td>
		        		<td>
				        	<h4>
					        	<a style={{color:'#000',fontSize:'16px'}}>
						        	Travel Data
						        	Analytics
					        	</a>
				        	</h4>
				        </td>
			       	</tr>
			    </table>
			    </Link>
	    	</div>
	    );
	}
});

module.exports = Logo;