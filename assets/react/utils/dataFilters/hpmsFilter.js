var crossfilter = require('crossfilter');



var hpmsData 	=   {},
	all 		= 	{},
	dimensions 	= 	{},
	groups 		=	{},
	initialized = 	false,
	currentDataSet = 'no stupid dataset';


module.exports  = {
	

	init:function(data,dataset){

			
		if(dataset !== currentDataSet){

			// console.log('classFilter Length Init',dataset,currentDataSet,data.length);
			// console.time('crossFIlterHpmsData')
			currentDataSet = dataset;

			
			hpmsData = crossfilter(data);
			all = hpmsData.groupAll(),
					
			dimensions['type'] = hpmsData.dimension(function(d){ return d.f_system_v });
			groups['type_vdt'] = dimensions['type'].group().reduceSum(function(d){
				return +d.vdt
			});

			groups['type_length'] = dimensions['type'].group().reduceSum(function(d){
				return +d.totallength;
			});

			dimensions['route'] = hpmsData.dimension(function(d){ return d.f_system_v+'_'+d.route_numb });
			groups['route_vdt'] = dimensions['route'].group().reduceSum(function(d){
				return +d.vdt
			});

			groups['route_length'] = dimensions['route'].group().reduceSum(function(d){
				return +d.totallength;
			});

			//dimensions['year'] = hpmsData.dimension(function(d){ return d.year });


			initialized = true;
			//console.timeEnd('crossFIlterHpmsData')
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
		return hpmsData;
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