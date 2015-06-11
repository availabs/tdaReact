
'use strict';

var React = require('react'),
    
    // -- components 
    DataTable = require('../../components/utils/DataTable.react');
    
    // -- stores
   

    // -- Misc


var AgencyList = React.createClass({

    
    render: function() {
        var scope = this;
        console.log('agencyList render',this.props.agencies)
        var agencies = Object.keys(this.props.agencies).map(function(key){
            if(Array.isArray(scope.props.agencies[key].users)){
                scope.props.agencies[key].users = scope.props.agencies[key].users.map(function(user){
                    return user.username;
                }).join(', ');
            }
            return scope.props.agencies[key]; 
        }),
        columns = [
            {key:'name',name:'Name'},
            {key:'users',name:'Users'},
            {type:'link' ,target:"agencySettings",params:{agencyId:'id'},key:'settingsLink' ,name:'Settings',content:<i className='fa fa-wrench'/>},
            {type:'link' ,target:"datasourceSingle",params:{agencyId:'id'},key:'managementLink' ,name:'Data Management',content:<i className='fa fa-database'/>}     
        ];

        return (
            <div className="content container">
                <h2 className="page-title" style={{color:'#000'}}>Agency <small>Data Management</small></h2>
                <div className="row">
                    <div className="col-lg-9">
                        <section className="widget whitesmoke">
                            
                            <div className="body">
                                <DataTable columns={columns} data={agencies} />
                            </div>
                        </section>                        
                    </div>
                    <div className="col-lg-3">
                       
                    </div>
                </div>
            </div>
        );
    },


});

module.exports = AgencyList;