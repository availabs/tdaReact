/**
 * LandingController
 *
 * @description :: Server-side logic for managing landings
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
	index:function(req,res){
		res.view({devEnv : (process.env.NODE_ENV === 'development')})
	},
	
	flux:function(req,res){
		res.view({devEnv : (process.env.NODE_ENV === 'development')})
	}
	
};

