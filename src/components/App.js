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
                finish: {},
                fixtures: []
            }
        },
        componentDidMount: function () {
            this._notificationSystem = this.refs.notificationSystem;
            function parseOrEmpty(str) {
              try {
                return JSON.parse(str);
              } catch (e) {
                return [];
              }
            }
            this.setState({
              fixtures: parseOrEmpty(localStorage.fixtures)
            });
        },
        render: function () {
            return (
                <div className="App">
                    <div className="container row valign-wrapper">
                        <div className="col l5 m5 s12">
                            <Geosuggest id="from"
                                        ref="from"
                                        auto_detect={true}
                                        ns={this._notificationSystem}
                                        placeholder="From"
                                        fixtures={this.state.fixtures}
                                        onSuggestSelect={this._onStartSelected}
                                        location={Constants.WarsawPosition}
                                        radius={Constants.WarsawRadius}/>
                        </div>
                        <div className="col l5 m5 s12">
                            <Geosuggest id="to"
                                        auto_detect={false}
                                        placeholder="To"
                                        fixtures={this.state.fixtures}
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
                    <Path ref="path"
                          onUpdate={this._onPathUpdate}
                          beginCoord={this.state.start.location}
                          destCoord={this.state.finish.location}
                       />
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
        _onStartSelected: function (data) {
            this.setState({start: data});
            this._addFixture(data);
        },
        _onFinishSelected: function (data) {
            this.setState({finish: data}, function() {
              if(this.state.start) {
                this._onSubmit();
              }
            });
            this._addFixture(data);
        },
        _addFixture: function (location) {
            if(!location.label || location.label == 'My location')
              return;
            const fixtures = [].concat.apply([location],
                this.state.fixtures
                .filter(function(x) { return x.label != location.label; })
                .slice(0, 5))
            localStorage.fixtures = JSON.stringify(fixtures);
            this.setState({
              fixtures: fixtures
            });
        },
        _onPathUpdate: function({start, finish}) {
          function toPoint(loc) {
            return {
              label: loc.A + ', ' + loc.F,
              location: {
                lat: loc.A,
                lng: loc.F
              }
            };
          }
          this.setState({
            start: toPoint(start),
            finish: toPoint(finish)
          }, function() { this._onSubmit(); });
        }
    })
    ;

export default App;
