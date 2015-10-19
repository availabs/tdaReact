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




var Filters = React.createClass({
//style="overflow-y: auto; min-height: 60px; max-height: 123px;"
    getInitialState: function() {
        return {
            classByMonth : {},
            filters: StateWideStore.activeFilters(),
            currentYear: null,
            currentClass: null,
            currentMonth:null,
            currentDir:null
        }
    },

    componentDidMount: function() {
        this._getClassByMonthFilters(StateWideStore.getSelectedState());      
        StateWideStore.addChangeListener(this._onChange);
    },

    componentWillUnmount: function() {
        StateWideStore.removeChangeListener(this._onChange);
    },

    _onChange:function(){
        this._getClassByMonthFilters(StateWideStore.getSelectedState());
        console.log("RY2");
    },

   _getClassByMonthFilters: function(fips){
        var scope = this;
        if(fips != null){
            d3.json('/tmgClass/classByMonthFilters?database=allWim')
                .post(JSON.stringify({filters:StateWideStore.activeFilters(),fips:fips}),function(err,data){
            
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){_getClassByMonthFilters(fips) }, 2000);
                        
                }else{
                    console.log("In d3.json call",data);
                    scope.setState({classByMonth:data});
                }
            })
        }
    },



    _setYearFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currentYear:e.target.getAttribute('value')})
        ClientActionsCreator.filterYear(e.target.getAttribute('value'));
        if(e.target.getAttribute('value') === null){
             ClientActionsCreator.filterMonth(null);
        }   
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
    _setDirFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currentDir:e.target.getAttribute('value')})
        ClientActionsCreator.filterDir(e.target.getAttribute('value'));
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

        if(this.state.classByMonth['orderedYears']){
            var output = this.state.classByMonth['orderedYears'].map(function(year,i){
                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setYearFilter} value={year.key} className="">{year.name}</a></li>)
            })
            return output;
        }
        return;
    },

    _getMonths : function(){
        var scope = this,
            months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

        if(this.state.classByMonth['orderedMonths']){
            var output = this.state.classByMonth['orderedMonths'].map(function(month,i){
                return (<li rel="1" key={i} value={month.key}><a  tabIndex="-1" onClick={scope._setMonthFilter} value={month.key} className="">{month.key +'-'+ months[month.key-1]}</a></li>)
            })
            return output;
        }
        return;
    },
    _getDirs : function(){
        var scope = this;
        var output = (<li rel="1" key="0" value="north" ><a  tabIndex="-1" onClick={scope._setDirFilter} value="north" className="">North</a></li>)
    

        if(this.state.classByMonth['orderedDirs']){
            var output = this.state.classByMonth['orderedDirs'].map(function(dir,i){
                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setDirFilter} value={dir.key} className="">{dir.name}</a></li>)
            })
            return output;
        }
    },

    _getClasses : function(){
        var scope = this;

        if(this.state.classByMonth['orderedClasses']){

            var output = this.state.classByMonth['orderedClasses'].map(function(vclass,i){
                return (<li rel="1" key={i} value={vclass.key} ><a  tabIndex="-1" onClick={scope._setClassFilter} value={vclass.key} className="">Class {vclass.key}</a></li>)
            })
            return output;
        }
        return;
    },
    renderMonth:function(){
        var currentMonth = this.state.currentMonth || 'All';
        var months = this._getMonths();
        var scope = this,
            monthscale = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        return (
             <div className="col-xs-4" >
                <label className="control-label centered" style={labelStyle} ><strong>Months</strong></label>
                <div className="controls form-group">
                    <div className="btn-group bootstrap-select col-md-12">
                        <button className="btn dropdown-toggle clearfix btn-primary btn-sm btn-block" 
                            data-toggle="dropdown" id="simple-big" tabIndex="-1" 
                            aria-expanded="false">
                            <span className="filter-option">{currentMonth } {currentMonth === 'All' ? '' : '-'+monthscale[currentMonth-1]}</span>&nbsp;<i className="fa fa-caret-down"></i>
                        </button>
                        <ul className="dropdown-menu" role="menu" >
                            <li rel="0"><a tabIndex="-1" onClick={scope._setMonthFilter} value={null}>All</a></li>
                            {months}
                        </ul>
                    </div>               
                </div>
            </div>
        )
    },
    render: function() {
        var scope = this;
        //console.log('FILTERS/ render',this.state.currentYear)
        var currentYear = scope._parseYear(this.state.currentYear);
        var currentClass = this.state.currentClass || 'All';
        var currentDir = this.state.currentDir || 'All';
        var years = this._getYears();
        var classes = this._getClasses();
        var dirs = this._getDirs();
        var renderMonth = currentYear === 'All' ? <span /> : this.renderMonth();

        console.log("RY",scope);
        return (
        	<section className="widget ui-sortable no-padding" style={{background:'none',margin:'0px'}}>
    			<fieldset>
                    <div className="control-group">
                        <div className="row" >
                            <div className="col-xs-4" >
                                <label className="control-label centered" style={labelStyle} ><strong>Year</strong></label>
                                <div className="controls form-group">
                                    <div className="btn-group bootstrap-select col-md-12">
                                    	<button className="btn dropdown-toggle clearfix btn-primary btn-sm btn-block" 
                                            data-toggle="dropdown" id="simple-big" tabIndex="-1" aria-expanded="false">
                                            <span className="filter-option">{currentYear}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                        </button>
                                    	<ul className="dropdown-menu" role="menu" >
                                    		<li rel="0"><a tabIndex="-1" onClick={scope._setYearFilter} value={null}>All</a></li>
                                            {years}
                                    	</ul>
                                    </div>               
                                </div>
                            </div>
                            {renderMonth}
                            <div className="col-xs-4" >
                                <label className="control-label centered" style={labelStyle} ><strong>ClassName</strong></label>
                                <div className="controls form-group">
                                    <div className="btn-group bootstrap-select col-md-12">
                                    	<button className="btn dropdown-toggle clearfix btn-primary btn-sm btn-block" 
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
                            </div>
                            <div className="col-xs-4" >
                                <label className="control-label centered" style={labelStyle} ><strong>Direction</strong></label>
                                <div className="controls form-group">
                                    <div className="btn-group bootstrap-select col-md-12">
                                        <button className="btn dropdown-toggle clearfix btn-primary btn-sm btn-block" 
                                            data-toggle="dropdown" id="simple-big" tabIndex="-1" 
                                            aria-expanded="false">
                                            <span className="filter-option">{currentDir}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                        </button>
                                        <ul className="dropdown-menu" role="menu" >
                                            <li rel="0"><a tabIndex="-1" onClick={scope._setDirFilter} value={null}>All</a></li>
                                            {dirs}
                                        </ul>
                                    </div>               
                                </div>
                            </div>
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