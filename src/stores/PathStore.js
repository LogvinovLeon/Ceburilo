import Dispatcher from '../dispatcher/Dispatcher';
import ActionTypes from '../constants/ActionTypes';
import EventEmitter from 'eventemitter3';
import assign from 'react/lib/Object.assign';

var CHANGE_EVENT = 'change';

var loading = false;
var route = {};
var location = {};

var AppStore = assign({}, EventEmitter.prototype, {
    getState() {
        return {
            loading: loading,
            route: route,
            location: location
        }
    },
    emitChange() {
        return this.emit(CHANGE_EVENT);
    },
    onChange(callback) {
        this.on(CHANGE_EVENT, callback);
    },
    off(callback) {
        this.off(CHANGE_EVENT, callback);
    }
});

AppStore.dispatcherToken = Dispatcher.register((payload) => {
    var action = payload;
    console.log(action);
    switch (action.type) {
        case ActionTypes.FIND_PATH:
            loading = true;
            AppStore.emitChange();
            break;
        case ActionTypes.FIND_PATH_SUCCESS:
            loading = false;
            route = action.payload;
            console.log(action);
            AppStore.emitChange();
            break;
        case ActionTypes.FIND_PATH_ERROR:
            loading = false;
            AppStore.emitChange();
            break;
        case ActionTypes.LOCATION_FOUND:
            location = action.payload;
            AppStore.emitChange();
            break;
        case ActionTypes.LOCATION_LOST:
            location = {};
            AppStore.emitChange();
            break;
        default:
        // Do nothing
    }
});

export default AppStore;
