import React from 'react'
import Path from './Path'
import Geosuggest from './Geosuggest/Geosuggest.jsx'
import Constants from '../constants/Main.js'
import Actions from '../actions/Actions.js'
import $ from 'jquery'
var App = React.createClass({
        getInitialState: function () {
            return {
                start: {},
                finish: {}
            }
        },
        render: function () {
            return (
                <div className="App">
                    <div className="row valign-wrapper">
                        <div className="col l5 m5 s12">
                            <Geosuggest id="from"
                                        placeholder="From"
                                        onSuggestSelect={this._onStartSelected}
                                        location={Constants.WarsawPosition}
                                        radius={Constants.WarsawRadius}/>
                        </div>
                        <div className="col l5 m5 s12">
                            <Geosuggest id="to"
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

                    <Path/>
                </div>
            );
        },
        /*<p>{JSON.stringify(this.state)}</p>*/
        _onSubmit: function (event) {
            Actions.submitPath();
            $.get("http://10.55.5.89:4000/route?" +
                $.param({
                    beg_lat: this.state.start.lat,
                    beg_lng: this.state.start.lng,
                    dest_lat: this.state.finish.lat,
                    dest_lng: this.state.finish.lng,
                    begining: this.state.start.label,
                    destination: this.state.finish.label
                }),
                null,
                function (data) {
                    Actions.receivePathResponse(data);
                },
                'json'
            ).fail(function (error) {
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