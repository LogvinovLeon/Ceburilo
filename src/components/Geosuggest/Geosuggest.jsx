var React = require('react'),
    GeosuggestItem = require('./GeosuggestItem.jsx');
import $ from 'jquery'
import Actions from '../../actions/Actions.js'
var Geosuggest = React.createClass({
    /**
     * Get the default props
     * @return {Object} The state
     */
    getDefaultProps: function () {
        return {
            fixtures: [],
            placeholder: 'Search places',
            onSuggestSelect: function () {
            },
            location: null,
            radius: 0,
            auto_detect: false
        };
    },

    /**
     * Get the initial state
     * @return {Object} The state
     */
    getInitialState: function () {
        return {
            isSuggestsHidden: true,
            userInput: '',
            activeSuggest: null,
            suggests: [],
            geocoder: new google.maps.Geocoder(),
            autocompleteService: new google.maps.places.AutocompleteService()
        };
    },

    /**
     * When the input got changed
     */
    onInputChange: function () {
        var userInput = this.refs.geosuggestInput.getDOMNode().value;
        if (userInput === "My locatio" || (/^My location./).test(userInput)) {
            Actions.locationLost();
            userInput = "";
            this.props.onSuggestSelect({});
        }
        this.setState({userInput: userInput}, function () {
            if (!userInput) {
                this.updateSuggests();
            }
        }.bind(this));

        if (!userInput) {
            return;
        }
        this.state.autocompleteService.getPlacePredictions({
            input: userInput,
            /*TODO*/
            location: new google.maps.LatLng(0, 0),
            radius: this.props.radius
        }, function (suggestsGoogle) {
            console.log("test1");
            this.updateSuggests(suggestsGoogle);
        }.bind(this));
        console.log("test3");
    },

    /**
     * Update the suggests
     * @param  {Object} suggestsGoogle The new google suggests
     */
    updateSuggests: function (suggestsGoogle) {
        if (!suggestsGoogle) {
            suggestsGoogle = [];
        }

        var suggests = [],
            regex = new RegExp(this.state.userInput, 'gim'),
            suggestItems;
        this.props.fixtures.forEach(function (suggest) {
            if (suggest.label.match(regex)) {
                suggest.placeId = suggest.label;
                suggests.push(suggest);
            }
        }.bind(this));
        suggestsGoogle.forEach(function (suggest) {
            suggests.push({
                label: suggest.description,
                placeId: suggest.place_id
            });
        }.bind(this));
        this.setState({isSuggestsHidden: false});
        this.setState({suggests: suggests});
    },

    /**
     * When the input gets focused
     * @param  {Event} event The focus event
     */
    showSuggests: function (event) {
        this.updateSuggests();

        this.setState({isSuggestsHidden: false});
    },

    /**
     * When the input loses focused
     * @param  {Event} event The focus event
     */
    hideSuggests: function (event) {
        setTimeout(function () {
            this.setState({isSuggestsHidden: true});
        }.bind(this), 100);
    },

    /**
     * When a key gets pressed in the input
     * @param  {Event} event The keypress event
     */
    onInputKeyDown: function (event) {
        switch (event.which) {
            case 40: // DOWN
                event.preventDefault();
                this.activateSuggest('next');
                break;
            case 38: // UP
                event.preventDefault();
                this.activateSuggest('prev');
                break;
            case 13: // ENTER
                this.selectSuggest(this.state.activeSuggest);
                break;
            case 9: // TAB
                this.selectSuggest(this.state.activeSuggest);
                break;
            case 27: // ESC
                this.hideSuggests();
                break;
        }
    },

    /**
     * Activate a new suggest
     * @param {String} direction The direction in which to activate new suggest
     */
    activateSuggest: function (direction) {
        var suggestsCount = this.state.suggests.length - 1,
            next = direction === ('next'),
            newActiveSuggest = null,
            newIndex = 0,
            i = 0;

        for (i; i <= suggestsCount; i++) {
            if (this.state.suggests[i] === this.state.activeSuggest) {
                newIndex = next ? i + 1 : i - 1;
            }
        }

        if (!this.state.activeSuggest) {
            newIndex = next ? 0 : suggestsCount;
        }

        if (newIndex >= 0 && newIndex <= suggestsCount) {
            newActiveSuggest = this.state.suggests[newIndex];
        }

        this.setState({activeSuggest: newActiveSuggest});
    },

    /**
     * When an item got selected
     * @param {GeosuggestItem} suggest The selected suggest item
     */
    selectSuggest: function (suggest) {
        if (!suggest) {
            suggest = {
                label: this.state.userInput
            };
        }
        this.setState({
            isSuggestsHidden: true,
            userInput: suggest.label
        });

        if (suggest.location) {
            this.props.onSuggestSelect(suggest);
            $(this.refs.geosuggestInput.getDOMNode()).focus();
            return;
        }

        this.geocodeSuggest(suggest);
    },

    /**
     * Geocode a suggest
     * @param  {Object} suggest The suggest
     */
    geocodeSuggest: function (suggest) {
        var location;

        this.state.geocoder.geocode(
            {address: suggest.label},
            function (results, status) {
                if (status !== google.maps.GeocoderStatus.OK) {
                    return;
                }

                location = results[0].geometry.location;

                suggest.location = {
                    lat: location.lat(),
                    lng: location.lng()
                };

                this.props.onSuggestSelect(suggest);
            }.bind(this)
        );
    },
    getLocation: function () {
        var _this = this;
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function usePosition(position) {
                    Actions.locationFound(position);
                    _this.selectSuggest({
                        label: "My location",
                        location: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        }
                    })
                },
                function showError(error) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            _this.props.ns.addNotification({
                                "title": "User denied the request for Geolocation.",
                                "level": "error",
                                "actionState": false
                            });
                            break;
                        case error.POSITION_UNAVAILABLE:
                            _this.props.ns.addNotification({
                                "title": "Location information is unavailable.",
                                "level": "error",
                                "actionState": false
                            });
                            break;
                        case error.TIMEOUT:
                            _this.props.ns.addNotification({
                                "title": "The request to get user location timed out.",
                                "level": "error",
                                "actionState": false
                            });
                            break;
                        case error.UNKNOWN_ERROR:
                            _this.props.ns.addNotification({
                                "title": "An unknown error occurred.",
                                "level": "error",
                                "actionState": false
                            });
                            break;
                    }
                }
            );
        } else {
            this.props.ns.addNotification({
                "title": "Geolocation is not supported by this browser.",
                "message": "http://browsehappy.com/",
                "level": "warning",
                "actionState": false
            });
        }
    },
    /**
     * Render the view
     */
    render: function () {
        var class_name = (this.props.auto_detect ? "mdi-maps-my-location" : "") + " prefix";
        return (
            <div className="input-field geosuggest">
                <i className={class_name} onClick={this.getLocation}></i>
                <input id={this.props.placeholder}
                       className="geosuggest__input"
                       ref="geosuggestInput"
                       type="text"
                       value={this.state.userInput}
                       onKeyDown={this.onInputKeyDown}
                       onChange={this.onInputChange}
                       onFocus={this.showSuggests}
                       onBlur={this.hideSuggests}>
                </input>
                <label for={this.props.placeholder}>{this.props.placeholder}</label>
                <ul className={this.getSuggestsClasses()}>
                    {this.getSuggestItems()}
                </ul>
            </div>
        );
    },

    /**
     * Get the suggest items for the list
     * @return {Array} The suggestions
     */
    getSuggestItems: function () {
        return this.state.suggests.map(function (suggest) {
            var isActive = (this.state.activeSuggest &&
            suggest.placeId === this.state.activeSuggest.placeId);

            return (
                <GeosuggestItem
                    key={suggest.placeId}
                    suggest={suggest}
                    isActive={isActive}
                    onSuggestSelect={this.selectSuggest}/>
            );
        }.bind(this));
    },

    /**
     * The classes for the suggests list
     * @return {String} The classes
     */
    getSuggestsClasses: function () {
        var classes = 'geosuggest__suggests'

        classes += this.state.isSuggestsHidden ?
            ' geosuggest__suggests--hidden' : '';

        return classes;
    }
});

module.exports = Geosuggest;
