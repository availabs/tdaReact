var React = require('react');


var FileList = React.createClass({
    
    fileClick: function (e) {
        console.log('click', e.target.getAttribute('data-file'), e.target.checked)
    },

    render: function() {
        var scope = this;
        
        if (!(this.props.data && this.props.type && this.props.data [this.props.type])) return <span />   
        var rows = this.props.data[this.props.type].map(function(d){

            return (
                <tr>
                    <td>{d['source_file']}</td>
                    <td>{d['numStates']}</td>
                    <td>{parseInt(d['numStations']).toLocaleString()}</td>
                    <td>{parseInt(d['numRecords']).toLocaleString()}</td>
                    <td><input type='checkbox' onClick={scope.fileClick} data-file={d['source_file']} /></td>
                </tr>
            )
        })
    

        return (
            <div className="widget whitesmoke">
                <table className='table table-hover'>
                    <thead>
                        <tr>
                            <th>File Name</th>
                            <th style={{textAlign:'center'}}># States</th>
                            <th style={{textAlign:'center'}}># Stations</th>
                            <th style={{textAlign:'center'}}># Records</th>
                            <th style={{textAlign:'center'}}> x </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});

module.exports = FileList;

