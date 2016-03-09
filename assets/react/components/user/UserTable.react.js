'use strict';

var React = require('react'),

    UserActions = require('../../actions/UserActions');

var UserRow = React.createClass({

    handleDeleteClick: function() {
        var modal = $("#deleteModal");
        modal.find('.modal-body h4')
            .text("Are you sure you want to delete "+this.props.user.userName+"?");
        modal.data(this.props.user)
            .modal();
    },

    handleEditClick: function() {
        UserActions.setEditTarget(this.props.user);
    },

    render: function() {
        return (
            <tr onClick={ this.handleClick } className={ this.props.classString } >
                <td>{ this.props.user.name }</td>
                <td>{ this.props.user.username }</td>
                <td>{ this.props.user.email }</td>
                <td>{ this.props.user.agency[0] ? this.props.user.agency[0].name : '' }</td>
                <td>{ this.props.user.admin.toString() }</td>
                <td>
                    <button onClick={ this.handleEditClick } data-user={ this.props.user } className="btn btn-xs btn-primary">
                        Update
                    </button>
                </td>
                <td>
                    <button onClick={ this.handleDeleteClick } data-user={ this.props.user } className="btn btn-xs btn-danger">
                        Delete
                    </button>
                </td>
            </tr>
        )
    }
})

module.exports = React.createClass({

    componentDidMount:function(){
        UserActions.getAllUsers()
    },

    deleteUser : function(d) {
        console.log("deleting id:", $("#deleteModal").data().id);
        UserActions.deleteUser($("#deleteModal").data());
    },

    render: function() {
        var rows = this.props.users.map(function(user) {
            return (
                <UserRow key={ user.id } user={ user } />
            )
        }, this);

        return (
            <div className="panel panel-default">
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Login Name</th>
                            <th>Email</th>
                            <th>Group</th>
                            <th>Administrator</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        { rows }
                    </tbody>

                    <div id="deleteModal" className="modal fade" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true">×</button>
                                    <h4 className="modal-title" id="myModalLabel2">Delete User</h4>
                                </div>

                                <div className="modal-body">
                                    <h4>Are you sure you want to delete?</h4>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
                                    <button type="button" className="btn btn-danger" onClick={ this.deleteUser } data-dismiss="modal">Delete</button>
                                </div>

                            </div>
                        </div>
                    </div>

                </table>
            </div>
        )
    }
});
