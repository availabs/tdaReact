var React = require('react');

var Loading = React.createClass({

	render: function() {
	    return (
	    	<div>
	    		<h4 style={{color:'#000'}}> Loading Data ... </h4>
		    	<div className="preloader loading">
				  <span className="slice"></span>
				  <span className="slice"></span>
				  <span className="slice"></span>
				  <span className="slice"></span>
				  <span className="slice"></span>
				  <span className="slice"></span>
				</div>
			</div>
	    );
	}
});

module.exports = Loading;