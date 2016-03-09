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
            <div className='row'>
                <div className="col-xs-2" style={{paddingRight:5, paddingLeft:10}}>
                    { this.props.children }
                </div>
                <div className="col-xs-10 no-padding" >
                        { this.props.label }
                </div>
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
