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
    };
}

var Filters = React.createClass({
//style="overflow-y: auto; min-height: 60px; max-height: 123px;"
    getInitialState: function() {
        return {
            classByMonth : StateWideStore.getClassByMonth(),
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

    _getYears : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('year')){

            var output = this.state.classByMonth.getGroup('year').top(Infinity).map(function(year,i){


                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setYearFilter} value={year.key} className="">20{year.key}</a></li>)
                console.log('test',year)

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


                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setMonthFilter} value={month.key} className="">{month.key}</a></li>)
                //console.log('test',year)

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


                return (<li rel="1" key={i}><a tabIndex="-1" onClick={scope._setClassFilter} value={vclass.key} className="">Class {vclass.key}</a></li>)
                //console.log('test',year)

            })
            return output;
        }
        return;
    },

    render: function() {
        var scope = this;
        var currentYear = this.state.currentYear || 'All';
        var currentMonth = this.state.currentMonth || 'All';
        var currentClass = this.state.currentClass || 'All';
        var years = this._getYears()
        var months = this._getMonths();
        var classes = this._getClasses();


        if(currentYear !== 'All'){ currenYear = '20'+currentYear; }

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
                            		<li rel="0"><a tabIndex="-1" onClick={scope._setYearFilter} value={null}>All</a></li>
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
                </fieldset>
    	 	</section>
        );
    }
});

module.exports = Filters;