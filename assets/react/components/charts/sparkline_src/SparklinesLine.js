var React = require('react'),
    d3 = require('d3');

import DataProcessor from './DataProcessor';

export default class SparklinesLine extends React.Component {

    constructor(props) {
        super(props);
        
    }

    componentDidMount(){
        
    }


    render() {
       
        const { data,limit, width, height, margin, color, style,max, min} = this.props;

        //console.log('whm',width, height, margin)
        const newData = data.map((d) => (d > 0 ? d : null))
        const points = DataProcessor.dataToPoints(newData, limit, width, height, margin, max, min);


        const line = d3.svg.line()
            .defined(function(d) { 
                return d.y != null && +d.y > 0; })
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; });

        const area = d3.svg.area()
            .defined(line.defined())
            .x(line.x())
            .y1(line.y())
            .y0(height);

    

        //console.log('line points',newData,points);

        const lineStyle = {
            stroke: color || style.stroke || 'slategray',
            strokeWidth: style.strokeWidth || '1',
            strokeLinejoin: style.strokeLinejoin || 'round',
            strokeLinecap: style.strokeLinecap || 'round',
            fill: 'none'
        };
        const fillStyle = {
            stroke: style.stroke || 'none',
            strokeWidth: '0',
            fillOpacity: style.fillOpacity || '.1',
            fill: color || style.fill || 'slategray'
        };
        // 
        return (
            <g>
                <path d={line(points)} style={lineStyle} />
                <path d={area(points)} style={fillStyle} />
            </g>
        )
    }
}
SparklinesLine.defaultProps = {
    style: {},
    width: 120,
    height: 30,
    margin: 2
}