var Dispatcher = require('../dispatcher/Dispatcher');
var ActionTypes = require('../constants/ActionTypes');

export default {
    submitPath: function (payload) {
        Dispatcher.dispatch({
            type: ActionTypes.FIND_PATH,
            payload: payload
        });
    },
    receivePathResponse: function (payload) {
        Dispatcher.dispatch({
            type: ActionTypes.FIND_PATH_SUCCESS,
            payload: payload
        });
    },
    errorPathResponse: function () {
        Dispatcher.dispatch({
            type: ActionTypes.FIND_PATH_ERROR
        });
    }
};