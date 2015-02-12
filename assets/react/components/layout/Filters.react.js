'use strict';

var React = require('react'),
    
    //--Actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator'),

    //--Stores 
    StateWideStore = require('../../stores/StatewideStore');


var labelStyle = {
	width:"100%",
	"text-align":"center"
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
            currentYear: null
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
        console.log('on change years',this.state.classByMonth.getGroup('year'))
    },

    _setYearFilter:function(e){
        console.log(e.target.getAttribute('value'))
        this.setState({currenYear:e.target.getAttribute('value')})
        ClientActionsCreator.filterYear(e.target.getAttribute('value'));
    },

    _getYears : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('year')){

            var output = this.state.classByMonth.getGroup('year').top(Infinity).map(function(year){


                return (<li rel="1"><a tabindex="-1" onClick={scope._setYearFilter} value={year.key} className="">20{year.key}</a></li>)
                console.log('test',year)

            })
            return output;
        }
        return;
    },

     _getMonths : function(){
        var scope = this;

        if(this.state.classByMonth.getGroup('month')){

            var output = this.state.classByMonth.getGroup('month').top(Infinity).map(function(month){


                return (<li rel="1"><a tabindex="-1" onClick={scope._setmonthFilter} value={month.key} className="">{month.key}</a></li>)
                //console.log('test',year)

            })
            return output;
        }
        return;
    },

    render: function() {
        var scope = this;
        var currenYear = this.state.currenYear || 'All';
        var years = this._getYears()
        var months = this._getMonths();
        if(currenYear !== 'All'){ currenYear = '20'+currenYear; }

        return (
        	<section className="widget ui-sortable no-padding">
    			<fieldset>
                    <div className="control-group">
                        <label className="control-label centered" style={labelStyle} ><strong>Year</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" 
                                    data-toggle="dropdown" id="simple-big" tabindex="-1" aria-expanded="false">
                                    <span className="filter-option">{currenYear}</span>&nbsp;<i className="fa fa-caret-down"></i>
                                </button>
                            	<ul className="dropdown-menu" role="menu" >
                            		<li rel="0"><a tabindex="-1" onClick={scope._setYearFilter} value={null}>All</a></li>
                                    {years}
                            	</ul>
                            </div>               
                        </div>
                        <label className="control-label centered" style={labelStyle} ><strong>Months</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" data-toggle="dropdown" id="simple-big" tabindex="-1" aria-expanded="false"><span className="filter-option">Combined</span>&nbsp;<i className="fa fa-caret-down"></i></button>
                            	<ul className="dropdown-menu" role="menu" >
                            		<li rel="0"><a tabindex="-1" onClick={scope._setYearFilter} value={null}>All</a></li>
                                    {months}
                            	</ul>
                            </div>               
                        </div>
                        <label className="control-label centered" style={labelStyle} ><strong>ClassName</strong></label>
                        <div className="controls form-group">
                            <div className="btn-group bootstrap-select col-md-12">
                            	<button className="btn dropdown-toggle clearfix btn-primary btn-lg btn-block" data-toggle="dropdown" id="simple-big" tabindex="-1" aria-expanded="false"><span className="filter-option">All</span>&nbsp;<i className="fa fa-caret-down"></i></button>
                            	<ul className="dropdown-menu" role="menu" >
                            		<li rel="0"><a tabindex="-1" href="#" className="">Class 1</a></li>
                            		<li rel="1"><a tabindex="-1" href="#" className="">Class 2</a></li>
                            		<li rel="2"><a tabindex="-1" href="#" className="">Class 3</a></li>
                            	</ul>
                            </div>               
                        </div>
                    </div>
                </fieldset>
    	 	</section>
        );
    }
});

module.exports = Filters;