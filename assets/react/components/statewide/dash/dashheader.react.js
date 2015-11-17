var React = require('react'),
    ReactSelect = require('react-select'),
    months = "January February March April May June July August September October November December".split(' ');
       

var WidgetHeader = React.createClass({

    getDefaultProps:function(){
        return {
            months:[]
        }
    },

    getMonth:function(){
        if(!this.props.months[this.props.currentMonth]){
            return;
        }
        var selectMonths = this.props.months.map(function(m,i){
            var cm= months[ parseInt(+m.split('_')[1]) -1  ],
            cy = '20'+m.split('_')[0]
            return { value:i, label: cm+' '+cy, }
        })
        var month = months[ parseInt(+this.props.months[this.props.currentMonth].split('_')[1]) -1  ],
            year = '20'+this.props.months[this.props.currentMonth].split('_')[0]
        return month+' '+year;
    },

    prevMonth:function(){
        console.log('clicked prev');
        if(this.props.setMonth && this.props.currentMonth > 0 ){
            //console.log(this.props.setMonth)
            this.props.setMonth(this.props.currentMonth - 1)
        }
    },

    nextMonth:function(){
        if(this.props.setMonth && this.props.currentMonth < this.props.months.length -1){
            this.props.setMonth(this.props.currentMonth + 1)
        }
    },

    logChange:function(val) {
         this.props.setMonth(val)
    },

    render: function() {
        var pointerStyle = {width:20,height:20,cursor:'pointer'};
        var selectMonths = this.props.months.map(function(m,i){
            var cm= months[ parseInt(+m.split('_')[1]) -1  ],
            cy = '20'+m.split('_')[0]
            return { value:i, label: cm+' '+cy, }
        }).reverse();
        var select = <span />
        if(selectMonths.length > 0){
            console.log(selectMonths)
            select =  <ReactSelect options={selectMonths} value={this.props.currentMonth} onChange={this.logChange} />
        }

        return (
    	    <div style={{fontSize:24}}> 
               <div className='row'>
                    <div className='col-sm-1'>
                        <span onClick={this.prevMonth} style={pointerStyle}> {' < '} </span>
                    </div>
                    <div className='col-sm-5'>
                        {select}
                    </div>
                    <div className='col-sm-1'>
                        <span  style={pointerStyle}  onClick={this.nextMonth}> {' > '} </span>
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = WidgetHeader;