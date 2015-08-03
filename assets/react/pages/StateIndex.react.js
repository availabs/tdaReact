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

    _setActiveComponent : function(e){
        this.setState({activeComponent:e.target.getAttribute('value')})
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
                        <section className="widget widget-tabs">
                            <header>
                                <ul className="nav nav-tabs" onClick={this._setActiveComponent}>
                                    <li value="classCounts" className='active'>
                                        <a href="#classCounts" data-toggle="tab" value="classCounts" aria-expanded="true">Class</a>
                                    </li>
                                    <li value="wim">
                                        <a href="#wim" data-toggle="tab" value="wim">WIM</a>
                                    </li>
                                    <li>
                                        <a href="#hpms" data-toggle="tab" value="hpms">HPMS</a>
                                    </li>
                                   
                                </ul>
                            </header>
                            <div className="body tab-content">
                                <div id="classCounts" className="tab-pane clearfix active">
                                    <AdtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} />

                                    <MadtGraph  classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} index='0' />

                                    <MadtGraph classByMonth={this.state.classByMonth} selectedState={this.state.selectedState} graphType='season' index='1' />

                                </div>
                                <div id="wim" className="tab-pane clearfix">
                                 WIM
                                </div>
                                <div id="hpms" className="tab-pane clearfix">
                                    <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_vdt' />

                                    <HpmsTypeGraph  hpmsData={this.state.hpmsData} selectedState={this.state.selectedState} groupKey='route_length' />
                                </div>
                               

                            </div>
                        </section>
                                                
                        

                        

                    </div>
                   
                    
                </div>
                
            </div>
            
        );
    },

    
    

    

});

module.exports = StateIndex;


