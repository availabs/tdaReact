// --stores
var StationStore = require('../../stores/StationStore'),

// -- utils
 	crossfilter = require('crossfilter');

function reduceAddAvg() {
  return function(p,v) {
  	if(v['numDays'] && v['numDays'] > 0 && +v['class'] >=1 && +v['class'] <= 13 && +v['month'] >=1 && +v['month'] <= 12){
	  	++p.count
	    p.sum += Math.round(+v['f0_']/v['numDays']);
	    p.avg = p.sum/(p.count/13); //13 is the number of classes

	   
	    ++p.monthCount[+v['month']-1][+v['class']-1]
	    p.monthSum[+v['month']-1][+v['class']-1] +=  Math.round(+v['f0_']/v['numDays']);
	    p.monthAvg[+v['month']-1][+v['class']-1] =  Math.round(p.monthSum[+v['month']-1][+v['class']-1]/(p.monthCount[+v['month']-1][+v['class']-1])) || 0;

	    
	    ++p.classCount[+v['class']-1]
	    p.classSum[+v['class']-1] +=  Math.round(+v['f0_']/v['numDays']) || 0;
	    p.classAvg[+v['class']-1] = Math.round(p.classSum[+v['class']-1]/(p.classCount[+v['class']-1])) || 0;
		
	}
	return p;
  };
}

function reduceRemoveAvg() {
  return function(p,v) {
  	if(v['numDays'] && v['numDays'] > 0 && +v['class'] >=1 && +v['class'] <= 13 && +v['month'] >=1 && +v['month'] <= 12){
	
	    --p.count
	    p.sum -= Math.round(+v['f0_']/v['numDays']);
	    p.avg = p.sum/(p.count/13);//13 is the number of classes
	    
	    --p.monthCount[+v['month']-1][+v['class']-1]
	    p.monthSum[+v['month']-1][+v['class']-1] -=  Math.round(+v['f0_']/v['numDays']);
	    p.monthAvg[+v['month']-1][+v['class']-1] = Math.round(p.monthSum[+v['month']-1][+v['class']-1]/(p.monthCount[+v['month']-1][+v['class']-1])) || 0;

        --p.classCount[+v['class']-1]
	    p.classSum[+v['class']-1] -= Math.round(v['f0_']/v['numDays']) || 0;
	    p.classAvg[+v['class']-1] = Math.round(p.classSum[+v['class']-1]/(p.classCount[+v['class']-1])) || 0;

	}
    return p;
  };
}

function reduceInitAvg() {
  return {
  			count:0, sum:0, avg:0,
  			classSum: [0,0,0,0,0,0,0,0,0,0,0,0,0],
  			classCount: [0,0,0,0,0,0,0,0,0,0,0,0,0],
  			classAvg:  [0,0,0,0,0,0,0,0,0,0,0,0,0],

  			monthSum: [0,0,0,0,0,0,0,0,0,0,0,0].map(function(d){ return [0,0,0,0,0,0,0,0,0,0,0,0,0] }),
  			monthCount: [0,0,0,0,0,0,0,0,0,0,0,0].map(function(d){ return [0,0,0,0,0,0,0,0,0,0,0,0,0] }),
  			monthAvg:  [0,0,0,0,0,0,0,0,0,0,0,0].map(function(d){ return [0,0,0,0,0,0,0,0,0,0,0,0,0] })
  		};
}

function orderValue(p) {
  return p.avg;
}


var classData 	=   {},
	all 		= 	{},
	dimensions 	= 	{},
	groups 		=	{},
	initialized = 	false,
	currentDataSet = 'no stupid dataset';


module.exports  = {
	

	init:function(data,dataset){

			
		if(dataset !== currentDataSet){
			//console.log('class By Month Init',dataset,currentDataSet,data.length);
			var stationData = {};
			StationStore.getStateStations(dataset).forEach(function(d){
				stationData[d.properties.station_id] = d.properties;
			});
			//console.log('before data',data.length,data);
			data.forEach(function(d){
				d.station_id = d.station_id.trim();
				if(d.station_id.length < 6){

					switch(d.station_id.length){
						case 5:
							d.station_id = '0'+d.station_id;
						break;
						case 4:
							d.station_id = '00'+d.station_id;
						break;
						case 3:
							d.station_id = '000'+d.station_id;
						break;
						case 2:
							d.station_id = '0000'+d.station_id;
						break;
					}
					//console.log('reset 2',d.station_id)

				}
			});

			var total_data = data.map(function(d){
				
				//console.log('a',d.station_id)
				d.single_day =  d.station_id +'-'+ d.year+'-'+d.month;
				if(stationData[d.station_id]){
					d.func_class_code = stationData[d.station_id].func_class_code || 0;
					d.posted_sign_route_num = parseInt(stationData[d.station_id].posted_sign_route_num) || 0;
				}

				var normalForm = [];
				for(var i = 1; i <= 13; i++){
					var row = {}
					Object.keys(d).forEach(function(key){
						if(key[0] !== 'f'){
							row[key] = d[key];
						}
					})
					row['class'] = i;
					row['f0_'] = +d['f'+i+'_'];
					normalForm.push(row);
				}
				return normalForm;
			});
			var total_data = [].concat.apply([],total_data);
			// console.log('after data',
			// 	total_data.length,
			// 	total_data);
			

			//console.time('CBM crossFIlterData')
			currentDataSet = dataset;

			
			classData = crossfilter(total_data);
			all = classData.groupAll(),
			

			dimensions['ADT'] = classData.dimension(function(d){ return d.single_day});

			dimensions['stationId'] = classData.dimension(function(d){ 
				return d.station_id 
			});

			groups['stationId'] = dimensions['stationId'].group().reduceCount();

			
			dimensions['year'] = classData.dimension(function(d){ return +d.year });
			groups['year'] = dimensions['year'].group().reduceCount();

			dimensions['month'] = classData.dimension(function(d){ return +d.month });
			groups['month'] = dimensions['month'].group().reduceCount();

			dimensions['class'] = classData.dimension(function(d){ return +d.class });
			groups['class'] = dimensions['class'].group().reduceCount();

			dimensions['dir'] = classData.dimension(function(d){ return +d.dir });
			groups['dir'] = dimensions['dir'].group().reduceCount();


			groups['ADT'] = dimensions['ADT']
				.group( function (d,i){ return d.substr(0,6) })
				.reduce(reduceAddAvg('f0_'), reduceRemoveAvg('f0_'), reduceInitAvg);

			

			initialized = true;
			//console.timeEnd('CBM crossFIlterData')
		}

	},
	getDimension:function(dim){
		return dimensions[dim];
	},
	getDimensions:function(){
		//console.log('classByMonthFilter / getDimensions',Object.keys(dimensions))
		return dimensions;
	},
	getGroup:function(group){
		return groups[group];
	},
	getGroups:function(){
		return groups;
	},
	getCrossFilter:function(){
		return classData;
	},
	filter: function(dim,val){

		dimensions[dim].filter(function(d){
		  return val.indexOf(d) > -1;
		});
		
	},
	initialized : function(){
		return initialized;
	}
}
