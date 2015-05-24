var React = require('react/addons');
var ReactGoogleMaps = require('react-googlemaps');
var GoogleMapsAPI = window.google.maps;
var Map = ReactGoogleMaps.Map;
var Marker = ReactGoogleMaps.Marker;
var Polyline = ReactGoogleMaps.Polyline;
var LatLng = GoogleMapsAPI.LatLng;
import Constants from '../constants/Main.js'
import PathStore from '../stores/PathStore.js'
import assign from 'react/lib/Object.assign';

var Path = React.createClass({
    getInitialState: function () {
        return assign({}, {
            center: Constants.WarsawPosition,
            zoom: 11
        }, PathStore.getState());
    },
    componentDidMount: function () {
        PathStore.onChange(this._handlePathStoreChange)
    },
    componentWillUnmount: function () {
        PathStore.off(this._handlePathStoreChange)
    },
    render: function () {
        var route = this.state.route.path === undefined ? null :
            (
                <Polyline
                    strokeColor="blue"
                    path={this.state.route.path.points.coordinates.map(this._toPosition)}/>
            );
        var preloader = !this.state.loading ? null : (
            <div className="row Progress">
                <div className="col s12">
                    <div className="progress">
                        <div className="indeterminate"></div>
                    </div>
                </div>
            </div>
        );
        return (
            <div className='Path'>
                {preloader}
                <Map zoom={this.state.zoom}
                     onZoomChange={this._handleZoomChange}
                     center={this.state.center}
                     onCenterChange={this._handleCenterChange}
                     width={window.innerWidth}
                     height={window.innerHeight}>
                    {this.state.route.stations === undefined ?
                        null :
                        this.state.route.stations.map(this._renderMarker)}
                </Map>
            </div>
        );
    },
    _handlePathStoreChange: function () {
        this.setState(PathStore.getState());
    },
    _handleCenterChange: function (map) {
        this.setState({
            center: map.getCenter()
        });
    },
    _handleZoomChange: function (map) {
        this.setState({
            zoom: map.getZoom()
        });
    },
    _renderMarker: function (state, i) {
        return (
            <Marker position={this._toPosition(state.location)} key={i}/>
        );
    },
    _toPosition: function (pos) {
        return new LatLng(pos[0], pos[1]);
    }
});
export default Path;