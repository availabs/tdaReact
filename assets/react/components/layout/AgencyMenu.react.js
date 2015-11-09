var React = require('react'),
    
    // -- AgencyStore
  

    // -- Utils
    ClientActionsCreator = require('../../actions/ClientActionsCreator');



var AgencyListing = React.createClass({
    
    _onClick : function(){
        ClientActionsCreator.setSelectedAgency(this.props.data.id);
    },
    render:function(){
        var selected = <span />;

        if(this.props.data.id === this.props.currentAgency.id){
            //console.log('AgencyListing / Render ',this.props.data.id , this.state.selectedAgency)
            selected = <i className="listCheck glyphicon glyphicon-ok"></i>;
        }

        return (
            <li role="presentation">

                <a onClick={this._onClick} className="message">
                    {selected}
                    <div className="details">
                        <div className="text">
                            {this.props.data.name}
                        </div>
                    </div>
                </a>
            </li>
        )
    }
})



var AgencyMenu = React.createClass({
   
    render: function(){
        var scope = this;        
        //console.log('AgencyMenu / Render',this.state.agencies)

        var messages = Object.keys(this.props.agencies).map(function(key){
            return (
                <AgencyListing key={key} data={scope.props.agencies[key]} currentAgency={scope.props.currentAgency} />
            );
        });

        return (
             <li className="dropdown">
                <a href="#" title="Messages" id="messages" className="dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                    <i className="fa fa-database"></i>
                </a>
                <ul id="messages-menu" className="dropdown-menu messages" role="menu">
                    {messages}
                    
                </ul>
            </li>
        )
    }
});

module.exports = AgencyMenu;