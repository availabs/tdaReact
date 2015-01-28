var React = require('react'),
    
    // -- AgencyStore
    AgencyStore = require('../../stores/AgencyStore'),

    // -- Utils
    ClientActionsCreator = require('../../actions/ClientActionsCreator');

function getSelectedAgencyfromStore(){
    return{
        selectedAgency : AgencyStore.getSelectedAgency()
    }
}

var AgencyListing = React.createClass({
    getInitialState: function() {
      return getSelectedAgencyfromStore();
    },
    componentDidMount: function() {
        AgencyStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        AgencyStore.removeChangeListener(this._onChange);
    },
    _onChange :function(){
        this.setState(getSelectedAgencyfromStore());
    },
    _onClick : function(){
        ClientActionsCreator.setSelectedAgency(this.props.data.id);
    },
    render:function(){
        var selected = <span />;

        if(this.props.data.id === this.state.selectedAgency.id){
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

function getStatefromStores(){
    return {
        agencies : AgencyStore.getAll()
    }
}

var AgencyMenu = React.createClass({
    getInitialState: function() {
      return getStatefromStores();
    },
    componentDidMount: function() {
        AgencyStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        AgencyStore.removeChangeListener(this._onChange);
    },
    _onChange :function(){
        this.setState(getStatefromStores());
    },
    render: function(){
        var scope = this;        
        //console.log('AgencyMenu / Render',this.state.agencies)

        var messages = Object.keys(this.state.agencies).map(function(key){
            return (
                <AgencyListing key={key} data={scope.state.agencies[key]} />
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