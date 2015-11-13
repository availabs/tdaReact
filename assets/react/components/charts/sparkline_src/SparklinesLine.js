var React = require('react');
import DataProcessor from './DataProcessor';

export default class SparklinesLine extends React.Component {

    constructor(props) {
        super(props);
        
    }

    render() {
        const { data,limit, width, height, margin, color, style,max, min} = this.props;

        //console.log('whm',width, height, margin)

        const points = DataProcessor.dataToPoints(data, limit, width, height, margin, max, min);

        const linePoints = points
            .map((p) => [p.x, p.y])
            .reduce((a, b) => a.concat(b));
        const closePolyPoints = [
            points[points.length - 1].x, height - margin,
            margin, height - margin,
            margin, points[0].y
        ];
        

        const fillPoints = linePoints.concat(closePolyPoints);

        //console.log('line points',fillPoints,linePoints);

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

        return (
            <g>
                <polyline points={fillPoints.join(' ')} style={fillStyle} />
                <polyline points={linePoints.join(' ')} style={lineStyle} />
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