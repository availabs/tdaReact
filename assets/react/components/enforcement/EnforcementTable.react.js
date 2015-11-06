'use strict';
var React = require('react'),
    d3 = require('d3'),
    colorbrewer = require('colorbrewer'),    
    //-- Stores


    //-- Utils
    colorRange = colorbrewer.RdYlBu[5],
    AdtScale = d3.scale.quantile().domain([0,70000]).range(colorRange);


var removeLabels = function(){
    d3.selectAll('#adtchart svg .nv-x .tick text').text('')
}

var GraphContainer = React.createClass({

    
    getDefaultProps:function(){
        return {
            height: 300,
        }
    },

    getInitialState:function(){
        return {
            toggleChart:false,
            currentData:[]
        }
    },

    componentDidMount:function(){
        if(this.props.selectedState){
            this._loadData(this.props.selectedState,this.props.agency);
        }
    },

    componentWillReceiveProps:function(nextProps){
        if(nextProps.selectedState && nextProps.agency){
            this._loadData(nextProps.selectedState,nextProps.agency);
        }
    },

    _loadData:function(fips,agency){
        var scope = this;
        if(fips && agency){
            var url = '/tmgWim/enforcement/'+fips+'?database='+agency;
            d3.json(url)
                .post(JSON.stringify({filters:scope.props.filters}),function(err,data){
                //console.log('adtGraph data',data)
                if(data.loading){
                        console.log('reloading')
                        setTimeout(function(){ scope._loadData(fips) }, 2000);
                        
                }else{
                    AdtScale.domain(data.map(function(ADT){
                        return ADT.value;
                    }));

                    var output = data.map(function(d){
                        d.color = AdtScale(d.value)
                        return d
                    }).sort(function(a,b){
                        return b.value - a.value
                    })

                    scope.setState({currentData:output});
                }
            })
        }

    },
   
    

    render: function() {
        var scope = this;
       
        
        //console.log('adtGraph',this._processData())

        return (
            
            <section className="widget large" style={{ background:'none'}}>
                {JSON.stringify(this.state.currentData)}
            </section>
            
        );
    }
});

module.exports = GraphContainer;