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
                reject(new Error("XMLHttpRequest Error: " + this.statusText));
            };
            request.open("GET", url);
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
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const videoId = new url_1.default(document.URL).getParam("v");
    const client = new clientYoutube_1.default();
    client
        .getVideoInfo(videoId)
        .then((response) => {
        const videoInfoParser = new videoInfoParser_1.default(response);
        sendResponse({
            captions: videoInfoParser.getCaptionsData(),
            videoId: videoId,
            title: videoInfoParser.getVideoTitle(),
            error: null,
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
    /**
     * Retrieve a value from a specific query string.
     *
     * @param {string} query
     * @returns {string}
     * @memberof Url
     */
    getParam(query) {
        query = query.replace(/[[]]/g, "\\$&");
        const regex = new RegExp("[?&]" + query + "(=([^&#]*)|&|#|$)");
        const results = regex.exec(this.url);
        if (!results) {
            throw new Error("Url query parameter does not contain videoid.");
        }
        if (!results[2])
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
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
    getCaptionsData() {
        if (!this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks) {
            throw new Error("This video has not caption.");
        }
        return this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks;
    }
    /**
     * Get video title and replace extra word.
     *
     * @returns {string}
     * @memberof VideoInfoParser
     */
    getVideoTitle() {
        return this.decodeVideoInfoResponse()
            .videoDetails.title.replace(/\+\|/g, "")
            .replace(/[+]/g, " ")
            .replace(/[?^.<>":]/g, "");
    }
    /**
     * Decode response JSON format.
     *
     * @private
     * @returns {*}
     * @memberof VideoInfoParser
     */
    decodeVideoInfoResponse() {
        const decodedData = this.parseQuery(this.videoInfoResponse);
        return JSON.parse(decodedData.player_response);
    }
    /**
     * Parse videoinfo response.
     *
     * @private
     * @param {string} queryString
     * @returns
     * @memberof VideoInfoParser
     */
    parseQuery(queryString) {
        const query = {};
        const pairs = (queryString[0] === "?" ? queryString.substr(1) : queryString).split("&");
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split("=");
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
        }
        return query;
    }
}
exports.default = VideoInfoParser;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb250ZW50LnRzIiwid2VicGFjazovLy8uL3NyYy91cmwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3ZpZGVvSW5mb1BhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7O0FDbEZhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBLDhFQUE4RSxRQUFRO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDNUJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCw4QkFBOEIsbUJBQU8sQ0FBQywyQkFBTztBQUM3QywwQ0FBMEMsbUJBQU8sQ0FBQyxtREFBbUI7QUFDckUsd0NBQXdDLG1CQUFPLENBQUMsNkRBQXdCO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBLHNCQUFzQixlQUFlO0FBQ3JDLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7QUMzQlk7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDekJhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixrQkFBa0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvbnRlbnQudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIENsaWVudFlvdXR1YmUge1xuICAgIGdldFZpZGVvSW5mbyh2aWRlb0lkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlcXVlc3QoYGh0dHBzOi8veW91dHViZS5jb20vZ2V0X3ZpZGVvX2luZm8/dmlkZW9faWQ9JHt2aWRlb0lkfWApO1xuICAgIH1cbiAgICBnZXRTdWJ0aXRsZShsYW5ndWFnZVVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGxhbmd1YWdlVXJsKTtcbiAgICB9XG4gICAgZ2V0UmVxdWVzdCh1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlhNTEh0dHBSZXF1ZXN0IEVycm9yOiBcIiArIHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENsaWVudFlvdXR1YmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHVybF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3VybFwiKSk7XG5jb25zdCB2aWRlb0luZm9QYXJzZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi92aWRlb0luZm9QYXJzZXJcIikpO1xuY29uc3QgY2xpZW50WW91dHViZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NsaWVudC9jbGllbnRZb3V0dWJlXCIpKTtcbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgICBjb25zdCB2aWRlb0lkID0gbmV3IHVybF8xLmRlZmF1bHQoZG9jdW1lbnQuVVJMKS5nZXRQYXJhbShcInZcIik7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IGNsaWVudFlvdXR1YmVfMS5kZWZhdWx0KCk7XG4gICAgY2xpZW50XG4gICAgICAgIC5nZXRWaWRlb0luZm8odmlkZW9JZClcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZGVvSW5mb1BhcnNlciA9IG5ldyB2aWRlb0luZm9QYXJzZXJfMS5kZWZhdWx0KHJlc3BvbnNlKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHtcbiAgICAgICAgICAgIGNhcHRpb25zOiB2aWRlb0luZm9QYXJzZXIuZ2V0Q2FwdGlvbnNEYXRhKCksXG4gICAgICAgICAgICB2aWRlb0lkOiB2aWRlb0lkLFxuICAgICAgICAgICAgdGl0bGU6IHZpZGVvSW5mb1BhcnNlci5nZXRWaWRlb1RpdGxlKCksXG4gICAgICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7IGVycm9yOiBlcnJvciB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gdHJ1ZTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBVcmwge1xuICAgIGNvbnN0cnVjdG9yKHVybCkge1xuICAgICAgICB0aGlzLnVybCA9IHVybDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgYSB2YWx1ZSBmcm9tIGEgc3BlY2lmaWMgcXVlcnkgc3RyaW5nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHF1ZXJ5XG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVXJsXG4gICAgICovXG4gICAgZ2V0UGFyYW0ocXVlcnkpIHtcbiAgICAgICAgcXVlcnkgPSBxdWVyeS5yZXBsYWNlKC9bW11dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXCJbPyZdXCIgKyBxdWVyeSArIFwiKD0oW14mI10qKXwmfCN8JClcIik7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHRoaXMudXJsKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVcmwgcXVlcnkgcGFyYW1ldGVyIGRvZXMgbm90IGNvbnRhaW4gdmlkZW9pZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHRzWzJdKVxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBVcmw7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFZpZGVvSW5mb1BhcnNlciB7XG4gICAgY29uc3RydWN0b3IodmlkZW9JbmZvUmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy52aWRlb0luZm9SZXNwb25zZSA9IHZpZGVvSW5mb1Jlc3BvbnNlO1xuICAgIH1cbiAgICBnZXRDYXB0aW9uc0RhdGEoKSB7XG4gICAgICAgIGlmICghdGhpcy5kZWNvZGVWaWRlb0luZm9SZXNwb25zZSgpLmNhcHRpb25zLnBsYXllckNhcHRpb25zVHJhY2tsaXN0UmVuZGVyZXIuY2FwdGlvblRyYWNrcykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyB2aWRlbyBoYXMgbm90IGNhcHRpb24uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKCkuY2FwdGlvbnMucGxheWVyQ2FwdGlvbnNUcmFja2xpc3RSZW5kZXJlci5jYXB0aW9uVHJhY2tzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdmlkZW8gdGl0bGUgYW5kIHJlcGxhY2UgZXh0cmEgd29yZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFZpZGVvSW5mb1BhcnNlclxuICAgICAqL1xuICAgIGdldFZpZGVvVGl0bGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKClcbiAgICAgICAgICAgIC52aWRlb0RldGFpbHMudGl0bGUucmVwbGFjZSgvXFwrXFx8L2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvWytdL2csIFwiIFwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1s/Xi48PlwiOl0vZywgXCJcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlY29kZSByZXNwb25zZSBKU09OIGZvcm1hdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQG1lbWJlcm9mIFZpZGVvSW5mb1BhcnNlclxuICAgICAqL1xuICAgIGRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKCkge1xuICAgICAgICBjb25zdCBkZWNvZGVkRGF0YSA9IHRoaXMucGFyc2VRdWVyeSh0aGlzLnZpZGVvSW5mb1Jlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlZERhdGEucGxheWVyX3Jlc3BvbnNlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgdmlkZW9pbmZvIHJlc3BvbnNlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEBtZW1iZXJvZiBWaWRlb0luZm9QYXJzZXJcbiAgICAgKi9cbiAgICBwYXJzZVF1ZXJ5KHF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0ge307XG4gICAgICAgIGNvbnN0IHBhaXJzID0gKHF1ZXJ5U3RyaW5nWzBdID09PSBcIj9cIiA/IHF1ZXJ5U3RyaW5nLnN1YnN0cigxKSA6IHF1ZXJ5U3RyaW5nKS5zcGxpdChcIiZcIik7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFpcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBhaXIgPSBwYWlyc1tpXS5zcGxpdChcIj1cIik7XG4gICAgICAgICAgICBxdWVyeVtkZWNvZGVVUklDb21wb25lbnQocGFpclswXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0gfHwgXCJcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHF1ZXJ5O1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFZpZGVvSW5mb1BhcnNlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=