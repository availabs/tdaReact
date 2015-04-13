// --stores
var StationStore = require('../../stores/StationStore')

// -- utils
 	crossfilter = require('crossfilter');

var classData 	=   {},
	all 		= 	{},
	dimensions 	= 	{},
	groups 		=	{},
	initialized = 	false,
	currentDataSet = 'no stupid dataset';

function reduceAddAvg(attr) {
  return function(p,v) {
    ++p.count
    p.sum += v[attr];
    p.avg = p.sum/p.count;
    return p;
  };
}
function reduceRemoveAvg(attr) {
  return function(p,v) {
    --p.count
    p.sum -= v[attr];
    p.avg = p.sum/p.count;
    return p;
  };
}
function reduceInitAvg() {
  return {count:0, sum:0, avg:0};
}



module.exports  = {
	

	init:function(data,dataset){

			
		if(dataset !== currentDataSet){
			//console.log('class By Month Init',dataset,currentDataSet,data.length);
			var stationData = {};
			StationStore.getStateStations(dataset).forEach(function(d){
				stationData[d.properties.station_id] = d.properties;
			});
			//console.log('before data',data.length,data);
			var total_data = data.map(function(d){
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
					if(i < 5){
						row['classGroup'] = '1 - Personal Vehicle';
					}else if(i < 10){
						row['classGroup'] = '2 - Single Unit Truck'
					}else{
						row['classGroup'] = '3 - Tractor Trailer'
					}

					row['f0_'] = +d['f'+i+'_'];
					normalForm.push(row);
				}
				return normalForm;
			});
			var total_data = [].concat.apply([],total_data);
			///console.log('after data',total_data.length,total_data);
			
			//console.time('CBM crossFIlterData')
			currentDataSet = dataset;

			
			classData = crossfilter(total_data);
			all = classData.groupAll(),
			

			//dimensions['ADT'] = classData.dimension(function(d){ return d.single_day});
			dimensions['single_day'] = classData.dimension(function(d){
				return d.year+'_'+d.month+'_'+d.day;
			})
			groups['average_daily_traffic'] = dimensions['single_day'].group().reduceSum(function(d){
				return d['f0_'];
			});
				//.reduce(reduceAddAvg('f0_'), reduceRemoveAvg('f0_'), reduceInitAvg);

			dimensions['stationId'] = classData.dimension(function(d){ return d.station_id });
			groups['stationId'] = dimensions['stationId'].group().reduceCount();

			
			dimensions['year'] = classData.dimension(function(d){ return +d.year });
			groups['yearSum'] = dimensions['year'].group().reduceSum(function(d){
				return d['f0_'];
			});

			dimensions['month'] = classData.dimension(function(d){ return +d.month });
			groups['month'] = dimensions['month'].group().reduceCount();

			//groupps['singleMonth'] = classData.dimension()
			groups['monthSum'] = dimensions['month'].group().reduceSum(function(d){
				return d['f0_'];
			});

			dimensions['day'] = classData.dimension(function(d){ return +d.day });
			groups['day'] = dimensions['day'].group().reduceCount();

			groups['daySum'] = dimensions['day'].group().reduceSum(function(d){
				return d['f0_'];
			});

			dimensions['hour'] = classData.dimension(function(d){ return +d.hour });
			groups['average_hourly_traffic'] = dimensions['hour'].group()
				.reduce(reduceAddAvg('f0_'), reduceRemoveAvg('f0_'), reduceInitAvg);


			dimensions['class'] = classData.dimension(function(d){ return +d.class });
			groups['class'] = dimensions['class'].group().reduceCount();
			groups['classSum'] = dimensions['class'].group().reduceSum(function(d){
				return d['f0_'];
			});


			dimensions['classGroup'] = classData.dimension(function(d){ return d.classGroup });
			groups['classGroup'] = dimensions['classGroup'].group().reduceCount();
			groups['classGroupSum'] = dimensions['classGroup'].group().reduceSum(function(d){
				return d['f0_'];
			});

			dimensions['dir'] = classData.dimension(function(d){ return d.dir });
			groups['dir'] = dimensions['dir'].group().reduceCount();
			

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

