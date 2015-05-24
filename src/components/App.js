import React from 'react'
import Path from './Path'
import Geosuggest from './Geosuggest/Geosuggest.jsx'
import Constants from '../constants/Main.js'
import Actions from '../actions/Actions.js'
import $ from 'jquery'
var NotificationSystem = require('react-notification-system');

var App = React.createClass({
        _notificationSystem: null,
        getInitialState: function () {
            return {
                start: {},
                finish: {}
            }
        },
        componentDidMount: function () {
            this._notificationSystem = this.refs.notificationSystem;
        },
        render: function () {
            return (
                <div className="App">
                    <div className="row valign-wrapper">
                        <div className="col l5 m5 s12">
                            <Geosuggest id="from"
                                        ref="from"
                                        auto_detect={true}
                                        ns={this._notificationSystem}
                                        placeholder="From"
                                        onSuggestSelect={this._onStartSelected}
                                        location={Constants.WarsawPosition}
                                        radius={Constants.WarsawRadius}/>
                        </div>
                        <div className="col l5 m5 s12">
                            <Geosuggest id="to"
                                        auto_detect={false}
                                        placeholder="To"
                                        onSuggestSelect={this._onFinishSelected}
                                        location={Constants.WarsawPosition}
                                        radius={Constants.WarsawRadius}/>
                        </div>
                        <button className="btn waves-effect waves-light col l2 m2 s12 valign"
                                onClick={this._onSubmit}>
                            Submit
                            <i className="mdi-content-send right"></i>
                        </button>
                    </div>
                    <Path ref="path"/>
                    <NotificationSystem ref="notificationSystem"/>
                </div>
            );
        },
        /*<p>{JSON.stringify(this.state)}</p>*/
        _onSubmit: function (event) {
            var _this = this;
            if (this.state.start.location === undefined) {
                this._notificationSystem.addNotification({
                    "title": "Please, provide start point",
                    "message": "Or use your location for it",
                    "level": "warning",
                    "action": {
                        "label": "Use my location",
                        "callback": function () {
                            _this.refs.from.getLocation();
                        }
                    },
                    "actionState": true
                });
                return;
            }
            if (this.state.finish.location === undefined) {
                this._notificationSystem.addNotification({
                    "title": "Please, provide destination",
                    "message": "It's required",
                    "level": "warning",
                    "actionState": false
                });
                return;
            }
            if (this.refs.path.state.loading) {
                this._notificationSystem.addNotification({
                    "title": "Wait a minute pls",
                    "message": "I'm waiting for a server response",
                    "level": "info"
                });
                return;
            }
            Actions.submitPath();
            var _notificationSystem = this._notificationSystem;
            $.get("http://neutrino.re:40000/route?" +
                $.param({
                    beg_lat: this.state.start.location.lat,
                    beg_lon: this.state.start.location.lng,
                    dest_lat: this.state.finish.location.lat,
                    dest_lon: this.state.finish.location.lng,
                    beginning: this.state.start.label,
                    destination: this.state.finish.label
                }),
                null,
                function (data) {
                    _notificationSystem.addNotification({
                        "title": "Path found",
                        "message": "Have a nice day!",
                        "level": "success",
                        "actionState": false
                    });
                    Actions.receivePathResponse(data);
                },
                'json'
            ).fail(function (error) {
                    _notificationSystem.addNotification({
                        "title": "Server error",
                        "message": "Smth is fucked up!",
                        "level": "error",
                        "position": "tr",
                        "autoDismiss": 5,
                        "dismissible": true,
                        "actionState": false
                    });
                    Actions.errorPathResponse();
                })
        },
        _onStartSelected: function (event) {
            this.setState({start: event});
        },
        _onFinishSelected: function (event) {
            this.setState({finish: event});
        }
    })
    ;

export default App;