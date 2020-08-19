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
/*! exports provided: ClientYoutube */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClientYoutube", function() { return ClientYoutube; });
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


/***/ }),

/***/ "./src/content.ts":
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url */ "./src/url.ts");
/* harmony import */ var _parser_videoInfoParser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./parser/videoInfoParser */ "./src/parser/videoInfoParser.ts");
/* harmony import */ var _client_clientYoutube__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./client/clientYoutube */ "./src/client/clientYoutube.ts");



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const videoId = new _url__WEBPACK_IMPORTED_MODULE_0__["Url"](document.URL).getParam("v");
    const client = new _client_clientYoutube__WEBPACK_IMPORTED_MODULE_2__["ClientYoutube"]();
    client
        .getVideoInfo(videoId)
        .then((response) => {
        const videoInfoParser = new _parser_videoInfoParser__WEBPACK_IMPORTED_MODULE_1__["VideoInfoParser"](response);
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

/***/ "./src/parser/videoInfoParser.ts":
/*!***************************************!*\
  !*** ./src/parser/videoInfoParser.ts ***!
  \***************************************/
/*! exports provided: VideoInfoParser */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "VideoInfoParser", function() { return VideoInfoParser; });
class VideoInfoParser {
    constructor(videoInfoResponse) {
        this.videoInfoResponse = videoInfoResponse;
    }
    getCaptionsData() {
        if (!this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer
            .captionTracks) {
            throw new Error("This video has not caption.");
        }
        return this.decodeVideoInfoResponse().captions
            .playerCaptionsTracklistRenderer.captionTracks;
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
        const pairs = (queryString[0] === "?"
            ? queryString.substr(1)
            : queryString).split("&");
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split("=");
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || "");
        }
        return query;
    }
}


/***/ }),

/***/ "./src/url.ts":
/*!********************!*\
  !*** ./src/url.ts ***!
  \********************/
