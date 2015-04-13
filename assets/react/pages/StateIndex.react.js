'use strict';

var React = require('react'),
    
    //--Components
    WidgetHeader = require('../components/WidgetHeader.react'),
    AdtGraph = require('../components/statewide/graphs/Adt.graph.react'),
    MadtGraph = require('../components/statewide/graphs/Madt.graph.react'),
    HpmsTypeGraph = require('../components/statewide/graphs/HpmsType.graph.react'),
    YearlyHighestDays = require('../components/reports/YearlyHighestDays.report.react'),
    
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
            classByDay : StateWideStore.getClassByDay(),
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
            classByDay : StateWideStore.getClassByDay(),
            hpmsData : HpmsStore.getStateData()
        });
    },
    
    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------

    render: function() {
        // var mapStyle ={
           
        // };
        
        return (
            <div className="content container">
                <div className="row">
                
                    <div className="col-md-6" >
                        <section className="widget whitesmoke no-padding mapaffix"  >
                            <div className="body no-margin">
                                <StateWideMap />
                            </div>
                        </section>
                    </div>
                

                    <div className="col-md-6">
                        <AdtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} />

                        <MadtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} index='0' />

                        <MadtGraph classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} graphType='season' index='1' />
                        
                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_vdt' />

                        <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_length' />

                        <YearlyHighestDays classByDay={this.state.classByDay} selectedState={this.state.selectedState} />

                    </div>
                   
                    
                </div>
                
            </div>
            
        );
    },

    
    

    

});

module.exports = StateIndex;


