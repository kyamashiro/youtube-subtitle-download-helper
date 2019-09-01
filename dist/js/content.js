/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/client/clientYoutube.ts":
/*!*************************************!*\
  !*** ./src/client/clientYoutube.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class ClientYoutube {
    getVideoInfo(videoId) {
        return this.getRequest(`https://youtube.com/get_video_info?video_id=${videoId}`);
    }
    getSubtitle(languageUrl) {
        return this.getRequest(languageUrl);
    }
    getRequest(url) {
        return new Promise(function (resolve, reject) {
            const request = new XMLHttpRequest();
            request.onload = function () {
                if (this.status === 200) {
                    resolve(this.response);
                }
                else {
                    reject(new Error(this.statusText));
                }
            };
            request.onerror = function () {
                reject(new Error('XMLHttpRequest Error: ' + this.statusText));
            };
            request.open('GET', url);
            request.send();
        });
    }
}
exports.default = ClientYoutube;


/***/ }),

/***/ "./src/content.ts":
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(__webpack_require__(/*! ./url */ "./src/url.ts"));
const videoInfoParser_1 = __importDefault(__webpack_require__(/*! ./videoInfoParser */ "./src/videoInfoParser.ts"));
const clientYoutube_1 = __importDefault(__webpack_require__(/*! ./client/clientYoutube */ "./src/client/clientYoutube.ts"));
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const videoId = new url_1.default(document.URL).getParam('v');
    const client = new clientYoutube_1.default();
    client
        .getVideoInfo(videoId)
        .then((response) => {
        const videoInfoParser = new videoInfoParser_1.default(response);
        sendResponse({
            captions: videoInfoParser.getCaptionsData(),
            videoId: videoId,
            title: videoInfoParser.getVideoTitle(),
            error: null
        });
    })
        .catch((error) => {
        console.log(error);
        sendResponse({ error: error });
    });
    return true;
});


/***/ }),

/***/ "./src/url.ts":
/*!********************!*\
  !*** ./src/url.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Url {
    constructor(url) {
        this.url = url;
    }
    getParam(name) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'), results = regex.exec(this.url);
        if (!results) {
            throw new ErrorEvent('Url query parameter does not contain videoid.');
        }
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
}
exports.default = Url;


/***/ }),

