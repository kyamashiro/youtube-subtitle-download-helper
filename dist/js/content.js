/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/client/clientYoutube.ts":
/*!*************************************!*\
  !*** ./src/client/clientYoutube.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ClientYoutube": () => (/* binding */ ClientYoutube)
/* harmony export */ });
class ClientYoutube {
    /**
     * Get a list of translations by language
     * @param videoId
     */
    async getVideoInformation(videoId) {
        const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.text();
    }
    async getSubtitle(baseUrl) {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.text();
    }
}


/***/ }),

/***/ "./src/parser/videoInformationParser/index.ts":
/*!****************************************************!*\
  !*** ./src/parser/videoInformationParser/index.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VideoInformationResponseParse": () => (/* binding */ VideoInformationResponseParse)
/* harmony export */ });
const VideoInformationResponseParse = (htmlStringData) => {
    const captionTracks = /\{"captionTracks":(\[.*?\]),/g.exec(htmlStringData);
    if (!captionTracks)
        throw new Error("Not found caption track list");
    return JSON.parse(captionTracks[1]);
};


/***/ }),

/***/ "./src/url.ts":
/*!********************!*\
  !*** ./src/url.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Url": () => (/* binding */ Url)
/* harmony export */ });
class Url {
    constructor(url) {
        this.url = url;
    }
    /**
     * Retrieve a value from a specific query string.
     * @param {string} query
     * @returns {string}
     * @member Url
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

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _url__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./url */ "./src/url.ts");
/* harmony import */ var _client_clientYoutube__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./client/clientYoutube */ "./src/client/clientYoutube.ts");
/* harmony import */ var _parser_videoInformationParser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parser/videoInformationParser */ "./src/parser/videoInformationParser/index.ts");



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const videoId = new _url__WEBPACK_IMPORTED_MODULE_0__.Url(document.URL).getParam("v");
    const client = new _client_clientYoutube__WEBPACK_IMPORTED_MODULE_1__.ClientYoutube();
    client
        .getVideoInformation(videoId)
        .then((response) => {
        const captionTrackList = (0,_parser_videoInformationParser__WEBPACK_IMPORTED_MODULE_2__.VideoInformationResponseParse)(response);
        sendResponse({
            captionTrackList,
            videoId,
            videoTitle: getVideoTitle(),
            error: null,
        });
    })
        .catch((error) => {
        console.log(error);
        sendResponse({ error: error });
    });
    return true;
});
const getVideoTitle = () => {
    return document.title.replace(/[+|/?^.<>":]/g, "").replace(/ - YouTube/, "");
};

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90c2FwcC8uL3NyYy9jbGllbnQvY2xpZW50WW91dHViZS50cyIsIndlYnBhY2s6Ly90c2FwcC8uL3NyYy9wYXJzZXIvdmlkZW9JbmZvcm1hdGlvblBhcnNlci9pbmRleC50cyIsIndlYnBhY2s6Ly90c2FwcC8uL3NyYy91cmwudHMiLCJ3ZWJwYWNrOi8vdHNhcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdHNhcHAvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RzYXBwL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdHNhcHAvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90c2FwcC8uL3NyYy9jb250ZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLFFBQVE7QUFDaEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztBQ25CTztBQUNQLDZCQUE2QjtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDTE87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDckJBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esd0NBQXdDLHlDQUF5QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSxzREFBc0Qsa0JBQWtCO1dBQ3hFO1dBQ0EsK0NBQStDLGNBQWM7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7QUNONEI7QUFDMkI7QUFDeUI7QUFDaEY7QUFDQSx3QkFBd0IscUNBQUc7QUFDM0IsdUJBQXVCLGdFQUFhO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQyw2RkFBNkI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBLHNCQUFzQixlQUFlO0FBQ3JDLEtBQUs7QUFDTDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjbGFzcyBDbGllbnRZb3V0dWJlIHtcbiAgICAvKipcbiAgICAgKiBHZXQgYSBsaXN0IG9mIHRyYW5zbGF0aW9ucyBieSBsYW5ndWFnZVxuICAgICAqIEBwYXJhbSB2aWRlb0lkXG4gICAgICovXG4gICAgYXN5bmMgZ2V0VmlkZW9JbmZvcm1hdGlvbih2aWRlb0lkKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYGh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9JHt2aWRlb0lkfWApO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICB9XG4gICAgYXN5bmMgZ2V0U3VidGl0bGUoYmFzZVVybCkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGJhc2VVcmwpO1xuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2Uuc3RhdHVzVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnRleHQoKTtcbiAgICB9XG59XG4iLCJleHBvcnQgY29uc3QgVmlkZW9JbmZvcm1hdGlvblJlc3BvbnNlUGFyc2UgPSAoaHRtbFN0cmluZ0RhdGEpID0+IHtcbiAgICBjb25zdCBjYXB0aW9uVHJhY2tzID0gL1xce1wiY2FwdGlvblRyYWNrc1wiOihcXFsuKj9cXF0pLC9nLmV4ZWMoaHRtbFN0cmluZ0RhdGEpO1xuICAgIGlmICghY2FwdGlvblRyYWNrcylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiTm90IGZvdW5kIGNhcHRpb24gdHJhY2sgbGlzdFwiKTtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShjYXB0aW9uVHJhY2tzWzFdKTtcbn07XG4iLCJleHBvcnQgY2xhc3MgVXJsIHtcbiAgICBjb25zdHJ1Y3Rvcih1cmwpIHtcbiAgICAgICAgdGhpcy51cmwgPSB1cmw7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIGEgdmFsdWUgZnJvbSBhIHNwZWNpZmljIHF1ZXJ5IHN0cmluZy5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gcXVlcnlcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXIgVXJsXG4gICAgICovXG4gICAgZ2V0UGFyYW0ocXVlcnkpIHtcbiAgICAgICAgcXVlcnkgPSBxdWVyeS5yZXBsYWNlKC9bW11dL2csIFwiXFxcXCQmXCIpO1xuICAgICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoXCJbPyZdXCIgKyBxdWVyeSArIFwiKD0oW14mI10qKXwmfCN8JClcIik7XG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHRoaXMudXJsKTtcbiAgICAgICAgaWYgKCFyZXN1bHRzKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVcmwgcXVlcnkgcGFyYW1ldGVyIGRvZXMgbm90IGNvbnRhaW4gdmlkZW9pZC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFyZXN1bHRzWzJdKVxuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1syXS5yZXBsYWNlKC9cXCsvZywgXCIgXCIpKTtcbiAgICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVybCB9IGZyb20gXCIuL3VybFwiO1xuaW1wb3J0IHsgQ2xpZW50WW91dHViZSB9IGZyb20gXCIuL2NsaWVudC9jbGllbnRZb3V0dWJlXCI7XG5pbXBvcnQgeyBWaWRlb0luZm9ybWF0aW9uUmVzcG9uc2VQYXJzZSB9IGZyb20gXCIuL3BhcnNlci92aWRlb0luZm9ybWF0aW9uUGFyc2VyXCI7XG5jaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gICAgY29uc3QgdmlkZW9JZCA9IG5ldyBVcmwoZG9jdW1lbnQuVVJMKS5nZXRQYXJhbShcInZcIik7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudFlvdXR1YmUoKTtcbiAgICBjbGllbnRcbiAgICAgICAgLmdldFZpZGVvSW5mb3JtYXRpb24odmlkZW9JZClcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhcHRpb25UcmFja0xpc3QgPSBWaWRlb0luZm9ybWF0aW9uUmVzcG9uc2VQYXJzZShyZXNwb25zZSk7XG4gICAgICAgIHNlbmRSZXNwb25zZSh7XG4gICAgICAgICAgICBjYXB0aW9uVHJhY2tMaXN0LFxuICAgICAgICAgICAgdmlkZW9JZCxcbiAgICAgICAgICAgIHZpZGVvVGl0bGU6IGdldFZpZGVvVGl0bGUoKSxcbiAgICAgICAgICAgIGVycm9yOiBudWxsLFxuICAgICAgICB9KTtcbiAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgc2VuZFJlc3BvbnNlKHsgZXJyb3I6IGVycm9yIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiB0cnVlO1xufSk7XG5jb25zdCBnZXRWaWRlb1RpdGxlID0gKCkgPT4ge1xuICAgIHJldHVybiBkb2N1bWVudC50aXRsZS5yZXBsYWNlKC9bK3wvP14uPD5cIjpdL2csIFwiXCIpLnJlcGxhY2UoLyAtIFlvdVR1YmUvLCBcIlwiKTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9