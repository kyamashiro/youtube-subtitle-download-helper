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
        .insertAdjacentHTML("afterbegin", "<select class='uk-select' style='margin-bottom:5px' id='format'><option value='csv'>.csv</option><option value='text'>.txt</option><option value='vtt'>.vtt</option><option value='srt'>.srt</option></select>");
}
function addSelectBox() {
    document
        .getElementById("content")
        .insertAdjacentHTML("afterbegin", "<select class='uk-select' id='language'></select>");
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
        else {
            subtitle.getSrt(videoTitle);
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
}
exports.default = Timestamp;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2RlZWtzL3NyYy9kZWVrcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZGVla3Mvc3JjL3V0aWxzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9kb2MtcGF0aC9zcmMvcGF0aC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvaGUvaGUuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2NvbnZlcnRlci5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbi0yLWNzdi9zcmMvY3N2Mmpzb24uanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2pzb24yY3N2LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3RyaXB0YWdzL3NyYy9zdHJpcHRhZ3MuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2FwdGlvbnNQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwLnRzIiwid2VicGFjazovLy8uL3NyYy9zdWJ0aXRsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7O0FBRWIsY0FBYyxtQkFBTyxDQUFDLHFEQUFZOztBQUVsQztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDcklhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRGE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx5Q0FBeUM7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLHlDQUF5Qzs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxtQkFBbUIsS0FBMEI7O0FBRTdDO0FBQ0Esa0JBQWtCLEtBQXlCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQiw4aUJBQThpQix3WkFBd1osV0FBVzs7QUFFbitCO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsYUFBYTtBQUNiLGVBQWU7QUFDZixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBLHd4ZkFBd3hmLGluQkFBaW5CLDZCQUE2Qix5QkFBeUI7QUFDLzdnQixrQkFBa0IsNHRlQUE0dGUsd0tBQXdLLDJ1WkFBMnVaLHdLQUF3Syw2Z0ZBQTZnRjtBQUN0ejlCLHdCQUF3QjtBQUN4Qix5QkFBeUI7QUFDekI7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEMsbUJBQW1CLGlCQUFpQjtBQUNwQyxxQkFBcUIsTUFBTSxZQUFZO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QyxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxFQUFFO0FBQzFDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkMsa0JBQWtCLGlCQUFpQjtBQUNuQztBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkMsSUFBSTtBQUNKLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLElBRVU7QUFDWjtBQUNBLEVBQUUsbUNBQU87QUFDVDtBQUNBLEdBQUc7QUFBQSxvR0FBQztBQUNKLEVBQUUsTUFBTSxZQVVOOztBQUVGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Vlk7O0FBRWIsS0FBSyxTQUFTLEdBQUcsbUJBQU8sQ0FBQyw2REFBWTtBQUNyQyxLQUFLLFNBQVMsR0FBRyxtQkFBTyxDQUFDLDZEQUFZO0FBQ3JDLFlBQVksbUJBQU8sQ0FBQyx1REFBUzs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRWE7O0FBRWIsV0FBVyxtQkFBTyxDQUFDLHFEQUFVO0FBQzdCLGdCQUFnQixtQkFBTyxDQUFDLHNFQUFrQjtBQUMxQyxZQUFZLG1CQUFPLENBQUMsdURBQVM7O0FBRTdCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFCQUFxQixTQUFTO0FBQzlCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0Esc0JBQXNCLE1BQU07QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxv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QUNBIiwiZmlsZSI6InBvcHVwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcG9wdXAudHNcIik7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHV0aWxzID0gcmVxdWlyZSgnLi91dGlscy5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkZWVwS2V5czogZGVlcEtleXMsXG4gICAgZGVlcEtleXNGcm9tTGlzdDogZGVlcEtleXNGcm9tTGlzdFxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGRlZXAga2V5cyBsaXN0IGZvciBhIHNpbmdsZSBkb2N1bWVudFxuICogQHBhcmFtIG9iamVjdFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gZGVlcEtleXMob2JqZWN0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBpZiAodXRpbHMuaXNPYmplY3Qob2JqZWN0KSkge1xuICAgICAgICByZXR1cm4gZ2VuZXJhdGVEZWVwS2V5c0xpc3QoJycsIG9iamVjdCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIHJldHVybiBbXTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGRlZXAga2V5cyBsaXN0IGZvciBhbGwgZG9jdW1lbnRzIGluIHRoZSBwcm92aWRlZCBsaXN0XG4gKiBAcGFyYW0gbGlzdFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIEFycmF5W0FycmF5W1N0cmluZ11dXG4gKi9cbmZ1bmN0aW9uIGRlZXBLZXlzRnJvbUxpc3QobGlzdCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxpc3QubWFwKChkb2N1bWVudCkgPT4geyAvLyBmb3IgZWFjaCBkb2N1bWVudFxuICAgICAgICBpZiAodXRpbHMuaXNPYmplY3QoZG9jdW1lbnQpKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgZGF0YSBhdCB0aGUga2V5IGlzIGEgZG9jdW1lbnQsIHRoZW4gd2UgcmV0cmlldmUgdGhlIHN1YkhlYWRpbmcgc3RhcnRpbmcgd2l0aCBhbiBlbXB0eSBzdHJpbmcgaGVhZGluZyBhbmQgdGhlIGRvY1xuICAgICAgICAgICAgcmV0dXJuIGRlZXBLZXlzKGRvY3VtZW50LCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlRGVlcEtleXNMaXN0KGhlYWRpbmcsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpLm1hcCgoY3VycmVudEtleSkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgZ2l2ZW4gaGVhZGluZyBpcyBlbXB0eSwgdGhlbiB3ZSBzZXQgdGhlIGhlYWRpbmcgdG8gYmUgdGhlIHN1YktleSwgb3RoZXJ3aXNlIHNldCBpdCBhcyBhIG5lc3RlZCBoZWFkaW5nIHcvIGEgZG90XG4gICAgICAgIGxldCBrZXlOYW1lID0gYnVpbGRLZXlOYW1lKGhlYWRpbmcsIGN1cnJlbnRLZXkpO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgYW5vdGhlciBuZXN0ZWQgZG9jdW1lbnQsIHJlY3VyIG9uIHRoZSBzdWItZG9jdW1lbnQgdG8gcmV0cmlldmUgdGhlIGZ1bGwga2V5IG5hbWVcbiAgICAgICAgaWYgKGlzRG9jdW1lbnRUb1JlY3VyT24oZGF0YVtjdXJyZW50S2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZURlZXBLZXlzTGlzdChrZXlOYW1lLCBkYXRhW2N1cnJlbnRLZXldLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmV4cGFuZEFycmF5T2JqZWN0cyAmJiBpc0FycmF5VG9SZWN1ck9uKGRhdGFbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbmVzdGVkIGFycmF5IHRoYXQgd2UgbmVlZCB0byByZWN1ciBvblxuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBcnJheUtleXMoZGF0YVtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHVybiB0aGlzIGtleSBuYW1lIHNpbmNlIHdlIGRvbid0IGhhdmUgYSBzdWIgZG9jdW1lbnRcbiAgICAgICAgcmV0dXJuIGtleU5hbWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdXRpbHMuZmxhdHRlbihrZXlzKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBwcm9jZXNzaW5nIG9mIGFycmF5cyB3aGVuIHRoZSBleHBhbmRBcnJheU9iamVjdHNcbiAqIG9wdGlvbiBpcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gc3ViQXJyYXlcbiAqIEBwYXJhbSBjdXJyZW50S2V5UGF0aFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBwcm9jZXNzQXJyYXlLZXlzKHN1YkFycmF5LCBjdXJyZW50S2V5UGF0aCwgb3B0aW9ucykge1xuICAgIGxldCBzdWJBcnJheUtleXMgPSBkZWVwS2V5c0Zyb21MaXN0KHN1YkFycmF5KTtcblxuICAgIGlmICghc3ViQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmlnbm9yZUVtcHR5QXJyYXlzV2hlbkV4cGFuZGluZyA/IFtdIDogW2N1cnJlbnRLZXlQYXRoXTtcbiAgICB9IGVsc2UgaWYgKHN1YkFycmF5Lmxlbmd0aCAmJiB1dGlscy5mbGF0dGVuKHN1YkFycmF5S2V5cykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIEhhcyBpdGVtcyBpbiB0aGUgYXJyYXksIGJ1dCBubyBvYmplY3RzXG4gICAgICAgIHJldHVybiBbY3VycmVudEtleVBhdGhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHN1YkFycmF5S2V5cyA9IHN1YkFycmF5S2V5cy5tYXAoKHNjaGVtYUtleXMpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0VtcHR5QXJyYXkoc2NoZW1hS2V5cykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW2N1cnJlbnRLZXlQYXRoXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzY2hlbWFLZXlzLm1hcCgoc3ViS2V5KSA9PiBidWlsZEtleU5hbWUoY3VycmVudEtleVBhdGgsIHN1YktleSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdXRpbHMudW5pcXVlKHV0aWxzLmZsYXR0ZW4oc3ViQXJyYXlLZXlzKSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGtleSBwYXRoXG4gKiBAcGFyYW0gdXBwZXJLZXlOYW1lIFN0cmluZyBhY2N1bXVsYXRlZCBrZXkgcGF0aFxuICogQHBhcmFtIGN1cnJlbnRLZXlOYW1lIFN0cmluZyBjdXJyZW50IGtleSBuYW1lXG4gKiBAcmV0dXJucyBTdHJpbmdcbiAqL1xuZnVuY3Rpb24gYnVpbGRLZXlOYW1lKHVwcGVyS2V5TmFtZSwgY3VycmVudEtleU5hbWUpIHtcbiAgICBpZiAodXBwZXJLZXlOYW1lKSB7XG4gICAgICAgIHJldHVybiB1cHBlcktleU5hbWUgKyAnLicgKyBjdXJyZW50S2V5TmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRLZXlOYW1lO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGlzIHZhbHVlIGlzIGEgZG9jdW1lbnQgdG8gcmVjdXIgb24gb3Igbm90XG4gKiBAcGFyYW0gdmFsIEFueSBpdGVtIHdob3NlIHR5cGUgd2lsbCBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RvY3VtZW50VG9SZWN1ck9uKHZhbCkge1xuICAgIHJldHVybiB1dGlscy5pc09iamVjdCh2YWwpICYmICF1dGlscy5pc051bGwodmFsKSAmJiAhQXJyYXkuaXNBcnJheSh2YWwpICYmIE9iamVjdC5rZXlzKHZhbCkubGVuZ3RoO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGlzIHZhbHVlIGlzIGFuIGFycmF5IHRvIHJlY3VyIG9uIG9yIG5vdFxuICogQHBhcmFtIHZhbCBBbnkgaXRlbSB3aG9zZSB0eXBlIHdpbGwgYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNBcnJheVRvUmVjdXJPbih2YWwpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hldGhlciBvciBub3QgYSB2YWx1ZSBpcyBhbiBlbXB0eSBhcnJheVxuICogQHBhcmFtIHZhbFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlBcnJheSh2YWwpIHtcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWwpICYmICF2YWwubGVuZ3RoO1xufVxuXG5mdW5jdGlvbiBtZXJnZU9wdGlvbnMob3B0aW9ucykge1xuICAgIHJldHVybiB7XG4gICAgICAgIGV4cGFuZEFycmF5T2JqZWN0czogZmFsc2UsXG4gICAgICAgIGlnbm9yZUVtcHR5QXJyYXlzV2hlbkV4cGFuZGluZzogZmFsc2UsXG4gICAgICAgIC4uLm9wdGlvbnMgfHwge31cbiAgICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAvLyB1bmRlcnNjb3JlIHJlcGxhY2VtZW50czpcbiAgICBpc1N0cmluZyxcbiAgICBpc051bGwsXG4gICAgaXNFcnJvcixcbiAgICBpc0RhdGUsXG4gICAgaXNGdW5jdGlvbixcbiAgICBpc1VuZGVmaW5lZCxcbiAgICBpc09iamVjdCxcbiAgICB1bmlxdWUsXG4gICAgZmxhdHRlblxufTtcblxuLypcbiAqIEhlbHBlciBmdW5jdGlvbnMgd2hpY2ggd2VyZSBjcmVhdGVkIHRvIHJlbW92ZSB1bmRlcnNjb3JlanMgZnJvbSB0aGlzIHBhY2thZ2UuXG4gKi9cblxuZnVuY3Rpb24gaXNTdHJpbmcodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jztcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVsbCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNEYXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgRGF0ZTtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQodmFsdWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAndW5kZWZpbmVkJztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcih2YWx1ZSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpID09PSAnW29iamVjdCBFcnJvcl0nO1xufVxuXG5mdW5jdGlvbiB1bmlxdWUoYXJyYXkpIHtcbiAgICByZXR1cm4gWy4uLm5ldyBTZXQoYXJyYXkpXTtcbn1cblxuZnVuY3Rpb24gZmxhdHRlbihhcnJheSkge1xuICAgIHJldHVybiBbXS5jb25jYXQoLi4uYXJyYXkpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBldmFsdWF0ZVBhdGgsXG4gICAgc2V0UGF0aFxufTtcblxuZnVuY3Rpb24gZXZhbHVhdGVQYXRoKGRvY3VtZW50LCBrZXlQYXRoKSB7XG4gICAgaWYgKCFkb2N1bWVudCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBsZXQge2luZGV4T2ZEb3QsIGN1cnJlbnRLZXksIHJlbWFpbmluZ0tleVBhdGh9ID0gY29tcHV0ZVN0YXRlSW5mb3JtYXRpb24oa2V5UGF0aCk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhICcuJyBpbiB0aGUga2V5UGF0aCBhbmQga2V5UGF0aCBkb2Vzbid0IGFwcGVhciBpbiB0aGUgZG9jdW1lbnQsIHJlY3VyIG9uIHRoZSBzdWJkb2N1bWVudFxuICAgIGlmIChpbmRleE9mRG90ID49IDAgJiYgIWRvY3VtZW50W2tleVBhdGhdKSB7XG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYW4gYXJyYXkgYXQgdGhlIGN1cnJlbnRLZXkgaW4gdGhlIGRvY3VtZW50LCB0aGVuIGl0ZXJhdGUgb3ZlciB0aG9zZSBpdGVtcyBldmFsdWF0aW5nIHRoZSByZW1haW5pbmcgcGF0aFxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShkb2N1bWVudFtjdXJyZW50S2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudFtjdXJyZW50S2V5XS5tYXAoKGRvYykgPT4gZXZhbHVhdGVQYXRoKGRvYywgcmVtYWluaW5nS2V5UGF0aCkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgY2FuIGp1c3QgcmVjdXJcbiAgICAgICAgcmV0dXJuIGV2YWx1YXRlUGF0aChkb2N1bWVudFtjdXJyZW50S2V5XSwgcmVtYWluaW5nS2V5UGF0aCk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRvY3VtZW50KSkge1xuICAgICAgICAvLyBJZiB0aGlzIFwiZG9jdW1lbnRcIiBpcyBhY3R1YWxseSBhbiBhcnJheSwgdGhlbiBpdGVyYXRlIG92ZXIgdGhvc2UgaXRlbXMgZXZhbHVhdGluZyB0aGUgcGF0aFxuICAgICAgICByZXR1cm4gZG9jdW1lbnQubWFwKChkb2MpID0+IGV2YWx1YXRlUGF0aChkb2MsIGtleVBhdGgpKTtcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIHdlIGNhbiBqdXN0IHJldHVybiB2YWx1ZSBkaXJlY3RseVxuICAgIHJldHVybiBkb2N1bWVudFtrZXlQYXRoXTtcbn1cblxuZnVuY3Rpb24gc2V0UGF0aChkb2N1bWVudCwga2V5UGF0aCwgdmFsdWUpIHtcbiAgICBpZiAoIWRvY3VtZW50KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTm8gZG9jdW1lbnQgd2FzIHByb3ZpZGVkLicpO1xuICAgIH1cblxuICAgIGxldCB7aW5kZXhPZkRvdCwgY3VycmVudEtleSwgcmVtYWluaW5nS2V5UGF0aH0gPSBjb21wdXRlU3RhdGVJbmZvcm1hdGlvbihrZXlQYXRoKTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgJy4nIGluIHRoZSBrZXlQYXRoLCByZWN1ciBvbiB0aGUgc3ViZG9jIGFuZCAuLi5cbiAgICBpZiAoaW5kZXhPZkRvdCA+PSAwKSB7XG4gICAgICAgIGlmICghZG9jdW1lbnRbY3VycmVudEtleV0gJiYgQXJyYXkuaXNBcnJheShkb2N1bWVudCkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoaXMgaXMgYW4gYXJyYXkgYW5kIHRoZXJlIGFyZSBtdWx0aXBsZSBsZXZlbHMgb2Yga2V5cyB0byBpdGVyYXRlIG92ZXIsIHJlY3VyLlxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmZvckVhY2goKGRvYykgPT4gc2V0UGF0aChkb2MsIGtleVBhdGgsIHZhbHVlKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIWRvY3VtZW50W2N1cnJlbnRLZXldKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgY3VycmVudEtleSBkb2Vzbid0IGV4aXN0IHlldCwgcG9wdWxhdGUgaXRcbiAgICAgICAgICAgIGRvY3VtZW50W2N1cnJlbnRLZXldID0ge307XG4gICAgICAgIH1cbiAgICAgICAgc2V0UGF0aChkb2N1bWVudFtjdXJyZW50S2V5XSwgcmVtYWluaW5nS2V5UGF0aCwgdmFsdWUpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkb2N1bWVudCkpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBcImRvY3VtZW50XCIgaXMgYWN0dWFsbHkgYW4gYXJyYXksIHRoZW4gd2UgY2FuIGxvb3Agb3ZlciBlYWNoIG9mIHRoZSB2YWx1ZXMgYW5kIHNldCB0aGUgcGF0aFxuICAgICAgICByZXR1cm4gZG9jdW1lbnQuZm9yRWFjaCgoZG9jKSA9PiBzZXRQYXRoKGRvYywgcmVtYWluaW5nS2V5UGF0aCwgdmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGNhbiBzZXQgdGhlIHBhdGggZGlyZWN0bHlcbiAgICAgICAgZG9jdW1lbnRba2V5UGF0aF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZG9jdW1lbnQ7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBzb21lIGluZm9ybWF0aW9uIG5lY2Vzc2FyeSB0byBldmFsdWF0ZSBvciBzZXQgYSBwYXRoXG4gKiAgIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBrZXlQYXRoIHZhbHVlXG4gKiBAcGFyYW0ga2V5UGF0aFxuICogQHJldHVybnMge3tpbmRleE9mRG90OiBOdW1iZXIsIGN1cnJlbnRLZXk6IFN0cmluZywgcmVtYWluaW5nS2V5UGF0aDogU3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVN0YXRlSW5mb3JtYXRpb24oa2V5UGF0aCkge1xuICAgIGxldCBpbmRleE9mRG90ID0ga2V5UGF0aC5pbmRleE9mKCcuJyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbmRleE9mRG90LFxuICAgICAgICBjdXJyZW50S2V5OiBrZXlQYXRoLnNsaWNlKDAsIGluZGV4T2ZEb3QgPj0gMCA/IGluZGV4T2ZEb3QgOiB1bmRlZmluZWQpLFxuICAgICAgICByZW1haW5pbmdLZXlQYXRoOiBrZXlQYXRoLnNsaWNlKGluZGV4T2ZEb3QgKyAxKVxuICAgIH07XG59XG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL2hlIHYxLjIuMCBieSBAbWF0aGlhcyB8IE1JVCBsaWNlbnNlICovXG47KGZ1bmN0aW9uKHJvb3QpIHtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZXMgYGV4cG9ydHNgLlxuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLlxuXHR2YXIgZnJlZU1vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmXG5cdFx0bW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMgJiYgbW9kdWxlO1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsXG5cdC8vIGFuZCB1c2UgaXQgYXMgYHJvb3RgLlxuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdC8vIEFsbCBhc3RyYWwgc3ltYm9scy5cblx0dmFyIHJlZ2V4QXN0cmFsU3ltYm9scyA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdL2c7XG5cdC8vIEFsbCBBU0NJSSBzeW1ib2xzIChub3QganVzdCBwcmludGFibGUgQVNDSUkpIGV4Y2VwdCB0aG9zZSBsaXN0ZWQgaW4gdGhlXG5cdC8vIGZpcnN0IGNvbHVtbiBvZiB0aGUgb3ZlcnJpZGVzIHRhYmxlLlxuXHQvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCN0YWJsZS1jaGFycmVmLW92ZXJyaWRlc1xuXHR2YXIgcmVnZXhBc2NpaVdoaXRlbGlzdCA9IC9bXFx4MDEtXFx4N0ZdL2c7XG5cdC8vIEFsbCBCTVAgc3ltYm9scyB0aGF0IGFyZSBub3QgQVNDSUkgbmV3bGluZXMsIHByaW50YWJsZSBBU0NJSSBzeW1ib2xzLCBvclxuXHQvLyBjb2RlIHBvaW50cyBsaXN0ZWQgaW4gdGhlIGZpcnN0IGNvbHVtbiBvZiB0aGUgb3ZlcnJpZGVzIHRhYmxlIG9uXG5cdC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3RhYmxlLWNoYXJyZWYtb3ZlcnJpZGVzLlxuXHR2YXIgcmVnZXhCbXBXaGl0ZWxpc3QgPSAvW1xceDAxLVxcdFxceDBCXFxmXFx4MEUtXFx4MUZcXHg3RlxceDgxXFx4OERcXHg4RlxceDkwXFx4OURcXHhBMC1cXHVGRkZGXS9nO1xuXG5cdHZhciByZWdleEVuY29kZU5vbkFzY2lpID0gLzxcXHUyMEQyfD1cXHUyMEU1fD5cXHUyMEQyfFxcdTIwNUZcXHUyMDBBfFxcdTIxOURcXHUwMzM4fFxcdTIyMDJcXHUwMzM4fFxcdTIyMjBcXHUyMEQyfFxcdTIyMjlcXHVGRTAwfFxcdTIyMkFcXHVGRTAwfFxcdTIyM0NcXHUyMEQyfFxcdTIyM0RcXHUwMzMxfFxcdTIyM0VcXHUwMzMzfFxcdTIyNDJcXHUwMzM4fFxcdTIyNEJcXHUwMzM4fFxcdTIyNERcXHUyMEQyfFxcdTIyNEVcXHUwMzM4fFxcdTIyNEZcXHUwMzM4fFxcdTIyNTBcXHUwMzM4fFxcdTIyNjFcXHUyMEU1fFxcdTIyNjRcXHUyMEQyfFxcdTIyNjVcXHUyMEQyfFxcdTIyNjZcXHUwMzM4fFxcdTIyNjdcXHUwMzM4fFxcdTIyNjhcXHVGRTAwfFxcdTIyNjlcXHVGRTAwfFxcdTIyNkFcXHUwMzM4fFxcdTIyNkFcXHUyMEQyfFxcdTIyNkJcXHUwMzM4fFxcdTIyNkJcXHUyMEQyfFxcdTIyN0ZcXHUwMzM4fFxcdTIyODJcXHUyMEQyfFxcdTIyODNcXHUyMEQyfFxcdTIyOEFcXHVGRTAwfFxcdTIyOEJcXHVGRTAwfFxcdTIyOEZcXHUwMzM4fFxcdTIyOTBcXHUwMzM4fFxcdTIyOTNcXHVGRTAwfFxcdTIyOTRcXHVGRTAwfFxcdTIyQjRcXHUyMEQyfFxcdTIyQjVcXHUyMEQyfFxcdTIyRDhcXHUwMzM4fFxcdTIyRDlcXHUwMzM4fFxcdTIyREFcXHVGRTAwfFxcdTIyREJcXHVGRTAwfFxcdTIyRjVcXHUwMzM4fFxcdTIyRjlcXHUwMzM4fFxcdTI5MzNcXHUwMzM4fFxcdTI5Q0ZcXHUwMzM4fFxcdTI5RDBcXHUwMzM4fFxcdTJBNkRcXHUwMzM4fFxcdTJBNzBcXHUwMzM4fFxcdTJBN0RcXHUwMzM4fFxcdTJBN0VcXHUwMzM4fFxcdTJBQTFcXHUwMzM4fFxcdTJBQTJcXHUwMzM4fFxcdTJBQUNcXHVGRTAwfFxcdTJBQURcXHVGRTAwfFxcdTJBQUZcXHUwMzM4fFxcdTJBQjBcXHUwMzM4fFxcdTJBQzVcXHUwMzM4fFxcdTJBQzZcXHUwMzM4fFxcdTJBQ0JcXHVGRTAwfFxcdTJBQ0NcXHVGRTAwfFxcdTJBRkRcXHUyMEU1fFtcXHhBMC1cXHUwMTEzXFx1MDExNi1cXHUwMTIyXFx1MDEyNC1cXHUwMTJCXFx1MDEyRS1cXHUwMTREXFx1MDE1MC1cXHUwMTdFXFx1MDE5MlxcdTAxQjVcXHUwMUY1XFx1MDIzN1xcdTAyQzZcXHUwMkM3XFx1MDJEOC1cXHUwMkREXFx1MDMxMVxcdTAzOTEtXFx1MDNBMVxcdTAzQTMtXFx1MDNBOVxcdTAzQjEtXFx1MDNDOVxcdTAzRDFcXHUwM0QyXFx1MDNENVxcdTAzRDZcXHUwM0RDXFx1MDNERFxcdTAzRjBcXHUwM0YxXFx1MDNGNVxcdTAzRjZcXHUwNDAxLVxcdTA0MENcXHUwNDBFLVxcdTA0NEZcXHUwNDUxLVxcdTA0NUNcXHUwNDVFXFx1MDQ1RlxcdTIwMDItXFx1MjAwNVxcdTIwMDctXFx1MjAxMFxcdTIwMTMtXFx1MjAxNlxcdTIwMTgtXFx1MjAxQVxcdTIwMUMtXFx1MjAxRVxcdTIwMjAtXFx1MjAyMlxcdTIwMjVcXHUyMDI2XFx1MjAzMC1cXHUyMDM1XFx1MjAzOVxcdTIwM0FcXHUyMDNFXFx1MjA0MVxcdTIwNDNcXHUyMDQ0XFx1MjA0RlxcdTIwNTdcXHUyMDVGLVxcdTIwNjNcXHUyMEFDXFx1MjBEQlxcdTIwRENcXHUyMTAyXFx1MjEwNVxcdTIxMEEtXFx1MjExM1xcdTIxMTUtXFx1MjExRVxcdTIxMjJcXHUyMTI0XFx1MjEyNy1cXHUyMTI5XFx1MjEyQ1xcdTIxMkRcXHUyMTJGLVxcdTIxMzFcXHUyMTMzLVxcdTIxMzhcXHUyMTQ1LVxcdTIxNDhcXHUyMTUzLVxcdTIxNUVcXHUyMTkwLVxcdTIxOUJcXHUyMTlELVxcdTIxQTdcXHUyMUE5LVxcdTIxQUVcXHUyMUIwLVxcdTIxQjNcXHUyMUI1LVxcdTIxQjdcXHUyMUJBLVxcdTIxREJcXHUyMUREXFx1MjFFNFxcdTIxRTVcXHUyMUY1XFx1MjFGRC1cXHUyMjA1XFx1MjIwNy1cXHUyMjA5XFx1MjIwQlxcdTIyMENcXHUyMjBGLVxcdTIyMTRcXHUyMjE2LVxcdTIyMThcXHUyMjFBXFx1MjIxRC1cXHUyMjM4XFx1MjIzQS1cXHUyMjU3XFx1MjI1OVxcdTIyNUFcXHUyMjVDXFx1MjI1Ri1cXHUyMjYyXFx1MjI2NC1cXHUyMjhCXFx1MjI4RC1cXHUyMjlCXFx1MjI5RC1cXHUyMkE1XFx1MjJBNy1cXHUyMkIwXFx1MjJCMi1cXHUyMkJCXFx1MjJCRC1cXHUyMkRCXFx1MjJERS1cXHUyMkUzXFx1MjJFNi1cXHUyMkY3XFx1MjJGOS1cXHUyMkZFXFx1MjMwNVxcdTIzMDZcXHUyMzA4LVxcdTIzMTBcXHUyMzEyXFx1MjMxM1xcdTIzMTVcXHUyMzE2XFx1MjMxQy1cXHUyMzFGXFx1MjMyMlxcdTIzMjNcXHUyMzJEXFx1MjMyRVxcdTIzMzZcXHUyMzNEXFx1MjMzRlxcdTIzN0NcXHUyM0IwXFx1MjNCMVxcdTIzQjQtXFx1MjNCNlxcdTIzREMtXFx1MjNERlxcdTIzRTJcXHUyM0U3XFx1MjQyM1xcdTI0QzhcXHUyNTAwXFx1MjUwMlxcdTI1MENcXHUyNTEwXFx1MjUxNFxcdTI1MThcXHUyNTFDXFx1MjUyNFxcdTI1MkNcXHUyNTM0XFx1MjUzQ1xcdTI1NTAtXFx1MjU2Q1xcdTI1ODBcXHUyNTg0XFx1MjU4OFxcdTI1OTEtXFx1MjU5M1xcdTI1QTFcXHUyNUFBXFx1MjVBQlxcdTI1QURcXHUyNUFFXFx1MjVCMVxcdTI1QjMtXFx1MjVCNVxcdTI1QjhcXHUyNUI5XFx1MjVCRC1cXHUyNUJGXFx1MjVDMlxcdTI1QzNcXHUyNUNBXFx1MjVDQlxcdTI1RUNcXHUyNUVGXFx1MjVGOC1cXHUyNUZDXFx1MjYwNVxcdTI2MDZcXHUyNjBFXFx1MjY0MFxcdTI2NDJcXHUyNjYwXFx1MjY2M1xcdTI2NjVcXHUyNjY2XFx1MjY2QVxcdTI2NkQtXFx1MjY2RlxcdTI3MTNcXHUyNzE3XFx1MjcyMFxcdTI3MzZcXHUyNzU4XFx1Mjc3MlxcdTI3NzNcXHUyN0M4XFx1MjdDOVxcdTI3RTYtXFx1MjdFRFxcdTI3RjUtXFx1MjdGQVxcdTI3RkNcXHUyN0ZGXFx1MjkwMi1cXHUyOTA1XFx1MjkwQy1cXHUyOTEzXFx1MjkxNlxcdTI5MTktXFx1MjkyMFxcdTI5MjMtXFx1MjkyQVxcdTI5MzNcXHUyOTM1LVxcdTI5MzlcXHUyOTNDXFx1MjkzRFxcdTI5NDVcXHUyOTQ4LVxcdTI5NEJcXHUyOTRFLVxcdTI5NzZcXHUyOTc4XFx1Mjk3OVxcdTI5N0ItXFx1Mjk3RlxcdTI5ODVcXHUyOTg2XFx1Mjk4Qi1cXHUyOTk2XFx1Mjk5QVxcdTI5OUNcXHUyOTlEXFx1MjlBNC1cXHUyOUI3XFx1MjlCOVxcdTI5QkJcXHUyOUJDXFx1MjlCRS1cXHUyOUM1XFx1MjlDOVxcdTI5Q0QtXFx1MjlEMFxcdTI5REMtXFx1MjlERVxcdTI5RTMtXFx1MjlFNVxcdTI5RUJcXHUyOUY0XFx1MjlGNlxcdTJBMDAtXFx1MkEwMlxcdTJBMDRcXHUyQTA2XFx1MkEwQ1xcdTJBMERcXHUyQTEwLVxcdTJBMTdcXHUyQTIyLVxcdTJBMjdcXHUyQTI5XFx1MkEyQVxcdTJBMkQtXFx1MkEzMVxcdTJBMzMtXFx1MkEzQ1xcdTJBM0ZcXHUyQTQwXFx1MkE0Mi1cXHUyQTREXFx1MkE1MFxcdTJBNTMtXFx1MkE1OFxcdTJBNUEtXFx1MkE1RFxcdTJBNUZcXHUyQTY2XFx1MkE2QVxcdTJBNkQtXFx1MkE3NVxcdTJBNzctXFx1MkE5QVxcdTJBOUQtXFx1MkFBMlxcdTJBQTQtXFx1MkFCMFxcdTJBQjMtXFx1MkFDOFxcdTJBQ0JcXHUyQUNDXFx1MkFDRi1cXHUyQURCXFx1MkFFNFxcdTJBRTYtXFx1MkFFOVxcdTJBRUItXFx1MkFGM1xcdTJBRkRcXHVGQjAwLVxcdUZCMDRdfFxcdUQ4MzVbXFx1REM5Q1xcdURDOUVcXHVEQzlGXFx1RENBMlxcdURDQTVcXHVEQ0E2XFx1RENBOS1cXHVEQ0FDXFx1RENBRS1cXHVEQ0I5XFx1RENCQlxcdURDQkQtXFx1RENDM1xcdURDQzUtXFx1RENDRlxcdUREMDRcXHVERDA1XFx1REQwNy1cXHVERDBBXFx1REQwRC1cXHVERDE0XFx1REQxNi1cXHVERDFDXFx1REQxRS1cXHVERDM5XFx1REQzQi1cXHVERDNFXFx1REQ0MC1cXHVERDQ0XFx1REQ0NlxcdURENEEtXFx1REQ1MFxcdURENTItXFx1REQ2Ql0vZztcblx0dmFyIGVuY29kZU1hcCA9IHsnXFx4QUQnOidzaHknLCdcXHUyMDBDJzonenduaicsJ1xcdTIwMEQnOid6d2onLCdcXHUyMDBFJzonbHJtJywnXFx1MjA2Myc6J2ljJywnXFx1MjA2Mic6J2l0JywnXFx1MjA2MSc6J2FmJywnXFx1MjAwRic6J3JsbScsJ1xcdTIwMEInOidaZXJvV2lkdGhTcGFjZScsJ1xcdTIwNjAnOidOb0JyZWFrJywnXFx1MDMxMSc6J0Rvd25CcmV2ZScsJ1xcdTIwREInOid0ZG90JywnXFx1MjBEQyc6J0RvdERvdCcsJ1xcdCc6J1RhYicsJ1xcbic6J05ld0xpbmUnLCdcXHUyMDA4JzoncHVuY3NwJywnXFx1MjA1Ric6J01lZGl1bVNwYWNlJywnXFx1MjAwOSc6J3RoaW5zcCcsJ1xcdTIwMEEnOidoYWlyc3AnLCdcXHUyMDA0JzonZW1zcDEzJywnXFx1MjAwMic6J2Vuc3AnLCdcXHUyMDA1JzonZW1zcDE0JywnXFx1MjAwMyc6J2Vtc3AnLCdcXHUyMDA3JzonbnVtc3AnLCdcXHhBMCc6J25ic3AnLCdcXHUyMDVGXFx1MjAwQSc6J1RoaWNrU3BhY2UnLCdcXHUyMDNFJzonb2xpbmUnLCdfJzonbG93YmFyJywnXFx1MjAxMCc6J2Rhc2gnLCdcXHUyMDEzJzonbmRhc2gnLCdcXHUyMDE0JzonbWRhc2gnLCdcXHUyMDE1JzonaG9yYmFyJywnLCc6J2NvbW1hJywnOyc6J3NlbWknLCdcXHUyMDRGJzonYnNlbWknLCc6JzonY29sb24nLCdcXHUyQTc0JzonQ29sb25lJywnISc6J2V4Y2wnLCdcXHhBMSc6J2lleGNsJywnPyc6J3F1ZXN0JywnXFx4QkYnOidpcXVlc3QnLCcuJzoncGVyaW9kJywnXFx1MjAyNSc6J25sZHInLCdcXHUyMDI2JzonbWxkcicsJ1xceEI3JzonbWlkZG90JywnXFwnJzonYXBvcycsJ1xcdTIwMTgnOidsc3F1bycsJ1xcdTIwMTknOidyc3F1bycsJ1xcdTIwMUEnOidzYnF1bycsJ1xcdTIwMzknOidsc2FxdW8nLCdcXHUyMDNBJzoncnNhcXVvJywnXCInOidxdW90JywnXFx1MjAxQyc6J2xkcXVvJywnXFx1MjAxRCc6J3JkcXVvJywnXFx1MjAxRSc6J2JkcXVvJywnXFx4QUInOidsYXF1bycsJ1xceEJCJzoncmFxdW8nLCcoJzonbHBhcicsJyknOidycGFyJywnWyc6J2xzcWInLCddJzoncnNxYicsJ3snOidsY3ViJywnfSc6J3JjdWInLCdcXHUyMzA4JzonbGNlaWwnLCdcXHUyMzA5JzoncmNlaWwnLCdcXHUyMzBBJzonbGZsb29yJywnXFx1MjMwQic6J3JmbG9vcicsJ1xcdTI5ODUnOidsb3BhcicsJ1xcdTI5ODYnOidyb3BhcicsJ1xcdTI5OEInOidsYnJrZScsJ1xcdTI5OEMnOidyYnJrZScsJ1xcdTI5OEQnOidsYnJrc2x1JywnXFx1Mjk4RSc6J3JicmtzbGQnLCdcXHUyOThGJzonbGJya3NsZCcsJ1xcdTI5OTAnOidyYnJrc2x1JywnXFx1Mjk5MSc6J2xhbmdkJywnXFx1Mjk5Mic6J3JhbmdkJywnXFx1Mjk5Myc6J2xwYXJsdCcsJ1xcdTI5OTQnOidycGFyZ3QnLCdcXHUyOTk1JzonZ3RsUGFyJywnXFx1Mjk5Nic6J2x0clBhcicsJ1xcdTI3RTYnOidsb2JyaycsJ1xcdTI3RTcnOidyb2JyaycsJ1xcdTI3RTgnOidsYW5nJywnXFx1MjdFOSc6J3JhbmcnLCdcXHUyN0VBJzonTGFuZycsJ1xcdTI3RUInOidSYW5nJywnXFx1MjdFQyc6J2xvYW5nJywnXFx1MjdFRCc6J3JvYW5nJywnXFx1Mjc3Mic6J2xiYnJrJywnXFx1Mjc3Myc6J3JiYnJrJywnXFx1MjAxNic6J1ZlcnQnLCdcXHhBNyc6J3NlY3QnLCdcXHhCNic6J3BhcmEnLCdAJzonY29tbWF0JywnKic6J2FzdCcsJy8nOidzb2wnLCd1bmRlZmluZWQnOm51bGwsJyYnOidhbXAnLCcjJzonbnVtJywnJSc6J3BlcmNudCcsJ1xcdTIwMzAnOidwZXJtaWwnLCdcXHUyMDMxJzoncGVydGVuaycsJ1xcdTIwMjAnOidkYWdnZXInLCdcXHUyMDIxJzonRGFnZ2VyJywnXFx1MjAyMic6J2J1bGwnLCdcXHUyMDQzJzonaHlidWxsJywnXFx1MjAzMic6J3ByaW1lJywnXFx1MjAzMyc6J1ByaW1lJywnXFx1MjAzNCc6J3RwcmltZScsJ1xcdTIwNTcnOidxcHJpbWUnLCdcXHUyMDM1JzonYnByaW1lJywnXFx1MjA0MSc6J2NhcmV0JywnYCc6J2dyYXZlJywnXFx4QjQnOidhY3V0ZScsJ1xcdTAyREMnOid0aWxkZScsJ14nOidIYXQnLCdcXHhBRic6J21hY3InLCdcXHUwMkQ4JzonYnJldmUnLCdcXHUwMkQ5JzonZG90JywnXFx4QTgnOidkaWUnLCdcXHUwMkRBJzoncmluZycsJ1xcdTAyREQnOidkYmxhYycsJ1xceEI4JzonY2VkaWwnLCdcXHUwMkRCJzonb2dvbicsJ1xcdTAyQzYnOidjaXJjJywnXFx1MDJDNyc6J2Nhcm9uJywnXFx4QjAnOidkZWcnLCdcXHhBOSc6J2NvcHknLCdcXHhBRSc6J3JlZycsJ1xcdTIxMTcnOidjb3B5c3InLCdcXHUyMTE4Jzond3AnLCdcXHUyMTFFJzoncngnLCdcXHUyMTI3JzonbWhvJywnXFx1MjEyOSc6J2lpb3RhJywnXFx1MjE5MCc6J2xhcnInLCdcXHUyMTlBJzonbmxhcnInLCdcXHUyMTkyJzoncmFycicsJ1xcdTIxOUInOiducmFycicsJ1xcdTIxOTEnOid1YXJyJywnXFx1MjE5Myc6J2RhcnInLCdcXHUyMTk0JzonaGFycicsJ1xcdTIxQUUnOiduaGFycicsJ1xcdTIxOTUnOid2YXJyJywnXFx1MjE5Nic6J253YXJyJywnXFx1MjE5Nyc6J25lYXJyJywnXFx1MjE5OCc6J3NlYXJyJywnXFx1MjE5OSc6J3N3YXJyJywnXFx1MjE5RCc6J3JhcnJ3JywnXFx1MjE5RFxcdTAzMzgnOiducmFycncnLCdcXHUyMTlFJzonTGFycicsJ1xcdTIxOUYnOidVYXJyJywnXFx1MjFBMCc6J1JhcnInLCdcXHUyMUExJzonRGFycicsJ1xcdTIxQTInOidsYXJydGwnLCdcXHUyMUEzJzoncmFycnRsJywnXFx1MjFBNCc6J21hcHN0b2xlZnQnLCdcXHUyMUE1JzonbWFwc3RvdXAnLCdcXHUyMUE2JzonbWFwJywnXFx1MjFBNyc6J21hcHN0b2Rvd24nLCdcXHUyMUE5JzonbGFycmhrJywnXFx1MjFBQSc6J3JhcnJoaycsJ1xcdTIxQUInOidsYXJybHAnLCdcXHUyMUFDJzoncmFycmxwJywnXFx1MjFBRCc6J2hhcnJ3JywnXFx1MjFCMCc6J2xzaCcsJ1xcdTIxQjEnOidyc2gnLCdcXHUyMUIyJzonbGRzaCcsJ1xcdTIxQjMnOidyZHNoJywnXFx1MjFCNSc6J2NyYXJyJywnXFx1MjFCNic6J2N1bGFycicsJ1xcdTIxQjcnOidjdXJhcnInLCdcXHUyMUJBJzonb2xhcnInLCdcXHUyMUJCJzonb3JhcnInLCdcXHUyMUJDJzonbGhhcnUnLCdcXHUyMUJEJzonbGhhcmQnLCdcXHUyMUJFJzondWhhcnInLCdcXHUyMUJGJzondWhhcmwnLCdcXHUyMUMwJzoncmhhcnUnLCdcXHUyMUMxJzoncmhhcmQnLCdcXHUyMUMyJzonZGhhcnInLCdcXHUyMUMzJzonZGhhcmwnLCdcXHUyMUM0JzoncmxhcnInLCdcXHUyMUM1JzondWRhcnInLCdcXHUyMUM2JzonbHJhcnInLCdcXHUyMUM3JzonbGxhcnInLCdcXHUyMUM4JzondXVhcnInLCdcXHUyMUM5JzoncnJhcnInLCdcXHUyMUNBJzonZGRhcnInLCdcXHUyMUNCJzonbHJoYXInLCdcXHUyMUNDJzoncmxoYXInLCdcXHUyMUQwJzonbEFycicsJ1xcdTIxQ0QnOidubEFycicsJ1xcdTIxRDEnOid1QXJyJywnXFx1MjFEMic6J3JBcnInLCdcXHUyMUNGJzonbnJBcnInLCdcXHUyMUQzJzonZEFycicsJ1xcdTIxRDQnOidpZmYnLCdcXHUyMUNFJzonbmhBcnInLCdcXHUyMUQ1JzondkFycicsJ1xcdTIxRDYnOidud0FycicsJ1xcdTIxRDcnOiduZUFycicsJ1xcdTIxRDgnOidzZUFycicsJ1xcdTIxRDknOidzd0FycicsJ1xcdTIxREEnOidsQWFycicsJ1xcdTIxREInOidyQWFycicsJ1xcdTIxREQnOid6aWdyYXJyJywnXFx1MjFFNCc6J2xhcnJiJywnXFx1MjFFNSc6J3JhcnJiJywnXFx1MjFGNSc6J2R1YXJyJywnXFx1MjFGRCc6J2xvYXJyJywnXFx1MjFGRSc6J3JvYXJyJywnXFx1MjFGRic6J2hvYXJyJywnXFx1MjIwMCc6J2ZvcmFsbCcsJ1xcdTIyMDEnOidjb21wJywnXFx1MjIwMic6J3BhcnQnLCdcXHUyMjAyXFx1MDMzOCc6J25wYXJ0JywnXFx1MjIwMyc6J2V4aXN0JywnXFx1MjIwNCc6J25leGlzdCcsJ1xcdTIyMDUnOidlbXB0eScsJ1xcdTIyMDcnOidEZWwnLCdcXHUyMjA4JzonaW4nLCdcXHUyMjA5Jzonbm90aW4nLCdcXHUyMjBCJzonbmknLCdcXHUyMjBDJzonbm90bmknLCdcXHUwM0Y2JzonYmVwc2knLCdcXHUyMjBGJzoncHJvZCcsJ1xcdTIyMTAnOidjb3Byb2QnLCdcXHUyMjExJzonc3VtJywnKyc6J3BsdXMnLCdcXHhCMSc6J3BtJywnXFx4RjcnOidkaXYnLCdcXHhENyc6J3RpbWVzJywnPCc6J2x0JywnXFx1MjI2RSc6J25sdCcsJzxcXHUyMEQyJzonbnZsdCcsJz0nOidlcXVhbHMnLCdcXHUyMjYwJzonbmUnLCc9XFx1MjBFNSc6J2JuZScsJ1xcdTJBNzUnOidFcXVhbCcsJz4nOidndCcsJ1xcdTIyNkYnOiduZ3QnLCc+XFx1MjBEMic6J252Z3QnLCdcXHhBQyc6J25vdCcsJ3wnOid2ZXJ0JywnXFx4QTYnOidicnZiYXInLCdcXHUyMjEyJzonbWludXMnLCdcXHUyMjEzJzonbXAnLCdcXHUyMjE0JzoncGx1c2RvJywnXFx1MjA0NCc6J2ZyYXNsJywnXFx1MjIxNic6J3NldG1uJywnXFx1MjIxNyc6J2xvd2FzdCcsJ1xcdTIyMTgnOidjb21wZm4nLCdcXHUyMjFBJzonU3FydCcsJ1xcdTIyMUQnOidwcm9wJywnXFx1MjIxRSc6J2luZmluJywnXFx1MjIxRic6J2FuZ3J0JywnXFx1MjIyMCc6J2FuZycsJ1xcdTIyMjBcXHUyMEQyJzonbmFuZycsJ1xcdTIyMjEnOidhbmdtc2QnLCdcXHUyMjIyJzonYW5nc3BoJywnXFx1MjIyMyc6J21pZCcsJ1xcdTIyMjQnOidubWlkJywnXFx1MjIyNSc6J3BhcicsJ1xcdTIyMjYnOiducGFyJywnXFx1MjIyNyc6J2FuZCcsJ1xcdTIyMjgnOidvcicsJ1xcdTIyMjknOidjYXAnLCdcXHUyMjI5XFx1RkUwMCc6J2NhcHMnLCdcXHUyMjJBJzonY3VwJywnXFx1MjIyQVxcdUZFMDAnOidjdXBzJywnXFx1MjIyQic6J2ludCcsJ1xcdTIyMkMnOidJbnQnLCdcXHUyMjJEJzondGludCcsJ1xcdTJBMEMnOidxaW50JywnXFx1MjIyRSc6J29pbnQnLCdcXHUyMjJGJzonQ29uaW50JywnXFx1MjIzMCc6J0Njb25pbnQnLCdcXHUyMjMxJzonY3dpbnQnLCdcXHUyMjMyJzonY3djb25pbnQnLCdcXHUyMjMzJzonYXdjb25pbnQnLCdcXHUyMjM0JzondGhlcmU0JywnXFx1MjIzNSc6J2JlY2F1cycsJ1xcdTIyMzYnOidyYXRpbycsJ1xcdTIyMzcnOidDb2xvbicsJ1xcdTIyMzgnOidtaW51c2QnLCdcXHUyMjNBJzonbUREb3QnLCdcXHUyMjNCJzonaG9tdGh0JywnXFx1MjIzQyc6J3NpbScsJ1xcdTIyNDEnOiduc2ltJywnXFx1MjIzQ1xcdTIwRDInOidudnNpbScsJ1xcdTIyM0QnOidic2ltJywnXFx1MjIzRFxcdTAzMzEnOidyYWNlJywnXFx1MjIzRSc6J2FjJywnXFx1MjIzRVxcdTAzMzMnOidhY0UnLCdcXHUyMjNGJzonYWNkJywnXFx1MjI0MCc6J3dyJywnXFx1MjI0Mic6J2VzaW0nLCdcXHUyMjQyXFx1MDMzOCc6J25lc2ltJywnXFx1MjI0Myc6J3NpbWUnLCdcXHUyMjQ0JzonbnNpbWUnLCdcXHUyMjQ1JzonY29uZycsJ1xcdTIyNDcnOiduY29uZycsJ1xcdTIyNDYnOidzaW1uZScsJ1xcdTIyNDgnOidhcCcsJ1xcdTIyNDknOiduYXAnLCdcXHUyMjRBJzonYXBlJywnXFx1MjI0Qic6J2FwaWQnLCdcXHUyMjRCXFx1MDMzOCc6J25hcGlkJywnXFx1MjI0Qyc6J2Jjb25nJywnXFx1MjI0RCc6J0N1cENhcCcsJ1xcdTIyNkQnOidOb3RDdXBDYXAnLCdcXHUyMjREXFx1MjBEMic6J252YXAnLCdcXHUyMjRFJzonYnVtcCcsJ1xcdTIyNEVcXHUwMzM4JzonbmJ1bXAnLCdcXHUyMjRGJzonYnVtcGUnLCdcXHUyMjRGXFx1MDMzOCc6J25idW1wZScsJ1xcdTIyNTAnOidkb3RlcScsJ1xcdTIyNTBcXHUwMzM4JzonbmVkb3QnLCdcXHUyMjUxJzonZURvdCcsJ1xcdTIyNTInOidlZkRvdCcsJ1xcdTIyNTMnOidlckRvdCcsJ1xcdTIyNTQnOidjb2xvbmUnLCdcXHUyMjU1JzonZWNvbG9uJywnXFx1MjI1Nic6J2VjaXInLCdcXHUyMjU3JzonY2lyZScsJ1xcdTIyNTknOid3ZWRnZXEnLCdcXHUyMjVBJzondmVlZXEnLCdcXHUyMjVDJzondHJpZScsJ1xcdTIyNUYnOidlcXVlc3QnLCdcXHUyMjYxJzonZXF1aXYnLCdcXHUyMjYyJzonbmVxdWl2JywnXFx1MjI2MVxcdTIwRTUnOidibmVxdWl2JywnXFx1MjI2NCc6J2xlJywnXFx1MjI3MCc6J25sZScsJ1xcdTIyNjRcXHUyMEQyJzonbnZsZScsJ1xcdTIyNjUnOidnZScsJ1xcdTIyNzEnOiduZ2UnLCdcXHUyMjY1XFx1MjBEMic6J252Z2UnLCdcXHUyMjY2JzonbEUnLCdcXHUyMjY2XFx1MDMzOCc6J25sRScsJ1xcdTIyNjcnOidnRScsJ1xcdTIyNjdcXHUwMzM4JzonbmdFJywnXFx1MjI2OFxcdUZFMDAnOidsdm5FJywnXFx1MjI2OCc6J2xuRScsJ1xcdTIyNjknOidnbkUnLCdcXHUyMjY5XFx1RkUwMCc6J2d2bkUnLCdcXHUyMjZBJzonbGwnLCdcXHUyMjZBXFx1MDMzOCc6J25MdHYnLCdcXHUyMjZBXFx1MjBEMic6J25MdCcsJ1xcdTIyNkInOidnZycsJ1xcdTIyNkJcXHUwMzM4Jzonbkd0dicsJ1xcdTIyNkJcXHUyMEQyJzonbkd0JywnXFx1MjI2Qyc6J3R3aXh0JywnXFx1MjI3Mic6J2xzaW0nLCdcXHUyMjc0JzonbmxzaW0nLCdcXHUyMjczJzonZ3NpbScsJ1xcdTIyNzUnOiduZ3NpbScsJ1xcdTIyNzYnOidsZycsJ1xcdTIyNzgnOidudGxnJywnXFx1MjI3Nyc6J2dsJywnXFx1MjI3OSc6J250Z2wnLCdcXHUyMjdBJzoncHInLCdcXHUyMjgwJzonbnByJywnXFx1MjI3Qic6J3NjJywnXFx1MjI4MSc6J25zYycsJ1xcdTIyN0MnOidwcmN1ZScsJ1xcdTIyRTAnOiducHJjdWUnLCdcXHUyMjdEJzonc2NjdWUnLCdcXHUyMkUxJzonbnNjY3VlJywnXFx1MjI3RSc6J3Byc2ltJywnXFx1MjI3Ric6J3Njc2ltJywnXFx1MjI3RlxcdTAzMzgnOidOb3RTdWNjZWVkc1RpbGRlJywnXFx1MjI4Mic6J3N1YicsJ1xcdTIyODQnOiduc3ViJywnXFx1MjI4MlxcdTIwRDInOid2bnN1YicsJ1xcdTIyODMnOidzdXAnLCdcXHUyMjg1JzonbnN1cCcsJ1xcdTIyODNcXHUyMEQyJzondm5zdXAnLCdcXHUyMjg2Jzonc3ViZScsJ1xcdTIyODgnOiduc3ViZScsJ1xcdTIyODcnOidzdXBlJywnXFx1MjI4OSc6J25zdXBlJywnXFx1MjI4QVxcdUZFMDAnOid2c3VibmUnLCdcXHUyMjhBJzonc3VibmUnLCdcXHUyMjhCXFx1RkUwMCc6J3ZzdXBuZScsJ1xcdTIyOEInOidzdXBuZScsJ1xcdTIyOEQnOidjdXBkb3QnLCdcXHUyMjhFJzondXBsdXMnLCdcXHUyMjhGJzonc3FzdWInLCdcXHUyMjhGXFx1MDMzOCc6J05vdFNxdWFyZVN1YnNldCcsJ1xcdTIyOTAnOidzcXN1cCcsJ1xcdTIyOTBcXHUwMzM4JzonTm90U3F1YXJlU3VwZXJzZXQnLCdcXHUyMjkxJzonc3FzdWJlJywnXFx1MjJFMic6J25zcXN1YmUnLCdcXHUyMjkyJzonc3FzdXBlJywnXFx1MjJFMyc6J25zcXN1cGUnLCdcXHUyMjkzJzonc3FjYXAnLCdcXHUyMjkzXFx1RkUwMCc6J3NxY2FwcycsJ1xcdTIyOTQnOidzcWN1cCcsJ1xcdTIyOTRcXHVGRTAwJzonc3FjdXBzJywnXFx1MjI5NSc6J29wbHVzJywnXFx1MjI5Nic6J29taW51cycsJ1xcdTIyOTcnOidvdGltZXMnLCdcXHUyMjk4Jzonb3NvbCcsJ1xcdTIyOTknOidvZG90JywnXFx1MjI5QSc6J29jaXInLCdcXHUyMjlCJzonb2FzdCcsJ1xcdTIyOUQnOidvZGFzaCcsJ1xcdTIyOUUnOidwbHVzYicsJ1xcdTIyOUYnOidtaW51c2InLCdcXHUyMkEwJzondGltZXNiJywnXFx1MjJBMSc6J3Nkb3RiJywnXFx1MjJBMic6J3ZkYXNoJywnXFx1MjJBQyc6J252ZGFzaCcsJ1xcdTIyQTMnOidkYXNodicsJ1xcdTIyQTQnOid0b3AnLCdcXHUyMkE1JzonYm90JywnXFx1MjJBNyc6J21vZGVscycsJ1xcdTIyQTgnOid2RGFzaCcsJ1xcdTIyQUQnOidudkRhc2gnLCdcXHUyMkE5JzonVmRhc2gnLCdcXHUyMkFFJzonblZkYXNoJywnXFx1MjJBQSc6J1Z2ZGFzaCcsJ1xcdTIyQUInOidWRGFzaCcsJ1xcdTIyQUYnOiduVkRhc2gnLCdcXHUyMkIwJzoncHJ1cmVsJywnXFx1MjJCMic6J3ZsdHJpJywnXFx1MjJFQSc6J25sdHJpJywnXFx1MjJCMyc6J3ZydHJpJywnXFx1MjJFQic6J25ydHJpJywnXFx1MjJCNCc6J2x0cmllJywnXFx1MjJFQyc6J25sdHJpZScsJ1xcdTIyQjRcXHUyMEQyJzonbnZsdHJpZScsJ1xcdTIyQjUnOidydHJpZScsJ1xcdTIyRUQnOiducnRyaWUnLCdcXHUyMkI1XFx1MjBEMic6J252cnRyaWUnLCdcXHUyMkI2Jzonb3JpZ29mJywnXFx1MjJCNyc6J2ltb2YnLCdcXHUyMkI4JzonbXVtYXAnLCdcXHUyMkI5JzonaGVyY29uJywnXFx1MjJCQSc6J2ludGNhbCcsJ1xcdTIyQkInOid2ZWViYXInLCdcXHUyMkJEJzonYmFydmVlJywnXFx1MjJCRSc6J2FuZ3J0dmInLCdcXHUyMkJGJzonbHJ0cmknLCdcXHUyMkMwJzonV2VkZ2UnLCdcXHUyMkMxJzonVmVlJywnXFx1MjJDMic6J3hjYXAnLCdcXHUyMkMzJzoneGN1cCcsJ1xcdTIyQzQnOidkaWFtJywnXFx1MjJDNSc6J3Nkb3QnLCdcXHUyMkM2JzonU3RhcicsJ1xcdTIyQzcnOidkaXZvbngnLCdcXHUyMkM4JzonYm93dGllJywnXFx1MjJDOSc6J2x0aW1lcycsJ1xcdTIyQ0EnOidydGltZXMnLCdcXHUyMkNCJzonbHRocmVlJywnXFx1MjJDQyc6J3J0aHJlZScsJ1xcdTIyQ0QnOidic2ltZScsJ1xcdTIyQ0UnOidjdXZlZScsJ1xcdTIyQ0YnOidjdXdlZCcsJ1xcdTIyRDAnOidTdWInLCdcXHUyMkQxJzonU3VwJywnXFx1MjJEMic6J0NhcCcsJ1xcdTIyRDMnOidDdXAnLCdcXHUyMkQ0JzonZm9yaycsJ1xcdTIyRDUnOidlcGFyJywnXFx1MjJENic6J2x0ZG90JywnXFx1MjJENyc6J2d0ZG90JywnXFx1MjJEOCc6J0xsJywnXFx1MjJEOFxcdTAzMzgnOiduTGwnLCdcXHUyMkQ5JzonR2cnLCdcXHUyMkQ5XFx1MDMzOCc6J25HZycsJ1xcdTIyREFcXHVGRTAwJzonbGVzZycsJ1xcdTIyREEnOidsZWcnLCdcXHUyMkRCJzonZ2VsJywnXFx1MjJEQlxcdUZFMDAnOidnZXNsJywnXFx1MjJERSc6J2N1ZXByJywnXFx1MjJERic6J2N1ZXNjJywnXFx1MjJFNic6J2xuc2ltJywnXFx1MjJFNyc6J2duc2ltJywnXFx1MjJFOCc6J3BybnNpbScsJ1xcdTIyRTknOidzY25zaW0nLCdcXHUyMkVFJzondmVsbGlwJywnXFx1MjJFRic6J2N0ZG90JywnXFx1MjJGMCc6J3V0ZG90JywnXFx1MjJGMSc6J2R0ZG90JywnXFx1MjJGMic6J2Rpc2luJywnXFx1MjJGMyc6J2lzaW5zdicsJ1xcdTIyRjQnOidpc2lucycsJ1xcdTIyRjUnOidpc2luZG90JywnXFx1MjJGNVxcdTAzMzgnOidub3RpbmRvdCcsJ1xcdTIyRjYnOidub3RpbnZjJywnXFx1MjJGNyc6J25vdGludmInLCdcXHUyMkY5JzonaXNpbkUnLCdcXHUyMkY5XFx1MDMzOCc6J25vdGluRScsJ1xcdTIyRkEnOiduaXNkJywnXFx1MjJGQic6J3huaXMnLCdcXHUyMkZDJzonbmlzJywnXFx1MjJGRCc6J25vdG5pdmMnLCdcXHUyMkZFJzonbm90bml2YicsJ1xcdTIzMDUnOidiYXJ3ZWQnLCdcXHUyMzA2JzonQmFyd2VkJywnXFx1MjMwQyc6J2RyY3JvcCcsJ1xcdTIzMEQnOidkbGNyb3AnLCdcXHUyMzBFJzondXJjcm9wJywnXFx1MjMwRic6J3VsY3JvcCcsJ1xcdTIzMTAnOidibm90JywnXFx1MjMxMic6J3Byb2ZsaW5lJywnXFx1MjMxMyc6J3Byb2ZzdXJmJywnXFx1MjMxNSc6J3RlbHJlYycsJ1xcdTIzMTYnOid0YXJnZXQnLCdcXHUyMzFDJzondWxjb3JuJywnXFx1MjMxRCc6J3VyY29ybicsJ1xcdTIzMUUnOidkbGNvcm4nLCdcXHUyMzFGJzonZHJjb3JuJywnXFx1MjMyMic6J2Zyb3duJywnXFx1MjMyMyc6J3NtaWxlJywnXFx1MjMyRCc6J2N5bGN0eScsJ1xcdTIzMkUnOidwcm9mYWxhcicsJ1xcdTIzMzYnOid0b3Bib3QnLCdcXHUyMzNEJzonb3ZiYXInLCdcXHUyMzNGJzonc29sYmFyJywnXFx1MjM3Qyc6J2FuZ3phcnInLCdcXHUyM0IwJzonbG1vdXN0JywnXFx1MjNCMSc6J3Jtb3VzdCcsJ1xcdTIzQjQnOid0YnJrJywnXFx1MjNCNSc6J2JicmsnLCdcXHUyM0I2JzonYmJya3RicmsnLCdcXHUyM0RDJzonT3ZlclBhcmVudGhlc2lzJywnXFx1MjNERCc6J1VuZGVyUGFyZW50aGVzaXMnLCdcXHUyM0RFJzonT3ZlckJyYWNlJywnXFx1MjNERic6J1VuZGVyQnJhY2UnLCdcXHUyM0UyJzondHJwZXppdW0nLCdcXHUyM0U3JzonZWxpbnRlcnMnLCdcXHUyNDIzJzonYmxhbmsnLCdcXHUyNTAwJzonYm94aCcsJ1xcdTI1MDInOidib3h2JywnXFx1MjUwQyc6J2JveGRyJywnXFx1MjUxMCc6J2JveGRsJywnXFx1MjUxNCc6J2JveHVyJywnXFx1MjUxOCc6J2JveHVsJywnXFx1MjUxQyc6J2JveHZyJywnXFx1MjUyNCc6J2JveHZsJywnXFx1MjUyQyc6J2JveGhkJywnXFx1MjUzNCc6J2JveGh1JywnXFx1MjUzQyc6J2JveHZoJywnXFx1MjU1MCc6J2JveEgnLCdcXHUyNTUxJzonYm94VicsJ1xcdTI1NTInOidib3hkUicsJ1xcdTI1NTMnOidib3hEcicsJ1xcdTI1NTQnOidib3hEUicsJ1xcdTI1NTUnOidib3hkTCcsJ1xcdTI1NTYnOidib3hEbCcsJ1xcdTI1NTcnOidib3hETCcsJ1xcdTI1NTgnOidib3h1UicsJ1xcdTI1NTknOidib3hVcicsJ1xcdTI1NUEnOidib3hVUicsJ1xcdTI1NUInOidib3h1TCcsJ1xcdTI1NUMnOidib3hVbCcsJ1xcdTI1NUQnOidib3hVTCcsJ1xcdTI1NUUnOidib3h2UicsJ1xcdTI1NUYnOidib3hWcicsJ1xcdTI1NjAnOidib3hWUicsJ1xcdTI1NjEnOidib3h2TCcsJ1xcdTI1NjInOidib3hWbCcsJ1xcdTI1NjMnOidib3hWTCcsJ1xcdTI1NjQnOidib3hIZCcsJ1xcdTI1NjUnOidib3hoRCcsJ1xcdTI1NjYnOidib3hIRCcsJ1xcdTI1NjcnOidib3hIdScsJ1xcdTI1NjgnOidib3hoVScsJ1xcdTI1NjknOidib3hIVScsJ1xcdTI1NkEnOidib3h2SCcsJ1xcdTI1NkInOidib3hWaCcsJ1xcdTI1NkMnOidib3hWSCcsJ1xcdTI1ODAnOid1aGJsaycsJ1xcdTI1ODQnOidsaGJsaycsJ1xcdTI1ODgnOidibG9jaycsJ1xcdTI1OTEnOidibGsxNCcsJ1xcdTI1OTInOidibGsxMicsJ1xcdTI1OTMnOidibGszNCcsJ1xcdTI1QTEnOidzcXUnLCdcXHUyNUFBJzonc3F1ZicsJ1xcdTI1QUInOidFbXB0eVZlcnlTbWFsbFNxdWFyZScsJ1xcdTI1QUQnOidyZWN0JywnXFx1MjVBRSc6J21hcmtlcicsJ1xcdTI1QjEnOidmbHRucycsJ1xcdTI1QjMnOid4dXRyaScsJ1xcdTI1QjQnOid1dHJpZicsJ1xcdTI1QjUnOid1dHJpJywnXFx1MjVCOCc6J3J0cmlmJywnXFx1MjVCOSc6J3J0cmknLCdcXHUyNUJEJzoneGR0cmknLCdcXHUyNUJFJzonZHRyaWYnLCdcXHUyNUJGJzonZHRyaScsJ1xcdTI1QzInOidsdHJpZicsJ1xcdTI1QzMnOidsdHJpJywnXFx1MjVDQSc6J2xveicsJ1xcdTI1Q0InOidjaXInLCdcXHUyNUVDJzondHJpZG90JywnXFx1MjVFRic6J3hjaXJjJywnXFx1MjVGOCc6J3VsdHJpJywnXFx1MjVGOSc6J3VydHJpJywnXFx1MjVGQSc6J2xsdHJpJywnXFx1MjVGQic6J0VtcHR5U21hbGxTcXVhcmUnLCdcXHUyNUZDJzonRmlsbGVkU21hbGxTcXVhcmUnLCdcXHUyNjA1Jzonc3RhcmYnLCdcXHUyNjA2Jzonc3RhcicsJ1xcdTI2MEUnOidwaG9uZScsJ1xcdTI2NDAnOidmZW1hbGUnLCdcXHUyNjQyJzonbWFsZScsJ1xcdTI2NjAnOidzcGFkZXMnLCdcXHUyNjYzJzonY2x1YnMnLCdcXHUyNjY1JzonaGVhcnRzJywnXFx1MjY2Nic6J2RpYW1zJywnXFx1MjY2QSc6J3N1bmcnLCdcXHUyNzEzJzonY2hlY2snLCdcXHUyNzE3JzonY3Jvc3MnLCdcXHUyNzIwJzonbWFsdCcsJ1xcdTI3MzYnOidzZXh0JywnXFx1Mjc1OCc6J1ZlcnRpY2FsU2VwYXJhdG9yJywnXFx1MjdDOCc6J2Jzb2xoc3ViJywnXFx1MjdDOSc6J3N1cGhzb2wnLCdcXHUyN0Y1JzoneGxhcnInLCdcXHUyN0Y2JzoneHJhcnInLCdcXHUyN0Y3JzoneGhhcnInLCdcXHUyN0Y4JzoneGxBcnInLCdcXHUyN0Y5JzoneHJBcnInLCdcXHUyN0ZBJzoneGhBcnInLCdcXHUyN0ZDJzoneG1hcCcsJ1xcdTI3RkYnOidkemlncmFycicsJ1xcdTI5MDInOidudmxBcnInLCdcXHUyOTAzJzonbnZyQXJyJywnXFx1MjkwNCc6J252SGFycicsJ1xcdTI5MDUnOidNYXAnLCdcXHUyOTBDJzonbGJhcnInLCdcXHUyOTBEJzoncmJhcnInLCdcXHUyOTBFJzonbEJhcnInLCdcXHUyOTBGJzonckJhcnInLCdcXHUyOTEwJzonUkJhcnInLCdcXHUyOTExJzonRERvdHJhaGQnLCdcXHUyOTEyJzonVXBBcnJvd0JhcicsJ1xcdTI5MTMnOidEb3duQXJyb3dCYXInLCdcXHUyOTE2JzonUmFycnRsJywnXFx1MjkxOSc6J2xhdGFpbCcsJ1xcdTI5MUEnOidyYXRhaWwnLCdcXHUyOTFCJzonbEF0YWlsJywnXFx1MjkxQyc6J3JBdGFpbCcsJ1xcdTI5MUQnOidsYXJyZnMnLCdcXHUyOTFFJzoncmFycmZzJywnXFx1MjkxRic6J2xhcnJiZnMnLCdcXHUyOTIwJzoncmFycmJmcycsJ1xcdTI5MjMnOidud2FyaGsnLCdcXHUyOTI0JzonbmVhcmhrJywnXFx1MjkyNSc6J3NlYXJoaycsJ1xcdTI5MjYnOidzd2FyaGsnLCdcXHUyOTI3JzonbnduZWFyJywnXFx1MjkyOCc6J3RvZWEnLCdcXHUyOTI5JzondG9zYScsJ1xcdTI5MkEnOidzd253YXInLCdcXHUyOTMzJzoncmFycmMnLCdcXHUyOTMzXFx1MDMzOCc6J25yYXJyYycsJ1xcdTI5MzUnOidjdWRhcnJyJywnXFx1MjkzNic6J2xkY2EnLCdcXHUyOTM3JzoncmRjYScsJ1xcdTI5MzgnOidjdWRhcnJsJywnXFx1MjkzOSc6J2xhcnJwbCcsJ1xcdTI5M0MnOidjdXJhcnJtJywnXFx1MjkzRCc6J2N1bGFycnAnLCdcXHUyOTQ1JzoncmFycnBsJywnXFx1Mjk0OCc6J2hhcnJjaXInLCdcXHUyOTQ5JzonVWFycm9jaXInLCdcXHUyOTRBJzonbHVyZHNoYXInLCdcXHUyOTRCJzonbGRydXNoYXInLCdcXHUyOTRFJzonTGVmdFJpZ2h0VmVjdG9yJywnXFx1Mjk0Ric6J1JpZ2h0VXBEb3duVmVjdG9yJywnXFx1Mjk1MCc6J0Rvd25MZWZ0UmlnaHRWZWN0b3InLCdcXHUyOTUxJzonTGVmdFVwRG93blZlY3RvcicsJ1xcdTI5NTInOidMZWZ0VmVjdG9yQmFyJywnXFx1Mjk1Myc6J1JpZ2h0VmVjdG9yQmFyJywnXFx1Mjk1NCc6J1JpZ2h0VXBWZWN0b3JCYXInLCdcXHUyOTU1JzonUmlnaHREb3duVmVjdG9yQmFyJywnXFx1Mjk1Nic6J0Rvd25MZWZ0VmVjdG9yQmFyJywnXFx1Mjk1Nyc6J0Rvd25SaWdodFZlY3RvckJhcicsJ1xcdTI5NTgnOidMZWZ0VXBWZWN0b3JCYXInLCdcXHUyOTU5JzonTGVmdERvd25WZWN0b3JCYXInLCdcXHUyOTVBJzonTGVmdFRlZVZlY3RvcicsJ1xcdTI5NUInOidSaWdodFRlZVZlY3RvcicsJ1xcdTI5NUMnOidSaWdodFVwVGVlVmVjdG9yJywnXFx1Mjk1RCc6J1JpZ2h0RG93blRlZVZlY3RvcicsJ1xcdTI5NUUnOidEb3duTGVmdFRlZVZlY3RvcicsJ1xcdTI5NUYnOidEb3duUmlnaHRUZWVWZWN0b3InLCdcXHUyOTYwJzonTGVmdFVwVGVlVmVjdG9yJywnXFx1Mjk2MSc6J0xlZnREb3duVGVlVmVjdG9yJywnXFx1Mjk2Mic6J2xIYXInLCdcXHUyOTYzJzondUhhcicsJ1xcdTI5NjQnOidySGFyJywnXFx1Mjk2NSc6J2RIYXInLCdcXHUyOTY2JzonbHVydWhhcicsJ1xcdTI5NjcnOidsZHJkaGFyJywnXFx1Mjk2OCc6J3J1bHVoYXInLCdcXHUyOTY5JzoncmRsZGhhcicsJ1xcdTI5NkEnOidsaGFydWwnLCdcXHUyOTZCJzonbGxoYXJkJywnXFx1Mjk2Qyc6J3JoYXJ1bCcsJ1xcdTI5NkQnOidscmhhcmQnLCdcXHUyOTZFJzondWRoYXInLCdcXHUyOTZGJzonZHVoYXInLCdcXHUyOTcwJzonUm91bmRJbXBsaWVzJywnXFx1Mjk3MSc6J2VyYXJyJywnXFx1Mjk3Mic6J3NpbXJhcnInLCdcXHUyOTczJzonbGFycnNpbScsJ1xcdTI5NzQnOidyYXJyc2ltJywnXFx1Mjk3NSc6J3JhcnJhcCcsJ1xcdTI5NzYnOidsdGxhcnInLCdcXHUyOTc4JzonZ3RyYXJyJywnXFx1Mjk3OSc6J3N1YnJhcnInLCdcXHUyOTdCJzonc3VwbGFycicsJ1xcdTI5N0MnOidsZmlzaHQnLCdcXHUyOTdEJzoncmZpc2h0JywnXFx1Mjk3RSc6J3VmaXNodCcsJ1xcdTI5N0YnOidkZmlzaHQnLCdcXHUyOTlBJzondnppZ3phZycsJ1xcdTI5OUMnOid2YW5ncnQnLCdcXHUyOTlEJzonYW5ncnR2YmQnLCdcXHUyOUE0JzonYW5nZScsJ1xcdTI5QTUnOidyYW5nZScsJ1xcdTI5QTYnOidkd2FuZ2xlJywnXFx1MjlBNyc6J3V3YW5nbGUnLCdcXHUyOUE4JzonYW5nbXNkYWEnLCdcXHUyOUE5JzonYW5nbXNkYWInLCdcXHUyOUFBJzonYW5nbXNkYWMnLCdcXHUyOUFCJzonYW5nbXNkYWQnLCdcXHUyOUFDJzonYW5nbXNkYWUnLCdcXHUyOUFEJzonYW5nbXNkYWYnLCdcXHUyOUFFJzonYW5nbXNkYWcnLCdcXHUyOUFGJzonYW5nbXNkYWgnLCdcXHUyOUIwJzonYmVtcHR5dicsJ1xcdTI5QjEnOidkZW1wdHl2JywnXFx1MjlCMic6J2NlbXB0eXYnLCdcXHUyOUIzJzoncmFlbXB0eXYnLCdcXHUyOUI0JzonbGFlbXB0eXYnLCdcXHUyOUI1Jzonb2hiYXInLCdcXHUyOUI2Jzonb21pZCcsJ1xcdTI5QjcnOidvcGFyJywnXFx1MjlCOSc6J29wZXJwJywnXFx1MjlCQic6J29sY3Jvc3MnLCdcXHUyOUJDJzonb2Rzb2xkJywnXFx1MjlCRSc6J29sY2lyJywnXFx1MjlCRic6J29mY2lyJywnXFx1MjlDMCc6J29sdCcsJ1xcdTI5QzEnOidvZ3QnLCdcXHUyOUMyJzonY2lyc2NpcicsJ1xcdTI5QzMnOidjaXJFJywnXFx1MjlDNCc6J3NvbGInLCdcXHUyOUM1JzonYnNvbGInLCdcXHUyOUM5JzonYm94Ym94JywnXFx1MjlDRCc6J3RyaXNiJywnXFx1MjlDRSc6J3J0cmlsdHJpJywnXFx1MjlDRic6J0xlZnRUcmlhbmdsZUJhcicsJ1xcdTI5Q0ZcXHUwMzM4JzonTm90TGVmdFRyaWFuZ2xlQmFyJywnXFx1MjlEMCc6J1JpZ2h0VHJpYW5nbGVCYXInLCdcXHUyOUQwXFx1MDMzOCc6J05vdFJpZ2h0VHJpYW5nbGVCYXInLCdcXHUyOURDJzonaWluZmluJywnXFx1MjlERCc6J2luZmludGllJywnXFx1MjlERSc6J252aW5maW4nLCdcXHUyOUUzJzonZXBhcnNsJywnXFx1MjlFNCc6J3NtZXBhcnNsJywnXFx1MjlFNSc6J2VxdnBhcnNsJywnXFx1MjlFQic6J2xvemYnLCdcXHUyOUY0JzonUnVsZURlbGF5ZWQnLCdcXHUyOUY2JzonZHNvbCcsJ1xcdTJBMDAnOid4b2RvdCcsJ1xcdTJBMDEnOid4b3BsdXMnLCdcXHUyQTAyJzoneG90aW1lJywnXFx1MkEwNCc6J3h1cGx1cycsJ1xcdTJBMDYnOid4c3FjdXAnLCdcXHUyQTBEJzonZnBhcnRpbnQnLCdcXHUyQTEwJzonY2lyZm5pbnQnLCdcXHUyQTExJzonYXdpbnQnLCdcXHUyQTEyJzoncnBwb2xpbnQnLCdcXHUyQTEzJzonc2Nwb2xpbnQnLCdcXHUyQTE0JzonbnBvbGludCcsJ1xcdTJBMTUnOidwb2ludGludCcsJ1xcdTJBMTYnOidxdWF0aW50JywnXFx1MkExNyc6J2ludGxhcmhrJywnXFx1MkEyMic6J3BsdXNjaXInLCdcXHUyQTIzJzoncGx1c2FjaXInLCdcXHUyQTI0Jzonc2ltcGx1cycsJ1xcdTJBMjUnOidwbHVzZHUnLCdcXHUyQTI2JzoncGx1c3NpbScsJ1xcdTJBMjcnOidwbHVzdHdvJywnXFx1MkEyOSc6J21jb21tYScsJ1xcdTJBMkEnOidtaW51c2R1JywnXFx1MkEyRCc6J2xvcGx1cycsJ1xcdTJBMkUnOidyb3BsdXMnLCdcXHUyQTJGJzonQ3Jvc3MnLCdcXHUyQTMwJzondGltZXNkJywnXFx1MkEzMSc6J3RpbWVzYmFyJywnXFx1MkEzMyc6J3NtYXNocCcsJ1xcdTJBMzQnOidsb3RpbWVzJywnXFx1MkEzNSc6J3JvdGltZXMnLCdcXHUyQTM2Jzonb3RpbWVzYXMnLCdcXHUyQTM3JzonT3RpbWVzJywnXFx1MkEzOCc6J29kaXYnLCdcXHUyQTM5JzondHJpcGx1cycsJ1xcdTJBM0EnOid0cmltaW51cycsJ1xcdTJBM0InOid0cml0aW1lJywnXFx1MkEzQyc6J2lwcm9kJywnXFx1MkEzRic6J2FtYWxnJywnXFx1MkE0MCc6J2NhcGRvdCcsJ1xcdTJBNDInOiduY3VwJywnXFx1MkE0Myc6J25jYXAnLCdcXHUyQTQ0JzonY2FwYW5kJywnXFx1MkE0NSc6J2N1cG9yJywnXFx1MkE0Nic6J2N1cGNhcCcsJ1xcdTJBNDcnOidjYXBjdXAnLCdcXHUyQTQ4JzonY3VwYnJjYXAnLCdcXHUyQTQ5JzonY2FwYnJjdXAnLCdcXHUyQTRBJzonY3VwY3VwJywnXFx1MkE0Qic6J2NhcGNhcCcsJ1xcdTJBNEMnOidjY3VwcycsJ1xcdTJBNEQnOidjY2FwcycsJ1xcdTJBNTAnOidjY3Vwc3NtJywnXFx1MkE1Myc6J0FuZCcsJ1xcdTJBNTQnOidPcicsJ1xcdTJBNTUnOidhbmRhbmQnLCdcXHUyQTU2Jzonb3JvcicsJ1xcdTJBNTcnOidvcnNsb3BlJywnXFx1MkE1OCc6J2FuZHNsb3BlJywnXFx1MkE1QSc6J2FuZHYnLCdcXHUyQTVCJzonb3J2JywnXFx1MkE1Qyc6J2FuZGQnLCdcXHUyQTVEJzonb3JkJywnXFx1MkE1Ric6J3dlZGJhcicsJ1xcdTJBNjYnOidzZG90ZScsJ1xcdTJBNkEnOidzaW1kb3QnLCdcXHUyQTZEJzonY29uZ2RvdCcsJ1xcdTJBNkRcXHUwMzM4JzonbmNvbmdkb3QnLCdcXHUyQTZFJzonZWFzdGVyJywnXFx1MkE2Ric6J2FwYWNpcicsJ1xcdTJBNzAnOidhcEUnLCdcXHUyQTcwXFx1MDMzOCc6J25hcEUnLCdcXHUyQTcxJzonZXBsdXMnLCdcXHUyQTcyJzoncGx1c2UnLCdcXHUyQTczJzonRXNpbScsJ1xcdTJBNzcnOidlRERvdCcsJ1xcdTJBNzgnOidlcXVpdkREJywnXFx1MkE3OSc6J2x0Y2lyJywnXFx1MkE3QSc6J2d0Y2lyJywnXFx1MkE3Qic6J2x0cXVlc3QnLCdcXHUyQTdDJzonZ3RxdWVzdCcsJ1xcdTJBN0QnOidsZXMnLCdcXHUyQTdEXFx1MDMzOCc6J25sZXMnLCdcXHUyQTdFJzonZ2VzJywnXFx1MkE3RVxcdTAzMzgnOiduZ2VzJywnXFx1MkE3Ric6J2xlc2RvdCcsJ1xcdTJBODAnOidnZXNkb3QnLCdcXHUyQTgxJzonbGVzZG90bycsJ1xcdTJBODInOidnZXNkb3RvJywnXFx1MkE4Myc6J2xlc2RvdG9yJywnXFx1MkE4NCc6J2dlc2RvdG9sJywnXFx1MkE4NSc6J2xhcCcsJ1xcdTJBODYnOidnYXAnLCdcXHUyQTg3JzonbG5lJywnXFx1MkE4OCc6J2duZScsJ1xcdTJBODknOidsbmFwJywnXFx1MkE4QSc6J2duYXAnLCdcXHUyQThCJzonbEVnJywnXFx1MkE4Qyc6J2dFbCcsJ1xcdTJBOEQnOidsc2ltZScsJ1xcdTJBOEUnOidnc2ltZScsJ1xcdTJBOEYnOidsc2ltZycsJ1xcdTJBOTAnOidnc2ltbCcsJ1xcdTJBOTEnOidsZ0UnLCdcXHUyQTkyJzonZ2xFJywnXFx1MkE5Myc6J2xlc2dlcycsJ1xcdTJBOTQnOidnZXNsZXMnLCdcXHUyQTk1JzonZWxzJywnXFx1MkE5Nic6J2VncycsJ1xcdTJBOTcnOidlbHNkb3QnLCdcXHUyQTk4JzonZWdzZG90JywnXFx1MkE5OSc6J2VsJywnXFx1MkE5QSc6J2VnJywnXFx1MkE5RCc6J3NpbWwnLCdcXHUyQTlFJzonc2ltZycsJ1xcdTJBOUYnOidzaW1sRScsJ1xcdTJBQTAnOidzaW1nRScsJ1xcdTJBQTEnOidMZXNzTGVzcycsJ1xcdTJBQTFcXHUwMzM4JzonTm90TmVzdGVkTGVzc0xlc3MnLCdcXHUyQUEyJzonR3JlYXRlckdyZWF0ZXInLCdcXHUyQUEyXFx1MDMzOCc6J05vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyJywnXFx1MkFBNCc6J2dsaicsJ1xcdTJBQTUnOidnbGEnLCdcXHUyQUE2JzonbHRjYycsJ1xcdTJBQTcnOidndGNjJywnXFx1MkFBOCc6J2xlc2NjJywnXFx1MkFBOSc6J2dlc2NjJywnXFx1MkFBQSc6J3NtdCcsJ1xcdTJBQUInOidsYXQnLCdcXHUyQUFDJzonc210ZScsJ1xcdTJBQUNcXHVGRTAwJzonc210ZXMnLCdcXHUyQUFEJzonbGF0ZScsJ1xcdTJBQURcXHVGRTAwJzonbGF0ZXMnLCdcXHUyQUFFJzonYnVtcEUnLCdcXHUyQUFGJzoncHJlJywnXFx1MkFBRlxcdTAzMzgnOiducHJlJywnXFx1MkFCMCc6J3NjZScsJ1xcdTJBQjBcXHUwMzM4JzonbnNjZScsJ1xcdTJBQjMnOidwckUnLCdcXHUyQUI0Jzonc2NFJywnXFx1MkFCNSc6J3BybkUnLCdcXHUyQUI2Jzonc2NuRScsJ1xcdTJBQjcnOidwcmFwJywnXFx1MkFCOCc6J3NjYXAnLCdcXHUyQUI5JzoncHJuYXAnLCdcXHUyQUJBJzonc2NuYXAnLCdcXHUyQUJCJzonUHInLCdcXHUyQUJDJzonU2MnLCdcXHUyQUJEJzonc3ViZG90JywnXFx1MkFCRSc6J3N1cGRvdCcsJ1xcdTJBQkYnOidzdWJwbHVzJywnXFx1MkFDMCc6J3N1cHBsdXMnLCdcXHUyQUMxJzonc3VibXVsdCcsJ1xcdTJBQzInOidzdXBtdWx0JywnXFx1MkFDMyc6J3N1YmVkb3QnLCdcXHUyQUM0Jzonc3VwZWRvdCcsJ1xcdTJBQzUnOidzdWJFJywnXFx1MkFDNVxcdTAzMzgnOiduc3ViRScsJ1xcdTJBQzYnOidzdXBFJywnXFx1MkFDNlxcdTAzMzgnOiduc3VwRScsJ1xcdTJBQzcnOidzdWJzaW0nLCdcXHUyQUM4Jzonc3Vwc2ltJywnXFx1MkFDQlxcdUZFMDAnOid2c3VibkUnLCdcXHUyQUNCJzonc3VibkUnLCdcXHUyQUNDXFx1RkUwMCc6J3ZzdXBuRScsJ1xcdTJBQ0MnOidzdXBuRScsJ1xcdTJBQ0YnOidjc3ViJywnXFx1MkFEMCc6J2NzdXAnLCdcXHUyQUQxJzonY3N1YmUnLCdcXHUyQUQyJzonY3N1cGUnLCdcXHUyQUQzJzonc3Vic3VwJywnXFx1MkFENCc6J3N1cHN1YicsJ1xcdTJBRDUnOidzdWJzdWInLCdcXHUyQUQ2Jzonc3Vwc3VwJywnXFx1MkFENyc6J3N1cGhzdWInLCdcXHUyQUQ4Jzonc3VwZHN1YicsJ1xcdTJBRDknOidmb3JrdicsJ1xcdTJBREEnOid0b3Bmb3JrJywnXFx1MkFEQic6J21sY3AnLCdcXHUyQUU0JzonRGFzaHYnLCdcXHUyQUU2JzonVmRhc2hsJywnXFx1MkFFNyc6J0JhcnYnLCdcXHUyQUU4JzondkJhcicsJ1xcdTJBRTknOid2QmFydicsJ1xcdTJBRUInOidWYmFyJywnXFx1MkFFQyc6J05vdCcsJ1xcdTJBRUQnOidiTm90JywnXFx1MkFFRSc6J3JubWlkJywnXFx1MkFFRic6J2Npcm1pZCcsJ1xcdTJBRjAnOidtaWRjaXInLCdcXHUyQUYxJzondG9wY2lyJywnXFx1MkFGMic6J25ocGFyJywnXFx1MkFGMyc6J3BhcnNpbScsJ1xcdTJBRkQnOidwYXJzbCcsJ1xcdTJBRkRcXHUyMEU1JzonbnBhcnNsJywnXFx1MjY2RCc6J2ZsYXQnLCdcXHUyNjZFJzonbmF0dXInLCdcXHUyNjZGJzonc2hhcnAnLCdcXHhBNCc6J2N1cnJlbicsJ1xceEEyJzonY2VudCcsJyQnOidkb2xsYXInLCdcXHhBMyc6J3BvdW5kJywnXFx4QTUnOid5ZW4nLCdcXHUyMEFDJzonZXVybycsJ1xceEI5Jzonc3VwMScsJ1xceEJEJzonaGFsZicsJ1xcdTIxNTMnOidmcmFjMTMnLCdcXHhCQyc6J2ZyYWMxNCcsJ1xcdTIxNTUnOidmcmFjMTUnLCdcXHUyMTU5JzonZnJhYzE2JywnXFx1MjE1Qic6J2ZyYWMxOCcsJ1xceEIyJzonc3VwMicsJ1xcdTIxNTQnOidmcmFjMjMnLCdcXHUyMTU2JzonZnJhYzI1JywnXFx4QjMnOidzdXAzJywnXFx4QkUnOidmcmFjMzQnLCdcXHUyMTU3JzonZnJhYzM1JywnXFx1MjE1Qyc6J2ZyYWMzOCcsJ1xcdTIxNTgnOidmcmFjNDUnLCdcXHUyMTVBJzonZnJhYzU2JywnXFx1MjE1RCc6J2ZyYWM1OCcsJ1xcdTIxNUUnOidmcmFjNzgnLCdcXHVEODM1XFx1RENCNic6J2FzY3InLCdcXHVEODM1XFx1REQ1Mic6J2FvcGYnLCdcXHVEODM1XFx1REQxRSc6J2FmcicsJ1xcdUQ4MzVcXHVERDM4JzonQW9wZicsJ1xcdUQ4MzVcXHVERDA0JzonQWZyJywnXFx1RDgzNVxcdURDOUMnOidBc2NyJywnXFx4QUEnOidvcmRmJywnXFx4RTEnOidhYWN1dGUnLCdcXHhDMSc6J0FhY3V0ZScsJ1xceEUwJzonYWdyYXZlJywnXFx4QzAnOidBZ3JhdmUnLCdcXHUwMTAzJzonYWJyZXZlJywnXFx1MDEwMic6J0FicmV2ZScsJ1xceEUyJzonYWNpcmMnLCdcXHhDMic6J0FjaXJjJywnXFx4RTUnOidhcmluZycsJ1xceEM1JzonYW5nc3QnLCdcXHhFNCc6J2F1bWwnLCdcXHhDNCc6J0F1bWwnLCdcXHhFMyc6J2F0aWxkZScsJ1xceEMzJzonQXRpbGRlJywnXFx1MDEwNSc6J2FvZ29uJywnXFx1MDEwNCc6J0FvZ29uJywnXFx1MDEwMSc6J2FtYWNyJywnXFx1MDEwMCc6J0FtYWNyJywnXFx4RTYnOidhZWxpZycsJ1xceEM2JzonQUVsaWcnLCdcXHVEODM1XFx1RENCNyc6J2JzY3InLCdcXHVEODM1XFx1REQ1Myc6J2JvcGYnLCdcXHVEODM1XFx1REQxRic6J2JmcicsJ1xcdUQ4MzVcXHVERDM5JzonQm9wZicsJ1xcdTIxMkMnOidCc2NyJywnXFx1RDgzNVxcdUREMDUnOidCZnInLCdcXHVEODM1XFx1REQyMCc6J2NmcicsJ1xcdUQ4MzVcXHVEQ0I4JzonY3NjcicsJ1xcdUQ4MzVcXHVERDU0JzonY29wZicsJ1xcdTIxMkQnOidDZnInLCdcXHVEODM1XFx1REM5RSc6J0NzY3InLCdcXHUyMTAyJzonQ29wZicsJ1xcdTAxMDcnOidjYWN1dGUnLCdcXHUwMTA2JzonQ2FjdXRlJywnXFx1MDEwOSc6J2NjaXJjJywnXFx1MDEwOCc6J0NjaXJjJywnXFx1MDEwRCc6J2NjYXJvbicsJ1xcdTAxMEMnOidDY2Fyb24nLCdcXHUwMTBCJzonY2RvdCcsJ1xcdTAxMEEnOidDZG90JywnXFx4RTcnOidjY2VkaWwnLCdcXHhDNyc6J0NjZWRpbCcsJ1xcdTIxMDUnOidpbmNhcmUnLCdcXHVEODM1XFx1REQyMSc6J2RmcicsJ1xcdTIxNDYnOidkZCcsJ1xcdUQ4MzVcXHVERDU1JzonZG9wZicsJ1xcdUQ4MzVcXHVEQ0I5JzonZHNjcicsJ1xcdUQ4MzVcXHVEQzlGJzonRHNjcicsJ1xcdUQ4MzVcXHVERDA3JzonRGZyJywnXFx1MjE0NSc6J0REJywnXFx1RDgzNVxcdUREM0InOidEb3BmJywnXFx1MDEwRic6J2RjYXJvbicsJ1xcdTAxMEUnOidEY2Fyb24nLCdcXHUwMTExJzonZHN0cm9rJywnXFx1MDExMCc6J0RzdHJvaycsJ1xceEYwJzonZXRoJywnXFx4RDAnOidFVEgnLCdcXHUyMTQ3JzonZWUnLCdcXHUyMTJGJzonZXNjcicsJ1xcdUQ4MzVcXHVERDIyJzonZWZyJywnXFx1RDgzNVxcdURENTYnOidlb3BmJywnXFx1MjEzMCc6J0VzY3InLCdcXHVEODM1XFx1REQwOCc6J0VmcicsJ1xcdUQ4MzVcXHVERDNDJzonRW9wZicsJ1xceEU5JzonZWFjdXRlJywnXFx4QzknOidFYWN1dGUnLCdcXHhFOCc6J2VncmF2ZScsJ1xceEM4JzonRWdyYXZlJywnXFx4RUEnOidlY2lyYycsJ1xceENBJzonRWNpcmMnLCdcXHUwMTFCJzonZWNhcm9uJywnXFx1MDExQSc6J0VjYXJvbicsJ1xceEVCJzonZXVtbCcsJ1xceENCJzonRXVtbCcsJ1xcdTAxMTcnOidlZG90JywnXFx1MDExNic6J0Vkb3QnLCdcXHUwMTE5JzonZW9nb24nLCdcXHUwMTE4JzonRW9nb24nLCdcXHUwMTEzJzonZW1hY3InLCdcXHUwMTEyJzonRW1hY3InLCdcXHVEODM1XFx1REQyMyc6J2ZmcicsJ1xcdUQ4MzVcXHVERDU3JzonZm9wZicsJ1xcdUQ4MzVcXHVEQ0JCJzonZnNjcicsJ1xcdUQ4MzVcXHVERDA5JzonRmZyJywnXFx1RDgzNVxcdUREM0QnOidGb3BmJywnXFx1MjEzMSc6J0ZzY3InLCdcXHVGQjAwJzonZmZsaWcnLCdcXHVGQjAzJzonZmZpbGlnJywnXFx1RkIwNCc6J2ZmbGxpZycsJ1xcdUZCMDEnOidmaWxpZycsJ2ZqJzonZmpsaWcnLCdcXHVGQjAyJzonZmxsaWcnLCdcXHUwMTkyJzonZm5vZicsJ1xcdTIxMEEnOidnc2NyJywnXFx1RDgzNVxcdURENTgnOidnb3BmJywnXFx1RDgzNVxcdUREMjQnOidnZnInLCdcXHVEODM1XFx1RENBMic6J0dzY3InLCdcXHVEODM1XFx1REQzRSc6J0dvcGYnLCdcXHVEODM1XFx1REQwQSc6J0dmcicsJ1xcdTAxRjUnOidnYWN1dGUnLCdcXHUwMTFGJzonZ2JyZXZlJywnXFx1MDExRSc6J0dicmV2ZScsJ1xcdTAxMUQnOidnY2lyYycsJ1xcdTAxMUMnOidHY2lyYycsJ1xcdTAxMjEnOidnZG90JywnXFx1MDEyMCc6J0dkb3QnLCdcXHUwMTIyJzonR2NlZGlsJywnXFx1RDgzNVxcdUREMjUnOidoZnInLCdcXHUyMTBFJzoncGxhbmNraCcsJ1xcdUQ4MzVcXHVEQ0JEJzonaHNjcicsJ1xcdUQ4MzVcXHVERDU5JzonaG9wZicsJ1xcdTIxMEInOidIc2NyJywnXFx1MjEwQyc6J0hmcicsJ1xcdTIxMEQnOidIb3BmJywnXFx1MDEyNSc6J2hjaXJjJywnXFx1MDEyNCc6J0hjaXJjJywnXFx1MjEwRic6J2hiYXInLCdcXHUwMTI3JzonaHN0cm9rJywnXFx1MDEyNic6J0hzdHJvaycsJ1xcdUQ4MzVcXHVERDVBJzonaW9wZicsJ1xcdUQ4MzVcXHVERDI2JzonaWZyJywnXFx1RDgzNVxcdURDQkUnOidpc2NyJywnXFx1MjE0OCc6J2lpJywnXFx1RDgzNVxcdURENDAnOidJb3BmJywnXFx1MjExMCc6J0lzY3InLCdcXHUyMTExJzonSW0nLCdcXHhFRCc6J2lhY3V0ZScsJ1xceENEJzonSWFjdXRlJywnXFx4RUMnOidpZ3JhdmUnLCdcXHhDQyc6J0lncmF2ZScsJ1xceEVFJzonaWNpcmMnLCdcXHhDRSc6J0ljaXJjJywnXFx4RUYnOidpdW1sJywnXFx4Q0YnOidJdW1sJywnXFx1MDEyOSc6J2l0aWxkZScsJ1xcdTAxMjgnOidJdGlsZGUnLCdcXHUwMTMwJzonSWRvdCcsJ1xcdTAxMkYnOidpb2dvbicsJ1xcdTAxMkUnOidJb2dvbicsJ1xcdTAxMkInOidpbWFjcicsJ1xcdTAxMkEnOidJbWFjcicsJ1xcdTAxMzMnOidpamxpZycsJ1xcdTAxMzInOidJSmxpZycsJ1xcdTAxMzEnOidpbWF0aCcsJ1xcdUQ4MzVcXHVEQ0JGJzonanNjcicsJ1xcdUQ4MzVcXHVERDVCJzonam9wZicsJ1xcdUQ4MzVcXHVERDI3JzonamZyJywnXFx1RDgzNVxcdURDQTUnOidKc2NyJywnXFx1RDgzNVxcdUREMEQnOidKZnInLCdcXHVEODM1XFx1REQ0MSc6J0pvcGYnLCdcXHUwMTM1JzonamNpcmMnLCdcXHUwMTM0JzonSmNpcmMnLCdcXHUwMjM3Jzonam1hdGgnLCdcXHVEODM1XFx1REQ1Qyc6J2tvcGYnLCdcXHVEODM1XFx1RENDMCc6J2tzY3InLCdcXHVEODM1XFx1REQyOCc6J2tmcicsJ1xcdUQ4MzVcXHVEQ0E2JzonS3NjcicsJ1xcdUQ4MzVcXHVERDQyJzonS29wZicsJ1xcdUQ4MzVcXHVERDBFJzonS2ZyJywnXFx1MDEzNyc6J2tjZWRpbCcsJ1xcdTAxMzYnOidLY2VkaWwnLCdcXHVEODM1XFx1REQyOSc6J2xmcicsJ1xcdUQ4MzVcXHVEQ0MxJzonbHNjcicsJ1xcdTIxMTMnOidlbGwnLCdcXHVEODM1XFx1REQ1RCc6J2xvcGYnLCdcXHUyMTEyJzonTHNjcicsJ1xcdUQ4MzVcXHVERDBGJzonTGZyJywnXFx1RDgzNVxcdURENDMnOidMb3BmJywnXFx1MDEzQSc6J2xhY3V0ZScsJ1xcdTAxMzknOidMYWN1dGUnLCdcXHUwMTNFJzonbGNhcm9uJywnXFx1MDEzRCc6J0xjYXJvbicsJ1xcdTAxM0MnOidsY2VkaWwnLCdcXHUwMTNCJzonTGNlZGlsJywnXFx1MDE0Mic6J2xzdHJvaycsJ1xcdTAxNDEnOidMc3Ryb2snLCdcXHUwMTQwJzonbG1pZG90JywnXFx1MDEzRic6J0xtaWRvdCcsJ1xcdUQ4MzVcXHVERDJBJzonbWZyJywnXFx1RDgzNVxcdURENUUnOidtb3BmJywnXFx1RDgzNVxcdURDQzInOidtc2NyJywnXFx1RDgzNVxcdUREMTAnOidNZnInLCdcXHVEODM1XFx1REQ0NCc6J01vcGYnLCdcXHUyMTMzJzonTXNjcicsJ1xcdUQ4MzVcXHVERDJCJzonbmZyJywnXFx1RDgzNVxcdURENUYnOidub3BmJywnXFx1RDgzNVxcdURDQzMnOiduc2NyJywnXFx1MjExNSc6J05vcGYnLCdcXHVEODM1XFx1RENBOSc6J05zY3InLCdcXHVEODM1XFx1REQxMSc6J05mcicsJ1xcdTAxNDQnOiduYWN1dGUnLCdcXHUwMTQzJzonTmFjdXRlJywnXFx1MDE0OCc6J25jYXJvbicsJ1xcdTAxNDcnOidOY2Fyb24nLCdcXHhGMSc6J250aWxkZScsJ1xceEQxJzonTnRpbGRlJywnXFx1MDE0Nic6J25jZWRpbCcsJ1xcdTAxNDUnOidOY2VkaWwnLCdcXHUyMTE2JzonbnVtZXJvJywnXFx1MDE0Qic6J2VuZycsJ1xcdTAxNEEnOidFTkcnLCdcXHVEODM1XFx1REQ2MCc6J29vcGYnLCdcXHVEODM1XFx1REQyQyc6J29mcicsJ1xcdTIxMzQnOidvc2NyJywnXFx1RDgzNVxcdURDQUEnOidPc2NyJywnXFx1RDgzNVxcdUREMTInOidPZnInLCdcXHVEODM1XFx1REQ0Nic6J09vcGYnLCdcXHhCQSc6J29yZG0nLCdcXHhGMyc6J29hY3V0ZScsJ1xceEQzJzonT2FjdXRlJywnXFx4RjInOidvZ3JhdmUnLCdcXHhEMic6J09ncmF2ZScsJ1xceEY0Jzonb2NpcmMnLCdcXHhENCc6J09jaXJjJywnXFx4RjYnOidvdW1sJywnXFx4RDYnOidPdW1sJywnXFx1MDE1MSc6J29kYmxhYycsJ1xcdTAxNTAnOidPZGJsYWMnLCdcXHhGNSc6J290aWxkZScsJ1xceEQ1JzonT3RpbGRlJywnXFx4RjgnOidvc2xhc2gnLCdcXHhEOCc6J09zbGFzaCcsJ1xcdTAxNEQnOidvbWFjcicsJ1xcdTAxNEMnOidPbWFjcicsJ1xcdTAxNTMnOidvZWxpZycsJ1xcdTAxNTInOidPRWxpZycsJ1xcdUQ4MzVcXHVERDJEJzoncGZyJywnXFx1RDgzNVxcdURDQzUnOidwc2NyJywnXFx1RDgzNVxcdURENjEnOidwb3BmJywnXFx1MjExOSc6J1BvcGYnLCdcXHVEODM1XFx1REQxMyc6J1BmcicsJ1xcdUQ4MzVcXHVEQ0FCJzonUHNjcicsJ1xcdUQ4MzVcXHVERDYyJzoncW9wZicsJ1xcdUQ4MzVcXHVERDJFJzoncWZyJywnXFx1RDgzNVxcdURDQzYnOidxc2NyJywnXFx1RDgzNVxcdURDQUMnOidRc2NyJywnXFx1RDgzNVxcdUREMTQnOidRZnInLCdcXHUyMTFBJzonUW9wZicsJ1xcdTAxMzgnOidrZ3JlZW4nLCdcXHVEODM1XFx1REQyRic6J3JmcicsJ1xcdUQ4MzVcXHVERDYzJzoncm9wZicsJ1xcdUQ4MzVcXHVEQ0M3JzoncnNjcicsJ1xcdTIxMUInOidSc2NyJywnXFx1MjExQyc6J1JlJywnXFx1MjExRCc6J1JvcGYnLCdcXHUwMTU1JzoncmFjdXRlJywnXFx1MDE1NCc6J1JhY3V0ZScsJ1xcdTAxNTknOidyY2Fyb24nLCdcXHUwMTU4JzonUmNhcm9uJywnXFx1MDE1Nyc6J3JjZWRpbCcsJ1xcdTAxNTYnOidSY2VkaWwnLCdcXHVEODM1XFx1REQ2NCc6J3NvcGYnLCdcXHVEODM1XFx1RENDOCc6J3NzY3InLCdcXHVEODM1XFx1REQzMCc6J3NmcicsJ1xcdUQ4MzVcXHVERDRBJzonU29wZicsJ1xcdUQ4MzVcXHVERDE2JzonU2ZyJywnXFx1RDgzNVxcdURDQUUnOidTc2NyJywnXFx1MjRDOCc6J29TJywnXFx1MDE1Qic6J3NhY3V0ZScsJ1xcdTAxNUEnOidTYWN1dGUnLCdcXHUwMTVEJzonc2NpcmMnLCdcXHUwMTVDJzonU2NpcmMnLCdcXHUwMTYxJzonc2Nhcm9uJywnXFx1MDE2MCc6J1NjYXJvbicsJ1xcdTAxNUYnOidzY2VkaWwnLCdcXHUwMTVFJzonU2NlZGlsJywnXFx4REYnOidzemxpZycsJ1xcdUQ4MzVcXHVERDMxJzondGZyJywnXFx1RDgzNVxcdURDQzknOid0c2NyJywnXFx1RDgzNVxcdURENjUnOid0b3BmJywnXFx1RDgzNVxcdURDQUYnOidUc2NyJywnXFx1RDgzNVxcdUREMTcnOidUZnInLCdcXHVEODM1XFx1REQ0Qic6J1RvcGYnLCdcXHUwMTY1JzondGNhcm9uJywnXFx1MDE2NCc6J1RjYXJvbicsJ1xcdTAxNjMnOid0Y2VkaWwnLCdcXHUwMTYyJzonVGNlZGlsJywnXFx1MjEyMic6J3RyYWRlJywnXFx1MDE2Nyc6J3RzdHJvaycsJ1xcdTAxNjYnOidUc3Ryb2snLCdcXHVEODM1XFx1RENDQSc6J3VzY3InLCdcXHVEODM1XFx1REQ2Nic6J3VvcGYnLCdcXHVEODM1XFx1REQzMic6J3VmcicsJ1xcdUQ4MzVcXHVERDRDJzonVW9wZicsJ1xcdUQ4MzVcXHVERDE4JzonVWZyJywnXFx1RDgzNVxcdURDQjAnOidVc2NyJywnXFx4RkEnOid1YWN1dGUnLCdcXHhEQSc6J1VhY3V0ZScsJ1xceEY5JzondWdyYXZlJywnXFx4RDknOidVZ3JhdmUnLCdcXHUwMTZEJzondWJyZXZlJywnXFx1MDE2Qyc6J1VicmV2ZScsJ1xceEZCJzondWNpcmMnLCdcXHhEQic6J1VjaXJjJywnXFx1MDE2Ric6J3VyaW5nJywnXFx1MDE2RSc6J1VyaW5nJywnXFx4RkMnOid1dW1sJywnXFx4REMnOidVdW1sJywnXFx1MDE3MSc6J3VkYmxhYycsJ1xcdTAxNzAnOidVZGJsYWMnLCdcXHUwMTY5JzondXRpbGRlJywnXFx1MDE2OCc6J1V0aWxkZScsJ1xcdTAxNzMnOid1b2dvbicsJ1xcdTAxNzInOidVb2dvbicsJ1xcdTAxNkInOid1bWFjcicsJ1xcdTAxNkEnOidVbWFjcicsJ1xcdUQ4MzVcXHVERDMzJzondmZyJywnXFx1RDgzNVxcdURENjcnOid2b3BmJywnXFx1RDgzNVxcdURDQ0InOid2c2NyJywnXFx1RDgzNVxcdUREMTknOidWZnInLCdcXHVEODM1XFx1REQ0RCc6J1ZvcGYnLCdcXHVEODM1XFx1RENCMSc6J1ZzY3InLCdcXHVEODM1XFx1REQ2OCc6J3dvcGYnLCdcXHVEODM1XFx1RENDQyc6J3dzY3InLCdcXHVEODM1XFx1REQzNCc6J3dmcicsJ1xcdUQ4MzVcXHVEQ0IyJzonV3NjcicsJ1xcdUQ4MzVcXHVERDRFJzonV29wZicsJ1xcdUQ4MzVcXHVERDFBJzonV2ZyJywnXFx1MDE3NSc6J3djaXJjJywnXFx1MDE3NCc6J1djaXJjJywnXFx1RDgzNVxcdUREMzUnOid4ZnInLCdcXHVEODM1XFx1RENDRCc6J3hzY3InLCdcXHVEODM1XFx1REQ2OSc6J3hvcGYnLCdcXHVEODM1XFx1REQ0Ric6J1hvcGYnLCdcXHVEODM1XFx1REQxQic6J1hmcicsJ1xcdUQ4MzVcXHVEQ0IzJzonWHNjcicsJ1xcdUQ4MzVcXHVERDM2JzoneWZyJywnXFx1RDgzNVxcdURDQ0UnOid5c2NyJywnXFx1RDgzNVxcdURENkEnOid5b3BmJywnXFx1RDgzNVxcdURDQjQnOidZc2NyJywnXFx1RDgzNVxcdUREMUMnOidZZnInLCdcXHVEODM1XFx1REQ1MCc6J1lvcGYnLCdcXHhGRCc6J3lhY3V0ZScsJ1xceEREJzonWWFjdXRlJywnXFx1MDE3Nyc6J3ljaXJjJywnXFx1MDE3Nic6J1ljaXJjJywnXFx4RkYnOid5dW1sJywnXFx1MDE3OCc6J1l1bWwnLCdcXHVEODM1XFx1RENDRic6J3pzY3InLCdcXHVEODM1XFx1REQzNyc6J3pmcicsJ1xcdUQ4MzVcXHVERDZCJzonem9wZicsJ1xcdTIxMjgnOidaZnInLCdcXHUyMTI0JzonWm9wZicsJ1xcdUQ4MzVcXHVEQ0I1JzonWnNjcicsJ1xcdTAxN0EnOid6YWN1dGUnLCdcXHUwMTc5JzonWmFjdXRlJywnXFx1MDE3RSc6J3pjYXJvbicsJ1xcdTAxN0QnOidaY2Fyb24nLCdcXHUwMTdDJzonemRvdCcsJ1xcdTAxN0InOidaZG90JywnXFx1MDFCNSc6J2ltcGVkJywnXFx4RkUnOid0aG9ybicsJ1xceERFJzonVEhPUk4nLCdcXHUwMTQ5JzonbmFwb3MnLCdcXHUwM0IxJzonYWxwaGEnLCdcXHUwMzkxJzonQWxwaGEnLCdcXHUwM0IyJzonYmV0YScsJ1xcdTAzOTInOidCZXRhJywnXFx1MDNCMyc6J2dhbW1hJywnXFx1MDM5Myc6J0dhbW1hJywnXFx1MDNCNCc6J2RlbHRhJywnXFx1MDM5NCc6J0RlbHRhJywnXFx1MDNCNSc6J2Vwc2knLCdcXHUwM0Y1JzonZXBzaXYnLCdcXHUwMzk1JzonRXBzaWxvbicsJ1xcdTAzREQnOidnYW1tYWQnLCdcXHUwM0RDJzonR2FtbWFkJywnXFx1MDNCNic6J3pldGEnLCdcXHUwMzk2JzonWmV0YScsJ1xcdTAzQjcnOidldGEnLCdcXHUwMzk3JzonRXRhJywnXFx1MDNCOCc6J3RoZXRhJywnXFx1MDNEMSc6J3RoZXRhdicsJ1xcdTAzOTgnOidUaGV0YScsJ1xcdTAzQjknOidpb3RhJywnXFx1MDM5OSc6J0lvdGEnLCdcXHUwM0JBJzona2FwcGEnLCdcXHUwM0YwJzona2FwcGF2JywnXFx1MDM5QSc6J0thcHBhJywnXFx1MDNCQic6J2xhbWJkYScsJ1xcdTAzOUInOidMYW1iZGEnLCdcXHUwM0JDJzonbXUnLCdcXHhCNSc6J21pY3JvJywnXFx1MDM5Qyc6J011JywnXFx1MDNCRCc6J251JywnXFx1MDM5RCc6J051JywnXFx1MDNCRSc6J3hpJywnXFx1MDM5RSc6J1hpJywnXFx1MDNCRic6J29taWNyb24nLCdcXHUwMzlGJzonT21pY3JvbicsJ1xcdTAzQzAnOidwaScsJ1xcdTAzRDYnOidwaXYnLCdcXHUwM0EwJzonUGknLCdcXHUwM0MxJzoncmhvJywnXFx1MDNGMSc6J3Job3YnLCdcXHUwM0ExJzonUmhvJywnXFx1MDNDMyc6J3NpZ21hJywnXFx1MDNBMyc6J1NpZ21hJywnXFx1MDNDMic6J3NpZ21hZicsJ1xcdTAzQzQnOid0YXUnLCdcXHUwM0E0JzonVGF1JywnXFx1MDNDNSc6J3Vwc2knLCdcXHUwM0E1JzonVXBzaWxvbicsJ1xcdTAzRDInOidVcHNpJywnXFx1MDNDNic6J3BoaScsJ1xcdTAzRDUnOidwaGl2JywnXFx1MDNBNic6J1BoaScsJ1xcdTAzQzcnOidjaGknLCdcXHUwM0E3JzonQ2hpJywnXFx1MDNDOCc6J3BzaScsJ1xcdTAzQTgnOidQc2knLCdcXHUwM0M5Jzonb21lZ2EnLCdcXHUwM0E5Jzonb2htJywnXFx1MDQzMCc6J2FjeScsJ1xcdTA0MTAnOidBY3knLCdcXHUwNDMxJzonYmN5JywnXFx1MDQxMSc6J0JjeScsJ1xcdTA0MzInOid2Y3knLCdcXHUwNDEyJzonVmN5JywnXFx1MDQzMyc6J2djeScsJ1xcdTA0MTMnOidHY3knLCdcXHUwNDUzJzonZ2pjeScsJ1xcdTA0MDMnOidHSmN5JywnXFx1MDQzNCc6J2RjeScsJ1xcdTA0MTQnOidEY3knLCdcXHUwNDUyJzonZGpjeScsJ1xcdTA0MDInOidESmN5JywnXFx1MDQzNSc6J2llY3knLCdcXHUwNDE1JzonSUVjeScsJ1xcdTA0NTEnOidpb2N5JywnXFx1MDQwMSc6J0lPY3knLCdcXHUwNDU0JzonanVrY3knLCdcXHUwNDA0JzonSnVrY3knLCdcXHUwNDM2JzonemhjeScsJ1xcdTA0MTYnOidaSGN5JywnXFx1MDQzNyc6J3pjeScsJ1xcdTA0MTcnOidaY3knLCdcXHUwNDU1JzonZHNjeScsJ1xcdTA0MDUnOidEU2N5JywnXFx1MDQzOCc6J2ljeScsJ1xcdTA0MTgnOidJY3knLCdcXHUwNDU2JzonaXVrY3knLCdcXHUwNDA2JzonSXVrY3knLCdcXHUwNDU3JzoneWljeScsJ1xcdTA0MDcnOidZSWN5JywnXFx1MDQzOSc6J2pjeScsJ1xcdTA0MTknOidKY3knLCdcXHUwNDU4JzonanNlcmN5JywnXFx1MDQwOCc6J0pzZXJjeScsJ1xcdTA0M0EnOidrY3knLCdcXHUwNDFBJzonS2N5JywnXFx1MDQ1Qyc6J2tqY3knLCdcXHUwNDBDJzonS0pjeScsJ1xcdTA0M0InOidsY3knLCdcXHUwNDFCJzonTGN5JywnXFx1MDQ1OSc6J2xqY3knLCdcXHUwNDA5JzonTEpjeScsJ1xcdTA0M0MnOidtY3knLCdcXHUwNDFDJzonTWN5JywnXFx1MDQzRCc6J25jeScsJ1xcdTA0MUQnOidOY3knLCdcXHUwNDVBJzonbmpjeScsJ1xcdTA0MEEnOidOSmN5JywnXFx1MDQzRSc6J29jeScsJ1xcdTA0MUUnOidPY3knLCdcXHUwNDNGJzoncGN5JywnXFx1MDQxRic6J1BjeScsJ1xcdTA0NDAnOidyY3knLCdcXHUwNDIwJzonUmN5JywnXFx1MDQ0MSc6J3NjeScsJ1xcdTA0MjEnOidTY3knLCdcXHUwNDQyJzondGN5JywnXFx1MDQyMic6J1RjeScsJ1xcdTA0NUInOid0c2hjeScsJ1xcdTA0MEInOidUU0hjeScsJ1xcdTA0NDMnOid1Y3knLCdcXHUwNDIzJzonVWN5JywnXFx1MDQ1RSc6J3VicmN5JywnXFx1MDQwRSc6J1VicmN5JywnXFx1MDQ0NCc6J2ZjeScsJ1xcdTA0MjQnOidGY3knLCdcXHUwNDQ1Jzona2hjeScsJ1xcdTA0MjUnOidLSGN5JywnXFx1MDQ0Nic6J3RzY3knLCdcXHUwNDI2JzonVFNjeScsJ1xcdTA0NDcnOidjaGN5JywnXFx1MDQyNyc6J0NIY3knLCdcXHUwNDVGJzonZHpjeScsJ1xcdTA0MEYnOidEWmN5JywnXFx1MDQ0OCc6J3NoY3knLCdcXHUwNDI4JzonU0hjeScsJ1xcdTA0NDknOidzaGNoY3knLCdcXHUwNDI5JzonU0hDSGN5JywnXFx1MDQ0QSc6J2hhcmRjeScsJ1xcdTA0MkEnOidIQVJEY3knLCdcXHUwNDRCJzoneWN5JywnXFx1MDQyQic6J1ljeScsJ1xcdTA0NEMnOidzb2Z0Y3knLCdcXHUwNDJDJzonU09GVGN5JywnXFx1MDQ0RCc6J2VjeScsJ1xcdTA0MkQnOidFY3knLCdcXHUwNDRFJzoneXVjeScsJ1xcdTA0MkUnOidZVWN5JywnXFx1MDQ0Ric6J3lhY3knLCdcXHUwNDJGJzonWUFjeScsJ1xcdTIxMzUnOidhbGVwaCcsJ1xcdTIxMzYnOidiZXRoJywnXFx1MjEzNyc6J2dpbWVsJywnXFx1MjEzOCc6J2RhbGV0aCd9O1xuXG5cdHZhciByZWdleEVzY2FwZSA9IC9bXCImJzw+YF0vZztcblx0dmFyIGVzY2FwZU1hcCA9IHtcblx0XHQnXCInOiAnJnF1b3Q7Jyxcblx0XHQnJic6ICcmYW1wOycsXG5cdFx0J1xcJyc6ICcmI3gyNzsnLFxuXHRcdCc8JzogJyZsdDsnLFxuXHRcdC8vIFNlZSBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHM6IGluIEhUTUwsIHRoZVxuXHRcdC8vIGZvbGxvd2luZyBpcyBub3Qgc3RyaWN0bHkgbmVjZXNzYXJ5IHVubGVzcyBpdOKAmXMgcGFydCBvZiBhIHRhZyBvciBhblxuXHRcdC8vIHVucXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZS4gV2XigJlyZSBvbmx5IGVzY2FwaW5nIGl0IHRvIHN1cHBvcnQgdGhvc2Vcblx0XHQvLyBzaXR1YXRpb25zLCBhbmQgZm9yIFhNTCBzdXBwb3J0LlxuXHRcdCc+JzogJyZndDsnLFxuXHRcdC8vIEluIEludGVybmV0IEV4cGxvcmVyIOKJpCA4LCB0aGUgYmFja3RpY2sgY2hhcmFjdGVyIGNhbiBiZSB1c2VkXG5cdFx0Ly8gdG8gYnJlYWsgb3V0IG9mICh1bilxdW90ZWQgYXR0cmlidXRlIHZhbHVlcyBvciBIVE1MIGNvbW1lbnRzLlxuXHRcdC8vIFNlZSBodHRwOi8vaHRtbDVzZWMub3JnLyMxMDIsIGh0dHA6Ly9odG1sNXNlYy5vcmcvIzEwOCwgYW5kXG5cdFx0Ly8gaHR0cDovL2h0bWw1c2VjLm9yZy8jMTMzLlxuXHRcdCdgJzogJyYjeDYwOydcblx0fTtcblxuXHR2YXIgcmVnZXhJbnZhbGlkRW50aXR5ID0gLyYjKD86W3hYXVteYS1mQS1GMC05XXxbXjAtOXhYXSkvO1xuXHR2YXIgcmVnZXhJbnZhbGlkUmF3Q29kZVBvaW50ID0gL1tcXDAtXFx4MDhcXHgwQlxceDBFLVxceDFGXFx4N0YtXFx4OUZcXHVGREQwLVxcdUZERUZcXHVGRkZFXFx1RkZGRl18W1xcdUQ4M0ZcXHVEODdGXFx1RDhCRlxcdUQ4RkZcXHVEOTNGXFx1RDk3RlxcdUQ5QkZcXHVEOUZGXFx1REEzRlxcdURBN0ZcXHVEQUJGXFx1REFGRlxcdURCM0ZcXHVEQjdGXFx1REJCRlxcdURCRkZdW1xcdURGRkVcXHVERkZGXXxbXFx1RDgwMC1cXHVEQkZGXSg/IVtcXHVEQzAwLVxcdURGRkZdKXwoPzpbXlxcdUQ4MDAtXFx1REJGRl18XilbXFx1REMwMC1cXHVERkZGXS87XG5cdHZhciByZWdleERlY29kZSA9IC8mKENvdW50ZXJDbG9ja3dpc2VDb250b3VySW50ZWdyYWx8RG91YmxlTG9uZ0xlZnRSaWdodEFycm93fENsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbHxOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlcnxOb3RTcXVhcmVTdXBlcnNldEVxdWFsfERpYWNyaXRpY2FsRG91YmxlQWN1dGV8Tm90UmlnaHRUcmlhbmdsZUVxdWFsfE5vdFN1Y2NlZWRzU2xhbnRFcXVhbHxOb3RQcmVjZWRlc1NsYW50RXF1YWx8Q2xvc2VDdXJseURvdWJsZVF1b3RlfE5lZ2F0aXZlVmVyeVRoaW5TcGFjZXxEb3VibGVDb250b3VySW50ZWdyYWx8RmlsbGVkVmVyeVNtYWxsU3F1YXJlfENhcGl0YWxEaWZmZXJlbnRpYWxEfE9wZW5DdXJseURvdWJsZVF1b3RlfEVtcHR5VmVyeVNtYWxsU3F1YXJlfE5lc3RlZEdyZWF0ZXJHcmVhdGVyfERvdWJsZUxvbmdSaWdodEFycm93fE5vdExlZnRUcmlhbmdsZUVxdWFsfE5vdEdyZWF0ZXJTbGFudEVxdWFsfFJldmVyc2VVcEVxdWlsaWJyaXVtfERvdWJsZUxlZnRSaWdodEFycm93fE5vdFNxdWFyZVN1YnNldEVxdWFsfE5vdERvdWJsZVZlcnRpY2FsQmFyfFJpZ2h0QXJyb3dMZWZ0QXJyb3d8Tm90R3JlYXRlckZ1bGxFcXVhbHxOb3RSaWdodFRyaWFuZ2xlQmFyfFNxdWFyZVN1cGVyc2V0RXF1YWx8RG93bkxlZnRSaWdodFZlY3RvcnxEb3VibGVMb25nTGVmdEFycm93fGxlZnRyaWdodHNxdWlnYXJyb3d8TGVmdEFycm93UmlnaHRBcnJvd3xOZWdhdGl2ZU1lZGl1bVNwYWNlfGJsYWNrdHJpYW5nbGVyaWdodHxSaWdodERvd25WZWN0b3JCYXJ8UHJlY2VkZXNTbGFudEVxdWFsfFJpZ2h0RG91YmxlQnJhY2tldHxTdWNjZWVkc1NsYW50RXF1YWx8Tm90TGVmdFRyaWFuZ2xlQmFyfFJpZ2h0VHJpYW5nbGVFcXVhbHxTcXVhcmVJbnRlcnNlY3Rpb258UmlnaHREb3duVGVlVmVjdG9yfFJldmVyc2VFcXVpbGlicml1bXxOZWdhdGl2ZVRoaWNrU3BhY2V8bG9uZ2xlZnRyaWdodGFycm93fExvbmdsZWZ0cmlnaHRhcnJvd3xMb25nTGVmdFJpZ2h0QXJyb3d8RG93blJpZ2h0VGVlVmVjdG9yfERvd25SaWdodFZlY3RvckJhcnxHcmVhdGVyU2xhbnRFcXVhbHxTcXVhcmVTdWJzZXRFcXVhbHxMZWZ0RG93blZlY3RvckJhcnxMZWZ0RG91YmxlQnJhY2tldHxWZXJ0aWNhbFNlcGFyYXRvcnxyaWdodGxlZnRoYXJwb29uc3xOb3RHcmVhdGVyR3JlYXRlcnxOb3RTcXVhcmVTdXBlcnNldHxibGFja3RyaWFuZ2xlbGVmdHxibGFja3RyaWFuZ2xlZG93bnxOZWdhdGl2ZVRoaW5TcGFjZXxMZWZ0RG93blRlZVZlY3RvcnxOb3RMZXNzU2xhbnRFcXVhbHxsZWZ0cmlnaHRoYXJwb29uc3xEb3VibGVVcERvd25BcnJvd3xEb3VibGVWZXJ0aWNhbEJhcnxMZWZ0VHJpYW5nbGVFcXVhbHxGaWxsZWRTbWFsbFNxdWFyZXx0d29oZWFkcmlnaHRhcnJvd3xOb3ROZXN0ZWRMZXNzTGVzc3xEb3duTGVmdFRlZVZlY3RvcnxEb3duTGVmdFZlY3RvckJhcnxSaWdodEFuZ2xlQnJhY2tldHxOb3RUaWxkZUZ1bGxFcXVhbHxOb3RSZXZlcnNlRWxlbWVudHxSaWdodFVwRG93blZlY3RvcnxEaWFjcml0aWNhbFRpbGRlfE5vdFN1Y2NlZWRzVGlsZGV8Y2lyY2xlYXJyb3dyaWdodHxOb3RQcmVjZWRlc0VxdWFsfHJpZ2h0aGFycG9vbmRvd258RG91YmxlUmlnaHRBcnJvd3xOb3RTdWNjZWVkc0VxdWFsfE5vbkJyZWFraW5nU3BhY2V8Tm90UmlnaHRUcmlhbmdsZXxMZXNzRXF1YWxHcmVhdGVyfFJpZ2h0VXBUZWVWZWN0b3J8TGVmdEFuZ2xlQnJhY2tldHxHcmVhdGVyRnVsbEVxdWFsfERvd25BcnJvd1VwQXJyb3d8UmlnaHRVcFZlY3RvckJhcnx0d29oZWFkbGVmdGFycm93fEdyZWF0ZXJFcXVhbExlc3N8ZG93bmhhcnBvb25yaWdodHxSaWdodFRyaWFuZ2xlQmFyfG50cmlhbmdsZXJpZ2h0ZXF8Tm90U3VwZXJzZXRFcXVhbHxMZWZ0VXBEb3duVmVjdG9yfERpYWNyaXRpY2FsQWN1dGV8cmlnaHRyaWdodGFycm93c3x2YXJ0cmlhbmdsZXJpZ2h0fFVwQXJyb3dEb3duQXJyb3d8RGlhY3JpdGljYWxHcmF2ZXxVbmRlclBhcmVudGhlc2lzfEVtcHR5U21hbGxTcXVhcmV8TGVmdFVwVmVjdG9yQmFyfGxlZnRyaWdodGFycm93c3xEb3duUmlnaHRWZWN0b3J8ZG93bmhhcnBvb25sZWZ0fHRyaWFuZ2xlcmlnaHRlcXxTaG9ydFJpZ2h0QXJyb3d8T3ZlclBhcmVudGhlc2lzfERvdWJsZUxlZnRBcnJvd3xEb3VibGVEb3duQXJyb3d8Tm90U3F1YXJlU3Vic2V0fGJpZ3RyaWFuZ2xlZG93bnxudHJpYW5nbGVsZWZ0ZXF8VXBwZXJSaWdodEFycm93fGN1cnZlYXJyb3dyaWdodHx2YXJ0cmlhbmdsZWxlZnR8Tm90TGVmdFRyaWFuZ2xlfG5sZWZ0cmlnaHRhcnJvd3xMb3dlclJpZ2h0QXJyb3d8Tm90SHVtcERvd25IdW1wfE5vdEdyZWF0ZXJUaWxkZXxyaWdodHRocmVldGltZXN8TGVmdFVwVGVlVmVjdG9yfE5vdEdyZWF0ZXJFcXVhbHxzdHJhaWdodGVwc2lsb258TGVmdFRyaWFuZ2xlQmFyfHJpZ2h0c3F1aWdhcnJvd3xDb250b3VySW50ZWdyYWx8cmlnaHRsZWZ0YXJyb3dzfENsb3NlQ3VybHlRdW90ZXxSaWdodERvd25WZWN0b3J8TGVmdFJpZ2h0VmVjdG9yfG5MZWZ0cmlnaHRhcnJvd3xsZWZ0aGFycG9vbmRvd258Y2lyY2xlYXJyb3dsZWZ0fFNxdWFyZVN1cGVyc2V0fE9wZW5DdXJseVF1b3RlfGhvb2tyaWdodGFycm93fEhvcml6b250YWxMaW5lfERpYWNyaXRpY2FsRG90fE5vdExlc3NHcmVhdGVyfG50cmlhbmdsZXJpZ2h0fERvdWJsZVJpZ2h0VGVlfEludmlzaWJsZUNvbW1hfEludmlzaWJsZVRpbWVzfExvd2VyTGVmdEFycm93fERvd25MZWZ0VmVjdG9yfE5vdFN1YnNldEVxdWFsfGN1cnZlYXJyb3dsZWZ0fHRyaWFuZ2xlbGVmdGVxfE5vdFZlcnRpY2FsQmFyfFRpbGRlRnVsbEVxdWFsfGRvd25kb3duYXJyb3dzfE5vdEdyZWF0ZXJMZXNzfFJpZ2h0VGVlVmVjdG9yfFplcm9XaWR0aFNwYWNlfGxvb3BhcnJvd3JpZ2h0fExvbmdSaWdodEFycm93fGRvdWJsZWJhcndlZGdlfFNob3J0TGVmdEFycm93fFNob3J0RG93bkFycm93fFJpZ2h0VmVjdG9yQmFyfEdyZWF0ZXJHcmVhdGVyfFJldmVyc2VFbGVtZW50fHJpZ2h0aGFycG9vbnVwfExlc3NTbGFudEVxdWFsfGxlZnR0aHJlZXRpbWVzfHVwaGFycG9vbnJpZ2h0fHJpZ2h0YXJyb3d0YWlsfExlZnREb3duVmVjdG9yfExvbmdyaWdodGFycm93fE5lc3RlZExlc3NMZXNzfFVwcGVyTGVmdEFycm93fG5zaG9ydHBhcmFsbGVsfGxlZnRsZWZ0YXJyb3dzfGxlZnRyaWdodGFycm93fExlZnRyaWdodGFycm93fExlZnRSaWdodEFycm93fGxvbmdyaWdodGFycm93fHVwaGFycG9vbmxlZnR8UmlnaHRBcnJvd0JhcnxBcHBseUZ1bmN0aW9ufExlZnRUZWVWZWN0b3J8bGVmdGFycm93dGFpbHxOb3RFcXVhbFRpbGRlfHZhcnN1YnNldG5lcXF8dmFyc3Vwc2V0bmVxcXxSaWdodFRlZUFycm93fFN1Y2NlZWRzRXF1YWx8U3VjY2VlZHNUaWxkZXxMZWZ0VmVjdG9yQmFyfFN1cGVyc2V0RXF1YWx8aG9va2xlZnRhcnJvd3xEaWZmZXJlbnRpYWxEfFZlcnRpY2FsVGlsZGV8VmVyeVRoaW5TcGFjZXxibGFja3RyaWFuZ2xlfGJpZ3RyaWFuZ2xldXB8TGVzc0Z1bGxFcXVhbHxkaXZpZGVvbnRpbWVzfGxlZnRoYXJwb29udXB8VXBFcXVpbGlicml1bXxudHJpYW5nbGVsZWZ0fFJpZ2h0VHJpYW5nbGV8bWVhc3VyZWRhbmdsZXxzaG9ydHBhcmFsbGVsfGxvbmdsZWZ0YXJyb3d8TG9uZ2xlZnRhcnJvd3xMb25nTGVmdEFycm93fERvdWJsZUxlZnRUZWV8UG9pbmNhcmVwbGFuZXxQcmVjZWRlc0VxdWFsfHRyaWFuZ2xlcmlnaHR8RG91YmxlVXBBcnJvd3xSaWdodFVwVmVjdG9yfGZhbGxpbmdkb3RzZXF8bG9vcGFycm93bGVmdHxQcmVjZWRlc1RpbGRlfE5vdFRpbGRlRXF1YWx8Tm90VGlsZGVUaWxkZXxzbWFsbHNldG1pbnVzfFByb3BvcnRpb25hbHx0cmlhbmdsZWxlZnR8dHJpYW5nbGVkb3dufFVuZGVyQnJhY2tldHxOb3RIdW1wRXF1YWx8ZXhwb25lbnRpYWxlfEV4cG9uZW50aWFsRXxOb3RMZXNzVGlsZGV8SGlsYmVydFNwYWNlfFJpZ2h0Q2VpbGluZ3xibGFja2xvemVuZ2V8dmFyc3Vwc2V0bmVxfEh1bXBEb3duSHVtcHxHcmVhdGVyRXF1YWx8VmVydGljYWxMaW5lfExlZnRUZWVBcnJvd3xOb3RMZXNzRXF1YWx8RG93blRlZUFycm93fExlZnRUcmlhbmdsZXx2YXJzdWJzZXRuZXF8SW50ZXJzZWN0aW9ufE5vdENvbmdydWVudHxEb3duQXJyb3dCYXJ8TGVmdFVwVmVjdG9yfExlZnRBcnJvd0JhcnxyaXNpbmdkb3RzZXF8R3JlYXRlclRpbGRlfFJvdW5kSW1wbGllc3xTcXVhcmVTdWJzZXR8U2hvcnRVcEFycm93fE5vdFN1cGVyc2V0fHF1YXRlcm5pb25zfHByZWNuYXBwcm94fGJhY2tlcHNpbG9ufHByZWNjdXJseWVxfE92ZXJCcmFja2V0fGJsYWNrc3F1YXJlfE1lZGl1bVNwYWNlfFZlcnRpY2FsQmFyfGNpcmNsZWRjaXJjfGNpcmNsZWRkYXNofENpcmNsZU1pbnVzfENpcmNsZVRpbWVzfExlc3NHcmVhdGVyfGN1cmx5ZXFwcmVjfGN1cmx5ZXFzdWNjfGRpYW1vbmRzdWl0fFVwRG93bkFycm93fFVwZG93bmFycm93fFJ1bGVEZWxheWVkfFJyaWdodGFycm93fHVwZG93bmFycm93fFJpZ2h0VmVjdG9yfG5SaWdodGFycm93fG5yaWdodGFycm93fGVxc2xhbnRsZXNzfExlZnRDZWlsaW5nfEVxdWlsaWJyaXVtfFNtYWxsQ2lyY2xlfGV4cGVjdGF0aW9ufE5vdFN1Y2NlZWRzfHRoaWNrYXBwcm94fEdyZWF0ZXJMZXNzfFNxdWFyZVVuaW9ufE5vdFByZWNlZGVzfE5vdExlc3NMZXNzfHN0cmFpZ2h0cGhpfHN1Y2NuYXBwcm94fHN1Y2NjdXJseWVxfFN1YnNldEVxdWFsfHNxc3Vwc2V0ZXF8UHJvcG9ydGlvbnxMYXBsYWNldHJmfEltYWdpbmFyeUl8c3Vwc2V0bmVxcXxOb3RHcmVhdGVyfGd0cmVxcWxlc3N8Tm90RWxlbWVudHxUaGlja1NwYWNlfFRpbGRlRXF1YWx8VGlsZGVUaWxkZXxGb3VyaWVydHJmfHJtb3VzdGFjaGV8RXF1YWxUaWxkZXxlcXNsYW50Z3RyfFVuZGVyQnJhY2V8TGVmdFZlY3RvcnxVcEFycm93QmFyfG5MZWZ0YXJyb3d8bnN1YnNldGVxcXxzdWJzZXRuZXFxfG5zdXBzZXRlcXF8bmxlZnRhcnJvd3xzdWNjYXBwcm94fGxlc3NhcHByb3h8VXBUZWVBcnJvd3x1cHVwYXJyb3dzfGN1cmx5d2VkZ2V8bGVzc2VxcWd0cnx2YXJlcHNpbG9ufHZhcm5vdGhpbmd8UmlnaHRGbG9vcnxjb21wbGVtZW50fENpcmNsZVBsdXN8c3FzdWJzZXRlcXxMbGVmdGFycm93fGNpcmNsZWRhc3R8UmlnaHRBcnJvd3xSaWdodGFycm93fHJpZ2h0YXJyb3d8bG1vdXN0YWNoZXxCZXJub3VsbGlzfHByZWNhcHByb3h8bWFwc3RvbGVmdHxtYXBzdG9kb3dufGxvbmdtYXBzdG98ZG90c3F1YXJlfGRvd25hcnJvd3xEb3VibGVEb3R8bnN1YnNldGVxfHN1cHNldG5lcXxsZWZ0YXJyb3d8bnN1cHNldGVxfHN1YnNldG5lcXxUaGluU3BhY2V8bmdlcXNsYW50fHN1YnNldGVxcXxIdW1wRXF1YWx8Tm90U3Vic2V0fHRyaWFuZ2xlcXxOb3RDdXBDYXB8bGVzc2VxZ3RyfGhlYXJ0c3VpdHxUcmlwbGVEb3R8TGVmdGFycm93fENvcHJvZHVjdHxDb25ncnVlbnR8dmFycHJvcHRvfGNvbXBsZXhlc3xndmVydG5lcXF8TGVmdEFycm93fExlc3NUaWxkZXxzdXBzZXRlcXF8TWludXNQbHVzfENpcmNsZURvdHxubGVxc2xhbnR8Tm90RXhpc3RzfGd0cmVxbGVzc3xucGFyYWxsZWx8VW5pb25QbHVzfExlZnRGbG9vcnxjaGVja21hcmt8Q2VudGVyRG90fGNlbnRlcmRvdHxNZWxsaW50cmZ8Z3RyYXBwcm94fGJpZ290aW1lc3xPdmVyQnJhY2V8c3BhZGVzdWl0fHRoZXJlZm9yZXxwaXRjaGZvcmt8cmF0aW9uYWxzfFBsdXNNaW51c3xCYWNrc2xhc2h8VGhlcmVmb3JlfERvd25CcmV2ZXxiYWNrc2ltZXF8YmFja3ByaW1lfERvd25BcnJvd3xuc2hvcnRtaWR8RG93bmFycm93fGx2ZXJ0bmVxcXxlcXZwYXJzbHxpbWFnbGluZXxpbWFncGFydHxpbmZpbnRpZXxpbnRlZ2Vyc3xJbnRlZ3JhbHxpbnRlcmNhbHxMZXNzTGVzc3xVYXJyb2NpcnxpbnRsYXJoa3xzcXN1cHNldHxhbmdtc2RhZnxzcXN1YnNldHxsbGNvcm5lcnx2YXJ0aGV0YXxjdXBicmNhcHxsbmFwcHJveHxTdXBlcnNldHxTdWNoVGhhdHxzdWNjbnNpbXxzdWNjbmVxcXxhbmdtc2RhZ3xiaWd1cGx1c3xjdXJseXZlZXx0cnBleml1bXxTdWNjZWVkc3xOb3RUaWxkZXxiaWd3ZWRnZXxhbmdtc2RhaHxhbmdydHZiZHx0cmltaW51c3xjd2NvbmludHxmcGFydGludHxscmNvcm5lcnxzbWVwYXJzbHxzdWJzZXRlcXx1cmNvcm5lcnxsdXJkc2hhcnxsYWVtcHR5dnxERG90cmFoZHxhcHByb3hlcXxsZHJ1c2hhcnxhd2NvbmludHxtYXBzdG91cHxiYWNrY29uZ3xzaG9ydG1pZHx0cmlhbmdsZXxnZXFzbGFudHxnZXNkb3RvbHx0aW1lc2JhcnxjaXJjbGVkUnxjaXJjbGVkU3xzZXRtaW51c3xtdWx0aW1hcHxuYXR1cmFsc3xzY3BvbGludHxuY29uZ2RvdHxSaWdodFRlZXxib3htaW51c3xnbmFwcHJveHxib3h0aW1lc3xhbmRzbG9wZXx0aGlja3NpbXxhbmdtc2RhYXx2YXJzaWdtYXxjaXJmbmludHxydHJpbHRyaXxhbmdtc2RhYnxycHBvbGludHxhbmdtc2RhY3xiYXJ3ZWRnZXxkcmJrYXJvd3xjbHVic3VpdHx0aGV0YXN5bXxic29saHN1YnxjYXBicmN1cHxkemlncmFycnxkb3RlcWRvdHxEb3RFcXVhbHxkb3RtaW51c3xVbmRlckJhcnxOb3RFcXVhbHxyZWFscGFydHxvdGltZXNhc3x1bGNvcm5lcnxoa3NlYXJvd3xoa3N3YXJvd3xwYXJhbGxlbHxQYXJ0aWFsRHxlbGludGVyc3xlbXB0eXNldHxwbHVzYWNpcnxiYnJrdGJya3xhbmdtc2RhZHxwb2ludGludHxiaWdvcGx1c3xhbmdtc2RhZXxQcmVjZWRlc3xiaWdzcWN1cHx2YXJrYXBwYXxub3RpbmRvdHxzdXBzZXRlcXxwcmVjbmVxcXxwcmVjbnNpbXxwcm9mYWxhcnxwcm9mbGluZXxwcm9mc3VyZnxsZXFzbGFudHxsZXNkb3RvcnxyYWVtcHR5dnxzdWJwbHVzfG5vdG5pdmJ8bm90bml2Y3xzdWJyYXJyfHppZ3JhcnJ8dnppZ3phZ3xzdWJtdWx0fHN1YmVkb3R8RWxlbWVudHxiZXR3ZWVufGNpcnNjaXJ8bGFycmJmc3xsYXJyc2ltfGxvdGltZXN8bGJya3NsZHxsYnJrc2x1fGxvemVuZ2V8bGRyZGhhcnxkYmthcm93fGJpZ2NpcmN8ZXBzaWxvbnxzaW1yYXJyfHNpbXBsdXN8bHRxdWVzdHxFcHNpbG9ufGx1cnVoYXJ8Z3RxdWVzdHxtYWx0ZXNlfG5wb2xpbnR8ZXFjb2xvbnxucHJlY2VxfGJpZ29kb3R8ZGRhZ2dlcnxndHJsZXNzfGJuZXF1aXZ8aGFycmNpcnxkZG90c2VxfGVxdWl2RER8YmFja3NpbXxkZW1wdHl2fG5zcXN1YmV8bnNxc3VwZXxVcHNpbG9ufG5zdWJzZXR8dXBzaWxvbnxtaW51c2R1fG5zdWNjZXF8c3dhcnJvd3xuc3Vwc2V0fGNvbG9uZXF8c2VhcnJvd3xib3hwbHVzfG5hcHByb3h8bmF0dXJhbHxhc3ltcGVxfGFsZWZzeW18Y29uZ2RvdHxuZWFycm93fGJpZ3N0YXJ8ZGlhbW9uZHxzdXBwbHVzfHRyaXRpbWV8TGVmdFRlZXxudmluZmlufHRyaXBsdXN8TmV3TGluZXxudmx0cmllfG52cnRyaWV8bndhcnJvd3xuZXhpc3RzfERpYW1vbmR8cnVsdWhhcnxJbXBsaWVzfHN1cG11bHR8YW5nemFycnxzdXBsYXJyfHN1cGhzdWJ8cXVlc3RlcXxiZWNhdXNlfGRpZ2FtbWF8QmVjYXVzZXxvbGNyb3NzfGJlbXB0eXZ8b21pY3JvbnxPbWljcm9ufHJvdGltZXN8Tm9CcmVha3xpbnRwcm9kfGFuZ3J0dmJ8b3JkZXJvZnx1d2FuZ2xlfHN1cGhzb2x8bGVzZG90b3xvcnNsb3BlfERvd25UZWV8cmVhbGluZXxjdWRhcnJsfHJkbGRoYXJ8T3ZlckJhcnxzdXBlZG90fGxlc3Nkb3R8c3VwZHN1Ynx0b3Bmb3JrfHN1Y2NzaW18cmJya3NsdXxyYnJrc2xkfHBlcnRlbmt8Y3VkYXJycnxpc2luZG90fHBsYW5ja2h8bGVzc2d0cnxwbHVzY2lyfGdlc2RvdG98cGx1c3NpbXxwbHVzdHdvfGxlc3NzaW18Y3VsYXJycHxyYXJyc2ltfENheWxleXN8bm90aW52YXxub3RpbnZifG5vdGludmN8VXBBcnJvd3xVcGFycm93fHVwYXJyb3d8Tm90TGVzc3xkd2FuZ2xlfHByZWNzaW18UHJvZHVjdHxjdXJhcnJtfENjb25pbnR8ZG90cGx1c3xyYXJyYmZzfGNjdXBzc218Q2VkaWxsYXxjZW1wdHl2fG5vdG5pdmF8cXVhdGludHxmcmFjMzV8ZnJhYzM4fGZyYWM0NXxmcmFjNTZ8ZnJhYzU4fGZyYWM3OHx0cmlkb3R8eG9wbHVzfGdhY3V0ZXxnYW1tYWR8R2FtbWFkfGxmaXNodHxsZmxvb3J8YmlnY3VwfHNxc3VwZXxnYnJldmV8R2JyZXZlfGxoYXJ1bHxzcXN1YmV8c3FjdXBzfEdjZWRpbHxhcGFjaXJ8bGxoYXJkfGxtaWRvdHxMbWlkb3R8bG1vdXN0fGFuZGFuZHxzcWNhcHN8YXBwcm94fEFicmV2ZXxzcGFkZXN8Y2lyY2VxfHRwcmltZXxkaXZpZGV8dG9wY2lyfEFzc2lnbnx0b3Bib3R8Z2VzZG90fGRpdm9ueHx4dXBsdXN8dGltZXNkfGdlc2xlc3xhdGlsZGV8c29sYmFyfFNPRlRjeXxsb3BsdXN8dGltZXNifGxvd2FzdHxsb3diYXJ8ZGxjb3JufGRsY3JvcHxzb2Z0Y3l8ZG9sbGFyfGxwYXJsdHx0aGtzaW18bHJoYXJkfEF0aWxkZXxsc2FxdW98c21hc2hwfGJpZ3ZlZXx0aGluc3B8d3JlYXRofGJrYXJvd3xsc3F1b3J8bHN0cm9rfExzdHJva3xsdGhyZWV8bHRpbWVzfGx0bGFycnxEb3REb3R8c2ltZG90fGx0clBhcnx3ZWllcnB8eHNxY3VwfGFuZ21zZHxzaWdtYXZ8c2lnbWFmfHplZXRyZnxaY2Fyb258emNhcm9ufG1hcHN0b3x2c3VwbmV8dGhldGF2fGNpcm1pZHxtYXJrZXJ8bWNvbW1hfFphY3V0ZXx2c3VibkV8dGhlcmU0fGd0bFBhcnx2c3VibmV8Ym90dG9tfGd0cmFycnxTSENIY3l8c2hjaGN5fG1pZGFzdHxtaWRjaXJ8bWlkZG90fG1pbnVzYnxtaW51c2R8Z3RyZG90fGJvd3RpZXxzZnJvd258bW5wbHVzfG1vZGVsc3xjb2xvbmV8c2Vzd2FyfENvbG9uZXxtc3Rwb3N8c2VhcmhrfGd0cnNpbXxuYWN1dGV8TmFjdXRlfGJveGJveHx0ZWxyZWN8aGFpcnNwfFRjZWRpbHxuYnVtcGV8c2Nuc2ltfG5jYXJvbnxOY2Fyb258bmNlZGlsfE5jZWRpbHxoYW1pbHR8U2NlZGlsfG5lYXJoa3xoYXJkY3l8SEFSRGN5fHRjZWRpbHxUY2Fyb258Y29tbWF0fG5lcXVpdnxuZXNlYXJ8dGNhcm9ufHRhcmdldHxoZWFydHN8bmV4aXN0fHZhcnJob3xzY2VkaWx8U2Nhcm9ufHNjYXJvbnxoZWxsaXB8U2FjdXRlfHNhY3V0ZXxoZXJjb258c3dud2FyfGNvbXBmbnxydGltZXN8cnRocmVlfHJzcXVvcnxyc2FxdW98emFjdXRlfHdlZGdlcXxob210aHR8YmFydmVlfGJhcndlZHxCYXJ3ZWR8cnBhcmd0fGhvcmJhcnxjb25pbnR8c3dhcmhrfHJvcGx1c3xubHRyaWV8aHNsYXNofGhzdHJva3xIc3Ryb2t8cm1vdXN0fENvbmludHxicHJpbWV8aHlidWxsfGh5cGhlbnxpYWN1dGV8SWFjdXRlfHN1cHN1cHxzdXBzdWJ8c3Vwc2ltfHZhcnBoaXxjb3Byb2R8YnJ2YmFyfGFncmF2ZXxTdXBzZXR8c3Vwc2V0fGlncmF2ZXxJZ3JhdmV8bm90aW5FfEFncmF2ZXxpaWlpbnR8aWluZmlufGNvcHlzcnx3ZWRiYXJ8VmVyYmFyfHZhbmdydHxiZWNhdXN8aW5jYXJlfHZlcmJhcnxpbm9kb3R8YnVsbGV0fGRyY29ybnxpbnRjYWx8ZHJjcm9wfGN1bGFycnx2ZWxsaXB8VXRpbGRlfGJ1bXBlcXxjdXBjYXB8ZHN0cm9rfERzdHJva3xDdXBDYXB8Y3VwY3VwfGN1cGRvdHxlYWN1dGV8RWFjdXRlfHN1cGRvdHxpcXVlc3R8ZWFzdGVyfGVjYXJvbnxFY2Fyb258ZWNvbG9ufGlzaW5zdnx1dGlsZGV8aXRpbGRlfEl0aWxkZXxjdXJhcnJ8c3VjY2VxfEJ1bXBlcXxjYWN1dGV8dWxjcm9wfG5wYXJzbHxDYWN1dGV8bnByY3VlfGVncmF2ZXxFZ3JhdmV8bnJhcnJjfG5yYXJyd3xzdWJzdXB8c3Vic3VifG5ydHJpZXxqc2VyY3l8bnNjY3VlfEpzZXJjeXxrYXBwYXZ8a2NlZGlsfEtjZWRpbHxzdWJzaW18dWxjb3JufG5zaW1lcXxlZ3Nkb3R8dmVlYmFyfGtncmVlbnxjYXBhbmR8ZWxzZG90fFN1YnNldHxzdWJzZXR8Y3VycmVufGFhY3V0ZXxsYWN1dGV8TGFjdXRlfGVtcHR5dnxudGlsZGV8TnRpbGRlfGxhZ3JhbnxsYW1iZGF8TGFtYmRhfGNhcGNhcHxVZ3JhdmV8bGFuZ2xlfHN1YmRvdHxlbXNwMTN8bnVtZXJvfGVtc3AxNHxudmRhc2h8bnZEYXNofG5WZGFzaHxuVkRhc2h8dWdyYXZlfHVmaXNodHxudkhhcnJ8bGFycmZzfG52bEFycnxsYXJyaGt8bGFycmxwfGxhcnJwbHxudnJBcnJ8VWRibGFjfG53YXJoa3xsYXJydGx8bnduZWFyfG9hY3V0ZXxPYWN1dGV8bGF0YWlsfGxBdGFpbHxzc3RhcmZ8bGJyYWNlfG9kYmxhY3xPZGJsYWN8bGJyYWNrfHVkYmxhY3xvZHNvbGR8ZXBhcnNsfGxjYXJvbnxMY2Fyb258b2dyYXZlfE9ncmF2ZXxsY2VkaWx8TGNlZGlsfEFhY3V0ZXxzc21pbGV8c3NldG1ufHNxdWFyZnxsZHF1b3J8Y2FwY3VwfG9taW51c3xjeWxjdHl8cmhhcnVsfGVxY2lyY3xkYWdnZXJ8cmZsb29yfHJmaXNodHxEYWdnZXJ8ZGFsZXRofGVxdWFsc3xvcmlnb2Z8Y2FwZG90fGVxdWVzdHxkY2Fyb258RGNhcm9ufHJkcXVvcnxvc2xhc2h8T3NsYXNofG90aWxkZXxPdGlsZGV8b3RpbWVzfE90aW1lc3x1cmNyb3B8VWJyZXZlfHVicmV2ZXxZYWN1dGV8VWFjdXRlfHVhY3V0ZXxSY2VkaWx8cmNlZGlsfHVyY29ybnxwYXJzaW18UmNhcm9ufFZkYXNobHxyY2Fyb258VHN0cm9rfHBlcmNudHxwZXJpb2R8cGVybWlsfEV4aXN0c3x5YWN1dGV8cmJyYWNrfHJicmFjZXxwaG1tYXR8Y2Nhcm9ufENjYXJvbnxwbGFuY2t8Y2NlZGlsfHBsYW5rdnx0c3Ryb2t8ZmVtYWxlfHBsdXNkb3xwbHVzZHV8ZmZpbGlnfHBsdXNtbnxmZmxsaWd8Q2NlZGlsfHJBdGFpbHxkZmlzaHR8YmVybm91fHJhdGFpbHxSYXJydGx8cmFycnRsfGFuZ3NwaHxyYXJycGx8cmFycmxwfHJhcnJoa3x4d2VkZ2V8eG90aW1lfGZvcmFsbHxGb3JBbGx8VnZkYXNofHZzdXBuRXxwcmVjZXF8YmlnY2FwfGZyYWMxMnxmcmFjMTN8ZnJhYzE0fHByaW1lc3xyYXJyZnN8cHJuc2ltfGZyYWMxNXxTcXVhcmV8ZnJhYzE2fHNxdWFyZXxsZXNkb3R8ZnJhYzE4fGZyYWMyM3xwcm9wdG98cHJ1cmVsfHJhcnJhcHxyYW5nbGV8cHVuY3NwfGZyYWMyNXxSYWN1dGV8cXByaW1lfHJhY3V0ZXxsZXNnZXN8ZnJhYzM0fGFicmV2ZXxBRWxpZ3xlcXNpbXx1dGRvdHxzZXRtbnx1cnRyaXxFcXVhbHxVcmluZ3xzZUFycnx1cmluZ3xzZWFycnxkYXNodnxEYXNodnxtdW1hcHxuYWJsYXxpb2dvbnxJb2dvbnxzZG90ZXxzZG90YnxzY3NpbXxuYXBpZHxuYXBvc3xlcXVpdnxuYXR1cnxBY2lyY3xkYmxhY3xlcmFycnxuYnVtcHxpcHJvZHxlckRvdHx1Y2lyY3xhd2ludHxlc2RvdHxhbmdydHxuY29uZ3xpc2luRXxzY25hcHxTY2lyY3xzY2lyY3xuZGFzaHxpc2luc3xVYnJjeXxuZWFycnxuZUFycnxpc2ludnxuZWRvdHx1YnJjeXxhY3V0ZXxZY2lyY3xpdWtjeXxJdWtjeXx4dXRyaXxuZXNpbXxjYXJldHxqY2lyY3xKY2lyY3xjYXJvbnx0d2l4dHxkZGFycnxzY2N1ZXxleGlzdHxqbWF0aHxzYnF1b3xuZ2VxcXxhbmdzdHxjY2Fwc3xsY2VpbHxuZ3NpbXxVcFRlZXxkZWx0YXxEZWx0YXxydHJpZnxuaGFycnxuaEFycnxuaHBhcnxydHJpZXxqdWtjeXxKdWtjeXxrYXBwYXxyc3F1b3xLYXBwYXxubGFycnxubEFycnxUU0hjeXxycmFycnxhb2dvbnxBb2dvbnxmZmxpZ3x4cmFycnx0c2hjeXxjY2lyY3xubGVxcXxmaWxpZ3x1cHNpaHxubGVzc3xkaGFybHxubHNpbXxmamxpZ3xyb3BhcnxubHRyaXxkaGFycnxyb2Jya3xyb2FycnxmbGxpZ3xmbHRuc3xyb2FuZ3xybm1pZHxzdWJuRXxzdWJuZXxsQWFycnx0cmlzYnxDY2lyY3xhY2lyY3xjY3Vwc3xibGFua3xWRGFzaHxmb3JrdnxWZGFzaHxsYW5nZHxjZWRpbHxibGsxMnxibGsxNHxsYXF1b3xzdHJuc3xkaWFtc3xub3Rpbnx2RGFzaHxsYXJyYnxibGszNHxibG9ja3xkaXNpbnx1cGx1c3x2ZGFzaHx2QmFydnxhZWxpZ3xzdGFyZnxXZWRnZXxjaGVja3x4ckFycnxsYXRlc3xsYmFycnxsQmFycnxub3RuaXxsYmJya3xiY29uZ3xmcmFzbHxsYnJrZXxmcm93bnx2cnRyaXx2cHJvcHx2bnN1cHxnYW1tYXxHYW1tYXx3ZWRnZXx4b2RvdHxiZHF1b3xzcmFycnxkb3RlcXxsZHF1b3xib3hkbHxib3hkTHxnY2lyY3xHY2lyY3xib3hEbHxib3hETHxib3hkcnxib3hkUnxib3hEcnxUUkFERXx0cmFkZXxybGhhcnxib3hEUnx2bnN1YnxucGFydHx2bHRyaXxybGFycnxib3hoZHxib3hoRHxucHJlY3xnZXNjY3xucmFycnxuckFycnxib3hIZHxib3hIRHxib3hodXxib3hoVXxucnRyaXxib3hIdXxjbHVic3xib3hIVXx0aW1lc3xjb2xvbnxDb2xvbnxnaW1lbHx4bEFycnxUaWxkZXxuc2ltZXx0aWxkZXxuc21pZHxuc3BhcnxUSE9STnx0aG9ybnx4bGFycnxuc3ViZXxuc3ViRXx0aGthcHx4aEFycnxjb21tYXxuc3VjY3xib3h1bHxib3h1THxuc3VwZXxuc3VwRXxnbmVxcXxnbnNpbXxib3hVbHxib3hVTHxncmF2ZXxib3h1cnxib3h1Unxib3hVcnxib3hVUnxsZXNjY3xhbmdsZXxiZXBzaXxib3h2aHx2YXJwaXxib3h2SHxudW1zcHxUaGV0YXxnc2ltZXxnc2ltbHx0aGV0YXxib3hWaHxib3hWSHxib3h2bHxndGNpcnxndGRvdHxib3h2THxib3hWbHxib3hWTHxjcmFycnxjcm9zc3xDcm9zc3xudnNpbXxib3h2cnxud2Fycnxud0FycnxzcXN1cHxkdGRvdHxVb2dvbnxsaGFyZHxsaGFydXxkdHJpZnxvY2lyY3xPY2lyY3xsaGJsa3xkdWFycnxvZGFzaHxzcXN1YnxIYWNla3xzcWN1cHxsbGFycnxkdWhhcnxvZWxpZ3xPRWxpZ3xvZmNpcnxib3h2Unx1b2dvbnxsbHRyaXxib3hWcnxjc3ViZXx1dWFycnxvaGJhcnxjc3VwZXxjdGRvdHxvbGFycnxvbGNpcnxoYXJyd3xvbGluZXxzcWNhcHxvbWFjcnxPbWFjcnxvbWVnYXxPbWVnYXxib3hWUnxhbGVwaHxsbmVxcXxsbnNpbXxsb2FuZ3xsb2FycnxyaGFydXxsb2Jya3xoY2lyY3xvcGVycHxvcGx1c3xyaGFyZHxIY2lyY3xvcmFycnxVbmlvbnxvcmRlcnxlY2lyY3xFY2lyY3xjdWVwcnxzemxpZ3xjdWVzY3xicmV2ZXxyZWFsc3xlRERvdHxCcmV2ZXxob2Fycnxsb3Bhcnx1dHJpZnxyZHF1b3xVbWFjcnx1bWFjcnxlZkRvdHxzd0Fycnx1bHRyaXxhbHBoYXxyY2VpbHxvdmJhcnxzd2FycnxXY2lyY3x3Y2lyY3xzbXRlc3xzbWlsZXxic2VtaXxscmFycnxhcmluZ3xwYXJzbHxscmhhcnxic2ltZXx1aGJsa3xscnRyaXxjdXBvcnxBcmluZ3x1aGFycnx1aGFybHxzbGFycnxyYnJrZXxic29sYnxsc2ltZXxyYmJya3xSQmFycnxsc2ltZ3xwaG9uZXxyQmFycnxyYmFycnxpY2lyY3xsc3F1b3xJY2lyY3xlbWFjcnxFbWFjcnxyYXRpb3xzaW1uZXxwbHVzYnxzaW1sRXxzaW1nRXxzaW1lcXxwbHVzZXxsdGNpcnxsdGRvdHxlbXB0eXx4aGFycnx4ZHRyaXxpZXhjbHxBbHBoYXxsdHJpZXxyYXJyd3xwb3VuZHxsdHJpZnx4Y2lyY3xidW1wZXxwcmN1ZXxidW1wRXxhc3ltcHxhbWFjcnxjdXZlZXxTaWdtYXxzaWdtYXxpaWludHx1ZGhhcnxpaW90YXxpamxpZ3xJSmxpZ3xzdXBuRXxpbWFjcnxJbWFjcnxwcmltZXxQcmltZXxpbWFnZXxwcm5hcHxlb2dvbnxFb2dvbnxyYXJyY3xtZGFzaHxtRERvdHxjdXdlZHxpbWF0aHxzdXBuZXxpbXBlZHxBbWFjcnx1ZGFycnxwcnNpbXxtaWNyb3xyYXJyYnxjd2ludHxyYXF1b3xpbmZpbnxlcGx1c3xyYW5nZXxyYW5nZHxVY2lyY3xyYWRpY3xtaW51c3xhbWFsZ3x2ZWVlcXxyQWFycnxlcHNpdnx5Y2lyY3xxdWVzdHxzaGFycHxxdW90fHp3bmp8UXNjcnxyYWNlfHFzY3J8UW9wZnxxb3BmfHFpbnR8cmFuZ3xSYW5nfFpzY3J8enNjcnxab3BmfHpvcGZ8cmFycnxyQXJyfFJhcnJ8UHNjcnxwc2NyfHByb3B8cHJvZHxwcm5FfHByZWN8WkhjeXx6aGN5fHByYXB8WmV0YXx6ZXRhfFBvcGZ8cG9wZnxaZG90fHBsdXN8emRvdHxZdW1sfHl1bWx8cGhpdnxZVWN5fHl1Y3l8WXNjcnx5c2NyfHBlcnB8WW9wZnx5b3BmfHBhcnR8cGFyYXxZSWN5fE91bWx8cmN1Ynx5aWN5fFlBY3l8cmRjYXxvdW1sfG9zb2x8T3NjcnxyZHNofHlhY3l8cmVhbHxvc2NyfHh2ZWV8YW5kZHxyZWN0fGFuZHZ8WHNjcnxvcm9yfG9yZG18b3JkZnx4c2NyfGFuZ2V8YW9wZnxBb3BmfHJIYXJ8WG9wZnxvcGFyfE9vcGZ8eG9wZnx4bmlzfHJob3Z8b29wZnxvbWlkfHhtYXB8b2ludHxhcGlkfGFwb3N8b2dvbnxhc2NyfEFzY3J8b2RvdHxvZGl2fHhjdXB8eGNhcHxvY2lyfG9hc3R8bnZsdHxudmxlfG52Z3R8bnZnZXxudmFwfFdzY3J8d3NjcnxhdW1sfG50bGd8bnRnbHxuc3VwfG5zdWJ8bnNpbXxOc2NyfG5zY3J8bnNjZXxXb3BmfHJpbmd8bnByZXx3b3BmfG5wYXJ8QXVtbHxCYXJ2fGJicmt8Tm9wZnxub3BmfG5taWR8bkx0dnxiZXRhfHJvcGZ8Um9wZnxCZXRhfGJldGh8bmxlc3xycGFyfG5sZXF8Ym5vdHxiTm90fG5sZHJ8TkpjeXxyc2NyfFJzY3J8VnNjcnx2c2NyfHJzcWJ8bmpjeXxib3BmfG5pc2R8Qm9wZnxydHJpfFZvcGZ8bkd0dnxuZ3RyfHZvcGZ8Ym94aHxib3hIfGJveHZ8bmdlc3xuZ2VxfGJveFZ8YnNjcnxzY2FwfEJzY3J8YnNpbXxWZXJ0fHZlcnR8YnNvbHxidWxsfGJ1bXB8Y2Fwc3xjZG90fG5jdXB8c2NuRXxuY2FwfG5ic3B8bmFwRXxDZG90fGNlbnR8c2RvdHxWYmFyfG5hbmd8dkJhcnxjaGN5fE1zY3J8bXNjcnxzZWN0fHNlbWl8Q0hjeXxNb3BmfG1vcGZ8c2V4dHxjaXJjfGNpcmV8bWxkcnxtbGNwfGNpckV8Y29tcHxzaGN5fFNIY3l8dkFycnx2YXJyfGNvbmd8Y29wZnxDb3BmfGNvcHl8Q09QWXxtYWx0fG1hbGV8bWFjcnxsdm5FfGNzY3J8bHRyaXxzaW1lfGx0Y2N8c2ltZ3xDc2NyfHNpbWx8Y3N1YnxVdW1sfGxzcWJ8bHNpbXx1dW1sfGNzdXB8THNjcnxsc2NyfHV0cml8c21pZHxscGFyfGN1cHN8c210ZXxsb3pmfGRhcnJ8TG9wZnxVc2NyfHNvbGJ8bG9wZnxzb3BmfFNvcGZ8bG5lcXx1c2NyfHNwYXJ8ZEFycnxsbmFwfERhcnJ8ZGFzaHxTcXJ0fExKY3l8bGpjeXxsSGFyfGRIYXJ8VXBzaXx1cHNpfGRpYW18bGVzZ3xkamN5fERKY3l8bGVxcXxkb3BmfERvcGZ8ZHNjcnxEc2NyfGRzY3l8bGRzaHxsZGNhfHNxdWZ8RFNjeXxzc2NyfFNzY3J8ZHNvbHxsY3VifGxhdGV8c3RhcnxTdGFyfFVvcGZ8TGFycnxsQXJyfGxhcnJ8dW9wZnxkdHJpfGR6Y3l8c3ViZXxzdWJFfExhbmd8bGFuZ3xLc2NyfGtzY3J8S29wZnxrb3BmfEtKY3l8a2pjeXxLSGN5fGtoY3l8RFpjeXxlY2lyfGVkb3R8ZURvdHxKc2NyfGpzY3J8c3VjY3xKb3BmfGpvcGZ8RWRvdHx1SGFyfGVtc3B8ZW5zcHxJdW1sfGl1bWx8ZW9wZnxpc2lufElzY3J8aXNjcnxFb3BmfGVwYXJ8c3VuZ3xlcHNpfGVzY3J8c3VwMXxzdXAyfHN1cDN8SW90YXxpb3RhfHN1cGV8c3VwRXxJb3BmfGlvcGZ8SU9jeXxpb2N5fEVzY3J8ZXNpbXxFc2ltfGltb2Z8VWFycnxRVU9UfHVBcnJ8dWFycnxldW1sfElFY3l8aWVjeXxJZG90fEV1bWx8ZXVyb3xleGNsfEhzY3J8aHNjcnxIb3BmfGhvcGZ8VFNjeXx0c2N5fFRzY3J8aGJhcnx0c2NyfGZsYXR8dGJya3xmbm9mfGhBcnJ8aGFycnxoYWxmfGZvcGZ8Rm9wZnx0ZG90fGd2bkV8Zm9ya3x0cmllfGd0Y2N8ZnNjcnxGc2NyfGdkb3R8Z3NpbXxHc2NyfGdzY3J8R29wZnxnb3BmfGduZXF8R2RvdHx0b3NhfGduYXB8VG9wZnx0b3BmfGdlcXF8dG9lYXxHSmN5fGdqY3l8dGludHxnZXNsfG1pZHxTZnJ8Z2dnfHRvcHxnZXN8Z2xhfGdsRXxnbGp8Z2VxfGduZXxnRWx8Z2VsfGduRXxHY3l8Z2N5fGdhcHxUZnJ8dGZyfFRjeXx0Y3l8SGF0fFRhdXxGZnJ8dGF1fFRhYnxoZnJ8SGZyfGZmcnxGY3l8ZmN5fGljeXxJY3l8aWZmfEVUSHxldGh8aWZyfElmcnxFdGF8ZXRhfGludHxJbnR8U3VwfHN1cHx1Y3l8VWN5fFN1bXxzdW18amN5fEVOR3x1ZnJ8VWZyfGVuZ3xKY3l8amZyfGVsc3xlbGx8ZWdzfEVmcnxlZnJ8SmZyfHVtbHxrY3l8S2N5fEVjeXxlY3l8a2ZyfEtmcnxsYXB8U3VifHN1YnxsYXR8bGN5fExjeXxsZWd8RG90fGRvdHxsRWd8bGVxfGxlc3xzcXV8ZGl2fGRpZXxsZnJ8TGZyfGxnRXxEZnJ8ZGZyfERlbHxkZWd8RGN5fGRjeXxsbmV8bG5FfHNvbHxsb3p8c210fEN1cHxscm18Y3VwfGxzaHxMc2h8c2ltfHNoeXxtYXB8TWFwfG1jeXxNY3l8bWZyfE1mcnxtaG98Z2ZyfEdmcnxzZnJ8Y2lyfENoaXxjaGl8bmFwfENmcnx2Y3l8VmN5fGNmcnxTY3l8c2N5fG5jeXxOY3l8dmVlfFZlZXxDYXB8Y2FwfG5mcnxzY0V8c2NlfE5mcnxuZ2V8bmdFfG5HZ3x2ZnJ8VmZyfG5ndHxib3R8bkd0fG5pc3xuaXZ8UnNofHJzaHxubGV8bmxFfGJuZXxCZnJ8YmZyfG5MbHxubHR8bkx0fEJjeXxiY3l8bm90fE5vdHxybG18d2ZyfFdmcnxucHJ8bnNjfG51bXxvY3l8YXN0fE9jeXxvZnJ8eGZyfFhmcnxPZnJ8b2d0fG9obXxhcEV8b2x0fFJob3xhcGV8cmhvfFJmcnxyZnJ8b3JkfFJFR3xhbmd8cmVnfG9ydnxBbmR8YW5kfEFNUHxSY3l8YW1wfEFmcnx5Y3l8WWN5fHllbnx5ZnJ8WWZyfHJjeXxwYXJ8cGN5fFBjeXxwZnJ8UGZyfHBoaXxQaGl8YWZyfEFjeXxhY3l8emN5fFpjeXxwaXZ8YWNFfGFjZHx6ZnJ8WmZyfHByZXxwckV8cHNpfFBzaXxxZnJ8UWZyfHp3anxPcnxnZXxHZ3xndHxnZ3xlbHxvU3xsdHxMdHxMVHxSZXxsZ3xnbHxlZ3xuZXxJbXxpdHxsZXxERHx3cHx3cnxudXxOdXxkZHxsRXxTY3xzY3xwaXxQaXxlZXxhZnxsbHxMbHxyeHxnRXx4aXxwbXxYaXxpY3xwcnxQcnxpbnxuaXxtcHxtdXxhY3xNdXxvcnxhcHxHdHxHVHxpaSk7fCYoQWFjdXRlfEFncmF2ZXxBdGlsZGV8Q2NlZGlsfEVhY3V0ZXxFZ3JhdmV8SWFjdXRlfElncmF2ZXxOdGlsZGV8T2FjdXRlfE9ncmF2ZXxPc2xhc2h8T3RpbGRlfFVhY3V0ZXxVZ3JhdmV8WWFjdXRlfGFhY3V0ZXxhZ3JhdmV8YXRpbGRlfGJydmJhcnxjY2VkaWx8Y3VycmVufGRpdmlkZXxlYWN1dGV8ZWdyYXZlfGZyYWMxMnxmcmFjMTR8ZnJhYzM0fGlhY3V0ZXxpZ3JhdmV8aXF1ZXN0fG1pZGRvdHxudGlsZGV8b2FjdXRlfG9ncmF2ZXxvc2xhc2h8b3RpbGRlfHBsdXNtbnx1YWN1dGV8dWdyYXZlfHlhY3V0ZXxBRWxpZ3xBY2lyY3xBcmluZ3xFY2lyY3xJY2lyY3xPY2lyY3xUSE9STnxVY2lyY3xhY2lyY3xhY3V0ZXxhZWxpZ3xhcmluZ3xjZWRpbHxlY2lyY3xpY2lyY3xpZXhjbHxsYXF1b3xtaWNyb3xvY2lyY3xwb3VuZHxyYXF1b3xzemxpZ3x0aG9ybnx0aW1lc3x1Y2lyY3xBdW1sfENPUFl8RXVtbHxJdW1sfE91bWx8UVVPVHxVdW1sfGF1bWx8Y2VudHxjb3B5fGV1bWx8aXVtbHxtYWNyfG5ic3B8b3JkZnxvcmRtfG91bWx8cGFyYXxxdW90fHNlY3R8c3VwMXxzdXAyfHN1cDN8dXVtbHx5dW1sfEFNUHxFVEh8UkVHfGFtcHxkZWd8ZXRofG5vdHxyZWd8c2h5fHVtbHx5ZW58R1R8TFR8Z3R8bHQpKD8hOykoWz1hLXpBLVowLTldPyl8JiMoWzAtOV0rKSg7Pyl8JiNbeFhdKFthLWZBLUYwLTldKykoOz8pfCYoWzAtOWEtekEtWl0rKS9nO1xuXHR2YXIgZGVjb2RlTWFwID0geydhYWN1dGUnOidcXHhFMScsJ0FhY3V0ZSc6J1xceEMxJywnYWJyZXZlJzonXFx1MDEwMycsJ0FicmV2ZSc6J1xcdTAxMDInLCdhYyc6J1xcdTIyM0UnLCdhY2QnOidcXHUyMjNGJywnYWNFJzonXFx1MjIzRVxcdTAzMzMnLCdhY2lyYyc6J1xceEUyJywnQWNpcmMnOidcXHhDMicsJ2FjdXRlJzonXFx4QjQnLCdhY3knOidcXHUwNDMwJywnQWN5JzonXFx1MDQxMCcsJ2FlbGlnJzonXFx4RTYnLCdBRWxpZyc6J1xceEM2JywnYWYnOidcXHUyMDYxJywnYWZyJzonXFx1RDgzNVxcdUREMUUnLCdBZnInOidcXHVEODM1XFx1REQwNCcsJ2FncmF2ZSc6J1xceEUwJywnQWdyYXZlJzonXFx4QzAnLCdhbGVmc3ltJzonXFx1MjEzNScsJ2FsZXBoJzonXFx1MjEzNScsJ2FscGhhJzonXFx1MDNCMScsJ0FscGhhJzonXFx1MDM5MScsJ2FtYWNyJzonXFx1MDEwMScsJ0FtYWNyJzonXFx1MDEwMCcsJ2FtYWxnJzonXFx1MkEzRicsJ2FtcCc6JyYnLCdBTVAnOicmJywnYW5kJzonXFx1MjIyNycsJ0FuZCc6J1xcdTJBNTMnLCdhbmRhbmQnOidcXHUyQTU1JywnYW5kZCc6J1xcdTJBNUMnLCdhbmRzbG9wZSc6J1xcdTJBNTgnLCdhbmR2JzonXFx1MkE1QScsJ2FuZyc6J1xcdTIyMjAnLCdhbmdlJzonXFx1MjlBNCcsJ2FuZ2xlJzonXFx1MjIyMCcsJ2FuZ21zZCc6J1xcdTIyMjEnLCdhbmdtc2RhYSc6J1xcdTI5QTgnLCdhbmdtc2RhYic6J1xcdTI5QTknLCdhbmdtc2RhYyc6J1xcdTI5QUEnLCdhbmdtc2RhZCc6J1xcdTI5QUInLCdhbmdtc2RhZSc6J1xcdTI5QUMnLCdhbmdtc2RhZic6J1xcdTI5QUQnLCdhbmdtc2RhZyc6J1xcdTI5QUUnLCdhbmdtc2RhaCc6J1xcdTI5QUYnLCdhbmdydCc6J1xcdTIyMUYnLCdhbmdydHZiJzonXFx1MjJCRScsJ2FuZ3J0dmJkJzonXFx1Mjk5RCcsJ2FuZ3NwaCc6J1xcdTIyMjInLCdhbmdzdCc6J1xceEM1JywnYW5nemFycic6J1xcdTIzN0MnLCdhb2dvbic6J1xcdTAxMDUnLCdBb2dvbic6J1xcdTAxMDQnLCdhb3BmJzonXFx1RDgzNVxcdURENTInLCdBb3BmJzonXFx1RDgzNVxcdUREMzgnLCdhcCc6J1xcdTIyNDgnLCdhcGFjaXInOidcXHUyQTZGJywnYXBlJzonXFx1MjI0QScsJ2FwRSc6J1xcdTJBNzAnLCdhcGlkJzonXFx1MjI0QicsJ2Fwb3MnOidcXCcnLCdBcHBseUZ1bmN0aW9uJzonXFx1MjA2MScsJ2FwcHJveCc6J1xcdTIyNDgnLCdhcHByb3hlcSc6J1xcdTIyNEEnLCdhcmluZyc6J1xceEU1JywnQXJpbmcnOidcXHhDNScsJ2FzY3InOidcXHVEODM1XFx1RENCNicsJ0FzY3InOidcXHVEODM1XFx1REM5QycsJ0Fzc2lnbic6J1xcdTIyNTQnLCdhc3QnOicqJywnYXN5bXAnOidcXHUyMjQ4JywnYXN5bXBlcSc6J1xcdTIyNEQnLCdhdGlsZGUnOidcXHhFMycsJ0F0aWxkZSc6J1xceEMzJywnYXVtbCc6J1xceEU0JywnQXVtbCc6J1xceEM0JywnYXdjb25pbnQnOidcXHUyMjMzJywnYXdpbnQnOidcXHUyQTExJywnYmFja2NvbmcnOidcXHUyMjRDJywnYmFja2Vwc2lsb24nOidcXHUwM0Y2JywnYmFja3ByaW1lJzonXFx1MjAzNScsJ2JhY2tzaW0nOidcXHUyMjNEJywnYmFja3NpbWVxJzonXFx1MjJDRCcsJ0JhY2tzbGFzaCc6J1xcdTIyMTYnLCdCYXJ2JzonXFx1MkFFNycsJ2JhcnZlZSc6J1xcdTIyQkQnLCdiYXJ3ZWQnOidcXHUyMzA1JywnQmFyd2VkJzonXFx1MjMwNicsJ2JhcndlZGdlJzonXFx1MjMwNScsJ2JicmsnOidcXHUyM0I1JywnYmJya3RicmsnOidcXHUyM0I2JywnYmNvbmcnOidcXHUyMjRDJywnYmN5JzonXFx1MDQzMScsJ0JjeSc6J1xcdTA0MTEnLCdiZHF1byc6J1xcdTIwMUUnLCdiZWNhdXMnOidcXHUyMjM1JywnYmVjYXVzZSc6J1xcdTIyMzUnLCdCZWNhdXNlJzonXFx1MjIzNScsJ2JlbXB0eXYnOidcXHUyOUIwJywnYmVwc2knOidcXHUwM0Y2JywnYmVybm91JzonXFx1MjEyQycsJ0Jlcm5vdWxsaXMnOidcXHUyMTJDJywnYmV0YSc6J1xcdTAzQjInLCdCZXRhJzonXFx1MDM5MicsJ2JldGgnOidcXHUyMTM2JywnYmV0d2Vlbic6J1xcdTIyNkMnLCdiZnInOidcXHVEODM1XFx1REQxRicsJ0Jmcic6J1xcdUQ4MzVcXHVERDA1JywnYmlnY2FwJzonXFx1MjJDMicsJ2JpZ2NpcmMnOidcXHUyNUVGJywnYmlnY3VwJzonXFx1MjJDMycsJ2JpZ29kb3QnOidcXHUyQTAwJywnYmlnb3BsdXMnOidcXHUyQTAxJywnYmlnb3RpbWVzJzonXFx1MkEwMicsJ2JpZ3NxY3VwJzonXFx1MkEwNicsJ2JpZ3N0YXInOidcXHUyNjA1JywnYmlndHJpYW5nbGVkb3duJzonXFx1MjVCRCcsJ2JpZ3RyaWFuZ2xldXAnOidcXHUyNUIzJywnYmlndXBsdXMnOidcXHUyQTA0JywnYmlndmVlJzonXFx1MjJDMScsJ2JpZ3dlZGdlJzonXFx1MjJDMCcsJ2JrYXJvdyc6J1xcdTI5MEQnLCdibGFja2xvemVuZ2UnOidcXHUyOUVCJywnYmxhY2tzcXVhcmUnOidcXHUyNUFBJywnYmxhY2t0cmlhbmdsZSc6J1xcdTI1QjQnLCdibGFja3RyaWFuZ2xlZG93bic6J1xcdTI1QkUnLCdibGFja3RyaWFuZ2xlbGVmdCc6J1xcdTI1QzInLCdibGFja3RyaWFuZ2xlcmlnaHQnOidcXHUyNUI4JywnYmxhbmsnOidcXHUyNDIzJywnYmxrMTInOidcXHUyNTkyJywnYmxrMTQnOidcXHUyNTkxJywnYmxrMzQnOidcXHUyNTkzJywnYmxvY2snOidcXHUyNTg4JywnYm5lJzonPVxcdTIwRTUnLCdibmVxdWl2JzonXFx1MjI2MVxcdTIwRTUnLCdibm90JzonXFx1MjMxMCcsJ2JOb3QnOidcXHUyQUVEJywnYm9wZic6J1xcdUQ4MzVcXHVERDUzJywnQm9wZic6J1xcdUQ4MzVcXHVERDM5JywnYm90JzonXFx1MjJBNScsJ2JvdHRvbSc6J1xcdTIyQTUnLCdib3d0aWUnOidcXHUyMkM4JywnYm94Ym94JzonXFx1MjlDOScsJ2JveGRsJzonXFx1MjUxMCcsJ2JveGRMJzonXFx1MjU1NScsJ2JveERsJzonXFx1MjU1NicsJ2JveERMJzonXFx1MjU1NycsJ2JveGRyJzonXFx1MjUwQycsJ2JveGRSJzonXFx1MjU1MicsJ2JveERyJzonXFx1MjU1MycsJ2JveERSJzonXFx1MjU1NCcsJ2JveGgnOidcXHUyNTAwJywnYm94SCc6J1xcdTI1NTAnLCdib3hoZCc6J1xcdTI1MkMnLCdib3hoRCc6J1xcdTI1NjUnLCdib3hIZCc6J1xcdTI1NjQnLCdib3hIRCc6J1xcdTI1NjYnLCdib3hodSc6J1xcdTI1MzQnLCdib3hoVSc6J1xcdTI1NjgnLCdib3hIdSc6J1xcdTI1NjcnLCdib3hIVSc6J1xcdTI1NjknLCdib3htaW51cyc6J1xcdTIyOUYnLCdib3hwbHVzJzonXFx1MjI5RScsJ2JveHRpbWVzJzonXFx1MjJBMCcsJ2JveHVsJzonXFx1MjUxOCcsJ2JveHVMJzonXFx1MjU1QicsJ2JveFVsJzonXFx1MjU1QycsJ2JveFVMJzonXFx1MjU1RCcsJ2JveHVyJzonXFx1MjUxNCcsJ2JveHVSJzonXFx1MjU1OCcsJ2JveFVyJzonXFx1MjU1OScsJ2JveFVSJzonXFx1MjU1QScsJ2JveHYnOidcXHUyNTAyJywnYm94Vic6J1xcdTI1NTEnLCdib3h2aCc6J1xcdTI1M0MnLCdib3h2SCc6J1xcdTI1NkEnLCdib3hWaCc6J1xcdTI1NkInLCdib3hWSCc6J1xcdTI1NkMnLCdib3h2bCc6J1xcdTI1MjQnLCdib3h2TCc6J1xcdTI1NjEnLCdib3hWbCc6J1xcdTI1NjInLCdib3hWTCc6J1xcdTI1NjMnLCdib3h2cic6J1xcdTI1MUMnLCdib3h2Uic6J1xcdTI1NUUnLCdib3hWcic6J1xcdTI1NUYnLCdib3hWUic6J1xcdTI1NjAnLCdicHJpbWUnOidcXHUyMDM1JywnYnJldmUnOidcXHUwMkQ4JywnQnJldmUnOidcXHUwMkQ4JywnYnJ2YmFyJzonXFx4QTYnLCdic2NyJzonXFx1RDgzNVxcdURDQjcnLCdCc2NyJzonXFx1MjEyQycsJ2JzZW1pJzonXFx1MjA0RicsJ2JzaW0nOidcXHUyMjNEJywnYnNpbWUnOidcXHUyMkNEJywnYnNvbCc6J1xcXFwnLCdic29sYic6J1xcdTI5QzUnLCdic29saHN1Yic6J1xcdTI3QzgnLCdidWxsJzonXFx1MjAyMicsJ2J1bGxldCc6J1xcdTIwMjInLCdidW1wJzonXFx1MjI0RScsJ2J1bXBlJzonXFx1MjI0RicsJ2J1bXBFJzonXFx1MkFBRScsJ2J1bXBlcSc6J1xcdTIyNEYnLCdCdW1wZXEnOidcXHUyMjRFJywnY2FjdXRlJzonXFx1MDEwNycsJ0NhY3V0ZSc6J1xcdTAxMDYnLCdjYXAnOidcXHUyMjI5JywnQ2FwJzonXFx1MjJEMicsJ2NhcGFuZCc6J1xcdTJBNDQnLCdjYXBicmN1cCc6J1xcdTJBNDknLCdjYXBjYXAnOidcXHUyQTRCJywnY2FwY3VwJzonXFx1MkE0NycsJ2NhcGRvdCc6J1xcdTJBNDAnLCdDYXBpdGFsRGlmZmVyZW50aWFsRCc6J1xcdTIxNDUnLCdjYXBzJzonXFx1MjIyOVxcdUZFMDAnLCdjYXJldCc6J1xcdTIwNDEnLCdjYXJvbic6J1xcdTAyQzcnLCdDYXlsZXlzJzonXFx1MjEyRCcsJ2NjYXBzJzonXFx1MkE0RCcsJ2NjYXJvbic6J1xcdTAxMEQnLCdDY2Fyb24nOidcXHUwMTBDJywnY2NlZGlsJzonXFx4RTcnLCdDY2VkaWwnOidcXHhDNycsJ2NjaXJjJzonXFx1MDEwOScsJ0NjaXJjJzonXFx1MDEwOCcsJ0Njb25pbnQnOidcXHUyMjMwJywnY2N1cHMnOidcXHUyQTRDJywnY2N1cHNzbSc6J1xcdTJBNTAnLCdjZG90JzonXFx1MDEwQicsJ0Nkb3QnOidcXHUwMTBBJywnY2VkaWwnOidcXHhCOCcsJ0NlZGlsbGEnOidcXHhCOCcsJ2NlbXB0eXYnOidcXHUyOUIyJywnY2VudCc6J1xceEEyJywnY2VudGVyZG90JzonXFx4QjcnLCdDZW50ZXJEb3QnOidcXHhCNycsJ2Nmcic6J1xcdUQ4MzVcXHVERDIwJywnQ2ZyJzonXFx1MjEyRCcsJ2NoY3knOidcXHUwNDQ3JywnQ0hjeSc6J1xcdTA0MjcnLCdjaGVjayc6J1xcdTI3MTMnLCdjaGVja21hcmsnOidcXHUyNzEzJywnY2hpJzonXFx1MDNDNycsJ0NoaSc6J1xcdTAzQTcnLCdjaXInOidcXHUyNUNCJywnY2lyYyc6J1xcdTAyQzYnLCdjaXJjZXEnOidcXHUyMjU3JywnY2lyY2xlYXJyb3dsZWZ0JzonXFx1MjFCQScsJ2NpcmNsZWFycm93cmlnaHQnOidcXHUyMUJCJywnY2lyY2xlZGFzdCc6J1xcdTIyOUInLCdjaXJjbGVkY2lyYyc6J1xcdTIyOUEnLCdjaXJjbGVkZGFzaCc6J1xcdTIyOUQnLCdDaXJjbGVEb3QnOidcXHUyMjk5JywnY2lyY2xlZFInOidcXHhBRScsJ2NpcmNsZWRTJzonXFx1MjRDOCcsJ0NpcmNsZU1pbnVzJzonXFx1MjI5NicsJ0NpcmNsZVBsdXMnOidcXHUyMjk1JywnQ2lyY2xlVGltZXMnOidcXHUyMjk3JywnY2lyZSc6J1xcdTIyNTcnLCdjaXJFJzonXFx1MjlDMycsJ2NpcmZuaW50JzonXFx1MkExMCcsJ2Npcm1pZCc6J1xcdTJBRUYnLCdjaXJzY2lyJzonXFx1MjlDMicsJ0Nsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbCc6J1xcdTIyMzInLCdDbG9zZUN1cmx5RG91YmxlUXVvdGUnOidcXHUyMDFEJywnQ2xvc2VDdXJseVF1b3RlJzonXFx1MjAxOScsJ2NsdWJzJzonXFx1MjY2MycsJ2NsdWJzdWl0JzonXFx1MjY2MycsJ2NvbG9uJzonOicsJ0NvbG9uJzonXFx1MjIzNycsJ2NvbG9uZSc6J1xcdTIyNTQnLCdDb2xvbmUnOidcXHUyQTc0JywnY29sb25lcSc6J1xcdTIyNTQnLCdjb21tYSc6JywnLCdjb21tYXQnOidAJywnY29tcCc6J1xcdTIyMDEnLCdjb21wZm4nOidcXHUyMjE4JywnY29tcGxlbWVudCc6J1xcdTIyMDEnLCdjb21wbGV4ZXMnOidcXHUyMTAyJywnY29uZyc6J1xcdTIyNDUnLCdjb25nZG90JzonXFx1MkE2RCcsJ0NvbmdydWVudCc6J1xcdTIyNjEnLCdjb25pbnQnOidcXHUyMjJFJywnQ29uaW50JzonXFx1MjIyRicsJ0NvbnRvdXJJbnRlZ3JhbCc6J1xcdTIyMkUnLCdjb3BmJzonXFx1RDgzNVxcdURENTQnLCdDb3BmJzonXFx1MjEwMicsJ2NvcHJvZCc6J1xcdTIyMTAnLCdDb3Byb2R1Y3QnOidcXHUyMjEwJywnY29weSc6J1xceEE5JywnQ09QWSc6J1xceEE5JywnY29weXNyJzonXFx1MjExNycsJ0NvdW50ZXJDbG9ja3dpc2VDb250b3VySW50ZWdyYWwnOidcXHUyMjMzJywnY3JhcnInOidcXHUyMUI1JywnY3Jvc3MnOidcXHUyNzE3JywnQ3Jvc3MnOidcXHUyQTJGJywnY3Njcic6J1xcdUQ4MzVcXHVEQ0I4JywnQ3Njcic6J1xcdUQ4MzVcXHVEQzlFJywnY3N1Yic6J1xcdTJBQ0YnLCdjc3ViZSc6J1xcdTJBRDEnLCdjc3VwJzonXFx1MkFEMCcsJ2NzdXBlJzonXFx1MkFEMicsJ2N0ZG90JzonXFx1MjJFRicsJ2N1ZGFycmwnOidcXHUyOTM4JywnY3VkYXJycic6J1xcdTI5MzUnLCdjdWVwcic6J1xcdTIyREUnLCdjdWVzYyc6J1xcdTIyREYnLCdjdWxhcnInOidcXHUyMUI2JywnY3VsYXJycCc6J1xcdTI5M0QnLCdjdXAnOidcXHUyMjJBJywnQ3VwJzonXFx1MjJEMycsJ2N1cGJyY2FwJzonXFx1MkE0OCcsJ2N1cGNhcCc6J1xcdTJBNDYnLCdDdXBDYXAnOidcXHUyMjREJywnY3VwY3VwJzonXFx1MkE0QScsJ2N1cGRvdCc6J1xcdTIyOEQnLCdjdXBvcic6J1xcdTJBNDUnLCdjdXBzJzonXFx1MjIyQVxcdUZFMDAnLCdjdXJhcnInOidcXHUyMUI3JywnY3VyYXJybSc6J1xcdTI5M0MnLCdjdXJseWVxcHJlYyc6J1xcdTIyREUnLCdjdXJseWVxc3VjYyc6J1xcdTIyREYnLCdjdXJseXZlZSc6J1xcdTIyQ0UnLCdjdXJseXdlZGdlJzonXFx1MjJDRicsJ2N1cnJlbic6J1xceEE0JywnY3VydmVhcnJvd2xlZnQnOidcXHUyMUI2JywnY3VydmVhcnJvd3JpZ2h0JzonXFx1MjFCNycsJ2N1dmVlJzonXFx1MjJDRScsJ2N1d2VkJzonXFx1MjJDRicsJ2N3Y29uaW50JzonXFx1MjIzMicsJ2N3aW50JzonXFx1MjIzMScsJ2N5bGN0eSc6J1xcdTIzMkQnLCdkYWdnZXInOidcXHUyMDIwJywnRGFnZ2VyJzonXFx1MjAyMScsJ2RhbGV0aCc6J1xcdTIxMzgnLCdkYXJyJzonXFx1MjE5MycsJ2RBcnInOidcXHUyMUQzJywnRGFycic6J1xcdTIxQTEnLCdkYXNoJzonXFx1MjAxMCcsJ2Rhc2h2JzonXFx1MjJBMycsJ0Rhc2h2JzonXFx1MkFFNCcsJ2Ria2Fyb3cnOidcXHUyOTBGJywnZGJsYWMnOidcXHUwMkREJywnZGNhcm9uJzonXFx1MDEwRicsJ0RjYXJvbic6J1xcdTAxMEUnLCdkY3knOidcXHUwNDM0JywnRGN5JzonXFx1MDQxNCcsJ2RkJzonXFx1MjE0NicsJ0REJzonXFx1MjE0NScsJ2RkYWdnZXInOidcXHUyMDIxJywnZGRhcnInOidcXHUyMUNBJywnRERvdHJhaGQnOidcXHUyOTExJywnZGRvdHNlcSc6J1xcdTJBNzcnLCdkZWcnOidcXHhCMCcsJ0RlbCc6J1xcdTIyMDcnLCdkZWx0YSc6J1xcdTAzQjQnLCdEZWx0YSc6J1xcdTAzOTQnLCdkZW1wdHl2JzonXFx1MjlCMScsJ2RmaXNodCc6J1xcdTI5N0YnLCdkZnInOidcXHVEODM1XFx1REQyMScsJ0Rmcic6J1xcdUQ4MzVcXHVERDA3JywnZEhhcic6J1xcdTI5NjUnLCdkaGFybCc6J1xcdTIxQzMnLCdkaGFycic6J1xcdTIxQzInLCdEaWFjcml0aWNhbEFjdXRlJzonXFx4QjQnLCdEaWFjcml0aWNhbERvdCc6J1xcdTAyRDknLCdEaWFjcml0aWNhbERvdWJsZUFjdXRlJzonXFx1MDJERCcsJ0RpYWNyaXRpY2FsR3JhdmUnOidgJywnRGlhY3JpdGljYWxUaWxkZSc6J1xcdTAyREMnLCdkaWFtJzonXFx1MjJDNCcsJ2RpYW1vbmQnOidcXHUyMkM0JywnRGlhbW9uZCc6J1xcdTIyQzQnLCdkaWFtb25kc3VpdCc6J1xcdTI2NjYnLCdkaWFtcyc6J1xcdTI2NjYnLCdkaWUnOidcXHhBOCcsJ0RpZmZlcmVudGlhbEQnOidcXHUyMTQ2JywnZGlnYW1tYSc6J1xcdTAzREQnLCdkaXNpbic6J1xcdTIyRjInLCdkaXYnOidcXHhGNycsJ2RpdmlkZSc6J1xceEY3JywnZGl2aWRlb250aW1lcyc6J1xcdTIyQzcnLCdkaXZvbngnOidcXHUyMkM3JywnZGpjeSc6J1xcdTA0NTInLCdESmN5JzonXFx1MDQwMicsJ2RsY29ybic6J1xcdTIzMUUnLCdkbGNyb3AnOidcXHUyMzBEJywnZG9sbGFyJzonJCcsJ2RvcGYnOidcXHVEODM1XFx1REQ1NScsJ0RvcGYnOidcXHVEODM1XFx1REQzQicsJ2RvdCc6J1xcdTAyRDknLCdEb3QnOidcXHhBOCcsJ0RvdERvdCc6J1xcdTIwREMnLCdkb3RlcSc6J1xcdTIyNTAnLCdkb3RlcWRvdCc6J1xcdTIyNTEnLCdEb3RFcXVhbCc6J1xcdTIyNTAnLCdkb3RtaW51cyc6J1xcdTIyMzgnLCdkb3RwbHVzJzonXFx1MjIxNCcsJ2RvdHNxdWFyZSc6J1xcdTIyQTEnLCdkb3VibGViYXJ3ZWRnZSc6J1xcdTIzMDYnLCdEb3VibGVDb250b3VySW50ZWdyYWwnOidcXHUyMjJGJywnRG91YmxlRG90JzonXFx4QTgnLCdEb3VibGVEb3duQXJyb3cnOidcXHUyMUQzJywnRG91YmxlTGVmdEFycm93JzonXFx1MjFEMCcsJ0RvdWJsZUxlZnRSaWdodEFycm93JzonXFx1MjFENCcsJ0RvdWJsZUxlZnRUZWUnOidcXHUyQUU0JywnRG91YmxlTG9uZ0xlZnRBcnJvdyc6J1xcdTI3RjgnLCdEb3VibGVMb25nTGVmdFJpZ2h0QXJyb3cnOidcXHUyN0ZBJywnRG91YmxlTG9uZ1JpZ2h0QXJyb3cnOidcXHUyN0Y5JywnRG91YmxlUmlnaHRBcnJvdyc6J1xcdTIxRDInLCdEb3VibGVSaWdodFRlZSc6J1xcdTIyQTgnLCdEb3VibGVVcEFycm93JzonXFx1MjFEMScsJ0RvdWJsZVVwRG93bkFycm93JzonXFx1MjFENScsJ0RvdWJsZVZlcnRpY2FsQmFyJzonXFx1MjIyNScsJ2Rvd25hcnJvdyc6J1xcdTIxOTMnLCdEb3duYXJyb3cnOidcXHUyMUQzJywnRG93bkFycm93JzonXFx1MjE5MycsJ0Rvd25BcnJvd0Jhcic6J1xcdTI5MTMnLCdEb3duQXJyb3dVcEFycm93JzonXFx1MjFGNScsJ0Rvd25CcmV2ZSc6J1xcdTAzMTEnLCdkb3duZG93bmFycm93cyc6J1xcdTIxQ0EnLCdkb3duaGFycG9vbmxlZnQnOidcXHUyMUMzJywnZG93bmhhcnBvb25yaWdodCc6J1xcdTIxQzInLCdEb3duTGVmdFJpZ2h0VmVjdG9yJzonXFx1Mjk1MCcsJ0Rvd25MZWZ0VGVlVmVjdG9yJzonXFx1Mjk1RScsJ0Rvd25MZWZ0VmVjdG9yJzonXFx1MjFCRCcsJ0Rvd25MZWZ0VmVjdG9yQmFyJzonXFx1Mjk1NicsJ0Rvd25SaWdodFRlZVZlY3Rvcic6J1xcdTI5NUYnLCdEb3duUmlnaHRWZWN0b3InOidcXHUyMUMxJywnRG93blJpZ2h0VmVjdG9yQmFyJzonXFx1Mjk1NycsJ0Rvd25UZWUnOidcXHUyMkE0JywnRG93blRlZUFycm93JzonXFx1MjFBNycsJ2RyYmthcm93JzonXFx1MjkxMCcsJ2RyY29ybic6J1xcdTIzMUYnLCdkcmNyb3AnOidcXHUyMzBDJywnZHNjcic6J1xcdUQ4MzVcXHVEQ0I5JywnRHNjcic6J1xcdUQ4MzVcXHVEQzlGJywnZHNjeSc6J1xcdTA0NTUnLCdEU2N5JzonXFx1MDQwNScsJ2Rzb2wnOidcXHUyOUY2JywnZHN0cm9rJzonXFx1MDExMScsJ0RzdHJvayc6J1xcdTAxMTAnLCdkdGRvdCc6J1xcdTIyRjEnLCdkdHJpJzonXFx1MjVCRicsJ2R0cmlmJzonXFx1MjVCRScsJ2R1YXJyJzonXFx1MjFGNScsJ2R1aGFyJzonXFx1Mjk2RicsJ2R3YW5nbGUnOidcXHUyOUE2JywnZHpjeSc6J1xcdTA0NUYnLCdEWmN5JzonXFx1MDQwRicsJ2R6aWdyYXJyJzonXFx1MjdGRicsJ2VhY3V0ZSc6J1xceEU5JywnRWFjdXRlJzonXFx4QzknLCdlYXN0ZXInOidcXHUyQTZFJywnZWNhcm9uJzonXFx1MDExQicsJ0VjYXJvbic6J1xcdTAxMUEnLCdlY2lyJzonXFx1MjI1NicsJ2VjaXJjJzonXFx4RUEnLCdFY2lyYyc6J1xceENBJywnZWNvbG9uJzonXFx1MjI1NScsJ2VjeSc6J1xcdTA0NEQnLCdFY3knOidcXHUwNDJEJywnZUREb3QnOidcXHUyQTc3JywnZWRvdCc6J1xcdTAxMTcnLCdlRG90JzonXFx1MjI1MScsJ0Vkb3QnOidcXHUwMTE2JywnZWUnOidcXHUyMTQ3JywnZWZEb3QnOidcXHUyMjUyJywnZWZyJzonXFx1RDgzNVxcdUREMjInLCdFZnInOidcXHVEODM1XFx1REQwOCcsJ2VnJzonXFx1MkE5QScsJ2VncmF2ZSc6J1xceEU4JywnRWdyYXZlJzonXFx4QzgnLCdlZ3MnOidcXHUyQTk2JywnZWdzZG90JzonXFx1MkE5OCcsJ2VsJzonXFx1MkE5OScsJ0VsZW1lbnQnOidcXHUyMjA4JywnZWxpbnRlcnMnOidcXHUyM0U3JywnZWxsJzonXFx1MjExMycsJ2Vscyc6J1xcdTJBOTUnLCdlbHNkb3QnOidcXHUyQTk3JywnZW1hY3InOidcXHUwMTEzJywnRW1hY3InOidcXHUwMTEyJywnZW1wdHknOidcXHUyMjA1JywnZW1wdHlzZXQnOidcXHUyMjA1JywnRW1wdHlTbWFsbFNxdWFyZSc6J1xcdTI1RkInLCdlbXB0eXYnOidcXHUyMjA1JywnRW1wdHlWZXJ5U21hbGxTcXVhcmUnOidcXHUyNUFCJywnZW1zcCc6J1xcdTIwMDMnLCdlbXNwMTMnOidcXHUyMDA0JywnZW1zcDE0JzonXFx1MjAwNScsJ2VuZyc6J1xcdTAxNEInLCdFTkcnOidcXHUwMTRBJywnZW5zcCc6J1xcdTIwMDInLCdlb2dvbic6J1xcdTAxMTknLCdFb2dvbic6J1xcdTAxMTgnLCdlb3BmJzonXFx1RDgzNVxcdURENTYnLCdFb3BmJzonXFx1RDgzNVxcdUREM0MnLCdlcGFyJzonXFx1MjJENScsJ2VwYXJzbCc6J1xcdTI5RTMnLCdlcGx1cyc6J1xcdTJBNzEnLCdlcHNpJzonXFx1MDNCNScsJ2Vwc2lsb24nOidcXHUwM0I1JywnRXBzaWxvbic6J1xcdTAzOTUnLCdlcHNpdic6J1xcdTAzRjUnLCdlcWNpcmMnOidcXHUyMjU2JywnZXFjb2xvbic6J1xcdTIyNTUnLCdlcXNpbSc6J1xcdTIyNDInLCdlcXNsYW50Z3RyJzonXFx1MkE5NicsJ2Vxc2xhbnRsZXNzJzonXFx1MkE5NScsJ0VxdWFsJzonXFx1MkE3NScsJ2VxdWFscyc6Jz0nLCdFcXVhbFRpbGRlJzonXFx1MjI0MicsJ2VxdWVzdCc6J1xcdTIyNUYnLCdFcXVpbGlicml1bSc6J1xcdTIxQ0MnLCdlcXVpdic6J1xcdTIyNjEnLCdlcXVpdkREJzonXFx1MkE3OCcsJ2VxdnBhcnNsJzonXFx1MjlFNScsJ2VyYXJyJzonXFx1Mjk3MScsJ2VyRG90JzonXFx1MjI1MycsJ2VzY3InOidcXHUyMTJGJywnRXNjcic6J1xcdTIxMzAnLCdlc2RvdCc6J1xcdTIyNTAnLCdlc2ltJzonXFx1MjI0MicsJ0VzaW0nOidcXHUyQTczJywnZXRhJzonXFx1MDNCNycsJ0V0YSc6J1xcdTAzOTcnLCdldGgnOidcXHhGMCcsJ0VUSCc6J1xceEQwJywnZXVtbCc6J1xceEVCJywnRXVtbCc6J1xceENCJywnZXVybyc6J1xcdTIwQUMnLCdleGNsJzonIScsJ2V4aXN0JzonXFx1MjIwMycsJ0V4aXN0cyc6J1xcdTIyMDMnLCdleHBlY3RhdGlvbic6J1xcdTIxMzAnLCdleHBvbmVudGlhbGUnOidcXHUyMTQ3JywnRXhwb25lbnRpYWxFJzonXFx1MjE0NycsJ2ZhbGxpbmdkb3RzZXEnOidcXHUyMjUyJywnZmN5JzonXFx1MDQ0NCcsJ0ZjeSc6J1xcdTA0MjQnLCdmZW1hbGUnOidcXHUyNjQwJywnZmZpbGlnJzonXFx1RkIwMycsJ2ZmbGlnJzonXFx1RkIwMCcsJ2ZmbGxpZyc6J1xcdUZCMDQnLCdmZnInOidcXHVEODM1XFx1REQyMycsJ0Zmcic6J1xcdUQ4MzVcXHVERDA5JywnZmlsaWcnOidcXHVGQjAxJywnRmlsbGVkU21hbGxTcXVhcmUnOidcXHUyNUZDJywnRmlsbGVkVmVyeVNtYWxsU3F1YXJlJzonXFx1MjVBQScsJ2ZqbGlnJzonZmonLCdmbGF0JzonXFx1MjY2RCcsJ2ZsbGlnJzonXFx1RkIwMicsJ2ZsdG5zJzonXFx1MjVCMScsJ2Zub2YnOidcXHUwMTkyJywnZm9wZic6J1xcdUQ4MzVcXHVERDU3JywnRm9wZic6J1xcdUQ4MzVcXHVERDNEJywnZm9yYWxsJzonXFx1MjIwMCcsJ0ZvckFsbCc6J1xcdTIyMDAnLCdmb3JrJzonXFx1MjJENCcsJ2Zvcmt2JzonXFx1MkFEOScsJ0ZvdXJpZXJ0cmYnOidcXHUyMTMxJywnZnBhcnRpbnQnOidcXHUyQTBEJywnZnJhYzEyJzonXFx4QkQnLCdmcmFjMTMnOidcXHUyMTUzJywnZnJhYzE0JzonXFx4QkMnLCdmcmFjMTUnOidcXHUyMTU1JywnZnJhYzE2JzonXFx1MjE1OScsJ2ZyYWMxOCc6J1xcdTIxNUInLCdmcmFjMjMnOidcXHUyMTU0JywnZnJhYzI1JzonXFx1MjE1NicsJ2ZyYWMzNCc6J1xceEJFJywnZnJhYzM1JzonXFx1MjE1NycsJ2ZyYWMzOCc6J1xcdTIxNUMnLCdmcmFjNDUnOidcXHUyMTU4JywnZnJhYzU2JzonXFx1MjE1QScsJ2ZyYWM1OCc6J1xcdTIxNUQnLCdmcmFjNzgnOidcXHUyMTVFJywnZnJhc2wnOidcXHUyMDQ0JywnZnJvd24nOidcXHUyMzIyJywnZnNjcic6J1xcdUQ4MzVcXHVEQ0JCJywnRnNjcic6J1xcdTIxMzEnLCdnYWN1dGUnOidcXHUwMUY1JywnZ2FtbWEnOidcXHUwM0IzJywnR2FtbWEnOidcXHUwMzkzJywnZ2FtbWFkJzonXFx1MDNERCcsJ0dhbW1hZCc6J1xcdTAzREMnLCdnYXAnOidcXHUyQTg2JywnZ2JyZXZlJzonXFx1MDExRicsJ0dicmV2ZSc6J1xcdTAxMUUnLCdHY2VkaWwnOidcXHUwMTIyJywnZ2NpcmMnOidcXHUwMTFEJywnR2NpcmMnOidcXHUwMTFDJywnZ2N5JzonXFx1MDQzMycsJ0djeSc6J1xcdTA0MTMnLCdnZG90JzonXFx1MDEyMScsJ0dkb3QnOidcXHUwMTIwJywnZ2UnOidcXHUyMjY1JywnZ0UnOidcXHUyMjY3JywnZ2VsJzonXFx1MjJEQicsJ2dFbCc6J1xcdTJBOEMnLCdnZXEnOidcXHUyMjY1JywnZ2VxcSc6J1xcdTIyNjcnLCdnZXFzbGFudCc6J1xcdTJBN0UnLCdnZXMnOidcXHUyQTdFJywnZ2VzY2MnOidcXHUyQUE5JywnZ2VzZG90JzonXFx1MkE4MCcsJ2dlc2RvdG8nOidcXHUyQTgyJywnZ2VzZG90b2wnOidcXHUyQTg0JywnZ2VzbCc6J1xcdTIyREJcXHVGRTAwJywnZ2VzbGVzJzonXFx1MkE5NCcsJ2dmcic6J1xcdUQ4MzVcXHVERDI0JywnR2ZyJzonXFx1RDgzNVxcdUREMEEnLCdnZyc6J1xcdTIyNkInLCdHZyc6J1xcdTIyRDknLCdnZ2cnOidcXHUyMkQ5JywnZ2ltZWwnOidcXHUyMTM3JywnZ2pjeSc6J1xcdTA0NTMnLCdHSmN5JzonXFx1MDQwMycsJ2dsJzonXFx1MjI3NycsJ2dsYSc6J1xcdTJBQTUnLCdnbEUnOidcXHUyQTkyJywnZ2xqJzonXFx1MkFBNCcsJ2duYXAnOidcXHUyQThBJywnZ25hcHByb3gnOidcXHUyQThBJywnZ25lJzonXFx1MkE4OCcsJ2duRSc6J1xcdTIyNjknLCdnbmVxJzonXFx1MkE4OCcsJ2duZXFxJzonXFx1MjI2OScsJ2duc2ltJzonXFx1MjJFNycsJ2dvcGYnOidcXHVEODM1XFx1REQ1OCcsJ0dvcGYnOidcXHVEODM1XFx1REQzRScsJ2dyYXZlJzonYCcsJ0dyZWF0ZXJFcXVhbCc6J1xcdTIyNjUnLCdHcmVhdGVyRXF1YWxMZXNzJzonXFx1MjJEQicsJ0dyZWF0ZXJGdWxsRXF1YWwnOidcXHUyMjY3JywnR3JlYXRlckdyZWF0ZXInOidcXHUyQUEyJywnR3JlYXRlckxlc3MnOidcXHUyMjc3JywnR3JlYXRlclNsYW50RXF1YWwnOidcXHUyQTdFJywnR3JlYXRlclRpbGRlJzonXFx1MjI3MycsJ2dzY3InOidcXHUyMTBBJywnR3Njcic6J1xcdUQ4MzVcXHVEQ0EyJywnZ3NpbSc6J1xcdTIyNzMnLCdnc2ltZSc6J1xcdTJBOEUnLCdnc2ltbCc6J1xcdTJBOTAnLCdndCc6Jz4nLCdHdCc6J1xcdTIyNkInLCdHVCc6Jz4nLCdndGNjJzonXFx1MkFBNycsJ2d0Y2lyJzonXFx1MkE3QScsJ2d0ZG90JzonXFx1MjJENycsJ2d0bFBhcic6J1xcdTI5OTUnLCdndHF1ZXN0JzonXFx1MkE3QycsJ2d0cmFwcHJveCc6J1xcdTJBODYnLCdndHJhcnInOidcXHUyOTc4JywnZ3RyZG90JzonXFx1MjJENycsJ2d0cmVxbGVzcyc6J1xcdTIyREInLCdndHJlcXFsZXNzJzonXFx1MkE4QycsJ2d0cmxlc3MnOidcXHUyMjc3JywnZ3Ryc2ltJzonXFx1MjI3MycsJ2d2ZXJ0bmVxcSc6J1xcdTIyNjlcXHVGRTAwJywnZ3ZuRSc6J1xcdTIyNjlcXHVGRTAwJywnSGFjZWsnOidcXHUwMkM3JywnaGFpcnNwJzonXFx1MjAwQScsJ2hhbGYnOidcXHhCRCcsJ2hhbWlsdCc6J1xcdTIxMEInLCdoYXJkY3knOidcXHUwNDRBJywnSEFSRGN5JzonXFx1MDQyQScsJ2hhcnInOidcXHUyMTk0JywnaEFycic6J1xcdTIxRDQnLCdoYXJyY2lyJzonXFx1Mjk0OCcsJ2hhcnJ3JzonXFx1MjFBRCcsJ0hhdCc6J14nLCdoYmFyJzonXFx1MjEwRicsJ2hjaXJjJzonXFx1MDEyNScsJ0hjaXJjJzonXFx1MDEyNCcsJ2hlYXJ0cyc6J1xcdTI2NjUnLCdoZWFydHN1aXQnOidcXHUyNjY1JywnaGVsbGlwJzonXFx1MjAyNicsJ2hlcmNvbic6J1xcdTIyQjknLCdoZnInOidcXHVEODM1XFx1REQyNScsJ0hmcic6J1xcdTIxMEMnLCdIaWxiZXJ0U3BhY2UnOidcXHUyMTBCJywnaGtzZWFyb3cnOidcXHUyOTI1JywnaGtzd2Fyb3cnOidcXHUyOTI2JywnaG9hcnInOidcXHUyMUZGJywnaG9tdGh0JzonXFx1MjIzQicsJ2hvb2tsZWZ0YXJyb3cnOidcXHUyMUE5JywnaG9va3JpZ2h0YXJyb3cnOidcXHUyMUFBJywnaG9wZic6J1xcdUQ4MzVcXHVERDU5JywnSG9wZic6J1xcdTIxMEQnLCdob3JiYXInOidcXHUyMDE1JywnSG9yaXpvbnRhbExpbmUnOidcXHUyNTAwJywnaHNjcic6J1xcdUQ4MzVcXHVEQ0JEJywnSHNjcic6J1xcdTIxMEInLCdoc2xhc2gnOidcXHUyMTBGJywnaHN0cm9rJzonXFx1MDEyNycsJ0hzdHJvayc6J1xcdTAxMjYnLCdIdW1wRG93bkh1bXAnOidcXHUyMjRFJywnSHVtcEVxdWFsJzonXFx1MjI0RicsJ2h5YnVsbCc6J1xcdTIwNDMnLCdoeXBoZW4nOidcXHUyMDEwJywnaWFjdXRlJzonXFx4RUQnLCdJYWN1dGUnOidcXHhDRCcsJ2ljJzonXFx1MjA2MycsJ2ljaXJjJzonXFx4RUUnLCdJY2lyYyc6J1xceENFJywnaWN5JzonXFx1MDQzOCcsJ0ljeSc6J1xcdTA0MTgnLCdJZG90JzonXFx1MDEzMCcsJ2llY3knOidcXHUwNDM1JywnSUVjeSc6J1xcdTA0MTUnLCdpZXhjbCc6J1xceEExJywnaWZmJzonXFx1MjFENCcsJ2lmcic6J1xcdUQ4MzVcXHVERDI2JywnSWZyJzonXFx1MjExMScsJ2lncmF2ZSc6J1xceEVDJywnSWdyYXZlJzonXFx4Q0MnLCdpaSc6J1xcdTIxNDgnLCdpaWlpbnQnOidcXHUyQTBDJywnaWlpbnQnOidcXHUyMjJEJywnaWluZmluJzonXFx1MjlEQycsJ2lpb3RhJzonXFx1MjEyOScsJ2lqbGlnJzonXFx1MDEzMycsJ0lKbGlnJzonXFx1MDEzMicsJ0ltJzonXFx1MjExMScsJ2ltYWNyJzonXFx1MDEyQicsJ0ltYWNyJzonXFx1MDEyQScsJ2ltYWdlJzonXFx1MjExMScsJ0ltYWdpbmFyeUknOidcXHUyMTQ4JywnaW1hZ2xpbmUnOidcXHUyMTEwJywnaW1hZ3BhcnQnOidcXHUyMTExJywnaW1hdGgnOidcXHUwMTMxJywnaW1vZic6J1xcdTIyQjcnLCdpbXBlZCc6J1xcdTAxQjUnLCdJbXBsaWVzJzonXFx1MjFEMicsJ2luJzonXFx1MjIwOCcsJ2luY2FyZSc6J1xcdTIxMDUnLCdpbmZpbic6J1xcdTIyMUUnLCdpbmZpbnRpZSc6J1xcdTI5REQnLCdpbm9kb3QnOidcXHUwMTMxJywnaW50JzonXFx1MjIyQicsJ0ludCc6J1xcdTIyMkMnLCdpbnRjYWwnOidcXHUyMkJBJywnaW50ZWdlcnMnOidcXHUyMTI0JywnSW50ZWdyYWwnOidcXHUyMjJCJywnaW50ZXJjYWwnOidcXHUyMkJBJywnSW50ZXJzZWN0aW9uJzonXFx1MjJDMicsJ2ludGxhcmhrJzonXFx1MkExNycsJ2ludHByb2QnOidcXHUyQTNDJywnSW52aXNpYmxlQ29tbWEnOidcXHUyMDYzJywnSW52aXNpYmxlVGltZXMnOidcXHUyMDYyJywnaW9jeSc6J1xcdTA0NTEnLCdJT2N5JzonXFx1MDQwMScsJ2lvZ29uJzonXFx1MDEyRicsJ0lvZ29uJzonXFx1MDEyRScsJ2lvcGYnOidcXHVEODM1XFx1REQ1QScsJ0lvcGYnOidcXHVEODM1XFx1REQ0MCcsJ2lvdGEnOidcXHUwM0I5JywnSW90YSc6J1xcdTAzOTknLCdpcHJvZCc6J1xcdTJBM0MnLCdpcXVlc3QnOidcXHhCRicsJ2lzY3InOidcXHVEODM1XFx1RENCRScsJ0lzY3InOidcXHUyMTEwJywnaXNpbic6J1xcdTIyMDgnLCdpc2luZG90JzonXFx1MjJGNScsJ2lzaW5FJzonXFx1MjJGOScsJ2lzaW5zJzonXFx1MjJGNCcsJ2lzaW5zdic6J1xcdTIyRjMnLCdpc2ludic6J1xcdTIyMDgnLCdpdCc6J1xcdTIwNjInLCdpdGlsZGUnOidcXHUwMTI5JywnSXRpbGRlJzonXFx1MDEyOCcsJ2l1a2N5JzonXFx1MDQ1NicsJ0l1a2N5JzonXFx1MDQwNicsJ2l1bWwnOidcXHhFRicsJ0l1bWwnOidcXHhDRicsJ2pjaXJjJzonXFx1MDEzNScsJ0pjaXJjJzonXFx1MDEzNCcsJ2pjeSc6J1xcdTA0MzknLCdKY3knOidcXHUwNDE5JywnamZyJzonXFx1RDgzNVxcdUREMjcnLCdKZnInOidcXHVEODM1XFx1REQwRCcsJ2ptYXRoJzonXFx1MDIzNycsJ2pvcGYnOidcXHVEODM1XFx1REQ1QicsJ0pvcGYnOidcXHVEODM1XFx1REQ0MScsJ2pzY3InOidcXHVEODM1XFx1RENCRicsJ0pzY3InOidcXHVEODM1XFx1RENBNScsJ2pzZXJjeSc6J1xcdTA0NTgnLCdKc2VyY3knOidcXHUwNDA4JywnanVrY3knOidcXHUwNDU0JywnSnVrY3knOidcXHUwNDA0Jywna2FwcGEnOidcXHUwM0JBJywnS2FwcGEnOidcXHUwMzlBJywna2FwcGF2JzonXFx1MDNGMCcsJ2tjZWRpbCc6J1xcdTAxMzcnLCdLY2VkaWwnOidcXHUwMTM2Jywna2N5JzonXFx1MDQzQScsJ0tjeSc6J1xcdTA0MUEnLCdrZnInOidcXHVEODM1XFx1REQyOCcsJ0tmcic6J1xcdUQ4MzVcXHVERDBFJywna2dyZWVuJzonXFx1MDEzOCcsJ2toY3knOidcXHUwNDQ1JywnS0hjeSc6J1xcdTA0MjUnLCdramN5JzonXFx1MDQ1QycsJ0tKY3knOidcXHUwNDBDJywna29wZic6J1xcdUQ4MzVcXHVERDVDJywnS29wZic6J1xcdUQ4MzVcXHVERDQyJywna3Njcic6J1xcdUQ4MzVcXHVEQ0MwJywnS3Njcic6J1xcdUQ4MzVcXHVEQ0E2JywnbEFhcnInOidcXHUyMURBJywnbGFjdXRlJzonXFx1MDEzQScsJ0xhY3V0ZSc6J1xcdTAxMzknLCdsYWVtcHR5dic6J1xcdTI5QjQnLCdsYWdyYW4nOidcXHUyMTEyJywnbGFtYmRhJzonXFx1MDNCQicsJ0xhbWJkYSc6J1xcdTAzOUInLCdsYW5nJzonXFx1MjdFOCcsJ0xhbmcnOidcXHUyN0VBJywnbGFuZ2QnOidcXHUyOTkxJywnbGFuZ2xlJzonXFx1MjdFOCcsJ2xhcCc6J1xcdTJBODUnLCdMYXBsYWNldHJmJzonXFx1MjExMicsJ2xhcXVvJzonXFx4QUInLCdsYXJyJzonXFx1MjE5MCcsJ2xBcnInOidcXHUyMUQwJywnTGFycic6J1xcdTIxOUUnLCdsYXJyYic6J1xcdTIxRTQnLCdsYXJyYmZzJzonXFx1MjkxRicsJ2xhcnJmcyc6J1xcdTI5MUQnLCdsYXJyaGsnOidcXHUyMUE5JywnbGFycmxwJzonXFx1MjFBQicsJ2xhcnJwbCc6J1xcdTI5MzknLCdsYXJyc2ltJzonXFx1Mjk3MycsJ2xhcnJ0bCc6J1xcdTIxQTInLCdsYXQnOidcXHUyQUFCJywnbGF0YWlsJzonXFx1MjkxOScsJ2xBdGFpbCc6J1xcdTI5MUInLCdsYXRlJzonXFx1MkFBRCcsJ2xhdGVzJzonXFx1MkFBRFxcdUZFMDAnLCdsYmFycic6J1xcdTI5MEMnLCdsQmFycic6J1xcdTI5MEUnLCdsYmJyayc6J1xcdTI3NzInLCdsYnJhY2UnOid7JywnbGJyYWNrJzonWycsJ2xicmtlJzonXFx1Mjk4QicsJ2xicmtzbGQnOidcXHUyOThGJywnbGJya3NsdSc6J1xcdTI5OEQnLCdsY2Fyb24nOidcXHUwMTNFJywnTGNhcm9uJzonXFx1MDEzRCcsJ2xjZWRpbCc6J1xcdTAxM0MnLCdMY2VkaWwnOidcXHUwMTNCJywnbGNlaWwnOidcXHUyMzA4JywnbGN1Yic6J3snLCdsY3knOidcXHUwNDNCJywnTGN5JzonXFx1MDQxQicsJ2xkY2EnOidcXHUyOTM2JywnbGRxdW8nOidcXHUyMDFDJywnbGRxdW9yJzonXFx1MjAxRScsJ2xkcmRoYXInOidcXHUyOTY3JywnbGRydXNoYXInOidcXHUyOTRCJywnbGRzaCc6J1xcdTIxQjInLCdsZSc6J1xcdTIyNjQnLCdsRSc6J1xcdTIyNjYnLCdMZWZ0QW5nbGVCcmFja2V0JzonXFx1MjdFOCcsJ2xlZnRhcnJvdyc6J1xcdTIxOTAnLCdMZWZ0YXJyb3cnOidcXHUyMUQwJywnTGVmdEFycm93JzonXFx1MjE5MCcsJ0xlZnRBcnJvd0Jhcic6J1xcdTIxRTQnLCdMZWZ0QXJyb3dSaWdodEFycm93JzonXFx1MjFDNicsJ2xlZnRhcnJvd3RhaWwnOidcXHUyMUEyJywnTGVmdENlaWxpbmcnOidcXHUyMzA4JywnTGVmdERvdWJsZUJyYWNrZXQnOidcXHUyN0U2JywnTGVmdERvd25UZWVWZWN0b3InOidcXHUyOTYxJywnTGVmdERvd25WZWN0b3InOidcXHUyMUMzJywnTGVmdERvd25WZWN0b3JCYXInOidcXHUyOTU5JywnTGVmdEZsb29yJzonXFx1MjMwQScsJ2xlZnRoYXJwb29uZG93bic6J1xcdTIxQkQnLCdsZWZ0aGFycG9vbnVwJzonXFx1MjFCQycsJ2xlZnRsZWZ0YXJyb3dzJzonXFx1MjFDNycsJ2xlZnRyaWdodGFycm93JzonXFx1MjE5NCcsJ0xlZnRyaWdodGFycm93JzonXFx1MjFENCcsJ0xlZnRSaWdodEFycm93JzonXFx1MjE5NCcsJ2xlZnRyaWdodGFycm93cyc6J1xcdTIxQzYnLCdsZWZ0cmlnaHRoYXJwb29ucyc6J1xcdTIxQ0InLCdsZWZ0cmlnaHRzcXVpZ2Fycm93JzonXFx1MjFBRCcsJ0xlZnRSaWdodFZlY3Rvcic6J1xcdTI5NEUnLCdMZWZ0VGVlJzonXFx1MjJBMycsJ0xlZnRUZWVBcnJvdyc6J1xcdTIxQTQnLCdMZWZ0VGVlVmVjdG9yJzonXFx1Mjk1QScsJ2xlZnR0aHJlZXRpbWVzJzonXFx1MjJDQicsJ0xlZnRUcmlhbmdsZSc6J1xcdTIyQjInLCdMZWZ0VHJpYW5nbGVCYXInOidcXHUyOUNGJywnTGVmdFRyaWFuZ2xlRXF1YWwnOidcXHUyMkI0JywnTGVmdFVwRG93blZlY3Rvcic6J1xcdTI5NTEnLCdMZWZ0VXBUZWVWZWN0b3InOidcXHUyOTYwJywnTGVmdFVwVmVjdG9yJzonXFx1MjFCRicsJ0xlZnRVcFZlY3RvckJhcic6J1xcdTI5NTgnLCdMZWZ0VmVjdG9yJzonXFx1MjFCQycsJ0xlZnRWZWN0b3JCYXInOidcXHUyOTUyJywnbGVnJzonXFx1MjJEQScsJ2xFZyc6J1xcdTJBOEInLCdsZXEnOidcXHUyMjY0JywnbGVxcSc6J1xcdTIyNjYnLCdsZXFzbGFudCc6J1xcdTJBN0QnLCdsZXMnOidcXHUyQTdEJywnbGVzY2MnOidcXHUyQUE4JywnbGVzZG90JzonXFx1MkE3RicsJ2xlc2RvdG8nOidcXHUyQTgxJywnbGVzZG90b3InOidcXHUyQTgzJywnbGVzZyc6J1xcdTIyREFcXHVGRTAwJywnbGVzZ2VzJzonXFx1MkE5MycsJ2xlc3NhcHByb3gnOidcXHUyQTg1JywnbGVzc2RvdCc6J1xcdTIyRDYnLCdsZXNzZXFndHInOidcXHUyMkRBJywnbGVzc2VxcWd0cic6J1xcdTJBOEInLCdMZXNzRXF1YWxHcmVhdGVyJzonXFx1MjJEQScsJ0xlc3NGdWxsRXF1YWwnOidcXHUyMjY2JywnTGVzc0dyZWF0ZXInOidcXHUyMjc2JywnbGVzc2d0cic6J1xcdTIyNzYnLCdMZXNzTGVzcyc6J1xcdTJBQTEnLCdsZXNzc2ltJzonXFx1MjI3MicsJ0xlc3NTbGFudEVxdWFsJzonXFx1MkE3RCcsJ0xlc3NUaWxkZSc6J1xcdTIyNzInLCdsZmlzaHQnOidcXHUyOTdDJywnbGZsb29yJzonXFx1MjMwQScsJ2xmcic6J1xcdUQ4MzVcXHVERDI5JywnTGZyJzonXFx1RDgzNVxcdUREMEYnLCdsZyc6J1xcdTIyNzYnLCdsZ0UnOidcXHUyQTkxJywnbEhhcic6J1xcdTI5NjInLCdsaGFyZCc6J1xcdTIxQkQnLCdsaGFydSc6J1xcdTIxQkMnLCdsaGFydWwnOidcXHUyOTZBJywnbGhibGsnOidcXHUyNTg0JywnbGpjeSc6J1xcdTA0NTknLCdMSmN5JzonXFx1MDQwOScsJ2xsJzonXFx1MjI2QScsJ0xsJzonXFx1MjJEOCcsJ2xsYXJyJzonXFx1MjFDNycsJ2xsY29ybmVyJzonXFx1MjMxRScsJ0xsZWZ0YXJyb3cnOidcXHUyMURBJywnbGxoYXJkJzonXFx1Mjk2QicsJ2xsdHJpJzonXFx1MjVGQScsJ2xtaWRvdCc6J1xcdTAxNDAnLCdMbWlkb3QnOidcXHUwMTNGJywnbG1vdXN0JzonXFx1MjNCMCcsJ2xtb3VzdGFjaGUnOidcXHUyM0IwJywnbG5hcCc6J1xcdTJBODknLCdsbmFwcHJveCc6J1xcdTJBODknLCdsbmUnOidcXHUyQTg3JywnbG5FJzonXFx1MjI2OCcsJ2xuZXEnOidcXHUyQTg3JywnbG5lcXEnOidcXHUyMjY4JywnbG5zaW0nOidcXHUyMkU2JywnbG9hbmcnOidcXHUyN0VDJywnbG9hcnInOidcXHUyMUZEJywnbG9icmsnOidcXHUyN0U2JywnbG9uZ2xlZnRhcnJvdyc6J1xcdTI3RjUnLCdMb25nbGVmdGFycm93JzonXFx1MjdGOCcsJ0xvbmdMZWZ0QXJyb3cnOidcXHUyN0Y1JywnbG9uZ2xlZnRyaWdodGFycm93JzonXFx1MjdGNycsJ0xvbmdsZWZ0cmlnaHRhcnJvdyc6J1xcdTI3RkEnLCdMb25nTGVmdFJpZ2h0QXJyb3cnOidcXHUyN0Y3JywnbG9uZ21hcHN0byc6J1xcdTI3RkMnLCdsb25ncmlnaHRhcnJvdyc6J1xcdTI3RjYnLCdMb25ncmlnaHRhcnJvdyc6J1xcdTI3RjknLCdMb25nUmlnaHRBcnJvdyc6J1xcdTI3RjYnLCdsb29wYXJyb3dsZWZ0JzonXFx1MjFBQicsJ2xvb3BhcnJvd3JpZ2h0JzonXFx1MjFBQycsJ2xvcGFyJzonXFx1Mjk4NScsJ2xvcGYnOidcXHVEODM1XFx1REQ1RCcsJ0xvcGYnOidcXHVEODM1XFx1REQ0MycsJ2xvcGx1cyc6J1xcdTJBMkQnLCdsb3RpbWVzJzonXFx1MkEzNCcsJ2xvd2FzdCc6J1xcdTIyMTcnLCdsb3diYXInOidfJywnTG93ZXJMZWZ0QXJyb3cnOidcXHUyMTk5JywnTG93ZXJSaWdodEFycm93JzonXFx1MjE5OCcsJ2xveic6J1xcdTI1Q0EnLCdsb3plbmdlJzonXFx1MjVDQScsJ2xvemYnOidcXHUyOUVCJywnbHBhcic6JygnLCdscGFybHQnOidcXHUyOTkzJywnbHJhcnInOidcXHUyMUM2JywnbHJjb3JuZXInOidcXHUyMzFGJywnbHJoYXInOidcXHUyMUNCJywnbHJoYXJkJzonXFx1Mjk2RCcsJ2xybSc6J1xcdTIwMEUnLCdscnRyaSc6J1xcdTIyQkYnLCdsc2FxdW8nOidcXHUyMDM5JywnbHNjcic6J1xcdUQ4MzVcXHVEQ0MxJywnTHNjcic6J1xcdTIxMTInLCdsc2gnOidcXHUyMUIwJywnTHNoJzonXFx1MjFCMCcsJ2xzaW0nOidcXHUyMjcyJywnbHNpbWUnOidcXHUyQThEJywnbHNpbWcnOidcXHUyQThGJywnbHNxYic6J1snLCdsc3F1byc6J1xcdTIwMTgnLCdsc3F1b3InOidcXHUyMDFBJywnbHN0cm9rJzonXFx1MDE0MicsJ0xzdHJvayc6J1xcdTAxNDEnLCdsdCc6JzwnLCdMdCc6J1xcdTIyNkEnLCdMVCc6JzwnLCdsdGNjJzonXFx1MkFBNicsJ2x0Y2lyJzonXFx1MkE3OScsJ2x0ZG90JzonXFx1MjJENicsJ2x0aHJlZSc6J1xcdTIyQ0InLCdsdGltZXMnOidcXHUyMkM5JywnbHRsYXJyJzonXFx1Mjk3NicsJ2x0cXVlc3QnOidcXHUyQTdCJywnbHRyaSc6J1xcdTI1QzMnLCdsdHJpZSc6J1xcdTIyQjQnLCdsdHJpZic6J1xcdTI1QzInLCdsdHJQYXInOidcXHUyOTk2JywnbHVyZHNoYXInOidcXHUyOTRBJywnbHVydWhhcic6J1xcdTI5NjYnLCdsdmVydG5lcXEnOidcXHUyMjY4XFx1RkUwMCcsJ2x2bkUnOidcXHUyMjY4XFx1RkUwMCcsJ21hY3InOidcXHhBRicsJ21hbGUnOidcXHUyNjQyJywnbWFsdCc6J1xcdTI3MjAnLCdtYWx0ZXNlJzonXFx1MjcyMCcsJ21hcCc6J1xcdTIxQTYnLCdNYXAnOidcXHUyOTA1JywnbWFwc3RvJzonXFx1MjFBNicsJ21hcHN0b2Rvd24nOidcXHUyMUE3JywnbWFwc3RvbGVmdCc6J1xcdTIxQTQnLCdtYXBzdG91cCc6J1xcdTIxQTUnLCdtYXJrZXInOidcXHUyNUFFJywnbWNvbW1hJzonXFx1MkEyOScsJ21jeSc6J1xcdTA0M0MnLCdNY3knOidcXHUwNDFDJywnbWRhc2gnOidcXHUyMDE0JywnbUREb3QnOidcXHUyMjNBJywnbWVhc3VyZWRhbmdsZSc6J1xcdTIyMjEnLCdNZWRpdW1TcGFjZSc6J1xcdTIwNUYnLCdNZWxsaW50cmYnOidcXHUyMTMzJywnbWZyJzonXFx1RDgzNVxcdUREMkEnLCdNZnInOidcXHVEODM1XFx1REQxMCcsJ21obyc6J1xcdTIxMjcnLCdtaWNybyc6J1xceEI1JywnbWlkJzonXFx1MjIyMycsJ21pZGFzdCc6JyonLCdtaWRjaXInOidcXHUyQUYwJywnbWlkZG90JzonXFx4QjcnLCdtaW51cyc6J1xcdTIyMTInLCdtaW51c2InOidcXHUyMjlGJywnbWludXNkJzonXFx1MjIzOCcsJ21pbnVzZHUnOidcXHUyQTJBJywnTWludXNQbHVzJzonXFx1MjIxMycsJ21sY3AnOidcXHUyQURCJywnbWxkcic6J1xcdTIwMjYnLCdtbnBsdXMnOidcXHUyMjEzJywnbW9kZWxzJzonXFx1MjJBNycsJ21vcGYnOidcXHVEODM1XFx1REQ1RScsJ01vcGYnOidcXHVEODM1XFx1REQ0NCcsJ21wJzonXFx1MjIxMycsJ21zY3InOidcXHVEODM1XFx1RENDMicsJ01zY3InOidcXHUyMTMzJywnbXN0cG9zJzonXFx1MjIzRScsJ211JzonXFx1MDNCQycsJ011JzonXFx1MDM5QycsJ211bHRpbWFwJzonXFx1MjJCOCcsJ211bWFwJzonXFx1MjJCOCcsJ25hYmxhJzonXFx1MjIwNycsJ25hY3V0ZSc6J1xcdTAxNDQnLCdOYWN1dGUnOidcXHUwMTQzJywnbmFuZyc6J1xcdTIyMjBcXHUyMEQyJywnbmFwJzonXFx1MjI0OScsJ25hcEUnOidcXHUyQTcwXFx1MDMzOCcsJ25hcGlkJzonXFx1MjI0QlxcdTAzMzgnLCduYXBvcyc6J1xcdTAxNDknLCduYXBwcm94JzonXFx1MjI0OScsJ25hdHVyJzonXFx1MjY2RScsJ25hdHVyYWwnOidcXHUyNjZFJywnbmF0dXJhbHMnOidcXHUyMTE1JywnbmJzcCc6J1xceEEwJywnbmJ1bXAnOidcXHUyMjRFXFx1MDMzOCcsJ25idW1wZSc6J1xcdTIyNEZcXHUwMzM4JywnbmNhcCc6J1xcdTJBNDMnLCduY2Fyb24nOidcXHUwMTQ4JywnTmNhcm9uJzonXFx1MDE0NycsJ25jZWRpbCc6J1xcdTAxNDYnLCdOY2VkaWwnOidcXHUwMTQ1JywnbmNvbmcnOidcXHUyMjQ3JywnbmNvbmdkb3QnOidcXHUyQTZEXFx1MDMzOCcsJ25jdXAnOidcXHUyQTQyJywnbmN5JzonXFx1MDQzRCcsJ05jeSc6J1xcdTA0MUQnLCduZGFzaCc6J1xcdTIwMTMnLCduZSc6J1xcdTIyNjAnLCduZWFyaGsnOidcXHUyOTI0JywnbmVhcnInOidcXHUyMTk3JywnbmVBcnInOidcXHUyMUQ3JywnbmVhcnJvdyc6J1xcdTIxOTcnLCduZWRvdCc6J1xcdTIyNTBcXHUwMzM4JywnTmVnYXRpdmVNZWRpdW1TcGFjZSc6J1xcdTIwMEInLCdOZWdhdGl2ZVRoaWNrU3BhY2UnOidcXHUyMDBCJywnTmVnYXRpdmVUaGluU3BhY2UnOidcXHUyMDBCJywnTmVnYXRpdmVWZXJ5VGhpblNwYWNlJzonXFx1MjAwQicsJ25lcXVpdic6J1xcdTIyNjInLCduZXNlYXInOidcXHUyOTI4JywnbmVzaW0nOidcXHUyMjQyXFx1MDMzOCcsJ05lc3RlZEdyZWF0ZXJHcmVhdGVyJzonXFx1MjI2QicsJ05lc3RlZExlc3NMZXNzJzonXFx1MjI2QScsJ05ld0xpbmUnOidcXG4nLCduZXhpc3QnOidcXHUyMjA0JywnbmV4aXN0cyc6J1xcdTIyMDQnLCduZnInOidcXHVEODM1XFx1REQyQicsJ05mcic6J1xcdUQ4MzVcXHVERDExJywnbmdlJzonXFx1MjI3MScsJ25nRSc6J1xcdTIyNjdcXHUwMzM4JywnbmdlcSc6J1xcdTIyNzEnLCduZ2VxcSc6J1xcdTIyNjdcXHUwMzM4JywnbmdlcXNsYW50JzonXFx1MkE3RVxcdTAzMzgnLCduZ2VzJzonXFx1MkE3RVxcdTAzMzgnLCduR2cnOidcXHUyMkQ5XFx1MDMzOCcsJ25nc2ltJzonXFx1MjI3NScsJ25ndCc6J1xcdTIyNkYnLCduR3QnOidcXHUyMjZCXFx1MjBEMicsJ25ndHInOidcXHUyMjZGJywnbkd0dic6J1xcdTIyNkJcXHUwMzM4JywnbmhhcnInOidcXHUyMUFFJywnbmhBcnInOidcXHUyMUNFJywnbmhwYXInOidcXHUyQUYyJywnbmknOidcXHUyMjBCJywnbmlzJzonXFx1MjJGQycsJ25pc2QnOidcXHUyMkZBJywnbml2JzonXFx1MjIwQicsJ25qY3knOidcXHUwNDVBJywnTkpjeSc6J1xcdTA0MEEnLCdubGFycic6J1xcdTIxOUEnLCdubEFycic6J1xcdTIxQ0QnLCdubGRyJzonXFx1MjAyNScsJ25sZSc6J1xcdTIyNzAnLCdubEUnOidcXHUyMjY2XFx1MDMzOCcsJ25sZWZ0YXJyb3cnOidcXHUyMTlBJywnbkxlZnRhcnJvdyc6J1xcdTIxQ0QnLCdubGVmdHJpZ2h0YXJyb3cnOidcXHUyMUFFJywnbkxlZnRyaWdodGFycm93JzonXFx1MjFDRScsJ25sZXEnOidcXHUyMjcwJywnbmxlcXEnOidcXHUyMjY2XFx1MDMzOCcsJ25sZXFzbGFudCc6J1xcdTJBN0RcXHUwMzM4Jywnbmxlcyc6J1xcdTJBN0RcXHUwMzM4Jywnbmxlc3MnOidcXHUyMjZFJywnbkxsJzonXFx1MjJEOFxcdTAzMzgnLCdubHNpbSc6J1xcdTIyNzQnLCdubHQnOidcXHUyMjZFJywnbkx0JzonXFx1MjI2QVxcdTIwRDInLCdubHRyaSc6J1xcdTIyRUEnLCdubHRyaWUnOidcXHUyMkVDJywnbkx0dic6J1xcdTIyNkFcXHUwMzM4Jywnbm1pZCc6J1xcdTIyMjQnLCdOb0JyZWFrJzonXFx1MjA2MCcsJ05vbkJyZWFraW5nU3BhY2UnOidcXHhBMCcsJ25vcGYnOidcXHVEODM1XFx1REQ1RicsJ05vcGYnOidcXHUyMTE1Jywnbm90JzonXFx4QUMnLCdOb3QnOidcXHUyQUVDJywnTm90Q29uZ3J1ZW50JzonXFx1MjI2MicsJ05vdEN1cENhcCc6J1xcdTIyNkQnLCdOb3REb3VibGVWZXJ0aWNhbEJhcic6J1xcdTIyMjYnLCdOb3RFbGVtZW50JzonXFx1MjIwOScsJ05vdEVxdWFsJzonXFx1MjI2MCcsJ05vdEVxdWFsVGlsZGUnOidcXHUyMjQyXFx1MDMzOCcsJ05vdEV4aXN0cyc6J1xcdTIyMDQnLCdOb3RHcmVhdGVyJzonXFx1MjI2RicsJ05vdEdyZWF0ZXJFcXVhbCc6J1xcdTIyNzEnLCdOb3RHcmVhdGVyRnVsbEVxdWFsJzonXFx1MjI2N1xcdTAzMzgnLCdOb3RHcmVhdGVyR3JlYXRlcic6J1xcdTIyNkJcXHUwMzM4JywnTm90R3JlYXRlckxlc3MnOidcXHUyMjc5JywnTm90R3JlYXRlclNsYW50RXF1YWwnOidcXHUyQTdFXFx1MDMzOCcsJ05vdEdyZWF0ZXJUaWxkZSc6J1xcdTIyNzUnLCdOb3RIdW1wRG93bkh1bXAnOidcXHUyMjRFXFx1MDMzOCcsJ05vdEh1bXBFcXVhbCc6J1xcdTIyNEZcXHUwMzM4Jywnbm90aW4nOidcXHUyMjA5Jywnbm90aW5kb3QnOidcXHUyMkY1XFx1MDMzOCcsJ25vdGluRSc6J1xcdTIyRjlcXHUwMzM4Jywnbm90aW52YSc6J1xcdTIyMDknLCdub3RpbnZiJzonXFx1MjJGNycsJ25vdGludmMnOidcXHUyMkY2JywnTm90TGVmdFRyaWFuZ2xlJzonXFx1MjJFQScsJ05vdExlZnRUcmlhbmdsZUJhcic6J1xcdTI5Q0ZcXHUwMzM4JywnTm90TGVmdFRyaWFuZ2xlRXF1YWwnOidcXHUyMkVDJywnTm90TGVzcyc6J1xcdTIyNkUnLCdOb3RMZXNzRXF1YWwnOidcXHUyMjcwJywnTm90TGVzc0dyZWF0ZXInOidcXHUyMjc4JywnTm90TGVzc0xlc3MnOidcXHUyMjZBXFx1MDMzOCcsJ05vdExlc3NTbGFudEVxdWFsJzonXFx1MkE3RFxcdTAzMzgnLCdOb3RMZXNzVGlsZGUnOidcXHUyMjc0JywnTm90TmVzdGVkR3JlYXRlckdyZWF0ZXInOidcXHUyQUEyXFx1MDMzOCcsJ05vdE5lc3RlZExlc3NMZXNzJzonXFx1MkFBMVxcdTAzMzgnLCdub3RuaSc6J1xcdTIyMEMnLCdub3RuaXZhJzonXFx1MjIwQycsJ25vdG5pdmInOidcXHUyMkZFJywnbm90bml2Yyc6J1xcdTIyRkQnLCdOb3RQcmVjZWRlcyc6J1xcdTIyODAnLCdOb3RQcmVjZWRlc0VxdWFsJzonXFx1MkFBRlxcdTAzMzgnLCdOb3RQcmVjZWRlc1NsYW50RXF1YWwnOidcXHUyMkUwJywnTm90UmV2ZXJzZUVsZW1lbnQnOidcXHUyMjBDJywnTm90UmlnaHRUcmlhbmdsZSc6J1xcdTIyRUInLCdOb3RSaWdodFRyaWFuZ2xlQmFyJzonXFx1MjlEMFxcdTAzMzgnLCdOb3RSaWdodFRyaWFuZ2xlRXF1YWwnOidcXHUyMkVEJywnTm90U3F1YXJlU3Vic2V0JzonXFx1MjI4RlxcdTAzMzgnLCdOb3RTcXVhcmVTdWJzZXRFcXVhbCc6J1xcdTIyRTInLCdOb3RTcXVhcmVTdXBlcnNldCc6J1xcdTIyOTBcXHUwMzM4JywnTm90U3F1YXJlU3VwZXJzZXRFcXVhbCc6J1xcdTIyRTMnLCdOb3RTdWJzZXQnOidcXHUyMjgyXFx1MjBEMicsJ05vdFN1YnNldEVxdWFsJzonXFx1MjI4OCcsJ05vdFN1Y2NlZWRzJzonXFx1MjI4MScsJ05vdFN1Y2NlZWRzRXF1YWwnOidcXHUyQUIwXFx1MDMzOCcsJ05vdFN1Y2NlZWRzU2xhbnRFcXVhbCc6J1xcdTIyRTEnLCdOb3RTdWNjZWVkc1RpbGRlJzonXFx1MjI3RlxcdTAzMzgnLCdOb3RTdXBlcnNldCc6J1xcdTIyODNcXHUyMEQyJywnTm90U3VwZXJzZXRFcXVhbCc6J1xcdTIyODknLCdOb3RUaWxkZSc6J1xcdTIyNDEnLCdOb3RUaWxkZUVxdWFsJzonXFx1MjI0NCcsJ05vdFRpbGRlRnVsbEVxdWFsJzonXFx1MjI0NycsJ05vdFRpbGRlVGlsZGUnOidcXHUyMjQ5JywnTm90VmVydGljYWxCYXInOidcXHUyMjI0JywnbnBhcic6J1xcdTIyMjYnLCducGFyYWxsZWwnOidcXHUyMjI2JywnbnBhcnNsJzonXFx1MkFGRFxcdTIwRTUnLCducGFydCc6J1xcdTIyMDJcXHUwMzM4JywnbnBvbGludCc6J1xcdTJBMTQnLCducHInOidcXHUyMjgwJywnbnByY3VlJzonXFx1MjJFMCcsJ25wcmUnOidcXHUyQUFGXFx1MDMzOCcsJ25wcmVjJzonXFx1MjI4MCcsJ25wcmVjZXEnOidcXHUyQUFGXFx1MDMzOCcsJ25yYXJyJzonXFx1MjE5QicsJ25yQXJyJzonXFx1MjFDRicsJ25yYXJyYyc6J1xcdTI5MzNcXHUwMzM4JywnbnJhcnJ3JzonXFx1MjE5RFxcdTAzMzgnLCducmlnaHRhcnJvdyc6J1xcdTIxOUInLCduUmlnaHRhcnJvdyc6J1xcdTIxQ0YnLCducnRyaSc6J1xcdTIyRUInLCducnRyaWUnOidcXHUyMkVEJywnbnNjJzonXFx1MjI4MScsJ25zY2N1ZSc6J1xcdTIyRTEnLCduc2NlJzonXFx1MkFCMFxcdTAzMzgnLCduc2NyJzonXFx1RDgzNVxcdURDQzMnLCdOc2NyJzonXFx1RDgzNVxcdURDQTknLCduc2hvcnRtaWQnOidcXHUyMjI0JywnbnNob3J0cGFyYWxsZWwnOidcXHUyMjI2JywnbnNpbSc6J1xcdTIyNDEnLCduc2ltZSc6J1xcdTIyNDQnLCduc2ltZXEnOidcXHUyMjQ0JywnbnNtaWQnOidcXHUyMjI0JywnbnNwYXInOidcXHUyMjI2JywnbnNxc3ViZSc6J1xcdTIyRTInLCduc3FzdXBlJzonXFx1MjJFMycsJ25zdWInOidcXHUyMjg0JywnbnN1YmUnOidcXHUyMjg4JywnbnN1YkUnOidcXHUyQUM1XFx1MDMzOCcsJ25zdWJzZXQnOidcXHUyMjgyXFx1MjBEMicsJ25zdWJzZXRlcSc6J1xcdTIyODgnLCduc3Vic2V0ZXFxJzonXFx1MkFDNVxcdTAzMzgnLCduc3VjYyc6J1xcdTIyODEnLCduc3VjY2VxJzonXFx1MkFCMFxcdTAzMzgnLCduc3VwJzonXFx1MjI4NScsJ25zdXBlJzonXFx1MjI4OScsJ25zdXBFJzonXFx1MkFDNlxcdTAzMzgnLCduc3Vwc2V0JzonXFx1MjI4M1xcdTIwRDInLCduc3Vwc2V0ZXEnOidcXHUyMjg5JywnbnN1cHNldGVxcSc6J1xcdTJBQzZcXHUwMzM4JywnbnRnbCc6J1xcdTIyNzknLCdudGlsZGUnOidcXHhGMScsJ050aWxkZSc6J1xceEQxJywnbnRsZyc6J1xcdTIyNzgnLCdudHJpYW5nbGVsZWZ0JzonXFx1MjJFQScsJ250cmlhbmdsZWxlZnRlcSc6J1xcdTIyRUMnLCdudHJpYW5nbGVyaWdodCc6J1xcdTIyRUInLCdudHJpYW5nbGVyaWdodGVxJzonXFx1MjJFRCcsJ251JzonXFx1MDNCRCcsJ051JzonXFx1MDM5RCcsJ251bSc6JyMnLCdudW1lcm8nOidcXHUyMTE2JywnbnVtc3AnOidcXHUyMDA3JywnbnZhcCc6J1xcdTIyNERcXHUyMEQyJywnbnZkYXNoJzonXFx1MjJBQycsJ252RGFzaCc6J1xcdTIyQUQnLCduVmRhc2gnOidcXHUyMkFFJywnblZEYXNoJzonXFx1MjJBRicsJ252Z2UnOidcXHUyMjY1XFx1MjBEMicsJ252Z3QnOic+XFx1MjBEMicsJ252SGFycic6J1xcdTI5MDQnLCdudmluZmluJzonXFx1MjlERScsJ252bEFycic6J1xcdTI5MDInLCdudmxlJzonXFx1MjI2NFxcdTIwRDInLCdudmx0JzonPFxcdTIwRDInLCdudmx0cmllJzonXFx1MjJCNFxcdTIwRDInLCdudnJBcnInOidcXHUyOTAzJywnbnZydHJpZSc6J1xcdTIyQjVcXHUyMEQyJywnbnZzaW0nOidcXHUyMjNDXFx1MjBEMicsJ253YXJoayc6J1xcdTI5MjMnLCdud2Fycic6J1xcdTIxOTYnLCdud0Fycic6J1xcdTIxRDYnLCdud2Fycm93JzonXFx1MjE5NicsJ253bmVhcic6J1xcdTI5MjcnLCdvYWN1dGUnOidcXHhGMycsJ09hY3V0ZSc6J1xceEQzJywnb2FzdCc6J1xcdTIyOUInLCdvY2lyJzonXFx1MjI5QScsJ29jaXJjJzonXFx4RjQnLCdPY2lyYyc6J1xceEQ0Jywnb2N5JzonXFx1MDQzRScsJ09jeSc6J1xcdTA0MUUnLCdvZGFzaCc6J1xcdTIyOUQnLCdvZGJsYWMnOidcXHUwMTUxJywnT2RibGFjJzonXFx1MDE1MCcsJ29kaXYnOidcXHUyQTM4Jywnb2RvdCc6J1xcdTIyOTknLCdvZHNvbGQnOidcXHUyOUJDJywnb2VsaWcnOidcXHUwMTUzJywnT0VsaWcnOidcXHUwMTUyJywnb2ZjaXInOidcXHUyOUJGJywnb2ZyJzonXFx1RDgzNVxcdUREMkMnLCdPZnInOidcXHVEODM1XFx1REQxMicsJ29nb24nOidcXHUwMkRCJywnb2dyYXZlJzonXFx4RjInLCdPZ3JhdmUnOidcXHhEMicsJ29ndCc6J1xcdTI5QzEnLCdvaGJhcic6J1xcdTI5QjUnLCdvaG0nOidcXHUwM0E5Jywnb2ludCc6J1xcdTIyMkUnLCdvbGFycic6J1xcdTIxQkEnLCdvbGNpcic6J1xcdTI5QkUnLCdvbGNyb3NzJzonXFx1MjlCQicsJ29saW5lJzonXFx1MjAzRScsJ29sdCc6J1xcdTI5QzAnLCdvbWFjcic6J1xcdTAxNEQnLCdPbWFjcic6J1xcdTAxNEMnLCdvbWVnYSc6J1xcdTAzQzknLCdPbWVnYSc6J1xcdTAzQTknLCdvbWljcm9uJzonXFx1MDNCRicsJ09taWNyb24nOidcXHUwMzlGJywnb21pZCc6J1xcdTI5QjYnLCdvbWludXMnOidcXHUyMjk2Jywnb29wZic6J1xcdUQ4MzVcXHVERDYwJywnT29wZic6J1xcdUQ4MzVcXHVERDQ2Jywnb3Bhcic6J1xcdTI5QjcnLCdPcGVuQ3VybHlEb3VibGVRdW90ZSc6J1xcdTIwMUMnLCdPcGVuQ3VybHlRdW90ZSc6J1xcdTIwMTgnLCdvcGVycCc6J1xcdTI5QjknLCdvcGx1cyc6J1xcdTIyOTUnLCdvcic6J1xcdTIyMjgnLCdPcic6J1xcdTJBNTQnLCdvcmFycic6J1xcdTIxQkInLCdvcmQnOidcXHUyQTVEJywnb3JkZXInOidcXHUyMTM0Jywnb3JkZXJvZic6J1xcdTIxMzQnLCdvcmRmJzonXFx4QUEnLCdvcmRtJzonXFx4QkEnLCdvcmlnb2YnOidcXHUyMkI2Jywnb3Jvcic6J1xcdTJBNTYnLCdvcnNsb3BlJzonXFx1MkE1NycsJ29ydic6J1xcdTJBNUInLCdvUyc6J1xcdTI0QzgnLCdvc2NyJzonXFx1MjEzNCcsJ09zY3InOidcXHVEODM1XFx1RENBQScsJ29zbGFzaCc6J1xceEY4JywnT3NsYXNoJzonXFx4RDgnLCdvc29sJzonXFx1MjI5OCcsJ290aWxkZSc6J1xceEY1JywnT3RpbGRlJzonXFx4RDUnLCdvdGltZXMnOidcXHUyMjk3JywnT3RpbWVzJzonXFx1MkEzNycsJ290aW1lc2FzJzonXFx1MkEzNicsJ291bWwnOidcXHhGNicsJ091bWwnOidcXHhENicsJ292YmFyJzonXFx1MjMzRCcsJ092ZXJCYXInOidcXHUyMDNFJywnT3ZlckJyYWNlJzonXFx1MjNERScsJ092ZXJCcmFja2V0JzonXFx1MjNCNCcsJ092ZXJQYXJlbnRoZXNpcyc6J1xcdTIzREMnLCdwYXInOidcXHUyMjI1JywncGFyYSc6J1xceEI2JywncGFyYWxsZWwnOidcXHUyMjI1JywncGFyc2ltJzonXFx1MkFGMycsJ3BhcnNsJzonXFx1MkFGRCcsJ3BhcnQnOidcXHUyMjAyJywnUGFydGlhbEQnOidcXHUyMjAyJywncGN5JzonXFx1MDQzRicsJ1BjeSc6J1xcdTA0MUYnLCdwZXJjbnQnOiclJywncGVyaW9kJzonLicsJ3Blcm1pbCc6J1xcdTIwMzAnLCdwZXJwJzonXFx1MjJBNScsJ3BlcnRlbmsnOidcXHUyMDMxJywncGZyJzonXFx1RDgzNVxcdUREMkQnLCdQZnInOidcXHVEODM1XFx1REQxMycsJ3BoaSc6J1xcdTAzQzYnLCdQaGknOidcXHUwM0E2JywncGhpdic6J1xcdTAzRDUnLCdwaG1tYXQnOidcXHUyMTMzJywncGhvbmUnOidcXHUyNjBFJywncGknOidcXHUwM0MwJywnUGknOidcXHUwM0EwJywncGl0Y2hmb3JrJzonXFx1MjJENCcsJ3Bpdic6J1xcdTAzRDYnLCdwbGFuY2snOidcXHUyMTBGJywncGxhbmNraCc6J1xcdTIxMEUnLCdwbGFua3YnOidcXHUyMTBGJywncGx1cyc6JysnLCdwbHVzYWNpcic6J1xcdTJBMjMnLCdwbHVzYic6J1xcdTIyOUUnLCdwbHVzY2lyJzonXFx1MkEyMicsJ3BsdXNkbyc6J1xcdTIyMTQnLCdwbHVzZHUnOidcXHUyQTI1JywncGx1c2UnOidcXHUyQTcyJywnUGx1c01pbnVzJzonXFx4QjEnLCdwbHVzbW4nOidcXHhCMScsJ3BsdXNzaW0nOidcXHUyQTI2JywncGx1c3R3byc6J1xcdTJBMjcnLCdwbSc6J1xceEIxJywnUG9pbmNhcmVwbGFuZSc6J1xcdTIxMEMnLCdwb2ludGludCc6J1xcdTJBMTUnLCdwb3BmJzonXFx1RDgzNVxcdURENjEnLCdQb3BmJzonXFx1MjExOScsJ3BvdW5kJzonXFx4QTMnLCdwcic6J1xcdTIyN0EnLCdQcic6J1xcdTJBQkInLCdwcmFwJzonXFx1MkFCNycsJ3ByY3VlJzonXFx1MjI3QycsJ3ByZSc6J1xcdTJBQUYnLCdwckUnOidcXHUyQUIzJywncHJlYyc6J1xcdTIyN0EnLCdwcmVjYXBwcm94JzonXFx1MkFCNycsJ3ByZWNjdXJseWVxJzonXFx1MjI3QycsJ1ByZWNlZGVzJzonXFx1MjI3QScsJ1ByZWNlZGVzRXF1YWwnOidcXHUyQUFGJywnUHJlY2VkZXNTbGFudEVxdWFsJzonXFx1MjI3QycsJ1ByZWNlZGVzVGlsZGUnOidcXHUyMjdFJywncHJlY2VxJzonXFx1MkFBRicsJ3ByZWNuYXBwcm94JzonXFx1MkFCOScsJ3ByZWNuZXFxJzonXFx1MkFCNScsJ3ByZWNuc2ltJzonXFx1MjJFOCcsJ3ByZWNzaW0nOidcXHUyMjdFJywncHJpbWUnOidcXHUyMDMyJywnUHJpbWUnOidcXHUyMDMzJywncHJpbWVzJzonXFx1MjExOScsJ3BybmFwJzonXFx1MkFCOScsJ3BybkUnOidcXHUyQUI1JywncHJuc2ltJzonXFx1MjJFOCcsJ3Byb2QnOidcXHUyMjBGJywnUHJvZHVjdCc6J1xcdTIyMEYnLCdwcm9mYWxhcic6J1xcdTIzMkUnLCdwcm9mbGluZSc6J1xcdTIzMTInLCdwcm9mc3VyZic6J1xcdTIzMTMnLCdwcm9wJzonXFx1MjIxRCcsJ1Byb3BvcnRpb24nOidcXHUyMjM3JywnUHJvcG9ydGlvbmFsJzonXFx1MjIxRCcsJ3Byb3B0byc6J1xcdTIyMUQnLCdwcnNpbSc6J1xcdTIyN0UnLCdwcnVyZWwnOidcXHUyMkIwJywncHNjcic6J1xcdUQ4MzVcXHVEQ0M1JywnUHNjcic6J1xcdUQ4MzVcXHVEQ0FCJywncHNpJzonXFx1MDNDOCcsJ1BzaSc6J1xcdTAzQTgnLCdwdW5jc3AnOidcXHUyMDA4JywncWZyJzonXFx1RDgzNVxcdUREMkUnLCdRZnInOidcXHVEODM1XFx1REQxNCcsJ3FpbnQnOidcXHUyQTBDJywncW9wZic6J1xcdUQ4MzVcXHVERDYyJywnUW9wZic6J1xcdTIxMUEnLCdxcHJpbWUnOidcXHUyMDU3JywncXNjcic6J1xcdUQ4MzVcXHVEQ0M2JywnUXNjcic6J1xcdUQ4MzVcXHVEQ0FDJywncXVhdGVybmlvbnMnOidcXHUyMTBEJywncXVhdGludCc6J1xcdTJBMTYnLCdxdWVzdCc6Jz8nLCdxdWVzdGVxJzonXFx1MjI1RicsJ3F1b3QnOidcIicsJ1FVT1QnOidcIicsJ3JBYXJyJzonXFx1MjFEQicsJ3JhY2UnOidcXHUyMjNEXFx1MDMzMScsJ3JhY3V0ZSc6J1xcdTAxNTUnLCdSYWN1dGUnOidcXHUwMTU0JywncmFkaWMnOidcXHUyMjFBJywncmFlbXB0eXYnOidcXHUyOUIzJywncmFuZyc6J1xcdTI3RTknLCdSYW5nJzonXFx1MjdFQicsJ3JhbmdkJzonXFx1Mjk5MicsJ3JhbmdlJzonXFx1MjlBNScsJ3JhbmdsZSc6J1xcdTI3RTknLCdyYXF1byc6J1xceEJCJywncmFycic6J1xcdTIxOTInLCdyQXJyJzonXFx1MjFEMicsJ1JhcnInOidcXHUyMUEwJywncmFycmFwJzonXFx1Mjk3NScsJ3JhcnJiJzonXFx1MjFFNScsJ3JhcnJiZnMnOidcXHUyOTIwJywncmFycmMnOidcXHUyOTMzJywncmFycmZzJzonXFx1MjkxRScsJ3JhcnJoayc6J1xcdTIxQUEnLCdyYXJybHAnOidcXHUyMUFDJywncmFycnBsJzonXFx1Mjk0NScsJ3JhcnJzaW0nOidcXHUyOTc0JywncmFycnRsJzonXFx1MjFBMycsJ1JhcnJ0bCc6J1xcdTI5MTYnLCdyYXJydyc6J1xcdTIxOUQnLCdyYXRhaWwnOidcXHUyOTFBJywnckF0YWlsJzonXFx1MjkxQycsJ3JhdGlvJzonXFx1MjIzNicsJ3JhdGlvbmFscyc6J1xcdTIxMUEnLCdyYmFycic6J1xcdTI5MEQnLCdyQmFycic6J1xcdTI5MEYnLCdSQmFycic6J1xcdTI5MTAnLCdyYmJyayc6J1xcdTI3NzMnLCdyYnJhY2UnOid9JywncmJyYWNrJzonXScsJ3JicmtlJzonXFx1Mjk4QycsJ3JicmtzbGQnOidcXHUyOThFJywncmJya3NsdSc6J1xcdTI5OTAnLCdyY2Fyb24nOidcXHUwMTU5JywnUmNhcm9uJzonXFx1MDE1OCcsJ3JjZWRpbCc6J1xcdTAxNTcnLCdSY2VkaWwnOidcXHUwMTU2JywncmNlaWwnOidcXHUyMzA5JywncmN1Yic6J30nLCdyY3knOidcXHUwNDQwJywnUmN5JzonXFx1MDQyMCcsJ3JkY2EnOidcXHUyOTM3JywncmRsZGhhcic6J1xcdTI5NjknLCdyZHF1byc6J1xcdTIwMUQnLCdyZHF1b3InOidcXHUyMDFEJywncmRzaCc6J1xcdTIxQjMnLCdSZSc6J1xcdTIxMUMnLCdyZWFsJzonXFx1MjExQycsJ3JlYWxpbmUnOidcXHUyMTFCJywncmVhbHBhcnQnOidcXHUyMTFDJywncmVhbHMnOidcXHUyMTFEJywncmVjdCc6J1xcdTI1QUQnLCdyZWcnOidcXHhBRScsJ1JFRyc6J1xceEFFJywnUmV2ZXJzZUVsZW1lbnQnOidcXHUyMjBCJywnUmV2ZXJzZUVxdWlsaWJyaXVtJzonXFx1MjFDQicsJ1JldmVyc2VVcEVxdWlsaWJyaXVtJzonXFx1Mjk2RicsJ3JmaXNodCc6J1xcdTI5N0QnLCdyZmxvb3InOidcXHUyMzBCJywncmZyJzonXFx1RDgzNVxcdUREMkYnLCdSZnInOidcXHUyMTFDJywnckhhcic6J1xcdTI5NjQnLCdyaGFyZCc6J1xcdTIxQzEnLCdyaGFydSc6J1xcdTIxQzAnLCdyaGFydWwnOidcXHUyOTZDJywncmhvJzonXFx1MDNDMScsJ1Jobyc6J1xcdTAzQTEnLCdyaG92JzonXFx1MDNGMScsJ1JpZ2h0QW5nbGVCcmFja2V0JzonXFx1MjdFOScsJ3JpZ2h0YXJyb3cnOidcXHUyMTkyJywnUmlnaHRhcnJvdyc6J1xcdTIxRDInLCdSaWdodEFycm93JzonXFx1MjE5MicsJ1JpZ2h0QXJyb3dCYXInOidcXHUyMUU1JywnUmlnaHRBcnJvd0xlZnRBcnJvdyc6J1xcdTIxQzQnLCdyaWdodGFycm93dGFpbCc6J1xcdTIxQTMnLCdSaWdodENlaWxpbmcnOidcXHUyMzA5JywnUmlnaHREb3VibGVCcmFja2V0JzonXFx1MjdFNycsJ1JpZ2h0RG93blRlZVZlY3Rvcic6J1xcdTI5NUQnLCdSaWdodERvd25WZWN0b3InOidcXHUyMUMyJywnUmlnaHREb3duVmVjdG9yQmFyJzonXFx1Mjk1NScsJ1JpZ2h0Rmxvb3InOidcXHUyMzBCJywncmlnaHRoYXJwb29uZG93bic6J1xcdTIxQzEnLCdyaWdodGhhcnBvb251cCc6J1xcdTIxQzAnLCdyaWdodGxlZnRhcnJvd3MnOidcXHUyMUM0JywncmlnaHRsZWZ0aGFycG9vbnMnOidcXHUyMUNDJywncmlnaHRyaWdodGFycm93cyc6J1xcdTIxQzknLCdyaWdodHNxdWlnYXJyb3cnOidcXHUyMTlEJywnUmlnaHRUZWUnOidcXHUyMkEyJywnUmlnaHRUZWVBcnJvdyc6J1xcdTIxQTYnLCdSaWdodFRlZVZlY3Rvcic6J1xcdTI5NUInLCdyaWdodHRocmVldGltZXMnOidcXHUyMkNDJywnUmlnaHRUcmlhbmdsZSc6J1xcdTIyQjMnLCdSaWdodFRyaWFuZ2xlQmFyJzonXFx1MjlEMCcsJ1JpZ2h0VHJpYW5nbGVFcXVhbCc6J1xcdTIyQjUnLCdSaWdodFVwRG93blZlY3Rvcic6J1xcdTI5NEYnLCdSaWdodFVwVGVlVmVjdG9yJzonXFx1Mjk1QycsJ1JpZ2h0VXBWZWN0b3InOidcXHUyMUJFJywnUmlnaHRVcFZlY3RvckJhcic6J1xcdTI5NTQnLCdSaWdodFZlY3Rvcic6J1xcdTIxQzAnLCdSaWdodFZlY3RvckJhcic6J1xcdTI5NTMnLCdyaW5nJzonXFx1MDJEQScsJ3Jpc2luZ2RvdHNlcSc6J1xcdTIyNTMnLCdybGFycic6J1xcdTIxQzQnLCdybGhhcic6J1xcdTIxQ0MnLCdybG0nOidcXHUyMDBGJywncm1vdXN0JzonXFx1MjNCMScsJ3Jtb3VzdGFjaGUnOidcXHUyM0IxJywncm5taWQnOidcXHUyQUVFJywncm9hbmcnOidcXHUyN0VEJywncm9hcnInOidcXHUyMUZFJywncm9icmsnOidcXHUyN0U3Jywncm9wYXInOidcXHUyOTg2Jywncm9wZic6J1xcdUQ4MzVcXHVERDYzJywnUm9wZic6J1xcdTIxMUQnLCdyb3BsdXMnOidcXHUyQTJFJywncm90aW1lcyc6J1xcdTJBMzUnLCdSb3VuZEltcGxpZXMnOidcXHUyOTcwJywncnBhcic6JyknLCdycGFyZ3QnOidcXHUyOTk0JywncnBwb2xpbnQnOidcXHUyQTEyJywncnJhcnInOidcXHUyMUM5JywnUnJpZ2h0YXJyb3cnOidcXHUyMURCJywncnNhcXVvJzonXFx1MjAzQScsJ3JzY3InOidcXHVEODM1XFx1RENDNycsJ1JzY3InOidcXHUyMTFCJywncnNoJzonXFx1MjFCMScsJ1JzaCc6J1xcdTIxQjEnLCdyc3FiJzonXScsJ3JzcXVvJzonXFx1MjAxOScsJ3JzcXVvcic6J1xcdTIwMTknLCdydGhyZWUnOidcXHUyMkNDJywncnRpbWVzJzonXFx1MjJDQScsJ3J0cmknOidcXHUyNUI5JywncnRyaWUnOidcXHUyMkI1JywncnRyaWYnOidcXHUyNUI4JywncnRyaWx0cmknOidcXHUyOUNFJywnUnVsZURlbGF5ZWQnOidcXHUyOUY0JywncnVsdWhhcic6J1xcdTI5NjgnLCdyeCc6J1xcdTIxMUUnLCdzYWN1dGUnOidcXHUwMTVCJywnU2FjdXRlJzonXFx1MDE1QScsJ3NicXVvJzonXFx1MjAxQScsJ3NjJzonXFx1MjI3QicsJ1NjJzonXFx1MkFCQycsJ3NjYXAnOidcXHUyQUI4Jywnc2Nhcm9uJzonXFx1MDE2MScsJ1NjYXJvbic6J1xcdTAxNjAnLCdzY2N1ZSc6J1xcdTIyN0QnLCdzY2UnOidcXHUyQUIwJywnc2NFJzonXFx1MkFCNCcsJ3NjZWRpbCc6J1xcdTAxNUYnLCdTY2VkaWwnOidcXHUwMTVFJywnc2NpcmMnOidcXHUwMTVEJywnU2NpcmMnOidcXHUwMTVDJywnc2NuYXAnOidcXHUyQUJBJywnc2NuRSc6J1xcdTJBQjYnLCdzY25zaW0nOidcXHUyMkU5Jywnc2Nwb2xpbnQnOidcXHUyQTEzJywnc2NzaW0nOidcXHUyMjdGJywnc2N5JzonXFx1MDQ0MScsJ1NjeSc6J1xcdTA0MjEnLCdzZG90JzonXFx1MjJDNScsJ3Nkb3RiJzonXFx1MjJBMScsJ3Nkb3RlJzonXFx1MkE2NicsJ3NlYXJoayc6J1xcdTI5MjUnLCdzZWFycic6J1xcdTIxOTgnLCdzZUFycic6J1xcdTIxRDgnLCdzZWFycm93JzonXFx1MjE5OCcsJ3NlY3QnOidcXHhBNycsJ3NlbWknOic7Jywnc2Vzd2FyJzonXFx1MjkyOScsJ3NldG1pbnVzJzonXFx1MjIxNicsJ3NldG1uJzonXFx1MjIxNicsJ3NleHQnOidcXHUyNzM2Jywnc2ZyJzonXFx1RDgzNVxcdUREMzAnLCdTZnInOidcXHVEODM1XFx1REQxNicsJ3Nmcm93bic6J1xcdTIzMjInLCdzaGFycCc6J1xcdTI2NkYnLCdzaGNoY3knOidcXHUwNDQ5JywnU0hDSGN5JzonXFx1MDQyOScsJ3NoY3knOidcXHUwNDQ4JywnU0hjeSc6J1xcdTA0MjgnLCdTaG9ydERvd25BcnJvdyc6J1xcdTIxOTMnLCdTaG9ydExlZnRBcnJvdyc6J1xcdTIxOTAnLCdzaG9ydG1pZCc6J1xcdTIyMjMnLCdzaG9ydHBhcmFsbGVsJzonXFx1MjIyNScsJ1Nob3J0UmlnaHRBcnJvdyc6J1xcdTIxOTInLCdTaG9ydFVwQXJyb3cnOidcXHUyMTkxJywnc2h5JzonXFx4QUQnLCdzaWdtYSc6J1xcdTAzQzMnLCdTaWdtYSc6J1xcdTAzQTMnLCdzaWdtYWYnOidcXHUwM0MyJywnc2lnbWF2JzonXFx1MDNDMicsJ3NpbSc6J1xcdTIyM0MnLCdzaW1kb3QnOidcXHUyQTZBJywnc2ltZSc6J1xcdTIyNDMnLCdzaW1lcSc6J1xcdTIyNDMnLCdzaW1nJzonXFx1MkE5RScsJ3NpbWdFJzonXFx1MkFBMCcsJ3NpbWwnOidcXHUyQTlEJywnc2ltbEUnOidcXHUyQTlGJywnc2ltbmUnOidcXHUyMjQ2Jywnc2ltcGx1cyc6J1xcdTJBMjQnLCdzaW1yYXJyJzonXFx1Mjk3MicsJ3NsYXJyJzonXFx1MjE5MCcsJ1NtYWxsQ2lyY2xlJzonXFx1MjIxOCcsJ3NtYWxsc2V0bWludXMnOidcXHUyMjE2Jywnc21hc2hwJzonXFx1MkEzMycsJ3NtZXBhcnNsJzonXFx1MjlFNCcsJ3NtaWQnOidcXHUyMjIzJywnc21pbGUnOidcXHUyMzIzJywnc210JzonXFx1MkFBQScsJ3NtdGUnOidcXHUyQUFDJywnc210ZXMnOidcXHUyQUFDXFx1RkUwMCcsJ3NvZnRjeSc6J1xcdTA0NEMnLCdTT0ZUY3knOidcXHUwNDJDJywnc29sJzonLycsJ3NvbGInOidcXHUyOUM0Jywnc29sYmFyJzonXFx1MjMzRicsJ3NvcGYnOidcXHVEODM1XFx1REQ2NCcsJ1NvcGYnOidcXHVEODM1XFx1REQ0QScsJ3NwYWRlcyc6J1xcdTI2NjAnLCdzcGFkZXN1aXQnOidcXHUyNjYwJywnc3Bhcic6J1xcdTIyMjUnLCdzcWNhcCc6J1xcdTIyOTMnLCdzcWNhcHMnOidcXHUyMjkzXFx1RkUwMCcsJ3NxY3VwJzonXFx1MjI5NCcsJ3NxY3Vwcyc6J1xcdTIyOTRcXHVGRTAwJywnU3FydCc6J1xcdTIyMUEnLCdzcXN1Yic6J1xcdTIyOEYnLCdzcXN1YmUnOidcXHUyMjkxJywnc3FzdWJzZXQnOidcXHUyMjhGJywnc3FzdWJzZXRlcSc6J1xcdTIyOTEnLCdzcXN1cCc6J1xcdTIyOTAnLCdzcXN1cGUnOidcXHUyMjkyJywnc3FzdXBzZXQnOidcXHUyMjkwJywnc3FzdXBzZXRlcSc6J1xcdTIyOTInLCdzcXUnOidcXHUyNUExJywnc3F1YXJlJzonXFx1MjVBMScsJ1NxdWFyZSc6J1xcdTI1QTEnLCdTcXVhcmVJbnRlcnNlY3Rpb24nOidcXHUyMjkzJywnU3F1YXJlU3Vic2V0JzonXFx1MjI4RicsJ1NxdWFyZVN1YnNldEVxdWFsJzonXFx1MjI5MScsJ1NxdWFyZVN1cGVyc2V0JzonXFx1MjI5MCcsJ1NxdWFyZVN1cGVyc2V0RXF1YWwnOidcXHUyMjkyJywnU3F1YXJlVW5pb24nOidcXHUyMjk0Jywnc3F1YXJmJzonXFx1MjVBQScsJ3NxdWYnOidcXHUyNUFBJywnc3JhcnInOidcXHUyMTkyJywnc3Njcic6J1xcdUQ4MzVcXHVEQ0M4JywnU3Njcic6J1xcdUQ4MzVcXHVEQ0FFJywnc3NldG1uJzonXFx1MjIxNicsJ3NzbWlsZSc6J1xcdTIzMjMnLCdzc3RhcmYnOidcXHUyMkM2Jywnc3Rhcic6J1xcdTI2MDYnLCdTdGFyJzonXFx1MjJDNicsJ3N0YXJmJzonXFx1MjYwNScsJ3N0cmFpZ2h0ZXBzaWxvbic6J1xcdTAzRjUnLCdzdHJhaWdodHBoaSc6J1xcdTAzRDUnLCdzdHJucyc6J1xceEFGJywnc3ViJzonXFx1MjI4MicsJ1N1Yic6J1xcdTIyRDAnLCdzdWJkb3QnOidcXHUyQUJEJywnc3ViZSc6J1xcdTIyODYnLCdzdWJFJzonXFx1MkFDNScsJ3N1YmVkb3QnOidcXHUyQUMzJywnc3VibXVsdCc6J1xcdTJBQzEnLCdzdWJuZSc6J1xcdTIyOEEnLCdzdWJuRSc6J1xcdTJBQ0InLCdzdWJwbHVzJzonXFx1MkFCRicsJ3N1YnJhcnInOidcXHUyOTc5Jywnc3Vic2V0JzonXFx1MjI4MicsJ1N1YnNldCc6J1xcdTIyRDAnLCdzdWJzZXRlcSc6J1xcdTIyODYnLCdzdWJzZXRlcXEnOidcXHUyQUM1JywnU3Vic2V0RXF1YWwnOidcXHUyMjg2Jywnc3Vic2V0bmVxJzonXFx1MjI4QScsJ3N1YnNldG5lcXEnOidcXHUyQUNCJywnc3Vic2ltJzonXFx1MkFDNycsJ3N1YnN1Yic6J1xcdTJBRDUnLCdzdWJzdXAnOidcXHUyQUQzJywnc3VjYyc6J1xcdTIyN0InLCdzdWNjYXBwcm94JzonXFx1MkFCOCcsJ3N1Y2NjdXJseWVxJzonXFx1MjI3RCcsJ1N1Y2NlZWRzJzonXFx1MjI3QicsJ1N1Y2NlZWRzRXF1YWwnOidcXHUyQUIwJywnU3VjY2VlZHNTbGFudEVxdWFsJzonXFx1MjI3RCcsJ1N1Y2NlZWRzVGlsZGUnOidcXHUyMjdGJywnc3VjY2VxJzonXFx1MkFCMCcsJ3N1Y2NuYXBwcm94JzonXFx1MkFCQScsJ3N1Y2NuZXFxJzonXFx1MkFCNicsJ3N1Y2Nuc2ltJzonXFx1MjJFOScsJ3N1Y2NzaW0nOidcXHUyMjdGJywnU3VjaFRoYXQnOidcXHUyMjBCJywnc3VtJzonXFx1MjIxMScsJ1N1bSc6J1xcdTIyMTEnLCdzdW5nJzonXFx1MjY2QScsJ3N1cCc6J1xcdTIyODMnLCdTdXAnOidcXHUyMkQxJywnc3VwMSc6J1xceEI5Jywnc3VwMic6J1xceEIyJywnc3VwMyc6J1xceEIzJywnc3VwZG90JzonXFx1MkFCRScsJ3N1cGRzdWInOidcXHUyQUQ4Jywnc3VwZSc6J1xcdTIyODcnLCdzdXBFJzonXFx1MkFDNicsJ3N1cGVkb3QnOidcXHUyQUM0JywnU3VwZXJzZXQnOidcXHUyMjgzJywnU3VwZXJzZXRFcXVhbCc6J1xcdTIyODcnLCdzdXBoc29sJzonXFx1MjdDOScsJ3N1cGhzdWInOidcXHUyQUQ3Jywnc3VwbGFycic6J1xcdTI5N0InLCdzdXBtdWx0JzonXFx1MkFDMicsJ3N1cG5lJzonXFx1MjI4QicsJ3N1cG5FJzonXFx1MkFDQycsJ3N1cHBsdXMnOidcXHUyQUMwJywnc3Vwc2V0JzonXFx1MjI4MycsJ1N1cHNldCc6J1xcdTIyRDEnLCdzdXBzZXRlcSc6J1xcdTIyODcnLCdzdXBzZXRlcXEnOidcXHUyQUM2Jywnc3Vwc2V0bmVxJzonXFx1MjI4QicsJ3N1cHNldG5lcXEnOidcXHUyQUNDJywnc3Vwc2ltJzonXFx1MkFDOCcsJ3N1cHN1Yic6J1xcdTJBRDQnLCdzdXBzdXAnOidcXHUyQUQ2Jywnc3dhcmhrJzonXFx1MjkyNicsJ3N3YXJyJzonXFx1MjE5OScsJ3N3QXJyJzonXFx1MjFEOScsJ3N3YXJyb3cnOidcXHUyMTk5Jywnc3dud2FyJzonXFx1MjkyQScsJ3N6bGlnJzonXFx4REYnLCdUYWInOidcXHQnLCd0YXJnZXQnOidcXHUyMzE2JywndGF1JzonXFx1MDNDNCcsJ1RhdSc6J1xcdTAzQTQnLCd0YnJrJzonXFx1MjNCNCcsJ3RjYXJvbic6J1xcdTAxNjUnLCdUY2Fyb24nOidcXHUwMTY0JywndGNlZGlsJzonXFx1MDE2MycsJ1RjZWRpbCc6J1xcdTAxNjInLCd0Y3knOidcXHUwNDQyJywnVGN5JzonXFx1MDQyMicsJ3Rkb3QnOidcXHUyMERCJywndGVscmVjJzonXFx1MjMxNScsJ3Rmcic6J1xcdUQ4MzVcXHVERDMxJywnVGZyJzonXFx1RDgzNVxcdUREMTcnLCd0aGVyZTQnOidcXHUyMjM0JywndGhlcmVmb3JlJzonXFx1MjIzNCcsJ1RoZXJlZm9yZSc6J1xcdTIyMzQnLCd0aGV0YSc6J1xcdTAzQjgnLCdUaGV0YSc6J1xcdTAzOTgnLCd0aGV0YXN5bSc6J1xcdTAzRDEnLCd0aGV0YXYnOidcXHUwM0QxJywndGhpY2thcHByb3gnOidcXHUyMjQ4JywndGhpY2tzaW0nOidcXHUyMjNDJywnVGhpY2tTcGFjZSc6J1xcdTIwNUZcXHUyMDBBJywndGhpbnNwJzonXFx1MjAwOScsJ1RoaW5TcGFjZSc6J1xcdTIwMDknLCd0aGthcCc6J1xcdTIyNDgnLCd0aGtzaW0nOidcXHUyMjNDJywndGhvcm4nOidcXHhGRScsJ1RIT1JOJzonXFx4REUnLCd0aWxkZSc6J1xcdTAyREMnLCdUaWxkZSc6J1xcdTIyM0MnLCdUaWxkZUVxdWFsJzonXFx1MjI0MycsJ1RpbGRlRnVsbEVxdWFsJzonXFx1MjI0NScsJ1RpbGRlVGlsZGUnOidcXHUyMjQ4JywndGltZXMnOidcXHhENycsJ3RpbWVzYic6J1xcdTIyQTAnLCd0aW1lc2Jhcic6J1xcdTJBMzEnLCd0aW1lc2QnOidcXHUyQTMwJywndGludCc6J1xcdTIyMkQnLCd0b2VhJzonXFx1MjkyOCcsJ3RvcCc6J1xcdTIyQTQnLCd0b3Bib3QnOidcXHUyMzM2JywndG9wY2lyJzonXFx1MkFGMScsJ3RvcGYnOidcXHVEODM1XFx1REQ2NScsJ1RvcGYnOidcXHVEODM1XFx1REQ0QicsJ3RvcGZvcmsnOidcXHUyQURBJywndG9zYSc6J1xcdTI5MjknLCd0cHJpbWUnOidcXHUyMDM0JywndHJhZGUnOidcXHUyMTIyJywnVFJBREUnOidcXHUyMTIyJywndHJpYW5nbGUnOidcXHUyNUI1JywndHJpYW5nbGVkb3duJzonXFx1MjVCRicsJ3RyaWFuZ2xlbGVmdCc6J1xcdTI1QzMnLCd0cmlhbmdsZWxlZnRlcSc6J1xcdTIyQjQnLCd0cmlhbmdsZXEnOidcXHUyMjVDJywndHJpYW5nbGVyaWdodCc6J1xcdTI1QjknLCd0cmlhbmdsZXJpZ2h0ZXEnOidcXHUyMkI1JywndHJpZG90JzonXFx1MjVFQycsJ3RyaWUnOidcXHUyMjVDJywndHJpbWludXMnOidcXHUyQTNBJywnVHJpcGxlRG90JzonXFx1MjBEQicsJ3RyaXBsdXMnOidcXHUyQTM5JywndHJpc2InOidcXHUyOUNEJywndHJpdGltZSc6J1xcdTJBM0InLCd0cnBleml1bSc6J1xcdTIzRTInLCd0c2NyJzonXFx1RDgzNVxcdURDQzknLCdUc2NyJzonXFx1RDgzNVxcdURDQUYnLCd0c2N5JzonXFx1MDQ0NicsJ1RTY3knOidcXHUwNDI2JywndHNoY3knOidcXHUwNDVCJywnVFNIY3knOidcXHUwNDBCJywndHN0cm9rJzonXFx1MDE2NycsJ1RzdHJvayc6J1xcdTAxNjYnLCd0d2l4dCc6J1xcdTIyNkMnLCd0d29oZWFkbGVmdGFycm93JzonXFx1MjE5RScsJ3R3b2hlYWRyaWdodGFycm93JzonXFx1MjFBMCcsJ3VhY3V0ZSc6J1xceEZBJywnVWFjdXRlJzonXFx4REEnLCd1YXJyJzonXFx1MjE5MScsJ3VBcnInOidcXHUyMUQxJywnVWFycic6J1xcdTIxOUYnLCdVYXJyb2Npcic6J1xcdTI5NDknLCd1YnJjeSc6J1xcdTA0NUUnLCdVYnJjeSc6J1xcdTA0MEUnLCd1YnJldmUnOidcXHUwMTZEJywnVWJyZXZlJzonXFx1MDE2QycsJ3VjaXJjJzonXFx4RkInLCdVY2lyYyc6J1xceERCJywndWN5JzonXFx1MDQ0MycsJ1VjeSc6J1xcdTA0MjMnLCd1ZGFycic6J1xcdTIxQzUnLCd1ZGJsYWMnOidcXHUwMTcxJywnVWRibGFjJzonXFx1MDE3MCcsJ3VkaGFyJzonXFx1Mjk2RScsJ3VmaXNodCc6J1xcdTI5N0UnLCd1ZnInOidcXHVEODM1XFx1REQzMicsJ1Vmcic6J1xcdUQ4MzVcXHVERDE4JywndWdyYXZlJzonXFx4RjknLCdVZ3JhdmUnOidcXHhEOScsJ3VIYXInOidcXHUyOTYzJywndWhhcmwnOidcXHUyMUJGJywndWhhcnInOidcXHUyMUJFJywndWhibGsnOidcXHUyNTgwJywndWxjb3JuJzonXFx1MjMxQycsJ3VsY29ybmVyJzonXFx1MjMxQycsJ3VsY3JvcCc6J1xcdTIzMEYnLCd1bHRyaSc6J1xcdTI1RjgnLCd1bWFjcic6J1xcdTAxNkInLCdVbWFjcic6J1xcdTAxNkEnLCd1bWwnOidcXHhBOCcsJ1VuZGVyQmFyJzonXycsJ1VuZGVyQnJhY2UnOidcXHUyM0RGJywnVW5kZXJCcmFja2V0JzonXFx1MjNCNScsJ1VuZGVyUGFyZW50aGVzaXMnOidcXHUyM0REJywnVW5pb24nOidcXHUyMkMzJywnVW5pb25QbHVzJzonXFx1MjI4RScsJ3VvZ29uJzonXFx1MDE3MycsJ1VvZ29uJzonXFx1MDE3MicsJ3VvcGYnOidcXHVEODM1XFx1REQ2NicsJ1VvcGYnOidcXHVEODM1XFx1REQ0QycsJ3VwYXJyb3cnOidcXHUyMTkxJywnVXBhcnJvdyc6J1xcdTIxRDEnLCdVcEFycm93JzonXFx1MjE5MScsJ1VwQXJyb3dCYXInOidcXHUyOTEyJywnVXBBcnJvd0Rvd25BcnJvdyc6J1xcdTIxQzUnLCd1cGRvd25hcnJvdyc6J1xcdTIxOTUnLCdVcGRvd25hcnJvdyc6J1xcdTIxRDUnLCdVcERvd25BcnJvdyc6J1xcdTIxOTUnLCdVcEVxdWlsaWJyaXVtJzonXFx1Mjk2RScsJ3VwaGFycG9vbmxlZnQnOidcXHUyMUJGJywndXBoYXJwb29ucmlnaHQnOidcXHUyMUJFJywndXBsdXMnOidcXHUyMjhFJywnVXBwZXJMZWZ0QXJyb3cnOidcXHUyMTk2JywnVXBwZXJSaWdodEFycm93JzonXFx1MjE5NycsJ3Vwc2knOidcXHUwM0M1JywnVXBzaSc6J1xcdTAzRDInLCd1cHNpaCc6J1xcdTAzRDInLCd1cHNpbG9uJzonXFx1MDNDNScsJ1Vwc2lsb24nOidcXHUwM0E1JywnVXBUZWUnOidcXHUyMkE1JywnVXBUZWVBcnJvdyc6J1xcdTIxQTUnLCd1cHVwYXJyb3dzJzonXFx1MjFDOCcsJ3VyY29ybic6J1xcdTIzMUQnLCd1cmNvcm5lcic6J1xcdTIzMUQnLCd1cmNyb3AnOidcXHUyMzBFJywndXJpbmcnOidcXHUwMTZGJywnVXJpbmcnOidcXHUwMTZFJywndXJ0cmknOidcXHUyNUY5JywndXNjcic6J1xcdUQ4MzVcXHVEQ0NBJywnVXNjcic6J1xcdUQ4MzVcXHVEQ0IwJywndXRkb3QnOidcXHUyMkYwJywndXRpbGRlJzonXFx1MDE2OScsJ1V0aWxkZSc6J1xcdTAxNjgnLCd1dHJpJzonXFx1MjVCNScsJ3V0cmlmJzonXFx1MjVCNCcsJ3V1YXJyJzonXFx1MjFDOCcsJ3V1bWwnOidcXHhGQycsJ1V1bWwnOidcXHhEQycsJ3V3YW5nbGUnOidcXHUyOUE3JywndmFuZ3J0JzonXFx1Mjk5QycsJ3ZhcmVwc2lsb24nOidcXHUwM0Y1JywndmFya2FwcGEnOidcXHUwM0YwJywndmFybm90aGluZyc6J1xcdTIyMDUnLCd2YXJwaGknOidcXHUwM0Q1JywndmFycGknOidcXHUwM0Q2JywndmFycHJvcHRvJzonXFx1MjIxRCcsJ3ZhcnInOidcXHUyMTk1JywndkFycic6J1xcdTIxRDUnLCd2YXJyaG8nOidcXHUwM0YxJywndmFyc2lnbWEnOidcXHUwM0MyJywndmFyc3Vic2V0bmVxJzonXFx1MjI4QVxcdUZFMDAnLCd2YXJzdWJzZXRuZXFxJzonXFx1MkFDQlxcdUZFMDAnLCd2YXJzdXBzZXRuZXEnOidcXHUyMjhCXFx1RkUwMCcsJ3ZhcnN1cHNldG5lcXEnOidcXHUyQUNDXFx1RkUwMCcsJ3ZhcnRoZXRhJzonXFx1MDNEMScsJ3ZhcnRyaWFuZ2xlbGVmdCc6J1xcdTIyQjInLCd2YXJ0cmlhbmdsZXJpZ2h0JzonXFx1MjJCMycsJ3ZCYXInOidcXHUyQUU4JywnVmJhcic6J1xcdTJBRUInLCd2QmFydic6J1xcdTJBRTknLCd2Y3knOidcXHUwNDMyJywnVmN5JzonXFx1MDQxMicsJ3ZkYXNoJzonXFx1MjJBMicsJ3ZEYXNoJzonXFx1MjJBOCcsJ1ZkYXNoJzonXFx1MjJBOScsJ1ZEYXNoJzonXFx1MjJBQicsJ1ZkYXNobCc6J1xcdTJBRTYnLCd2ZWUnOidcXHUyMjI4JywnVmVlJzonXFx1MjJDMScsJ3ZlZWJhcic6J1xcdTIyQkInLCd2ZWVlcSc6J1xcdTIyNUEnLCd2ZWxsaXAnOidcXHUyMkVFJywndmVyYmFyJzonfCcsJ1ZlcmJhcic6J1xcdTIwMTYnLCd2ZXJ0JzonfCcsJ1ZlcnQnOidcXHUyMDE2JywnVmVydGljYWxCYXInOidcXHUyMjIzJywnVmVydGljYWxMaW5lJzonfCcsJ1ZlcnRpY2FsU2VwYXJhdG9yJzonXFx1Mjc1OCcsJ1ZlcnRpY2FsVGlsZGUnOidcXHUyMjQwJywnVmVyeVRoaW5TcGFjZSc6J1xcdTIwMEEnLCd2ZnInOidcXHVEODM1XFx1REQzMycsJ1Zmcic6J1xcdUQ4MzVcXHVERDE5Jywndmx0cmknOidcXHUyMkIyJywndm5zdWInOidcXHUyMjgyXFx1MjBEMicsJ3Zuc3VwJzonXFx1MjI4M1xcdTIwRDInLCd2b3BmJzonXFx1RDgzNVxcdURENjcnLCdWb3BmJzonXFx1RDgzNVxcdURENEQnLCd2cHJvcCc6J1xcdTIyMUQnLCd2cnRyaSc6J1xcdTIyQjMnLCd2c2NyJzonXFx1RDgzNVxcdURDQ0InLCdWc2NyJzonXFx1RDgzNVxcdURDQjEnLCd2c3VibmUnOidcXHUyMjhBXFx1RkUwMCcsJ3ZzdWJuRSc6J1xcdTJBQ0JcXHVGRTAwJywndnN1cG5lJzonXFx1MjI4QlxcdUZFMDAnLCd2c3VwbkUnOidcXHUyQUNDXFx1RkUwMCcsJ1Z2ZGFzaCc6J1xcdTIyQUEnLCd2emlnemFnJzonXFx1Mjk5QScsJ3djaXJjJzonXFx1MDE3NScsJ1djaXJjJzonXFx1MDE3NCcsJ3dlZGJhcic6J1xcdTJBNUYnLCd3ZWRnZSc6J1xcdTIyMjcnLCdXZWRnZSc6J1xcdTIyQzAnLCd3ZWRnZXEnOidcXHUyMjU5Jywnd2VpZXJwJzonXFx1MjExOCcsJ3dmcic6J1xcdUQ4MzVcXHVERDM0JywnV2ZyJzonXFx1RDgzNVxcdUREMUEnLCd3b3BmJzonXFx1RDgzNVxcdURENjgnLCdXb3BmJzonXFx1RDgzNVxcdURENEUnLCd3cCc6J1xcdTIxMTgnLCd3cic6J1xcdTIyNDAnLCd3cmVhdGgnOidcXHUyMjQwJywnd3Njcic6J1xcdUQ4MzVcXHVEQ0NDJywnV3Njcic6J1xcdUQ4MzVcXHVEQ0IyJywneGNhcCc6J1xcdTIyQzInLCd4Y2lyYyc6J1xcdTI1RUYnLCd4Y3VwJzonXFx1MjJDMycsJ3hkdHJpJzonXFx1MjVCRCcsJ3hmcic6J1xcdUQ4MzVcXHVERDM1JywnWGZyJzonXFx1RDgzNVxcdUREMUInLCd4aGFycic6J1xcdTI3RjcnLCd4aEFycic6J1xcdTI3RkEnLCd4aSc6J1xcdTAzQkUnLCdYaSc6J1xcdTAzOUUnLCd4bGFycic6J1xcdTI3RjUnLCd4bEFycic6J1xcdTI3RjgnLCd4bWFwJzonXFx1MjdGQycsJ3huaXMnOidcXHUyMkZCJywneG9kb3QnOidcXHUyQTAwJywneG9wZic6J1xcdUQ4MzVcXHVERDY5JywnWG9wZic6J1xcdUQ4MzVcXHVERDRGJywneG9wbHVzJzonXFx1MkEwMScsJ3hvdGltZSc6J1xcdTJBMDInLCd4cmFycic6J1xcdTI3RjYnLCd4ckFycic6J1xcdTI3RjknLCd4c2NyJzonXFx1RDgzNVxcdURDQ0QnLCdYc2NyJzonXFx1RDgzNVxcdURDQjMnLCd4c3FjdXAnOidcXHUyQTA2JywneHVwbHVzJzonXFx1MkEwNCcsJ3h1dHJpJzonXFx1MjVCMycsJ3h2ZWUnOidcXHUyMkMxJywneHdlZGdlJzonXFx1MjJDMCcsJ3lhY3V0ZSc6J1xceEZEJywnWWFjdXRlJzonXFx4REQnLCd5YWN5JzonXFx1MDQ0RicsJ1lBY3knOidcXHUwNDJGJywneWNpcmMnOidcXHUwMTc3JywnWWNpcmMnOidcXHUwMTc2JywneWN5JzonXFx1MDQ0QicsJ1ljeSc6J1xcdTA0MkInLCd5ZW4nOidcXHhBNScsJ3lmcic6J1xcdUQ4MzVcXHVERDM2JywnWWZyJzonXFx1RDgzNVxcdUREMUMnLCd5aWN5JzonXFx1MDQ1NycsJ1lJY3knOidcXHUwNDA3JywneW9wZic6J1xcdUQ4MzVcXHVERDZBJywnWW9wZic6J1xcdUQ4MzVcXHVERDUwJywneXNjcic6J1xcdUQ4MzVcXHVEQ0NFJywnWXNjcic6J1xcdUQ4MzVcXHVEQ0I0JywneXVjeSc6J1xcdTA0NEUnLCdZVWN5JzonXFx1MDQyRScsJ3l1bWwnOidcXHhGRicsJ1l1bWwnOidcXHUwMTc4JywnemFjdXRlJzonXFx1MDE3QScsJ1phY3V0ZSc6J1xcdTAxNzknLCd6Y2Fyb24nOidcXHUwMTdFJywnWmNhcm9uJzonXFx1MDE3RCcsJ3pjeSc6J1xcdTA0MzcnLCdaY3knOidcXHUwNDE3JywnemRvdCc6J1xcdTAxN0MnLCdaZG90JzonXFx1MDE3QicsJ3plZXRyZic6J1xcdTIxMjgnLCdaZXJvV2lkdGhTcGFjZSc6J1xcdTIwMEInLCd6ZXRhJzonXFx1MDNCNicsJ1pldGEnOidcXHUwMzk2JywnemZyJzonXFx1RDgzNVxcdUREMzcnLCdaZnInOidcXHUyMTI4JywnemhjeSc6J1xcdTA0MzYnLCdaSGN5JzonXFx1MDQxNicsJ3ppZ3JhcnInOidcXHUyMUREJywnem9wZic6J1xcdUQ4MzVcXHVERDZCJywnWm9wZic6J1xcdTIxMjQnLCd6c2NyJzonXFx1RDgzNVxcdURDQ0YnLCdac2NyJzonXFx1RDgzNVxcdURDQjUnLCd6d2onOidcXHUyMDBEJywnenduaic6J1xcdTIwMEMnfTtcblx0dmFyIGRlY29kZU1hcExlZ2FjeSA9IHsnYWFjdXRlJzonXFx4RTEnLCdBYWN1dGUnOidcXHhDMScsJ2FjaXJjJzonXFx4RTInLCdBY2lyYyc6J1xceEMyJywnYWN1dGUnOidcXHhCNCcsJ2FlbGlnJzonXFx4RTYnLCdBRWxpZyc6J1xceEM2JywnYWdyYXZlJzonXFx4RTAnLCdBZ3JhdmUnOidcXHhDMCcsJ2FtcCc6JyYnLCdBTVAnOicmJywnYXJpbmcnOidcXHhFNScsJ0FyaW5nJzonXFx4QzUnLCdhdGlsZGUnOidcXHhFMycsJ0F0aWxkZSc6J1xceEMzJywnYXVtbCc6J1xceEU0JywnQXVtbCc6J1xceEM0JywnYnJ2YmFyJzonXFx4QTYnLCdjY2VkaWwnOidcXHhFNycsJ0NjZWRpbCc6J1xceEM3JywnY2VkaWwnOidcXHhCOCcsJ2NlbnQnOidcXHhBMicsJ2NvcHknOidcXHhBOScsJ0NPUFknOidcXHhBOScsJ2N1cnJlbic6J1xceEE0JywnZGVnJzonXFx4QjAnLCdkaXZpZGUnOidcXHhGNycsJ2VhY3V0ZSc6J1xceEU5JywnRWFjdXRlJzonXFx4QzknLCdlY2lyYyc6J1xceEVBJywnRWNpcmMnOidcXHhDQScsJ2VncmF2ZSc6J1xceEU4JywnRWdyYXZlJzonXFx4QzgnLCdldGgnOidcXHhGMCcsJ0VUSCc6J1xceEQwJywnZXVtbCc6J1xceEVCJywnRXVtbCc6J1xceENCJywnZnJhYzEyJzonXFx4QkQnLCdmcmFjMTQnOidcXHhCQycsJ2ZyYWMzNCc6J1xceEJFJywnZ3QnOic+JywnR1QnOic+JywnaWFjdXRlJzonXFx4RUQnLCdJYWN1dGUnOidcXHhDRCcsJ2ljaXJjJzonXFx4RUUnLCdJY2lyYyc6J1xceENFJywnaWV4Y2wnOidcXHhBMScsJ2lncmF2ZSc6J1xceEVDJywnSWdyYXZlJzonXFx4Q0MnLCdpcXVlc3QnOidcXHhCRicsJ2l1bWwnOidcXHhFRicsJ0l1bWwnOidcXHhDRicsJ2xhcXVvJzonXFx4QUInLCdsdCc6JzwnLCdMVCc6JzwnLCdtYWNyJzonXFx4QUYnLCdtaWNybyc6J1xceEI1JywnbWlkZG90JzonXFx4QjcnLCduYnNwJzonXFx4QTAnLCdub3QnOidcXHhBQycsJ250aWxkZSc6J1xceEYxJywnTnRpbGRlJzonXFx4RDEnLCdvYWN1dGUnOidcXHhGMycsJ09hY3V0ZSc6J1xceEQzJywnb2NpcmMnOidcXHhGNCcsJ09jaXJjJzonXFx4RDQnLCdvZ3JhdmUnOidcXHhGMicsJ09ncmF2ZSc6J1xceEQyJywnb3JkZic6J1xceEFBJywnb3JkbSc6J1xceEJBJywnb3NsYXNoJzonXFx4RjgnLCdPc2xhc2gnOidcXHhEOCcsJ290aWxkZSc6J1xceEY1JywnT3RpbGRlJzonXFx4RDUnLCdvdW1sJzonXFx4RjYnLCdPdW1sJzonXFx4RDYnLCdwYXJhJzonXFx4QjYnLCdwbHVzbW4nOidcXHhCMScsJ3BvdW5kJzonXFx4QTMnLCdxdW90JzonXCInLCdRVU9UJzonXCInLCdyYXF1byc6J1xceEJCJywncmVnJzonXFx4QUUnLCdSRUcnOidcXHhBRScsJ3NlY3QnOidcXHhBNycsJ3NoeSc6J1xceEFEJywnc3VwMSc6J1xceEI5Jywnc3VwMic6J1xceEIyJywnc3VwMyc6J1xceEIzJywnc3psaWcnOidcXHhERicsJ3Rob3JuJzonXFx4RkUnLCdUSE9STic6J1xceERFJywndGltZXMnOidcXHhENycsJ3VhY3V0ZSc6J1xceEZBJywnVWFjdXRlJzonXFx4REEnLCd1Y2lyYyc6J1xceEZCJywnVWNpcmMnOidcXHhEQicsJ3VncmF2ZSc6J1xceEY5JywnVWdyYXZlJzonXFx4RDknLCd1bWwnOidcXHhBOCcsJ3V1bWwnOidcXHhGQycsJ1V1bWwnOidcXHhEQycsJ3lhY3V0ZSc6J1xceEZEJywnWWFjdXRlJzonXFx4REQnLCd5ZW4nOidcXHhBNScsJ3l1bWwnOidcXHhGRid9O1xuXHR2YXIgZGVjb2RlTWFwTnVtZXJpYyA9IHsnMCc6J1xcdUZGRkQnLCcxMjgnOidcXHUyMEFDJywnMTMwJzonXFx1MjAxQScsJzEzMSc6J1xcdTAxOTInLCcxMzInOidcXHUyMDFFJywnMTMzJzonXFx1MjAyNicsJzEzNCc6J1xcdTIwMjAnLCcxMzUnOidcXHUyMDIxJywnMTM2JzonXFx1MDJDNicsJzEzNyc6J1xcdTIwMzAnLCcxMzgnOidcXHUwMTYwJywnMTM5JzonXFx1MjAzOScsJzE0MCc6J1xcdTAxNTInLCcxNDInOidcXHUwMTdEJywnMTQ1JzonXFx1MjAxOCcsJzE0Nic6J1xcdTIwMTknLCcxNDcnOidcXHUyMDFDJywnMTQ4JzonXFx1MjAxRCcsJzE0OSc6J1xcdTIwMjInLCcxNTAnOidcXHUyMDEzJywnMTUxJzonXFx1MjAxNCcsJzE1Mic6J1xcdTAyREMnLCcxNTMnOidcXHUyMTIyJywnMTU0JzonXFx1MDE2MScsJzE1NSc6J1xcdTIwM0EnLCcxNTYnOidcXHUwMTUzJywnMTU4JzonXFx1MDE3RScsJzE1OSc6J1xcdTAxNzgnfTtcblx0dmFyIGludmFsaWRSZWZlcmVuY2VDb2RlUG9pbnRzID0gWzEsMiwzLDQsNSw2LDcsOCwxMSwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMSwxMjcsMTI4LDEyOSwxMzAsMTMxLDEzMiwxMzMsMTM0LDEzNSwxMzYsMTM3LDEzOCwxMzksMTQwLDE0MSwxNDIsMTQzLDE0NCwxNDUsMTQ2LDE0NywxNDgsMTQ5LDE1MCwxNTEsMTUyLDE1MywxNTQsMTU1LDE1NiwxNTcsMTU4LDE1OSw2NDk3Niw2NDk3Nyw2NDk3OCw2NDk3OSw2NDk4MCw2NDk4MSw2NDk4Miw2NDk4Myw2NDk4NCw2NDk4NSw2NDk4Niw2NDk4Nyw2NDk4OCw2NDk4OSw2NDk5MCw2NDk5MSw2NDk5Miw2NDk5Myw2NDk5NCw2NDk5NSw2NDk5Niw2NDk5Nyw2NDk5OCw2NDk5OSw2NTAwMCw2NTAwMSw2NTAwMiw2NTAwMyw2NTAwNCw2NTAwNSw2NTAwNiw2NTAwNyw2NTUzNCw2NTUzNSwxMzEwNzAsMTMxMDcxLDE5NjYwNiwxOTY2MDcsMjYyMTQyLDI2MjE0MywzMjc2NzgsMzI3Njc5LDM5MzIxNCwzOTMyMTUsNDU4NzUwLDQ1ODc1MSw1MjQyODYsNTI0Mjg3LDU4OTgyMiw1ODk4MjMsNjU1MzU4LDY1NTM1OSw3MjA4OTQsNzIwODk1LDc4NjQzMCw3ODY0MzEsODUxOTY2LDg1MTk2Nyw5MTc1MDIsOTE3NTAzLDk4MzAzOCw5ODMwMzksMTA0ODU3NCwxMDQ4NTc1LDExMTQxMTAsMTExNDExMV07XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIHN0cmluZ0Zyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cblx0dmFyIG9iamVjdCA9IHt9O1xuXHR2YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3QuaGFzT3duUHJvcGVydHk7XG5cdHZhciBoYXMgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5TmFtZSkge1xuXHRcdHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHlOYW1lKTtcblx0fTtcblxuXHR2YXIgY29udGFpbnMgPSBmdW5jdGlvbihhcnJheSwgdmFsdWUpIHtcblx0XHR2YXIgaW5kZXggPSAtMTtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG5cdFx0XHRpZiAoYXJyYXlbaW5kZXhdID09IHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblx0dmFyIG1lcmdlID0gZnVuY3Rpb24ob3B0aW9ucywgZGVmYXVsdHMpIHtcblx0XHRpZiAoIW9wdGlvbnMpIHtcblx0XHRcdHJldHVybiBkZWZhdWx0cztcblx0XHR9XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdHZhciBrZXk7XG5cdFx0Zm9yIChrZXkgaW4gZGVmYXVsdHMpIHtcblx0XHRcdC8vIEEgYGhhc093blByb3BlcnR5YCBjaGVjayBpcyBub3QgbmVlZGVkIGhlcmUsIHNpbmNlIG9ubHkgcmVjb2duaXplZFxuXHRcdFx0Ly8gb3B0aW9uIG5hbWVzIGFyZSB1c2VkIGFueXdheS4gQW55IG90aGVycyBhcmUgaWdub3JlZC5cblx0XHRcdHJlc3VsdFtrZXldID0gaGFzKG9wdGlvbnMsIGtleSkgPyBvcHRpb25zW2tleV0gOiBkZWZhdWx0c1trZXldO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9O1xuXG5cdC8vIE1vZGlmaWVkIHZlcnNpb24gb2YgYHVjczJlbmNvZGVgOyBzZWUgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlLlxuXHR2YXIgY29kZVBvaW50VG9TeW1ib2wgPSBmdW5jdGlvbihjb2RlUG9pbnQsIHN0cmljdCkge1xuXHRcdHZhciBvdXRwdXQgPSAnJztcblx0XHRpZiAoKGNvZGVQb2ludCA+PSAweEQ4MDAgJiYgY29kZVBvaW50IDw9IDB4REZGRikgfHwgY29kZVBvaW50ID4gMHgxMEZGRkYpIHtcblx0XHRcdC8vIFNlZSBpc3N1ZSAjNDpcblx0XHRcdC8vIOKAnE90aGVyd2lzZSwgaWYgdGhlIG51bWJlciBpcyBpbiB0aGUgcmFuZ2UgMHhEODAwIHRvIDB4REZGRiBvciBpc1xuXHRcdFx0Ly8gZ3JlYXRlciB0aGFuIDB4MTBGRkZGLCB0aGVuIHRoaXMgaXMgYSBwYXJzZSBlcnJvci4gUmV0dXJuIGEgVStGRkZEXG5cdFx0XHQvLyBSRVBMQUNFTUVOVCBDSEFSQUNURVIu4oCdXG5cdFx0XHRpZiAoc3RyaWN0KSB7XG5cdFx0XHRcdHBhcnNlRXJyb3IoJ2NoYXJhY3RlciByZWZlcmVuY2Ugb3V0c2lkZSB0aGUgcGVybWlzc2libGUgVW5pY29kZSByYW5nZScpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICdcXHVGRkZEJztcblx0XHR9XG5cdFx0aWYgKGhhcyhkZWNvZGVNYXBOdW1lcmljLCBjb2RlUG9pbnQpKSB7XG5cdFx0XHRpZiAoc3RyaWN0KSB7XG5cdFx0XHRcdHBhcnNlRXJyb3IoJ2Rpc2FsbG93ZWQgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGRlY29kZU1hcE51bWVyaWNbY29kZVBvaW50XTtcblx0XHR9XG5cdFx0aWYgKHN0cmljdCAmJiBjb250YWlucyhpbnZhbGlkUmVmZXJlbmNlQ29kZVBvaW50cywgY29kZVBvaW50KSkge1xuXHRcdFx0cGFyc2VFcnJvcignZGlzYWxsb3dlZCBjaGFyYWN0ZXIgcmVmZXJlbmNlJyk7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcblx0XHRcdGNvZGVQb2ludCAtPSAweDEwMDAwO1xuXHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApO1xuXHRcdFx0Y29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkY7XG5cdFx0fVxuXHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50KTtcblx0XHRyZXR1cm4gb3V0cHV0O1xuXHR9O1xuXG5cdHZhciBoZXhFc2NhcGUgPSBmdW5jdGlvbihjb2RlUG9pbnQpIHtcblx0XHRyZXR1cm4gJyYjeCcgKyBjb2RlUG9pbnQudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCkgKyAnOyc7XG5cdH07XG5cblx0dmFyIGRlY0VzY2FwZSA9IGZ1bmN0aW9uKGNvZGVQb2ludCkge1xuXHRcdHJldHVybiAnJiMnICsgY29kZVBvaW50ICsgJzsnO1xuXHR9O1xuXG5cdHZhciBwYXJzZUVycm9yID0gZnVuY3Rpb24obWVzc2FnZSkge1xuXHRcdHRocm93IEVycm9yKCdQYXJzZSBlcnJvcjogJyArIG1lc3NhZ2UpO1xuXHR9O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBlbmNvZGUgPSBmdW5jdGlvbihzdHJpbmcsIG9wdGlvbnMpIHtcblx0XHRvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZW5jb2RlLm9wdGlvbnMpO1xuXHRcdHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdDtcblx0XHRpZiAoc3RyaWN0ICYmIHJlZ2V4SW52YWxpZFJhd0NvZGVQb2ludC50ZXN0KHN0cmluZykpIHtcblx0XHRcdHBhcnNlRXJyb3IoJ2ZvcmJpZGRlbiBjb2RlIHBvaW50Jyk7XG5cdFx0fVxuXHRcdHZhciBlbmNvZGVFdmVyeXRoaW5nID0gb3B0aW9ucy5lbmNvZGVFdmVyeXRoaW5nO1xuXHRcdHZhciB1c2VOYW1lZFJlZmVyZW5jZXMgPSBvcHRpb25zLnVzZU5hbWVkUmVmZXJlbmNlcztcblx0XHR2YXIgYWxsb3dVbnNhZmVTeW1ib2xzID0gb3B0aW9ucy5hbGxvd1Vuc2FmZVN5bWJvbHM7XG5cdFx0dmFyIGVzY2FwZUNvZGVQb2ludCA9IG9wdGlvbnMuZGVjaW1hbCA/IGRlY0VzY2FwZSA6IGhleEVzY2FwZTtcblxuXHRcdHZhciBlc2NhcGVCbXBTeW1ib2wgPSBmdW5jdGlvbihzeW1ib2wpIHtcblx0XHRcdHJldHVybiBlc2NhcGVDb2RlUG9pbnQoc3ltYm9sLmNoYXJDb2RlQXQoMCkpO1xuXHRcdH07XG5cblx0XHRpZiAoZW5jb2RlRXZlcnl0aGluZykge1xuXHRcdFx0Ly8gRW5jb2RlIEFTQ0lJIHN5bWJvbHMuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEFzY2lpV2hpdGVsaXN0LCBmdW5jdGlvbihzeW1ib2wpIHtcblx0XHRcdFx0Ly8gVXNlIG5hbWVkIHJlZmVyZW5jZXMgaWYgcmVxdWVzdGVkICYgcG9zc2libGUuXG5cdFx0XHRcdGlmICh1c2VOYW1lZFJlZmVyZW5jZXMgJiYgaGFzKGVuY29kZU1hcCwgc3ltYm9sKSkge1xuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3ltYm9sXSArICc7Jztcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZXNjYXBlQm1wU3ltYm9sKHN5bWJvbCk7XG5cdFx0XHR9KTtcblx0XHRcdC8vIFNob3J0ZW4gYSBmZXcgZXNjYXBlcyB0aGF0IHJlcHJlc2VudCB0d28gc3ltYm9scywgb2Ygd2hpY2ggYXQgbGVhc3Qgb25lXG5cdFx0XHQvLyBpcyB3aXRoaW4gdGhlIEFTQ0lJIHJhbmdlLlxuXHRcdFx0aWYgKHVzZU5hbWVkUmVmZXJlbmNlcykge1xuXHRcdFx0XHRzdHJpbmcgPSBzdHJpbmdcblx0XHRcdFx0XHQucmVwbGFjZSgvJmd0O1xcdTIwRDIvZywgJyZudmd0OycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyZsdDtcXHUyMEQyL2csICcmbnZsdDsnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8mI3g2NjsmI3g2QTsvZywgJyZmamxpZzsnKTtcblx0XHRcdH1cblx0XHRcdC8vIEVuY29kZSBub24tQVNDSUkgc3ltYm9scy5cblx0XHRcdGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdFx0Ly8gRW5jb2RlIG5vbi1BU0NJSSBzeW1ib2xzIHRoYXQgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBuYW1lZCByZWZlcmVuY2UuXG5cdFx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RW5jb2RlTm9uQXNjaWksIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhlbmNvZGVNYXAsIHN0cmluZylgIGhlcmUuXG5cdFx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzdHJpbmddICsgJzsnO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIE5vdGU6IGFueSByZW1haW5pbmcgbm9uLUFTQ0lJIHN5bWJvbHMgYXJlIGhhbmRsZWQgb3V0c2lkZSBvZiB0aGUgYGlmYC5cblx0XHR9IGVsc2UgaWYgKHVzZU5hbWVkUmVmZXJlbmNlcykge1xuXHRcdFx0Ly8gQXBwbHkgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMuXG5cdFx0XHQvLyBFbmNvZGUgYDw+XCInJmAgdXNpbmcgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMuXG5cdFx0XHRpZiAoIWFsbG93VW5zYWZlU3ltYm9scykge1xuXHRcdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVzY2FwZSwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzdHJpbmddICsgJzsnOyAvLyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoKWAgaGVyZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIFNob3J0ZW4gZXNjYXBlcyB0aGF0IHJlcHJlc2VudCB0d28gc3ltYm9scywgb2Ygd2hpY2ggYXQgbGVhc3Qgb25lIGlzXG5cdFx0XHQvLyBgPD5cIicmYC5cblx0XHRcdHN0cmluZyA9IHN0cmluZ1xuXHRcdFx0XHQucmVwbGFjZSgvJmd0O1xcdTIwRDIvZywgJyZudmd0OycpXG5cdFx0XHRcdC5yZXBsYWNlKC8mbHQ7XFx1MjBEMi9nLCAnJm52bHQ7Jyk7XG5cdFx0XHQvLyBFbmNvZGUgbm9uLUFTQ0lJIHN5bWJvbHMgdGhhdCBjYW4gYmUgcmVwbGFjZWQgd2l0aCBhIG5hbWVkIHJlZmVyZW5jZS5cblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RW5jb2RlTm9uQXNjaWksIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZW5jb2RlTWFwLCBzdHJpbmcpYCBoZXJlLlxuXHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N0cmluZ10gKyAnOyc7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKCFhbGxvd1Vuc2FmZVN5bWJvbHMpIHtcblx0XHRcdC8vIEVuY29kZSBgPD5cIicmYCB1c2luZyBoZXhhZGVjaW1hbCBlc2NhcGVzLCBub3cgdGhhdCB0aGV54oCZcmUgbm90IGhhbmRsZWRcblx0XHRcdC8vIHVzaW5nIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGVzY2FwZUJtcFN5bWJvbCk7XG5cdFx0fVxuXHRcdHJldHVybiBzdHJpbmdcblx0XHRcdC8vIEVuY29kZSBhc3RyYWwgc3ltYm9scy5cblx0XHRcdC5yZXBsYWNlKHJlZ2V4QXN0cmFsU3ltYm9scywgZnVuY3Rpb24oJDApIHtcblx0XHRcdFx0Ly8gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2phdmFzY3JpcHQtZW5jb2Rpbmcjc3Vycm9nYXRlLWZvcm11bGFlXG5cdFx0XHRcdHZhciBoaWdoID0gJDAuY2hhckNvZGVBdCgwKTtcblx0XHRcdFx0dmFyIGxvdyA9ICQwLmNoYXJDb2RlQXQoMSk7XG5cdFx0XHRcdHZhciBjb2RlUG9pbnQgPSAoaGlnaCAtIDB4RDgwMCkgKiAweDQwMCArIGxvdyAtIDB4REMwMCArIDB4MTAwMDA7XG5cdFx0XHRcdHJldHVybiBlc2NhcGVDb2RlUG9pbnQoY29kZVBvaW50KTtcblx0XHRcdH0pXG5cdFx0XHQvLyBFbmNvZGUgYW55IHJlbWFpbmluZyBCTVAgc3ltYm9scyB0aGF0IGFyZSBub3QgcHJpbnRhYmxlIEFTQ0lJIHN5bWJvbHNcblx0XHRcdC8vIHVzaW5nIGEgaGV4YWRlY2ltYWwgZXNjYXBlLlxuXHRcdFx0LnJlcGxhY2UocmVnZXhCbXBXaGl0ZWxpc3QsIGVzY2FwZUJtcFN5bWJvbCk7XG5cdH07XG5cdC8vIEV4cG9zZSBkZWZhdWx0IG9wdGlvbnMgKHNvIHRoZXkgY2FuIGJlIG92ZXJyaWRkZW4gZ2xvYmFsbHkpLlxuXHRlbmNvZGUub3B0aW9ucyA9IHtcblx0XHQnYWxsb3dVbnNhZmVTeW1ib2xzJzogZmFsc2UsXG5cdFx0J2VuY29kZUV2ZXJ5dGhpbmcnOiBmYWxzZSxcblx0XHQnc3RyaWN0JzogZmFsc2UsXG5cdFx0J3VzZU5hbWVkUmVmZXJlbmNlcyc6IGZhbHNlLFxuXHRcdCdkZWNpbWFsJyA6IGZhbHNlXG5cdH07XG5cblx0dmFyIGRlY29kZSA9IGZ1bmN0aW9uKGh0bWwsIG9wdGlvbnMpIHtcblx0XHRvcHRpb25zID0gbWVyZ2Uob3B0aW9ucywgZGVjb2RlLm9wdGlvbnMpO1xuXHRcdHZhciBzdHJpY3QgPSBvcHRpb25zLnN0cmljdDtcblx0XHRpZiAoc3RyaWN0ICYmIHJlZ2V4SW52YWxpZEVudGl0eS50ZXN0KGh0bWwpKSB7XG5cdFx0XHRwYXJzZUVycm9yKCdtYWxmb3JtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdH1cblx0XHRyZXR1cm4gaHRtbC5yZXBsYWNlKHJlZ2V4RGVjb2RlLCBmdW5jdGlvbigkMCwgJDEsICQyLCAkMywgJDQsICQ1LCAkNiwgJDcsICQ4KSB7XG5cdFx0XHR2YXIgY29kZVBvaW50O1xuXHRcdFx0dmFyIHNlbWljb2xvbjtcblx0XHRcdHZhciBkZWNEaWdpdHM7XG5cdFx0XHR2YXIgaGV4RGlnaXRzO1xuXHRcdFx0dmFyIHJlZmVyZW5jZTtcblx0XHRcdHZhciBuZXh0O1xuXG5cdFx0XHRpZiAoJDEpIHtcblx0XHRcdFx0cmVmZXJlbmNlID0gJDE7XG5cdFx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhkZWNvZGVNYXAsIHJlZmVyZW5jZSlgLlxuXHRcdFx0XHRyZXR1cm4gZGVjb2RlTWFwW3JlZmVyZW5jZV07XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkMikge1xuXHRcdFx0XHQvLyBEZWNvZGUgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMgd2l0aG91dCB0cmFpbGluZyBgO2AsIGUuZy4gYCZhbXBgLlxuXHRcdFx0XHQvLyBUaGlzIGlzIG9ubHkgYSBwYXJzZSBlcnJvciBpZiBpdCBnZXRzIGNvbnZlcnRlZCB0byBgJmAsIG9yIGlmIGl0IGlzXG5cdFx0XHRcdC8vIGZvbGxvd2VkIGJ5IGA9YCBpbiBhbiBhdHRyaWJ1dGUgY29udGV4dC5cblx0XHRcdFx0cmVmZXJlbmNlID0gJDI7XG5cdFx0XHRcdG5leHQgPSAkMztcblx0XHRcdFx0aWYgKG5leHQgJiYgb3B0aW9ucy5pc0F0dHJpYnV0ZVZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKHN0cmljdCAmJiBuZXh0ID09ICc9Jykge1xuXHRcdFx0XHRcdFx0cGFyc2VFcnJvcignYCZgIGRpZCBub3Qgc3RhcnQgYSBjaGFyYWN0ZXIgcmVmZXJlbmNlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiAkMDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoc3RyaWN0KSB7XG5cdFx0XHRcdFx0XHRwYXJzZUVycm9yKFxuXHRcdFx0XHRcdFx0XHQnbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZSB3YXMgbm90IHRlcm1pbmF0ZWQgYnkgYSBzZW1pY29sb24nXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZGVjb2RlTWFwTGVnYWN5LCByZWZlcmVuY2UpYC5cblx0XHRcdFx0XHRyZXR1cm4gZGVjb2RlTWFwTGVnYWN5W3JlZmVyZW5jZV0gKyAobmV4dCB8fCAnJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCQ0KSB7XG5cdFx0XHRcdC8vIERlY29kZSBkZWNpbWFsIGVzY2FwZXMsIGUuZy4gYCYjMTE5NTU4O2AuXG5cdFx0XHRcdGRlY0RpZ2l0cyA9ICQ0O1xuXHRcdFx0XHRzZW1pY29sb24gPSAkNTtcblx0XHRcdFx0aWYgKHN0cmljdCAmJiAhc2VtaWNvbG9uKSB7XG5cdFx0XHRcdFx0cGFyc2VFcnJvcignY2hhcmFjdGVyIHJlZmVyZW5jZSB3YXMgbm90IHRlcm1pbmF0ZWQgYnkgYSBzZW1pY29sb24nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb2RlUG9pbnQgPSBwYXJzZUludChkZWNEaWdpdHMsIDEwKTtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludFRvU3ltYm9sKGNvZGVQb2ludCwgc3RyaWN0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCQ2KSB7XG5cdFx0XHRcdC8vIERlY29kZSBoZXhhZGVjaW1hbCBlc2NhcGVzLCBlLmcuIGAmI3gxRDMwNjtgLlxuXHRcdFx0XHRoZXhEaWdpdHMgPSAkNjtcblx0XHRcdFx0c2VtaWNvbG9uID0gJDc7XG5cdFx0XHRcdGlmIChzdHJpY3QgJiYgIXNlbWljb2xvbikge1xuXHRcdFx0XHRcdHBhcnNlRXJyb3IoJ2NoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29kZVBvaW50ID0gcGFyc2VJbnQoaGV4RGlnaXRzLCAxNik7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnRUb1N5bWJvbChjb2RlUG9pbnQsIHN0cmljdCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHdl4oCZcmUgc3RpbGwgaGVyZSwgYGlmICgkNylgIGlzIGltcGxpZWQ7IGl04oCZcyBhbiBhbWJpZ3VvdXNcblx0XHRcdC8vIGFtcGVyc2FuZCBmb3Igc3VyZS4gaHR0cHM6Ly9tdGhzLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzXG5cdFx0XHRpZiAoc3RyaWN0KSB7XG5cdFx0XHRcdHBhcnNlRXJyb3IoXG5cdFx0XHRcdFx0J25hbWVkIGNoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJ1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuICQwO1xuXHRcdH0pO1xuXHR9O1xuXHQvLyBFeHBvc2UgZGVmYXVsdCBvcHRpb25zIChzbyB0aGV5IGNhbiBiZSBvdmVycmlkZGVuIGdsb2JhbGx5KS5cblx0ZGVjb2RlLm9wdGlvbnMgPSB7XG5cdFx0J2lzQXR0cmlidXRlVmFsdWUnOiBmYWxzZSxcblx0XHQnc3RyaWN0JzogZmFsc2Vcblx0fTtcblxuXHR2YXIgZXNjYXBlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlZ2V4RXNjYXBlLCBmdW5jdGlvbigkMCkge1xuXHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGVzY2FwZU1hcCwgJDApYCBoZXJlLlxuXHRcdFx0cmV0dXJuIGVzY2FwZU1hcFskMF07XG5cdFx0fSk7XG5cdH07XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIGhlID0ge1xuXHRcdCd2ZXJzaW9uJzogJzEuMi4wJyxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCdkZWNvZGUnOiBkZWNvZGUsXG5cdFx0J2VzY2FwZSc6IGVzY2FwZSxcblx0XHQndW5lc2NhcGUnOiBkZWNvZGVcblx0fTtcblxuXHQvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcblx0Ly8gbGlrZSB0aGUgZm9sbG93aW5nOlxuXHRpZiAoXG5cdFx0dHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmXG5cdFx0dHlwZW9mIGRlZmluZS5hbWQgPT0gJ29iamVjdCcgJiZcblx0XHRkZWZpbmUuYW1kXG5cdCkge1xuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBoZTtcblx0XHR9KTtcblx0fVx0ZWxzZSBpZiAoZnJlZUV4cG9ydHMgJiYgIWZyZWVFeHBvcnRzLm5vZGVUeXBlKSB7XG5cdFx0aWYgKGZyZWVNb2R1bGUpIHsgLy8gaW4gTm9kZS5qcywgaW8uanMsIG9yIFJpbmdvSlMgdjAuOC4wK1xuXHRcdFx0ZnJlZU1vZHVsZS5leHBvcnRzID0gaGU7XG5cdFx0fSBlbHNlIHsgLy8gaW4gTmFyd2hhbCBvciBSaW5nb0pTIHYwLjcuMC1cblx0XHRcdGZvciAodmFyIGtleSBpbiBoZSkge1xuXHRcdFx0XHRoYXMoaGUsIGtleSkgJiYgKGZyZWVFeHBvcnRzW2tleV0gPSBoZVtrZXldKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7IC8vIGluIFJoaW5vIG9yIGEgd2ViIGJyb3dzZXJcblx0XHRyb290LmhlID0gaGU7XG5cdH1cblxufSh0aGlzKSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCB7SnNvbjJDc3Z9ID0gcmVxdWlyZSgnLi9qc29uMmNzdicpLCAvLyBSZXF1aXJlIG91ciBqc29uLTItY3N2IGNvZGVcbiAgICB7Q3N2Mkpzb259ID0gcmVxdWlyZSgnLi9jc3YyanNvbicpLCAvLyBSZXF1aXJlIG91ciBjc3YtMi1qc29uIGNvZGVcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAganNvbjJjc3Y6IChkYXRhLCBjYWxsYmFjaywgb3B0aW9ucykgPT4gY29udmVydChKc29uMkNzdiwgZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpLFxuICAgIGNzdjJqc29uOiAoZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpID0+IGNvbnZlcnQoQ3N2Mkpzb24sIGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSxcbiAgICBqc29uMmNzdkFzeW5jOiAoanNvbiwgb3B0aW9ucykgPT4gY29udmVydEFzeW5jKEpzb24yQ3N2LCBqc29uLCBvcHRpb25zKSxcbiAgICBjc3YyanNvbkFzeW5jOiAoY3N2LCBvcHRpb25zKSA9PiBjb252ZXJ0QXN5bmMoQ3N2Mkpzb24sIGNzdiwgb3B0aW9ucyksXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBTaW5jZSB2My4wLjBcbiAgICAgKi9cbiAgICBqc29uMmNzdlByb21pc2lmaWVkOiAoanNvbiwgb3B0aW9ucykgPT4gZGVwcmVjYXRlZEFzeW5jKEpzb24yQ3N2LCAnanNvbjJjc3ZQcm9taXNpZmllZCgpJywgJ2pzb24yY3N2QXN5bmMoKScsIGpzb24sIG9wdGlvbnMpLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgU2luY2UgdjMuMC4wXG4gICAgICovXG4gICAgY3N2Mmpzb25Qcm9taXNpZmllZDogKGNzdiwgb3B0aW9ucykgPT4gZGVwcmVjYXRlZEFzeW5jKENzdjJKc29uLCAnY3N2Mmpzb25Qcm9taXNpZmllZCgpJywgJ2NzdjJqc29uQXN5bmMoKScsIGNzdiwgb3B0aW9ucylcbn07XG5cbi8qKlxuICogQWJzdHJhY3RlZCBjb252ZXJ0ZXIgZnVuY3Rpb24gZm9yIGpzb24yY3N2IGFuZCBjc3YyanNvbiBmdW5jdGlvbmFsaXR5XG4gKiBUYWtlcyBpbiB0aGUgY29udmVydGVyIHRvIGJlIHVzZWQgKGVpdGhlciBKc29uMkNzdiBvciBDc3YySnNvbilcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqIEBwYXJhbSBvcHRpb25zXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnQoY29udmVydGVyLCBkYXRhLCBjYWxsYmFjaywgb3B0aW9ucykge1xuICAgIHJldHVybiB1dGlscy5jb252ZXJ0KHtcbiAgICAgICAgZGF0YTogZGF0YSxcbiAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGNvbnZlcnRlcjogY29udmVydGVyXG4gICAgfSk7XG59XG5cbi8qKlxuICogU2ltcGxlIHdheSB0byBwcm9taXNpZnkgYSBjYWxsYmFjayB2ZXJzaW9uIG9mIGpzb24yY3N2IG9yIGNzdjJqc29uXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnRBc3luYyhjb252ZXJ0ZXIsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gY29udmVydChjb252ZXJ0ZXIsIGRhdGEsIChlcnIsIGRhdGEpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNvbHZlKGRhdGEpO1xuICAgIH0sIG9wdGlvbnMpKTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgd2F5IHRvIHByb3ZpZGUgYSBkZXByZWNhdGlvbiB3YXJuaW5nIGZvciBwcmV2aW91cyBwcm9taXNpZmllZCB2ZXJzaW9uc1xuICogb2YgbW9kdWxlIGZ1bmN0aW9uYWxpdHkuXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gZGVwcmVjYXRlZE5hbWVcbiAqIEBwYXJhbSByZXBsYWNlbWVudE5hbWVcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAqL1xuZnVuY3Rpb24gZGVwcmVjYXRlZEFzeW5jKGNvbnZlcnRlciwgZGVwcmVjYXRlZE5hbWUsIHJlcGxhY2VtZW50TmFtZSwgZGF0YSwgb3B0aW9ucykge1xuICAgIGNvbnNvbGUud2FybignV0FSTklORzogJyArIGRlcHJlY2F0ZWROYW1lICsgJyBpcyBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgc29vbi4gUGxlYXNlIHVzZSAnICsgcmVwbGFjZW1lbnROYW1lICsgJyBpbnN0ZWFkLicpO1xuICAgIHJldHVybiBjb252ZXJ0QXN5bmMoY29udmVydGVyLCBkYXRhLCBvcHRpb25zKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IHBhdGggPSByZXF1aXJlKCdkb2MtcGF0aCcpLFxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzb24nKSxcbiAgICB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuY29uc3QgQ3N2Mkpzb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgY29uc3QgZXNjYXBlZFdyYXBEZWxpbWl0ZXJSZWdleCA9IG5ldyBSZWdFeHAob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCArIG9wdGlvbnMuZGVsaW1pdGVyLndyYXAsICdnJyksXG4gICAgICAgIGV4Y2VsQk9NUmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIGNvbnN0YW50cy52YWx1ZXMuZXhjZWxCT00pO1xuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIGhlYWRlciBrZXksIGlmIHNwZWNpZmllZCBieSB0aGUgdXNlciB2aWEgdGhlIHByb3ZpZGVkIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gaGVhZGVyS2V5XG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcktleShoZWFkZXJLZXkpIHtcbiAgICAgICAgaGVhZGVyS2V5ID0gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoaGVhZGVyS2V5KTtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUhlYWRlckZpZWxkcykge1xuICAgICAgICAgICAgcmV0dXJuIGhlYWRlcktleS5zcGxpdCgnLicpXG4gICAgICAgICAgICAgICAgLm1hcCgoY29tcG9uZW50KSA9PiBjb21wb25lbnQudHJpbSgpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhlYWRlcktleTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB0aGUgSlNPTiBoZWFkaW5nIGZyb20gdGhlIENTVlxuICAgICAqIEBwYXJhbSBsaW5lcyB7U3RyaW5nW119IGNzdiBsaW5lcyBzcGxpdCBieSBFT0wgZGVsaW1pdGVyXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVIZWFkaW5nKGxpbmVzKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB7bGluZXN9LFxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYW5kIHJldHVybiB0aGUgaGVhZGluZyBrZXlzXG4gICAgICAgICAgICBoZWFkZXJSb3cgPSBwYXJhbXMubGluZXNbMF07XG4gICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBoZWFkZXJSb3cubWFwKChoZWFkZXJLZXksIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3NIZWFkZXJLZXkoaGVhZGVyS2V5KSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQga2V5cywgZmlsdGVyIHRoZSBnZW5lcmF0ZWQga2V5cyB0byBqdXN0IHRoZSB1c2VyIHByb3ZpZGVkIGtleXMgc28gd2UgYWxzbyBoYXZlIHRoZSBrZXkgaW5kZXhcbiAgICAgICAgaWYgKG9wdGlvbnMua2V5cykge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMuZmlsdGVyKChoZWFkZXJLZXkpID0+IG9wdGlvbnMua2V5cy5pbmNsdWRlcyhoZWFkZXJLZXkudmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3BsaXRzIHRoZSBsaW5lcyBvZiB0aGUgQ1NWIHN0cmluZyBieSB0aGUgRU9MIGRlbGltaXRlciBhbmQgcmVzb2x2ZXMgYW5kIGFycmF5IG9mIHN0cmluZ3MgKGxpbmVzKVxuICAgICAqIEBwYXJhbSBjc3ZcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48U3RyaW5nW10+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNwbGl0Q3N2TGluZXMoY3N2KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3BsaXRMaW5lcyhjc3YpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBFeGNlbCBCT00gdmFsdWUsIGlmIHNwZWNpZmllZCBieSB0aGUgb3B0aW9ucyBvYmplY3RcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICogQHJldHVybnMge1Byb21pc2UuPFN0cmluZz59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RyaXBFeGNlbEJPTShjc3YpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuZXhjZWxCT00pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY3N2LnJlcGxhY2UoZXhjZWxCT01SZWdleCwgJycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNzdik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgc3BsaXRzIGEgbGluZSBzbyB0aGF0IHdlIGNhbiBoYW5kbGUgd3JhcHBlZCBmaWVsZHNcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3BsaXRMaW5lcyhjc3YpIHtcbiAgICAgICAgLy8gUGFyc2Ugb3V0IHRoZSBsaW5lLi4uXG4gICAgICAgIGxldCBsaW5lcyA9IFtdLFxuICAgICAgICAgICAgc3BsaXRMaW5lID0gW10sXG4gICAgICAgICAgICBjaGFyYWN0ZXIsXG4gICAgICAgICAgICBjaGFyQmVmb3JlLFxuICAgICAgICAgICAgY2hhckFmdGVyLFxuICAgICAgICAgICAgbmV4dE5DaGFyLFxuICAgICAgICAgICAgbGFzdENoYXJhY3RlckluZGV4ID0gY3N2Lmxlbmd0aCAtIDEsXG4gICAgICAgICAgICBlb2xEZWxpbWl0ZXJMZW5ndGggPSBvcHRpb25zLmRlbGltaXRlci5lb2wubGVuZ3RoLFxuICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMgPSB7XG4gICAgICAgICAgICAgICAgaW5zaWRlV3JhcERlbGltaXRlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGFyc2luZ1ZhbHVlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGp1c3RQYXJzZWREb3VibGVRdW90ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleDogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIGxpbmUgdG8gaWRlbnRpZnkgd2hlcmUgdG8gc3BsaXQgdGhlIHZhbHVlc1xuICAgICAgICB3aGlsZSAoaW5kZXggPCBjc3YubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDdXJyZW50IGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhcmFjdGVyID0gY3N2W2luZGV4XTtcbiAgICAgICAgICAgIC8vIFByZXZpb3VzIGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhckJlZm9yZSA9IGluZGV4ID8gY3N2W2luZGV4IC0gMV0gOiAnJztcbiAgICAgICAgICAgIC8vIE5leHQgY2hhcmFjdGVyXG4gICAgICAgICAgICBjaGFyQWZ0ZXIgPSBpbmRleCA8IGxhc3RDaGFyYWN0ZXJJbmRleCA/IGNzdltpbmRleCArIDFdIDogJyc7XG4gICAgICAgICAgICAvLyBOZXh0IG4gY2hhcmFjdGVycywgaW5jbHVkaW5nIHRoZSBjdXJyZW50IGNoYXJhY3Rlciwgd2hlcmUgbiA9IGxlbmd0aChFT0wgZGVsaW1pdGVyKVxuICAgICAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHRoZSBjaGVja2luZyBvZiBhbiBFT0wgZGVsaW1pdGVyIHdoZW4gaWYgaXQgaXMgbW9yZSB0aGFuIGEgc2luZ2xlIGNoYXJhY3RlciAoZWcuICdcXHJcXG4nKVxuICAgICAgICAgICAgbmV4dE5DaGFyID0gdXRpbHMuZ2V0TkNoYXJhY3RlcnMoY3N2LCBpbmRleCwgZW9sRGVsaW1pdGVyTGVuZ3RoKTtcblxuICAgICAgICAgICAgaWYgKChuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJiAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciB8fFxuICAgICAgICAgICAgICAgIGluZGV4ID09PSBsYXN0Q2hhcmFjdGVySW5kZXgpICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhbiBFT0wgZGVsaW1pdGVyIG9yIHRoZSBlbmQgb2YgdGhlIGNzdiBhbmQgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGZpZWxkIGRlbGltaXRlci4uLlxuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHN0YXJ0IGluZGV4IGlzIHRoZSBjdXJyZW50IGluZGV4IChhbmQgc2luY2UgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGNvbW1hKSxcbiAgICAgICAgICAgICAgICAvLyAgIHRoZW4gdGhlIHZhbHVlIGJlaW5nIHBhcnNlZCBpcyBhbiBlbXB0eSB2YWx1ZSBhY2NvcmRpbmdseSwgYWRkIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgICAgICAgICAgIGxldCBwYXJzZWRWYWx1ZSA9IG5leHROQ2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sICYmIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPT09IGluZGV4XG4gICAgICAgICAgICAgICAgICAgID8gJydcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGVyZSdzIGEgdmFsaWQgdmFsdWUsIGFuZCB0aGUgc3RhcnQgaW5kZXggaXNuJ3QgdGhlIGN1cnJlbnQgaW5kZXgsIGdyYWIgdGhlIHdob2xlIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogY3N2LnN1YnN0cihzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4KTtcblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggdGhlIHZhbHVlIGZvciB0aGUgZmllbGQgdGhhdCB3ZSB3ZXJlIHBhcnNpbmdcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChwYXJzZWRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGUgbGFzdCBjaGFyYWN0ZXIgaXMgYSBjb21tYSwgdGhlcmUncyBzdGlsbCBhbiBhZGRpdGlvbmFsIGltcGxpZWQgZmllbGQgdmFsdWUgdHJhaWxpbmcgdGhlIGNvbW1hLlxuICAgICAgICAgICAgICAgIC8vICAgU2luY2UgdGhpcyB2YWx1ZSBpcyBlbXB0eSwgd2UgcHVzaCBhbiBleHRyYSBlbXB0eSB2YWx1ZVxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKCcnKTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmFsbHksIHB1c2ggdGhlIHNwbGl0IGxpbmUgdmFsdWVzIGludG8gdGhlIGxpbmVzIGFycmF5IGFuZCBjbGVhciB0aGUgc3BsaXQgbGluZVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3BsaXRMaW5lKTtcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUgPSBbXTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyBlb2xEZWxpbWl0ZXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gbGFzdENoYXJhY3RlckluZGV4ICYmIGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaCB0aGUgZW5kIG9mIHRoZSBDU1YgYW5kIHRoZSBjdXJyZW50IGNoYXJhY3RlciBpcyBhIGZpZWxkIGRlbGltaXRlclxuXG4gICAgICAgICAgICAgICAgLy8gUGFyc2UgdGhlIHByZXZpb3VzbHkgc2VlbiB2YWx1ZSBhbmQgYWRkIGl0IHRvIHRoZSBsaW5lXG4gICAgICAgICAgICAgICAgbGV0IHBhcnNlZFZhbHVlID0gY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCBpbmRleCk7XG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2gocGFyc2VkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gVGhlbiBhZGQgYW4gZW1wdHkgc3RyaW5nIHRvIHRoZSBsaW5lIHNpbmNlIHRoZSBsYXN0IGNoYXJhY3RlciBiZWluZyBhIGZpZWxkIGRlbGltaXRlciBpbmRpY2F0ZXMgYW4gZW1wdHkgZmllbGRcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaCgnJyk7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChzcGxpdExpbmUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gbGFzdENoYXJhY3RlckluZGV4IHx8IG5leHROQ2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sICYmXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJlbid0IGluc2lkZSB3cmFwIGRlbGltaXRlcnMgb3IgaWYgd2UgYXJlIGJ1dCB0aGUgY2hhcmFjdGVyIGJlZm9yZSB3YXMgYSB3cmFwIGRlbGltaXRlciBhbmQgd2UgZGlkbid0IGp1c3Qgc2VlIHR3b1xuICAgICAgICAgICAgICAgICghc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciB8fFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgIXN0YXRlVmFyaWFibGVzLmp1c3RQYXJzZWREb3VibGVRdW90ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgaWYgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBsaW5lIG9yIGNzdiAoYW5kIGN1cnJlbnQgY2hhcmFjdGVyIGlzIG5vdCBhIGZpZWxkIGRlbGltaXRlcilcblxuICAgICAgICAgICAgICAgIGxldCB0b0luZGV4ID0gaW5kZXggIT09IGxhc3RDaGFyYWN0ZXJJbmRleCB8fCBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwID8gaW5kZXggOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgcmVtYWluaW5nIHZhbHVlIGFuZCBhZGQgaXQgdG8gdGhlIHNwbGl0IGxpbmUgbGlzdCBvZiB2YWx1ZXNcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIHRvSW5kZXgpKTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmFsbHksIHB1c2ggdGhlIHNwbGl0IGxpbmUgdmFsdWVzIGludG8gdGhlIGxpbmVzIGFycmF5IGFuZCBjbGVhciB0aGUgc3BsaXQgbGluZVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3BsaXRMaW5lKTtcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUgPSBbXTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyBlb2xEZWxpbWl0ZXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoY2hhckJlZm9yZSAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCB8fCBzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCkgJiZcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgdXRpbHMuZ2V0TkNoYXJhY3RlcnMoY3N2LCBpbmRleCArIDEsIGVvbERlbGltaXRlckxlbmd0aCkgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoIGEgd3JhcCB3aGljaCBpcyBub3QgcHJlY2VkZWQgYnkgYSB3cmFwIGRlbGltIGFuZCB0aGUgbmV4dCBjaGFyYWN0ZXIgaXMgYW4gRU9MIGRlbGltIChpZS4gKlwiXFxuKVxuXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIE5leHQgaXRlcmF0aW9uIHdpbGwgc3Vic3RyaW5nLCBhZGQgdGhlIHZhbHVlIHRvIHRoZSBsaW5lLCBhbmQgcHVzaCB0aGUgbGluZSBvbnRvIHRoZSBhcnJheSBvZiBsaW5lc1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgKGluZGV4ID09PSAwIHx8IHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXggLSBlb2xEZWxpbWl0ZXJMZW5ndGgsIGVvbERlbGltaXRlckxlbmd0aCkgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgbGluZSBzdGFydHMgd2l0aCBhIHdyYXAgZGVsaW1pdGVyIChpZS4gXCIqKVxuXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBjaGFyQWZ0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHdyYXAgZGVsaW1pdGVyIHdpdGggYSBmaWVsZCBkZWxpbWl0ZXIgYWZ0ZXIgaXQgKGllLiAqXCIsKVxuXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCBpbmRleCArIDEpKTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyAyOyAvLyBuZXh0IHZhbHVlIHN0YXJ0cyBhZnRlciB0aGUgZmllbGQgZGVsaW1pdGVyXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiZcbiAgICAgICAgICAgICAgICAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJiAhc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHdyYXAgZGVsaW1pdGVyIGFmdGVyIGEgY29tbWEgYW5kIHdlIGFyZW4ndCBpbnNpZGUgYSB3cmFwIGRlbGltaXRlclxuXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCAmJlxuICAgICAgICAgICAgICAgICFzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyICYmIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSB3cmFwIGRlbGltaXRlciB3aXRoIGEgZmllbGQgZGVsaW1pdGVyIGFmdGVyIGl0IChpZS4gLFwiKilcblxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKGNzdi5zdWJzdHJpbmcoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCwgaW5kZXggLSAxKSk7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBjaGFyQWZ0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXApIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSBydW4gaW50byBhbiBlc2NhcGVkIHF1b3RlIChpZS4gXCJcIikgc2tpcCBwYXN0IHRoZSBzZWNvbmQgcXVvdGVcblxuICAgICAgICAgICAgICAgIGluZGV4ICs9IDI7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuanVzdFBhcnNlZERvdWJsZVF1b3RlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCAmJiBjaGFyQmVmb3JlICE9PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmXG4gICAgICAgICAgICAgICAgY2hhckFmdGVyICE9PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmICFzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyICYmXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIGZpZWxkIGRlbGltaXRlciBhbmQgYXJlIG5vdCBpbnNpZGUgdGhlIHdyYXAgZGVsaW1pdGVycyAoaWUuICosKilcblxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKGNzdi5zdWJzdHJpbmcoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCwgaW5kZXgpKTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiZcbiAgICAgICAgICAgICAgICBjaGFyQWZ0ZXIgIT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgIXN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBmaWVsZCBkZWxpbWl0ZXIsIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgd2FzIGEgd3JhcCBkZWxpbWl0ZXIsIGFuZCB0aGVcbiAgICAgICAgICAgICAgICAvLyAgIG5leHQgY2hhcmFjdGVyIGlzIG5vdCBhIHdyYXAgZGVsaW1pdGVyIChpZS4gXCIsKilcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleCArIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IHRvIHRoZSBuZXh0IGNoYXJhY3RlclxuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBkb3VibGUgcXVvdGUgc3RhdGUgdmFyaWFibGVcbiAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmp1c3RQYXJzZWREb3VibGVRdW90ZSA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGxpbmVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgcmVjb3JkIGxpbmVzIGZyb20gdGhlIHNwbGl0IENTViBsaW5lcyBhbmQgc2V0cyBpdCBvbiB0aGUgcGFyYW1zIG9iamVjdFxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZVJlY29yZExpbmVzKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMucmVjb3JkTGluZXMgPSBwYXJhbXMubGluZXMuc3BsaWNlKDEpOyAvLyBBbGwgbGluZXMgZXhjZXB0IGZvciB0aGUgaGVhZGVyIGxpbmVcblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgdmFsdWUgZm9yIHRoZSByZWNvcmQgZnJvbSB0aGUgbGluZSBhdCB0aGUgcHJvdmlkZWQga2V5LlxuICAgICAqIEBwYXJhbSBsaW5lIHtTdHJpbmdbXX0gc3BsaXQgbGluZSB2YWx1ZXMgZm9yIHRoZSByZWNvcmRcbiAgICAgKiBAcGFyYW0ga2V5IHtPYmplY3R9IHtpbmRleDogTnVtYmVyLCB2YWx1ZTogU3RyaW5nfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlUmVjb3JkVmFsdWVGcm9tTGluZShsaW5lLCBrZXkpIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSB2YWx1ZSBhdCB0aGUga2V5J3MgaW5kZXgsIHVzZSBpdDsgb3RoZXJ3aXNlLCBudWxsXG4gICAgICAgIGxldCB2YWx1ZSA9IGxpbmVba2V5LmluZGV4XTtcblxuICAgICAgICAvLyBQZXJmb3JtIGFueSBuZWNlc3NhcnkgdmFsdWUgY29udmVyc2lvbnMgb24gdGhlIHJlY29yZCB2YWx1ZVxuICAgICAgICByZXR1cm4gcHJvY2Vzc1JlY29yZFZhbHVlKHZhbHVlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzZXMgdGhlIHJlY29yZCdzIHZhbHVlIGJ5IHBhcnNpbmcgdGhlIGRhdGEgdG8gZW5zdXJlIHRoZSBDU1YgaXNcbiAgICAgKiBjb252ZXJ0ZWQgdG8gdGhlIEpTT04gdGhhdCBjcmVhdGVkIGl0LlxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlIHtTdHJpbmd9XG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1JlY29yZFZhbHVlKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgLy8gSWYgdGhlIHZhbHVlIGlzIGFuIGFycmF5IHJlcHJlc2VudGF0aW9uLCBjb252ZXJ0IGl0XG4gICAgICAgIGxldCBwYXJzZWRKc29uID0gcGFyc2VWYWx1ZShmaWVsZFZhbHVlKTtcbiAgICAgICAgLy8gSWYgcGFyc2VkSnNvbiBpcyBhbnl0aGluZyBhc2lkZSBmcm9tIGFuIGVycm9yLCB0aGVuIHdlIHdhbnQgdG8gdXNlIHRoZSBwYXJzZWQgdmFsdWVcbiAgICAgICAgLy8gVGhpcyBhbGxvd3MgdXMgdG8gaW50ZXJwcmV0IHZhbHVlcyBsaWtlICdudWxsJyAtLT4gbnVsbCwgJ2ZhbHNlJyAtLT4gZmFsc2VcbiAgICAgICAgaWYgKCF1dGlscy5pc0Vycm9yKHBhcnNlZEpzb24pICYmICF1dGlscy5pc0ludmFsaWQocGFyc2VkSnNvbikpIHtcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBwYXJzZWRKc29uO1xuICAgICAgICB9IGVsc2UgaWYgKGZpZWxkVmFsdWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIHJlY29yZCB2YWx1ZSwgaWYgc3BlY2lmaWVkIGJ5IHRoZSB1c2VyIHZpYSB0aGUgb3B0aW9ucyBvYmplY3RcbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmltUmVjb3JkVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICBpZiAob3B0aW9ucy50cmltRmllbGRWYWx1ZXMgJiYgIXV0aWxzLmlzTnVsbChmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIEpTT04gZG9jdW1lbnQgd2l0aCB0aGUgZ2l2ZW4ga2V5cyAoZGVzaWduYXRlZCBieSB0aGUgQ1NWIGhlYWRlcilcbiAgICAgKiAgIGFuZCB0aGUgdmFsdWVzIChmcm9tIHRoZSBnaXZlbiBsaW5lKVxuICAgICAqIEBwYXJhbSBrZXlzIFN0cmluZ1tdXG4gICAgICogQHBhcmFtIGxpbmUgU3RyaW5nXG4gICAgICogQHJldHVybnMge09iamVjdH0gY3JlYXRlZCBqc29uIGRvY3VtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRG9jdW1lbnQoa2V5cywgbGluZSkge1xuICAgICAgICAvLyBSZWR1Y2UgdGhlIGtleXMgaW50byBhIEpTT04gZG9jdW1lbnQgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBsaW5lXG4gICAgICAgIHJldHVybiBrZXlzLnJlZHVjZSgoZG9jdW1lbnQsIGtleSkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSB2YWx1ZSBhdCB0aGUga2V5J3MgaW5kZXggaW4gdGhlIGxpbmUsIHNldCB0aGUgdmFsdWU7IG90aGVyd2lzZSBudWxsXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSByZXRyaWV2ZVJlY29yZFZhbHVlRnJvbUxpbmUobGluZSwga2V5KTtcblxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCB0aGUga2V5IGFuZCB2YWx1ZSB0byB0aGUgZG9jdW1lbnRcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnNldFBhdGgoZG9jdW1lbnQsIGtleS52YWx1ZSwgdmFsdWUpO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgb3V0ZXJtb3N0IHdyYXAgZGVsaW1pdGVycyBmcm9tIGEgdmFsdWUsIGlmIHRoZXkgYXJlIHByZXNlbnRcbiAgICAgKiBPdGhlcndpc2UsIHRoZSBub24td3JhcHBlZCB2YWx1ZSBpcyByZXR1cm5lZCBhcyBpc1xuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmVXcmFwRGVsaW1pdGVyc0Zyb21WYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGxldCBmaXJzdENoYXIgPSBmaWVsZFZhbHVlWzBdLFxuICAgICAgICAgICAgbGFzdEluZGV4ID0gZmllbGRWYWx1ZS5sZW5ndGggLSAxLFxuICAgICAgICAgICAgbGFzdENoYXIgPSBmaWVsZFZhbHVlW2xhc3RJbmRleF07XG4gICAgICAgIC8vIElmIHRoZSBmaWVsZCBzdGFydHMgYW5kIGVuZHMgd2l0aCBhIHdyYXAgZGVsaW1pdGVyXG4gICAgICAgIGlmIChmaXJzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgbGFzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXApIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnN1YnN0cigxLCBsYXN0SW5kZXggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbmVzY2FwZXMgd3JhcCBkZWxpbWl0ZXJzIGJ5IHJlcGxhY2luZyBkdXBsaWNhdGVzIHdpdGggYSBzaW5nbGUgKGVnLiBcIlwiIC0+IFwiKVxuICAgICAqIFRoaXMgaXMgZG9uZSBpbiBvcmRlciB0byBwYXJzZSBSRkMgNDE4MCBjb21wbGlhbnQgQ1NWIGJhY2sgdG8gSlNPTlxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVzY2FwZVdyYXBEZWxpbWl0ZXJJbkZpZWxkKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUucmVwbGFjZShlc2NhcGVkV3JhcERlbGltaXRlclJlZ2V4LCBvcHRpb25zLmRlbGltaXRlci53cmFwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWluIGhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IHRoZSBDU1YgdG8gdGhlIEpTT04gZG9jdW1lbnQgYXJyYXlcbiAgICAgKiBAcGFyYW0gcGFyYW1zIHtPYmplY3R9IHtsaW5lczogW1N0cmluZ10sIGNhbGxiYWNrOiBGdW5jdGlvbn1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtUmVjb3JkTGluZXMocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5qc29uID0gcGFyYW1zLnJlY29yZExpbmVzLnJlZHVjZSgoZ2VuZXJhdGVkSnNvbk9iamVjdHMsIGxpbmUpID0+IHsgLy8gRm9yIGVhY2ggbGluZSwgY3JlYXRlIHRoZSBkb2N1bWVudCBhbmQgYWRkIGl0IHRvIHRoZSBhcnJheSBvZiBkb2N1bWVudHNcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLm1hcCgoZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gdGhlIG5lY2Vzc2FyeSBvcGVyYXRpb25zIG9uIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSByZW1vdmVXcmFwRGVsaW1pdGVyc0Zyb21WYWx1ZShmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdW5lc2NhcGVXcmFwRGVsaW1pdGVySW5GaWVsZChmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdHJpbVJlY29yZFZhbHVlKGZpZWxkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGdlbmVyYXRlZERvY3VtZW50ID0gY3JlYXRlRG9jdW1lbnQocGFyYW1zLmhlYWRlckZpZWxkcywgbGluZSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVkSnNvbk9iamVjdHMuY29uY2F0KGdlbmVyYXRlZERvY3VtZW50KTtcbiAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdHMgdG8gcGFyc2UgdGhlIHByb3ZpZGVkIHZhbHVlLiBJZiBpdCBpcyBub3QgcGFyc2FibGUsIHRoZW4gYW4gZXJyb3IgaXMgcmV0dXJuZWRcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwYXJzZVZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmdSZXByZXNlbnRhdGlvbih2YWx1ZSwgb3B0aW9ucykgJiYgIXV0aWxzLmlzRGF0ZVJlcHJlc2VudGF0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHBhcnNlZEpzb24gPSBKU09OLnBhcnNlKHZhbHVlKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIHBhcnNlZCB2YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB3ZSBhbHNvIG5lZWQgdG8gdHJpbSByZWNvcmQgdmFsdWVzLCBpZiBzcGVjaWZpZWRcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhcnNlZEpzb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZEpzb24ubWFwKHRyaW1SZWNvcmRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZWRKc29uO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbGx5IGV4cG9ydGVkIGNzdjJqc29uIGZ1bmN0aW9uXG4gICAgICogVGFrZXMgb3B0aW9ucyBhcyBhIGRvY3VtZW50LCBkYXRhIGFzIGEgQ1NWIHN0cmluZywgYW5kIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwb3J0IHRoZSByZXN1bHRzXG4gICAgICogQHBhcmFtIGRhdGEgU3RyaW5nIGNzdiBzdHJpbmdcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgRnVuY3Rpb24gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb252ZXJ0KGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNwbGl0IHRoZSBDU1YgaW50byBsaW5lcyB1c2luZyB0aGUgc3BlY2lmaWVkIEVPTCBvcHRpb25cbiAgICAgICAgLy8gdmFsaWRhdGVDc3YoZGF0YSwgY2FsbGJhY2spXG4gICAgICAgIC8vICAgICAudGhlbihzdHJpcEV4Y2VsQk9NKVxuICAgICAgICBzdHJpcEV4Y2VsQk9NKGRhdGEpXG4gICAgICAgICAgICAudGhlbihzcGxpdENzdkxpbmVzKVxuICAgICAgICAgICAgLnRoZW4ocmV0cmlldmVIZWFkaW5nKSAvLyBSZXRyaWV2ZSB0aGUgaGVhZGluZ3MgZnJvbSB0aGUgQ1NWLCB1bmxlc3MgdGhlIHVzZXIgc3BlY2lmaWVkIHRoZSBrZXlzXG4gICAgICAgICAgICAudGhlbihyZXRyaWV2ZVJlY29yZExpbmVzKSAvLyBSZXRyaWV2ZSB0aGUgcmVjb3JkIGxpbmVzIGZyb20gdGhlIENTVlxuICAgICAgICAgICAgLnRoZW4odHJhbnNmb3JtUmVjb3JkTGluZXMpIC8vIFJldHJpZXZlIHRoZSBKU09OIGRvY3VtZW50IGFycmF5XG4gICAgICAgICAgICAudGhlbigocGFyYW1zKSA9PiBjYWxsYmFjayhudWxsLCBwYXJhbXMuanNvbikpIC8vIFNlbmQgdGhlIGRhdGEgYmFjayB0byB0aGUgY2FsbGVyXG4gICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnZlcnQsXG4gICAgICAgIHZhbGlkYXRpb25GbjogdXRpbHMuaXNTdHJpbmcsXG4gICAgICAgIHZhbGlkYXRpb25NZXNzYWdlczogY29uc3RhbnRzLmVycm9ycy5jc3YyanNvblxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgQ3N2Mkpzb24gfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IHBhdGggPSByZXF1aXJlKCdkb2MtcGF0aCcpLFxuICAgIGRlZWtzID0gcmVxdWlyZSgnZGVla3MnKSxcbiAgICBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy5qc29uJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmNvbnN0IEpzb24yQ3N2ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IHdyYXBEZWxpbWl0ZXJDaGVja1JlZ2V4ID0gbmV3IFJlZ0V4cChvcHRpb25zLmRlbGltaXRlci53cmFwLCAnZycpLFxuICAgICAgICBjcmxmU2VhcmNoUmVnZXggPSAvXFxyP1xcbnxcXHIvLFxuICAgICAgICBleHBhbmRpbmdXaXRob3V0VW53aW5kaW5nID0gb3B0aW9ucy5leHBhbmRBcnJheU9iamVjdHMgJiYgIW9wdGlvbnMudW53aW5kQXJyYXlzLFxuICAgICAgICBkZWVrc09wdGlvbnMgPSB7XG4gICAgICAgICAgICBleHBhbmRBcnJheU9iamVjdHM6IGV4cGFuZGluZ1dpdGhvdXRVbndpbmRpbmcsXG4gICAgICAgICAgICBpZ25vcmVFbXB0eUFycmF5c1doZW5FeHBhbmRpbmc6IGV4cGFuZGluZ1dpdGhvdXRVbndpbmRpbmdcbiAgICAgICAgfTtcblxuICAgIC8qKiBIRUFERVIgRklFTEQgRlVOQ1RJT05TICoqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGlzdCBvZiBkYXRhIGZpZWxkIG5hbWVzIG9mIGFsbCBkb2N1bWVudHMgaW4gdGhlIHByb3ZpZGVkIGxpc3RcbiAgICAgKiBAcGFyYW0gZGF0YSB7QXJyYXk8T2JqZWN0Pn0gRGF0YSB0byBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXlbU3RyaW5nXT59XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0RmllbGROYW1lTGlzdChkYXRhKSB7XG4gICAgICAgIC8vIElmIGtleXMgd2VyZW4ndCBzcGVjaWZpZWQsIHRoZW4gd2UnbGwgdXNlIHRoZSBsaXN0IG9mIGtleXMgZ2VuZXJhdGVkIGJ5IHRoZSBkZWVrcyBtb2R1bGVcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZWVrcy5kZWVwS2V5c0Zyb21MaXN0KGRhdGEsIGRlZWtzT3B0aW9ucykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyB0aGUgc2NoZW1hcyBieSBjaGVja2luZyBmb3Igc2NoZW1hIGRpZmZlcmVuY2VzLCBpZiBzbyBkZXNpcmVkLlxuICAgICAqIElmIHNjaGVtYSBkaWZmZXJlbmNlcyBhcmUgbm90IHRvIGJlIGNoZWNrZWQsIHRoZW4gaXQgcmVzb2x2ZXMgdGhlIHVuaXF1ZVxuICAgICAqIGxpc3Qgb2YgZmllbGQgbmFtZXMuXG4gICAgICogQHBhcmFtIGRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheVtTdHJpbmddPn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzU2NoZW1hcyhkb2N1bWVudFNjaGVtYXMpIHtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgd2FudHMgdG8gY2hlY2sgZm9yIHRoZSBzYW1lIHNjaGVtYSAocmVnYXJkbGVzcyBvZiBzY2hlbWEgb3JkZXJpbmcpXG4gICAgICAgIGlmIChvcHRpb25zLmNoZWNrU2NoZW1hRGlmZmVyZW5jZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVja1NjaGVtYURpZmZlcmVuY2VzKGRvY3VtZW50U2NoZW1hcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGRvIG5vdCBjYXJlIGlmIHRoZSBzY2hlbWFzIGFyZSBkaWZmZXJlbnQsIHNvIHdlIHNob3VsZCBnZXQgdGhlIHVuaXF1ZSBsaXN0IG9mIGtleXNcbiAgICAgICAgICAgIGxldCB1bmlxdWVGaWVsZE5hbWVzID0gdXRpbHMudW5pcXVlKHV0aWxzLmZsYXR0ZW4oZG9jdW1lbnRTY2hlbWFzKSk7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuaXF1ZUZpZWxkTmFtZXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBmdW5jdGlvbiBwZXJmb3JtcyB0aGUgc2NoZW1hIGRpZmZlcmVuY2UgY2hlY2ssIGlmIHRoZSB1c2VyIHNwZWNpZmllcyB0aGF0IGl0IHNob3VsZCBiZSBjaGVja2VkLlxuICAgICAqIElmIHRoZXJlIGFyZSBubyBmaWVsZCBuYW1lcywgdGhlbiB0aGVyZSBhcmUgbm8gZGlmZmVyZW5jZXMuXG4gICAgICogT3RoZXJ3aXNlLCB3ZSBnZXQgdGhlIGZpcnN0IHNjaGVtYSBhbmQgdGhlIHJlbWFpbmluZyBsaXN0IG9mIHNjaGVtYXNcbiAgICAgKiBAcGFyYW0gZG9jdW1lbnRTY2hlbWFzXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY2hlY2tTY2hlbWFEaWZmZXJlbmNlcyhkb2N1bWVudFNjaGVtYXMpIHtcbiAgICAgICAgLy8gaGF2ZSBtdWx0aXBsZSBkb2N1bWVudHMgLSBlbnN1cmUgb25seSBvbmUgc2NoZW1hIChyZWdhcmRsZXNzIG9mIGZpZWxkIG9yZGVyaW5nKVxuICAgICAgICBsZXQgZmlyc3REb2NTY2hlbWEgPSBkb2N1bWVudFNjaGVtYXNbMF0sXG4gICAgICAgICAgICByZXN0T2ZEb2N1bWVudFNjaGVtYXMgPSBkb2N1bWVudFNjaGVtYXMuc2xpY2UoMSksXG4gICAgICAgICAgICBzY2hlbWFEaWZmZXJlbmNlcyA9IGNvbXB1dGVOdW1iZXJPZlNjaGVtYURpZmZlcmVuY2VzKGZpcnN0RG9jU2NoZW1hLCByZXN0T2ZEb2N1bWVudFNjaGVtYXMpO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBzY2hlbWEgaW5jb25zaXN0ZW5jaWVzLCB0aHJvdyBhIHNjaGVtYSBub3QgdGhlIHNhbWUgZXJyb3JcbiAgICAgICAgaWYgKHNjaGVtYURpZmZlcmVuY2VzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGNvbnN0YW50cy5lcnJvcnMuanNvbjJjc3Yubm90U2FtZVNjaGVtYSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShmaXJzdERvY1NjaGVtYSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgdGhlIG51bWJlciBvZiBzY2hlbWEgZGlmZmVyZW5jZXNcbiAgICAgKiBAcGFyYW0gZmlyc3REb2NTY2hlbWFcbiAgICAgKiBAcGFyYW0gcmVzdE9mRG9jdW1lbnRTY2hlbWFzXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY29tcHV0ZU51bWJlck9mU2NoZW1hRGlmZmVyZW5jZXMoZmlyc3REb2NTY2hlbWEsIHJlc3RPZkRvY3VtZW50U2NoZW1hcykge1xuICAgICAgICByZXR1cm4gcmVzdE9mRG9jdW1lbnRTY2hlbWFzLnJlZHVjZSgoc2NoZW1hRGlmZmVyZW5jZXMsIGRvY3VtZW50U2NoZW1hKSA9PiB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgc2NoZW1hcywgaW5jcmVtZW50IHRoZSBjb3VudGVyIG9mIHNjaGVtYSBpbmNvbnNpc3RlbmNpZXNcbiAgICAgICAgICAgIGxldCBudW1iZXJPZkRpZmZlcmVuY2VzID0gdXRpbHMuY29tcHV0ZVNjaGVtYURpZmZlcmVuY2VzKGZpcnN0RG9jU2NoZW1hLCBkb2N1bWVudFNjaGVtYSkubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIG51bWJlck9mRGlmZmVyZW5jZXMgPiAwXG4gICAgICAgICAgICAgICAgPyBzY2hlbWFEaWZmZXJlbmNlcyArIDFcbiAgICAgICAgICAgICAgICA6IHNjaGVtYURpZmZlcmVuY2VzO1xuICAgICAgICB9LCAwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJZiBzbyBzcGVjaWZpZWQsIHRoaXMgc29ydHMgdGhlIGhlYWRlciBmaWVsZCBuYW1lcyBhbHBoYWJldGljYWxseVxuICAgICAqIEBwYXJhbSBmaWVsZE5hbWVzIHtBcnJheTxTdHJpbmc+fVxuICAgICAqIEByZXR1cm5zIHtBcnJheTxTdHJpbmc+fSBzb3J0ZWQgZmllbGQgbmFtZXMsIG9yIHVuc29ydGVkIGlmIHNvcnRpbmcgbm90IHNwZWNpZmllZFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNvcnRIZWFkZXJGaWVsZHMoZmllbGROYW1lcykge1xuICAgICAgICBpZiAob3B0aW9ucy5zb3J0SGVhZGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGROYW1lcy5zb3J0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkTmFtZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIGhlYWRlciBmaWVsZHMsIGlmIHRoZSB1c2VyIGRlc2lyZXMgdGhlbSB0byBiZSB0cmltbWVkLlxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmltSGVhZGVyRmllbGRzKHBhcmFtcykge1xuICAgICAgICBpZiAob3B0aW9ucy50cmltSGVhZGVyRmllbGRzKSB7XG4gICAgICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzID0gcGFyYW1zLmhlYWRlckZpZWxkcy5tYXAoKGZpZWxkKSA9PiBmaWVsZC5zcGxpdCgnLicpXG4gICAgICAgICAgICAgICAgLm1hcCgoY29tcG9uZW50KSA9PiBjb21wb25lbnQudHJpbSgpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcuJylcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBXcmFwIHRoZSBoZWFkaW5ncywgaWYgZGVzaXJlZCBieSB0aGUgdXNlci5cbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JhcEhlYWRlckZpZWxkcyhwYXJhbXMpIHtcbiAgICAgICAgLy8gb25seSBwZXJmb3JtIHRoaXMgaWYgd2UgYXJlIGFjdHVhbGx5IHByZXBlbmRpbmcgdGhlIGhlYWRlclxuICAgICAgICBpZiAob3B0aW9ucy5wcmVwZW5kSGVhZGVyKSB7XG4gICAgICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzID0gcGFyYW1zLmhlYWRlckZpZWxkcy5tYXAoZnVuY3Rpb24oaGVhZGluZ0tleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3cmFwRmllbGRWYWx1ZUlmTmVjZXNzYXJ5KGhlYWRpbmdLZXkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgdGhlIENTViBoZWFkZXIgc3RyaW5nIGJ5IGpvaW5pbmcgdGhlIGhlYWRlckZpZWxkcyBieSB0aGUgZmllbGQgZGVsaW1pdGVyXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdlbmVyYXRlQ3N2SGVhZGVyKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMuaGVhZGVyID0gcGFyYW1zLmhlYWRlckZpZWxkcy5qb2luKG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKTtcbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZSB0aGUgaGVhZGluZ3MgZm9yIGFsbCBkb2N1bWVudHMgYW5kIHJldHVybiBpdC5cbiAgICAgKiBUaGlzIGNoZWNrcyB0aGF0IGFsbCBkb2N1bWVudHMgaGF2ZSB0aGUgc2FtZSBzY2hlbWEuXG4gICAgICogQHBhcmFtIGRhdGFcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZUhlYWRlckZpZWxkcyhkYXRhKSB7XG4gICAgICAgIGlmIChvcHRpb25zLmtleXMgJiYgIW9wdGlvbnMudW53aW5kQXJyYXlzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdGlvbnMua2V5cylcbiAgICAgICAgICAgICAgICAudGhlbihzb3J0SGVhZGVyRmllbGRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnZXRGaWVsZE5hbWVMaXN0KGRhdGEpXG4gICAgICAgICAgICAudGhlbihwcm9jZXNzU2NoZW1hcylcbiAgICAgICAgICAgIC50aGVuKHNvcnRIZWFkZXJGaWVsZHMpO1xuICAgIH1cblxuICAgIC8qKiBSRUNPUkQgRklFTEQgRlVOQ1RJT05TICoqL1xuXG4gICAgLyoqXG4gICAgICogVW53aW5kcyBvYmplY3RzIGluIGFycmF5cyB3aXRoaW4gcmVjb3JkIG9iamVjdHMgaWYgdGhlIHVzZXIgc3BlY2lmaWVzIHRoZVxuICAgICAqICAgZXhwYW5kQXJyYXlPYmplY3RzIG9wdGlvbi4gSWYgbm90IHNwZWNpZmllZCwgdGhpcyBwYXNzZXMgdGhlIHBhcmFtc1xuICAgICAqICAgYXJndW1lbnQgdGhyb3VnaCB0byB0aGUgbmV4dCBmdW5jdGlvbiBpbiB0aGUgcHJvbWlzZSBjaGFpbi5cbiAgICAgKiBAcGFyYW0gcGFyYW1zIHtPYmplY3R9XG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdW53aW5kUmVjb3Jkc0lmTmVjZXNzYXJ5KHBhcmFtcykge1xuICAgICAgICBpZiAob3B0aW9ucy51bndpbmRBcnJheXMpIHtcbiAgICAgICAgICAgIGNvbnN0IG9yaWdpbmFsUmVjb3Jkc0xlbmd0aCA9IHBhcmFtcy5yZWNvcmRzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gVW53aW5kIGVhY2ggb2YgdGhlIGRvY3VtZW50cyBhdCB0aGUgZ2l2ZW4gaGVhZGVyRmllbGRcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMuZm9yRWFjaCgoaGVhZGVyRmllbGQpID0+IHtcbiAgICAgICAgICAgICAgICBwYXJhbXMucmVjb3JkcyA9IHV0aWxzLnVud2luZChwYXJhbXMucmVjb3JkcywgaGVhZGVyRmllbGQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZXRyaWV2ZUhlYWRlckZpZWxkcyhwYXJhbXMucmVjb3JkcylcbiAgICAgICAgICAgICAgICAudGhlbigoaGVhZGVyRmllbGRzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBoZWFkZXJGaWVsZHM7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgd2Ugd2VyZSBhYmxlIHRvIHVud2luZCBtb3JlIGFycmF5cywgdGhlbiB0cnkgdW53aW5kaW5nIGFnYWluLi4uXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcmlnaW5hbFJlY29yZHNMZW5ndGggIT09IHBhcmFtcy5yZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVud2luZFJlY29yZHNJZk5lY2Vzc2FyeShwYXJhbXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgZGlkbid0IHVud2luZCBhbnkgYWRkaXRpb25hbCBhcnJheXMsIHNvIGNvbnRpbnVlLi4uXG5cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYga2V5cyB3ZXJlIHByb3ZpZGVkLCBzZXQgdGhlIGhlYWRlckZpZWxkcyB0byB0aGUgcHJvdmlkZWQga2V5czpcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMua2V5cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IG9wdGlvbnMua2V5cztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFpbiBmdW5jdGlvbiB3aGljaCBoYW5kbGVzIHRoZSBwcm9jZXNzaW5nIG9mIGEgcmVjb3JkLCBvciBkb2N1bWVudCB0byBiZSBjb252ZXJ0ZWQgdG8gQ1NWIGZvcm1hdFxuICAgICAqIFRoaXMgZnVuY3Rpb24gc3BlY2lmaWVzIGFuZCBwZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IG9wZXJhdGlvbnMgaW4gdGhlIG5lY2Vzc2FyeSBvcmRlclxuICAgICAqIGluIG9yZGVyIHRvIG9idGFpbiB0aGUgZGF0YSBhbmQgY29udmVydCBpdCB0byBDU1YgZm9ybSB3aGlsZSBtYWludGFpbmluZyBSRkMgNDE4MCBjb21wbGlhbmNlLlxuICAgICAqICogT3JkZXIgb2Ygb3BlcmF0aW9uczpcbiAgICAgKiAtIEdldCBmaWVsZHMgZnJvbSBwcm92aWRlZCBrZXkgbGlzdCAoYXMgYXJyYXkgb2YgYWN0dWFsIHZhbHVlcylcbiAgICAgKiAtIENvbnZlcnQgdGhlIHZhbHVlcyB0byBjc3Yvc3RyaW5nIHJlcHJlc2VudGF0aW9uIFtwb3NzaWJsZSBvcHRpb24gaGVyZSBmb3IgY3VzdG9tIGNvbnZlcnRlcnM/XVxuICAgICAqIC0gVHJpbSBmaWVsZHNcbiAgICAgKiAtIERldGVybWluZSBpZiB0aGV5IG5lZWQgdG8gYmUgd3JhcHBlZCAoJiB3cmFwIGlmIG5lY2Vzc2FyeSlcbiAgICAgKiAtIENvbWJpbmUgdmFsdWVzIGZvciBlYWNoIGxpbmUgKGJ5IGpvaW5pbmcgYnkgZmllbGQgZGVsaW1pdGVyKVxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVjb3JkcyhwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnJlY29yZHMgPSBwYXJhbXMucmVjb3Jkcy5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgLy8gUmV0cmlldmUgZGF0YSBmb3IgZWFjaCBvZiB0aGUgaGVhZGVyRmllbGRzIGZyb20gdGhpcyByZWNvcmRcbiAgICAgICAgICAgIGxldCByZWNvcmRGaWVsZERhdGEgPSByZXRyaWV2ZVJlY29yZEZpZWxkRGF0YShyZWNvcmQsIHBhcmFtcy5oZWFkZXJGaWVsZHMpLFxuXG4gICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB0aGUgZGF0YSBpbiB0aGlzIHJlY29yZCBhbmQgcmV0dXJuIHRoZVxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZFJlY29yZERhdGEgPSByZWNvcmRGaWVsZERhdGEubWFwKChmaWVsZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB0cmltUmVjb3JkRmllbGRWYWx1ZShmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHJlY29yZEZpZWxkVmFsdWVUb1N0cmluZyhmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHdyYXBGaWVsZFZhbHVlSWZOZWNlc3NhcnkoZmllbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEpvaW4gdGhlIHJlY29yZCBkYXRhIGJ5IHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUNzdlJvd0Zyb21SZWNvcmQocHJvY2Vzc2VkUmVjb3JkRGF0YSk7XG4gICAgICAgIH0pLmpvaW4ob3B0aW9ucy5kZWxpbWl0ZXIuZW9sKTtcblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiBpbnRlbmRlZCB0byBwcm9jZXNzICpqdXN0KiBhcnJheSB2YWx1ZXMgd2hlbiB0aGUgZXhwYW5kQXJyYXlPYmplY3RzIHNldHRpbmcgaXMgc2V0IHRvIHRydWVcbiAgICAgKiBAcGFyYW0gcmVjb3JkRmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHsqfSBwcm9jZXNzZWQgYXJyYXkgdmFsdWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVjb3JkRmllbGREYXRhRm9yRXhwYW5kZWRBcnJheU9iamVjdChyZWNvcmRGaWVsZFZhbHVlKSB7XG4gICAgICAgIGxldCBmaWx0ZXJlZFJlY29yZEZpZWxkVmFsdWUgPSB1dGlscy5yZW1vdmVFbXB0eUZpZWxkcyhyZWNvcmRGaWVsZFZhbHVlKTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFycmF5IGFuZCBpdCdzIGVpdGhlciBlbXB0eSBvZiBmdWxsIG9mIGVtcHR5IHZhbHVlcywgdGhlbiB1c2UgYW4gZW1wdHkgdmFsdWUgcmVwcmVzZW50YXRpb25cbiAgICAgICAgaWYgKCFyZWNvcmRGaWVsZFZhbHVlLmxlbmd0aCB8fCAhZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZW1wdHlGaWVsZFZhbHVlIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgaGF2ZSBhbiBhcnJheSBvZiBhY3R1YWwgdmFsdWVzLi4uXG4gICAgICAgICAgICAvLyBTaW5jZSB3ZSBhcmUgZXhwYW5kaW5nIGFycmF5IG9iamVjdHMsIHdlIHdpbGwgd2FudCB0byBrZXkgaW4gb24gdmFsdWVzIG9mIG9iamVjdHMuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlWzBdOyAvLyBFeHRyYWN0IHRoZSBzaW5nbGUgdmFsdWUgaW4gdGhlIGFycmF5XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVjb3JkRmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCBmaWVsZCB2YWx1ZXMgZnJvbSBhIHBhcnRpY3VsYXIgcmVjb3JkIGZvciB0aGUgZ2l2ZW4gbGlzdCBvZiBmaWVsZHNcbiAgICAgKiBAcGFyYW0gcmVjb3JkXG4gICAgICogQHBhcmFtIGZpZWxkc1xuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZVJlY29yZEZpZWxkRGF0YShyZWNvcmQsIGZpZWxkcykge1xuICAgICAgICBsZXQgcmVjb3JkVmFsdWVzID0gW107XG5cbiAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVjb3JkRmllbGRWYWx1ZSA9IHBhdGguZXZhbHVhdGVQYXRoKHJlY29yZCwgZmllbGQpO1xuXG4gICAgICAgICAgICBpZiAoIXV0aWxzLmlzVW5kZWZpbmVkKG9wdGlvbnMuZW1wdHlGaWVsZFZhbHVlKSAmJiB1dGlscy5pc0VtcHR5RmllbGQocmVjb3JkRmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRGaWVsZFZhbHVlID0gb3B0aW9ucy5lbXB0eUZpZWxkVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZXhwYW5kQXJyYXlPYmplY3RzICYmIEFycmF5LmlzQXJyYXkocmVjb3JkRmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRGaWVsZFZhbHVlID0gcHJvY2Vzc1JlY29yZEZpZWxkRGF0YUZvckV4cGFuZGVkQXJyYXlPYmplY3QocmVjb3JkRmllbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlY29yZFZhbHVlcy5wdXNoKHJlY29yZEZpZWxkVmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjb3JkVmFsdWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgcmVjb3JkIGZpZWxkIHZhbHVlIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlY29yZEZpZWxkVmFsdWVUb1N0cmluZyhmaWVsZFZhbHVlKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpZWxkVmFsdWUpIHx8IHV0aWxzLmlzT2JqZWN0KGZpZWxkVmFsdWUpICYmICF1dGlscy5pc0RhdGUoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShmaWVsZFZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc1VuZGVmaW5lZChmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuICd1bmRlZmluZWQnO1xuICAgICAgICB9IGVsc2UgaWYgKHV0aWxzLmlzTnVsbChmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAhb3B0aW9ucy51c2VMb2NhbGVGb3JtYXQgPyBmaWVsZFZhbHVlLnRvU3RyaW5nKCkgOiBmaWVsZFZhbHVlLnRvTG9jYWxlU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyB0aGUgcmVjb3JkIGZpZWxkIHZhbHVlLCBpZiBzcGVjaWZpZWQgYnkgdGhlIHVzZXIncyBwcm92aWRlZCBvcHRpb25zXG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmltUmVjb3JkRmllbGRWYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1GaWVsZFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS5tYXAodHJpbVJlY29yZEZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh1dGlscy5pc1N0cmluZyhmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnRyaW0oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVzY2FwZXMgcXVvdGF0aW9uIG1hcmtzIGluIHRoZSBmaWVsZCB2YWx1ZSwgaWYgbmVjZXNzYXJ5LCBhbmQgYXBwcm9wcmlhdGVseVxuICAgICAqIHdyYXBzIHRoZSByZWNvcmQgZmllbGQgdmFsdWUgaWYgaXQgY29udGFpbnMgYSBjb21tYSAoZmllbGQgZGVsaW1pdGVyKSxcbiAgICAgKiBxdW90YXRpb24gbWFyayAod3JhcCBkZWxpbWl0ZXIpLCBvciBhIGxpbmUgYnJlYWsgKENSTEYpXG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwRmllbGRWYWx1ZUlmTmVjZXNzYXJ5KGZpZWxkVmFsdWUpIHtcbiAgICAgICAgY29uc3Qgd3JhcERlbGltaXRlciA9IG9wdGlvbnMuZGVsaW1pdGVyLndyYXA7XG5cbiAgICAgICAgLy8gZWcuIGluY2x1ZGVzIHF1b3RhdGlvbiBtYXJrcyAoZGVmYXVsdCBkZWxpbWl0ZXIpXG4gICAgICAgIGlmIChmaWVsZFZhbHVlLmluY2x1ZGVzKG9wdGlvbnMuZGVsaW1pdGVyLndyYXApKSB7XG4gICAgICAgICAgICAvLyBhZGQgYW4gYWRkaXRpb25hbCBxdW90YXRpb24gbWFyayBiZWZvcmUgZWFjaCBxdW90YXRpb24gbWFyayBhcHBlYXJpbmcgaW4gdGhlIGZpZWxkIHZhbHVlXG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gZmllbGRWYWx1ZS5yZXBsYWNlKHdyYXBEZWxpbWl0ZXJDaGVja1JlZ2V4LCB3cmFwRGVsaW1pdGVyICsgd3JhcERlbGltaXRlcik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlIGZpZWxkIGNvbnRhaW5zIGEgY29tbWEgKGZpZWxkIGRlbGltaXRlciksIHF1b3RhdGlvbiBtYXJrICh3cmFwIGRlbGltaXRlciksIGxpbmUgYnJlYWssIG9yIENSTEZcbiAgICAgICAgLy8gICB0aGVuIGVuY2xvc2UgaXQgaW4gcXVvdGF0aW9uIG1hcmtzICh3cmFwIGRlbGltaXRlcilcbiAgICAgICAgaWYgKGZpZWxkVmFsdWUuaW5jbHVkZXMob3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpIHx8XG4gICAgICAgICAgICBmaWVsZFZhbHVlLmluY2x1ZGVzKG9wdGlvbnMuZGVsaW1pdGVyLndyYXApIHx8XG4gICAgICAgICAgICBmaWVsZFZhbHVlLm1hdGNoKGNybGZTZWFyY2hSZWdleCkpIHtcbiAgICAgICAgICAgIC8vIHdyYXAgdGhlIGZpZWxkJ3MgdmFsdWUgaW4gYSB3cmFwIGRlbGltaXRlciAocXVvdGF0aW9uIG1hcmtzIGJ5IGRlZmF1bHQpXG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gd3JhcERlbGltaXRlciArIGZpZWxkVmFsdWUgKyB3cmFwRGVsaW1pdGVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIHRoZSBDU1YgcmVjb3JkIHN0cmluZyBieSBqb2luaW5nIHRoZSBmaWVsZCB2YWx1ZXMgdG9nZXRoZXIgYnkgdGhlIGZpZWxkIGRlbGltaXRlclxuICAgICAqIEBwYXJhbSByZWNvcmRGaWVsZFZhbHVlc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdlbmVyYXRlQ3N2Um93RnJvbVJlY29yZChyZWNvcmRGaWVsZFZhbHVlcykge1xuICAgICAgICByZXR1cm4gcmVjb3JkRmllbGRWYWx1ZXMuam9pbihvcHRpb25zLmRlbGltaXRlci5maWVsZCk7XG4gICAgfVxuXG4gICAgLyoqIENTViBDT01QT05FTlQgQ09NQklORVIvRklOQUwgUFJPQ0VTU09SICoqL1xuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHRoZSBmaW5hbCBDU1YgY29uc3RydWN0aW9uIGJ5IGNvbWJpbmluZyB0aGUgZmllbGRzIGluIHRoZSBhcHByb3ByaWF0ZVxuICAgICAqIG9yZGVyIGRlcGVuZGluZyBvbiB0aGUgcHJvdmlkZWQgb3B0aW9ucyB2YWx1ZXMgYW5kIHNlbmRzIHRoZSBnZW5lcmF0ZWQgQ1NWXG4gICAgICogYmFjayB0byB0aGUgdXNlclxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNzdkZyb21Db21wb25lbnRzKHBhcmFtcykge1xuICAgICAgICBsZXQgaGVhZGVyID0gcGFyYW1zLmhlYWRlcixcbiAgICAgICAgICAgIHJlY29yZHMgPSBwYXJhbXMucmVjb3JkcyxcblxuICAgICAgICAgICAgLy8gSWYgd2UgYXJlIHByZXBlbmRpbmcgdGhlIGhlYWRlciwgdGhlbiBhZGQgYW4gRU9MLCBvdGhlcndpc2UganVzdCByZXR1cm4gdGhlIHJlY29yZHNcbiAgICAgICAgICAgIGNzdiA9IChvcHRpb25zLmV4Y2VsQk9NID8gY29uc3RhbnRzLnZhbHVlcy5leGNlbEJPTSA6ICcnKSArXG4gICAgICAgICAgICAgICAgKG9wdGlvbnMucHJlcGVuZEhlYWRlciA/IGhlYWRlciArIG9wdGlvbnMuZGVsaW1pdGVyLmVvbCA6ICcnKSArXG4gICAgICAgICAgICAgICAgcmVjb3JkcztcblxuICAgICAgICByZXR1cm4gcGFyYW1zLmNhbGxiYWNrKG51bGwsIGNzdik7XG4gICAgfVxuXG4gICAgLyoqIE1BSU4gQ09OVkVSVEVSIEZVTkNUSU9OICoqL1xuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWxseSBleHBvcnRlZCBqc29uMmNzdiBmdW5jdGlvblxuICAgICAqIFRha2VzIGRhdGEgYXMgZWl0aGVyIGEgZG9jdW1lbnQgb3IgYXJyYXkgb2YgZG9jdW1lbnRzIGFuZCBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcG9ydCB0aGUgcmVzdWx0c1xuICAgICAqIEBwYXJhbSBkYXRhIHtPYmplY3R8QXJyYXk8T2JqZWN0Pn0gZG9jdW1lbnRzIHRvIGJlIGNvbnZlcnRlZCB0byBjc3ZcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gU2luZ2xlIGRvY3VtZW50LCBub3QgYW4gYXJyYXlcbiAgICAgICAgaWYgKHV0aWxzLmlzT2JqZWN0KGRhdGEpICYmICFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTsgLy8gQ29udmVydCB0byBhbiBhcnJheSBvZiB0aGUgZ2l2ZW4gZG9jdW1lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBoZWFkaW5nIGFuZCB0aGVuIGdlbmVyYXRlIHRoZSBDU1Ygd2l0aCB0aGUga2V5cyB0aGF0IGFyZSBpZGVudGlmaWVkXG4gICAgICAgIHJldHJpZXZlSGVhZGVyRmllbGRzKGRhdGEpXG4gICAgICAgICAgICAudGhlbigoaGVhZGVyRmllbGRzKSA9PiAoe1xuICAgICAgICAgICAgICAgIGhlYWRlckZpZWxkcyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICByZWNvcmRzOiBkYXRhXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC50aGVuKHVud2luZFJlY29yZHNJZk5lY2Vzc2FyeSlcbiAgICAgICAgICAgIC50aGVuKHByb2Nlc3NSZWNvcmRzKVxuICAgICAgICAgICAgLnRoZW4od3JhcEhlYWRlckZpZWxkcylcbiAgICAgICAgICAgIC50aGVuKHRyaW1IZWFkZXJGaWVsZHMpXG4gICAgICAgICAgICAudGhlbihnZW5lcmF0ZUNzdkhlYWRlcilcbiAgICAgICAgICAgIC50aGVuKGdlbmVyYXRlQ3N2RnJvbUNvbXBvbmVudHMpXG4gICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnZlcnQsXG4gICAgICAgIHZhbGlkYXRpb25GbjogdXRpbHMuaXNPYmplY3QsXG4gICAgICAgIHZhbGlkYXRpb25NZXNzYWdlczogY29uc3RhbnRzLmVycm9ycy5qc29uMmNzdlxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgSnNvbjJDc3YgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IHBhdGggPSByZXF1aXJlKCdkb2MtcGF0aCcpLFxuICAgIGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzb24nKTtcblxuY29uc3QgZGF0ZVN0cmluZ1JlZ2V4ID0gL1xcZHs0fS1cXGR7Mn0tXFxkezJ9VFxcZHsyfTpcXGR7Mn06XFxkezJ9LlxcZHszfVovO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1N0cmluZ1JlcHJlc2VudGF0aW9uLFxuICAgIGlzRGF0ZVJlcHJlc2VudGF0aW9uLFxuICAgIGNvbXB1dGVTY2hlbWFEaWZmZXJlbmNlcyxcbiAgICBkZWVwQ29weSxcbiAgICBjb252ZXJ0LFxuICAgIGlzRW1wdHlGaWVsZCxcbiAgICByZW1vdmVFbXB0eUZpZWxkcyxcbiAgICBnZXROQ2hhcmFjdGVycyxcbiAgICB1bndpbmQsXG4gICAgaXNJbnZhbGlkLFxuXG4gICAgLy8gdW5kZXJzY29yZSByZXBsYWNlbWVudHM6XG4gICAgaXNTdHJpbmcsXG4gICAgaXNOdWxsLFxuICAgIGlzRXJyb3IsXG4gICAgaXNEYXRlLFxuICAgIGlzVW5kZWZpbmVkLFxuICAgIGlzT2JqZWN0LFxuICAgIHVuaXF1ZSxcbiAgICBmbGF0dGVuXG59O1xuXG4vKipcbiAqIEJ1aWxkIHRoZSBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25cbiAqIElmIGEgdXNlciBkb2VzIG5vdCBwcm92aWRlIGN1c3RvbSBvcHRpb25zLCB0aGVuIHdlIHVzZSBvdXIgZGVmYXVsdFxuICogSWYgb3B0aW9ucyBhcmUgcHJvdmlkZWQsIHRoZW4gd2Ugc2V0IGVhY2ggdmFsaWQga2V5IHRoYXQgd2FzIHBhc3NlZFxuICogQHBhcmFtIG9wdHMge09iamVjdH0gb3B0aW9ucyBvYmplY3RcbiAqIEByZXR1cm4ge09iamVjdH0gb3B0aW9ucyBvYmplY3RcbiAqL1xuZnVuY3Rpb24gYnVpbGRPcHRpb25zKG9wdHMpIHtcbiAgICBvcHRzID0gey4uLmNvbnN0YW50cy5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB8fCB7fX07XG5cbiAgICAvLyBOb3RlOiBPYmplY3QuYXNzaWduIGRvZXMgYSBzaGFsbG93IGRlZmF1bHQsIHdlIG5lZWQgdG8gZGVlcCBjb3B5IHRoZSBkZWxpbWl0ZXIgb2JqZWN0XG4gICAgb3B0cy5kZWxpbWl0ZXIgPSB7Li4uY29uc3RhbnRzLmRlZmF1bHRPcHRpb25zLmRlbGltaXRlciwgLi4ub3B0cy5kZWxpbWl0ZXJ9O1xuXG4gICAgLy8gT3RoZXJ3aXNlLCBzZW5kIHRoZSBvcHRpb25zIGJhY2tcbiAgICByZXR1cm4gb3B0cztcbn1cblxuLyoqXG4gKiBXaGVuIHByb21pc2lmaWVkLCB0aGUgY2FsbGJhY2sgYW5kIG9wdGlvbnMgYXJndW1lbnQgb3JkZXJpbmcgaXMgc3dhcHBlZCwgc29cbiAqIHRoaXMgZnVuY3Rpb24gaXMgaW50ZW5kZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGFyZ3VtZW50IGlzIHdoaWNoIGFuZCByZXR1cm5cbiAqIHRoZW0gaW4gdGhlIGNvcnJlY3Qgb3JkZXJcbiAqIEBwYXJhbSBhcmcxIHtPYmplY3R8RnVuY3Rpb259IG9wdGlvbnMgb3IgY2FsbGJhY2tcbiAqIEBwYXJhbSBhcmcyIHtPYmplY3R8RnVuY3Rpb259IG9wdGlvbnMgb3IgY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gcGFyc2VBcmd1bWVudHMoYXJnMSwgYXJnMikge1xuICAgIC8vIElmIHRoaXMgd2FzIHByb21pc2lmaWVkIChjYWxsYmFjayBhbmQgb3B0cyBhcmUgc3dhcHBlZCkgdGhlbiBmaXggdGhlIGFyZ3VtZW50IG9yZGVyLlxuICAgIGlmIChpc09iamVjdChhcmcxKSAmJiAhaXNGdW5jdGlvbihhcmcxKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3B0aW9uczogYXJnMSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBhcmcyXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFJlZ3VsYXIgb3JkZXJpbmcgd2hlcmUgdGhlIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGJlZm9yZSB0aGUgb3B0aW9ucyBvYmplY3RcbiAgICByZXR1cm4ge1xuICAgICAgICBvcHRpb25zOiBhcmcyLFxuICAgICAgICBjYWxsYmFjazogYXJnMVxuICAgIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiB0byBqc29uMmNzdiBhbmQgY3N2Mmpzb25cbiAqIEBwYXJhbSBjb25maWcge09iamVjdH0gb2YgdGhlIGZvcm06IHsgZGF0YToge0FueX0sIGNhbGxiYWNrOiB7RnVuY3Rpb259LCBkYXRhQ2hlY2tGbjogRnVuY3Rpb24sIGVycm9yTWVzc2FnZXM6IHtPYmplY3R9IH1cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVQYXJhbWV0ZXJzKGNvbmZpZykge1xuICAgIC8vIElmIGEgY2FsbGJhY2sgd2Fzbid0IHByb3ZpZGVkLCB0aHJvdyBhbiBlcnJvclxuICAgIGlmICghY29uZmlnLmNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25zdGFudHMuZXJyb3JzLmNhbGxiYWNrUmVxdWlyZWQpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGRvbid0IHJlY2VpdmUgZGF0YSwgcmVwb3J0IGFuIGVycm9yXG4gICAgaWYgKCFjb25maWcuZGF0YSkge1xuICAgICAgICBjb25maWcuY2FsbGJhY2sobmV3IEVycm9yKGNvbmZpZy5lcnJvck1lc3NhZ2VzLmNhbm5vdENhbGxPbiArIGNvbmZpZy5kYXRhICsgJy4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGF0YSBwcm92aWRlZCBkYXRhIGRvZXMgbm90IG1lZXQgdGhlIHR5cGUgY2hlY2sgcmVxdWlyZW1lbnRcbiAgICBpZiAoIWNvbmZpZy5kYXRhQ2hlY2tGbihjb25maWcuZGF0YSkpIHtcbiAgICAgICAgY29uZmlnLmNhbGxiYWNrKG5ldyBFcnJvcihjb25maWcuZXJyb3JNZXNzYWdlcy5kYXRhQ2hlY2tGYWlsdXJlKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBkaWRuJ3QgaGl0IGFueSBrbm93biBlcnJvciBjb25kaXRpb25zLCB0aGVuIHRoZSBkYXRhIGlzIHNvIGZhciBkZXRlcm1pbmVkIHRvIGJlIHZhbGlkXG4gICAgLy8gTm90ZToganNvbjJjc3YvY3N2Mmpzb24gbWF5IHBlcmZvcm0gYWRkaXRpb25hbCB2YWxpZGl0eSBjaGVja3Mgb24gdGhlIGRhdGFcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdGVkIGZ1bmN0aW9uIHRvIHBlcmZvcm0gdGhlIGNvbnZlcnNpb24gb2YganNvbi0tPmNzdiBvciBjc3YtLT5qc29uXG4gKiBkZXBlbmRpbmcgb24gdGhlIGNvbnZlcnRlciBjbGFzcyB0aGF0IGlzIHBhc3NlZCB2aWEgdGhlIHBhcmFtcyBvYmplY3RcbiAqIEBwYXJhbSBwYXJhbXMge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gY29udmVydChwYXJhbXMpIHtcbiAgICBsZXQge29wdGlvbnMsIGNhbGxiYWNrfSA9IHBhcnNlQXJndW1lbnRzKHBhcmFtcy5jYWxsYmFjaywgcGFyYW1zLm9wdGlvbnMpO1xuICAgIG9wdGlvbnMgPSBidWlsZE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBsZXQgY29udmVydGVyID0gbmV3IHBhcmFtcy5jb252ZXJ0ZXIob3B0aW9ucyksXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHBhcmFtZXRlcnMgYmVmb3JlIGNhbGxpbmcgdGhlIGNvbnZlcnRlcidzIGNvbnZlcnQgZnVuY3Rpb25cbiAgICAgICAgdmFsaWQgPSB2YWxpZGF0ZVBhcmFtZXRlcnMoe1xuICAgICAgICAgICAgZGF0YTogcGFyYW1zLmRhdGEsXG4gICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZXM6IGNvbnZlcnRlci52YWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICAgICAgICBkYXRhQ2hlY2tGbjogY29udmVydGVyLnZhbGlkYXRpb25GblxuICAgICAgICB9KTtcblxuICAgIGlmICh2YWxpZCkgY29udmVydGVyLmNvbnZlcnQocGFyYW1zLmRhdGEsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGRlZXAgY29weSBhbiBvYmplY3QsIHVzZWQgYnkgdGhlIG1vZHVsZSB0ZXN0c1xuICogQHBhcmFtIG9ialxuICogQHJldHVybnMge2FueX1cbiAqL1xuZnVuY3Rpb24gZGVlcENvcHkob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhIHJlcHJlc2VudGF0aW9uXG4gKiAgIG9mIGEgc3RyaW5nLiBHaXZlbiB0aGUgUkZDNDE4MCByZXF1aXJlbWVudHMsIHRoYXQgbWVhbnMgdGhhdCB0aGUgdmFsdWUgaXNcbiAqICAgd3JhcHBlZCBpbiB2YWx1ZSB3cmFwIGRlbGltaXRlcnMgKHVzdWFsbHkgYSBxdW90YXRpb24gbWFyayBvbiBlYWNoIHNpZGUpLlxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmdSZXByZXNlbnRhdGlvbihmaWVsZFZhbHVlLCBvcHRpb25zKSB7XG4gICAgY29uc3QgZmlyc3RDaGFyID0gZmllbGRWYWx1ZVswXSxcbiAgICAgICAgbGFzdEluZGV4ID0gZmllbGRWYWx1ZS5sZW5ndGggLSAxLFxuICAgICAgICBsYXN0Q2hhciA9IGZpZWxkVmFsdWVbbGFzdEluZGV4XTtcblxuICAgIC8vIElmIHRoZSBmaWVsZCBzdGFydHMgYW5kIGVuZHMgd2l0aCBhIHdyYXAgZGVsaW1pdGVyXG4gICAgcmV0dXJuIGZpcnN0Q2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBsYXN0Q2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGEgcmVwcmVzZW50YXRpb25cbiAqICAgb2YgYSBkYXRlLlxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RhdGVSZXByZXNlbnRhdGlvbihmaWVsZFZhbHVlKSB7XG4gICAgcmV0dXJuIGRhdGVTdHJpbmdSZWdleC50ZXN0KGZpZWxkVmFsdWUpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgdGhlIHNjaGVtYSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byBvYmplY3RzLlxuICogQHBhcmFtIHNjaGVtYUFcbiAqIEBwYXJhbSBzY2hlbWFCXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVNjaGVtYURpZmZlcmVuY2VzKHNjaGVtYUEsIHNjaGVtYUIpIHtcbiAgICByZXR1cm4gYXJyYXlEaWZmZXJlbmNlKHNjaGVtYUEsIHNjaGVtYUIpXG4gICAgICAgIC5jb25jYXQoYXJyYXlEaWZmZXJlbmNlKHNjaGVtYUIsIHNjaGVtYUEpKTtcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZmllbGQgaXMgY29uc2lkZXJlZCBlbXB0eSBzbyB0aGF0IHRoZSBlbXB0eUZpZWxkVmFsdWUgY2FuIGJlIHVzZWQgaW5zdGVhZFxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5RmllbGQoZmllbGRWYWx1ZSkge1xuICAgIHJldHVybiBpc1VuZGVmaW5lZChmaWVsZFZhbHVlKSB8fCBpc051bGwoZmllbGRWYWx1ZSkgfHwgZmllbGRWYWx1ZSA9PT0gJyc7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyBlbXB0eSBmaWVsZCB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAqIEBwYXJhbSBmaWVsZHNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRW1wdHlGaWVsZHMoZmllbGRzKSB7XG4gICAgcmV0dXJuIGZpZWxkcy5maWx0ZXIoKGZpZWxkKSA9PiAhaXNFbXB0eUZpZWxkKGZpZWxkKSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0cmlldmVzIHRoZSBuZXh0IG4gY2hhcmFjdGVycyBmcm9tIHRoZSBzdGFydCBpbmRleCBpblxuICogICB0aGUgc3RyaW5nIGluY2x1ZGluZyB0aGUgY2hhcmFjdGVyIGF0IHRoZSBzdGFydCBpbmRleC4gVGhpcyBpcyB1c2VkIHRvXG4gKiAgIGNoZWNrIGlmIGFyZSBjdXJyZW50bHkgYXQgYW4gRU9MIHZhbHVlLCBzaW5jZSBpdCBjb3VsZCBiZSBtdWx0aXBsZVxuICogICBjaGFyYWN0ZXJzIGluIGxlbmd0aCAoZWcuICdcXHJcXG4nKVxuICogQHBhcmFtIHN0clxuICogQHBhcmFtIHN0YXJ0XG4gKiBAcGFyYW0gblxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0TkNoYXJhY3RlcnMoc3RyLCBzdGFydCwgbikge1xuICAgIHJldHVybiBzdHIuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIG4pO1xufVxuXG4vKipcbiAqIFRoZSBmb2xsb3dpbmcgdW53aW5kIGZ1bmN0aW9uYWxpdHkgaXMgYSBoZWF2aWx5IG1vZGlmaWVkIHZlcnNpb24gb2YgQGVkd2luY2VuJ3NcbiAqIHVud2luZCBleHRlbnNpb24gZm9yIGxvZGFzaC4gU2luY2UgbG9kYXNoIGlzIGEgbGFyZ2UgcGFja2FnZSB0byByZXF1aXJlIGluLFxuICogYW5kIGFsbCBvZiB0aGUgcmVxdWlyZWQgZnVuY3Rpb25hbGl0eSB3YXMgYWxyZWFkeSBiZWluZyBpbXBvcnRlZCwgZWl0aGVyXG4gKiBuYXRpdmVseSBvciB3aXRoIGRvYy1wYXRoLCBJIGRlY2lkZWQgdG8gcmV3cml0ZSB0aGUgbWFqb3JpdHkgb2YgdGhlIGxvZ2ljXG4gKiBzbyB0aGF0IGFuIGFkZGl0aW9uYWwgZGVwZW5kZW5jeSB3b3VsZCBub3QgYmUgcmVxdWlyZWQuIFRoZSBvcmlnaW5hbCBjb2RlXG4gKiB3aXRoIHRoZSBsb2Rhc2ggZGVwZW5kZW5jeSBjYW4gYmUgZm91bmQgaGVyZTpcbiAqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZWR3aW5jZW4vdW53aW5kL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gKi9cblxuLyoqXG4gKiBDb3JlIGZ1bmN0aW9uIHRoYXQgdW53aW5kcyBhbiBpdGVtIGF0IHRoZSBwcm92aWRlZCBwYXRoXG4gKiBAcGFyYW0gYWNjdW11bGF0b3Ige0FycmF5PGFueT59XG4gKiBAcGFyYW0gaXRlbSB7YW55fVxuICogQHBhcmFtIGZpZWxkUGF0aCB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiB1bndpbmRJdGVtKGFjY3VtdWxhdG9yLCBpdGVtLCBmaWVsZFBhdGgpIHtcbiAgICBjb25zdCB2YWx1ZVRvVW53aW5kID0gcGF0aC5ldmFsdWF0ZVBhdGgoaXRlbSwgZmllbGRQYXRoKTtcbiAgICBsZXQgY2xvbmVkID0gZGVlcENvcHkoaXRlbSk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZVRvVW53aW5kKSAmJiB2YWx1ZVRvVW53aW5kLmxlbmd0aCkge1xuICAgICAgICB2YWx1ZVRvVW53aW5kLmZvckVhY2goKHZhbCkgPT4ge1xuICAgICAgICAgICAgY2xvbmVkID0gZGVlcENvcHkoaXRlbSk7XG4gICAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKHBhdGguc2V0UGF0aChjbG9uZWQsIGZpZWxkUGF0aCwgdmFsKSk7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZVRvVW53aW5kKSAmJiB2YWx1ZVRvVW53aW5kLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBQdXNoIGFuIGVtcHR5IHN0cmluZyBzbyB0aGUgdmFsdWUgaXMgZW1wdHkgc2luY2UgdGhlcmUgYXJlIG5vIHZhbHVlc1xuICAgICAgICBwYXRoLnNldFBhdGgoY2xvbmVkLCBmaWVsZFBhdGgsICcnKTtcbiAgICAgICAgYWNjdW11bGF0b3IucHVzaChjbG9uZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGFjY3VtdWxhdG9yLnB1c2goY2xvbmVkKTtcbiAgICB9XG59XG5cbi8qKlxuICogTWFpbiB1bndpbmQgZnVuY3Rpb24gd2hpY2ggdGFrZXMgYW4gYXJyYXkgYW5kIGEgZmllbGQgdG8gdW53aW5kLlxuICogQHBhcmFtIGFycmF5IHtBcnJheTxhbnk+fVxuICogQHBhcmFtIGZpZWxkIHtTdHJpbmd9XG4gKiBAcmV0dXJucyB7QXJyYXk8YW55Pn1cbiAqL1xuZnVuY3Rpb24gdW53aW5kKGFycmF5LCBmaWVsZCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGFycmF5LmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgICAgdW53aW5kSXRlbShyZXN1bHQsIGl0ZW0sIGZpZWxkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKlxuICogSGVscGVyIGZ1bmN0aW9ucyB3aGljaCB3ZXJlIGNyZWF0ZWQgdG8gcmVtb3ZlIHVuZGVyc2NvcmVqcyBmcm9tIHRoaXMgcGFja2FnZS5cbiAqL1xuXG5mdW5jdGlvbiBpc1N0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnO1xufVxuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdWxsKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc0RhdGUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZCh2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnO1xufVxuXG5mdW5jdGlvbiBpc0Vycm9yKHZhbHVlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG59XG5cbmZ1bmN0aW9uIGFycmF5RGlmZmVyZW5jZShhLCBiKSB7XG4gICAgcmV0dXJuIGEuZmlsdGVyKCh4KSA9PiAhYi5pbmNsdWRlcyh4KSk7XG59XG5cbmZ1bmN0aW9uIHVuaXF1ZShhcnJheSkge1xuICAgIHJldHVybiBbLi4ubmV3IFNldChhcnJheSldO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuKGFycmF5KSB7XG4gICAgcmV0dXJuIFtdLmNvbmNhdCguLi5hcnJheSk7XG59XG5cbi8qKlxuICogVXNlZCB0byBoZWxwIGF2b2lkIGluY29ycmVjdCB2YWx1ZXMgcmV0dXJuZWQgYnkgSlNPTi5wYXJzZSB3aGVuIGNvbnZlcnRpbmdcbiAqIENTViBiYWNrIHRvIEpTT04sIHN1Y2ggYXMgJzM5ZTE4MDQnIHdoaWNoIEpTT04ucGFyc2UgY29udmVydHMgdG8gSW5maW5pdHlcbiAqL1xuZnVuY3Rpb24gaXNJbnZhbGlkKHBhcnNlZEpzb24pIHtcbiAgICByZXR1cm4gcGFyc2VkSnNvbiA9PT0gSW5maW5pdHkgfHxcbiAgICAgICAgcGFyc2VkSnNvbiA9PT0gLUluZmluaXR5O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKGdsb2JhbCkge1xuXG4gICAgLy8gbWluaW1hbCBzeW1ib2wgcG9seWZpbGwgZm9yIElFMTEgYW5kIG90aGVyc1xuICAgIGlmICh0eXBlb2YgU3ltYm9sICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBTeW1ib2wgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIFN5bWJvbC5ub25OYXRpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IFNUQVRFX1BMQUlOVEVYVCA9IFN5bWJvbCgncGxhaW50ZXh0Jyk7XG4gICAgY29uc3QgU1RBVEVfSFRNTCAgICAgID0gU3ltYm9sKCdodG1sJyk7XG4gICAgY29uc3QgU1RBVEVfQ09NTUVOVCAgID0gU3ltYm9sKCdjb21tZW50Jyk7XG5cbiAgICBjb25zdCBBTExPV0VEX1RBR1NfUkVHRVggID0gLzwoXFx3Kik+L2c7XG4gICAgY29uc3QgTk9STUFMSVpFX1RBR19SRUdFWCA9IC88XFwvPyhbXlxcc1xcLz5dKykvO1xuXG4gICAgZnVuY3Rpb24gc3RyaXB0YWdzKGh0bWwsIGFsbG93YWJsZV90YWdzLCB0YWdfcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgaHRtbCAgICAgICAgICAgID0gaHRtbCB8fCAnJztcbiAgICAgICAgYWxsb3dhYmxlX3RhZ3MgID0gYWxsb3dhYmxlX3RhZ3MgfHwgW107XG4gICAgICAgIHRhZ19yZXBsYWNlbWVudCA9IHRhZ19yZXBsYWNlbWVudCB8fCAnJztcblxuICAgICAgICBsZXQgY29udGV4dCA9IGluaXRfY29udGV4dChhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KTtcblxuICAgICAgICByZXR1cm4gc3RyaXB0YWdzX2ludGVybmFsKGh0bWwsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRfc3RyaXB0YWdzX3N0cmVhbShhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGFsbG93YWJsZV90YWdzICA9IGFsbG93YWJsZV90YWdzIHx8IFtdO1xuICAgICAgICB0YWdfcmVwbGFjZW1lbnQgPSB0YWdfcmVwbGFjZW1lbnQgfHwgJyc7XG5cbiAgICAgICAgbGV0IGNvbnRleHQgPSBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHN0cmlwdGFnc19zdHJlYW0oaHRtbCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmlwdGFnc19pbnRlcm5hbChodG1sIHx8ICcnLCBjb250ZXh0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdHJpcHRhZ3MuaW5pdF9zdHJlYW1pbmdfbW9kZSA9IGluaXRfc3RyaXB0YWdzX3N0cmVhbTtcblxuICAgIGZ1bmN0aW9uIGluaXRfY29udGV4dChhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGFsbG93YWJsZV90YWdzID0gcGFyc2VfYWxsb3dhYmxlX3RhZ3MoYWxsb3dhYmxlX3RhZ3MpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbGxvd2FibGVfdGFncyA6IGFsbG93YWJsZV90YWdzLFxuICAgICAgICAgICAgdGFnX3JlcGxhY2VtZW50OiB0YWdfcmVwbGFjZW1lbnQsXG5cbiAgICAgICAgICAgIHN0YXRlICAgICAgICAgOiBTVEFURV9QTEFJTlRFWFQsXG4gICAgICAgICAgICB0YWdfYnVmZmVyICAgIDogJycsXG4gICAgICAgICAgICBkZXB0aCAgICAgICAgIDogMCxcbiAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0cmlwdGFnc19pbnRlcm5hbChodG1sLCBjb250ZXh0KSB7XG4gICAgICAgIGxldCBhbGxvd2FibGVfdGFncyAgPSBjb250ZXh0LmFsbG93YWJsZV90YWdzO1xuICAgICAgICBsZXQgdGFnX3JlcGxhY2VtZW50ID0gY29udGV4dC50YWdfcmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgbGV0IHN0YXRlICAgICAgICAgPSBjb250ZXh0LnN0YXRlO1xuICAgICAgICBsZXQgdGFnX2J1ZmZlciAgICA9IGNvbnRleHQudGFnX2J1ZmZlcjtcbiAgICAgICAgbGV0IGRlcHRoICAgICAgICAgPSBjb250ZXh0LmRlcHRoO1xuICAgICAgICBsZXQgaW5fcXVvdGVfY2hhciA9IGNvbnRleHQuaW5fcXVvdGVfY2hhcjtcbiAgICAgICAgbGV0IG91dHB1dCAgICAgICAgPSAnJztcblxuICAgICAgICBmb3IgKGxldCBpZHggPSAwLCBsZW5ndGggPSBodG1sLmxlbmd0aDsgaWR4IDwgbGVuZ3RoOyBpZHgrKykge1xuICAgICAgICAgICAgbGV0IGNoYXIgPSBodG1sW2lkeF07XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU1RBVEVfUExBSU5URVhUKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICAgPSBTVEFURV9IVE1MO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEVfSFRNTCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSAnPCcgaWYgaW5zaWRlIGEgcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIHNlZWluZyBhIG5lc3RlZCAnPCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSAnPicgaWYgaW5zaWRlIGEgcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWV0aGluZyBsaWtlIHRoaXMgaXMgaGFwcGVuaW5nOiAnPDw+PidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoLS07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBjbG9zaW5nIHRoZSB0YWcgaW4gdGFnX2J1ZmZlclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5fcXVvdGVfY2hhciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICAgICA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgICArPSAnPic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd2FibGVfdGFncy5oYXMobm9ybWFsaXplX3RhZyh0YWdfYnVmZmVyKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gdGFnX2J1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRhZ19yZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdcXCcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F0Y2ggYm90aCBzaW5nbGUgYW5kIGRvdWJsZSBxdW90ZXNcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXIgPT09IGluX3F1b3RlX2NoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9xdW90ZV9jaGFyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgPSBpbl9xdW90ZV9jaGFyIHx8IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ19idWZmZXIgPT09ICc8IS0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURV9DT01NRU5UO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyID09PSAnPCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSAgICAgID0gU1RBVEVfUExBSU5URVhUO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCAgICArPSAnPCAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEVfQ09NTUVOVCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyLnNsaWNlKC0yKSA9PSAnLS0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2xvc2UgdGhlIGNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgdGhlIGNvbnRleHQgZm9yIGZ1dHVyZSBpdGVyYXRpb25zXG4gICAgICAgIGNvbnRleHQuc3RhdGUgICAgICAgICA9IHN0YXRlO1xuICAgICAgICBjb250ZXh0LnRhZ19idWZmZXIgICAgPSB0YWdfYnVmZmVyO1xuICAgICAgICBjb250ZXh0LmRlcHRoICAgICAgICAgPSBkZXB0aDtcbiAgICAgICAgY29udGV4dC5pbl9xdW90ZV9jaGFyID0gaW5fcXVvdGVfY2hhcjtcblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlX2FsbG93YWJsZV90YWdzKGFsbG93YWJsZV90YWdzKSB7XG4gICAgICAgIGxldCB0YWdfc2V0ID0gbmV3IFNldCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYWxsb3dhYmxlX3RhZ3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2g7XG5cbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBBTExPV0VEX1RBR1NfUkVHRVguZXhlYyhhbGxvd2FibGVfdGFncykpKSB7XG4gICAgICAgICAgICAgICAgdGFnX3NldC5hZGQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoIVN5bWJvbC5ub25OYXRpdmUgJiZcbiAgICAgICAgICAgICAgICAgdHlwZW9mIGFsbG93YWJsZV90YWdzW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICAgICAgdGFnX3NldCA9IG5ldyBTZXQoYWxsb3dhYmxlX3RhZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFsbG93YWJsZV90YWdzLmZvckVhY2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIElFMTEgY29tcGF0aWJsZVxuICAgICAgICAgICAgYWxsb3dhYmxlX3RhZ3MuZm9yRWFjaCh0YWdfc2V0LmFkZCwgdGFnX3NldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFnX3NldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVfdGFnKHRhZ19idWZmZXIpIHtcbiAgICAgICAgbGV0IG1hdGNoID0gTk9STUFMSVpFX1RBR19SRUdFWC5leGVjKHRhZ19idWZmZXIpO1xuXG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiBtb2R1bGVfZmFjdG9yeSgpIHsgcmV0dXJuIHN0cmlwdGFnczsgfSk7XG4gICAgfVxuXG4gICAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgLy8gTm9kZVxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHN0cmlwdGFncztcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlclxuICAgICAgICBnbG9iYWwuc3RyaXB0YWdzID0gc3RyaXB0YWdzO1xuICAgIH1cbn0odGhpcykpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0aWYgKCFtb2R1bGUud2VicGFja1BvbHlmaWxsKSB7XG5cdFx0bW9kdWxlLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKCkge307XG5cdFx0bW9kdWxlLnBhdGhzID0gW107XG5cdFx0Ly8gbW9kdWxlLnBhcmVudCA9IHVuZGVmaW5lZCBieSBkZWZhdWx0XG5cdFx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwibG9hZGVkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJpZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xuXHR9XG5cdHJldHVybiBtb2R1bGU7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0aW1lc3RhbXBfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi90aW1lc3RhbXBcIikpO1xuY2xhc3MgQ2FwdGlvbnNQYXJzZXIge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG4gICAgLyoqXG4gICAgICogRGVjb21wb3NlIHhtbCB0ZXh0IGxpbmUgYnkgbGluZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGluZVxuICAgICAqIEByZXR1cm5zIHtBbGluZX1cbiAgICAgKiBAbWVtYmVyb2YgQ2FwdGlvbnNQYXJzZXJcbiAgICAgKi9cbiAgICBkZWNvZGVBbGluZShhbGluZSkge1xuICAgICAgICBjb25zdCB0aW1lc3RhbXAgPSB0aGlzLnB1bGxUaW1lKGFsaW5lKTtcbiAgICAgICAgY29uc3QgaHRtbFRleHQgPSBhbGluZVxuICAgICAgICAgICAgLnJlcGxhY2UoLzx0ZXh0Lis+LywgXCJcIilcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mYW1wOy9naSwgXCImXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxyP1xcbi9nLCBcIiBcIik7XG4gICAgICAgIGNvbnN0IHN0cmlwdGFncyA9IHJlcXVpcmUoXCJzdHJpcHRhZ3NcIik7XG4gICAgICAgIGNvbnN0IGhlID0gcmVxdWlyZShcImhlXCIpO1xuICAgICAgICBjb25zdCBkZWNvZGVkVGV4dCA9IGhlLmRlY29kZShodG1sVGV4dCk7XG4gICAgICAgIGNvbnN0IHRleHQgPSBzdHJpcHRhZ3MoZGVjb2RlZFRleHQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdGltZXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTcGxpdCBsaW5lcyBpbnRvIGJ5IGEgbGluZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ2FwdGlvbnNQYXJzZXJcbiAgICAgKi9cbiAgICBleHBsb2RlKGxpbmVzKSB7XG4gICAgICAgIHJldHVybiBsaW5lcy5zcGxpdChcIjwvdGV4dD5cIikuZmlsdGVyKChsaW5lKSA9PiBsaW5lICYmIGxpbmUudHJpbSgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJpbSB4bWwgdGFnIGluIGZpcnN0IGxpbmVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2NyaXB0XG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgICAqIEBtZW1iZXJvZiBDYXB0aW9uc1BhcnNlclxuICAgICAqL1xuICAgIHJlbW92ZVhtbFRhZyh0cmFuc2NyaXB0KSB7XG4gICAgICAgIHJldHVybiB0cmFuc2NyaXB0XG4gICAgICAgICAgICAucmVwbGFjZSgnPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwidXRmLThcIiA/Pjx0cmFuc2NyaXB0PicsIFwiXCIpXG4gICAgICAgICAgICAucmVwbGFjZShcIjwvdHJhbnNjcmlwdD5cIiwgXCJcIik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1bGwgdGltZSBmcm9tIHRleHQgZGF0YS5cbiAgICAgKiA8dGV4dCBzdGFydD1cIjEwLjE1OVwiIGR1cj1cIjIuNTYzXCI+XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFsaW5lXG4gICAgICogQHJldHVybnMge1RpbWVzdGFtcH1cbiAgICAgKiBAbWVtYmVyb2YgQ2FwdGlvbnNQYXJzZXJcbiAgICAgKi9cbiAgICBwdWxsVGltZShhbGluZSkge1xuICAgICAgICBjb25zdCBzdGFydFJlZ2V4ID0gL3N0YXJ0PVwiKFtcXGQuXSspXCIvO1xuICAgICAgICBjb25zdCBkdXJSZWdleCA9IC9kdXI9XCIoW1xcZC5dKylcIi87XG4gICAgICAgIHJldHVybiBuZXcgdGltZXN0YW1wXzEuZGVmYXVsdCh0aGlzLmdldFRpbWVGcm9tVGV4dChzdGFydFJlZ2V4LCBhbGluZSksIHRoaXMuZ2V0VGltZUZyb21UZXh0KGR1clJlZ2V4LCBhbGluZSkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBFeGVjdXRlIFJlZ0V4cC5cbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFsaW5lXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKiBAbWVtYmVyb2YgQ2FwdGlvbnNQYXJzZXJcbiAgICAgKi9cbiAgICBnZXRUaW1lRnJvbVRleHQocmVnZXgsIGFsaW5lKSB7XG4gICAgICAgIGlmIChyZWdleC50ZXN0KGFsaW5lKSkge1xuICAgICAgICAgICAgY29uc3QgWywgdGltZV0gPSByZWdleC5leGVjKGFsaW5lKTtcbiAgICAgICAgICAgIHJldHVybiBOdW1iZXIodGltZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ2FwdGlvbnNQYXJzZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIENsaWVudFlvdXR1YmUge1xuICAgIGdldFZpZGVvSW5mbyh2aWRlb0lkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlcXVlc3QoYGh0dHBzOi8veW91dHViZS5jb20vZ2V0X3ZpZGVvX2luZm8/dmlkZW9faWQ9JHt2aWRlb0lkfWApO1xuICAgIH1cbiAgICBnZXRTdWJ0aXRsZShsYW5ndWFnZVVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGxhbmd1YWdlVXJsKTtcbiAgICB9XG4gICAgZ2V0UmVxdWVzdCh1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIlhNTEh0dHBSZXF1ZXN0IEVycm9yOiBcIiArIHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbihcIkdFVFwiLCB1cmwpO1xuICAgICAgICAgICAgcmVxdWVzdC5zZW5kKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENsaWVudFlvdXR1YmU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGNhcHRpb25zUGFyc2VyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY2FwdGlvbnNQYXJzZXJcIikpO1xuY2xhc3MgQ29udmVydGVyIHtcbiAgICBjb25zdHJ1Y3Rvcih4bWxSZXNwb25zZSkge1xuICAgICAgICB0aGlzLnhtbFJlc3BvbnNlID0geG1sUmVzcG9uc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gc2F2ZSBpbiBDU1YgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7Q3N2QWxpbmVbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgdG9Dc3YoKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBjYXB0aW9uc1BhcnNlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbVRyYW5zY3JpcHQgPSBwYXJzZXIuZXhwbG9kZShwYXJzZXIucmVtb3ZlWG1sVGFnKHRoaXMueG1sUmVzcG9uc2UpKTtcbiAgICAgICAgcmV0dXJuIHRyaW1UcmFuc2NyaXB0Lm1hcCgobGluZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWxpbmUgPSBwYXJzZXIuZGVjb2RlQWxpbmUobGluZSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHN0YXJ0VGltZTogYWxpbmUudGltZXN0YW1wLmdldFN0YXJ0VGltZSgpLFxuICAgICAgICAgICAgICAgIGR1cmF0aW9uVGltZTogYWxpbmUudGltZXN0YW1wLmdldER1cmF0aW9uVGltZSgpLFxuICAgICAgICAgICAgICAgIHRleHQ6IGFsaW5lLnRleHQsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBzYXZlIGluIFRleHQgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VGV4dEFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvVGV4dCgpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IGNhcHRpb25zUGFyc2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB0cmltVHJhbnNjcmlwdCA9IHBhcnNlci5leHBsb2RlKHBhcnNlci5yZW1vdmVYbWxUYWcodGhpcy54bWxSZXNwb25zZSkpO1xuICAgICAgICByZXR1cm4gdHJpbVRyYW5zY3JpcHQubWFwKChsaW5lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhbGluZSA9IHBhcnNlci5kZWNvZGVBbGluZShsaW5lKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGV4dDogYWxpbmUudGV4dCxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gU3J0IGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge1NydEFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvU3J0KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBudW1lcmljQ291bnRlciA9IGluZGV4ICsgMSArIFwiXFxuXCI7XG4gICAgICAgICAgICBjb25zdCBhbGluZSA9IHBhcnNlci5kZWNvZGVBbGluZShsaW5lKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhbGluZS50ZXh0LnJlcGxhY2UoL1xcbi8sIFwiIFwiKSArIFwiXFxuXCI7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGluZGV4OiBudW1lcmljQ291bnRlcixcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGFsaW5lLnRpbWVzdGFtcC5mb3JtYXRTcnQoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gc2F2ZSBpbiBWdHQgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VnR0QWxpbmVbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgdG9WdHQoKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBjYXB0aW9uc1BhcnNlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbVRyYW5zY3JpcHQgPSBwYXJzZXIuZXhwbG9kZShwYXJzZXIucmVtb3ZlWG1sVGFnKHRoaXMueG1sUmVzcG9uc2UpKTtcbiAgICAgICAgcmV0dXJuIHRyaW1UcmFuc2NyaXB0Lm1hcCgobGluZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWxpbmUgPSBwYXJzZXIuZGVjb2RlQWxpbmUobGluZSk7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gYWxpbmUudGV4dC5yZXBsYWNlKC9cXG4vLCBcIiBcIikgKyBcIlxcblwiO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGFsaW5lLnRpbWVzdGFtcC5mb3JtYXRWdHQoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0LFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ29udmVydGVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBzdWJ0aXRsZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3N1YnRpdGxlXCIpKTtcbmNvbnN0IGNsaWVudFlvdXR1YmVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9jbGllbnQvY2xpZW50WW91dHViZVwiKSk7XG5jb25zdCBzZW5kRGF0YSA9IHtcbiAgICByZWFzb246IFwiY2hlY2tcIixcbn07XG52YXIgdmlkZW9UaXRsZTtcbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG4gICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UodGFic1swXS5pZCwgc2VuZERhdGEsIChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UuZXJyb3IpO1xuICAgICAgICAgICAgICAgIGRpc3BsYXlFcnJvck1lc3NhZ2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuY2FwdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2aWRlb1RpdGxlID0gcmVzcG9uc2UudGl0bGU7XG4gICAgICAgICAgICAgICAgYWRkU2VsZWN0Qm94KCk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuY2FwdGlvbnMuZmlsdGVyKCh2YWx1ZSkgPT4gYWRkU2VsZWN0Qm94T3B0aW9uKHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgYWRkRG93bmxvYWRCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBhZGRTZWxlY3RCb3hGb3JtYXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuZnVuY3Rpb24gYWRkU2VsZWN0Qm94Rm9ybWF0KCkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIilcbiAgICAgICAgLmluc2VydEFkamFjZW50SFRNTChcImFmdGVyYmVnaW5cIiwgXCI8c2VsZWN0IGNsYXNzPSd1ay1zZWxlY3QnIHN0eWxlPSdtYXJnaW4tYm90dG9tOjVweCcgaWQ9J2Zvcm1hdCc+PG9wdGlvbiB2YWx1ZT0nY3N2Jz4uY3N2PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0ndGV4dCc+LnR4dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3Z0dCc+LnZ0dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3NydCc+LnNydDwvb3B0aW9uPjwvc2VsZWN0PlwiKTtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdEJveCgpIHtcbiAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW50XCIpXG4gICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoXCJhZnRlcmJlZ2luXCIsIFwiPHNlbGVjdCBjbGFzcz0ndWstc2VsZWN0JyBpZD0nbGFuZ3VhZ2UnPjwvc2VsZWN0PlwiKTtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdEJveE9wdGlvbih2YWx1ZSkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImxhbmd1YWdlXCIpXG4gICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoXCJiZWZvcmVlbmRcIiwgYDxvcHRpb24gdmFsdWU9JHt2YWx1ZS5iYXNlVXJsfT4ke3ZhbHVlLm5hbWUuc2ltcGxlVGV4dH08L29wdGlvbj5gKTtcbn1cbmZ1bmN0aW9uIGFkZERvd25sb2FkQnV0dG9uKCkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZChcImNvbnRlbnRcIilcbiAgICAgICAgLmluc2VydEFkamFjZW50SFRNTChcImFmdGVyZW5kXCIsIFwiPGRpdiBjbGFzcz0ndWstbWFyZ2luJz48YnV0dG9uIGlkPSdkb3dubG9hZC1idXR0b24nIGNsYXNzPSd1ay1idXR0b24gdWstYnV0dG9uLXByaW1hcnknIG9uY2xpY2s9ZG93bmxvYWQoKT5Eb3dubG9hZDwvYnV0dG9uPjwvZGl2PlwiKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRvd25sb2FkLWJ1dHRvblwiKS5vbmNsaWNrID0gKCkgPT4gZG93bmxvYWQoKTtcbn1cbmZ1bmN0aW9uIGRlYnVnKHJlc3BvbnNlKSB7XG4gICAgY29uc3QgZGVidWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlYnVnXCIpO1xuICAgIGRlYnVnLmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIHJlc3BvbnNlKTtcbn1cbmZ1bmN0aW9uIGRpc3BsYXlFcnJvck1lc3NhZ2UoKSB7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVudFwiKTtcbiAgICBjb250ZW50Lmluc2VydEFkamFjZW50SFRNTChcImJlZm9yZWJlZ2luXCIsIGA8cCBjbGFzcz0ndWstdGV4dC1kYW5nZXInPlRoaXMgdmlkZW8gaGFzIG5vIGNhcHRpb25zLjwvcD48cCBjbGFzcz0ndWstdGV4dC1kYW5nZXInPklmIHlvdSBjYW4ndCBkb3dubG9hZCB0aGUgc3VidGl0bGVzLCB0cnkgZGlzYWJsaW5nIGFkYmxvY2suPC9wPmApO1xufVxuZnVuY3Rpb24gZG93bmxvYWQoKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2VfdXJsID0gKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGFuZ3VhZ2VcIikpLnZhbHVlO1xuICAgIGNvbnN0IGZvcm1hdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybWF0XCIpXG4gICAgICAgIC52YWx1ZTtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgY2xpZW50WW91dHViZV8xLmRlZmF1bHQoKTtcbiAgICBjbGllbnRcbiAgICAgICAgLmdldFN1YnRpdGxlKGxhbmd1YWdlX3VybClcbiAgICAgICAgLnRoZW4oKHhtbFJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICgheG1sUmVzcG9uc2UpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJSZXNwb25zZSBlbXB0eS5cIik7XG4gICAgICAgIGNvbnN0IHN1YnRpdGxlID0gbmV3IHN1YnRpdGxlXzEuZGVmYXVsdCh4bWxSZXNwb25zZSk7XG4gICAgICAgIGlmIChmb3JtYXQgPT09IFwiY3N2XCIpIHtcbiAgICAgICAgICAgIHN1YnRpdGxlLmdldENzdih2aWRlb1RpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmb3JtYXQgPT09IFwidGV4dFwiKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRUZXh0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZvcm1hdCA9PT0gXCJ2dHRcIikge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0VnR0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0U3J0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIGRlYnVnKGVycm9yKTtcbiAgICB9KTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgY29udmVydGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY29udmVydGVyXCIpKTtcbmNvbnN0IGpzb24yY3N2ID0gcmVxdWlyZShcImpzb24tMi1jc3ZcIik7XG5jb25zdCBvcHRpb25zID0ge1xuICAgIGRlbGltaXRlcjoge1xuICAgICAgICB3cmFwOiBcIlwiLFxuICAgICAgICBmaWVsZDogXCJcIixcbiAgICAgICAgZW9sOiBcIlxcblwiLFxuICAgIH0sXG4gICAgcHJlcGVuZEhlYWRlcjogZmFsc2UsXG4gICAgZXhjZWxCT006IHRydWUsXG59O1xuY2xhc3MgU3VidGl0bGUge1xuICAgIGNvbnN0cnVjdG9yKHhtbFJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMueG1sUmVzcG9uc2UgPSB4bWxSZXNwb25zZTtcbiAgICB9XG4gICAgZ2V0VnR0KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b1Z0dCgpLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGNzdikgPT4ge1xuICAgICAgICAgICAgY2hyb21lLmRvd25sb2Fkcy5kb3dubG9hZCh7XG4gICAgICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtcIldFQlZUVFxcblxcblwiICsgY3N2XSwgeyB0eXBlOiBcInRleHQvdnR0XCIgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArIFwiLnZ0dFwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRTcnQoZmlsZW5hbWUpIHtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvU3J0KCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2Nzdl0sIHsgdHlwZTogXCJ0ZXh0L3NydFwiIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyBcIi5zcnRcIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0Q3N2KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b0NzdigpLCB7XG4gICAgICAgICAgICBleGNlbEJPTTogdHJ1ZSxcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiBcInRleHQvY3N2XCIgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArIFwiLmNzdlwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRUZXh0KGZpbGVuYW1lKSB7XG4gICAgICAgIGNvbnN0IGpzb24yY3N2ID0gcmVxdWlyZShcImpzb24tMi1jc3ZcIik7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b1RleHQoKSwgb3B0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiBcInRleHQvcGxhbmVcIiB9KSksXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lICsgXCIudHh0XCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gU3VidGl0bGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIFRpbWVzdGFtcCB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnQsIGR1cmF0aW9uKSB7XG4gICAgICAgIHRoaXMuc3RhcnQgPSBzdGFydDtcbiAgICAgICAgdGhpcy5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgIH1cbiAgICBnZXRTdGFydFRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnZlcnRUaW1lKHRoaXMuc3RhcnQpO1xuICAgIH1cbiAgICBnZXREdXJhdGlvblRpbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm1lcmdlVGltZSh0aGlzLnN0YXJ0LCB0aGlzLmR1cmF0aW9uKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIFNSVCB0aW1lc3RhbXAgZm9ybWF0LlxuICAgICAqIGV4YW1wbGU6IDAwOjAwOjAwLDAwMCAtLT4gMDA6MDA6MDAsMDAwXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBmb3JtYXRTcnQoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5nZXRTdGFydFRpbWUoKS5yZXBsYWNlKC9bLl0vLCBcIixcIikgK1xuICAgICAgICAgICAgXCIgLS0+IFwiICtcbiAgICAgICAgICAgIHRoaXMuZ2V0RHVyYXRpb25UaW1lKCkucmVwbGFjZSgvWy5dLywgXCIsXCIpICtcbiAgICAgICAgICAgIFwiXFxuXCIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgVlRUIHRpbWVzdGFtcCBmb3JtYXQuXG4gICAgICogZXhhbXBsZTogMDA6MDA6MDAuMDAwIC0tPiAwMDowMDowMC4wMDBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFRpbWVzdGFtcFxuICAgICAqL1xuICAgIGZvcm1hdFZ0dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUaW1lKCkgKyBcIiAtLT4gXCIgKyB0aGlzLmdldER1cmF0aW9uVGltZSgpICsgXCJcXG5cIjtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uIHRpbWVcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0U2Vjb25kc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvblNlY29uZHNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBtZXJnZVRpbWUoc3RhcnRTZWNvbmRzLCBkdXJhdGlvblNlY29uZHMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHN0YXJ0U2Vjb25kcyAqIDEwMDAgKyBkdXJhdGlvblNlY29uZHMgKiAxMDAwKVxuICAgICAgICAgICAgLnRvSVNPU3RyaW5nKClcbiAgICAgICAgICAgIC5zbGljZSgxMSwgLTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRpbWUgZm9ybWF0IGZyb20gbW0uc3MgdG8gSEg6bW06c3NzLlxuICAgICAqIGV4YW1wbGU6IDEwLjE1OSA9PiAwMDowMDoxMC4xNTlcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBzZWNvbmRzXG4gICAgICogQHJldHVybnMge3N0cmluZ31cbiAgICAgKiBAbWVtYmVyb2YgVGltZXN0YW1wXG4gICAgICovXG4gICAgY29udmVydFRpbWUoc2Vjb25kcykge1xuICAgICAgICByZXR1cm4gbmV3IERhdGUoc2Vjb25kcyAqIDEwMDApLnRvSVNPU3RyaW5nKCkuc2xpY2UoMTEsIC0xKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBUaW1lc3RhbXA7XG4iXSwic291cmNlUm9vdCI6IiJ9