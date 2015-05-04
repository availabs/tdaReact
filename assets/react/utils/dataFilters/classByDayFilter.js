var crossfilter = require('crossfilter');

function reduceAddAvg() {
  return function(p,v) {
  	++p.count
    p.sum += +v['f0_'];
    p.avg = p.sum/p.count;

    ++p.monthCount[+v['month']-1]
    p.monthSum[+v['month']-1] +=  +v['f0_'];
    p.monthAvg[+v['month']-1] = Math.round(p.monthSum[+v['month']-1]/p.monthCount[+v['month']-1]);
    
    return p;
  };
}

function reduceRemoveAvg() {
  return function(p,v) {
    --p.count
    p.sum -= +v['f0_'];
    p.avg = p.sum/p.count;

    --p.monthCount[+v['month']-1]
    p.monthSum[+v['month']-1] -=  +v['f0_'];
    p.monthAvg[+v['month']-1] = Math.round(p.monthSum[+v['month']-1]/p.monthCount[+v['month']-1]);

    return p;
  };
}

function reduceInitAvg() {
  return {
  			count:0, sum:0, avg:0,
  			monthSum: [0,0,0,0,0,0,0,0,0,0,0,0],
  			monthCount: [0,0,0,0,0,0,0,0,0,0,0,0],
  			monthAvg:  [0,0,0,0,0,0,0,0,0,0,0,0]
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

			// console.log('classFilter Init',dataset,currentDataSet,data.length);
			// console.time('crossFIlterData')
			currentDataSet = dataset;

			
			classData = crossfilter(data);
			all = classData.groupAll(),
			

			dimensions['ADT'] = classData.dimension(function(d){ return d.single_day });

			dimensions['stationId'] = classData.dimension(function(d){ return d.station_id });

			dimensions['year'] = classData.dimension(function(d){ return +d.year });
			groups['year'] = dimensions['year'].group().reduceCount();

			dimensions['month'] = classData.dimension(function(d){ return +d.month });
			groups['month'] = dimensions['month'].group().reduceCount();


			//dimensions['year'] = classData.dimension(function(d){ return d.year });


			groups['ADT'] = dimensions['ADT']
				.group( function (d,i){ return d.substr(0,6) })
				.reduce(reduceAddAvg('f0_'), reduceRemoveAvg('f0_'), reduceInitAvg);

			initialized = true;
			// console.timeEnd('crossFIlterData')
			// console.log(
			// 	'stations group init',
			// 	dimensions['ADT']
			// 		.group( function (d,i){ return d.substr(0,6) })
			// );
		}
	},
	getDimension:function(dim){
		return dimensions[dim];
	},
	getDimensions:function(){
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

