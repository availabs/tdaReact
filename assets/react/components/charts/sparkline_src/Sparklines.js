var React = require('react');
import SparklinesLine from './SparklinesLine';
// import SparklinesBars from './SparklinesBars';
// import SparklinesSpots from './SparklinesSpots';
// import SparklinesReferenceLine from './SparklinesReferenceLine';
// import SparklinesNormalBand from './SparklinesNormalBand';
import DataProcessor from './DataProcessor';

class Sparklines extends React.Component {

  
    constructor (props) {
        super(props);
    }

   

    render() {
        //console.log(this.props)
        const {  style } = this.props;

        const width  = 120, height = 30, margin = 2

        
        
        return (
            <svg width={width} height={height} style={style}>
                {
                    React.Children.map(this.props.children, function(child) {
                        return React.cloneElement(child, {  width, height, margin });
                    })
                }
            </svg>
        );
    }
}


export { Sparklines, SparklinesLine, DataProcessor }
