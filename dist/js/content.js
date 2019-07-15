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

/***/ "./src/content.ts":
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const timestamp_1 = __webpack_require__(/*! ./timestamp */ "./src/timestamp.ts");
const sentence_1 = __webpack_require__(/*! ./sentence */ "./src/sentence.ts");
const display_1 = __webpack_require__(/*! ./display */ "./src/display.ts");
console.log("check");
// 再生時間を取得する
function getPlaybackTime() {
    const playback_time = document.getElementsByClassName("ytp-time-display");
    return new timestamp_1.Timestamp(playback_time[0].textContent);
}
// key:字幕 value:timestamp の配列 Subtitleクラスにする
// exists()とか
var subtitles = {};
// 字幕を取得する
function getCaptionInnerText() {
    const caption = document.getElementsByClassName("ytp-caption-segment");
    for (let c of caption) {
        if (c.textContent) {
            const sentence = new sentence_1.Sentence(c.textContent);
            const timestamp = getPlaybackTime();
            if (!subtitles[sentence.getSentence()]) {
                subtitles[sentence.getSentence()] = timestamp.getTime();
            }
        }
    }
}
var initialize = false;
const display = new display_1.Display();
// DOM の変更を検知するオブザーバ
const observer = new MutationObserver(function () {
    if (!initialize) {
        // 表示スペースを作成
        // initialize = display.init();
    }
    // getCaptionInnerText();
    // console.log(subtitles);
    // display.setSubtitle(subtitles);
});
//監視オプションの作成
const options = {
    childList: true,
    subtree: true
};
observer.observe(document, options);


/***/ }),

/***/ "./src/display.ts":
/*!************************!*\
  !*** ./src/display.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Display {
    constructor() {
        this.elm = document.createElement("div");
        this.count = 0;
    }
    /**
     * init
     */
    init() {
        console.log("Display init!");
        let base = document.getElementById("secondary");
        // secondaryのDOMがなければreturn
        if (!base) {
            return false;
        }
        base.innerHTML = "";
        // 表示領域作成
        this.elm.setAttribute("id", "subtitle-screen");
        // 表示領域 の見栄え属性をセット
        this.elm.setAttribute("frameBorder", "1");
        this.elm.setAttribute("scrolling", "no");
        // 表示領域 の配置属性をセット
        this.elm.style.backgroundColor = "#bfbfbf";
        this.elm.style.position = "relative";
        this.elm.style.width = "500px";
        this.elm.style.height = "500px";
        // 表示領域 の内容をセット
        this.elm.innerText = "Hello, worldaaa";
        // 表示領域 を実装
        base.appendChild(this.elm);
        return true;
    }
    /**
     * setSubtitle
     */
    setSubtitle(subtitle) {
        // console.log(subtitle);
        // for (let i in subtitle) {
        //   let element = document.getElementById("subtitle-screen");
        //   if (element && this.count < 100) {
        //     element.insertAdjacentHTML("afterbegin", `<p>${i}</p>`);
        //     console.log("add");
        //     this.count++;
        //   }
        // }
    }
}
exports.Display = Display;


/***/ }),

/***/ "./src/sentence.ts":
/*!*************************!*\
  !*** ./src/sentence.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Sentence {
    constructor(sentence) {
        this.sentence = sentence;
    }
    getSentence() {
        return this.sentence;
    }
}
exports.Sentence = Sentence;


/***/ }),

