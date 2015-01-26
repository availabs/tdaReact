var crossfilter = require('crossfilter');




function reduceAddAvg() {
  return function(p,v) {
    ++p.count
    p.sum += +v['f0_'];
    p.avg = p.sum/p.count;

    ++p.monthCount[+v['month']]
    p.monthSum[+v['month']-1] +=  +v['f0_'];
    p.monthAvg[+v['month']-1] = p.monthSum[+v['month']]/p.monthCount[+v['month']];
    
    return p;
  };
}

function reduceRemoveAvg() {
  return function(p,v) {
    --p.count
    p.sum -= +v['f0_'];
    p.avg = p.sum/p.count;

    --p.monthCount[+v['month']]
    p.monthSum[+v['month']-1] -=  +v['f0_'];
    p.monthAvg[+v['month']-1] = p.monthSum[+v['month']]/p.monthCount[+v['month']];

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

		//console.log('classFilter Init',dataset,currentDataSet);
			
		if(dataset !== currentDataSet){

			currentDataSet = dataset;
			var fullData = data.rows.map(function(row,index){
				var outrow = {}
				
				data.schema.fields.forEach(function(field,i){
					outrow[field.name] = row.f[i].v;
				});
				outrow['single_day'] = outrow.station_id +'-'+ outrow.year+'-'+outrow.month+'-'+outrow.day
				return outrow;
			});

			classData = crossfilter(fullData);
			all = classData.groupAll(),
			

			dimensions['ADT'] = classData.dimension(function(d){ return d.single_day });

			dimensions['stationId'] = classData.dimension(function(d){ return d.station_id });

			dimensions['year'] = classData.dimension(function(d){ return d.year });
			groups['year'] = dimensions['year'].group().reduceCount();


			//dimensions['year'] = classData.dimension(function(d){ return d.year });


			groups['ADT'] = dimensions['ADT']
				.group( function (d,i){ return d.substr(0,6) })
				.reduce(reduceAddAvg('f0_'), reduceRemoveAvg('f0_'), reduceInitAvg);

			initialized = true;

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

