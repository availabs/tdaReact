'use strict';

var React = require('react'),
    
    //--Actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator'),

    //--Stores 
    StateWideStore = require('../../stores/StatewideStore');


var labelStyle = {
	width:"100%",
	"textlign":"center"
}


function updateClassByMonth(){

    return {
        classByMonth : StateWideStore.getClassByMonth(),
        filters: StateWideStore.activeFilters()
    };
}

var Filters = React.createClass({
//style="overflow-y: auto; min-height: 60px; max-height: 123px;"
    getInitialState: function() {
        return {
            classByMonth : StateWideStore.getClassByMonth(),
            filters: StateWideStore.activeFilters(),
            currentYear: null,
            currentClass: null,
            currentMonth:null
        }
    },

    componentDidMount: function() {
        StateWideStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        StateWideStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this.setState(updateClassByMonth());
        if(this.state.classByMonth.getGroup('stationId')){
            // console.log(
            //     'on change Filter2',
            //     this.state.classByMonth.getGroup('stationId')
            //         .top(Infinity)
            //         .map(function(d){
            //             return d.key
            //         })
            // )
        }
    },

    _setYearFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currentYear:e.target.getAttribute('value')})
        ClientActionsCreator.filterYear(e.target.getAttribute('value'));
    },

    _setMonthFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currentMonth:e.target.getAttribute('value')})
        ClientActionsCreator.filterMonth(e.target.getAttribute('value'));
    },

    _setClassFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currentClass:e.target.getAttribute('value')})
        ClientActionsCreator.filterClass(e.target.getAttribute('value'));
    },

    _parseYear:function(year){
        if(!year){
            return 'All'
        }

        var yearName = '';
        year = year.toString();
        if(year.length === 1){
                yearName = '200'+year;
        }else  if(year.length === 2){
            yearName = '20'+year;
        }else if(year.length === 4){
            if(parseInt(year.substr(2,2)) > 50){
                yearName = '19'+year.substr(2,2)
            }else{
                yearName = year;
            }
        }
        return parseInt(yearName);
    },

    _getYears : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('year')){

            var orderedYears =  this.state.classByMonth.getGroup('year').top(Infinity).map(function(year){
               
                
               
                return {key:year.key, name:scope._parseYear(year.key)};

            }).sort(function(a,b){
                return b.name-a.name;
            })


            var output = orderedYears.map(function(year,i){
                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setYearFilter} value={year.key} className="">{year.name}</a></li>)
            })
            return output;
        }
        return;
    },

    _getMonths : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('month')){

            var output = this.state.classByMonth.getGroup('month')
            .top(Infinity)
            .sort(function(a,b){
                return +b.key-+a.key
            })
            .map(function(month,i){
                return (<li rel="1" key={i} value={month.key}><a  tabIndex="-1" onClick={scope._setMonthFilter} value={month.key} className="">{month.key}</a></li>)
            })
            return output;
        }
        return;
    },

    _getClasses : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('class')){

            var output = this.state.classByMonth.getGroup('class')
            .top(Infinity)
            .sort(function(a,b){
                return +b.key-+a.key
            })
            .map(function(vclass,i){
                return (<li rel="1" key={i} value={vclass.key} ><a  tabIndex="-1" onClick={scope._setClassFilter} value={vclass.key} className="">Class {vclass.key}</a></li>)
            })
            return output;
        }
        return;
    },

    render: function() {
        var scope = this;
        //console.log('FILTERS/ render',this.state.currentYear)
        var currentYear = scope._parseYear(this.state.currentYear);
        var currentMonth = this.state.currentMonth || 'All';
        var currentClass = this.state.currentClass || 'All';
        var years = this._getYears()
        var months = this._getMonths();
        var classes = this._getClasses();


  
        return (
        	<section className="widget ui-sortable no-padding" style={{background:'none'}}>
    			<fieldset>
                    <div className="control-group">
                        <label className="control-label centered" style={labelStyle} ><strong>Year</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" 
                                    data-toggle="dropdown" id="simple-big" tabIndex="-1" aria-expanded="false">
                                    <span className="filter-option">{currentYear}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                </button>
                            	<ul className="dropdown-menu" role="menu" >
                            		<li rel="0"><a tabIndex="-1" onClick={scope._setYearFilter} value={null}>All</a></li>
                                    {years}
                            	</ul>
                            </div>               
                        </div>
                        <label className="control-label centered" style={labelStyle} ><strong>Months</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" 
                                    data-toggle="dropdown" id="simple-big" tabIndex="-1" 
                                    aria-expanded="false">
                                    <span className="filter-option">{currentMonth}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                </button>
                            	<ul className="dropdown-menu" role="menu" >
                            		<li rel="0"><a tabIndex="-1" onClick={scope._setMonthFilter} value={null}>All</a></li>
                                    {months}
                            	</ul>
                            </div>               
                        </div>
                        <label className="control-label centered" style={labelStyle} ><strong>ClassName</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" 
                                    data-toggle="dropdown" id="simple-big" tabIndex="-1" 
                                    aria-expanded="false">
                                    <span className="filter-option">{currentClass}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                </button>
                            	<ul className="dropdown-menu" role="menu" >
                                    <li rel="0"><a tabIndex="-1" onClick={scope._setClassFilter} value={null}>All</a></li>
                            		{classes}
                            	</ul>
                            </div>               
                        </div>
                        <div>

                        </div>
                    </div>
                    {this._activeStations()}
                </fieldset>
    	 	</section>
        );
    },
    _activeStations:function(){
      
        if(this.state.filters.stations.length == 0){
            return <span />;
        }
        var stations  = this.state.filters.stations.map(function(st){
            return <div>{st}</div>
        })
        var clearStyle ={
            fontSize:'0.9em',
            color:'rgb(146, 197, 222)',
            cursor:'pointer'
        }
        return (
            <div>
            <h4> Active Stations <span className="pull-right" onClick={this._clearStationFilter} style={clearStyle}>clear</span></h4>
            {stations}
            </div>
        )
    },
    _clearStationFilter:function(){
        ClientActionsCreator.filterStations(false);
    }
});

module.exports = Filters;