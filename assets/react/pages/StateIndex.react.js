'use strict';

var React = require('react'),
    
    //--Components
    WidgetHeader = require('../components/WidgetHeader.react'),
    AdtGraph = require('../components/statewide/graphs/Adt.graph.react'),
    MadtGraph = require('../components/statewide/graphs/Madt.graph.react'),
    HpmsTypeGraph = require('../components/statewide/graphs/HpmsType.graph.react'),
    
    StateWideMap =require('../components/statewide/StateWideMap.react'),

    //--Stores
    StationStore = require('../stores/StationStore'),
    StateWideStore = require('../stores/StatewideStore'),
    HpmsStore = require('../stores/HpmsStore');

    //--Utils


var StateIndex = React.createClass({
    
    getInitialState: function() {
        return {
            selectedState : StateWideStore.getSelectedState(),
            classByMonth : StateWideStore.getClassByMonth(),
            hpmsData : HpmsStore.getStateData()
        };
    },
    
    componentDidMount: function() {

        StationStore.addChangeListener(this._onChange);
        StateWideStore.addChangeListener(this._onChange);
        HpmsStore.addChangeListener(this._onChange);
    },
    
    componentWillUnmount: function() {
        StationStore.removeChangeListener(this._onChange);
        StateWideStore.removeChangeListener(this._onChange);
        HpmsStore.removeChangeListener(this._onChange);
    },
    
    _onChange:function(){

        this.setState({
            selectedState : StateWideStore.getSelectedState(),
            classByMonth : StateWideStore.getClassByMonth(),
            hpmsData : HpmsStore.getStateData()
        });
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
                        <AdtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} />
                    </div>
                    <div className="col-md-4">
                        <MadtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState}/>
                    </div>
                    
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='type_vdt' />
                    </div>
                     <div className="col-md-6">
                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='type_length' />
                    </div>
                     <div className="col-md-6">
                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_vdt' />
                    </div>
                     <div className="col-md-6">
                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_length' />
                    </div>
                </div>
            </div>
            
        );
    },
    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    
    

    

});

module.exports = StateIndex;