/***/ "./src/videoInfoParser.ts":
/*!********************************!*\
  !*** ./src/videoInfoParser.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class VideoInfoParser {
    constructor(videoInfoResponse) {
        this.videoInfoResponse = videoInfoResponse;
    }
    videoInfoParse() {
        const decodedData = this.parseQuery(this.videoInfoResponse);
        return JSON.parse(decodedData.player_response);
    }
    getCaptionsData() {
        return this.videoInfoParse().captions.playerCaptionsTracklistRenderer.captionTracks;
    }
    /**
     * Get video title and replace extra word.
     * example:"How+to+learn+any+language+in+six+months+|+Chris+Lonsdale+|+TEDxLingnanUniversity"
     */
    getVideoTitle() {
        return this.videoInfoParse()
            .videoDetails.title.replace(/\+\|/g, '')
            .replace(/[\+]/g, ' ');
    }
    parseQuery(queryString) {
        let query = {};
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    }
}
exports.default = VideoInfoParser;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb250ZW50LnRzIiwid2VicGFjazovLy8uL3NyYy91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZGVvSW5mb1BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBLDhFQUE4RSxRQUFRO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDNUJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCw4QkFBOEIsbUJBQU8sQ0FBQywyQkFBTztBQUM3QywwQ0FBMEMsbUJBQU8sQ0FBQyxtREFBbUI7QUFDckUsd0NBQXdDLG1CQUFPLENBQUMsNkRBQXdCO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBLHNCQUFzQixlQUFlO0FBQ3JDLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7QUMzQlk7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2pCYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsa0JBQWtCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvbnRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb250ZW50LnRzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBDbGllbnRZb3V0dWJlIHtcbiAgICBnZXRWaWRlb0luZm8odmlkZW9JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGBodHRwczovL3lvdXR1YmUuY29tL2dldF92aWRlb19pbmZvP3ZpZGVvX2lkPSR7dmlkZW9JZH1gKTtcbiAgICB9XG4gICAgZ2V0U3VidGl0bGUobGFuZ3VhZ2VVcmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVxdWVzdChsYW5ndWFnZVVybCk7XG4gICAgfVxuICAgIGdldFJlcXVlc3QodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcih0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1hNTEh0dHBSZXF1ZXN0IEVycm9yOiAnICsgdGhpcy5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxdWVzdC5vcGVuKCdHRVQnLCB1cmwpO1xuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENsaWVudFlvdXR1YmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHVybF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3VybFwiKSk7XG5jb25zdCB2aWRlb0luZm9QYXJzZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi92aWRlb0luZm9QYXJzZXJcIikpO1xuY29uc3QgY2xpZW50WW91dHViZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NsaWVudC9jbGllbnRZb3V0dWJlXCIpKTtcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihmdW5jdGlvbiAocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpIHtcbiAgICBjb25zdCB2aWRlb0lkID0gbmV3IHVybF8xLmRlZmF1bHQoZG9jdW1lbnQuVVJMKS5nZXRQYXJhbSgndicpO1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBjbGllbnRZb3V0dWJlXzEuZGVmYXVsdCgpO1xuICAgIGNsaWVudFxuICAgICAgICAuZ2V0VmlkZW9JbmZvKHZpZGVvSWQpXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCB2aWRlb0luZm9QYXJzZXIgPSBuZXcgdmlkZW9JbmZvUGFyc2VyXzEuZGVmYXVsdChyZXNwb25zZSk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICBjYXB0aW9uczogdmlkZW9JbmZvUGFyc2VyLmdldENhcHRpb25zRGF0YSgpLFxuICAgICAgICAgICAgdmlkZW9JZDogdmlkZW9JZCxcbiAgICAgICAgICAgIHRpdGxlOiB2aWRlb0luZm9QYXJzZXIuZ2V0VmlkZW9UaXRsZSgpLFxuICAgICAgICAgICAgZXJyb3I6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvciB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBVcmwge1xuICAgIGNvbnN0cnVjdG9yKHVybCkge1xuICAgICAgICB0aGlzLnVybCA9IHVybDtcbiAgICB9XG4gICAgZ2V0UGFyYW0obmFtZSkge1xuICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXFxdXS9nLCAnXFxcXCQmJyk7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnWz8mXScgKyBuYW1lICsgJyg9KFteJiNdKil8JnwjfCQpJyksIHJlc3VsdHMgPSByZWdleC5leGVjKHRoaXMudXJsKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3JFdmVudCgnVXJsIHF1ZXJ5IHBhcmFtZXRlciBkb2VzIG5vdCBjb250YWluIHZpZGVvaWQuJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHRzWzJdKVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMl0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFVybDtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgVmlkZW9JbmZvUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3Rvcih2aWRlb0luZm9SZXNwb25zZSkge1xuICAgICAgICB0aGlzLnZpZGVvSW5mb1Jlc3BvbnNlID0gdmlkZW9JbmZvUmVzcG9uc2U7XG4gICAgfVxuICAgIHZpZGVvSW5mb1BhcnNlKCkge1xuICAgICAgICBjb25zdCBkZWNvZGVkRGF0YSA9IHRoaXMucGFyc2VRdWVyeSh0aGlzLnZpZGVvSW5mb1Jlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlZERhdGEucGxheWVyX3Jlc3BvbnNlKTtcbiAgICB9XG4gICAgZ2V0Q2FwdGlvbnNEYXRhKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWRlb0luZm9QYXJzZSgpLmNhcHRpb25zLnBsYXllckNhcHRpb25zVHJhY2tsaXN0UmVuZGVyZXIuY2FwdGlvblRyYWNrcztcbiAgICB9XG4gICAgLyoqXG4gICAgICogR2V0IHZpZGVvIHRpdGxlIGFuZCByZXBsYWNlIGV4dHJhIHdvcmQuXG4gICAgICogZXhhbXBsZTpcIkhvdyt0bytsZWFybithbnkrbGFuZ3VhZ2UraW4rc2l4K21vbnRocyt8K0NocmlzK0xvbnNkYWxlK3wrVEVEeExpbmduYW5Vbml2ZXJzaXR5XCJcbiAgICAgKi9cbiAgICBnZXRWaWRlb1RpdGxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy52aWRlb0luZm9QYXJzZSgpXG4gICAgICAgICAgICAudmlkZW9EZXRhaWxzLnRpdGxlLnJlcGxhY2UoL1xcK1xcfC9nLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFwrXS9nLCAnICcpO1xuICAgIH1cbiAgICBwYXJzZVF1ZXJ5KHF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIGxldCBxdWVyeSA9IHt9O1xuICAgICAgICB2YXIgcGFpcnMgPSAocXVlcnlTdHJpbmdbMF0gPT09ICc/JyA/IHF1ZXJ5U3RyaW5nLnN1YnN0cigxKSA6IHF1ZXJ5U3RyaW5nKS5zcGxpdCgnJicpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICBxdWVyeVtkZWNvZGVVUklDb21wb25lbnQocGFpclswXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0gfHwgJycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBxdWVyeTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBWaWRlb0luZm9QYXJzZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9