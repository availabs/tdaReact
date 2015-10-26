'use strict'

var React = require("react");

exports.InputGroup = React.createClass({
    render: function() {
        var width = { width: "100% "};
        return (
            <div className="input-group" style={ width }>
                { this.props.icon ?
                    <span className="input-group-addon">
                        <i className={ this.props.icon }/>
                    </span>
                : null }
                { this.props.children }
            </div>
        )
    }
})

exports.CheckboxGroup = React.createClass({
    render: function() {
        return (
            <div>
                { this.props.children }
            </div>
        )
    }
})
exports.InlineCheckbox = React.createClass({
    render: function() {
        return (
            <div className="checkbox">
                <label>
                    { this.props.children }
                    { this.props.label }
                </label>
            </div>
        )
    }
})

exports.FormGroup = React.createClass({
    render: function() {
        var label = this.props.label ? <label>{ this.props.label }</label> : null;
        return (
            <div className="form-group">
                { label }
                { this.props.children }
            </div>
        )
    }
})
