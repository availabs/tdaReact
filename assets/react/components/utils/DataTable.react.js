'use strict';
var React = require('react');

var DataTable = React.createClass({
 	
 	getInitialState:function(){
 		return {
 			currentPage : 0,
            pageLength : 15,
 		}
 	},

	getDefaultProps:function(){
		return {
			data:[],
			columns:[]
		}
	},

	render: function() {
		//console.log('DATATABLE / Render',this.props.columns)
		var scope = this;
		var cursor = this.state.pageLength*this.state.currentPage;

		var headerRow = scope.props.columns.map(function(col){
			return (
				<th>
					{col.name}
				</th>
			)
		});

		var rows = scope.props.data.map(function(row,index){
			if(index >= cursor && index < (cursor + scope.state.pageLength) ){
				
				var rowValue = row[scope.props.rowValue] || '';
				var dataRow = scope.props.columns.map(function(col){
					if(col.type === 'modalButton'){
						return (
							<td data-key={rowValue}>
								<button data-key={rowValue} className='btn btn-default' data-toggle="modal" data-target={col.target} data-backdrop="false">{col.name}</button>
							</td>
						)
					}
					return (
						<td data-key={rowValue}>
							{row[col.key]}
						</td>
					)
				});
				
				return(
					<tr data-key={rowValue} onClick={scope.props.rowClick}>
						{dataRow}
					</tr>
				)
			}
			return;
		});
		var pagination = scope.renderPagination();
		return (
			<div>
				{ pagination }
				<table className="table table-hover">
					<thead>
						<tr>
							{headerRow}
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	},

	_clickPage : function(e){
        var pageNum = e.target.getAttribute('value');
        if(!isNaN(parseInt(pageNum))){
            this.setState({currentPage:pageNum});
        }

    },

	renderPagination:function(){
        var scope = this;
        var styleItalic = {
            "font-style": "italic",
        }
        
        var pages = scope.props.data.map(function(d,i){
            if(i % scope.state.pageLength === 0 ){
                var pageNum = (i/scope.state.pageLength);
                var activeClass = '';
                //console.log('active page compare',pageNum,+scope.state.currentPage)
                if(+pageNum == +scope.state.currentPage ){
                    activeClass = 'active';
                }
                return (
                    <li className={activeClass} onClick={scope._clickPage} value={pageNum}>
                        <a value={pageNum} title={"Page "+pageNum}>{pageNum+1}</a>
                    </li>
                )
            }
            else return;
        }).filter(function(d){
            return typeof d != 'undefined';
        });
        
        return (
            <div className="table-editable">
	            <div className="backgrid-paginator">
	                <ul>
	                    {pages}
	                </ul>
	            </div>
	        </div>
        )
    }
});

module.exports = DataTable;