/*! exports provided: Url */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Url", function() { return Url; });
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


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb250ZW50LnRzIiwid2VicGFjazovLy8uL3NyYy9wYXJzZXIvdmlkZW9JbmZvUGFyc2VyLnRzIiwid2VicGFjazovLy8uL3NyYy91cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUFBO0FBQU87QUFDUDtBQUNBLDhFQUE4RSxRQUFRO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3pCQTtBQUFBO0FBQUE7QUFBQTtBQUE0QjtBQUMrQjtBQUNKO0FBQ3ZEO0FBQ0Esd0JBQXdCLHdDQUFHO0FBQzNCLHVCQUF1QixtRUFBYTtBQUNwQztBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsdUVBQWU7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBLHNCQUFzQixlQUFlO0FBQ3JDLEtBQUs7QUFDTDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7QUN0QkQ7QUFBQTtBQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixrQkFBa0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDdERBO0FBQUE7QUFBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29udGVudC50c1wiKTtcbiIsImV4cG9ydCBjbGFzcyBDbGllbnRZb3V0dWJlIHtcbiAgICBnZXRWaWRlb0luZm8odmlkZW9JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGBodHRwczovL3lvdXR1YmUuY29tL2dldF92aWRlb19pbmZvP3ZpZGVvX2lkPSR7dmlkZW9JZH1gKTtcbiAgICB9XG4gICAgZ2V0U3VidGl0bGUobGFuZ3VhZ2VVcmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVxdWVzdChsYW5ndWFnZVVybCk7XG4gICAgfVxuICAgIGdldFJlcXVlc3QodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcih0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJYTUxIdHRwUmVxdWVzdCBFcnJvcjogXCIgKyB0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQgeyBVcmwgfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCB7IFZpZGVvSW5mb1BhcnNlciB9IGZyb20gXCIuL3BhcnNlci92aWRlb0luZm9QYXJzZXJcIjtcbmltcG9ydCB7IENsaWVudFlvdXR1YmUgfSBmcm9tIFwiLi9jbGllbnQvY2xpZW50WW91dHViZVwiO1xuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgIGNvbnN0IHZpZGVvSWQgPSBuZXcgVXJsKGRvY3VtZW50LlVSTCkuZ2V0UGFyYW0oXCJ2XCIpO1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnRZb3V0dWJlKCk7XG4gICAgY2xpZW50XG4gICAgICAgIC5nZXRWaWRlb0luZm8odmlkZW9JZClcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IHZpZGVvSW5mb1BhcnNlciA9IG5ldyBWaWRlb0luZm9QYXJzZXIocmVzcG9uc2UpO1xuICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgY2FwdGlvbnM6IHZpZGVvSW5mb1BhcnNlci5nZXRDYXB0aW9uc0RhdGEoKSxcbiAgICAgICAgICAgIHZpZGVvSWQ6IHZpZGVvSWQsXG4gICAgICAgICAgICB0aXRsZTogdmlkZW9JbmZvUGFyc2VyLmdldFZpZGVvVGl0bGUoKSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xufSk7XG4iLCJleHBvcnQgY2xhc3MgVmlkZW9JbmZvUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3Rvcih2aWRlb0luZm9SZXNwb25zZSkge1xuICAgICAgICB0aGlzLnZpZGVvSW5mb1Jlc3BvbnNlID0gdmlkZW9JbmZvUmVzcG9uc2U7XG4gICAgfVxuICAgIGdldENhcHRpb25zRGF0YSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKCkuY2FwdGlvbnMucGxheWVyQ2FwdGlvbnNUcmFja2xpc3RSZW5kZXJlclxuICAgICAgICAgICAgLmNhcHRpb25UcmFja3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRoaXMgdmlkZW8gaGFzIG5vdCBjYXB0aW9uLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kZWNvZGVWaWRlb0luZm9SZXNwb25zZSgpLmNhcHRpb25zXG4gICAgICAgICAgICAucGxheWVyQ2FwdGlvbnNUcmFja2xpc3RSZW5kZXJlci5jYXB0aW9uVHJhY2tzO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBHZXQgdmlkZW8gdGl0bGUgYW5kIHJlcGxhY2UgZXh0cmEgd29yZC5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFZpZGVvSW5mb1BhcnNlclxuICAgICAqL1xuICAgIGdldFZpZGVvVGl0bGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKClcbiAgICAgICAgICAgIC52aWRlb0RldGFpbHMudGl0bGUucmVwbGFjZSgvXFwrXFx8L2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvWytdL2csIFwiIFwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1s/Xi48PlwiOl0vZywgXCJcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIERlY29kZSByZXNwb25zZSBKU09OIGZvcm1hdC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICogQG1lbWJlcm9mIFZpZGVvSW5mb1BhcnNlclxuICAgICAqL1xuICAgIGRlY29kZVZpZGVvSW5mb1Jlc3BvbnNlKCkge1xuICAgICAgICBjb25zdCBkZWNvZGVkRGF0YSA9IHRoaXMucGFyc2VRdWVyeSh0aGlzLnZpZGVvSW5mb1Jlc3BvbnNlKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoZGVjb2RlZERhdGEucGxheWVyX3Jlc3BvbnNlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUGFyc2UgdmlkZW9pbmZvIHJlc3BvbnNlLlxuICAgICAqXG4gICAgICogQHByaXZhdGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlTdHJpbmdcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqIEBtZW1iZXJvZiBWaWRlb0luZm9QYXJzZXJcbiAgICAgKi9cbiAgICBwYXJzZVF1ZXJ5KHF1ZXJ5U3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5ID0ge307XG4gICAgICAgIGNvbnN0IHBhaXJzID0gKHF1ZXJ5U3RyaW5nWzBdID09PSBcIj9cIlxuICAgICAgICAgICAgPyBxdWVyeVN0cmluZy5zdWJzdHIoMSlcbiAgICAgICAgICAgIDogcXVlcnlTdHJpbmcpLnNwbGl0KFwiJlwiKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYWlycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcGFpciA9IHBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcbiAgICAgICAgICAgIHF1ZXJ5W2RlY29kZVVSSUNvbXBvbmVudChwYWlyWzBdKV0gPSBkZWNvZGVVUklDb21wb25lbnQocGFpclsxXSB8fCBcIlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFVybCB7XG4gICAgY29uc3RydWN0b3IodXJsKSB7XG4gICAgICAgIHRoaXMudXJsID0gdXJsO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSBhIHZhbHVlIGZyb20gYSBzcGVjaWZpYyBxdWVyeSBzdHJpbmcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBVcmxcbiAgICAgKi9cbiAgICBnZXRQYXJhbShxdWVyeSkge1xuICAgICAgICBxdWVyeSA9IHF1ZXJ5LnJlcGxhY2UoL1tbXV0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChcIls/Jl1cIiArIHF1ZXJ5ICsgXCIoPShbXiYjXSopfCZ8I3wkKVwiKTtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModGhpcy51cmwpO1xuICAgICAgICBpZiAoIXJlc3VsdHMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlVybCBxdWVyeSBwYXJhbWV0ZXIgZG9lcyBub3QgY29udGFpbiB2aWRlb2lkLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc3VsdHNbMl0pXG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzJdLnJlcGxhY2UoL1xcKy9nLCBcIiBcIikpO1xuICAgIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=