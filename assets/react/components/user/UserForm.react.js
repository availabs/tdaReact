'use strict';

var React = require('react'),
    assign = require("object-assign"),
    AgencyStore = require("../../stores/AgencyStore"),
    UserActions = require("../../actions/UserActions"),
    FormComponents = require("./FormComponents.react"),
    FormGroup = FormComponents.FormGroup,
    InputGroup = FormComponents.InputGroup,
    InlineCheckbox =  FormComponents.InlineCheckbox,
    CheckboxGroup = FormComponents.CheckboxGroup;

var PanelBody = React.createClass({

    getInitialState: function() {
        return {
            name: null,
            username: null,
            email: null,
            group: null,
            password: null,
            confirmation: null,
            admin: false
        }
    },

    componentWillReceiveProps: function(newProps) {
        if (newProps.mode == "update" && newProps.editTarget) {
            this.setState({
                name: newProps.editTarget.name,
                username: newProps.editTarget.username,
                email: newProps.editTarget.email,
                group: newProps.editTarget.group,
                admin: newProps.editTarget.admin,
            })
        }
        else if (newProps.mode == "create") {
            this.setState(this.getInitialState());
        }
    },

    handleSubmit: function(e) {
        e.preventDefault();

        if ($("#group").val() == "default") {
            alert("You must select a user group!");
            $("#group").focus();
            return;
        }

        if (this.props.mode == 'create') {
            var user = {
                name: this.state.name,
                username: this.state.username,
                email: this.state.email,
                group: this.state.group || $("#group").val(),
                admin: this.state.admin,
                password: this.state.password,
                confirmation: this.state.confirmation
            }
            UserActions.createUser(user);
        }
        else if (this.props.mode == 'update') {
            var data = {
                name: this.state.name,
                username: this.state.username,
                email: this.state.email,
                group: this.state.group || $("#group").val(),
                admin: this.state.admin,
            }
            if (this.state.password) {
                data.password = this.state.password;
            }
            if (this.state.confirmation) {
                data.confirmation = this.state.confirmation;
            }
            var user = assign({}, this.props.editTarget, data);
            UserActions.update('user',user);
        }
    },
    handleChange: function(e) {
        var state = this.state;

        switch (e.target.name) {
            case "name":
                state.name = e.target.value;
                break;
            case "username":
                state.username = e.target.value;
                break;
            case "email":
                state.email = e.target.value;
                break;
            case "group":
                state.group = e.target.value;
                break;
            case "password":
                state.password = e.target.value;
                break;
            case "confirmation":
                state.confirmation = e.target.value;
                break;
            case "admin":
                state.admin = e.target.checked;
                break;
        }

        this.setState(state);
    },

    inputGroup: function(e) {
        var state = this.state;
        state.group = $(e.target).text();
        this.setState(state);
    },

    render: function() {
        var name = this.state.name,
            username = this.state.username,
            email = this.state.email,
            group = this.state.group,
            admin = this.state.mode == "create" ? null : this.state.admin,
            password = this.state.password,
            confirmation = this.state.confirmation,
            submitText = this.props.mode === "create" ? "Create User" : "Update User",
            userGroups = Object.keys(AgencyStore.getAll()).map(function(d) { return { value: AgencyStore.getAll()[d].name, display: AgencyStore.getAll()[d].name }; });

        userGroups.unshift({ value: "default", display: "user group" });

        var groups = userGroups.map(function(d, i) {
            var hidden = { display: "none" };
            return <option key={i} value={ d.value } style={ !i ? hidden : null }>{ d.display }</option>;
        }, this);

        var groupDisabled = null;
        if (this.props.user && this.props.user.agency && this.props.user.agency[0]) {
            groupDisabled = "disabled";
            group = this.props.user.agency[0].name;
        }

        return (
            <form onSubmit={ this.handleSubmit }>
                <div className="panel-body">

                    <FormGroup>
                        <InputGroup icon="fa fa-user">
                            <input className="form-control" type="text" name='name'
                                placeholder={ "user name" } value={ name }
                                onChange={ this.handleChange } required="required"
                                id="name"/>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup>
                        <InputGroup icon="fa fa-sign-in">
                            <input className="form-control" type="text" name='username'
                                placeholder={ "sign in name" } value={ username }
                                onChange={ this.handleChange } required="required"
                                id="username"/>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup>
                        <InputGroup icon="fa fa-envelope">
                            <input className="form-control" type="email" name="email"
                                placeholder={ "email" } value={ email }
                                onChange={ this.handleChange } required="required"
                                id="email"/>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup>
                        <InputGroup icon="fa fa-users">
                            <select className="form-control" name="group"
                                placeholder={ "user group" } value={ group }
                                onChange={ this.handleChange } required="required"
                                id="group" list="groupList" disabled={ groupDisabled }>
                                { groups }
                            </select>
                        </InputGroup>
                    </FormGroup>

                    <FormGroup>
                        <InlineCheckbox label="Administrator Privileges">
                            <input type="checkbox" name="admin" onChange={ this.handleChange }
                                id="admin" checked={ admin }/>
                        </InlineCheckbox>
                    </FormGroup>


                    <FormGroup>
                        <InputGroup icon="fa fa-lock">
                            <input className="form-control" type="password" name="password"
                                placeholder={ "password" } onChange={ this.handleChange } id="password"
                                value={ password }
                                required={ this.props.mode == "create" ? "required" : null }/>
                        </InputGroup>
                    </FormGroup>


                    <FormGroup>
                        <InputGroup icon="fa fa-check">
                            <input className="form-control" type="password" name="confirmation"
                                placeholder={ "confirm password" } onChange={ this.handleChange }
                                value={ confirmation }
                                required={ this.props.mode == "create" ? "required" : null }/>
                        </InputGroup>
                    </FormGroup>
                </div>

                <div className="panel-footer">
                    <input type='submit' className="btn btn-primary btn-block" value={ submitText }/>
                </div>

            </form>
        )
    }
})

var PanelHeading = React.createClass({

    createMode: function() {
        this.props.clickHandler("create");
    },
    editMode: function() {
        this.props.clickHandler("update");
    },

    render: function() {
        var createButtonClass = this.props.mode === "create" ? "btn btn-success" : "btn btn-info";

        if (this.props.mode === "update" && this.props.editTarget) {
            var editButtonClass = "btn btn-success";
        }
        else if (this.props.mode === "create" && this.props.editTarget) {
            var editButtonClass = "btn btn-info";
        }
        else {
            var editButtonClass = "btn";
        }
        var disabled = this.props.editTarget ? "" : "disabled";

        return (
            <div className="panel-heading">
                <div className="btn-group">
                    <button className={ createButtonClass } onClick={ this.createMode }>Create</button>
                    <button className={ editButtonClass } disabled={ disabled } onClick={ this.editMode }>Update</button>
                </div>
            </div>
        )
    }
})

module.exports = React.createClass({

    getInitialState: function() {
        return { mode: "create" };
    },

    componentWillReceiveProps: function(newProps) {
        if (newProps.editTarget && this.state.mode == "create") {
            this.setState({ mode: "update" })
        }
    },

    handleClick: function(mode) {
        if (mode != this.state.mode) {
            this.setState({ mode: mode });
        }
    },

    render: function() {
        var target = this.state.mode === "update" ? this.props.editTarget : null;

        return (
            <div className="panel panel-default">

                <PanelHeading mode={ this.state.mode } editTarget={ this.props.editTarget }
                    clickHandler={ this.handleClick }/>

                <PanelBody mode={ this.state.mode } editTarget={ target }
                    users={ this.props.users } user={ this.props.user }/>

            </div>
        )
    }
})
