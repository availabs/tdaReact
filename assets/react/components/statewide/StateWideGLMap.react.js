'use strict';

var React = require('react'),
    
    
    //--Stores
    StationStore = require('../../stores/StationStore'),
    StateWideStore = require('../../stores/StatewideStore'),

    //--Actions
    ClientActionsCreator = require('../../actions/ClientActionsCreator'),

    //--Utils
    d3 =            require('d3'),
    topojson =      require('topojson'),
    colorbrewer =   require('colorbrewer'),
    mapboxgl =  require('mapbox-gl');
    //hpmsMap =  require('../../utils/dependencies/hpms');
    
var map = null,
    geoData = {'states':null,'congress':null,'counties':null},
    currentLayer = null,
    stationLayer = null,
    colorRange = colorbrewer.RdYlGn[5].reverse(),
    AdtScale = d3.scale.quantile().domain([0,70000]).range([2,4,6,8,10]),
    
    stationRadius = function(d){
        AdtScale.range([3]);
        // if(map.getZoom() > 8){
        //     AdtScale.range([3,4,6,8]);
        // }
        return AdtScale(d.properties.ADT || 0)
    },
    
    stationColor = function(d){

        AdtScale.range(colorRange)
        return AdtScale(d.properties.ADT || 0)
    
    };

var StateIndex = React.createClass({
    
    getInitialState: function() {
        return {
            selectedState:null,
            stations:{
                type:"FeatureCollection",
                features: []
            },
            classByDay : StateWideStore.getClassByDay()
        };
    },
    
    setGeoClass: function(d){
    
        if(d.properties.geoid){
            return 'zone geo-'+d.properties.geoid;
        }else{
            return 'zone geo-'+d.properties.DISTRICT;
        }

    },

    stateClick: function(d){

        var scope = this,
            newState = this.state;

        d3.select('.active_geo').classed('active_geo',false);
        if(d.properties.geoid){
            d3.select('.geo-'+d.properties.geoid).classed('active_geo',true);
        }else{
            d3.select('.geo-'+d.properties.DISTRICT).classed('active_geo',true);
        }
        
        newState.selectedState = d.properties.geoid;
        newState.stations.features = StationStore.getStateStations(d.properties.geoid);

        //stationLayer.externalUpdate(newState.stations);
        this.setState(newState);
        ClientActionsCreator.setSelectedState(newState.selectedState);
        map.fitBounds([d3.geo.bounds(d)[0].reverse(),d3.geo.bounds(d)[1].reverse()]);

    },

    
    componentDidMount: function() {

        StationStore.addChangeListener(this._onChange);
        StateWideStore.addChangeListener(this._newData);
        var scope = this;

        var mapDiv = document.getElementById('map');
        mapDiv.setAttribute("style","height:700px");
        

        // var mapquestOSM = avlmap.RasterLayer({url: "http://api.tiles.mapbox.com/v3/am3081.h0po4e8k/{z}/{x}/{y}.png"});
        // map = avlmap.Map({id: '#map', startLoc: [-95.5, 37], minZoom: 3, maxZoom: 17})
        //         .addLayer(mapquestOSM)
        //         .addControl({type:'info', position: 'bottom-right'})

        mapboxgl.accessToken = 'pk.eyJ1IjoiYW0zMDgxIiwiYSI6IkxzS0FpU0UifQ.rYv6mHCcNd7KKMs7yhY3rw';
        map = new mapboxgl.Map({
          container: 'map', // container id
          style: 'https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v6.json', //stylesheet location
          center: [40, -74.50],//[-95.5, 37], // starting position
          zoom: 9 // starting zoom
        });
        
        d3.json('/geo/states.json',function(data){
            //geoData.states = data;
            

        });
    },
    
    componentWillUnmount: function() {
        StationStore.removeChangeListener(this._onChange);
        StateWideStore.removeChangeListener(this._newData);
    },

    _onChange:function(){
        if(this.state.selectedState){
            var newState = this.state;
            newState.stations.features = StationStore.getStateStations(this.state.selectedState);
        }

    },

    _newData:function(){
        var scope = this;

        this.setState({classByDay:StateWideStore.getClassByDay()})
        if(Object.keys(this.state.classByDay.getDimensions()).length > 0){
            
            var stationData = {};

            var stationADT = scope.state.classByDay.getGroups()
                .ADT.order(function(p){return p.avg})
                .top(Infinity)
            
            stationADT
                .forEach(function (ADT){
                    stationData[ADT.key] = ADT.value.avg;
                })

            AdtScale.domain(stationADT.map(function(ADT){
                return ADT.value.avg;
            }));


            scope.state.stations.features = scope.state.stations.features.filter(function(station){
                return stationData[station.properties.station_id];
            });

            scope.state.stations.features = scope.state.stations.features.map(function(station){
                station.properties.ADT = stationData[station.properties.station_id]
                return station;
            });
            

            stationLayer.externalUpdate(scope.state.stations);

        }
    },

    //----------------------------------------------------------------------------------------------------------------
    // Render Components
    //----------------------------------------------------------------------------------------------------------------
    render: function() {

        return (
            <div id="map"></div>
        );
    }
    
    
    

    

});

module.exports = StateIndex;


