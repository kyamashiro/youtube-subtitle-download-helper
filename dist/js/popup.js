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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/popup.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/deeks/src/deeks.js":
/*!*****************************************!*\
  !*** ./node_modules/deeks/src/deeks.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const utils = __webpack_require__(/*! ./utils.js */ "./node_modules/deeks/src/utils.js");

module.exports = {
    deepKeys: deepKeys,
    deepKeysFromList: deepKeysFromList
};

/**
 * Return the deep keys list for a single document
 * @param object
 * @param options
 * @returns {Array}
 */
function deepKeys(object, options) {
    options = mergeOptions(options);
    if (utils.isObject(object)) {
        return generateDeepKeysList('', object, options);
    }
    return [];
}

/**
 * Return the deep keys list for all documents in the provided list
 * @param list
 * @param options
 * @returns Array[Array[String]]
 */
function deepKeysFromList(list, options) {
    options = mergeOptions(options);
    return list.map((document) => { // for each document
        if (utils.isObject(document)) {
            // if the data at the key is a document, then we retrieve the subHeading starting with an empty string heading and the doc
            return deepKeys(document, options);
        }
        return [];
    });
}

function generateDeepKeysList(heading, data, options) {
    let keys = Object.keys(data).map((currentKey) => {
        // If the given heading is empty, then we set the heading to be the subKey, otherwise set it as a nested heading w/ a dot
        let keyName = buildKeyName(heading, currentKey);

        // If we have another nested document, recur on the sub-document to retrieve the full key name
        if (isDocumentToRecurOn(data[currentKey])) {
            return generateDeepKeysList(keyName, data[currentKey], options);
        } else if (options.expandArrayObjects && isArrayToRecurOn(data[currentKey])) {
            // If we have a nested array that we need to recur on
            return processArrayKeys(data[currentKey], currentKey, options);
        }
        // Otherwise return this key name since we don't have a sub document
        return keyName;
    });

    return utils.flatten(keys);
}

/**
 * Helper function to handle the processing of arrays when the expandArrayObjects
 * option is specified.
 * @param subArray
 * @param currentKeyPath
 * @param options
 * @returns {*}
 */
function processArrayKeys(subArray, currentKeyPath, options) {
    let subArrayKeys = deepKeysFromList(subArray);

    if (!subArray.length) {
        return options.ignoreEmptyArraysWhenExpanding ? [] : [currentKeyPath];
    } else if (subArray.length && utils.flatten(subArrayKeys).length === 0) {
        // Has items in the array, but no objects
        return [currentKeyPath];
    } else {
        subArrayKeys = subArrayKeys.map((schemaKeys) => {
            if (isEmptyArray(schemaKeys)) {
                return [currentKeyPath];
            }
            return schemaKeys.map((subKey) => buildKeyName(currentKeyPath, subKey));
        });

        return utils.unique(utils.flatten(subArrayKeys));
    }
}

/**
 * Function used to generate the key path
 * @param upperKeyName String accumulated key path
 * @param currentKeyName String current key name
 * @returns String
 */
function buildKeyName(upperKeyName, currentKeyName) {
    if (upperKeyName) {
        return upperKeyName + '.' + currentKeyName;
    }
    return currentKeyName;
}

/**
 * Returns whether this value is a document to recur on or not
 * @param val Any item whose type will be evaluated
 * @returns {boolean}
 */
function isDocumentToRecurOn(val) {
    return utils.isObject(val) && !utils.isNull(val) && !Array.isArray(val) && Object.keys(val).length;
}

/**
 * Returns whether this value is an array to recur on or not
 * @param val Any item whose type will be evaluated
 * @returns {boolean}
 */
function isArrayToRecurOn(val) {
    return Array.isArray(val);
}

/**
 * Helper function that determines whether or not a value is an empty array
 * @param val
 * @returns {boolean}
 */
function isEmptyArray(val) {
    return Array.isArray(val) && !val.length;
}

function mergeOptions(options) {
    return {
        expandArrayObjects: false,
        ignoreEmptyArraysWhenExpanding: false,
        ...options || {}
    };
}


/***/ }),

/***/ "./node_modules/deeks/src/utils.js":
/*!*****************************************!*\
  !*** ./node_modules/deeks/src/utils.js ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    // underscore replacements:
    isString,
    isNull,
    isError,
    isDate,
    isFunction,
    isUndefined,
    isObject,
    unique,
    flatten
};

/*
 * Helper functions which were created to remove underscorejs from this package.
 */

function isString(value) {
    return typeof value === 'string';
}

function isObject(value) {
    return typeof value === 'object';
}

function isFunction(value) {
    return typeof value === 'function';
}

function isNull(value) {
    return value === null;
}

function isDate(value) {
    return value instanceof Date;
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

function isError(value) {
    return Object.prototype.toString.call(value) === '[object Error]';
}

function unique(array) {
    return [...new Set(array)];
}

function flatten(array) {
    return [].concat(...array);
}


/***/ }),

/***/ "./node_modules/doc-path/src/path.js":
/*!*******************************************!*\
  !*** ./node_modules/doc-path/src/path.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
    evaluatePath,
    setPath
};

function evaluatePath(document, keyPath) {
    if (!document) {
        return null;
    }

    let {indexOfDot, currentKey, remainingKeyPath} = computeStateInformation(keyPath);

    // If there is a '.' in the keyPath and keyPath doesn't appear in the document, recur on the subdocument
    if (indexOfDot >= 0 && !document[keyPath]) {
        // If there's an array at the currentKey in the document, then iterate over those items evaluating the remaining path
        if (Array.isArray(document[currentKey])) {
            return document[currentKey].map((doc) => evaluatePath(doc, remainingKeyPath));
        }
        // Otherwise, we can just recur
        return evaluatePath(document[currentKey], remainingKeyPath);
    } else if (Array.isArray(document)) {
        // If this "document" is actually an array, then iterate over those items evaluating the path
        return document.map((doc) => evaluatePath(doc, keyPath));
    }

    // Otherwise, we can just return value directly
    return document[keyPath];
}

function setPath(document, keyPath, value) {
    if (!document) {
        throw new Error('No document was provided.');
    }

    let {indexOfDot, currentKey, remainingKeyPath} = computeStateInformation(keyPath);

    // If there is a '.' in the keyPath, recur on the subdoc and ...
    if (indexOfDot >= 0) {
        if (!document[currentKey] && Array.isArray(document)) {
            // If this is an array and there are multiple levels of keys to iterate over, recur.
            return document.forEach((doc) => setPath(doc, keyPath, value));
        } else if (!document[currentKey]) {
            // If the currentKey doesn't exist yet, populate it
            document[currentKey] = {};
        }
        setPath(document[currentKey], remainingKeyPath, value);
    } else if (Array.isArray(document)) {
        // If this "document" is actually an array, then we can loop over each of the values and set the path
        return document.forEach((doc) => setPath(doc, remainingKeyPath, value));
    } else {
        // Otherwise, we can set the path directly
        document[keyPath] = value;
    }

    return document;
}

/**
 * Helper function that returns some information necessary to evaluate or set a path
 *   based on the provided keyPath value
 * @param keyPath
 * @returns {{indexOfDot: Number, currentKey: String, remainingKeyPath: String}}
 */
function computeStateInformation(keyPath) {
    let indexOfDot = keyPath.indexOf('.');

    return {
        indexOfDot,
        currentKey: keyPath.slice(0, indexOfDot >= 0 ? indexOfDot : undefined),
        remainingKeyPath: keyPath.slice(indexOfDot + 1)
    };
}


/***/ }),

/***/ "./node_modules/he/he.js":
/*!*******************************!*\
  !*** ./node_modules/he/he.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/he v1.2.0 by @mathias | MIT license */
;(function(root) {

	// Detect free variables `exports`.
	var freeExports =  true && exports;

	// Detect free variable `module`.
	var freeModule =  true && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`.
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	// All astral symbols.
	var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
	// All ASCII symbols (not just printable ASCII) except those listed in the
	// first column of the overrides table.
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
	var regexAsciiWhitelist = /[\x01-\x7F]/g;
	// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
	// code points listed in the first column of the overrides table on
	// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides.
	var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;

	var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
	var encodeMap = {'\xAD':'shy','\u200C':'zwnj','\u200D':'zwj','\u200E':'lrm','\u2063':'ic','\u2062':'it','\u2061':'af','\u200F':'rlm','\u200B':'ZeroWidthSpace','\u2060':'NoBreak','\u0311':'DownBreve','\u20DB':'tdot','\u20DC':'DotDot','\t':'Tab','\n':'NewLine','\u2008':'puncsp','\u205F':'MediumSpace','\u2009':'thinsp','\u200A':'hairsp','\u2004':'emsp13','\u2002':'ensp','\u2005':'emsp14','\u2003':'emsp','\u2007':'numsp','\xA0':'nbsp','\u205F\u200A':'ThickSpace','\u203E':'oline','_':'lowbar','\u2010':'dash','\u2013':'ndash','\u2014':'mdash','\u2015':'horbar',',':'comma',';':'semi','\u204F':'bsemi',':':'colon','\u2A74':'Colone','!':'excl','\xA1':'iexcl','?':'quest','\xBF':'iquest','.':'period','\u2025':'nldr','\u2026':'mldr','\xB7':'middot','\'':'apos','\u2018':'lsquo','\u2019':'rsquo','\u201A':'sbquo','\u2039':'lsaquo','\u203A':'rsaquo','"':'quot','\u201C':'ldquo','\u201D':'rdquo','\u201E':'bdquo','\xAB':'laquo','\xBB':'raquo','(':'lpar',')':'rpar','[':'lsqb',']':'rsqb','{':'lcub','}':'rcub','\u2308':'lceil','\u2309':'rceil','\u230A':'lfloor','\u230B':'rfloor','\u2985':'lopar','\u2986':'ropar','\u298B':'lbrke','\u298C':'rbrke','\u298D':'lbrkslu','\u298E':'rbrksld','\u298F':'lbrksld','\u2990':'rbrkslu','\u2991':'langd','\u2992':'rangd','\u2993':'lparlt','\u2994':'rpargt','\u2995':'gtlPar','\u2996':'ltrPar','\u27E6':'lobrk','\u27E7':'robrk','\u27E8':'lang','\u27E9':'rang','\u27EA':'Lang','\u27EB':'Rang','\u27EC':'loang','\u27ED':'roang','\u2772':'lbbrk','\u2773':'rbbrk','\u2016':'Vert','\xA7':'sect','\xB6':'para','@':'commat','*':'ast','/':'sol','undefined':null,'&':'amp','#':'num','%':'percnt','\u2030':'permil','\u2031':'pertenk','\u2020':'dagger','\u2021':'Dagger','\u2022':'bull','\u2043':'hybull','\u2032':'prime','\u2033':'Prime','\u2034':'tprime','\u2057':'qprime','\u2035':'bprime','\u2041':'caret','`':'grave','\xB4':'acute','\u02DC':'tilde','^':'Hat','\xAF':'macr','\u02D8':'breve','\u02D9':'dot','\xA8':'die','\u02DA':'ring','\u02DD':'dblac','\xB8':'cedil','\u02DB':'ogon','\u02C6':'circ','\u02C7':'caron','\xB0':'deg','\xA9':'copy','\xAE':'reg','\u2117':'copysr','\u2118':'wp','\u211E':'rx','\u2127':'mho','\u2129':'iiota','\u2190':'larr','\u219A':'nlarr','\u2192':'rarr','\u219B':'nrarr','\u2191':'uarr','\u2193':'darr','\u2194':'harr','\u21AE':'nharr','\u2195':'varr','\u2196':'nwarr','\u2197':'nearr','\u2198':'searr','\u2199':'swarr','\u219D':'rarrw','\u219D\u0338':'nrarrw','\u219E':'Larr','\u219F':'Uarr','\u21A0':'Rarr','\u21A1':'Darr','\u21A2':'larrtl','\u21A3':'rarrtl','\u21A4':'mapstoleft','\u21A5':'mapstoup','\u21A6':'map','\u21A7':'mapstodown','\u21A9':'larrhk','\u21AA':'rarrhk','\u21AB':'larrlp','\u21AC':'rarrlp','\u21AD':'harrw','\u21B0':'lsh','\u21B1':'rsh','\u21B2':'ldsh','\u21B3':'rdsh','\u21B5':'crarr','\u21B6':'cularr','\u21B7':'curarr','\u21BA':'olarr','\u21BB':'orarr','\u21BC':'lharu','\u21BD':'lhard','\u21BE':'uharr','\u21BF':'uharl','\u21C0':'rharu','\u21C1':'rhard','\u21C2':'dharr','\u21C3':'dharl','\u21C4':'rlarr','\u21C5':'udarr','\u21C6':'lrarr','\u21C7':'llarr','\u21C8':'uuarr','\u21C9':'rrarr','\u21CA':'ddarr','\u21CB':'lrhar','\u21CC':'rlhar','\u21D0':'lArr','\u21CD':'nlArr','\u21D1':'uArr','\u21D2':'rArr','\u21CF':'nrArr','\u21D3':'dArr','\u21D4':'iff','\u21CE':'nhArr','\u21D5':'vArr','\u21D6':'nwArr','\u21D7':'neArr','\u21D8':'seArr','\u21D9':'swArr','\u21DA':'lAarr','\u21DB':'rAarr','\u21DD':'zigrarr','\u21E4':'larrb','\u21E5':'rarrb','\u21F5':'duarr','\u21FD':'loarr','\u21FE':'roarr','\u21FF':'hoarr','\u2200':'forall','\u2201':'comp','\u2202':'part','\u2202\u0338':'npart','\u2203':'exist','\u2204':'nexist','\u2205':'empty','\u2207':'Del','\u2208':'in','\u2209':'notin','\u220B':'ni','\u220C':'notni','\u03F6':'bepsi','\u220F':'prod','\u2210':'coprod','\u2211':'sum','+':'plus','\xB1':'pm','\xF7':'div','\xD7':'times','<':'lt','\u226E':'nlt','<\u20D2':'nvlt','=':'equals','\u2260':'ne','=\u20E5':'bne','\u2A75':'Equal','>':'gt','\u226F':'ngt','>\u20D2':'nvgt','\xAC':'not','|':'vert','\xA6':'brvbar','\u2212':'minus','\u2213':'mp','\u2214':'plusdo','\u2044':'frasl','\u2216':'setmn','\u2217':'lowast','\u2218':'compfn','\u221A':'Sqrt','\u221D':'prop','\u221E':'infin','\u221F':'angrt','\u2220':'ang','\u2220\u20D2':'nang','\u2221':'angmsd','\u2222':'angsph','\u2223':'mid','\u2224':'nmid','\u2225':'par','\u2226':'npar','\u2227':'and','\u2228':'or','\u2229':'cap','\u2229\uFE00':'caps','\u222A':'cup','\u222A\uFE00':'cups','\u222B':'int','\u222C':'Int','\u222D':'tint','\u2A0C':'qint','\u222E':'oint','\u222F':'Conint','\u2230':'Cconint','\u2231':'cwint','\u2232':'cwconint','\u2233':'awconint','\u2234':'there4','\u2235':'becaus','\u2236':'ratio','\u2237':'Colon','\u2238':'minusd','\u223A':'mDDot','\u223B':'homtht','\u223C':'sim','\u2241':'nsim','\u223C\u20D2':'nvsim','\u223D':'bsim','\u223D\u0331':'race','\u223E':'ac','\u223E\u0333':'acE','\u223F':'acd','\u2240':'wr','\u2242':'esim','\u2242\u0338':'nesim','\u2243':'sime','\u2244':'nsime','\u2245':'cong','\u2247':'ncong','\u2246':'simne','\u2248':'ap','\u2249':'nap','\u224A':'ape','\u224B':'apid','\u224B\u0338':'napid','\u224C':'bcong','\u224D':'CupCap','\u226D':'NotCupCap','\u224D\u20D2':'nvap','\u224E':'bump','\u224E\u0338':'nbump','\u224F':'bumpe','\u224F\u0338':'nbumpe','\u2250':'doteq','\u2250\u0338':'nedot','\u2251':'eDot','\u2252':'efDot','\u2253':'erDot','\u2254':'colone','\u2255':'ecolon','\u2256':'ecir','\u2257':'cire','\u2259':'wedgeq','\u225A':'veeeq','\u225C':'trie','\u225F':'equest','\u2261':'equiv','\u2262':'nequiv','\u2261\u20E5':'bnequiv','\u2264':'le','\u2270':'nle','\u2264\u20D2':'nvle','\u2265':'ge','\u2271':'nge','\u2265\u20D2':'nvge','\u2266':'lE','\u2266\u0338':'nlE','\u2267':'gE','\u2267\u0338':'ngE','\u2268\uFE00':'lvnE','\u2268':'lnE','\u2269':'gnE','\u2269\uFE00':'gvnE','\u226A':'ll','\u226A\u0338':'nLtv','\u226A\u20D2':'nLt','\u226B':'gg','\u226B\u0338':'nGtv','\u226B\u20D2':'nGt','\u226C':'twixt','\u2272':'lsim','\u2274':'nlsim','\u2273':'gsim','\u2275':'ngsim','\u2276':'lg','\u2278':'ntlg','\u2277':'gl','\u2279':'ntgl','\u227A':'pr','\u2280':'npr','\u227B':'sc','\u2281':'nsc','\u227C':'prcue','\u22E0':'nprcue','\u227D':'sccue','\u22E1':'nsccue','\u227E':'prsim','\u227F':'scsim','\u227F\u0338':'NotSucceedsTilde','\u2282':'sub','\u2284':'nsub','\u2282\u20D2':'vnsub','\u2283':'sup','\u2285':'nsup','\u2283\u20D2':'vnsup','\u2286':'sube','\u2288':'nsube','\u2287':'supe','\u2289':'nsupe','\u228A\uFE00':'vsubne','\u228A':'subne','\u228B\uFE00':'vsupne','\u228B':'supne','\u228D':'cupdot','\u228E':'uplus','\u228F':'sqsub','\u228F\u0338':'NotSquareSubset','\u2290':'sqsup','\u2290\u0338':'NotSquareSuperset','\u2291':'sqsube','\u22E2':'nsqsube','\u2292':'sqsupe','\u22E3':'nsqsupe','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u2295':'oplus','\u2296':'ominus','\u2297':'otimes','\u2298':'osol','\u2299':'odot','\u229A':'ocir','\u229B':'oast','\u229D':'odash','\u229E':'plusb','\u229F':'minusb','\u22A0':'timesb','\u22A1':'sdotb','\u22A2':'vdash','\u22AC':'nvdash','\u22A3':'dashv','\u22A4':'top','\u22A5':'bot','\u22A7':'models','\u22A8':'vDash','\u22AD':'nvDash','\u22A9':'Vdash','\u22AE':'nVdash','\u22AA':'Vvdash','\u22AB':'VDash','\u22AF':'nVDash','\u22B0':'prurel','\u22B2':'vltri','\u22EA':'nltri','\u22B3':'vrtri','\u22EB':'nrtri','\u22B4':'ltrie','\u22EC':'nltrie','\u22B4\u20D2':'nvltrie','\u22B5':'rtrie','\u22ED':'nrtrie','\u22B5\u20D2':'nvrtrie','\u22B6':'origof','\u22B7':'imof','\u22B8':'mumap','\u22B9':'hercon','\u22BA':'intcal','\u22BB':'veebar','\u22BD':'barvee','\u22BE':'angrtvb','\u22BF':'lrtri','\u22C0':'Wedge','\u22C1':'Vee','\u22C2':'xcap','\u22C3':'xcup','\u22C4':'diam','\u22C5':'sdot','\u22C6':'Star','\u22C7':'divonx','\u22C8':'bowtie','\u22C9':'ltimes','\u22CA':'rtimes','\u22CB':'lthree','\u22CC':'rthree','\u22CD':'bsime','\u22CE':'cuvee','\u22CF':'cuwed','\u22D0':'Sub','\u22D1':'Sup','\u22D2':'Cap','\u22D3':'Cup','\u22D4':'fork','\u22D5':'epar','\u22D6':'ltdot','\u22D7':'gtdot','\u22D8':'Ll','\u22D8\u0338':'nLl','\u22D9':'Gg','\u22D9\u0338':'nGg','\u22DA\uFE00':'lesg','\u22DA':'leg','\u22DB':'gel','\u22DB\uFE00':'gesl','\u22DE':'cuepr','\u22DF':'cuesc','\u22E6':'lnsim','\u22E7':'gnsim','\u22E8':'prnsim','\u22E9':'scnsim','\u22EE':'vellip','\u22EF':'ctdot','\u22F0':'utdot','\u22F1':'dtdot','\u22F2':'disin','\u22F3':'isinsv','\u22F4':'isins','\u22F5':'isindot','\u22F5\u0338':'notindot','\u22F6':'notinvc','\u22F7':'notinvb','\u22F9':'isinE','\u22F9\u0338':'notinE','\u22FA':'nisd','\u22FB':'xnis','\u22FC':'nis','\u22FD':'notnivc','\u22FE':'notnivb','\u2305':'barwed','\u2306':'Barwed','\u230C':'drcrop','\u230D':'dlcrop','\u230E':'urcrop','\u230F':'ulcrop','\u2310':'bnot','\u2312':'profline','\u2313':'profsurf','\u2315':'telrec','\u2316':'target','\u231C':'ulcorn','\u231D':'urcorn','\u231E':'dlcorn','\u231F':'drcorn','\u2322':'frown','\u2323':'smile','\u232D':'cylcty','\u232E':'profalar','\u2336':'topbot','\u233D':'ovbar','\u233F':'solbar','\u237C':'angzarr','\u23B0':'lmoust','\u23B1':'rmoust','\u23B4':'tbrk','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u23DC':'OverParenthesis','\u23DD':'UnderParenthesis','\u23DE':'OverBrace','\u23DF':'UnderBrace','\u23E2':'trpezium','\u23E7':'elinters','\u2423':'blank','\u2500':'boxh','\u2502':'boxv','\u250C':'boxdr','\u2510':'boxdl','\u2514':'boxur','\u2518':'boxul','\u251C':'boxvr','\u2524':'boxvl','\u252C':'boxhd','\u2534':'boxhu','\u253C':'boxvh','\u2550':'boxH','\u2551':'boxV','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2580':'uhblk','\u2584':'lhblk','\u2588':'block','\u2591':'blk14','\u2592':'blk12','\u2593':'blk34','\u25A1':'squ','\u25AA':'squf','\u25AB':'EmptyVerySmallSquare','\u25AD':'rect','\u25AE':'marker','\u25B1':'fltns','\u25B3':'xutri','\u25B4':'utrif','\u25B5':'utri','\u25B8':'rtrif','\u25B9':'rtri','\u25BD':'xdtri','\u25BE':'dtrif','\u25BF':'dtri','\u25C2':'ltrif','\u25C3':'ltri','\u25CA':'loz','\u25CB':'cir','\u25EC':'tridot','\u25EF':'xcirc','\u25F8':'ultri','\u25F9':'urtri','\u25FA':'lltri','\u25FB':'EmptySmallSquare','\u25FC':'FilledSmallSquare','\u2605':'starf','\u2606':'star','\u260E':'phone','\u2640':'female','\u2642':'male','\u2660':'spades','\u2663':'clubs','\u2665':'hearts','\u2666':'diams','\u266A':'sung','\u2713':'check','\u2717':'cross','\u2720':'malt','\u2736':'sext','\u2758':'VerticalSeparator','\u27C8':'bsolhsub','\u27C9':'suphsol','\u27F5':'xlarr','\u27F6':'xrarr','\u27F7':'xharr','\u27F8':'xlArr','\u27F9':'xrArr','\u27FA':'xhArr','\u27FC':'xmap','\u27FF':'dzigrarr','\u2902':'nvlArr','\u2903':'nvrArr','\u2904':'nvHarr','\u2905':'Map','\u290C':'lbarr','\u290D':'rbarr','\u290E':'lBarr','\u290F':'rBarr','\u2910':'RBarr','\u2911':'DDotrahd','\u2912':'UpArrowBar','\u2913':'DownArrowBar','\u2916':'Rarrtl','\u2919':'latail','\u291A':'ratail','\u291B':'lAtail','\u291C':'rAtail','\u291D':'larrfs','\u291E':'rarrfs','\u291F':'larrbfs','\u2920':'rarrbfs','\u2923':'nwarhk','\u2924':'nearhk','\u2925':'searhk','\u2926':'swarhk','\u2927':'nwnear','\u2928':'toea','\u2929':'tosa','\u292A':'swnwar','\u2933':'rarrc','\u2933\u0338':'nrarrc','\u2935':'cudarrr','\u2936':'ldca','\u2937':'rdca','\u2938':'cudarrl','\u2939':'larrpl','\u293C':'curarrm','\u293D':'cularrp','\u2945':'rarrpl','\u2948':'harrcir','\u2949':'Uarrocir','\u294A':'lurdshar','\u294B':'ldrushar','\u294E':'LeftRightVector','\u294F':'RightUpDownVector','\u2950':'DownLeftRightVector','\u2951':'LeftUpDownVector','\u2952':'LeftVectorBar','\u2953':'RightVectorBar','\u2954':'RightUpVectorBar','\u2955':'RightDownVectorBar','\u2956':'DownLeftVectorBar','\u2957':'DownRightVectorBar','\u2958':'LeftUpVectorBar','\u2959':'LeftDownVectorBar','\u295A':'LeftTeeVector','\u295B':'RightTeeVector','\u295C':'RightUpTeeVector','\u295D':'RightDownTeeVector','\u295E':'DownLeftTeeVector','\u295F':'DownRightTeeVector','\u2960':'LeftUpTeeVector','\u2961':'LeftDownTeeVector','\u2962':'lHar','\u2963':'uHar','\u2964':'rHar','\u2965':'dHar','\u2966':'luruhar','\u2967':'ldrdhar','\u2968':'ruluhar','\u2969':'rdldhar','\u296A':'lharul','\u296B':'llhard','\u296C':'rharul','\u296D':'lrhard','\u296E':'udhar','\u296F':'duhar','\u2970':'RoundImplies','\u2971':'erarr','\u2972':'simrarr','\u2973':'larrsim','\u2974':'rarrsim','\u2975':'rarrap','\u2976':'ltlarr','\u2978':'gtrarr','\u2979':'subrarr','\u297B':'suplarr','\u297C':'lfisht','\u297D':'rfisht','\u297E':'ufisht','\u297F':'dfisht','\u299A':'vzigzag','\u299C':'vangrt','\u299D':'angrtvbd','\u29A4':'ange','\u29A5':'range','\u29A6':'dwangle','\u29A7':'uwangle','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u29B0':'bemptyv','\u29B1':'demptyv','\u29B2':'cemptyv','\u29B3':'raemptyv','\u29B4':'laemptyv','\u29B5':'ohbar','\u29B6':'omid','\u29B7':'opar','\u29B9':'operp','\u29BB':'olcross','\u29BC':'odsold','\u29BE':'olcir','\u29BF':'ofcir','\u29C0':'olt','\u29C1':'ogt','\u29C2':'cirscir','\u29C3':'cirE','\u29C4':'solb','\u29C5':'bsolb','\u29C9':'boxbox','\u29CD':'trisb','\u29CE':'rtriltri','\u29CF':'LeftTriangleBar','\u29CF\u0338':'NotLeftTriangleBar','\u29D0':'RightTriangleBar','\u29D0\u0338':'NotRightTriangleBar','\u29DC':'iinfin','\u29DD':'infintie','\u29DE':'nvinfin','\u29E3':'eparsl','\u29E4':'smeparsl','\u29E5':'eqvparsl','\u29EB':'lozf','\u29F4':'RuleDelayed','\u29F6':'dsol','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A04':'xuplus','\u2A06':'xsqcup','\u2A0D':'fpartint','\u2A10':'cirfnint','\u2A11':'awint','\u2A12':'rppolint','\u2A13':'scpolint','\u2A14':'npolint','\u2A15':'pointint','\u2A16':'quatint','\u2A17':'intlarhk','\u2A22':'pluscir','\u2A23':'plusacir','\u2A24':'simplus','\u2A25':'plusdu','\u2A26':'plussim','\u2A27':'plustwo','\u2A29':'mcomma','\u2A2A':'minusdu','\u2A2D':'loplus','\u2A2E':'roplus','\u2A2F':'Cross','\u2A30':'timesd','\u2A31':'timesbar','\u2A33':'smashp','\u2A34':'lotimes','\u2A35':'rotimes','\u2A36':'otimesas','\u2A37':'Otimes','\u2A38':'odiv','\u2A39':'triplus','\u2A3A':'triminus','\u2A3B':'tritime','\u2A3C':'iprod','\u2A3F':'amalg','\u2A40':'capdot','\u2A42':'ncup','\u2A43':'ncap','\u2A44':'capand','\u2A45':'cupor','\u2A46':'cupcap','\u2A47':'capcup','\u2A48':'cupbrcap','\u2A49':'capbrcup','\u2A4A':'cupcup','\u2A4B':'capcap','\u2A4C':'ccups','\u2A4D':'ccaps','\u2A50':'ccupssm','\u2A53':'And','\u2A54':'Or','\u2A55':'andand','\u2A56':'oror','\u2A57':'orslope','\u2A58':'andslope','\u2A5A':'andv','\u2A5B':'orv','\u2A5C':'andd','\u2A5D':'ord','\u2A5F':'wedbar','\u2A66':'sdote','\u2A6A':'simdot','\u2A6D':'congdot','\u2A6D\u0338':'ncongdot','\u2A6E':'easter','\u2A6F':'apacir','\u2A70':'apE','\u2A70\u0338':'napE','\u2A71':'eplus','\u2A72':'pluse','\u2A73':'Esim','\u2A77':'eDDot','\u2A78':'equivDD','\u2A79':'ltcir','\u2A7A':'gtcir','\u2A7B':'ltquest','\u2A7C':'gtquest','\u2A7D':'les','\u2A7D\u0338':'nles','\u2A7E':'ges','\u2A7E\u0338':'nges','\u2A7F':'lesdot','\u2A80':'gesdot','\u2A81':'lesdoto','\u2A82':'gesdoto','\u2A83':'lesdotor','\u2A84':'gesdotol','\u2A85':'lap','\u2A86':'gap','\u2A87':'lne','\u2A88':'gne','\u2A89':'lnap','\u2A8A':'gnap','\u2A8B':'lEg','\u2A8C':'gEl','\u2A8D':'lsime','\u2A8E':'gsime','\u2A8F':'lsimg','\u2A90':'gsiml','\u2A91':'lgE','\u2A92':'glE','\u2A93':'lesges','\u2A94':'gesles','\u2A95':'els','\u2A96':'egs','\u2A97':'elsdot','\u2A98':'egsdot','\u2A99':'el','\u2A9A':'eg','\u2A9D':'siml','\u2A9E':'simg','\u2A9F':'simlE','\u2AA0':'simgE','\u2AA1':'LessLess','\u2AA1\u0338':'NotNestedLessLess','\u2AA2':'GreaterGreater','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA4':'glj','\u2AA5':'gla','\u2AA6':'ltcc','\u2AA7':'gtcc','\u2AA8':'lescc','\u2AA9':'gescc','\u2AAA':'smt','\u2AAB':'lat','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u2AAD':'late','\u2AAD\uFE00':'lates','\u2AAE':'bumpE','\u2AAF':'pre','\u2AAF\u0338':'npre','\u2AB0':'sce','\u2AB0\u0338':'nsce','\u2AB3':'prE','\u2AB4':'scE','\u2AB5':'prnE','\u2AB6':'scnE','\u2AB7':'prap','\u2AB8':'scap','\u2AB9':'prnap','\u2ABA':'scnap','\u2ABB':'Pr','\u2ABC':'Sc','\u2ABD':'subdot','\u2ABE':'supdot','\u2ABF':'subplus','\u2AC0':'supplus','\u2AC1':'submult','\u2AC2':'supmult','\u2AC3':'subedot','\u2AC4':'supedot','\u2AC5':'subE','\u2AC5\u0338':'nsubE','\u2AC6':'supE','\u2AC6\u0338':'nsupE','\u2AC7':'subsim','\u2AC8':'supsim','\u2ACB\uFE00':'vsubnE','\u2ACB':'subnE','\u2ACC\uFE00':'vsupnE','\u2ACC':'supnE','\u2ACF':'csub','\u2AD0':'csup','\u2AD1':'csube','\u2AD2':'csupe','\u2AD3':'subsup','\u2AD4':'supsub','\u2AD5':'subsub','\u2AD6':'supsup','\u2AD7':'suphsub','\u2AD8':'supdsub','\u2AD9':'forkv','\u2ADA':'topfork','\u2ADB':'mlcp','\u2AE4':'Dashv','\u2AE6':'Vdashl','\u2AE7':'Barv','\u2AE8':'vBar','\u2AE9':'vBarv','\u2AEB':'Vbar','\u2AEC':'Not','\u2AED':'bNot','\u2AEE':'rnmid','\u2AEF':'cirmid','\u2AF0':'midcir','\u2AF1':'topcir','\u2AF2':'nhpar','\u2AF3':'parsim','\u2AFD':'parsl','\u2AFD\u20E5':'nparsl','\u266D':'flat','\u266E':'natur','\u266F':'sharp','\xA4':'curren','\xA2':'cent','$':'dollar','\xA3':'pound','\xA5':'yen','\u20AC':'euro','\xB9':'sup1','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\xB2':'sup2','\u2154':'frac23','\u2156':'frac25','\xB3':'sup3','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\uD835\uDCB6':'ascr','\uD835\uDD52':'aopf','\uD835\uDD1E':'afr','\uD835\uDD38':'Aopf','\uD835\uDD04':'Afr','\uD835\uDC9C':'Ascr','\xAA':'ordf','\xE1':'aacute','\xC1':'Aacute','\xE0':'agrave','\xC0':'Agrave','\u0103':'abreve','\u0102':'Abreve','\xE2':'acirc','\xC2':'Acirc','\xE5':'aring','\xC5':'angst','\xE4':'auml','\xC4':'Auml','\xE3':'atilde','\xC3':'Atilde','\u0105':'aogon','\u0104':'Aogon','\u0101':'amacr','\u0100':'Amacr','\xE6':'aelig','\xC6':'AElig','\uD835\uDCB7':'bscr','\uD835\uDD53':'bopf','\uD835\uDD1F':'bfr','\uD835\uDD39':'Bopf','\u212C':'Bscr','\uD835\uDD05':'Bfr','\uD835\uDD20':'cfr','\uD835\uDCB8':'cscr','\uD835\uDD54':'copf','\u212D':'Cfr','\uD835\uDC9E':'Cscr','\u2102':'Copf','\u0107':'cacute','\u0106':'Cacute','\u0109':'ccirc','\u0108':'Ccirc','\u010D':'ccaron','\u010C':'Ccaron','\u010B':'cdot','\u010A':'Cdot','\xE7':'ccedil','\xC7':'Ccedil','\u2105':'incare','\uD835\uDD21':'dfr','\u2146':'dd','\uD835\uDD55':'dopf','\uD835\uDCB9':'dscr','\uD835\uDC9F':'Dscr','\uD835\uDD07':'Dfr','\u2145':'DD','\uD835\uDD3B':'Dopf','\u010F':'dcaron','\u010E':'Dcaron','\u0111':'dstrok','\u0110':'Dstrok','\xF0':'eth','\xD0':'ETH','\u2147':'ee','\u212F':'escr','\uD835\uDD22':'efr','\uD835\uDD56':'eopf','\u2130':'Escr','\uD835\uDD08':'Efr','\uD835\uDD3C':'Eopf','\xE9':'eacute','\xC9':'Eacute','\xE8':'egrave','\xC8':'Egrave','\xEA':'ecirc','\xCA':'Ecirc','\u011B':'ecaron','\u011A':'Ecaron','\xEB':'euml','\xCB':'Euml','\u0117':'edot','\u0116':'Edot','\u0119':'eogon','\u0118':'Eogon','\u0113':'emacr','\u0112':'Emacr','\uD835\uDD23':'ffr','\uD835\uDD57':'fopf','\uD835\uDCBB':'fscr','\uD835\uDD09':'Ffr','\uD835\uDD3D':'Fopf','\u2131':'Fscr','\uFB00':'fflig','\uFB03':'ffilig','\uFB04':'ffllig','\uFB01':'filig','fj':'fjlig','\uFB02':'fllig','\u0192':'fnof','\u210A':'gscr','\uD835\uDD58':'gopf','\uD835\uDD24':'gfr','\uD835\uDCA2':'Gscr','\uD835\uDD3E':'Gopf','\uD835\uDD0A':'Gfr','\u01F5':'gacute','\u011F':'gbreve','\u011E':'Gbreve','\u011D':'gcirc','\u011C':'Gcirc','\u0121':'gdot','\u0120':'Gdot','\u0122':'Gcedil','\uD835\uDD25':'hfr','\u210E':'planckh','\uD835\uDCBD':'hscr','\uD835\uDD59':'hopf','\u210B':'Hscr','\u210C':'Hfr','\u210D':'Hopf','\u0125':'hcirc','\u0124':'Hcirc','\u210F':'hbar','\u0127':'hstrok','\u0126':'Hstrok','\uD835\uDD5A':'iopf','\uD835\uDD26':'ifr','\uD835\uDCBE':'iscr','\u2148':'ii','\uD835\uDD40':'Iopf','\u2110':'Iscr','\u2111':'Im','\xED':'iacute','\xCD':'Iacute','\xEC':'igrave','\xCC':'Igrave','\xEE':'icirc','\xCE':'Icirc','\xEF':'iuml','\xCF':'Iuml','\u0129':'itilde','\u0128':'Itilde','\u0130':'Idot','\u012F':'iogon','\u012E':'Iogon','\u012B':'imacr','\u012A':'Imacr','\u0133':'ijlig','\u0132':'IJlig','\u0131':'imath','\uD835\uDCBF':'jscr','\uD835\uDD5B':'jopf','\uD835\uDD27':'jfr','\uD835\uDCA5':'Jscr','\uD835\uDD0D':'Jfr','\uD835\uDD41':'Jopf','\u0135':'jcirc','\u0134':'Jcirc','\u0237':'jmath','\uD835\uDD5C':'kopf','\uD835\uDCC0':'kscr','\uD835\uDD28':'kfr','\uD835\uDCA6':'Kscr','\uD835\uDD42':'Kopf','\uD835\uDD0E':'Kfr','\u0137':'kcedil','\u0136':'Kcedil','\uD835\uDD29':'lfr','\uD835\uDCC1':'lscr','\u2113':'ell','\uD835\uDD5D':'lopf','\u2112':'Lscr','\uD835\uDD0F':'Lfr','\uD835\uDD43':'Lopf','\u013A':'lacute','\u0139':'Lacute','\u013E':'lcaron','\u013D':'Lcaron','\u013C':'lcedil','\u013B':'Lcedil','\u0142':'lstrok','\u0141':'Lstrok','\u0140':'lmidot','\u013F':'Lmidot','\uD835\uDD2A':'mfr','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\uD835\uDD10':'Mfr','\uD835\uDD44':'Mopf','\u2133':'Mscr','\uD835\uDD2B':'nfr','\uD835\uDD5F':'nopf','\uD835\uDCC3':'nscr','\u2115':'Nopf','\uD835\uDCA9':'Nscr','\uD835\uDD11':'Nfr','\u0144':'nacute','\u0143':'Nacute','\u0148':'ncaron','\u0147':'Ncaron','\xF1':'ntilde','\xD1':'Ntilde','\u0146':'ncedil','\u0145':'Ncedil','\u2116':'numero','\u014B':'eng','\u014A':'ENG','\uD835\uDD60':'oopf','\uD835\uDD2C':'ofr','\u2134':'oscr','\uD835\uDCAA':'Oscr','\uD835\uDD12':'Ofr','\uD835\uDD46':'Oopf','\xBA':'ordm','\xF3':'oacute','\xD3':'Oacute','\xF2':'ograve','\xD2':'Ograve','\xF4':'ocirc','\xD4':'Ocirc','\xF6':'ouml','\xD6':'Ouml','\u0151':'odblac','\u0150':'Odblac','\xF5':'otilde','\xD5':'Otilde','\xF8':'oslash','\xD8':'Oslash','\u014D':'omacr','\u014C':'Omacr','\u0153':'oelig','\u0152':'OElig','\uD835\uDD2D':'pfr','\uD835\uDCC5':'pscr','\uD835\uDD61':'popf','\u2119':'Popf','\uD835\uDD13':'Pfr','\uD835\uDCAB':'Pscr','\uD835\uDD62':'qopf','\uD835\uDD2E':'qfr','\uD835\uDCC6':'qscr','\uD835\uDCAC':'Qscr','\uD835\uDD14':'Qfr','\u211A':'Qopf','\u0138':'kgreen','\uD835\uDD2F':'rfr','\uD835\uDD63':'ropf','\uD835\uDCC7':'rscr','\u211B':'Rscr','\u211C':'Re','\u211D':'Ropf','\u0155':'racute','\u0154':'Racute','\u0159':'rcaron','\u0158':'Rcaron','\u0157':'rcedil','\u0156':'Rcedil','\uD835\uDD64':'sopf','\uD835\uDCC8':'sscr','\uD835\uDD30':'sfr','\uD835\uDD4A':'Sopf','\uD835\uDD16':'Sfr','\uD835\uDCAE':'Sscr','\u24C8':'oS','\u015B':'sacute','\u015A':'Sacute','\u015D':'scirc','\u015C':'Scirc','\u0161':'scaron','\u0160':'Scaron','\u015F':'scedil','\u015E':'Scedil','\xDF':'szlig','\uD835\uDD31':'tfr','\uD835\uDCC9':'tscr','\uD835\uDD65':'topf','\uD835\uDCAF':'Tscr','\uD835\uDD17':'Tfr','\uD835\uDD4B':'Topf','\u0165':'tcaron','\u0164':'Tcaron','\u0163':'tcedil','\u0162':'Tcedil','\u2122':'trade','\u0167':'tstrok','\u0166':'Tstrok','\uD835\uDCCA':'uscr','\uD835\uDD66':'uopf','\uD835\uDD32':'ufr','\uD835\uDD4C':'Uopf','\uD835\uDD18':'Ufr','\uD835\uDCB0':'Uscr','\xFA':'uacute','\xDA':'Uacute','\xF9':'ugrave','\xD9':'Ugrave','\u016D':'ubreve','\u016C':'Ubreve','\xFB':'ucirc','\xDB':'Ucirc','\u016F':'uring','\u016E':'Uring','\xFC':'uuml','\xDC':'Uuml','\u0171':'udblac','\u0170':'Udblac','\u0169':'utilde','\u0168':'Utilde','\u0173':'uogon','\u0172':'Uogon','\u016B':'umacr','\u016A':'Umacr','\uD835\uDD33':'vfr','\uD835\uDD67':'vopf','\uD835\uDCCB':'vscr','\uD835\uDD19':'Vfr','\uD835\uDD4D':'Vopf','\uD835\uDCB1':'Vscr','\uD835\uDD68':'wopf','\uD835\uDCCC':'wscr','\uD835\uDD34':'wfr','\uD835\uDCB2':'Wscr','\uD835\uDD4E':'Wopf','\uD835\uDD1A':'Wfr','\u0175':'wcirc','\u0174':'Wcirc','\uD835\uDD35':'xfr','\uD835\uDCCD':'xscr','\uD835\uDD69':'xopf','\uD835\uDD4F':'Xopf','\uD835\uDD1B':'Xfr','\uD835\uDCB3':'Xscr','\uD835\uDD36':'yfr','\uD835\uDCCE':'yscr','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDD1C':'Yfr','\uD835\uDD50':'Yopf','\xFD':'yacute','\xDD':'Yacute','\u0177':'ycirc','\u0176':'Ycirc','\xFF':'yuml','\u0178':'Yuml','\uD835\uDCCF':'zscr','\uD835\uDD37':'zfr','\uD835\uDD6B':'zopf','\u2128':'Zfr','\u2124':'Zopf','\uD835\uDCB5':'Zscr','\u017A':'zacute','\u0179':'Zacute','\u017E':'zcaron','\u017D':'Zcaron','\u017C':'zdot','\u017B':'Zdot','\u01B5':'imped','\xFE':'thorn','\xDE':'THORN','\u0149':'napos','\u03B1':'alpha','\u0391':'Alpha','\u03B2':'beta','\u0392':'Beta','\u03B3':'gamma','\u0393':'Gamma','\u03B4':'delta','\u0394':'Delta','\u03B5':'epsi','\u03F5':'epsiv','\u0395':'Epsilon','\u03DD':'gammad','\u03DC':'Gammad','\u03B6':'zeta','\u0396':'Zeta','\u03B7':'eta','\u0397':'Eta','\u03B8':'theta','\u03D1':'thetav','\u0398':'Theta','\u03B9':'iota','\u0399':'Iota','\u03BA':'kappa','\u03F0':'kappav','\u039A':'Kappa','\u03BB':'lambda','\u039B':'Lambda','\u03BC':'mu','\xB5':'micro','\u039C':'Mu','\u03BD':'nu','\u039D':'Nu','\u03BE':'xi','\u039E':'Xi','\u03BF':'omicron','\u039F':'Omicron','\u03C0':'pi','\u03D6':'piv','\u03A0':'Pi','\u03C1':'rho','\u03F1':'rhov','\u03A1':'Rho','\u03C3':'sigma','\u03A3':'Sigma','\u03C2':'sigmaf','\u03C4':'tau','\u03A4':'Tau','\u03C5':'upsi','\u03A5':'Upsilon','\u03D2':'Upsi','\u03C6':'phi','\u03D5':'phiv','\u03A6':'Phi','\u03C7':'chi','\u03A7':'Chi','\u03C8':'psi','\u03A8':'Psi','\u03C9':'omega','\u03A9':'ohm','\u0430':'acy','\u0410':'Acy','\u0431':'bcy','\u0411':'Bcy','\u0432':'vcy','\u0412':'Vcy','\u0433':'gcy','\u0413':'Gcy','\u0453':'gjcy','\u0403':'GJcy','\u0434':'dcy','\u0414':'Dcy','\u0452':'djcy','\u0402':'DJcy','\u0435':'iecy','\u0415':'IEcy','\u0451':'iocy','\u0401':'IOcy','\u0454':'jukcy','\u0404':'Jukcy','\u0436':'zhcy','\u0416':'ZHcy','\u0437':'zcy','\u0417':'Zcy','\u0455':'dscy','\u0405':'DScy','\u0438':'icy','\u0418':'Icy','\u0456':'iukcy','\u0406':'Iukcy','\u0457':'yicy','\u0407':'YIcy','\u0439':'jcy','\u0419':'Jcy','\u0458':'jsercy','\u0408':'Jsercy','\u043A':'kcy','\u041A':'Kcy','\u045C':'kjcy','\u040C':'KJcy','\u043B':'lcy','\u041B':'Lcy','\u0459':'ljcy','\u0409':'LJcy','\u043C':'mcy','\u041C':'Mcy','\u043D':'ncy','\u041D':'Ncy','\u045A':'njcy','\u040A':'NJcy','\u043E':'ocy','\u041E':'Ocy','\u043F':'pcy','\u041F':'Pcy','\u0440':'rcy','\u0420':'Rcy','\u0441':'scy','\u0421':'Scy','\u0442':'tcy','\u0422':'Tcy','\u045B':'tshcy','\u040B':'TSHcy','\u0443':'ucy','\u0423':'Ucy','\u045E':'ubrcy','\u040E':'Ubrcy','\u0444':'fcy','\u0424':'Fcy','\u0445':'khcy','\u0425':'KHcy','\u0446':'tscy','\u0426':'TScy','\u0447':'chcy','\u0427':'CHcy','\u045F':'dzcy','\u040F':'DZcy','\u0448':'shcy','\u0428':'SHcy','\u0449':'shchcy','\u0429':'SHCHcy','\u044A':'hardcy','\u042A':'HARDcy','\u044B':'ycy','\u042B':'Ycy','\u044C':'softcy','\u042C':'SOFTcy','\u044D':'ecy','\u042D':'Ecy','\u044E':'yucy','\u042E':'YUcy','\u044F':'yacy','\u042F':'YAcy','\u2135':'aleph','\u2136':'beth','\u2137':'gimel','\u2138':'daleth'};

	var regexEscape = /["&'<>`]/g;
	var escapeMap = {
		'"': '&quot;',
		'&': '&amp;',
		'\'': '&#x27;',
		'<': '&lt;',
		// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
		// following is not strictly necessary unless it’s part of a tag or an
		// unquoted attribute value. We’re only escaping it to support those
		// situations, and for XML support.
		'>': '&gt;',
		// In Internet Explorer ≤ 8, the backtick character can be used
		// to break out of (un)quoted attribute values or HTML comments.
		// See http://html5sec.org/#102, http://html5sec.org/#108, and
		// http://html5sec.org/#133.
		'`': '&#x60;'
	};

	var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
	var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
	var regexDecode = /&(CounterClockwiseContourIntegral|DoubleLongLeftRightArrow|ClockwiseContourIntegral|NotNestedGreaterGreater|NotSquareSupersetEqual|DiacriticalDoubleAcute|NotRightTriangleEqual|NotSucceedsSlantEqual|NotPrecedesSlantEqual|CloseCurlyDoubleQuote|NegativeVeryThinSpace|DoubleContourIntegral|FilledVerySmallSquare|CapitalDifferentialD|OpenCurlyDoubleQuote|EmptyVerySmallSquare|NestedGreaterGreater|DoubleLongRightArrow|NotLeftTriangleEqual|NotGreaterSlantEqual|ReverseUpEquilibrium|DoubleLeftRightArrow|NotSquareSubsetEqual|NotDoubleVerticalBar|RightArrowLeftArrow|NotGreaterFullEqual|NotRightTriangleBar|SquareSupersetEqual|DownLeftRightVector|DoubleLongLeftArrow|leftrightsquigarrow|LeftArrowRightArrow|NegativeMediumSpace|blacktriangleright|RightDownVectorBar|PrecedesSlantEqual|RightDoubleBracket|SucceedsSlantEqual|NotLeftTriangleBar|RightTriangleEqual|SquareIntersection|RightDownTeeVector|ReverseEquilibrium|NegativeThickSpace|longleftrightarrow|Longleftrightarrow|LongLeftRightArrow|DownRightTeeVector|DownRightVectorBar|GreaterSlantEqual|SquareSubsetEqual|LeftDownVectorBar|LeftDoubleBracket|VerticalSeparator|rightleftharpoons|NotGreaterGreater|NotSquareSuperset|blacktriangleleft|blacktriangledown|NegativeThinSpace|LeftDownTeeVector|NotLessSlantEqual|leftrightharpoons|DoubleUpDownArrow|DoubleVerticalBar|LeftTriangleEqual|FilledSmallSquare|twoheadrightarrow|NotNestedLessLess|DownLeftTeeVector|DownLeftVectorBar|RightAngleBracket|NotTildeFullEqual|NotReverseElement|RightUpDownVector|DiacriticalTilde|NotSucceedsTilde|circlearrowright|NotPrecedesEqual|rightharpoondown|DoubleRightArrow|NotSucceedsEqual|NonBreakingSpace|NotRightTriangle|LessEqualGreater|RightUpTeeVector|LeftAngleBracket|GreaterFullEqual|DownArrowUpArrow|RightUpVectorBar|twoheadleftarrow|GreaterEqualLess|downharpoonright|RightTriangleBar|ntrianglerighteq|NotSupersetEqual|LeftUpDownVector|DiacriticalAcute|rightrightarrows|vartriangleright|UpArrowDownArrow|DiacriticalGrave|UnderParenthesis|EmptySmallSquare|LeftUpVectorBar|leftrightarrows|DownRightVector|downharpoonleft|trianglerighteq|ShortRightArrow|OverParenthesis|DoubleLeftArrow|DoubleDownArrow|NotSquareSubset|bigtriangledown|ntrianglelefteq|UpperRightArrow|curvearrowright|vartriangleleft|NotLeftTriangle|nleftrightarrow|LowerRightArrow|NotHumpDownHump|NotGreaterTilde|rightthreetimes|LeftUpTeeVector|NotGreaterEqual|straightepsilon|LeftTriangleBar|rightsquigarrow|ContourIntegral|rightleftarrows|CloseCurlyQuote|RightDownVector|LeftRightVector|nLeftrightarrow|leftharpoondown|circlearrowleft|SquareSuperset|OpenCurlyQuote|hookrightarrow|HorizontalLine|DiacriticalDot|NotLessGreater|ntriangleright|DoubleRightTee|InvisibleComma|InvisibleTimes|LowerLeftArrow|DownLeftVector|NotSubsetEqual|curvearrowleft|trianglelefteq|NotVerticalBar|TildeFullEqual|downdownarrows|NotGreaterLess|RightTeeVector|ZeroWidthSpace|looparrowright|LongRightArrow|doublebarwedge|ShortLeftArrow|ShortDownArrow|RightVectorBar|GreaterGreater|ReverseElement|rightharpoonup|LessSlantEqual|leftthreetimes|upharpoonright|rightarrowtail|LeftDownVector|Longrightarrow|NestedLessLess|UpperLeftArrow|nshortparallel|leftleftarrows|leftrightarrow|Leftrightarrow|LeftRightArrow|longrightarrow|upharpoonleft|RightArrowBar|ApplyFunction|LeftTeeVector|leftarrowtail|NotEqualTilde|varsubsetneqq|varsupsetneqq|RightTeeArrow|SucceedsEqual|SucceedsTilde|LeftVectorBar|SupersetEqual|hookleftarrow|DifferentialD|VerticalTilde|VeryThinSpace|blacktriangle|bigtriangleup|LessFullEqual|divideontimes|leftharpoonup|UpEquilibrium|ntriangleleft|RightTriangle|measuredangle|shortparallel|longleftarrow|Longleftarrow|LongLeftArrow|DoubleLeftTee|Poincareplane|PrecedesEqual|triangleright|DoubleUpArrow|RightUpVector|fallingdotseq|looparrowleft|PrecedesTilde|NotTildeEqual|NotTildeTilde|smallsetminus|Proportional|triangleleft|triangledown|UnderBracket|NotHumpEqual|exponentiale|ExponentialE|NotLessTilde|HilbertSpace|RightCeiling|blacklozenge|varsupsetneq|HumpDownHump|GreaterEqual|VerticalLine|LeftTeeArrow|NotLessEqual|DownTeeArrow|LeftTriangle|varsubsetneq|Intersection|NotCongruent|DownArrowBar|LeftUpVector|LeftArrowBar|risingdotseq|GreaterTilde|RoundImplies|SquareSubset|ShortUpArrow|NotSuperset|quaternions|precnapprox|backepsilon|preccurlyeq|OverBracket|blacksquare|MediumSpace|VerticalBar|circledcirc|circleddash|CircleMinus|CircleTimes|LessGreater|curlyeqprec|curlyeqsucc|diamondsuit|UpDownArrow|Updownarrow|RuleDelayed|Rrightarrow|updownarrow|RightVector|nRightarrow|nrightarrow|eqslantless|LeftCeiling|Equilibrium|SmallCircle|expectation|NotSucceeds|thickapprox|GreaterLess|SquareUnion|NotPrecedes|NotLessLess|straightphi|succnapprox|succcurlyeq|SubsetEqual|sqsupseteq|Proportion|Laplacetrf|ImaginaryI|supsetneqq|NotGreater|gtreqqless|NotElement|ThickSpace|TildeEqual|TildeTilde|Fouriertrf|rmoustache|EqualTilde|eqslantgtr|UnderBrace|LeftVector|UpArrowBar|nLeftarrow|nsubseteqq|subsetneqq|nsupseteqq|nleftarrow|succapprox|lessapprox|UpTeeArrow|upuparrows|curlywedge|lesseqqgtr|varepsilon|varnothing|RightFloor|complement|CirclePlus|sqsubseteq|Lleftarrow|circledast|RightArrow|Rightarrow|rightarrow|lmoustache|Bernoullis|precapprox|mapstoleft|mapstodown|longmapsto|dotsquare|downarrow|DoubleDot|nsubseteq|supsetneq|leftarrow|nsupseteq|subsetneq|ThinSpace|ngeqslant|subseteqq|HumpEqual|NotSubset|triangleq|NotCupCap|lesseqgtr|heartsuit|TripleDot|Leftarrow|Coproduct|Congruent|varpropto|complexes|gvertneqq|LeftArrow|LessTilde|supseteqq|MinusPlus|CircleDot|nleqslant|NotExists|gtreqless|nparallel|UnionPlus|LeftFloor|checkmark|CenterDot|centerdot|Mellintrf|gtrapprox|bigotimes|OverBrace|spadesuit|therefore|pitchfork|rationals|PlusMinus|Backslash|Therefore|DownBreve|backsimeq|backprime|DownArrow|nshortmid|Downarrow|lvertneqq|eqvparsl|imagline|imagpart|infintie|integers|Integral|intercal|LessLess|Uarrocir|intlarhk|sqsupset|angmsdaf|sqsubset|llcorner|vartheta|cupbrcap|lnapprox|Superset|SuchThat|succnsim|succneqq|angmsdag|biguplus|curlyvee|trpezium|Succeeds|NotTilde|bigwedge|angmsdah|angrtvbd|triminus|cwconint|fpartint|lrcorner|smeparsl|subseteq|urcorner|lurdshar|laemptyv|DDotrahd|approxeq|ldrushar|awconint|mapstoup|backcong|shortmid|triangle|geqslant|gesdotol|timesbar|circledR|circledS|setminus|multimap|naturals|scpolint|ncongdot|RightTee|boxminus|gnapprox|boxtimes|andslope|thicksim|angmsdaa|varsigma|cirfnint|rtriltri|angmsdab|rppolint|angmsdac|barwedge|drbkarow|clubsuit|thetasym|bsolhsub|capbrcup|dzigrarr|doteqdot|DotEqual|dotminus|UnderBar|NotEqual|realpart|otimesas|ulcorner|hksearow|hkswarow|parallel|PartialD|elinters|emptyset|plusacir|bbrktbrk|angmsdad|pointint|bigoplus|angmsdae|Precedes|bigsqcup|varkappa|notindot|supseteq|precneqq|precnsim|profalar|profline|profsurf|leqslant|lesdotor|raemptyv|subplus|notnivb|notnivc|subrarr|zigrarr|vzigzag|submult|subedot|Element|between|cirscir|larrbfs|larrsim|lotimes|lbrksld|lbrkslu|lozenge|ldrdhar|dbkarow|bigcirc|epsilon|simrarr|simplus|ltquest|Epsilon|luruhar|gtquest|maltese|npolint|eqcolon|npreceq|bigodot|ddagger|gtrless|bnequiv|harrcir|ddotseq|equivDD|backsim|demptyv|nsqsube|nsqsupe|Upsilon|nsubset|upsilon|minusdu|nsucceq|swarrow|nsupset|coloneq|searrow|boxplus|napprox|natural|asympeq|alefsym|congdot|nearrow|bigstar|diamond|supplus|tritime|LeftTee|nvinfin|triplus|NewLine|nvltrie|nvrtrie|nwarrow|nexists|Diamond|ruluhar|Implies|supmult|angzarr|suplarr|suphsub|questeq|because|digamma|Because|olcross|bemptyv|omicron|Omicron|rotimes|NoBreak|intprod|angrtvb|orderof|uwangle|suphsol|lesdoto|orslope|DownTee|realine|cudarrl|rdldhar|OverBar|supedot|lessdot|supdsub|topfork|succsim|rbrkslu|rbrksld|pertenk|cudarrr|isindot|planckh|lessgtr|pluscir|gesdoto|plussim|plustwo|lesssim|cularrp|rarrsim|Cayleys|notinva|notinvb|notinvc|UpArrow|Uparrow|uparrow|NotLess|dwangle|precsim|Product|curarrm|Cconint|dotplus|rarrbfs|ccupssm|Cedilla|cemptyv|notniva|quatint|frac35|frac38|frac45|frac56|frac58|frac78|tridot|xoplus|gacute|gammad|Gammad|lfisht|lfloor|bigcup|sqsupe|gbreve|Gbreve|lharul|sqsube|sqcups|Gcedil|apacir|llhard|lmidot|Lmidot|lmoust|andand|sqcaps|approx|Abreve|spades|circeq|tprime|divide|topcir|Assign|topbot|gesdot|divonx|xuplus|timesd|gesles|atilde|solbar|SOFTcy|loplus|timesb|lowast|lowbar|dlcorn|dlcrop|softcy|dollar|lparlt|thksim|lrhard|Atilde|lsaquo|smashp|bigvee|thinsp|wreath|bkarow|lsquor|lstrok|Lstrok|lthree|ltimes|ltlarr|DotDot|simdot|ltrPar|weierp|xsqcup|angmsd|sigmav|sigmaf|zeetrf|Zcaron|zcaron|mapsto|vsupne|thetav|cirmid|marker|mcomma|Zacute|vsubnE|there4|gtlPar|vsubne|bottom|gtrarr|SHCHcy|shchcy|midast|midcir|middot|minusb|minusd|gtrdot|bowtie|sfrown|mnplus|models|colone|seswar|Colone|mstpos|searhk|gtrsim|nacute|Nacute|boxbox|telrec|hairsp|Tcedil|nbumpe|scnsim|ncaron|Ncaron|ncedil|Ncedil|hamilt|Scedil|nearhk|hardcy|HARDcy|tcedil|Tcaron|commat|nequiv|nesear|tcaron|target|hearts|nexist|varrho|scedil|Scaron|scaron|hellip|Sacute|sacute|hercon|swnwar|compfn|rtimes|rthree|rsquor|rsaquo|zacute|wedgeq|homtht|barvee|barwed|Barwed|rpargt|horbar|conint|swarhk|roplus|nltrie|hslash|hstrok|Hstrok|rmoust|Conint|bprime|hybull|hyphen|iacute|Iacute|supsup|supsub|supsim|varphi|coprod|brvbar|agrave|Supset|supset|igrave|Igrave|notinE|Agrave|iiiint|iinfin|copysr|wedbar|Verbar|vangrt|becaus|incare|verbar|inodot|bullet|drcorn|intcal|drcrop|cularr|vellip|Utilde|bumpeq|cupcap|dstrok|Dstrok|CupCap|cupcup|cupdot|eacute|Eacute|supdot|iquest|easter|ecaron|Ecaron|ecolon|isinsv|utilde|itilde|Itilde|curarr|succeq|Bumpeq|cacute|ulcrop|nparsl|Cacute|nprcue|egrave|Egrave|nrarrc|nrarrw|subsup|subsub|nrtrie|jsercy|nsccue|Jsercy|kappav|kcedil|Kcedil|subsim|ulcorn|nsimeq|egsdot|veebar|kgreen|capand|elsdot|Subset|subset|curren|aacute|lacute|Lacute|emptyv|ntilde|Ntilde|lagran|lambda|Lambda|capcap|Ugrave|langle|subdot|emsp13|numero|emsp14|nvdash|nvDash|nVdash|nVDash|ugrave|ufisht|nvHarr|larrfs|nvlArr|larrhk|larrlp|larrpl|nvrArr|Udblac|nwarhk|larrtl|nwnear|oacute|Oacute|latail|lAtail|sstarf|lbrace|odblac|Odblac|lbrack|udblac|odsold|eparsl|lcaron|Lcaron|ograve|Ograve|lcedil|Lcedil|Aacute|ssmile|ssetmn|squarf|ldquor|capcup|ominus|cylcty|rharul|eqcirc|dagger|rfloor|rfisht|Dagger|daleth|equals|origof|capdot|equest|dcaron|Dcaron|rdquor|oslash|Oslash|otilde|Otilde|otimes|Otimes|urcrop|Ubreve|ubreve|Yacute|Uacute|uacute|Rcedil|rcedil|urcorn|parsim|Rcaron|Vdashl|rcaron|Tstrok|percnt|period|permil|Exists|yacute|rbrack|rbrace|phmmat|ccaron|Ccaron|planck|ccedil|plankv|tstrok|female|plusdo|plusdu|ffilig|plusmn|ffllig|Ccedil|rAtail|dfisht|bernou|ratail|Rarrtl|rarrtl|angsph|rarrpl|rarrlp|rarrhk|xwedge|xotime|forall|ForAll|Vvdash|vsupnE|preceq|bigcap|frac12|frac13|frac14|primes|rarrfs|prnsim|frac15|Square|frac16|square|lesdot|frac18|frac23|propto|prurel|rarrap|rangle|puncsp|frac25|Racute|qprime|racute|lesges|frac34|abreve|AElig|eqsim|utdot|setmn|urtri|Equal|Uring|seArr|uring|searr|dashv|Dashv|mumap|nabla|iogon|Iogon|sdote|sdotb|scsim|napid|napos|equiv|natur|Acirc|dblac|erarr|nbump|iprod|erDot|ucirc|awint|esdot|angrt|ncong|isinE|scnap|Scirc|scirc|ndash|isins|Ubrcy|nearr|neArr|isinv|nedot|ubrcy|acute|Ycirc|iukcy|Iukcy|xutri|nesim|caret|jcirc|Jcirc|caron|twixt|ddarr|sccue|exist|jmath|sbquo|ngeqq|angst|ccaps|lceil|ngsim|UpTee|delta|Delta|rtrif|nharr|nhArr|nhpar|rtrie|jukcy|Jukcy|kappa|rsquo|Kappa|nlarr|nlArr|TSHcy|rrarr|aogon|Aogon|fflig|xrarr|tshcy|ccirc|nleqq|filig|upsih|nless|dharl|nlsim|fjlig|ropar|nltri|dharr|robrk|roarr|fllig|fltns|roang|rnmid|subnE|subne|lAarr|trisb|Ccirc|acirc|ccups|blank|VDash|forkv|Vdash|langd|cedil|blk12|blk14|laquo|strns|diams|notin|vDash|larrb|blk34|block|disin|uplus|vdash|vBarv|aelig|starf|Wedge|check|xrArr|lates|lbarr|lBarr|notni|lbbrk|bcong|frasl|lbrke|frown|vrtri|vprop|vnsup|gamma|Gamma|wedge|xodot|bdquo|srarr|doteq|ldquo|boxdl|boxdL|gcirc|Gcirc|boxDl|boxDL|boxdr|boxdR|boxDr|TRADE|trade|rlhar|boxDR|vnsub|npart|vltri|rlarr|boxhd|boxhD|nprec|gescc|nrarr|nrArr|boxHd|boxHD|boxhu|boxhU|nrtri|boxHu|clubs|boxHU|times|colon|Colon|gimel|xlArr|Tilde|nsime|tilde|nsmid|nspar|THORN|thorn|xlarr|nsube|nsubE|thkap|xhArr|comma|nsucc|boxul|boxuL|nsupe|nsupE|gneqq|gnsim|boxUl|boxUL|grave|boxur|boxuR|boxUr|boxUR|lescc|angle|bepsi|boxvh|varpi|boxvH|numsp|Theta|gsime|gsiml|theta|boxVh|boxVH|boxvl|gtcir|gtdot|boxvL|boxVl|boxVL|crarr|cross|Cross|nvsim|boxvr|nwarr|nwArr|sqsup|dtdot|Uogon|lhard|lharu|dtrif|ocirc|Ocirc|lhblk|duarr|odash|sqsub|Hacek|sqcup|llarr|duhar|oelig|OElig|ofcir|boxvR|uogon|lltri|boxVr|csube|uuarr|ohbar|csupe|ctdot|olarr|olcir|harrw|oline|sqcap|omacr|Omacr|omega|Omega|boxVR|aleph|lneqq|lnsim|loang|loarr|rharu|lobrk|hcirc|operp|oplus|rhard|Hcirc|orarr|Union|order|ecirc|Ecirc|cuepr|szlig|cuesc|breve|reals|eDDot|Breve|hoarr|lopar|utrif|rdquo|Umacr|umacr|efDot|swArr|ultri|alpha|rceil|ovbar|swarr|Wcirc|wcirc|smtes|smile|bsemi|lrarr|aring|parsl|lrhar|bsime|uhblk|lrtri|cupor|Aring|uharr|uharl|slarr|rbrke|bsolb|lsime|rbbrk|RBarr|lsimg|phone|rBarr|rbarr|icirc|lsquo|Icirc|emacr|Emacr|ratio|simne|plusb|simlE|simgE|simeq|pluse|ltcir|ltdot|empty|xharr|xdtri|iexcl|Alpha|ltrie|rarrw|pound|ltrif|xcirc|bumpe|prcue|bumpE|asymp|amacr|cuvee|Sigma|sigma|iiint|udhar|iiota|ijlig|IJlig|supnE|imacr|Imacr|prime|Prime|image|prnap|eogon|Eogon|rarrc|mdash|mDDot|cuwed|imath|supne|imped|Amacr|udarr|prsim|micro|rarrb|cwint|raquo|infin|eplus|range|rangd|Ucirc|radic|minus|amalg|veeeq|rAarr|epsiv|ycirc|quest|sharp|quot|zwnj|Qscr|race|qscr|Qopf|qopf|qint|rang|Rang|Zscr|zscr|Zopf|zopf|rarr|rArr|Rarr|Pscr|pscr|prop|prod|prnE|prec|ZHcy|zhcy|prap|Zeta|zeta|Popf|popf|Zdot|plus|zdot|Yuml|yuml|phiv|YUcy|yucy|Yscr|yscr|perp|Yopf|yopf|part|para|YIcy|Ouml|rcub|yicy|YAcy|rdca|ouml|osol|Oscr|rdsh|yacy|real|oscr|xvee|andd|rect|andv|Xscr|oror|ordm|ordf|xscr|ange|aopf|Aopf|rHar|Xopf|opar|Oopf|xopf|xnis|rhov|oopf|omid|xmap|oint|apid|apos|ogon|ascr|Ascr|odot|odiv|xcup|xcap|ocir|oast|nvlt|nvle|nvgt|nvge|nvap|Wscr|wscr|auml|ntlg|ntgl|nsup|nsub|nsim|Nscr|nscr|nsce|Wopf|ring|npre|wopf|npar|Auml|Barv|bbrk|Nopf|nopf|nmid|nLtv|beta|ropf|Ropf|Beta|beth|nles|rpar|nleq|bnot|bNot|nldr|NJcy|rscr|Rscr|Vscr|vscr|rsqb|njcy|bopf|nisd|Bopf|rtri|Vopf|nGtv|ngtr|vopf|boxh|boxH|boxv|nges|ngeq|boxV|bscr|scap|Bscr|bsim|Vert|vert|bsol|bull|bump|caps|cdot|ncup|scnE|ncap|nbsp|napE|Cdot|cent|sdot|Vbar|nang|vBar|chcy|Mscr|mscr|sect|semi|CHcy|Mopf|mopf|sext|circ|cire|mldr|mlcp|cirE|comp|shcy|SHcy|vArr|varr|cong|copf|Copf|copy|COPY|malt|male|macr|lvnE|cscr|ltri|sime|ltcc|simg|Cscr|siml|csub|Uuml|lsqb|lsim|uuml|csup|Lscr|lscr|utri|smid|lpar|cups|smte|lozf|darr|Lopf|Uscr|solb|lopf|sopf|Sopf|lneq|uscr|spar|dArr|lnap|Darr|dash|Sqrt|LJcy|ljcy|lHar|dHar|Upsi|upsi|diam|lesg|djcy|DJcy|leqq|dopf|Dopf|dscr|Dscr|dscy|ldsh|ldca|squf|DScy|sscr|Sscr|dsol|lcub|late|star|Star|Uopf|Larr|lArr|larr|uopf|dtri|dzcy|sube|subE|Lang|lang|Kscr|kscr|Kopf|kopf|KJcy|kjcy|KHcy|khcy|DZcy|ecir|edot|eDot|Jscr|jscr|succ|Jopf|jopf|Edot|uHar|emsp|ensp|Iuml|iuml|eopf|isin|Iscr|iscr|Eopf|epar|sung|epsi|escr|sup1|sup2|sup3|Iota|iota|supe|supE|Iopf|iopf|IOcy|iocy|Escr|esim|Esim|imof|Uarr|QUOT|uArr|uarr|euml|IEcy|iecy|Idot|Euml|euro|excl|Hscr|hscr|Hopf|hopf|TScy|tscy|Tscr|hbar|tscr|flat|tbrk|fnof|hArr|harr|half|fopf|Fopf|tdot|gvnE|fork|trie|gtcc|fscr|Fscr|gdot|gsim|Gscr|gscr|Gopf|gopf|gneq|Gdot|tosa|gnap|Topf|topf|geqq|toea|GJcy|gjcy|tint|gesl|mid|Sfr|ggg|top|ges|gla|glE|glj|geq|gne|gEl|gel|gnE|Gcy|gcy|gap|Tfr|tfr|Tcy|tcy|Hat|Tau|Ffr|tau|Tab|hfr|Hfr|ffr|Fcy|fcy|icy|Icy|iff|ETH|eth|ifr|Ifr|Eta|eta|int|Int|Sup|sup|ucy|Ucy|Sum|sum|jcy|ENG|ufr|Ufr|eng|Jcy|jfr|els|ell|egs|Efr|efr|Jfr|uml|kcy|Kcy|Ecy|ecy|kfr|Kfr|lap|Sub|sub|lat|lcy|Lcy|leg|Dot|dot|lEg|leq|les|squ|div|die|lfr|Lfr|lgE|Dfr|dfr|Del|deg|Dcy|dcy|lne|lnE|sol|loz|smt|Cup|lrm|cup|lsh|Lsh|sim|shy|map|Map|mcy|Mcy|mfr|Mfr|mho|gfr|Gfr|sfr|cir|Chi|chi|nap|Cfr|vcy|Vcy|cfr|Scy|scy|ncy|Ncy|vee|Vee|Cap|cap|nfr|scE|sce|Nfr|nge|ngE|nGg|vfr|Vfr|ngt|bot|nGt|nis|niv|Rsh|rsh|nle|nlE|bne|Bfr|bfr|nLl|nlt|nLt|Bcy|bcy|not|Not|rlm|wfr|Wfr|npr|nsc|num|ocy|ast|Ocy|ofr|xfr|Xfr|Ofr|ogt|ohm|apE|olt|Rho|ape|rho|Rfr|rfr|ord|REG|ang|reg|orv|And|and|AMP|Rcy|amp|Afr|ycy|Ycy|yen|yfr|Yfr|rcy|par|pcy|Pcy|pfr|Pfr|phi|Phi|afr|Acy|acy|zcy|Zcy|piv|acE|acd|zfr|Zfr|pre|prE|psi|Psi|qfr|Qfr|zwj|Or|ge|Gg|gt|gg|el|oS|lt|Lt|LT|Re|lg|gl|eg|ne|Im|it|le|DD|wp|wr|nu|Nu|dd|lE|Sc|sc|pi|Pi|ee|af|ll|Ll|rx|gE|xi|pm|Xi|ic|pr|Pr|in|ni|mp|mu|ac|Mu|or|ap|Gt|GT|ii);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)(?!;)([=a-zA-Z0-9]?)|&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+)/g;
	var decodeMap = {'aacute':'\xE1','Aacute':'\xC1','abreve':'\u0103','Abreve':'\u0102','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','acy':'\u0430','Acy':'\u0410','aelig':'\xE6','AElig':'\xC6','af':'\u2061','afr':'\uD835\uDD1E','Afr':'\uD835\uDD04','agrave':'\xE0','Agrave':'\xC0','alefsym':'\u2135','aleph':'\u2135','alpha':'\u03B1','Alpha':'\u0391','amacr':'\u0101','Amacr':'\u0100','amalg':'\u2A3F','amp':'&','AMP':'&','and':'\u2227','And':'\u2A53','andand':'\u2A55','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsd':'\u2221','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','aogon':'\u0105','Aogon':'\u0104','aopf':'\uD835\uDD52','Aopf':'\uD835\uDD38','ap':'\u2248','apacir':'\u2A6F','ape':'\u224A','apE':'\u2A70','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','aring':'\xE5','Aring':'\xC5','ascr':'\uD835\uDCB6','Ascr':'\uD835\uDC9C','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','bcy':'\u0431','Bcy':'\u0411','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','beta':'\u03B2','Beta':'\u0392','beth':'\u2136','between':'\u226C','bfr':'\uD835\uDD1F','Bfr':'\uD835\uDD05','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bnot':'\u2310','bNot':'\u2AED','bopf':'\uD835\uDD53','Bopf':'\uD835\uDD39','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxhD':'\u2565','boxHd':'\u2564','boxHD':'\u2566','boxhu':'\u2534','boxhU':'\u2568','boxHu':'\u2567','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsol':'\\','bsolb':'\u29C5','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpe':'\u224F','bumpE':'\u2AAE','bumpeq':'\u224F','Bumpeq':'\u224E','cacute':'\u0107','Cacute':'\u0106','cap':'\u2229','Cap':'\u22D2','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','ccaron':'\u010D','Ccaron':'\u010C','ccedil':'\xE7','Ccedil':'\xC7','ccirc':'\u0109','Ccirc':'\u0108','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','cdot':'\u010B','Cdot':'\u010A','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','chcy':'\u0447','CHcy':'\u0427','check':'\u2713','checkmark':'\u2713','chi':'\u03C7','Chi':'\u03A7','cir':'\u25CB','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cire':'\u2257','cirE':'\u29C3','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','colone':'\u2254','Colone':'\u2A74','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','cscr':'\uD835\uDCB8','Cscr':'\uD835\uDC9E','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cup':'\u222A','Cup':'\u22D3','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','dArr':'\u21D3','Darr':'\u21A1','dash':'\u2010','dashv':'\u22A3','Dashv':'\u2AE4','dbkarow':'\u290F','dblac':'\u02DD','dcaron':'\u010F','Dcaron':'\u010E','dcy':'\u0434','Dcy':'\u0414','dd':'\u2146','DD':'\u2145','ddagger':'\u2021','ddarr':'\u21CA','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','delta':'\u03B4','Delta':'\u0394','demptyv':'\u29B1','dfisht':'\u297F','dfr':'\uD835\uDD21','Dfr':'\uD835\uDD07','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','djcy':'\u0452','DJcy':'\u0402','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','dopf':'\uD835\uDD55','Dopf':'\uD835\uDD3B','dot':'\u02D9','Dot':'\xA8','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','downarrow':'\u2193','Downarrow':'\u21D3','DownArrow':'\u2193','DownArrowBar':'\u2913','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVector':'\u21BD','DownLeftVectorBar':'\u2956','DownRightTeeVector':'\u295F','DownRightVector':'\u21C1','DownRightVectorBar':'\u2957','DownTee':'\u22A4','DownTeeArrow':'\u21A7','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','dscr':'\uD835\uDCB9','Dscr':'\uD835\uDC9F','dscy':'\u0455','DScy':'\u0405','dsol':'\u29F6','dstrok':'\u0111','Dstrok':'\u0110','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','dzcy':'\u045F','DZcy':'\u040F','dzigrarr':'\u27FF','eacute':'\xE9','Eacute':'\xC9','easter':'\u2A6E','ecaron':'\u011B','Ecaron':'\u011A','ecir':'\u2256','ecirc':'\xEA','Ecirc':'\xCA','ecolon':'\u2255','ecy':'\u044D','Ecy':'\u042D','eDDot':'\u2A77','edot':'\u0117','eDot':'\u2251','Edot':'\u0116','ee':'\u2147','efDot':'\u2252','efr':'\uD835\uDD22','Efr':'\uD835\uDD08','eg':'\u2A9A','egrave':'\xE8','Egrave':'\xC8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','emacr':'\u0113','Emacr':'\u0112','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp':'\u2003','emsp13':'\u2004','emsp14':'\u2005','eng':'\u014B','ENG':'\u014A','ensp':'\u2002','eogon':'\u0119','Eogon':'\u0118','eopf':'\uD835\uDD56','Eopf':'\uD835\uDD3C','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','epsilon':'\u03B5','Epsilon':'\u0395','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','esim':'\u2242','Esim':'\u2A73','eta':'\u03B7','Eta':'\u0397','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','fcy':'\u0444','Fcy':'\u0424','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','ffr':'\uD835\uDD23','Ffr':'\uD835\uDD09','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','fopf':'\uD835\uDD57','Fopf':'\uD835\uDD3D','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','gamma':'\u03B3','Gamma':'\u0393','gammad':'\u03DD','Gammad':'\u03DC','gap':'\u2A86','gbreve':'\u011F','Gbreve':'\u011E','Gcedil':'\u0122','gcirc':'\u011D','Gcirc':'\u011C','gcy':'\u0433','Gcy':'\u0413','gdot':'\u0121','Gdot':'\u0120','ge':'\u2265','gE':'\u2267','gel':'\u22DB','gEl':'\u2A8C','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','ges':'\u2A7E','gescc':'\u2AA9','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','gfr':'\uD835\uDD24','Gfr':'\uD835\uDD0A','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','gjcy':'\u0453','GJcy':'\u0403','gl':'\u2277','gla':'\u2AA5','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','gopf':'\uD835\uDD58','Gopf':'\uD835\uDD3E','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','gscr':'\u210A','Gscr':'\uD835\uDCA2','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gt':'>','Gt':'\u226B','GT':'>','gtcc':'\u2AA7','gtcir':'\u2A7A','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','hardcy':'\u044A','HARDcy':'\u042A','harr':'\u2194','hArr':'\u21D4','harrcir':'\u2948','harrw':'\u21AD','Hat':'^','hbar':'\u210F','hcirc':'\u0125','Hcirc':'\u0124','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','hstrok':'\u0127','Hstrok':'\u0126','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','iacute':'\xED','Iacute':'\xCD','ic':'\u2063','icirc':'\xEE','Icirc':'\xCE','icy':'\u0438','Icy':'\u0418','Idot':'\u0130','iecy':'\u0435','IEcy':'\u0415','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','igrave':'\xEC','Igrave':'\xCC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','ijlig':'\u0133','IJlig':'\u0132','Im':'\u2111','imacr':'\u012B','Imacr':'\u012A','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','in':'\u2208','incare':'\u2105','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','int':'\u222B','Int':'\u222C','intcal':'\u22BA','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','iocy':'\u0451','IOcy':'\u0401','iogon':'\u012F','Iogon':'\u012E','iopf':'\uD835\uDD5A','Iopf':'\uD835\uDD40','iota':'\u03B9','Iota':'\u0399','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','itilde':'\u0129','Itilde':'\u0128','iukcy':'\u0456','Iukcy':'\u0406','iuml':'\xEF','Iuml':'\xCF','jcirc':'\u0135','Jcirc':'\u0134','jcy':'\u0439','Jcy':'\u0419','jfr':'\uD835\uDD27','Jfr':'\uD835\uDD0D','jmath':'\u0237','jopf':'\uD835\uDD5B','Jopf':'\uD835\uDD41','jscr':'\uD835\uDCBF','Jscr':'\uD835\uDCA5','jsercy':'\u0458','Jsercy':'\u0408','jukcy':'\u0454','Jukcy':'\u0404','kappa':'\u03BA','Kappa':'\u039A','kappav':'\u03F0','kcedil':'\u0137','Kcedil':'\u0136','kcy':'\u043A','Kcy':'\u041A','kfr':'\uD835\uDD28','Kfr':'\uD835\uDD0E','kgreen':'\u0138','khcy':'\u0445','KHcy':'\u0425','kjcy':'\u045C','KJcy':'\u040C','kopf':'\uD835\uDD5C','Kopf':'\uD835\uDD42','kscr':'\uD835\uDCC0','Kscr':'\uD835\uDCA6','lAarr':'\u21DA','lacute':'\u013A','Lacute':'\u0139','laemptyv':'\u29B4','lagran':'\u2112','lambda':'\u03BB','Lambda':'\u039B','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larr':'\u2190','lArr':'\u21D0','Larr':'\u219E','larrb':'\u21E4','larrbfs':'\u291F','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','lat':'\u2AAB','latail':'\u2919','lAtail':'\u291B','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','lcaron':'\u013E','Lcaron':'\u013D','lcedil':'\u013C','Lcedil':'\u013B','lceil':'\u2308','lcub':'{','lcy':'\u043B','Lcy':'\u041B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','leftarrow':'\u2190','Leftarrow':'\u21D0','LeftArrow':'\u2190','LeftArrowBar':'\u21E4','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVector':'\u21C3','LeftDownVectorBar':'\u2959','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','Leftrightarrow':'\u21D4','LeftRightArrow':'\u2194','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTee':'\u22A3','LeftTeeArrow':'\u21A4','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangle':'\u22B2','LeftTriangleBar':'\u29CF','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVector':'\u21BF','LeftUpVectorBar':'\u2958','LeftVector':'\u21BC','LeftVectorBar':'\u2952','leg':'\u22DA','lEg':'\u2A8B','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','les':'\u2A7D','lescc':'\u2AA8','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','lfr':'\uD835\uDD29','Lfr':'\uD835\uDD0F','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','ljcy':'\u0459','LJcy':'\u0409','ll':'\u226A','Ll':'\u22D8','llarr':'\u21C7','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','lmidot':'\u0140','Lmidot':'\u013F','lmoust':'\u23B0','lmoustache':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','Longleftarrow':'\u27F8','LongLeftArrow':'\u27F5','longleftrightarrow':'\u27F7','Longleftrightarrow':'\u27FA','LongLeftRightArrow':'\u27F7','longmapsto':'\u27FC','longrightarrow':'\u27F6','Longrightarrow':'\u27F9','LongRightArrow':'\u27F6','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','lopf':'\uD835\uDD5D','Lopf':'\uD835\uDD43','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','lstrok':'\u0142','Lstrok':'\u0141','lt':'<','Lt':'\u226A','LT':'<','ltcc':'\u2AA6','ltcir':'\u2A79','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','map':'\u21A6','Map':'\u2905','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','mcy':'\u043C','Mcy':'\u041C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','mfr':'\uD835\uDD2A','Mfr':'\uD835\uDD10','mho':'\u2127','micro':'\xB5','mid':'\u2223','midast':'*','midcir':'\u2AF0','middot':'\xB7','minus':'\u2212','minusb':'\u229F','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','mopf':'\uD835\uDD5E','Mopf':'\uD835\uDD44','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','mu':'\u03BC','Mu':'\u039C','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','nacute':'\u0144','Nacute':'\u0143','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natur':'\u266E','natural':'\u266E','naturals':'\u2115','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','ncaron':'\u0148','Ncaron':'\u0147','ncedil':'\u0146','Ncedil':'\u0145','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','ncy':'\u043D','Ncy':'\u041D','ndash':'\u2013','ne':'\u2260','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','nfr':'\uD835\uDD2B','Nfr':'\uD835\uDD11','nge':'\u2271','ngE':'\u2267\u0338','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','ngt':'\u226F','nGt':'\u226B\u20D2','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','njcy':'\u045A','NJcy':'\u040A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nle':'\u2270','nlE':'\u2266\u0338','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nlt':'\u226E','nLt':'\u226A\u20D2','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','not':'\xAC','Not':'\u2AEC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangle':'\u22EA','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangle':'\u22EB','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','npar':'\u2226','nparallel':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','npre':'\u2AAF\u0338','nprec':'\u2280','npreceq':'\u2AAF\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrc':'\u2933\u0338','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','nscr':'\uD835\uDCC3','Nscr':'\uD835\uDCA9','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsube':'\u2288','nsubE':'\u2AC5\u0338','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupe':'\u2289','nsupE':'\u2AC6\u0338','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','ntilde':'\xF1','Ntilde':'\xD1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','nu':'\u03BD','Nu':'\u039D','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','oacute':'\xF3','Oacute':'\xD3','oast':'\u229B','ocir':'\u229A','ocirc':'\xF4','Ocirc':'\xD4','ocy':'\u043E','Ocy':'\u041E','odash':'\u229D','odblac':'\u0151','Odblac':'\u0150','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','oelig':'\u0153','OElig':'\u0152','ofcir':'\u29BF','ofr':'\uD835\uDD2C','Ofr':'\uD835\uDD12','ogon':'\u02DB','ograve':'\xF2','Ograve':'\xD2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','omacr':'\u014D','Omacr':'\u014C','omega':'\u03C9','Omega':'\u03A9','omicron':'\u03BF','Omicron':'\u039F','omid':'\u29B6','ominus':'\u2296','oopf':'\uD835\uDD60','Oopf':'\uD835\uDD46','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','or':'\u2228','Or':'\u2A54','orarr':'\u21BB','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','oscr':'\u2134','Oscr':'\uD835\uDCAA','oslash':'\xF8','Oslash':'\xD8','osol':'\u2298','otilde':'\xF5','Otilde':'\xD5','otimes':'\u2297','Otimes':'\u2A37','otimesas':'\u2A36','ouml':'\xF6','Ouml':'\xD6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','par':'\u2225','para':'\xB6','parallel':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','pcy':'\u043F','Pcy':'\u041F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','pfr':'\uD835\uDD2D','Pfr':'\uD835\uDD13','phi':'\u03C6','Phi':'\u03A6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','pi':'\u03C0','Pi':'\u03A0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plus':'+','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','pr':'\u227A','Pr':'\u2ABB','prap':'\u2AB7','prcue':'\u227C','pre':'\u2AAF','prE':'\u2AB3','prec':'\u227A','precapprox':'\u2AB7','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportion':'\u2237','Proportional':'\u221D','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','pscr':'\uD835\uDCC5','Pscr':'\uD835\uDCAB','psi':'\u03C8','Psi':'\u03A8','puncsp':'\u2008','qfr':'\uD835\uDD2E','Qfr':'\uD835\uDD14','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','qscr':'\uD835\uDCC6','Qscr':'\uD835\uDCAC','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','racute':'\u0155','Racute':'\u0154','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarr':'\u2192','rArr':'\u21D2','Rarr':'\u21A0','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','rarrtl':'\u21A3','Rarrtl':'\u2916','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','rcaron':'\u0159','Rcaron':'\u0158','rcedil':'\u0157','Rcedil':'\u0156','rceil':'\u2309','rcub':'}','rcy':'\u0440','Rcy':'\u0420','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','Re':'\u211C','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','rho':'\u03C1','Rho':'\u03A1','rhov':'\u03F1','RightAngleBracket':'\u27E9','rightarrow':'\u2192','Rightarrow':'\u21D2','RightArrow':'\u2192','RightArrowBar':'\u21E5','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVector':'\u21C2','RightDownVectorBar':'\u2955','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTee':'\u22A2','RightTeeArrow':'\u21A6','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangle':'\u22B3','RightTriangleBar':'\u29D0','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVector':'\u21BE','RightUpVectorBar':'\u2954','RightVector':'\u21C0','RightVectorBar':'\u2953','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoust':'\u23B1','rmoustache':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','sacute':'\u015B','Sacute':'\u015A','sbquo':'\u201A','sc':'\u227B','Sc':'\u2ABC','scap':'\u2AB8','scaron':'\u0161','Scaron':'\u0160','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','scedil':'\u015F','Scedil':'\u015E','scirc':'\u015D','Scirc':'\u015C','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','scy':'\u0441','Scy':'\u0421','sdot':'\u22C5','sdotb':'\u22A1','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','sfr':'\uD835\uDD30','Sfr':'\uD835\uDD16','sfrown':'\u2322','sharp':'\u266F','shchcy':'\u0449','SHCHcy':'\u0429','shcy':'\u0448','SHcy':'\u0428','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','sigma':'\u03C3','Sigma':'\u03A3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','softcy':'\u044C','SOFTcy':'\u042C','sol':'/','solb':'\u29C4','solbar':'\u233F','sopf':'\uD835\uDD64','Sopf':'\uD835\uDD4A','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','squ':'\u25A1','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squf':'\u25AA','srarr':'\u2192','sscr':'\uD835\uDCC8','Sscr':'\uD835\uDCAE','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','star':'\u2606','Star':'\u22C6','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','sube':'\u2286','subE':'\u2AC5','subedot':'\u2AC3','submult':'\u2AC1','subne':'\u228A','subnE':'\u2ACB','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succ':'\u227B','succapprox':'\u2AB8','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup':'\u2283','Sup':'\u22D1','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','supdot':'\u2ABE','supdsub':'\u2AD8','supe':'\u2287','supE':'\u2AC6','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supne':'\u228B','supnE':'\u2ACC','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','tau':'\u03C4','Tau':'\u03A4','tbrk':'\u23B4','tcaron':'\u0165','Tcaron':'\u0164','tcedil':'\u0163','Tcedil':'\u0162','tcy':'\u0442','Tcy':'\u0422','tdot':'\u20DB','telrec':'\u2315','tfr':'\uD835\uDD31','Tfr':'\uD835\uDD17','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','theta':'\u03B8','Theta':'\u0398','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','thinsp':'\u2009','ThinSpace':'\u2009','thkap':'\u2248','thksim':'\u223C','thorn':'\xFE','THORN':'\xDE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','times':'\xD7','timesb':'\u22A0','timesbar':'\u2A31','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','top':'\u22A4','topbot':'\u2336','topcir':'\u2AF1','topf':'\uD835\uDD65','Topf':'\uD835\uDD4B','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','tscr':'\uD835\uDCC9','Tscr':'\uD835\uDCAF','tscy':'\u0446','TScy':'\u0426','tshcy':'\u045B','TSHcy':'\u040B','tstrok':'\u0167','Tstrok':'\u0166','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','uacute':'\xFA','Uacute':'\xDA','uarr':'\u2191','uArr':'\u21D1','Uarr':'\u219F','Uarrocir':'\u2949','ubrcy':'\u045E','Ubrcy':'\u040E','ubreve':'\u016D','Ubreve':'\u016C','ucirc':'\xFB','Ucirc':'\xDB','ucy':'\u0443','Ucy':'\u0423','udarr':'\u21C5','udblac':'\u0171','Udblac':'\u0170','udhar':'\u296E','ufisht':'\u297E','ufr':'\uD835\uDD32','Ufr':'\uD835\uDD18','ugrave':'\xF9','Ugrave':'\xD9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','umacr':'\u016B','Umacr':'\u016A','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','uogon':'\u0173','Uogon':'\u0172','uopf':'\uD835\uDD66','Uopf':'\uD835\uDD4C','uparrow':'\u2191','Uparrow':'\u21D1','UpArrow':'\u2191','UpArrowBar':'\u2912','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','Updownarrow':'\u21D5','UpDownArrow':'\u2195','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','upsilon':'\u03C5','Upsilon':'\u03A5','UpTee':'\u22A5','UpTeeArrow':'\u21A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','uring':'\u016F','Uring':'\u016E','urtri':'\u25F9','uscr':'\uD835\uDCCA','Uscr':'\uD835\uDCB0','utdot':'\u22F0','utilde':'\u0169','Utilde':'\u0168','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','uuml':'\xFC','Uuml':'\xDC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','vcy':'\u0432','Vcy':'\u0412','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','vee':'\u2228','Vee':'\u22C1','veebar':'\u22BB','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','vfr':'\uD835\uDD33','Vfr':'\uD835\uDD19','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','vopf':'\uD835\uDD67','Vopf':'\uD835\uDD4D','vprop':'\u221D','vrtri':'\u22B3','vscr':'\uD835\uDCCB','Vscr':'\uD835\uDCB1','vsubne':'\u228A\uFE00','vsubnE':'\u2ACB\uFE00','vsupne':'\u228B\uFE00','vsupnE':'\u2ACC\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','wcirc':'\u0175','Wcirc':'\u0174','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','wfr':'\uD835\uDD34','Wfr':'\uD835\uDD1A','wopf':'\uD835\uDD68','Wopf':'\uD835\uDD4E','wp':'\u2118','wr':'\u2240','wreath':'\u2240','wscr':'\uD835\uDCCC','Wscr':'\uD835\uDCB2','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','xfr':'\uD835\uDD35','Xfr':'\uD835\uDD1B','xharr':'\u27F7','xhArr':'\u27FA','xi':'\u03BE','Xi':'\u039E','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','xopf':'\uD835\uDD69','Xopf':'\uD835\uDD4F','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','xscr':'\uD835\uDCCD','Xscr':'\uD835\uDCB3','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','yacute':'\xFD','Yacute':'\xDD','yacy':'\u044F','YAcy':'\u042F','ycirc':'\u0177','Ycirc':'\u0176','ycy':'\u044B','Ycy':'\u042B','yen':'\xA5','yfr':'\uD835\uDD36','Yfr':'\uD835\uDD1C','yicy':'\u0457','YIcy':'\u0407','yopf':'\uD835\uDD6A','Yopf':'\uD835\uDD50','yscr':'\uD835\uDCCE','Yscr':'\uD835\uDCB4','yucy':'\u044E','YUcy':'\u042E','yuml':'\xFF','Yuml':'\u0178','zacute':'\u017A','Zacute':'\u0179','zcaron':'\u017E','Zcaron':'\u017D','zcy':'\u0437','Zcy':'\u0417','zdot':'\u017C','Zdot':'\u017B','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','zeta':'\u03B6','Zeta':'\u0396','zfr':'\uD835\uDD37','Zfr':'\u2128','zhcy':'\u0436','ZHcy':'\u0416','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','zscr':'\uD835\uDCCF','Zscr':'\uD835\uDCB5','zwj':'\u200D','zwnj':'\u200C'};
	var decodeMapLegacy = {'aacute':'\xE1','Aacute':'\xC1','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','aelig':'\xE6','AElig':'\xC6','agrave':'\xE0','Agrave':'\xC0','amp':'&','AMP':'&','aring':'\xE5','Aring':'\xC5','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','brvbar':'\xA6','ccedil':'\xE7','Ccedil':'\xC7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','eacute':'\xE9','Eacute':'\xC9','ecirc':'\xEA','Ecirc':'\xCA','egrave':'\xE8','Egrave':'\xC8','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','iacute':'\xED','Iacute':'\xCD','icirc':'\xEE','Icirc':'\xCE','iexcl':'\xA1','igrave':'\xEC','Igrave':'\xCC','iquest':'\xBF','iuml':'\xEF','Iuml':'\xCF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','ntilde':'\xF1','Ntilde':'\xD1','oacute':'\xF3','Oacute':'\xD3','ocirc':'\xF4','Ocirc':'\xD4','ograve':'\xF2','Ograve':'\xD2','ordf':'\xAA','ordm':'\xBA','oslash':'\xF8','Oslash':'\xD8','otilde':'\xF5','Otilde':'\xD5','ouml':'\xF6','Ouml':'\xD6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','thorn':'\xFE','THORN':'\xDE','times':'\xD7','uacute':'\xFA','Uacute':'\xDA','ucirc':'\xFB','Ucirc':'\xDB','ugrave':'\xF9','Ugrave':'\xD9','uml':'\xA8','uuml':'\xFC','Uuml':'\xDC','yacute':'\xFD','Yacute':'\xDD','yen':'\xA5','yuml':'\xFF'};
	var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
	var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	var object = {};
	var hasOwnProperty = object.hasOwnProperty;
	var has = function(object, propertyName) {
		return hasOwnProperty.call(object, propertyName);
	};

	var contains = function(array, value) {
		var index = -1;
		var length = array.length;
		while (++index < length) {
			if (array[index] == value) {
				return true;
			}
		}
		return false;
	};

	var merge = function(options, defaults) {
		if (!options) {
			return defaults;
		}
		var result = {};
		var key;
		for (key in defaults) {
			// A `hasOwnProperty` check is not needed here, since only recognized
			// option names are used anyway. Any others are ignored.
			result[key] = has(options, key) ? options[key] : defaults[key];
		}
		return result;
	};

	// Modified version of `ucs2encode`; see https://mths.be/punycode.
	var codePointToSymbol = function(codePoint, strict) {
		var output = '';
		if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
			// See issue #4:
			// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
			// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
			// REPLACEMENT CHARACTER.”
			if (strict) {
				parseError('character reference outside the permissible Unicode range');
			}
			return '\uFFFD';
		}
		if (has(decodeMapNumeric, codePoint)) {
			if (strict) {
				parseError('disallowed character reference');
			}
			return decodeMapNumeric[codePoint];
		}
		if (strict && contains(invalidReferenceCodePoints, codePoint)) {
			parseError('disallowed character reference');
		}
		if (codePoint > 0xFFFF) {
			codePoint -= 0x10000;
			output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
			codePoint = 0xDC00 | codePoint & 0x3FF;
		}
		output += stringFromCharCode(codePoint);
		return output;
	};

	var hexEscape = function(codePoint) {
		return '&#x' + codePoint.toString(16).toUpperCase() + ';';
	};

	var decEscape = function(codePoint) {
		return '&#' + codePoint + ';';
	};

	var parseError = function(message) {
		throw Error('Parse error: ' + message);
	};

	/*--------------------------------------------------------------------------*/

	var encode = function(string, options) {
		options = merge(options, encode.options);
		var strict = options.strict;
		if (strict && regexInvalidRawCodePoint.test(string)) {
			parseError('forbidden code point');
		}
		var encodeEverything = options.encodeEverything;
		var useNamedReferences = options.useNamedReferences;
		var allowUnsafeSymbols = options.allowUnsafeSymbols;
		var escapeCodePoint = options.decimal ? decEscape : hexEscape;

		var escapeBmpSymbol = function(symbol) {
			return escapeCodePoint(symbol.charCodeAt(0));
		};

		if (encodeEverything) {
			// Encode ASCII symbols.
			string = string.replace(regexAsciiWhitelist, function(symbol) {
				// Use named references if requested & possible.
				if (useNamedReferences && has(encodeMap, symbol)) {
					return '&' + encodeMap[symbol] + ';';
				}
				return escapeBmpSymbol(symbol);
			});
			// Shorten a few escapes that represent two symbols, of which at least one
			// is within the ASCII range.
			if (useNamedReferences) {
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;')
					.replace(/&#x66;&#x6A;/g, '&fjlig;');
			}
			// Encode non-ASCII symbols.
			if (useNamedReferences) {
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			}
			// Note: any remaining non-ASCII symbols are handled outside of the `if`.
		} else if (useNamedReferences) {
			// Apply named character references.
			// Encode `<>"'&` using named character references.
			if (!allowUnsafeSymbols) {
				string = string.replace(regexEscape, function(string) {
					return '&' + encodeMap[string] + ';'; // no need to check `has()` here
				});
			}
			// Shorten escapes that represent two symbols, of which at least one is
			// `<>"'&`.
			string = string
				.replace(/&gt;\u20D2/g, '&nvgt;')
				.replace(/&lt;\u20D2/g, '&nvlt;');
			// Encode non-ASCII symbols that can be replaced with a named reference.
			string = string.replace(regexEncodeNonAscii, function(string) {
				// Note: there is no need to check `has(encodeMap, string)` here.
				return '&' + encodeMap[string] + ';';
			});
		} else if (!allowUnsafeSymbols) {
			// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
			// using named character references.
			string = string.replace(regexEscape, escapeBmpSymbol);
		}
		return string
			// Encode astral symbols.
			.replace(regexAstralSymbols, function($0) {
				// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
				var high = $0.charCodeAt(0);
				var low = $0.charCodeAt(1);
				var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
				return escapeCodePoint(codePoint);
			})
			// Encode any remaining BMP symbols that are not printable ASCII symbols
			// using a hexadecimal escape.
			.replace(regexBmpWhitelist, escapeBmpSymbol);
	};
	// Expose default options (so they can be overridden globally).
	encode.options = {
		'allowUnsafeSymbols': false,
		'encodeEverything': false,
		'strict': false,
		'useNamedReferences': false,
		'decimal' : false
	};

	var decode = function(html, options) {
		options = merge(options, decode.options);
		var strict = options.strict;
		if (strict && regexInvalidEntity.test(html)) {
			parseError('malformed character reference');
		}
		return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7, $8) {
			var codePoint;
			var semicolon;
			var decDigits;
			var hexDigits;
			var reference;
			var next;

			if ($1) {
				reference = $1;
				// Note: there is no need to check `has(decodeMap, reference)`.
				return decodeMap[reference];
			}

			if ($2) {
				// Decode named character references without trailing `;`, e.g. `&amp`.
				// This is only a parse error if it gets converted to `&`, or if it is
				// followed by `=` in an attribute context.
				reference = $2;
				next = $3;
				if (next && options.isAttributeValue) {
					if (strict && next == '=') {
						parseError('`&` did not start a character reference');
					}
					return $0;
				} else {
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					// Note: there is no need to check `has(decodeMapLegacy, reference)`.
					return decodeMapLegacy[reference] + (next || '');
				}
			}

			if ($4) {
				// Decode decimal escapes, e.g. `&#119558;`.
				decDigits = $4;
				semicolon = $5;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(decDigits, 10);
				return codePointToSymbol(codePoint, strict);
			}

			if ($6) {
				// Decode hexadecimal escapes, e.g. `&#x1D306;`.
				hexDigits = $6;
				semicolon = $7;
				if (strict && !semicolon) {
					parseError('character reference was not terminated by a semicolon');
				}
				codePoint = parseInt(hexDigits, 16);
				return codePointToSymbol(codePoint, strict);
			}

			// If we’re still here, `if ($7)` is implied; it’s an ambiguous
			// ampersand for sure. https://mths.be/notes/ambiguous-ampersands
			if (strict) {
				parseError(
					'named character reference was not terminated by a semicolon'
				);
			}
			return $0;
		});
	};
	// Expose default options (so they can be overridden globally).
	decode.options = {
		'isAttributeValue': false,
		'strict': false
	};

	var escape = function(string) {
		return string.replace(regexEscape, function($0) {
			// Note: there is no need to check `has(escapeMap, $0)` here.
			return escapeMap[$0];
		});
	};

	/*--------------------------------------------------------------------------*/

	var he = {
		'version': '1.2.0',
		'encode': encode,
		'decode': decode,
		'escape': escape,
		'unescape': decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
			return he;
		}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}	else { var key; }

}(this));

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

/***/ }),

/***/ "./node_modules/json-2-csv/src/constants.json":
/*!****************************************************!*\
  !*** ./node_modules/json-2-csv/src/constants.json ***!
  \****************************************************/
/*! exports provided: errors, defaultOptions, values, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"errors\":{\"callbackRequired\":\"A callback is required!\",\"optionsRequired\":\"Options were not passed and are required.\",\"json2csv\":{\"cannotCallOn\":\"Cannot call json2csv on \",\"dataCheckFailure\":\"Data provided was not an array of documents.\",\"notSameSchema\":\"Not all documents have the same schema.\"},\"csv2json\":{\"cannotCallOn\":\"Cannot call csv2json on \",\"dataCheckFailure\":\"CSV is not a string.\"}},\"defaultOptions\":{\"delimiter\":{\"field\":\",\",\"wrap\":\"\\\"\",\"eol\":\"\\n\"},\"excelBOM\":false,\"prependHeader\":true,\"trimHeaderFields\":false,\"trimFieldValues\":false,\"sortHeader\":false,\"parseCsvNumbers\":false,\"keys\":null,\"checkSchemaDifferences\":false,\"expandArrayObjects\":false,\"unwindArrays\":false,\"useLocaleFormat\":false},\"values\":{\"excelBOM\":\"﻿\"}}");

/***/ }),

/***/ "./node_modules/json-2-csv/src/converter.js":
/*!**************************************************!*\
  !*** ./node_modules/json-2-csv/src/converter.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let {Json2Csv} = __webpack_require__(/*! ./json2csv */ "./node_modules/json-2-csv/src/json2csv.js"), // Require our json-2-csv code
    {Csv2Json} = __webpack_require__(/*! ./csv2json */ "./node_modules/json-2-csv/src/csv2json.js"), // Require our csv-2-json code
    utils = __webpack_require__(/*! ./utils */ "./node_modules/json-2-csv/src/utils.js");

module.exports = {
    json2csv: (data, callback, options) => convert(Json2Csv, data, callback, options),
    csv2json: (data, callback, options) => convert(Csv2Json, data, callback, options),
    json2csvAsync: (json, options) => convertAsync(Json2Csv, json, options),
    csv2jsonAsync: (csv, options) => convertAsync(Csv2Json, csv, options),

    /**
     * @deprecated Since v3.0.0
     */
    json2csvPromisified: (json, options) => deprecatedAsync(Json2Csv, 'json2csvPromisified()', 'json2csvAsync()', json, options),

    /**
     * @deprecated Since v3.0.0
     */
    csv2jsonPromisified: (csv, options) => deprecatedAsync(Csv2Json, 'csv2jsonPromisified()', 'csv2jsonAsync()', csv, options)
};

/**
 * Abstracted converter function for json2csv and csv2json functionality
 * Takes in the converter to be used (either Json2Csv or Csv2Json)
 * @param converter
 * @param data
 * @param callback
 * @param options
 */
function convert(converter, data, callback, options) {
    return utils.convert({
        data: data,
        callback,
        options,
        converter: converter
    });
}

/**
 * Simple way to promisify a callback version of json2csv or csv2json
 * @param converter
 * @param data
 * @param options
 * @returns {Promise<any>}
 */
function convertAsync(converter, data, options) {
    return new Promise((resolve, reject) => convert(converter, data, (err, data) => {
        if (err) {
            return reject(err);
        }
        return resolve(data);
    }, options));
}

/**
 * Simple way to provide a deprecation warning for previous promisified versions
 * of module functionality.
 * @param converter
 * @param deprecatedName
 * @param replacementName
 * @param data
 * @param options
 * @returns {Promise<any>}
 */
function deprecatedAsync(converter, deprecatedName, replacementName, data, options) {
    console.warn('WARNING: ' + deprecatedName + ' is deprecated and will be removed soon. Please use ' + replacementName + ' instead.');
    return convertAsync(converter, data, options);
}


/***/ }),

/***/ "./node_modules/json-2-csv/src/csv2json.js":
/*!*************************************************!*\
  !*** ./node_modules/json-2-csv/src/csv2json.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let path = __webpack_require__(/*! doc-path */ "./node_modules/doc-path/src/path.js"),
    constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json"),
    utils = __webpack_require__(/*! ./utils */ "./node_modules/json-2-csv/src/utils.js");

const Csv2Json = function(options) {
    const escapedWrapDelimiterRegex = new RegExp(options.delimiter.wrap + options.delimiter.wrap, 'g'),
        excelBOMRegex = new RegExp('^' + constants.values.excelBOM);

    /**
     * Trims the header key, if specified by the user via the provided options
     * @param headerKey
     * @returns {*}
     */
    function processHeaderKey(headerKey) {
        headerKey = removeWrapDelimitersFromValue(headerKey);
        if (options.trimHeaderFields) {
            return headerKey.split('.')
                .map((component) => component.trim())
                .join('.');
        }
        return headerKey;
    }

    /**
     * Generate the JSON heading from the CSV
     * @param lines {String[]} csv lines split by EOL delimiter
     * @returns {*}
     */
    function retrieveHeading(lines) {
        let params = {lines},
            // Generate and return the heading keys
            headerRow = params.lines[0];
        params.headerFields = headerRow.map((headerKey, index) => ({
            value: processHeaderKey(headerKey),
            index: index
        }));

        // If the user provided keys, filter the generated keys to just the user provided keys so we also have the key index
        if (options.keys) {
            params.headerFields = params.headerFields.filter((headerKey) => options.keys.includes(headerKey.value));
        }

        return params;
    }

    /**
     * Splits the lines of the CSV string by the EOL delimiter and resolves and array of strings (lines)
     * @param csv
     * @returns {Promise.<String[]>}
     */
    function splitCsvLines(csv) {
        return Promise.resolve(splitLines(csv));
    }

    /**
     * Removes the Excel BOM value, if specified by the options object
     * @param csv
     * @returns {Promise.<String>}
     */
    function stripExcelBOM(csv) {
        if (options.excelBOM) {
            return Promise.resolve(csv.replace(excelBOMRegex, ''));
        }
        return Promise.resolve(csv);
    }

    /**
     * Helper function that splits a line so that we can handle wrapped fields
     * @param csv
     */
    function splitLines(csv) {
        // Parse out the line...
        let lines = [],
            splitLine = [],
            character,
            charBefore,
            charAfter,
            nextNChar,
            lastCharacterIndex = csv.length - 1,
            eolDelimiterLength = options.delimiter.eol.length,
            stateVariables = {
                insideWrapDelimiter: false,
                parsingValue: true,
                justParsedDoubleQuote: false,
                startIndex: 0
            },
            index = 0;

        // Loop through each character in the line to identify where to split the values
        while (index < csv.length) {
            // Current character
            character = csv[index];
            // Previous character
            charBefore = index ? csv[index - 1] : '';
            // Next character
            charAfter = index < lastCharacterIndex ? csv[index + 1] : '';
            // Next n characters, including the current character, where n = length(EOL delimiter)
            // This allows for the checking of an EOL delimiter when if it is more than a single character (eg. '\r\n')
            nextNChar = utils.getNCharacters(csv, index, eolDelimiterLength);

            if ((nextNChar === options.delimiter.eol && !stateVariables.insideWrapDelimiter ||
                index === lastCharacterIndex) && charBefore === options.delimiter.field) {
                // If we reached an EOL delimiter or the end of the csv and the previous character is a field delimiter...

                // If the start index is the current index (and since the previous character is a comma),
                //   then the value being parsed is an empty value accordingly, add an empty string
                let parsedValue = nextNChar === options.delimiter.eol && stateVariables.startIndex === index
                    ? ''
                    // Otherwise, there's a valid value, and the start index isn't the current index, grab the whole value
                    : csv.substr(stateVariables.startIndex);

                // Push the value for the field that we were parsing
                splitLine.push(parsedValue);

                // Since the last character is a comma, there's still an additional implied field value trailing the comma.
                //   Since this value is empty, we push an extra empty value
                splitLine.push('');

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if (index === lastCharacterIndex && character === options.delimiter.field) {
                // If we reach the end of the CSV and the current character is a field delimiter

                // Parse the previously seen value and add it to the line
                let parsedValue = csv.substring(stateVariables.startIndex, index);
                splitLine.push(parsedValue);

                // Then add an empty string to the line since the last character being a field delimiter indicates an empty field
                splitLine.push('');
                lines.push(splitLine);
            } else if (index === lastCharacterIndex || nextNChar === options.delimiter.eol &&
                // if we aren't inside wrap delimiters or if we are but the character before was a wrap delimiter and we didn't just see two
                (!stateVariables.insideWrapDelimiter ||
                    stateVariables.insideWrapDelimiter && charBefore === options.delimiter.wrap && !stateVariables.justParsedDoubleQuote)) {
                // Otherwise if we reached the end of the line or csv (and current character is not a field delimiter)

                let toIndex = index !== lastCharacterIndex || charBefore === options.delimiter.wrap ? index : undefined;

                // Retrieve the remaining value and add it to the split line list of values
                splitLine.push(csv.substring(stateVariables.startIndex, toIndex));

                // Finally, push the split line values into the lines array and clear the split line
                lines.push(splitLine);
                splitLine = [];
                stateVariables.startIndex = index + eolDelimiterLength;
                stateVariables.parsingValue = true;
                stateVariables.insideWrapDelimiter = charAfter === options.delimiter.wrap;
            } else if ((charBefore !== options.delimiter.wrap || stateVariables.justParsedDoubleQuote && charBefore === options.delimiter.wrap) &&
                character === options.delimiter.wrap && utils.getNCharacters(csv, index + 1, eolDelimiterLength) === options.delimiter.eol) {
                // If we reach a wrap which is not preceded by a wrap delim and the next character is an EOL delim (ie. *"\n)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
                // Next iteration will substring, add the value to the line, and push the line onto the array of lines
            } else if (character === options.delimiter.wrap && (index === 0 || utils.getNCharacters(csv, index - eolDelimiterLength, eolDelimiterLength) === options.delimiter.eol)) {
                // If the line starts with a wrap delimiter (ie. "*)

                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.field) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. *",)

                splitLine.push(csv.substring(stateVariables.startIndex, index + 1));
                stateVariables.startIndex = index + 2; // next value starts after the field delimiter
                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = false;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && !stateVariables.parsingValue) {
                // If we reached a wrap delimiter after a comma and we aren't inside a wrap delimiter

                stateVariables.startIndex = index;
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
            } else if (character === options.delimiter.wrap && charBefore === options.delimiter.field &&
                !stateVariables.insideWrapDelimiter && stateVariables.parsingValue) {
                // If we reached a wrap delimiter with a field delimiter after it (ie. ,"*)

                splitLine.push(csv.substring(stateVariables.startIndex, index - 1));
                stateVariables.insideWrapDelimiter = true;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index;
            } else if (character === options.delimiter.wrap && charAfter === options.delimiter.wrap) {
                // If we run into an escaped quote (ie. "") skip past the second quote

                index += 2;
                stateVariables.justParsedDoubleQuote = true;
                continue;
            } else if (character === options.delimiter.field && charBefore !== options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.insideWrapDelimiter &&
                stateVariables.parsingValue) {
                // If we reached a field delimiter and are not inside the wrap delimiters (ie. *,*)

                splitLine.push(csv.substring(stateVariables.startIndex, index));
                stateVariables.startIndex = index + 1;
            } else if (character === options.delimiter.field && charBefore === options.delimiter.wrap &&
                charAfter !== options.delimiter.wrap && !stateVariables.parsingValue) {
                // If we reached a field delimiter, the previous character was a wrap delimiter, and the
                //   next character is not a wrap delimiter (ie. ",*)

                stateVariables.insideWrapDelimiter = false;
                stateVariables.parsingValue = true;
                stateVariables.startIndex = index + 1;
            }
            // Otherwise increment to the next character
            index++;
            // Reset the double quote state variable
            stateVariables.justParsedDoubleQuote = false;
        }

        return lines;
    }

    /**
     * Retrieves the record lines from the split CSV lines and sets it on the params object
     * @param params
     * @returns {*}
     */
    function retrieveRecordLines(params) {
        params.recordLines = params.lines.splice(1); // All lines except for the header line

        return params;
    }

    /**
     * Retrieves the value for the record from the line at the provided key.
     * @param line {String[]} split line values for the record
     * @param key {Object} {index: Number, value: String}
     */
    function retrieveRecordValueFromLine(line, key) {
        // If there is a value at the key's index, use it; otherwise, null
        let value = line[key.index];

        // Perform any necessary value conversions on the record value
        return processRecordValue(value);
    }

    /**
     * Processes the record's value by parsing the data to ensure the CSV is
     * converted to the JSON that created it.
     * @param fieldValue {String}
     * @returns {*}
     */
    function processRecordValue(fieldValue) {
        // If the value is an array representation, convert it
        let parsedJson = parseValue(fieldValue);
        // If parsedJson is anything aside from an error, then we want to use the parsed value
        // This allows us to interpret values like 'null' --> null, 'false' --> false
        if (!utils.isError(parsedJson) && !utils.isInvalid(parsedJson)) {
            fieldValue = parsedJson;
        } else if (fieldValue === 'undefined') {
            fieldValue = undefined;
        }

        return fieldValue;
    }

    /**
     * Trims the record value, if specified by the user via the options object
     * @param fieldValue
     * @returns {String|null}
     */
    function trimRecordValue(fieldValue) {
        if (options.trimFieldValues && !utils.isNull(fieldValue)) {
            return fieldValue.trim();
        }
        return fieldValue;
    }

    /**
     * Create a JSON document with the given keys (designated by the CSV header)
     *   and the values (from the given line)
     * @param keys String[]
     * @param line String
     * @returns {Object} created json document
     */
    function createDocument(keys, line) {
        // Reduce the keys into a JSON document representing the given line
        return keys.reduce((document, key) => {
            // If there is a value at the key's index in the line, set the value; otherwise null
            let value = retrieveRecordValueFromLine(line, key);

            // Otherwise add the key and value to the document
            return path.setPath(document, key.value, value);
        }, {});
    }

    /**
     * Removes the outermost wrap delimiters from a value, if they are present
     * Otherwise, the non-wrapped value is returned as is
     * @param fieldValue
     * @returns {String}
     */
    function removeWrapDelimitersFromValue(fieldValue) {
        let firstChar = fieldValue[0],
            lastIndex = fieldValue.length - 1,
            lastChar = fieldValue[lastIndex];
        // If the field starts and ends with a wrap delimiter
        if (firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap) {
            return fieldValue.substr(1, lastIndex - 1);
        }
        return fieldValue;
    }

    /**
     * Unescapes wrap delimiters by replacing duplicates with a single (eg. "" -> ")
     * This is done in order to parse RFC 4180 compliant CSV back to JSON
     * @param fieldValue
     * @returns {String}
     */
    function unescapeWrapDelimiterInField(fieldValue) {
        return fieldValue.replace(escapedWrapDelimiterRegex, options.delimiter.wrap);
    }

    /**
     * Main helper function to convert the CSV to the JSON document array
     * @param params {Object} {lines: [String], callback: Function}
     * @returns {Array}
     */
    function transformRecordLines(params) {
        params.json = params.recordLines.reduce((generatedJsonObjects, line) => { // For each line, create the document and add it to the array of documents
            line = line.map((fieldValue) => {
                // Perform the necessary operations on each line
                fieldValue = removeWrapDelimitersFromValue(fieldValue);
                fieldValue = unescapeWrapDelimiterInField(fieldValue);
                fieldValue = trimRecordValue(fieldValue);

                return fieldValue;
            });

            let generatedDocument = createDocument(params.headerFields, line);
            return generatedJsonObjects.concat(generatedDocument);
        }, []);

        return params;
    }

    /**
     * Attempts to parse the provided value. If it is not parsable, then an error is returned
     * @param value
     * @returns {*}
     */
    function parseValue(value) {
        try {
            if (utils.isStringRepresentation(value, options) && !utils.isDateRepresentation(value)) {
                return value;
            }

            let parsedJson = JSON.parse(value);

            // If the parsed value is an array, then we also need to trim record values, if specified
            if (Array.isArray(parsedJson)) {
                return parsedJson.map(trimRecordValue);
            }

            return parsedJson;
        } catch (err) {
            return err;
        }
    }

    /**
     * Internally exported csv2json function
     * Takes options as a document, data as a CSV string, and a callback that will be used to report the results
     * @param data String csv string
     * @param callback Function callback function
     */
    function convert(data, callback) {
        // Split the CSV into lines using the specified EOL option
        // validateCsv(data, callback)
        //     .then(stripExcelBOM)
        stripExcelBOM(data)
            .then(splitCsvLines)
            .then(retrieveHeading) // Retrieve the headings from the CSV, unless the user specified the keys
            .then(retrieveRecordLines) // Retrieve the record lines from the CSV
            .then(transformRecordLines) // Retrieve the JSON document array
            .then((params) => callback(null, params.json)) // Send the data back to the caller
            .catch(callback);
    }

    return {
        convert,
        validationFn: utils.isString,
        validationMessages: constants.errors.csv2json
    };
};

module.exports = { Csv2Json };


/***/ }),

/***/ "./node_modules/json-2-csv/src/json2csv.js":
/*!*************************************************!*\
  !*** ./node_modules/json-2-csv/src/json2csv.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let path = __webpack_require__(/*! doc-path */ "./node_modules/doc-path/src/path.js"),
    deeks = __webpack_require__(/*! deeks */ "./node_modules/deeks/src/deeks.js"),
    constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json"),
    utils = __webpack_require__(/*! ./utils */ "./node_modules/json-2-csv/src/utils.js");

const Json2Csv = function(options) {
    const wrapDelimiterCheckRegex = new RegExp(options.delimiter.wrap, 'g'),
        crlfSearchRegex = /\r?\n|\r/,
        expandingWithoutUnwinding = options.expandArrayObjects && !options.unwindArrays,
        deeksOptions = {
            expandArrayObjects: expandingWithoutUnwinding,
            ignoreEmptyArraysWhenExpanding: expandingWithoutUnwinding
        };

    /** HEADER FIELD FUNCTIONS **/

    /**
     * Returns the list of data field names of all documents in the provided list
     * @param data {Array<Object>} Data to be converted
     * @returns {Promise.<Array[String]>}
     */
    function getFieldNameList(data) {
        // If keys weren't specified, then we'll use the list of keys generated by the deeks module
        return Promise.resolve(deeks.deepKeysFromList(data, deeksOptions));
    }

    /**
     * Processes the schemas by checking for schema differences, if so desired.
     * If schema differences are not to be checked, then it resolves the unique
     * list of field names.
     * @param documentSchemas
     * @returns {Promise.<Array[String]>}
     */
    function processSchemas(documentSchemas) {
        // If the user wants to check for the same schema (regardless of schema ordering)
        if (options.checkSchemaDifferences) {
            return checkSchemaDifferences(documentSchemas);
        } else {
            // Otherwise, we do not care if the schemas are different, so we should get the unique list of keys
            let uniqueFieldNames = utils.unique(utils.flatten(documentSchemas));
            return Promise.resolve(uniqueFieldNames);
        }
    }

    /**
     * This function performs the schema difference check, if the user specifies that it should be checked.
     * If there are no field names, then there are no differences.
     * Otherwise, we get the first schema and the remaining list of schemas
     * @param documentSchemas
     * @returns {*}
     */
    function checkSchemaDifferences(documentSchemas) {
        // have multiple documents - ensure only one schema (regardless of field ordering)
        let firstDocSchema = documentSchemas[0],
            restOfDocumentSchemas = documentSchemas.slice(1),
            schemaDifferences = computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas);

        // If there are schema inconsistencies, throw a schema not the same error
        if (schemaDifferences) {
            return Promise.reject(new Error(constants.errors.json2csv.notSameSchema));
        }

        return Promise.resolve(firstDocSchema);
    }

    /**
     * Computes the number of schema differences
     * @param firstDocSchema
     * @param restOfDocumentSchemas
     * @returns {*}
     */
    function computeNumberOfSchemaDifferences(firstDocSchema, restOfDocumentSchemas) {
        return restOfDocumentSchemas.reduce((schemaDifferences, documentSchema) => {
            // If there is a difference between the schemas, increment the counter of schema inconsistencies
            let numberOfDifferences = utils.computeSchemaDifferences(firstDocSchema, documentSchema).length;
            return numberOfDifferences > 0
                ? schemaDifferences + 1
                : schemaDifferences;
        }, 0);
    }

    /**
     * If so specified, this sorts the header field names alphabetically
     * @param fieldNames {Array<String>}
     * @returns {Array<String>} sorted field names, or unsorted if sorting not specified
     */
    function sortHeaderFields(fieldNames) {
        if (options.sortHeader) {
            return fieldNames.sort();
        }
        return fieldNames;
    }

    /**
     * Trims the header fields, if the user desires them to be trimmed.
     * @param params
     * @returns {*}
     */
    function trimHeaderFields(params) {
        if (options.trimHeaderFields) {
            params.headerFields = params.headerFields.map((field) => field.split('.')
                .map((component) => component.trim())
                .join('.')
            );
        }
        return params;
    }

    /**
     * Wrap the headings, if desired by the user.
     * @param params
     * @returns {*}
     */
    function wrapHeaderFields(params) {
        // only perform this if we are actually prepending the header
        if (options.prependHeader) {
            params.headerFields = params.headerFields.map(function(headingKey) {
                return wrapFieldValueIfNecessary(headingKey);
            });
        }
        return params;
    }

    /**
     * Generates the CSV header string by joining the headerFields by the field delimiter
     * @param params
     * @returns {*}
     */
    function generateCsvHeader(params) {
        params.header = params.headerFields.join(options.delimiter.field);
        return params;
    }

    /**
     * Retrieve the headings for all documents and return it.
     * This checks that all documents have the same schema.
     * @param data
     * @returns {Promise}
     */
    function retrieveHeaderFields(data) {
        if (options.keys && !options.unwindArrays) {
            return Promise.resolve(options.keys)
                .then(sortHeaderFields);
        }

        return getFieldNameList(data)
            .then(processSchemas)
            .then(sortHeaderFields);
    }

    /** RECORD FIELD FUNCTIONS **/

    /**
     * Unwinds objects in arrays within record objects if the user specifies the
     *   expandArrayObjects option. If not specified, this passes the params
     *   argument through to the next function in the promise chain.
     * @param params {Object}
     * @returns {Promise}
     */
    function unwindRecordsIfNecessary(params) {
        if (options.unwindArrays) {
            const originalRecordsLength = params.records.length;

            // Unwind each of the documents at the given headerField
            params.headerFields.forEach((headerField) => {
                params.records = utils.unwind(params.records, headerField);
            });

            return retrieveHeaderFields(params.records)
                .then((headerFields) => {
                    params.headerFields = headerFields;

                    // If we were able to unwind more arrays, then try unwinding again...
                    if (originalRecordsLength !== params.records.length) {
                        return unwindRecordsIfNecessary(params);
                    }
                    // Otherwise, we didn't unwind any additional arrays, so continue...

                    // If keys were provided, set the headerFields to the provided keys:
                    if (options.keys) {
                        params.headerFields = options.keys;
                    }
                    return params;
                });
        }
        return params;
    }

    /**
     * Main function which handles the processing of a record, or document to be converted to CSV format
     * This function specifies and performs the necessary operations in the necessary order
     * in order to obtain the data and convert it to CSV form while maintaining RFC 4180 compliance.
     * * Order of operations:
     * - Get fields from provided key list (as array of actual values)
     * - Convert the values to csv/string representation [possible option here for custom converters?]
     * - Trim fields
     * - Determine if they need to be wrapped (& wrap if necessary)
     * - Combine values for each line (by joining by field delimiter)
     * @param params
     * @returns {*}
     */
    function processRecords(params) {
        params.records = params.records.map((record) => {
            // Retrieve data for each of the headerFields from this record
            let recordFieldData = retrieveRecordFieldData(record, params.headerFields),

                // Process the data in this record and return the
                processedRecordData = recordFieldData.map((fieldValue) => {
                    fieldValue = trimRecordFieldValue(fieldValue);
                    fieldValue = recordFieldValueToString(fieldValue);
                    fieldValue = wrapFieldValueIfNecessary(fieldValue);

                    return fieldValue;
                });

            // Join the record data by the field delimiter
            return generateCsvRowFromRecord(processedRecordData);
        }).join(options.delimiter.eol);

        return params;
    }

    /**
     * Helper function intended to process *just* array values when the expandArrayObjects setting is set to true
     * @param recordFieldValue
     * @returns {*} processed array value
     */
    function processRecordFieldDataForExpandedArrayObject(recordFieldValue) {
        let filteredRecordFieldValue = utils.removeEmptyFields(recordFieldValue);

        // If we have an array and it's either empty of full of empty values, then use an empty value representation
        if (!recordFieldValue.length || !filteredRecordFieldValue.length) {
            return options.emptyFieldValue || '';
        } else if (filteredRecordFieldValue.length === 1) {
            // Otherwise, we have an array of actual values...
            // Since we are expanding array objects, we will want to key in on values of objects.
            return filteredRecordFieldValue[0]; // Extract the single value in the array
        }

        return recordFieldValue;
    }

    /**
     * Gets all field values from a particular record for the given list of fields
     * @param record
     * @param fields
     * @returns {Array}
     */
    function retrieveRecordFieldData(record, fields) {
        let recordValues = [];

        fields.forEach((field) => {
            let recordFieldValue = path.evaluatePath(record, field);

            if (!utils.isUndefined(options.emptyFieldValue) && utils.isEmptyField(recordFieldValue)) {
                recordFieldValue = options.emptyFieldValue;
            } else if (options.expandArrayObjects && Array.isArray(recordFieldValue)) {
                recordFieldValue = processRecordFieldDataForExpandedArrayObject(recordFieldValue);
            }

            recordValues.push(recordFieldValue);
        });

        return recordValues;
    }

    /**
     * Converts a record field value to its string representation
     * @param fieldValue
     * @returns {*}
     */
    function recordFieldValueToString(fieldValue) {
        if (Array.isArray(fieldValue) || utils.isObject(fieldValue) && !utils.isDate(fieldValue)) {
            return JSON.stringify(fieldValue);
        } else if (utils.isUndefined(fieldValue)) {
            return 'undefined';
        } else if (utils.isNull(fieldValue)) {
            return 'null';
        } else {
            return !options.useLocaleFormat ? fieldValue.toString() : fieldValue.toLocaleString();
        }
    }

    /**
     * Trims the record field value, if specified by the user's provided options
     * @param fieldValue
     * @returns {*}
     */
    function trimRecordFieldValue(fieldValue) {
        if (options.trimFieldValues) {
            if (Array.isArray(fieldValue)) {
                return fieldValue.map(trimRecordFieldValue);
            } else if (utils.isString(fieldValue)) {
                return fieldValue.trim();
            }
            return fieldValue;
        }
        return fieldValue;
    }

    /**
     * Escapes quotation marks in the field value, if necessary, and appropriately
     * wraps the record field value if it contains a comma (field delimiter),
     * quotation mark (wrap delimiter), or a line break (CRLF)
     * @param fieldValue
     * @returns {*}
     */
    function wrapFieldValueIfNecessary(fieldValue) {
        const wrapDelimiter = options.delimiter.wrap;

        // eg. includes quotation marks (default delimiter)
        if (fieldValue.includes(options.delimiter.wrap)) {
            // add an additional quotation mark before each quotation mark appearing in the field value
            fieldValue = fieldValue.replace(wrapDelimiterCheckRegex, wrapDelimiter + wrapDelimiter);
        }
        // if the field contains a comma (field delimiter), quotation mark (wrap delimiter), line break, or CRLF
        //   then enclose it in quotation marks (wrap delimiter)
        if (fieldValue.includes(options.delimiter.field) ||
            fieldValue.includes(options.delimiter.wrap) ||
            fieldValue.match(crlfSearchRegex)) {
            // wrap the field's value in a wrap delimiter (quotation marks by default)
            fieldValue = wrapDelimiter + fieldValue + wrapDelimiter;
        }

        return fieldValue;
    }

    /**
     * Generates the CSV record string by joining the field values together by the field delimiter
     * @param recordFieldValues
     */
    function generateCsvRowFromRecord(recordFieldValues) {
        return recordFieldValues.join(options.delimiter.field);
    }

    /** CSV COMPONENT COMBINER/FINAL PROCESSOR **/
    /**
     * Performs the final CSV construction by combining the fields in the appropriate
     * order depending on the provided options values and sends the generated CSV
     * back to the user
     * @param params
     */
    function generateCsvFromComponents(params) {
        let header = params.header,
            records = params.records,

            // If we are prepending the header, then add an EOL, otherwise just return the records
            csv = (options.excelBOM ? constants.values.excelBOM : '') +
                (options.prependHeader ? header + options.delimiter.eol : '') +
                records;

        return params.callback(null, csv);
    }

    /** MAIN CONVERTER FUNCTION **/

    /**
     * Internally exported json2csv function
     * Takes data as either a document or array of documents and a callback that will be used to report the results
     * @param data {Object|Array<Object>} documents to be converted to csv
     * @param callback {Function} callback function
     */
    function convert(data, callback) {
        // Single document, not an array
        if (utils.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        retrieveHeaderFields(data)
            .then((headerFields) => ({
                headerFields,
                callback,
                records: data
            }))
            .then(unwindRecordsIfNecessary)
            .then(processRecords)
            .then(wrapHeaderFields)
            .then(trimHeaderFields)
            .then(generateCsvHeader)
            .then(generateCsvFromComponents)
            .catch(callback);
    }

    return {
        convert,
        validationFn: utils.isObject,
        validationMessages: constants.errors.json2csv
    };
};

module.exports = { Json2Csv };


/***/ }),

/***/ "./node_modules/json-2-csv/src/utils.js":
/*!**********************************************!*\
  !*** ./node_modules/json-2-csv/src/utils.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


let path = __webpack_require__(/*! doc-path */ "./node_modules/doc-path/src/path.js"),
    constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json");

const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

module.exports = {
    isStringRepresentation,
    isDateRepresentation,
    computeSchemaDifferences,
    deepCopy,
    convert,
    isEmptyField,
    removeEmptyFields,
    getNCharacters,
    unwind,
    isInvalid,

    // underscore replacements:
    isString,
    isNull,
    isError,
    isDate,
    isUndefined,
    isObject,
    unique,
    flatten
};

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 * @param opts {Object} options object
 * @return {Object} options object
 */
function buildOptions(opts) {
    opts = {...constants.defaultOptions, ...opts || {}};

    // Note: Object.assign does a shallow default, we need to deep copy the delimiter object
    opts.delimiter = {...constants.defaultOptions.delimiter, ...opts.delimiter};

    // Otherwise, send the options back
    return opts;
}

/**
 * When promisified, the callback and options argument ordering is swapped, so
 * this function is intended to determine which argument is which and return
 * them in the correct order
 * @param arg1 {Object|Function} options or callback
 * @param arg2 {Object|Function} options or callback
 */
function parseArguments(arg1, arg2) {
    // If this was promisified (callback and opts are swapped) then fix the argument order.
    if (isObject(arg1) && !isFunction(arg1)) {
        return {
            options: arg1,
            callback: arg2
        };
    }
    // Regular ordering where the callback is provided before the options object
    return {
        options: arg2,
        callback: arg1
    };
}

/**
 * Validates the parameters passed in to json2csv and csv2json
 * @param config {Object} of the form: { data: {Any}, callback: {Function}, dataCheckFn: Function, errorMessages: {Object} }
 */
function validateParameters(config) {
    // If a callback wasn't provided, throw an error
    if (!config.callback) {
        throw new Error(constants.errors.callbackRequired);
    }

    // If we don't receive data, report an error
    if (!config.data) {
        config.callback(new Error(config.errorMessages.cannotCallOn + config.data + '.'));
        return false;
    }

    // The data provided data does not meet the type check requirement
    if (!config.dataCheckFn(config.data)) {
        config.callback(new Error(config.errorMessages.dataCheckFailure));
        return false;
    }

    // If we didn't hit any known error conditions, then the data is so far determined to be valid
    // Note: json2csv/csv2json may perform additional validity checks on the data
    return true;
}

/**
 * Abstracted function to perform the conversion of json-->csv or csv-->json
 * depending on the converter class that is passed via the params object
 * @param params {Object}
 */
function convert(params) {
    let {options, callback} = parseArguments(params.callback, params.options);
    options = buildOptions(options);

    let converter = new params.converter(options),

        // Validate the parameters before calling the converter's convert function
        valid = validateParameters({
            data: params.data,
            callback,
            errorMessages: converter.validationMessages,
            dataCheckFn: converter.validationFn
        });

    if (valid) converter.convert(params.data, callback);
}

/**
 * Utility function to deep copy an object, used by the module tests
 * @param obj
 * @returns {any}
 */
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a string. Given the RFC4180 requirements, that means that the value is
 *   wrapped in value wrap delimiters (usually a quotation mark on each side).
 * @param fieldValue
 * @param options
 * @returns {boolean}
 */
function isStringRepresentation(fieldValue, options) {
    const firstChar = fieldValue[0],
        lastIndex = fieldValue.length - 1,
        lastChar = fieldValue[lastIndex];

    // If the field starts and ends with a wrap delimiter
    return firstChar === options.delimiter.wrap && lastChar === options.delimiter.wrap;
}

/**
 * Helper function that determines whether the provided value is a representation
 *   of a date.
 * @param fieldValue
 * @returns {boolean}
 */
function isDateRepresentation(fieldValue) {
    return dateStringRegex.test(fieldValue);
}

/**
 * Helper function that determines the schema differences between two objects.
 * @param schemaA
 * @param schemaB
 * @returns {*}
 */
function computeSchemaDifferences(schemaA, schemaB) {
    return arrayDifference(schemaA, schemaB)
        .concat(arrayDifference(schemaB, schemaA));
}

/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 * @param fieldValue
 * @returns {boolean}
 */
function isEmptyField(fieldValue) {
    return isUndefined(fieldValue) || isNull(fieldValue) || fieldValue === '';
}

/**
 * Helper function that removes empty field values from an array.
 * @param fields
 * @returns {Array}
 */
function removeEmptyFields(fields) {
    return fields.filter((field) => !isEmptyField(field));
}

/**
 * Helper function that retrieves the next n characters from the start index in
 *   the string including the character at the start index. This is used to
 *   check if are currently at an EOL value, since it could be multiple
 *   characters in length (eg. '\r\n')
 * @param str
 * @param start
 * @param n
 * @returns {string}
 */
function getNCharacters(str, start, n) {
    return str.substring(start, start + n);
}

/**
 * The following unwind functionality is a heavily modified version of @edwincen's
 * unwind extension for lodash. Since lodash is a large package to require in,
 * and all of the required functionality was already being imported, either
 * natively or with doc-path, I decided to rewrite the majority of the logic
 * so that an additional dependency would not be required. The original code
 * with the lodash dependency can be found here:
 *
 * https://github.com/edwincen/unwind/blob/master/index.js
 */

/**
 * Core function that unwinds an item at the provided path
 * @param accumulator {Array<any>}
 * @param item {any}
 * @param fieldPath {String}
 */
function unwindItem(accumulator, item, fieldPath) {
    const valueToUnwind = path.evaluatePath(item, fieldPath);
    let cloned = deepCopy(item);

    if (Array.isArray(valueToUnwind) && valueToUnwind.length) {
        valueToUnwind.forEach((val) => {
            cloned = deepCopy(item);
            accumulator.push(path.setPath(cloned, fieldPath, val));
        });
    } else if (Array.isArray(valueToUnwind) && valueToUnwind.length === 0) {
        // Push an empty string so the value is empty since there are no values
        path.setPath(cloned, fieldPath, '');
        accumulator.push(cloned);
    } else {
        accumulator.push(cloned);
    }
}

/**
 * Main unwind function which takes an array and a field to unwind.
 * @param array {Array<any>}
 * @param field {String}
 * @returns {Array<any>}
 */
function unwind(array, field) {
    const result = [];
    array.forEach((item) => {
        unwindItem(result, item, field);
    });
    return result;
}

/*
 * Helper functions which were created to remove underscorejs from this package.
 */

function isString(value) {
    return typeof value === 'string';
}

function isObject(value) {
    return typeof value === 'object';
}

function isFunction(value) {
    return typeof value === 'function';
}

function isNull(value) {
    return value === null;
}

function isDate(value) {
    return value instanceof Date;
}

function isUndefined(value) {
    return typeof value === 'undefined';
}

function isError(value) {
    return Object.prototype.toString.call(value) === '[object Error]';
}

function arrayDifference(a, b) {
    return a.filter((x) => !b.includes(x));
}

function unique(array) {
    return [...new Set(array)];
}

function flatten(array) {
    return [].concat(...array);
}

/**
 * Used to help avoid incorrect values returned by JSON.parse when converting
 * CSV back to JSON, such as '39e1804' which JSON.parse converts to Infinity
 */
function isInvalid(parsedJson) {
    return parsedJson === Infinity ||
        parsedJson === -Infinity;
}


/***/ }),

/***/ "./node_modules/striptags/src/striptags.js":
/*!*************************************************!*\
  !*** ./node_modules/striptags/src/striptags.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;

(function (global) {

    // minimal symbol polyfill for IE11 and others
    if (typeof Symbol !== 'function') {
        var Symbol = function(name) {
            return name;
        }

        Symbol.nonNative = true;
    }

    const STATE_PLAINTEXT = Symbol('plaintext');
    const STATE_HTML      = Symbol('html');
    const STATE_COMMENT   = Symbol('comment');

    const ALLOWED_TAGS_REGEX  = /<(\w*)>/g;
    const NORMALIZE_TAG_REGEX = /<\/?([^\s\/>]+)/;

    function striptags(html, allowable_tags, tag_replacement) {
        html            = html || '';
        allowable_tags  = allowable_tags || [];
        tag_replacement = tag_replacement || '';

        let context = init_context(allowable_tags, tag_replacement);

        return striptags_internal(html, context);
    }

    function init_striptags_stream(allowable_tags, tag_replacement) {
        allowable_tags  = allowable_tags || [];
        tag_replacement = tag_replacement || '';

        let context = init_context(allowable_tags, tag_replacement);

        return function striptags_stream(html) {
            return striptags_internal(html || '', context);
        };
    }

    striptags.init_streaming_mode = init_striptags_stream;

    function init_context(allowable_tags, tag_replacement) {
        allowable_tags = parse_allowable_tags(allowable_tags);

        return {
            allowable_tags : allowable_tags,
            tag_replacement: tag_replacement,

            state         : STATE_PLAINTEXT,
            tag_buffer    : '',
            depth         : 0,
            in_quote_char : ''
        };
    }

    function striptags_internal(html, context) {
        let allowable_tags  = context.allowable_tags;
        let tag_replacement = context.tag_replacement;

        let state         = context.state;
        let tag_buffer    = context.tag_buffer;
        let depth         = context.depth;
        let in_quote_char = context.in_quote_char;
        let output        = '';

        for (let idx = 0, length = html.length; idx < length; idx++) {
            let char = html[idx];

            if (state === STATE_PLAINTEXT) {
                switch (char) {
                    case '<':
                        state       = STATE_HTML;
                        tag_buffer += char;
                        break;

                    default:
                        output += char;
                        break;
                }
            }

            else if (state === STATE_HTML) {
                switch (char) {
                    case '<':
                        // ignore '<' if inside a quote
                        if (in_quote_char) {
                            break;
                        }

                        // we're seeing a nested '<'
                        depth++;
                        break;

                    case '>':
                        // ignore '>' if inside a quote
                        if (in_quote_char) {
                            break;
                        }

                        // something like this is happening: '<<>>'
                        if (depth) {
                            depth--;

                            break;
                        }

                        // this is closing the tag in tag_buffer
                        in_quote_char = '';
                        state         = STATE_PLAINTEXT;
                        tag_buffer   += '>';

                        if (allowable_tags.has(normalize_tag(tag_buffer))) {
                            output += tag_buffer;
                        } else {
                            output += tag_replacement;
                        }

                        tag_buffer = '';
                        break;

                    case '"':
                    case '\'':
                        // catch both single and double quotes

                        if (char === in_quote_char) {
                            in_quote_char = '';
                        } else {
                            in_quote_char = in_quote_char || char;
                        }

                        tag_buffer += char;
                        break;

                    case '-':
                        if (tag_buffer === '<!-') {
                            state = STATE_COMMENT;
                        }

                        tag_buffer += char;
                        break;

                    case ' ':
                    case '\n':
                        if (tag_buffer === '<') {
                            state      = STATE_PLAINTEXT;
                            output    += '< ';
                            tag_buffer = '';

                            break;
                        }

                        tag_buffer += char;
                        break;

                    default:
                        tag_buffer += char;
                        break;
                }
            }

            else if (state === STATE_COMMENT) {
                switch (char) {
                    case '>':
                        if (tag_buffer.slice(-2) == '--') {
                            // close the comment
                            state = STATE_PLAINTEXT;
                        }

                        tag_buffer = '';
                        break;

                    default:
                        tag_buffer += char;
                        break;
                }
            }
        }

        // save the context for future iterations
        context.state         = state;
        context.tag_buffer    = tag_buffer;
        context.depth         = depth;
        context.in_quote_char = in_quote_char;

        return output;
    }

    function parse_allowable_tags(allowable_tags) {
        let tag_set = new Set();

        if (typeof allowable_tags === 'string') {
            let match;

            while ((match = ALLOWED_TAGS_REGEX.exec(allowable_tags))) {
                tag_set.add(match[1]);
            }
        }

        else if (!Symbol.nonNative &&
                 typeof allowable_tags[Symbol.iterator] === 'function') {

            tag_set = new Set(allowable_tags);
        }

        else if (typeof allowable_tags.forEach === 'function') {
            // IE11 compatible
            allowable_tags.forEach(tag_set.add, tag_set);
        }

        return tag_set;
    }

    function normalize_tag(tag_buffer) {
        let match = NORMALIZE_TAG_REGEX.exec(tag_buffer);

        return match ? match[1].toLowerCase() : null;
    }

    if (true) {
        // AMD
        !(__WEBPACK_AMD_DEFINE_RESULT__ = (function module_factory() { return striptags; }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    }

    else {}
}(this));


/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = function(module) {
	if (!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if (!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ "./src/captionsParser.ts":
/*!*******************************!*\
  !*** ./src/captionsParser.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const timestamp_1 = __importDefault(__webpack_require__(/*! ./timestamp */ "./src/timestamp.ts"));
class CaptionsParser {
    constructor() { }
    /**
     * Decompose xml text line by line.
     *
     * @param {string} aline
     * @returns {Aline}
     * @memberof CaptionsParser
     */
    decodeAline(aline) {
        const timestamp = this.pullTime(aline);
        const htmlText = aline
            .replace(/<text.+>/, "")
            .replace(/&amp;/gi, "&")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .replace(/\r?\n/g, " ");
        const striptags = __webpack_require__(/*! striptags */ "./node_modules/striptags/src/striptags.js");
        const he = __webpack_require__(/*! he */ "./node_modules/he/he.js");
        const decodedText = he.decode(htmlText);
        const text = striptags(decodedText);
        return {
            timestamp: timestamp,
            text: text,
        };
    }
    /**
     * Split lines into by a line.
     *
     * @param {string} lines
     * @returns {string[]}
     * @memberof CaptionsParser
     */
    explode(lines) {
        return lines.split("</text>").filter((line) => line && line.trim());
    }
    /**
     * Trim xml tag in first line
     *
     * @param {string} transcript
     * @returns {string[]}
     * @memberof CaptionsParser
     */
    removeXmlTag(transcript) {
        return transcript
            .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', "")
            .replace("</transcript>", "");
    }
    /**
     * Pull time from text data.
     * <text start="10.159" dur="2.563">
     * @param {string} aline
     * @returns {Timestamp}
     * @memberof CaptionsParser
     */
    pullTime(aline) {
        const startRegex = /start="([\d.]+)"/;
        const durRegex = /dur="([\d.]+)"/;
        return new timestamp_1.default(this.getTimeFromText(startRegex, aline), this.getTimeFromText(durRegex, aline));
    }
    /**
     * Execute RegExp.
     *
     * @private
     * @param {RegExp} regex
     * @param {string} aline
     * @returns {number}
     * @memberof CaptionsParser
     */
    getTimeFromText(regex, aline) {
        if (regex.test(aline)) {
            const [, time] = regex.exec(aline);
            return Number(time);
        }
        return 0;
    }
}
exports.default = CaptionsParser;


/***/ }),

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

/***/ "./src/converter.ts":
/*!**************************!*\
  !*** ./src/converter.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const captionsParser_1 = __importDefault(__webpack_require__(/*! ./captionsParser */ "./src/captionsParser.ts"));
class Converter {
    constructor(xmlResponse) {
        this.xmlResponse = xmlResponse;
    }
    /**
     * Convert to save in CSV format
     *
     * @returns {CsvAline[]}
     * @memberof Converter
     */
    toCsv() {
        const parser = new captionsParser_1.default();
        const trimTranscript = parser.explode(parser.removeXmlTag(this.xmlResponse));
        return trimTranscript.map((line) => {
            const aline = parser.decodeAline(line);
            return {
                startTime: aline.timestamp.getStartTime(),
                durationTime: aline.timestamp.getDurationTime(),
                text: aline.text,
            };
        });
    }
    /**
     * Convert to save in Text format
     *
     * @returns {TextAline[]}
     * @memberof Converter
     */
    toText() {
        const parser = new captionsParser_1.default();
        const trimTranscript = parser.explode(parser.removeXmlTag(this.xmlResponse));
        return trimTranscript.map((line) => {
            const aline = parser.decodeAline(line);
            return {
                text: aline.text,
            };
        });
    }
    /**
     * Convert to save in Srt format
     *
     * @returns {SrtAline[]}
     * @memberof Converter
     */
    toSrt() {
        const parser = new captionsParser_1.default();
        const trimTranscript = parser.explode(parser.removeXmlTag(this.xmlResponse));
        return trimTranscript.map((line, index) => {
            const numericCounter = index + 1 + "\n";
            const aline = parser.decodeAline(line);
            const text = aline.text.replace(/\n/, " ") + "\n";
            return {
                index: numericCounter,
                timestamp: aline.timestamp.formatSrt(),
                text: text,
            };
        });
    }
    /**
     * Convert to save in Vtt format
     *
     * @returns {VttAline[]}
     * @memberof Converter
     */
    toVtt() {
        const parser = new captionsParser_1.default();
        const trimTranscript = parser.explode(parser.removeXmlTag(this.xmlResponse));
        return trimTranscript.map((line) => {
            const aline = parser.decodeAline(line);
            const text = aline.text.replace(/\n/, " ") + "\n";
            return {
                timestamp: aline.timestamp.formatVtt(),
                text: text,
            };
        });
    }
    /**
     * Convert to save in LRC format
     *
     * @returns {LrcAline[]}
     * @memberof Converter
     */
    toLrc() {
        const parser = new captionsParser_1.default();
        const trimTranscript = parser.explode(parser.removeXmlTag(this.xmlResponse));
        return trimTranscript.map((line) => {
            const aline = parser.decodeAline(line);
            const text = aline.text.replace(/\n/, " ");
            return {
                timestamp: aline.timestamp.formatLrc(),
                text: text,
            };
        });
    }
}
exports.default = Converter;


/***/ }),

/***/ "./src/popup.ts":
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subtitle_1 = __importDefault(__webpack_require__(/*! ./subtitle */ "./src/subtitle.ts"));
const clientYoutube_1 = __importDefault(__webpack_require__(/*! ./client/clientYoutube */ "./src/client/clientYoutube.ts"));
const sendData = {
    reason: "check",
};
var videoTitle;
window.onload = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, sendData, (response) => {
            if (response.error) {
                console.log(response.error);
                displayErrorMessage();
                return;
            }
            if (response.captions) {
                videoTitle = response.title;
                addSelectBox();
                response.captions.filter((value) => addSelectBoxOption(value));
                addDownloadButton();
                addSelectBoxFormat();
            }
        });
    });
};
function addSelectBoxFormat() {
    document
        .getElementById("content")
        .insertAdjacentHTML("afterbegin", "<select class='uk-select' style='margin-bottom:5px;font-size:larger;' id='format'><option value='csv'>.csv</option><option value='text'>.txt</option><option value='vtt'>.vtt</option><option value='srt'>.srt</option><option value='lrc'>.lrc</option></select>");
}
function addSelectBox() {
    document
        .getElementById("content")
        .insertAdjacentHTML("afterbegin", "<select class='uk-select' id='language' style='font-size:larger;'></select>");
}
function addSelectBoxOption(value) {
    document
        .getElementById("language")
        .insertAdjacentHTML("beforeend", `<option value=${value.baseUrl}>${value.name.simpleText}</option>`);
}
function addDownloadButton() {
    document
        .getElementById("content")
        .insertAdjacentHTML("afterend", "<div class='uk-margin'><button id='download-button' class='uk-button uk-button-primary' onclick=download()>Download</button></div>");
    document.getElementById("download-button").onclick = () => download();
}
function debug(response) {
    const debug = document.getElementById("debug");
    debug.insertAdjacentHTML("beforebegin", response);
}
function displayErrorMessage() {
    const content = document.getElementById("content");
    content.insertAdjacentHTML("beforebegin", `<p class='uk-text-danger'>This video has no captions.</p><p class='uk-text-danger'>If you can't download the subtitles, try disabling adblock.</p>`);
}
function download() {
    const language_url = (document.getElementById("language")).value;
    const format = document.getElementById("format")
        .value;
    const client = new clientYoutube_1.default();
    client
        .getSubtitle(language_url)
        .then((xmlResponse) => {
        if (!xmlResponse)
            throw new Error("Response empty.");
        const subtitle = new subtitle_1.default(xmlResponse);
        if (format === "csv") {
            subtitle.getCsv(videoTitle);
        }
        else if (format === "text") {
            subtitle.getText(videoTitle);
        }
        else if (format === "vtt") {
            subtitle.getVtt(videoTitle);
        }
        else if (format === "srt") {
            subtitle.getSrt(videoTitle);
        }
        else {
            subtitle.getLrc(videoTitle);
        }
    })
        .catch((error) => {
        console.log(error);
        debug(error);
    });
}


/***/ }),

/***/ "./src/subtitle.ts":
/*!*************************!*\
  !*** ./src/subtitle.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const converter_1 = __importDefault(__webpack_require__(/*! ./converter */ "./src/converter.ts"));
const json2csv = __webpack_require__(/*! json-2-csv */ "./node_modules/json-2-csv/src/converter.js");
const options = {
    delimiter: {
        wrap: "",
        field: "",
        eol: "\n",
    },
    prependHeader: false,
    excelBOM: true,
};
class Subtitle {
    constructor(xmlResponse) {
        this.xmlResponse = xmlResponse;
    }
    getVtt(filename) {
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toVtt(), options)
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob(["WEBVTT\n\n" + csv], { type: "text/vtt" })),
                filename: filename + ".vtt",
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
    getSrt(filename) {
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toSrt(), options)
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: "text/srt" })),
                filename: filename + ".srt",
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
    getLrc(filename) {
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toLrc(), options)
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: "text/lrc" })),
                filename: filename + ".lrc",
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
    getCsv(filename) {
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toCsv(), {
            excelBOM: true,
        })
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
                filename: filename + ".csv",
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
    getText(filename) {
        const json2csv = __webpack_require__(/*! json-2-csv */ "./node_modules/json-2-csv/src/converter.js");
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toText(), options)
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: "text/plane" })),
                filename: filename + ".txt",
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
}
exports.default = Subtitle;


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
    constructor(start, duration) {
        this.start = start;
        this.duration = duration;
    }
    getStartTime() {
        return this.convertTime(this.start);
    }
    getDurationTime() {
        return this.mergeTime(this.start, this.duration);
    }
    /**
     * Create SRT timestamp format.
     * example: 00:00:00,000 --> 00:00:00,000
     *
     * @returns {string}
     * @memberof Timestamp
     */
    formatSrt() {
        return (this.getStartTime().replace(/[.]/, ",") +
            " --> " +
            this.getDurationTime().replace(/[.]/, ",") +
            "\n");
    }
    /**
     * Create VTT timestamp format.
     * example: 00:00:00.000 --> 00:00:00.000
     *
     * @returns {string}
     * @memberof Timestamp
     */
    formatVtt() {
        return this.getStartTime() + " --> " + this.getDurationTime() + "\n";
    }
    /**
     * Create LRC timestamp format.
     * example: [00:00:00.000]
     *
     * @returns {string}
     * @memberof Timestamp
     */
    formatLrc() {
        return `[${this.convertLrcFormatTime(this.start)}]`;
    }
    /**
     * Add start time and duration time
     *
     * @private
     * @param {number} startSeconds
     * @param {number} durationSeconds
     * @returns {string}
     * @memberof Timestamp
     */
    mergeTime(startSeconds, durationSeconds) {
        return new Date(startSeconds * 1000 + durationSeconds * 1000)
            .toISOString()
            .slice(11, -1);
    }
    /**
     * Convert time format from mm.ss to HH:mm:sss.
     * example: 10.159 => 00:00:10.159
     * @private
     * @param {number} seconds
     * @returns {string}
     * @memberof Timestamp
     */
    convertTime(seconds) {
        return new Date(seconds * 1000).toISOString().slice(11, -1);
    }
    /**
     * Convert .lrc time format from mm.ss to mm:ss.
     * example: 10.159 => 00:10.15
     * https://en.wikipedia.org/wiki/LRC_(file_format)
     * @private
     * @param {number} seconds
     * @returns {string}
     * @memberof Timestamp
     */
    convertLrcFormatTime(seconds) {
        const hh = parseInt(new Date(seconds * 1000).toISOString().slice(12, -11)) * 60;
        const mm = parseInt(new Date(seconds * 1000).toISOString().slice(14, -8));
        if (0 < hh) {
            return `${hh + mm}${new Date(seconds * 1000)
                .toISOString()
                .slice(16, -2)}`;
        }
        return new Date(seconds * 1000).toISOString().slice(14, -2);
    }
}
exports.default = Timestamp;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2RlZWtzL3NyYy9kZWVrcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZGVla3Mvc3JjL3V0aWxzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kb2MtcGF0aC9zcmMvcGF0aC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGUvaGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2NvbnZlcnRlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbi0yLWNzdi9zcmMvY3N2Mmpzb24uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2pzb24yY3N2LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3RyaXB0YWdzL3NyYy9zdHJpcHRhZ3MuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2FwdGlvbnNQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwLnRzIiwid2VicGFjazovLy8uL3NyYy9zdWJ0aXRsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7O0FBRWIsY0FBYyxtQkFBTyxDQUFDLHFEQUFZOztBQUVsQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDcklhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx5Q0FBeUM7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLHlDQUF5Qzs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxtQkFBbUIsS0FBMEI7O0FBRTdDO0FBQ0Esa0JBQWtCLEtBQXlCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQiw4aUJBQThpQix3WkFBd1osV0FBVzs7QUFFbitCO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsYUFBYTtBQUNiLGVBQWU7QUFDZixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBLHd4ZkFBd3hmLGluQkFBaW5CLDZCQUE2Qix5QkFBeUI7QUFDLzdnQixrQkFBa0IsNHRlQUE0dGUsd0tBQXdLLDJ1WkFBMnVaLHdLQUF3Syw2Z0ZBQTZnRjtBQUN0ejlCLHdCQUF3QjtBQUN4Qix5QkFBeUI7QUFDekI7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEMsbUJBQW1CLGlCQUFpQjtBQUNwQyxxQkFBcUIsTUFBTSxZQUFZO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QyxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxFQUFFO0FBQzFDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkMsa0JBQWtCLGlCQUFpQjtBQUNuQztBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkMsSUFBSTtBQUNKLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLElBRVU7QUFDWjtBQUNBLEVBQUUsbUNBQU87QUFDVDtBQUNBLEdBQUc7QUFBQSxvR0FBQztBQUNKLEVBQUUsTUFBTSxZQVVOOztBQUVGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Vlk7O0FBRWIsS0FBSyxTQUFTLEdBQUcsbUJBQU8sQ0FBQyw2REFBWTtBQUNyQyxLQUFLLFNBQVMsR0FBRyxtQkFBTyxDQUFDLDZEQUFZO0FBQ3JDLFlBQVksbUJBQU8sQ0FBQyx1REFBUzs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRWE7O0FBRWIsV0FBVyxtQkFBTyxDQUFDLHFEQUFVO0FBQzdCLGdCQUFnQixtQkFBTyxDQUFDLHNFQUFrQjtBQUMxQyxZQUFZLG1CQUFPLENBQUMsdURBQVM7O0FBRTdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFCQUFxQixTQUFTO0FBQzlCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0Esc0JBQXNCLE1BQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxvREFBb0Q7O0FBRXBEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCLG1CQUFtQixPQUFPLEVBQUU7QUFDNUI7QUFDQTtBQUNBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCO0FBQzFCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixPQUFPO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUZBQWlGO0FBQ2pGOztBQUVBO0FBQ0E7QUFDQSxTQUFTLElBQUk7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQkFBc0IsT0FBTyxFQUFFO0FBQy9CLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsaUZBQWlGO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0I7Ozs7Ozs7Ozs7Ozs7QUN6WUw7O0FBRWIsV0FBVyxtQkFBTyxDQUFDLHFEQUFVO0FBQzdCLFlBQVksbUJBQU8sQ0FBQyxnREFBTztBQUMzQixnQkFBZ0IsbUJBQU8sQ0FBQyxzRUFBa0I7QUFDMUMsWUFBWSxtQkFBTyxDQUFDLHVEQUFTOztBQUU3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxvQkFBb0IsY0FBYztBQUNsQyxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQixpQkFBaUIsY0FBYztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixFQUFFO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLCtDQUErQztBQUMvQzs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLHFCQUFxQjtBQUN6Qyx3QkFBd0IsU0FBUztBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsa0JBQWtCOzs7Ozs7Ozs7Ozs7O0FDellMOztBQUViLFdBQVcsbUJBQU8sQ0FBQyxxREFBVTtBQUM3QixnQkFBZ0IsbUJBQU8sQ0FBQyxzRUFBa0I7O0FBRTFDLDRCQUE0QixFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFOztBQUVsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQSxZQUFZOztBQUVaO0FBQ0Esc0JBQXNCOztBQUV0QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsZ0JBQWdCO0FBQ2hDLGdCQUFnQixnQkFBZ0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQkFBa0IsT0FBTyxlQUFlLFFBQVEsSUFBSSxhQUFhLFNBQVMseUNBQXlDLE9BQU87QUFDMUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBLFNBQVMsa0JBQWtCO0FBQzNCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkIsZ0JBQWdCO0FBQ2hCLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCLGlCQUFpQjtBQUNqQixhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3pTQSxrQ0FBYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLCtDQUErQyxjQUFjO0FBQzdEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxRQUFRLElBQTBDO0FBQ2xEO0FBQ0EsUUFBUSxtQ0FBTywyQkFBMkIsa0JBQWtCLEVBQUU7QUFBQSxvR0FBQztBQUMvRDs7QUFFQSxTQUFTLEVBUUo7QUFDTCxDQUFDOzs7Ozs7Ozs7Ozs7QUMxT0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDckJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCxvQ0FBb0MsbUJBQU8sQ0FBQyx1Q0FBYTtBQUN6RDtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBO0FBQ0EsMEJBQTBCLG1CQUFPLENBQUMsNERBQVc7QUFDN0MsbUJBQW1CLG1CQUFPLENBQUMsbUNBQUk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ2xGYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQSw4RUFBOEUsUUFBUTtBQUN0RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzVCYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQseUNBQXlDLG1CQUFPLENBQUMsaURBQWtCO0FBQ25FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDckdhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCxtQ0FBbUMsbUJBQU8sQ0FBQyxxQ0FBWTtBQUN2RCx3Q0FBd0MsbUJBQU8sQ0FBQyw2REFBd0I7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixvQ0FBb0M7QUFDM0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOEZBQThGLGlCQUFpQjtBQUMvRztBQUNBO0FBQ0E7QUFDQTtBQUNBLDJHQUEyRztBQUMzRztBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxjQUFjLEdBQUcsc0JBQXNCO0FBQ2pHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOzs7Ozs7Ozs7Ozs7O0FDekZhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCxvQ0FBb0MsbUJBQU8sQ0FBQyx1Q0FBYTtBQUN6RCxpQkFBaUIsbUJBQU8sQ0FBQyw4REFBWTtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlFQUF5RSxtQkFBbUI7QUFDNUY7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsbUJBQW1CO0FBQzdFO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELG1CQUFtQjtBQUM3RTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLDBEQUEwRCxtQkFBbUI7QUFDN0U7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EseUJBQXlCLG1CQUFPLENBQUMsOERBQVk7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQscUJBQXFCO0FBQy9FO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDOUZhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNDQUFzQztBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixRQUFRLEVBQUU7QUFDaEM7QUFDQSwrQkFBK0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwb3B1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BvcHVwLnRzXCIpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMuanMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGVlcEtleXM6IGRlZXBLZXlzLFxuICAgIGRlZXBLZXlzRnJvbUxpc3Q6IGRlZXBLZXlzRnJvbUxpc3Rcbn07XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkZWVwIGtleXMgbGlzdCBmb3IgYSBzaW5nbGUgZG9jdW1lbnRcbiAqIEBwYXJhbSBvYmplY3RcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIGRlZXBLZXlzKG9iamVjdCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgaWYgKHV0aWxzLmlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlRGVlcEtleXNMaXN0KCcnLCBvYmplY3QsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkZWVwIGtleXMgbGlzdCBmb3IgYWxsIGRvY3VtZW50cyBpbiB0aGUgcHJvdmlkZWQgbGlzdFxuICogQHBhcmFtIGxpc3RcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyBBcnJheVtBcnJheVtTdHJpbmddXVxuICovXG5mdW5jdGlvbiBkZWVwS2V5c0Zyb21MaXN0KGxpc3QsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiBsaXN0Lm1hcCgoZG9jdW1lbnQpID0+IHsgLy8gZm9yIGVhY2ggZG9jdW1lbnRcbiAgICAgICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRvY3VtZW50KSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGEgYXQgdGhlIGtleSBpcyBhIGRvY3VtZW50LCB0aGVuIHdlIHJldHJpZXZlIHRoZSBzdWJIZWFkaW5nIHN0YXJ0aW5nIHdpdGggYW4gZW1wdHkgc3RyaW5nIGhlYWRpbmcgYW5kIHRoZSBkb2NcbiAgICAgICAgICAgIHJldHVybiBkZWVwS2V5cyhkb2N1bWVudCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZURlZXBLZXlzTGlzdChoZWFkaW5nLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKS5tYXAoKGN1cnJlbnRLZXkpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGhlYWRpbmcgaXMgZW1wdHksIHRoZW4gd2Ugc2V0IHRoZSBoZWFkaW5nIHRvIGJlIHRoZSBzdWJLZXksIG90aGVyd2lzZSBzZXQgaXQgYXMgYSBuZXN0ZWQgaGVhZGluZyB3LyBhIGRvdFxuICAgICAgICBsZXQga2V5TmFtZSA9IGJ1aWxkS2V5TmFtZShoZWFkaW5nLCBjdXJyZW50S2V5KTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFub3RoZXIgbmVzdGVkIGRvY3VtZW50LCByZWN1ciBvbiB0aGUgc3ViLWRvY3VtZW50IHRvIHJldHJpZXZlIHRoZSBmdWxsIGtleSBuYW1lXG4gICAgICAgIGlmIChpc0RvY3VtZW50VG9SZWN1ck9uKGRhdGFbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVEZWVwS2V5c0xpc3Qoa2V5TmFtZSwgZGF0YVtjdXJyZW50S2V5XSwgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5leHBhbmRBcnJheU9iamVjdHMgJiYgaXNBcnJheVRvUmVjdXJPbihkYXRhW2N1cnJlbnRLZXldKSkge1xuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIG5lc3RlZCBhcnJheSB0aGF0IHdlIG5lZWQgdG8gcmVjdXIgb25cbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzQXJyYXlLZXlzKGRhdGFbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSByZXR1cm4gdGhpcyBrZXkgbmFtZSBzaW5jZSB3ZSBkb24ndCBoYXZlIGEgc3ViIGRvY3VtZW50XG4gICAgICAgIHJldHVybiBrZXlOYW1lO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHV0aWxzLmZsYXR0ZW4oa2V5cyk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGhhbmRsZSB0aGUgcHJvY2Vzc2luZyBvZiBhcnJheXMgd2hlbiB0aGUgZXhwYW5kQXJyYXlPYmplY3RzXG4gKiBvcHRpb24gaXMgc3BlY2lmaWVkLlxuICogQHBhcmFtIHN1YkFycmF5XG4gKiBAcGFyYW0gY3VycmVudEtleVBhdGhcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gcHJvY2Vzc0FycmF5S2V5cyhzdWJBcnJheSwgY3VycmVudEtleVBhdGgsIG9wdGlvbnMpIHtcbiAgICBsZXQgc3ViQXJyYXlLZXlzID0gZGVlcEtleXNGcm9tTGlzdChzdWJBcnJheSk7XG5cbiAgICBpZiAoIXN1YkFycmF5Lmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gb3B0aW9ucy5pZ25vcmVFbXB0eUFycmF5c1doZW5FeHBhbmRpbmcgPyBbXSA6IFtjdXJyZW50S2V5UGF0aF07XG4gICAgfSBlbHNlIGlmIChzdWJBcnJheS5sZW5ndGggJiYgdXRpbHMuZmxhdHRlbihzdWJBcnJheUtleXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBIYXMgaXRlbXMgaW4gdGhlIGFycmF5LCBidXQgbm8gb2JqZWN0c1xuICAgICAgICByZXR1cm4gW2N1cnJlbnRLZXlQYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdWJBcnJheUtleXMgPSBzdWJBcnJheUtleXMubWFwKChzY2hlbWFLZXlzKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUFycmF5KHNjaGVtYUtleXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjdXJyZW50S2V5UGF0aF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2NoZW1hS2V5cy5tYXAoKHN1YktleSkgPT4gYnVpbGRLZXlOYW1lKGN1cnJlbnRLZXlQYXRoLCBzdWJLZXkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHV0aWxzLnVuaXF1ZSh1dGlscy5mbGF0dGVuKHN1YkFycmF5S2V5cykpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZSBrZXkgcGF0aFxuICogQHBhcmFtIHVwcGVyS2V5TmFtZSBTdHJpbmcgYWNjdW11bGF0ZWQga2V5IHBhdGhcbiAqIEBwYXJhbSBjdXJyZW50S2V5TmFtZSBTdHJpbmcgY3VycmVudCBrZXkgbmFtZVxuICogQHJldHVybnMgU3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkS2V5TmFtZSh1cHBlcktleU5hbWUsIGN1cnJlbnRLZXlOYW1lKSB7XG4gICAgaWYgKHVwcGVyS2V5TmFtZSkge1xuICAgICAgICByZXR1cm4gdXBwZXJLZXlOYW1lICsgJy4nICsgY3VycmVudEtleU5hbWU7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50S2V5TmFtZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBhIGRvY3VtZW50IHRvIHJlY3VyIG9uIG9yIG5vdFxuICogQHBhcmFtIHZhbCBBbnkgaXRlbSB3aG9zZSB0eXBlIHdpbGwgYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEb2N1bWVudFRvUmVjdXJPbih2YWwpIHtcbiAgICByZXR1cm4gdXRpbHMuaXNPYmplY3QodmFsKSAmJiAhdXRpbHMuaXNOdWxsKHZhbCkgJiYgIUFycmF5LmlzQXJyYXkodmFsKSAmJiBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBhbiBhcnJheSB0byByZWN1ciBvbiBvciBub3RcbiAqIEBwYXJhbSB2YWwgQW55IGl0ZW0gd2hvc2UgdHlwZSB3aWxsIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlUb1JlY3VyT24odmFsKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYW4gZW1wdHkgYXJyYXlcbiAqIEBwYXJhbSB2YWxcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5QXJyYXkodmFsKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSAmJiAhdmFsLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBleHBhbmRBcnJheU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBpZ25vcmVFbXB0eUFycmF5c1doZW5FeHBhbmRpbmc6IGZhbHNlLFxuICAgICAgICAuLi5vcHRpb25zIHx8IHt9XG4gICAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgLy8gdW5kZXJzY29yZSByZXBsYWNlbWVudHM6XG4gICAgaXNTdHJpbmcsXG4gICAgaXNOdWxsLFxuICAgIGlzRXJyb3IsXG4gICAgaXNEYXRlLFxuICAgIGlzRnVuY3Rpb24sXG4gICAgaXNVbmRlZmluZWQsXG4gICAgaXNPYmplY3QsXG4gICAgdW5pcXVlLFxuICAgIGZsYXR0ZW5cbn07XG5cbi8qXG4gKiBIZWxwZXIgZnVuY3Rpb25zIHdoaWNoIHdlcmUgY3JlYXRlZCB0byByZW1vdmUgdW5kZXJzY29yZWpzIGZyb20gdGhpcyBwYWNrYWdlLlxuICovXG5cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCc7XG59XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bGwodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIERhdGU7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3VuZGVmaW5lZCc7XG59XG5cbmZ1bmN0aW9uIGlzRXJyb3IodmFsdWUpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJztcbn1cblxuZnVuY3Rpb24gdW5pcXVlKGFycmF5KSB7XG4gICAgcmV0dXJuIFsuLi5uZXcgU2V0KGFycmF5KV07XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4oYXJyYXkpIHtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLmFycmF5KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZXZhbHVhdGVQYXRoLFxuICAgIHNldFBhdGhcbn07XG5cbmZ1bmN0aW9uIGV2YWx1YXRlUGF0aChkb2N1bWVudCwga2V5UGF0aCkge1xuICAgIGlmICghZG9jdW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHtpbmRleE9mRG90LCBjdXJyZW50S2V5LCByZW1haW5pbmdLZXlQYXRofSA9IGNvbXB1dGVTdGF0ZUluZm9ybWF0aW9uKGtleVBhdGgpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSAnLicgaW4gdGhlIGtleVBhdGggYW5kIGtleVBhdGggZG9lc24ndCBhcHBlYXIgaW4gdGhlIGRvY3VtZW50LCByZWN1ciBvbiB0aGUgc3ViZG9jdW1lbnRcbiAgICBpZiAoaW5kZXhPZkRvdCA+PSAwICYmICFkb2N1bWVudFtrZXlQYXRoXSkge1xuICAgICAgICAvLyBJZiB0aGVyZSdzIGFuIGFycmF5IGF0IHRoZSBjdXJyZW50S2V5IGluIHRoZSBkb2N1bWVudCwgdGhlbiBpdGVyYXRlIG92ZXIgdGhvc2UgaXRlbXMgZXZhbHVhdGluZyB0aGUgcmVtYWluaW5nIHBhdGhcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZG9jdW1lbnRbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnRbY3VycmVudEtleV0ubWFwKChkb2MpID0+IGV2YWx1YXRlUGF0aChkb2MsIHJlbWFpbmluZ0tleVBhdGgpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGNhbiBqdXN0IHJlY3VyXG4gICAgICAgIHJldHVybiBldmFsdWF0ZVBhdGgoZG9jdW1lbnRbY3VycmVudEtleV0sIHJlbWFpbmluZ0tleVBhdGgpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkb2N1bWVudCkpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBcImRvY3VtZW50XCIgaXMgYWN0dWFsbHkgYW4gYXJyYXksIHRoZW4gaXRlcmF0ZSBvdmVyIHRob3NlIGl0ZW1zIGV2YWx1YXRpbmcgdGhlIHBhdGhcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50Lm1hcCgoZG9jKSA9PiBldmFsdWF0ZVBhdGgoZG9jLCBrZXlQYXRoKSk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4ganVzdCByZXR1cm4gdmFsdWUgZGlyZWN0bHlcbiAgICByZXR1cm4gZG9jdW1lbnRba2V5UGF0aF07XG59XG5cbmZ1bmN0aW9uIHNldFBhdGgoZG9jdW1lbnQsIGtleVBhdGgsIHZhbHVlKSB7XG4gICAgaWYgKCFkb2N1bWVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRvY3VtZW50IHdhcyBwcm92aWRlZC4nKTtcbiAgICB9XG5cbiAgICBsZXQge2luZGV4T2ZEb3QsIGN1cnJlbnRLZXksIHJlbWFpbmluZ0tleVBhdGh9ID0gY29tcHV0ZVN0YXRlSW5mb3JtYXRpb24oa2V5UGF0aCk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhICcuJyBpbiB0aGUga2V5UGF0aCwgcmVjdXIgb24gdGhlIHN1YmRvYyBhbmQgLi4uXG4gICAgaWYgKGluZGV4T2ZEb3QgPj0gMCkge1xuICAgICAgICBpZiAoIWRvY3VtZW50W2N1cnJlbnRLZXldICYmIEFycmF5LmlzQXJyYXkoZG9jdW1lbnQpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIGFycmF5IGFuZCB0aGVyZSBhcmUgbXVsdGlwbGUgbGV2ZWxzIG9mIGtleXMgdG8gaXRlcmF0ZSBvdmVyLCByZWN1ci5cbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5mb3JFYWNoKChkb2MpID0+IHNldFBhdGgoZG9jLCBrZXlQYXRoLCB2YWx1ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKCFkb2N1bWVudFtjdXJyZW50S2V5XSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnRLZXkgZG9lc24ndCBleGlzdCB5ZXQsIHBvcHVsYXRlIGl0XG4gICAgICAgICAgICBkb2N1bWVudFtjdXJyZW50S2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHNldFBhdGgoZG9jdW1lbnRbY3VycmVudEtleV0sIHJlbWFpbmluZ0tleVBhdGgsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZG9jdW1lbnQpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgXCJkb2N1bWVudFwiIGlzIGFjdHVhbGx5IGFuIGFycmF5LCB0aGVuIHdlIGNhbiBsb29wIG92ZXIgZWFjaCBvZiB0aGUgdmFsdWVzIGFuZCBzZXQgdGhlIHBhdGhcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmZvckVhY2goKGRvYykgPT4gc2V0UGF0aChkb2MsIHJlbWFpbmluZ0tleVBhdGgsIHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4gc2V0IHRoZSBwYXRoIGRpcmVjdGx5XG4gICAgICAgIGRvY3VtZW50W2tleVBhdGhdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgc29tZSBpbmZvcm1hdGlvbiBuZWNlc3NhcnkgdG8gZXZhbHVhdGUgb3Igc2V0IGEgcGF0aFxuICogICBiYXNlZCBvbiB0aGUgcHJvdmlkZWQga2V5UGF0aCB2YWx1ZVxuICogQHBhcmFtIGtleVBhdGhcbiAqIEByZXR1cm5zIHt7aW5kZXhPZkRvdDogTnVtYmVyLCBjdXJyZW50S2V5OiBTdHJpbmcsIHJlbWFpbmluZ0tleVBhdGg6IFN0cmluZ319XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVTdGF0ZUluZm9ybWF0aW9uKGtleVBhdGgpIHtcbiAgICBsZXQgaW5kZXhPZkRvdCA9IGtleVBhdGguaW5kZXhPZignLicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXhPZkRvdCxcbiAgICAgICAgY3VycmVudEtleToga2V5UGF0aC5zbGljZSgwLCBpbmRleE9mRG90ID49IDAgPyBpbmRleE9mRG90IDogdW5kZWZpbmVkKSxcbiAgICAgICAgcmVtYWluaW5nS2V5UGF0aDoga2V5UGF0aC5zbGljZShpbmRleE9mRG90ICsgMSlcbiAgICB9O1xufVxuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9oZSB2MS4yLjAgYnkgQG1hdGhpYXMgfCBNSVQgbGljZW5zZSAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYC5cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC5cblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YC5cblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvLyBBbGwgYXN0cmFsIHN5bWJvbHMuXG5cdHZhciByZWdleEFzdHJhbFN5bWJvbHMgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nO1xuXHQvLyBBbGwgQVNDSUkgc3ltYm9scyAobm90IGp1c3QgcHJpbnRhYmxlIEFTQ0lJKSBleGNlcHQgdGhvc2UgbGlzdGVkIGluIHRoZVxuXHQvLyBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZS5cblx0Ly8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjdGFibGUtY2hhcnJlZi1vdmVycmlkZXNcblx0dmFyIHJlZ2V4QXNjaWlXaGl0ZWxpc3QgPSAvW1xceDAxLVxceDdGXS9nO1xuXHQvLyBBbGwgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IEFTQ0lJIG5ld2xpbmVzLCBwcmludGFibGUgQVNDSUkgc3ltYm9scywgb3Jcblx0Ly8gY29kZSBwb2ludHMgbGlzdGVkIGluIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZSBvblxuXHQvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCN0YWJsZS1jaGFycmVmLW92ZXJyaWRlcy5cblx0dmFyIHJlZ2V4Qm1wV2hpdGVsaXN0ID0gL1tcXHgwMS1cXHRcXHgwQlxcZlxceDBFLVxceDFGXFx4N0ZcXHg4MVxceDhEXFx4OEZcXHg5MFxceDlEXFx4QTAtXFx1RkZGRl0vZztcblxuXHR2YXIgcmVnZXhFbmNvZGVOb25Bc2NpaSA9IC88XFx1MjBEMnw9XFx1MjBFNXw+XFx1MjBEMnxcXHUyMDVGXFx1MjAwQXxcXHUyMTlEXFx1MDMzOHxcXHUyMjAyXFx1MDMzOHxcXHUyMjIwXFx1MjBEMnxcXHUyMjI5XFx1RkUwMHxcXHUyMjJBXFx1RkUwMHxcXHUyMjNDXFx1MjBEMnxcXHUyMjNEXFx1MDMzMXxcXHUyMjNFXFx1MDMzM3xcXHUyMjQyXFx1MDMzOHxcXHUyMjRCXFx1MDMzOHxcXHUyMjREXFx1MjBEMnxcXHUyMjRFXFx1MDMzOHxcXHUyMjRGXFx1MDMzOHxcXHUyMjUwXFx1MDMzOHxcXHUyMjYxXFx1MjBFNXxcXHUyMjY0XFx1MjBEMnxcXHUyMjY1XFx1MjBEMnxcXHUyMjY2XFx1MDMzOHxcXHUyMjY3XFx1MDMzOHxcXHUyMjY4XFx1RkUwMHxcXHUyMjY5XFx1RkUwMHxcXHUyMjZBXFx1MDMzOHxcXHUyMjZBXFx1MjBEMnxcXHUyMjZCXFx1MDMzOHxcXHUyMjZCXFx1MjBEMnxcXHUyMjdGXFx1MDMzOHxcXHUyMjgyXFx1MjBEMnxcXHUyMjgzXFx1MjBEMnxcXHUyMjhBXFx1RkUwMHxcXHUyMjhCXFx1RkUwMHxcXHUyMjhGXFx1MDMzOHxcXHUyMjkwXFx1MDMzOHxcXHUyMjkzXFx1RkUwMHxcXHUyMjk0XFx1RkUwMHxcXHUyMkI0XFx1MjBEMnxcXHUyMkI1XFx1MjBEMnxcXHUyMkQ4XFx1MDMzOHxcXHUyMkQ5XFx1MDMzOHxcXHUyMkRBXFx1RkUwMHxcXHUyMkRCXFx1RkUwMHxcXHUyMkY1XFx1MDMzOHxcXHUyMkY5XFx1MDMzOHxcXHUyOTMzXFx1MDMzOHxcXHUyOUNGXFx1MDMzOHxcXHUyOUQwXFx1MDMzOHxcXHUyQTZEXFx1MDMzOHxcXHUyQTcwXFx1MDMzOHxcXHUyQTdEXFx1MDMzOHxcXHUyQTdFXFx1MDMzOHxcXHUyQUExXFx1MDMzOHxcXHUyQUEyXFx1MDMzOHxcXHUyQUFDXFx1RkUwMHxcXHUyQUFEXFx1RkUwMHxcXHUyQUFGXFx1MDMzOHxcXHUyQUIwXFx1MDMzOHxcXHUyQUM1XFx1MDMzOHxcXHUyQUM2XFx1MDMzOHxcXHUyQUNCXFx1RkUwMHxcXHUyQUNDXFx1RkUwMHxcXHUyQUZEXFx1MjBFNXxbXFx4QTAtXFx1MDExM1xcdTAxMTYtXFx1MDEyMlxcdTAxMjQtXFx1MDEyQlxcdTAxMkUtXFx1MDE0RFxcdTAxNTAtXFx1MDE3RVxcdTAxOTJcXHUwMUI1XFx1MDFGNVxcdTAyMzdcXHUwMkM2XFx1MDJDN1xcdTAyRDgtXFx1MDJERFxcdTAzMTFcXHUwMzkxLVxcdTAzQTFcXHUwM0EzLVxcdTAzQTlcXHUwM0IxLVxcdTAzQzlcXHUwM0QxXFx1MDNEMlxcdTAzRDVcXHUwM0Q2XFx1MDNEQ1xcdTAzRERcXHUwM0YwXFx1MDNGMVxcdTAzRjVcXHUwM0Y2XFx1MDQwMS1cXHUwNDBDXFx1MDQwRS1cXHUwNDRGXFx1MDQ1MS1cXHUwNDVDXFx1MDQ1RVxcdTA0NUZcXHUyMDAyLVxcdTIwMDVcXHUyMDA3LVxcdTIwMTBcXHUyMDEzLVxcdTIwMTZcXHUyMDE4LVxcdTIwMUFcXHUyMDFDLVxcdTIwMUVcXHUyMDIwLVxcdTIwMjJcXHUyMDI1XFx1MjAyNlxcdTIwMzAtXFx1MjAzNVxcdTIwMzlcXHUyMDNBXFx1MjAzRVxcdTIwNDFcXHUyMDQzXFx1MjA0NFxcdTIwNEZcXHUyMDU3XFx1MjA1Ri1cXHUyMDYzXFx1MjBBQ1xcdTIwREJcXHUyMERDXFx1MjEwMlxcdTIxMDVcXHUyMTBBLVxcdTIxMTNcXHUyMTE1LVxcdTIxMUVcXHUyMTIyXFx1MjEyNFxcdTIxMjctXFx1MjEyOVxcdTIxMkNcXHUyMTJEXFx1MjEyRi1cXHUyMTMxXFx1MjEzMy1cXHUyMTM4XFx1MjE0NS1cXHUyMTQ4XFx1MjE1My1cXHUyMTVFXFx1MjE5MC1cXHUyMTlCXFx1MjE5RC1cXHUyMUE3XFx1MjFBOS1cXHUyMUFFXFx1MjFCMC1cXHUyMUIzXFx1MjFCNS1cXHUyMUI3XFx1MjFCQS1cXHUyMURCXFx1MjFERFxcdTIxRTRcXHUyMUU1XFx1MjFGNVxcdTIxRkQtXFx1MjIwNVxcdTIyMDctXFx1MjIwOVxcdTIyMEJcXHUyMjBDXFx1MjIwRi1cXHUyMjE0XFx1MjIxNi1cXHUyMjE4XFx1MjIxQVxcdTIyMUQtXFx1MjIzOFxcdTIyM0EtXFx1MjI1N1xcdTIyNTlcXHUyMjVBXFx1MjI1Q1xcdTIyNUYtXFx1MjI2MlxcdTIyNjQtXFx1MjI4QlxcdTIyOEQtXFx1MjI5QlxcdTIyOUQtXFx1MjJBNVxcdTIyQTctXFx1MjJCMFxcdTIyQjItXFx1MjJCQlxcdTIyQkQtXFx1MjJEQlxcdTIyREUtXFx1MjJFM1xcdTIyRTYtXFx1MjJGN1xcdTIyRjktXFx1MjJGRVxcdTIzMDVcXHUyMzA2XFx1MjMwOC1cXHUyMzEwXFx1MjMxMlxcdTIzMTNcXHUyMzE1XFx1MjMxNlxcdTIzMUMtXFx1MjMxRlxcdTIzMjJcXHUyMzIzXFx1MjMyRFxcdTIzMkVcXHUyMzM2XFx1MjMzRFxcdTIzM0ZcXHUyMzdDXFx1MjNCMFxcdTIzQjFcXHUyM0I0LVxcdTIzQjZcXHUyM0RDLVxcdTIzREZcXHUyM0UyXFx1MjNFN1xcdTI0MjNcXHUyNEM4XFx1MjUwMFxcdTI1MDJcXHUyNTBDXFx1MjUxMFxcdTI1MTRcXHUyNTE4XFx1MjUxQ1xcdTI1MjRcXHUyNTJDXFx1MjUzNFxcdTI1M0NcXHUyNTUwLVxcdTI1NkNcXHUyNTgwXFx1MjU4NFxcdTI1ODhcXHUyNTkxLVxcdTI1OTNcXHUyNUExXFx1MjVBQVxcdTI1QUJcXHUyNUFEXFx1MjVBRVxcdTI1QjFcXHUyNUIzLVxcdTI1QjVcXHUyNUI4XFx1MjVCOVxcdTI1QkQtXFx1MjVCRlxcdTI1QzJcXHUyNUMzXFx1MjVDQVxcdTI1Q0JcXHUyNUVDXFx1MjVFRlxcdTI1RjgtXFx1MjVGQ1xcdTI2MDVcXHUyNjA2XFx1MjYwRVxcdTI2NDBcXHUyNjQyXFx1MjY2MFxcdTI2NjNcXHUyNjY1XFx1MjY2NlxcdTI2NkFcXHUyNjZELVxcdTI2NkZcXHUyNzEzXFx1MjcxN1xcdTI3MjBcXHUyNzM2XFx1Mjc1OFxcdTI3NzJcXHUyNzczXFx1MjdDOFxcdTI3QzlcXHUyN0U2LVxcdTI3RURcXHUyN0Y1LVxcdTI3RkFcXHUyN0ZDXFx1MjdGRlxcdTI5MDItXFx1MjkwNVxcdTI5MEMtXFx1MjkxM1xcdTI5MTZcXHUyOTE5LVxcdTI5MjBcXHUyOTIzLVxcdTI5MkFcXHUyOTMzXFx1MjkzNS1cXHUyOTM5XFx1MjkzQ1xcdTI5M0RcXHUyOTQ1XFx1Mjk0OC1cXHUyOTRCXFx1Mjk0RS1cXHUyOTc2XFx1Mjk3OFxcdTI5NzlcXHUyOTdCLVxcdTI5N0ZcXHUyOTg1XFx1Mjk4NlxcdTI5OEItXFx1Mjk5NlxcdTI5OUFcXHUyOTlDXFx1Mjk5RFxcdTI5QTQtXFx1MjlCN1xcdTI5QjlcXHUyOUJCXFx1MjlCQ1xcdTI5QkUtXFx1MjlDNVxcdTI5QzlcXHUyOUNELVxcdTI5RDBcXHUyOURDLVxcdTI5REVcXHUyOUUzLVxcdTI5RTVcXHUyOUVCXFx1MjlGNFxcdTI5RjZcXHUyQTAwLVxcdTJBMDJcXHUyQTA0XFx1MkEwNlxcdTJBMENcXHUyQTBEXFx1MkExMC1cXHUyQTE3XFx1MkEyMi1cXHUyQTI3XFx1MkEyOVxcdTJBMkFcXHUyQTJELVxcdTJBMzFcXHUyQTMzLVxcdTJBM0NcXHUyQTNGXFx1MkE0MFxcdTJBNDItXFx1MkE0RFxcdTJBNTBcXHUyQTUzLVxcdTJBNThcXHUyQTVBLVxcdTJBNURcXHUyQTVGXFx1MkE2NlxcdTJBNkFcXHUyQTZELVxcdTJBNzVcXHUyQTc3LVxcdTJBOUFcXHUyQTlELVxcdTJBQTJcXHUyQUE0LVxcdTJBQjBcXHUyQUIzLVxcdTJBQzhcXHUyQUNCXFx1MkFDQ1xcdTJBQ0YtXFx1MkFEQlxcdTJBRTRcXHUyQUU2LVxcdTJBRTlcXHUyQUVCLVxcdTJBRjNcXHUyQUZEXFx1RkIwMC1cXHVGQjA0XXxcXHVEODM1W1xcdURDOUNcXHVEQzlFXFx1REM5RlxcdURDQTJcXHVEQ0E1XFx1RENBNlxcdURDQTktXFx1RENBQ1xcdURDQUUtXFx1RENCOVxcdURDQkJcXHVEQ0JELVxcdURDQzNcXHVEQ0M1LVxcdURDQ0ZcXHVERDA0XFx1REQwNVxcdUREMDctXFx1REQwQVxcdUREMEQtXFx1REQxNFxcdUREMTYtXFx1REQxQ1xcdUREMUUtXFx1REQzOVxcdUREM0ItXFx1REQzRVxcdURENDAtXFx1REQ0NFxcdURENDZcXHVERDRBLVxcdURENTBcXHVERDUyLVxcdURENkJdL2c7XG5cdHZhciBlbmNvZGVNYXAgPSB7J1xceEFEJzonc2h5JywnXFx1MjAwQyc6J3p3bmonLCdcXHUyMDBEJzonendqJywnXFx1MjAwRSc6J2xybScsJ1xcdTIwNjMnOidpYycsJ1xcdTIwNjInOidpdCcsJ1xcdTIwNjEnOidhZicsJ1xcdTIwMEYnOidybG0nLCdcXHUyMDBCJzonWmVyb1dpZHRoU3BhY2UnLCdcXHUyMDYwJzonTm9CcmVhaycsJ1xcdTAzMTEnOidEb3duQnJldmUnLCdcXHUyMERCJzondGRvdCcsJ1xcdTIwREMnOidEb3REb3QnLCdcXHQnOidUYWInLCdcXG4nOidOZXdMaW5lJywnXFx1MjAwOCc6J3B1bmNzcCcsJ1xcdTIwNUYnOidNZWRpdW1TcGFjZScsJ1xcdTIwMDknOid0aGluc3AnLCdcXHUyMDBBJzonaGFpcnNwJywnXFx1MjAwNCc6J2Vtc3AxMycsJ1xcdTIwMDInOidlbnNwJywnXFx1MjAwNSc6J2Vtc3AxNCcsJ1xcdTIwMDMnOidlbXNwJywnXFx1MjAwNyc6J251bXNwJywnXFx4QTAnOiduYnNwJywnXFx1MjA1RlxcdTIwMEEnOidUaGlja1NwYWNlJywnXFx1MjAzRSc6J29saW5lJywnXyc6J2xvd2JhcicsJ1xcdTIwMTAnOidkYXNoJywnXFx1MjAxMyc6J25kYXNoJywnXFx1MjAxNCc6J21kYXNoJywnXFx1MjAxNSc6J2hvcmJhcicsJywnOidjb21tYScsJzsnOidzZW1pJywnXFx1MjA0Ric6J2JzZW1pJywnOic6J2NvbG9uJywnXFx1MkE3NCc6J0NvbG9uZScsJyEnOidleGNsJywnXFx4QTEnOidpZXhjbCcsJz8nOidxdWVzdCcsJ1xceEJGJzonaXF1ZXN0JywnLic6J3BlcmlvZCcsJ1xcdTIwMjUnOidubGRyJywnXFx1MjAyNic6J21sZHInLCdcXHhCNyc6J21pZGRvdCcsJ1xcJyc6J2Fwb3MnLCdcXHUyMDE4JzonbHNxdW8nLCdcXHUyMDE5JzoncnNxdW8nLCdcXHUyMDFBJzonc2JxdW8nLCdcXHUyMDM5JzonbHNhcXVvJywnXFx1MjAzQSc6J3JzYXF1bycsJ1wiJzoncXVvdCcsJ1xcdTIwMUMnOidsZHF1bycsJ1xcdTIwMUQnOidyZHF1bycsJ1xcdTIwMUUnOidiZHF1bycsJ1xceEFCJzonbGFxdW8nLCdcXHhCQic6J3JhcXVvJywnKCc6J2xwYXInLCcpJzoncnBhcicsJ1snOidsc3FiJywnXSc6J3JzcWInLCd7JzonbGN1YicsJ30nOidyY3ViJywnXFx1MjMwOCc6J2xjZWlsJywnXFx1MjMwOSc6J3JjZWlsJywnXFx1MjMwQSc6J2xmbG9vcicsJ1xcdTIzMEInOidyZmxvb3InLCdcXHUyOTg1JzonbG9wYXInLCdcXHUyOTg2Jzoncm9wYXInLCdcXHUyOThCJzonbGJya2UnLCdcXHUyOThDJzoncmJya2UnLCdcXHUyOThEJzonbGJya3NsdScsJ1xcdTI5OEUnOidyYnJrc2xkJywnXFx1Mjk4Ric6J2xicmtzbGQnLCdcXHUyOTkwJzoncmJya3NsdScsJ1xcdTI5OTEnOidsYW5nZCcsJ1xcdTI5OTInOidyYW5nZCcsJ1xcdTI5OTMnOidscGFybHQnLCdcXHUyOTk0JzoncnBhcmd0JywnXFx1Mjk5NSc6J2d0bFBhcicsJ1xcdTI5OTYnOidsdHJQYXInLCdcXHUyN0U2JzonbG9icmsnLCdcXHUyN0U3Jzoncm9icmsnLCdcXHUyN0U4JzonbGFuZycsJ1xcdTI3RTknOidyYW5nJywnXFx1MjdFQSc6J0xhbmcnLCdcXHUyN0VCJzonUmFuZycsJ1xcdTI3RUMnOidsb2FuZycsJ1xcdTI3RUQnOidyb2FuZycsJ1xcdTI3NzInOidsYmJyaycsJ1xcdTI3NzMnOidyYmJyaycsJ1xcdTIwMTYnOidWZXJ0JywnXFx4QTcnOidzZWN0JywnXFx4QjYnOidwYXJhJywnQCc6J2NvbW1hdCcsJyonOidhc3QnLCcvJzonc29sJywndW5kZWZpbmVkJzpudWxsLCcmJzonYW1wJywnIyc6J251bScsJyUnOidwZXJjbnQnLCdcXHUyMDMwJzoncGVybWlsJywnXFx1MjAzMSc6J3BlcnRlbmsnLCdcXHUyMDIwJzonZGFnZ2VyJywnXFx1MjAyMSc6J0RhZ2dlcicsJ1xcdTIwMjInOididWxsJywnXFx1MjA0Myc6J2h5YnVsbCcsJ1xcdTIwMzInOidwcmltZScsJ1xcdTIwMzMnOidQcmltZScsJ1xcdTIwMzQnOid0cHJpbWUnLCdcXHUyMDU3JzoncXByaW1lJywnXFx1MjAzNSc6J2JwcmltZScsJ1xcdTIwNDEnOidjYXJldCcsJ2AnOidncmF2ZScsJ1xceEI0JzonYWN1dGUnLCdcXHUwMkRDJzondGlsZGUnLCdeJzonSGF0JywnXFx4QUYnOidtYWNyJywnXFx1MDJEOCc6J2JyZXZlJywnXFx1MDJEOSc6J2RvdCcsJ1xceEE4JzonZGllJywnXFx1MDJEQSc6J3JpbmcnLCdcXHUwMkREJzonZGJsYWMnLCdcXHhCOCc6J2NlZGlsJywnXFx1MDJEQic6J29nb24nLCdcXHUwMkM2JzonY2lyYycsJ1xcdTAyQzcnOidjYXJvbicsJ1xceEIwJzonZGVnJywnXFx4QTknOidjb3B5JywnXFx4QUUnOidyZWcnLCdcXHUyMTE3JzonY29weXNyJywnXFx1MjExOCc6J3dwJywnXFx1MjExRSc6J3J4JywnXFx1MjEyNyc6J21obycsJ1xcdTIxMjknOidpaW90YScsJ1xcdTIxOTAnOidsYXJyJywnXFx1MjE5QSc6J25sYXJyJywnXFx1MjE5Mic6J3JhcnInLCdcXHUyMTlCJzonbnJhcnInLCdcXHUyMTkxJzondWFycicsJ1xcdTIxOTMnOidkYXJyJywnXFx1MjE5NCc6J2hhcnInLCdcXHUyMUFFJzonbmhhcnInLCdcXHUyMTk1JzondmFycicsJ1xcdTIxOTYnOidud2FycicsJ1xcdTIxOTcnOiduZWFycicsJ1xcdTIxOTgnOidzZWFycicsJ1xcdTIxOTknOidzd2FycicsJ1xcdTIxOUQnOidyYXJydycsJ1xcdTIxOURcXHUwMzM4JzonbnJhcnJ3JywnXFx1MjE5RSc6J0xhcnInLCdcXHUyMTlGJzonVWFycicsJ1xcdTIxQTAnOidSYXJyJywnXFx1MjFBMSc6J0RhcnInLCdcXHUyMUEyJzonbGFycnRsJywnXFx1MjFBMyc6J3JhcnJ0bCcsJ1xcdTIxQTQnOidtYXBzdG9sZWZ0JywnXFx1MjFBNSc6J21hcHN0b3VwJywnXFx1MjFBNic6J21hcCcsJ1xcdTIxQTcnOidtYXBzdG9kb3duJywnXFx1MjFBOSc6J2xhcnJoaycsJ1xcdTIxQUEnOidyYXJyaGsnLCdcXHUyMUFCJzonbGFycmxwJywnXFx1MjFBQyc6J3JhcnJscCcsJ1xcdTIxQUQnOidoYXJydycsJ1xcdTIxQjAnOidsc2gnLCdcXHUyMUIxJzoncnNoJywnXFx1MjFCMic6J2xkc2gnLCdcXHUyMUIzJzoncmRzaCcsJ1xcdTIxQjUnOidjcmFycicsJ1xcdTIxQjYnOidjdWxhcnInLCdcXHUyMUI3JzonY3VyYXJyJywnXFx1MjFCQSc6J29sYXJyJywnXFx1MjFCQic6J29yYXJyJywnXFx1MjFCQyc6J2xoYXJ1JywnXFx1MjFCRCc6J2xoYXJkJywnXFx1MjFCRSc6J3VoYXJyJywnXFx1MjFCRic6J3VoYXJsJywnXFx1MjFDMCc6J3JoYXJ1JywnXFx1MjFDMSc6J3JoYXJkJywnXFx1MjFDMic6J2RoYXJyJywnXFx1MjFDMyc6J2RoYXJsJywnXFx1MjFDNCc6J3JsYXJyJywnXFx1MjFDNSc6J3VkYXJyJywnXFx1MjFDNic6J2xyYXJyJywnXFx1MjFDNyc6J2xsYXJyJywnXFx1MjFDOCc6J3V1YXJyJywnXFx1MjFDOSc6J3JyYXJyJywnXFx1MjFDQSc6J2RkYXJyJywnXFx1MjFDQic6J2xyaGFyJywnXFx1MjFDQyc6J3JsaGFyJywnXFx1MjFEMCc6J2xBcnInLCdcXHUyMUNEJzonbmxBcnInLCdcXHUyMUQxJzondUFycicsJ1xcdTIxRDInOidyQXJyJywnXFx1MjFDRic6J25yQXJyJywnXFx1MjFEMyc6J2RBcnInLCdcXHUyMUQ0JzonaWZmJywnXFx1MjFDRSc6J25oQXJyJywnXFx1MjFENSc6J3ZBcnInLCdcXHUyMUQ2JzonbndBcnInLCdcXHUyMUQ3JzonbmVBcnInLCdcXHUyMUQ4Jzonc2VBcnInLCdcXHUyMUQ5Jzonc3dBcnInLCdcXHUyMURBJzonbEFhcnInLCdcXHUyMURCJzonckFhcnInLCdcXHUyMUREJzonemlncmFycicsJ1xcdTIxRTQnOidsYXJyYicsJ1xcdTIxRTUnOidyYXJyYicsJ1xcdTIxRjUnOidkdWFycicsJ1xcdTIxRkQnOidsb2FycicsJ1xcdTIxRkUnOidyb2FycicsJ1xcdTIxRkYnOidob2FycicsJ1xcdTIyMDAnOidmb3JhbGwnLCdcXHUyMjAxJzonY29tcCcsJ1xcdTIyMDInOidwYXJ0JywnXFx1MjIwMlxcdTAzMzgnOiducGFydCcsJ1xcdTIyMDMnOidleGlzdCcsJ1xcdTIyMDQnOiduZXhpc3QnLCdcXHUyMjA1JzonZW1wdHknLCdcXHUyMjA3JzonRGVsJywnXFx1MjIwOCc6J2luJywnXFx1MjIwOSc6J25vdGluJywnXFx1MjIwQic6J25pJywnXFx1MjIwQyc6J25vdG5pJywnXFx1MDNGNic6J2JlcHNpJywnXFx1MjIwRic6J3Byb2QnLCdcXHUyMjEwJzonY29wcm9kJywnXFx1MjIxMSc6J3N1bScsJysnOidwbHVzJywnXFx4QjEnOidwbScsJ1xceEY3JzonZGl2JywnXFx4RDcnOid0aW1lcycsJzwnOidsdCcsJ1xcdTIyNkUnOidubHQnLCc8XFx1MjBEMic6J252bHQnLCc9JzonZXF1YWxzJywnXFx1MjI2MCc6J25lJywnPVxcdTIwRTUnOidibmUnLCdcXHUyQTc1JzonRXF1YWwnLCc+JzonZ3QnLCdcXHUyMjZGJzonbmd0JywnPlxcdTIwRDInOidudmd0JywnXFx4QUMnOidub3QnLCd8JzondmVydCcsJ1xceEE2JzonYnJ2YmFyJywnXFx1MjIxMic6J21pbnVzJywnXFx1MjIxMyc6J21wJywnXFx1MjIxNCc6J3BsdXNkbycsJ1xcdTIwNDQnOidmcmFzbCcsJ1xcdTIyMTYnOidzZXRtbicsJ1xcdTIyMTcnOidsb3dhc3QnLCdcXHUyMjE4JzonY29tcGZuJywnXFx1MjIxQSc6J1NxcnQnLCdcXHUyMjFEJzoncHJvcCcsJ1xcdTIyMUUnOidpbmZpbicsJ1xcdTIyMUYnOidhbmdydCcsJ1xcdTIyMjAnOidhbmcnLCdcXHUyMjIwXFx1MjBEMic6J25hbmcnLCdcXHUyMjIxJzonYW5nbXNkJywnXFx1MjIyMic6J2FuZ3NwaCcsJ1xcdTIyMjMnOidtaWQnLCdcXHUyMjI0Jzonbm1pZCcsJ1xcdTIyMjUnOidwYXInLCdcXHUyMjI2JzonbnBhcicsJ1xcdTIyMjcnOidhbmQnLCdcXHUyMjI4Jzonb3InLCdcXHUyMjI5JzonY2FwJywnXFx1MjIyOVxcdUZFMDAnOidjYXBzJywnXFx1MjIyQSc6J2N1cCcsJ1xcdTIyMkFcXHVGRTAwJzonY3VwcycsJ1xcdTIyMkInOidpbnQnLCdcXHUyMjJDJzonSW50JywnXFx1MjIyRCc6J3RpbnQnLCdcXHUyQTBDJzoncWludCcsJ1xcdTIyMkUnOidvaW50JywnXFx1MjIyRic6J0NvbmludCcsJ1xcdTIyMzAnOidDY29uaW50JywnXFx1MjIzMSc6J2N3aW50JywnXFx1MjIzMic6J2N3Y29uaW50JywnXFx1MjIzMyc6J2F3Y29uaW50JywnXFx1MjIzNCc6J3RoZXJlNCcsJ1xcdTIyMzUnOidiZWNhdXMnLCdcXHUyMjM2JzoncmF0aW8nLCdcXHUyMjM3JzonQ29sb24nLCdcXHUyMjM4JzonbWludXNkJywnXFx1MjIzQSc6J21ERG90JywnXFx1MjIzQic6J2hvbXRodCcsJ1xcdTIyM0MnOidzaW0nLCdcXHUyMjQxJzonbnNpbScsJ1xcdTIyM0NcXHUyMEQyJzonbnZzaW0nLCdcXHUyMjNEJzonYnNpbScsJ1xcdTIyM0RcXHUwMzMxJzoncmFjZScsJ1xcdTIyM0UnOidhYycsJ1xcdTIyM0VcXHUwMzMzJzonYWNFJywnXFx1MjIzRic6J2FjZCcsJ1xcdTIyNDAnOid3cicsJ1xcdTIyNDInOidlc2ltJywnXFx1MjI0MlxcdTAzMzgnOiduZXNpbScsJ1xcdTIyNDMnOidzaW1lJywnXFx1MjI0NCc6J25zaW1lJywnXFx1MjI0NSc6J2NvbmcnLCdcXHUyMjQ3JzonbmNvbmcnLCdcXHUyMjQ2Jzonc2ltbmUnLCdcXHUyMjQ4JzonYXAnLCdcXHUyMjQ5JzonbmFwJywnXFx1MjI0QSc6J2FwZScsJ1xcdTIyNEInOidhcGlkJywnXFx1MjI0QlxcdTAzMzgnOiduYXBpZCcsJ1xcdTIyNEMnOidiY29uZycsJ1xcdTIyNEQnOidDdXBDYXAnLCdcXHUyMjZEJzonTm90Q3VwQ2FwJywnXFx1MjI0RFxcdTIwRDInOidudmFwJywnXFx1MjI0RSc6J2J1bXAnLCdcXHUyMjRFXFx1MDMzOCc6J25idW1wJywnXFx1MjI0Ric6J2J1bXBlJywnXFx1MjI0RlxcdTAzMzgnOiduYnVtcGUnLCdcXHUyMjUwJzonZG90ZXEnLCdcXHUyMjUwXFx1MDMzOCc6J25lZG90JywnXFx1MjI1MSc6J2VEb3QnLCdcXHUyMjUyJzonZWZEb3QnLCdcXHUyMjUzJzonZXJEb3QnLCdcXHUyMjU0JzonY29sb25lJywnXFx1MjI1NSc6J2Vjb2xvbicsJ1xcdTIyNTYnOidlY2lyJywnXFx1MjI1Nyc6J2NpcmUnLCdcXHUyMjU5Jzond2VkZ2VxJywnXFx1MjI1QSc6J3ZlZWVxJywnXFx1MjI1Qyc6J3RyaWUnLCdcXHUyMjVGJzonZXF1ZXN0JywnXFx1MjI2MSc6J2VxdWl2JywnXFx1MjI2Mic6J25lcXVpdicsJ1xcdTIyNjFcXHUyMEU1JzonYm5lcXVpdicsJ1xcdTIyNjQnOidsZScsJ1xcdTIyNzAnOidubGUnLCdcXHUyMjY0XFx1MjBEMic6J252bGUnLCdcXHUyMjY1JzonZ2UnLCdcXHUyMjcxJzonbmdlJywnXFx1MjI2NVxcdTIwRDInOidudmdlJywnXFx1MjI2Nic6J2xFJywnXFx1MjI2NlxcdTAzMzgnOidubEUnLCdcXHUyMjY3JzonZ0UnLCdcXHUyMjY3XFx1MDMzOCc6J25nRScsJ1xcdTIyNjhcXHVGRTAwJzonbHZuRScsJ1xcdTIyNjgnOidsbkUnLCdcXHUyMjY5JzonZ25FJywnXFx1MjI2OVxcdUZFMDAnOidndm5FJywnXFx1MjI2QSc6J2xsJywnXFx1MjI2QVxcdTAzMzgnOiduTHR2JywnXFx1MjI2QVxcdTIwRDInOiduTHQnLCdcXHUyMjZCJzonZ2cnLCdcXHUyMjZCXFx1MDMzOCc6J25HdHYnLCdcXHUyMjZCXFx1MjBEMic6J25HdCcsJ1xcdTIyNkMnOid0d2l4dCcsJ1xcdTIyNzInOidsc2ltJywnXFx1MjI3NCc6J25sc2ltJywnXFx1MjI3Myc6J2dzaW0nLCdcXHUyMjc1JzonbmdzaW0nLCdcXHUyMjc2JzonbGcnLCdcXHUyMjc4JzonbnRsZycsJ1xcdTIyNzcnOidnbCcsJ1xcdTIyNzknOidudGdsJywnXFx1MjI3QSc6J3ByJywnXFx1MjI4MCc6J25wcicsJ1xcdTIyN0InOidzYycsJ1xcdTIyODEnOiduc2MnLCdcXHUyMjdDJzoncHJjdWUnLCdcXHUyMkUwJzonbnByY3VlJywnXFx1MjI3RCc6J3NjY3VlJywnXFx1MjJFMSc6J25zY2N1ZScsJ1xcdTIyN0UnOidwcnNpbScsJ1xcdTIyN0YnOidzY3NpbScsJ1xcdTIyN0ZcXHUwMzM4JzonTm90U3VjY2VlZHNUaWxkZScsJ1xcdTIyODInOidzdWInLCdcXHUyMjg0JzonbnN1YicsJ1xcdTIyODJcXHUyMEQyJzondm5zdWInLCdcXHUyMjgzJzonc3VwJywnXFx1MjI4NSc6J25zdXAnLCdcXHUyMjgzXFx1MjBEMic6J3Zuc3VwJywnXFx1MjI4Nic6J3N1YmUnLCdcXHUyMjg4JzonbnN1YmUnLCdcXHUyMjg3Jzonc3VwZScsJ1xcdTIyODknOiduc3VwZScsJ1xcdTIyOEFcXHVGRTAwJzondnN1Ym5lJywnXFx1MjI4QSc6J3N1Ym5lJywnXFx1MjI4QlxcdUZFMDAnOid2c3VwbmUnLCdcXHUyMjhCJzonc3VwbmUnLCdcXHUyMjhEJzonY3VwZG90JywnXFx1MjI4RSc6J3VwbHVzJywnXFx1MjI4Ric6J3Nxc3ViJywnXFx1MjI4RlxcdTAzMzgnOidOb3RTcXVhcmVTdWJzZXQnLCdcXHUyMjkwJzonc3FzdXAnLCdcXHUyMjkwXFx1MDMzOCc6J05vdFNxdWFyZVN1cGVyc2V0JywnXFx1MjI5MSc6J3Nxc3ViZScsJ1xcdTIyRTInOiduc3FzdWJlJywnXFx1MjI5Mic6J3Nxc3VwZScsJ1xcdTIyRTMnOiduc3FzdXBlJywnXFx1MjI5Myc6J3NxY2FwJywnXFx1MjI5M1xcdUZFMDAnOidzcWNhcHMnLCdcXHUyMjk0Jzonc3FjdXAnLCdcXHUyMjk0XFx1RkUwMCc6J3NxY3VwcycsJ1xcdTIyOTUnOidvcGx1cycsJ1xcdTIyOTYnOidvbWludXMnLCdcXHUyMjk3Jzonb3RpbWVzJywnXFx1MjI5OCc6J29zb2wnLCdcXHUyMjk5Jzonb2RvdCcsJ1xcdTIyOUEnOidvY2lyJywnXFx1MjI5Qic6J29hc3QnLCdcXHUyMjlEJzonb2Rhc2gnLCdcXHUyMjlFJzoncGx1c2InLCdcXHUyMjlGJzonbWludXNiJywnXFx1MjJBMCc6J3RpbWVzYicsJ1xcdTIyQTEnOidzZG90YicsJ1xcdTIyQTInOid2ZGFzaCcsJ1xcdTIyQUMnOidudmRhc2gnLCdcXHUyMkEzJzonZGFzaHYnLCdcXHUyMkE0JzondG9wJywnXFx1MjJBNSc6J2JvdCcsJ1xcdTIyQTcnOidtb2RlbHMnLCdcXHUyMkE4JzondkRhc2gnLCdcXHUyMkFEJzonbnZEYXNoJywnXFx1MjJBOSc6J1ZkYXNoJywnXFx1MjJBRSc6J25WZGFzaCcsJ1xcdTIyQUEnOidWdmRhc2gnLCdcXHUyMkFCJzonVkRhc2gnLCdcXHUyMkFGJzonblZEYXNoJywnXFx1MjJCMCc6J3BydXJlbCcsJ1xcdTIyQjInOid2bHRyaScsJ1xcdTIyRUEnOidubHRyaScsJ1xcdTIyQjMnOid2cnRyaScsJ1xcdTIyRUInOiducnRyaScsJ1xcdTIyQjQnOidsdHJpZScsJ1xcdTIyRUMnOidubHRyaWUnLCdcXHUyMkI0XFx1MjBEMic6J252bHRyaWUnLCdcXHUyMkI1JzoncnRyaWUnLCdcXHUyMkVEJzonbnJ0cmllJywnXFx1MjJCNVxcdTIwRDInOidudnJ0cmllJywnXFx1MjJCNic6J29yaWdvZicsJ1xcdTIyQjcnOidpbW9mJywnXFx1MjJCOCc6J211bWFwJywnXFx1MjJCOSc6J2hlcmNvbicsJ1xcdTIyQkEnOidpbnRjYWwnLCdcXHUyMkJCJzondmVlYmFyJywnXFx1MjJCRCc6J2JhcnZlZScsJ1xcdTIyQkUnOidhbmdydHZiJywnXFx1MjJCRic6J2xydHJpJywnXFx1MjJDMCc6J1dlZGdlJywnXFx1MjJDMSc6J1ZlZScsJ1xcdTIyQzInOid4Y2FwJywnXFx1MjJDMyc6J3hjdXAnLCdcXHUyMkM0JzonZGlhbScsJ1xcdTIyQzUnOidzZG90JywnXFx1MjJDNic6J1N0YXInLCdcXHUyMkM3JzonZGl2b254JywnXFx1MjJDOCc6J2Jvd3RpZScsJ1xcdTIyQzknOidsdGltZXMnLCdcXHUyMkNBJzoncnRpbWVzJywnXFx1MjJDQic6J2x0aHJlZScsJ1xcdTIyQ0MnOidydGhyZWUnLCdcXHUyMkNEJzonYnNpbWUnLCdcXHUyMkNFJzonY3V2ZWUnLCdcXHUyMkNGJzonY3V3ZWQnLCdcXHUyMkQwJzonU3ViJywnXFx1MjJEMSc6J1N1cCcsJ1xcdTIyRDInOidDYXAnLCdcXHUyMkQzJzonQ3VwJywnXFx1MjJENCc6J2ZvcmsnLCdcXHUyMkQ1JzonZXBhcicsJ1xcdTIyRDYnOidsdGRvdCcsJ1xcdTIyRDcnOidndGRvdCcsJ1xcdTIyRDgnOidMbCcsJ1xcdTIyRDhcXHUwMzM4JzonbkxsJywnXFx1MjJEOSc6J0dnJywnXFx1MjJEOVxcdTAzMzgnOiduR2cnLCdcXHUyMkRBXFx1RkUwMCc6J2xlc2cnLCdcXHUyMkRBJzonbGVnJywnXFx1MjJEQic6J2dlbCcsJ1xcdTIyREJcXHVGRTAwJzonZ2VzbCcsJ1xcdTIyREUnOidjdWVwcicsJ1xcdTIyREYnOidjdWVzYycsJ1xcdTIyRTYnOidsbnNpbScsJ1xcdTIyRTcnOidnbnNpbScsJ1xcdTIyRTgnOidwcm5zaW0nLCdcXHUyMkU5Jzonc2Nuc2ltJywnXFx1MjJFRSc6J3ZlbGxpcCcsJ1xcdTIyRUYnOidjdGRvdCcsJ1xcdTIyRjAnOid1dGRvdCcsJ1xcdTIyRjEnOidkdGRvdCcsJ1xcdTIyRjInOidkaXNpbicsJ1xcdTIyRjMnOidpc2luc3YnLCdcXHUyMkY0JzonaXNpbnMnLCdcXHUyMkY1JzonaXNpbmRvdCcsJ1xcdTIyRjVcXHUwMzM4Jzonbm90aW5kb3QnLCdcXHUyMkY2Jzonbm90aW52YycsJ1xcdTIyRjcnOidub3RpbnZiJywnXFx1MjJGOSc6J2lzaW5FJywnXFx1MjJGOVxcdTAzMzgnOidub3RpbkUnLCdcXHUyMkZBJzonbmlzZCcsJ1xcdTIyRkInOid4bmlzJywnXFx1MjJGQyc6J25pcycsJ1xcdTIyRkQnOidub3RuaXZjJywnXFx1MjJGRSc6J25vdG5pdmInLCdcXHUyMzA1JzonYmFyd2VkJywnXFx1MjMwNic6J0JhcndlZCcsJ1xcdTIzMEMnOidkcmNyb3AnLCdcXHUyMzBEJzonZGxjcm9wJywnXFx1MjMwRSc6J3VyY3JvcCcsJ1xcdTIzMEYnOid1bGNyb3AnLCdcXHUyMzEwJzonYm5vdCcsJ1xcdTIzMTInOidwcm9mbGluZScsJ1xcdTIzMTMnOidwcm9mc3VyZicsJ1xcdTIzMTUnOid0ZWxyZWMnLCdcXHUyMzE2JzondGFyZ2V0JywnXFx1MjMxQyc6J3VsY29ybicsJ1xcdTIzMUQnOid1cmNvcm4nLCdcXHUyMzFFJzonZGxjb3JuJywnXFx1MjMxRic6J2RyY29ybicsJ1xcdTIzMjInOidmcm93bicsJ1xcdTIzMjMnOidzbWlsZScsJ1xcdTIzMkQnOidjeWxjdHknLCdcXHUyMzJFJzoncHJvZmFsYXInLCdcXHUyMzM2JzondG9wYm90JywnXFx1MjMzRCc6J292YmFyJywnXFx1MjMzRic6J3NvbGJhcicsJ1xcdTIzN0MnOidhbmd6YXJyJywnXFx1MjNCMCc6J2xtb3VzdCcsJ1xcdTIzQjEnOidybW91c3QnLCdcXHUyM0I0JzondGJyaycsJ1xcdTIzQjUnOidiYnJrJywnXFx1MjNCNic6J2Jicmt0YnJrJywnXFx1MjNEQyc6J092ZXJQYXJlbnRoZXNpcycsJ1xcdTIzREQnOidVbmRlclBhcmVudGhlc2lzJywnXFx1MjNERSc6J092ZXJCcmFjZScsJ1xcdTIzREYnOidVbmRlckJyYWNlJywnXFx1MjNFMic6J3RycGV6aXVtJywnXFx1MjNFNyc6J2VsaW50ZXJzJywnXFx1MjQyMyc6J2JsYW5rJywnXFx1MjUwMCc6J2JveGgnLCdcXHUyNTAyJzonYm94dicsJ1xcdTI1MEMnOidib3hkcicsJ1xcdTI1MTAnOidib3hkbCcsJ1xcdTI1MTQnOidib3h1cicsJ1xcdTI1MTgnOidib3h1bCcsJ1xcdTI1MUMnOidib3h2cicsJ1xcdTI1MjQnOidib3h2bCcsJ1xcdTI1MkMnOidib3hoZCcsJ1xcdTI1MzQnOidib3hodScsJ1xcdTI1M0MnOidib3h2aCcsJ1xcdTI1NTAnOidib3hIJywnXFx1MjU1MSc6J2JveFYnLCdcXHUyNTUyJzonYm94ZFInLCdcXHUyNTUzJzonYm94RHInLCdcXHUyNTU0JzonYm94RFInLCdcXHUyNTU1JzonYm94ZEwnLCdcXHUyNTU2JzonYm94RGwnLCdcXHUyNTU3JzonYm94REwnLCdcXHUyNTU4JzonYm94dVInLCdcXHUyNTU5JzonYm94VXInLCdcXHUyNTVBJzonYm94VVInLCdcXHUyNTVCJzonYm94dUwnLCdcXHUyNTVDJzonYm94VWwnLCdcXHUyNTVEJzonYm94VUwnLCdcXHUyNTVFJzonYm94dlInLCdcXHUyNTVGJzonYm94VnInLCdcXHUyNTYwJzonYm94VlInLCdcXHUyNTYxJzonYm94dkwnLCdcXHUyNTYyJzonYm94VmwnLCdcXHUyNTYzJzonYm94VkwnLCdcXHUyNTY0JzonYm94SGQnLCdcXHUyNTY1JzonYm94aEQnLCdcXHUyNTY2JzonYm94SEQnLCdcXHUyNTY3JzonYm94SHUnLCdcXHUyNTY4JzonYm94aFUnLCdcXHUyNTY5JzonYm94SFUnLCdcXHUyNTZBJzonYm94dkgnLCdcXHUyNTZCJzonYm94VmgnLCdcXHUyNTZDJzonYm94VkgnLCdcXHUyNTgwJzondWhibGsnLCdcXHUyNTg0JzonbGhibGsnLCdcXHUyNTg4JzonYmxvY2snLCdcXHUyNTkxJzonYmxrMTQnLCdcXHUyNTkyJzonYmxrMTInLCdcXHUyNTkzJzonYmxrMzQnLCdcXHUyNUExJzonc3F1JywnXFx1MjVBQSc6J3NxdWYnLCdcXHUyNUFCJzonRW1wdHlWZXJ5U21hbGxTcXVhcmUnLCdcXHUyNUFEJzoncmVjdCcsJ1xcdTI1QUUnOidtYXJrZXInLCdcXHUyNUIxJzonZmx0bnMnLCdcXHUyNUIzJzoneHV0cmknLCdcXHUyNUI0JzondXRyaWYnLCdcXHUyNUI1JzondXRyaScsJ1xcdTI1QjgnOidydHJpZicsJ1xcdTI1QjknOidydHJpJywnXFx1MjVCRCc6J3hkdHJpJywnXFx1MjVCRSc6J2R0cmlmJywnXFx1MjVCRic6J2R0cmknLCdcXHUyNUMyJzonbHRyaWYnLCdcXHUyNUMzJzonbHRyaScsJ1xcdTI1Q0EnOidsb3onLCdcXHUyNUNCJzonY2lyJywnXFx1MjVFQyc6J3RyaWRvdCcsJ1xcdTI1RUYnOid4Y2lyYycsJ1xcdTI1RjgnOid1bHRyaScsJ1xcdTI1RjknOid1cnRyaScsJ1xcdTI1RkEnOidsbHRyaScsJ1xcdTI1RkInOidFbXB0eVNtYWxsU3F1YXJlJywnXFx1MjVGQyc6J0ZpbGxlZFNtYWxsU3F1YXJlJywnXFx1MjYwNSc6J3N0YXJmJywnXFx1MjYwNic6J3N0YXInLCdcXHUyNjBFJzoncGhvbmUnLCdcXHUyNjQwJzonZmVtYWxlJywnXFx1MjY0Mic6J21hbGUnLCdcXHUyNjYwJzonc3BhZGVzJywnXFx1MjY2Myc6J2NsdWJzJywnXFx1MjY2NSc6J2hlYXJ0cycsJ1xcdTI2NjYnOidkaWFtcycsJ1xcdTI2NkEnOidzdW5nJywnXFx1MjcxMyc6J2NoZWNrJywnXFx1MjcxNyc6J2Nyb3NzJywnXFx1MjcyMCc6J21hbHQnLCdcXHUyNzM2Jzonc2V4dCcsJ1xcdTI3NTgnOidWZXJ0aWNhbFNlcGFyYXRvcicsJ1xcdTI3QzgnOidic29saHN1YicsJ1xcdTI3QzknOidzdXBoc29sJywnXFx1MjdGNSc6J3hsYXJyJywnXFx1MjdGNic6J3hyYXJyJywnXFx1MjdGNyc6J3hoYXJyJywnXFx1MjdGOCc6J3hsQXJyJywnXFx1MjdGOSc6J3hyQXJyJywnXFx1MjdGQSc6J3hoQXJyJywnXFx1MjdGQyc6J3htYXAnLCdcXHUyN0ZGJzonZHppZ3JhcnInLCdcXHUyOTAyJzonbnZsQXJyJywnXFx1MjkwMyc6J252ckFycicsJ1xcdTI5MDQnOidudkhhcnInLCdcXHUyOTA1JzonTWFwJywnXFx1MjkwQyc6J2xiYXJyJywnXFx1MjkwRCc6J3JiYXJyJywnXFx1MjkwRSc6J2xCYXJyJywnXFx1MjkwRic6J3JCYXJyJywnXFx1MjkxMCc6J1JCYXJyJywnXFx1MjkxMSc6J0REb3RyYWhkJywnXFx1MjkxMic6J1VwQXJyb3dCYXInLCdcXHUyOTEzJzonRG93bkFycm93QmFyJywnXFx1MjkxNic6J1JhcnJ0bCcsJ1xcdTI5MTknOidsYXRhaWwnLCdcXHUyOTFBJzoncmF0YWlsJywnXFx1MjkxQic6J2xBdGFpbCcsJ1xcdTI5MUMnOidyQXRhaWwnLCdcXHUyOTFEJzonbGFycmZzJywnXFx1MjkxRSc6J3JhcnJmcycsJ1xcdTI5MUYnOidsYXJyYmZzJywnXFx1MjkyMCc6J3JhcnJiZnMnLCdcXHUyOTIzJzonbndhcmhrJywnXFx1MjkyNCc6J25lYXJoaycsJ1xcdTI5MjUnOidzZWFyaGsnLCdcXHUyOTI2Jzonc3dhcmhrJywnXFx1MjkyNyc6J253bmVhcicsJ1xcdTI5MjgnOid0b2VhJywnXFx1MjkyOSc6J3Rvc2EnLCdcXHUyOTJBJzonc3dud2FyJywnXFx1MjkzMyc6J3JhcnJjJywnXFx1MjkzM1xcdTAzMzgnOiducmFycmMnLCdcXHUyOTM1JzonY3VkYXJycicsJ1xcdTI5MzYnOidsZGNhJywnXFx1MjkzNyc6J3JkY2EnLCdcXHUyOTM4JzonY3VkYXJybCcsJ1xcdTI5MzknOidsYXJycGwnLCdcXHUyOTNDJzonY3VyYXJybScsJ1xcdTI5M0QnOidjdWxhcnJwJywnXFx1Mjk0NSc6J3JhcnJwbCcsJ1xcdTI5NDgnOidoYXJyY2lyJywnXFx1Mjk0OSc6J1VhcnJvY2lyJywnXFx1Mjk0QSc6J2x1cmRzaGFyJywnXFx1Mjk0Qic6J2xkcnVzaGFyJywnXFx1Mjk0RSc6J0xlZnRSaWdodFZlY3RvcicsJ1xcdTI5NEYnOidSaWdodFVwRG93blZlY3RvcicsJ1xcdTI5NTAnOidEb3duTGVmdFJpZ2h0VmVjdG9yJywnXFx1Mjk1MSc6J0xlZnRVcERvd25WZWN0b3InLCdcXHUyOTUyJzonTGVmdFZlY3RvckJhcicsJ1xcdTI5NTMnOidSaWdodFZlY3RvckJhcicsJ1xcdTI5NTQnOidSaWdodFVwVmVjdG9yQmFyJywnXFx1Mjk1NSc6J1JpZ2h0RG93blZlY3RvckJhcicsJ1xcdTI5NTYnOidEb3duTGVmdFZlY3RvckJhcicsJ1xcdTI5NTcnOidEb3duUmlnaHRWZWN0b3JCYXInLCdcXHUyOTU4JzonTGVmdFVwVmVjdG9yQmFyJywnXFx1Mjk1OSc6J0xlZnREb3duVmVjdG9yQmFyJywnXFx1Mjk1QSc6J0xlZnRUZWVWZWN0b3InLCdcXHUyOTVCJzonUmlnaHRUZWVWZWN0b3InLCdcXHUyOTVDJzonUmlnaHRVcFRlZVZlY3RvcicsJ1xcdTI5NUQnOidSaWdodERvd25UZWVWZWN0b3InLCdcXHUyOTVFJzonRG93bkxlZnRUZWVWZWN0b3InLCdcXHUyOTVGJzonRG93blJpZ2h0VGVlVmVjdG9yJywnXFx1Mjk2MCc6J0xlZnRVcFRlZVZlY3RvcicsJ1xcdTI5NjEnOidMZWZ0RG93blRlZVZlY3RvcicsJ1xcdTI5NjInOidsSGFyJywnXFx1Mjk2Myc6J3VIYXInLCdcXHUyOTY0JzonckhhcicsJ1xcdTI5NjUnOidkSGFyJywnXFx1Mjk2Nic6J2x1cnVoYXInLCdcXHUyOTY3JzonbGRyZGhhcicsJ1xcdTI5NjgnOidydWx1aGFyJywnXFx1Mjk2OSc6J3JkbGRoYXInLCdcXHUyOTZBJzonbGhhcnVsJywnXFx1Mjk2Qic6J2xsaGFyZCcsJ1xcdTI5NkMnOidyaGFydWwnLCdcXHUyOTZEJzonbHJoYXJkJywnXFx1Mjk2RSc6J3VkaGFyJywnXFx1Mjk2Ric6J2R1aGFyJywnXFx1Mjk3MCc6J1JvdW5kSW1wbGllcycsJ1xcdTI5NzEnOidlcmFycicsJ1xcdTI5NzInOidzaW1yYXJyJywnXFx1Mjk3Myc6J2xhcnJzaW0nLCdcXHUyOTc0JzoncmFycnNpbScsJ1xcdTI5NzUnOidyYXJyYXAnLCdcXHUyOTc2JzonbHRsYXJyJywnXFx1Mjk3OCc6J2d0cmFycicsJ1xcdTI5NzknOidzdWJyYXJyJywnXFx1Mjk3Qic6J3N1cGxhcnInLCdcXHUyOTdDJzonbGZpc2h0JywnXFx1Mjk3RCc6J3JmaXNodCcsJ1xcdTI5N0UnOid1ZmlzaHQnLCdcXHUyOTdGJzonZGZpc2h0JywnXFx1Mjk5QSc6J3Z6aWd6YWcnLCdcXHUyOTlDJzondmFuZ3J0JywnXFx1Mjk5RCc6J2FuZ3J0dmJkJywnXFx1MjlBNCc6J2FuZ2UnLCdcXHUyOUE1JzoncmFuZ2UnLCdcXHUyOUE2JzonZHdhbmdsZScsJ1xcdTI5QTcnOid1d2FuZ2xlJywnXFx1MjlBOCc6J2FuZ21zZGFhJywnXFx1MjlBOSc6J2FuZ21zZGFiJywnXFx1MjlBQSc6J2FuZ21zZGFjJywnXFx1MjlBQic6J2FuZ21zZGFkJywnXFx1MjlBQyc6J2FuZ21zZGFlJywnXFx1MjlBRCc6J2FuZ21zZGFmJywnXFx1MjlBRSc6J2FuZ21zZGFnJywnXFx1MjlBRic6J2FuZ21zZGFoJywnXFx1MjlCMCc6J2JlbXB0eXYnLCdcXHUyOUIxJzonZGVtcHR5dicsJ1xcdTI5QjInOidjZW1wdHl2JywnXFx1MjlCMyc6J3JhZW1wdHl2JywnXFx1MjlCNCc6J2xhZW1wdHl2JywnXFx1MjlCNSc6J29oYmFyJywnXFx1MjlCNic6J29taWQnLCdcXHUyOUI3Jzonb3BhcicsJ1xcdTI5QjknOidvcGVycCcsJ1xcdTI5QkInOidvbGNyb3NzJywnXFx1MjlCQyc6J29kc29sZCcsJ1xcdTI5QkUnOidvbGNpcicsJ1xcdTI5QkYnOidvZmNpcicsJ1xcdTI5QzAnOidvbHQnLCdcXHUyOUMxJzonb2d0JywnXFx1MjlDMic6J2NpcnNjaXInLCdcXHUyOUMzJzonY2lyRScsJ1xcdTI5QzQnOidzb2xiJywnXFx1MjlDNSc6J2Jzb2xiJywnXFx1MjlDOSc6J2JveGJveCcsJ1xcdTI5Q0QnOid0cmlzYicsJ1xcdTI5Q0UnOidydHJpbHRyaScsJ1xcdTI5Q0YnOidMZWZ0VHJpYW5nbGVCYXInLCdcXHUyOUNGXFx1MDMzOCc6J05vdExlZnRUcmlhbmdsZUJhcicsJ1xcdTI5RDAnOidSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEMFxcdTAzMzgnOidOb3RSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEQyc6J2lpbmZpbicsJ1xcdTI5REQnOidpbmZpbnRpZScsJ1xcdTI5REUnOidudmluZmluJywnXFx1MjlFMyc6J2VwYXJzbCcsJ1xcdTI5RTQnOidzbWVwYXJzbCcsJ1xcdTI5RTUnOidlcXZwYXJzbCcsJ1xcdTI5RUInOidsb3pmJywnXFx1MjlGNCc6J1J1bGVEZWxheWVkJywnXFx1MjlGNic6J2Rzb2wnLCdcXHUyQTAwJzoneG9kb3QnLCdcXHUyQTAxJzoneG9wbHVzJywnXFx1MkEwMic6J3hvdGltZScsJ1xcdTJBMDQnOid4dXBsdXMnLCdcXHUyQTA2JzoneHNxY3VwJywnXFx1MkEwRCc6J2ZwYXJ0aW50JywnXFx1MkExMCc6J2NpcmZuaW50JywnXFx1MkExMSc6J2F3aW50JywnXFx1MkExMic6J3JwcG9saW50JywnXFx1MkExMyc6J3NjcG9saW50JywnXFx1MkExNCc6J25wb2xpbnQnLCdcXHUyQTE1JzoncG9pbnRpbnQnLCdcXHUyQTE2JzoncXVhdGludCcsJ1xcdTJBMTcnOidpbnRsYXJoaycsJ1xcdTJBMjInOidwbHVzY2lyJywnXFx1MkEyMyc6J3BsdXNhY2lyJywnXFx1MkEyNCc6J3NpbXBsdXMnLCdcXHUyQTI1JzoncGx1c2R1JywnXFx1MkEyNic6J3BsdXNzaW0nLCdcXHUyQTI3JzoncGx1c3R3bycsJ1xcdTJBMjknOidtY29tbWEnLCdcXHUyQTJBJzonbWludXNkdScsJ1xcdTJBMkQnOidsb3BsdXMnLCdcXHUyQTJFJzoncm9wbHVzJywnXFx1MkEyRic6J0Nyb3NzJywnXFx1MkEzMCc6J3RpbWVzZCcsJ1xcdTJBMzEnOid0aW1lc2JhcicsJ1xcdTJBMzMnOidzbWFzaHAnLCdcXHUyQTM0JzonbG90aW1lcycsJ1xcdTJBMzUnOidyb3RpbWVzJywnXFx1MkEzNic6J290aW1lc2FzJywnXFx1MkEzNyc6J090aW1lcycsJ1xcdTJBMzgnOidvZGl2JywnXFx1MkEzOSc6J3RyaXBsdXMnLCdcXHUyQTNBJzondHJpbWludXMnLCdcXHUyQTNCJzondHJpdGltZScsJ1xcdTJBM0MnOidpcHJvZCcsJ1xcdTJBM0YnOidhbWFsZycsJ1xcdTJBNDAnOidjYXBkb3QnLCdcXHUyQTQyJzonbmN1cCcsJ1xcdTJBNDMnOiduY2FwJywnXFx1MkE0NCc6J2NhcGFuZCcsJ1xcdTJBNDUnOidjdXBvcicsJ1xcdTJBNDYnOidjdXBjYXAnLCdcXHUyQTQ3JzonY2FwY3VwJywnXFx1MkE0OCc6J2N1cGJyY2FwJywnXFx1MkE0OSc6J2NhcGJyY3VwJywnXFx1MkE0QSc6J2N1cGN1cCcsJ1xcdTJBNEInOidjYXBjYXAnLCdcXHUyQTRDJzonY2N1cHMnLCdcXHUyQTREJzonY2NhcHMnLCdcXHUyQTUwJzonY2N1cHNzbScsJ1xcdTJBNTMnOidBbmQnLCdcXHUyQTU0JzonT3InLCdcXHUyQTU1JzonYW5kYW5kJywnXFx1MkE1Nic6J29yb3InLCdcXHUyQTU3Jzonb3JzbG9wZScsJ1xcdTJBNTgnOidhbmRzbG9wZScsJ1xcdTJBNUEnOidhbmR2JywnXFx1MkE1Qic6J29ydicsJ1xcdTJBNUMnOidhbmRkJywnXFx1MkE1RCc6J29yZCcsJ1xcdTJBNUYnOid3ZWRiYXInLCdcXHUyQTY2Jzonc2RvdGUnLCdcXHUyQTZBJzonc2ltZG90JywnXFx1MkE2RCc6J2Nvbmdkb3QnLCdcXHUyQTZEXFx1MDMzOCc6J25jb25nZG90JywnXFx1MkE2RSc6J2Vhc3RlcicsJ1xcdTJBNkYnOidhcGFjaXInLCdcXHUyQTcwJzonYXBFJywnXFx1MkE3MFxcdTAzMzgnOiduYXBFJywnXFx1MkE3MSc6J2VwbHVzJywnXFx1MkE3Mic6J3BsdXNlJywnXFx1MkE3Myc6J0VzaW0nLCdcXHUyQTc3JzonZUREb3QnLCdcXHUyQTc4JzonZXF1aXZERCcsJ1xcdTJBNzknOidsdGNpcicsJ1xcdTJBN0EnOidndGNpcicsJ1xcdTJBN0InOidsdHF1ZXN0JywnXFx1MkE3Qyc6J2d0cXVlc3QnLCdcXHUyQTdEJzonbGVzJywnXFx1MkE3RFxcdTAzMzgnOidubGVzJywnXFx1MkE3RSc6J2dlcycsJ1xcdTJBN0VcXHUwMzM4JzonbmdlcycsJ1xcdTJBN0YnOidsZXNkb3QnLCdcXHUyQTgwJzonZ2VzZG90JywnXFx1MkE4MSc6J2xlc2RvdG8nLCdcXHUyQTgyJzonZ2VzZG90bycsJ1xcdTJBODMnOidsZXNkb3RvcicsJ1xcdTJBODQnOidnZXNkb3RvbCcsJ1xcdTJBODUnOidsYXAnLCdcXHUyQTg2JzonZ2FwJywnXFx1MkE4Nyc6J2xuZScsJ1xcdTJBODgnOidnbmUnLCdcXHUyQTg5JzonbG5hcCcsJ1xcdTJBOEEnOidnbmFwJywnXFx1MkE4Qic6J2xFZycsJ1xcdTJBOEMnOidnRWwnLCdcXHUyQThEJzonbHNpbWUnLCdcXHUyQThFJzonZ3NpbWUnLCdcXHUyQThGJzonbHNpbWcnLCdcXHUyQTkwJzonZ3NpbWwnLCdcXHUyQTkxJzonbGdFJywnXFx1MkE5Mic6J2dsRScsJ1xcdTJBOTMnOidsZXNnZXMnLCdcXHUyQTk0JzonZ2VzbGVzJywnXFx1MkE5NSc6J2VscycsJ1xcdTJBOTYnOidlZ3MnLCdcXHUyQTk3JzonZWxzZG90JywnXFx1MkE5OCc6J2Vnc2RvdCcsJ1xcdTJBOTknOidlbCcsJ1xcdTJBOUEnOidlZycsJ1xcdTJBOUQnOidzaW1sJywnXFx1MkE5RSc6J3NpbWcnLCdcXHUyQTlGJzonc2ltbEUnLCdcXHUyQUEwJzonc2ltZ0UnLCdcXHUyQUExJzonTGVzc0xlc3MnLCdcXHUyQUExXFx1MDMzOCc6J05vdE5lc3RlZExlc3NMZXNzJywnXFx1MkFBMic6J0dyZWF0ZXJHcmVhdGVyJywnXFx1MkFBMlxcdTAzMzgnOidOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlcicsJ1xcdTJBQTQnOidnbGonLCdcXHUyQUE1JzonZ2xhJywnXFx1MkFBNic6J2x0Y2MnLCdcXHUyQUE3JzonZ3RjYycsJ1xcdTJBQTgnOidsZXNjYycsJ1xcdTJBQTknOidnZXNjYycsJ1xcdTJBQUEnOidzbXQnLCdcXHUyQUFCJzonbGF0JywnXFx1MkFBQyc6J3NtdGUnLCdcXHUyQUFDXFx1RkUwMCc6J3NtdGVzJywnXFx1MkFBRCc6J2xhdGUnLCdcXHUyQUFEXFx1RkUwMCc6J2xhdGVzJywnXFx1MkFBRSc6J2J1bXBFJywnXFx1MkFBRic6J3ByZScsJ1xcdTJBQUZcXHUwMzM4JzonbnByZScsJ1xcdTJBQjAnOidzY2UnLCdcXHUyQUIwXFx1MDMzOCc6J25zY2UnLCdcXHUyQUIzJzoncHJFJywnXFx1MkFCNCc6J3NjRScsJ1xcdTJBQjUnOidwcm5FJywnXFx1MkFCNic6J3NjbkUnLCdcXHUyQUI3JzoncHJhcCcsJ1xcdTJBQjgnOidzY2FwJywnXFx1MkFCOSc6J3BybmFwJywnXFx1MkFCQSc6J3NjbmFwJywnXFx1MkFCQic6J1ByJywnXFx1MkFCQyc6J1NjJywnXFx1MkFCRCc6J3N1YmRvdCcsJ1xcdTJBQkUnOidzdXBkb3QnLCdcXHUyQUJGJzonc3VicGx1cycsJ1xcdTJBQzAnOidzdXBwbHVzJywnXFx1MkFDMSc6J3N1Ym11bHQnLCdcXHUyQUMyJzonc3VwbXVsdCcsJ1xcdTJBQzMnOidzdWJlZG90JywnXFx1MkFDNCc6J3N1cGVkb3QnLCdcXHUyQUM1Jzonc3ViRScsJ1xcdTJBQzVcXHUwMzM4JzonbnN1YkUnLCdcXHUyQUM2Jzonc3VwRScsJ1xcdTJBQzZcXHUwMzM4JzonbnN1cEUnLCdcXHUyQUM3Jzonc3Vic2ltJywnXFx1MkFDOCc6J3N1cHNpbScsJ1xcdTJBQ0JcXHVGRTAwJzondnN1Ym5FJywnXFx1MkFDQic6J3N1Ym5FJywnXFx1MkFDQ1xcdUZFMDAnOid2c3VwbkUnLCdcXHUyQUNDJzonc3VwbkUnLCdcXHUyQUNGJzonY3N1YicsJ1xcdTJBRDAnOidjc3VwJywnXFx1MkFEMSc6J2NzdWJlJywnXFx1MkFEMic6J2NzdXBlJywnXFx1MkFEMyc6J3N1YnN1cCcsJ1xcdTJBRDQnOidzdXBzdWInLCdcXHUyQUQ1Jzonc3Vic3ViJywnXFx1MkFENic6J3N1cHN1cCcsJ1xcdTJBRDcnOidzdXBoc3ViJywnXFx1MkFEOCc6J3N1cGRzdWInLCdcXHUyQUQ5JzonZm9ya3YnLCdcXHUyQURBJzondG9wZm9yaycsJ1xcdTJBREInOidtbGNwJywnXFx1MkFFNCc6J0Rhc2h2JywnXFx1MkFFNic6J1ZkYXNobCcsJ1xcdTJBRTcnOidCYXJ2JywnXFx1MkFFOCc6J3ZCYXInLCdcXHUyQUU5JzondkJhcnYnLCdcXHUyQUVCJzonVmJhcicsJ1xcdTJBRUMnOidOb3QnLCdcXHUyQUVEJzonYk5vdCcsJ1xcdTJBRUUnOidybm1pZCcsJ1xcdTJBRUYnOidjaXJtaWQnLCdcXHUyQUYwJzonbWlkY2lyJywnXFx1MkFGMSc6J3RvcGNpcicsJ1xcdTJBRjInOiduaHBhcicsJ1xcdTJBRjMnOidwYXJzaW0nLCdcXHUyQUZEJzoncGFyc2wnLCdcXHUyQUZEXFx1MjBFNSc6J25wYXJzbCcsJ1xcdTI2NkQnOidmbGF0JywnXFx1MjY2RSc6J25hdHVyJywnXFx1MjY2Ric6J3NoYXJwJywnXFx4QTQnOidjdXJyZW4nLCdcXHhBMic6J2NlbnQnLCckJzonZG9sbGFyJywnXFx4QTMnOidwb3VuZCcsJ1xceEE1JzoneWVuJywnXFx1MjBBQyc6J2V1cm8nLCdcXHhCOSc6J3N1cDEnLCdcXHhCRCc6J2hhbGYnLCdcXHUyMTUzJzonZnJhYzEzJywnXFx4QkMnOidmcmFjMTQnLCdcXHUyMTU1JzonZnJhYzE1JywnXFx1MjE1OSc6J2ZyYWMxNicsJ1xcdTIxNUInOidmcmFjMTgnLCdcXHhCMic6J3N1cDInLCdcXHUyMTU0JzonZnJhYzIzJywnXFx1MjE1Nic6J2ZyYWMyNScsJ1xceEIzJzonc3VwMycsJ1xceEJFJzonZnJhYzM0JywnXFx1MjE1Nyc6J2ZyYWMzNScsJ1xcdTIxNUMnOidmcmFjMzgnLCdcXHUyMTU4JzonZnJhYzQ1JywnXFx1MjE1QSc6J2ZyYWM1NicsJ1xcdTIxNUQnOidmcmFjNTgnLCdcXHUyMTVFJzonZnJhYzc4JywnXFx1RDgzNVxcdURDQjYnOidhc2NyJywnXFx1RDgzNVxcdURENTInOidhb3BmJywnXFx1RDgzNVxcdUREMUUnOidhZnInLCdcXHVEODM1XFx1REQzOCc6J0FvcGYnLCdcXHVEODM1XFx1REQwNCc6J0FmcicsJ1xcdUQ4MzVcXHVEQzlDJzonQXNjcicsJ1xceEFBJzonb3JkZicsJ1xceEUxJzonYWFjdXRlJywnXFx4QzEnOidBYWN1dGUnLCdcXHhFMCc6J2FncmF2ZScsJ1xceEMwJzonQWdyYXZlJywnXFx1MDEwMyc6J2FicmV2ZScsJ1xcdTAxMDInOidBYnJldmUnLCdcXHhFMic6J2FjaXJjJywnXFx4QzInOidBY2lyYycsJ1xceEU1JzonYXJpbmcnLCdcXHhDNSc6J2FuZ3N0JywnXFx4RTQnOidhdW1sJywnXFx4QzQnOidBdW1sJywnXFx4RTMnOidhdGlsZGUnLCdcXHhDMyc6J0F0aWxkZScsJ1xcdTAxMDUnOidhb2dvbicsJ1xcdTAxMDQnOidBb2dvbicsJ1xcdTAxMDEnOidhbWFjcicsJ1xcdTAxMDAnOidBbWFjcicsJ1xceEU2JzonYWVsaWcnLCdcXHhDNic6J0FFbGlnJywnXFx1RDgzNVxcdURDQjcnOidic2NyJywnXFx1RDgzNVxcdURENTMnOidib3BmJywnXFx1RDgzNVxcdUREMUYnOidiZnInLCdcXHVEODM1XFx1REQzOSc6J0JvcGYnLCdcXHUyMTJDJzonQnNjcicsJ1xcdUQ4MzVcXHVERDA1JzonQmZyJywnXFx1RDgzNVxcdUREMjAnOidjZnInLCdcXHVEODM1XFx1RENCOCc6J2NzY3InLCdcXHVEODM1XFx1REQ1NCc6J2NvcGYnLCdcXHUyMTJEJzonQ2ZyJywnXFx1RDgzNVxcdURDOUUnOidDc2NyJywnXFx1MjEwMic6J0NvcGYnLCdcXHUwMTA3JzonY2FjdXRlJywnXFx1MDEwNic6J0NhY3V0ZScsJ1xcdTAxMDknOidjY2lyYycsJ1xcdTAxMDgnOidDY2lyYycsJ1xcdTAxMEQnOidjY2Fyb24nLCdcXHUwMTBDJzonQ2Nhcm9uJywnXFx1MDEwQic6J2Nkb3QnLCdcXHUwMTBBJzonQ2RvdCcsJ1xceEU3JzonY2NlZGlsJywnXFx4QzcnOidDY2VkaWwnLCdcXHUyMTA1JzonaW5jYXJlJywnXFx1RDgzNVxcdUREMjEnOidkZnInLCdcXHUyMTQ2JzonZGQnLCdcXHVEODM1XFx1REQ1NSc6J2RvcGYnLCdcXHVEODM1XFx1RENCOSc6J2RzY3InLCdcXHVEODM1XFx1REM5Ric6J0RzY3InLCdcXHVEODM1XFx1REQwNyc6J0RmcicsJ1xcdTIxNDUnOidERCcsJ1xcdUQ4MzVcXHVERDNCJzonRG9wZicsJ1xcdTAxMEYnOidkY2Fyb24nLCdcXHUwMTBFJzonRGNhcm9uJywnXFx1MDExMSc6J2RzdHJvaycsJ1xcdTAxMTAnOidEc3Ryb2snLCdcXHhGMCc6J2V0aCcsJ1xceEQwJzonRVRIJywnXFx1MjE0Nyc6J2VlJywnXFx1MjEyRic6J2VzY3InLCdcXHVEODM1XFx1REQyMic6J2VmcicsJ1xcdUQ4MzVcXHVERDU2JzonZW9wZicsJ1xcdTIxMzAnOidFc2NyJywnXFx1RDgzNVxcdUREMDgnOidFZnInLCdcXHVEODM1XFx1REQzQyc6J0VvcGYnLCdcXHhFOSc6J2VhY3V0ZScsJ1xceEM5JzonRWFjdXRlJywnXFx4RTgnOidlZ3JhdmUnLCdcXHhDOCc6J0VncmF2ZScsJ1xceEVBJzonZWNpcmMnLCdcXHhDQSc6J0VjaXJjJywnXFx1MDExQic6J2VjYXJvbicsJ1xcdTAxMUEnOidFY2Fyb24nLCdcXHhFQic6J2V1bWwnLCdcXHhDQic6J0V1bWwnLCdcXHUwMTE3JzonZWRvdCcsJ1xcdTAxMTYnOidFZG90JywnXFx1MDExOSc6J2VvZ29uJywnXFx1MDExOCc6J0VvZ29uJywnXFx1MDExMyc6J2VtYWNyJywnXFx1MDExMic6J0VtYWNyJywnXFx1RDgzNVxcdUREMjMnOidmZnInLCdcXHVEODM1XFx1REQ1Nyc6J2ZvcGYnLCdcXHVEODM1XFx1RENCQic6J2ZzY3InLCdcXHVEODM1XFx1REQwOSc6J0ZmcicsJ1xcdUQ4MzVcXHVERDNEJzonRm9wZicsJ1xcdTIxMzEnOidGc2NyJywnXFx1RkIwMCc6J2ZmbGlnJywnXFx1RkIwMyc6J2ZmaWxpZycsJ1xcdUZCMDQnOidmZmxsaWcnLCdcXHVGQjAxJzonZmlsaWcnLCdmaic6J2ZqbGlnJywnXFx1RkIwMic6J2ZsbGlnJywnXFx1MDE5Mic6J2Zub2YnLCdcXHUyMTBBJzonZ3NjcicsJ1xcdUQ4MzVcXHVERDU4JzonZ29wZicsJ1xcdUQ4MzVcXHVERDI0JzonZ2ZyJywnXFx1RDgzNVxcdURDQTInOidHc2NyJywnXFx1RDgzNVxcdUREM0UnOidHb3BmJywnXFx1RDgzNVxcdUREMEEnOidHZnInLCdcXHUwMUY1JzonZ2FjdXRlJywnXFx1MDExRic6J2dicmV2ZScsJ1xcdTAxMUUnOidHYnJldmUnLCdcXHUwMTFEJzonZ2NpcmMnLCdcXHUwMTFDJzonR2NpcmMnLCdcXHUwMTIxJzonZ2RvdCcsJ1xcdTAxMjAnOidHZG90JywnXFx1MDEyMic6J0djZWRpbCcsJ1xcdUQ4MzVcXHVERDI1JzonaGZyJywnXFx1MjEwRSc6J3BsYW5ja2gnLCdcXHVEODM1XFx1RENCRCc6J2hzY3InLCdcXHVEODM1XFx1REQ1OSc6J2hvcGYnLCdcXHUyMTBCJzonSHNjcicsJ1xcdTIxMEMnOidIZnInLCdcXHUyMTBEJzonSG9wZicsJ1xcdTAxMjUnOidoY2lyYycsJ1xcdTAxMjQnOidIY2lyYycsJ1xcdTIxMEYnOidoYmFyJywnXFx1MDEyNyc6J2hzdHJvaycsJ1xcdTAxMjYnOidIc3Ryb2snLCdcXHVEODM1XFx1REQ1QSc6J2lvcGYnLCdcXHVEODM1XFx1REQyNic6J2lmcicsJ1xcdUQ4MzVcXHVEQ0JFJzonaXNjcicsJ1xcdTIxNDgnOidpaScsJ1xcdUQ4MzVcXHVERDQwJzonSW9wZicsJ1xcdTIxMTAnOidJc2NyJywnXFx1MjExMSc6J0ltJywnXFx4RUQnOidpYWN1dGUnLCdcXHhDRCc6J0lhY3V0ZScsJ1xceEVDJzonaWdyYXZlJywnXFx4Q0MnOidJZ3JhdmUnLCdcXHhFRSc6J2ljaXJjJywnXFx4Q0UnOidJY2lyYycsJ1xceEVGJzonaXVtbCcsJ1xceENGJzonSXVtbCcsJ1xcdTAxMjknOidpdGlsZGUnLCdcXHUwMTI4JzonSXRpbGRlJywnXFx1MDEzMCc6J0lkb3QnLCdcXHUwMTJGJzonaW9nb24nLCdcXHUwMTJFJzonSW9nb24nLCdcXHUwMTJCJzonaW1hY3InLCdcXHUwMTJBJzonSW1hY3InLCdcXHUwMTMzJzonaWpsaWcnLCdcXHUwMTMyJzonSUpsaWcnLCdcXHUwMTMxJzonaW1hdGgnLCdcXHVEODM1XFx1RENCRic6J2pzY3InLCdcXHVEODM1XFx1REQ1Qic6J2pvcGYnLCdcXHVEODM1XFx1REQyNyc6J2pmcicsJ1xcdUQ4MzVcXHVEQ0E1JzonSnNjcicsJ1xcdUQ4MzVcXHVERDBEJzonSmZyJywnXFx1RDgzNVxcdURENDEnOidKb3BmJywnXFx1MDEzNSc6J2pjaXJjJywnXFx1MDEzNCc6J0pjaXJjJywnXFx1MDIzNyc6J2ptYXRoJywnXFx1RDgzNVxcdURENUMnOidrb3BmJywnXFx1RDgzNVxcdURDQzAnOidrc2NyJywnXFx1RDgzNVxcdUREMjgnOidrZnInLCdcXHVEODM1XFx1RENBNic6J0tzY3InLCdcXHVEODM1XFx1REQ0Mic6J0tvcGYnLCdcXHVEODM1XFx1REQwRSc6J0tmcicsJ1xcdTAxMzcnOidrY2VkaWwnLCdcXHUwMTM2JzonS2NlZGlsJywnXFx1RDgzNVxcdUREMjknOidsZnInLCdcXHVEODM1XFx1RENDMSc6J2xzY3InLCdcXHUyMTEzJzonZWxsJywnXFx1RDgzNVxcdURENUQnOidsb3BmJywnXFx1MjExMic6J0xzY3InLCdcXHVEODM1XFx1REQwRic6J0xmcicsJ1xcdUQ4MzVcXHVERDQzJzonTG9wZicsJ1xcdTAxM0EnOidsYWN1dGUnLCdcXHUwMTM5JzonTGFjdXRlJywnXFx1MDEzRSc6J2xjYXJvbicsJ1xcdTAxM0QnOidMY2Fyb24nLCdcXHUwMTNDJzonbGNlZGlsJywnXFx1MDEzQic6J0xjZWRpbCcsJ1xcdTAxNDInOidsc3Ryb2snLCdcXHUwMTQxJzonTHN0cm9rJywnXFx1MDE0MCc6J2xtaWRvdCcsJ1xcdTAxM0YnOidMbWlkb3QnLCdcXHVEODM1XFx1REQyQSc6J21mcicsJ1xcdUQ4MzVcXHVERDVFJzonbW9wZicsJ1xcdUQ4MzVcXHVEQ0MyJzonbXNjcicsJ1xcdUQ4MzVcXHVERDEwJzonTWZyJywnXFx1RDgzNVxcdURENDQnOidNb3BmJywnXFx1MjEzMyc6J01zY3InLCdcXHVEODM1XFx1REQyQic6J25mcicsJ1xcdUQ4MzVcXHVERDVGJzonbm9wZicsJ1xcdUQ4MzVcXHVEQ0MzJzonbnNjcicsJ1xcdTIxMTUnOidOb3BmJywnXFx1RDgzNVxcdURDQTknOidOc2NyJywnXFx1RDgzNVxcdUREMTEnOidOZnInLCdcXHUwMTQ0JzonbmFjdXRlJywnXFx1MDE0Myc6J05hY3V0ZScsJ1xcdTAxNDgnOiduY2Fyb24nLCdcXHUwMTQ3JzonTmNhcm9uJywnXFx4RjEnOidudGlsZGUnLCdcXHhEMSc6J050aWxkZScsJ1xcdTAxNDYnOiduY2VkaWwnLCdcXHUwMTQ1JzonTmNlZGlsJywnXFx1MjExNic6J251bWVybycsJ1xcdTAxNEInOidlbmcnLCdcXHUwMTRBJzonRU5HJywnXFx1RDgzNVxcdURENjAnOidvb3BmJywnXFx1RDgzNVxcdUREMkMnOidvZnInLCdcXHUyMTM0Jzonb3NjcicsJ1xcdUQ4MzVcXHVEQ0FBJzonT3NjcicsJ1xcdUQ4MzVcXHVERDEyJzonT2ZyJywnXFx1RDgzNVxcdURENDYnOidPb3BmJywnXFx4QkEnOidvcmRtJywnXFx4RjMnOidvYWN1dGUnLCdcXHhEMyc6J09hY3V0ZScsJ1xceEYyJzonb2dyYXZlJywnXFx4RDInOidPZ3JhdmUnLCdcXHhGNCc6J29jaXJjJywnXFx4RDQnOidPY2lyYycsJ1xceEY2Jzonb3VtbCcsJ1xceEQ2JzonT3VtbCcsJ1xcdTAxNTEnOidvZGJsYWMnLCdcXHUwMTUwJzonT2RibGFjJywnXFx4RjUnOidvdGlsZGUnLCdcXHhENSc6J090aWxkZScsJ1xceEY4Jzonb3NsYXNoJywnXFx4RDgnOidPc2xhc2gnLCdcXHUwMTREJzonb21hY3InLCdcXHUwMTRDJzonT21hY3InLCdcXHUwMTUzJzonb2VsaWcnLCdcXHUwMTUyJzonT0VsaWcnLCdcXHVEODM1XFx1REQyRCc6J3BmcicsJ1xcdUQ4MzVcXHVEQ0M1JzoncHNjcicsJ1xcdUQ4MzVcXHVERDYxJzoncG9wZicsJ1xcdTIxMTknOidQb3BmJywnXFx1RDgzNVxcdUREMTMnOidQZnInLCdcXHVEODM1XFx1RENBQic6J1BzY3InLCdcXHVEODM1XFx1REQ2Mic6J3FvcGYnLCdcXHVEODM1XFx1REQyRSc6J3FmcicsJ1xcdUQ4MzVcXHVEQ0M2JzoncXNjcicsJ1xcdUQ4MzVcXHVEQ0FDJzonUXNjcicsJ1xcdUQ4MzVcXHVERDE0JzonUWZyJywnXFx1MjExQSc6J1FvcGYnLCdcXHUwMTM4Jzona2dyZWVuJywnXFx1RDgzNVxcdUREMkYnOidyZnInLCdcXHVEODM1XFx1REQ2Myc6J3JvcGYnLCdcXHVEODM1XFx1RENDNyc6J3JzY3InLCdcXHUyMTFCJzonUnNjcicsJ1xcdTIxMUMnOidSZScsJ1xcdTIxMUQnOidSb3BmJywnXFx1MDE1NSc6J3JhY3V0ZScsJ1xcdTAxNTQnOidSYWN1dGUnLCdcXHUwMTU5JzoncmNhcm9uJywnXFx1MDE1OCc6J1JjYXJvbicsJ1xcdTAxNTcnOidyY2VkaWwnLCdcXHUwMTU2JzonUmNlZGlsJywnXFx1RDgzNVxcdURENjQnOidzb3BmJywnXFx1RDgzNVxcdURDQzgnOidzc2NyJywnXFx1RDgzNVxcdUREMzAnOidzZnInLCdcXHVEODM1XFx1REQ0QSc6J1NvcGYnLCdcXHVEODM1XFx1REQxNic6J1NmcicsJ1xcdUQ4MzVcXHVEQ0FFJzonU3NjcicsJ1xcdTI0QzgnOidvUycsJ1xcdTAxNUInOidzYWN1dGUnLCdcXHUwMTVBJzonU2FjdXRlJywnXFx1MDE1RCc6J3NjaXJjJywnXFx1MDE1Qyc6J1NjaXJjJywnXFx1MDE2MSc6J3NjYXJvbicsJ1xcdTAxNjAnOidTY2Fyb24nLCdcXHUwMTVGJzonc2NlZGlsJywnXFx1MDE1RSc6J1NjZWRpbCcsJ1xceERGJzonc3psaWcnLCdcXHVEODM1XFx1REQzMSc6J3RmcicsJ1xcdUQ4MzVcXHVEQ0M5JzondHNjcicsJ1xcdUQ4MzVcXHVERDY1JzondG9wZicsJ1xcdUQ4MzVcXHVEQ0FGJzonVHNjcicsJ1xcdUQ4MzVcXHVERDE3JzonVGZyJywnXFx1RDgzNVxcdURENEInOidUb3BmJywnXFx1MDE2NSc6J3RjYXJvbicsJ1xcdTAxNjQnOidUY2Fyb24nLCdcXHUwMTYzJzondGNlZGlsJywnXFx1MDE2Mic6J1RjZWRpbCcsJ1xcdTIxMjInOid0cmFkZScsJ1xcdTAxNjcnOid0c3Ryb2snLCdcXHUwMTY2JzonVHN0cm9rJywnXFx1RDgzNVxcdURDQ0EnOid1c2NyJywnXFx1RDgzNVxcdURENjYnOid1b3BmJywnXFx1RDgzNVxcdUREMzInOid1ZnInLCdcXHVEODM1XFx1REQ0Qyc6J1VvcGYnLCdcXHVEODM1XFx1REQxOCc6J1VmcicsJ1xcdUQ4MzVcXHVEQ0IwJzonVXNjcicsJ1xceEZBJzondWFjdXRlJywnXFx4REEnOidVYWN1dGUnLCdcXHhGOSc6J3VncmF2ZScsJ1xceEQ5JzonVWdyYXZlJywnXFx1MDE2RCc6J3VicmV2ZScsJ1xcdTAxNkMnOidVYnJldmUnLCdcXHhGQic6J3VjaXJjJywnXFx4REInOidVY2lyYycsJ1xcdTAxNkYnOid1cmluZycsJ1xcdTAxNkUnOidVcmluZycsJ1xceEZDJzondXVtbCcsJ1xceERDJzonVXVtbCcsJ1xcdTAxNzEnOid1ZGJsYWMnLCdcXHUwMTcwJzonVWRibGFjJywnXFx1MDE2OSc6J3V0aWxkZScsJ1xcdTAxNjgnOidVdGlsZGUnLCdcXHUwMTczJzondW9nb24nLCdcXHUwMTcyJzonVW9nb24nLCdcXHUwMTZCJzondW1hY3InLCdcXHUwMTZBJzonVW1hY3InLCdcXHVEODM1XFx1REQzMyc6J3ZmcicsJ1xcdUQ4MzVcXHVERDY3Jzondm9wZicsJ1xcdUQ4MzVcXHVEQ0NCJzondnNjcicsJ1xcdUQ4MzVcXHVERDE5JzonVmZyJywnXFx1RDgzNVxcdURENEQnOidWb3BmJywnXFx1RDgzNVxcdURDQjEnOidWc2NyJywnXFx1RDgzNVxcdURENjgnOid3b3BmJywnXFx1RDgzNVxcdURDQ0MnOid3c2NyJywnXFx1RDgzNVxcdUREMzQnOid3ZnInLCdcXHVEODM1XFx1RENCMic6J1dzY3InLCdcXHVEODM1XFx1REQ0RSc6J1dvcGYnLCdcXHVEODM1XFx1REQxQSc6J1dmcicsJ1xcdTAxNzUnOid3Y2lyYycsJ1xcdTAxNzQnOidXY2lyYycsJ1xcdUQ4MzVcXHVERDM1JzoneGZyJywnXFx1RDgzNVxcdURDQ0QnOid4c2NyJywnXFx1RDgzNVxcdURENjknOid4b3BmJywnXFx1RDgzNVxcdURENEYnOidYb3BmJywnXFx1RDgzNVxcdUREMUInOidYZnInLCdcXHVEODM1XFx1RENCMyc6J1hzY3InLCdcXHVEODM1XFx1REQzNic6J3lmcicsJ1xcdUQ4MzVcXHVEQ0NFJzoneXNjcicsJ1xcdUQ4MzVcXHVERDZBJzoneW9wZicsJ1xcdUQ4MzVcXHVEQ0I0JzonWXNjcicsJ1xcdUQ4MzVcXHVERDFDJzonWWZyJywnXFx1RDgzNVxcdURENTAnOidZb3BmJywnXFx4RkQnOid5YWN1dGUnLCdcXHhERCc6J1lhY3V0ZScsJ1xcdTAxNzcnOid5Y2lyYycsJ1xcdTAxNzYnOidZY2lyYycsJ1xceEZGJzoneXVtbCcsJ1xcdTAxNzgnOidZdW1sJywnXFx1RDgzNVxcdURDQ0YnOid6c2NyJywnXFx1RDgzNVxcdUREMzcnOid6ZnInLCdcXHVEODM1XFx1REQ2Qic6J3pvcGYnLCdcXHUyMTI4JzonWmZyJywnXFx1MjEyNCc6J1pvcGYnLCdcXHVEODM1XFx1RENCNSc6J1pzY3InLCdcXHUwMTdBJzonemFjdXRlJywnXFx1MDE3OSc6J1phY3V0ZScsJ1xcdTAxN0UnOid6Y2Fyb24nLCdcXHUwMTdEJzonWmNhcm9uJywnXFx1MDE3Qyc6J3pkb3QnLCdcXHUwMTdCJzonWmRvdCcsJ1xcdTAxQjUnOidpbXBlZCcsJ1xceEZFJzondGhvcm4nLCdcXHhERSc6J1RIT1JOJywnXFx1MDE0OSc6J25hcG9zJywnXFx1MDNCMSc6J2FscGhhJywnXFx1MDM5MSc6J0FscGhhJywnXFx1MDNCMic6J2JldGEnLCdcXHUwMzkyJzonQmV0YScsJ1xcdTAzQjMnOidnYW1tYScsJ1xcdTAzOTMnOidHYW1tYScsJ1xcdTAzQjQnOidkZWx0YScsJ1xcdTAzOTQnOidEZWx0YScsJ1xcdTAzQjUnOidlcHNpJywnXFx1MDNGNSc6J2Vwc2l2JywnXFx1MDM5NSc6J0Vwc2lsb24nLCdcXHUwM0REJzonZ2FtbWFkJywnXFx1MDNEQyc6J0dhbW1hZCcsJ1xcdTAzQjYnOid6ZXRhJywnXFx1MDM5Nic6J1pldGEnLCdcXHUwM0I3JzonZXRhJywnXFx1MDM5Nyc6J0V0YScsJ1xcdTAzQjgnOid0aGV0YScsJ1xcdTAzRDEnOid0aGV0YXYnLCdcXHUwMzk4JzonVGhldGEnLCdcXHUwM0I5JzonaW90YScsJ1xcdTAzOTknOidJb3RhJywnXFx1MDNCQSc6J2thcHBhJywnXFx1MDNGMCc6J2thcHBhdicsJ1xcdTAzOUEnOidLYXBwYScsJ1xcdTAzQkInOidsYW1iZGEnLCdcXHUwMzlCJzonTGFtYmRhJywnXFx1MDNCQyc6J211JywnXFx4QjUnOidtaWNybycsJ1xcdTAzOUMnOidNdScsJ1xcdTAzQkQnOidudScsJ1xcdTAzOUQnOidOdScsJ1xcdTAzQkUnOid4aScsJ1xcdTAzOUUnOidYaScsJ1xcdTAzQkYnOidvbWljcm9uJywnXFx1MDM5Ric6J09taWNyb24nLCdcXHUwM0MwJzoncGknLCdcXHUwM0Q2JzoncGl2JywnXFx1MDNBMCc6J1BpJywnXFx1MDNDMSc6J3JobycsJ1xcdTAzRjEnOidyaG92JywnXFx1MDNBMSc6J1JobycsJ1xcdTAzQzMnOidzaWdtYScsJ1xcdTAzQTMnOidTaWdtYScsJ1xcdTAzQzInOidzaWdtYWYnLCdcXHUwM0M0JzondGF1JywnXFx1MDNBNCc6J1RhdScsJ1xcdTAzQzUnOid1cHNpJywnXFx1MDNBNSc6J1Vwc2lsb24nLCdcXHUwM0QyJzonVXBzaScsJ1xcdTAzQzYnOidwaGknLCdcXHUwM0Q1JzoncGhpdicsJ1xcdTAzQTYnOidQaGknLCdcXHUwM0M3JzonY2hpJywnXFx1MDNBNyc6J0NoaScsJ1xcdTAzQzgnOidwc2knLCdcXHUwM0E4JzonUHNpJywnXFx1MDNDOSc6J29tZWdhJywnXFx1MDNBOSc6J29obScsJ1xcdTA0MzAnOidhY3knLCdcXHUwNDEwJzonQWN5JywnXFx1MDQzMSc6J2JjeScsJ1xcdTA0MTEnOidCY3knLCdcXHUwNDMyJzondmN5JywnXFx1MDQxMic6J1ZjeScsJ1xcdTA0MzMnOidnY3knLCdcXHUwNDEzJzonR2N5JywnXFx1MDQ1Myc6J2dqY3knLCdcXHUwNDAzJzonR0pjeScsJ1xcdTA0MzQnOidkY3knLCdcXHUwNDE0JzonRGN5JywnXFx1MDQ1Mic6J2RqY3knLCdcXHUwNDAyJzonREpjeScsJ1xcdTA0MzUnOidpZWN5JywnXFx1MDQxNSc6J0lFY3knLCdcXHUwNDUxJzonaW9jeScsJ1xcdTA0MDEnOidJT2N5JywnXFx1MDQ1NCc6J2p1a2N5JywnXFx1MDQwNCc6J0p1a2N5JywnXFx1MDQzNic6J3poY3knLCdcXHUwNDE2JzonWkhjeScsJ1xcdTA0MzcnOid6Y3knLCdcXHUwNDE3JzonWmN5JywnXFx1MDQ1NSc6J2RzY3knLCdcXHUwNDA1JzonRFNjeScsJ1xcdTA0MzgnOidpY3knLCdcXHUwNDE4JzonSWN5JywnXFx1MDQ1Nic6J2l1a2N5JywnXFx1MDQwNic6J0l1a2N5JywnXFx1MDQ1Nyc6J3lpY3knLCdcXHUwNDA3JzonWUljeScsJ1xcdTA0MzknOidqY3knLCdcXHUwNDE5JzonSmN5JywnXFx1MDQ1OCc6J2pzZXJjeScsJ1xcdTA0MDgnOidKc2VyY3knLCdcXHUwNDNBJzona2N5JywnXFx1MDQxQSc6J0tjeScsJ1xcdTA0NUMnOidramN5JywnXFx1MDQwQyc6J0tKY3knLCdcXHUwNDNCJzonbGN5JywnXFx1MDQxQic6J0xjeScsJ1xcdTA0NTknOidsamN5JywnXFx1MDQwOSc6J0xKY3knLCdcXHUwNDNDJzonbWN5JywnXFx1MDQxQyc6J01jeScsJ1xcdTA0M0QnOiduY3knLCdcXHUwNDFEJzonTmN5JywnXFx1MDQ1QSc6J25qY3knLCdcXHUwNDBBJzonTkpjeScsJ1xcdTA0M0UnOidvY3knLCdcXHUwNDFFJzonT2N5JywnXFx1MDQzRic6J3BjeScsJ1xcdTA0MUYnOidQY3knLCdcXHUwNDQwJzoncmN5JywnXFx1MDQyMCc6J1JjeScsJ1xcdTA0NDEnOidzY3knLCdcXHUwNDIxJzonU2N5JywnXFx1MDQ0Mic6J3RjeScsJ1xcdTA0MjInOidUY3knLCdcXHUwNDVCJzondHNoY3knLCdcXHUwNDBCJzonVFNIY3knLCdcXHUwNDQzJzondWN5JywnXFx1MDQyMyc6J1VjeScsJ1xcdTA0NUUnOid1YnJjeScsJ1xcdTA0MEUnOidVYnJjeScsJ1xcdTA0NDQnOidmY3knLCdcXHUwNDI0JzonRmN5JywnXFx1MDQ0NSc6J2toY3knLCdcXHUwNDI1JzonS0hjeScsJ1xcdTA0NDYnOid0c2N5JywnXFx1MDQyNic6J1RTY3knLCdcXHUwNDQ3JzonY2hjeScsJ1xcdTA0MjcnOidDSGN5JywnXFx1MDQ1Ric6J2R6Y3knLCdcXHUwNDBGJzonRFpjeScsJ1xcdTA0NDgnOidzaGN5JywnXFx1MDQyOCc6J1NIY3knLCdcXHUwNDQ5Jzonc2hjaGN5JywnXFx1MDQyOSc6J1NIQ0hjeScsJ1xcdTA0NEEnOidoYXJkY3knLCdcXHUwNDJBJzonSEFSRGN5JywnXFx1MDQ0Qic6J3ljeScsJ1xcdTA0MkInOidZY3knLCdcXHUwNDRDJzonc29mdGN5JywnXFx1MDQyQyc6J1NPRlRjeScsJ1xcdTA0NEQnOidlY3knLCdcXHUwNDJEJzonRWN5JywnXFx1MDQ0RSc6J3l1Y3knLCdcXHUwNDJFJzonWVVjeScsJ1xcdTA0NEYnOid5YWN5JywnXFx1MDQyRic6J1lBY3knLCdcXHUyMTM1JzonYWxlcGgnLCdcXHUyMTM2JzonYmV0aCcsJ1xcdTIxMzcnOidnaW1lbCcsJ1xcdTIxMzgnOidkYWxldGgnfTtcblxuXHR2YXIgcmVnZXhFc2NhcGUgPSAvW1wiJic8PmBdL2c7XG5cdHZhciBlc2NhcGVNYXAgPSB7XG5cdFx0J1wiJzogJyZxdW90OycsXG5cdFx0JyYnOiAnJmFtcDsnLFxuXHRcdCdcXCcnOiAnJiN4Mjc7Jyxcblx0XHQnPCc6ICcmbHQ7Jyxcblx0XHQvLyBTZWUgaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzOiBpbiBIVE1MLCB0aGVcblx0XHQvLyBmb2xsb3dpbmcgaXMgbm90IHN0cmljdGx5IG5lY2Vzc2FyeSB1bmxlc3MgaXTigJlzIHBhcnQgb2YgYSB0YWcgb3IgYW5cblx0XHQvLyB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFdl4oCZcmUgb25seSBlc2NhcGluZyBpdCB0byBzdXBwb3J0IHRob3NlXG5cdFx0Ly8gc2l0dWF0aW9ucywgYW5kIGZvciBYTUwgc3VwcG9ydC5cblx0XHQnPic6ICcmZ3Q7Jyxcblx0XHQvLyBJbiBJbnRlcm5ldCBFeHBsb3JlciDiiaQgOCwgdGhlIGJhY2t0aWNrIGNoYXJhY3RlciBjYW4gYmUgdXNlZFxuXHRcdC8vIHRvIGJyZWFrIG91dCBvZiAodW4pcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZXMgb3IgSFRNTCBjb21tZW50cy5cblx0XHQvLyBTZWUgaHR0cDovL2h0bWw1c2VjLm9yZy8jMTAyLCBodHRwOi8vaHRtbDVzZWMub3JnLyMxMDgsIGFuZFxuXHRcdC8vIGh0dHA6Ly9odG1sNXNlYy5vcmcvIzEzMy5cblx0XHQnYCc6ICcmI3g2MDsnXG5cdH07XG5cblx0dmFyIHJlZ2V4SW52YWxpZEVudGl0eSA9IC8mIyg/Olt4WF1bXmEtZkEtRjAtOV18W14wLTl4WF0pLztcblx0dmFyIHJlZ2V4SW52YWxpZFJhd0NvZGVQb2ludCA9IC9bXFwwLVxceDA4XFx4MEJcXHgwRS1cXHgxRlxceDdGLVxceDlGXFx1RkREMC1cXHVGREVGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODNGXFx1RDg3RlxcdUQ4QkZcXHVEOEZGXFx1RDkzRlxcdUQ5N0ZcXHVEOUJGXFx1RDlGRlxcdURBM0ZcXHVEQTdGXFx1REFCRlxcdURBRkZcXHVEQjNGXFx1REI3RlxcdURCQkZcXHVEQkZGXVtcXHVERkZFXFx1REZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vO1xuXHR2YXIgcmVnZXhEZWNvZGUgPSAvJihDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsfERvdWJsZUxvbmdMZWZ0UmlnaHRBcnJvd3xDbG9ja3dpc2VDb250b3VySW50ZWdyYWx8Tm90TmVzdGVkR3JlYXRlckdyZWF0ZXJ8Tm90U3F1YXJlU3VwZXJzZXRFcXVhbHxEaWFjcml0aWNhbERvdWJsZUFjdXRlfE5vdFJpZ2h0VHJpYW5nbGVFcXVhbHxOb3RTdWNjZWVkc1NsYW50RXF1YWx8Tm90UHJlY2VkZXNTbGFudEVxdWFsfENsb3NlQ3VybHlEb3VibGVRdW90ZXxOZWdhdGl2ZVZlcnlUaGluU3BhY2V8RG91YmxlQ29udG91ckludGVncmFsfEZpbGxlZFZlcnlTbWFsbFNxdWFyZXxDYXBpdGFsRGlmZmVyZW50aWFsRHxPcGVuQ3VybHlEb3VibGVRdW90ZXxFbXB0eVZlcnlTbWFsbFNxdWFyZXxOZXN0ZWRHcmVhdGVyR3JlYXRlcnxEb3VibGVMb25nUmlnaHRBcnJvd3xOb3RMZWZ0VHJpYW5nbGVFcXVhbHxOb3RHcmVhdGVyU2xhbnRFcXVhbHxSZXZlcnNlVXBFcXVpbGlicml1bXxEb3VibGVMZWZ0UmlnaHRBcnJvd3xOb3RTcXVhcmVTdWJzZXRFcXVhbHxOb3REb3VibGVWZXJ0aWNhbEJhcnxSaWdodEFycm93TGVmdEFycm93fE5vdEdyZWF0ZXJGdWxsRXF1YWx8Tm90UmlnaHRUcmlhbmdsZUJhcnxTcXVhcmVTdXBlcnNldEVxdWFsfERvd25MZWZ0UmlnaHRWZWN0b3J8RG91YmxlTG9uZ0xlZnRBcnJvd3xsZWZ0cmlnaHRzcXVpZ2Fycm93fExlZnRBcnJvd1JpZ2h0QXJyb3d8TmVnYXRpdmVNZWRpdW1TcGFjZXxibGFja3RyaWFuZ2xlcmlnaHR8UmlnaHREb3duVmVjdG9yQmFyfFByZWNlZGVzU2xhbnRFcXVhbHxSaWdodERvdWJsZUJyYWNrZXR8U3VjY2VlZHNTbGFudEVxdWFsfE5vdExlZnRUcmlhbmdsZUJhcnxSaWdodFRyaWFuZ2xlRXF1YWx8U3F1YXJlSW50ZXJzZWN0aW9ufFJpZ2h0RG93blRlZVZlY3RvcnxSZXZlcnNlRXF1aWxpYnJpdW18TmVnYXRpdmVUaGlja1NwYWNlfGxvbmdsZWZ0cmlnaHRhcnJvd3xMb25nbGVmdHJpZ2h0YXJyb3d8TG9uZ0xlZnRSaWdodEFycm93fERvd25SaWdodFRlZVZlY3RvcnxEb3duUmlnaHRWZWN0b3JCYXJ8R3JlYXRlclNsYW50RXF1YWx8U3F1YXJlU3Vic2V0RXF1YWx8TGVmdERvd25WZWN0b3JCYXJ8TGVmdERvdWJsZUJyYWNrZXR8VmVydGljYWxTZXBhcmF0b3J8cmlnaHRsZWZ0aGFycG9vbnN8Tm90R3JlYXRlckdyZWF0ZXJ8Tm90U3F1YXJlU3VwZXJzZXR8YmxhY2t0cmlhbmdsZWxlZnR8YmxhY2t0cmlhbmdsZWRvd258TmVnYXRpdmVUaGluU3BhY2V8TGVmdERvd25UZWVWZWN0b3J8Tm90TGVzc1NsYW50RXF1YWx8bGVmdHJpZ2h0aGFycG9vbnN8RG91YmxlVXBEb3duQXJyb3d8RG91YmxlVmVydGljYWxCYXJ8TGVmdFRyaWFuZ2xlRXF1YWx8RmlsbGVkU21hbGxTcXVhcmV8dHdvaGVhZHJpZ2h0YXJyb3d8Tm90TmVzdGVkTGVzc0xlc3N8RG93bkxlZnRUZWVWZWN0b3J8RG93bkxlZnRWZWN0b3JCYXJ8UmlnaHRBbmdsZUJyYWNrZXR8Tm90VGlsZGVGdWxsRXF1YWx8Tm90UmV2ZXJzZUVsZW1lbnR8UmlnaHRVcERvd25WZWN0b3J8RGlhY3JpdGljYWxUaWxkZXxOb3RTdWNjZWVkc1RpbGRlfGNpcmNsZWFycm93cmlnaHR8Tm90UHJlY2VkZXNFcXVhbHxyaWdodGhhcnBvb25kb3dufERvdWJsZVJpZ2h0QXJyb3d8Tm90U3VjY2VlZHNFcXVhbHxOb25CcmVha2luZ1NwYWNlfE5vdFJpZ2h0VHJpYW5nbGV8TGVzc0VxdWFsR3JlYXRlcnxSaWdodFVwVGVlVmVjdG9yfExlZnRBbmdsZUJyYWNrZXR8R3JlYXRlckZ1bGxFcXVhbHxEb3duQXJyb3dVcEFycm93fFJpZ2h0VXBWZWN0b3JCYXJ8dHdvaGVhZGxlZnRhcnJvd3xHcmVhdGVyRXF1YWxMZXNzfGRvd25oYXJwb29ucmlnaHR8UmlnaHRUcmlhbmdsZUJhcnxudHJpYW5nbGVyaWdodGVxfE5vdFN1cGVyc2V0RXF1YWx8TGVmdFVwRG93blZlY3RvcnxEaWFjcml0aWNhbEFjdXRlfHJpZ2h0cmlnaHRhcnJvd3N8dmFydHJpYW5nbGVyaWdodHxVcEFycm93RG93bkFycm93fERpYWNyaXRpY2FsR3JhdmV8VW5kZXJQYXJlbnRoZXNpc3xFbXB0eVNtYWxsU3F1YXJlfExlZnRVcFZlY3RvckJhcnxsZWZ0cmlnaHRhcnJvd3N8RG93blJpZ2h0VmVjdG9yfGRvd25oYXJwb29ubGVmdHx0cmlhbmdsZXJpZ2h0ZXF8U2hvcnRSaWdodEFycm93fE92ZXJQYXJlbnRoZXNpc3xEb3VibGVMZWZ0QXJyb3d8RG91YmxlRG93bkFycm93fE5vdFNxdWFyZVN1YnNldHxiaWd0cmlhbmdsZWRvd258bnRyaWFuZ2xlbGVmdGVxfFVwcGVyUmlnaHRBcnJvd3xjdXJ2ZWFycm93cmlnaHR8dmFydHJpYW5nbGVsZWZ0fE5vdExlZnRUcmlhbmdsZXxubGVmdHJpZ2h0YXJyb3d8TG93ZXJSaWdodEFycm93fE5vdEh1bXBEb3duSHVtcHxOb3RHcmVhdGVyVGlsZGV8cmlnaHR0aHJlZXRpbWVzfExlZnRVcFRlZVZlY3RvcnxOb3RHcmVhdGVyRXF1YWx8c3RyYWlnaHRlcHNpbG9ufExlZnRUcmlhbmdsZUJhcnxyaWdodHNxdWlnYXJyb3d8Q29udG91ckludGVncmFsfHJpZ2h0bGVmdGFycm93c3xDbG9zZUN1cmx5UXVvdGV8UmlnaHREb3duVmVjdG9yfExlZnRSaWdodFZlY3RvcnxuTGVmdHJpZ2h0YXJyb3d8bGVmdGhhcnBvb25kb3dufGNpcmNsZWFycm93bGVmdHxTcXVhcmVTdXBlcnNldHxPcGVuQ3VybHlRdW90ZXxob29rcmlnaHRhcnJvd3xIb3Jpem9udGFsTGluZXxEaWFjcml0aWNhbERvdHxOb3RMZXNzR3JlYXRlcnxudHJpYW5nbGVyaWdodHxEb3VibGVSaWdodFRlZXxJbnZpc2libGVDb21tYXxJbnZpc2libGVUaW1lc3xMb3dlckxlZnRBcnJvd3xEb3duTGVmdFZlY3RvcnxOb3RTdWJzZXRFcXVhbHxjdXJ2ZWFycm93bGVmdHx0cmlhbmdsZWxlZnRlcXxOb3RWZXJ0aWNhbEJhcnxUaWxkZUZ1bGxFcXVhbHxkb3duZG93bmFycm93c3xOb3RHcmVhdGVyTGVzc3xSaWdodFRlZVZlY3RvcnxaZXJvV2lkdGhTcGFjZXxsb29wYXJyb3dyaWdodHxMb25nUmlnaHRBcnJvd3xkb3VibGViYXJ3ZWRnZXxTaG9ydExlZnRBcnJvd3xTaG9ydERvd25BcnJvd3xSaWdodFZlY3RvckJhcnxHcmVhdGVyR3JlYXRlcnxSZXZlcnNlRWxlbWVudHxyaWdodGhhcnBvb251cHxMZXNzU2xhbnRFcXVhbHxsZWZ0dGhyZWV0aW1lc3x1cGhhcnBvb25yaWdodHxyaWdodGFycm93dGFpbHxMZWZ0RG93blZlY3RvcnxMb25ncmlnaHRhcnJvd3xOZXN0ZWRMZXNzTGVzc3xVcHBlckxlZnRBcnJvd3xuc2hvcnRwYXJhbGxlbHxsZWZ0bGVmdGFycm93c3xsZWZ0cmlnaHRhcnJvd3xMZWZ0cmlnaHRhcnJvd3xMZWZ0UmlnaHRBcnJvd3xsb25ncmlnaHRhcnJvd3x1cGhhcnBvb25sZWZ0fFJpZ2h0QXJyb3dCYXJ8QXBwbHlGdW5jdGlvbnxMZWZ0VGVlVmVjdG9yfGxlZnRhcnJvd3RhaWx8Tm90RXF1YWxUaWxkZXx2YXJzdWJzZXRuZXFxfHZhcnN1cHNldG5lcXF8UmlnaHRUZWVBcnJvd3xTdWNjZWVkc0VxdWFsfFN1Y2NlZWRzVGlsZGV8TGVmdFZlY3RvckJhcnxTdXBlcnNldEVxdWFsfGhvb2tsZWZ0YXJyb3d8RGlmZmVyZW50aWFsRHxWZXJ0aWNhbFRpbGRlfFZlcnlUaGluU3BhY2V8YmxhY2t0cmlhbmdsZXxiaWd0cmlhbmdsZXVwfExlc3NGdWxsRXF1YWx8ZGl2aWRlb250aW1lc3xsZWZ0aGFycG9vbnVwfFVwRXF1aWxpYnJpdW18bnRyaWFuZ2xlbGVmdHxSaWdodFRyaWFuZ2xlfG1lYXN1cmVkYW5nbGV8c2hvcnRwYXJhbGxlbHxsb25nbGVmdGFycm93fExvbmdsZWZ0YXJyb3d8TG9uZ0xlZnRBcnJvd3xEb3VibGVMZWZ0VGVlfFBvaW5jYXJlcGxhbmV8UHJlY2VkZXNFcXVhbHx0cmlhbmdsZXJpZ2h0fERvdWJsZVVwQXJyb3d8UmlnaHRVcFZlY3RvcnxmYWxsaW5nZG90c2VxfGxvb3BhcnJvd2xlZnR8UHJlY2VkZXNUaWxkZXxOb3RUaWxkZUVxdWFsfE5vdFRpbGRlVGlsZGV8c21hbGxzZXRtaW51c3xQcm9wb3J0aW9uYWx8dHJpYW5nbGVsZWZ0fHRyaWFuZ2xlZG93bnxVbmRlckJyYWNrZXR8Tm90SHVtcEVxdWFsfGV4cG9uZW50aWFsZXxFeHBvbmVudGlhbEV8Tm90TGVzc1RpbGRlfEhpbGJlcnRTcGFjZXxSaWdodENlaWxpbmd8YmxhY2tsb3plbmdlfHZhcnN1cHNldG5lcXxIdW1wRG93bkh1bXB8R3JlYXRlckVxdWFsfFZlcnRpY2FsTGluZXxMZWZ0VGVlQXJyb3d8Tm90TGVzc0VxdWFsfERvd25UZWVBcnJvd3xMZWZ0VHJpYW5nbGV8dmFyc3Vic2V0bmVxfEludGVyc2VjdGlvbnxOb3RDb25ncnVlbnR8RG93bkFycm93QmFyfExlZnRVcFZlY3RvcnxMZWZ0QXJyb3dCYXJ8cmlzaW5nZG90c2VxfEdyZWF0ZXJUaWxkZXxSb3VuZEltcGxpZXN8U3F1YXJlU3Vic2V0fFNob3J0VXBBcnJvd3xOb3RTdXBlcnNldHxxdWF0ZXJuaW9uc3xwcmVjbmFwcHJveHxiYWNrZXBzaWxvbnxwcmVjY3VybHllcXxPdmVyQnJhY2tldHxibGFja3NxdWFyZXxNZWRpdW1TcGFjZXxWZXJ0aWNhbEJhcnxjaXJjbGVkY2lyY3xjaXJjbGVkZGFzaHxDaXJjbGVNaW51c3xDaXJjbGVUaW1lc3xMZXNzR3JlYXRlcnxjdXJseWVxcHJlY3xjdXJseWVxc3VjY3xkaWFtb25kc3VpdHxVcERvd25BcnJvd3xVcGRvd25hcnJvd3xSdWxlRGVsYXllZHxScmlnaHRhcnJvd3x1cGRvd25hcnJvd3xSaWdodFZlY3RvcnxuUmlnaHRhcnJvd3xucmlnaHRhcnJvd3xlcXNsYW50bGVzc3xMZWZ0Q2VpbGluZ3xFcXVpbGlicml1bXxTbWFsbENpcmNsZXxleHBlY3RhdGlvbnxOb3RTdWNjZWVkc3x0aGlja2FwcHJveHxHcmVhdGVyTGVzc3xTcXVhcmVVbmlvbnxOb3RQcmVjZWRlc3xOb3RMZXNzTGVzc3xzdHJhaWdodHBoaXxzdWNjbmFwcHJveHxzdWNjY3VybHllcXxTdWJzZXRFcXVhbHxzcXN1cHNldGVxfFByb3BvcnRpb258TGFwbGFjZXRyZnxJbWFnaW5hcnlJfHN1cHNldG5lcXF8Tm90R3JlYXRlcnxndHJlcXFsZXNzfE5vdEVsZW1lbnR8VGhpY2tTcGFjZXxUaWxkZUVxdWFsfFRpbGRlVGlsZGV8Rm91cmllcnRyZnxybW91c3RhY2hlfEVxdWFsVGlsZGV8ZXFzbGFudGd0cnxVbmRlckJyYWNlfExlZnRWZWN0b3J8VXBBcnJvd0JhcnxuTGVmdGFycm93fG5zdWJzZXRlcXF8c3Vic2V0bmVxcXxuc3Vwc2V0ZXFxfG5sZWZ0YXJyb3d8c3VjY2FwcHJveHxsZXNzYXBwcm94fFVwVGVlQXJyb3d8dXB1cGFycm93c3xjdXJseXdlZGdlfGxlc3NlcXFndHJ8dmFyZXBzaWxvbnx2YXJub3RoaW5nfFJpZ2h0Rmxvb3J8Y29tcGxlbWVudHxDaXJjbGVQbHVzfHNxc3Vic2V0ZXF8TGxlZnRhcnJvd3xjaXJjbGVkYXN0fFJpZ2h0QXJyb3d8UmlnaHRhcnJvd3xyaWdodGFycm93fGxtb3VzdGFjaGV8QmVybm91bGxpc3xwcmVjYXBwcm94fG1hcHN0b2xlZnR8bWFwc3RvZG93bnxsb25nbWFwc3RvfGRvdHNxdWFyZXxkb3duYXJyb3d8RG91YmxlRG90fG5zdWJzZXRlcXxzdXBzZXRuZXF8bGVmdGFycm93fG5zdXBzZXRlcXxzdWJzZXRuZXF8VGhpblNwYWNlfG5nZXFzbGFudHxzdWJzZXRlcXF8SHVtcEVxdWFsfE5vdFN1YnNldHx0cmlhbmdsZXF8Tm90Q3VwQ2FwfGxlc3NlcWd0cnxoZWFydHN1aXR8VHJpcGxlRG90fExlZnRhcnJvd3xDb3Byb2R1Y3R8Q29uZ3J1ZW50fHZhcnByb3B0b3xjb21wbGV4ZXN8Z3ZlcnRuZXFxfExlZnRBcnJvd3xMZXNzVGlsZGV8c3Vwc2V0ZXFxfE1pbnVzUGx1c3xDaXJjbGVEb3R8bmxlcXNsYW50fE5vdEV4aXN0c3xndHJlcWxlc3N8bnBhcmFsbGVsfFVuaW9uUGx1c3xMZWZ0Rmxvb3J8Y2hlY2ttYXJrfENlbnRlckRvdHxjZW50ZXJkb3R8TWVsbGludHJmfGd0cmFwcHJveHxiaWdvdGltZXN8T3ZlckJyYWNlfHNwYWRlc3VpdHx0aGVyZWZvcmV8cGl0Y2hmb3JrfHJhdGlvbmFsc3xQbHVzTWludXN8QmFja3NsYXNofFRoZXJlZm9yZXxEb3duQnJldmV8YmFja3NpbWVxfGJhY2twcmltZXxEb3duQXJyb3d8bnNob3J0bWlkfERvd25hcnJvd3xsdmVydG5lcXF8ZXF2cGFyc2x8aW1hZ2xpbmV8aW1hZ3BhcnR8aW5maW50aWV8aW50ZWdlcnN8SW50ZWdyYWx8aW50ZXJjYWx8TGVzc0xlc3N8VWFycm9jaXJ8aW50bGFyaGt8c3FzdXBzZXR8YW5nbXNkYWZ8c3FzdWJzZXR8bGxjb3JuZXJ8dmFydGhldGF8Y3VwYnJjYXB8bG5hcHByb3h8U3VwZXJzZXR8U3VjaFRoYXR8c3VjY25zaW18c3VjY25lcXF8YW5nbXNkYWd8YmlndXBsdXN8Y3VybHl2ZWV8dHJwZXppdW18U3VjY2VlZHN8Tm90VGlsZGV8Ymlnd2VkZ2V8YW5nbXNkYWh8YW5ncnR2YmR8dHJpbWludXN8Y3djb25pbnR8ZnBhcnRpbnR8bHJjb3JuZXJ8c21lcGFyc2x8c3Vic2V0ZXF8dXJjb3JuZXJ8bHVyZHNoYXJ8bGFlbXB0eXZ8RERvdHJhaGR8YXBwcm94ZXF8bGRydXNoYXJ8YXdjb25pbnR8bWFwc3RvdXB8YmFja2Nvbmd8c2hvcnRtaWR8dHJpYW5nbGV8Z2Vxc2xhbnR8Z2VzZG90b2x8dGltZXNiYXJ8Y2lyY2xlZFJ8Y2lyY2xlZFN8c2V0bWludXN8bXVsdGltYXB8bmF0dXJhbHN8c2Nwb2xpbnR8bmNvbmdkb3R8UmlnaHRUZWV8Ym94bWludXN8Z25hcHByb3h8Ym94dGltZXN8YW5kc2xvcGV8dGhpY2tzaW18YW5nbXNkYWF8dmFyc2lnbWF8Y2lyZm5pbnR8cnRyaWx0cml8YW5nbXNkYWJ8cnBwb2xpbnR8YW5nbXNkYWN8YmFyd2VkZ2V8ZHJia2Fyb3d8Y2x1YnN1aXR8dGhldGFzeW18YnNvbGhzdWJ8Y2FwYnJjdXB8ZHppZ3JhcnJ8ZG90ZXFkb3R8RG90RXF1YWx8ZG90bWludXN8VW5kZXJCYXJ8Tm90RXF1YWx8cmVhbHBhcnR8b3RpbWVzYXN8dWxjb3JuZXJ8aGtzZWFyb3d8aGtzd2Fyb3d8cGFyYWxsZWx8UGFydGlhbER8ZWxpbnRlcnN8ZW1wdHlzZXR8cGx1c2FjaXJ8YmJya3Ricmt8YW5nbXNkYWR8cG9pbnRpbnR8Ymlnb3BsdXN8YW5nbXNkYWV8UHJlY2VkZXN8Ymlnc3FjdXB8dmFya2FwcGF8bm90aW5kb3R8c3Vwc2V0ZXF8cHJlY25lcXF8cHJlY25zaW18cHJvZmFsYXJ8cHJvZmxpbmV8cHJvZnN1cmZ8bGVxc2xhbnR8bGVzZG90b3J8cmFlbXB0eXZ8c3VicGx1c3xub3RuaXZifG5vdG5pdmN8c3VicmFycnx6aWdyYXJyfHZ6aWd6YWd8c3VibXVsdHxzdWJlZG90fEVsZW1lbnR8YmV0d2VlbnxjaXJzY2lyfGxhcnJiZnN8bGFycnNpbXxsb3RpbWVzfGxicmtzbGR8bGJya3NsdXxsb3plbmdlfGxkcmRoYXJ8ZGJrYXJvd3xiaWdjaXJjfGVwc2lsb258c2ltcmFycnxzaW1wbHVzfGx0cXVlc3R8RXBzaWxvbnxsdXJ1aGFyfGd0cXVlc3R8bWFsdGVzZXxucG9saW50fGVxY29sb258bnByZWNlcXxiaWdvZG90fGRkYWdnZXJ8Z3RybGVzc3xibmVxdWl2fGhhcnJjaXJ8ZGRvdHNlcXxlcXVpdkREfGJhY2tzaW18ZGVtcHR5dnxuc3FzdWJlfG5zcXN1cGV8VXBzaWxvbnxuc3Vic2V0fHVwc2lsb258bWludXNkdXxuc3VjY2VxfHN3YXJyb3d8bnN1cHNldHxjb2xvbmVxfHNlYXJyb3d8Ym94cGx1c3xuYXBwcm94fG5hdHVyYWx8YXN5bXBlcXxhbGVmc3ltfGNvbmdkb3R8bmVhcnJvd3xiaWdzdGFyfGRpYW1vbmR8c3VwcGx1c3x0cml0aW1lfExlZnRUZWV8bnZpbmZpbnx0cmlwbHVzfE5ld0xpbmV8bnZsdHJpZXxudnJ0cmllfG53YXJyb3d8bmV4aXN0c3xEaWFtb25kfHJ1bHVoYXJ8SW1wbGllc3xzdXBtdWx0fGFuZ3phcnJ8c3VwbGFycnxzdXBoc3VifHF1ZXN0ZXF8YmVjYXVzZXxkaWdhbW1hfEJlY2F1c2V8b2xjcm9zc3xiZW1wdHl2fG9taWNyb258T21pY3Jvbnxyb3RpbWVzfE5vQnJlYWt8aW50cHJvZHxhbmdydHZifG9yZGVyb2Z8dXdhbmdsZXxzdXBoc29sfGxlc2RvdG98b3JzbG9wZXxEb3duVGVlfHJlYWxpbmV8Y3VkYXJybHxyZGxkaGFyfE92ZXJCYXJ8c3VwZWRvdHxsZXNzZG90fHN1cGRzdWJ8dG9wZm9ya3xzdWNjc2ltfHJicmtzbHV8cmJya3NsZHxwZXJ0ZW5rfGN1ZGFycnJ8aXNpbmRvdHxwbGFuY2tofGxlc3NndHJ8cGx1c2NpcnxnZXNkb3RvfHBsdXNzaW18cGx1c3R3b3xsZXNzc2ltfGN1bGFycnB8cmFycnNpbXxDYXlsZXlzfG5vdGludmF8bm90aW52Ynxub3RpbnZjfFVwQXJyb3d8VXBhcnJvd3x1cGFycm93fE5vdExlc3N8ZHdhbmdsZXxwcmVjc2ltfFByb2R1Y3R8Y3VyYXJybXxDY29uaW50fGRvdHBsdXN8cmFycmJmc3xjY3Vwc3NtfENlZGlsbGF8Y2VtcHR5dnxub3RuaXZhfHF1YXRpbnR8ZnJhYzM1fGZyYWMzOHxmcmFjNDV8ZnJhYzU2fGZyYWM1OHxmcmFjNzh8dHJpZG90fHhvcGx1c3xnYWN1dGV8Z2FtbWFkfEdhbW1hZHxsZmlzaHR8bGZsb29yfGJpZ2N1cHxzcXN1cGV8Z2JyZXZlfEdicmV2ZXxsaGFydWx8c3FzdWJlfHNxY3Vwc3xHY2VkaWx8YXBhY2lyfGxsaGFyZHxsbWlkb3R8TG1pZG90fGxtb3VzdHxhbmRhbmR8c3FjYXBzfGFwcHJveHxBYnJldmV8c3BhZGVzfGNpcmNlcXx0cHJpbWV8ZGl2aWRlfHRvcGNpcnxBc3NpZ258dG9wYm90fGdlc2RvdHxkaXZvbnh8eHVwbHVzfHRpbWVzZHxnZXNsZXN8YXRpbGRlfHNvbGJhcnxTT0ZUY3l8bG9wbHVzfHRpbWVzYnxsb3dhc3R8bG93YmFyfGRsY29ybnxkbGNyb3B8c29mdGN5fGRvbGxhcnxscGFybHR8dGhrc2ltfGxyaGFyZHxBdGlsZGV8bHNhcXVvfHNtYXNocHxiaWd2ZWV8dGhpbnNwfHdyZWF0aHxia2Fyb3d8bHNxdW9yfGxzdHJva3xMc3Ryb2t8bHRocmVlfGx0aW1lc3xsdGxhcnJ8RG90RG90fHNpbWRvdHxsdHJQYXJ8d2VpZXJwfHhzcWN1cHxhbmdtc2R8c2lnbWF2fHNpZ21hZnx6ZWV0cmZ8WmNhcm9ufHpjYXJvbnxtYXBzdG98dnN1cG5lfHRoZXRhdnxjaXJtaWR8bWFya2VyfG1jb21tYXxaYWN1dGV8dnN1Ym5FfHRoZXJlNHxndGxQYXJ8dnN1Ym5lfGJvdHRvbXxndHJhcnJ8U0hDSGN5fHNoY2hjeXxtaWRhc3R8bWlkY2lyfG1pZGRvdHxtaW51c2J8bWludXNkfGd0cmRvdHxib3d0aWV8c2Zyb3dufG1ucGx1c3xtb2RlbHN8Y29sb25lfHNlc3dhcnxDb2xvbmV8bXN0cG9zfHNlYXJoa3xndHJzaW18bmFjdXRlfE5hY3V0ZXxib3hib3h8dGVscmVjfGhhaXJzcHxUY2VkaWx8bmJ1bXBlfHNjbnNpbXxuY2Fyb258TmNhcm9ufG5jZWRpbHxOY2VkaWx8aGFtaWx0fFNjZWRpbHxuZWFyaGt8aGFyZGN5fEhBUkRjeXx0Y2VkaWx8VGNhcm9ufGNvbW1hdHxuZXF1aXZ8bmVzZWFyfHRjYXJvbnx0YXJnZXR8aGVhcnRzfG5leGlzdHx2YXJyaG98c2NlZGlsfFNjYXJvbnxzY2Fyb258aGVsbGlwfFNhY3V0ZXxzYWN1dGV8aGVyY29ufHN3bndhcnxjb21wZm58cnRpbWVzfHJ0aHJlZXxyc3F1b3J8cnNhcXVvfHphY3V0ZXx3ZWRnZXF8aG9tdGh0fGJhcnZlZXxiYXJ3ZWR8QmFyd2VkfHJwYXJndHxob3JiYXJ8Y29uaW50fHN3YXJoa3xyb3BsdXN8bmx0cmllfGhzbGFzaHxoc3Ryb2t8SHN0cm9rfHJtb3VzdHxDb25pbnR8YnByaW1lfGh5YnVsbHxoeXBoZW58aWFjdXRlfElhY3V0ZXxzdXBzdXB8c3Vwc3VifHN1cHNpbXx2YXJwaGl8Y29wcm9kfGJydmJhcnxhZ3JhdmV8U3Vwc2V0fHN1cHNldHxpZ3JhdmV8SWdyYXZlfG5vdGluRXxBZ3JhdmV8aWlpaW50fGlpbmZpbnxjb3B5c3J8d2VkYmFyfFZlcmJhcnx2YW5ncnR8YmVjYXVzfGluY2FyZXx2ZXJiYXJ8aW5vZG90fGJ1bGxldHxkcmNvcm58aW50Y2FsfGRyY3JvcHxjdWxhcnJ8dmVsbGlwfFV0aWxkZXxidW1wZXF8Y3VwY2FwfGRzdHJva3xEc3Ryb2t8Q3VwQ2FwfGN1cGN1cHxjdXBkb3R8ZWFjdXRlfEVhY3V0ZXxzdXBkb3R8aXF1ZXN0fGVhc3RlcnxlY2Fyb258RWNhcm9ufGVjb2xvbnxpc2luc3Z8dXRpbGRlfGl0aWxkZXxJdGlsZGV8Y3VyYXJyfHN1Y2NlcXxCdW1wZXF8Y2FjdXRlfHVsY3JvcHxucGFyc2x8Q2FjdXRlfG5wcmN1ZXxlZ3JhdmV8RWdyYXZlfG5yYXJyY3xucmFycnd8c3Vic3VwfHN1YnN1YnxucnRyaWV8anNlcmN5fG5zY2N1ZXxKc2VyY3l8a2FwcGF2fGtjZWRpbHxLY2VkaWx8c3Vic2ltfHVsY29ybnxuc2ltZXF8ZWdzZG90fHZlZWJhcnxrZ3JlZW58Y2FwYW5kfGVsc2RvdHxTdWJzZXR8c3Vic2V0fGN1cnJlbnxhYWN1dGV8bGFjdXRlfExhY3V0ZXxlbXB0eXZ8bnRpbGRlfE50aWxkZXxsYWdyYW58bGFtYmRhfExhbWJkYXxjYXBjYXB8VWdyYXZlfGxhbmdsZXxzdWJkb3R8ZW1zcDEzfG51bWVyb3xlbXNwMTR8bnZkYXNofG52RGFzaHxuVmRhc2h8blZEYXNofHVncmF2ZXx1ZmlzaHR8bnZIYXJyfGxhcnJmc3xudmxBcnJ8bGFycmhrfGxhcnJscHxsYXJycGx8bnZyQXJyfFVkYmxhY3xud2FyaGt8bGFycnRsfG53bmVhcnxvYWN1dGV8T2FjdXRlfGxhdGFpbHxsQXRhaWx8c3N0YXJmfGxicmFjZXxvZGJsYWN8T2RibGFjfGxicmFja3x1ZGJsYWN8b2Rzb2xkfGVwYXJzbHxsY2Fyb258TGNhcm9ufG9ncmF2ZXxPZ3JhdmV8bGNlZGlsfExjZWRpbHxBYWN1dGV8c3NtaWxlfHNzZXRtbnxzcXVhcmZ8bGRxdW9yfGNhcGN1cHxvbWludXN8Y3lsY3R5fHJoYXJ1bHxlcWNpcmN8ZGFnZ2VyfHJmbG9vcnxyZmlzaHR8RGFnZ2VyfGRhbGV0aHxlcXVhbHN8b3JpZ29mfGNhcGRvdHxlcXVlc3R8ZGNhcm9ufERjYXJvbnxyZHF1b3J8b3NsYXNofE9zbGFzaHxvdGlsZGV8T3RpbGRlfG90aW1lc3xPdGltZXN8dXJjcm9wfFVicmV2ZXx1YnJldmV8WWFjdXRlfFVhY3V0ZXx1YWN1dGV8UmNlZGlsfHJjZWRpbHx1cmNvcm58cGFyc2ltfFJjYXJvbnxWZGFzaGx8cmNhcm9ufFRzdHJva3xwZXJjbnR8cGVyaW9kfHBlcm1pbHxFeGlzdHN8eWFjdXRlfHJicmFja3xyYnJhY2V8cGhtbWF0fGNjYXJvbnxDY2Fyb258cGxhbmNrfGNjZWRpbHxwbGFua3Z8dHN0cm9rfGZlbWFsZXxwbHVzZG98cGx1c2R1fGZmaWxpZ3xwbHVzbW58ZmZsbGlnfENjZWRpbHxyQXRhaWx8ZGZpc2h0fGJlcm5vdXxyYXRhaWx8UmFycnRsfHJhcnJ0bHxhbmdzcGh8cmFycnBsfHJhcnJscHxyYXJyaGt8eHdlZGdlfHhvdGltZXxmb3JhbGx8Rm9yQWxsfFZ2ZGFzaHx2c3VwbkV8cHJlY2VxfGJpZ2NhcHxmcmFjMTJ8ZnJhYzEzfGZyYWMxNHxwcmltZXN8cmFycmZzfHBybnNpbXxmcmFjMTV8U3F1YXJlfGZyYWMxNnxzcXVhcmV8bGVzZG90fGZyYWMxOHxmcmFjMjN8cHJvcHRvfHBydXJlbHxyYXJyYXB8cmFuZ2xlfHB1bmNzcHxmcmFjMjV8UmFjdXRlfHFwcmltZXxyYWN1dGV8bGVzZ2VzfGZyYWMzNHxhYnJldmV8QUVsaWd8ZXFzaW18dXRkb3R8c2V0bW58dXJ0cml8RXF1YWx8VXJpbmd8c2VBcnJ8dXJpbmd8c2VhcnJ8ZGFzaHZ8RGFzaHZ8bXVtYXB8bmFibGF8aW9nb258SW9nb258c2RvdGV8c2RvdGJ8c2NzaW18bmFwaWR8bmFwb3N8ZXF1aXZ8bmF0dXJ8QWNpcmN8ZGJsYWN8ZXJhcnJ8bmJ1bXB8aXByb2R8ZXJEb3R8dWNpcmN8YXdpbnR8ZXNkb3R8YW5ncnR8bmNvbmd8aXNpbkV8c2NuYXB8U2NpcmN8c2NpcmN8bmRhc2h8aXNpbnN8VWJyY3l8bmVhcnJ8bmVBcnJ8aXNpbnZ8bmVkb3R8dWJyY3l8YWN1dGV8WWNpcmN8aXVrY3l8SXVrY3l8eHV0cml8bmVzaW18Y2FyZXR8amNpcmN8SmNpcmN8Y2Fyb258dHdpeHR8ZGRhcnJ8c2NjdWV8ZXhpc3R8am1hdGh8c2JxdW98bmdlcXF8YW5nc3R8Y2NhcHN8bGNlaWx8bmdzaW18VXBUZWV8ZGVsdGF8RGVsdGF8cnRyaWZ8bmhhcnJ8bmhBcnJ8bmhwYXJ8cnRyaWV8anVrY3l8SnVrY3l8a2FwcGF8cnNxdW98S2FwcGF8bmxhcnJ8bmxBcnJ8VFNIY3l8cnJhcnJ8YW9nb258QW9nb258ZmZsaWd8eHJhcnJ8dHNoY3l8Y2NpcmN8bmxlcXF8ZmlsaWd8dXBzaWh8bmxlc3N8ZGhhcmx8bmxzaW18ZmpsaWd8cm9wYXJ8bmx0cml8ZGhhcnJ8cm9icmt8cm9hcnJ8ZmxsaWd8Zmx0bnN8cm9hbmd8cm5taWR8c3VibkV8c3VibmV8bEFhcnJ8dHJpc2J8Q2NpcmN8YWNpcmN8Y2N1cHN8Ymxhbmt8VkRhc2h8Zm9ya3Z8VmRhc2h8bGFuZ2R8Y2VkaWx8YmxrMTJ8YmxrMTR8bGFxdW98c3RybnN8ZGlhbXN8bm90aW58dkRhc2h8bGFycmJ8YmxrMzR8YmxvY2t8ZGlzaW58dXBsdXN8dmRhc2h8dkJhcnZ8YWVsaWd8c3RhcmZ8V2VkZ2V8Y2hlY2t8eHJBcnJ8bGF0ZXN8bGJhcnJ8bEJhcnJ8bm90bml8bGJicmt8YmNvbmd8ZnJhc2x8bGJya2V8ZnJvd258dnJ0cml8dnByb3B8dm5zdXB8Z2FtbWF8R2FtbWF8d2VkZ2V8eG9kb3R8YmRxdW98c3JhcnJ8ZG90ZXF8bGRxdW98Ym94ZGx8Ym94ZEx8Z2NpcmN8R2NpcmN8Ym94RGx8Ym94REx8Ym94ZHJ8Ym94ZFJ8Ym94RHJ8VFJBREV8dHJhZGV8cmxoYXJ8Ym94RFJ8dm5zdWJ8bnBhcnR8dmx0cml8cmxhcnJ8Ym94aGR8Ym94aER8bnByZWN8Z2VzY2N8bnJhcnJ8bnJBcnJ8Ym94SGR8Ym94SER8Ym94aHV8Ym94aFV8bnJ0cml8Ym94SHV8Y2x1YnN8Ym94SFV8dGltZXN8Y29sb258Q29sb258Z2ltZWx8eGxBcnJ8VGlsZGV8bnNpbWV8dGlsZGV8bnNtaWR8bnNwYXJ8VEhPUk58dGhvcm58eGxhcnJ8bnN1YmV8bnN1YkV8dGhrYXB8eGhBcnJ8Y29tbWF8bnN1Y2N8Ym94dWx8Ym94dUx8bnN1cGV8bnN1cEV8Z25lcXF8Z25zaW18Ym94VWx8Ym94VUx8Z3JhdmV8Ym94dXJ8Ym94dVJ8Ym94VXJ8Ym94VVJ8bGVzY2N8YW5nbGV8YmVwc2l8Ym94dmh8dmFycGl8Ym94dkh8bnVtc3B8VGhldGF8Z3NpbWV8Z3NpbWx8dGhldGF8Ym94Vmh8Ym94Vkh8Ym94dmx8Z3RjaXJ8Z3Rkb3R8Ym94dkx8Ym94Vmx8Ym94Vkx8Y3JhcnJ8Y3Jvc3N8Q3Jvc3N8bnZzaW18Ym94dnJ8bndhcnJ8bndBcnJ8c3FzdXB8ZHRkb3R8VW9nb258bGhhcmR8bGhhcnV8ZHRyaWZ8b2NpcmN8T2NpcmN8bGhibGt8ZHVhcnJ8b2Rhc2h8c3FzdWJ8SGFjZWt8c3FjdXB8bGxhcnJ8ZHVoYXJ8b2VsaWd8T0VsaWd8b2ZjaXJ8Ym94dlJ8dW9nb258bGx0cml8Ym94VnJ8Y3N1YmV8dXVhcnJ8b2hiYXJ8Y3N1cGV8Y3Rkb3R8b2xhcnJ8b2xjaXJ8aGFycnd8b2xpbmV8c3FjYXB8b21hY3J8T21hY3J8b21lZ2F8T21lZ2F8Ym94VlJ8YWxlcGh8bG5lcXF8bG5zaW18bG9hbmd8bG9hcnJ8cmhhcnV8bG9icmt8aGNpcmN8b3BlcnB8b3BsdXN8cmhhcmR8SGNpcmN8b3JhcnJ8VW5pb258b3JkZXJ8ZWNpcmN8RWNpcmN8Y3VlcHJ8c3psaWd8Y3Vlc2N8YnJldmV8cmVhbHN8ZUREb3R8QnJldmV8aG9hcnJ8bG9wYXJ8dXRyaWZ8cmRxdW98VW1hY3J8dW1hY3J8ZWZEb3R8c3dBcnJ8dWx0cml8YWxwaGF8cmNlaWx8b3ZiYXJ8c3dhcnJ8V2NpcmN8d2NpcmN8c210ZXN8c21pbGV8YnNlbWl8bHJhcnJ8YXJpbmd8cGFyc2x8bHJoYXJ8YnNpbWV8dWhibGt8bHJ0cml8Y3Vwb3J8QXJpbmd8dWhhcnJ8dWhhcmx8c2xhcnJ8cmJya2V8YnNvbGJ8bHNpbWV8cmJicmt8UkJhcnJ8bHNpbWd8cGhvbmV8ckJhcnJ8cmJhcnJ8aWNpcmN8bHNxdW98SWNpcmN8ZW1hY3J8RW1hY3J8cmF0aW98c2ltbmV8cGx1c2J8c2ltbEV8c2ltZ0V8c2ltZXF8cGx1c2V8bHRjaXJ8bHRkb3R8ZW1wdHl8eGhhcnJ8eGR0cml8aWV4Y2x8QWxwaGF8bHRyaWV8cmFycnd8cG91bmR8bHRyaWZ8eGNpcmN8YnVtcGV8cHJjdWV8YnVtcEV8YXN5bXB8YW1hY3J8Y3V2ZWV8U2lnbWF8c2lnbWF8aWlpbnR8dWRoYXJ8aWlvdGF8aWpsaWd8SUpsaWd8c3VwbkV8aW1hY3J8SW1hY3J8cHJpbWV8UHJpbWV8aW1hZ2V8cHJuYXB8ZW9nb258RW9nb258cmFycmN8bWRhc2h8bUREb3R8Y3V3ZWR8aW1hdGh8c3VwbmV8aW1wZWR8QW1hY3J8dWRhcnJ8cHJzaW18bWljcm98cmFycmJ8Y3dpbnR8cmFxdW98aW5maW58ZXBsdXN8cmFuZ2V8cmFuZ2R8VWNpcmN8cmFkaWN8bWludXN8YW1hbGd8dmVlZXF8ckFhcnJ8ZXBzaXZ8eWNpcmN8cXVlc3R8c2hhcnB8cXVvdHx6d25qfFFzY3J8cmFjZXxxc2NyfFFvcGZ8cW9wZnxxaW50fHJhbmd8UmFuZ3xac2NyfHpzY3J8Wm9wZnx6b3BmfHJhcnJ8ckFycnxSYXJyfFBzY3J8cHNjcnxwcm9wfHByb2R8cHJuRXxwcmVjfFpIY3l8emhjeXxwcmFwfFpldGF8emV0YXxQb3BmfHBvcGZ8WmRvdHxwbHVzfHpkb3R8WXVtbHx5dW1sfHBoaXZ8WVVjeXx5dWN5fFlzY3J8eXNjcnxwZXJwfFlvcGZ8eW9wZnxwYXJ0fHBhcmF8WUljeXxPdW1sfHJjdWJ8eWljeXxZQWN5fHJkY2F8b3VtbHxvc29sfE9zY3J8cmRzaHx5YWN5fHJlYWx8b3Njcnx4dmVlfGFuZGR8cmVjdHxhbmR2fFhzY3J8b3JvcnxvcmRtfG9yZGZ8eHNjcnxhbmdlfGFvcGZ8QW9wZnxySGFyfFhvcGZ8b3BhcnxPb3BmfHhvcGZ8eG5pc3xyaG92fG9vcGZ8b21pZHx4bWFwfG9pbnR8YXBpZHxhcG9zfG9nb258YXNjcnxBc2NyfG9kb3R8b2Rpdnx4Y3VwfHhjYXB8b2NpcnxvYXN0fG52bHR8bnZsZXxudmd0fG52Z2V8bnZhcHxXc2NyfHdzY3J8YXVtbHxudGxnfG50Z2x8bnN1cHxuc3VifG5zaW18TnNjcnxuc2NyfG5zY2V8V29wZnxyaW5nfG5wcmV8d29wZnxucGFyfEF1bWx8QmFydnxiYnJrfE5vcGZ8bm9wZnxubWlkfG5MdHZ8YmV0YXxyb3BmfFJvcGZ8QmV0YXxiZXRofG5sZXN8cnBhcnxubGVxfGJub3R8Yk5vdHxubGRyfE5KY3l8cnNjcnxSc2NyfFZzY3J8dnNjcnxyc3FifG5qY3l8Ym9wZnxuaXNkfEJvcGZ8cnRyaXxWb3BmfG5HdHZ8bmd0cnx2b3BmfGJveGh8Ym94SHxib3h2fG5nZXN8bmdlcXxib3hWfGJzY3J8c2NhcHxCc2NyfGJzaW18VmVydHx2ZXJ0fGJzb2x8YnVsbHxidW1wfGNhcHN8Y2RvdHxuY3VwfHNjbkV8bmNhcHxuYnNwfG5hcEV8Q2RvdHxjZW50fHNkb3R8VmJhcnxuYW5nfHZCYXJ8Y2hjeXxNc2NyfG1zY3J8c2VjdHxzZW1pfENIY3l8TW9wZnxtb3BmfHNleHR8Y2lyY3xjaXJlfG1sZHJ8bWxjcHxjaXJFfGNvbXB8c2hjeXxTSGN5fHZBcnJ8dmFycnxjb25nfGNvcGZ8Q29wZnxjb3B5fENPUFl8bWFsdHxtYWxlfG1hY3J8bHZuRXxjc2NyfGx0cml8c2ltZXxsdGNjfHNpbWd8Q3NjcnxzaW1sfGNzdWJ8VXVtbHxsc3FifGxzaW18dXVtbHxjc3VwfExzY3J8bHNjcnx1dHJpfHNtaWR8bHBhcnxjdXBzfHNtdGV8bG96ZnxkYXJyfExvcGZ8VXNjcnxzb2xifGxvcGZ8c29wZnxTb3BmfGxuZXF8dXNjcnxzcGFyfGRBcnJ8bG5hcHxEYXJyfGRhc2h8U3FydHxMSmN5fGxqY3l8bEhhcnxkSGFyfFVwc2l8dXBzaXxkaWFtfGxlc2d8ZGpjeXxESmN5fGxlcXF8ZG9wZnxEb3BmfGRzY3J8RHNjcnxkc2N5fGxkc2h8bGRjYXxzcXVmfERTY3l8c3NjcnxTc2NyfGRzb2x8bGN1YnxsYXRlfHN0YXJ8U3RhcnxVb3BmfExhcnJ8bEFycnxsYXJyfHVvcGZ8ZHRyaXxkemN5fHN1YmV8c3ViRXxMYW5nfGxhbmd8S3Njcnxrc2NyfEtvcGZ8a29wZnxLSmN5fGtqY3l8S0hjeXxraGN5fERaY3l8ZWNpcnxlZG90fGVEb3R8SnNjcnxqc2NyfHN1Y2N8Sm9wZnxqb3BmfEVkb3R8dUhhcnxlbXNwfGVuc3B8SXVtbHxpdW1sfGVvcGZ8aXNpbnxJc2NyfGlzY3J8RW9wZnxlcGFyfHN1bmd8ZXBzaXxlc2NyfHN1cDF8c3VwMnxzdXAzfElvdGF8aW90YXxzdXBlfHN1cEV8SW9wZnxpb3BmfElPY3l8aW9jeXxFc2NyfGVzaW18RXNpbXxpbW9mfFVhcnJ8UVVPVHx1QXJyfHVhcnJ8ZXVtbHxJRWN5fGllY3l8SWRvdHxFdW1sfGV1cm98ZXhjbHxIc2NyfGhzY3J8SG9wZnxob3BmfFRTY3l8dHNjeXxUc2NyfGhiYXJ8dHNjcnxmbGF0fHRicmt8Zm5vZnxoQXJyfGhhcnJ8aGFsZnxmb3BmfEZvcGZ8dGRvdHxndm5FfGZvcmt8dHJpZXxndGNjfGZzY3J8RnNjcnxnZG90fGdzaW18R3Njcnxnc2NyfEdvcGZ8Z29wZnxnbmVxfEdkb3R8dG9zYXxnbmFwfFRvcGZ8dG9wZnxnZXFxfHRvZWF8R0pjeXxnamN5fHRpbnR8Z2VzbHxtaWR8U2ZyfGdnZ3x0b3B8Z2VzfGdsYXxnbEV8Z2xqfGdlcXxnbmV8Z0VsfGdlbHxnbkV8R2N5fGdjeXxnYXB8VGZyfHRmcnxUY3l8dGN5fEhhdHxUYXV8RmZyfHRhdXxUYWJ8aGZyfEhmcnxmZnJ8RmN5fGZjeXxpY3l8SWN5fGlmZnxFVEh8ZXRofGlmcnxJZnJ8RXRhfGV0YXxpbnR8SW50fFN1cHxzdXB8dWN5fFVjeXxTdW18c3VtfGpjeXxFTkd8dWZyfFVmcnxlbmd8SmN5fGpmcnxlbHN8ZWxsfGVnc3xFZnJ8ZWZyfEpmcnx1bWx8a2N5fEtjeXxFY3l8ZWN5fGtmcnxLZnJ8bGFwfFN1YnxzdWJ8bGF0fGxjeXxMY3l8bGVnfERvdHxkb3R8bEVnfGxlcXxsZXN8c3F1fGRpdnxkaWV8bGZyfExmcnxsZ0V8RGZyfGRmcnxEZWx8ZGVnfERjeXxkY3l8bG5lfGxuRXxzb2x8bG96fHNtdHxDdXB8bHJtfGN1cHxsc2h8THNofHNpbXxzaHl8bWFwfE1hcHxtY3l8TWN5fG1mcnxNZnJ8bWhvfGdmcnxHZnJ8c2ZyfGNpcnxDaGl8Y2hpfG5hcHxDZnJ8dmN5fFZjeXxjZnJ8U2N5fHNjeXxuY3l8TmN5fHZlZXxWZWV8Q2FwfGNhcHxuZnJ8c2NFfHNjZXxOZnJ8bmdlfG5nRXxuR2d8dmZyfFZmcnxuZ3R8Ym90fG5HdHxuaXN8bml2fFJzaHxyc2h8bmxlfG5sRXxibmV8QmZyfGJmcnxuTGx8bmx0fG5MdHxCY3l8YmN5fG5vdHxOb3R8cmxtfHdmcnxXZnJ8bnByfG5zY3xudW18b2N5fGFzdHxPY3l8b2ZyfHhmcnxYZnJ8T2ZyfG9ndHxvaG18YXBFfG9sdHxSaG98YXBlfHJob3xSZnJ8cmZyfG9yZHxSRUd8YW5nfHJlZ3xvcnZ8QW5kfGFuZHxBTVB8UmN5fGFtcHxBZnJ8eWN5fFljeXx5ZW58eWZyfFlmcnxyY3l8cGFyfHBjeXxQY3l8cGZyfFBmcnxwaGl8UGhpfGFmcnxBY3l8YWN5fHpjeXxaY3l8cGl2fGFjRXxhY2R8emZyfFpmcnxwcmV8cHJFfHBzaXxQc2l8cWZyfFFmcnx6d2p8T3J8Z2V8R2d8Z3R8Z2d8ZWx8b1N8bHR8THR8TFR8UmV8bGd8Z2x8ZWd8bmV8SW18aXR8bGV8RER8d3B8d3J8bnV8TnV8ZGR8bEV8U2N8c2N8cGl8UGl8ZWV8YWZ8bGx8TGx8cnh8Z0V8eGl8cG18WGl8aWN8cHJ8UHJ8aW58bml8bXB8bXV8YWN8TXV8b3J8YXB8R3R8R1R8aWkpO3wmKEFhY3V0ZXxBZ3JhdmV8QXRpbGRlfENjZWRpbHxFYWN1dGV8RWdyYXZlfElhY3V0ZXxJZ3JhdmV8TnRpbGRlfE9hY3V0ZXxPZ3JhdmV8T3NsYXNofE90aWxkZXxVYWN1dGV8VWdyYXZlfFlhY3V0ZXxhYWN1dGV8YWdyYXZlfGF0aWxkZXxicnZiYXJ8Y2NlZGlsfGN1cnJlbnxkaXZpZGV8ZWFjdXRlfGVncmF2ZXxmcmFjMTJ8ZnJhYzE0fGZyYWMzNHxpYWN1dGV8aWdyYXZlfGlxdWVzdHxtaWRkb3R8bnRpbGRlfG9hY3V0ZXxvZ3JhdmV8b3NsYXNofG90aWxkZXxwbHVzbW58dWFjdXRlfHVncmF2ZXx5YWN1dGV8QUVsaWd8QWNpcmN8QXJpbmd8RWNpcmN8SWNpcmN8T2NpcmN8VEhPUk58VWNpcmN8YWNpcmN8YWN1dGV8YWVsaWd8YXJpbmd8Y2VkaWx8ZWNpcmN8aWNpcmN8aWV4Y2x8bGFxdW98bWljcm98b2NpcmN8cG91bmR8cmFxdW98c3psaWd8dGhvcm58dGltZXN8dWNpcmN8QXVtbHxDT1BZfEV1bWx8SXVtbHxPdW1sfFFVT1R8VXVtbHxhdW1sfGNlbnR8Y29weXxldW1sfGl1bWx8bWFjcnxuYnNwfG9yZGZ8b3JkbXxvdW1sfHBhcmF8cXVvdHxzZWN0fHN1cDF8c3VwMnxzdXAzfHV1bWx8eXVtbHxBTVB8RVRIfFJFR3xhbXB8ZGVnfGV0aHxub3R8cmVnfHNoeXx1bWx8eWVufEdUfExUfGd0fGx0KSg/ITspKFs9YS16QS1aMC05XT8pfCYjKFswLTldKykoOz8pfCYjW3hYXShbYS1mQS1GMC05XSspKDs/KXwmKFswLTlhLXpBLVpdKykvZztcblx0dmFyIGRlY29kZU1hcCA9IHsnYWFjdXRlJzonXFx4RTEnLCdBYWN1dGUnOidcXHhDMScsJ2FicmV2ZSc6J1xcdTAxMDMnLCdBYnJldmUnOidcXHUwMTAyJywnYWMnOidcXHUyMjNFJywnYWNkJzonXFx1MjIzRicsJ2FjRSc6J1xcdTIyM0VcXHUwMzMzJywnYWNpcmMnOidcXHhFMicsJ0FjaXJjJzonXFx4QzInLCdhY3V0ZSc6J1xceEI0JywnYWN5JzonXFx1MDQzMCcsJ0FjeSc6J1xcdTA0MTAnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FmJzonXFx1MjA2MScsJ2Fmcic6J1xcdUQ4MzVcXHVERDFFJywnQWZyJzonXFx1RDgzNVxcdUREMDQnLCdhZ3JhdmUnOidcXHhFMCcsJ0FncmF2ZSc6J1xceEMwJywnYWxlZnN5bSc6J1xcdTIxMzUnLCdhbGVwaCc6J1xcdTIxMzUnLCdhbHBoYSc6J1xcdTAzQjEnLCdBbHBoYSc6J1xcdTAzOTEnLCdhbWFjcic6J1xcdTAxMDEnLCdBbWFjcic6J1xcdTAxMDAnLCdhbWFsZyc6J1xcdTJBM0YnLCdhbXAnOicmJywnQU1QJzonJicsJ2FuZCc6J1xcdTIyMjcnLCdBbmQnOidcXHUyQTUzJywnYW5kYW5kJzonXFx1MkE1NScsJ2FuZGQnOidcXHUyQTVDJywnYW5kc2xvcGUnOidcXHUyQTU4JywnYW5kdic6J1xcdTJBNUEnLCdhbmcnOidcXHUyMjIwJywnYW5nZSc6J1xcdTI5QTQnLCdhbmdsZSc6J1xcdTIyMjAnLCdhbmdtc2QnOidcXHUyMjIxJywnYW5nbXNkYWEnOidcXHUyOUE4JywnYW5nbXNkYWInOidcXHUyOUE5JywnYW5nbXNkYWMnOidcXHUyOUFBJywnYW5nbXNkYWQnOidcXHUyOUFCJywnYW5nbXNkYWUnOidcXHUyOUFDJywnYW5nbXNkYWYnOidcXHUyOUFEJywnYW5nbXNkYWcnOidcXHUyOUFFJywnYW5nbXNkYWgnOidcXHUyOUFGJywnYW5ncnQnOidcXHUyMjFGJywnYW5ncnR2Yic6J1xcdTIyQkUnLCdhbmdydHZiZCc6J1xcdTI5OUQnLCdhbmdzcGgnOidcXHUyMjIyJywnYW5nc3QnOidcXHhDNScsJ2FuZ3phcnInOidcXHUyMzdDJywnYW9nb24nOidcXHUwMTA1JywnQW9nb24nOidcXHUwMTA0JywnYW9wZic6J1xcdUQ4MzVcXHVERDUyJywnQW9wZic6J1xcdUQ4MzVcXHVERDM4JywnYXAnOidcXHUyMjQ4JywnYXBhY2lyJzonXFx1MkE2RicsJ2FwZSc6J1xcdTIyNEEnLCdhcEUnOidcXHUyQTcwJywnYXBpZCc6J1xcdTIyNEInLCdhcG9zJzonXFwnJywnQXBwbHlGdW5jdGlvbic6J1xcdTIwNjEnLCdhcHByb3gnOidcXHUyMjQ4JywnYXBwcm94ZXEnOidcXHUyMjRBJywnYXJpbmcnOidcXHhFNScsJ0FyaW5nJzonXFx4QzUnLCdhc2NyJzonXFx1RDgzNVxcdURDQjYnLCdBc2NyJzonXFx1RDgzNVxcdURDOUMnLCdBc3NpZ24nOidcXHUyMjU0JywnYXN0JzonKicsJ2FzeW1wJzonXFx1MjI0OCcsJ2FzeW1wZXEnOidcXHUyMjREJywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2F3Y29uaW50JzonXFx1MjIzMycsJ2F3aW50JzonXFx1MkExMScsJ2JhY2tjb25nJzonXFx1MjI0QycsJ2JhY2tlcHNpbG9uJzonXFx1MDNGNicsJ2JhY2twcmltZSc6J1xcdTIwMzUnLCdiYWNrc2ltJzonXFx1MjIzRCcsJ2JhY2tzaW1lcSc6J1xcdTIyQ0QnLCdCYWNrc2xhc2gnOidcXHUyMjE2JywnQmFydic6J1xcdTJBRTcnLCdiYXJ2ZWUnOidcXHUyMkJEJywnYmFyd2VkJzonXFx1MjMwNScsJ0JhcndlZCc6J1xcdTIzMDYnLCdiYXJ3ZWRnZSc6J1xcdTIzMDUnLCdiYnJrJzonXFx1MjNCNScsJ2Jicmt0YnJrJzonXFx1MjNCNicsJ2Jjb25nJzonXFx1MjI0QycsJ2JjeSc6J1xcdTA0MzEnLCdCY3knOidcXHUwNDExJywnYmRxdW8nOidcXHUyMDFFJywnYmVjYXVzJzonXFx1MjIzNScsJ2JlY2F1c2UnOidcXHUyMjM1JywnQmVjYXVzZSc6J1xcdTIyMzUnLCdiZW1wdHl2JzonXFx1MjlCMCcsJ2JlcHNpJzonXFx1MDNGNicsJ2Jlcm5vdSc6J1xcdTIxMkMnLCdCZXJub3VsbGlzJzonXFx1MjEyQycsJ2JldGEnOidcXHUwM0IyJywnQmV0YSc6J1xcdTAzOTInLCdiZXRoJzonXFx1MjEzNicsJ2JldHdlZW4nOidcXHUyMjZDJywnYmZyJzonXFx1RDgzNVxcdUREMUYnLCdCZnInOidcXHVEODM1XFx1REQwNScsJ2JpZ2NhcCc6J1xcdTIyQzInLCdiaWdjaXJjJzonXFx1MjVFRicsJ2JpZ2N1cCc6J1xcdTIyQzMnLCdiaWdvZG90JzonXFx1MkEwMCcsJ2JpZ29wbHVzJzonXFx1MkEwMScsJ2JpZ290aW1lcyc6J1xcdTJBMDInLCdiaWdzcWN1cCc6J1xcdTJBMDYnLCdiaWdzdGFyJzonXFx1MjYwNScsJ2JpZ3RyaWFuZ2xlZG93bic6J1xcdTI1QkQnLCdiaWd0cmlhbmdsZXVwJzonXFx1MjVCMycsJ2JpZ3VwbHVzJzonXFx1MkEwNCcsJ2JpZ3ZlZSc6J1xcdTIyQzEnLCdiaWd3ZWRnZSc6J1xcdTIyQzAnLCdia2Fyb3cnOidcXHUyOTBEJywnYmxhY2tsb3plbmdlJzonXFx1MjlFQicsJ2JsYWNrc3F1YXJlJzonXFx1MjVBQScsJ2JsYWNrdHJpYW5nbGUnOidcXHUyNUI0JywnYmxhY2t0cmlhbmdsZWRvd24nOidcXHUyNUJFJywnYmxhY2t0cmlhbmdsZWxlZnQnOidcXHUyNUMyJywnYmxhY2t0cmlhbmdsZXJpZ2h0JzonXFx1MjVCOCcsJ2JsYW5rJzonXFx1MjQyMycsJ2JsazEyJzonXFx1MjU5MicsJ2JsazE0JzonXFx1MjU5MScsJ2JsazM0JzonXFx1MjU5MycsJ2Jsb2NrJzonXFx1MjU4OCcsJ2JuZSc6Jz1cXHUyMEU1JywnYm5lcXVpdic6J1xcdTIyNjFcXHUyMEU1JywnYm5vdCc6J1xcdTIzMTAnLCdiTm90JzonXFx1MkFFRCcsJ2JvcGYnOidcXHVEODM1XFx1REQ1MycsJ0JvcGYnOidcXHVEODM1XFx1REQzOScsJ2JvdCc6J1xcdTIyQTUnLCdib3R0b20nOidcXHUyMkE1JywnYm93dGllJzonXFx1MjJDOCcsJ2JveGJveCc6J1xcdTI5QzknLCdib3hkbCc6J1xcdTI1MTAnLCdib3hkTCc6J1xcdTI1NTUnLCdib3hEbCc6J1xcdTI1NTYnLCdib3hETCc6J1xcdTI1NTcnLCdib3hkcic6J1xcdTI1MEMnLCdib3hkUic6J1xcdTI1NTInLCdib3hEcic6J1xcdTI1NTMnLCdib3hEUic6J1xcdTI1NTQnLCdib3hoJzonXFx1MjUwMCcsJ2JveEgnOidcXHUyNTUwJywnYm94aGQnOidcXHUyNTJDJywnYm94aEQnOidcXHUyNTY1JywnYm94SGQnOidcXHUyNTY0JywnYm94SEQnOidcXHUyNTY2JywnYm94aHUnOidcXHUyNTM0JywnYm94aFUnOidcXHUyNTY4JywnYm94SHUnOidcXHUyNTY3JywnYm94SFUnOidcXHUyNTY5JywnYm94bWludXMnOidcXHUyMjlGJywnYm94cGx1cyc6J1xcdTIyOUUnLCdib3h0aW1lcyc6J1xcdTIyQTAnLCdib3h1bCc6J1xcdTI1MTgnLCdib3h1TCc6J1xcdTI1NUInLCdib3hVbCc6J1xcdTI1NUMnLCdib3hVTCc6J1xcdTI1NUQnLCdib3h1cic6J1xcdTI1MTQnLCdib3h1Uic6J1xcdTI1NTgnLCdib3hVcic6J1xcdTI1NTknLCdib3hVUic6J1xcdTI1NUEnLCdib3h2JzonXFx1MjUwMicsJ2JveFYnOidcXHUyNTUxJywnYm94dmgnOidcXHUyNTNDJywnYm94dkgnOidcXHUyNTZBJywnYm94VmgnOidcXHUyNTZCJywnYm94VkgnOidcXHUyNTZDJywnYm94dmwnOidcXHUyNTI0JywnYm94dkwnOidcXHUyNTYxJywnYm94VmwnOidcXHUyNTYyJywnYm94VkwnOidcXHUyNTYzJywnYm94dnInOidcXHUyNTFDJywnYm94dlInOidcXHUyNTVFJywnYm94VnInOidcXHUyNTVGJywnYm94VlInOidcXHUyNTYwJywnYnByaW1lJzonXFx1MjAzNScsJ2JyZXZlJzonXFx1MDJEOCcsJ0JyZXZlJzonXFx1MDJEOCcsJ2JydmJhcic6J1xceEE2JywnYnNjcic6J1xcdUQ4MzVcXHVEQ0I3JywnQnNjcic6J1xcdTIxMkMnLCdic2VtaSc6J1xcdTIwNEYnLCdic2ltJzonXFx1MjIzRCcsJ2JzaW1lJzonXFx1MjJDRCcsJ2Jzb2wnOidcXFxcJywnYnNvbGInOidcXHUyOUM1JywnYnNvbGhzdWInOidcXHUyN0M4JywnYnVsbCc6J1xcdTIwMjInLCdidWxsZXQnOidcXHUyMDIyJywnYnVtcCc6J1xcdTIyNEUnLCdidW1wZSc6J1xcdTIyNEYnLCdidW1wRSc6J1xcdTJBQUUnLCdidW1wZXEnOidcXHUyMjRGJywnQnVtcGVxJzonXFx1MjI0RScsJ2NhY3V0ZSc6J1xcdTAxMDcnLCdDYWN1dGUnOidcXHUwMTA2JywnY2FwJzonXFx1MjIyOScsJ0NhcCc6J1xcdTIyRDInLCdjYXBhbmQnOidcXHUyQTQ0JywnY2FwYnJjdXAnOidcXHUyQTQ5JywnY2FwY2FwJzonXFx1MkE0QicsJ2NhcGN1cCc6J1xcdTJBNDcnLCdjYXBkb3QnOidcXHUyQTQwJywnQ2FwaXRhbERpZmZlcmVudGlhbEQnOidcXHUyMTQ1JywnY2Fwcyc6J1xcdTIyMjlcXHVGRTAwJywnY2FyZXQnOidcXHUyMDQxJywnY2Fyb24nOidcXHUwMkM3JywnQ2F5bGV5cyc6J1xcdTIxMkQnLCdjY2Fwcyc6J1xcdTJBNEQnLCdjY2Fyb24nOidcXHUwMTBEJywnQ2Nhcm9uJzonXFx1MDEwQycsJ2NjZWRpbCc6J1xceEU3JywnQ2NlZGlsJzonXFx4QzcnLCdjY2lyYyc6J1xcdTAxMDknLCdDY2lyYyc6J1xcdTAxMDgnLCdDY29uaW50JzonXFx1MjIzMCcsJ2NjdXBzJzonXFx1MkE0QycsJ2NjdXBzc20nOidcXHUyQTUwJywnY2RvdCc6J1xcdTAxMEInLCdDZG90JzonXFx1MDEwQScsJ2NlZGlsJzonXFx4QjgnLCdDZWRpbGxhJzonXFx4QjgnLCdjZW1wdHl2JzonXFx1MjlCMicsJ2NlbnQnOidcXHhBMicsJ2NlbnRlcmRvdCc6J1xceEI3JywnQ2VudGVyRG90JzonXFx4QjcnLCdjZnInOidcXHVEODM1XFx1REQyMCcsJ0Nmcic6J1xcdTIxMkQnLCdjaGN5JzonXFx1MDQ0NycsJ0NIY3knOidcXHUwNDI3JywnY2hlY2snOidcXHUyNzEzJywnY2hlY2ttYXJrJzonXFx1MjcxMycsJ2NoaSc6J1xcdTAzQzcnLCdDaGknOidcXHUwM0E3JywnY2lyJzonXFx1MjVDQicsJ2NpcmMnOidcXHUwMkM2JywnY2lyY2VxJzonXFx1MjI1NycsJ2NpcmNsZWFycm93bGVmdCc6J1xcdTIxQkEnLCdjaXJjbGVhcnJvd3JpZ2h0JzonXFx1MjFCQicsJ2NpcmNsZWRhc3QnOidcXHUyMjlCJywnY2lyY2xlZGNpcmMnOidcXHUyMjlBJywnY2lyY2xlZGRhc2gnOidcXHUyMjlEJywnQ2lyY2xlRG90JzonXFx1MjI5OScsJ2NpcmNsZWRSJzonXFx4QUUnLCdjaXJjbGVkUyc6J1xcdTI0QzgnLCdDaXJjbGVNaW51cyc6J1xcdTIyOTYnLCdDaXJjbGVQbHVzJzonXFx1MjI5NScsJ0NpcmNsZVRpbWVzJzonXFx1MjI5NycsJ2NpcmUnOidcXHUyMjU3JywnY2lyRSc6J1xcdTI5QzMnLCdjaXJmbmludCc6J1xcdTJBMTAnLCdjaXJtaWQnOidcXHUyQUVGJywnY2lyc2Npcic6J1xcdTI5QzInLCdDbG9ja3dpc2VDb250b3VySW50ZWdyYWwnOidcXHUyMjMyJywnQ2xvc2VDdXJseURvdWJsZVF1b3RlJzonXFx1MjAxRCcsJ0Nsb3NlQ3VybHlRdW90ZSc6J1xcdTIwMTknLCdjbHVicyc6J1xcdTI2NjMnLCdjbHVic3VpdCc6J1xcdTI2NjMnLCdjb2xvbic6JzonLCdDb2xvbic6J1xcdTIyMzcnLCdjb2xvbmUnOidcXHUyMjU0JywnQ29sb25lJzonXFx1MkE3NCcsJ2NvbG9uZXEnOidcXHUyMjU0JywnY29tbWEnOicsJywnY29tbWF0JzonQCcsJ2NvbXAnOidcXHUyMjAxJywnY29tcGZuJzonXFx1MjIxOCcsJ2NvbXBsZW1lbnQnOidcXHUyMjAxJywnY29tcGxleGVzJzonXFx1MjEwMicsJ2NvbmcnOidcXHUyMjQ1JywnY29uZ2RvdCc6J1xcdTJBNkQnLCdDb25ncnVlbnQnOidcXHUyMjYxJywnY29uaW50JzonXFx1MjIyRScsJ0NvbmludCc6J1xcdTIyMkYnLCdDb250b3VySW50ZWdyYWwnOidcXHUyMjJFJywnY29wZic6J1xcdUQ4MzVcXHVERDU0JywnQ29wZic6J1xcdTIxMDInLCdjb3Byb2QnOidcXHUyMjEwJywnQ29wcm9kdWN0JzonXFx1MjIxMCcsJ2NvcHknOidcXHhBOScsJ0NPUFknOidcXHhBOScsJ2NvcHlzcic6J1xcdTIxMTcnLCdDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsJzonXFx1MjIzMycsJ2NyYXJyJzonXFx1MjFCNScsJ2Nyb3NzJzonXFx1MjcxNycsJ0Nyb3NzJzonXFx1MkEyRicsJ2NzY3InOidcXHVEODM1XFx1RENCOCcsJ0NzY3InOidcXHVEODM1XFx1REM5RScsJ2NzdWInOidcXHUyQUNGJywnY3N1YmUnOidcXHUyQUQxJywnY3N1cCc6J1xcdTJBRDAnLCdjc3VwZSc6J1xcdTJBRDInLCdjdGRvdCc6J1xcdTIyRUYnLCdjdWRhcnJsJzonXFx1MjkzOCcsJ2N1ZGFycnInOidcXHUyOTM1JywnY3VlcHInOidcXHUyMkRFJywnY3Vlc2MnOidcXHUyMkRGJywnY3VsYXJyJzonXFx1MjFCNicsJ2N1bGFycnAnOidcXHUyOTNEJywnY3VwJzonXFx1MjIyQScsJ0N1cCc6J1xcdTIyRDMnLCdjdXBicmNhcCc6J1xcdTJBNDgnLCdjdXBjYXAnOidcXHUyQTQ2JywnQ3VwQ2FwJzonXFx1MjI0RCcsJ2N1cGN1cCc6J1xcdTJBNEEnLCdjdXBkb3QnOidcXHUyMjhEJywnY3Vwb3InOidcXHUyQTQ1JywnY3Vwcyc6J1xcdTIyMkFcXHVGRTAwJywnY3VyYXJyJzonXFx1MjFCNycsJ2N1cmFycm0nOidcXHUyOTNDJywnY3VybHllcXByZWMnOidcXHUyMkRFJywnY3VybHllcXN1Y2MnOidcXHUyMkRGJywnY3VybHl2ZWUnOidcXHUyMkNFJywnY3VybHl3ZWRnZSc6J1xcdTIyQ0YnLCdjdXJyZW4nOidcXHhBNCcsJ2N1cnZlYXJyb3dsZWZ0JzonXFx1MjFCNicsJ2N1cnZlYXJyb3dyaWdodCc6J1xcdTIxQjcnLCdjdXZlZSc6J1xcdTIyQ0UnLCdjdXdlZCc6J1xcdTIyQ0YnLCdjd2NvbmludCc6J1xcdTIyMzInLCdjd2ludCc6J1xcdTIyMzEnLCdjeWxjdHknOidcXHUyMzJEJywnZGFnZ2VyJzonXFx1MjAyMCcsJ0RhZ2dlcic6J1xcdTIwMjEnLCdkYWxldGgnOidcXHUyMTM4JywnZGFycic6J1xcdTIxOTMnLCdkQXJyJzonXFx1MjFEMycsJ0RhcnInOidcXHUyMUExJywnZGFzaCc6J1xcdTIwMTAnLCdkYXNodic6J1xcdTIyQTMnLCdEYXNodic6J1xcdTJBRTQnLCdkYmthcm93JzonXFx1MjkwRicsJ2RibGFjJzonXFx1MDJERCcsJ2RjYXJvbic6J1xcdTAxMEYnLCdEY2Fyb24nOidcXHUwMTBFJywnZGN5JzonXFx1MDQzNCcsJ0RjeSc6J1xcdTA0MTQnLCdkZCc6J1xcdTIxNDYnLCdERCc6J1xcdTIxNDUnLCdkZGFnZ2VyJzonXFx1MjAyMScsJ2RkYXJyJzonXFx1MjFDQScsJ0REb3RyYWhkJzonXFx1MjkxMScsJ2Rkb3RzZXEnOidcXHUyQTc3JywnZGVnJzonXFx4QjAnLCdEZWwnOidcXHUyMjA3JywnZGVsdGEnOidcXHUwM0I0JywnRGVsdGEnOidcXHUwMzk0JywnZGVtcHR5dic6J1xcdTI5QjEnLCdkZmlzaHQnOidcXHUyOTdGJywnZGZyJzonXFx1RDgzNVxcdUREMjEnLCdEZnInOidcXHVEODM1XFx1REQwNycsJ2RIYXInOidcXHUyOTY1JywnZGhhcmwnOidcXHUyMUMzJywnZGhhcnInOidcXHUyMUMyJywnRGlhY3JpdGljYWxBY3V0ZSc6J1xceEI0JywnRGlhY3JpdGljYWxEb3QnOidcXHUwMkQ5JywnRGlhY3JpdGljYWxEb3VibGVBY3V0ZSc6J1xcdTAyREQnLCdEaWFjcml0aWNhbEdyYXZlJzonYCcsJ0RpYWNyaXRpY2FsVGlsZGUnOidcXHUwMkRDJywnZGlhbSc6J1xcdTIyQzQnLCdkaWFtb25kJzonXFx1MjJDNCcsJ0RpYW1vbmQnOidcXHUyMkM0JywnZGlhbW9uZHN1aXQnOidcXHUyNjY2JywnZGlhbXMnOidcXHUyNjY2JywnZGllJzonXFx4QTgnLCdEaWZmZXJlbnRpYWxEJzonXFx1MjE0NicsJ2RpZ2FtbWEnOidcXHUwM0REJywnZGlzaW4nOidcXHUyMkYyJywnZGl2JzonXFx4RjcnLCdkaXZpZGUnOidcXHhGNycsJ2RpdmlkZW9udGltZXMnOidcXHUyMkM3JywnZGl2b254JzonXFx1MjJDNycsJ2RqY3knOidcXHUwNDUyJywnREpjeSc6J1xcdTA0MDInLCdkbGNvcm4nOidcXHUyMzFFJywnZGxjcm9wJzonXFx1MjMwRCcsJ2RvbGxhcic6JyQnLCdkb3BmJzonXFx1RDgzNVxcdURENTUnLCdEb3BmJzonXFx1RDgzNVxcdUREM0InLCdkb3QnOidcXHUwMkQ5JywnRG90JzonXFx4QTgnLCdEb3REb3QnOidcXHUyMERDJywnZG90ZXEnOidcXHUyMjUwJywnZG90ZXFkb3QnOidcXHUyMjUxJywnRG90RXF1YWwnOidcXHUyMjUwJywnZG90bWludXMnOidcXHUyMjM4JywnZG90cGx1cyc6J1xcdTIyMTQnLCdkb3RzcXVhcmUnOidcXHUyMkExJywnZG91YmxlYmFyd2VkZ2UnOidcXHUyMzA2JywnRG91YmxlQ29udG91ckludGVncmFsJzonXFx1MjIyRicsJ0RvdWJsZURvdCc6J1xceEE4JywnRG91YmxlRG93bkFycm93JzonXFx1MjFEMycsJ0RvdWJsZUxlZnRBcnJvdyc6J1xcdTIxRDAnLCdEb3VibGVMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxRDQnLCdEb3VibGVMZWZ0VGVlJzonXFx1MkFFNCcsJ0RvdWJsZUxvbmdMZWZ0QXJyb3cnOidcXHUyN0Y4JywnRG91YmxlTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGQScsJ0RvdWJsZUxvbmdSaWdodEFycm93JzonXFx1MjdGOScsJ0RvdWJsZVJpZ2h0QXJyb3cnOidcXHUyMUQyJywnRG91YmxlUmlnaHRUZWUnOidcXHUyMkE4JywnRG91YmxlVXBBcnJvdyc6J1xcdTIxRDEnLCdEb3VibGVVcERvd25BcnJvdyc6J1xcdTIxRDUnLCdEb3VibGVWZXJ0aWNhbEJhcic6J1xcdTIyMjUnLCdkb3duYXJyb3cnOidcXHUyMTkzJywnRG93bmFycm93JzonXFx1MjFEMycsJ0Rvd25BcnJvdyc6J1xcdTIxOTMnLCdEb3duQXJyb3dCYXInOidcXHUyOTEzJywnRG93bkFycm93VXBBcnJvdyc6J1xcdTIxRjUnLCdEb3duQnJldmUnOidcXHUwMzExJywnZG93bmRvd25hcnJvd3MnOidcXHUyMUNBJywnZG93bmhhcnBvb25sZWZ0JzonXFx1MjFDMycsJ2Rvd25oYXJwb29ucmlnaHQnOidcXHUyMUMyJywnRG93bkxlZnRSaWdodFZlY3Rvcic6J1xcdTI5NTAnLCdEb3duTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUUnLCdEb3duTGVmdFZlY3Rvcic6J1xcdTIxQkQnLCdEb3duTGVmdFZlY3RvckJhcic6J1xcdTI5NTYnLCdEb3duUmlnaHRUZWVWZWN0b3InOidcXHUyOTVGJywnRG93blJpZ2h0VmVjdG9yJzonXFx1MjFDMScsJ0Rvd25SaWdodFZlY3RvckJhcic6J1xcdTI5NTcnLCdEb3duVGVlJzonXFx1MjJBNCcsJ0Rvd25UZWVBcnJvdyc6J1xcdTIxQTcnLCdkcmJrYXJvdyc6J1xcdTI5MTAnLCdkcmNvcm4nOidcXHUyMzFGJywnZHJjcm9wJzonXFx1MjMwQycsJ2RzY3InOidcXHVEODM1XFx1RENCOScsJ0RzY3InOidcXHVEODM1XFx1REM5RicsJ2RzY3knOidcXHUwNDU1JywnRFNjeSc6J1xcdTA0MDUnLCdkc29sJzonXFx1MjlGNicsJ2RzdHJvayc6J1xcdTAxMTEnLCdEc3Ryb2snOidcXHUwMTEwJywnZHRkb3QnOidcXHUyMkYxJywnZHRyaSc6J1xcdTI1QkYnLCdkdHJpZic6J1xcdTI1QkUnLCdkdWFycic6J1xcdTIxRjUnLCdkdWhhcic6J1xcdTI5NkYnLCdkd2FuZ2xlJzonXFx1MjlBNicsJ2R6Y3knOidcXHUwNDVGJywnRFpjeSc6J1xcdTA0MEYnLCdkemlncmFycic6J1xcdTI3RkYnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWFzdGVyJzonXFx1MkE2RScsJ2VjYXJvbic6J1xcdTAxMUInLCdFY2Fyb24nOidcXHUwMTFBJywnZWNpcic6J1xcdTIyNTYnLCdlY2lyYyc6J1xceEVBJywnRWNpcmMnOidcXHhDQScsJ2Vjb2xvbic6J1xcdTIyNTUnLCdlY3knOidcXHUwNDREJywnRWN5JzonXFx1MDQyRCcsJ2VERG90JzonXFx1MkE3NycsJ2Vkb3QnOidcXHUwMTE3JywnZURvdCc6J1xcdTIyNTEnLCdFZG90JzonXFx1MDExNicsJ2VlJzonXFx1MjE0NycsJ2VmRG90JzonXFx1MjI1MicsJ2Vmcic6J1xcdUQ4MzVcXHVERDIyJywnRWZyJzonXFx1RDgzNVxcdUREMDgnLCdlZyc6J1xcdTJBOUEnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZWdzJzonXFx1MkE5NicsJ2Vnc2RvdCc6J1xcdTJBOTgnLCdlbCc6J1xcdTJBOTknLCdFbGVtZW50JzonXFx1MjIwOCcsJ2VsaW50ZXJzJzonXFx1MjNFNycsJ2VsbCc6J1xcdTIxMTMnLCdlbHMnOidcXHUyQTk1JywnZWxzZG90JzonXFx1MkE5NycsJ2VtYWNyJzonXFx1MDExMycsJ0VtYWNyJzonXFx1MDExMicsJ2VtcHR5JzonXFx1MjIwNScsJ2VtcHR5c2V0JzonXFx1MjIwNScsJ0VtcHR5U21hbGxTcXVhcmUnOidcXHUyNUZCJywnZW1wdHl2JzonXFx1MjIwNScsJ0VtcHR5VmVyeVNtYWxsU3F1YXJlJzonXFx1MjVBQicsJ2Vtc3AnOidcXHUyMDAzJywnZW1zcDEzJzonXFx1MjAwNCcsJ2Vtc3AxNCc6J1xcdTIwMDUnLCdlbmcnOidcXHUwMTRCJywnRU5HJzonXFx1MDE0QScsJ2Vuc3AnOidcXHUyMDAyJywnZW9nb24nOidcXHUwMTE5JywnRW9nb24nOidcXHUwMTE4JywnZW9wZic6J1xcdUQ4MzVcXHVERDU2JywnRW9wZic6J1xcdUQ4MzVcXHVERDNDJywnZXBhcic6J1xcdTIyRDUnLCdlcGFyc2wnOidcXHUyOUUzJywnZXBsdXMnOidcXHUyQTcxJywnZXBzaSc6J1xcdTAzQjUnLCdlcHNpbG9uJzonXFx1MDNCNScsJ0Vwc2lsb24nOidcXHUwMzk1JywnZXBzaXYnOidcXHUwM0Y1JywnZXFjaXJjJzonXFx1MjI1NicsJ2VxY29sb24nOidcXHUyMjU1JywnZXFzaW0nOidcXHUyMjQyJywnZXFzbGFudGd0cic6J1xcdTJBOTYnLCdlcXNsYW50bGVzcyc6J1xcdTJBOTUnLCdFcXVhbCc6J1xcdTJBNzUnLCdlcXVhbHMnOic9JywnRXF1YWxUaWxkZSc6J1xcdTIyNDInLCdlcXVlc3QnOidcXHUyMjVGJywnRXF1aWxpYnJpdW0nOidcXHUyMUNDJywnZXF1aXYnOidcXHUyMjYxJywnZXF1aXZERCc6J1xcdTJBNzgnLCdlcXZwYXJzbCc6J1xcdTI5RTUnLCdlcmFycic6J1xcdTI5NzEnLCdlckRvdCc6J1xcdTIyNTMnLCdlc2NyJzonXFx1MjEyRicsJ0VzY3InOidcXHUyMTMwJywnZXNkb3QnOidcXHUyMjUwJywnZXNpbSc6J1xcdTIyNDInLCdFc2ltJzonXFx1MkE3MycsJ2V0YSc6J1xcdTAzQjcnLCdFdGEnOidcXHUwMzk3JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2V1cm8nOidcXHUyMEFDJywnZXhjbCc6JyEnLCdleGlzdCc6J1xcdTIyMDMnLCdFeGlzdHMnOidcXHUyMjAzJywnZXhwZWN0YXRpb24nOidcXHUyMTMwJywnZXhwb25lbnRpYWxlJzonXFx1MjE0NycsJ0V4cG9uZW50aWFsRSc6J1xcdTIxNDcnLCdmYWxsaW5nZG90c2VxJzonXFx1MjI1MicsJ2ZjeSc6J1xcdTA0NDQnLCdGY3knOidcXHUwNDI0JywnZmVtYWxlJzonXFx1MjY0MCcsJ2ZmaWxpZyc6J1xcdUZCMDMnLCdmZmxpZyc6J1xcdUZCMDAnLCdmZmxsaWcnOidcXHVGQjA0JywnZmZyJzonXFx1RDgzNVxcdUREMjMnLCdGZnInOidcXHVEODM1XFx1REQwOScsJ2ZpbGlnJzonXFx1RkIwMScsJ0ZpbGxlZFNtYWxsU3F1YXJlJzonXFx1MjVGQycsJ0ZpbGxlZFZlcnlTbWFsbFNxdWFyZSc6J1xcdTI1QUEnLCdmamxpZyc6J2ZqJywnZmxhdCc6J1xcdTI2NkQnLCdmbGxpZyc6J1xcdUZCMDInLCdmbHRucyc6J1xcdTI1QjEnLCdmbm9mJzonXFx1MDE5MicsJ2ZvcGYnOidcXHVEODM1XFx1REQ1NycsJ0ZvcGYnOidcXHVEODM1XFx1REQzRCcsJ2ZvcmFsbCc6J1xcdTIyMDAnLCdGb3JBbGwnOidcXHUyMjAwJywnZm9yayc6J1xcdTIyRDQnLCdmb3Jrdic6J1xcdTJBRDknLCdGb3VyaWVydHJmJzonXFx1MjEzMScsJ2ZwYXJ0aW50JzonXFx1MkEwRCcsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzEzJzonXFx1MjE1MycsJ2ZyYWMxNCc6J1xceEJDJywnZnJhYzE1JzonXFx1MjE1NScsJ2ZyYWMxNic6J1xcdTIxNTknLCdmcmFjMTgnOidcXHUyMTVCJywnZnJhYzIzJzonXFx1MjE1NCcsJ2ZyYWMyNSc6J1xcdTIxNTYnLCdmcmFjMzQnOidcXHhCRScsJ2ZyYWMzNSc6J1xcdTIxNTcnLCdmcmFjMzgnOidcXHUyMTVDJywnZnJhYzQ1JzonXFx1MjE1OCcsJ2ZyYWM1Nic6J1xcdTIxNUEnLCdmcmFjNTgnOidcXHUyMTVEJywnZnJhYzc4JzonXFx1MjE1RScsJ2ZyYXNsJzonXFx1MjA0NCcsJ2Zyb3duJzonXFx1MjMyMicsJ2ZzY3InOidcXHVEODM1XFx1RENCQicsJ0ZzY3InOidcXHUyMTMxJywnZ2FjdXRlJzonXFx1MDFGNScsJ2dhbW1hJzonXFx1MDNCMycsJ0dhbW1hJzonXFx1MDM5MycsJ2dhbW1hZCc6J1xcdTAzREQnLCdHYW1tYWQnOidcXHUwM0RDJywnZ2FwJzonXFx1MkE4NicsJ2dicmV2ZSc6J1xcdTAxMUYnLCdHYnJldmUnOidcXHUwMTFFJywnR2NlZGlsJzonXFx1MDEyMicsJ2djaXJjJzonXFx1MDExRCcsJ0djaXJjJzonXFx1MDExQycsJ2djeSc6J1xcdTA0MzMnLCdHY3knOidcXHUwNDEzJywnZ2RvdCc6J1xcdTAxMjEnLCdHZG90JzonXFx1MDEyMCcsJ2dlJzonXFx1MjI2NScsJ2dFJzonXFx1MjI2NycsJ2dlbCc6J1xcdTIyREInLCdnRWwnOidcXHUyQThDJywnZ2VxJzonXFx1MjI2NScsJ2dlcXEnOidcXHUyMjY3JywnZ2Vxc2xhbnQnOidcXHUyQTdFJywnZ2VzJzonXFx1MkE3RScsJ2dlc2NjJzonXFx1MkFBOScsJ2dlc2RvdCc6J1xcdTJBODAnLCdnZXNkb3RvJzonXFx1MkE4MicsJ2dlc2RvdG9sJzonXFx1MkE4NCcsJ2dlc2wnOidcXHUyMkRCXFx1RkUwMCcsJ2dlc2xlcyc6J1xcdTJBOTQnLCdnZnInOidcXHVEODM1XFx1REQyNCcsJ0dmcic6J1xcdUQ4MzVcXHVERDBBJywnZ2cnOidcXHUyMjZCJywnR2cnOidcXHUyMkQ5JywnZ2dnJzonXFx1MjJEOScsJ2dpbWVsJzonXFx1MjEzNycsJ2dqY3knOidcXHUwNDUzJywnR0pjeSc6J1xcdTA0MDMnLCdnbCc6J1xcdTIyNzcnLCdnbGEnOidcXHUyQUE1JywnZ2xFJzonXFx1MkE5MicsJ2dsaic6J1xcdTJBQTQnLCdnbmFwJzonXFx1MkE4QScsJ2duYXBwcm94JzonXFx1MkE4QScsJ2duZSc6J1xcdTJBODgnLCdnbkUnOidcXHUyMjY5JywnZ25lcSc6J1xcdTJBODgnLCdnbmVxcSc6J1xcdTIyNjknLCdnbnNpbSc6J1xcdTIyRTcnLCdnb3BmJzonXFx1RDgzNVxcdURENTgnLCdHb3BmJzonXFx1RDgzNVxcdUREM0UnLCdncmF2ZSc6J2AnLCdHcmVhdGVyRXF1YWwnOidcXHUyMjY1JywnR3JlYXRlckVxdWFsTGVzcyc6J1xcdTIyREInLCdHcmVhdGVyRnVsbEVxdWFsJzonXFx1MjI2NycsJ0dyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMicsJ0dyZWF0ZXJMZXNzJzonXFx1MjI3NycsJ0dyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RScsJ0dyZWF0ZXJUaWxkZSc6J1xcdTIyNzMnLCdnc2NyJzonXFx1MjEwQScsJ0dzY3InOidcXHVEODM1XFx1RENBMicsJ2dzaW0nOidcXHUyMjczJywnZ3NpbWUnOidcXHUyQThFJywnZ3NpbWwnOidcXHUyQTkwJywnZ3QnOic+JywnR3QnOidcXHUyMjZCJywnR1QnOic+JywnZ3RjYyc6J1xcdTJBQTcnLCdndGNpcic6J1xcdTJBN0EnLCdndGRvdCc6J1xcdTIyRDcnLCdndGxQYXInOidcXHUyOTk1JywnZ3RxdWVzdCc6J1xcdTJBN0MnLCdndHJhcHByb3gnOidcXHUyQTg2JywnZ3RyYXJyJzonXFx1Mjk3OCcsJ2d0cmRvdCc6J1xcdTIyRDcnLCdndHJlcWxlc3MnOidcXHUyMkRCJywnZ3RyZXFxbGVzcyc6J1xcdTJBOEMnLCdndHJsZXNzJzonXFx1MjI3NycsJ2d0cnNpbSc6J1xcdTIyNzMnLCdndmVydG5lcXEnOidcXHUyMjY5XFx1RkUwMCcsJ2d2bkUnOidcXHUyMjY5XFx1RkUwMCcsJ0hhY2VrJzonXFx1MDJDNycsJ2hhaXJzcCc6J1xcdTIwMEEnLCdoYWxmJzonXFx4QkQnLCdoYW1pbHQnOidcXHUyMTBCJywnaGFyZGN5JzonXFx1MDQ0QScsJ0hBUkRjeSc6J1xcdTA0MkEnLCdoYXJyJzonXFx1MjE5NCcsJ2hBcnInOidcXHUyMUQ0JywnaGFycmNpcic6J1xcdTI5NDgnLCdoYXJydyc6J1xcdTIxQUQnLCdIYXQnOideJywnaGJhcic6J1xcdTIxMEYnLCdoY2lyYyc6J1xcdTAxMjUnLCdIY2lyYyc6J1xcdTAxMjQnLCdoZWFydHMnOidcXHUyNjY1JywnaGVhcnRzdWl0JzonXFx1MjY2NScsJ2hlbGxpcCc6J1xcdTIwMjYnLCdoZXJjb24nOidcXHUyMkI5JywnaGZyJzonXFx1RDgzNVxcdUREMjUnLCdIZnInOidcXHUyMTBDJywnSGlsYmVydFNwYWNlJzonXFx1MjEwQicsJ2hrc2Vhcm93JzonXFx1MjkyNScsJ2hrc3dhcm93JzonXFx1MjkyNicsJ2hvYXJyJzonXFx1MjFGRicsJ2hvbXRodCc6J1xcdTIyM0InLCdob29rbGVmdGFycm93JzonXFx1MjFBOScsJ2hvb2tyaWdodGFycm93JzonXFx1MjFBQScsJ2hvcGYnOidcXHVEODM1XFx1REQ1OScsJ0hvcGYnOidcXHUyMTBEJywnaG9yYmFyJzonXFx1MjAxNScsJ0hvcml6b250YWxMaW5lJzonXFx1MjUwMCcsJ2hzY3InOidcXHVEODM1XFx1RENCRCcsJ0hzY3InOidcXHUyMTBCJywnaHNsYXNoJzonXFx1MjEwRicsJ2hzdHJvayc6J1xcdTAxMjcnLCdIc3Ryb2snOidcXHUwMTI2JywnSHVtcERvd25IdW1wJzonXFx1MjI0RScsJ0h1bXBFcXVhbCc6J1xcdTIyNEYnLCdoeWJ1bGwnOidcXHUyMDQzJywnaHlwaGVuJzonXFx1MjAxMCcsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpYyc6J1xcdTIwNjMnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2ljeSc6J1xcdTA0MzgnLCdJY3knOidcXHUwNDE4JywnSWRvdCc6J1xcdTAxMzAnLCdpZWN5JzonXFx1MDQzNScsJ0lFY3knOidcXHUwNDE1JywnaWV4Y2wnOidcXHhBMScsJ2lmZic6J1xcdTIxRDQnLCdpZnInOidcXHVEODM1XFx1REQyNicsJ0lmcic6J1xcdTIxMTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaWknOidcXHUyMTQ4JywnaWlpaW50JzonXFx1MkEwQycsJ2lpaW50JzonXFx1MjIyRCcsJ2lpbmZpbic6J1xcdTI5REMnLCdpaW90YSc6J1xcdTIxMjknLCdpamxpZyc6J1xcdTAxMzMnLCdJSmxpZyc6J1xcdTAxMzInLCdJbSc6J1xcdTIxMTEnLCdpbWFjcic6J1xcdTAxMkInLCdJbWFjcic6J1xcdTAxMkEnLCdpbWFnZSc6J1xcdTIxMTEnLCdJbWFnaW5hcnlJJzonXFx1MjE0OCcsJ2ltYWdsaW5lJzonXFx1MjExMCcsJ2ltYWdwYXJ0JzonXFx1MjExMScsJ2ltYXRoJzonXFx1MDEzMScsJ2ltb2YnOidcXHUyMkI3JywnaW1wZWQnOidcXHUwMUI1JywnSW1wbGllcyc6J1xcdTIxRDInLCdpbic6J1xcdTIyMDgnLCdpbmNhcmUnOidcXHUyMTA1JywnaW5maW4nOidcXHUyMjFFJywnaW5maW50aWUnOidcXHUyOUREJywnaW5vZG90JzonXFx1MDEzMScsJ2ludCc6J1xcdTIyMkInLCdJbnQnOidcXHUyMjJDJywnaW50Y2FsJzonXFx1MjJCQScsJ2ludGVnZXJzJzonXFx1MjEyNCcsJ0ludGVncmFsJzonXFx1MjIyQicsJ2ludGVyY2FsJzonXFx1MjJCQScsJ0ludGVyc2VjdGlvbic6J1xcdTIyQzInLCdpbnRsYXJoayc6J1xcdTJBMTcnLCdpbnRwcm9kJzonXFx1MkEzQycsJ0ludmlzaWJsZUNvbW1hJzonXFx1MjA2MycsJ0ludmlzaWJsZVRpbWVzJzonXFx1MjA2MicsJ2lvY3knOidcXHUwNDUxJywnSU9jeSc6J1xcdTA0MDEnLCdpb2dvbic6J1xcdTAxMkYnLCdJb2dvbic6J1xcdTAxMkUnLCdpb3BmJzonXFx1RDgzNVxcdURENUEnLCdJb3BmJzonXFx1RDgzNVxcdURENDAnLCdpb3RhJzonXFx1MDNCOScsJ0lvdGEnOidcXHUwMzk5JywnaXByb2QnOidcXHUyQTNDJywnaXF1ZXN0JzonXFx4QkYnLCdpc2NyJzonXFx1RDgzNVxcdURDQkUnLCdJc2NyJzonXFx1MjExMCcsJ2lzaW4nOidcXHUyMjA4JywnaXNpbmRvdCc6J1xcdTIyRjUnLCdpc2luRSc6J1xcdTIyRjknLCdpc2lucyc6J1xcdTIyRjQnLCdpc2luc3YnOidcXHUyMkYzJywnaXNpbnYnOidcXHUyMjA4JywnaXQnOidcXHUyMDYyJywnaXRpbGRlJzonXFx1MDEyOScsJ0l0aWxkZSc6J1xcdTAxMjgnLCdpdWtjeSc6J1xcdTA0NTYnLCdJdWtjeSc6J1xcdTA0MDYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdqY2lyYyc6J1xcdTAxMzUnLCdKY2lyYyc6J1xcdTAxMzQnLCdqY3knOidcXHUwNDM5JywnSmN5JzonXFx1MDQxOScsJ2pmcic6J1xcdUQ4MzVcXHVERDI3JywnSmZyJzonXFx1RDgzNVxcdUREMEQnLCdqbWF0aCc6J1xcdTAyMzcnLCdqb3BmJzonXFx1RDgzNVxcdURENUInLCdKb3BmJzonXFx1RDgzNVxcdURENDEnLCdqc2NyJzonXFx1RDgzNVxcdURDQkYnLCdKc2NyJzonXFx1RDgzNVxcdURDQTUnLCdqc2VyY3knOidcXHUwNDU4JywnSnNlcmN5JzonXFx1MDQwOCcsJ2p1a2N5JzonXFx1MDQ1NCcsJ0p1a2N5JzonXFx1MDQwNCcsJ2thcHBhJzonXFx1MDNCQScsJ0thcHBhJzonXFx1MDM5QScsJ2thcHBhdic6J1xcdTAzRjAnLCdrY2VkaWwnOidcXHUwMTM3JywnS2NlZGlsJzonXFx1MDEzNicsJ2tjeSc6J1xcdTA0M0EnLCdLY3knOidcXHUwNDFBJywna2ZyJzonXFx1RDgzNVxcdUREMjgnLCdLZnInOidcXHVEODM1XFx1REQwRScsJ2tncmVlbic6J1xcdTAxMzgnLCdraGN5JzonXFx1MDQ0NScsJ0tIY3knOidcXHUwNDI1Jywna2pjeSc6J1xcdTA0NUMnLCdLSmN5JzonXFx1MDQwQycsJ2tvcGYnOidcXHVEODM1XFx1REQ1QycsJ0tvcGYnOidcXHVEODM1XFx1REQ0MicsJ2tzY3InOidcXHVEODM1XFx1RENDMCcsJ0tzY3InOidcXHVEODM1XFx1RENBNicsJ2xBYXJyJzonXFx1MjFEQScsJ2xhY3V0ZSc6J1xcdTAxM0EnLCdMYWN1dGUnOidcXHUwMTM5JywnbGFlbXB0eXYnOidcXHUyOUI0JywnbGFncmFuJzonXFx1MjExMicsJ2xhbWJkYSc6J1xcdTAzQkInLCdMYW1iZGEnOidcXHUwMzlCJywnbGFuZyc6J1xcdTI3RTgnLCdMYW5nJzonXFx1MjdFQScsJ2xhbmdkJzonXFx1Mjk5MScsJ2xhbmdsZSc6J1xcdTI3RTgnLCdsYXAnOidcXHUyQTg1JywnTGFwbGFjZXRyZic6J1xcdTIxMTInLCdsYXF1byc6J1xceEFCJywnbGFycic6J1xcdTIxOTAnLCdsQXJyJzonXFx1MjFEMCcsJ0xhcnInOidcXHUyMTlFJywnbGFycmInOidcXHUyMUU0JywnbGFycmJmcyc6J1xcdTI5MUYnLCdsYXJyZnMnOidcXHUyOTFEJywnbGFycmhrJzonXFx1MjFBOScsJ2xhcnJscCc6J1xcdTIxQUInLCdsYXJycGwnOidcXHUyOTM5JywnbGFycnNpbSc6J1xcdTI5NzMnLCdsYXJydGwnOidcXHUyMUEyJywnbGF0JzonXFx1MkFBQicsJ2xhdGFpbCc6J1xcdTI5MTknLCdsQXRhaWwnOidcXHUyOTFCJywnbGF0ZSc6J1xcdTJBQUQnLCdsYXRlcyc6J1xcdTJBQURcXHVGRTAwJywnbGJhcnInOidcXHUyOTBDJywnbEJhcnInOidcXHUyOTBFJywnbGJicmsnOidcXHUyNzcyJywnbGJyYWNlJzoneycsJ2xicmFjayc6J1snLCdsYnJrZSc6J1xcdTI5OEInLCdsYnJrc2xkJzonXFx1Mjk4RicsJ2xicmtzbHUnOidcXHUyOThEJywnbGNhcm9uJzonXFx1MDEzRScsJ0xjYXJvbic6J1xcdTAxM0QnLCdsY2VkaWwnOidcXHUwMTNDJywnTGNlZGlsJzonXFx1MDEzQicsJ2xjZWlsJzonXFx1MjMwOCcsJ2xjdWInOid7JywnbGN5JzonXFx1MDQzQicsJ0xjeSc6J1xcdTA0MUInLCdsZGNhJzonXFx1MjkzNicsJ2xkcXVvJzonXFx1MjAxQycsJ2xkcXVvcic6J1xcdTIwMUUnLCdsZHJkaGFyJzonXFx1Mjk2NycsJ2xkcnVzaGFyJzonXFx1Mjk0QicsJ2xkc2gnOidcXHUyMUIyJywnbGUnOidcXHUyMjY0JywnbEUnOidcXHUyMjY2JywnTGVmdEFuZ2xlQnJhY2tldCc6J1xcdTI3RTgnLCdsZWZ0YXJyb3cnOidcXHUyMTkwJywnTGVmdGFycm93JzonXFx1MjFEMCcsJ0xlZnRBcnJvdyc6J1xcdTIxOTAnLCdMZWZ0QXJyb3dCYXInOidcXHUyMUU0JywnTGVmdEFycm93UmlnaHRBcnJvdyc6J1xcdTIxQzYnLCdsZWZ0YXJyb3d0YWlsJzonXFx1MjFBMicsJ0xlZnRDZWlsaW5nJzonXFx1MjMwOCcsJ0xlZnREb3VibGVCcmFja2V0JzonXFx1MjdFNicsJ0xlZnREb3duVGVlVmVjdG9yJzonXFx1Mjk2MScsJ0xlZnREb3duVmVjdG9yJzonXFx1MjFDMycsJ0xlZnREb3duVmVjdG9yQmFyJzonXFx1Mjk1OScsJ0xlZnRGbG9vcic6J1xcdTIzMEEnLCdsZWZ0aGFycG9vbmRvd24nOidcXHUyMUJEJywnbGVmdGhhcnBvb251cCc6J1xcdTIxQkMnLCdsZWZ0bGVmdGFycm93cyc6J1xcdTIxQzcnLCdsZWZ0cmlnaHRhcnJvdyc6J1xcdTIxOTQnLCdMZWZ0cmlnaHRhcnJvdyc6J1xcdTIxRDQnLCdMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxOTQnLCdsZWZ0cmlnaHRhcnJvd3MnOidcXHUyMUM2JywnbGVmdHJpZ2h0aGFycG9vbnMnOidcXHUyMUNCJywnbGVmdHJpZ2h0c3F1aWdhcnJvdyc6J1xcdTIxQUQnLCdMZWZ0UmlnaHRWZWN0b3InOidcXHUyOTRFJywnTGVmdFRlZSc6J1xcdTIyQTMnLCdMZWZ0VGVlQXJyb3cnOidcXHUyMUE0JywnTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUEnLCdsZWZ0dGhyZWV0aW1lcyc6J1xcdTIyQ0InLCdMZWZ0VHJpYW5nbGUnOidcXHUyMkIyJywnTGVmdFRyaWFuZ2xlQmFyJzonXFx1MjlDRicsJ0xlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJCNCcsJ0xlZnRVcERvd25WZWN0b3InOidcXHUyOTUxJywnTGVmdFVwVGVlVmVjdG9yJzonXFx1Mjk2MCcsJ0xlZnRVcFZlY3Rvcic6J1xcdTIxQkYnLCdMZWZ0VXBWZWN0b3JCYXInOidcXHUyOTU4JywnTGVmdFZlY3Rvcic6J1xcdTIxQkMnLCdMZWZ0VmVjdG9yQmFyJzonXFx1Mjk1MicsJ2xlZyc6J1xcdTIyREEnLCdsRWcnOidcXHUyQThCJywnbGVxJzonXFx1MjI2NCcsJ2xlcXEnOidcXHUyMjY2JywnbGVxc2xhbnQnOidcXHUyQTdEJywnbGVzJzonXFx1MkE3RCcsJ2xlc2NjJzonXFx1MkFBOCcsJ2xlc2RvdCc6J1xcdTJBN0YnLCdsZXNkb3RvJzonXFx1MkE4MScsJ2xlc2RvdG9yJzonXFx1MkE4MycsJ2xlc2cnOidcXHUyMkRBXFx1RkUwMCcsJ2xlc2dlcyc6J1xcdTJBOTMnLCdsZXNzYXBwcm94JzonXFx1MkE4NScsJ2xlc3Nkb3QnOidcXHUyMkQ2JywnbGVzc2VxZ3RyJzonXFx1MjJEQScsJ2xlc3NlcXFndHInOidcXHUyQThCJywnTGVzc0VxdWFsR3JlYXRlcic6J1xcdTIyREEnLCdMZXNzRnVsbEVxdWFsJzonXFx1MjI2NicsJ0xlc3NHcmVhdGVyJzonXFx1MjI3NicsJ2xlc3NndHInOidcXHUyMjc2JywnTGVzc0xlc3MnOidcXHUyQUExJywnbGVzc3NpbSc6J1xcdTIyNzInLCdMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0QnLCdMZXNzVGlsZGUnOidcXHUyMjcyJywnbGZpc2h0JzonXFx1Mjk3QycsJ2xmbG9vcic6J1xcdTIzMEEnLCdsZnInOidcXHVEODM1XFx1REQyOScsJ0xmcic6J1xcdUQ4MzVcXHVERDBGJywnbGcnOidcXHUyMjc2JywnbGdFJzonXFx1MkE5MScsJ2xIYXInOidcXHUyOTYyJywnbGhhcmQnOidcXHUyMUJEJywnbGhhcnUnOidcXHUyMUJDJywnbGhhcnVsJzonXFx1Mjk2QScsJ2xoYmxrJzonXFx1MjU4NCcsJ2xqY3knOidcXHUwNDU5JywnTEpjeSc6J1xcdTA0MDknLCdsbCc6J1xcdTIyNkEnLCdMbCc6J1xcdTIyRDgnLCdsbGFycic6J1xcdTIxQzcnLCdsbGNvcm5lcic6J1xcdTIzMUUnLCdMbGVmdGFycm93JzonXFx1MjFEQScsJ2xsaGFyZCc6J1xcdTI5NkInLCdsbHRyaSc6J1xcdTI1RkEnLCdsbWlkb3QnOidcXHUwMTQwJywnTG1pZG90JzonXFx1MDEzRicsJ2xtb3VzdCc6J1xcdTIzQjAnLCdsbW91c3RhY2hlJzonXFx1MjNCMCcsJ2xuYXAnOidcXHUyQTg5JywnbG5hcHByb3gnOidcXHUyQTg5JywnbG5lJzonXFx1MkE4NycsJ2xuRSc6J1xcdTIyNjgnLCdsbmVxJzonXFx1MkE4NycsJ2xuZXFxJzonXFx1MjI2OCcsJ2xuc2ltJzonXFx1MjJFNicsJ2xvYW5nJzonXFx1MjdFQycsJ2xvYXJyJzonXFx1MjFGRCcsJ2xvYnJrJzonXFx1MjdFNicsJ2xvbmdsZWZ0YXJyb3cnOidcXHUyN0Y1JywnTG9uZ2xlZnRhcnJvdyc6J1xcdTI3RjgnLCdMb25nTGVmdEFycm93JzonXFx1MjdGNScsJ2xvbmdsZWZ0cmlnaHRhcnJvdyc6J1xcdTI3RjcnLCdMb25nbGVmdHJpZ2h0YXJyb3cnOidcXHUyN0ZBJywnTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGNycsJ2xvbmdtYXBzdG8nOidcXHUyN0ZDJywnbG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y2JywnTG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y5JywnTG9uZ1JpZ2h0QXJyb3cnOidcXHUyN0Y2JywnbG9vcGFycm93bGVmdCc6J1xcdTIxQUInLCdsb29wYXJyb3dyaWdodCc6J1xcdTIxQUMnLCdsb3Bhcic6J1xcdTI5ODUnLCdsb3BmJzonXFx1RDgzNVxcdURENUQnLCdMb3BmJzonXFx1RDgzNVxcdURENDMnLCdsb3BsdXMnOidcXHUyQTJEJywnbG90aW1lcyc6J1xcdTJBMzQnLCdsb3dhc3QnOidcXHUyMjE3JywnbG93YmFyJzonXycsJ0xvd2VyTGVmdEFycm93JzonXFx1MjE5OScsJ0xvd2VyUmlnaHRBcnJvdyc6J1xcdTIxOTgnLCdsb3onOidcXHUyNUNBJywnbG96ZW5nZSc6J1xcdTI1Q0EnLCdsb3pmJzonXFx1MjlFQicsJ2xwYXInOicoJywnbHBhcmx0JzonXFx1Mjk5MycsJ2xyYXJyJzonXFx1MjFDNicsJ2xyY29ybmVyJzonXFx1MjMxRicsJ2xyaGFyJzonXFx1MjFDQicsJ2xyaGFyZCc6J1xcdTI5NkQnLCdscm0nOidcXHUyMDBFJywnbHJ0cmknOidcXHUyMkJGJywnbHNhcXVvJzonXFx1MjAzOScsJ2xzY3InOidcXHVEODM1XFx1RENDMScsJ0xzY3InOidcXHUyMTEyJywnbHNoJzonXFx1MjFCMCcsJ0xzaCc6J1xcdTIxQjAnLCdsc2ltJzonXFx1MjI3MicsJ2xzaW1lJzonXFx1MkE4RCcsJ2xzaW1nJzonXFx1MkE4RicsJ2xzcWInOidbJywnbHNxdW8nOidcXHUyMDE4JywnbHNxdW9yJzonXFx1MjAxQScsJ2xzdHJvayc6J1xcdTAxNDInLCdMc3Ryb2snOidcXHUwMTQxJywnbHQnOic8JywnTHQnOidcXHUyMjZBJywnTFQnOic8JywnbHRjYyc6J1xcdTJBQTYnLCdsdGNpcic6J1xcdTJBNzknLCdsdGRvdCc6J1xcdTIyRDYnLCdsdGhyZWUnOidcXHUyMkNCJywnbHRpbWVzJzonXFx1MjJDOScsJ2x0bGFycic6J1xcdTI5NzYnLCdsdHF1ZXN0JzonXFx1MkE3QicsJ2x0cmknOidcXHUyNUMzJywnbHRyaWUnOidcXHUyMkI0JywnbHRyaWYnOidcXHUyNUMyJywnbHRyUGFyJzonXFx1Mjk5NicsJ2x1cmRzaGFyJzonXFx1Mjk0QScsJ2x1cnVoYXInOidcXHUyOTY2JywnbHZlcnRuZXFxJzonXFx1MjI2OFxcdUZFMDAnLCdsdm5FJzonXFx1MjI2OFxcdUZFMDAnLCdtYWNyJzonXFx4QUYnLCdtYWxlJzonXFx1MjY0MicsJ21hbHQnOidcXHUyNzIwJywnbWFsdGVzZSc6J1xcdTI3MjAnLCdtYXAnOidcXHUyMUE2JywnTWFwJzonXFx1MjkwNScsJ21hcHN0byc6J1xcdTIxQTYnLCdtYXBzdG9kb3duJzonXFx1MjFBNycsJ21hcHN0b2xlZnQnOidcXHUyMUE0JywnbWFwc3RvdXAnOidcXHUyMUE1JywnbWFya2VyJzonXFx1MjVBRScsJ21jb21tYSc6J1xcdTJBMjknLCdtY3knOidcXHUwNDNDJywnTWN5JzonXFx1MDQxQycsJ21kYXNoJzonXFx1MjAxNCcsJ21ERG90JzonXFx1MjIzQScsJ21lYXN1cmVkYW5nbGUnOidcXHUyMjIxJywnTWVkaXVtU3BhY2UnOidcXHUyMDVGJywnTWVsbGludHJmJzonXFx1MjEzMycsJ21mcic6J1xcdUQ4MzVcXHVERDJBJywnTWZyJzonXFx1RDgzNVxcdUREMTAnLCdtaG8nOidcXHUyMTI3JywnbWljcm8nOidcXHhCNScsJ21pZCc6J1xcdTIyMjMnLCdtaWRhc3QnOicqJywnbWlkY2lyJzonXFx1MkFGMCcsJ21pZGRvdCc6J1xceEI3JywnbWludXMnOidcXHUyMjEyJywnbWludXNiJzonXFx1MjI5RicsJ21pbnVzZCc6J1xcdTIyMzgnLCdtaW51c2R1JzonXFx1MkEyQScsJ01pbnVzUGx1cyc6J1xcdTIyMTMnLCdtbGNwJzonXFx1MkFEQicsJ21sZHInOidcXHUyMDI2JywnbW5wbHVzJzonXFx1MjIxMycsJ21vZGVscyc6J1xcdTIyQTcnLCdtb3BmJzonXFx1RDgzNVxcdURENUUnLCdNb3BmJzonXFx1RDgzNVxcdURENDQnLCdtcCc6J1xcdTIyMTMnLCdtc2NyJzonXFx1RDgzNVxcdURDQzInLCdNc2NyJzonXFx1MjEzMycsJ21zdHBvcyc6J1xcdTIyM0UnLCdtdSc6J1xcdTAzQkMnLCdNdSc6J1xcdTAzOUMnLCdtdWx0aW1hcCc6J1xcdTIyQjgnLCdtdW1hcCc6J1xcdTIyQjgnLCduYWJsYSc6J1xcdTIyMDcnLCduYWN1dGUnOidcXHUwMTQ0JywnTmFjdXRlJzonXFx1MDE0MycsJ25hbmcnOidcXHUyMjIwXFx1MjBEMicsJ25hcCc6J1xcdTIyNDknLCduYXBFJzonXFx1MkE3MFxcdTAzMzgnLCduYXBpZCc6J1xcdTIyNEJcXHUwMzM4JywnbmFwb3MnOidcXHUwMTQ5JywnbmFwcHJveCc6J1xcdTIyNDknLCduYXR1cic6J1xcdTI2NkUnLCduYXR1cmFsJzonXFx1MjY2RScsJ25hdHVyYWxzJzonXFx1MjExNScsJ25ic3AnOidcXHhBMCcsJ25idW1wJzonXFx1MjI0RVxcdTAzMzgnLCduYnVtcGUnOidcXHUyMjRGXFx1MDMzOCcsJ25jYXAnOidcXHUyQTQzJywnbmNhcm9uJzonXFx1MDE0OCcsJ05jYXJvbic6J1xcdTAxNDcnLCduY2VkaWwnOidcXHUwMTQ2JywnTmNlZGlsJzonXFx1MDE0NScsJ25jb25nJzonXFx1MjI0NycsJ25jb25nZG90JzonXFx1MkE2RFxcdTAzMzgnLCduY3VwJzonXFx1MkE0MicsJ25jeSc6J1xcdTA0M0QnLCdOY3knOidcXHUwNDFEJywnbmRhc2gnOidcXHUyMDEzJywnbmUnOidcXHUyMjYwJywnbmVhcmhrJzonXFx1MjkyNCcsJ25lYXJyJzonXFx1MjE5NycsJ25lQXJyJzonXFx1MjFENycsJ25lYXJyb3cnOidcXHUyMTk3JywnbmVkb3QnOidcXHUyMjUwXFx1MDMzOCcsJ05lZ2F0aXZlTWVkaXVtU3BhY2UnOidcXHUyMDBCJywnTmVnYXRpdmVUaGlja1NwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVGhpblNwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVmVyeVRoaW5TcGFjZSc6J1xcdTIwMEInLCduZXF1aXYnOidcXHUyMjYyJywnbmVzZWFyJzonXFx1MjkyOCcsJ25lc2ltJzonXFx1MjI0MlxcdTAzMzgnLCdOZXN0ZWRHcmVhdGVyR3JlYXRlcic6J1xcdTIyNkInLCdOZXN0ZWRMZXNzTGVzcyc6J1xcdTIyNkEnLCdOZXdMaW5lJzonXFxuJywnbmV4aXN0JzonXFx1MjIwNCcsJ25leGlzdHMnOidcXHUyMjA0JywnbmZyJzonXFx1RDgzNVxcdUREMkInLCdOZnInOidcXHVEODM1XFx1REQxMScsJ25nZSc6J1xcdTIyNzEnLCduZ0UnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXEnOidcXHUyMjcxJywnbmdlcXEnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXFzbGFudCc6J1xcdTJBN0VcXHUwMzM4Jywnbmdlcyc6J1xcdTJBN0VcXHUwMzM4JywnbkdnJzonXFx1MjJEOVxcdTAzMzgnLCduZ3NpbSc6J1xcdTIyNzUnLCduZ3QnOidcXHUyMjZGJywnbkd0JzonXFx1MjI2QlxcdTIwRDInLCduZ3RyJzonXFx1MjI2RicsJ25HdHYnOidcXHUyMjZCXFx1MDMzOCcsJ25oYXJyJzonXFx1MjFBRScsJ25oQXJyJzonXFx1MjFDRScsJ25ocGFyJzonXFx1MkFGMicsJ25pJzonXFx1MjIwQicsJ25pcyc6J1xcdTIyRkMnLCduaXNkJzonXFx1MjJGQScsJ25pdic6J1xcdTIyMEInLCduamN5JzonXFx1MDQ1QScsJ05KY3knOidcXHUwNDBBJywnbmxhcnInOidcXHUyMTlBJywnbmxBcnInOidcXHUyMUNEJywnbmxkcic6J1xcdTIwMjUnLCdubGUnOidcXHUyMjcwJywnbmxFJzonXFx1MjI2NlxcdTAzMzgnLCdubGVmdGFycm93JzonXFx1MjE5QScsJ25MZWZ0YXJyb3cnOidcXHUyMUNEJywnbmxlZnRyaWdodGFycm93JzonXFx1MjFBRScsJ25MZWZ0cmlnaHRhcnJvdyc6J1xcdTIxQ0UnLCdubGVxJzonXFx1MjI3MCcsJ25sZXFxJzonXFx1MjI2NlxcdTAzMzgnLCdubGVxc2xhbnQnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXMnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXNzJzonXFx1MjI2RScsJ25MbCc6J1xcdTIyRDhcXHUwMzM4JywnbmxzaW0nOidcXHUyMjc0Jywnbmx0JzonXFx1MjI2RScsJ25MdCc6J1xcdTIyNkFcXHUyMEQyJywnbmx0cmknOidcXHUyMkVBJywnbmx0cmllJzonXFx1MjJFQycsJ25MdHYnOidcXHUyMjZBXFx1MDMzOCcsJ25taWQnOidcXHUyMjI0JywnTm9CcmVhayc6J1xcdTIwNjAnLCdOb25CcmVha2luZ1NwYWNlJzonXFx4QTAnLCdub3BmJzonXFx1RDgzNVxcdURENUYnLCdOb3BmJzonXFx1MjExNScsJ25vdCc6J1xceEFDJywnTm90JzonXFx1MkFFQycsJ05vdENvbmdydWVudCc6J1xcdTIyNjInLCdOb3RDdXBDYXAnOidcXHUyMjZEJywnTm90RG91YmxlVmVydGljYWxCYXInOidcXHUyMjI2JywnTm90RWxlbWVudCc6J1xcdTIyMDknLCdOb3RFcXVhbCc6J1xcdTIyNjAnLCdOb3RFcXVhbFRpbGRlJzonXFx1MjI0MlxcdTAzMzgnLCdOb3RFeGlzdHMnOidcXHUyMjA0JywnTm90R3JlYXRlcic6J1xcdTIyNkYnLCdOb3RHcmVhdGVyRXF1YWwnOidcXHUyMjcxJywnTm90R3JlYXRlckZ1bGxFcXVhbCc6J1xcdTIyNjdcXHUwMzM4JywnTm90R3JlYXRlckdyZWF0ZXInOidcXHUyMjZCXFx1MDMzOCcsJ05vdEdyZWF0ZXJMZXNzJzonXFx1MjI3OScsJ05vdEdyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RVxcdTAzMzgnLCdOb3RHcmVhdGVyVGlsZGUnOidcXHUyMjc1JywnTm90SHVtcERvd25IdW1wJzonXFx1MjI0RVxcdTAzMzgnLCdOb3RIdW1wRXF1YWwnOidcXHUyMjRGXFx1MDMzOCcsJ25vdGluJzonXFx1MjIwOScsJ25vdGluZG90JzonXFx1MjJGNVxcdTAzMzgnLCdub3RpbkUnOidcXHUyMkY5XFx1MDMzOCcsJ25vdGludmEnOidcXHUyMjA5Jywnbm90aW52Yic6J1xcdTIyRjcnLCdub3RpbnZjJzonXFx1MjJGNicsJ05vdExlZnRUcmlhbmdsZSc6J1xcdTIyRUEnLCdOb3RMZWZ0VHJpYW5nbGVCYXInOidcXHUyOUNGXFx1MDMzOCcsJ05vdExlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJFQycsJ05vdExlc3MnOidcXHUyMjZFJywnTm90TGVzc0VxdWFsJzonXFx1MjI3MCcsJ05vdExlc3NHcmVhdGVyJzonXFx1MjI3OCcsJ05vdExlc3NMZXNzJzonXFx1MjI2QVxcdTAzMzgnLCdOb3RMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0RcXHUwMzM4JywnTm90TGVzc1RpbGRlJzonXFx1MjI3NCcsJ05vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMlxcdTAzMzgnLCdOb3ROZXN0ZWRMZXNzTGVzcyc6J1xcdTJBQTFcXHUwMzM4Jywnbm90bmknOidcXHUyMjBDJywnbm90bml2YSc6J1xcdTIyMEMnLCdub3RuaXZiJzonXFx1MjJGRScsJ25vdG5pdmMnOidcXHUyMkZEJywnTm90UHJlY2VkZXMnOidcXHUyMjgwJywnTm90UHJlY2VkZXNFcXVhbCc6J1xcdTJBQUZcXHUwMzM4JywnTm90UHJlY2VkZXNTbGFudEVxdWFsJzonXFx1MjJFMCcsJ05vdFJldmVyc2VFbGVtZW50JzonXFx1MjIwQycsJ05vdFJpZ2h0VHJpYW5nbGUnOidcXHUyMkVCJywnTm90UmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDBcXHUwMzM4JywnTm90UmlnaHRUcmlhbmdsZUVxdWFsJzonXFx1MjJFRCcsJ05vdFNxdWFyZVN1YnNldCc6J1xcdTIyOEZcXHUwMzM4JywnTm90U3F1YXJlU3Vic2V0RXF1YWwnOidcXHUyMkUyJywnTm90U3F1YXJlU3VwZXJzZXQnOidcXHUyMjkwXFx1MDMzOCcsJ05vdFNxdWFyZVN1cGVyc2V0RXF1YWwnOidcXHUyMkUzJywnTm90U3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCdOb3RTdWJzZXRFcXVhbCc6J1xcdTIyODgnLCdOb3RTdWNjZWVkcyc6J1xcdTIyODEnLCdOb3RTdWNjZWVkc0VxdWFsJzonXFx1MkFCMFxcdTAzMzgnLCdOb3RTdWNjZWVkc1NsYW50RXF1YWwnOidcXHUyMkUxJywnTm90U3VjY2VlZHNUaWxkZSc6J1xcdTIyN0ZcXHUwMzM4JywnTm90U3VwZXJzZXQnOidcXHUyMjgzXFx1MjBEMicsJ05vdFN1cGVyc2V0RXF1YWwnOidcXHUyMjg5JywnTm90VGlsZGUnOidcXHUyMjQxJywnTm90VGlsZGVFcXVhbCc6J1xcdTIyNDQnLCdOb3RUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDcnLCdOb3RUaWxkZVRpbGRlJzonXFx1MjI0OScsJ05vdFZlcnRpY2FsQmFyJzonXFx1MjIyNCcsJ25wYXInOidcXHUyMjI2JywnbnBhcmFsbGVsJzonXFx1MjIyNicsJ25wYXJzbCc6J1xcdTJBRkRcXHUyMEU1JywnbnBhcnQnOidcXHUyMjAyXFx1MDMzOCcsJ25wb2xpbnQnOidcXHUyQTE0JywnbnByJzonXFx1MjI4MCcsJ25wcmN1ZSc6J1xcdTIyRTAnLCducHJlJzonXFx1MkFBRlxcdTAzMzgnLCducHJlYyc6J1xcdTIyODAnLCducHJlY2VxJzonXFx1MkFBRlxcdTAzMzgnLCducmFycic6J1xcdTIxOUInLCduckFycic6J1xcdTIxQ0YnLCducmFycmMnOidcXHUyOTMzXFx1MDMzOCcsJ25yYXJydyc6J1xcdTIxOURcXHUwMzM4JywnbnJpZ2h0YXJyb3cnOidcXHUyMTlCJywnblJpZ2h0YXJyb3cnOidcXHUyMUNGJywnbnJ0cmknOidcXHUyMkVCJywnbnJ0cmllJzonXFx1MjJFRCcsJ25zYyc6J1xcdTIyODEnLCduc2NjdWUnOidcXHUyMkUxJywnbnNjZSc6J1xcdTJBQjBcXHUwMzM4JywnbnNjcic6J1xcdUQ4MzVcXHVEQ0MzJywnTnNjcic6J1xcdUQ4MzVcXHVEQ0E5JywnbnNob3J0bWlkJzonXFx1MjIyNCcsJ25zaG9ydHBhcmFsbGVsJzonXFx1MjIyNicsJ25zaW0nOidcXHUyMjQxJywnbnNpbWUnOidcXHUyMjQ0JywnbnNpbWVxJzonXFx1MjI0NCcsJ25zbWlkJzonXFx1MjIyNCcsJ25zcGFyJzonXFx1MjIyNicsJ25zcXN1YmUnOidcXHUyMkUyJywnbnNxc3VwZSc6J1xcdTIyRTMnLCduc3ViJzonXFx1MjI4NCcsJ25zdWJlJzonXFx1MjI4OCcsJ25zdWJFJzonXFx1MkFDNVxcdTAzMzgnLCduc3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCduc3Vic2V0ZXEnOidcXHUyMjg4JywnbnN1YnNldGVxcSc6J1xcdTJBQzVcXHUwMzM4JywnbnN1Y2MnOidcXHUyMjgxJywnbnN1Y2NlcSc6J1xcdTJBQjBcXHUwMzM4JywnbnN1cCc6J1xcdTIyODUnLCduc3VwZSc6J1xcdTIyODknLCduc3VwRSc6J1xcdTJBQzZcXHUwMzM4JywnbnN1cHNldCc6J1xcdTIyODNcXHUyMEQyJywnbnN1cHNldGVxJzonXFx1MjI4OScsJ25zdXBzZXRlcXEnOidcXHUyQUM2XFx1MDMzOCcsJ250Z2wnOidcXHUyMjc5JywnbnRpbGRlJzonXFx4RjEnLCdOdGlsZGUnOidcXHhEMScsJ250bGcnOidcXHUyMjc4JywnbnRyaWFuZ2xlbGVmdCc6J1xcdTIyRUEnLCdudHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkVDJywnbnRyaWFuZ2xlcmlnaHQnOidcXHUyMkVCJywnbnRyaWFuZ2xlcmlnaHRlcSc6J1xcdTIyRUQnLCdudSc6J1xcdTAzQkQnLCdOdSc6J1xcdTAzOUQnLCdudW0nOicjJywnbnVtZXJvJzonXFx1MjExNicsJ251bXNwJzonXFx1MjAwNycsJ252YXAnOidcXHUyMjREXFx1MjBEMicsJ252ZGFzaCc6J1xcdTIyQUMnLCdudkRhc2gnOidcXHUyMkFEJywnblZkYXNoJzonXFx1MjJBRScsJ25WRGFzaCc6J1xcdTIyQUYnLCdudmdlJzonXFx1MjI2NVxcdTIwRDInLCdudmd0JzonPlxcdTIwRDInLCdudkhhcnInOidcXHUyOTA0JywnbnZpbmZpbic6J1xcdTI5REUnLCdudmxBcnInOidcXHUyOTAyJywnbnZsZSc6J1xcdTIyNjRcXHUyMEQyJywnbnZsdCc6JzxcXHUyMEQyJywnbnZsdHJpZSc6J1xcdTIyQjRcXHUyMEQyJywnbnZyQXJyJzonXFx1MjkwMycsJ252cnRyaWUnOidcXHUyMkI1XFx1MjBEMicsJ252c2ltJzonXFx1MjIzQ1xcdTIwRDInLCdud2FyaGsnOidcXHUyOTIzJywnbndhcnInOidcXHUyMTk2JywnbndBcnInOidcXHUyMUQ2JywnbndhcnJvdyc6J1xcdTIxOTYnLCdud25lYXInOidcXHUyOTI3Jywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29hc3QnOidcXHUyMjlCJywnb2Npcic6J1xcdTIyOUEnLCdvY2lyYyc6J1xceEY0JywnT2NpcmMnOidcXHhENCcsJ29jeSc6J1xcdTA0M0UnLCdPY3knOidcXHUwNDFFJywnb2Rhc2gnOidcXHUyMjlEJywnb2RibGFjJzonXFx1MDE1MScsJ09kYmxhYyc6J1xcdTAxNTAnLCdvZGl2JzonXFx1MkEzOCcsJ29kb3QnOidcXHUyMjk5Jywnb2Rzb2xkJzonXFx1MjlCQycsJ29lbGlnJzonXFx1MDE1MycsJ09FbGlnJzonXFx1MDE1MicsJ29mY2lyJzonXFx1MjlCRicsJ29mcic6J1xcdUQ4MzVcXHVERDJDJywnT2ZyJzonXFx1RDgzNVxcdUREMTInLCdvZ29uJzonXFx1MDJEQicsJ29ncmF2ZSc6J1xceEYyJywnT2dyYXZlJzonXFx4RDInLCdvZ3QnOidcXHUyOUMxJywnb2hiYXInOidcXHUyOUI1Jywnb2htJzonXFx1MDNBOScsJ29pbnQnOidcXHUyMjJFJywnb2xhcnInOidcXHUyMUJBJywnb2xjaXInOidcXHUyOUJFJywnb2xjcm9zcyc6J1xcdTI5QkInLCdvbGluZSc6J1xcdTIwM0UnLCdvbHQnOidcXHUyOUMwJywnb21hY3InOidcXHUwMTREJywnT21hY3InOidcXHUwMTRDJywnb21lZ2EnOidcXHUwM0M5JywnT21lZ2EnOidcXHUwM0E5Jywnb21pY3Jvbic6J1xcdTAzQkYnLCdPbWljcm9uJzonXFx1MDM5RicsJ29taWQnOidcXHUyOUI2Jywnb21pbnVzJzonXFx1MjI5NicsJ29vcGYnOidcXHVEODM1XFx1REQ2MCcsJ09vcGYnOidcXHVEODM1XFx1REQ0NicsJ29wYXInOidcXHUyOUI3JywnT3BlbkN1cmx5RG91YmxlUXVvdGUnOidcXHUyMDFDJywnT3BlbkN1cmx5UXVvdGUnOidcXHUyMDE4Jywnb3BlcnAnOidcXHUyOUI5Jywnb3BsdXMnOidcXHUyMjk1Jywnb3InOidcXHUyMjI4JywnT3InOidcXHUyQTU0Jywnb3JhcnInOidcXHUyMUJCJywnb3JkJzonXFx1MkE1RCcsJ29yZGVyJzonXFx1MjEzNCcsJ29yZGVyb2YnOidcXHUyMTM0Jywnb3JkZic6J1xceEFBJywnb3JkbSc6J1xceEJBJywnb3JpZ29mJzonXFx1MjJCNicsJ29yb3InOidcXHUyQTU2Jywnb3JzbG9wZSc6J1xcdTJBNTcnLCdvcnYnOidcXHUyQTVCJywnb1MnOidcXHUyNEM4Jywnb3Njcic6J1xcdTIxMzQnLCdPc2NyJzonXFx1RDgzNVxcdURDQUEnLCdvc2xhc2gnOidcXHhGOCcsJ09zbGFzaCc6J1xceEQ4Jywnb3NvbCc6J1xcdTIyOTgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3RpbWVzJzonXFx1MjI5NycsJ090aW1lcyc6J1xcdTJBMzcnLCdvdGltZXNhcyc6J1xcdTJBMzYnLCdvdW1sJzonXFx4RjYnLCdPdW1sJzonXFx4RDYnLCdvdmJhcic6J1xcdTIzM0QnLCdPdmVyQmFyJzonXFx1MjAzRScsJ092ZXJCcmFjZSc6J1xcdTIzREUnLCdPdmVyQnJhY2tldCc6J1xcdTIzQjQnLCdPdmVyUGFyZW50aGVzaXMnOidcXHUyM0RDJywncGFyJzonXFx1MjIyNScsJ3BhcmEnOidcXHhCNicsJ3BhcmFsbGVsJzonXFx1MjIyNScsJ3BhcnNpbSc6J1xcdTJBRjMnLCdwYXJzbCc6J1xcdTJBRkQnLCdwYXJ0JzonXFx1MjIwMicsJ1BhcnRpYWxEJzonXFx1MjIwMicsJ3BjeSc6J1xcdTA0M0YnLCdQY3knOidcXHUwNDFGJywncGVyY250JzonJScsJ3BlcmlvZCc6Jy4nLCdwZXJtaWwnOidcXHUyMDMwJywncGVycCc6J1xcdTIyQTUnLCdwZXJ0ZW5rJzonXFx1MjAzMScsJ3Bmcic6J1xcdUQ4MzVcXHVERDJEJywnUGZyJzonXFx1RDgzNVxcdUREMTMnLCdwaGknOidcXHUwM0M2JywnUGhpJzonXFx1MDNBNicsJ3BoaXYnOidcXHUwM0Q1JywncGhtbWF0JzonXFx1MjEzMycsJ3Bob25lJzonXFx1MjYwRScsJ3BpJzonXFx1MDNDMCcsJ1BpJzonXFx1MDNBMCcsJ3BpdGNoZm9yayc6J1xcdTIyRDQnLCdwaXYnOidcXHUwM0Q2JywncGxhbmNrJzonXFx1MjEwRicsJ3BsYW5ja2gnOidcXHUyMTBFJywncGxhbmt2JzonXFx1MjEwRicsJ3BsdXMnOicrJywncGx1c2FjaXInOidcXHUyQTIzJywncGx1c2InOidcXHUyMjlFJywncGx1c2Npcic6J1xcdTJBMjInLCdwbHVzZG8nOidcXHUyMjE0JywncGx1c2R1JzonXFx1MkEyNScsJ3BsdXNlJzonXFx1MkE3MicsJ1BsdXNNaW51cyc6J1xceEIxJywncGx1c21uJzonXFx4QjEnLCdwbHVzc2ltJzonXFx1MkEyNicsJ3BsdXN0d28nOidcXHUyQTI3JywncG0nOidcXHhCMScsJ1BvaW5jYXJlcGxhbmUnOidcXHUyMTBDJywncG9pbnRpbnQnOidcXHUyQTE1JywncG9wZic6J1xcdUQ4MzVcXHVERDYxJywnUG9wZic6J1xcdTIxMTknLCdwb3VuZCc6J1xceEEzJywncHInOidcXHUyMjdBJywnUHInOidcXHUyQUJCJywncHJhcCc6J1xcdTJBQjcnLCdwcmN1ZSc6J1xcdTIyN0MnLCdwcmUnOidcXHUyQUFGJywncHJFJzonXFx1MkFCMycsJ3ByZWMnOidcXHUyMjdBJywncHJlY2FwcHJveCc6J1xcdTJBQjcnLCdwcmVjY3VybHllcSc6J1xcdTIyN0MnLCdQcmVjZWRlcyc6J1xcdTIyN0EnLCdQcmVjZWRlc0VxdWFsJzonXFx1MkFBRicsJ1ByZWNlZGVzU2xhbnRFcXVhbCc6J1xcdTIyN0MnLCdQcmVjZWRlc1RpbGRlJzonXFx1MjI3RScsJ3ByZWNlcSc6J1xcdTJBQUYnLCdwcmVjbmFwcHJveCc6J1xcdTJBQjknLCdwcmVjbmVxcSc6J1xcdTJBQjUnLCdwcmVjbnNpbSc6J1xcdTIyRTgnLCdwcmVjc2ltJzonXFx1MjI3RScsJ3ByaW1lJzonXFx1MjAzMicsJ1ByaW1lJzonXFx1MjAzMycsJ3ByaW1lcyc6J1xcdTIxMTknLCdwcm5hcCc6J1xcdTJBQjknLCdwcm5FJzonXFx1MkFCNScsJ3BybnNpbSc6J1xcdTIyRTgnLCdwcm9kJzonXFx1MjIwRicsJ1Byb2R1Y3QnOidcXHUyMjBGJywncHJvZmFsYXInOidcXHUyMzJFJywncHJvZmxpbmUnOidcXHUyMzEyJywncHJvZnN1cmYnOidcXHUyMzEzJywncHJvcCc6J1xcdTIyMUQnLCdQcm9wb3J0aW9uJzonXFx1MjIzNycsJ1Byb3BvcnRpb25hbCc6J1xcdTIyMUQnLCdwcm9wdG8nOidcXHUyMjFEJywncHJzaW0nOidcXHUyMjdFJywncHJ1cmVsJzonXFx1MjJCMCcsJ3BzY3InOidcXHVEODM1XFx1RENDNScsJ1BzY3InOidcXHVEODM1XFx1RENBQicsJ3BzaSc6J1xcdTAzQzgnLCdQc2knOidcXHUwM0E4JywncHVuY3NwJzonXFx1MjAwOCcsJ3Fmcic6J1xcdUQ4MzVcXHVERDJFJywnUWZyJzonXFx1RDgzNVxcdUREMTQnLCdxaW50JzonXFx1MkEwQycsJ3FvcGYnOidcXHVEODM1XFx1REQ2MicsJ1FvcGYnOidcXHUyMTFBJywncXByaW1lJzonXFx1MjA1NycsJ3FzY3InOidcXHVEODM1XFx1RENDNicsJ1FzY3InOidcXHVEODM1XFx1RENBQycsJ3F1YXRlcm5pb25zJzonXFx1MjEwRCcsJ3F1YXRpbnQnOidcXHUyQTE2JywncXVlc3QnOic/JywncXVlc3RlcSc6J1xcdTIyNUYnLCdxdW90JzonXCInLCdRVU9UJzonXCInLCdyQWFycic6J1xcdTIxREInLCdyYWNlJzonXFx1MjIzRFxcdTAzMzEnLCdyYWN1dGUnOidcXHUwMTU1JywnUmFjdXRlJzonXFx1MDE1NCcsJ3JhZGljJzonXFx1MjIxQScsJ3JhZW1wdHl2JzonXFx1MjlCMycsJ3JhbmcnOidcXHUyN0U5JywnUmFuZyc6J1xcdTI3RUInLCdyYW5nZCc6J1xcdTI5OTInLCdyYW5nZSc6J1xcdTI5QTUnLCdyYW5nbGUnOidcXHUyN0U5JywncmFxdW8nOidcXHhCQicsJ3JhcnInOidcXHUyMTkyJywnckFycic6J1xcdTIxRDInLCdSYXJyJzonXFx1MjFBMCcsJ3JhcnJhcCc6J1xcdTI5NzUnLCdyYXJyYic6J1xcdTIxRTUnLCdyYXJyYmZzJzonXFx1MjkyMCcsJ3JhcnJjJzonXFx1MjkzMycsJ3JhcnJmcyc6J1xcdTI5MUUnLCdyYXJyaGsnOidcXHUyMUFBJywncmFycmxwJzonXFx1MjFBQycsJ3JhcnJwbCc6J1xcdTI5NDUnLCdyYXJyc2ltJzonXFx1Mjk3NCcsJ3JhcnJ0bCc6J1xcdTIxQTMnLCdSYXJydGwnOidcXHUyOTE2JywncmFycncnOidcXHUyMTlEJywncmF0YWlsJzonXFx1MjkxQScsJ3JBdGFpbCc6J1xcdTI5MUMnLCdyYXRpbyc6J1xcdTIyMzYnLCdyYXRpb25hbHMnOidcXHUyMTFBJywncmJhcnInOidcXHUyOTBEJywnckJhcnInOidcXHUyOTBGJywnUkJhcnInOidcXHUyOTEwJywncmJicmsnOidcXHUyNzczJywncmJyYWNlJzonfScsJ3JicmFjayc6J10nLCdyYnJrZSc6J1xcdTI5OEMnLCdyYnJrc2xkJzonXFx1Mjk4RScsJ3JicmtzbHUnOidcXHUyOTkwJywncmNhcm9uJzonXFx1MDE1OScsJ1JjYXJvbic6J1xcdTAxNTgnLCdyY2VkaWwnOidcXHUwMTU3JywnUmNlZGlsJzonXFx1MDE1NicsJ3JjZWlsJzonXFx1MjMwOScsJ3JjdWInOid9JywncmN5JzonXFx1MDQ0MCcsJ1JjeSc6J1xcdTA0MjAnLCdyZGNhJzonXFx1MjkzNycsJ3JkbGRoYXInOidcXHUyOTY5JywncmRxdW8nOidcXHUyMDFEJywncmRxdW9yJzonXFx1MjAxRCcsJ3Jkc2gnOidcXHUyMUIzJywnUmUnOidcXHUyMTFDJywncmVhbCc6J1xcdTIxMUMnLCdyZWFsaW5lJzonXFx1MjExQicsJ3JlYWxwYXJ0JzonXFx1MjExQycsJ3JlYWxzJzonXFx1MjExRCcsJ3JlY3QnOidcXHUyNUFEJywncmVnJzonXFx4QUUnLCdSRUcnOidcXHhBRScsJ1JldmVyc2VFbGVtZW50JzonXFx1MjIwQicsJ1JldmVyc2VFcXVpbGlicml1bSc6J1xcdTIxQ0InLCdSZXZlcnNlVXBFcXVpbGlicml1bSc6J1xcdTI5NkYnLCdyZmlzaHQnOidcXHUyOTdEJywncmZsb29yJzonXFx1MjMwQicsJ3Jmcic6J1xcdUQ4MzVcXHVERDJGJywnUmZyJzonXFx1MjExQycsJ3JIYXInOidcXHUyOTY0JywncmhhcmQnOidcXHUyMUMxJywncmhhcnUnOidcXHUyMUMwJywncmhhcnVsJzonXFx1Mjk2QycsJ3Jobyc6J1xcdTAzQzEnLCdSaG8nOidcXHUwM0ExJywncmhvdic6J1xcdTAzRjEnLCdSaWdodEFuZ2xlQnJhY2tldCc6J1xcdTI3RTknLCdyaWdodGFycm93JzonXFx1MjE5MicsJ1JpZ2h0YXJyb3cnOidcXHUyMUQyJywnUmlnaHRBcnJvdyc6J1xcdTIxOTInLCdSaWdodEFycm93QmFyJzonXFx1MjFFNScsJ1JpZ2h0QXJyb3dMZWZ0QXJyb3cnOidcXHUyMUM0JywncmlnaHRhcnJvd3RhaWwnOidcXHUyMUEzJywnUmlnaHRDZWlsaW5nJzonXFx1MjMwOScsJ1JpZ2h0RG91YmxlQnJhY2tldCc6J1xcdTI3RTcnLCdSaWdodERvd25UZWVWZWN0b3InOidcXHUyOTVEJywnUmlnaHREb3duVmVjdG9yJzonXFx1MjFDMicsJ1JpZ2h0RG93blZlY3RvckJhcic6J1xcdTI5NTUnLCdSaWdodEZsb29yJzonXFx1MjMwQicsJ3JpZ2h0aGFycG9vbmRvd24nOidcXHUyMUMxJywncmlnaHRoYXJwb29udXAnOidcXHUyMUMwJywncmlnaHRsZWZ0YXJyb3dzJzonXFx1MjFDNCcsJ3JpZ2h0bGVmdGhhcnBvb25zJzonXFx1MjFDQycsJ3JpZ2h0cmlnaHRhcnJvd3MnOidcXHUyMUM5JywncmlnaHRzcXVpZ2Fycm93JzonXFx1MjE5RCcsJ1JpZ2h0VGVlJzonXFx1MjJBMicsJ1JpZ2h0VGVlQXJyb3cnOidcXHUyMUE2JywnUmlnaHRUZWVWZWN0b3InOidcXHUyOTVCJywncmlnaHR0aHJlZXRpbWVzJzonXFx1MjJDQycsJ1JpZ2h0VHJpYW5nbGUnOidcXHUyMkIzJywnUmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDAnLCdSaWdodFRyaWFuZ2xlRXF1YWwnOidcXHUyMkI1JywnUmlnaHRVcERvd25WZWN0b3InOidcXHUyOTRGJywnUmlnaHRVcFRlZVZlY3Rvcic6J1xcdTI5NUMnLCdSaWdodFVwVmVjdG9yJzonXFx1MjFCRScsJ1JpZ2h0VXBWZWN0b3JCYXInOidcXHUyOTU0JywnUmlnaHRWZWN0b3InOidcXHUyMUMwJywnUmlnaHRWZWN0b3JCYXInOidcXHUyOTUzJywncmluZyc6J1xcdTAyREEnLCdyaXNpbmdkb3RzZXEnOidcXHUyMjUzJywncmxhcnInOidcXHUyMUM0JywncmxoYXInOidcXHUyMUNDJywncmxtJzonXFx1MjAwRicsJ3Jtb3VzdCc6J1xcdTIzQjEnLCdybW91c3RhY2hlJzonXFx1MjNCMScsJ3JubWlkJzonXFx1MkFFRScsJ3JvYW5nJzonXFx1MjdFRCcsJ3JvYXJyJzonXFx1MjFGRScsJ3JvYnJrJzonXFx1MjdFNycsJ3JvcGFyJzonXFx1Mjk4NicsJ3JvcGYnOidcXHVEODM1XFx1REQ2MycsJ1JvcGYnOidcXHUyMTFEJywncm9wbHVzJzonXFx1MkEyRScsJ3JvdGltZXMnOidcXHUyQTM1JywnUm91bmRJbXBsaWVzJzonXFx1Mjk3MCcsJ3JwYXInOicpJywncnBhcmd0JzonXFx1Mjk5NCcsJ3JwcG9saW50JzonXFx1MkExMicsJ3JyYXJyJzonXFx1MjFDOScsJ1JyaWdodGFycm93JzonXFx1MjFEQicsJ3JzYXF1byc6J1xcdTIwM0EnLCdyc2NyJzonXFx1RDgzNVxcdURDQzcnLCdSc2NyJzonXFx1MjExQicsJ3JzaCc6J1xcdTIxQjEnLCdSc2gnOidcXHUyMUIxJywncnNxYic6J10nLCdyc3F1byc6J1xcdTIwMTknLCdyc3F1b3InOidcXHUyMDE5JywncnRocmVlJzonXFx1MjJDQycsJ3J0aW1lcyc6J1xcdTIyQ0EnLCdydHJpJzonXFx1MjVCOScsJ3J0cmllJzonXFx1MjJCNScsJ3J0cmlmJzonXFx1MjVCOCcsJ3J0cmlsdHJpJzonXFx1MjlDRScsJ1J1bGVEZWxheWVkJzonXFx1MjlGNCcsJ3J1bHVoYXInOidcXHUyOTY4JywncngnOidcXHUyMTFFJywnc2FjdXRlJzonXFx1MDE1QicsJ1NhY3V0ZSc6J1xcdTAxNUEnLCdzYnF1byc6J1xcdTIwMUEnLCdzYyc6J1xcdTIyN0InLCdTYyc6J1xcdTJBQkMnLCdzY2FwJzonXFx1MkFCOCcsJ3NjYXJvbic6J1xcdTAxNjEnLCdTY2Fyb24nOidcXHUwMTYwJywnc2NjdWUnOidcXHUyMjdEJywnc2NlJzonXFx1MkFCMCcsJ3NjRSc6J1xcdTJBQjQnLCdzY2VkaWwnOidcXHUwMTVGJywnU2NlZGlsJzonXFx1MDE1RScsJ3NjaXJjJzonXFx1MDE1RCcsJ1NjaXJjJzonXFx1MDE1QycsJ3NjbmFwJzonXFx1MkFCQScsJ3NjbkUnOidcXHUyQUI2Jywnc2Nuc2ltJzonXFx1MjJFOScsJ3NjcG9saW50JzonXFx1MkExMycsJ3Njc2ltJzonXFx1MjI3RicsJ3NjeSc6J1xcdTA0NDEnLCdTY3knOidcXHUwNDIxJywnc2RvdCc6J1xcdTIyQzUnLCdzZG90Yic6J1xcdTIyQTEnLCdzZG90ZSc6J1xcdTJBNjYnLCdzZWFyaGsnOidcXHUyOTI1Jywnc2VhcnInOidcXHUyMTk4Jywnc2VBcnInOidcXHUyMUQ4Jywnc2VhcnJvdyc6J1xcdTIxOTgnLCdzZWN0JzonXFx4QTcnLCdzZW1pJzonOycsJ3Nlc3dhcic6J1xcdTI5MjknLCdzZXRtaW51cyc6J1xcdTIyMTYnLCdzZXRtbic6J1xcdTIyMTYnLCdzZXh0JzonXFx1MjczNicsJ3Nmcic6J1xcdUQ4MzVcXHVERDMwJywnU2ZyJzonXFx1RDgzNVxcdUREMTYnLCdzZnJvd24nOidcXHUyMzIyJywnc2hhcnAnOidcXHUyNjZGJywnc2hjaGN5JzonXFx1MDQ0OScsJ1NIQ0hjeSc6J1xcdTA0MjknLCdzaGN5JzonXFx1MDQ0OCcsJ1NIY3knOidcXHUwNDI4JywnU2hvcnREb3duQXJyb3cnOidcXHUyMTkzJywnU2hvcnRMZWZ0QXJyb3cnOidcXHUyMTkwJywnc2hvcnRtaWQnOidcXHUyMjIzJywnc2hvcnRwYXJhbGxlbCc6J1xcdTIyMjUnLCdTaG9ydFJpZ2h0QXJyb3cnOidcXHUyMTkyJywnU2hvcnRVcEFycm93JzonXFx1MjE5MScsJ3NoeSc6J1xceEFEJywnc2lnbWEnOidcXHUwM0MzJywnU2lnbWEnOidcXHUwM0EzJywnc2lnbWFmJzonXFx1MDNDMicsJ3NpZ21hdic6J1xcdTAzQzInLCdzaW0nOidcXHUyMjNDJywnc2ltZG90JzonXFx1MkE2QScsJ3NpbWUnOidcXHUyMjQzJywnc2ltZXEnOidcXHUyMjQzJywnc2ltZyc6J1xcdTJBOUUnLCdzaW1nRSc6J1xcdTJBQTAnLCdzaW1sJzonXFx1MkE5RCcsJ3NpbWxFJzonXFx1MkE5RicsJ3NpbW5lJzonXFx1MjI0NicsJ3NpbXBsdXMnOidcXHUyQTI0Jywnc2ltcmFycic6J1xcdTI5NzInLCdzbGFycic6J1xcdTIxOTAnLCdTbWFsbENpcmNsZSc6J1xcdTIyMTgnLCdzbWFsbHNldG1pbnVzJzonXFx1MjIxNicsJ3NtYXNocCc6J1xcdTJBMzMnLCdzbWVwYXJzbCc6J1xcdTI5RTQnLCdzbWlkJzonXFx1MjIyMycsJ3NtaWxlJzonXFx1MjMyMycsJ3NtdCc6J1xcdTJBQUEnLCdzbXRlJzonXFx1MkFBQycsJ3NtdGVzJzonXFx1MkFBQ1xcdUZFMDAnLCdzb2Z0Y3knOidcXHUwNDRDJywnU09GVGN5JzonXFx1MDQyQycsJ3NvbCc6Jy8nLCdzb2xiJzonXFx1MjlDNCcsJ3NvbGJhcic6J1xcdTIzM0YnLCdzb3BmJzonXFx1RDgzNVxcdURENjQnLCdTb3BmJzonXFx1RDgzNVxcdURENEEnLCdzcGFkZXMnOidcXHUyNjYwJywnc3BhZGVzdWl0JzonXFx1MjY2MCcsJ3NwYXInOidcXHUyMjI1Jywnc3FjYXAnOidcXHUyMjkzJywnc3FjYXBzJzonXFx1MjI5M1xcdUZFMDAnLCdzcWN1cCc6J1xcdTIyOTQnLCdzcWN1cHMnOidcXHUyMjk0XFx1RkUwMCcsJ1NxcnQnOidcXHUyMjFBJywnc3FzdWInOidcXHUyMjhGJywnc3FzdWJlJzonXFx1MjI5MScsJ3Nxc3Vic2V0JzonXFx1MjI4RicsJ3Nxc3Vic2V0ZXEnOidcXHUyMjkxJywnc3FzdXAnOidcXHUyMjkwJywnc3FzdXBlJzonXFx1MjI5MicsJ3Nxc3Vwc2V0JzonXFx1MjI5MCcsJ3Nxc3Vwc2V0ZXEnOidcXHUyMjkyJywnc3F1JzonXFx1MjVBMScsJ3NxdWFyZSc6J1xcdTI1QTEnLCdTcXVhcmUnOidcXHUyNUExJywnU3F1YXJlSW50ZXJzZWN0aW9uJzonXFx1MjI5MycsJ1NxdWFyZVN1YnNldCc6J1xcdTIyOEYnLCdTcXVhcmVTdWJzZXRFcXVhbCc6J1xcdTIyOTEnLCdTcXVhcmVTdXBlcnNldCc6J1xcdTIyOTAnLCdTcXVhcmVTdXBlcnNldEVxdWFsJzonXFx1MjI5MicsJ1NxdWFyZVVuaW9uJzonXFx1MjI5NCcsJ3NxdWFyZic6J1xcdTI1QUEnLCdzcXVmJzonXFx1MjVBQScsJ3NyYXJyJzonXFx1MjE5MicsJ3NzY3InOidcXHVEODM1XFx1RENDOCcsJ1NzY3InOidcXHVEODM1XFx1RENBRScsJ3NzZXRtbic6J1xcdTIyMTYnLCdzc21pbGUnOidcXHUyMzIzJywnc3N0YXJmJzonXFx1MjJDNicsJ3N0YXInOidcXHUyNjA2JywnU3Rhcic6J1xcdTIyQzYnLCdzdGFyZic6J1xcdTI2MDUnLCdzdHJhaWdodGVwc2lsb24nOidcXHUwM0Y1Jywnc3RyYWlnaHRwaGknOidcXHUwM0Q1Jywnc3RybnMnOidcXHhBRicsJ3N1Yic6J1xcdTIyODInLCdTdWInOidcXHUyMkQwJywnc3ViZG90JzonXFx1MkFCRCcsJ3N1YmUnOidcXHUyMjg2Jywnc3ViRSc6J1xcdTJBQzUnLCdzdWJlZG90JzonXFx1MkFDMycsJ3N1Ym11bHQnOidcXHUyQUMxJywnc3VibmUnOidcXHUyMjhBJywnc3VibkUnOidcXHUyQUNCJywnc3VicGx1cyc6J1xcdTJBQkYnLCdzdWJyYXJyJzonXFx1Mjk3OScsJ3N1YnNldCc6J1xcdTIyODInLCdTdWJzZXQnOidcXHUyMkQwJywnc3Vic2V0ZXEnOidcXHUyMjg2Jywnc3Vic2V0ZXFxJzonXFx1MkFDNScsJ1N1YnNldEVxdWFsJzonXFx1MjI4NicsJ3N1YnNldG5lcSc6J1xcdTIyOEEnLCdzdWJzZXRuZXFxJzonXFx1MkFDQicsJ3N1YnNpbSc6J1xcdTJBQzcnLCdzdWJzdWInOidcXHUyQUQ1Jywnc3Vic3VwJzonXFx1MkFEMycsJ3N1Y2MnOidcXHUyMjdCJywnc3VjY2FwcHJveCc6J1xcdTJBQjgnLCdzdWNjY3VybHllcSc6J1xcdTIyN0QnLCdTdWNjZWVkcyc6J1xcdTIyN0InLCdTdWNjZWVkc0VxdWFsJzonXFx1MkFCMCcsJ1N1Y2NlZWRzU2xhbnRFcXVhbCc6J1xcdTIyN0QnLCdTdWNjZWVkc1RpbGRlJzonXFx1MjI3RicsJ3N1Y2NlcSc6J1xcdTJBQjAnLCdzdWNjbmFwcHJveCc6J1xcdTJBQkEnLCdzdWNjbmVxcSc6J1xcdTJBQjYnLCdzdWNjbnNpbSc6J1xcdTIyRTknLCdzdWNjc2ltJzonXFx1MjI3RicsJ1N1Y2hUaGF0JzonXFx1MjIwQicsJ3N1bSc6J1xcdTIyMTEnLCdTdW0nOidcXHUyMjExJywnc3VuZyc6J1xcdTI2NkEnLCdzdXAnOidcXHUyMjgzJywnU3VwJzonXFx1MjJEMScsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N1cGRvdCc6J1xcdTJBQkUnLCdzdXBkc3ViJzonXFx1MkFEOCcsJ3N1cGUnOidcXHUyMjg3Jywnc3VwRSc6J1xcdTJBQzYnLCdzdXBlZG90JzonXFx1MkFDNCcsJ1N1cGVyc2V0JzonXFx1MjI4MycsJ1N1cGVyc2V0RXF1YWwnOidcXHUyMjg3Jywnc3VwaHNvbCc6J1xcdTI3QzknLCdzdXBoc3ViJzonXFx1MkFENycsJ3N1cGxhcnInOidcXHUyOTdCJywnc3VwbXVsdCc6J1xcdTJBQzInLCdzdXBuZSc6J1xcdTIyOEInLCdzdXBuRSc6J1xcdTJBQ0MnLCdzdXBwbHVzJzonXFx1MkFDMCcsJ3N1cHNldCc6J1xcdTIyODMnLCdTdXBzZXQnOidcXHUyMkQxJywnc3Vwc2V0ZXEnOidcXHUyMjg3Jywnc3Vwc2V0ZXFxJzonXFx1MkFDNicsJ3N1cHNldG5lcSc6J1xcdTIyOEInLCdzdXBzZXRuZXFxJzonXFx1MkFDQycsJ3N1cHNpbSc6J1xcdTJBQzgnLCdzdXBzdWInOidcXHUyQUQ0Jywnc3Vwc3VwJzonXFx1MkFENicsJ3N3YXJoayc6J1xcdTI5MjYnLCdzd2Fycic6J1xcdTIxOTknLCdzd0Fycic6J1xcdTIxRDknLCdzd2Fycm93JzonXFx1MjE5OScsJ3N3bndhcic6J1xcdTI5MkEnLCdzemxpZyc6J1xceERGJywnVGFiJzonXFx0JywndGFyZ2V0JzonXFx1MjMxNicsJ3RhdSc6J1xcdTAzQzQnLCdUYXUnOidcXHUwM0E0JywndGJyayc6J1xcdTIzQjQnLCd0Y2Fyb24nOidcXHUwMTY1JywnVGNhcm9uJzonXFx1MDE2NCcsJ3RjZWRpbCc6J1xcdTAxNjMnLCdUY2VkaWwnOidcXHUwMTYyJywndGN5JzonXFx1MDQ0MicsJ1RjeSc6J1xcdTA0MjInLCd0ZG90JzonXFx1MjBEQicsJ3RlbHJlYyc6J1xcdTIzMTUnLCd0ZnInOidcXHVEODM1XFx1REQzMScsJ1Rmcic6J1xcdUQ4MzVcXHVERDE3JywndGhlcmU0JzonXFx1MjIzNCcsJ3RoZXJlZm9yZSc6J1xcdTIyMzQnLCdUaGVyZWZvcmUnOidcXHUyMjM0JywndGhldGEnOidcXHUwM0I4JywnVGhldGEnOidcXHUwMzk4JywndGhldGFzeW0nOidcXHUwM0QxJywndGhldGF2JzonXFx1MDNEMScsJ3RoaWNrYXBwcm94JzonXFx1MjI0OCcsJ3RoaWNrc2ltJzonXFx1MjIzQycsJ1RoaWNrU3BhY2UnOidcXHUyMDVGXFx1MjAwQScsJ3RoaW5zcCc6J1xcdTIwMDknLCdUaGluU3BhY2UnOidcXHUyMDA5JywndGhrYXAnOidcXHUyMjQ4JywndGhrc2ltJzonXFx1MjIzQycsJ3Rob3JuJzonXFx4RkUnLCdUSE9STic6J1xceERFJywndGlsZGUnOidcXHUwMkRDJywnVGlsZGUnOidcXHUyMjNDJywnVGlsZGVFcXVhbCc6J1xcdTIyNDMnLCdUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDUnLCdUaWxkZVRpbGRlJzonXFx1MjI0OCcsJ3RpbWVzJzonXFx4RDcnLCd0aW1lc2InOidcXHUyMkEwJywndGltZXNiYXInOidcXHUyQTMxJywndGltZXNkJzonXFx1MkEzMCcsJ3RpbnQnOidcXHUyMjJEJywndG9lYSc6J1xcdTI5MjgnLCd0b3AnOidcXHUyMkE0JywndG9wYm90JzonXFx1MjMzNicsJ3RvcGNpcic6J1xcdTJBRjEnLCd0b3BmJzonXFx1RDgzNVxcdURENjUnLCdUb3BmJzonXFx1RDgzNVxcdURENEInLCd0b3Bmb3JrJzonXFx1MkFEQScsJ3Rvc2EnOidcXHUyOTI5JywndHByaW1lJzonXFx1MjAzNCcsJ3RyYWRlJzonXFx1MjEyMicsJ1RSQURFJzonXFx1MjEyMicsJ3RyaWFuZ2xlJzonXFx1MjVCNScsJ3RyaWFuZ2xlZG93bic6J1xcdTI1QkYnLCd0cmlhbmdsZWxlZnQnOidcXHUyNUMzJywndHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkI0JywndHJpYW5nbGVxJzonXFx1MjI1QycsJ3RyaWFuZ2xlcmlnaHQnOidcXHUyNUI5JywndHJpYW5nbGVyaWdodGVxJzonXFx1MjJCNScsJ3RyaWRvdCc6J1xcdTI1RUMnLCd0cmllJzonXFx1MjI1QycsJ3RyaW1pbnVzJzonXFx1MkEzQScsJ1RyaXBsZURvdCc6J1xcdTIwREInLCd0cmlwbHVzJzonXFx1MkEzOScsJ3RyaXNiJzonXFx1MjlDRCcsJ3RyaXRpbWUnOidcXHUyQTNCJywndHJwZXppdW0nOidcXHUyM0UyJywndHNjcic6J1xcdUQ4MzVcXHVEQ0M5JywnVHNjcic6J1xcdUQ4MzVcXHVEQ0FGJywndHNjeSc6J1xcdTA0NDYnLCdUU2N5JzonXFx1MDQyNicsJ3RzaGN5JzonXFx1MDQ1QicsJ1RTSGN5JzonXFx1MDQwQicsJ3RzdHJvayc6J1xcdTAxNjcnLCdUc3Ryb2snOidcXHUwMTY2JywndHdpeHQnOidcXHUyMjZDJywndHdvaGVhZGxlZnRhcnJvdyc6J1xcdTIxOUUnLCd0d29oZWFkcmlnaHRhcnJvdyc6J1xcdTIxQTAnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWFycic6J1xcdTIxOTEnLCd1QXJyJzonXFx1MjFEMScsJ1VhcnInOidcXHUyMTlGJywnVWFycm9jaXInOidcXHUyOTQ5JywndWJyY3knOidcXHUwNDVFJywnVWJyY3knOidcXHUwNDBFJywndWJyZXZlJzonXFx1MDE2RCcsJ1VicmV2ZSc6J1xcdTAxNkMnLCd1Y2lyYyc6J1xceEZCJywnVWNpcmMnOidcXHhEQicsJ3VjeSc6J1xcdTA0NDMnLCdVY3knOidcXHUwNDIzJywndWRhcnInOidcXHUyMUM1JywndWRibGFjJzonXFx1MDE3MScsJ1VkYmxhYyc6J1xcdTAxNzAnLCd1ZGhhcic6J1xcdTI5NkUnLCd1ZmlzaHQnOidcXHUyOTdFJywndWZyJzonXFx1RDgzNVxcdUREMzInLCdVZnInOidcXHVEODM1XFx1REQxOCcsJ3VncmF2ZSc6J1xceEY5JywnVWdyYXZlJzonXFx4RDknLCd1SGFyJzonXFx1Mjk2MycsJ3VoYXJsJzonXFx1MjFCRicsJ3VoYXJyJzonXFx1MjFCRScsJ3VoYmxrJzonXFx1MjU4MCcsJ3VsY29ybic6J1xcdTIzMUMnLCd1bGNvcm5lcic6J1xcdTIzMUMnLCd1bGNyb3AnOidcXHUyMzBGJywndWx0cmknOidcXHUyNUY4JywndW1hY3InOidcXHUwMTZCJywnVW1hY3InOidcXHUwMTZBJywndW1sJzonXFx4QTgnLCdVbmRlckJhcic6J18nLCdVbmRlckJyYWNlJzonXFx1MjNERicsJ1VuZGVyQnJhY2tldCc6J1xcdTIzQjUnLCdVbmRlclBhcmVudGhlc2lzJzonXFx1MjNERCcsJ1VuaW9uJzonXFx1MjJDMycsJ1VuaW9uUGx1cyc6J1xcdTIyOEUnLCd1b2dvbic6J1xcdTAxNzMnLCdVb2dvbic6J1xcdTAxNzInLCd1b3BmJzonXFx1RDgzNVxcdURENjYnLCdVb3BmJzonXFx1RDgzNVxcdURENEMnLCd1cGFycm93JzonXFx1MjE5MScsJ1VwYXJyb3cnOidcXHUyMUQxJywnVXBBcnJvdyc6J1xcdTIxOTEnLCdVcEFycm93QmFyJzonXFx1MjkxMicsJ1VwQXJyb3dEb3duQXJyb3cnOidcXHUyMUM1JywndXBkb3duYXJyb3cnOidcXHUyMTk1JywnVXBkb3duYXJyb3cnOidcXHUyMUQ1JywnVXBEb3duQXJyb3cnOidcXHUyMTk1JywnVXBFcXVpbGlicml1bSc6J1xcdTI5NkUnLCd1cGhhcnBvb25sZWZ0JzonXFx1MjFCRicsJ3VwaGFycG9vbnJpZ2h0JzonXFx1MjFCRScsJ3VwbHVzJzonXFx1MjI4RScsJ1VwcGVyTGVmdEFycm93JzonXFx1MjE5NicsJ1VwcGVyUmlnaHRBcnJvdyc6J1xcdTIxOTcnLCd1cHNpJzonXFx1MDNDNScsJ1Vwc2knOidcXHUwM0QyJywndXBzaWgnOidcXHUwM0QyJywndXBzaWxvbic6J1xcdTAzQzUnLCdVcHNpbG9uJzonXFx1MDNBNScsJ1VwVGVlJzonXFx1MjJBNScsJ1VwVGVlQXJyb3cnOidcXHUyMUE1JywndXB1cGFycm93cyc6J1xcdTIxQzgnLCd1cmNvcm4nOidcXHUyMzFEJywndXJjb3JuZXInOidcXHUyMzFEJywndXJjcm9wJzonXFx1MjMwRScsJ3VyaW5nJzonXFx1MDE2RicsJ1VyaW5nJzonXFx1MDE2RScsJ3VydHJpJzonXFx1MjVGOScsJ3VzY3InOidcXHVEODM1XFx1RENDQScsJ1VzY3InOidcXHVEODM1XFx1RENCMCcsJ3V0ZG90JzonXFx1MjJGMCcsJ3V0aWxkZSc6J1xcdTAxNjknLCdVdGlsZGUnOidcXHUwMTY4JywndXRyaSc6J1xcdTI1QjUnLCd1dHJpZic6J1xcdTI1QjQnLCd1dWFycic6J1xcdTIxQzgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd1d2FuZ2xlJzonXFx1MjlBNycsJ3ZhbmdydCc6J1xcdTI5OUMnLCd2YXJlcHNpbG9uJzonXFx1MDNGNScsJ3ZhcmthcHBhJzonXFx1MDNGMCcsJ3Zhcm5vdGhpbmcnOidcXHUyMjA1JywndmFycGhpJzonXFx1MDNENScsJ3ZhcnBpJzonXFx1MDNENicsJ3ZhcnByb3B0byc6J1xcdTIyMUQnLCd2YXJyJzonXFx1MjE5NScsJ3ZBcnInOidcXHUyMUQ1JywndmFycmhvJzonXFx1MDNGMScsJ3ZhcnNpZ21hJzonXFx1MDNDMicsJ3ZhcnN1YnNldG5lcSc6J1xcdTIyOEFcXHVGRTAwJywndmFyc3Vic2V0bmVxcSc6J1xcdTJBQ0JcXHVGRTAwJywndmFyc3Vwc2V0bmVxJzonXFx1MjI4QlxcdUZFMDAnLCd2YXJzdXBzZXRuZXFxJzonXFx1MkFDQ1xcdUZFMDAnLCd2YXJ0aGV0YSc6J1xcdTAzRDEnLCd2YXJ0cmlhbmdsZWxlZnQnOidcXHUyMkIyJywndmFydHJpYW5nbGVyaWdodCc6J1xcdTIyQjMnLCd2QmFyJzonXFx1MkFFOCcsJ1ZiYXInOidcXHUyQUVCJywndkJhcnYnOidcXHUyQUU5JywndmN5JzonXFx1MDQzMicsJ1ZjeSc6J1xcdTA0MTInLCd2ZGFzaCc6J1xcdTIyQTInLCd2RGFzaCc6J1xcdTIyQTgnLCdWZGFzaCc6J1xcdTIyQTknLCdWRGFzaCc6J1xcdTIyQUInLCdWZGFzaGwnOidcXHUyQUU2JywndmVlJzonXFx1MjIyOCcsJ1ZlZSc6J1xcdTIyQzEnLCd2ZWViYXInOidcXHUyMkJCJywndmVlZXEnOidcXHUyMjVBJywndmVsbGlwJzonXFx1MjJFRScsJ3ZlcmJhcic6J3wnLCdWZXJiYXInOidcXHUyMDE2JywndmVydCc6J3wnLCdWZXJ0JzonXFx1MjAxNicsJ1ZlcnRpY2FsQmFyJzonXFx1MjIyMycsJ1ZlcnRpY2FsTGluZSc6J3wnLCdWZXJ0aWNhbFNlcGFyYXRvcic6J1xcdTI3NTgnLCdWZXJ0aWNhbFRpbGRlJzonXFx1MjI0MCcsJ1ZlcnlUaGluU3BhY2UnOidcXHUyMDBBJywndmZyJzonXFx1RDgzNVxcdUREMzMnLCdWZnInOidcXHVEODM1XFx1REQxOScsJ3ZsdHJpJzonXFx1MjJCMicsJ3Zuc3ViJzonXFx1MjI4MlxcdTIwRDInLCd2bnN1cCc6J1xcdTIyODNcXHUyMEQyJywndm9wZic6J1xcdUQ4MzVcXHVERDY3JywnVm9wZic6J1xcdUQ4MzVcXHVERDREJywndnByb3AnOidcXHUyMjFEJywndnJ0cmknOidcXHUyMkIzJywndnNjcic6J1xcdUQ4MzVcXHVEQ0NCJywnVnNjcic6J1xcdUQ4MzVcXHVEQ0IxJywndnN1Ym5lJzonXFx1MjI4QVxcdUZFMDAnLCd2c3VibkUnOidcXHUyQUNCXFx1RkUwMCcsJ3ZzdXBuZSc6J1xcdTIyOEJcXHVGRTAwJywndnN1cG5FJzonXFx1MkFDQ1xcdUZFMDAnLCdWdmRhc2gnOidcXHUyMkFBJywndnppZ3phZyc6J1xcdTI5OUEnLCd3Y2lyYyc6J1xcdTAxNzUnLCdXY2lyYyc6J1xcdTAxNzQnLCd3ZWRiYXInOidcXHUyQTVGJywnd2VkZ2UnOidcXHUyMjI3JywnV2VkZ2UnOidcXHUyMkMwJywnd2VkZ2VxJzonXFx1MjI1OScsJ3dlaWVycCc6J1xcdTIxMTgnLCd3ZnInOidcXHVEODM1XFx1REQzNCcsJ1dmcic6J1xcdUQ4MzVcXHVERDFBJywnd29wZic6J1xcdUQ4MzVcXHVERDY4JywnV29wZic6J1xcdUQ4MzVcXHVERDRFJywnd3AnOidcXHUyMTE4Jywnd3InOidcXHUyMjQwJywnd3JlYXRoJzonXFx1MjI0MCcsJ3dzY3InOidcXHVEODM1XFx1RENDQycsJ1dzY3InOidcXHVEODM1XFx1RENCMicsJ3hjYXAnOidcXHUyMkMyJywneGNpcmMnOidcXHUyNUVGJywneGN1cCc6J1xcdTIyQzMnLCd4ZHRyaSc6J1xcdTI1QkQnLCd4ZnInOidcXHVEODM1XFx1REQzNScsJ1hmcic6J1xcdUQ4MzVcXHVERDFCJywneGhhcnInOidcXHUyN0Y3JywneGhBcnInOidcXHUyN0ZBJywneGknOidcXHUwM0JFJywnWGknOidcXHUwMzlFJywneGxhcnInOidcXHUyN0Y1JywneGxBcnInOidcXHUyN0Y4JywneG1hcCc6J1xcdTI3RkMnLCd4bmlzJzonXFx1MjJGQicsJ3hvZG90JzonXFx1MkEwMCcsJ3hvcGYnOidcXHVEODM1XFx1REQ2OScsJ1hvcGYnOidcXHVEODM1XFx1REQ0RicsJ3hvcGx1cyc6J1xcdTJBMDEnLCd4b3RpbWUnOidcXHUyQTAyJywneHJhcnInOidcXHUyN0Y2JywneHJBcnInOidcXHUyN0Y5JywneHNjcic6J1xcdUQ4MzVcXHVEQ0NEJywnWHNjcic6J1xcdUQ4MzVcXHVEQ0IzJywneHNxY3VwJzonXFx1MkEwNicsJ3h1cGx1cyc6J1xcdTJBMDQnLCd4dXRyaSc6J1xcdTI1QjMnLCd4dmVlJzonXFx1MjJDMScsJ3h3ZWRnZSc6J1xcdTIyQzAnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWFjeSc6J1xcdTA0NEYnLCdZQWN5JzonXFx1MDQyRicsJ3ljaXJjJzonXFx1MDE3NycsJ1ljaXJjJzonXFx1MDE3NicsJ3ljeSc6J1xcdTA0NEInLCdZY3knOidcXHUwNDJCJywneWVuJzonXFx4QTUnLCd5ZnInOidcXHVEODM1XFx1REQzNicsJ1lmcic6J1xcdUQ4MzVcXHVERDFDJywneWljeSc6J1xcdTA0NTcnLCdZSWN5JzonXFx1MDQwNycsJ3lvcGYnOidcXHVEODM1XFx1REQ2QScsJ1lvcGYnOidcXHVEODM1XFx1REQ1MCcsJ3lzY3InOidcXHVEODM1XFx1RENDRScsJ1lzY3InOidcXHVEODM1XFx1RENCNCcsJ3l1Y3knOidcXHUwNDRFJywnWVVjeSc6J1xcdTA0MkUnLCd5dW1sJzonXFx4RkYnLCdZdW1sJzonXFx1MDE3OCcsJ3phY3V0ZSc6J1xcdTAxN0EnLCdaYWN1dGUnOidcXHUwMTc5JywnemNhcm9uJzonXFx1MDE3RScsJ1pjYXJvbic6J1xcdTAxN0QnLCd6Y3knOidcXHUwNDM3JywnWmN5JzonXFx1MDQxNycsJ3pkb3QnOidcXHUwMTdDJywnWmRvdCc6J1xcdTAxN0InLCd6ZWV0cmYnOidcXHUyMTI4JywnWmVyb1dpZHRoU3BhY2UnOidcXHUyMDBCJywnemV0YSc6J1xcdTAzQjYnLCdaZXRhJzonXFx1MDM5NicsJ3pmcic6J1xcdUQ4MzVcXHVERDM3JywnWmZyJzonXFx1MjEyOCcsJ3poY3knOidcXHUwNDM2JywnWkhjeSc6J1xcdTA0MTYnLCd6aWdyYXJyJzonXFx1MjFERCcsJ3pvcGYnOidcXHVEODM1XFx1REQ2QicsJ1pvcGYnOidcXHUyMTI0JywnenNjcic6J1xcdUQ4MzVcXHVEQ0NGJywnWnNjcic6J1xcdUQ4MzVcXHVEQ0I1JywnendqJzonXFx1MjAwRCcsJ3p3bmonOidcXHUyMDBDJ307XG5cdHZhciBkZWNvZGVNYXBMZWdhY3kgPSB7J2FhY3V0ZSc6J1xceEUxJywnQWFjdXRlJzonXFx4QzEnLCdhY2lyYyc6J1xceEUyJywnQWNpcmMnOidcXHhDMicsJ2FjdXRlJzonXFx4QjQnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FncmF2ZSc6J1xceEUwJywnQWdyYXZlJzonXFx4QzAnLCdhbXAnOicmJywnQU1QJzonJicsJ2FyaW5nJzonXFx4RTUnLCdBcmluZyc6J1xceEM1JywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2JydmJhcic6J1xceEE2JywnY2NlZGlsJzonXFx4RTcnLCdDY2VkaWwnOidcXHhDNycsJ2NlZGlsJzonXFx4QjgnLCdjZW50JzonXFx4QTInLCdjb3B5JzonXFx4QTknLCdDT1BZJzonXFx4QTknLCdjdXJyZW4nOidcXHhBNCcsJ2RlZyc6J1xceEIwJywnZGl2aWRlJzonXFx4RjcnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWNpcmMnOidcXHhFQScsJ0VjaXJjJzonXFx4Q0EnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzE0JzonXFx4QkMnLCdmcmFjMzQnOidcXHhCRScsJ2d0JzonPicsJ0dUJzonPicsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2lleGNsJzonXFx4QTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaXF1ZXN0JzonXFx4QkYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdsYXF1byc6J1xceEFCJywnbHQnOic8JywnTFQnOic8JywnbWFjcic6J1xceEFGJywnbWljcm8nOidcXHhCNScsJ21pZGRvdCc6J1xceEI3JywnbmJzcCc6J1xceEEwJywnbm90JzonXFx4QUMnLCdudGlsZGUnOidcXHhGMScsJ050aWxkZSc6J1xceEQxJywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29jaXJjJzonXFx4RjQnLCdPY2lyYyc6J1xceEQ0Jywnb2dyYXZlJzonXFx4RjInLCdPZ3JhdmUnOidcXHhEMicsJ29yZGYnOidcXHhBQScsJ29yZG0nOidcXHhCQScsJ29zbGFzaCc6J1xceEY4JywnT3NsYXNoJzonXFx4RDgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3VtbCc6J1xceEY2JywnT3VtbCc6J1xceEQ2JywncGFyYSc6J1xceEI2JywncGx1c21uJzonXFx4QjEnLCdwb3VuZCc6J1xceEEzJywncXVvdCc6J1wiJywnUVVPVCc6J1wiJywncmFxdW8nOidcXHhCQicsJ3JlZyc6J1xceEFFJywnUkVHJzonXFx4QUUnLCdzZWN0JzonXFx4QTcnLCdzaHknOidcXHhBRCcsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N6bGlnJzonXFx4REYnLCd0aG9ybic6J1xceEZFJywnVEhPUk4nOidcXHhERScsJ3RpbWVzJzonXFx4RDcnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWNpcmMnOidcXHhGQicsJ1VjaXJjJzonXFx4REInLCd1Z3JhdmUnOidcXHhGOScsJ1VncmF2ZSc6J1xceEQ5JywndW1sJzonXFx4QTgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWVuJzonXFx4QTUnLCd5dW1sJzonXFx4RkYnfTtcblx0dmFyIGRlY29kZU1hcE51bWVyaWMgPSB7JzAnOidcXHVGRkZEJywnMTI4JzonXFx1MjBBQycsJzEzMCc6J1xcdTIwMUEnLCcxMzEnOidcXHUwMTkyJywnMTMyJzonXFx1MjAxRScsJzEzMyc6J1xcdTIwMjYnLCcxMzQnOidcXHUyMDIwJywnMTM1JzonXFx1MjAyMScsJzEzNic6J1xcdTAyQzYnLCcxMzcnOidcXHUyMDMwJywnMTM4JzonXFx1MDE2MCcsJzEzOSc6J1xcdTIwMzknLCcxNDAnOidcXHUwMTUyJywnMTQyJzonXFx1MDE3RCcsJzE0NSc6J1xcdTIwMTgnLCcxNDYnOidcXHUyMDE5JywnMTQ3JzonXFx1MjAxQycsJzE0OCc6J1xcdTIwMUQnLCcxNDknOidcXHUyMDIyJywnMTUwJzonXFx1MjAxMycsJzE1MSc6J1xcdTIwMTQnLCcxNTInOidcXHUwMkRDJywnMTUzJzonXFx1MjEyMicsJzE1NCc6J1xcdTAxNjEnLCcxNTUnOidcXHUyMDNBJywnMTU2JzonXFx1MDE1MycsJzE1OCc6J1xcdTAxN0UnLCcxNTknOidcXHUwMTc4J307XG5cdHZhciBpbnZhbGlkUmVmZXJlbmNlQ29kZVBvaW50cyA9IFsxLDIsMyw0LDUsNiw3LDgsMTEsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMTI3LDEyOCwxMjksMTMwLDEzMSwxMzIsMTMzLDEzNCwxMzUsMTM2LDEzNywxMzgsMTM5LDE0MCwxNDEsMTQyLDE0MywxNDQsMTQ1LDE0NiwxNDcsMTQ4LDE0OSwxNTAsMTUxLDE1MiwxNTMsMTU0LDE1NSwxNTYsMTU3LDE1OCwxNTksNjQ5NzYsNjQ5NzcsNjQ5NzgsNjQ5NzksNjQ5ODAsNjQ5ODEsNjQ5ODIsNjQ5ODMsNjQ5ODQsNjQ5ODUsNjQ5ODYsNjQ5ODcsNjQ5ODgsNjQ5ODksNjQ5OTAsNjQ5OTEsNjQ5OTIsNjQ5OTMsNjQ5OTQsNjQ5OTUsNjQ5OTYsNjQ5OTcsNjQ5OTgsNjQ5OTksNjUwMDAsNjUwMDEsNjUwMDIsNjUwMDMsNjUwMDQsNjUwMDUsNjUwMDYsNjUwMDcsNjU1MzQsNjU1MzUsMTMxMDcwLDEzMTA3MSwxOTY2MDYsMTk2NjA3LDI2MjE0MiwyNjIxNDMsMzI3Njc4LDMyNzY3OSwzOTMyMTQsMzkzMjE1LDQ1ODc1MCw0NTg3NTEsNTI0Mjg2LDUyNDI4Nyw1ODk4MjIsNTg5ODIzLDY1NTM1OCw2NTUzNTksNzIwODk0LDcyMDg5NSw3ODY0MzAsNzg2NDMxLDg1MTk2Niw4NTE5NjcsOTE3NTAyLDkxNzUwMyw5ODMwMzgsOTgzMDM5LDEwNDg1NzQsMTA0ODU3NSwxMTE0MTEwLDExMTQxMTFdO1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdHZhciBvYmplY3QgPSB7fTtcblx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHR2YXIgaGFzID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eU5hbWUpIHtcblx0XHRyZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5TmFtZSk7XG5cdH07XG5cblx0dmFyIGNvbnRhaW5zID0gZnVuY3Rpb24oYXJyYXksIHZhbHVlKSB7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0aWYgKGFycmF5W2luZGV4XSA9PSB2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cdHZhciBtZXJnZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdHM7XG5cdFx0fVxuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHR2YXIga2V5O1xuXHRcdGZvciAoa2V5IGluIGRlZmF1bHRzKSB7XG5cdFx0XHQvLyBBIGBoYXNPd25Qcm9wZXJ0eWAgY2hlY2sgaXMgbm90IG5lZWRlZCBoZXJlLCBzaW5jZSBvbmx5IHJlY29nbml6ZWRcblx0XHRcdC8vIG9wdGlvbiBuYW1lcyBhcmUgdXNlZCBhbnl3YXkuIEFueSBvdGhlcnMgYXJlIGlnbm9yZWQuXG5cdFx0XHRyZXN1bHRba2V5XSA9IGhhcyhvcHRpb25zLCBrZXkpID8gb3B0aW9uc1trZXldIDogZGVmYXVsdHNba2V5XTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBNb2RpZmllZCB2ZXJzaW9uIG9mIGB1Y3MyZW5jb2RlYDsgc2VlIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZS5cblx0dmFyIGNvZGVQb2ludFRvU3ltYm9sID0gZnVuY3Rpb24oY29kZVBvaW50LCBzdHJpY3QpIHtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0aWYgKChjb2RlUG9pbnQgPj0gMHhEODAwICYmIGNvZGVQb2ludCA8PSAweERGRkYpIHx8IGNvZGVQb2ludCA+IDB4MTBGRkZGKSB7XG5cdFx0XHQvLyBTZWUgaXNzdWUgIzQ6XG5cdFx0XHQvLyDigJxPdGhlcndpc2UsIGlmIHRoZSBudW1iZXIgaXMgaW4gdGhlIHJhbmdlIDB4RDgwMCB0byAweERGRkYgb3IgaXNcblx0XHRcdC8vIGdyZWF0ZXIgdGhhbiAweDEwRkZGRiwgdGhlbiB0aGlzIGlzIGEgcGFyc2UgZXJyb3IuIFJldHVybiBhIFUrRkZGRFxuXHRcdFx0Ly8gUkVQTEFDRU1FTlQgQ0hBUkFDVEVSLuKAnVxuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIG91dHNpZGUgdGhlIHBlcm1pc3NpYmxlIFVuaWNvZGUgcmFuZ2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAnXFx1RkZGRCc7XG5cdFx0fVxuXHRcdGlmIChoYXMoZGVjb2RlTWFwTnVtZXJpYywgY29kZVBvaW50KSkge1xuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdkaXNhbGxvd2VkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZWNvZGVNYXBOdW1lcmljW2NvZGVQb2ludF07XG5cdFx0fVxuXHRcdGlmIChzdHJpY3QgJiYgY29udGFpbnMoaW52YWxpZFJlZmVyZW5jZUNvZGVQb2ludHMsIGNvZGVQb2ludCkpIHtcblx0XHRcdHBhcnNlRXJyb3IoJ2Rpc2FsbG93ZWQgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG5cdFx0XHRjb2RlUG9pbnQgLT0gMHgxMDAwMDtcblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGO1xuXHRcdH1cblx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHR2YXIgaGV4RXNjYXBlID0gZnVuY3Rpb24oY29kZVBvaW50KSB7XG5cdFx0cmV0dXJuICcmI3gnICsgY29kZVBvaW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgJzsnO1xuXHR9O1xuXG5cdHZhciBkZWNFc2NhcGUgPSBmdW5jdGlvbihjb2RlUG9pbnQpIHtcblx0XHRyZXR1cm4gJyYjJyArIGNvZGVQb2ludCArICc7Jztcblx0fTtcblxuXHR2YXIgcGFyc2VFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aHJvdyBFcnJvcignUGFyc2UgZXJyb3I6ICcgKyBtZXNzYWdlKTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgZW5jb2RlID0gZnVuY3Rpb24oc3RyaW5nLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGVuY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRSYXdDb2RlUG9pbnQudGVzdChzdHJpbmcpKSB7XG5cdFx0XHRwYXJzZUVycm9yKCdmb3JiaWRkZW4gY29kZSBwb2ludCcpO1xuXHRcdH1cblx0XHR2YXIgZW5jb2RlRXZlcnl0aGluZyA9IG9wdGlvbnMuZW5jb2RlRXZlcnl0aGluZztcblx0XHR2YXIgdXNlTmFtZWRSZWZlcmVuY2VzID0gb3B0aW9ucy51c2VOYW1lZFJlZmVyZW5jZXM7XG5cdFx0dmFyIGFsbG93VW5zYWZlU3ltYm9scyA9IG9wdGlvbnMuYWxsb3dVbnNhZmVTeW1ib2xzO1xuXHRcdHZhciBlc2NhcGVDb2RlUG9pbnQgPSBvcHRpb25zLmRlY2ltYWwgPyBkZWNFc2NhcGUgOiBoZXhFc2NhcGU7XG5cblx0XHR2YXIgZXNjYXBlQm1wU3ltYm9sID0gZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KHN5bWJvbC5jaGFyQ29kZUF0KDApKTtcblx0XHR9O1xuXG5cdFx0aWYgKGVuY29kZUV2ZXJ5dGhpbmcpIHtcblx0XHRcdC8vIEVuY29kZSBBU0NJSSBzeW1ib2xzLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhBc2NpaVdoaXRlbGlzdCwgZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRcdC8vIFVzZSBuYW1lZCByZWZlcmVuY2VzIGlmIHJlcXVlc3RlZCAmIHBvc3NpYmxlLlxuXHRcdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzICYmIGhhcyhlbmNvZGVNYXAsIHN5bWJvbCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N5bWJvbF0gKyAnOyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGVzY2FwZUJtcFN5bWJvbChzeW1ib2wpO1xuXHRcdFx0fSk7XG5cdFx0XHQvLyBTaG9ydGVuIGEgZmV3IGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZVxuXHRcdFx0Ly8gaXMgd2l0aGluIHRoZSBBU0NJSSByYW5nZS5cblx0XHRcdGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8mbHQ7XFx1MjBEMi9nLCAnJm52bHQ7Jylcblx0XHRcdFx0XHQucmVwbGFjZSgvJiN4NjY7JiN4NkE7L2csICcmZmpsaWc7Jyk7XG5cdFx0XHR9XG5cdFx0XHQvLyBFbmNvZGUgbm9uLUFTQ0lJIHN5bWJvbHMuXG5cdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzKSB7XG5cdFx0XHRcdC8vIEVuY29kZSBub24tQVNDSUkgc3ltYm9scyB0aGF0IGNhbiBiZSByZXBsYWNlZCB3aXRoIGEgbmFtZWQgcmVmZXJlbmNlLlxuXHRcdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZW5jb2RlTWFwLCBzdHJpbmcpYCBoZXJlLlxuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7Jztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RlOiBhbnkgcmVtYWluaW5nIG5vbi1BU0NJSSBzeW1ib2xzIGFyZSBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGBpZmAuXG5cdFx0fSBlbHNlIGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdC8vIEFwcGx5IG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0Ly8gRW5jb2RlIGA8PlwiJyZgIHVzaW5nIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0aWYgKCFhbGxvd1Vuc2FmZVN5bWJvbHMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7JzsgLy8gbm8gbmVlZCB0byBjaGVjayBgaGFzKClgIGhlcmVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaG9ydGVuIGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZSBpc1xuXHRcdFx0Ly8gYDw+XCInJmAuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdcblx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHQucmVwbGFjZSgvJmx0O1xcdTIwRDIvZywgJyZudmx0OycpO1xuXHRcdFx0Ly8gRW5jb2RlIG5vbi1BU0NJSSBzeW1ib2xzIHRoYXQgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBuYW1lZCByZWZlcmVuY2UuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGVuY29kZU1hcCwgc3RyaW5nKWAgaGVyZS5cblx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzdHJpbmddICsgJzsnO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICghYWxsb3dVbnNhZmVTeW1ib2xzKSB7XG5cdFx0XHQvLyBFbmNvZGUgYDw+XCInJmAgdXNpbmcgaGV4YWRlY2ltYWwgZXNjYXBlcywgbm93IHRoYXQgdGhleeKAmXJlIG5vdCBoYW5kbGVkXG5cdFx0XHQvLyB1c2luZyBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcy5cblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RXNjYXBlLCBlc2NhcGVCbXBTeW1ib2wpO1xuXHRcdH1cblx0XHRyZXR1cm4gc3RyaW5nXG5cdFx0XHQvLyBFbmNvZGUgYXN0cmFsIHN5bWJvbHMuXG5cdFx0XHQucmVwbGFjZShyZWdleEFzdHJhbFN5bWJvbHMsIGZ1bmN0aW9uKCQwKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdFx0XHR2YXIgaGlnaCA9ICQwLmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdHZhciBsb3cgPSAkMC5jaGFyQ29kZUF0KDEpO1xuXHRcdFx0XHR2YXIgY29kZVBvaW50ID0gKGhpZ2ggLSAweEQ4MDApICogMHg0MDAgKyBsb3cgLSAweERDMDAgKyAweDEwMDAwO1xuXHRcdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0XHR9KVxuXHRcdFx0Ly8gRW5jb2RlIGFueSByZW1haW5pbmcgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IHByaW50YWJsZSBBU0NJSSBzeW1ib2xzXG5cdFx0XHQvLyB1c2luZyBhIGhleGFkZWNpbWFsIGVzY2FwZS5cblx0XHRcdC5yZXBsYWNlKHJlZ2V4Qm1wV2hpdGVsaXN0LCBlc2NhcGVCbXBTeW1ib2wpO1xuXHR9O1xuXHQvLyBFeHBvc2UgZGVmYXVsdCBvcHRpb25zIChzbyB0aGV5IGNhbiBiZSBvdmVycmlkZGVuIGdsb2JhbGx5KS5cblx0ZW5jb2RlLm9wdGlvbnMgPSB7XG5cdFx0J2FsbG93VW5zYWZlU3ltYm9scyc6IGZhbHNlLFxuXHRcdCdlbmNvZGVFdmVyeXRoaW5nJzogZmFsc2UsXG5cdFx0J3N0cmljdCc6IGZhbHNlLFxuXHRcdCd1c2VOYW1lZFJlZmVyZW5jZXMnOiBmYWxzZSxcblx0XHQnZGVjaW1hbCcgOiBmYWxzZVxuXHR9O1xuXG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihodG1sLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRFbnRpdHkudGVzdChodG1sKSkge1xuXHRcdFx0cGFyc2VFcnJvcignbWFsZm9ybWVkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHR9XG5cdFx0cmV0dXJuIGh0bWwucmVwbGFjZShyZWdleERlY29kZSwgZnVuY3Rpb24oJDAsICQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3LCAkOCkge1xuXHRcdFx0dmFyIGNvZGVQb2ludDtcblx0XHRcdHZhciBzZW1pY29sb247XG5cdFx0XHR2YXIgZGVjRGlnaXRzO1xuXHRcdFx0dmFyIGhleERpZ2l0cztcblx0XHRcdHZhciByZWZlcmVuY2U7XG5cdFx0XHR2YXIgbmV4dDtcblxuXHRcdFx0aWYgKCQxKSB7XG5cdFx0XHRcdHJlZmVyZW5jZSA9ICQxO1xuXHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZGVjb2RlTWFwLCByZWZlcmVuY2UpYC5cblx0XHRcdFx0cmV0dXJuIGRlY29kZU1hcFtyZWZlcmVuY2VdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJDIpIHtcblx0XHRcdFx0Ly8gRGVjb2RlIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzIHdpdGhvdXQgdHJhaWxpbmcgYDtgLCBlLmcuIGAmYW1wYC5cblx0XHRcdFx0Ly8gVGhpcyBpcyBvbmx5IGEgcGFyc2UgZXJyb3IgaWYgaXQgZ2V0cyBjb252ZXJ0ZWQgdG8gYCZgLCBvciBpZiBpdCBpc1xuXHRcdFx0XHQvLyBmb2xsb3dlZCBieSBgPWAgaW4gYW4gYXR0cmlidXRlIGNvbnRleHQuXG5cdFx0XHRcdHJlZmVyZW5jZSA9ICQyO1xuXHRcdFx0XHRuZXh0ID0gJDM7XG5cdFx0XHRcdGlmIChuZXh0ICYmIG9wdGlvbnMuaXNBdHRyaWJ1dGVWYWx1ZSkge1xuXHRcdFx0XHRcdGlmIChzdHJpY3QgJiYgbmV4dCA9PSAnPScpIHtcblx0XHRcdFx0XHRcdHBhcnNlRXJyb3IoJ2AmYCBkaWQgbm90IHN0YXJ0IGEgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gJDA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRcdFx0cGFyc2VFcnJvcihcblx0XHRcdFx0XHRcdFx0J25hbWVkIGNoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGRlY29kZU1hcExlZ2FjeSwgcmVmZXJlbmNlKWAuXG5cdFx0XHRcdFx0cmV0dXJuIGRlY29kZU1hcExlZ2FjeVtyZWZlcmVuY2VdICsgKG5leHQgfHwgJycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkNCkge1xuXHRcdFx0XHQvLyBEZWNvZGUgZGVjaW1hbCBlc2NhcGVzLCBlLmcuIGAmIzExOTU1ODtgLlxuXHRcdFx0XHRkZWNEaWdpdHMgPSAkNDtcblx0XHRcdFx0c2VtaWNvbG9uID0gJDU7XG5cdFx0XHRcdGlmIChzdHJpY3QgJiYgIXNlbWljb2xvbikge1xuXHRcdFx0XHRcdHBhcnNlRXJyb3IoJ2NoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29kZVBvaW50ID0gcGFyc2VJbnQoZGVjRGlnaXRzLCAxMCk7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnRUb1N5bWJvbChjb2RlUG9pbnQsIHN0cmljdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkNikge1xuXHRcdFx0XHQvLyBEZWNvZGUgaGV4YWRlY2ltYWwgZXNjYXBlcywgZS5nLiBgJiN4MUQzMDY7YC5cblx0XHRcdFx0aGV4RGlnaXRzID0gJDY7XG5cdFx0XHRcdHNlbWljb2xvbiA9ICQ3O1xuXHRcdFx0XHRpZiAoc3RyaWN0ICYmICFzZW1pY29sb24pIHtcblx0XHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvZGVQb2ludCA9IHBhcnNlSW50KGhleERpZ2l0cywgMTYpO1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50VG9TeW1ib2woY29kZVBvaW50LCBzdHJpY3QpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB3ZeKAmXJlIHN0aWxsIGhlcmUsIGBpZiAoJDcpYCBpcyBpbXBsaWVkOyBpdOKAmXMgYW4gYW1iaWd1b3VzXG5cdFx0XHQvLyBhbXBlcnNhbmQgZm9yIHN1cmUuIGh0dHBzOi8vbXRocy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kc1xuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKFxuXHRcdFx0XHRcdCduYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbidcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAkMDtcblx0XHR9KTtcblx0fTtcblx0Ly8gRXhwb3NlIGRlZmF1bHQgb3B0aW9ucyAoc28gdGhleSBjYW4gYmUgb3ZlcnJpZGRlbiBnbG9iYWxseSkuXG5cdGRlY29kZS5vcHRpb25zID0ge1xuXHRcdCdpc0F0dHJpYnV0ZVZhbHVlJzogZmFsc2UsXG5cdFx0J3N0cmljdCc6IGZhbHNlXG5cdH07XG5cblx0dmFyIGVzY2FwZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdHJldHVybiBzdHJpbmcucmVwbGFjZShyZWdleEVzY2FwZSwgZnVuY3Rpb24oJDApIHtcblx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhlc2NhcGVNYXAsICQwKWAgaGVyZS5cblx0XHRcdHJldHVybiBlc2NhcGVNYXBbJDBdO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBoZSA9IHtcblx0XHQndmVyc2lvbic6ICcxLjIuMCcsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlc2NhcGUnOiBlc2NhcGUsXG5cdFx0J3VuZXNjYXBlJzogZGVjb2RlXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gaGU7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IGhlO1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gaGUpIHtcblx0XHRcdFx0aGFzKGhlLCBrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gaGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5oZSA9IGhlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQge0pzb24yQ3N2fSA9IHJlcXVpcmUoJy4vanNvbjJjc3YnKSwgLy8gUmVxdWlyZSBvdXIganNvbi0yLWNzdiBjb2RlXG4gICAge0NzdjJKc29ufSA9IHJlcXVpcmUoJy4vY3N2Mmpzb24nKSwgLy8gUmVxdWlyZSBvdXIgY3N2LTItanNvbiBjb2RlXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGpzb24yY3N2OiAoZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpID0+IGNvbnZlcnQoSnNvbjJDc3YsIGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSxcbiAgICBjc3YyanNvbjogKGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSA9PiBjb252ZXJ0KENzdjJKc29uLCBkYXRhLCBjYWxsYmFjaywgb3B0aW9ucyksXG4gICAganNvbjJjc3ZBc3luYzogKGpzb24sIG9wdGlvbnMpID0+IGNvbnZlcnRBc3luYyhKc29uMkNzdiwganNvbiwgb3B0aW9ucyksXG4gICAgY3N2Mmpzb25Bc3luYzogKGNzdiwgb3B0aW9ucykgPT4gY29udmVydEFzeW5jKENzdjJKc29uLCBjc3YsIG9wdGlvbnMpLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgU2luY2UgdjMuMC4wXG4gICAgICovXG4gICAganNvbjJjc3ZQcm9taXNpZmllZDogKGpzb24sIG9wdGlvbnMpID0+IGRlcHJlY2F0ZWRBc3luYyhKc29uMkNzdiwgJ2pzb24yY3N2UHJvbWlzaWZpZWQoKScsICdqc29uMmNzdkFzeW5jKCknLCBqc29uLCBvcHRpb25zKSxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFNpbmNlIHYzLjAuMFxuICAgICAqL1xuICAgIGNzdjJqc29uUHJvbWlzaWZpZWQ6IChjc3YsIG9wdGlvbnMpID0+IGRlcHJlY2F0ZWRBc3luYyhDc3YySnNvbiwgJ2NzdjJqc29uUHJvbWlzaWZpZWQoKScsICdjc3YyanNvbkFzeW5jKCknLCBjc3YsIG9wdGlvbnMpXG59O1xuXG4vKipcbiAqIEFic3RyYWN0ZWQgY29udmVydGVyIGZ1bmN0aW9uIGZvciBqc29uMmNzdiBhbmQgY3N2Mmpzb24gZnVuY3Rpb25hbGl0eVxuICogVGFrZXMgaW4gdGhlIGNvbnZlcnRlciB0byBiZSB1c2VkIChlaXRoZXIgSnNvbjJDc3Ygb3IgQ3N2Mkpzb24pXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIGNhbGxiYWNrXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBjb252ZXJ0KGNvbnZlcnRlciwgZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdXRpbHMuY29udmVydCh7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBjb252ZXJ0ZXI6IGNvbnZlcnRlclxuICAgIH0pO1xufVxuXG4vKipcbiAqIFNpbXBsZSB3YXkgdG8gcHJvbWlzaWZ5IGEgY2FsbGJhY2sgdmVyc2lvbiBvZiBqc29uMmNzdiBvciBjc3YyanNvblxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICovXG5mdW5jdGlvbiBjb252ZXJ0QXN5bmMoY29udmVydGVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IGNvbnZlcnQoY29udmVydGVyLCBkYXRhLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICB9LCBvcHRpb25zKSk7XG59XG5cbi8qKlxuICogU2ltcGxlIHdheSB0byBwcm92aWRlIGEgZGVwcmVjYXRpb24gd2FybmluZyBmb3IgcHJldmlvdXMgcHJvbWlzaWZpZWQgdmVyc2lvbnNcbiAqIG9mIG1vZHVsZSBmdW5jdGlvbmFsaXR5LlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGRlcHJlY2F0ZWROYW1lXG4gKiBAcGFyYW0gcmVwbGFjZW1lbnROYW1lXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gKi9cbmZ1bmN0aW9uIGRlcHJlY2F0ZWRBc3luYyhjb252ZXJ0ZXIsIGRlcHJlY2F0ZWROYW1lLCByZXBsYWNlbWVudE5hbWUsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6ICcgKyBkZXByZWNhdGVkTmFtZSArICcgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIHNvb24uIFBsZWFzZSB1c2UgJyArIHJlcGxhY2VtZW50TmFtZSArICcgaW5zdGVhZC4nKTtcbiAgICByZXR1cm4gY29udmVydEFzeW5jKGNvbnZlcnRlciwgZGF0YSwgb3B0aW9ucyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBwYXRoID0gcmVxdWlyZSgnZG9jLXBhdGgnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy5qc29uJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmNvbnN0IENzdjJKc29uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IGVzY2FwZWRXcmFwRGVsaW1pdGVyUmVnZXggPSBuZXcgUmVnRXhwKG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgKyBvcHRpb25zLmRlbGltaXRlci53cmFwLCAnZycpLFxuICAgICAgICBleGNlbEJPTVJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBjb25zdGFudHMudmFsdWVzLmV4Y2VsQk9NKTtcblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSBoZWFkZXIga2V5LCBpZiBzcGVjaWZpZWQgYnkgdGhlIHVzZXIgdmlhIHRoZSBwcm92aWRlZCBvcHRpb25zXG4gICAgICogQHBhcmFtIGhlYWRlcktleVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXJLZXkoaGVhZGVyS2V5KSB7XG4gICAgICAgIGhlYWRlcktleSA9IHJlbW92ZVdyYXBEZWxpbWl0ZXJzRnJvbVZhbHVlKGhlYWRlcktleSk7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1IZWFkZXJGaWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJLZXkuc3BsaXQoJy4nKVxuICAgICAgICAgICAgICAgIC5tYXAoKGNvbXBvbmVudCkgPT4gY29tcG9uZW50LnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuam9pbignLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZWFkZXJLZXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIEpTT04gaGVhZGluZyBmcm9tIHRoZSBDU1ZcbiAgICAgKiBAcGFyYW0gbGluZXMge1N0cmluZ1tdfSBjc3YgbGluZXMgc3BsaXQgYnkgRU9MIGRlbGltaXRlclxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlSGVhZGluZyhsaW5lcykge1xuICAgICAgICBsZXQgcGFyYW1zID0ge2xpbmVzfSxcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGFuZCByZXR1cm4gdGhlIGhlYWRpbmcga2V5c1xuICAgICAgICAgICAgaGVhZGVyUm93ID0gcGFyYW1zLmxpbmVzWzBdO1xuICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzID0gaGVhZGVyUm93Lm1hcCgoaGVhZGVyS2V5LCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzSGVhZGVyS2V5KGhlYWRlcktleSksXG4gICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHByb3ZpZGVkIGtleXMsIGZpbHRlciB0aGUgZ2VuZXJhdGVkIGtleXMgdG8ganVzdCB0aGUgdXNlciBwcm92aWRlZCBrZXlzIHNvIHdlIGFsc28gaGF2ZSB0aGUga2V5IGluZGV4XG4gICAgICAgIGlmIChvcHRpb25zLmtleXMpIHtcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBwYXJhbXMuaGVhZGVyRmllbGRzLmZpbHRlcigoaGVhZGVyS2V5KSA9PiBvcHRpb25zLmtleXMuaW5jbHVkZXMoaGVhZGVyS2V5LnZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNwbGl0cyB0aGUgbGluZXMgb2YgdGhlIENTViBzdHJpbmcgYnkgdGhlIEVPTCBkZWxpbWl0ZXIgYW5kIHJlc29sdmVzIGFuZCBhcnJheSBvZiBzdHJpbmdzIChsaW5lcylcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICogQHJldHVybnMge1Byb21pc2UuPFN0cmluZ1tdPn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzcGxpdENzdkxpbmVzKGNzdikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNwbGl0TGluZXMoY3N2KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgRXhjZWwgQk9NIHZhbHVlLCBpZiBzcGVjaWZpZWQgYnkgdGhlIG9wdGlvbnMgb2JqZWN0XG4gICAgICogQHBhcmFtIGNzdlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxTdHJpbmc+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmlwRXhjZWxCT00oY3N2KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmV4Y2VsQk9NKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNzdi5yZXBsYWNlKGV4Y2VsQk9NUmVnZXgsICcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjc3YpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHNwbGl0cyBhIGxpbmUgc28gdGhhdCB3ZSBjYW4gaGFuZGxlIHdyYXBwZWQgZmllbGRzXG4gICAgICogQHBhcmFtIGNzdlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNwbGl0TGluZXMoY3N2KSB7XG4gICAgICAgIC8vIFBhcnNlIG91dCB0aGUgbGluZS4uLlxuICAgICAgICBsZXQgbGluZXMgPSBbXSxcbiAgICAgICAgICAgIHNwbGl0TGluZSA9IFtdLFxuICAgICAgICAgICAgY2hhcmFjdGVyLFxuICAgICAgICAgICAgY2hhckJlZm9yZSxcbiAgICAgICAgICAgIGNoYXJBZnRlcixcbiAgICAgICAgICAgIG5leHROQ2hhcixcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJbmRleCA9IGNzdi5sZW5ndGggLSAxLFxuICAgICAgICAgICAgZW9sRGVsaW1pdGVyTGVuZ3RoID0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzID0ge1xuICAgICAgICAgICAgICAgIGluc2lkZVdyYXBEZWxpbWl0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhcnNpbmdWYWx1ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBqdXN0UGFyc2VkRG91YmxlUXVvdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBsaW5lIHRvIGlkZW50aWZ5IHdoZXJlIHRvIHNwbGl0IHRoZSB2YWx1ZXNcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgY3N2Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQ3VycmVudCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGNzdltpbmRleF07XG4gICAgICAgICAgICAvLyBQcmV2aW91cyBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGNoYXJCZWZvcmUgPSBpbmRleCA/IGNzdltpbmRleCAtIDFdIDogJyc7XG4gICAgICAgICAgICAvLyBOZXh0IGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhckFmdGVyID0gaW5kZXggPCBsYXN0Q2hhcmFjdGVySW5kZXggPyBjc3ZbaW5kZXggKyAxXSA6ICcnO1xuICAgICAgICAgICAgLy8gTmV4dCBuIGNoYXJhY3RlcnMsIGluY2x1ZGluZyB0aGUgY3VycmVudCBjaGFyYWN0ZXIsIHdoZXJlIG4gPSBsZW5ndGgoRU9MIGRlbGltaXRlcilcbiAgICAgICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB0aGUgY2hlY2tpbmcgb2YgYW4gRU9MIGRlbGltaXRlciB3aGVuIGlmIGl0IGlzIG1vcmUgdGhhbiBhIHNpbmdsZSBjaGFyYWN0ZXIgKGVnLiAnXFxyXFxuJylcbiAgICAgICAgICAgIG5leHROQ2hhciA9IHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXgsIGVvbERlbGltaXRlckxlbmd0aCk7XG5cbiAgICAgICAgICAgIGlmICgobmV4dE5DaGFyID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wgJiYgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgfHxcbiAgICAgICAgICAgICAgICBpbmRleCA9PT0gbGFzdENoYXJhY3RlckluZGV4KSAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYW4gRU9MIGRlbGltaXRlciBvciB0aGUgZW5kIG9mIHRoZSBjc3YgYW5kIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBmaWVsZCBkZWxpbWl0ZXIuLi5cblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzdGFydCBpbmRleCBpcyB0aGUgY3VycmVudCBpbmRleCAoYW5kIHNpbmNlIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBjb21tYSksXG4gICAgICAgICAgICAgICAgLy8gICB0aGVuIHRoZSB2YWx1ZSBiZWluZyBwYXJzZWQgaXMgYW4gZW1wdHkgdmFsdWUgYWNjb3JkaW5nbHksIGFkZCBhbiBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkVmFsdWUgPSBuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJiBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID09PSBpbmRleFxuICAgICAgICAgICAgICAgICAgICA/ICcnXG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlcmUncyBhIHZhbGlkIHZhbHVlLCBhbmQgdGhlIHN0YXJ0IGluZGV4IGlzbid0IHRoZSBjdXJyZW50IGluZGV4LCBncmFiIHRoZSB3aG9sZSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IGNzdi5zdWJzdHIoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXNoIHRoZSB2YWx1ZSBmb3IgdGhlIGZpZWxkIHRoYXQgd2Ugd2VyZSBwYXJzaW5nXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2gocGFyc2VkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIGxhc3QgY2hhcmFjdGVyIGlzIGEgY29tbWEsIHRoZXJlJ3Mgc3RpbGwgYW4gYWRkaXRpb25hbCBpbXBsaWVkIGZpZWxkIHZhbHVlIHRyYWlsaW5nIHRoZSBjb21tYS5cbiAgICAgICAgICAgICAgICAvLyAgIFNpbmNlIHRoaXMgdmFsdWUgaXMgZW1wdHksIHdlIHB1c2ggYW4gZXh0cmEgZW1wdHkgdmFsdWVcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaCgnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBwdXNoIHRoZSBzcGxpdCBsaW5lIHZhbHVlcyBpbnRvIHRoZSBsaW5lcyBhcnJheSBhbmQgY2xlYXIgdGhlIHNwbGl0IGxpbmVcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHNwbGl0TGluZSk7XG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lID0gW107XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgZW9sRGVsaW1pdGVyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RDaGFyYWN0ZXJJbmRleCAmJiBjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2ggdGhlIGVuZCBvZiB0aGUgQ1NWIGFuZCB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgYSBmaWVsZCBkZWxpbWl0ZXJcblxuICAgICAgICAgICAgICAgIC8vIFBhcnNlIHRoZSBwcmV2aW91c2x5IHNlZW4gdmFsdWUgYW5kIGFkZCBpdCB0byB0aGUgbGluZVxuICAgICAgICAgICAgICAgIGxldCBwYXJzZWRWYWx1ZSA9IGNzdi5zdWJzdHJpbmcoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKHBhcnNlZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgIC8vIFRoZW4gYWRkIGFuIGVtcHR5IHN0cmluZyB0byB0aGUgbGluZSBzaW5jZSB0aGUgbGFzdCBjaGFyYWN0ZXIgYmVpbmcgYSBmaWVsZCBkZWxpbWl0ZXIgaW5kaWNhdGVzIGFuIGVtcHR5IGZpZWxkXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goJycpO1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3BsaXRMaW5lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RDaGFyYWN0ZXJJbmRleCB8fCBuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJlxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGFyZW4ndCBpbnNpZGUgd3JhcCBkZWxpbWl0ZXJzIG9yIGlmIHdlIGFyZSBidXQgdGhlIGNoYXJhY3RlciBiZWZvcmUgd2FzIGEgd3JhcCBkZWxpbWl0ZXIgYW5kIHdlIGRpZG4ndCBqdXN0IHNlZSB0d29cbiAgICAgICAgICAgICAgICAoIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmICFzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUpKSB7XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbGluZSBvciBjc3YgKGFuZCBjdXJyZW50IGNoYXJhY3RlciBpcyBub3QgYSBmaWVsZCBkZWxpbWl0ZXIpXG5cbiAgICAgICAgICAgICAgICBsZXQgdG9JbmRleCA9IGluZGV4ICE9PSBsYXN0Q2hhcmFjdGVySW5kZXggfHwgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCA/IGluZGV4IDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gUmV0cmlldmUgdGhlIHJlbWFpbmluZyB2YWx1ZSBhbmQgYWRkIGl0IHRvIHRoZSBzcGxpdCBsaW5lIGxpc3Qgb2YgdmFsdWVzXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCB0b0luZGV4KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBwdXNoIHRoZSBzcGxpdCBsaW5lIHZhbHVlcyBpbnRvIHRoZSBsaW5lcyBhcnJheSBhbmQgY2xlYXIgdGhlIHNwbGl0IGxpbmVcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHNwbGl0TGluZSk7XG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lID0gW107XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgZW9sRGVsaW1pdGVyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGNoYXJCZWZvcmUgIT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgfHwgc3RhdGVWYXJpYWJsZXMuanVzdFBhcnNlZERvdWJsZVF1b3RlICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXApICYmXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXggKyAxLCBlb2xEZWxpbWl0ZXJMZW5ndGgpID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaCBhIHdyYXAgd2hpY2ggaXMgbm90IHByZWNlZGVkIGJ5IGEgd3JhcCBkZWxpbSBhbmQgdGhlIG5leHQgY2hhcmFjdGVyIGlzIGFuIEVPTCBkZWxpbSAoaWUuICpcIlxcbilcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvLyBOZXh0IGl0ZXJhdGlvbiB3aWxsIHN1YnN0cmluZywgYWRkIHRoZSB2YWx1ZSB0byB0aGUgbGluZSwgYW5kIHB1c2ggdGhlIGxpbmUgb250byB0aGUgYXJyYXkgb2YgbGluZXNcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIChpbmRleCA9PT0gMCB8fCB1dGlscy5nZXROQ2hhcmFjdGVycyhjc3YsIGluZGV4IC0gZW9sRGVsaW1pdGVyTGVuZ3RoLCBlb2xEZWxpbWl0ZXJMZW5ndGgpID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGxpbmUgc3RhcnRzIHdpdGggYSB3cmFwIGRlbGltaXRlciAoaWUuIFwiKilcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSB3cmFwIGRlbGltaXRlciB3aXRoIGEgZmllbGQgZGVsaW1pdGVyIGFmdGVyIGl0IChpZS4gKlwiLClcblxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKGNzdi5zdWJzdHJpbmcoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCwgaW5kZXggKyAxKSk7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgMjsgLy8gbmV4dCB2YWx1ZSBzdGFydHMgYWZ0ZXIgdGhlIGZpZWxkIGRlbGltaXRlclxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkICYmXG4gICAgICAgICAgICAgICAgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgJiYgIXN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSB3cmFwIGRlbGltaXRlciBhZnRlciBhIGNvbW1hIGFuZCB3ZSBhcmVuJ3QgaW5zaWRlIGEgd3JhcCBkZWxpbWl0ZXJcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiZcbiAgICAgICAgICAgICAgICAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJiBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgd3JhcCBkZWxpbWl0ZXIgd2l0aCBhIGZpZWxkIGRlbGltaXRlciBhZnRlciBpdCAoaWUuICxcIiopXG5cbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIGluZGV4IC0gMSkpO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcnVuIGludG8gYW4gZXNjYXBlZCBxdW90ZSAoaWUuIFwiXCIpIHNraXAgcGFzdCB0aGUgc2Vjb25kIHF1b3RlXG5cbiAgICAgICAgICAgICAgICBpbmRleCArPSAyO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmp1c3RQYXJzZWREb3VibGVRdW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiYgY2hhckJlZm9yZSAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJlxuICAgICAgICAgICAgICAgIGNoYXJBZnRlciAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJlxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBmaWVsZCBkZWxpbWl0ZXIgYW5kIGFyZSBub3QgaW5zaWRlIHRoZSB3cmFwIGRlbGltaXRlcnMgKGllLiAqLCopXG5cbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIGluZGV4KSk7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmXG4gICAgICAgICAgICAgICAgY2hhckFmdGVyICE9PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmICFzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgZmllbGQgZGVsaW1pdGVyLCB0aGUgcHJldmlvdXMgY2hhcmFjdGVyIHdhcyBhIHdyYXAgZGVsaW1pdGVyLCBhbmQgdGhlXG4gICAgICAgICAgICAgICAgLy8gICBuZXh0IGNoYXJhY3RlciBpcyBub3QgYSB3cmFwIGRlbGltaXRlciAoaWUuIFwiLCopXG5cbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCB0byB0aGUgbmV4dCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAvLyBSZXNldCB0aGUgZG91YmxlIHF1b3RlIHN0YXRlIHZhcmlhYmxlXG4gICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHJlY29yZCBsaW5lcyBmcm9tIHRoZSBzcGxpdCBDU1YgbGluZXMgYW5kIHNldHMgaXQgb24gdGhlIHBhcmFtcyBvYmplY3RcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVSZWNvcmRMaW5lcyhwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnJlY29yZExpbmVzID0gcGFyYW1zLmxpbmVzLnNwbGljZSgxKTsgLy8gQWxsIGxpbmVzIGV4Y2VwdCBmb3IgdGhlIGhlYWRlciBsaW5lXG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIGZvciB0aGUgcmVjb3JkIGZyb20gdGhlIGxpbmUgYXQgdGhlIHByb3ZpZGVkIGtleS5cbiAgICAgKiBAcGFyYW0gbGluZSB7U3RyaW5nW119IHNwbGl0IGxpbmUgdmFsdWVzIGZvciB0aGUgcmVjb3JkXG4gICAgICogQHBhcmFtIGtleSB7T2JqZWN0fSB7aW5kZXg6IE51bWJlciwgdmFsdWU6IFN0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZVJlY29yZFZhbHVlRnJvbUxpbmUobGluZSwga2V5KSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgdmFsdWUgYXQgdGhlIGtleSdzIGluZGV4LCB1c2UgaXQ7IG90aGVyd2lzZSwgbnVsbFxuICAgICAgICBsZXQgdmFsdWUgPSBsaW5lW2tleS5pbmRleF07XG5cbiAgICAgICAgLy8gUGVyZm9ybSBhbnkgbmVjZXNzYXJ5IHZhbHVlIGNvbnZlcnNpb25zIG9uIHRoZSByZWNvcmQgdmFsdWVcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NSZWNvcmRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIHRoZSByZWNvcmQncyB2YWx1ZSBieSBwYXJzaW5nIHRoZSBkYXRhIHRvIGVuc3VyZSB0aGUgQ1NWIGlzXG4gICAgICogY29udmVydGVkIHRvIHRoZSBKU09OIHRoYXQgY3JlYXRlZCBpdC5cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZSB7U3RyaW5nfVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb2Nlc3NSZWNvcmRWYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiwgY29udmVydCBpdFxuICAgICAgICBsZXQgcGFyc2VkSnNvbiA9IHBhcnNlVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgIC8vIElmIHBhcnNlZEpzb24gaXMgYW55dGhpbmcgYXNpZGUgZnJvbSBhbiBlcnJvciwgdGhlbiB3ZSB3YW50IHRvIHVzZSB0aGUgcGFyc2VkIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIGludGVycHJldCB2YWx1ZXMgbGlrZSAnbnVsbCcgLS0+IG51bGwsICdmYWxzZScgLS0+IGZhbHNlXG4gICAgICAgIGlmICghdXRpbHMuaXNFcnJvcihwYXJzZWRKc29uKSAmJiAhdXRpbHMuaXNJbnZhbGlkKHBhcnNlZEpzb24pKSB7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gcGFyc2VkSnNvbjtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZFZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSByZWNvcmQgdmFsdWUsIGlmIHNwZWNpZmllZCBieSB0aGUgdXNlciB2aWEgdGhlIG9wdGlvbnMgb2JqZWN0XG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbVJlY29yZFZhbHVlKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUZpZWxkVmFsdWVzICYmICF1dGlscy5pc051bGwoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBKU09OIGRvY3VtZW50IHdpdGggdGhlIGdpdmVuIGtleXMgKGRlc2lnbmF0ZWQgYnkgdGhlIENTViBoZWFkZXIpXG4gICAgICogICBhbmQgdGhlIHZhbHVlcyAoZnJvbSB0aGUgZ2l2ZW4gbGluZSlcbiAgICAgKiBAcGFyYW0ga2V5cyBTdHJpbmdbXVxuICAgICAqIEBwYXJhbSBsaW5lIFN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGNyZWF0ZWQganNvbiBkb2N1bWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZURvY3VtZW50KGtleXMsIGxpbmUpIHtcbiAgICAgICAgLy8gUmVkdWNlIHRoZSBrZXlzIGludG8gYSBKU09OIGRvY3VtZW50IHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gbGluZVxuICAgICAgICByZXR1cm4ga2V5cy5yZWR1Y2UoKGRvY3VtZW50LCBrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgdmFsdWUgYXQgdGhlIGtleSdzIGluZGV4IGluIHRoZSBsaW5lLCBzZXQgdGhlIHZhbHVlOyBvdGhlcndpc2UgbnVsbFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gcmV0cmlldmVSZWNvcmRWYWx1ZUZyb21MaW5lKGxpbmUsIGtleSk7XG5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgdGhlIGtleSBhbmQgdmFsdWUgdG8gdGhlIGRvY3VtZW50XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5zZXRQYXRoKGRvY3VtZW50LCBrZXkudmFsdWUsIHZhbHVlKTtcbiAgICAgICAgfSwge30pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG91dGVybW9zdCB3cmFwIGRlbGltaXRlcnMgZnJvbSBhIHZhbHVlLCBpZiB0aGV5IGFyZSBwcmVzZW50XG4gICAgICogT3RoZXJ3aXNlLCB0aGUgbm9uLXdyYXBwZWQgdmFsdWUgaXMgcmV0dXJuZWQgYXMgaXNcbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICBsZXQgZmlyc3RDaGFyID0gZmllbGRWYWx1ZVswXSxcbiAgICAgICAgICAgIGxhc3RJbmRleCA9IGZpZWxkVmFsdWUubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgIGxhc3RDaGFyID0gZmllbGRWYWx1ZVtsYXN0SW5kZXhdO1xuICAgICAgICAvLyBJZiB0aGUgZmllbGQgc3RhcnRzIGFuZCBlbmRzIHdpdGggYSB3cmFwIGRlbGltaXRlclxuICAgICAgICBpZiAoZmlyc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGxhc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS5zdWJzdHIoMSwgbGFzdEluZGV4IC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5lc2NhcGVzIHdyYXAgZGVsaW1pdGVycyBieSByZXBsYWNpbmcgZHVwbGljYXRlcyB3aXRoIGEgc2luZ2xlIChlZy4gXCJcIiAtPiBcIilcbiAgICAgKiBUaGlzIGlzIGRvbmUgaW4gb3JkZXIgdG8gcGFyc2UgUkZDIDQxODAgY29tcGxpYW50IENTViBiYWNrIHRvIEpTT05cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lc2NhcGVXcmFwRGVsaW1pdGVySW5GaWVsZChmaWVsZFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnJlcGxhY2UoZXNjYXBlZFdyYXBEZWxpbWl0ZXJSZWdleCwgb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFpbiBoZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCB0aGUgQ1NWIHRvIHRoZSBKU09OIGRvY3VtZW50IGFycmF5XG4gICAgICogQHBhcmFtIHBhcmFtcyB7T2JqZWN0fSB7bGluZXM6IFtTdHJpbmddLCBjYWxsYmFjazogRnVuY3Rpb259XG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlY29yZExpbmVzKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMuanNvbiA9IHBhcmFtcy5yZWNvcmRMaW5lcy5yZWR1Y2UoKGdlbmVyYXRlZEpzb25PYmplY3RzLCBsaW5lKSA9PiB7IC8vIEZvciBlYWNoIGxpbmUsIGNyZWF0ZSB0aGUgZG9jdW1lbnQgYW5kIGFkZCBpdCB0byB0aGUgYXJyYXkgb2YgZG9jdW1lbnRzXG4gICAgICAgICAgICBsaW5lID0gbGluZS5tYXAoKGZpZWxkVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIHRoZSBuZWNlc3Nhcnkgb3BlcmF0aW9ucyBvbiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHVuZXNjYXBlV3JhcERlbGltaXRlckluRmllbGQoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHRyaW1SZWNvcmRWYWx1ZShmaWVsZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBnZW5lcmF0ZWREb2N1bWVudCA9IGNyZWF0ZURvY3VtZW50KHBhcmFtcy5oZWFkZXJGaWVsZHMsIGxpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIGdlbmVyYXRlZEpzb25PYmplY3RzLmNvbmNhdChnZW5lcmF0ZWREb2N1bWVudCk7XG4gICAgICAgIH0sIFtdKTtcblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHRzIHRvIHBhcnNlIHRoZSBwcm92aWRlZCB2YWx1ZS4gSWYgaXQgaXMgbm90IHBhcnNhYmxlLCB0aGVuIGFuIGVycm9yIGlzIHJldHVybmVkXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nUmVwcmVzZW50YXRpb24odmFsdWUsIG9wdGlvbnMpICYmICF1dGlscy5pc0RhdGVSZXByZXNlbnRhdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwYXJzZWRKc29uID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBwYXJzZWQgdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gd2UgYWxzbyBuZWVkIHRvIHRyaW0gcmVjb3JkIHZhbHVlcywgaWYgc3BlY2lmaWVkXG4gICAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShwYXJzZWRKc29uKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXJzZWRKc29uLm1hcCh0cmltUmVjb3JkVmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcGFyc2VkSnNvbjtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gZXJyO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWxseSBleHBvcnRlZCBjc3YyanNvbiBmdW5jdGlvblxuICAgICAqIFRha2VzIG9wdGlvbnMgYXMgYSBkb2N1bWVudCwgZGF0YSBhcyBhIENTViBzdHJpbmcsIGFuZCBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcG9ydCB0aGUgcmVzdWx0c1xuICAgICAqIEBwYXJhbSBkYXRhIFN0cmluZyBjc3Ygc3RyaW5nXG4gICAgICogQHBhcmFtIGNhbGxiYWNrIEZ1bmN0aW9uIGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29udmVydChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBTcGxpdCB0aGUgQ1NWIGludG8gbGluZXMgdXNpbmcgdGhlIHNwZWNpZmllZCBFT0wgb3B0aW9uXG4gICAgICAgIC8vIHZhbGlkYXRlQ3N2KGRhdGEsIGNhbGxiYWNrKVxuICAgICAgICAvLyAgICAgLnRoZW4oc3RyaXBFeGNlbEJPTSlcbiAgICAgICAgc3RyaXBFeGNlbEJPTShkYXRhKVxuICAgICAgICAgICAgLnRoZW4oc3BsaXRDc3ZMaW5lcylcbiAgICAgICAgICAgIC50aGVuKHJldHJpZXZlSGVhZGluZykgLy8gUmV0cmlldmUgdGhlIGhlYWRpbmdzIGZyb20gdGhlIENTViwgdW5sZXNzIHRoZSB1c2VyIHNwZWNpZmllZCB0aGUga2V5c1xuICAgICAgICAgICAgLnRoZW4ocmV0cmlldmVSZWNvcmRMaW5lcykgLy8gUmV0cmlldmUgdGhlIHJlY29yZCBsaW5lcyBmcm9tIHRoZSBDU1ZcbiAgICAgICAgICAgIC50aGVuKHRyYW5zZm9ybVJlY29yZExpbmVzKSAvLyBSZXRyaWV2ZSB0aGUgSlNPTiBkb2N1bWVudCBhcnJheVxuICAgICAgICAgICAgLnRoZW4oKHBhcmFtcykgPT4gY2FsbGJhY2sobnVsbCwgcGFyYW1zLmpzb24pKSAvLyBTZW5kIHRoZSBkYXRhIGJhY2sgdG8gdGhlIGNhbGxlclxuICAgICAgICAgICAgLmNhdGNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb252ZXJ0LFxuICAgICAgICB2YWxpZGF0aW9uRm46IHV0aWxzLmlzU3RyaW5nLFxuICAgICAgICB2YWxpZGF0aW9uTWVzc2FnZXM6IGNvbnN0YW50cy5lcnJvcnMuY3N2Mmpzb25cbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IENzdjJKc29uIH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBwYXRoID0gcmVxdWlyZSgnZG9jLXBhdGgnKSxcbiAgICBkZWVrcyA9IHJlcXVpcmUoJ2RlZWtzJyksXG4gICAgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanNvbicpLFxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5jb25zdCBKc29uMkNzdiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBjb25zdCB3cmFwRGVsaW1pdGVyQ2hlY2tSZWdleCA9IG5ldyBSZWdFeHAob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCwgJ2cnKSxcbiAgICAgICAgY3JsZlNlYXJjaFJlZ2V4ID0gL1xccj9cXG58XFxyLyxcbiAgICAgICAgZXhwYW5kaW5nV2l0aG91dFVud2luZGluZyA9IG9wdGlvbnMuZXhwYW5kQXJyYXlPYmplY3RzICYmICFvcHRpb25zLnVud2luZEFycmF5cyxcbiAgICAgICAgZGVla3NPcHRpb25zID0ge1xuICAgICAgICAgICAgZXhwYW5kQXJyYXlPYmplY3RzOiBleHBhbmRpbmdXaXRob3V0VW53aW5kaW5nLFxuICAgICAgICAgICAgaWdub3JlRW1wdHlBcnJheXNXaGVuRXhwYW5kaW5nOiBleHBhbmRpbmdXaXRob3V0VW53aW5kaW5nXG4gICAgICAgIH07XG5cbiAgICAvKiogSEVBREVSIEZJRUxEIEZVTkNUSU9OUyAqKi9cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGxpc3Qgb2YgZGF0YSBmaWVsZCBuYW1lcyBvZiBhbGwgZG9jdW1lbnRzIGluIHRoZSBwcm92aWRlZCBsaXN0XG4gICAgICogQHBhcmFtIGRhdGEge0FycmF5PE9iamVjdD59IERhdGEgdG8gYmUgY29udmVydGVkXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5W1N0cmluZ10+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEZpZWxkTmFtZUxpc3QoZGF0YSkge1xuICAgICAgICAvLyBJZiBrZXlzIHdlcmVuJ3Qgc3BlY2lmaWVkLCB0aGVuIHdlJ2xsIHVzZSB0aGUgbGlzdCBvZiBrZXlzIGdlbmVyYXRlZCBieSB0aGUgZGVla3MgbW9kdWxlXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZGVla3MuZGVlcEtleXNGcm9tTGlzdChkYXRhLCBkZWVrc09wdGlvbnMpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzZXMgdGhlIHNjaGVtYXMgYnkgY2hlY2tpbmcgZm9yIHNjaGVtYSBkaWZmZXJlbmNlcywgaWYgc28gZGVzaXJlZC5cbiAgICAgKiBJZiBzY2hlbWEgZGlmZmVyZW5jZXMgYXJlIG5vdCB0byBiZSBjaGVja2VkLCB0aGVuIGl0IHJlc29sdmVzIHRoZSB1bmlxdWVcbiAgICAgKiBsaXN0IG9mIGZpZWxkIG5hbWVzLlxuICAgICAqIEBwYXJhbSBkb2N1bWVudFNjaGVtYXNcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXlbU3RyaW5nXT59XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1NjaGVtYXMoZG9jdW1lbnRTY2hlbWFzKSB7XG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHdhbnRzIHRvIGNoZWNrIGZvciB0aGUgc2FtZSBzY2hlbWEgKHJlZ2FyZGxlc3Mgb2Ygc2NoZW1hIG9yZGVyaW5nKVxuICAgICAgICBpZiAob3B0aW9ucy5jaGVja1NjaGVtYURpZmZlcmVuY2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hlY2tTY2hlbWFEaWZmZXJlbmNlcyhkb2N1bWVudFNjaGVtYXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBkbyBub3QgY2FyZSBpZiB0aGUgc2NoZW1hcyBhcmUgZGlmZmVyZW50LCBzbyB3ZSBzaG91bGQgZ2V0IHRoZSB1bmlxdWUgbGlzdCBvZiBrZXlzXG4gICAgICAgICAgICBsZXQgdW5pcXVlRmllbGROYW1lcyA9IHV0aWxzLnVuaXF1ZSh1dGlscy5mbGF0dGVuKGRvY3VtZW50U2NoZW1hcykpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmlxdWVGaWVsZE5hbWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gcGVyZm9ybXMgdGhlIHNjaGVtYSBkaWZmZXJlbmNlIGNoZWNrLCBpZiB0aGUgdXNlciBzcGVjaWZpZXMgdGhhdCBpdCBzaG91bGQgYmUgY2hlY2tlZC5cbiAgICAgKiBJZiB0aGVyZSBhcmUgbm8gZmllbGQgbmFtZXMsIHRoZW4gdGhlcmUgYXJlIG5vIGRpZmZlcmVuY2VzLlxuICAgICAqIE90aGVyd2lzZSwgd2UgZ2V0IHRoZSBmaXJzdCBzY2hlbWEgYW5kIHRoZSByZW1haW5pbmcgbGlzdCBvZiBzY2hlbWFzXG4gICAgICogQHBhcmFtIGRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNoZWNrU2NoZW1hRGlmZmVyZW5jZXMoZG9jdW1lbnRTY2hlbWFzKSB7XG4gICAgICAgIC8vIGhhdmUgbXVsdGlwbGUgZG9jdW1lbnRzIC0gZW5zdXJlIG9ubHkgb25lIHNjaGVtYSAocmVnYXJkbGVzcyBvZiBmaWVsZCBvcmRlcmluZylcbiAgICAgICAgbGV0IGZpcnN0RG9jU2NoZW1hID0gZG9jdW1lbnRTY2hlbWFzWzBdLFxuICAgICAgICAgICAgcmVzdE9mRG9jdW1lbnRTY2hlbWFzID0gZG9jdW1lbnRTY2hlbWFzLnNsaWNlKDEpLFxuICAgICAgICAgICAgc2NoZW1hRGlmZmVyZW5jZXMgPSBjb21wdXRlTnVtYmVyT2ZTY2hlbWFEaWZmZXJlbmNlcyhmaXJzdERvY1NjaGVtYSwgcmVzdE9mRG9jdW1lbnRTY2hlbWFzKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgc2NoZW1hIGluY29uc2lzdGVuY2llcywgdGhyb3cgYSBzY2hlbWEgbm90IHRoZSBzYW1lIGVycm9yXG4gICAgICAgIGlmIChzY2hlbWFEaWZmZXJlbmNlcykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihjb25zdGFudHMuZXJyb3JzLmpzb24yY3N2Lm5vdFNhbWVTY2hlbWEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmlyc3REb2NTY2hlbWEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXB1dGVzIHRoZSBudW1iZXIgb2Ygc2NoZW1hIGRpZmZlcmVuY2VzXG4gICAgICogQHBhcmFtIGZpcnN0RG9jU2NoZW1hXG4gICAgICogQHBhcmFtIHJlc3RPZkRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXB1dGVOdW1iZXJPZlNjaGVtYURpZmZlcmVuY2VzKGZpcnN0RG9jU2NoZW1hLCByZXN0T2ZEb2N1bWVudFNjaGVtYXMpIHtcbiAgICAgICAgcmV0dXJuIHJlc3RPZkRvY3VtZW50U2NoZW1hcy5yZWR1Y2UoKHNjaGVtYURpZmZlcmVuY2VzLCBkb2N1bWVudFNjaGVtYSkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHNjaGVtYXMsIGluY3JlbWVudCB0aGUgY291bnRlciBvZiBzY2hlbWEgaW5jb25zaXN0ZW5jaWVzXG4gICAgICAgICAgICBsZXQgbnVtYmVyT2ZEaWZmZXJlbmNlcyA9IHV0aWxzLmNvbXB1dGVTY2hlbWFEaWZmZXJlbmNlcyhmaXJzdERvY1NjaGVtYSwgZG9jdW1lbnRTY2hlbWEpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBudW1iZXJPZkRpZmZlcmVuY2VzID4gMFxuICAgICAgICAgICAgICAgID8gc2NoZW1hRGlmZmVyZW5jZXMgKyAxXG4gICAgICAgICAgICAgICAgOiBzY2hlbWFEaWZmZXJlbmNlcztcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgc28gc3BlY2lmaWVkLCB0aGlzIHNvcnRzIHRoZSBoZWFkZXIgZmllbGQgbmFtZXMgYWxwaGFiZXRpY2FsbHlcbiAgICAgKiBAcGFyYW0gZmllbGROYW1lcyB7QXJyYXk8U3RyaW5nPn1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8U3RyaW5nPn0gc29ydGVkIGZpZWxkIG5hbWVzLCBvciB1bnNvcnRlZCBpZiBzb3J0aW5nIG5vdCBzcGVjaWZpZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzb3J0SGVhZGVyRmllbGRzKGZpZWxkTmFtZXMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuc29ydEhlYWRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkTmFtZXMuc29ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZE5hbWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSBoZWFkZXIgZmllbGRzLCBpZiB0aGUgdXNlciBkZXNpcmVzIHRoZW0gdG8gYmUgdHJpbW1lZC5cbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbUhlYWRlckZpZWxkcyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUhlYWRlckZpZWxkcykge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMubWFwKChmaWVsZCkgPT4gZmllbGQuc3BsaXQoJy4nKVxuICAgICAgICAgICAgICAgIC5tYXAoKGNvbXBvbmVudCkgPT4gY29tcG9uZW50LnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuam9pbignLicpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JhcCB0aGUgaGVhZGluZ3MsIGlmIGRlc2lyZWQgYnkgdGhlIHVzZXIuXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBIZWFkZXJGaWVsZHMocGFyYW1zKSB7XG4gICAgICAgIC8vIG9ubHkgcGVyZm9ybSB0aGlzIGlmIHdlIGFyZSBhY3R1YWxseSBwcmVwZW5kaW5nIHRoZSBoZWFkZXJcbiAgICAgICAgaWYgKG9wdGlvbnMucHJlcGVuZEhlYWRlcikge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMubWFwKGZ1bmN0aW9uKGhlYWRpbmdLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcEZpZWxkVmFsdWVJZk5lY2Vzc2FyeShoZWFkaW5nS2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIHRoZSBDU1YgaGVhZGVyIHN0cmluZyBieSBqb2luaW5nIHRoZSBoZWFkZXJGaWVsZHMgYnkgdGhlIGZpZWxkIGRlbGltaXRlclxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNzdkhlYWRlcihwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLmhlYWRlciA9IHBhcmFtcy5oZWFkZXJGaWVsZHMuam9pbihvcHRpb25zLmRlbGltaXRlci5maWVsZCk7XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGhlYWRpbmdzIGZvciBhbGwgZG9jdW1lbnRzIGFuZCByZXR1cm4gaXQuXG4gICAgICogVGhpcyBjaGVja3MgdGhhdCBhbGwgZG9jdW1lbnRzIGhhdmUgdGhlIHNhbWUgc2NoZW1hLlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVIZWFkZXJGaWVsZHMoZGF0YSkge1xuICAgICAgICBpZiAob3B0aW9ucy5rZXlzICYmICFvcHRpb25zLnVud2luZEFycmF5cykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShvcHRpb25zLmtleXMpXG4gICAgICAgICAgICAgICAgLnRoZW4oc29ydEhlYWRlckZpZWxkcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2V0RmllbGROYW1lTGlzdChkYXRhKVxuICAgICAgICAgICAgLnRoZW4ocHJvY2Vzc1NjaGVtYXMpXG4gICAgICAgICAgICAudGhlbihzb3J0SGVhZGVyRmllbGRzKTtcbiAgICB9XG5cbiAgICAvKiogUkVDT1JEIEZJRUxEIEZVTkNUSU9OUyAqKi9cblxuICAgIC8qKlxuICAgICAqIFVud2luZHMgb2JqZWN0cyBpbiBhcnJheXMgd2l0aGluIHJlY29yZCBvYmplY3RzIGlmIHRoZSB1c2VyIHNwZWNpZmllcyB0aGVcbiAgICAgKiAgIGV4cGFuZEFycmF5T2JqZWN0cyBvcHRpb24uIElmIG5vdCBzcGVjaWZpZWQsIHRoaXMgcGFzc2VzIHRoZSBwYXJhbXNcbiAgICAgKiAgIGFyZ3VtZW50IHRocm91Z2ggdG8gdGhlIG5leHQgZnVuY3Rpb24gaW4gdGhlIHByb21pc2UgY2hhaW4uXG4gICAgICogQHBhcmFtIHBhcmFtcyB7T2JqZWN0fVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHVud2luZFJlY29yZHNJZk5lY2Vzc2FyeShwYXJhbXMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudW53aW5kQXJyYXlzKSB7XG4gICAgICAgICAgICBjb25zdCBvcmlnaW5hbFJlY29yZHNMZW5ndGggPSBwYXJhbXMucmVjb3Jkcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIC8vIFVud2luZCBlYWNoIG9mIHRoZSBkb2N1bWVudHMgYXQgdGhlIGdpdmVuIGhlYWRlckZpZWxkXG4gICAgICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzLmZvckVhY2goKGhlYWRlckZpZWxkKSA9PiB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLnJlY29yZHMgPSB1dGlscy51bndpbmQocGFyYW1zLnJlY29yZHMsIGhlYWRlckZpZWxkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gcmV0cmlldmVIZWFkZXJGaWVsZHMocGFyYW1zLnJlY29yZHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGhlYWRlckZpZWxkcykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzID0gaGVhZGVyRmllbGRzO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIHdlcmUgYWJsZSB0byB1bndpbmQgbW9yZSBhcnJheXMsIHRoZW4gdHJ5IHVud2luZGluZyBhZ2Fpbi4uLlxuICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxSZWNvcmRzTGVuZ3RoICE9PSBwYXJhbXMucmVjb3Jkcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB1bndpbmRSZWNvcmRzSWZOZWNlc3NhcnkocGFyYW1zKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGRpZG4ndCB1bndpbmQgYW55IGFkZGl0aW9uYWwgYXJyYXlzLCBzbyBjb250aW51ZS4uLlxuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIGtleXMgd2VyZSBwcm92aWRlZCwgc2V0IHRoZSBoZWFkZXJGaWVsZHMgdG8gdGhlIHByb3ZpZGVkIGtleXM6XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmtleXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBvcHRpb25zLmtleXM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1haW4gZnVuY3Rpb24gd2hpY2ggaGFuZGxlcyB0aGUgcHJvY2Vzc2luZyBvZiBhIHJlY29yZCwgb3IgZG9jdW1lbnQgdG8gYmUgY29udmVydGVkIHRvIENTViBmb3JtYXRcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNwZWNpZmllcyBhbmQgcGVyZm9ybXMgdGhlIG5lY2Vzc2FyeSBvcGVyYXRpb25zIGluIHRoZSBuZWNlc3Nhcnkgb3JkZXJcbiAgICAgKiBpbiBvcmRlciB0byBvYnRhaW4gdGhlIGRhdGEgYW5kIGNvbnZlcnQgaXQgdG8gQ1NWIGZvcm0gd2hpbGUgbWFpbnRhaW5pbmcgUkZDIDQxODAgY29tcGxpYW5jZS5cbiAgICAgKiAqIE9yZGVyIG9mIG9wZXJhdGlvbnM6XG4gICAgICogLSBHZXQgZmllbGRzIGZyb20gcHJvdmlkZWQga2V5IGxpc3QgKGFzIGFycmF5IG9mIGFjdHVhbCB2YWx1ZXMpXG4gICAgICogLSBDb252ZXJ0IHRoZSB2YWx1ZXMgdG8gY3N2L3N0cmluZyByZXByZXNlbnRhdGlvbiBbcG9zc2libGUgb3B0aW9uIGhlcmUgZm9yIGN1c3RvbSBjb252ZXJ0ZXJzP11cbiAgICAgKiAtIFRyaW0gZmllbGRzXG4gICAgICogLSBEZXRlcm1pbmUgaWYgdGhleSBuZWVkIHRvIGJlIHdyYXBwZWQgKCYgd3JhcCBpZiBuZWNlc3NhcnkpXG4gICAgICogLSBDb21iaW5lIHZhbHVlcyBmb3IgZWFjaCBsaW5lIChieSBqb2luaW5nIGJ5IGZpZWxkIGRlbGltaXRlcilcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1JlY29yZHMocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5yZWNvcmRzID0gcGFyYW1zLnJlY29yZHMubWFwKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIC8vIFJldHJpZXZlIGRhdGEgZm9yIGVhY2ggb2YgdGhlIGhlYWRlckZpZWxkcyBmcm9tIHRoaXMgcmVjb3JkXG4gICAgICAgICAgICBsZXQgcmVjb3JkRmllbGREYXRhID0gcmV0cmlldmVSZWNvcmRGaWVsZERhdGEocmVjb3JkLCBwYXJhbXMuaGVhZGVyRmllbGRzKSxcblxuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgaW4gdGhpcyByZWNvcmQgYW5kIHJldHVybiB0aGVcbiAgICAgICAgICAgICAgICBwcm9jZXNzZWRSZWNvcmREYXRhID0gcmVjb3JkRmllbGREYXRhLm1hcCgoZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdHJpbVJlY29yZEZpZWxkVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSByZWNvcmRGaWVsZFZhbHVlVG9TdHJpbmcoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB3cmFwRmllbGRWYWx1ZUlmTmVjZXNzYXJ5KGZpZWxkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBKb2luIHRoZSByZWNvcmQgZGF0YSBieSB0aGUgZmllbGQgZGVsaW1pdGVyXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVDc3ZSb3dGcm9tUmVjb3JkKHByb2Nlc3NlZFJlY29yZERhdGEpO1xuICAgICAgICB9KS5qb2luKG9wdGlvbnMuZGVsaW1pdGVyLmVvbCk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gaW50ZW5kZWQgdG8gcHJvY2VzcyAqanVzdCogYXJyYXkgdmFsdWVzIHdoZW4gdGhlIGV4cGFuZEFycmF5T2JqZWN0cyBzZXR0aW5nIGlzIHNldCB0byB0cnVlXG4gICAgICogQHBhcmFtIHJlY29yZEZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn0gcHJvY2Vzc2VkIGFycmF5IHZhbHVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1JlY29yZEZpZWxkRGF0YUZvckV4cGFuZGVkQXJyYXlPYmplY3QocmVjb3JkRmllbGRWYWx1ZSkge1xuICAgICAgICBsZXQgZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlID0gdXRpbHMucmVtb3ZlRW1wdHlGaWVsZHMocmVjb3JkRmllbGRWYWx1ZSk7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBhcnJheSBhbmQgaXQncyBlaXRoZXIgZW1wdHkgb2YgZnVsbCBvZiBlbXB0eSB2YWx1ZXMsIHRoZW4gdXNlIGFuIGVtcHR5IHZhbHVlIHJlcHJlc2VudGF0aW9uXG4gICAgICAgIGlmICghcmVjb3JkRmllbGRWYWx1ZS5sZW5ndGggfHwgIWZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmVtcHR5RmllbGRWYWx1ZSB8fCAnJztcbiAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJlZFJlY29yZEZpZWxkVmFsdWUubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGhhdmUgYW4gYXJyYXkgb2YgYWN0dWFsIHZhbHVlcy4uLlxuICAgICAgICAgICAgLy8gU2luY2Ugd2UgYXJlIGV4cGFuZGluZyBhcnJheSBvYmplY3RzLCB3ZSB3aWxsIHdhbnQgdG8ga2V5IGluIG9uIHZhbHVlcyBvZiBvYmplY3RzLlxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZVswXTsgLy8gRXh0cmFjdCB0aGUgc2luZ2xlIHZhbHVlIGluIHRoZSBhcnJheVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlY29yZEZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgZmllbGQgdmFsdWVzIGZyb20gYSBwYXJ0aWN1bGFyIHJlY29yZCBmb3IgdGhlIGdpdmVuIGxpc3Qgb2YgZmllbGRzXG4gICAgICogQHBhcmFtIHJlY29yZFxuICAgICAqIEBwYXJhbSBmaWVsZHNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVSZWNvcmRGaWVsZERhdGEocmVjb3JkLCBmaWVsZHMpIHtcbiAgICAgICAgbGV0IHJlY29yZFZhbHVlcyA9IFtdO1xuXG4gICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlY29yZEZpZWxkVmFsdWUgPSBwYXRoLmV2YWx1YXRlUGF0aChyZWNvcmQsIGZpZWxkKTtcblxuICAgICAgICAgICAgaWYgKCF1dGlscy5pc1VuZGVmaW5lZChvcHRpb25zLmVtcHR5RmllbGRWYWx1ZSkgJiYgdXRpbHMuaXNFbXB0eUZpZWxkKHJlY29yZEZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkRmllbGRWYWx1ZSA9IG9wdGlvbnMuZW1wdHlGaWVsZFZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmV4cGFuZEFycmF5T2JqZWN0cyAmJiBBcnJheS5pc0FycmF5KHJlY29yZEZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkRmllbGRWYWx1ZSA9IHByb2Nlc3NSZWNvcmRGaWVsZERhdGFGb3JFeHBhbmRlZEFycmF5T2JqZWN0KHJlY29yZEZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZWNvcmRWYWx1ZXMucHVzaChyZWNvcmRGaWVsZFZhbHVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHJlY29yZFZhbHVlcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0cyBhIHJlY29yZCBmaWVsZCB2YWx1ZSB0byBpdHMgc3RyaW5nIHJlcHJlc2VudGF0aW9uXG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZWNvcmRGaWVsZFZhbHVlVG9TdHJpbmcoZmllbGRWYWx1ZSkge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShmaWVsZFZhbHVlKSB8fCB1dGlscy5pc09iamVjdChmaWVsZFZhbHVlKSAmJiAhdXRpbHMuaXNEYXRlKGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoZmllbGRWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNVbmRlZmluZWQoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc051bGwoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gIW9wdGlvbnMudXNlTG9jYWxlRm9ybWF0ID8gZmllbGRWYWx1ZS50b1N0cmluZygpIDogZmllbGRWYWx1ZS50b0xvY2FsZVN0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIHJlY29yZCBmaWVsZCB2YWx1ZSwgaWYgc3BlY2lmaWVkIGJ5IHRoZSB1c2VyJ3MgcHJvdmlkZWQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbVJlY29yZEZpZWxkVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICBpZiAob3B0aW9ucy50cmltRmllbGRWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUubWFwKHRyaW1SZWNvcmRGaWVsZFZhbHVlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNTdHJpbmcoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFc2NhcGVzIHF1b3RhdGlvbiBtYXJrcyBpbiB0aGUgZmllbGQgdmFsdWUsIGlmIG5lY2Vzc2FyeSwgYW5kIGFwcHJvcHJpYXRlbHlcbiAgICAgKiB3cmFwcyB0aGUgcmVjb3JkIGZpZWxkIHZhbHVlIGlmIGl0IGNvbnRhaW5zIGEgY29tbWEgKGZpZWxkIGRlbGltaXRlciksXG4gICAgICogcXVvdGF0aW9uIG1hcmsgKHdyYXAgZGVsaW1pdGVyKSwgb3IgYSBsaW5lIGJyZWFrIChDUkxGKVxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JhcEZpZWxkVmFsdWVJZk5lY2Vzc2FyeShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHdyYXBEZWxpbWl0ZXIgPSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuXG4gICAgICAgIC8vIGVnLiBpbmNsdWRlcyBxdW90YXRpb24gbWFya3MgKGRlZmF1bHQgZGVsaW1pdGVyKVxuICAgICAgICBpZiAoZmllbGRWYWx1ZS5pbmNsdWRlcyhvcHRpb25zLmRlbGltaXRlci53cmFwKSkge1xuICAgICAgICAgICAgLy8gYWRkIGFuIGFkZGl0aW9uYWwgcXVvdGF0aW9uIG1hcmsgYmVmb3JlIGVhY2ggcXVvdGF0aW9uIG1hcmsgYXBwZWFyaW5nIGluIHRoZSBmaWVsZCB2YWx1ZVxuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkVmFsdWUucmVwbGFjZSh3cmFwRGVsaW1pdGVyQ2hlY2tSZWdleCwgd3JhcERlbGltaXRlciArIHdyYXBEZWxpbWl0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHRoZSBmaWVsZCBjb250YWlucyBhIGNvbW1hIChmaWVsZCBkZWxpbWl0ZXIpLCBxdW90YXRpb24gbWFyayAod3JhcCBkZWxpbWl0ZXIpLCBsaW5lIGJyZWFrLCBvciBDUkxGXG4gICAgICAgIC8vICAgdGhlbiBlbmNsb3NlIGl0IGluIHF1b3RhdGlvbiBtYXJrcyAod3JhcCBkZWxpbWl0ZXIpXG4gICAgICAgIGlmIChmaWVsZFZhbHVlLmluY2x1ZGVzKG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB8fFxuICAgICAgICAgICAgZmllbGRWYWx1ZS5pbmNsdWRlcyhvcHRpb25zLmRlbGltaXRlci53cmFwKSB8fFxuICAgICAgICAgICAgZmllbGRWYWx1ZS5tYXRjaChjcmxmU2VhcmNoUmVnZXgpKSB7XG4gICAgICAgICAgICAvLyB3cmFwIHRoZSBmaWVsZCdzIHZhbHVlIGluIGEgd3JhcCBkZWxpbWl0ZXIgKHF1b3RhdGlvbiBtYXJrcyBieSBkZWZhdWx0KVxuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHdyYXBEZWxpbWl0ZXIgKyBmaWVsZFZhbHVlICsgd3JhcERlbGltaXRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgQ1NWIHJlY29yZCBzdHJpbmcgYnkgam9pbmluZyB0aGUgZmllbGQgdmFsdWVzIHRvZ2V0aGVyIGJ5IHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgKiBAcGFyYW0gcmVjb3JkRmllbGRWYWx1ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNzdlJvd0Zyb21SZWNvcmQocmVjb3JkRmllbGRWYWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZEZpZWxkVmFsdWVzLmpvaW4ob3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpO1xuICAgIH1cblxuICAgIC8qKiBDU1YgQ09NUE9ORU5UIENPTUJJTkVSL0ZJTkFMIFBST0NFU1NPUiAqKi9cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyB0aGUgZmluYWwgQ1NWIGNvbnN0cnVjdGlvbiBieSBjb21iaW5pbmcgdGhlIGZpZWxkcyBpbiB0aGUgYXBwcm9wcmlhdGVcbiAgICAgKiBvcmRlciBkZXBlbmRpbmcgb24gdGhlIHByb3ZpZGVkIG9wdGlvbnMgdmFsdWVzIGFuZCBzZW5kcyB0aGUgZ2VuZXJhdGVkIENTVlxuICAgICAqIGJhY2sgdG8gdGhlIHVzZXJcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDc3ZGcm9tQ29tcG9uZW50cyhwYXJhbXMpIHtcbiAgICAgICAgbGV0IGhlYWRlciA9IHBhcmFtcy5oZWFkZXIsXG4gICAgICAgICAgICByZWNvcmRzID0gcGFyYW1zLnJlY29yZHMsXG5cbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBwcmVwZW5kaW5nIHRoZSBoZWFkZXIsIHRoZW4gYWRkIGFuIEVPTCwgb3RoZXJ3aXNlIGp1c3QgcmV0dXJuIHRoZSByZWNvcmRzXG4gICAgICAgICAgICBjc3YgPSAob3B0aW9ucy5leGNlbEJPTSA/IGNvbnN0YW50cy52YWx1ZXMuZXhjZWxCT00gOiAnJykgK1xuICAgICAgICAgICAgICAgIChvcHRpb25zLnByZXBlbmRIZWFkZXIgPyBoZWFkZXIgKyBvcHRpb25zLmRlbGltaXRlci5lb2wgOiAnJykgK1xuICAgICAgICAgICAgICAgIHJlY29yZHM7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5jYWxsYmFjayhudWxsLCBjc3YpO1xuICAgIH1cblxuICAgIC8qKiBNQUlOIENPTlZFUlRFUiBGVU5DVElPTiAqKi9cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsbHkgZXhwb3J0ZWQganNvbjJjc3YgZnVuY3Rpb25cbiAgICAgKiBUYWtlcyBkYXRhIGFzIGVpdGhlciBhIGRvY3VtZW50IG9yIGFycmF5IG9mIGRvY3VtZW50cyBhbmQgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBvcnQgdGhlIHJlc3VsdHNcbiAgICAgKiBAcGFyYW0gZGF0YSB7T2JqZWN0fEFycmF5PE9iamVjdD59IGRvY3VtZW50cyB0byBiZSBjb252ZXJ0ZWQgdG8gY3N2XG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb252ZXJ0KGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNpbmdsZSBkb2N1bWVudCwgbm90IGFuIGFycmF5XG4gICAgICAgIGlmICh1dGlscy5pc09iamVjdChkYXRhKSAmJiAhZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07IC8vIENvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdGhlIGdpdmVuIGRvY3VtZW50XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgaGVhZGluZyBhbmQgdGhlbiBnZW5lcmF0ZSB0aGUgQ1NWIHdpdGggdGhlIGtleXMgdGhhdCBhcmUgaWRlbnRpZmllZFxuICAgICAgICByZXRyaWV2ZUhlYWRlckZpZWxkcyhkYXRhKVxuICAgICAgICAgICAgLnRoZW4oKGhlYWRlckZpZWxkcykgPT4gKHtcbiAgICAgICAgICAgICAgICBoZWFkZXJGaWVsZHMsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgcmVjb3JkczogZGF0YVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAudGhlbih1bndpbmRSZWNvcmRzSWZOZWNlc3NhcnkpXG4gICAgICAgICAgICAudGhlbihwcm9jZXNzUmVjb3JkcylcbiAgICAgICAgICAgIC50aGVuKHdyYXBIZWFkZXJGaWVsZHMpXG4gICAgICAgICAgICAudGhlbih0cmltSGVhZGVyRmllbGRzKVxuICAgICAgICAgICAgLnRoZW4oZ2VuZXJhdGVDc3ZIZWFkZXIpXG4gICAgICAgICAgICAudGhlbihnZW5lcmF0ZUNzdkZyb21Db21wb25lbnRzKVxuICAgICAgICAgICAgLmNhdGNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb252ZXJ0LFxuICAgICAgICB2YWxpZGF0aW9uRm46IHV0aWxzLmlzT2JqZWN0LFxuICAgICAgICB2YWxpZGF0aW9uTWVzc2FnZXM6IGNvbnN0YW50cy5lcnJvcnMuanNvbjJjc3ZcbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IEpzb24yQ3N2IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBwYXRoID0gcmVxdWlyZSgnZG9jLXBhdGgnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy5qc29uJyk7XG5cbmNvbnN0IGRhdGVTdHJpbmdSZWdleCA9IC9cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfS5cXGR7M31aLztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNTdHJpbmdSZXByZXNlbnRhdGlvbixcbiAgICBpc0RhdGVSZXByZXNlbnRhdGlvbixcbiAgICBjb21wdXRlU2NoZW1hRGlmZmVyZW5jZXMsXG4gICAgZGVlcENvcHksXG4gICAgY29udmVydCxcbiAgICBpc0VtcHR5RmllbGQsXG4gICAgcmVtb3ZlRW1wdHlGaWVsZHMsXG4gICAgZ2V0TkNoYXJhY3RlcnMsXG4gICAgdW53aW5kLFxuICAgIGlzSW52YWxpZCxcblxuICAgIC8vIHVuZGVyc2NvcmUgcmVwbGFjZW1lbnRzOlxuICAgIGlzU3RyaW5nLFxuICAgIGlzTnVsbCxcbiAgICBpc0Vycm9yLFxuICAgIGlzRGF0ZSxcbiAgICBpc1VuZGVmaW5lZCxcbiAgICBpc09iamVjdCxcbiAgICB1bmlxdWUsXG4gICAgZmxhdHRlblxufTtcblxuLyoqXG4gKiBCdWlsZCB0aGUgb3B0aW9ucyB0byBiZSBwYXNzZWQgdG8gdGhlIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG4gKiBJZiBhIHVzZXIgZG9lcyBub3QgcHJvdmlkZSBjdXN0b20gb3B0aW9ucywgdGhlbiB3ZSB1c2Ugb3VyIGRlZmF1bHRcbiAqIElmIG9wdGlvbnMgYXJlIHByb3ZpZGVkLCB0aGVuIHdlIHNldCBlYWNoIHZhbGlkIGtleSB0aGF0IHdhcyBwYXNzZWRcbiAqIEBwYXJhbSBvcHRzIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0XG4gKiBAcmV0dXJuIHtPYmplY3R9IG9wdGlvbnMgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIGJ1aWxkT3B0aW9ucyhvcHRzKSB7XG4gICAgb3B0cyA9IHsuLi5jb25zdGFudHMuZGVmYXVsdE9wdGlvbnMsIC4uLm9wdHMgfHwge319O1xuXG4gICAgLy8gTm90ZTogT2JqZWN0LmFzc2lnbiBkb2VzIGEgc2hhbGxvdyBkZWZhdWx0LCB3ZSBuZWVkIHRvIGRlZXAgY29weSB0aGUgZGVsaW1pdGVyIG9iamVjdFxuICAgIG9wdHMuZGVsaW1pdGVyID0gey4uLmNvbnN0YW50cy5kZWZhdWx0T3B0aW9ucy5kZWxpbWl0ZXIsIC4uLm9wdHMuZGVsaW1pdGVyfTtcblxuICAgIC8vIE90aGVyd2lzZSwgc2VuZCB0aGUgb3B0aW9ucyBiYWNrXG4gICAgcmV0dXJuIG9wdHM7XG59XG5cbi8qKlxuICogV2hlbiBwcm9taXNpZmllZCwgdGhlIGNhbGxiYWNrIGFuZCBvcHRpb25zIGFyZ3VtZW50IG9yZGVyaW5nIGlzIHN3YXBwZWQsIHNvXG4gKiB0aGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGRldGVybWluZSB3aGljaCBhcmd1bWVudCBpcyB3aGljaCBhbmQgcmV0dXJuXG4gKiB0aGVtIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gKiBAcGFyYW0gYXJnMSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRpb25zIG9yIGNhbGxiYWNrXG4gKiBAcGFyYW0gYXJnMiB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRpb25zIG9yIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzKGFyZzEsIGFyZzIpIHtcbiAgICAvLyBJZiB0aGlzIHdhcyBwcm9taXNpZmllZCAoY2FsbGJhY2sgYW5kIG9wdHMgYXJlIHN3YXBwZWQpIHRoZW4gZml4IHRoZSBhcmd1bWVudCBvcmRlci5cbiAgICBpZiAoaXNPYmplY3QoYXJnMSkgJiYgIWlzRnVuY3Rpb24oYXJnMSkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wdGlvbnM6IGFyZzEsXG4gICAgICAgICAgICBjYWxsYmFjazogYXJnMlxuICAgICAgICB9O1xuICAgIH1cbiAgICAvLyBSZWd1bGFyIG9yZGVyaW5nIHdoZXJlIHRoZSBjYWxsYmFjayBpcyBwcm92aWRlZCBiZWZvcmUgdGhlIG9wdGlvbnMgb2JqZWN0XG4gICAgcmV0dXJuIHtcbiAgICAgICAgb3B0aW9uczogYXJnMixcbiAgICAgICAgY2FsbGJhY2s6IGFyZzFcbiAgICB9O1xufVxuXG4vKipcbiAqIFZhbGlkYXRlcyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgaW4gdG8ganNvbjJjc3YgYW5kIGNzdjJqc29uXG4gKiBAcGFyYW0gY29uZmlnIHtPYmplY3R9IG9mIHRoZSBmb3JtOiB7IGRhdGE6IHtBbnl9LCBjYWxsYmFjazoge0Z1bmN0aW9ufSwgZGF0YUNoZWNrRm46IEZ1bmN0aW9uLCBlcnJvck1lc3NhZ2VzOiB7T2JqZWN0fSB9XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlUGFyYW1ldGVycyhjb25maWcpIHtcbiAgICAvLyBJZiBhIGNhbGxiYWNrIHdhc24ndCBwcm92aWRlZCwgdGhyb3cgYW4gZXJyb3JcbiAgICBpZiAoIWNvbmZpZy5jYWxsYmFjaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoY29uc3RhbnRzLmVycm9ycy5jYWxsYmFja1JlcXVpcmVkKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBkb24ndCByZWNlaXZlIGRhdGEsIHJlcG9ydCBhbiBlcnJvclxuICAgIGlmICghY29uZmlnLmRhdGEpIHtcbiAgICAgICAgY29uZmlnLmNhbGxiYWNrKG5ldyBFcnJvcihjb25maWcuZXJyb3JNZXNzYWdlcy5jYW5ub3RDYWxsT24gKyBjb25maWcuZGF0YSArICcuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gVGhlIGRhdGEgcHJvdmlkZWQgZGF0YSBkb2VzIG5vdCBtZWV0IHRoZSB0eXBlIGNoZWNrIHJlcXVpcmVtZW50XG4gICAgaWYgKCFjb25maWcuZGF0YUNoZWNrRm4oY29uZmlnLmRhdGEpKSB7XG4gICAgICAgIGNvbmZpZy5jYWxsYmFjayhuZXcgRXJyb3IoY29uZmlnLmVycm9yTWVzc2FnZXMuZGF0YUNoZWNrRmFpbHVyZSkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZGlkbid0IGhpdCBhbnkga25vd24gZXJyb3IgY29uZGl0aW9ucywgdGhlbiB0aGUgZGF0YSBpcyBzbyBmYXIgZGV0ZXJtaW5lZCB0byBiZSB2YWxpZFxuICAgIC8vIE5vdGU6IGpzb24yY3N2L2NzdjJqc29uIG1heSBwZXJmb3JtIGFkZGl0aW9uYWwgdmFsaWRpdHkgY2hlY2tzIG9uIHRoZSBkYXRhXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQWJzdHJhY3RlZCBmdW5jdGlvbiB0byBwZXJmb3JtIHRoZSBjb252ZXJzaW9uIG9mIGpzb24tLT5jc3Ygb3IgY3N2LS0+anNvblxuICogZGVwZW5kaW5nIG9uIHRoZSBjb252ZXJ0ZXIgY2xhc3MgdGhhdCBpcyBwYXNzZWQgdmlhIHRoZSBwYXJhbXMgb2JqZWN0XG4gKiBAcGFyYW0gcGFyYW1zIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnQocGFyYW1zKSB7XG4gICAgbGV0IHtvcHRpb25zLCBjYWxsYmFja30gPSBwYXJzZUFyZ3VtZW50cyhwYXJhbXMuY2FsbGJhY2ssIHBhcmFtcy5vcHRpb25zKTtcbiAgICBvcHRpb25zID0gYnVpbGRPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgbGV0IGNvbnZlcnRlciA9IG5ldyBwYXJhbXMuY29udmVydGVyKG9wdGlvbnMpLFxuXG4gICAgICAgIC8vIFZhbGlkYXRlIHRoZSBwYXJhbWV0ZXJzIGJlZm9yZSBjYWxsaW5nIHRoZSBjb252ZXJ0ZXIncyBjb252ZXJ0IGZ1bmN0aW9uXG4gICAgICAgIHZhbGlkID0gdmFsaWRhdGVQYXJhbWV0ZXJzKHtcbiAgICAgICAgICAgIGRhdGE6IHBhcmFtcy5kYXRhLFxuICAgICAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJvck1lc3NhZ2VzOiBjb252ZXJ0ZXIudmFsaWRhdGlvbk1lc3NhZ2VzLFxuICAgICAgICAgICAgZGF0YUNoZWNrRm46IGNvbnZlcnRlci52YWxpZGF0aW9uRm5cbiAgICAgICAgfSk7XG5cbiAgICBpZiAodmFsaWQpIGNvbnZlcnRlci5jb252ZXJ0KHBhcmFtcy5kYXRhLCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiB0byBkZWVwIGNvcHkgYW4gb2JqZWN0LCB1c2VkIGJ5IHRoZSBtb2R1bGUgdGVzdHNcbiAqIEBwYXJhbSBvYmpcbiAqIEByZXR1cm5zIHthbnl9XG4gKi9cbmZ1bmN0aW9uIGRlZXBDb3B5KG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgdmFsdWUgaXMgYSByZXByZXNlbnRhdGlvblxuICogICBvZiBhIHN0cmluZy4gR2l2ZW4gdGhlIFJGQzQxODAgcmVxdWlyZW1lbnRzLCB0aGF0IG1lYW5zIHRoYXQgdGhlIHZhbHVlIGlzXG4gKiAgIHdyYXBwZWQgaW4gdmFsdWUgd3JhcCBkZWxpbWl0ZXJzICh1c3VhbGx5IGEgcXVvdGF0aW9uIG1hcmsgb24gZWFjaCBzaWRlKS5cbiAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nUmVwcmVzZW50YXRpb24oZmllbGRWYWx1ZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGZpcnN0Q2hhciA9IGZpZWxkVmFsdWVbMF0sXG4gICAgICAgIGxhc3RJbmRleCA9IGZpZWxkVmFsdWUubGVuZ3RoIC0gMSxcbiAgICAgICAgbGFzdENoYXIgPSBmaWVsZFZhbHVlW2xhc3RJbmRleF07XG5cbiAgICAvLyBJZiB0aGUgZmllbGQgc3RhcnRzIGFuZCBlbmRzIHdpdGggYSB3cmFwIGRlbGltaXRlclxuICAgIHJldHVybiBmaXJzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgbGFzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXA7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhIHJlcHJlc2VudGF0aW9uXG4gKiAgIG9mIGEgZGF0ZS5cbiAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEYXRlUmVwcmVzZW50YXRpb24oZmllbGRWYWx1ZSkge1xuICAgIHJldHVybiBkYXRlU3RyaW5nUmVnZXgudGVzdChmaWVsZFZhbHVlKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHRoZSBzY2hlbWEgZGlmZmVyZW5jZXMgYmV0d2VlbiB0d28gb2JqZWN0cy5cbiAqIEBwYXJhbSBzY2hlbWFBXG4gKiBAcGFyYW0gc2NoZW1hQlxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVTY2hlbWFEaWZmZXJlbmNlcyhzY2hlbWFBLCBzY2hlbWFCKSB7XG4gICAgcmV0dXJuIGFycmF5RGlmZmVyZW5jZShzY2hlbWFBLCBzY2hlbWFCKVxuICAgICAgICAuY29uY2F0KGFycmF5RGlmZmVyZW5jZShzY2hlbWFCLCBzY2hlbWFBKSk7XG59XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiB0byBjaGVjayBpZiBhIGZpZWxkIGlzIGNvbnNpZGVyZWQgZW1wdHkgc28gdGhhdCB0aGUgZW1wdHlGaWVsZFZhbHVlIGNhbiBiZSB1c2VkIGluc3RlYWRcbiAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFbXB0eUZpZWxkKGZpZWxkVmFsdWUpIHtcbiAgICByZXR1cm4gaXNVbmRlZmluZWQoZmllbGRWYWx1ZSkgfHwgaXNOdWxsKGZpZWxkVmFsdWUpIHx8IGZpZWxkVmFsdWUgPT09ICcnO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgZW1wdHkgZmllbGQgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gKiBAcGFyYW0gZmllbGRzXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RmllbGRzKGZpZWxkcykge1xuICAgIHJldHVybiBmaWVsZHMuZmlsdGVyKChmaWVsZCkgPT4gIWlzRW1wdHlGaWVsZChmaWVsZCkpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHJpZXZlcyB0aGUgbmV4dCBuIGNoYXJhY3RlcnMgZnJvbSB0aGUgc3RhcnQgaW5kZXggaW5cbiAqICAgdGhlIHN0cmluZyBpbmNsdWRpbmcgdGhlIGNoYXJhY3RlciBhdCB0aGUgc3RhcnQgaW5kZXguIFRoaXMgaXMgdXNlZCB0b1xuICogICBjaGVjayBpZiBhcmUgY3VycmVudGx5IGF0IGFuIEVPTCB2YWx1ZSwgc2luY2UgaXQgY291bGQgYmUgbXVsdGlwbGVcbiAqICAgY2hhcmFjdGVycyBpbiBsZW5ndGggKGVnLiAnXFxyXFxuJylcbiAqIEBwYXJhbSBzdHJcbiAqIEBwYXJhbSBzdGFydFxuICogQHBhcmFtIG5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldE5DaGFyYWN0ZXJzKHN0ciwgc3RhcnQsIG4pIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyBuKTtcbn1cblxuLyoqXG4gKiBUaGUgZm9sbG93aW5nIHVud2luZCBmdW5jdGlvbmFsaXR5IGlzIGEgaGVhdmlseSBtb2RpZmllZCB2ZXJzaW9uIG9mIEBlZHdpbmNlbidzXG4gKiB1bndpbmQgZXh0ZW5zaW9uIGZvciBsb2Rhc2guIFNpbmNlIGxvZGFzaCBpcyBhIGxhcmdlIHBhY2thZ2UgdG8gcmVxdWlyZSBpbixcbiAqIGFuZCBhbGwgb2YgdGhlIHJlcXVpcmVkIGZ1bmN0aW9uYWxpdHkgd2FzIGFscmVhZHkgYmVpbmcgaW1wb3J0ZWQsIGVpdGhlclxuICogbmF0aXZlbHkgb3Igd2l0aCBkb2MtcGF0aCwgSSBkZWNpZGVkIHRvIHJld3JpdGUgdGhlIG1ham9yaXR5IG9mIHRoZSBsb2dpY1xuICogc28gdGhhdCBhbiBhZGRpdGlvbmFsIGRlcGVuZGVuY3kgd291bGQgbm90IGJlIHJlcXVpcmVkLiBUaGUgb3JpZ2luYWwgY29kZVxuICogd2l0aCB0aGUgbG9kYXNoIGRlcGVuZGVuY3kgY2FuIGJlIGZvdW5kIGhlcmU6XG4gKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2Vkd2luY2VuL3Vud2luZC9ibG9iL21hc3Rlci9pbmRleC5qc1xuICovXG5cbi8qKlxuICogQ29yZSBmdW5jdGlvbiB0aGF0IHVud2luZHMgYW4gaXRlbSBhdCB0aGUgcHJvdmlkZWQgcGF0aFxuICogQHBhcmFtIGFjY3VtdWxhdG9yIHtBcnJheTxhbnk+fVxuICogQHBhcmFtIGl0ZW0ge2FueX1cbiAqIEBwYXJhbSBmaWVsZFBhdGgge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gdW53aW5kSXRlbShhY2N1bXVsYXRvciwgaXRlbSwgZmllbGRQYXRoKSB7XG4gICAgY29uc3QgdmFsdWVUb1Vud2luZCA9IHBhdGguZXZhbHVhdGVQYXRoKGl0ZW0sIGZpZWxkUGF0aCk7XG4gICAgbGV0IGNsb25lZCA9IGRlZXBDb3B5KGl0ZW0pO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVUb1Vud2luZCkgJiYgdmFsdWVUb1Vud2luZC5sZW5ndGgpIHtcbiAgICAgICAgdmFsdWVUb1Vud2luZC5mb3JFYWNoKCh2YWwpID0+IHtcbiAgICAgICAgICAgIGNsb25lZCA9IGRlZXBDb3B5KGl0ZW0pO1xuICAgICAgICAgICAgYWNjdW11bGF0b3IucHVzaChwYXRoLnNldFBhdGgoY2xvbmVkLCBmaWVsZFBhdGgsIHZhbCkpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVUb1Vud2luZCkgJiYgdmFsdWVUb1Vud2luZC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gUHVzaCBhbiBlbXB0eSBzdHJpbmcgc28gdGhlIHZhbHVlIGlzIGVtcHR5IHNpbmNlIHRoZXJlIGFyZSBubyB2YWx1ZXNcbiAgICAgICAgcGF0aC5zZXRQYXRoKGNsb25lZCwgZmllbGRQYXRoLCAnJyk7XG4gICAgICAgIGFjY3VtdWxhdG9yLnB1c2goY2xvbmVkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBhY2N1bXVsYXRvci5wdXNoKGNsb25lZCk7XG4gICAgfVxufVxuXG4vKipcbiAqIE1haW4gdW53aW5kIGZ1bmN0aW9uIHdoaWNoIHRha2VzIGFuIGFycmF5IGFuZCBhIGZpZWxkIHRvIHVud2luZC5cbiAqIEBwYXJhbSBhcnJheSB7QXJyYXk8YW55Pn1cbiAqIEBwYXJhbSBmaWVsZCB7U3RyaW5nfVxuICogQHJldHVybnMge0FycmF5PGFueT59XG4gKi9cbmZ1bmN0aW9uIHVud2luZChhcnJheSwgZmllbGQpIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBhcnJheS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIHVud2luZEl0ZW0ocmVzdWx0LCBpdGVtLCBmaWVsZCk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIEhlbHBlciBmdW5jdGlvbnMgd2hpY2ggd2VyZSBjcmVhdGVkIHRvIHJlbW92ZSB1bmRlcnNjb3JlanMgZnJvbSB0aGlzIHBhY2thZ2UuXG4gKi9cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVsbCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZTtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBFcnJvcl0nO1xufVxuXG5mdW5jdGlvbiBhcnJheURpZmZlcmVuY2UoYSwgYikge1xuICAgIHJldHVybiBhLmZpbHRlcigoeCkgPT4gIWIuaW5jbHVkZXMoeCkpO1xufVxuXG5mdW5jdGlvbiB1bmlxdWUoYXJyYXkpIHtcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQoYXJyYXkpXTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheSkge1xuICAgIHJldHVybiBbXS5jb25jYXQoLi4uYXJyYXkpO1xufVxuXG4vKipcbiAqIFVzZWQgdG8gaGVscCBhdm9pZCBpbmNvcnJlY3QgdmFsdWVzIHJldHVybmVkIGJ5IEpTT04ucGFyc2Ugd2hlbiBjb252ZXJ0aW5nXG4gKiBDU1YgYmFjayB0byBKU09OLCBzdWNoIGFzICczOWUxODA0JyB3aGljaCBKU09OLnBhcnNlIGNvbnZlcnRzIHRvIEluZmluaXR5XG4gKi9cbmZ1bmN0aW9uIGlzSW52YWxpZChwYXJzZWRKc29uKSB7XG4gICAgcmV0dXJuIHBhcnNlZEpzb24gPT09IEluZmluaXR5IHx8XG4gICAgICAgIHBhcnNlZEpzb24gPT09IC1JbmZpbml0eTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uIChnbG9iYWwpIHtcblxuICAgIC8vIG1pbmltYWwgc3ltYm9sIHBvbHlmaWxsIGZvciBJRTExIGFuZCBvdGhlcnNcbiAgICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgU3ltYm9sID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBTeW1ib2wubm9uTmF0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBTVEFURV9QTEFJTlRFWFQgPSBTeW1ib2woJ3BsYWludGV4dCcpO1xuICAgIGNvbnN0IFNUQVRFX0hUTUwgICAgICA9IFN5bWJvbCgnaHRtbCcpO1xuICAgIGNvbnN0IFNUQVRFX0NPTU1FTlQgICA9IFN5bWJvbCgnY29tbWVudCcpO1xuXG4gICAgY29uc3QgQUxMT1dFRF9UQUdTX1JFR0VYICA9IC88KFxcdyopPi9nO1xuICAgIGNvbnN0IE5PUk1BTElaRV9UQUdfUkVHRVggPSAvPFxcLz8oW15cXHNcXC8+XSspLztcblxuICAgIGZ1bmN0aW9uIHN0cmlwdGFncyhodG1sLCBhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGh0bWwgICAgICAgICAgICA9IGh0bWwgfHwgJyc7XG4gICAgICAgIGFsbG93YWJsZV90YWdzICA9IGFsbG93YWJsZV90YWdzIHx8IFtdO1xuICAgICAgICB0YWdfcmVwbGFjZW1lbnQgPSB0YWdfcmVwbGFjZW1lbnQgfHwgJyc7XG5cbiAgICAgICAgbGV0IGNvbnRleHQgPSBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIHN0cmlwdGFnc19pbnRlcm5hbChodG1sLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0X3N0cmlwdGFnc19zdHJlYW0oYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCkge1xuICAgICAgICBhbGxvd2FibGVfdGFncyAgPSBhbGxvd2FibGVfdGFncyB8fCBbXTtcbiAgICAgICAgdGFnX3JlcGxhY2VtZW50ID0gdGFnX3JlcGxhY2VtZW50IHx8ICcnO1xuXG4gICAgICAgIGxldCBjb250ZXh0ID0gaW5pdF9jb250ZXh0KGFsbG93YWJsZV90YWdzLCB0YWdfcmVwbGFjZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdHJpcHRhZ3Nfc3RyZWFtKGh0bWwpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpcHRhZ3NfaW50ZXJuYWwoaHRtbCB8fCAnJywgY29udGV4dCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RyaXB0YWdzLmluaXRfc3RyZWFtaW5nX21vZGUgPSBpbml0X3N0cmlwdGFnc19zdHJlYW07XG5cbiAgICBmdW5jdGlvbiBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCkge1xuICAgICAgICBhbGxvd2FibGVfdGFncyA9IHBhcnNlX2FsbG93YWJsZV90YWdzKGFsbG93YWJsZV90YWdzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWxsb3dhYmxlX3RhZ3MgOiBhbGxvd2FibGVfdGFncyxcbiAgICAgICAgICAgIHRhZ19yZXBsYWNlbWVudDogdGFnX3JlcGxhY2VtZW50LFxuXG4gICAgICAgICAgICBzdGF0ZSAgICAgICAgIDogU1RBVEVfUExBSU5URVhULFxuICAgICAgICAgICAgdGFnX2J1ZmZlciAgICA6ICcnLFxuICAgICAgICAgICAgZGVwdGggICAgICAgICA6IDAsXG4gICAgICAgICAgICBpbl9xdW90ZV9jaGFyIDogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdHJpcHRhZ3NfaW50ZXJuYWwoaHRtbCwgY29udGV4dCkge1xuICAgICAgICBsZXQgYWxsb3dhYmxlX3RhZ3MgID0gY29udGV4dC5hbGxvd2FibGVfdGFncztcbiAgICAgICAgbGV0IHRhZ19yZXBsYWNlbWVudCA9IGNvbnRleHQudGFnX3JlcGxhY2VtZW50O1xuXG4gICAgICAgIGxldCBzdGF0ZSAgICAgICAgID0gY29udGV4dC5zdGF0ZTtcbiAgICAgICAgbGV0IHRhZ19idWZmZXIgICAgPSBjb250ZXh0LnRhZ19idWZmZXI7XG4gICAgICAgIGxldCBkZXB0aCAgICAgICAgID0gY29udGV4dC5kZXB0aDtcbiAgICAgICAgbGV0IGluX3F1b3RlX2NoYXIgPSBjb250ZXh0LmluX3F1b3RlX2NoYXI7XG4gICAgICAgIGxldCBvdXRwdXQgICAgICAgID0gJyc7XG5cbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMCwgbGVuZ3RoID0gaHRtbC5sZW5ndGg7IGlkeCA8IGxlbmd0aDsgaWR4KyspIHtcbiAgICAgICAgICAgIGxldCBjaGFyID0gaHRtbFtpZHhdO1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFNUQVRFX1BMQUlOVEVYVCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlICAgICAgID0gU1RBVEVfSFRNTDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFX0hUTUwpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgJzwnIGlmIGluc2lkZSBhIHF1b3RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5fcXVvdGVfY2hhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBzZWVpbmcgYSBuZXN0ZWQgJzwnXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgJz4nIGlmIGluc2lkZSBhIHF1b3RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5fcXVvdGVfY2hhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzIGlzIGhhcHBlbmluZzogJzw8Pj4nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgY2xvc2luZyB0aGUgdGFnIGluIHRhZ19idWZmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlICAgICAgICAgPSBTVEFURV9QTEFJTlRFWFQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICAgKz0gJz4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dhYmxlX3RhZ3MuaGFzKG5vcm1hbGl6ZV90YWcodGFnX2J1ZmZlcikpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRhZ19idWZmZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSB0YWdfcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXFwnJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdGNoIGJvdGggc2luZ2xlIGFuZCBkb3VibGUgcXVvdGVzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSBpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5fcXVvdGVfY2hhciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9xdW90ZV9jaGFyID0gaW5fcXVvdGVfY2hhciB8fCBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyID09PSAnPCEtJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEVfQ09NTUVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFnX2J1ZmZlciA9PT0gJzwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgICAgKz0gJzwgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFX0NPTU1FTlQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFnX2J1ZmZlci5zbGljZSgtMikgPT0gJy0tJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb3NlIHRoZSBjb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURV9QTEFJTlRFWFQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzYXZlIHRoZSBjb250ZXh0IGZvciBmdXR1cmUgaXRlcmF0aW9uc1xuICAgICAgICBjb250ZXh0LnN0YXRlICAgICAgICAgPSBzdGF0ZTtcbiAgICAgICAgY29udGV4dC50YWdfYnVmZmVyICAgID0gdGFnX2J1ZmZlcjtcbiAgICAgICAgY29udGV4dC5kZXB0aCAgICAgICAgID0gZGVwdGg7XG4gICAgICAgIGNvbnRleHQuaW5fcXVvdGVfY2hhciA9IGluX3F1b3RlX2NoYXI7XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZV9hbGxvd2FibGVfdGFncyhhbGxvd2FibGVfdGFncykge1xuICAgICAgICBsZXQgdGFnX3NldCA9IG5ldyBTZXQoKTtcblxuICAgICAgICBpZiAodHlwZW9mIGFsbG93YWJsZV90YWdzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gQUxMT1dFRF9UQUdTX1JFR0VYLmV4ZWMoYWxsb3dhYmxlX3RhZ3MpKSkge1xuICAgICAgICAgICAgICAgIHRhZ19zZXQuYWRkKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKCFTeW1ib2wubm9uTmF0aXZlICYmXG4gICAgICAgICAgICAgICAgIHR5cGVvZiBhbGxvd2FibGVfdGFnc1tTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKSB7XG5cbiAgICAgICAgICAgIHRhZ19zZXQgPSBuZXcgU2V0KGFsbG93YWJsZV90YWdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhbGxvd2FibGVfdGFncy5mb3JFYWNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBJRTExIGNvbXBhdGlibGVcbiAgICAgICAgICAgIGFsbG93YWJsZV90YWdzLmZvckVhY2godGFnX3NldC5hZGQsIHRhZ19zZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhZ19zZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplX3RhZyh0YWdfYnVmZmVyKSB7XG4gICAgICAgIGxldCBtYXRjaCA9IE5PUk1BTElaRV9UQUdfUkVHRVguZXhlYyh0YWdfYnVmZmVyKTtcblxuICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRFxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gbW9kdWxlX2ZhY3RvcnkoKSB7IHJldHVybiBzdHJpcHRhZ3M7IH0pO1xuICAgIH1cblxuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIE5vZGVcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBzdHJpcHRhZ3M7XG4gICAgfVxuXG4gICAgZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXJcbiAgICAgICAgZ2xvYmFsLnN0cmlwdGFncyA9IHN0cmlwdGFncztcbiAgICB9XG59KHRoaXMpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdGlmICghbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGltZXN0YW1wXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdGltZXN0YW1wXCIpKTtcbmNsYXNzIENhcHRpb25zUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuICAgIC8qKlxuICAgICAqIERlY29tcG9zZSB4bWwgdGV4dCBsaW5lIGJ5IGxpbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWxpbmVcbiAgICAgKiBAcmV0dXJucyB7QWxpbmV9XG4gICAgICogQG1lbWJlcm9mIENhcHRpb25zUGFyc2VyXG4gICAgICovXG4gICAgZGVjb2RlQWxpbmUoYWxpbmUpIHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5wdWxsVGltZShhbGluZSk7XG4gICAgICAgIGNvbnN0IGh0bWxUZXh0ID0gYWxpbmVcbiAgICAgICAgICAgIC5yZXBsYWNlKC88dGV4dC4rPi8sIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvJmFtcDsvZ2ksIFwiJlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xccj9cXG4vZywgXCIgXCIpO1xuICAgICAgICBjb25zdCBzdHJpcHRhZ3MgPSByZXF1aXJlKFwic3RyaXB0YWdzXCIpO1xuICAgICAgICBjb25zdCBoZSA9IHJlcXVpcmUoXCJoZVwiKTtcbiAgICAgICAgY29uc3QgZGVjb2RlZFRleHQgPSBoZS5kZWNvZGUoaHRtbFRleHQpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gc3RyaXB0YWdzKGRlY29kZWRUZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3BsaXQgbGluZXMgaW50byBieSBhIGxpbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGluZXNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAgICogQG1lbWJlcm9mIENhcHRpb25zUGFyc2VyXG4gICAgICovXG4gICAgZXhwbG9kZShsaW5lcykge1xuICAgICAgICByZXR1cm4gbGluZXMuc3BsaXQoXCI8L3RleHQ+XCIpLmZpbHRlcigobGluZSkgPT4gbGluZSAmJiBsaW5lLnRyaW0oKSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFRyaW0geG1sIHRhZyBpbiBmaXJzdCBsaW5lXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdHJhbnNjcmlwdFxuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ2FwdGlvbnNQYXJzZXJcbiAgICAgKi9cbiAgICByZW1vdmVYbWxUYWcodHJhbnNjcmlwdCkge1xuICAgICAgICByZXR1cm4gdHJhbnNjcmlwdFxuICAgICAgICAgICAgLnJlcGxhY2UoJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cInV0Zi04XCIgPz48dHJhbnNjcmlwdD4nLCBcIlwiKVxuICAgICAgICAgICAgLnJlcGxhY2UoXCI8L3RyYW5zY3JpcHQ+XCIsIFwiXCIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBQdWxsIHRpbWUgZnJvbSB0ZXh0IGRhdGEuXG4gICAgICogPHRleHQgc3RhcnQ9XCIxMC4xNTlcIiBkdXI9XCIyLjU2M1wiPlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGluZVxuICAgICAqIEByZXR1cm5zIHtUaW1lc3RhbXB9XG4gICAgICogQG1lbWJlcm9mIENhcHRpb25zUGFyc2VyXG4gICAgICovXG4gICAgcHVsbFRpbWUoYWxpbmUpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSZWdleCA9IC9zdGFydD1cIihbXFxkLl0rKVwiLztcbiAgICAgICAgY29uc3QgZHVyUmVnZXggPSAvZHVyPVwiKFtcXGQuXSspXCIvO1xuICAgICAgICByZXR1cm4gbmV3IHRpbWVzdGFtcF8xLmRlZmF1bHQodGhpcy5nZXRUaW1lRnJvbVRleHQoc3RhcnRSZWdleCwgYWxpbmUpLCB0aGlzLmdldFRpbWVGcm9tVGV4dChkdXJSZWdleCwgYWxpbmUpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogRXhlY3V0ZSBSZWdFeHAuXG4gICAgICpcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7UmVnRXhwfSByZWdleFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGluZVxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICogQG1lbWJlcm9mIENhcHRpb25zUGFyc2VyXG4gICAgICovXG4gICAgZ2V0VGltZUZyb21UZXh0KHJlZ2V4LCBhbGluZSkge1xuICAgICAgICBpZiAocmVnZXgudGVzdChhbGluZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IFssIHRpbWVdID0gcmVnZXguZXhlYyhhbGluZSk7XG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyKHRpbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAwO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENhcHRpb25zUGFyc2VyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBDbGllbnRZb3V0dWJlIHtcbiAgICBnZXRWaWRlb0luZm8odmlkZW9JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGBodHRwczovL3lvdXR1YmUuY29tL2dldF92aWRlb19pbmZvP3ZpZGVvX2lkPSR7dmlkZW9JZH1gKTtcbiAgICB9XG4gICAgZ2V0U3VidGl0bGUobGFuZ3VhZ2VVcmwpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVxdWVzdChsYW5ndWFnZVVybCk7XG4gICAgfVxuICAgIGdldFJlcXVlc3QodXJsKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICByZXF1ZXN0Lm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcih0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmVxdWVzdC5vbmVycm9yID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJYTUxIdHRwUmVxdWVzdCBFcnJvcjogXCIgKyB0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9wZW4oXCJHRVRcIiwgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDbGllbnRZb3V0dWJlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjYXB0aW9uc1BhcnNlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NhcHRpb25zUGFyc2VyXCIpKTtcbmNsYXNzIENvbnZlcnRlciB7XG4gICAgY29uc3RydWN0b3IoeG1sUmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy54bWxSZXNwb25zZSA9IHhtbFJlc3BvbnNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gQ1NWIGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge0NzdkFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvQ3N2KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFydFRpbWU6IGFsaW5lLnRpbWVzdGFtcC5nZXRTdGFydFRpbWUoKSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvblRpbWU6IGFsaW5lLnRpbWVzdGFtcC5nZXREdXJhdGlvblRpbWUoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBhbGluZS50ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gc2F2ZSBpbiBUZXh0IGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge1RleHRBbGluZVtdfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICB0b1RleHQoKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBjYXB0aW9uc1BhcnNlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbVRyYW5zY3JpcHQgPSBwYXJzZXIuZXhwbG9kZShwYXJzZXIucmVtb3ZlWG1sVGFnKHRoaXMueG1sUmVzcG9uc2UpKTtcbiAgICAgICAgcmV0dXJuIHRyaW1UcmFuc2NyaXB0Lm1hcCgobGluZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWxpbmUgPSBwYXJzZXIuZGVjb2RlQWxpbmUobGluZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRleHQ6IGFsaW5lLnRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBzYXZlIGluIFNydCBmb3JtYXRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTcnRBbGluZVtdfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICB0b1NydCgpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IGNhcHRpb25zUGFyc2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB0cmltVHJhbnNjcmlwdCA9IHBhcnNlci5leHBsb2RlKHBhcnNlci5yZW1vdmVYbWxUYWcodGhpcy54bWxSZXNwb25zZSkpO1xuICAgICAgICByZXR1cm4gdHJpbVRyYW5zY3JpcHQubWFwKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtZXJpY0NvdW50ZXIgPSBpbmRleCArIDEgKyBcIlxcblwiO1xuICAgICAgICAgICAgY29uc3QgYWxpbmUgPSBwYXJzZXIuZGVjb2RlQWxpbmUobGluZSk7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gYWxpbmUudGV4dC5yZXBsYWNlKC9cXG4vLCBcIiBcIikgKyBcIlxcblwiO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbmRleDogbnVtZXJpY0NvdW50ZXIsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBhbGluZS50aW1lc3RhbXAuZm9ybWF0U3J0KCksXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gVnR0IGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge1Z0dEFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvVnR0KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGFsaW5lLnRleHQucmVwbGFjZSgvXFxuLywgXCIgXCIpICsgXCJcXG5cIjtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBhbGluZS50aW1lc3RhbXAuZm9ybWF0VnR0KCksXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gTFJDIGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge0xyY0FsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvTHJjKCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGFsaW5lLnRleHQucmVwbGFjZSgvXFxuLywgXCIgXCIpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGFsaW5lLnRpbWVzdGFtcC5mb3JtYXRMcmMoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ29udmVydGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBzdWJ0aXRsZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3N1YnRpdGxlXCIpKTtcbmNvbnN0IGNsaWVudFlvdXR1YmVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9jbGllbnQvY2xpZW50WW91dHViZVwiKSk7XG5jb25zdCBzZW5kRGF0YSA9IHtcbiAgICByZWFzb246IFwiY2hlY2tcIixcbn07XG52YXIgdmlkZW9UaXRsZTtcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwgc2VuZERhdGEsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFcnJvck1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuY2FwdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2aWRlb1RpdGxlID0gcmVzcG9uc2UudGl0bGU7XG4gICAgICAgICAgICAgICAgYWRkU2VsZWN0Qm94KCk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuY2FwdGlvbnMuZmlsdGVyKCh2YWx1ZSkgPT4gYWRkU2VsZWN0Qm94T3B0aW9uKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYWRkRG93bmxvYWRCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBhZGRTZWxlY3RCb3hGb3JtYXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuZnVuY3Rpb24gYWRkU2VsZWN0Qm94Rm9ybWF0KCkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIilcbiAgICAgICAgLmluc2VydEFkamFjZW50SFRNTChcImFmdGVyYmVnaW5cIiwgXCI8c2VsZWN0IGNsYXNzPSd1ay1zZWxlY3QnIHN0eWxlPSdtYXJnaW4tYm90dG9tOjVweDtmb250LXNpemU6bGFyZ2VyOycgaWQ9J2Zvcm1hdCc+PG9wdGlvbiB2YWx1ZT0nY3N2Jz4uY3N2PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0ndGV4dCc+LnR4dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3Z0dCc+LnZ0dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3NydCc+LnNydDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J2xyYyc+LmxyYzwvb3B0aW9uPjwvc2VsZWN0PlwiKTtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdEJveCgpIHtcbiAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpXG4gICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmJlZ2luXCIsIFwiPHNlbGVjdCBjbGFzcz0ndWstc2VsZWN0JyBpZD0nbGFuZ3VhZ2UnIHN0eWxlPSdmb250LXNpemU6bGFyZ2VyOyc+PC9zZWxlY3Q+XCIpO1xufVxuZnVuY3Rpb24gYWRkU2VsZWN0Qm94T3B0aW9uKHZhbHVlKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgICAgLmdldEVsZW1lbnRCeUlkKFwibGFuZ3VhZ2VcIilcbiAgICAgICAgLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWVuZFwiLCBgPG9wdGlvbiB2YWx1ZT0ke3ZhbHVlLmJhc2VVcmx9PiR7dmFsdWUubmFtZS5zaW1wbGVUZXh0fTwvb3B0aW9uPmApO1xufVxuZnVuY3Rpb24gYWRkRG93bmxvYWRCdXR0b24oKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgICAgLmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKVxuICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYWZ0ZXJlbmRcIiwgXCI8ZGl2IGNsYXNzPSd1ay1tYXJnaW4nPjxidXR0b24gaWQ9J2Rvd25sb2FkLWJ1dHRvbicgY2xhc3M9J3VrLWJ1dHRvbiB1ay1idXR0b24tcHJpbWFyeScgb25jbGljaz1kb3dubG9hZCgpPkRvd25sb2FkPC9idXR0b24+PC9kaXY+XCIpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZG93bmxvYWQtYnV0dG9uXCIpLm9uY2xpY2sgPSAoKSA9PiBkb3dubG9hZCgpO1xufVxuZnVuY3Rpb24gZGVidWcocmVzcG9uc2UpIHtcbiAgICBjb25zdCBkZWJ1ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVidWdcIik7XG4gICAgZGVidWcuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgcmVzcG9uc2UpO1xufVxuZnVuY3Rpb24gZGlzcGxheUVycm9yTWVzc2FnZSgpIHtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpO1xuICAgIGNvbnRlbnQuaW5zZXJ0QWRqYWNlbnRIVE1MKFwiYmVmb3JlYmVnaW5cIiwgYDxwIGNsYXNzPSd1ay10ZXh0LWRhbmdlcic+VGhpcyB2aWRlbyBoYXMgbm8gY2FwdGlvbnMuPC9wPjxwIGNsYXNzPSd1ay10ZXh0LWRhbmdlcic+SWYgeW91IGNhbid0IGRvd25sb2FkIHRoZSBzdWJ0aXRsZXMsIHRyeSBkaXNhYmxpbmcgYWRibG9jay48L3A+YCk7XG59XG5mdW5jdGlvbiBkb3dubG9hZCgpIHtcbiAgICBjb25zdCBsYW5ndWFnZV91cmwgPSAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYW5ndWFnZVwiKSkudmFsdWU7XG4gICAgY29uc3QgZm9ybWF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtYXRcIilcbiAgICAgICAgLnZhbHVlO1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBjbGllbnRZb3V0dWJlXzEuZGVmYXVsdCgpO1xuICAgIGNsaWVudFxuICAgICAgICAuZ2V0U3VidGl0bGUobGFuZ3VhZ2VfdXJsKVxuICAgICAgICAudGhlbigoeG1sUmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKCF4bWxSZXNwb25zZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIlJlc3BvbnNlIGVtcHR5LlwiKTtcbiAgICAgICAgY29uc3Qgc3VidGl0bGUgPSBuZXcgc3VidGl0bGVfMS5kZWZhdWx0KHhtbFJlc3BvbnNlKTtcbiAgICAgICAgaWYgKGZvcm1hdCA9PT0gXCJjc3ZcIikge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0Q3N2KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZvcm1hdCA9PT0gXCJ0ZXh0XCIpIHtcbiAgICAgICAgICAgIHN1YnRpdGxlLmdldFRleHQodmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9ybWF0ID09PSBcInZ0dFwiKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRWdHQodmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9ybWF0ID09PSBcInNydFwiKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRTcnQodmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRMcmModmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgZGVidWcoZXJyb3IpO1xuICAgIH0pO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjb252ZXJ0ZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9jb252ZXJ0ZXJcIikpO1xuY29uc3QganNvbjJjc3YgPSByZXF1aXJlKFwianNvbi0yLWNzdlwiKTtcbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgZGVsaW1pdGVyOiB7XG4gICAgICAgIHdyYXA6IFwiXCIsXG4gICAgICAgIGZpZWxkOiBcIlwiLFxuICAgICAgICBlb2w6IFwiXFxuXCIsXG4gICAgfSxcbiAgICBwcmVwZW5kSGVhZGVyOiBmYWxzZSxcbiAgICBleGNlbEJPTTogdHJ1ZSxcbn07XG5jbGFzcyBTdWJ0aXRsZSB7XG4gICAgY29uc3RydWN0b3IoeG1sUmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy54bWxSZXNwb25zZSA9IHhtbFJlc3BvbnNlO1xuICAgIH1cbiAgICBnZXRWdHQoZmlsZW5hbWUpIHtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvVnR0KCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW1wiV0VCVlRUXFxuXFxuXCIgKyBjc3ZdLCB7IHR5cGU6IFwidGV4dC92dHRcIiB9KSksXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lICsgXCIudnR0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldFNydChmaWxlbmFtZSkge1xuICAgICAgICBqc29uMmNzdlxuICAgICAgICAgICAgLmpzb24yY3N2QXN5bmMobmV3IGNvbnZlcnRlcl8xLmRlZmF1bHQodGhpcy54bWxSZXNwb25zZSkudG9TcnQoKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiBcInRleHQvc3J0XCIgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArIFwiLnNydFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRMcmMoZmlsZW5hbWUpIHtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvTHJjKCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2Nzdl0sIHsgdHlwZTogXCJ0ZXh0L2xyY1wiIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyBcIi5scmNcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0Q3N2KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b0NzdigpLCB7XG4gICAgICAgICAgICBleGNlbEJPTTogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiBcInRleHQvY3N2XCIgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArIFwiLmNzdlwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRUZXh0KGZpbGVuYW1lKSB7XG4gICAgICAgIGNvbnN0IGpzb24yY3N2ID0gcmVxdWlyZShcImpzb24tMi1jc3ZcIik7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b1RleHQoKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiBcInRleHQvcGxhbmVcIiB9KSksXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lICsgXCIudHh0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU3VidGl0bGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFRpbWVzdGFtcCB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnQsIGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIH1cbiAgICBnZXRTdGFydFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRUaW1lKHRoaXMuc3RhcnQpO1xuICAgIH1cbiAgICBnZXREdXJhdGlvblRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lcmdlVGltZSh0aGlzLnN0YXJ0LCB0aGlzLmR1cmF0aW9uKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIFNSVCB0aW1lc3RhbXAgZm9ybWF0LlxuICAgICAqIGV4YW1wbGU6IDAwOjAwOjAwLDAwMCAtLT4gMDA6MDA6MDAsMDAwXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBmb3JtYXRTcnQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5nZXRTdGFydFRpbWUoKS5yZXBsYWNlKC9bLl0vLCBcIixcIikgK1xuICAgICAgICAgICAgXCIgLS0+IFwiICtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHVyYXRpb25UaW1lKCkucmVwbGFjZSgvWy5dLywgXCIsXCIpICtcbiAgICAgICAgICAgIFwiXFxuXCIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgVlRUIHRpbWVzdGFtcCBmb3JtYXQuXG4gICAgICogZXhhbXBsZTogMDA6MDA6MDAuMDAwIC0tPiAwMDowMDowMC4wMDBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFRpbWVzdGFtcFxuICAgICAqL1xuICAgIGZvcm1hdFZ0dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUaW1lKCkgKyBcIiAtLT4gXCIgKyB0aGlzLmdldER1cmF0aW9uVGltZSgpICsgXCJcXG5cIjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIExSQyB0aW1lc3RhbXAgZm9ybWF0LlxuICAgICAqIGV4YW1wbGU6IFswMDowMDowMC4wMDBdXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBmb3JtYXRMcmMoKSB7XG4gICAgICAgIHJldHVybiBgWyR7dGhpcy5jb252ZXJ0THJjRm9ybWF0VGltZSh0aGlzLnN0YXJ0KX1dYDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uIHRpbWVcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0U2Vjb25kc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvblNlY29uZHNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBtZXJnZVRpbWUoc3RhcnRTZWNvbmRzLCBkdXJhdGlvblNlY29uZHMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHN0YXJ0U2Vjb25kcyAqIDEwMDAgKyBkdXJhdGlvblNlY29uZHMgKiAxMDAwKVxuICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIC5zbGljZSgxMSwgLTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRpbWUgZm9ybWF0IGZyb20gbW0uc3MgdG8gSEg6bW06c3NzLlxuICAgICAqIGV4YW1wbGU6IDEwLjE1OSA9PiAwMDowMDoxMC4xNTlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzZWNvbmRzXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVGltZXN0YW1wXG4gICAgICovXG4gICAgY29udmVydFRpbWUoc2Vjb25kcykge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoc2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc2xpY2UoMTEsIC0xKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCAubHJjIHRpbWUgZm9ybWF0IGZyb20gbW0uc3MgdG8gbW06c3MuXG4gICAgICogZXhhbXBsZTogMTAuMTU5ID0+IDAwOjEwLjE1XG4gICAgICogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTFJDXyhmaWxlX2Zvcm1hdClcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzZWNvbmRzXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVGltZXN0YW1wXG4gICAgICovXG4gICAgY29udmVydExyY0Zvcm1hdFRpbWUoc2Vjb25kcykge1xuICAgICAgICBjb25zdCBoaCA9IHBhcnNlSW50KG5ldyBEYXRlKHNlY29uZHMgKiAxMDAwKS50b0lTT1N0cmluZygpLnNsaWNlKDEyLCAtMTEpKSAqIDYwO1xuICAgICAgICBjb25zdCBtbSA9IHBhcnNlSW50KG5ldyBEYXRlKHNlY29uZHMgKiAxMDAwKS50b0lTT1N0cmluZygpLnNsaWNlKDE0LCAtOCkpO1xuICAgICAgICBpZiAoMCA8IGhoKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7aGggKyBtbX0ke25ldyBEYXRlKHNlY29uZHMgKiAxMDAwKVxuICAgICAgICAgICAgICAgIC50b0lTT1N0cmluZygpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDE2LCAtMil9YDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IERhdGUoc2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc2xpY2UoMTQsIC0yKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBUaW1lc3RhbXA7XG4iXSwic291cmNlUm9vdCI6IiJ9