'use strict';

var React = require('react'),
    
    //--Components
    WidgetHeader = require('../components/WidgetHeader.react'),
    AdtGraph = require('../components/statewide/graphs/Adt.graph.react'),
    MadtGraph = require('../components/statewide/graphs/Madt.graph.react'),
    StateWideMap =require('../components/statewide/StateWideMap.react'),

    //--Stores
    StationStore = require('../stores/StationStore');

    //--Utils


var StateIndex = React.createClass({
    
    getInitialState: function() {
        return {
            selectedState:null,
        };
    },
    
    componentDidMount: function() {

        StationStore.addChangeListener(this._onChange);
        
    },
    
    componentWillUnmount: function() {
        StationStore.removeChangeListener(this._onChange);
    },
    
    _onChange:function(){
        if(this.state.selectedState){
            var newState = this.state;
        }
    },
    
    render: function() {

        
        return (
            <div className="content container">
                <div className="row">
                    <div className="col-md-8">
                        <section className="widget whitesmoke no-padding">
                            <div className="body no-margin">
                                <StateWideMap />
                            </div>
                        </section>
                    </div>
                    <div className="col-md-4">
                        <AdtGraph />
                    </div>
                    <div className="col-md-4">
                        <MadtGraph />
                    </div>
                    
                </div>
                <div className="row">

                </div>
            </div>
            
        );
    },
    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    
    

    

});

module.exports = StateIndex;