/***/ "./src/timestamp.ts":
/*!**************************!*\
  !*** ./src/timestamp.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Timestamp {
    constructor(time) {
        this.time = time;
    }
    getTime() {
        return this.time;
    }
}
exports.Timestamp = Timestamp;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvbnRlbnQudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2Rpc3BsYXkudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlbnRlbmNlLnRzIiwid2VicGFjazovLy8uL3NyYy90aW1lc3RhbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQTBDLGdDQUFnQztBQUMxRTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdFQUF3RCxrQkFBa0I7QUFDMUU7QUFDQSx5REFBaUQsY0FBYztBQUMvRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQXlDLGlDQUFpQztBQUMxRSx3SEFBZ0gsbUJBQW1CLEVBQUU7QUFDckk7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7O0FBR0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVELG9CQUFvQixtQkFBTyxDQUFDLHVDQUFhO0FBQ3pDLG1CQUFtQixtQkFBTyxDQUFDLHFDQUFZO0FBQ3ZDLGtCQUFrQixtQkFBTyxDQUFDLG1DQUFXO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUM1Q2E7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxFQUFFO0FBQ2hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDakRhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDVmE7QUFDYiw4Q0FBOEMsY0FBYztBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvbnRlbnQudHNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHRpbWVzdGFtcF8xID0gcmVxdWlyZShcIi4vdGltZXN0YW1wXCIpO1xuY29uc3Qgc2VudGVuY2VfMSA9IHJlcXVpcmUoXCIuL3NlbnRlbmNlXCIpO1xuY29uc3QgZGlzcGxheV8xID0gcmVxdWlyZShcIi4vZGlzcGxheVwiKTtcbmNvbnNvbGUubG9nKFwiY2hlY2tcIik7XG4vLyDlho3nlJ/mmYLplpPjgpLlj5blvpfjgZnjgotcbmZ1bmN0aW9uIGdldFBsYXliYWNrVGltZSgpIHtcbiAgICBjb25zdCBwbGF5YmFja190aW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcInl0cC10aW1lLWRpc3BsYXlcIik7XG4gICAgcmV0dXJuIG5ldyB0aW1lc3RhbXBfMS5UaW1lc3RhbXAocGxheWJhY2tfdGltZVswXS50ZXh0Q29udGVudCk7XG59XG4vLyBrZXk65a2X5bmVIHZhbHVlOnRpbWVzdGFtcCDjga7phY3liJcgU3VidGl0bGXjgq/jg6njgrnjgavjgZnjgotcbi8vIGV4aXN0cygp44Go44GLXG52YXIgc3VidGl0bGVzID0ge307XG4vLyDlrZfluZXjgpLlj5blvpfjgZnjgotcbmZ1bmN0aW9uIGdldENhcHRpb25Jbm5lclRleHQoKSB7XG4gICAgY29uc3QgY2FwdGlvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJ5dHAtY2FwdGlvbi1zZWdtZW50XCIpO1xuICAgIGZvciAobGV0IGMgb2YgY2FwdGlvbikge1xuICAgICAgICBpZiAoYy50ZXh0Q29udGVudCkge1xuICAgICAgICAgICAgY29uc3Qgc2VudGVuY2UgPSBuZXcgc2VudGVuY2VfMS5TZW50ZW5jZShjLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IGdldFBsYXliYWNrVGltZSgpO1xuICAgICAgICAgICAgaWYgKCFzdWJ0aXRsZXNbc2VudGVuY2UuZ2V0U2VudGVuY2UoKV0pIHtcbiAgICAgICAgICAgICAgICBzdWJ0aXRsZXNbc2VudGVuY2UuZ2V0U2VudGVuY2UoKV0gPSB0aW1lc3RhbXAuZ2V0VGltZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxudmFyIGluaXRpYWxpemUgPSBmYWxzZTtcbmNvbnN0IGRpc3BsYXkgPSBuZXcgZGlzcGxheV8xLkRpc3BsYXkoKTtcbi8vIERPTSDjga7lpInmm7TjgpLmpJznn6XjgZnjgovjgqrjg5bjgrbjg7zjg5BcbmNvbnN0IG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgIGlmICghaW5pdGlhbGl6ZSkge1xuICAgICAgICAvLyDooajnpLrjgrnjg5rjg7zjgrnjgpLkvZzmiJBcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSA9IGRpc3BsYXkuaW5pdCgpO1xuICAgIH1cbiAgICAvLyBnZXRDYXB0aW9uSW5uZXJUZXh0KCk7XG4gICAgLy8gY29uc29sZS5sb2coc3VidGl0bGVzKTtcbiAgICAvLyBkaXNwbGF5LnNldFN1YnRpdGxlKHN1YnRpdGxlcyk7XG59KTtcbi8v55uj6KaW44Kq44OX44K344On44Oz44Gu5L2c5oiQXG5jb25zdCBvcHRpb25zID0ge1xuICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICBzdWJ0cmVlOiB0cnVlXG59O1xub2JzZXJ2ZXIub2JzZXJ2ZShkb2N1bWVudCwgb3B0aW9ucyk7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIERpc3BsYXkge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLmVsbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBpbml0XG4gICAgICovXG4gICAgaW5pdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJEaXNwbGF5IGluaXQhXCIpO1xuICAgICAgICBsZXQgYmFzZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic2Vjb25kYXJ5XCIpO1xuICAgICAgICAvLyBzZWNvbmRhcnnjga5ET03jgYzjgarjgZHjgozjgbByZXR1cm5cbiAgICAgICAgaWYgKCFiYXNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgYmFzZS5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAvLyDooajnpLrpoJjln5/kvZzmiJBcbiAgICAgICAgdGhpcy5lbG0uc2V0QXR0cmlidXRlKFwiaWRcIiwgXCJzdWJ0aXRsZS1zY3JlZW5cIik7XG4gICAgICAgIC8vIOihqOekuumgmOWfnyDjga7opovmoITjgYjlsZ7mgKfjgpLjgrvjg4Pjg4hcbiAgICAgICAgdGhpcy5lbG0uc2V0QXR0cmlidXRlKFwiZnJhbWVCb3JkZXJcIiwgXCIxXCIpO1xuICAgICAgICB0aGlzLmVsbS5zZXRBdHRyaWJ1dGUoXCJzY3JvbGxpbmdcIiwgXCJub1wiKTtcbiAgICAgICAgLy8g6KGo56S66aCY5Z+fIOOBrumFjee9ruWxnuaAp+OCkuOCu+ODg+ODiFxuICAgICAgICB0aGlzLmVsbS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNiZmJmYmZcIjtcbiAgICAgICAgdGhpcy5lbG0uc3R5bGUucG9zaXRpb24gPSBcInJlbGF0aXZlXCI7XG4gICAgICAgIHRoaXMuZWxtLnN0eWxlLndpZHRoID0gXCI1MDBweFwiO1xuICAgICAgICB0aGlzLmVsbS5zdHlsZS5oZWlnaHQgPSBcIjUwMHB4XCI7XG4gICAgICAgIC8vIOihqOekuumgmOWfnyDjga7lhoXlrrnjgpLjgrvjg4Pjg4hcbiAgICAgICAgdGhpcy5lbG0uaW5uZXJUZXh0ID0gXCJIZWxsbywgd29ybGRhYWFcIjtcbiAgICAgICAgLy8g6KGo56S66aCY5Z+fIOOCkuWun+ijhVxuICAgICAgICBiYXNlLmFwcGVuZENoaWxkKHRoaXMuZWxtKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHNldFN1YnRpdGxlXG4gICAgICovXG4gICAgc2V0U3VidGl0bGUoc3VidGl0bGUpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coc3VidGl0bGUpO1xuICAgICAgICAvLyBmb3IgKGxldCBpIGluIHN1YnRpdGxlKSB7XG4gICAgICAgIC8vICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1YnRpdGxlLXNjcmVlblwiKTtcbiAgICAgICAgLy8gICBpZiAoZWxlbWVudCAmJiB0aGlzLmNvdW50IDwgMTAwKSB7XG4gICAgICAgIC8vICAgICBlbGVtZW50Lmluc2VydEFkamFjZW50SFRNTChcImFmdGVyYmVnaW5cIiwgYDxwPiR7aX08L3A+YCk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImFkZFwiKTtcbiAgICAgICAgLy8gICAgIHRoaXMuY291bnQrKztcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH1cbiAgICB9XG59XG5leHBvcnRzLkRpc3BsYXkgPSBEaXNwbGF5O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBTZW50ZW5jZSB7XG4gICAgY29uc3RydWN0b3Ioc2VudGVuY2UpIHtcbiAgICAgICAgdGhpcy5zZW50ZW5jZSA9IHNlbnRlbmNlO1xuICAgIH1cbiAgICBnZXRTZW50ZW5jZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VudGVuY2U7XG4gICAgfVxufVxuZXhwb3J0cy5TZW50ZW5jZSA9IFNlbnRlbmNlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBUaW1lc3RhbXAge1xuICAgIGNvbnN0cnVjdG9yKHRpbWUpIHtcbiAgICAgICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB9XG4gICAgZ2V0VGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGltZTtcbiAgICB9XG59XG5leHBvcnRzLlRpbWVzdGFtcCA9IFRpbWVzdGFtcDtcbiJdLCJzb3VyY2VSb290IjoiIn0=