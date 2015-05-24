var React = require('react/addons');
var ReactGoogleMaps = require('react-googlemaps');
var GoogleMapsAPI = window.google.maps;
var {Map,Marker, Polyline, Circle, OverlayView} = ReactGoogleMaps;
var LatLng = GoogleMapsAPI.LatLng;
import Constants from '../constants/Main.js'
import PathStore from '../stores/PathStore.js'
import assign from 'react/lib/Object.assign';

var Path = React.createClass({
    getInitialState: function () {
        return assign({}, {
            center: Constants.WarsawPosition(),
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
        var location_circle = this.state.location.coords === undefined ? null : <Circle
            strokeColor="#64b5f6"
            fillColor="#64b5f6"
            center={new LatLng(this.state.location.coords.latitude, this.state.location.coords.longitude)}
            radius={this.state.location.coords.accuracy}/>;
        if (this.state.route.path) {
            console.log("PATH");
            var points = this.state.route.path.points.coordinates.map(this._toPosition);
            console.log(points);
        }
        var route = this.state.route.path === undefined ? null :
            (
                <Polyline
                    strokeColor="#000"
                    path={this.state.route.path.points.coordinates.map(this._toPosition)}/>
            );
        var test = [Constants.WarsawPosition(), this.state.center, Constants.WarsawPosition()];
        console.log("TESTING");
        console.log(test.map(this._toPosition));
        //var route = (
        //    <Polyline
        //        strokeColor="#000"
        //        path={test.map(this._toPosition)}/>
        //);
        var overlay =
            (
                <OverlayView
                    className="myOverlay"
                    mapPane="floatPane"
                    position={Constants.WarsawPosition()}>
                    <h1>Title</h1>
                </OverlayView>
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
                    {location_circle}
                    {route}
                </Map>
            </div>
        );
    },
    _handlePathStoreChange: function () {
        this.setState(function (previousState, currentProps) {
            var state = PathStore.getState();
            if (previousState.location.coords === undefined && state.location.coords !== undefined) {
                var center = new LatLng(state.location.coords.latitude, state.location.coords.longitude);
                var radius = state.location.coords.accuracy / 500;
                var bound = this._getMapBound([new LatLng(center.A - radius, center.F - radius),
                    new LatLng(center.A + radius, center.F + radius)]);
            } else if (previousState.route.stations === undefined && state.route.stations !== undefined) {
                bound = this._getMapBound(state.route.stations.map((station)=>station.location));
            }
            if (bound !== undefined) {
                state.zoom = bound.zoom;
                state.center = bound.center;
            }
            return state;
        });
        this.setState(PathStore.getState());
    },
    _getMapBound: function (points) {
        var min_x = Infinity,
            max_x = -Infinity,
            min_y = Infinity,
            max_y = -Infinity;
        points.map(function (item, i) {
            if (item.A !== undefined) {
                min_x = Math.min(min_x, item.A);
                max_x = Math.max(max_x, item.A);
                min_y = Math.min(min_y, item.F);
                max_y = Math.max(max_y, item.F);
            } else {
                min_x = Math.min(min_x, item[0]);
                max_x = Math.max(max_x, item[0]);
                min_y = Math.min(min_y, item[1]);
                max_y = Math.max(max_y, item[1]);
            }
        });
        var scale = Math.max(max_x - min_x, max_y - min_y);
        var zoom = Math.min((16 - Math.log(scale) / Math.log(2)), 12);
        var center = new LatLng((min_x + max_x) / 2, (min_y + max_y) / 2);
        return {zoom: zoom, center: center};
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
            <Marker position={this._toPosition(state.location)}
                    key={i}
                    labelContent={state.name}
                />
        );
    },
    _toPosition: function (pos) {
        if (pos.F !== undefined) {
            var res = new LatLng(pos.A, pos.F);
        } else {
            res = new LatLng(pos[0], pos[1]);
        }
        return res;
    }
});
export default Path;