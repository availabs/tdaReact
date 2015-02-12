var React = require('react');

var Logo = React.createClass({

  render: function() {
    return (
    	<div className="logo">
        	<h4><a style={{color:'#000'}}>Travel Data Analytics</a></h4>
    	</div>
    );
  }
});

module.exports = Logo;