var d3 = require('d3'),
    topojson = require('topojson'),
    L = require('../../utils/dependencies/leaflet.min');


module.exports=(function() {
  var root;
  root = this;
  root.currentBounds = [];
  
  L.GeoJSON.d3 = L.GeoJSON.extend({

    initialize: function(geojson, options) {
      this.geojson = geojson;
      options = options || {};
      options.layerId = options.layerId || ("leaflet-d3-layer-" + (Math.floor(Math.random() * 101)));
      options.onEachFeature = function(geojson, layer) {};
      L.setOptions(this, options);
      return this._layers = {};
    },

    externalUpdate:function(data){
      this.geojson = data;
      this.updateData();
      //this._map.fire('viewreset');
    },

    updateData: function() {
      var bounds, feature, g, join, path, paths, project, reset, styler, svg,map,layer_options,type,radius;
      map = this._map
      g = this._g;

      svg = this._svg;
      layer_options = this.options
      
      if(typeof layer_options.type == 'undefined'){
        type = 'path';
      }else{
        type = layer_options.type;
      }
      if(type == 'point'){
        radius = 2;
        if(typeof layer_options.radius != 'undefined'){
          radius = layer_options.radius;
        }
      }

      if (this.geojson.type == "Topology") {
        for(key in this.geojson.objects){
          this.geojson = topojson.feature(this.geojson, this.geojson.objects[key]);
        } 
      }
      
      if(type == 'point'){
        
        paths = g.selectAll("circle");
         
      }else{
        
        paths = g.selectAll("path");
      
      }
      
     
      join = paths.data(this.geojson.features)
      
      if(type == 'point'){
        
         feature = join.enter().append("circle");
         
      }else{
        
        feature = join.enter().append("path");
      
      }
     
      //-----------------------------------------
      // general function passer
      //-----------------------------------------

      if(typeof layer_options.attr != 'undefined'){
        Object.keys(layer_options.attr).forEach(function(key){
          
          feature.attr(key,layer_options.attr[key]);
        
        });

      }


      if(typeof layer_options.on != 'undefined'){
        Object.keys(layer_options.on).forEach(function(key){
          
          feature.on(key,layer_options.on[key]);
        
        });

      }

      //********Simplified Classer*************
     

      if(typeof layer_options.classer != 'undefined'){
        feature.attr('class',d.properties[layer_options.classer])
      }

      if(typeof layer_options.classed != 'undefined'){
        feature.attr('class',layer_options.classed);
      }

      
      join.exit().remove();

    

      project = function(d3pnt) {
        var geoPnt, pixelPnt;
        geoPnt = new L.LatLng(d3pnt[1], d3pnt[0]);
        pixelPnt = map.latLngToLayerPoint(geoPnt);
        return [pixelPnt.x, pixelPnt.y];
      };

      maxBounds = function(bounds){
        output = bounds[0];
        if(bounds.length > 1){
          for(i = 1;i< bounds.length;i++){
            output[0][0] = (bounds[i][0][0] < output[0][0]) ? bounds[i][0][0] : output[0][0];
            output[0][1] = (bounds[i][0][1] < output[0][1]) ? bounds[i][0][1] : output[0][1];
            output[1][0] = (bounds[i][1][0] > output[1][0]) ? bounds[i][1][0] : output[1][0];
            output[1][1] = (bounds[i][1][1] > output[1][1]) ? bounds[i][1][1] : output[1][1];
          }
        }
        //Make the bounds slightly bigger 
        //to account for stroke widths
        output[0][0]-=1;output[0][1]-=1;
        output[1][0]+=1;output[1][1]+=1;
        return output
      };
      path = d3.geo.path().projection(project);
      root.currentBounds.push(d3.geo.bounds(this.geojson));//[[-125,20],[-60,50]]);////
      bounds = maxBounds(root.currentBounds);
      
      reset = function() {
        var bottomLeft, bufferPixels, topRight;
        bufferPixels = 0;
        bounds = [[-125,20],[-60,50]]
        bottomLeft = project(bounds[0]);
        topRight = project(bounds[1]);
        
        svg.attr("width", topRight[0] - bottomLeft[0] + (2 * bufferPixels));
        svg.attr("height", bottomLeft[1] - topRight[1] + (2 * bufferPixels));
        svg.style("margin-left", "" + (bottomLeft[0] - bufferPixels) + "px");
        svg.style("margin-top", "" + (topRight[1] - bufferPixels) + "px");
        g.attr("transform", "translate(" + (-bottomLeft[0] + bufferPixels) + "," + (-topRight[1] + bufferPixels) + ")");
        if(type == 'point'){
          return  feature.attr({
              cx: function(d,i) { return project(d.geometry.coordinates)[0]; },
              cy: function(d,i) { return project(d.geometry.coordinates)[1]; }
          });
        }else{
          return feature.attr("d", path);
        }
      };
      
      this._map.on("viewreset", reset);
      reset();
      return this.resetFunction = reset;
    },
    onAdd: function(map) {
      var d3Selector, g, overlayPane, svg,first;
      this._map = map;
      overlayPane = map.getPanes().overlayPane;
      d3Selector = d3.select(overlayPane);
      if($('.leaflet-d3-layer').length == 0){
        this._svg = svg = d3Selector.append("svg");
        svg.attr("class", "leaflet-d3-layer");
      } 
      else{
        this._svg = svg = d3.select(".leaflet-d3-layer");
      }
      this._g = g = svg.append("g");
      g.attr("id", this.options.layerId);
      g.attr("class", "leaflet-zoom-hide leaflet-d3-group");
      return this.updateData();
    },
    onRemove: function(map) {
      this._svg.remove();
      return this._map.off("viewreset", this.resetFunction);
    }
  });



}).call(this);