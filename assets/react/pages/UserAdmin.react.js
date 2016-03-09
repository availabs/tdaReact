'use strict';

var React = require('react'),

    UserTable = require('../components/user/UserTable.react'),
    UserForm = require('../components/user/UserForm.react'),

    UserStore = require('../stores/UserStore');

function getState() {
    return {
        user: UserStore.getSessionUser(),
        users: UserStore.getAllUsers(),
        editTarget: UserStore.getEditTarget()
    }
}

module.exports = React.createClass({

    getInitialState: function() {
        return getState();
    },

    componentDidMount: function() {
        UserStore.addChangeListener(this.onChange);        
    },
    componentWillUnmount: function() {
        UserStore.removeChangeListener(this.onChange);
    },

    onChange: function() {
        this.setState(getState());
    },

    render: function() {
        console.log('users', this.state.user.agency[0] ? this.state.user.agency[0].name : '' )
        var users = this.state.users;
        if( this.state.user.agency[0] ){
            users = users.filter((user) => {
                //console.log(user.agency[0] ? user.agency[0].id ?  'na')
                return user.agency[0] && user.agency[0].id === this.state.user.agency[0].id
            })
        }
        return (
             <div className="content container">
                <div className='row'>
                    <div className="col-lg-10">
                        <UserTable users={ users }/>
                    </div>
                    <div className="col-lg-2">
                        <UserForm users={ users } user={ this.state.user }
                            editTarget={ this.state.editTarget } />
                    </div>
                </div>
            </div>
        );
    }
});
