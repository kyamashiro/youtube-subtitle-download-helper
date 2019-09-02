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


const _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");

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
    if (_.isObject(object)) {
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
        if (_.isObject(document)) {
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

    return _.flatten(keys);
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
    } else if (subArray.length && _.flatten(subArrayKeys).length === 0) {
        // Has items in the array, but no objects
        return [currentKeyPath];
    } else {
        subArrayKeys = subArrayKeys.map((schemaKeys) => {
            if (isEmptyArray(schemaKeys)) {
                return [currentKeyPath];
            }
            return schemaKeys.map((subKey) => buildKeyName(currentKeyPath, subKey));
        });

        return _.uniq(_.flatten(subArrayKeys));
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
    return _.isObject(val) && !_.isNull(val) && !Array.isArray(val) && Object.keys(val).length;
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
    return _.defaults(options || {}, {
        expandArrayObjects: false,
        ignoreEmptyArraysWhenExpanding: false
    });
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

module.exports = JSON.parse("{\"errors\":{\"callbackRequired\":\"A callback is required!\",\"optionsRequired\":\"Options were not passed and are required.\",\"json2csv\":{\"cannotCallOn\":\"Cannot call json2csv on \",\"dataCheckFailure\":\"Data provided was not an array of documents.\",\"notSameSchema\":\"Not all documents have the same schema.\"},\"csv2json\":{\"cannotCallOn\":\"Cannot call csv2json on \",\"dataCheckFailure\":\"CSV is not a string.\"}},\"defaultOptions\":{\"delimiter\":{\"field\":\",\",\"wrap\":\"\\\"\",\"eol\":\"\\n\"},\"excelBOM\":false,\"prependHeader\":true,\"trimHeaderFields\":false,\"trimFieldValues\":false,\"sortHeader\":false,\"parseCsvNumbers\":false,\"keys\":null,\"checkSchemaDifferences\":false,\"expandArrayObjects\":false},\"values\":{\"excelBOM\":\"﻿\"}}");

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


let constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json"),
    utils = __webpack_require__(/*! ./utils */ "./node_modules/json-2-csv/src/utils.js"),
    _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js"),
    path = __webpack_require__(/*! doc-path */ "./node_modules/doc-path/src/path.js");

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
            } else if (character === options.delimiter.wrap && (index === 0 || utils.getNCharacters(csv, index - 1, eolDelimiterLength) === options.delimiter.eol)) {
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
        if (!_.isError(parsedJson)) {
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
        if (options.trimFieldValues && !_.isNull(fieldValue)) {
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
            if (_.isArray(parsedJson)) {
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
        validationFn: _.isString,
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


let constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json"),
    utils = __webpack_require__(/*! ./utils */ "./node_modules/json-2-csv/src/utils.js"),
    _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js"),
    path = __webpack_require__(/*! doc-path */ "./node_modules/doc-path/src/path.js"),
    deeks = __webpack_require__(/*! deeks */ "./node_modules/deeks/src/deeks.js");

const Json2Csv = function(options) {
    const wrapDelimiterCheckRegex = new RegExp(options.delimiter.wrap, 'g'),
        crlfSearchRegex = /\r?\n|\r/,
        deeksOptions = {
            expandArrayObjects: options.expandArrayObjects,
            ignoreEmptyArraysWhenExpanding: options.expandArrayObjects
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
            let uniqueFieldNames = _.uniq(_.flatten(documentSchemas));
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
        if (options.keys) {
            return Promise.resolve(options.keys)
                .then(sortHeaderFields);
        }

        return getFieldNameList(data)
            .then(processSchemas)
            .then(sortHeaderFields);
    }

    /** RECORD FIELD FUNCTIONS **/

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

            if (!_.isUndefined(options.emptyFieldValue) && utils.isEmptyField(recordFieldValue)) {
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
        if (_.isArray(fieldValue) || _.isObject(fieldValue) && !_.isDate(fieldValue)) {
            return JSON.stringify(fieldValue);
        } else if (_.isUndefined(fieldValue)) {
            return 'undefined';
        } else if (_.isNull(fieldValue)) {
            return 'null';
        } else {
            return fieldValue.toString();
        }
    }

    /**
     * Trims the record field value, if specified by the user's provided options
     * @param fieldValue
     * @returns {*}
     */
    function trimRecordFieldValue(fieldValue) {
        if (options.trimFieldValues) {
            if (_.isArray(fieldValue)) {
                return fieldValue.map(trimRecordFieldValue);
            } else if (_.isString(fieldValue)) {
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
        if (_.isObject(data) && !data.length) {
            data = [data]; // Convert to an array of the given document
        }

        // Retrieve the heading and then generate the CSV with the keys that are identified
        retrieveHeaderFields(data)
            .then((headerFields) => ({
                headerFields,
                callback,
                records: data
            }))
            .then(processRecords)
            .then(wrapHeaderFields)
            .then(trimHeaderFields)
            .then(generateCsvHeader)
            .then(generateCsvFromComponents)
            .catch(callback);
    }

    return {
        convert,
        validationFn: _.isObject,
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


let constants = __webpack_require__(/*! ./constants.json */ "./node_modules/json-2-csv/src/constants.json"),
    _ = __webpack_require__(/*! underscore */ "./node_modules/underscore/underscore.js");

const dateStringRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

module.exports = {
    isStringRepresentation,
    isDateRepresentation,
    computeSchemaDifferences,
    deepCopy,
    convert,
    isEmptyField,
    removeEmptyFields,
    getNCharacters
};

/**
 * Build the options to be passed to the appropriate function
 * If a user does not provide custom options, then we use our default
 * If options are provided, then we set each valid key that was passed
 * @param opts {Object} options object
 * @return {Object} options object
 */
function buildOptions(opts) {
    opts = _.defaults(opts || {}, constants.defaultOptions);

    // Note: _.defaults does a shallow default, we need to deep copy the DELIMITER object
    opts.delimiter = _.defaults(opts.delimiter, constants.defaultOptions.delimiter);

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
    if (_.isObject(arg1) && !_.isFunction(arg1)) {
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
    return _.difference(schemaA, schemaB)
        .concat(_.difference(schemaB, schemaA));
}

/**
 * Utility function to check if a field is considered empty so that the emptyFieldValue can be used instead
 * @param fieldValue
 * @returns {boolean}
 */
function isEmptyField(fieldValue) {
    return _.isUndefined(fieldValue) || _.isNull(fieldValue) || fieldValue === '';
}

/**
 * Helper function that removes empty field values from an array.
 * @param fields
 * @returns {Array}
 */
function removeEmptyFields(fields) {
    return _.filter(fields, (field) => !isEmptyField(field));
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

/***/ "./node_modules/underscore/underscore.js":
/*!***********************************************!*\
  !*** ./node_modules/underscore/underscore.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if ( true && !exports.nodeType) {
    if ( true && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if ( true && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return _;
    }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}());

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(module)))

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
     * @memberof Converter
     */
    decodeAline(aline) {
        const timestamp = this.pullTime(aline);
        const htmlText = aline
            .replace(/<text.+>/, '')
            .replace(/&amp;/gi, '&')
            .replace(/<\/?[^>]+(>|$)/g, '');
        const striptags = __webpack_require__(/*! striptags */ "./node_modules/striptags/src/striptags.js");
        const he = __webpack_require__(/*! he */ "./node_modules/he/he.js");
        const decodedText = he.decode(htmlText);
        const text = striptags(decodedText);
        return {
            timestamp: timestamp,
            text: text
        };
    }
    /**
     * Split lines into by a line.
     *
     * @param {string} lines
     * @returns {string[]}
     * @memberof Converter
     */
    explode(lines) {
        return lines.split('</text>').filter((line) => line && line.trim());
    }
    /**
     * Trim xml tag in first line
     *
     * @param {string} transcript
     * @returns {string[]}
     * @memberof Converter
     */
    removeXmlTag(transcript) {
        return transcript.replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '').replace('</transcript>', '');
    }
    /**
     * Pull time from text data.
     * <text start="10.159" dur="2.563">
     * @param {string} aline
     * @returns {Timestamp}
     * @memberof Converter
     */
    pullTime(aline) {
        const startRegex = /start="([\d.]+)"/;
        const durRegex = /dur="([\d.]+)"/;
        const [, start] = startRegex.exec(aline);
        const [, dur] = durRegex.exec(aline);
        return new timestamp_1.default(Number(start), Number(dur));
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
                reject(new Error('XMLHttpRequest Error: ' + this.statusText));
            };
            request.open('GET', url);
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
                text: aline.text
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
            const numericCounter = index + 1 + '\n';
            const aline = parser.decodeAline(line);
            const text = aline.text.replace(/\n/, ' ') + '\n';
            return {
                index: numericCounter,
                timestamp: aline.timestamp.formatSrt(),
                text: text
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
            const text = aline.text.replace(/\n/, ' ') + '\n';
            return {
                timestamp: aline.timestamp.formatVtt(),
                text: text
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
    reason: 'check'
};
var videoTitle;
window.onload = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, sendData, function (response) {
            if (response.error) {
                console.log(response.error);
                displayMessage('This video has none caption.');
                return;
            }
            if (response.captions) {
                videoTitle = response.title;
                addSelectBox();
                response.captions.filter(function (value) {
                    addSelectBoxOption(value);
                });
                addDownloadButton();
                addSelectBoxFormat();
            }
        });
    });
};
function addSelectBoxFormat() {
    document
        .getElementById('content')
        .insertAdjacentHTML('afterbegin', "<select class='uk-select' style='margin-bottom:5px' id='format'><option value='csv'>.csv</option><option value='text'>.txt</option><option value='vtt'>.vtt</option><option value='srt'>.srt</option></select>");
}
function addSelectBox() {
    document.getElementById('content').insertAdjacentHTML('afterbegin', "<select class='uk-select' id='language'></select>");
}
function addSelectBoxOption(value) {
    document.getElementById('language').insertAdjacentHTML('beforeend', `<option value=${value.baseUrl}>${value.name.simpleText}</option>`);
}
function addDownloadButton() {
    document
        .getElementById('content')
        .insertAdjacentHTML('afterend', "<div class='uk-margin'><button id='download-button' class='uk-button uk-button-primary' onclick=download()>Download</button></div>");
    // register eventHandler function download()
    document.getElementById('download-button').onclick = () => download();
}
function debug(response) {
    const debug = document.getElementById('debug');
    debug.insertAdjacentHTML('beforebegin', response);
}
function displayMessage(message) {
    const content = document.getElementById('content');
    content.insertAdjacentHTML('beforebegin', `<p class='uk-text-danger'>${message}</p>`);
}
function download() {
    const language_url = document.getElementById('language').value;
    const format = document.getElementById('format').value;
    const client = new clientYoutube_1.default();
    client
        .getSubtitle(language_url)
        .then((xmlResponse) => {
        if (!xmlResponse)
            throw new Error('Response empty.');
        const subtitle = new subtitle_1.default(xmlResponse);
        if (format === 'csv') {
            subtitle.getCsv(videoTitle);
        }
        else if (format === 'text') {
            subtitle.getText(videoTitle);
        }
        else if (format === 'vtt') {
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
        wrap: '',
        field: '',
        eol: '\n'
    },
    prependHeader: false
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
                url: URL.createObjectURL(new Blob(['WEBVTT\n\n' + csv], { type: 'text/plain' })),
                filename: filename + '.vtt'
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
                url: URL.createObjectURL(new Blob([csv], { type: 'text/plain' })),
                filename: filename + '.srt'
            });
        })
            .catch((err) => {
            if (err)
                throw err;
        });
    }
    getCsv(filename) {
        json2csv
            .json2csvAsync(new converter_1.default(this.xmlResponse).toCsv())
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
                filename: filename + '.csv'
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
            .json2csvAsync(new converter_1.default(this.xmlResponse).toCsv())
            .then((csv) => {
            chrome.downloads.download({
                url: URL.createObjectURL(new Blob([csv], { type: 'text/plane' })),
                filename: filename + '.txt'
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
        return this.getStartTime().replace(/[.]/, ',') + ' --> ' + this.getDurationTime().replace(/[.]/, ',') + '\n';
    }
    /**
     * Create VTT timestamp format.
     * example: 00:00:00.000 --> 00:00:00.000
     *
     * @returns {string}
     * @memberof Timestamp
     */
    formatVtt() {
        return this.getStartTime() + ' --> ' + this.getDurationTime() + '\n';
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
        return new Date(startSeconds * 1000 + durationSeconds * 1000).toISOString().slice(11, -1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2RlZWtzL3NyYy9kZWVrcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZG9jLXBhdGgvc3JjL3BhdGguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hlL2hlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy9jb252ZXJ0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2NzdjJqc29uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy9qc29uMmNzdi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbi0yLWNzdi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0cmlwdGFncy9zcmMvc3RyaXB0YWdzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2FwdGlvbnNQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwLnRzIiwid2VicGFjazovLy8uL3NyYy9zdWJ0aXRsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7O0FBRWIsVUFBVSxtQkFBTyxDQUFDLDJEQUFZOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7Ozs7QUNwSWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx5Q0FBeUM7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLHlDQUF5Qzs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxtQkFBbUIsS0FBMEI7O0FBRTdDO0FBQ0Esa0JBQWtCLEtBQXlCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQiw4aUJBQThpQix3WkFBd1osV0FBVzs7QUFFbitCO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsYUFBYTtBQUNiLGVBQWU7QUFDZixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBLHd4ZkFBd3hmLGluQkFBaW5CLDZCQUE2Qix5QkFBeUI7QUFDLzdnQixrQkFBa0IsNHRlQUE0dGUsd0tBQXdLLDJ1WkFBMnVaLHdLQUF3Syw2Z0ZBQTZnRjtBQUN0ejlCLHdCQUF3QjtBQUN4Qix5QkFBeUI7QUFDekI7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEMsbUJBQW1CLGlCQUFpQjtBQUNwQyxxQkFBcUIsTUFBTSxZQUFZO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QyxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxFQUFFO0FBQzFDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkMsa0JBQWtCLGlCQUFpQjtBQUNuQztBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkMsSUFBSTtBQUNKLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLElBRVU7QUFDWjtBQUNBLEVBQUUsbUNBQU87QUFDVDtBQUNBLEdBQUc7QUFBQSxvR0FBQztBQUNKLEVBQUUsTUFBTSxZQVVOOztBQUVGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Vlk7O0FBRWIsS0FBSyxTQUFTLEdBQUcsbUJBQU8sQ0FBQyw2REFBWTtBQUNyQyxLQUFLLFNBQVMsR0FBRyxtQkFBTyxDQUFDLDZEQUFZO0FBQ3JDLFlBQVksbUJBQU8sQ0FBQyx1REFBUzs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRWE7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsc0VBQWtCO0FBQzFDLFlBQVksbUJBQU8sQ0FBQyx1REFBUztBQUM3QixRQUFRLG1CQUFPLENBQUMsMkRBQVk7QUFDNUIsV0FBVyxtQkFBTyxDQUFDLHFEQUFVOztBQUU3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxQkFBcUIsU0FBUztBQUM5QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBLHNCQUFzQixNQUFNO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLG9EQUFvRDs7QUFFcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLFNBQVM7QUFDN0IsbUJBQW1CLE9BQU8sRUFBRTtBQUM1QjtBQUNBO0FBQ0EsMERBQTBEO0FBQzFEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7O0FBRUE7QUFDQTtBQUNBLFNBQVMsSUFBSTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixPQUFPLEVBQUU7QUFDL0IsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQjs7Ozs7Ozs7Ozs7OztBQ2hZTDs7QUFFYixnQkFBZ0IsbUJBQU8sQ0FBQyxzRUFBa0I7QUFDMUMsWUFBWSxtQkFBTyxDQUFDLHVEQUFTO0FBQzdCLFFBQVEsbUJBQU8sQ0FBQywyREFBWTtBQUM1QixXQUFXLG1CQUFPLENBQUMscURBQVU7QUFDN0IsWUFBWSxtQkFBTyxDQUFDLGdEQUFPOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLGNBQWM7QUFDbEMsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsaUJBQWlCLGNBQWM7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekMsd0JBQXdCLFNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0I7Ozs7Ozs7Ozs7Ozs7QUNwV0w7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsc0VBQWtCO0FBQzFDLFFBQVEsbUJBQU8sQ0FBQywyREFBWTs7QUFFNUIsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7O0FBRWxFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQSxnQ0FBZ0M7O0FBRWhDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGdCQUFnQjtBQUNoQyxnQkFBZ0IsZ0JBQWdCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU8sZUFBZSxRQUFRLElBQUksYUFBYSxTQUFTLHlDQUF5QyxPQUFPO0FBQzFIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQSxTQUFTLGtCQUFrQjtBQUMzQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3ZMQSxrQ0FBYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLCtDQUErQyxjQUFjO0FBQzdEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxRQUFRLElBQTBDO0FBQ2xEO0FBQ0EsUUFBUSxtQ0FBTywyQkFBMkIsa0JBQWtCLEVBQUU7QUFBQSxvR0FBQztBQUMvRDs7QUFFQSxTQUFTLEVBUUo7QUFDTCxDQUFDOzs7Ozs7Ozs7Ozs7QUMxT0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sS0FBNkI7QUFDbkMsUUFBUSxLQUE0QjtBQUNwQztBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksZ0JBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsb0JBQW9CO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixZQUFZO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxZQUFZO0FBQ2xEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx1Q0FBdUMsWUFBWTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDhCQUE4QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdCQUFnQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxZQUFZO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxZQUFZO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFdBQVc7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xELEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDO0FBQ3hDLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLGdCQUFnQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFlBQVk7QUFDekQ7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksOEJBQThCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsMEJBQTBCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxxQkFBcUIsY0FBYztBQUNuQztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLFlBQVk7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLGVBQWU7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsZUFBZTtBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGdCQUFnQjtBQUN6QztBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsT0FBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxZQUFZO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscURBQXFEO0FBQ3JEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLEtBQXdCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixPQUFPO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmLGNBQWM7QUFDZCxjQUFjO0FBQ2QsZ0JBQWdCO0FBQ2hCLGdCQUFnQjtBQUNoQixnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCOztBQUU1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1AscUJBQXFCO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsaUJBQWlCOztBQUVqQjtBQUNBLGtEQUFrRCxFQUFFLGlCQUFpQjs7QUFFckU7QUFDQSx3QkFBd0IsOEJBQThCO0FBQ3RELDJCQUEyQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtEQUFrRCxpQkFBaUI7O0FBRW5FO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBeUM7QUFDL0MsSUFBSSxpQ0FBcUIsRUFBRSxtQ0FBRTtBQUM3QjtBQUNBLEtBQUs7QUFBQSxvR0FBQztBQUNOO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzNwREQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDckJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCxvQ0FBb0MsbUJBQU8sQ0FBQyx1Q0FBYTtBQUN6RDtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBLDBCQUEwQixtQkFBTyxDQUFDLDREQUFXO0FBQzdDLG1CQUFtQixtQkFBTyxDQUFDLG1DQUFJO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDakVhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBLDhFQUE4RSxRQUFRO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDNUJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCx5Q0FBeUMsbUJBQU8sQ0FBQyxpREFBa0I7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ25FYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQsbUNBQW1DLG1CQUFPLENBQUMscUNBQVk7QUFDdkQsd0NBQXdDLG1CQUFPLENBQUMsNkRBQXdCO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsb0NBQW9DO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RixjQUFjLEdBQUcsc0JBQXNCO0FBQ2hJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRUFBMkUsUUFBUTtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7Ozs7OztBQ3BGYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQsb0NBQW9DLG1CQUFPLENBQUMsdUNBQWE7QUFDekQsaUJBQWlCLG1CQUFPLENBQUMsOERBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLHFCQUFxQjtBQUM5RjtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxxQkFBcUI7QUFDL0U7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsbUJBQW1CO0FBQzdFO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLHlCQUF5QixtQkFBTyxDQUFDLDhEQUFZO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELHFCQUFxQjtBQUMvRTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdFYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGVBQWUsT0FBTztBQUN0QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwb3B1cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL3BvcHVwLnRzXCIpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkZWVwS2V5czogZGVlcEtleXMsXG4gICAgZGVlcEtleXNGcm9tTGlzdDogZGVlcEtleXNGcm9tTGlzdFxufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGRlZXAga2V5cyBsaXN0IGZvciBhIHNpbmdsZSBkb2N1bWVudFxuICogQHBhcmFtIG9iamVjdFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gZGVlcEtleXMob2JqZWN0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhvcHRpb25zKTtcbiAgICBpZiAoXy5pc09iamVjdChvYmplY3QpKSB7XG4gICAgICAgIHJldHVybiBnZW5lcmF0ZURlZXBLZXlzTGlzdCgnJywgb2JqZWN0LCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgZGVlcCBrZXlzIGxpc3QgZm9yIGFsbCBkb2N1bWVudHMgaW4gdGhlIHByb3ZpZGVkIGxpc3RcbiAqIEBwYXJhbSBsaXN0XG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMgQXJyYXlbQXJyYXlbU3RyaW5nXV1cbiAqL1xuZnVuY3Rpb24gZGVlcEtleXNGcm9tTGlzdChsaXN0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG1lcmdlT3B0aW9ucyhvcHRpb25zKTtcbiAgICByZXR1cm4gbGlzdC5tYXAoKGRvY3VtZW50KSA9PiB7IC8vIGZvciBlYWNoIGRvY3VtZW50XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGRvY3VtZW50KSkge1xuICAgICAgICAgICAgLy8gaWYgdGhlIGRhdGEgYXQgdGhlIGtleSBpcyBhIGRvY3VtZW50LCB0aGVuIHdlIHJldHJpZXZlIHRoZSBzdWJIZWFkaW5nIHN0YXJ0aW5nIHdpdGggYW4gZW1wdHkgc3RyaW5nIGhlYWRpbmcgYW5kIHRoZSBkb2NcbiAgICAgICAgICAgIHJldHVybiBkZWVwS2V5cyhkb2N1bWVudCwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZURlZXBLZXlzTGlzdChoZWFkaW5nLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhkYXRhKS5tYXAoKGN1cnJlbnRLZXkpID0+IHtcbiAgICAgICAgLy8gSWYgdGhlIGdpdmVuIGhlYWRpbmcgaXMgZW1wdHksIHRoZW4gd2Ugc2V0IHRoZSBoZWFkaW5nIHRvIGJlIHRoZSBzdWJLZXksIG90aGVyd2lzZSBzZXQgaXQgYXMgYSBuZXN0ZWQgaGVhZGluZyB3LyBhIGRvdFxuICAgICAgICBsZXQga2V5TmFtZSA9IGJ1aWxkS2V5TmFtZShoZWFkaW5nLCBjdXJyZW50S2V5KTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFub3RoZXIgbmVzdGVkIGRvY3VtZW50LCByZWN1ciBvbiB0aGUgc3ViLWRvY3VtZW50IHRvIHJldHJpZXZlIHRoZSBmdWxsIGtleSBuYW1lXG4gICAgICAgIGlmIChpc0RvY3VtZW50VG9SZWN1ck9uKGRhdGFbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVEZWVwS2V5c0xpc3Qoa2V5TmFtZSwgZGF0YVtjdXJyZW50S2V5XSwgb3B0aW9ucyk7XG4gICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5leHBhbmRBcnJheU9iamVjdHMgJiYgaXNBcnJheVRvUmVjdXJPbihkYXRhW2N1cnJlbnRLZXldKSkge1xuICAgICAgICAgICAgLy8gSWYgd2UgaGF2ZSBhIG5lc3RlZCBhcnJheSB0aGF0IHdlIG5lZWQgdG8gcmVjdXIgb25cbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzQXJyYXlLZXlzKGRhdGFbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSByZXR1cm4gdGhpcyBrZXkgbmFtZSBzaW5jZSB3ZSBkb24ndCBoYXZlIGEgc3ViIGRvY3VtZW50XG4gICAgICAgIHJldHVybiBrZXlOYW1lO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIF8uZmxhdHRlbihrZXlzKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gaGFuZGxlIHRoZSBwcm9jZXNzaW5nIG9mIGFycmF5cyB3aGVuIHRoZSBleHBhbmRBcnJheU9iamVjdHNcbiAqIG9wdGlvbiBpcyBzcGVjaWZpZWQuXG4gKiBAcGFyYW0gc3ViQXJyYXlcbiAqIEBwYXJhbSBjdXJyZW50S2V5UGF0aFxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBwcm9jZXNzQXJyYXlLZXlzKHN1YkFycmF5LCBjdXJyZW50S2V5UGF0aCwgb3B0aW9ucykge1xuICAgIGxldCBzdWJBcnJheUtleXMgPSBkZWVwS2V5c0Zyb21MaXN0KHN1YkFycmF5KTtcblxuICAgIGlmICghc3ViQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmlnbm9yZUVtcHR5QXJyYXlzV2hlbkV4cGFuZGluZyA/IFtdIDogW2N1cnJlbnRLZXlQYXRoXTtcbiAgICB9IGVsc2UgaWYgKHN1YkFycmF5Lmxlbmd0aCAmJiBfLmZsYXR0ZW4oc3ViQXJyYXlLZXlzKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gSGFzIGl0ZW1zIGluIHRoZSBhcnJheSwgYnV0IG5vIG9iamVjdHNcbiAgICAgICAgcmV0dXJuIFtjdXJyZW50S2V5UGF0aF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc3ViQXJyYXlLZXlzID0gc3ViQXJyYXlLZXlzLm1hcCgoc2NoZW1hS2V5cykgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRW1wdHlBcnJheShzY2hlbWFLZXlzKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbY3VycmVudEtleVBhdGhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNjaGVtYUtleXMubWFwKChzdWJLZXkpID0+IGJ1aWxkS2V5TmFtZShjdXJyZW50S2V5UGF0aCwgc3ViS2V5KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBfLnVuaXEoXy5mbGF0dGVuKHN1YkFycmF5S2V5cykpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBGdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZSBrZXkgcGF0aFxuICogQHBhcmFtIHVwcGVyS2V5TmFtZSBTdHJpbmcgYWNjdW11bGF0ZWQga2V5IHBhdGhcbiAqIEBwYXJhbSBjdXJyZW50S2V5TmFtZSBTdHJpbmcgY3VycmVudCBrZXkgbmFtZVxuICogQHJldHVybnMgU3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkS2V5TmFtZSh1cHBlcktleU5hbWUsIGN1cnJlbnRLZXlOYW1lKSB7XG4gICAgaWYgKHVwcGVyS2V5TmFtZSkge1xuICAgICAgICByZXR1cm4gdXBwZXJLZXlOYW1lICsgJy4nICsgY3VycmVudEtleU5hbWU7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50S2V5TmFtZTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBhIGRvY3VtZW50IHRvIHJlY3VyIG9uIG9yIG5vdFxuICogQHBhcmFtIHZhbCBBbnkgaXRlbSB3aG9zZSB0eXBlIHdpbGwgYmUgZXZhbHVhdGVkXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNEb2N1bWVudFRvUmVjdXJPbih2YWwpIHtcbiAgICByZXR1cm4gXy5pc09iamVjdCh2YWwpICYmICFfLmlzTnVsbCh2YWwpICYmICFBcnJheS5pc0FycmF5KHZhbCkgJiYgT2JqZWN0LmtleXModmFsKS5sZW5ndGg7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIHRoaXMgdmFsdWUgaXMgYW4gYXJyYXkgdG8gcmVjdXIgb24gb3Igbm90XG4gKiBAcGFyYW0gdmFsIEFueSBpdGVtIHdob3NlIHR5cGUgd2lsbCBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FycmF5VG9SZWN1ck9uKHZhbCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBhIHZhbHVlIGlzIGFuIGVtcHR5IGFycmF5XG4gKiBAcGFyYW0gdmFsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFbXB0eUFycmF5KHZhbCkge1xuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCkgJiYgIXZhbC5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIF8uZGVmYXVsdHMob3B0aW9ucyB8fCB7fSwge1xuICAgICAgICBleHBhbmRBcnJheU9iamVjdHM6IGZhbHNlLFxuICAgICAgICBpZ25vcmVFbXB0eUFycmF5c1doZW5FeHBhbmRpbmc6IGZhbHNlXG4gICAgfSk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGV2YWx1YXRlUGF0aCxcbiAgICBzZXRQYXRoXG59O1xuXG5mdW5jdGlvbiBldmFsdWF0ZVBhdGgoZG9jdW1lbnQsIGtleVBhdGgpIHtcbiAgICBpZiAoIWRvY3VtZW50KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGxldCB7aW5kZXhPZkRvdCwgY3VycmVudEtleSwgcmVtYWluaW5nS2V5UGF0aH0gPSBjb21wdXRlU3RhdGVJbmZvcm1hdGlvbihrZXlQYXRoKTtcblxuICAgIC8vIElmIHRoZXJlIGlzIGEgJy4nIGluIHRoZSBrZXlQYXRoIGFuZCBrZXlQYXRoIGRvZXNuJ3QgYXBwZWFyIGluIHRoZSBkb2N1bWVudCwgcmVjdXIgb24gdGhlIHN1YmRvY3VtZW50XG4gICAgaWYgKGluZGV4T2ZEb3QgPj0gMCAmJiAhZG9jdW1lbnRba2V5UGF0aF0pIHtcbiAgICAgICAgLy8gSWYgdGhlcmUncyBhbiBhcnJheSBhdCB0aGUgY3VycmVudEtleSBpbiB0aGUgZG9jdW1lbnQsIHRoZW4gaXRlcmF0ZSBvdmVyIHRob3NlIGl0ZW1zIGV2YWx1YXRpbmcgdGhlIHJlbWFpbmluZyBwYXRoXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGRvY3VtZW50W2N1cnJlbnRLZXldKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50W2N1cnJlbnRLZXldLm1hcCgoZG9jKSA9PiBldmFsdWF0ZVBhdGgoZG9jLCByZW1haW5pbmdLZXlQYXRoKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4ganVzdCByZWN1clxuICAgICAgICByZXR1cm4gZXZhbHVhdGVQYXRoKGRvY3VtZW50W2N1cnJlbnRLZXldLCByZW1haW5pbmdLZXlQYXRoKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZG9jdW1lbnQpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgXCJkb2N1bWVudFwiIGlzIGFjdHVhbGx5IGFuIGFycmF5LCB0aGVuIGl0ZXJhdGUgb3ZlciB0aG9zZSBpdGVtcyBldmFsdWF0aW5nIHRoZSBwYXRoXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5tYXAoKGRvYykgPT4gZXZhbHVhdGVQYXRoKGRvYywga2V5UGF0aCkpO1xuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgd2UgY2FuIGp1c3QgcmV0dXJuIHZhbHVlIGRpcmVjdGx5XG4gICAgcmV0dXJuIGRvY3VtZW50W2tleVBhdGhdO1xufVxuXG5mdW5jdGlvbiBzZXRQYXRoKGRvY3VtZW50LCBrZXlQYXRoLCB2YWx1ZSkge1xuICAgIGlmICghZG9jdW1lbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBkb2N1bWVudCB3YXMgcHJvdmlkZWQuJyk7XG4gICAgfVxuXG4gICAgbGV0IHtpbmRleE9mRG90LCBjdXJyZW50S2V5LCByZW1haW5pbmdLZXlQYXRofSA9IGNvbXB1dGVTdGF0ZUluZm9ybWF0aW9uKGtleVBhdGgpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSAnLicgaW4gdGhlIGtleVBhdGgsIHJlY3VyIG9uIHRoZSBzdWJkb2MgYW5kIC4uLlxuICAgIGlmIChpbmRleE9mRG90ID49IDApIHtcbiAgICAgICAgaWYgKCFkb2N1bWVudFtjdXJyZW50S2V5XSAmJiBBcnJheS5pc0FycmF5KGRvY3VtZW50KSkge1xuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhbiBhcnJheSBhbmQgdGhlcmUgYXJlIG11bHRpcGxlIGxldmVscyBvZiBrZXlzIHRvIGl0ZXJhdGUgb3ZlciwgcmVjdXIuXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQuZm9yRWFjaCgoZG9jKSA9PiBzZXRQYXRoKGRvYywga2V5UGF0aCwgdmFsdWUpKTtcbiAgICAgICAgfSBlbHNlIGlmICghZG9jdW1lbnRbY3VycmVudEtleV0pIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBjdXJyZW50S2V5IGRvZXNuJ3QgZXhpc3QgeWV0LCBwb3B1bGF0ZSBpdFxuICAgICAgICAgICAgZG9jdW1lbnRbY3VycmVudEtleV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBzZXRQYXRoKGRvY3VtZW50W2N1cnJlbnRLZXldLCByZW1haW5pbmdLZXlQYXRoLCB2YWx1ZSk7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGRvY3VtZW50KSkge1xuICAgICAgICAvLyBJZiB0aGlzIFwiZG9jdW1lbnRcIiBpcyBhY3R1YWxseSBhbiBhcnJheSwgdGhlbiB3ZSBjYW4gbG9vcCBvdmVyIGVhY2ggb2YgdGhlIHZhbHVlcyBhbmQgc2V0IHRoZSBwYXRoXG4gICAgICAgIHJldHVybiBkb2N1bWVudC5mb3JFYWNoKChkb2MpID0+IHNldFBhdGgoZG9jLCByZW1haW5pbmdLZXlQYXRoLCB2YWx1ZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgY2FuIHNldCB0aGUgcGF0aCBkaXJlY3RseVxuICAgICAgICBkb2N1bWVudFtrZXlQYXRoXSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBkb2N1bWVudDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHNvbWUgaW5mb3JtYXRpb24gbmVjZXNzYXJ5IHRvIGV2YWx1YXRlIG9yIHNldCBhIHBhdGhcbiAqICAgYmFzZWQgb24gdGhlIHByb3ZpZGVkIGtleVBhdGggdmFsdWVcbiAqIEBwYXJhbSBrZXlQYXRoXG4gKiBAcmV0dXJucyB7e2luZGV4T2ZEb3Q6IE51bWJlciwgY3VycmVudEtleTogU3RyaW5nLCByZW1haW5pbmdLZXlQYXRoOiBTdHJpbmd9fVxuICovXG5mdW5jdGlvbiBjb21wdXRlU3RhdGVJbmZvcm1hdGlvbihrZXlQYXRoKSB7XG4gICAgbGV0IGluZGV4T2ZEb3QgPSBrZXlQYXRoLmluZGV4T2YoJy4nKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGluZGV4T2ZEb3QsXG4gICAgICAgIGN1cnJlbnRLZXk6IGtleVBhdGguc2xpY2UoMCwgaW5kZXhPZkRvdCA+PSAwID8gaW5kZXhPZkRvdCA6IHVuZGVmaW5lZCksXG4gICAgICAgIHJlbWFpbmluZ0tleVBhdGg6IGtleVBhdGguc2xpY2UoaW5kZXhPZkRvdCArIDEpXG4gICAgfTtcbn1cbiIsIi8qISBodHRwczovL210aHMuYmUvaGUgdjEuMi4wIGJ5IEBtYXRoaWFzIHwgTUlUIGxpY2Vuc2UgKi9cbjsoZnVuY3Rpb24ocm9vdCkge1xuXG5cdC8vIERldGVjdCBmcmVlIHZhcmlhYmxlcyBgZXhwb3J0c2AuXG5cdHZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuXG5cdHZhciBmcmVlTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiZcblx0XHRtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAsIGZyb20gTm9kZS5qcyBvciBCcm93c2VyaWZpZWQgY29kZSxcblx0Ly8gYW5kIHVzZSBpdCBhcyBgcm9vdGAuXG5cdHZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7XG5cdGlmIChmcmVlR2xvYmFsLmdsb2JhbCA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCkge1xuXHRcdHJvb3QgPSBmcmVlR2xvYmFsO1xuXHR9XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0Ly8gQWxsIGFzdHJhbCBzeW1ib2xzLlxuXHR2YXIgcmVnZXhBc3RyYWxTeW1ib2xzID0gL1tcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0vZztcblx0Ly8gQWxsIEFTQ0lJIHN5bWJvbHMgKG5vdCBqdXN0IHByaW50YWJsZSBBU0NJSSkgZXhjZXB0IHRob3NlIGxpc3RlZCBpbiB0aGVcblx0Ly8gZmlyc3QgY29sdW1uIG9mIHRoZSBvdmVycmlkZXMgdGFibGUuXG5cdC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3RhYmxlLWNoYXJyZWYtb3ZlcnJpZGVzXG5cdHZhciByZWdleEFzY2lpV2hpdGVsaXN0ID0gL1tcXHgwMS1cXHg3Rl0vZztcblx0Ly8gQWxsIEJNUCBzeW1ib2xzIHRoYXQgYXJlIG5vdCBBU0NJSSBuZXdsaW5lcywgcHJpbnRhYmxlIEFTQ0lJIHN5bWJvbHMsIG9yXG5cdC8vIGNvZGUgcG9pbnRzIGxpc3RlZCBpbiB0aGUgZmlyc3QgY29sdW1uIG9mIHRoZSBvdmVycmlkZXMgdGFibGUgb25cblx0Ly8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjdGFibGUtY2hhcnJlZi1vdmVycmlkZXMuXG5cdHZhciByZWdleEJtcFdoaXRlbGlzdCA9IC9bXFx4MDEtXFx0XFx4MEJcXGZcXHgwRS1cXHgxRlxceDdGXFx4ODFcXHg4RFxceDhGXFx4OTBcXHg5RFxceEEwLVxcdUZGRkZdL2c7XG5cblx0dmFyIHJlZ2V4RW5jb2RlTm9uQXNjaWkgPSAvPFxcdTIwRDJ8PVxcdTIwRTV8PlxcdTIwRDJ8XFx1MjA1RlxcdTIwMEF8XFx1MjE5RFxcdTAzMzh8XFx1MjIwMlxcdTAzMzh8XFx1MjIyMFxcdTIwRDJ8XFx1MjIyOVxcdUZFMDB8XFx1MjIyQVxcdUZFMDB8XFx1MjIzQ1xcdTIwRDJ8XFx1MjIzRFxcdTAzMzF8XFx1MjIzRVxcdTAzMzN8XFx1MjI0MlxcdTAzMzh8XFx1MjI0QlxcdTAzMzh8XFx1MjI0RFxcdTIwRDJ8XFx1MjI0RVxcdTAzMzh8XFx1MjI0RlxcdTAzMzh8XFx1MjI1MFxcdTAzMzh8XFx1MjI2MVxcdTIwRTV8XFx1MjI2NFxcdTIwRDJ8XFx1MjI2NVxcdTIwRDJ8XFx1MjI2NlxcdTAzMzh8XFx1MjI2N1xcdTAzMzh8XFx1MjI2OFxcdUZFMDB8XFx1MjI2OVxcdUZFMDB8XFx1MjI2QVxcdTAzMzh8XFx1MjI2QVxcdTIwRDJ8XFx1MjI2QlxcdTAzMzh8XFx1MjI2QlxcdTIwRDJ8XFx1MjI3RlxcdTAzMzh8XFx1MjI4MlxcdTIwRDJ8XFx1MjI4M1xcdTIwRDJ8XFx1MjI4QVxcdUZFMDB8XFx1MjI4QlxcdUZFMDB8XFx1MjI4RlxcdTAzMzh8XFx1MjI5MFxcdTAzMzh8XFx1MjI5M1xcdUZFMDB8XFx1MjI5NFxcdUZFMDB8XFx1MjJCNFxcdTIwRDJ8XFx1MjJCNVxcdTIwRDJ8XFx1MjJEOFxcdTAzMzh8XFx1MjJEOVxcdTAzMzh8XFx1MjJEQVxcdUZFMDB8XFx1MjJEQlxcdUZFMDB8XFx1MjJGNVxcdTAzMzh8XFx1MjJGOVxcdTAzMzh8XFx1MjkzM1xcdTAzMzh8XFx1MjlDRlxcdTAzMzh8XFx1MjlEMFxcdTAzMzh8XFx1MkE2RFxcdTAzMzh8XFx1MkE3MFxcdTAzMzh8XFx1MkE3RFxcdTAzMzh8XFx1MkE3RVxcdTAzMzh8XFx1MkFBMVxcdTAzMzh8XFx1MkFBMlxcdTAzMzh8XFx1MkFBQ1xcdUZFMDB8XFx1MkFBRFxcdUZFMDB8XFx1MkFBRlxcdTAzMzh8XFx1MkFCMFxcdTAzMzh8XFx1MkFDNVxcdTAzMzh8XFx1MkFDNlxcdTAzMzh8XFx1MkFDQlxcdUZFMDB8XFx1MkFDQ1xcdUZFMDB8XFx1MkFGRFxcdTIwRTV8W1xceEEwLVxcdTAxMTNcXHUwMTE2LVxcdTAxMjJcXHUwMTI0LVxcdTAxMkJcXHUwMTJFLVxcdTAxNERcXHUwMTUwLVxcdTAxN0VcXHUwMTkyXFx1MDFCNVxcdTAxRjVcXHUwMjM3XFx1MDJDNlxcdTAyQzdcXHUwMkQ4LVxcdTAyRERcXHUwMzExXFx1MDM5MS1cXHUwM0ExXFx1MDNBMy1cXHUwM0E5XFx1MDNCMS1cXHUwM0M5XFx1MDNEMVxcdTAzRDJcXHUwM0Q1XFx1MDNENlxcdTAzRENcXHUwM0REXFx1MDNGMFxcdTAzRjFcXHUwM0Y1XFx1MDNGNlxcdTA0MDEtXFx1MDQwQ1xcdTA0MEUtXFx1MDQ0RlxcdTA0NTEtXFx1MDQ1Q1xcdTA0NUVcXHUwNDVGXFx1MjAwMi1cXHUyMDA1XFx1MjAwNy1cXHUyMDEwXFx1MjAxMy1cXHUyMDE2XFx1MjAxOC1cXHUyMDFBXFx1MjAxQy1cXHUyMDFFXFx1MjAyMC1cXHUyMDIyXFx1MjAyNVxcdTIwMjZcXHUyMDMwLVxcdTIwMzVcXHUyMDM5XFx1MjAzQVxcdTIwM0VcXHUyMDQxXFx1MjA0M1xcdTIwNDRcXHUyMDRGXFx1MjA1N1xcdTIwNUYtXFx1MjA2M1xcdTIwQUNcXHUyMERCXFx1MjBEQ1xcdTIxMDJcXHUyMTA1XFx1MjEwQS1cXHUyMTEzXFx1MjExNS1cXHUyMTFFXFx1MjEyMlxcdTIxMjRcXHUyMTI3LVxcdTIxMjlcXHUyMTJDXFx1MjEyRFxcdTIxMkYtXFx1MjEzMVxcdTIxMzMtXFx1MjEzOFxcdTIxNDUtXFx1MjE0OFxcdTIxNTMtXFx1MjE1RVxcdTIxOTAtXFx1MjE5QlxcdTIxOUQtXFx1MjFBN1xcdTIxQTktXFx1MjFBRVxcdTIxQjAtXFx1MjFCM1xcdTIxQjUtXFx1MjFCN1xcdTIxQkEtXFx1MjFEQlxcdTIxRERcXHUyMUU0XFx1MjFFNVxcdTIxRjVcXHUyMUZELVxcdTIyMDVcXHUyMjA3LVxcdTIyMDlcXHUyMjBCXFx1MjIwQ1xcdTIyMEYtXFx1MjIxNFxcdTIyMTYtXFx1MjIxOFxcdTIyMUFcXHUyMjFELVxcdTIyMzhcXHUyMjNBLVxcdTIyNTdcXHUyMjU5XFx1MjI1QVxcdTIyNUNcXHUyMjVGLVxcdTIyNjJcXHUyMjY0LVxcdTIyOEJcXHUyMjhELVxcdTIyOUJcXHUyMjlELVxcdTIyQTVcXHUyMkE3LVxcdTIyQjBcXHUyMkIyLVxcdTIyQkJcXHUyMkJELVxcdTIyREJcXHUyMkRFLVxcdTIyRTNcXHUyMkU2LVxcdTIyRjdcXHUyMkY5LVxcdTIyRkVcXHUyMzA1XFx1MjMwNlxcdTIzMDgtXFx1MjMxMFxcdTIzMTJcXHUyMzEzXFx1MjMxNVxcdTIzMTZcXHUyMzFDLVxcdTIzMUZcXHUyMzIyXFx1MjMyM1xcdTIzMkRcXHUyMzJFXFx1MjMzNlxcdTIzM0RcXHUyMzNGXFx1MjM3Q1xcdTIzQjBcXHUyM0IxXFx1MjNCNC1cXHUyM0I2XFx1MjNEQy1cXHUyM0RGXFx1MjNFMlxcdTIzRTdcXHUyNDIzXFx1MjRDOFxcdTI1MDBcXHUyNTAyXFx1MjUwQ1xcdTI1MTBcXHUyNTE0XFx1MjUxOFxcdTI1MUNcXHUyNTI0XFx1MjUyQ1xcdTI1MzRcXHUyNTNDXFx1MjU1MC1cXHUyNTZDXFx1MjU4MFxcdTI1ODRcXHUyNTg4XFx1MjU5MS1cXHUyNTkzXFx1MjVBMVxcdTI1QUFcXHUyNUFCXFx1MjVBRFxcdTI1QUVcXHUyNUIxXFx1MjVCMy1cXHUyNUI1XFx1MjVCOFxcdTI1QjlcXHUyNUJELVxcdTI1QkZcXHUyNUMyXFx1MjVDM1xcdTI1Q0FcXHUyNUNCXFx1MjVFQ1xcdTI1RUZcXHUyNUY4LVxcdTI1RkNcXHUyNjA1XFx1MjYwNlxcdTI2MEVcXHUyNjQwXFx1MjY0MlxcdTI2NjBcXHUyNjYzXFx1MjY2NVxcdTI2NjZcXHUyNjZBXFx1MjY2RC1cXHUyNjZGXFx1MjcxM1xcdTI3MTdcXHUyNzIwXFx1MjczNlxcdTI3NThcXHUyNzcyXFx1Mjc3M1xcdTI3QzhcXHUyN0M5XFx1MjdFNi1cXHUyN0VEXFx1MjdGNS1cXHUyN0ZBXFx1MjdGQ1xcdTI3RkZcXHUyOTAyLVxcdTI5MDVcXHUyOTBDLVxcdTI5MTNcXHUyOTE2XFx1MjkxOS1cXHUyOTIwXFx1MjkyMy1cXHUyOTJBXFx1MjkzM1xcdTI5MzUtXFx1MjkzOVxcdTI5M0NcXHUyOTNEXFx1Mjk0NVxcdTI5NDgtXFx1Mjk0QlxcdTI5NEUtXFx1Mjk3NlxcdTI5NzhcXHUyOTc5XFx1Mjk3Qi1cXHUyOTdGXFx1Mjk4NVxcdTI5ODZcXHUyOThCLVxcdTI5OTZcXHUyOTlBXFx1Mjk5Q1xcdTI5OURcXHUyOUE0LVxcdTI5QjdcXHUyOUI5XFx1MjlCQlxcdTI5QkNcXHUyOUJFLVxcdTI5QzVcXHUyOUM5XFx1MjlDRC1cXHUyOUQwXFx1MjlEQy1cXHUyOURFXFx1MjlFMy1cXHUyOUU1XFx1MjlFQlxcdTI5RjRcXHUyOUY2XFx1MkEwMC1cXHUyQTAyXFx1MkEwNFxcdTJBMDZcXHUyQTBDXFx1MkEwRFxcdTJBMTAtXFx1MkExN1xcdTJBMjItXFx1MkEyN1xcdTJBMjlcXHUyQTJBXFx1MkEyRC1cXHUyQTMxXFx1MkEzMy1cXHUyQTNDXFx1MkEzRlxcdTJBNDBcXHUyQTQyLVxcdTJBNERcXHUyQTUwXFx1MkE1My1cXHUyQTU4XFx1MkE1QS1cXHUyQTVEXFx1MkE1RlxcdTJBNjZcXHUyQTZBXFx1MkE2RC1cXHUyQTc1XFx1MkE3Ny1cXHUyQTlBXFx1MkE5RC1cXHUyQUEyXFx1MkFBNC1cXHUyQUIwXFx1MkFCMy1cXHUyQUM4XFx1MkFDQlxcdTJBQ0NcXHUyQUNGLVxcdTJBREJcXHUyQUU0XFx1MkFFNi1cXHUyQUU5XFx1MkFFQi1cXHUyQUYzXFx1MkFGRFxcdUZCMDAtXFx1RkIwNF18XFx1RDgzNVtcXHVEQzlDXFx1REM5RVxcdURDOUZcXHVEQ0EyXFx1RENBNVxcdURDQTZcXHVEQ0E5LVxcdURDQUNcXHVEQ0FFLVxcdURDQjlcXHVEQ0JCXFx1RENCRC1cXHVEQ0MzXFx1RENDNS1cXHVEQ0NGXFx1REQwNFxcdUREMDVcXHVERDA3LVxcdUREMEFcXHVERDBELVxcdUREMTRcXHVERDE2LVxcdUREMUNcXHVERDFFLVxcdUREMzlcXHVERDNCLVxcdUREM0VcXHVERDQwLVxcdURENDRcXHVERDQ2XFx1REQ0QS1cXHVERDUwXFx1REQ1Mi1cXHVERDZCXS9nO1xuXHR2YXIgZW5jb2RlTWFwID0geydcXHhBRCc6J3NoeScsJ1xcdTIwMEMnOid6d25qJywnXFx1MjAwRCc6J3p3aicsJ1xcdTIwMEUnOidscm0nLCdcXHUyMDYzJzonaWMnLCdcXHUyMDYyJzonaXQnLCdcXHUyMDYxJzonYWYnLCdcXHUyMDBGJzoncmxtJywnXFx1MjAwQic6J1plcm9XaWR0aFNwYWNlJywnXFx1MjA2MCc6J05vQnJlYWsnLCdcXHUwMzExJzonRG93bkJyZXZlJywnXFx1MjBEQic6J3Rkb3QnLCdcXHUyMERDJzonRG90RG90JywnXFx0JzonVGFiJywnXFxuJzonTmV3TGluZScsJ1xcdTIwMDgnOidwdW5jc3AnLCdcXHUyMDVGJzonTWVkaXVtU3BhY2UnLCdcXHUyMDA5JzondGhpbnNwJywnXFx1MjAwQSc6J2hhaXJzcCcsJ1xcdTIwMDQnOidlbXNwMTMnLCdcXHUyMDAyJzonZW5zcCcsJ1xcdTIwMDUnOidlbXNwMTQnLCdcXHUyMDAzJzonZW1zcCcsJ1xcdTIwMDcnOidudW1zcCcsJ1xceEEwJzonbmJzcCcsJ1xcdTIwNUZcXHUyMDBBJzonVGhpY2tTcGFjZScsJ1xcdTIwM0UnOidvbGluZScsJ18nOidsb3diYXInLCdcXHUyMDEwJzonZGFzaCcsJ1xcdTIwMTMnOiduZGFzaCcsJ1xcdTIwMTQnOidtZGFzaCcsJ1xcdTIwMTUnOidob3JiYXInLCcsJzonY29tbWEnLCc7Jzonc2VtaScsJ1xcdTIwNEYnOidic2VtaScsJzonOidjb2xvbicsJ1xcdTJBNzQnOidDb2xvbmUnLCchJzonZXhjbCcsJ1xceEExJzonaWV4Y2wnLCc/JzoncXVlc3QnLCdcXHhCRic6J2lxdWVzdCcsJy4nOidwZXJpb2QnLCdcXHUyMDI1JzonbmxkcicsJ1xcdTIwMjYnOidtbGRyJywnXFx4QjcnOidtaWRkb3QnLCdcXCcnOidhcG9zJywnXFx1MjAxOCc6J2xzcXVvJywnXFx1MjAxOSc6J3JzcXVvJywnXFx1MjAxQSc6J3NicXVvJywnXFx1MjAzOSc6J2xzYXF1bycsJ1xcdTIwM0EnOidyc2FxdW8nLCdcIic6J3F1b3QnLCdcXHUyMDFDJzonbGRxdW8nLCdcXHUyMDFEJzoncmRxdW8nLCdcXHUyMDFFJzonYmRxdW8nLCdcXHhBQic6J2xhcXVvJywnXFx4QkInOidyYXF1bycsJygnOidscGFyJywnKSc6J3JwYXInLCdbJzonbHNxYicsJ10nOidyc3FiJywneyc6J2xjdWInLCd9JzoncmN1YicsJ1xcdTIzMDgnOidsY2VpbCcsJ1xcdTIzMDknOidyY2VpbCcsJ1xcdTIzMEEnOidsZmxvb3InLCdcXHUyMzBCJzoncmZsb29yJywnXFx1Mjk4NSc6J2xvcGFyJywnXFx1Mjk4Nic6J3JvcGFyJywnXFx1Mjk4Qic6J2xicmtlJywnXFx1Mjk4Qyc6J3JicmtlJywnXFx1Mjk4RCc6J2xicmtzbHUnLCdcXHUyOThFJzoncmJya3NsZCcsJ1xcdTI5OEYnOidsYnJrc2xkJywnXFx1Mjk5MCc6J3JicmtzbHUnLCdcXHUyOTkxJzonbGFuZ2QnLCdcXHUyOTkyJzoncmFuZ2QnLCdcXHUyOTkzJzonbHBhcmx0JywnXFx1Mjk5NCc6J3JwYXJndCcsJ1xcdTI5OTUnOidndGxQYXInLCdcXHUyOTk2JzonbHRyUGFyJywnXFx1MjdFNic6J2xvYnJrJywnXFx1MjdFNyc6J3JvYnJrJywnXFx1MjdFOCc6J2xhbmcnLCdcXHUyN0U5JzoncmFuZycsJ1xcdTI3RUEnOidMYW5nJywnXFx1MjdFQic6J1JhbmcnLCdcXHUyN0VDJzonbG9hbmcnLCdcXHUyN0VEJzoncm9hbmcnLCdcXHUyNzcyJzonbGJicmsnLCdcXHUyNzczJzoncmJicmsnLCdcXHUyMDE2JzonVmVydCcsJ1xceEE3Jzonc2VjdCcsJ1xceEI2JzoncGFyYScsJ0AnOidjb21tYXQnLCcqJzonYXN0JywnLyc6J3NvbCcsJ3VuZGVmaW5lZCc6bnVsbCwnJic6J2FtcCcsJyMnOidudW0nLCclJzoncGVyY250JywnXFx1MjAzMCc6J3Blcm1pbCcsJ1xcdTIwMzEnOidwZXJ0ZW5rJywnXFx1MjAyMCc6J2RhZ2dlcicsJ1xcdTIwMjEnOidEYWdnZXInLCdcXHUyMDIyJzonYnVsbCcsJ1xcdTIwNDMnOidoeWJ1bGwnLCdcXHUyMDMyJzoncHJpbWUnLCdcXHUyMDMzJzonUHJpbWUnLCdcXHUyMDM0JzondHByaW1lJywnXFx1MjA1Nyc6J3FwcmltZScsJ1xcdTIwMzUnOidicHJpbWUnLCdcXHUyMDQxJzonY2FyZXQnLCdgJzonZ3JhdmUnLCdcXHhCNCc6J2FjdXRlJywnXFx1MDJEQyc6J3RpbGRlJywnXic6J0hhdCcsJ1xceEFGJzonbWFjcicsJ1xcdTAyRDgnOidicmV2ZScsJ1xcdTAyRDknOidkb3QnLCdcXHhBOCc6J2RpZScsJ1xcdTAyREEnOidyaW5nJywnXFx1MDJERCc6J2RibGFjJywnXFx4QjgnOidjZWRpbCcsJ1xcdTAyREInOidvZ29uJywnXFx1MDJDNic6J2NpcmMnLCdcXHUwMkM3JzonY2Fyb24nLCdcXHhCMCc6J2RlZycsJ1xceEE5JzonY29weScsJ1xceEFFJzoncmVnJywnXFx1MjExNyc6J2NvcHlzcicsJ1xcdTIxMTgnOid3cCcsJ1xcdTIxMUUnOidyeCcsJ1xcdTIxMjcnOidtaG8nLCdcXHUyMTI5JzonaWlvdGEnLCdcXHUyMTkwJzonbGFycicsJ1xcdTIxOUEnOidubGFycicsJ1xcdTIxOTInOidyYXJyJywnXFx1MjE5Qic6J25yYXJyJywnXFx1MjE5MSc6J3VhcnInLCdcXHUyMTkzJzonZGFycicsJ1xcdTIxOTQnOidoYXJyJywnXFx1MjFBRSc6J25oYXJyJywnXFx1MjE5NSc6J3ZhcnInLCdcXHUyMTk2JzonbndhcnInLCdcXHUyMTk3JzonbmVhcnInLCdcXHUyMTk4Jzonc2VhcnInLCdcXHUyMTk5Jzonc3dhcnInLCdcXHUyMTlEJzoncmFycncnLCdcXHUyMTlEXFx1MDMzOCc6J25yYXJydycsJ1xcdTIxOUUnOidMYXJyJywnXFx1MjE5Ric6J1VhcnInLCdcXHUyMUEwJzonUmFycicsJ1xcdTIxQTEnOidEYXJyJywnXFx1MjFBMic6J2xhcnJ0bCcsJ1xcdTIxQTMnOidyYXJydGwnLCdcXHUyMUE0JzonbWFwc3RvbGVmdCcsJ1xcdTIxQTUnOidtYXBzdG91cCcsJ1xcdTIxQTYnOidtYXAnLCdcXHUyMUE3JzonbWFwc3RvZG93bicsJ1xcdTIxQTknOidsYXJyaGsnLCdcXHUyMUFBJzoncmFycmhrJywnXFx1MjFBQic6J2xhcnJscCcsJ1xcdTIxQUMnOidyYXJybHAnLCdcXHUyMUFEJzonaGFycncnLCdcXHUyMUIwJzonbHNoJywnXFx1MjFCMSc6J3JzaCcsJ1xcdTIxQjInOidsZHNoJywnXFx1MjFCMyc6J3Jkc2gnLCdcXHUyMUI1JzonY3JhcnInLCdcXHUyMUI2JzonY3VsYXJyJywnXFx1MjFCNyc6J2N1cmFycicsJ1xcdTIxQkEnOidvbGFycicsJ1xcdTIxQkInOidvcmFycicsJ1xcdTIxQkMnOidsaGFydScsJ1xcdTIxQkQnOidsaGFyZCcsJ1xcdTIxQkUnOid1aGFycicsJ1xcdTIxQkYnOid1aGFybCcsJ1xcdTIxQzAnOidyaGFydScsJ1xcdTIxQzEnOidyaGFyZCcsJ1xcdTIxQzInOidkaGFycicsJ1xcdTIxQzMnOidkaGFybCcsJ1xcdTIxQzQnOidybGFycicsJ1xcdTIxQzUnOid1ZGFycicsJ1xcdTIxQzYnOidscmFycicsJ1xcdTIxQzcnOidsbGFycicsJ1xcdTIxQzgnOid1dWFycicsJ1xcdTIxQzknOidycmFycicsJ1xcdTIxQ0EnOidkZGFycicsJ1xcdTIxQ0InOidscmhhcicsJ1xcdTIxQ0MnOidybGhhcicsJ1xcdTIxRDAnOidsQXJyJywnXFx1MjFDRCc6J25sQXJyJywnXFx1MjFEMSc6J3VBcnInLCdcXHUyMUQyJzonckFycicsJ1xcdTIxQ0YnOiduckFycicsJ1xcdTIxRDMnOidkQXJyJywnXFx1MjFENCc6J2lmZicsJ1xcdTIxQ0UnOiduaEFycicsJ1xcdTIxRDUnOid2QXJyJywnXFx1MjFENic6J253QXJyJywnXFx1MjFENyc6J25lQXJyJywnXFx1MjFEOCc6J3NlQXJyJywnXFx1MjFEOSc6J3N3QXJyJywnXFx1MjFEQSc6J2xBYXJyJywnXFx1MjFEQic6J3JBYXJyJywnXFx1MjFERCc6J3ppZ3JhcnInLCdcXHUyMUU0JzonbGFycmInLCdcXHUyMUU1JzoncmFycmInLCdcXHUyMUY1JzonZHVhcnInLCdcXHUyMUZEJzonbG9hcnInLCdcXHUyMUZFJzoncm9hcnInLCdcXHUyMUZGJzonaG9hcnInLCdcXHUyMjAwJzonZm9yYWxsJywnXFx1MjIwMSc6J2NvbXAnLCdcXHUyMjAyJzoncGFydCcsJ1xcdTIyMDJcXHUwMzM4JzonbnBhcnQnLCdcXHUyMjAzJzonZXhpc3QnLCdcXHUyMjA0JzonbmV4aXN0JywnXFx1MjIwNSc6J2VtcHR5JywnXFx1MjIwNyc6J0RlbCcsJ1xcdTIyMDgnOidpbicsJ1xcdTIyMDknOidub3RpbicsJ1xcdTIyMEInOiduaScsJ1xcdTIyMEMnOidub3RuaScsJ1xcdTAzRjYnOidiZXBzaScsJ1xcdTIyMEYnOidwcm9kJywnXFx1MjIxMCc6J2NvcHJvZCcsJ1xcdTIyMTEnOidzdW0nLCcrJzoncGx1cycsJ1xceEIxJzoncG0nLCdcXHhGNyc6J2RpdicsJ1xceEQ3JzondGltZXMnLCc8JzonbHQnLCdcXHUyMjZFJzonbmx0JywnPFxcdTIwRDInOidudmx0JywnPSc6J2VxdWFscycsJ1xcdTIyNjAnOiduZScsJz1cXHUyMEU1JzonYm5lJywnXFx1MkE3NSc6J0VxdWFsJywnPic6J2d0JywnXFx1MjI2Ric6J25ndCcsJz5cXHUyMEQyJzonbnZndCcsJ1xceEFDJzonbm90JywnfCc6J3ZlcnQnLCdcXHhBNic6J2JydmJhcicsJ1xcdTIyMTInOidtaW51cycsJ1xcdTIyMTMnOidtcCcsJ1xcdTIyMTQnOidwbHVzZG8nLCdcXHUyMDQ0JzonZnJhc2wnLCdcXHUyMjE2Jzonc2V0bW4nLCdcXHUyMjE3JzonbG93YXN0JywnXFx1MjIxOCc6J2NvbXBmbicsJ1xcdTIyMUEnOidTcXJ0JywnXFx1MjIxRCc6J3Byb3AnLCdcXHUyMjFFJzonaW5maW4nLCdcXHUyMjFGJzonYW5ncnQnLCdcXHUyMjIwJzonYW5nJywnXFx1MjIyMFxcdTIwRDInOiduYW5nJywnXFx1MjIyMSc6J2FuZ21zZCcsJ1xcdTIyMjInOidhbmdzcGgnLCdcXHUyMjIzJzonbWlkJywnXFx1MjIyNCc6J25taWQnLCdcXHUyMjI1JzoncGFyJywnXFx1MjIyNic6J25wYXInLCdcXHUyMjI3JzonYW5kJywnXFx1MjIyOCc6J29yJywnXFx1MjIyOSc6J2NhcCcsJ1xcdTIyMjlcXHVGRTAwJzonY2FwcycsJ1xcdTIyMkEnOidjdXAnLCdcXHUyMjJBXFx1RkUwMCc6J2N1cHMnLCdcXHUyMjJCJzonaW50JywnXFx1MjIyQyc6J0ludCcsJ1xcdTIyMkQnOid0aW50JywnXFx1MkEwQyc6J3FpbnQnLCdcXHUyMjJFJzonb2ludCcsJ1xcdTIyMkYnOidDb25pbnQnLCdcXHUyMjMwJzonQ2NvbmludCcsJ1xcdTIyMzEnOidjd2ludCcsJ1xcdTIyMzInOidjd2NvbmludCcsJ1xcdTIyMzMnOidhd2NvbmludCcsJ1xcdTIyMzQnOid0aGVyZTQnLCdcXHUyMjM1JzonYmVjYXVzJywnXFx1MjIzNic6J3JhdGlvJywnXFx1MjIzNyc6J0NvbG9uJywnXFx1MjIzOCc6J21pbnVzZCcsJ1xcdTIyM0EnOidtRERvdCcsJ1xcdTIyM0InOidob210aHQnLCdcXHUyMjNDJzonc2ltJywnXFx1MjI0MSc6J25zaW0nLCdcXHUyMjNDXFx1MjBEMic6J252c2ltJywnXFx1MjIzRCc6J2JzaW0nLCdcXHUyMjNEXFx1MDMzMSc6J3JhY2UnLCdcXHUyMjNFJzonYWMnLCdcXHUyMjNFXFx1MDMzMyc6J2FjRScsJ1xcdTIyM0YnOidhY2QnLCdcXHUyMjQwJzond3InLCdcXHUyMjQyJzonZXNpbScsJ1xcdTIyNDJcXHUwMzM4JzonbmVzaW0nLCdcXHUyMjQzJzonc2ltZScsJ1xcdTIyNDQnOiduc2ltZScsJ1xcdTIyNDUnOidjb25nJywnXFx1MjI0Nyc6J25jb25nJywnXFx1MjI0Nic6J3NpbW5lJywnXFx1MjI0OCc6J2FwJywnXFx1MjI0OSc6J25hcCcsJ1xcdTIyNEEnOidhcGUnLCdcXHUyMjRCJzonYXBpZCcsJ1xcdTIyNEJcXHUwMzM4JzonbmFwaWQnLCdcXHUyMjRDJzonYmNvbmcnLCdcXHUyMjREJzonQ3VwQ2FwJywnXFx1MjI2RCc6J05vdEN1cENhcCcsJ1xcdTIyNERcXHUyMEQyJzonbnZhcCcsJ1xcdTIyNEUnOididW1wJywnXFx1MjI0RVxcdTAzMzgnOiduYnVtcCcsJ1xcdTIyNEYnOididW1wZScsJ1xcdTIyNEZcXHUwMzM4JzonbmJ1bXBlJywnXFx1MjI1MCc6J2RvdGVxJywnXFx1MjI1MFxcdTAzMzgnOiduZWRvdCcsJ1xcdTIyNTEnOidlRG90JywnXFx1MjI1Mic6J2VmRG90JywnXFx1MjI1Myc6J2VyRG90JywnXFx1MjI1NCc6J2NvbG9uZScsJ1xcdTIyNTUnOidlY29sb24nLCdcXHUyMjU2JzonZWNpcicsJ1xcdTIyNTcnOidjaXJlJywnXFx1MjI1OSc6J3dlZGdlcScsJ1xcdTIyNUEnOid2ZWVlcScsJ1xcdTIyNUMnOid0cmllJywnXFx1MjI1Ric6J2VxdWVzdCcsJ1xcdTIyNjEnOidlcXVpdicsJ1xcdTIyNjInOiduZXF1aXYnLCdcXHUyMjYxXFx1MjBFNSc6J2JuZXF1aXYnLCdcXHUyMjY0JzonbGUnLCdcXHUyMjcwJzonbmxlJywnXFx1MjI2NFxcdTIwRDInOidudmxlJywnXFx1MjI2NSc6J2dlJywnXFx1MjI3MSc6J25nZScsJ1xcdTIyNjVcXHUyMEQyJzonbnZnZScsJ1xcdTIyNjYnOidsRScsJ1xcdTIyNjZcXHUwMzM4JzonbmxFJywnXFx1MjI2Nyc6J2dFJywnXFx1MjI2N1xcdTAzMzgnOiduZ0UnLCdcXHUyMjY4XFx1RkUwMCc6J2x2bkUnLCdcXHUyMjY4JzonbG5FJywnXFx1MjI2OSc6J2duRScsJ1xcdTIyNjlcXHVGRTAwJzonZ3ZuRScsJ1xcdTIyNkEnOidsbCcsJ1xcdTIyNkFcXHUwMzM4Jzonbkx0dicsJ1xcdTIyNkFcXHUyMEQyJzonbkx0JywnXFx1MjI2Qic6J2dnJywnXFx1MjI2QlxcdTAzMzgnOiduR3R2JywnXFx1MjI2QlxcdTIwRDInOiduR3QnLCdcXHUyMjZDJzondHdpeHQnLCdcXHUyMjcyJzonbHNpbScsJ1xcdTIyNzQnOidubHNpbScsJ1xcdTIyNzMnOidnc2ltJywnXFx1MjI3NSc6J25nc2ltJywnXFx1MjI3Nic6J2xnJywnXFx1MjI3OCc6J250bGcnLCdcXHUyMjc3JzonZ2wnLCdcXHUyMjc5JzonbnRnbCcsJ1xcdTIyN0EnOidwcicsJ1xcdTIyODAnOiducHInLCdcXHUyMjdCJzonc2MnLCdcXHUyMjgxJzonbnNjJywnXFx1MjI3Qyc6J3ByY3VlJywnXFx1MjJFMCc6J25wcmN1ZScsJ1xcdTIyN0QnOidzY2N1ZScsJ1xcdTIyRTEnOiduc2NjdWUnLCdcXHUyMjdFJzoncHJzaW0nLCdcXHUyMjdGJzonc2NzaW0nLCdcXHUyMjdGXFx1MDMzOCc6J05vdFN1Y2NlZWRzVGlsZGUnLCdcXHUyMjgyJzonc3ViJywnXFx1MjI4NCc6J25zdWInLCdcXHUyMjgyXFx1MjBEMic6J3Zuc3ViJywnXFx1MjI4Myc6J3N1cCcsJ1xcdTIyODUnOiduc3VwJywnXFx1MjI4M1xcdTIwRDInOid2bnN1cCcsJ1xcdTIyODYnOidzdWJlJywnXFx1MjI4OCc6J25zdWJlJywnXFx1MjI4Nyc6J3N1cGUnLCdcXHUyMjg5JzonbnN1cGUnLCdcXHUyMjhBXFx1RkUwMCc6J3ZzdWJuZScsJ1xcdTIyOEEnOidzdWJuZScsJ1xcdTIyOEJcXHVGRTAwJzondnN1cG5lJywnXFx1MjI4Qic6J3N1cG5lJywnXFx1MjI4RCc6J2N1cGRvdCcsJ1xcdTIyOEUnOid1cGx1cycsJ1xcdTIyOEYnOidzcXN1YicsJ1xcdTIyOEZcXHUwMzM4JzonTm90U3F1YXJlU3Vic2V0JywnXFx1MjI5MCc6J3Nxc3VwJywnXFx1MjI5MFxcdTAzMzgnOidOb3RTcXVhcmVTdXBlcnNldCcsJ1xcdTIyOTEnOidzcXN1YmUnLCdcXHUyMkUyJzonbnNxc3ViZScsJ1xcdTIyOTInOidzcXN1cGUnLCdcXHUyMkUzJzonbnNxc3VwZScsJ1xcdTIyOTMnOidzcWNhcCcsJ1xcdTIyOTNcXHVGRTAwJzonc3FjYXBzJywnXFx1MjI5NCc6J3NxY3VwJywnXFx1MjI5NFxcdUZFMDAnOidzcWN1cHMnLCdcXHUyMjk1Jzonb3BsdXMnLCdcXHUyMjk2Jzonb21pbnVzJywnXFx1MjI5Nyc6J290aW1lcycsJ1xcdTIyOTgnOidvc29sJywnXFx1MjI5OSc6J29kb3QnLCdcXHUyMjlBJzonb2NpcicsJ1xcdTIyOUInOidvYXN0JywnXFx1MjI5RCc6J29kYXNoJywnXFx1MjI5RSc6J3BsdXNiJywnXFx1MjI5Ric6J21pbnVzYicsJ1xcdTIyQTAnOid0aW1lc2InLCdcXHUyMkExJzonc2RvdGInLCdcXHUyMkEyJzondmRhc2gnLCdcXHUyMkFDJzonbnZkYXNoJywnXFx1MjJBMyc6J2Rhc2h2JywnXFx1MjJBNCc6J3RvcCcsJ1xcdTIyQTUnOidib3QnLCdcXHUyMkE3JzonbW9kZWxzJywnXFx1MjJBOCc6J3ZEYXNoJywnXFx1MjJBRCc6J252RGFzaCcsJ1xcdTIyQTknOidWZGFzaCcsJ1xcdTIyQUUnOiduVmRhc2gnLCdcXHUyMkFBJzonVnZkYXNoJywnXFx1MjJBQic6J1ZEYXNoJywnXFx1MjJBRic6J25WRGFzaCcsJ1xcdTIyQjAnOidwcnVyZWwnLCdcXHUyMkIyJzondmx0cmknLCdcXHUyMkVBJzonbmx0cmknLCdcXHUyMkIzJzondnJ0cmknLCdcXHUyMkVCJzonbnJ0cmknLCdcXHUyMkI0JzonbHRyaWUnLCdcXHUyMkVDJzonbmx0cmllJywnXFx1MjJCNFxcdTIwRDInOidudmx0cmllJywnXFx1MjJCNSc6J3J0cmllJywnXFx1MjJFRCc6J25ydHJpZScsJ1xcdTIyQjVcXHUyMEQyJzonbnZydHJpZScsJ1xcdTIyQjYnOidvcmlnb2YnLCdcXHUyMkI3JzonaW1vZicsJ1xcdTIyQjgnOidtdW1hcCcsJ1xcdTIyQjknOidoZXJjb24nLCdcXHUyMkJBJzonaW50Y2FsJywnXFx1MjJCQic6J3ZlZWJhcicsJ1xcdTIyQkQnOidiYXJ2ZWUnLCdcXHUyMkJFJzonYW5ncnR2YicsJ1xcdTIyQkYnOidscnRyaScsJ1xcdTIyQzAnOidXZWRnZScsJ1xcdTIyQzEnOidWZWUnLCdcXHUyMkMyJzoneGNhcCcsJ1xcdTIyQzMnOid4Y3VwJywnXFx1MjJDNCc6J2RpYW0nLCdcXHUyMkM1Jzonc2RvdCcsJ1xcdTIyQzYnOidTdGFyJywnXFx1MjJDNyc6J2Rpdm9ueCcsJ1xcdTIyQzgnOidib3d0aWUnLCdcXHUyMkM5JzonbHRpbWVzJywnXFx1MjJDQSc6J3J0aW1lcycsJ1xcdTIyQ0InOidsdGhyZWUnLCdcXHUyMkNDJzoncnRocmVlJywnXFx1MjJDRCc6J2JzaW1lJywnXFx1MjJDRSc6J2N1dmVlJywnXFx1MjJDRic6J2N1d2VkJywnXFx1MjJEMCc6J1N1YicsJ1xcdTIyRDEnOidTdXAnLCdcXHUyMkQyJzonQ2FwJywnXFx1MjJEMyc6J0N1cCcsJ1xcdTIyRDQnOidmb3JrJywnXFx1MjJENSc6J2VwYXInLCdcXHUyMkQ2JzonbHRkb3QnLCdcXHUyMkQ3JzonZ3Rkb3QnLCdcXHUyMkQ4JzonTGwnLCdcXHUyMkQ4XFx1MDMzOCc6J25MbCcsJ1xcdTIyRDknOidHZycsJ1xcdTIyRDlcXHUwMzM4JzonbkdnJywnXFx1MjJEQVxcdUZFMDAnOidsZXNnJywnXFx1MjJEQSc6J2xlZycsJ1xcdTIyREInOidnZWwnLCdcXHUyMkRCXFx1RkUwMCc6J2dlc2wnLCdcXHUyMkRFJzonY3VlcHInLCdcXHUyMkRGJzonY3Vlc2MnLCdcXHUyMkU2JzonbG5zaW0nLCdcXHUyMkU3JzonZ25zaW0nLCdcXHUyMkU4JzoncHJuc2ltJywnXFx1MjJFOSc6J3NjbnNpbScsJ1xcdTIyRUUnOid2ZWxsaXAnLCdcXHUyMkVGJzonY3Rkb3QnLCdcXHUyMkYwJzondXRkb3QnLCdcXHUyMkYxJzonZHRkb3QnLCdcXHUyMkYyJzonZGlzaW4nLCdcXHUyMkYzJzonaXNpbnN2JywnXFx1MjJGNCc6J2lzaW5zJywnXFx1MjJGNSc6J2lzaW5kb3QnLCdcXHUyMkY1XFx1MDMzOCc6J25vdGluZG90JywnXFx1MjJGNic6J25vdGludmMnLCdcXHUyMkY3Jzonbm90aW52YicsJ1xcdTIyRjknOidpc2luRScsJ1xcdTIyRjlcXHUwMzM4Jzonbm90aW5FJywnXFx1MjJGQSc6J25pc2QnLCdcXHUyMkZCJzoneG5pcycsJ1xcdTIyRkMnOiduaXMnLCdcXHUyMkZEJzonbm90bml2YycsJ1xcdTIyRkUnOidub3RuaXZiJywnXFx1MjMwNSc6J2JhcndlZCcsJ1xcdTIzMDYnOidCYXJ3ZWQnLCdcXHUyMzBDJzonZHJjcm9wJywnXFx1MjMwRCc6J2RsY3JvcCcsJ1xcdTIzMEUnOid1cmNyb3AnLCdcXHUyMzBGJzondWxjcm9wJywnXFx1MjMxMCc6J2Jub3QnLCdcXHUyMzEyJzoncHJvZmxpbmUnLCdcXHUyMzEzJzoncHJvZnN1cmYnLCdcXHUyMzE1JzondGVscmVjJywnXFx1MjMxNic6J3RhcmdldCcsJ1xcdTIzMUMnOid1bGNvcm4nLCdcXHUyMzFEJzondXJjb3JuJywnXFx1MjMxRSc6J2RsY29ybicsJ1xcdTIzMUYnOidkcmNvcm4nLCdcXHUyMzIyJzonZnJvd24nLCdcXHUyMzIzJzonc21pbGUnLCdcXHUyMzJEJzonY3lsY3R5JywnXFx1MjMyRSc6J3Byb2ZhbGFyJywnXFx1MjMzNic6J3RvcGJvdCcsJ1xcdTIzM0QnOidvdmJhcicsJ1xcdTIzM0YnOidzb2xiYXInLCdcXHUyMzdDJzonYW5nemFycicsJ1xcdTIzQjAnOidsbW91c3QnLCdcXHUyM0IxJzoncm1vdXN0JywnXFx1MjNCNCc6J3RicmsnLCdcXHUyM0I1JzonYmJyaycsJ1xcdTIzQjYnOidiYnJrdGJyaycsJ1xcdTIzREMnOidPdmVyUGFyZW50aGVzaXMnLCdcXHUyM0REJzonVW5kZXJQYXJlbnRoZXNpcycsJ1xcdTIzREUnOidPdmVyQnJhY2UnLCdcXHUyM0RGJzonVW5kZXJCcmFjZScsJ1xcdTIzRTInOid0cnBleml1bScsJ1xcdTIzRTcnOidlbGludGVycycsJ1xcdTI0MjMnOidibGFuaycsJ1xcdTI1MDAnOidib3hoJywnXFx1MjUwMic6J2JveHYnLCdcXHUyNTBDJzonYm94ZHInLCdcXHUyNTEwJzonYm94ZGwnLCdcXHUyNTE0JzonYm94dXInLCdcXHUyNTE4JzonYm94dWwnLCdcXHUyNTFDJzonYm94dnInLCdcXHUyNTI0JzonYm94dmwnLCdcXHUyNTJDJzonYm94aGQnLCdcXHUyNTM0JzonYm94aHUnLCdcXHUyNTNDJzonYm94dmgnLCdcXHUyNTUwJzonYm94SCcsJ1xcdTI1NTEnOidib3hWJywnXFx1MjU1Mic6J2JveGRSJywnXFx1MjU1Myc6J2JveERyJywnXFx1MjU1NCc6J2JveERSJywnXFx1MjU1NSc6J2JveGRMJywnXFx1MjU1Nic6J2JveERsJywnXFx1MjU1Nyc6J2JveERMJywnXFx1MjU1OCc6J2JveHVSJywnXFx1MjU1OSc6J2JveFVyJywnXFx1MjU1QSc6J2JveFVSJywnXFx1MjU1Qic6J2JveHVMJywnXFx1MjU1Qyc6J2JveFVsJywnXFx1MjU1RCc6J2JveFVMJywnXFx1MjU1RSc6J2JveHZSJywnXFx1MjU1Ric6J2JveFZyJywnXFx1MjU2MCc6J2JveFZSJywnXFx1MjU2MSc6J2JveHZMJywnXFx1MjU2Mic6J2JveFZsJywnXFx1MjU2Myc6J2JveFZMJywnXFx1MjU2NCc6J2JveEhkJywnXFx1MjU2NSc6J2JveGhEJywnXFx1MjU2Nic6J2JveEhEJywnXFx1MjU2Nyc6J2JveEh1JywnXFx1MjU2OCc6J2JveGhVJywnXFx1MjU2OSc6J2JveEhVJywnXFx1MjU2QSc6J2JveHZIJywnXFx1MjU2Qic6J2JveFZoJywnXFx1MjU2Qyc6J2JveFZIJywnXFx1MjU4MCc6J3VoYmxrJywnXFx1MjU4NCc6J2xoYmxrJywnXFx1MjU4OCc6J2Jsb2NrJywnXFx1MjU5MSc6J2JsazE0JywnXFx1MjU5Mic6J2JsazEyJywnXFx1MjU5Myc6J2JsazM0JywnXFx1MjVBMSc6J3NxdScsJ1xcdTI1QUEnOidzcXVmJywnXFx1MjVBQic6J0VtcHR5VmVyeVNtYWxsU3F1YXJlJywnXFx1MjVBRCc6J3JlY3QnLCdcXHUyNUFFJzonbWFya2VyJywnXFx1MjVCMSc6J2ZsdG5zJywnXFx1MjVCMyc6J3h1dHJpJywnXFx1MjVCNCc6J3V0cmlmJywnXFx1MjVCNSc6J3V0cmknLCdcXHUyNUI4JzoncnRyaWYnLCdcXHUyNUI5JzoncnRyaScsJ1xcdTI1QkQnOid4ZHRyaScsJ1xcdTI1QkUnOidkdHJpZicsJ1xcdTI1QkYnOidkdHJpJywnXFx1MjVDMic6J2x0cmlmJywnXFx1MjVDMyc6J2x0cmknLCdcXHUyNUNBJzonbG96JywnXFx1MjVDQic6J2NpcicsJ1xcdTI1RUMnOid0cmlkb3QnLCdcXHUyNUVGJzoneGNpcmMnLCdcXHUyNUY4JzondWx0cmknLCdcXHUyNUY5JzondXJ0cmknLCdcXHUyNUZBJzonbGx0cmknLCdcXHUyNUZCJzonRW1wdHlTbWFsbFNxdWFyZScsJ1xcdTI1RkMnOidGaWxsZWRTbWFsbFNxdWFyZScsJ1xcdTI2MDUnOidzdGFyZicsJ1xcdTI2MDYnOidzdGFyJywnXFx1MjYwRSc6J3Bob25lJywnXFx1MjY0MCc6J2ZlbWFsZScsJ1xcdTI2NDInOidtYWxlJywnXFx1MjY2MCc6J3NwYWRlcycsJ1xcdTI2NjMnOidjbHVicycsJ1xcdTI2NjUnOidoZWFydHMnLCdcXHUyNjY2JzonZGlhbXMnLCdcXHUyNjZBJzonc3VuZycsJ1xcdTI3MTMnOidjaGVjaycsJ1xcdTI3MTcnOidjcm9zcycsJ1xcdTI3MjAnOidtYWx0JywnXFx1MjczNic6J3NleHQnLCdcXHUyNzU4JzonVmVydGljYWxTZXBhcmF0b3InLCdcXHUyN0M4JzonYnNvbGhzdWInLCdcXHUyN0M5Jzonc3VwaHNvbCcsJ1xcdTI3RjUnOid4bGFycicsJ1xcdTI3RjYnOid4cmFycicsJ1xcdTI3RjcnOid4aGFycicsJ1xcdTI3RjgnOid4bEFycicsJ1xcdTI3RjknOid4ckFycicsJ1xcdTI3RkEnOid4aEFycicsJ1xcdTI3RkMnOid4bWFwJywnXFx1MjdGRic6J2R6aWdyYXJyJywnXFx1MjkwMic6J252bEFycicsJ1xcdTI5MDMnOidudnJBcnInLCdcXHUyOTA0JzonbnZIYXJyJywnXFx1MjkwNSc6J01hcCcsJ1xcdTI5MEMnOidsYmFycicsJ1xcdTI5MEQnOidyYmFycicsJ1xcdTI5MEUnOidsQmFycicsJ1xcdTI5MEYnOidyQmFycicsJ1xcdTI5MTAnOidSQmFycicsJ1xcdTI5MTEnOidERG90cmFoZCcsJ1xcdTI5MTInOidVcEFycm93QmFyJywnXFx1MjkxMyc6J0Rvd25BcnJvd0JhcicsJ1xcdTI5MTYnOidSYXJydGwnLCdcXHUyOTE5JzonbGF0YWlsJywnXFx1MjkxQSc6J3JhdGFpbCcsJ1xcdTI5MUInOidsQXRhaWwnLCdcXHUyOTFDJzonckF0YWlsJywnXFx1MjkxRCc6J2xhcnJmcycsJ1xcdTI5MUUnOidyYXJyZnMnLCdcXHUyOTFGJzonbGFycmJmcycsJ1xcdTI5MjAnOidyYXJyYmZzJywnXFx1MjkyMyc6J253YXJoaycsJ1xcdTI5MjQnOiduZWFyaGsnLCdcXHUyOTI1Jzonc2VhcmhrJywnXFx1MjkyNic6J3N3YXJoaycsJ1xcdTI5MjcnOidud25lYXInLCdcXHUyOTI4JzondG9lYScsJ1xcdTI5MjknOid0b3NhJywnXFx1MjkyQSc6J3N3bndhcicsJ1xcdTI5MzMnOidyYXJyYycsJ1xcdTI5MzNcXHUwMzM4JzonbnJhcnJjJywnXFx1MjkzNSc6J2N1ZGFycnInLCdcXHUyOTM2JzonbGRjYScsJ1xcdTI5MzcnOidyZGNhJywnXFx1MjkzOCc6J2N1ZGFycmwnLCdcXHUyOTM5JzonbGFycnBsJywnXFx1MjkzQyc6J2N1cmFycm0nLCdcXHUyOTNEJzonY3VsYXJycCcsJ1xcdTI5NDUnOidyYXJycGwnLCdcXHUyOTQ4JzonaGFycmNpcicsJ1xcdTI5NDknOidVYXJyb2NpcicsJ1xcdTI5NEEnOidsdXJkc2hhcicsJ1xcdTI5NEInOidsZHJ1c2hhcicsJ1xcdTI5NEUnOidMZWZ0UmlnaHRWZWN0b3InLCdcXHUyOTRGJzonUmlnaHRVcERvd25WZWN0b3InLCdcXHUyOTUwJzonRG93bkxlZnRSaWdodFZlY3RvcicsJ1xcdTI5NTEnOidMZWZ0VXBEb3duVmVjdG9yJywnXFx1Mjk1Mic6J0xlZnRWZWN0b3JCYXInLCdcXHUyOTUzJzonUmlnaHRWZWN0b3JCYXInLCdcXHUyOTU0JzonUmlnaHRVcFZlY3RvckJhcicsJ1xcdTI5NTUnOidSaWdodERvd25WZWN0b3JCYXInLCdcXHUyOTU2JzonRG93bkxlZnRWZWN0b3JCYXInLCdcXHUyOTU3JzonRG93blJpZ2h0VmVjdG9yQmFyJywnXFx1Mjk1OCc6J0xlZnRVcFZlY3RvckJhcicsJ1xcdTI5NTknOidMZWZ0RG93blZlY3RvckJhcicsJ1xcdTI5NUEnOidMZWZ0VGVlVmVjdG9yJywnXFx1Mjk1Qic6J1JpZ2h0VGVlVmVjdG9yJywnXFx1Mjk1Qyc6J1JpZ2h0VXBUZWVWZWN0b3InLCdcXHUyOTVEJzonUmlnaHREb3duVGVlVmVjdG9yJywnXFx1Mjk1RSc6J0Rvd25MZWZ0VGVlVmVjdG9yJywnXFx1Mjk1Ric6J0Rvd25SaWdodFRlZVZlY3RvcicsJ1xcdTI5NjAnOidMZWZ0VXBUZWVWZWN0b3InLCdcXHUyOTYxJzonTGVmdERvd25UZWVWZWN0b3InLCdcXHUyOTYyJzonbEhhcicsJ1xcdTI5NjMnOid1SGFyJywnXFx1Mjk2NCc6J3JIYXInLCdcXHUyOTY1JzonZEhhcicsJ1xcdTI5NjYnOidsdXJ1aGFyJywnXFx1Mjk2Nyc6J2xkcmRoYXInLCdcXHUyOTY4JzoncnVsdWhhcicsJ1xcdTI5NjknOidyZGxkaGFyJywnXFx1Mjk2QSc6J2xoYXJ1bCcsJ1xcdTI5NkInOidsbGhhcmQnLCdcXHUyOTZDJzoncmhhcnVsJywnXFx1Mjk2RCc6J2xyaGFyZCcsJ1xcdTI5NkUnOid1ZGhhcicsJ1xcdTI5NkYnOidkdWhhcicsJ1xcdTI5NzAnOidSb3VuZEltcGxpZXMnLCdcXHUyOTcxJzonZXJhcnInLCdcXHUyOTcyJzonc2ltcmFycicsJ1xcdTI5NzMnOidsYXJyc2ltJywnXFx1Mjk3NCc6J3JhcnJzaW0nLCdcXHUyOTc1JzoncmFycmFwJywnXFx1Mjk3Nic6J2x0bGFycicsJ1xcdTI5NzgnOidndHJhcnInLCdcXHUyOTc5Jzonc3VicmFycicsJ1xcdTI5N0InOidzdXBsYXJyJywnXFx1Mjk3Qyc6J2xmaXNodCcsJ1xcdTI5N0QnOidyZmlzaHQnLCdcXHUyOTdFJzondWZpc2h0JywnXFx1Mjk3Ric6J2RmaXNodCcsJ1xcdTI5OUEnOid2emlnemFnJywnXFx1Mjk5Qyc6J3ZhbmdydCcsJ1xcdTI5OUQnOidhbmdydHZiZCcsJ1xcdTI5QTQnOidhbmdlJywnXFx1MjlBNSc6J3JhbmdlJywnXFx1MjlBNic6J2R3YW5nbGUnLCdcXHUyOUE3JzondXdhbmdsZScsJ1xcdTI5QTgnOidhbmdtc2RhYScsJ1xcdTI5QTknOidhbmdtc2RhYicsJ1xcdTI5QUEnOidhbmdtc2RhYycsJ1xcdTI5QUInOidhbmdtc2RhZCcsJ1xcdTI5QUMnOidhbmdtc2RhZScsJ1xcdTI5QUQnOidhbmdtc2RhZicsJ1xcdTI5QUUnOidhbmdtc2RhZycsJ1xcdTI5QUYnOidhbmdtc2RhaCcsJ1xcdTI5QjAnOidiZW1wdHl2JywnXFx1MjlCMSc6J2RlbXB0eXYnLCdcXHUyOUIyJzonY2VtcHR5dicsJ1xcdTI5QjMnOidyYWVtcHR5dicsJ1xcdTI5QjQnOidsYWVtcHR5dicsJ1xcdTI5QjUnOidvaGJhcicsJ1xcdTI5QjYnOidvbWlkJywnXFx1MjlCNyc6J29wYXInLCdcXHUyOUI5Jzonb3BlcnAnLCdcXHUyOUJCJzonb2xjcm9zcycsJ1xcdTI5QkMnOidvZHNvbGQnLCdcXHUyOUJFJzonb2xjaXInLCdcXHUyOUJGJzonb2ZjaXInLCdcXHUyOUMwJzonb2x0JywnXFx1MjlDMSc6J29ndCcsJ1xcdTI5QzInOidjaXJzY2lyJywnXFx1MjlDMyc6J2NpckUnLCdcXHUyOUM0Jzonc29sYicsJ1xcdTI5QzUnOidic29sYicsJ1xcdTI5QzknOidib3hib3gnLCdcXHUyOUNEJzondHJpc2InLCdcXHUyOUNFJzoncnRyaWx0cmknLCdcXHUyOUNGJzonTGVmdFRyaWFuZ2xlQmFyJywnXFx1MjlDRlxcdTAzMzgnOidOb3RMZWZ0VHJpYW5nbGVCYXInLCdcXHUyOUQwJzonUmlnaHRUcmlhbmdsZUJhcicsJ1xcdTI5RDBcXHUwMzM4JzonTm90UmlnaHRUcmlhbmdsZUJhcicsJ1xcdTI5REMnOidpaW5maW4nLCdcXHUyOUREJzonaW5maW50aWUnLCdcXHUyOURFJzonbnZpbmZpbicsJ1xcdTI5RTMnOidlcGFyc2wnLCdcXHUyOUU0Jzonc21lcGFyc2wnLCdcXHUyOUU1JzonZXF2cGFyc2wnLCdcXHUyOUVCJzonbG96ZicsJ1xcdTI5RjQnOidSdWxlRGVsYXllZCcsJ1xcdTI5RjYnOidkc29sJywnXFx1MkEwMCc6J3hvZG90JywnXFx1MkEwMSc6J3hvcGx1cycsJ1xcdTJBMDInOid4b3RpbWUnLCdcXHUyQTA0JzoneHVwbHVzJywnXFx1MkEwNic6J3hzcWN1cCcsJ1xcdTJBMEQnOidmcGFydGludCcsJ1xcdTJBMTAnOidjaXJmbmludCcsJ1xcdTJBMTEnOidhd2ludCcsJ1xcdTJBMTInOidycHBvbGludCcsJ1xcdTJBMTMnOidzY3BvbGludCcsJ1xcdTJBMTQnOiducG9saW50JywnXFx1MkExNSc6J3BvaW50aW50JywnXFx1MkExNic6J3F1YXRpbnQnLCdcXHUyQTE3JzonaW50bGFyaGsnLCdcXHUyQTIyJzoncGx1c2NpcicsJ1xcdTJBMjMnOidwbHVzYWNpcicsJ1xcdTJBMjQnOidzaW1wbHVzJywnXFx1MkEyNSc6J3BsdXNkdScsJ1xcdTJBMjYnOidwbHVzc2ltJywnXFx1MkEyNyc6J3BsdXN0d28nLCdcXHUyQTI5JzonbWNvbW1hJywnXFx1MkEyQSc6J21pbnVzZHUnLCdcXHUyQTJEJzonbG9wbHVzJywnXFx1MkEyRSc6J3JvcGx1cycsJ1xcdTJBMkYnOidDcm9zcycsJ1xcdTJBMzAnOid0aW1lc2QnLCdcXHUyQTMxJzondGltZXNiYXInLCdcXHUyQTMzJzonc21hc2hwJywnXFx1MkEzNCc6J2xvdGltZXMnLCdcXHUyQTM1Jzoncm90aW1lcycsJ1xcdTJBMzYnOidvdGltZXNhcycsJ1xcdTJBMzcnOidPdGltZXMnLCdcXHUyQTM4Jzonb2RpdicsJ1xcdTJBMzknOid0cmlwbHVzJywnXFx1MkEzQSc6J3RyaW1pbnVzJywnXFx1MkEzQic6J3RyaXRpbWUnLCdcXHUyQTNDJzonaXByb2QnLCdcXHUyQTNGJzonYW1hbGcnLCdcXHUyQTQwJzonY2FwZG90JywnXFx1MkE0Mic6J25jdXAnLCdcXHUyQTQzJzonbmNhcCcsJ1xcdTJBNDQnOidjYXBhbmQnLCdcXHUyQTQ1JzonY3Vwb3InLCdcXHUyQTQ2JzonY3VwY2FwJywnXFx1MkE0Nyc6J2NhcGN1cCcsJ1xcdTJBNDgnOidjdXBicmNhcCcsJ1xcdTJBNDknOidjYXBicmN1cCcsJ1xcdTJBNEEnOidjdXBjdXAnLCdcXHUyQTRCJzonY2FwY2FwJywnXFx1MkE0Qyc6J2NjdXBzJywnXFx1MkE0RCc6J2NjYXBzJywnXFx1MkE1MCc6J2NjdXBzc20nLCdcXHUyQTUzJzonQW5kJywnXFx1MkE1NCc6J09yJywnXFx1MkE1NSc6J2FuZGFuZCcsJ1xcdTJBNTYnOidvcm9yJywnXFx1MkE1Nyc6J29yc2xvcGUnLCdcXHUyQTU4JzonYW5kc2xvcGUnLCdcXHUyQTVBJzonYW5kdicsJ1xcdTJBNUInOidvcnYnLCdcXHUyQTVDJzonYW5kZCcsJ1xcdTJBNUQnOidvcmQnLCdcXHUyQTVGJzond2VkYmFyJywnXFx1MkE2Nic6J3Nkb3RlJywnXFx1MkE2QSc6J3NpbWRvdCcsJ1xcdTJBNkQnOidjb25nZG90JywnXFx1MkE2RFxcdTAzMzgnOiduY29uZ2RvdCcsJ1xcdTJBNkUnOidlYXN0ZXInLCdcXHUyQTZGJzonYXBhY2lyJywnXFx1MkE3MCc6J2FwRScsJ1xcdTJBNzBcXHUwMzM4JzonbmFwRScsJ1xcdTJBNzEnOidlcGx1cycsJ1xcdTJBNzInOidwbHVzZScsJ1xcdTJBNzMnOidFc2ltJywnXFx1MkE3Nyc6J2VERG90JywnXFx1MkE3OCc6J2VxdWl2REQnLCdcXHUyQTc5JzonbHRjaXInLCdcXHUyQTdBJzonZ3RjaXInLCdcXHUyQTdCJzonbHRxdWVzdCcsJ1xcdTJBN0MnOidndHF1ZXN0JywnXFx1MkE3RCc6J2xlcycsJ1xcdTJBN0RcXHUwMzM4JzonbmxlcycsJ1xcdTJBN0UnOidnZXMnLCdcXHUyQTdFXFx1MDMzOCc6J25nZXMnLCdcXHUyQTdGJzonbGVzZG90JywnXFx1MkE4MCc6J2dlc2RvdCcsJ1xcdTJBODEnOidsZXNkb3RvJywnXFx1MkE4Mic6J2dlc2RvdG8nLCdcXHUyQTgzJzonbGVzZG90b3InLCdcXHUyQTg0JzonZ2VzZG90b2wnLCdcXHUyQTg1JzonbGFwJywnXFx1MkE4Nic6J2dhcCcsJ1xcdTJBODcnOidsbmUnLCdcXHUyQTg4JzonZ25lJywnXFx1MkE4OSc6J2xuYXAnLCdcXHUyQThBJzonZ25hcCcsJ1xcdTJBOEInOidsRWcnLCdcXHUyQThDJzonZ0VsJywnXFx1MkE4RCc6J2xzaW1lJywnXFx1MkE4RSc6J2dzaW1lJywnXFx1MkE4Ric6J2xzaW1nJywnXFx1MkE5MCc6J2dzaW1sJywnXFx1MkE5MSc6J2xnRScsJ1xcdTJBOTInOidnbEUnLCdcXHUyQTkzJzonbGVzZ2VzJywnXFx1MkE5NCc6J2dlc2xlcycsJ1xcdTJBOTUnOidlbHMnLCdcXHUyQTk2JzonZWdzJywnXFx1MkE5Nyc6J2Vsc2RvdCcsJ1xcdTJBOTgnOidlZ3Nkb3QnLCdcXHUyQTk5JzonZWwnLCdcXHUyQTlBJzonZWcnLCdcXHUyQTlEJzonc2ltbCcsJ1xcdTJBOUUnOidzaW1nJywnXFx1MkE5Ric6J3NpbWxFJywnXFx1MkFBMCc6J3NpbWdFJywnXFx1MkFBMSc6J0xlc3NMZXNzJywnXFx1MkFBMVxcdTAzMzgnOidOb3ROZXN0ZWRMZXNzTGVzcycsJ1xcdTJBQTInOidHcmVhdGVyR3JlYXRlcicsJ1xcdTJBQTJcXHUwMzM4JzonTm90TmVzdGVkR3JlYXRlckdyZWF0ZXInLCdcXHUyQUE0JzonZ2xqJywnXFx1MkFBNSc6J2dsYScsJ1xcdTJBQTYnOidsdGNjJywnXFx1MkFBNyc6J2d0Y2MnLCdcXHUyQUE4JzonbGVzY2MnLCdcXHUyQUE5JzonZ2VzY2MnLCdcXHUyQUFBJzonc210JywnXFx1MkFBQic6J2xhdCcsJ1xcdTJBQUMnOidzbXRlJywnXFx1MkFBQ1xcdUZFMDAnOidzbXRlcycsJ1xcdTJBQUQnOidsYXRlJywnXFx1MkFBRFxcdUZFMDAnOidsYXRlcycsJ1xcdTJBQUUnOididW1wRScsJ1xcdTJBQUYnOidwcmUnLCdcXHUyQUFGXFx1MDMzOCc6J25wcmUnLCdcXHUyQUIwJzonc2NlJywnXFx1MkFCMFxcdTAzMzgnOiduc2NlJywnXFx1MkFCMyc6J3ByRScsJ1xcdTJBQjQnOidzY0UnLCdcXHUyQUI1JzoncHJuRScsJ1xcdTJBQjYnOidzY25FJywnXFx1MkFCNyc6J3ByYXAnLCdcXHUyQUI4Jzonc2NhcCcsJ1xcdTJBQjknOidwcm5hcCcsJ1xcdTJBQkEnOidzY25hcCcsJ1xcdTJBQkInOidQcicsJ1xcdTJBQkMnOidTYycsJ1xcdTJBQkQnOidzdWJkb3QnLCdcXHUyQUJFJzonc3VwZG90JywnXFx1MkFCRic6J3N1YnBsdXMnLCdcXHUyQUMwJzonc3VwcGx1cycsJ1xcdTJBQzEnOidzdWJtdWx0JywnXFx1MkFDMic6J3N1cG11bHQnLCdcXHUyQUMzJzonc3ViZWRvdCcsJ1xcdTJBQzQnOidzdXBlZG90JywnXFx1MkFDNSc6J3N1YkUnLCdcXHUyQUM1XFx1MDMzOCc6J25zdWJFJywnXFx1MkFDNic6J3N1cEUnLCdcXHUyQUM2XFx1MDMzOCc6J25zdXBFJywnXFx1MkFDNyc6J3N1YnNpbScsJ1xcdTJBQzgnOidzdXBzaW0nLCdcXHUyQUNCXFx1RkUwMCc6J3ZzdWJuRScsJ1xcdTJBQ0InOidzdWJuRScsJ1xcdTJBQ0NcXHVGRTAwJzondnN1cG5FJywnXFx1MkFDQyc6J3N1cG5FJywnXFx1MkFDRic6J2NzdWInLCdcXHUyQUQwJzonY3N1cCcsJ1xcdTJBRDEnOidjc3ViZScsJ1xcdTJBRDInOidjc3VwZScsJ1xcdTJBRDMnOidzdWJzdXAnLCdcXHUyQUQ0Jzonc3Vwc3ViJywnXFx1MkFENSc6J3N1YnN1YicsJ1xcdTJBRDYnOidzdXBzdXAnLCdcXHUyQUQ3Jzonc3VwaHN1YicsJ1xcdTJBRDgnOidzdXBkc3ViJywnXFx1MkFEOSc6J2Zvcmt2JywnXFx1MkFEQSc6J3RvcGZvcmsnLCdcXHUyQURCJzonbWxjcCcsJ1xcdTJBRTQnOidEYXNodicsJ1xcdTJBRTYnOidWZGFzaGwnLCdcXHUyQUU3JzonQmFydicsJ1xcdTJBRTgnOid2QmFyJywnXFx1MkFFOSc6J3ZCYXJ2JywnXFx1MkFFQic6J1ZiYXInLCdcXHUyQUVDJzonTm90JywnXFx1MkFFRCc6J2JOb3QnLCdcXHUyQUVFJzoncm5taWQnLCdcXHUyQUVGJzonY2lybWlkJywnXFx1MkFGMCc6J21pZGNpcicsJ1xcdTJBRjEnOid0b3BjaXInLCdcXHUyQUYyJzonbmhwYXInLCdcXHUyQUYzJzoncGFyc2ltJywnXFx1MkFGRCc6J3BhcnNsJywnXFx1MkFGRFxcdTIwRTUnOiducGFyc2wnLCdcXHUyNjZEJzonZmxhdCcsJ1xcdTI2NkUnOiduYXR1cicsJ1xcdTI2NkYnOidzaGFycCcsJ1xceEE0JzonY3VycmVuJywnXFx4QTInOidjZW50JywnJCc6J2RvbGxhcicsJ1xceEEzJzoncG91bmQnLCdcXHhBNSc6J3llbicsJ1xcdTIwQUMnOidldXJvJywnXFx4QjknOidzdXAxJywnXFx4QkQnOidoYWxmJywnXFx1MjE1Myc6J2ZyYWMxMycsJ1xceEJDJzonZnJhYzE0JywnXFx1MjE1NSc6J2ZyYWMxNScsJ1xcdTIxNTknOidmcmFjMTYnLCdcXHUyMTVCJzonZnJhYzE4JywnXFx4QjInOidzdXAyJywnXFx1MjE1NCc6J2ZyYWMyMycsJ1xcdTIxNTYnOidmcmFjMjUnLCdcXHhCMyc6J3N1cDMnLCdcXHhCRSc6J2ZyYWMzNCcsJ1xcdTIxNTcnOidmcmFjMzUnLCdcXHUyMTVDJzonZnJhYzM4JywnXFx1MjE1OCc6J2ZyYWM0NScsJ1xcdTIxNUEnOidmcmFjNTYnLCdcXHUyMTVEJzonZnJhYzU4JywnXFx1MjE1RSc6J2ZyYWM3OCcsJ1xcdUQ4MzVcXHVEQ0I2JzonYXNjcicsJ1xcdUQ4MzVcXHVERDUyJzonYW9wZicsJ1xcdUQ4MzVcXHVERDFFJzonYWZyJywnXFx1RDgzNVxcdUREMzgnOidBb3BmJywnXFx1RDgzNVxcdUREMDQnOidBZnInLCdcXHVEODM1XFx1REM5Qyc6J0FzY3InLCdcXHhBQSc6J29yZGYnLCdcXHhFMSc6J2FhY3V0ZScsJ1xceEMxJzonQWFjdXRlJywnXFx4RTAnOidhZ3JhdmUnLCdcXHhDMCc6J0FncmF2ZScsJ1xcdTAxMDMnOidhYnJldmUnLCdcXHUwMTAyJzonQWJyZXZlJywnXFx4RTInOidhY2lyYycsJ1xceEMyJzonQWNpcmMnLCdcXHhFNSc6J2FyaW5nJywnXFx4QzUnOidhbmdzdCcsJ1xceEU0JzonYXVtbCcsJ1xceEM0JzonQXVtbCcsJ1xceEUzJzonYXRpbGRlJywnXFx4QzMnOidBdGlsZGUnLCdcXHUwMTA1JzonYW9nb24nLCdcXHUwMTA0JzonQW9nb24nLCdcXHUwMTAxJzonYW1hY3InLCdcXHUwMTAwJzonQW1hY3InLCdcXHhFNic6J2FlbGlnJywnXFx4QzYnOidBRWxpZycsJ1xcdUQ4MzVcXHVEQ0I3JzonYnNjcicsJ1xcdUQ4MzVcXHVERDUzJzonYm9wZicsJ1xcdUQ4MzVcXHVERDFGJzonYmZyJywnXFx1RDgzNVxcdUREMzknOidCb3BmJywnXFx1MjEyQyc6J0JzY3InLCdcXHVEODM1XFx1REQwNSc6J0JmcicsJ1xcdUQ4MzVcXHVERDIwJzonY2ZyJywnXFx1RDgzNVxcdURDQjgnOidjc2NyJywnXFx1RDgzNVxcdURENTQnOidjb3BmJywnXFx1MjEyRCc6J0NmcicsJ1xcdUQ4MzVcXHVEQzlFJzonQ3NjcicsJ1xcdTIxMDInOidDb3BmJywnXFx1MDEwNyc6J2NhY3V0ZScsJ1xcdTAxMDYnOidDYWN1dGUnLCdcXHUwMTA5JzonY2NpcmMnLCdcXHUwMTA4JzonQ2NpcmMnLCdcXHUwMTBEJzonY2Nhcm9uJywnXFx1MDEwQyc6J0NjYXJvbicsJ1xcdTAxMEInOidjZG90JywnXFx1MDEwQSc6J0Nkb3QnLCdcXHhFNyc6J2NjZWRpbCcsJ1xceEM3JzonQ2NlZGlsJywnXFx1MjEwNSc6J2luY2FyZScsJ1xcdUQ4MzVcXHVERDIxJzonZGZyJywnXFx1MjE0Nic6J2RkJywnXFx1RDgzNVxcdURENTUnOidkb3BmJywnXFx1RDgzNVxcdURDQjknOidkc2NyJywnXFx1RDgzNVxcdURDOUYnOidEc2NyJywnXFx1RDgzNVxcdUREMDcnOidEZnInLCdcXHUyMTQ1JzonREQnLCdcXHVEODM1XFx1REQzQic6J0RvcGYnLCdcXHUwMTBGJzonZGNhcm9uJywnXFx1MDEwRSc6J0RjYXJvbicsJ1xcdTAxMTEnOidkc3Ryb2snLCdcXHUwMTEwJzonRHN0cm9rJywnXFx4RjAnOidldGgnLCdcXHhEMCc6J0VUSCcsJ1xcdTIxNDcnOidlZScsJ1xcdTIxMkYnOidlc2NyJywnXFx1RDgzNVxcdUREMjInOidlZnInLCdcXHVEODM1XFx1REQ1Nic6J2VvcGYnLCdcXHUyMTMwJzonRXNjcicsJ1xcdUQ4MzVcXHVERDA4JzonRWZyJywnXFx1RDgzNVxcdUREM0MnOidFb3BmJywnXFx4RTknOidlYWN1dGUnLCdcXHhDOSc6J0VhY3V0ZScsJ1xceEU4JzonZWdyYXZlJywnXFx4QzgnOidFZ3JhdmUnLCdcXHhFQSc6J2VjaXJjJywnXFx4Q0EnOidFY2lyYycsJ1xcdTAxMUInOidlY2Fyb24nLCdcXHUwMTFBJzonRWNhcm9uJywnXFx4RUInOidldW1sJywnXFx4Q0InOidFdW1sJywnXFx1MDExNyc6J2Vkb3QnLCdcXHUwMTE2JzonRWRvdCcsJ1xcdTAxMTknOidlb2dvbicsJ1xcdTAxMTgnOidFb2dvbicsJ1xcdTAxMTMnOidlbWFjcicsJ1xcdTAxMTInOidFbWFjcicsJ1xcdUQ4MzVcXHVERDIzJzonZmZyJywnXFx1RDgzNVxcdURENTcnOidmb3BmJywnXFx1RDgzNVxcdURDQkInOidmc2NyJywnXFx1RDgzNVxcdUREMDknOidGZnInLCdcXHVEODM1XFx1REQzRCc6J0ZvcGYnLCdcXHUyMTMxJzonRnNjcicsJ1xcdUZCMDAnOidmZmxpZycsJ1xcdUZCMDMnOidmZmlsaWcnLCdcXHVGQjA0JzonZmZsbGlnJywnXFx1RkIwMSc6J2ZpbGlnJywnZmonOidmamxpZycsJ1xcdUZCMDInOidmbGxpZycsJ1xcdTAxOTInOidmbm9mJywnXFx1MjEwQSc6J2dzY3InLCdcXHVEODM1XFx1REQ1OCc6J2dvcGYnLCdcXHVEODM1XFx1REQyNCc6J2dmcicsJ1xcdUQ4MzVcXHVEQ0EyJzonR3NjcicsJ1xcdUQ4MzVcXHVERDNFJzonR29wZicsJ1xcdUQ4MzVcXHVERDBBJzonR2ZyJywnXFx1MDFGNSc6J2dhY3V0ZScsJ1xcdTAxMUYnOidnYnJldmUnLCdcXHUwMTFFJzonR2JyZXZlJywnXFx1MDExRCc6J2djaXJjJywnXFx1MDExQyc6J0djaXJjJywnXFx1MDEyMSc6J2dkb3QnLCdcXHUwMTIwJzonR2RvdCcsJ1xcdTAxMjInOidHY2VkaWwnLCdcXHVEODM1XFx1REQyNSc6J2hmcicsJ1xcdTIxMEUnOidwbGFuY2toJywnXFx1RDgzNVxcdURDQkQnOidoc2NyJywnXFx1RDgzNVxcdURENTknOidob3BmJywnXFx1MjEwQic6J0hzY3InLCdcXHUyMTBDJzonSGZyJywnXFx1MjEwRCc6J0hvcGYnLCdcXHUwMTI1JzonaGNpcmMnLCdcXHUwMTI0JzonSGNpcmMnLCdcXHUyMTBGJzonaGJhcicsJ1xcdTAxMjcnOidoc3Ryb2snLCdcXHUwMTI2JzonSHN0cm9rJywnXFx1RDgzNVxcdURENUEnOidpb3BmJywnXFx1RDgzNVxcdUREMjYnOidpZnInLCdcXHVEODM1XFx1RENCRSc6J2lzY3InLCdcXHUyMTQ4JzonaWknLCdcXHVEODM1XFx1REQ0MCc6J0lvcGYnLCdcXHUyMTEwJzonSXNjcicsJ1xcdTIxMTEnOidJbScsJ1xceEVEJzonaWFjdXRlJywnXFx4Q0QnOidJYWN1dGUnLCdcXHhFQyc6J2lncmF2ZScsJ1xceENDJzonSWdyYXZlJywnXFx4RUUnOidpY2lyYycsJ1xceENFJzonSWNpcmMnLCdcXHhFRic6J2l1bWwnLCdcXHhDRic6J0l1bWwnLCdcXHUwMTI5JzonaXRpbGRlJywnXFx1MDEyOCc6J0l0aWxkZScsJ1xcdTAxMzAnOidJZG90JywnXFx1MDEyRic6J2lvZ29uJywnXFx1MDEyRSc6J0lvZ29uJywnXFx1MDEyQic6J2ltYWNyJywnXFx1MDEyQSc6J0ltYWNyJywnXFx1MDEzMyc6J2lqbGlnJywnXFx1MDEzMic6J0lKbGlnJywnXFx1MDEzMSc6J2ltYXRoJywnXFx1RDgzNVxcdURDQkYnOidqc2NyJywnXFx1RDgzNVxcdURENUInOidqb3BmJywnXFx1RDgzNVxcdUREMjcnOidqZnInLCdcXHVEODM1XFx1RENBNSc6J0pzY3InLCdcXHVEODM1XFx1REQwRCc6J0pmcicsJ1xcdUQ4MzVcXHVERDQxJzonSm9wZicsJ1xcdTAxMzUnOidqY2lyYycsJ1xcdTAxMzQnOidKY2lyYycsJ1xcdTAyMzcnOidqbWF0aCcsJ1xcdUQ4MzVcXHVERDVDJzona29wZicsJ1xcdUQ4MzVcXHVEQ0MwJzona3NjcicsJ1xcdUQ4MzVcXHVERDI4Jzona2ZyJywnXFx1RDgzNVxcdURDQTYnOidLc2NyJywnXFx1RDgzNVxcdURENDInOidLb3BmJywnXFx1RDgzNVxcdUREMEUnOidLZnInLCdcXHUwMTM3Jzona2NlZGlsJywnXFx1MDEzNic6J0tjZWRpbCcsJ1xcdUQ4MzVcXHVERDI5JzonbGZyJywnXFx1RDgzNVxcdURDQzEnOidsc2NyJywnXFx1MjExMyc6J2VsbCcsJ1xcdUQ4MzVcXHVERDVEJzonbG9wZicsJ1xcdTIxMTInOidMc2NyJywnXFx1RDgzNVxcdUREMEYnOidMZnInLCdcXHVEODM1XFx1REQ0Myc6J0xvcGYnLCdcXHUwMTNBJzonbGFjdXRlJywnXFx1MDEzOSc6J0xhY3V0ZScsJ1xcdTAxM0UnOidsY2Fyb24nLCdcXHUwMTNEJzonTGNhcm9uJywnXFx1MDEzQyc6J2xjZWRpbCcsJ1xcdTAxM0InOidMY2VkaWwnLCdcXHUwMTQyJzonbHN0cm9rJywnXFx1MDE0MSc6J0xzdHJvaycsJ1xcdTAxNDAnOidsbWlkb3QnLCdcXHUwMTNGJzonTG1pZG90JywnXFx1RDgzNVxcdUREMkEnOidtZnInLCdcXHVEODM1XFx1REQ1RSc6J21vcGYnLCdcXHVEODM1XFx1RENDMic6J21zY3InLCdcXHVEODM1XFx1REQxMCc6J01mcicsJ1xcdUQ4MzVcXHVERDQ0JzonTW9wZicsJ1xcdTIxMzMnOidNc2NyJywnXFx1RDgzNVxcdUREMkInOiduZnInLCdcXHVEODM1XFx1REQ1Ric6J25vcGYnLCdcXHVEODM1XFx1RENDMyc6J25zY3InLCdcXHUyMTE1JzonTm9wZicsJ1xcdUQ4MzVcXHVEQ0E5JzonTnNjcicsJ1xcdUQ4MzVcXHVERDExJzonTmZyJywnXFx1MDE0NCc6J25hY3V0ZScsJ1xcdTAxNDMnOidOYWN1dGUnLCdcXHUwMTQ4JzonbmNhcm9uJywnXFx1MDE0Nyc6J05jYXJvbicsJ1xceEYxJzonbnRpbGRlJywnXFx4RDEnOidOdGlsZGUnLCdcXHUwMTQ2JzonbmNlZGlsJywnXFx1MDE0NSc6J05jZWRpbCcsJ1xcdTIxMTYnOidudW1lcm8nLCdcXHUwMTRCJzonZW5nJywnXFx1MDE0QSc6J0VORycsJ1xcdUQ4MzVcXHVERDYwJzonb29wZicsJ1xcdUQ4MzVcXHVERDJDJzonb2ZyJywnXFx1MjEzNCc6J29zY3InLCdcXHVEODM1XFx1RENBQSc6J09zY3InLCdcXHVEODM1XFx1REQxMic6J09mcicsJ1xcdUQ4MzVcXHVERDQ2JzonT29wZicsJ1xceEJBJzonb3JkbScsJ1xceEYzJzonb2FjdXRlJywnXFx4RDMnOidPYWN1dGUnLCdcXHhGMic6J29ncmF2ZScsJ1xceEQyJzonT2dyYXZlJywnXFx4RjQnOidvY2lyYycsJ1xceEQ0JzonT2NpcmMnLCdcXHhGNic6J291bWwnLCdcXHhENic6J091bWwnLCdcXHUwMTUxJzonb2RibGFjJywnXFx1MDE1MCc6J09kYmxhYycsJ1xceEY1Jzonb3RpbGRlJywnXFx4RDUnOidPdGlsZGUnLCdcXHhGOCc6J29zbGFzaCcsJ1xceEQ4JzonT3NsYXNoJywnXFx1MDE0RCc6J29tYWNyJywnXFx1MDE0Qyc6J09tYWNyJywnXFx1MDE1Myc6J29lbGlnJywnXFx1MDE1Mic6J09FbGlnJywnXFx1RDgzNVxcdUREMkQnOidwZnInLCdcXHVEODM1XFx1RENDNSc6J3BzY3InLCdcXHVEODM1XFx1REQ2MSc6J3BvcGYnLCdcXHUyMTE5JzonUG9wZicsJ1xcdUQ4MzVcXHVERDEzJzonUGZyJywnXFx1RDgzNVxcdURDQUInOidQc2NyJywnXFx1RDgzNVxcdURENjInOidxb3BmJywnXFx1RDgzNVxcdUREMkUnOidxZnInLCdcXHVEODM1XFx1RENDNic6J3FzY3InLCdcXHVEODM1XFx1RENBQyc6J1FzY3InLCdcXHVEODM1XFx1REQxNCc6J1FmcicsJ1xcdTIxMUEnOidRb3BmJywnXFx1MDEzOCc6J2tncmVlbicsJ1xcdUQ4MzVcXHVERDJGJzoncmZyJywnXFx1RDgzNVxcdURENjMnOidyb3BmJywnXFx1RDgzNVxcdURDQzcnOidyc2NyJywnXFx1MjExQic6J1JzY3InLCdcXHUyMTFDJzonUmUnLCdcXHUyMTFEJzonUm9wZicsJ1xcdTAxNTUnOidyYWN1dGUnLCdcXHUwMTU0JzonUmFjdXRlJywnXFx1MDE1OSc6J3JjYXJvbicsJ1xcdTAxNTgnOidSY2Fyb24nLCdcXHUwMTU3JzoncmNlZGlsJywnXFx1MDE1Nic6J1JjZWRpbCcsJ1xcdUQ4MzVcXHVERDY0Jzonc29wZicsJ1xcdUQ4MzVcXHVEQ0M4Jzonc3NjcicsJ1xcdUQ4MzVcXHVERDMwJzonc2ZyJywnXFx1RDgzNVxcdURENEEnOidTb3BmJywnXFx1RDgzNVxcdUREMTYnOidTZnInLCdcXHVEODM1XFx1RENBRSc6J1NzY3InLCdcXHUyNEM4Jzonb1MnLCdcXHUwMTVCJzonc2FjdXRlJywnXFx1MDE1QSc6J1NhY3V0ZScsJ1xcdTAxNUQnOidzY2lyYycsJ1xcdTAxNUMnOidTY2lyYycsJ1xcdTAxNjEnOidzY2Fyb24nLCdcXHUwMTYwJzonU2Nhcm9uJywnXFx1MDE1Ric6J3NjZWRpbCcsJ1xcdTAxNUUnOidTY2VkaWwnLCdcXHhERic6J3N6bGlnJywnXFx1RDgzNVxcdUREMzEnOid0ZnInLCdcXHVEODM1XFx1RENDOSc6J3RzY3InLCdcXHVEODM1XFx1REQ2NSc6J3RvcGYnLCdcXHVEODM1XFx1RENBRic6J1RzY3InLCdcXHVEODM1XFx1REQxNyc6J1RmcicsJ1xcdUQ4MzVcXHVERDRCJzonVG9wZicsJ1xcdTAxNjUnOid0Y2Fyb24nLCdcXHUwMTY0JzonVGNhcm9uJywnXFx1MDE2Myc6J3RjZWRpbCcsJ1xcdTAxNjInOidUY2VkaWwnLCdcXHUyMTIyJzondHJhZGUnLCdcXHUwMTY3JzondHN0cm9rJywnXFx1MDE2Nic6J1RzdHJvaycsJ1xcdUQ4MzVcXHVEQ0NBJzondXNjcicsJ1xcdUQ4MzVcXHVERDY2JzondW9wZicsJ1xcdUQ4MzVcXHVERDMyJzondWZyJywnXFx1RDgzNVxcdURENEMnOidVb3BmJywnXFx1RDgzNVxcdUREMTgnOidVZnInLCdcXHVEODM1XFx1RENCMCc6J1VzY3InLCdcXHhGQSc6J3VhY3V0ZScsJ1xceERBJzonVWFjdXRlJywnXFx4RjknOid1Z3JhdmUnLCdcXHhEOSc6J1VncmF2ZScsJ1xcdTAxNkQnOid1YnJldmUnLCdcXHUwMTZDJzonVWJyZXZlJywnXFx4RkInOid1Y2lyYycsJ1xceERCJzonVWNpcmMnLCdcXHUwMTZGJzondXJpbmcnLCdcXHUwMTZFJzonVXJpbmcnLCdcXHhGQyc6J3V1bWwnLCdcXHhEQyc6J1V1bWwnLCdcXHUwMTcxJzondWRibGFjJywnXFx1MDE3MCc6J1VkYmxhYycsJ1xcdTAxNjknOid1dGlsZGUnLCdcXHUwMTY4JzonVXRpbGRlJywnXFx1MDE3Myc6J3VvZ29uJywnXFx1MDE3Mic6J1VvZ29uJywnXFx1MDE2Qic6J3VtYWNyJywnXFx1MDE2QSc6J1VtYWNyJywnXFx1RDgzNVxcdUREMzMnOid2ZnInLCdcXHVEODM1XFx1REQ2Nyc6J3ZvcGYnLCdcXHVEODM1XFx1RENDQic6J3ZzY3InLCdcXHVEODM1XFx1REQxOSc6J1ZmcicsJ1xcdUQ4MzVcXHVERDREJzonVm9wZicsJ1xcdUQ4MzVcXHVEQ0IxJzonVnNjcicsJ1xcdUQ4MzVcXHVERDY4Jzond29wZicsJ1xcdUQ4MzVcXHVEQ0NDJzond3NjcicsJ1xcdUQ4MzVcXHVERDM0Jzond2ZyJywnXFx1RDgzNVxcdURDQjInOidXc2NyJywnXFx1RDgzNVxcdURENEUnOidXb3BmJywnXFx1RDgzNVxcdUREMUEnOidXZnInLCdcXHUwMTc1Jzond2NpcmMnLCdcXHUwMTc0JzonV2NpcmMnLCdcXHVEODM1XFx1REQzNSc6J3hmcicsJ1xcdUQ4MzVcXHVEQ0NEJzoneHNjcicsJ1xcdUQ4MzVcXHVERDY5JzoneG9wZicsJ1xcdUQ4MzVcXHVERDRGJzonWG9wZicsJ1xcdUQ4MzVcXHVERDFCJzonWGZyJywnXFx1RDgzNVxcdURDQjMnOidYc2NyJywnXFx1RDgzNVxcdUREMzYnOid5ZnInLCdcXHVEODM1XFx1RENDRSc6J3lzY3InLCdcXHVEODM1XFx1REQ2QSc6J3lvcGYnLCdcXHVEODM1XFx1RENCNCc6J1lzY3InLCdcXHVEODM1XFx1REQxQyc6J1lmcicsJ1xcdUQ4MzVcXHVERDUwJzonWW9wZicsJ1xceEZEJzoneWFjdXRlJywnXFx4REQnOidZYWN1dGUnLCdcXHUwMTc3JzoneWNpcmMnLCdcXHUwMTc2JzonWWNpcmMnLCdcXHhGRic6J3l1bWwnLCdcXHUwMTc4JzonWXVtbCcsJ1xcdUQ4MzVcXHVEQ0NGJzonenNjcicsJ1xcdUQ4MzVcXHVERDM3JzonemZyJywnXFx1RDgzNVxcdURENkInOid6b3BmJywnXFx1MjEyOCc6J1pmcicsJ1xcdTIxMjQnOidab3BmJywnXFx1RDgzNVxcdURDQjUnOidac2NyJywnXFx1MDE3QSc6J3phY3V0ZScsJ1xcdTAxNzknOidaYWN1dGUnLCdcXHUwMTdFJzonemNhcm9uJywnXFx1MDE3RCc6J1pjYXJvbicsJ1xcdTAxN0MnOid6ZG90JywnXFx1MDE3Qic6J1pkb3QnLCdcXHUwMUI1JzonaW1wZWQnLCdcXHhGRSc6J3Rob3JuJywnXFx4REUnOidUSE9STicsJ1xcdTAxNDknOiduYXBvcycsJ1xcdTAzQjEnOidhbHBoYScsJ1xcdTAzOTEnOidBbHBoYScsJ1xcdTAzQjInOidiZXRhJywnXFx1MDM5Mic6J0JldGEnLCdcXHUwM0IzJzonZ2FtbWEnLCdcXHUwMzkzJzonR2FtbWEnLCdcXHUwM0I0JzonZGVsdGEnLCdcXHUwMzk0JzonRGVsdGEnLCdcXHUwM0I1JzonZXBzaScsJ1xcdTAzRjUnOidlcHNpdicsJ1xcdTAzOTUnOidFcHNpbG9uJywnXFx1MDNERCc6J2dhbW1hZCcsJ1xcdTAzREMnOidHYW1tYWQnLCdcXHUwM0I2JzonemV0YScsJ1xcdTAzOTYnOidaZXRhJywnXFx1MDNCNyc6J2V0YScsJ1xcdTAzOTcnOidFdGEnLCdcXHUwM0I4JzondGhldGEnLCdcXHUwM0QxJzondGhldGF2JywnXFx1MDM5OCc6J1RoZXRhJywnXFx1MDNCOSc6J2lvdGEnLCdcXHUwMzk5JzonSW90YScsJ1xcdTAzQkEnOidrYXBwYScsJ1xcdTAzRjAnOidrYXBwYXYnLCdcXHUwMzlBJzonS2FwcGEnLCdcXHUwM0JCJzonbGFtYmRhJywnXFx1MDM5Qic6J0xhbWJkYScsJ1xcdTAzQkMnOidtdScsJ1xceEI1JzonbWljcm8nLCdcXHUwMzlDJzonTXUnLCdcXHUwM0JEJzonbnUnLCdcXHUwMzlEJzonTnUnLCdcXHUwM0JFJzoneGknLCdcXHUwMzlFJzonWGknLCdcXHUwM0JGJzonb21pY3JvbicsJ1xcdTAzOUYnOidPbWljcm9uJywnXFx1MDNDMCc6J3BpJywnXFx1MDNENic6J3BpdicsJ1xcdTAzQTAnOidQaScsJ1xcdTAzQzEnOidyaG8nLCdcXHUwM0YxJzoncmhvdicsJ1xcdTAzQTEnOidSaG8nLCdcXHUwM0MzJzonc2lnbWEnLCdcXHUwM0EzJzonU2lnbWEnLCdcXHUwM0MyJzonc2lnbWFmJywnXFx1MDNDNCc6J3RhdScsJ1xcdTAzQTQnOidUYXUnLCdcXHUwM0M1JzondXBzaScsJ1xcdTAzQTUnOidVcHNpbG9uJywnXFx1MDNEMic6J1Vwc2knLCdcXHUwM0M2JzoncGhpJywnXFx1MDNENSc6J3BoaXYnLCdcXHUwM0E2JzonUGhpJywnXFx1MDNDNyc6J2NoaScsJ1xcdTAzQTcnOidDaGknLCdcXHUwM0M4JzoncHNpJywnXFx1MDNBOCc6J1BzaScsJ1xcdTAzQzknOidvbWVnYScsJ1xcdTAzQTknOidvaG0nLCdcXHUwNDMwJzonYWN5JywnXFx1MDQxMCc6J0FjeScsJ1xcdTA0MzEnOidiY3knLCdcXHUwNDExJzonQmN5JywnXFx1MDQzMic6J3ZjeScsJ1xcdTA0MTInOidWY3knLCdcXHUwNDMzJzonZ2N5JywnXFx1MDQxMyc6J0djeScsJ1xcdTA0NTMnOidnamN5JywnXFx1MDQwMyc6J0dKY3knLCdcXHUwNDM0JzonZGN5JywnXFx1MDQxNCc6J0RjeScsJ1xcdTA0NTInOidkamN5JywnXFx1MDQwMic6J0RKY3knLCdcXHUwNDM1JzonaWVjeScsJ1xcdTA0MTUnOidJRWN5JywnXFx1MDQ1MSc6J2lvY3knLCdcXHUwNDAxJzonSU9jeScsJ1xcdTA0NTQnOidqdWtjeScsJ1xcdTA0MDQnOidKdWtjeScsJ1xcdTA0MzYnOid6aGN5JywnXFx1MDQxNic6J1pIY3knLCdcXHUwNDM3JzonemN5JywnXFx1MDQxNyc6J1pjeScsJ1xcdTA0NTUnOidkc2N5JywnXFx1MDQwNSc6J0RTY3knLCdcXHUwNDM4JzonaWN5JywnXFx1MDQxOCc6J0ljeScsJ1xcdTA0NTYnOidpdWtjeScsJ1xcdTA0MDYnOidJdWtjeScsJ1xcdTA0NTcnOid5aWN5JywnXFx1MDQwNyc6J1lJY3knLCdcXHUwNDM5JzonamN5JywnXFx1MDQxOSc6J0pjeScsJ1xcdTA0NTgnOidqc2VyY3knLCdcXHUwNDA4JzonSnNlcmN5JywnXFx1MDQzQSc6J2tjeScsJ1xcdTA0MUEnOidLY3knLCdcXHUwNDVDJzona2pjeScsJ1xcdTA0MEMnOidLSmN5JywnXFx1MDQzQic6J2xjeScsJ1xcdTA0MUInOidMY3knLCdcXHUwNDU5JzonbGpjeScsJ1xcdTA0MDknOidMSmN5JywnXFx1MDQzQyc6J21jeScsJ1xcdTA0MUMnOidNY3knLCdcXHUwNDNEJzonbmN5JywnXFx1MDQxRCc6J05jeScsJ1xcdTA0NUEnOiduamN5JywnXFx1MDQwQSc6J05KY3knLCdcXHUwNDNFJzonb2N5JywnXFx1MDQxRSc6J09jeScsJ1xcdTA0M0YnOidwY3knLCdcXHUwNDFGJzonUGN5JywnXFx1MDQ0MCc6J3JjeScsJ1xcdTA0MjAnOidSY3knLCdcXHUwNDQxJzonc2N5JywnXFx1MDQyMSc6J1NjeScsJ1xcdTA0NDInOid0Y3knLCdcXHUwNDIyJzonVGN5JywnXFx1MDQ1Qic6J3RzaGN5JywnXFx1MDQwQic6J1RTSGN5JywnXFx1MDQ0Myc6J3VjeScsJ1xcdTA0MjMnOidVY3knLCdcXHUwNDVFJzondWJyY3knLCdcXHUwNDBFJzonVWJyY3knLCdcXHUwNDQ0JzonZmN5JywnXFx1MDQyNCc6J0ZjeScsJ1xcdTA0NDUnOidraGN5JywnXFx1MDQyNSc6J0tIY3knLCdcXHUwNDQ2JzondHNjeScsJ1xcdTA0MjYnOidUU2N5JywnXFx1MDQ0Nyc6J2NoY3knLCdcXHUwNDI3JzonQ0hjeScsJ1xcdTA0NUYnOidkemN5JywnXFx1MDQwRic6J0RaY3knLCdcXHUwNDQ4Jzonc2hjeScsJ1xcdTA0MjgnOidTSGN5JywnXFx1MDQ0OSc6J3NoY2hjeScsJ1xcdTA0MjknOidTSENIY3knLCdcXHUwNDRBJzonaGFyZGN5JywnXFx1MDQyQSc6J0hBUkRjeScsJ1xcdTA0NEInOid5Y3knLCdcXHUwNDJCJzonWWN5JywnXFx1MDQ0Qyc6J3NvZnRjeScsJ1xcdTA0MkMnOidTT0ZUY3knLCdcXHUwNDREJzonZWN5JywnXFx1MDQyRCc6J0VjeScsJ1xcdTA0NEUnOid5dWN5JywnXFx1MDQyRSc6J1lVY3knLCdcXHUwNDRGJzoneWFjeScsJ1xcdTA0MkYnOidZQWN5JywnXFx1MjEzNSc6J2FsZXBoJywnXFx1MjEzNic6J2JldGgnLCdcXHUyMTM3JzonZ2ltZWwnLCdcXHUyMTM4JzonZGFsZXRoJ307XG5cblx0dmFyIHJlZ2V4RXNjYXBlID0gL1tcIiYnPD5gXS9nO1xuXHR2YXIgZXNjYXBlTWFwID0ge1xuXHRcdCdcIic6ICcmcXVvdDsnLFxuXHRcdCcmJzogJyZhbXA7Jyxcblx0XHQnXFwnJzogJyYjeDI3OycsXG5cdFx0JzwnOiAnJmx0OycsXG5cdFx0Ly8gU2VlIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kczogaW4gSFRNTCwgdGhlXG5cdFx0Ly8gZm9sbG93aW5nIGlzIG5vdCBzdHJpY3RseSBuZWNlc3NhcnkgdW5sZXNzIGl04oCZcyBwYXJ0IG9mIGEgdGFnIG9yIGFuXG5cdFx0Ly8gdW5xdW90ZWQgYXR0cmlidXRlIHZhbHVlLiBXZeKAmXJlIG9ubHkgZXNjYXBpbmcgaXQgdG8gc3VwcG9ydCB0aG9zZVxuXHRcdC8vIHNpdHVhdGlvbnMsIGFuZCBmb3IgWE1MIHN1cHBvcnQuXG5cdFx0Jz4nOiAnJmd0OycsXG5cdFx0Ly8gSW4gSW50ZXJuZXQgRXhwbG9yZXIg4omkIDgsIHRoZSBiYWNrdGljayBjaGFyYWN0ZXIgY2FuIGJlIHVzZWRcblx0XHQvLyB0byBicmVhayBvdXQgb2YgKHVuKXF1b3RlZCBhdHRyaWJ1dGUgdmFsdWVzIG9yIEhUTUwgY29tbWVudHMuXG5cdFx0Ly8gU2VlIGh0dHA6Ly9odG1sNXNlYy5vcmcvIzEwMiwgaHR0cDovL2h0bWw1c2VjLm9yZy8jMTA4LCBhbmRcblx0XHQvLyBodHRwOi8vaHRtbDVzZWMub3JnLyMxMzMuXG5cdFx0J2AnOiAnJiN4NjA7J1xuXHR9O1xuXG5cdHZhciByZWdleEludmFsaWRFbnRpdHkgPSAvJiMoPzpbeFhdW15hLWZBLUYwLTldfFteMC05eFhdKS87XG5cdHZhciByZWdleEludmFsaWRSYXdDb2RlUG9pbnQgPSAvW1xcMC1cXHgwOFxceDBCXFx4MEUtXFx4MUZcXHg3Ri1cXHg5RlxcdUZERDAtXFx1RkRFRlxcdUZGRkVcXHVGRkZGXXxbXFx1RDgzRlxcdUQ4N0ZcXHVEOEJGXFx1RDhGRlxcdUQ5M0ZcXHVEOTdGXFx1RDlCRlxcdUQ5RkZcXHVEQTNGXFx1REE3RlxcdURBQkZcXHVEQUZGXFx1REIzRlxcdURCN0ZcXHVEQkJGXFx1REJGRl1bXFx1REZGRVxcdURGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pfCg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdLztcblx0dmFyIHJlZ2V4RGVjb2RlID0gLyYoQ291bnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbHxEb3VibGVMb25nTGVmdFJpZ2h0QXJyb3d8Q2xvY2t3aXNlQ29udG91ckludGVncmFsfE5vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyfE5vdFNxdWFyZVN1cGVyc2V0RXF1YWx8RGlhY3JpdGljYWxEb3VibGVBY3V0ZXxOb3RSaWdodFRyaWFuZ2xlRXF1YWx8Tm90U3VjY2VlZHNTbGFudEVxdWFsfE5vdFByZWNlZGVzU2xhbnRFcXVhbHxDbG9zZUN1cmx5RG91YmxlUXVvdGV8TmVnYXRpdmVWZXJ5VGhpblNwYWNlfERvdWJsZUNvbnRvdXJJbnRlZ3JhbHxGaWxsZWRWZXJ5U21hbGxTcXVhcmV8Q2FwaXRhbERpZmZlcmVudGlhbER8T3BlbkN1cmx5RG91YmxlUXVvdGV8RW1wdHlWZXJ5U21hbGxTcXVhcmV8TmVzdGVkR3JlYXRlckdyZWF0ZXJ8RG91YmxlTG9uZ1JpZ2h0QXJyb3d8Tm90TGVmdFRyaWFuZ2xlRXF1YWx8Tm90R3JlYXRlclNsYW50RXF1YWx8UmV2ZXJzZVVwRXF1aWxpYnJpdW18RG91YmxlTGVmdFJpZ2h0QXJyb3d8Tm90U3F1YXJlU3Vic2V0RXF1YWx8Tm90RG91YmxlVmVydGljYWxCYXJ8UmlnaHRBcnJvd0xlZnRBcnJvd3xOb3RHcmVhdGVyRnVsbEVxdWFsfE5vdFJpZ2h0VHJpYW5nbGVCYXJ8U3F1YXJlU3VwZXJzZXRFcXVhbHxEb3duTGVmdFJpZ2h0VmVjdG9yfERvdWJsZUxvbmdMZWZ0QXJyb3d8bGVmdHJpZ2h0c3F1aWdhcnJvd3xMZWZ0QXJyb3dSaWdodEFycm93fE5lZ2F0aXZlTWVkaXVtU3BhY2V8YmxhY2t0cmlhbmdsZXJpZ2h0fFJpZ2h0RG93blZlY3RvckJhcnxQcmVjZWRlc1NsYW50RXF1YWx8UmlnaHREb3VibGVCcmFja2V0fFN1Y2NlZWRzU2xhbnRFcXVhbHxOb3RMZWZ0VHJpYW5nbGVCYXJ8UmlnaHRUcmlhbmdsZUVxdWFsfFNxdWFyZUludGVyc2VjdGlvbnxSaWdodERvd25UZWVWZWN0b3J8UmV2ZXJzZUVxdWlsaWJyaXVtfE5lZ2F0aXZlVGhpY2tTcGFjZXxsb25nbGVmdHJpZ2h0YXJyb3d8TG9uZ2xlZnRyaWdodGFycm93fExvbmdMZWZ0UmlnaHRBcnJvd3xEb3duUmlnaHRUZWVWZWN0b3J8RG93blJpZ2h0VmVjdG9yQmFyfEdyZWF0ZXJTbGFudEVxdWFsfFNxdWFyZVN1YnNldEVxdWFsfExlZnREb3duVmVjdG9yQmFyfExlZnREb3VibGVCcmFja2V0fFZlcnRpY2FsU2VwYXJhdG9yfHJpZ2h0bGVmdGhhcnBvb25zfE5vdEdyZWF0ZXJHcmVhdGVyfE5vdFNxdWFyZVN1cGVyc2V0fGJsYWNrdHJpYW5nbGVsZWZ0fGJsYWNrdHJpYW5nbGVkb3dufE5lZ2F0aXZlVGhpblNwYWNlfExlZnREb3duVGVlVmVjdG9yfE5vdExlc3NTbGFudEVxdWFsfGxlZnRyaWdodGhhcnBvb25zfERvdWJsZVVwRG93bkFycm93fERvdWJsZVZlcnRpY2FsQmFyfExlZnRUcmlhbmdsZUVxdWFsfEZpbGxlZFNtYWxsU3F1YXJlfHR3b2hlYWRyaWdodGFycm93fE5vdE5lc3RlZExlc3NMZXNzfERvd25MZWZ0VGVlVmVjdG9yfERvd25MZWZ0VmVjdG9yQmFyfFJpZ2h0QW5nbGVCcmFja2V0fE5vdFRpbGRlRnVsbEVxdWFsfE5vdFJldmVyc2VFbGVtZW50fFJpZ2h0VXBEb3duVmVjdG9yfERpYWNyaXRpY2FsVGlsZGV8Tm90U3VjY2VlZHNUaWxkZXxjaXJjbGVhcnJvd3JpZ2h0fE5vdFByZWNlZGVzRXF1YWx8cmlnaHRoYXJwb29uZG93bnxEb3VibGVSaWdodEFycm93fE5vdFN1Y2NlZWRzRXF1YWx8Tm9uQnJlYWtpbmdTcGFjZXxOb3RSaWdodFRyaWFuZ2xlfExlc3NFcXVhbEdyZWF0ZXJ8UmlnaHRVcFRlZVZlY3RvcnxMZWZ0QW5nbGVCcmFja2V0fEdyZWF0ZXJGdWxsRXF1YWx8RG93bkFycm93VXBBcnJvd3xSaWdodFVwVmVjdG9yQmFyfHR3b2hlYWRsZWZ0YXJyb3d8R3JlYXRlckVxdWFsTGVzc3xkb3duaGFycG9vbnJpZ2h0fFJpZ2h0VHJpYW5nbGVCYXJ8bnRyaWFuZ2xlcmlnaHRlcXxOb3RTdXBlcnNldEVxdWFsfExlZnRVcERvd25WZWN0b3J8RGlhY3JpdGljYWxBY3V0ZXxyaWdodHJpZ2h0YXJyb3dzfHZhcnRyaWFuZ2xlcmlnaHR8VXBBcnJvd0Rvd25BcnJvd3xEaWFjcml0aWNhbEdyYXZlfFVuZGVyUGFyZW50aGVzaXN8RW1wdHlTbWFsbFNxdWFyZXxMZWZ0VXBWZWN0b3JCYXJ8bGVmdHJpZ2h0YXJyb3dzfERvd25SaWdodFZlY3Rvcnxkb3duaGFycG9vbmxlZnR8dHJpYW5nbGVyaWdodGVxfFNob3J0UmlnaHRBcnJvd3xPdmVyUGFyZW50aGVzaXN8RG91YmxlTGVmdEFycm93fERvdWJsZURvd25BcnJvd3xOb3RTcXVhcmVTdWJzZXR8YmlndHJpYW5nbGVkb3dufG50cmlhbmdsZWxlZnRlcXxVcHBlclJpZ2h0QXJyb3d8Y3VydmVhcnJvd3JpZ2h0fHZhcnRyaWFuZ2xlbGVmdHxOb3RMZWZ0VHJpYW5nbGV8bmxlZnRyaWdodGFycm93fExvd2VyUmlnaHRBcnJvd3xOb3RIdW1wRG93bkh1bXB8Tm90R3JlYXRlclRpbGRlfHJpZ2h0dGhyZWV0aW1lc3xMZWZ0VXBUZWVWZWN0b3J8Tm90R3JlYXRlckVxdWFsfHN0cmFpZ2h0ZXBzaWxvbnxMZWZ0VHJpYW5nbGVCYXJ8cmlnaHRzcXVpZ2Fycm93fENvbnRvdXJJbnRlZ3JhbHxyaWdodGxlZnRhcnJvd3N8Q2xvc2VDdXJseVF1b3RlfFJpZ2h0RG93blZlY3RvcnxMZWZ0UmlnaHRWZWN0b3J8bkxlZnRyaWdodGFycm93fGxlZnRoYXJwb29uZG93bnxjaXJjbGVhcnJvd2xlZnR8U3F1YXJlU3VwZXJzZXR8T3BlbkN1cmx5UXVvdGV8aG9va3JpZ2h0YXJyb3d8SG9yaXpvbnRhbExpbmV8RGlhY3JpdGljYWxEb3R8Tm90TGVzc0dyZWF0ZXJ8bnRyaWFuZ2xlcmlnaHR8RG91YmxlUmlnaHRUZWV8SW52aXNpYmxlQ29tbWF8SW52aXNpYmxlVGltZXN8TG93ZXJMZWZ0QXJyb3d8RG93bkxlZnRWZWN0b3J8Tm90U3Vic2V0RXF1YWx8Y3VydmVhcnJvd2xlZnR8dHJpYW5nbGVsZWZ0ZXF8Tm90VmVydGljYWxCYXJ8VGlsZGVGdWxsRXF1YWx8ZG93bmRvd25hcnJvd3N8Tm90R3JlYXRlckxlc3N8UmlnaHRUZWVWZWN0b3J8WmVyb1dpZHRoU3BhY2V8bG9vcGFycm93cmlnaHR8TG9uZ1JpZ2h0QXJyb3d8ZG91YmxlYmFyd2VkZ2V8U2hvcnRMZWZ0QXJyb3d8U2hvcnREb3duQXJyb3d8UmlnaHRWZWN0b3JCYXJ8R3JlYXRlckdyZWF0ZXJ8UmV2ZXJzZUVsZW1lbnR8cmlnaHRoYXJwb29udXB8TGVzc1NsYW50RXF1YWx8bGVmdHRocmVldGltZXN8dXBoYXJwb29ucmlnaHR8cmlnaHRhcnJvd3RhaWx8TGVmdERvd25WZWN0b3J8TG9uZ3JpZ2h0YXJyb3d8TmVzdGVkTGVzc0xlc3N8VXBwZXJMZWZ0QXJyb3d8bnNob3J0cGFyYWxsZWx8bGVmdGxlZnRhcnJvd3N8bGVmdHJpZ2h0YXJyb3d8TGVmdHJpZ2h0YXJyb3d8TGVmdFJpZ2h0QXJyb3d8bG9uZ3JpZ2h0YXJyb3d8dXBoYXJwb29ubGVmdHxSaWdodEFycm93QmFyfEFwcGx5RnVuY3Rpb258TGVmdFRlZVZlY3RvcnxsZWZ0YXJyb3d0YWlsfE5vdEVxdWFsVGlsZGV8dmFyc3Vic2V0bmVxcXx2YXJzdXBzZXRuZXFxfFJpZ2h0VGVlQXJyb3d8U3VjY2VlZHNFcXVhbHxTdWNjZWVkc1RpbGRlfExlZnRWZWN0b3JCYXJ8U3VwZXJzZXRFcXVhbHxob29rbGVmdGFycm93fERpZmZlcmVudGlhbER8VmVydGljYWxUaWxkZXxWZXJ5VGhpblNwYWNlfGJsYWNrdHJpYW5nbGV8YmlndHJpYW5nbGV1cHxMZXNzRnVsbEVxdWFsfGRpdmlkZW9udGltZXN8bGVmdGhhcnBvb251cHxVcEVxdWlsaWJyaXVtfG50cmlhbmdsZWxlZnR8UmlnaHRUcmlhbmdsZXxtZWFzdXJlZGFuZ2xlfHNob3J0cGFyYWxsZWx8bG9uZ2xlZnRhcnJvd3xMb25nbGVmdGFycm93fExvbmdMZWZ0QXJyb3d8RG91YmxlTGVmdFRlZXxQb2luY2FyZXBsYW5lfFByZWNlZGVzRXF1YWx8dHJpYW5nbGVyaWdodHxEb3VibGVVcEFycm93fFJpZ2h0VXBWZWN0b3J8ZmFsbGluZ2RvdHNlcXxsb29wYXJyb3dsZWZ0fFByZWNlZGVzVGlsZGV8Tm90VGlsZGVFcXVhbHxOb3RUaWxkZVRpbGRlfHNtYWxsc2V0bWludXN8UHJvcG9ydGlvbmFsfHRyaWFuZ2xlbGVmdHx0cmlhbmdsZWRvd258VW5kZXJCcmFja2V0fE5vdEh1bXBFcXVhbHxleHBvbmVudGlhbGV8RXhwb25lbnRpYWxFfE5vdExlc3NUaWxkZXxIaWxiZXJ0U3BhY2V8UmlnaHRDZWlsaW5nfGJsYWNrbG96ZW5nZXx2YXJzdXBzZXRuZXF8SHVtcERvd25IdW1wfEdyZWF0ZXJFcXVhbHxWZXJ0aWNhbExpbmV8TGVmdFRlZUFycm93fE5vdExlc3NFcXVhbHxEb3duVGVlQXJyb3d8TGVmdFRyaWFuZ2xlfHZhcnN1YnNldG5lcXxJbnRlcnNlY3Rpb258Tm90Q29uZ3J1ZW50fERvd25BcnJvd0JhcnxMZWZ0VXBWZWN0b3J8TGVmdEFycm93QmFyfHJpc2luZ2RvdHNlcXxHcmVhdGVyVGlsZGV8Um91bmRJbXBsaWVzfFNxdWFyZVN1YnNldHxTaG9ydFVwQXJyb3d8Tm90U3VwZXJzZXR8cXVhdGVybmlvbnN8cHJlY25hcHByb3h8YmFja2Vwc2lsb258cHJlY2N1cmx5ZXF8T3ZlckJyYWNrZXR8YmxhY2tzcXVhcmV8TWVkaXVtU3BhY2V8VmVydGljYWxCYXJ8Y2lyY2xlZGNpcmN8Y2lyY2xlZGRhc2h8Q2lyY2xlTWludXN8Q2lyY2xlVGltZXN8TGVzc0dyZWF0ZXJ8Y3VybHllcXByZWN8Y3VybHllcXN1Y2N8ZGlhbW9uZHN1aXR8VXBEb3duQXJyb3d8VXBkb3duYXJyb3d8UnVsZURlbGF5ZWR8UnJpZ2h0YXJyb3d8dXBkb3duYXJyb3d8UmlnaHRWZWN0b3J8blJpZ2h0YXJyb3d8bnJpZ2h0YXJyb3d8ZXFzbGFudGxlc3N8TGVmdENlaWxpbmd8RXF1aWxpYnJpdW18U21hbGxDaXJjbGV8ZXhwZWN0YXRpb258Tm90U3VjY2VlZHN8dGhpY2thcHByb3h8R3JlYXRlckxlc3N8U3F1YXJlVW5pb258Tm90UHJlY2VkZXN8Tm90TGVzc0xlc3N8c3RyYWlnaHRwaGl8c3VjY25hcHByb3h8c3VjY2N1cmx5ZXF8U3Vic2V0RXF1YWx8c3FzdXBzZXRlcXxQcm9wb3J0aW9ufExhcGxhY2V0cmZ8SW1hZ2luYXJ5SXxzdXBzZXRuZXFxfE5vdEdyZWF0ZXJ8Z3RyZXFxbGVzc3xOb3RFbGVtZW50fFRoaWNrU3BhY2V8VGlsZGVFcXVhbHxUaWxkZVRpbGRlfEZvdXJpZXJ0cmZ8cm1vdXN0YWNoZXxFcXVhbFRpbGRlfGVxc2xhbnRndHJ8VW5kZXJCcmFjZXxMZWZ0VmVjdG9yfFVwQXJyb3dCYXJ8bkxlZnRhcnJvd3xuc3Vic2V0ZXFxfHN1YnNldG5lcXF8bnN1cHNldGVxcXxubGVmdGFycm93fHN1Y2NhcHByb3h8bGVzc2FwcHJveHxVcFRlZUFycm93fHVwdXBhcnJvd3N8Y3VybHl3ZWRnZXxsZXNzZXFxZ3RyfHZhcmVwc2lsb258dmFybm90aGluZ3xSaWdodEZsb29yfGNvbXBsZW1lbnR8Q2lyY2xlUGx1c3xzcXN1YnNldGVxfExsZWZ0YXJyb3d8Y2lyY2xlZGFzdHxSaWdodEFycm93fFJpZ2h0YXJyb3d8cmlnaHRhcnJvd3xsbW91c3RhY2hlfEJlcm5vdWxsaXN8cHJlY2FwcHJveHxtYXBzdG9sZWZ0fG1hcHN0b2Rvd258bG9uZ21hcHN0b3xkb3RzcXVhcmV8ZG93bmFycm93fERvdWJsZURvdHxuc3Vic2V0ZXF8c3Vwc2V0bmVxfGxlZnRhcnJvd3xuc3Vwc2V0ZXF8c3Vic2V0bmVxfFRoaW5TcGFjZXxuZ2Vxc2xhbnR8c3Vic2V0ZXFxfEh1bXBFcXVhbHxOb3RTdWJzZXR8dHJpYW5nbGVxfE5vdEN1cENhcHxsZXNzZXFndHJ8aGVhcnRzdWl0fFRyaXBsZURvdHxMZWZ0YXJyb3d8Q29wcm9kdWN0fENvbmdydWVudHx2YXJwcm9wdG98Y29tcGxleGVzfGd2ZXJ0bmVxcXxMZWZ0QXJyb3d8TGVzc1RpbGRlfHN1cHNldGVxcXxNaW51c1BsdXN8Q2lyY2xlRG90fG5sZXFzbGFudHxOb3RFeGlzdHN8Z3RyZXFsZXNzfG5wYXJhbGxlbHxVbmlvblBsdXN8TGVmdEZsb29yfGNoZWNrbWFya3xDZW50ZXJEb3R8Y2VudGVyZG90fE1lbGxpbnRyZnxndHJhcHByb3h8Ymlnb3RpbWVzfE92ZXJCcmFjZXxzcGFkZXN1aXR8dGhlcmVmb3JlfHBpdGNoZm9ya3xyYXRpb25hbHN8UGx1c01pbnVzfEJhY2tzbGFzaHxUaGVyZWZvcmV8RG93bkJyZXZlfGJhY2tzaW1lcXxiYWNrcHJpbWV8RG93bkFycm93fG5zaG9ydG1pZHxEb3duYXJyb3d8bHZlcnRuZXFxfGVxdnBhcnNsfGltYWdsaW5lfGltYWdwYXJ0fGluZmludGllfGludGVnZXJzfEludGVncmFsfGludGVyY2FsfExlc3NMZXNzfFVhcnJvY2lyfGludGxhcmhrfHNxc3Vwc2V0fGFuZ21zZGFmfHNxc3Vic2V0fGxsY29ybmVyfHZhcnRoZXRhfGN1cGJyY2FwfGxuYXBwcm94fFN1cGVyc2V0fFN1Y2hUaGF0fHN1Y2Nuc2ltfHN1Y2NuZXFxfGFuZ21zZGFnfGJpZ3VwbHVzfGN1cmx5dmVlfHRycGV6aXVtfFN1Y2NlZWRzfE5vdFRpbGRlfGJpZ3dlZGdlfGFuZ21zZGFofGFuZ3J0dmJkfHRyaW1pbnVzfGN3Y29uaW50fGZwYXJ0aW50fGxyY29ybmVyfHNtZXBhcnNsfHN1YnNldGVxfHVyY29ybmVyfGx1cmRzaGFyfGxhZW1wdHl2fEREb3RyYWhkfGFwcHJveGVxfGxkcnVzaGFyfGF3Y29uaW50fG1hcHN0b3VwfGJhY2tjb25nfHNob3J0bWlkfHRyaWFuZ2xlfGdlcXNsYW50fGdlc2RvdG9sfHRpbWVzYmFyfGNpcmNsZWRSfGNpcmNsZWRTfHNldG1pbnVzfG11bHRpbWFwfG5hdHVyYWxzfHNjcG9saW50fG5jb25nZG90fFJpZ2h0VGVlfGJveG1pbnVzfGduYXBwcm94fGJveHRpbWVzfGFuZHNsb3BlfHRoaWNrc2ltfGFuZ21zZGFhfHZhcnNpZ21hfGNpcmZuaW50fHJ0cmlsdHJpfGFuZ21zZGFifHJwcG9saW50fGFuZ21zZGFjfGJhcndlZGdlfGRyYmthcm93fGNsdWJzdWl0fHRoZXRhc3ltfGJzb2xoc3VifGNhcGJyY3VwfGR6aWdyYXJyfGRvdGVxZG90fERvdEVxdWFsfGRvdG1pbnVzfFVuZGVyQmFyfE5vdEVxdWFsfHJlYWxwYXJ0fG90aW1lc2FzfHVsY29ybmVyfGhrc2Vhcm93fGhrc3dhcm93fHBhcmFsbGVsfFBhcnRpYWxEfGVsaW50ZXJzfGVtcHR5c2V0fHBsdXNhY2lyfGJicmt0YnJrfGFuZ21zZGFkfHBvaW50aW50fGJpZ29wbHVzfGFuZ21zZGFlfFByZWNlZGVzfGJpZ3NxY3VwfHZhcmthcHBhfG5vdGluZG90fHN1cHNldGVxfHByZWNuZXFxfHByZWNuc2ltfHByb2ZhbGFyfHByb2ZsaW5lfHByb2ZzdXJmfGxlcXNsYW50fGxlc2RvdG9yfHJhZW1wdHl2fHN1YnBsdXN8bm90bml2Ynxub3RuaXZjfHN1YnJhcnJ8emlncmFycnx2emlnemFnfHN1Ym11bHR8c3ViZWRvdHxFbGVtZW50fGJldHdlZW58Y2lyc2NpcnxsYXJyYmZzfGxhcnJzaW18bG90aW1lc3xsYnJrc2xkfGxicmtzbHV8bG96ZW5nZXxsZHJkaGFyfGRia2Fyb3d8YmlnY2lyY3xlcHNpbG9ufHNpbXJhcnJ8c2ltcGx1c3xsdHF1ZXN0fEVwc2lsb258bHVydWhhcnxndHF1ZXN0fG1hbHRlc2V8bnBvbGludHxlcWNvbG9ufG5wcmVjZXF8Ymlnb2RvdHxkZGFnZ2VyfGd0cmxlc3N8Ym5lcXVpdnxoYXJyY2lyfGRkb3RzZXF8ZXF1aXZERHxiYWNrc2ltfGRlbXB0eXZ8bnNxc3ViZXxuc3FzdXBlfFVwc2lsb258bnN1YnNldHx1cHNpbG9ufG1pbnVzZHV8bnN1Y2NlcXxzd2Fycm93fG5zdXBzZXR8Y29sb25lcXxzZWFycm93fGJveHBsdXN8bmFwcHJveHxuYXR1cmFsfGFzeW1wZXF8YWxlZnN5bXxjb25nZG90fG5lYXJyb3d8Ymlnc3RhcnxkaWFtb25kfHN1cHBsdXN8dHJpdGltZXxMZWZ0VGVlfG52aW5maW58dHJpcGx1c3xOZXdMaW5lfG52bHRyaWV8bnZydHJpZXxud2Fycm93fG5leGlzdHN8RGlhbW9uZHxydWx1aGFyfEltcGxpZXN8c3VwbXVsdHxhbmd6YXJyfHN1cGxhcnJ8c3VwaHN1YnxxdWVzdGVxfGJlY2F1c2V8ZGlnYW1tYXxCZWNhdXNlfG9sY3Jvc3N8YmVtcHR5dnxvbWljcm9ufE9taWNyb258cm90aW1lc3xOb0JyZWFrfGludHByb2R8YW5ncnR2YnxvcmRlcm9mfHV3YW5nbGV8c3VwaHNvbHxsZXNkb3RvfG9yc2xvcGV8RG93blRlZXxyZWFsaW5lfGN1ZGFycmx8cmRsZGhhcnxPdmVyQmFyfHN1cGVkb3R8bGVzc2RvdHxzdXBkc3VifHRvcGZvcmt8c3VjY3NpbXxyYnJrc2x1fHJicmtzbGR8cGVydGVua3xjdWRhcnJyfGlzaW5kb3R8cGxhbmNraHxsZXNzZ3RyfHBsdXNjaXJ8Z2VzZG90b3xwbHVzc2ltfHBsdXN0d298bGVzc3NpbXxjdWxhcnJwfHJhcnJzaW18Q2F5bGV5c3xub3RpbnZhfG5vdGludmJ8bm90aW52Y3xVcEFycm93fFVwYXJyb3d8dXBhcnJvd3xOb3RMZXNzfGR3YW5nbGV8cHJlY3NpbXxQcm9kdWN0fGN1cmFycm18Q2NvbmludHxkb3RwbHVzfHJhcnJiZnN8Y2N1cHNzbXxDZWRpbGxhfGNlbXB0eXZ8bm90bml2YXxxdWF0aW50fGZyYWMzNXxmcmFjMzh8ZnJhYzQ1fGZyYWM1NnxmcmFjNTh8ZnJhYzc4fHRyaWRvdHx4b3BsdXN8Z2FjdXRlfGdhbW1hZHxHYW1tYWR8bGZpc2h0fGxmbG9vcnxiaWdjdXB8c3FzdXBlfGdicmV2ZXxHYnJldmV8bGhhcnVsfHNxc3ViZXxzcWN1cHN8R2NlZGlsfGFwYWNpcnxsbGhhcmR8bG1pZG90fExtaWRvdHxsbW91c3R8YW5kYW5kfHNxY2Fwc3xhcHByb3h8QWJyZXZlfHNwYWRlc3xjaXJjZXF8dHByaW1lfGRpdmlkZXx0b3BjaXJ8QXNzaWdufHRvcGJvdHxnZXNkb3R8ZGl2b254fHh1cGx1c3x0aW1lc2R8Z2VzbGVzfGF0aWxkZXxzb2xiYXJ8U09GVGN5fGxvcGx1c3x0aW1lc2J8bG93YXN0fGxvd2JhcnxkbGNvcm58ZGxjcm9wfHNvZnRjeXxkb2xsYXJ8bHBhcmx0fHRoa3NpbXxscmhhcmR8QXRpbGRlfGxzYXF1b3xzbWFzaHB8YmlndmVlfHRoaW5zcHx3cmVhdGh8Ymthcm93fGxzcXVvcnxsc3Ryb2t8THN0cm9rfGx0aHJlZXxsdGltZXN8bHRsYXJyfERvdERvdHxzaW1kb3R8bHRyUGFyfHdlaWVycHx4c3FjdXB8YW5nbXNkfHNpZ21hdnxzaWdtYWZ8emVldHJmfFpjYXJvbnx6Y2Fyb258bWFwc3RvfHZzdXBuZXx0aGV0YXZ8Y2lybWlkfG1hcmtlcnxtY29tbWF8WmFjdXRlfHZzdWJuRXx0aGVyZTR8Z3RsUGFyfHZzdWJuZXxib3R0b218Z3RyYXJyfFNIQ0hjeXxzaGNoY3l8bWlkYXN0fG1pZGNpcnxtaWRkb3R8bWludXNifG1pbnVzZHxndHJkb3R8Ym93dGllfHNmcm93bnxtbnBsdXN8bW9kZWxzfGNvbG9uZXxzZXN3YXJ8Q29sb25lfG1zdHBvc3xzZWFyaGt8Z3Ryc2ltfG5hY3V0ZXxOYWN1dGV8Ym94Ym94fHRlbHJlY3xoYWlyc3B8VGNlZGlsfG5idW1wZXxzY25zaW18bmNhcm9ufE5jYXJvbnxuY2VkaWx8TmNlZGlsfGhhbWlsdHxTY2VkaWx8bmVhcmhrfGhhcmRjeXxIQVJEY3l8dGNlZGlsfFRjYXJvbnxjb21tYXR8bmVxdWl2fG5lc2Vhcnx0Y2Fyb258dGFyZ2V0fGhlYXJ0c3xuZXhpc3R8dmFycmhvfHNjZWRpbHxTY2Fyb258c2Nhcm9ufGhlbGxpcHxTYWN1dGV8c2FjdXRlfGhlcmNvbnxzd253YXJ8Y29tcGZufHJ0aW1lc3xydGhyZWV8cnNxdW9yfHJzYXF1b3x6YWN1dGV8d2VkZ2VxfGhvbXRodHxiYXJ2ZWV8YmFyd2VkfEJhcndlZHxycGFyZ3R8aG9yYmFyfGNvbmludHxzd2FyaGt8cm9wbHVzfG5sdHJpZXxoc2xhc2h8aHN0cm9rfEhzdHJva3xybW91c3R8Q29uaW50fGJwcmltZXxoeWJ1bGx8aHlwaGVufGlhY3V0ZXxJYWN1dGV8c3Vwc3VwfHN1cHN1YnxzdXBzaW18dmFycGhpfGNvcHJvZHxicnZiYXJ8YWdyYXZlfFN1cHNldHxzdXBzZXR8aWdyYXZlfElncmF2ZXxub3RpbkV8QWdyYXZlfGlpaWludHxpaW5maW58Y29weXNyfHdlZGJhcnxWZXJiYXJ8dmFuZ3J0fGJlY2F1c3xpbmNhcmV8dmVyYmFyfGlub2RvdHxidWxsZXR8ZHJjb3JufGludGNhbHxkcmNyb3B8Y3VsYXJyfHZlbGxpcHxVdGlsZGV8YnVtcGVxfGN1cGNhcHxkc3Ryb2t8RHN0cm9rfEN1cENhcHxjdXBjdXB8Y3VwZG90fGVhY3V0ZXxFYWN1dGV8c3VwZG90fGlxdWVzdHxlYXN0ZXJ8ZWNhcm9ufEVjYXJvbnxlY29sb258aXNpbnN2fHV0aWxkZXxpdGlsZGV8SXRpbGRlfGN1cmFycnxzdWNjZXF8QnVtcGVxfGNhY3V0ZXx1bGNyb3B8bnBhcnNsfENhY3V0ZXxucHJjdWV8ZWdyYXZlfEVncmF2ZXxucmFycmN8bnJhcnJ3fHN1YnN1cHxzdWJzdWJ8bnJ0cmllfGpzZXJjeXxuc2NjdWV8SnNlcmN5fGthcHBhdnxrY2VkaWx8S2NlZGlsfHN1YnNpbXx1bGNvcm58bnNpbWVxfGVnc2RvdHx2ZWViYXJ8a2dyZWVufGNhcGFuZHxlbHNkb3R8U3Vic2V0fHN1YnNldHxjdXJyZW58YWFjdXRlfGxhY3V0ZXxMYWN1dGV8ZW1wdHl2fG50aWxkZXxOdGlsZGV8bGFncmFufGxhbWJkYXxMYW1iZGF8Y2FwY2FwfFVncmF2ZXxsYW5nbGV8c3ViZG90fGVtc3AxM3xudW1lcm98ZW1zcDE0fG52ZGFzaHxudkRhc2h8blZkYXNofG5WRGFzaHx1Z3JhdmV8dWZpc2h0fG52SGFycnxsYXJyZnN8bnZsQXJyfGxhcnJoa3xsYXJybHB8bGFycnBsfG52ckFycnxVZGJsYWN8bndhcmhrfGxhcnJ0bHxud25lYXJ8b2FjdXRlfE9hY3V0ZXxsYXRhaWx8bEF0YWlsfHNzdGFyZnxsYnJhY2V8b2RibGFjfE9kYmxhY3xsYnJhY2t8dWRibGFjfG9kc29sZHxlcGFyc2x8bGNhcm9ufExjYXJvbnxvZ3JhdmV8T2dyYXZlfGxjZWRpbHxMY2VkaWx8QWFjdXRlfHNzbWlsZXxzc2V0bW58c3F1YXJmfGxkcXVvcnxjYXBjdXB8b21pbnVzfGN5bGN0eXxyaGFydWx8ZXFjaXJjfGRhZ2dlcnxyZmxvb3J8cmZpc2h0fERhZ2dlcnxkYWxldGh8ZXF1YWxzfG9yaWdvZnxjYXBkb3R8ZXF1ZXN0fGRjYXJvbnxEY2Fyb258cmRxdW9yfG9zbGFzaHxPc2xhc2h8b3RpbGRlfE90aWxkZXxvdGltZXN8T3RpbWVzfHVyY3JvcHxVYnJldmV8dWJyZXZlfFlhY3V0ZXxVYWN1dGV8dWFjdXRlfFJjZWRpbHxyY2VkaWx8dXJjb3JufHBhcnNpbXxSY2Fyb258VmRhc2hsfHJjYXJvbnxUc3Ryb2t8cGVyY250fHBlcmlvZHxwZXJtaWx8RXhpc3RzfHlhY3V0ZXxyYnJhY2t8cmJyYWNlfHBobW1hdHxjY2Fyb258Q2Nhcm9ufHBsYW5ja3xjY2VkaWx8cGxhbmt2fHRzdHJva3xmZW1hbGV8cGx1c2RvfHBsdXNkdXxmZmlsaWd8cGx1c21ufGZmbGxpZ3xDY2VkaWx8ckF0YWlsfGRmaXNodHxiZXJub3V8cmF0YWlsfFJhcnJ0bHxyYXJydGx8YW5nc3BofHJhcnJwbHxyYXJybHB8cmFycmhrfHh3ZWRnZXx4b3RpbWV8Zm9yYWxsfEZvckFsbHxWdmRhc2h8dnN1cG5FfHByZWNlcXxiaWdjYXB8ZnJhYzEyfGZyYWMxM3xmcmFjMTR8cHJpbWVzfHJhcnJmc3xwcm5zaW18ZnJhYzE1fFNxdWFyZXxmcmFjMTZ8c3F1YXJlfGxlc2RvdHxmcmFjMTh8ZnJhYzIzfHByb3B0b3xwcnVyZWx8cmFycmFwfHJhbmdsZXxwdW5jc3B8ZnJhYzI1fFJhY3V0ZXxxcHJpbWV8cmFjdXRlfGxlc2dlc3xmcmFjMzR8YWJyZXZlfEFFbGlnfGVxc2ltfHV0ZG90fHNldG1ufHVydHJpfEVxdWFsfFVyaW5nfHNlQXJyfHVyaW5nfHNlYXJyfGRhc2h2fERhc2h2fG11bWFwfG5hYmxhfGlvZ29ufElvZ29ufHNkb3RlfHNkb3RifHNjc2ltfG5hcGlkfG5hcG9zfGVxdWl2fG5hdHVyfEFjaXJjfGRibGFjfGVyYXJyfG5idW1wfGlwcm9kfGVyRG90fHVjaXJjfGF3aW50fGVzZG90fGFuZ3J0fG5jb25nfGlzaW5FfHNjbmFwfFNjaXJjfHNjaXJjfG5kYXNofGlzaW5zfFVicmN5fG5lYXJyfG5lQXJyfGlzaW52fG5lZG90fHVicmN5fGFjdXRlfFljaXJjfGl1a2N5fEl1a2N5fHh1dHJpfG5lc2ltfGNhcmV0fGpjaXJjfEpjaXJjfGNhcm9ufHR3aXh0fGRkYXJyfHNjY3VlfGV4aXN0fGptYXRofHNicXVvfG5nZXFxfGFuZ3N0fGNjYXBzfGxjZWlsfG5nc2ltfFVwVGVlfGRlbHRhfERlbHRhfHJ0cmlmfG5oYXJyfG5oQXJyfG5ocGFyfHJ0cmllfGp1a2N5fEp1a2N5fGthcHBhfHJzcXVvfEthcHBhfG5sYXJyfG5sQXJyfFRTSGN5fHJyYXJyfGFvZ29ufEFvZ29ufGZmbGlnfHhyYXJyfHRzaGN5fGNjaXJjfG5sZXFxfGZpbGlnfHVwc2lofG5sZXNzfGRoYXJsfG5sc2ltfGZqbGlnfHJvcGFyfG5sdHJpfGRoYXJyfHJvYnJrfHJvYXJyfGZsbGlnfGZsdG5zfHJvYW5nfHJubWlkfHN1Ym5FfHN1Ym5lfGxBYXJyfHRyaXNifENjaXJjfGFjaXJjfGNjdXBzfGJsYW5rfFZEYXNofGZvcmt2fFZkYXNofGxhbmdkfGNlZGlsfGJsazEyfGJsazE0fGxhcXVvfHN0cm5zfGRpYW1zfG5vdGlufHZEYXNofGxhcnJifGJsazM0fGJsb2NrfGRpc2lufHVwbHVzfHZkYXNofHZCYXJ2fGFlbGlnfHN0YXJmfFdlZGdlfGNoZWNrfHhyQXJyfGxhdGVzfGxiYXJyfGxCYXJyfG5vdG5pfGxiYnJrfGJjb25nfGZyYXNsfGxicmtlfGZyb3dufHZydHJpfHZwcm9wfHZuc3VwfGdhbW1hfEdhbW1hfHdlZGdlfHhvZG90fGJkcXVvfHNyYXJyfGRvdGVxfGxkcXVvfGJveGRsfGJveGRMfGdjaXJjfEdjaXJjfGJveERsfGJveERMfGJveGRyfGJveGRSfGJveERyfFRSQURFfHRyYWRlfHJsaGFyfGJveERSfHZuc3VifG5wYXJ0fHZsdHJpfHJsYXJyfGJveGhkfGJveGhEfG5wcmVjfGdlc2NjfG5yYXJyfG5yQXJyfGJveEhkfGJveEhEfGJveGh1fGJveGhVfG5ydHJpfGJveEh1fGNsdWJzfGJveEhVfHRpbWVzfGNvbG9ufENvbG9ufGdpbWVsfHhsQXJyfFRpbGRlfG5zaW1lfHRpbGRlfG5zbWlkfG5zcGFyfFRIT1JOfHRob3JufHhsYXJyfG5zdWJlfG5zdWJFfHRoa2FwfHhoQXJyfGNvbW1hfG5zdWNjfGJveHVsfGJveHVMfG5zdXBlfG5zdXBFfGduZXFxfGduc2ltfGJveFVsfGJveFVMfGdyYXZlfGJveHVyfGJveHVSfGJveFVyfGJveFVSfGxlc2NjfGFuZ2xlfGJlcHNpfGJveHZofHZhcnBpfGJveHZIfG51bXNwfFRoZXRhfGdzaW1lfGdzaW1sfHRoZXRhfGJveFZofGJveFZIfGJveHZsfGd0Y2lyfGd0ZG90fGJveHZMfGJveFZsfGJveFZMfGNyYXJyfGNyb3NzfENyb3NzfG52c2ltfGJveHZyfG53YXJyfG53QXJyfHNxc3VwfGR0ZG90fFVvZ29ufGxoYXJkfGxoYXJ1fGR0cmlmfG9jaXJjfE9jaXJjfGxoYmxrfGR1YXJyfG9kYXNofHNxc3VifEhhY2VrfHNxY3VwfGxsYXJyfGR1aGFyfG9lbGlnfE9FbGlnfG9mY2lyfGJveHZSfHVvZ29ufGxsdHJpfGJveFZyfGNzdWJlfHV1YXJyfG9oYmFyfGNzdXBlfGN0ZG90fG9sYXJyfG9sY2lyfGhhcnJ3fG9saW5lfHNxY2FwfG9tYWNyfE9tYWNyfG9tZWdhfE9tZWdhfGJveFZSfGFsZXBofGxuZXFxfGxuc2ltfGxvYW5nfGxvYXJyfHJoYXJ1fGxvYnJrfGhjaXJjfG9wZXJwfG9wbHVzfHJoYXJkfEhjaXJjfG9yYXJyfFVuaW9ufG9yZGVyfGVjaXJjfEVjaXJjfGN1ZXByfHN6bGlnfGN1ZXNjfGJyZXZlfHJlYWxzfGVERG90fEJyZXZlfGhvYXJyfGxvcGFyfHV0cmlmfHJkcXVvfFVtYWNyfHVtYWNyfGVmRG90fHN3QXJyfHVsdHJpfGFscGhhfHJjZWlsfG92YmFyfHN3YXJyfFdjaXJjfHdjaXJjfHNtdGVzfHNtaWxlfGJzZW1pfGxyYXJyfGFyaW5nfHBhcnNsfGxyaGFyfGJzaW1lfHVoYmxrfGxydHJpfGN1cG9yfEFyaW5nfHVoYXJyfHVoYXJsfHNsYXJyfHJicmtlfGJzb2xifGxzaW1lfHJiYnJrfFJCYXJyfGxzaW1nfHBob25lfHJCYXJyfHJiYXJyfGljaXJjfGxzcXVvfEljaXJjfGVtYWNyfEVtYWNyfHJhdGlvfHNpbW5lfHBsdXNifHNpbWxFfHNpbWdFfHNpbWVxfHBsdXNlfGx0Y2lyfGx0ZG90fGVtcHR5fHhoYXJyfHhkdHJpfGlleGNsfEFscGhhfGx0cmllfHJhcnJ3fHBvdW5kfGx0cmlmfHhjaXJjfGJ1bXBlfHByY3VlfGJ1bXBFfGFzeW1wfGFtYWNyfGN1dmVlfFNpZ21hfHNpZ21hfGlpaW50fHVkaGFyfGlpb3RhfGlqbGlnfElKbGlnfHN1cG5FfGltYWNyfEltYWNyfHByaW1lfFByaW1lfGltYWdlfHBybmFwfGVvZ29ufEVvZ29ufHJhcnJjfG1kYXNofG1ERG90fGN1d2VkfGltYXRofHN1cG5lfGltcGVkfEFtYWNyfHVkYXJyfHByc2ltfG1pY3JvfHJhcnJifGN3aW50fHJhcXVvfGluZmlufGVwbHVzfHJhbmdlfHJhbmdkfFVjaXJjfHJhZGljfG1pbnVzfGFtYWxnfHZlZWVxfHJBYXJyfGVwc2l2fHljaXJjfHF1ZXN0fHNoYXJwfHF1b3R8enduanxRc2NyfHJhY2V8cXNjcnxRb3BmfHFvcGZ8cWludHxyYW5nfFJhbmd8WnNjcnx6c2NyfFpvcGZ8em9wZnxyYXJyfHJBcnJ8UmFycnxQc2NyfHBzY3J8cHJvcHxwcm9kfHBybkV8cHJlY3xaSGN5fHpoY3l8cHJhcHxaZXRhfHpldGF8UG9wZnxwb3BmfFpkb3R8cGx1c3x6ZG90fFl1bWx8eXVtbHxwaGl2fFlVY3l8eXVjeXxZc2NyfHlzY3J8cGVycHxZb3BmfHlvcGZ8cGFydHxwYXJhfFlJY3l8T3VtbHxyY3VifHlpY3l8WUFjeXxyZGNhfG91bWx8b3NvbHxPc2NyfHJkc2h8eWFjeXxyZWFsfG9zY3J8eHZlZXxhbmRkfHJlY3R8YW5kdnxYc2NyfG9yb3J8b3JkbXxvcmRmfHhzY3J8YW5nZXxhb3BmfEFvcGZ8ckhhcnxYb3BmfG9wYXJ8T29wZnx4b3BmfHhuaXN8cmhvdnxvb3BmfG9taWR8eG1hcHxvaW50fGFwaWR8YXBvc3xvZ29ufGFzY3J8QXNjcnxvZG90fG9kaXZ8eGN1cHx4Y2FwfG9jaXJ8b2FzdHxudmx0fG52bGV8bnZndHxudmdlfG52YXB8V3Njcnx3c2NyfGF1bWx8bnRsZ3xudGdsfG5zdXB8bnN1Ynxuc2ltfE5zY3J8bnNjcnxuc2NlfFdvcGZ8cmluZ3xucHJlfHdvcGZ8bnBhcnxBdW1sfEJhcnZ8YmJya3xOb3BmfG5vcGZ8bm1pZHxuTHR2fGJldGF8cm9wZnxSb3BmfEJldGF8YmV0aHxubGVzfHJwYXJ8bmxlcXxibm90fGJOb3R8bmxkcnxOSmN5fHJzY3J8UnNjcnxWc2NyfHZzY3J8cnNxYnxuamN5fGJvcGZ8bmlzZHxCb3BmfHJ0cml8Vm9wZnxuR3R2fG5ndHJ8dm9wZnxib3hofGJveEh8Ym94dnxuZ2VzfG5nZXF8Ym94Vnxic2NyfHNjYXB8QnNjcnxic2ltfFZlcnR8dmVydHxic29sfGJ1bGx8YnVtcHxjYXBzfGNkb3R8bmN1cHxzY25FfG5jYXB8bmJzcHxuYXBFfENkb3R8Y2VudHxzZG90fFZiYXJ8bmFuZ3x2QmFyfGNoY3l8TXNjcnxtc2NyfHNlY3R8c2VtaXxDSGN5fE1vcGZ8bW9wZnxzZXh0fGNpcmN8Y2lyZXxtbGRyfG1sY3B8Y2lyRXxjb21wfHNoY3l8U0hjeXx2QXJyfHZhcnJ8Y29uZ3xjb3BmfENvcGZ8Y29weXxDT1BZfG1hbHR8bWFsZXxtYWNyfGx2bkV8Y3NjcnxsdHJpfHNpbWV8bHRjY3xzaW1nfENzY3J8c2ltbHxjc3VifFV1bWx8bHNxYnxsc2ltfHV1bWx8Y3N1cHxMc2NyfGxzY3J8dXRyaXxzbWlkfGxwYXJ8Y3Vwc3xzbXRlfGxvemZ8ZGFycnxMb3BmfFVzY3J8c29sYnxsb3BmfHNvcGZ8U29wZnxsbmVxfHVzY3J8c3BhcnxkQXJyfGxuYXB8RGFycnxkYXNofFNxcnR8TEpjeXxsamN5fGxIYXJ8ZEhhcnxVcHNpfHVwc2l8ZGlhbXxsZXNnfGRqY3l8REpjeXxsZXFxfGRvcGZ8RG9wZnxkc2NyfERzY3J8ZHNjeXxsZHNofGxkY2F8c3F1ZnxEU2N5fHNzY3J8U3Njcnxkc29sfGxjdWJ8bGF0ZXxzdGFyfFN0YXJ8VW9wZnxMYXJyfGxBcnJ8bGFycnx1b3BmfGR0cml8ZHpjeXxzdWJlfHN1YkV8TGFuZ3xsYW5nfEtzY3J8a3NjcnxLb3BmfGtvcGZ8S0pjeXxramN5fEtIY3l8a2hjeXxEWmN5fGVjaXJ8ZWRvdHxlRG90fEpzY3J8anNjcnxzdWNjfEpvcGZ8am9wZnxFZG90fHVIYXJ8ZW1zcHxlbnNwfEl1bWx8aXVtbHxlb3BmfGlzaW58SXNjcnxpc2NyfEVvcGZ8ZXBhcnxzdW5nfGVwc2l8ZXNjcnxzdXAxfHN1cDJ8c3VwM3xJb3RhfGlvdGF8c3VwZXxzdXBFfElvcGZ8aW9wZnxJT2N5fGlvY3l8RXNjcnxlc2ltfEVzaW18aW1vZnxVYXJyfFFVT1R8dUFycnx1YXJyfGV1bWx8SUVjeXxpZWN5fElkb3R8RXVtbHxldXJvfGV4Y2x8SHNjcnxoc2NyfEhvcGZ8aG9wZnxUU2N5fHRzY3l8VHNjcnxoYmFyfHRzY3J8ZmxhdHx0YnJrfGZub2Z8aEFycnxoYXJyfGhhbGZ8Zm9wZnxGb3BmfHRkb3R8Z3ZuRXxmb3JrfHRyaWV8Z3RjY3xmc2NyfEZzY3J8Z2RvdHxnc2ltfEdzY3J8Z3NjcnxHb3BmfGdvcGZ8Z25lcXxHZG90fHRvc2F8Z25hcHxUb3BmfHRvcGZ8Z2VxcXx0b2VhfEdKY3l8Z2pjeXx0aW50fGdlc2x8bWlkfFNmcnxnZ2d8dG9wfGdlc3xnbGF8Z2xFfGdsanxnZXF8Z25lfGdFbHxnZWx8Z25FfEdjeXxnY3l8Z2FwfFRmcnx0ZnJ8VGN5fHRjeXxIYXR8VGF1fEZmcnx0YXV8VGFifGhmcnxIZnJ8ZmZyfEZjeXxmY3l8aWN5fEljeXxpZmZ8RVRIfGV0aHxpZnJ8SWZyfEV0YXxldGF8aW50fEludHxTdXB8c3VwfHVjeXxVY3l8U3VtfHN1bXxqY3l8RU5HfHVmcnxVZnJ8ZW5nfEpjeXxqZnJ8ZWxzfGVsbHxlZ3N8RWZyfGVmcnxKZnJ8dW1sfGtjeXxLY3l8RWN5fGVjeXxrZnJ8S2ZyfGxhcHxTdWJ8c3VifGxhdHxsY3l8TGN5fGxlZ3xEb3R8ZG90fGxFZ3xsZXF8bGVzfHNxdXxkaXZ8ZGllfGxmcnxMZnJ8bGdFfERmcnxkZnJ8RGVsfGRlZ3xEY3l8ZGN5fGxuZXxsbkV8c29sfGxvenxzbXR8Q3VwfGxybXxjdXB8bHNofExzaHxzaW18c2h5fG1hcHxNYXB8bWN5fE1jeXxtZnJ8TWZyfG1ob3xnZnJ8R2ZyfHNmcnxjaXJ8Q2hpfGNoaXxuYXB8Q2ZyfHZjeXxWY3l8Y2ZyfFNjeXxzY3l8bmN5fE5jeXx2ZWV8VmVlfENhcHxjYXB8bmZyfHNjRXxzY2V8TmZyfG5nZXxuZ0V8bkdnfHZmcnxWZnJ8bmd0fGJvdHxuR3R8bmlzfG5pdnxSc2h8cnNofG5sZXxubEV8Ym5lfEJmcnxiZnJ8bkxsfG5sdHxuTHR8QmN5fGJjeXxub3R8Tm90fHJsbXx3ZnJ8V2ZyfG5wcnxuc2N8bnVtfG9jeXxhc3R8T2N5fG9mcnx4ZnJ8WGZyfE9mcnxvZ3R8b2htfGFwRXxvbHR8UmhvfGFwZXxyaG98UmZyfHJmcnxvcmR8UkVHfGFuZ3xyZWd8b3J2fEFuZHxhbmR8QU1QfFJjeXxhbXB8QWZyfHljeXxZY3l8eWVufHlmcnxZZnJ8cmN5fHBhcnxwY3l8UGN5fHBmcnxQZnJ8cGhpfFBoaXxhZnJ8QWN5fGFjeXx6Y3l8WmN5fHBpdnxhY0V8YWNkfHpmcnxaZnJ8cHJlfHByRXxwc2l8UHNpfHFmcnxRZnJ8endqfE9yfGdlfEdnfGd0fGdnfGVsfG9TfGx0fEx0fExUfFJlfGxnfGdsfGVnfG5lfEltfGl0fGxlfEREfHdwfHdyfG51fE51fGRkfGxFfFNjfHNjfHBpfFBpfGVlfGFmfGxsfExsfHJ4fGdFfHhpfHBtfFhpfGljfHByfFByfGlufG5pfG1wfG11fGFjfE11fG9yfGFwfEd0fEdUfGlpKTt8JihBYWN1dGV8QWdyYXZlfEF0aWxkZXxDY2VkaWx8RWFjdXRlfEVncmF2ZXxJYWN1dGV8SWdyYXZlfE50aWxkZXxPYWN1dGV8T2dyYXZlfE9zbGFzaHxPdGlsZGV8VWFjdXRlfFVncmF2ZXxZYWN1dGV8YWFjdXRlfGFncmF2ZXxhdGlsZGV8YnJ2YmFyfGNjZWRpbHxjdXJyZW58ZGl2aWRlfGVhY3V0ZXxlZ3JhdmV8ZnJhYzEyfGZyYWMxNHxmcmFjMzR8aWFjdXRlfGlncmF2ZXxpcXVlc3R8bWlkZG90fG50aWxkZXxvYWN1dGV8b2dyYXZlfG9zbGFzaHxvdGlsZGV8cGx1c21ufHVhY3V0ZXx1Z3JhdmV8eWFjdXRlfEFFbGlnfEFjaXJjfEFyaW5nfEVjaXJjfEljaXJjfE9jaXJjfFRIT1JOfFVjaXJjfGFjaXJjfGFjdXRlfGFlbGlnfGFyaW5nfGNlZGlsfGVjaXJjfGljaXJjfGlleGNsfGxhcXVvfG1pY3JvfG9jaXJjfHBvdW5kfHJhcXVvfHN6bGlnfHRob3JufHRpbWVzfHVjaXJjfEF1bWx8Q09QWXxFdW1sfEl1bWx8T3VtbHxRVU9UfFV1bWx8YXVtbHxjZW50fGNvcHl8ZXVtbHxpdW1sfG1hY3J8bmJzcHxvcmRmfG9yZG18b3VtbHxwYXJhfHF1b3R8c2VjdHxzdXAxfHN1cDJ8c3VwM3x1dW1sfHl1bWx8QU1QfEVUSHxSRUd8YW1wfGRlZ3xldGh8bm90fHJlZ3xzaHl8dW1sfHllbnxHVHxMVHxndHxsdCkoPyE7KShbPWEtekEtWjAtOV0/KXwmIyhbMC05XSspKDs/KXwmI1t4WF0oW2EtZkEtRjAtOV0rKSg7Pyl8JihbMC05YS16QS1aXSspL2c7XG5cdHZhciBkZWNvZGVNYXAgPSB7J2FhY3V0ZSc6J1xceEUxJywnQWFjdXRlJzonXFx4QzEnLCdhYnJldmUnOidcXHUwMTAzJywnQWJyZXZlJzonXFx1MDEwMicsJ2FjJzonXFx1MjIzRScsJ2FjZCc6J1xcdTIyM0YnLCdhY0UnOidcXHUyMjNFXFx1MDMzMycsJ2FjaXJjJzonXFx4RTInLCdBY2lyYyc6J1xceEMyJywnYWN1dGUnOidcXHhCNCcsJ2FjeSc6J1xcdTA0MzAnLCdBY3knOidcXHUwNDEwJywnYWVsaWcnOidcXHhFNicsJ0FFbGlnJzonXFx4QzYnLCdhZic6J1xcdTIwNjEnLCdhZnInOidcXHVEODM1XFx1REQxRScsJ0Fmcic6J1xcdUQ4MzVcXHVERDA0JywnYWdyYXZlJzonXFx4RTAnLCdBZ3JhdmUnOidcXHhDMCcsJ2FsZWZzeW0nOidcXHUyMTM1JywnYWxlcGgnOidcXHUyMTM1JywnYWxwaGEnOidcXHUwM0IxJywnQWxwaGEnOidcXHUwMzkxJywnYW1hY3InOidcXHUwMTAxJywnQW1hY3InOidcXHUwMTAwJywnYW1hbGcnOidcXHUyQTNGJywnYW1wJzonJicsJ0FNUCc6JyYnLCdhbmQnOidcXHUyMjI3JywnQW5kJzonXFx1MkE1MycsJ2FuZGFuZCc6J1xcdTJBNTUnLCdhbmRkJzonXFx1MkE1QycsJ2FuZHNsb3BlJzonXFx1MkE1OCcsJ2FuZHYnOidcXHUyQTVBJywnYW5nJzonXFx1MjIyMCcsJ2FuZ2UnOidcXHUyOUE0JywnYW5nbGUnOidcXHUyMjIwJywnYW5nbXNkJzonXFx1MjIyMScsJ2FuZ21zZGFhJzonXFx1MjlBOCcsJ2FuZ21zZGFiJzonXFx1MjlBOScsJ2FuZ21zZGFjJzonXFx1MjlBQScsJ2FuZ21zZGFkJzonXFx1MjlBQicsJ2FuZ21zZGFlJzonXFx1MjlBQycsJ2FuZ21zZGFmJzonXFx1MjlBRCcsJ2FuZ21zZGFnJzonXFx1MjlBRScsJ2FuZ21zZGFoJzonXFx1MjlBRicsJ2FuZ3J0JzonXFx1MjIxRicsJ2FuZ3J0dmInOidcXHUyMkJFJywnYW5ncnR2YmQnOidcXHUyOTlEJywnYW5nc3BoJzonXFx1MjIyMicsJ2FuZ3N0JzonXFx4QzUnLCdhbmd6YXJyJzonXFx1MjM3QycsJ2FvZ29uJzonXFx1MDEwNScsJ0FvZ29uJzonXFx1MDEwNCcsJ2FvcGYnOidcXHVEODM1XFx1REQ1MicsJ0FvcGYnOidcXHVEODM1XFx1REQzOCcsJ2FwJzonXFx1MjI0OCcsJ2FwYWNpcic6J1xcdTJBNkYnLCdhcGUnOidcXHUyMjRBJywnYXBFJzonXFx1MkE3MCcsJ2FwaWQnOidcXHUyMjRCJywnYXBvcyc6J1xcJycsJ0FwcGx5RnVuY3Rpb24nOidcXHUyMDYxJywnYXBwcm94JzonXFx1MjI0OCcsJ2FwcHJveGVxJzonXFx1MjI0QScsJ2FyaW5nJzonXFx4RTUnLCdBcmluZyc6J1xceEM1JywnYXNjcic6J1xcdUQ4MzVcXHVEQ0I2JywnQXNjcic6J1xcdUQ4MzVcXHVEQzlDJywnQXNzaWduJzonXFx1MjI1NCcsJ2FzdCc6JyonLCdhc3ltcCc6J1xcdTIyNDgnLCdhc3ltcGVxJzonXFx1MjI0RCcsJ2F0aWxkZSc6J1xceEUzJywnQXRpbGRlJzonXFx4QzMnLCdhdW1sJzonXFx4RTQnLCdBdW1sJzonXFx4QzQnLCdhd2NvbmludCc6J1xcdTIyMzMnLCdhd2ludCc6J1xcdTJBMTEnLCdiYWNrY29uZyc6J1xcdTIyNEMnLCdiYWNrZXBzaWxvbic6J1xcdTAzRjYnLCdiYWNrcHJpbWUnOidcXHUyMDM1JywnYmFja3NpbSc6J1xcdTIyM0QnLCdiYWNrc2ltZXEnOidcXHUyMkNEJywnQmFja3NsYXNoJzonXFx1MjIxNicsJ0JhcnYnOidcXHUyQUU3JywnYmFydmVlJzonXFx1MjJCRCcsJ2JhcndlZCc6J1xcdTIzMDUnLCdCYXJ3ZWQnOidcXHUyMzA2JywnYmFyd2VkZ2UnOidcXHUyMzA1JywnYmJyayc6J1xcdTIzQjUnLCdiYnJrdGJyayc6J1xcdTIzQjYnLCdiY29uZyc6J1xcdTIyNEMnLCdiY3knOidcXHUwNDMxJywnQmN5JzonXFx1MDQxMScsJ2JkcXVvJzonXFx1MjAxRScsJ2JlY2F1cyc6J1xcdTIyMzUnLCdiZWNhdXNlJzonXFx1MjIzNScsJ0JlY2F1c2UnOidcXHUyMjM1JywnYmVtcHR5dic6J1xcdTI5QjAnLCdiZXBzaSc6J1xcdTAzRjYnLCdiZXJub3UnOidcXHUyMTJDJywnQmVybm91bGxpcyc6J1xcdTIxMkMnLCdiZXRhJzonXFx1MDNCMicsJ0JldGEnOidcXHUwMzkyJywnYmV0aCc6J1xcdTIxMzYnLCdiZXR3ZWVuJzonXFx1MjI2QycsJ2Jmcic6J1xcdUQ4MzVcXHVERDFGJywnQmZyJzonXFx1RDgzNVxcdUREMDUnLCdiaWdjYXAnOidcXHUyMkMyJywnYmlnY2lyYyc6J1xcdTI1RUYnLCdiaWdjdXAnOidcXHUyMkMzJywnYmlnb2RvdCc6J1xcdTJBMDAnLCdiaWdvcGx1cyc6J1xcdTJBMDEnLCdiaWdvdGltZXMnOidcXHUyQTAyJywnYmlnc3FjdXAnOidcXHUyQTA2JywnYmlnc3Rhcic6J1xcdTI2MDUnLCdiaWd0cmlhbmdsZWRvd24nOidcXHUyNUJEJywnYmlndHJpYW5nbGV1cCc6J1xcdTI1QjMnLCdiaWd1cGx1cyc6J1xcdTJBMDQnLCdiaWd2ZWUnOidcXHUyMkMxJywnYmlnd2VkZ2UnOidcXHUyMkMwJywnYmthcm93JzonXFx1MjkwRCcsJ2JsYWNrbG96ZW5nZSc6J1xcdTI5RUInLCdibGFja3NxdWFyZSc6J1xcdTI1QUEnLCdibGFja3RyaWFuZ2xlJzonXFx1MjVCNCcsJ2JsYWNrdHJpYW5nbGVkb3duJzonXFx1MjVCRScsJ2JsYWNrdHJpYW5nbGVsZWZ0JzonXFx1MjVDMicsJ2JsYWNrdHJpYW5nbGVyaWdodCc6J1xcdTI1QjgnLCdibGFuayc6J1xcdTI0MjMnLCdibGsxMic6J1xcdTI1OTInLCdibGsxNCc6J1xcdTI1OTEnLCdibGszNCc6J1xcdTI1OTMnLCdibG9jayc6J1xcdTI1ODgnLCdibmUnOic9XFx1MjBFNScsJ2JuZXF1aXYnOidcXHUyMjYxXFx1MjBFNScsJ2Jub3QnOidcXHUyMzEwJywnYk5vdCc6J1xcdTJBRUQnLCdib3BmJzonXFx1RDgzNVxcdURENTMnLCdCb3BmJzonXFx1RDgzNVxcdUREMzknLCdib3QnOidcXHUyMkE1JywnYm90dG9tJzonXFx1MjJBNScsJ2Jvd3RpZSc6J1xcdTIyQzgnLCdib3hib3gnOidcXHUyOUM5JywnYm94ZGwnOidcXHUyNTEwJywnYm94ZEwnOidcXHUyNTU1JywnYm94RGwnOidcXHUyNTU2JywnYm94REwnOidcXHUyNTU3JywnYm94ZHInOidcXHUyNTBDJywnYm94ZFInOidcXHUyNTUyJywnYm94RHInOidcXHUyNTUzJywnYm94RFInOidcXHUyNTU0JywnYm94aCc6J1xcdTI1MDAnLCdib3hIJzonXFx1MjU1MCcsJ2JveGhkJzonXFx1MjUyQycsJ2JveGhEJzonXFx1MjU2NScsJ2JveEhkJzonXFx1MjU2NCcsJ2JveEhEJzonXFx1MjU2NicsJ2JveGh1JzonXFx1MjUzNCcsJ2JveGhVJzonXFx1MjU2OCcsJ2JveEh1JzonXFx1MjU2NycsJ2JveEhVJzonXFx1MjU2OScsJ2JveG1pbnVzJzonXFx1MjI5RicsJ2JveHBsdXMnOidcXHUyMjlFJywnYm94dGltZXMnOidcXHUyMkEwJywnYm94dWwnOidcXHUyNTE4JywnYm94dUwnOidcXHUyNTVCJywnYm94VWwnOidcXHUyNTVDJywnYm94VUwnOidcXHUyNTVEJywnYm94dXInOidcXHUyNTE0JywnYm94dVInOidcXHUyNTU4JywnYm94VXInOidcXHUyNTU5JywnYm94VVInOidcXHUyNTVBJywnYm94dic6J1xcdTI1MDInLCdib3hWJzonXFx1MjU1MScsJ2JveHZoJzonXFx1MjUzQycsJ2JveHZIJzonXFx1MjU2QScsJ2JveFZoJzonXFx1MjU2QicsJ2JveFZIJzonXFx1MjU2QycsJ2JveHZsJzonXFx1MjUyNCcsJ2JveHZMJzonXFx1MjU2MScsJ2JveFZsJzonXFx1MjU2MicsJ2JveFZMJzonXFx1MjU2MycsJ2JveHZyJzonXFx1MjUxQycsJ2JveHZSJzonXFx1MjU1RScsJ2JveFZyJzonXFx1MjU1RicsJ2JveFZSJzonXFx1MjU2MCcsJ2JwcmltZSc6J1xcdTIwMzUnLCdicmV2ZSc6J1xcdTAyRDgnLCdCcmV2ZSc6J1xcdTAyRDgnLCdicnZiYXInOidcXHhBNicsJ2JzY3InOidcXHVEODM1XFx1RENCNycsJ0JzY3InOidcXHUyMTJDJywnYnNlbWknOidcXHUyMDRGJywnYnNpbSc6J1xcdTIyM0QnLCdic2ltZSc6J1xcdTIyQ0QnLCdic29sJzonXFxcXCcsJ2Jzb2xiJzonXFx1MjlDNScsJ2Jzb2xoc3ViJzonXFx1MjdDOCcsJ2J1bGwnOidcXHUyMDIyJywnYnVsbGV0JzonXFx1MjAyMicsJ2J1bXAnOidcXHUyMjRFJywnYnVtcGUnOidcXHUyMjRGJywnYnVtcEUnOidcXHUyQUFFJywnYnVtcGVxJzonXFx1MjI0RicsJ0J1bXBlcSc6J1xcdTIyNEUnLCdjYWN1dGUnOidcXHUwMTA3JywnQ2FjdXRlJzonXFx1MDEwNicsJ2NhcCc6J1xcdTIyMjknLCdDYXAnOidcXHUyMkQyJywnY2FwYW5kJzonXFx1MkE0NCcsJ2NhcGJyY3VwJzonXFx1MkE0OScsJ2NhcGNhcCc6J1xcdTJBNEInLCdjYXBjdXAnOidcXHUyQTQ3JywnY2FwZG90JzonXFx1MkE0MCcsJ0NhcGl0YWxEaWZmZXJlbnRpYWxEJzonXFx1MjE0NScsJ2NhcHMnOidcXHUyMjI5XFx1RkUwMCcsJ2NhcmV0JzonXFx1MjA0MScsJ2Nhcm9uJzonXFx1MDJDNycsJ0NheWxleXMnOidcXHUyMTJEJywnY2NhcHMnOidcXHUyQTREJywnY2Nhcm9uJzonXFx1MDEwRCcsJ0NjYXJvbic6J1xcdTAxMEMnLCdjY2VkaWwnOidcXHhFNycsJ0NjZWRpbCc6J1xceEM3JywnY2NpcmMnOidcXHUwMTA5JywnQ2NpcmMnOidcXHUwMTA4JywnQ2NvbmludCc6J1xcdTIyMzAnLCdjY3Vwcyc6J1xcdTJBNEMnLCdjY3Vwc3NtJzonXFx1MkE1MCcsJ2Nkb3QnOidcXHUwMTBCJywnQ2RvdCc6J1xcdTAxMEEnLCdjZWRpbCc6J1xceEI4JywnQ2VkaWxsYSc6J1xceEI4JywnY2VtcHR5dic6J1xcdTI5QjInLCdjZW50JzonXFx4QTInLCdjZW50ZXJkb3QnOidcXHhCNycsJ0NlbnRlckRvdCc6J1xceEI3JywnY2ZyJzonXFx1RDgzNVxcdUREMjAnLCdDZnInOidcXHUyMTJEJywnY2hjeSc6J1xcdTA0NDcnLCdDSGN5JzonXFx1MDQyNycsJ2NoZWNrJzonXFx1MjcxMycsJ2NoZWNrbWFyayc6J1xcdTI3MTMnLCdjaGknOidcXHUwM0M3JywnQ2hpJzonXFx1MDNBNycsJ2Npcic6J1xcdTI1Q0InLCdjaXJjJzonXFx1MDJDNicsJ2NpcmNlcSc6J1xcdTIyNTcnLCdjaXJjbGVhcnJvd2xlZnQnOidcXHUyMUJBJywnY2lyY2xlYXJyb3dyaWdodCc6J1xcdTIxQkInLCdjaXJjbGVkYXN0JzonXFx1MjI5QicsJ2NpcmNsZWRjaXJjJzonXFx1MjI5QScsJ2NpcmNsZWRkYXNoJzonXFx1MjI5RCcsJ0NpcmNsZURvdCc6J1xcdTIyOTknLCdjaXJjbGVkUic6J1xceEFFJywnY2lyY2xlZFMnOidcXHUyNEM4JywnQ2lyY2xlTWludXMnOidcXHUyMjk2JywnQ2lyY2xlUGx1cyc6J1xcdTIyOTUnLCdDaXJjbGVUaW1lcyc6J1xcdTIyOTcnLCdjaXJlJzonXFx1MjI1NycsJ2NpckUnOidcXHUyOUMzJywnY2lyZm5pbnQnOidcXHUyQTEwJywnY2lybWlkJzonXFx1MkFFRicsJ2NpcnNjaXInOidcXHUyOUMyJywnQ2xvY2t3aXNlQ29udG91ckludGVncmFsJzonXFx1MjIzMicsJ0Nsb3NlQ3VybHlEb3VibGVRdW90ZSc6J1xcdTIwMUQnLCdDbG9zZUN1cmx5UXVvdGUnOidcXHUyMDE5JywnY2x1YnMnOidcXHUyNjYzJywnY2x1YnN1aXQnOidcXHUyNjYzJywnY29sb24nOic6JywnQ29sb24nOidcXHUyMjM3JywnY29sb25lJzonXFx1MjI1NCcsJ0NvbG9uZSc6J1xcdTJBNzQnLCdjb2xvbmVxJzonXFx1MjI1NCcsJ2NvbW1hJzonLCcsJ2NvbW1hdCc6J0AnLCdjb21wJzonXFx1MjIwMScsJ2NvbXBmbic6J1xcdTIyMTgnLCdjb21wbGVtZW50JzonXFx1MjIwMScsJ2NvbXBsZXhlcyc6J1xcdTIxMDInLCdjb25nJzonXFx1MjI0NScsJ2Nvbmdkb3QnOidcXHUyQTZEJywnQ29uZ3J1ZW50JzonXFx1MjI2MScsJ2NvbmludCc6J1xcdTIyMkUnLCdDb25pbnQnOidcXHUyMjJGJywnQ29udG91ckludGVncmFsJzonXFx1MjIyRScsJ2NvcGYnOidcXHVEODM1XFx1REQ1NCcsJ0NvcGYnOidcXHUyMTAyJywnY29wcm9kJzonXFx1MjIxMCcsJ0NvcHJvZHVjdCc6J1xcdTIyMTAnLCdjb3B5JzonXFx4QTknLCdDT1BZJzonXFx4QTknLCdjb3B5c3InOidcXHUyMTE3JywnQ291bnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbCc6J1xcdTIyMzMnLCdjcmFycic6J1xcdTIxQjUnLCdjcm9zcyc6J1xcdTI3MTcnLCdDcm9zcyc6J1xcdTJBMkYnLCdjc2NyJzonXFx1RDgzNVxcdURDQjgnLCdDc2NyJzonXFx1RDgzNVxcdURDOUUnLCdjc3ViJzonXFx1MkFDRicsJ2NzdWJlJzonXFx1MkFEMScsJ2NzdXAnOidcXHUyQUQwJywnY3N1cGUnOidcXHUyQUQyJywnY3Rkb3QnOidcXHUyMkVGJywnY3VkYXJybCc6J1xcdTI5MzgnLCdjdWRhcnJyJzonXFx1MjkzNScsJ2N1ZXByJzonXFx1MjJERScsJ2N1ZXNjJzonXFx1MjJERicsJ2N1bGFycic6J1xcdTIxQjYnLCdjdWxhcnJwJzonXFx1MjkzRCcsJ2N1cCc6J1xcdTIyMkEnLCdDdXAnOidcXHUyMkQzJywnY3VwYnJjYXAnOidcXHUyQTQ4JywnY3VwY2FwJzonXFx1MkE0NicsJ0N1cENhcCc6J1xcdTIyNEQnLCdjdXBjdXAnOidcXHUyQTRBJywnY3VwZG90JzonXFx1MjI4RCcsJ2N1cG9yJzonXFx1MkE0NScsJ2N1cHMnOidcXHUyMjJBXFx1RkUwMCcsJ2N1cmFycic6J1xcdTIxQjcnLCdjdXJhcnJtJzonXFx1MjkzQycsJ2N1cmx5ZXFwcmVjJzonXFx1MjJERScsJ2N1cmx5ZXFzdWNjJzonXFx1MjJERicsJ2N1cmx5dmVlJzonXFx1MjJDRScsJ2N1cmx5d2VkZ2UnOidcXHUyMkNGJywnY3VycmVuJzonXFx4QTQnLCdjdXJ2ZWFycm93bGVmdCc6J1xcdTIxQjYnLCdjdXJ2ZWFycm93cmlnaHQnOidcXHUyMUI3JywnY3V2ZWUnOidcXHUyMkNFJywnY3V3ZWQnOidcXHUyMkNGJywnY3djb25pbnQnOidcXHUyMjMyJywnY3dpbnQnOidcXHUyMjMxJywnY3lsY3R5JzonXFx1MjMyRCcsJ2RhZ2dlcic6J1xcdTIwMjAnLCdEYWdnZXInOidcXHUyMDIxJywnZGFsZXRoJzonXFx1MjEzOCcsJ2RhcnInOidcXHUyMTkzJywnZEFycic6J1xcdTIxRDMnLCdEYXJyJzonXFx1MjFBMScsJ2Rhc2gnOidcXHUyMDEwJywnZGFzaHYnOidcXHUyMkEzJywnRGFzaHYnOidcXHUyQUU0JywnZGJrYXJvdyc6J1xcdTI5MEYnLCdkYmxhYyc6J1xcdTAyREQnLCdkY2Fyb24nOidcXHUwMTBGJywnRGNhcm9uJzonXFx1MDEwRScsJ2RjeSc6J1xcdTA0MzQnLCdEY3knOidcXHUwNDE0JywnZGQnOidcXHUyMTQ2JywnREQnOidcXHUyMTQ1JywnZGRhZ2dlcic6J1xcdTIwMjEnLCdkZGFycic6J1xcdTIxQ0EnLCdERG90cmFoZCc6J1xcdTI5MTEnLCdkZG90c2VxJzonXFx1MkE3NycsJ2RlZyc6J1xceEIwJywnRGVsJzonXFx1MjIwNycsJ2RlbHRhJzonXFx1MDNCNCcsJ0RlbHRhJzonXFx1MDM5NCcsJ2RlbXB0eXYnOidcXHUyOUIxJywnZGZpc2h0JzonXFx1Mjk3RicsJ2Rmcic6J1xcdUQ4MzVcXHVERDIxJywnRGZyJzonXFx1RDgzNVxcdUREMDcnLCdkSGFyJzonXFx1Mjk2NScsJ2RoYXJsJzonXFx1MjFDMycsJ2RoYXJyJzonXFx1MjFDMicsJ0RpYWNyaXRpY2FsQWN1dGUnOidcXHhCNCcsJ0RpYWNyaXRpY2FsRG90JzonXFx1MDJEOScsJ0RpYWNyaXRpY2FsRG91YmxlQWN1dGUnOidcXHUwMkREJywnRGlhY3JpdGljYWxHcmF2ZSc6J2AnLCdEaWFjcml0aWNhbFRpbGRlJzonXFx1MDJEQycsJ2RpYW0nOidcXHUyMkM0JywnZGlhbW9uZCc6J1xcdTIyQzQnLCdEaWFtb25kJzonXFx1MjJDNCcsJ2RpYW1vbmRzdWl0JzonXFx1MjY2NicsJ2RpYW1zJzonXFx1MjY2NicsJ2RpZSc6J1xceEE4JywnRGlmZmVyZW50aWFsRCc6J1xcdTIxNDYnLCdkaWdhbW1hJzonXFx1MDNERCcsJ2Rpc2luJzonXFx1MjJGMicsJ2Rpdic6J1xceEY3JywnZGl2aWRlJzonXFx4RjcnLCdkaXZpZGVvbnRpbWVzJzonXFx1MjJDNycsJ2Rpdm9ueCc6J1xcdTIyQzcnLCdkamN5JzonXFx1MDQ1MicsJ0RKY3knOidcXHUwNDAyJywnZGxjb3JuJzonXFx1MjMxRScsJ2RsY3JvcCc6J1xcdTIzMEQnLCdkb2xsYXInOickJywnZG9wZic6J1xcdUQ4MzVcXHVERDU1JywnRG9wZic6J1xcdUQ4MzVcXHVERDNCJywnZG90JzonXFx1MDJEOScsJ0RvdCc6J1xceEE4JywnRG90RG90JzonXFx1MjBEQycsJ2RvdGVxJzonXFx1MjI1MCcsJ2RvdGVxZG90JzonXFx1MjI1MScsJ0RvdEVxdWFsJzonXFx1MjI1MCcsJ2RvdG1pbnVzJzonXFx1MjIzOCcsJ2RvdHBsdXMnOidcXHUyMjE0JywnZG90c3F1YXJlJzonXFx1MjJBMScsJ2RvdWJsZWJhcndlZGdlJzonXFx1MjMwNicsJ0RvdWJsZUNvbnRvdXJJbnRlZ3JhbCc6J1xcdTIyMkYnLCdEb3VibGVEb3QnOidcXHhBOCcsJ0RvdWJsZURvd25BcnJvdyc6J1xcdTIxRDMnLCdEb3VibGVMZWZ0QXJyb3cnOidcXHUyMUQwJywnRG91YmxlTGVmdFJpZ2h0QXJyb3cnOidcXHUyMUQ0JywnRG91YmxlTGVmdFRlZSc6J1xcdTJBRTQnLCdEb3VibGVMb25nTGVmdEFycm93JzonXFx1MjdGOCcsJ0RvdWJsZUxvbmdMZWZ0UmlnaHRBcnJvdyc6J1xcdTI3RkEnLCdEb3VibGVMb25nUmlnaHRBcnJvdyc6J1xcdTI3RjknLCdEb3VibGVSaWdodEFycm93JzonXFx1MjFEMicsJ0RvdWJsZVJpZ2h0VGVlJzonXFx1MjJBOCcsJ0RvdWJsZVVwQXJyb3cnOidcXHUyMUQxJywnRG91YmxlVXBEb3duQXJyb3cnOidcXHUyMUQ1JywnRG91YmxlVmVydGljYWxCYXInOidcXHUyMjI1JywnZG93bmFycm93JzonXFx1MjE5MycsJ0Rvd25hcnJvdyc6J1xcdTIxRDMnLCdEb3duQXJyb3cnOidcXHUyMTkzJywnRG93bkFycm93QmFyJzonXFx1MjkxMycsJ0Rvd25BcnJvd1VwQXJyb3cnOidcXHUyMUY1JywnRG93bkJyZXZlJzonXFx1MDMxMScsJ2Rvd25kb3duYXJyb3dzJzonXFx1MjFDQScsJ2Rvd25oYXJwb29ubGVmdCc6J1xcdTIxQzMnLCdkb3duaGFycG9vbnJpZ2h0JzonXFx1MjFDMicsJ0Rvd25MZWZ0UmlnaHRWZWN0b3InOidcXHUyOTUwJywnRG93bkxlZnRUZWVWZWN0b3InOidcXHUyOTVFJywnRG93bkxlZnRWZWN0b3InOidcXHUyMUJEJywnRG93bkxlZnRWZWN0b3JCYXInOidcXHUyOTU2JywnRG93blJpZ2h0VGVlVmVjdG9yJzonXFx1Mjk1RicsJ0Rvd25SaWdodFZlY3Rvcic6J1xcdTIxQzEnLCdEb3duUmlnaHRWZWN0b3JCYXInOidcXHUyOTU3JywnRG93blRlZSc6J1xcdTIyQTQnLCdEb3duVGVlQXJyb3cnOidcXHUyMUE3JywnZHJia2Fyb3cnOidcXHUyOTEwJywnZHJjb3JuJzonXFx1MjMxRicsJ2RyY3JvcCc6J1xcdTIzMEMnLCdkc2NyJzonXFx1RDgzNVxcdURDQjknLCdEc2NyJzonXFx1RDgzNVxcdURDOUYnLCdkc2N5JzonXFx1MDQ1NScsJ0RTY3knOidcXHUwNDA1JywnZHNvbCc6J1xcdTI5RjYnLCdkc3Ryb2snOidcXHUwMTExJywnRHN0cm9rJzonXFx1MDExMCcsJ2R0ZG90JzonXFx1MjJGMScsJ2R0cmknOidcXHUyNUJGJywnZHRyaWYnOidcXHUyNUJFJywnZHVhcnInOidcXHUyMUY1JywnZHVoYXInOidcXHUyOTZGJywnZHdhbmdsZSc6J1xcdTI5QTYnLCdkemN5JzonXFx1MDQ1RicsJ0RaY3knOidcXHUwNDBGJywnZHppZ3JhcnInOidcXHUyN0ZGJywnZWFjdXRlJzonXFx4RTknLCdFYWN1dGUnOidcXHhDOScsJ2Vhc3Rlcic6J1xcdTJBNkUnLCdlY2Fyb24nOidcXHUwMTFCJywnRWNhcm9uJzonXFx1MDExQScsJ2VjaXInOidcXHUyMjU2JywnZWNpcmMnOidcXHhFQScsJ0VjaXJjJzonXFx4Q0EnLCdlY29sb24nOidcXHUyMjU1JywnZWN5JzonXFx1MDQ0RCcsJ0VjeSc6J1xcdTA0MkQnLCdlRERvdCc6J1xcdTJBNzcnLCdlZG90JzonXFx1MDExNycsJ2VEb3QnOidcXHUyMjUxJywnRWRvdCc6J1xcdTAxMTYnLCdlZSc6J1xcdTIxNDcnLCdlZkRvdCc6J1xcdTIyNTInLCdlZnInOidcXHVEODM1XFx1REQyMicsJ0Vmcic6J1xcdUQ4MzVcXHVERDA4JywnZWcnOidcXHUyQTlBJywnZWdyYXZlJzonXFx4RTgnLCdFZ3JhdmUnOidcXHhDOCcsJ2Vncyc6J1xcdTJBOTYnLCdlZ3Nkb3QnOidcXHUyQTk4JywnZWwnOidcXHUyQTk5JywnRWxlbWVudCc6J1xcdTIyMDgnLCdlbGludGVycyc6J1xcdTIzRTcnLCdlbGwnOidcXHUyMTEzJywnZWxzJzonXFx1MkE5NScsJ2Vsc2RvdCc6J1xcdTJBOTcnLCdlbWFjcic6J1xcdTAxMTMnLCdFbWFjcic6J1xcdTAxMTInLCdlbXB0eSc6J1xcdTIyMDUnLCdlbXB0eXNldCc6J1xcdTIyMDUnLCdFbXB0eVNtYWxsU3F1YXJlJzonXFx1MjVGQicsJ2VtcHR5dic6J1xcdTIyMDUnLCdFbXB0eVZlcnlTbWFsbFNxdWFyZSc6J1xcdTI1QUInLCdlbXNwJzonXFx1MjAwMycsJ2Vtc3AxMyc6J1xcdTIwMDQnLCdlbXNwMTQnOidcXHUyMDA1JywnZW5nJzonXFx1MDE0QicsJ0VORyc6J1xcdTAxNEEnLCdlbnNwJzonXFx1MjAwMicsJ2VvZ29uJzonXFx1MDExOScsJ0VvZ29uJzonXFx1MDExOCcsJ2VvcGYnOidcXHVEODM1XFx1REQ1NicsJ0VvcGYnOidcXHVEODM1XFx1REQzQycsJ2VwYXInOidcXHUyMkQ1JywnZXBhcnNsJzonXFx1MjlFMycsJ2VwbHVzJzonXFx1MkE3MScsJ2Vwc2knOidcXHUwM0I1JywnZXBzaWxvbic6J1xcdTAzQjUnLCdFcHNpbG9uJzonXFx1MDM5NScsJ2Vwc2l2JzonXFx1MDNGNScsJ2VxY2lyYyc6J1xcdTIyNTYnLCdlcWNvbG9uJzonXFx1MjI1NScsJ2Vxc2ltJzonXFx1MjI0MicsJ2Vxc2xhbnRndHInOidcXHUyQTk2JywnZXFzbGFudGxlc3MnOidcXHUyQTk1JywnRXF1YWwnOidcXHUyQTc1JywnZXF1YWxzJzonPScsJ0VxdWFsVGlsZGUnOidcXHUyMjQyJywnZXF1ZXN0JzonXFx1MjI1RicsJ0VxdWlsaWJyaXVtJzonXFx1MjFDQycsJ2VxdWl2JzonXFx1MjI2MScsJ2VxdWl2REQnOidcXHUyQTc4JywnZXF2cGFyc2wnOidcXHUyOUU1JywnZXJhcnInOidcXHUyOTcxJywnZXJEb3QnOidcXHUyMjUzJywnZXNjcic6J1xcdTIxMkYnLCdFc2NyJzonXFx1MjEzMCcsJ2VzZG90JzonXFx1MjI1MCcsJ2VzaW0nOidcXHUyMjQyJywnRXNpbSc6J1xcdTJBNzMnLCdldGEnOidcXHUwM0I3JywnRXRhJzonXFx1MDM5NycsJ2V0aCc6J1xceEYwJywnRVRIJzonXFx4RDAnLCdldW1sJzonXFx4RUInLCdFdW1sJzonXFx4Q0InLCdldXJvJzonXFx1MjBBQycsJ2V4Y2wnOichJywnZXhpc3QnOidcXHUyMjAzJywnRXhpc3RzJzonXFx1MjIwMycsJ2V4cGVjdGF0aW9uJzonXFx1MjEzMCcsJ2V4cG9uZW50aWFsZSc6J1xcdTIxNDcnLCdFeHBvbmVudGlhbEUnOidcXHUyMTQ3JywnZmFsbGluZ2RvdHNlcSc6J1xcdTIyNTInLCdmY3knOidcXHUwNDQ0JywnRmN5JzonXFx1MDQyNCcsJ2ZlbWFsZSc6J1xcdTI2NDAnLCdmZmlsaWcnOidcXHVGQjAzJywnZmZsaWcnOidcXHVGQjAwJywnZmZsbGlnJzonXFx1RkIwNCcsJ2Zmcic6J1xcdUQ4MzVcXHVERDIzJywnRmZyJzonXFx1RDgzNVxcdUREMDknLCdmaWxpZyc6J1xcdUZCMDEnLCdGaWxsZWRTbWFsbFNxdWFyZSc6J1xcdTI1RkMnLCdGaWxsZWRWZXJ5U21hbGxTcXVhcmUnOidcXHUyNUFBJywnZmpsaWcnOidmaicsJ2ZsYXQnOidcXHUyNjZEJywnZmxsaWcnOidcXHVGQjAyJywnZmx0bnMnOidcXHUyNUIxJywnZm5vZic6J1xcdTAxOTInLCdmb3BmJzonXFx1RDgzNVxcdURENTcnLCdGb3BmJzonXFx1RDgzNVxcdUREM0QnLCdmb3JhbGwnOidcXHUyMjAwJywnRm9yQWxsJzonXFx1MjIwMCcsJ2ZvcmsnOidcXHUyMkQ0JywnZm9ya3YnOidcXHUyQUQ5JywnRm91cmllcnRyZic6J1xcdTIxMzEnLCdmcGFydGludCc6J1xcdTJBMEQnLCdmcmFjMTInOidcXHhCRCcsJ2ZyYWMxMyc6J1xcdTIxNTMnLCdmcmFjMTQnOidcXHhCQycsJ2ZyYWMxNSc6J1xcdTIxNTUnLCdmcmFjMTYnOidcXHUyMTU5JywnZnJhYzE4JzonXFx1MjE1QicsJ2ZyYWMyMyc6J1xcdTIxNTQnLCdmcmFjMjUnOidcXHUyMTU2JywnZnJhYzM0JzonXFx4QkUnLCdmcmFjMzUnOidcXHUyMTU3JywnZnJhYzM4JzonXFx1MjE1QycsJ2ZyYWM0NSc6J1xcdTIxNTgnLCdmcmFjNTYnOidcXHUyMTVBJywnZnJhYzU4JzonXFx1MjE1RCcsJ2ZyYWM3OCc6J1xcdTIxNUUnLCdmcmFzbCc6J1xcdTIwNDQnLCdmcm93bic6J1xcdTIzMjInLCdmc2NyJzonXFx1RDgzNVxcdURDQkInLCdGc2NyJzonXFx1MjEzMScsJ2dhY3V0ZSc6J1xcdTAxRjUnLCdnYW1tYSc6J1xcdTAzQjMnLCdHYW1tYSc6J1xcdTAzOTMnLCdnYW1tYWQnOidcXHUwM0REJywnR2FtbWFkJzonXFx1MDNEQycsJ2dhcCc6J1xcdTJBODYnLCdnYnJldmUnOidcXHUwMTFGJywnR2JyZXZlJzonXFx1MDExRScsJ0djZWRpbCc6J1xcdTAxMjInLCdnY2lyYyc6J1xcdTAxMUQnLCdHY2lyYyc6J1xcdTAxMUMnLCdnY3knOidcXHUwNDMzJywnR2N5JzonXFx1MDQxMycsJ2dkb3QnOidcXHUwMTIxJywnR2RvdCc6J1xcdTAxMjAnLCdnZSc6J1xcdTIyNjUnLCdnRSc6J1xcdTIyNjcnLCdnZWwnOidcXHUyMkRCJywnZ0VsJzonXFx1MkE4QycsJ2dlcSc6J1xcdTIyNjUnLCdnZXFxJzonXFx1MjI2NycsJ2dlcXNsYW50JzonXFx1MkE3RScsJ2dlcyc6J1xcdTJBN0UnLCdnZXNjYyc6J1xcdTJBQTknLCdnZXNkb3QnOidcXHUyQTgwJywnZ2VzZG90byc6J1xcdTJBODInLCdnZXNkb3RvbCc6J1xcdTJBODQnLCdnZXNsJzonXFx1MjJEQlxcdUZFMDAnLCdnZXNsZXMnOidcXHUyQTk0JywnZ2ZyJzonXFx1RDgzNVxcdUREMjQnLCdHZnInOidcXHVEODM1XFx1REQwQScsJ2dnJzonXFx1MjI2QicsJ0dnJzonXFx1MjJEOScsJ2dnZyc6J1xcdTIyRDknLCdnaW1lbCc6J1xcdTIxMzcnLCdnamN5JzonXFx1MDQ1MycsJ0dKY3knOidcXHUwNDAzJywnZ2wnOidcXHUyMjc3JywnZ2xhJzonXFx1MkFBNScsJ2dsRSc6J1xcdTJBOTInLCdnbGonOidcXHUyQUE0JywnZ25hcCc6J1xcdTJBOEEnLCdnbmFwcHJveCc6J1xcdTJBOEEnLCdnbmUnOidcXHUyQTg4JywnZ25FJzonXFx1MjI2OScsJ2duZXEnOidcXHUyQTg4JywnZ25lcXEnOidcXHUyMjY5JywnZ25zaW0nOidcXHUyMkU3JywnZ29wZic6J1xcdUQ4MzVcXHVERDU4JywnR29wZic6J1xcdUQ4MzVcXHVERDNFJywnZ3JhdmUnOidgJywnR3JlYXRlckVxdWFsJzonXFx1MjI2NScsJ0dyZWF0ZXJFcXVhbExlc3MnOidcXHUyMkRCJywnR3JlYXRlckZ1bGxFcXVhbCc6J1xcdTIyNjcnLCdHcmVhdGVyR3JlYXRlcic6J1xcdTJBQTInLCdHcmVhdGVyTGVzcyc6J1xcdTIyNzcnLCdHcmVhdGVyU2xhbnRFcXVhbCc6J1xcdTJBN0UnLCdHcmVhdGVyVGlsZGUnOidcXHUyMjczJywnZ3Njcic6J1xcdTIxMEEnLCdHc2NyJzonXFx1RDgzNVxcdURDQTInLCdnc2ltJzonXFx1MjI3MycsJ2dzaW1lJzonXFx1MkE4RScsJ2dzaW1sJzonXFx1MkE5MCcsJ2d0JzonPicsJ0d0JzonXFx1MjI2QicsJ0dUJzonPicsJ2d0Y2MnOidcXHUyQUE3JywnZ3RjaXInOidcXHUyQTdBJywnZ3Rkb3QnOidcXHUyMkQ3JywnZ3RsUGFyJzonXFx1Mjk5NScsJ2d0cXVlc3QnOidcXHUyQTdDJywnZ3RyYXBwcm94JzonXFx1MkE4NicsJ2d0cmFycic6J1xcdTI5NzgnLCdndHJkb3QnOidcXHUyMkQ3JywnZ3RyZXFsZXNzJzonXFx1MjJEQicsJ2d0cmVxcWxlc3MnOidcXHUyQThDJywnZ3RybGVzcyc6J1xcdTIyNzcnLCdndHJzaW0nOidcXHUyMjczJywnZ3ZlcnRuZXFxJzonXFx1MjI2OVxcdUZFMDAnLCdndm5FJzonXFx1MjI2OVxcdUZFMDAnLCdIYWNlayc6J1xcdTAyQzcnLCdoYWlyc3AnOidcXHUyMDBBJywnaGFsZic6J1xceEJEJywnaGFtaWx0JzonXFx1MjEwQicsJ2hhcmRjeSc6J1xcdTA0NEEnLCdIQVJEY3knOidcXHUwNDJBJywnaGFycic6J1xcdTIxOTQnLCdoQXJyJzonXFx1MjFENCcsJ2hhcnJjaXInOidcXHUyOTQ4JywnaGFycncnOidcXHUyMUFEJywnSGF0JzonXicsJ2hiYXInOidcXHUyMTBGJywnaGNpcmMnOidcXHUwMTI1JywnSGNpcmMnOidcXHUwMTI0JywnaGVhcnRzJzonXFx1MjY2NScsJ2hlYXJ0c3VpdCc6J1xcdTI2NjUnLCdoZWxsaXAnOidcXHUyMDI2JywnaGVyY29uJzonXFx1MjJCOScsJ2hmcic6J1xcdUQ4MzVcXHVERDI1JywnSGZyJzonXFx1MjEwQycsJ0hpbGJlcnRTcGFjZSc6J1xcdTIxMEInLCdoa3NlYXJvdyc6J1xcdTI5MjUnLCdoa3N3YXJvdyc6J1xcdTI5MjYnLCdob2Fycic6J1xcdTIxRkYnLCdob210aHQnOidcXHUyMjNCJywnaG9va2xlZnRhcnJvdyc6J1xcdTIxQTknLCdob29rcmlnaHRhcnJvdyc6J1xcdTIxQUEnLCdob3BmJzonXFx1RDgzNVxcdURENTknLCdIb3BmJzonXFx1MjEwRCcsJ2hvcmJhcic6J1xcdTIwMTUnLCdIb3Jpem9udGFsTGluZSc6J1xcdTI1MDAnLCdoc2NyJzonXFx1RDgzNVxcdURDQkQnLCdIc2NyJzonXFx1MjEwQicsJ2hzbGFzaCc6J1xcdTIxMEYnLCdoc3Ryb2snOidcXHUwMTI3JywnSHN0cm9rJzonXFx1MDEyNicsJ0h1bXBEb3duSHVtcCc6J1xcdTIyNEUnLCdIdW1wRXF1YWwnOidcXHUyMjRGJywnaHlidWxsJzonXFx1MjA0MycsJ2h5cGhlbic6J1xcdTIwMTAnLCdpYWN1dGUnOidcXHhFRCcsJ0lhY3V0ZSc6J1xceENEJywnaWMnOidcXHUyMDYzJywnaWNpcmMnOidcXHhFRScsJ0ljaXJjJzonXFx4Q0UnLCdpY3knOidcXHUwNDM4JywnSWN5JzonXFx1MDQxOCcsJ0lkb3QnOidcXHUwMTMwJywnaWVjeSc6J1xcdTA0MzUnLCdJRWN5JzonXFx1MDQxNScsJ2lleGNsJzonXFx4QTEnLCdpZmYnOidcXHUyMUQ0JywnaWZyJzonXFx1RDgzNVxcdUREMjYnLCdJZnInOidcXHUyMTExJywnaWdyYXZlJzonXFx4RUMnLCdJZ3JhdmUnOidcXHhDQycsJ2lpJzonXFx1MjE0OCcsJ2lpaWludCc6J1xcdTJBMEMnLCdpaWludCc6J1xcdTIyMkQnLCdpaW5maW4nOidcXHUyOURDJywnaWlvdGEnOidcXHUyMTI5JywnaWpsaWcnOidcXHUwMTMzJywnSUpsaWcnOidcXHUwMTMyJywnSW0nOidcXHUyMTExJywnaW1hY3InOidcXHUwMTJCJywnSW1hY3InOidcXHUwMTJBJywnaW1hZ2UnOidcXHUyMTExJywnSW1hZ2luYXJ5SSc6J1xcdTIxNDgnLCdpbWFnbGluZSc6J1xcdTIxMTAnLCdpbWFncGFydCc6J1xcdTIxMTEnLCdpbWF0aCc6J1xcdTAxMzEnLCdpbW9mJzonXFx1MjJCNycsJ2ltcGVkJzonXFx1MDFCNScsJ0ltcGxpZXMnOidcXHUyMUQyJywnaW4nOidcXHUyMjA4JywnaW5jYXJlJzonXFx1MjEwNScsJ2luZmluJzonXFx1MjIxRScsJ2luZmludGllJzonXFx1MjlERCcsJ2lub2RvdCc6J1xcdTAxMzEnLCdpbnQnOidcXHUyMjJCJywnSW50JzonXFx1MjIyQycsJ2ludGNhbCc6J1xcdTIyQkEnLCdpbnRlZ2Vycyc6J1xcdTIxMjQnLCdJbnRlZ3JhbCc6J1xcdTIyMkInLCdpbnRlcmNhbCc6J1xcdTIyQkEnLCdJbnRlcnNlY3Rpb24nOidcXHUyMkMyJywnaW50bGFyaGsnOidcXHUyQTE3JywnaW50cHJvZCc6J1xcdTJBM0MnLCdJbnZpc2libGVDb21tYSc6J1xcdTIwNjMnLCdJbnZpc2libGVUaW1lcyc6J1xcdTIwNjInLCdpb2N5JzonXFx1MDQ1MScsJ0lPY3knOidcXHUwNDAxJywnaW9nb24nOidcXHUwMTJGJywnSW9nb24nOidcXHUwMTJFJywnaW9wZic6J1xcdUQ4MzVcXHVERDVBJywnSW9wZic6J1xcdUQ4MzVcXHVERDQwJywnaW90YSc6J1xcdTAzQjknLCdJb3RhJzonXFx1MDM5OScsJ2lwcm9kJzonXFx1MkEzQycsJ2lxdWVzdCc6J1xceEJGJywnaXNjcic6J1xcdUQ4MzVcXHVEQ0JFJywnSXNjcic6J1xcdTIxMTAnLCdpc2luJzonXFx1MjIwOCcsJ2lzaW5kb3QnOidcXHUyMkY1JywnaXNpbkUnOidcXHUyMkY5JywnaXNpbnMnOidcXHUyMkY0JywnaXNpbnN2JzonXFx1MjJGMycsJ2lzaW52JzonXFx1MjIwOCcsJ2l0JzonXFx1MjA2MicsJ2l0aWxkZSc6J1xcdTAxMjknLCdJdGlsZGUnOidcXHUwMTI4JywnaXVrY3knOidcXHUwNDU2JywnSXVrY3knOidcXHUwNDA2JywnaXVtbCc6J1xceEVGJywnSXVtbCc6J1xceENGJywnamNpcmMnOidcXHUwMTM1JywnSmNpcmMnOidcXHUwMTM0JywnamN5JzonXFx1MDQzOScsJ0pjeSc6J1xcdTA0MTknLCdqZnInOidcXHVEODM1XFx1REQyNycsJ0pmcic6J1xcdUQ4MzVcXHVERDBEJywnam1hdGgnOidcXHUwMjM3Jywnam9wZic6J1xcdUQ4MzVcXHVERDVCJywnSm9wZic6J1xcdUQ4MzVcXHVERDQxJywnanNjcic6J1xcdUQ4MzVcXHVEQ0JGJywnSnNjcic6J1xcdUQ4MzVcXHVEQ0E1JywnanNlcmN5JzonXFx1MDQ1OCcsJ0pzZXJjeSc6J1xcdTA0MDgnLCdqdWtjeSc6J1xcdTA0NTQnLCdKdWtjeSc6J1xcdTA0MDQnLCdrYXBwYSc6J1xcdTAzQkEnLCdLYXBwYSc6J1xcdTAzOUEnLCdrYXBwYXYnOidcXHUwM0YwJywna2NlZGlsJzonXFx1MDEzNycsJ0tjZWRpbCc6J1xcdTAxMzYnLCdrY3knOidcXHUwNDNBJywnS2N5JzonXFx1MDQxQScsJ2tmcic6J1xcdUQ4MzVcXHVERDI4JywnS2ZyJzonXFx1RDgzNVxcdUREMEUnLCdrZ3JlZW4nOidcXHUwMTM4Jywna2hjeSc6J1xcdTA0NDUnLCdLSGN5JzonXFx1MDQyNScsJ2tqY3knOidcXHUwNDVDJywnS0pjeSc6J1xcdTA0MEMnLCdrb3BmJzonXFx1RDgzNVxcdURENUMnLCdLb3BmJzonXFx1RDgzNVxcdURENDInLCdrc2NyJzonXFx1RDgzNVxcdURDQzAnLCdLc2NyJzonXFx1RDgzNVxcdURDQTYnLCdsQWFycic6J1xcdTIxREEnLCdsYWN1dGUnOidcXHUwMTNBJywnTGFjdXRlJzonXFx1MDEzOScsJ2xhZW1wdHl2JzonXFx1MjlCNCcsJ2xhZ3Jhbic6J1xcdTIxMTInLCdsYW1iZGEnOidcXHUwM0JCJywnTGFtYmRhJzonXFx1MDM5QicsJ2xhbmcnOidcXHUyN0U4JywnTGFuZyc6J1xcdTI3RUEnLCdsYW5nZCc6J1xcdTI5OTEnLCdsYW5nbGUnOidcXHUyN0U4JywnbGFwJzonXFx1MkE4NScsJ0xhcGxhY2V0cmYnOidcXHUyMTEyJywnbGFxdW8nOidcXHhBQicsJ2xhcnInOidcXHUyMTkwJywnbEFycic6J1xcdTIxRDAnLCdMYXJyJzonXFx1MjE5RScsJ2xhcnJiJzonXFx1MjFFNCcsJ2xhcnJiZnMnOidcXHUyOTFGJywnbGFycmZzJzonXFx1MjkxRCcsJ2xhcnJoayc6J1xcdTIxQTknLCdsYXJybHAnOidcXHUyMUFCJywnbGFycnBsJzonXFx1MjkzOScsJ2xhcnJzaW0nOidcXHUyOTczJywnbGFycnRsJzonXFx1MjFBMicsJ2xhdCc6J1xcdTJBQUInLCdsYXRhaWwnOidcXHUyOTE5JywnbEF0YWlsJzonXFx1MjkxQicsJ2xhdGUnOidcXHUyQUFEJywnbGF0ZXMnOidcXHUyQUFEXFx1RkUwMCcsJ2xiYXJyJzonXFx1MjkwQycsJ2xCYXJyJzonXFx1MjkwRScsJ2xiYnJrJzonXFx1Mjc3MicsJ2xicmFjZSc6J3snLCdsYnJhY2snOidbJywnbGJya2UnOidcXHUyOThCJywnbGJya3NsZCc6J1xcdTI5OEYnLCdsYnJrc2x1JzonXFx1Mjk4RCcsJ2xjYXJvbic6J1xcdTAxM0UnLCdMY2Fyb24nOidcXHUwMTNEJywnbGNlZGlsJzonXFx1MDEzQycsJ0xjZWRpbCc6J1xcdTAxM0InLCdsY2VpbCc6J1xcdTIzMDgnLCdsY3ViJzoneycsJ2xjeSc6J1xcdTA0M0InLCdMY3knOidcXHUwNDFCJywnbGRjYSc6J1xcdTI5MzYnLCdsZHF1byc6J1xcdTIwMUMnLCdsZHF1b3InOidcXHUyMDFFJywnbGRyZGhhcic6J1xcdTI5NjcnLCdsZHJ1c2hhcic6J1xcdTI5NEInLCdsZHNoJzonXFx1MjFCMicsJ2xlJzonXFx1MjI2NCcsJ2xFJzonXFx1MjI2NicsJ0xlZnRBbmdsZUJyYWNrZXQnOidcXHUyN0U4JywnbGVmdGFycm93JzonXFx1MjE5MCcsJ0xlZnRhcnJvdyc6J1xcdTIxRDAnLCdMZWZ0QXJyb3cnOidcXHUyMTkwJywnTGVmdEFycm93QmFyJzonXFx1MjFFNCcsJ0xlZnRBcnJvd1JpZ2h0QXJyb3cnOidcXHUyMUM2JywnbGVmdGFycm93dGFpbCc6J1xcdTIxQTInLCdMZWZ0Q2VpbGluZyc6J1xcdTIzMDgnLCdMZWZ0RG91YmxlQnJhY2tldCc6J1xcdTI3RTYnLCdMZWZ0RG93blRlZVZlY3Rvcic6J1xcdTI5NjEnLCdMZWZ0RG93blZlY3Rvcic6J1xcdTIxQzMnLCdMZWZ0RG93blZlY3RvckJhcic6J1xcdTI5NTknLCdMZWZ0Rmxvb3InOidcXHUyMzBBJywnbGVmdGhhcnBvb25kb3duJzonXFx1MjFCRCcsJ2xlZnRoYXJwb29udXAnOidcXHUyMUJDJywnbGVmdGxlZnRhcnJvd3MnOidcXHUyMUM3JywnbGVmdHJpZ2h0YXJyb3cnOidcXHUyMTk0JywnTGVmdHJpZ2h0YXJyb3cnOidcXHUyMUQ0JywnTGVmdFJpZ2h0QXJyb3cnOidcXHUyMTk0JywnbGVmdHJpZ2h0YXJyb3dzJzonXFx1MjFDNicsJ2xlZnRyaWdodGhhcnBvb25zJzonXFx1MjFDQicsJ2xlZnRyaWdodHNxdWlnYXJyb3cnOidcXHUyMUFEJywnTGVmdFJpZ2h0VmVjdG9yJzonXFx1Mjk0RScsJ0xlZnRUZWUnOidcXHUyMkEzJywnTGVmdFRlZUFycm93JzonXFx1MjFBNCcsJ0xlZnRUZWVWZWN0b3InOidcXHUyOTVBJywnbGVmdHRocmVldGltZXMnOidcXHUyMkNCJywnTGVmdFRyaWFuZ2xlJzonXFx1MjJCMicsJ0xlZnRUcmlhbmdsZUJhcic6J1xcdTI5Q0YnLCdMZWZ0VHJpYW5nbGVFcXVhbCc6J1xcdTIyQjQnLCdMZWZ0VXBEb3duVmVjdG9yJzonXFx1Mjk1MScsJ0xlZnRVcFRlZVZlY3Rvcic6J1xcdTI5NjAnLCdMZWZ0VXBWZWN0b3InOidcXHUyMUJGJywnTGVmdFVwVmVjdG9yQmFyJzonXFx1Mjk1OCcsJ0xlZnRWZWN0b3InOidcXHUyMUJDJywnTGVmdFZlY3RvckJhcic6J1xcdTI5NTInLCdsZWcnOidcXHUyMkRBJywnbEVnJzonXFx1MkE4QicsJ2xlcSc6J1xcdTIyNjQnLCdsZXFxJzonXFx1MjI2NicsJ2xlcXNsYW50JzonXFx1MkE3RCcsJ2xlcyc6J1xcdTJBN0QnLCdsZXNjYyc6J1xcdTJBQTgnLCdsZXNkb3QnOidcXHUyQTdGJywnbGVzZG90byc6J1xcdTJBODEnLCdsZXNkb3Rvcic6J1xcdTJBODMnLCdsZXNnJzonXFx1MjJEQVxcdUZFMDAnLCdsZXNnZXMnOidcXHUyQTkzJywnbGVzc2FwcHJveCc6J1xcdTJBODUnLCdsZXNzZG90JzonXFx1MjJENicsJ2xlc3NlcWd0cic6J1xcdTIyREEnLCdsZXNzZXFxZ3RyJzonXFx1MkE4QicsJ0xlc3NFcXVhbEdyZWF0ZXInOidcXHUyMkRBJywnTGVzc0Z1bGxFcXVhbCc6J1xcdTIyNjYnLCdMZXNzR3JlYXRlcic6J1xcdTIyNzYnLCdsZXNzZ3RyJzonXFx1MjI3NicsJ0xlc3NMZXNzJzonXFx1MkFBMScsJ2xlc3NzaW0nOidcXHUyMjcyJywnTGVzc1NsYW50RXF1YWwnOidcXHUyQTdEJywnTGVzc1RpbGRlJzonXFx1MjI3MicsJ2xmaXNodCc6J1xcdTI5N0MnLCdsZmxvb3InOidcXHUyMzBBJywnbGZyJzonXFx1RDgzNVxcdUREMjknLCdMZnInOidcXHVEODM1XFx1REQwRicsJ2xnJzonXFx1MjI3NicsJ2xnRSc6J1xcdTJBOTEnLCdsSGFyJzonXFx1Mjk2MicsJ2xoYXJkJzonXFx1MjFCRCcsJ2xoYXJ1JzonXFx1MjFCQycsJ2xoYXJ1bCc6J1xcdTI5NkEnLCdsaGJsayc6J1xcdTI1ODQnLCdsamN5JzonXFx1MDQ1OScsJ0xKY3knOidcXHUwNDA5JywnbGwnOidcXHUyMjZBJywnTGwnOidcXHUyMkQ4JywnbGxhcnInOidcXHUyMUM3JywnbGxjb3JuZXInOidcXHUyMzFFJywnTGxlZnRhcnJvdyc6J1xcdTIxREEnLCdsbGhhcmQnOidcXHUyOTZCJywnbGx0cmknOidcXHUyNUZBJywnbG1pZG90JzonXFx1MDE0MCcsJ0xtaWRvdCc6J1xcdTAxM0YnLCdsbW91c3QnOidcXHUyM0IwJywnbG1vdXN0YWNoZSc6J1xcdTIzQjAnLCdsbmFwJzonXFx1MkE4OScsJ2xuYXBwcm94JzonXFx1MkE4OScsJ2xuZSc6J1xcdTJBODcnLCdsbkUnOidcXHUyMjY4JywnbG5lcSc6J1xcdTJBODcnLCdsbmVxcSc6J1xcdTIyNjgnLCdsbnNpbSc6J1xcdTIyRTYnLCdsb2FuZyc6J1xcdTI3RUMnLCdsb2Fycic6J1xcdTIxRkQnLCdsb2Jyayc6J1xcdTI3RTYnLCdsb25nbGVmdGFycm93JzonXFx1MjdGNScsJ0xvbmdsZWZ0YXJyb3cnOidcXHUyN0Y4JywnTG9uZ0xlZnRBcnJvdyc6J1xcdTI3RjUnLCdsb25nbGVmdHJpZ2h0YXJyb3cnOidcXHUyN0Y3JywnTG9uZ2xlZnRyaWdodGFycm93JzonXFx1MjdGQScsJ0xvbmdMZWZ0UmlnaHRBcnJvdyc6J1xcdTI3RjcnLCdsb25nbWFwc3RvJzonXFx1MjdGQycsJ2xvbmdyaWdodGFycm93JzonXFx1MjdGNicsJ0xvbmdyaWdodGFycm93JzonXFx1MjdGOScsJ0xvbmdSaWdodEFycm93JzonXFx1MjdGNicsJ2xvb3BhcnJvd2xlZnQnOidcXHUyMUFCJywnbG9vcGFycm93cmlnaHQnOidcXHUyMUFDJywnbG9wYXInOidcXHUyOTg1JywnbG9wZic6J1xcdUQ4MzVcXHVERDVEJywnTG9wZic6J1xcdUQ4MzVcXHVERDQzJywnbG9wbHVzJzonXFx1MkEyRCcsJ2xvdGltZXMnOidcXHUyQTM0JywnbG93YXN0JzonXFx1MjIxNycsJ2xvd2Jhcic6J18nLCdMb3dlckxlZnRBcnJvdyc6J1xcdTIxOTknLCdMb3dlclJpZ2h0QXJyb3cnOidcXHUyMTk4JywnbG96JzonXFx1MjVDQScsJ2xvemVuZ2UnOidcXHUyNUNBJywnbG96Zic6J1xcdTI5RUInLCdscGFyJzonKCcsJ2xwYXJsdCc6J1xcdTI5OTMnLCdscmFycic6J1xcdTIxQzYnLCdscmNvcm5lcic6J1xcdTIzMUYnLCdscmhhcic6J1xcdTIxQ0InLCdscmhhcmQnOidcXHUyOTZEJywnbHJtJzonXFx1MjAwRScsJ2xydHJpJzonXFx1MjJCRicsJ2xzYXF1byc6J1xcdTIwMzknLCdsc2NyJzonXFx1RDgzNVxcdURDQzEnLCdMc2NyJzonXFx1MjExMicsJ2xzaCc6J1xcdTIxQjAnLCdMc2gnOidcXHUyMUIwJywnbHNpbSc6J1xcdTIyNzInLCdsc2ltZSc6J1xcdTJBOEQnLCdsc2ltZyc6J1xcdTJBOEYnLCdsc3FiJzonWycsJ2xzcXVvJzonXFx1MjAxOCcsJ2xzcXVvcic6J1xcdTIwMUEnLCdsc3Ryb2snOidcXHUwMTQyJywnTHN0cm9rJzonXFx1MDE0MScsJ2x0JzonPCcsJ0x0JzonXFx1MjI2QScsJ0xUJzonPCcsJ2x0Y2MnOidcXHUyQUE2JywnbHRjaXInOidcXHUyQTc5JywnbHRkb3QnOidcXHUyMkQ2JywnbHRocmVlJzonXFx1MjJDQicsJ2x0aW1lcyc6J1xcdTIyQzknLCdsdGxhcnInOidcXHUyOTc2JywnbHRxdWVzdCc6J1xcdTJBN0InLCdsdHJpJzonXFx1MjVDMycsJ2x0cmllJzonXFx1MjJCNCcsJ2x0cmlmJzonXFx1MjVDMicsJ2x0clBhcic6J1xcdTI5OTYnLCdsdXJkc2hhcic6J1xcdTI5NEEnLCdsdXJ1aGFyJzonXFx1Mjk2NicsJ2x2ZXJ0bmVxcSc6J1xcdTIyNjhcXHVGRTAwJywnbHZuRSc6J1xcdTIyNjhcXHVGRTAwJywnbWFjcic6J1xceEFGJywnbWFsZSc6J1xcdTI2NDInLCdtYWx0JzonXFx1MjcyMCcsJ21hbHRlc2UnOidcXHUyNzIwJywnbWFwJzonXFx1MjFBNicsJ01hcCc6J1xcdTI5MDUnLCdtYXBzdG8nOidcXHUyMUE2JywnbWFwc3RvZG93bic6J1xcdTIxQTcnLCdtYXBzdG9sZWZ0JzonXFx1MjFBNCcsJ21hcHN0b3VwJzonXFx1MjFBNScsJ21hcmtlcic6J1xcdTI1QUUnLCdtY29tbWEnOidcXHUyQTI5JywnbWN5JzonXFx1MDQzQycsJ01jeSc6J1xcdTA0MUMnLCdtZGFzaCc6J1xcdTIwMTQnLCdtRERvdCc6J1xcdTIyM0EnLCdtZWFzdXJlZGFuZ2xlJzonXFx1MjIyMScsJ01lZGl1bVNwYWNlJzonXFx1MjA1RicsJ01lbGxpbnRyZic6J1xcdTIxMzMnLCdtZnInOidcXHVEODM1XFx1REQyQScsJ01mcic6J1xcdUQ4MzVcXHVERDEwJywnbWhvJzonXFx1MjEyNycsJ21pY3JvJzonXFx4QjUnLCdtaWQnOidcXHUyMjIzJywnbWlkYXN0JzonKicsJ21pZGNpcic6J1xcdTJBRjAnLCdtaWRkb3QnOidcXHhCNycsJ21pbnVzJzonXFx1MjIxMicsJ21pbnVzYic6J1xcdTIyOUYnLCdtaW51c2QnOidcXHUyMjM4JywnbWludXNkdSc6J1xcdTJBMkEnLCdNaW51c1BsdXMnOidcXHUyMjEzJywnbWxjcCc6J1xcdTJBREInLCdtbGRyJzonXFx1MjAyNicsJ21ucGx1cyc6J1xcdTIyMTMnLCdtb2RlbHMnOidcXHUyMkE3JywnbW9wZic6J1xcdUQ4MzVcXHVERDVFJywnTW9wZic6J1xcdUQ4MzVcXHVERDQ0JywnbXAnOidcXHUyMjEzJywnbXNjcic6J1xcdUQ4MzVcXHVEQ0MyJywnTXNjcic6J1xcdTIxMzMnLCdtc3Rwb3MnOidcXHUyMjNFJywnbXUnOidcXHUwM0JDJywnTXUnOidcXHUwMzlDJywnbXVsdGltYXAnOidcXHUyMkI4JywnbXVtYXAnOidcXHUyMkI4JywnbmFibGEnOidcXHUyMjA3JywnbmFjdXRlJzonXFx1MDE0NCcsJ05hY3V0ZSc6J1xcdTAxNDMnLCduYW5nJzonXFx1MjIyMFxcdTIwRDInLCduYXAnOidcXHUyMjQ5JywnbmFwRSc6J1xcdTJBNzBcXHUwMzM4JywnbmFwaWQnOidcXHUyMjRCXFx1MDMzOCcsJ25hcG9zJzonXFx1MDE0OScsJ25hcHByb3gnOidcXHUyMjQ5JywnbmF0dXInOidcXHUyNjZFJywnbmF0dXJhbCc6J1xcdTI2NkUnLCduYXR1cmFscyc6J1xcdTIxMTUnLCduYnNwJzonXFx4QTAnLCduYnVtcCc6J1xcdTIyNEVcXHUwMzM4JywnbmJ1bXBlJzonXFx1MjI0RlxcdTAzMzgnLCduY2FwJzonXFx1MkE0MycsJ25jYXJvbic6J1xcdTAxNDgnLCdOY2Fyb24nOidcXHUwMTQ3JywnbmNlZGlsJzonXFx1MDE0NicsJ05jZWRpbCc6J1xcdTAxNDUnLCduY29uZyc6J1xcdTIyNDcnLCduY29uZ2RvdCc6J1xcdTJBNkRcXHUwMzM4JywnbmN1cCc6J1xcdTJBNDInLCduY3knOidcXHUwNDNEJywnTmN5JzonXFx1MDQxRCcsJ25kYXNoJzonXFx1MjAxMycsJ25lJzonXFx1MjI2MCcsJ25lYXJoayc6J1xcdTI5MjQnLCduZWFycic6J1xcdTIxOTcnLCduZUFycic6J1xcdTIxRDcnLCduZWFycm93JzonXFx1MjE5NycsJ25lZG90JzonXFx1MjI1MFxcdTAzMzgnLCdOZWdhdGl2ZU1lZGl1bVNwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVGhpY2tTcGFjZSc6J1xcdTIwMEInLCdOZWdhdGl2ZVRoaW5TcGFjZSc6J1xcdTIwMEInLCdOZWdhdGl2ZVZlcnlUaGluU3BhY2UnOidcXHUyMDBCJywnbmVxdWl2JzonXFx1MjI2MicsJ25lc2Vhcic6J1xcdTI5MjgnLCduZXNpbSc6J1xcdTIyNDJcXHUwMzM4JywnTmVzdGVkR3JlYXRlckdyZWF0ZXInOidcXHUyMjZCJywnTmVzdGVkTGVzc0xlc3MnOidcXHUyMjZBJywnTmV3TGluZSc6J1xcbicsJ25leGlzdCc6J1xcdTIyMDQnLCduZXhpc3RzJzonXFx1MjIwNCcsJ25mcic6J1xcdUQ4MzVcXHVERDJCJywnTmZyJzonXFx1RDgzNVxcdUREMTEnLCduZ2UnOidcXHUyMjcxJywnbmdFJzonXFx1MjI2N1xcdTAzMzgnLCduZ2VxJzonXFx1MjI3MScsJ25nZXFxJzonXFx1MjI2N1xcdTAzMzgnLCduZ2Vxc2xhbnQnOidcXHUyQTdFXFx1MDMzOCcsJ25nZXMnOidcXHUyQTdFXFx1MDMzOCcsJ25HZyc6J1xcdTIyRDlcXHUwMzM4JywnbmdzaW0nOidcXHUyMjc1Jywnbmd0JzonXFx1MjI2RicsJ25HdCc6J1xcdTIyNkJcXHUyMEQyJywnbmd0cic6J1xcdTIyNkYnLCduR3R2JzonXFx1MjI2QlxcdTAzMzgnLCduaGFycic6J1xcdTIxQUUnLCduaEFycic6J1xcdTIxQ0UnLCduaHBhcic6J1xcdTJBRjInLCduaSc6J1xcdTIyMEInLCduaXMnOidcXHUyMkZDJywnbmlzZCc6J1xcdTIyRkEnLCduaXYnOidcXHUyMjBCJywnbmpjeSc6J1xcdTA0NUEnLCdOSmN5JzonXFx1MDQwQScsJ25sYXJyJzonXFx1MjE5QScsJ25sQXJyJzonXFx1MjFDRCcsJ25sZHInOidcXHUyMDI1JywnbmxlJzonXFx1MjI3MCcsJ25sRSc6J1xcdTIyNjZcXHUwMzM4JywnbmxlZnRhcnJvdyc6J1xcdTIxOUEnLCduTGVmdGFycm93JzonXFx1MjFDRCcsJ25sZWZ0cmlnaHRhcnJvdyc6J1xcdTIxQUUnLCduTGVmdHJpZ2h0YXJyb3cnOidcXHUyMUNFJywnbmxlcSc6J1xcdTIyNzAnLCdubGVxcSc6J1xcdTIyNjZcXHUwMzM4JywnbmxlcXNsYW50JzonXFx1MkE3RFxcdTAzMzgnLCdubGVzJzonXFx1MkE3RFxcdTAzMzgnLCdubGVzcyc6J1xcdTIyNkUnLCduTGwnOidcXHUyMkQ4XFx1MDMzOCcsJ25sc2ltJzonXFx1MjI3NCcsJ25sdCc6J1xcdTIyNkUnLCduTHQnOidcXHUyMjZBXFx1MjBEMicsJ25sdHJpJzonXFx1MjJFQScsJ25sdHJpZSc6J1xcdTIyRUMnLCduTHR2JzonXFx1MjI2QVxcdTAzMzgnLCdubWlkJzonXFx1MjIyNCcsJ05vQnJlYWsnOidcXHUyMDYwJywnTm9uQnJlYWtpbmdTcGFjZSc6J1xceEEwJywnbm9wZic6J1xcdUQ4MzVcXHVERDVGJywnTm9wZic6J1xcdTIxMTUnLCdub3QnOidcXHhBQycsJ05vdCc6J1xcdTJBRUMnLCdOb3RDb25ncnVlbnQnOidcXHUyMjYyJywnTm90Q3VwQ2FwJzonXFx1MjI2RCcsJ05vdERvdWJsZVZlcnRpY2FsQmFyJzonXFx1MjIyNicsJ05vdEVsZW1lbnQnOidcXHUyMjA5JywnTm90RXF1YWwnOidcXHUyMjYwJywnTm90RXF1YWxUaWxkZSc6J1xcdTIyNDJcXHUwMzM4JywnTm90RXhpc3RzJzonXFx1MjIwNCcsJ05vdEdyZWF0ZXInOidcXHUyMjZGJywnTm90R3JlYXRlckVxdWFsJzonXFx1MjI3MScsJ05vdEdyZWF0ZXJGdWxsRXF1YWwnOidcXHUyMjY3XFx1MDMzOCcsJ05vdEdyZWF0ZXJHcmVhdGVyJzonXFx1MjI2QlxcdTAzMzgnLCdOb3RHcmVhdGVyTGVzcyc6J1xcdTIyNzknLCdOb3RHcmVhdGVyU2xhbnRFcXVhbCc6J1xcdTJBN0VcXHUwMzM4JywnTm90R3JlYXRlclRpbGRlJzonXFx1MjI3NScsJ05vdEh1bXBEb3duSHVtcCc6J1xcdTIyNEVcXHUwMzM4JywnTm90SHVtcEVxdWFsJzonXFx1MjI0RlxcdTAzMzgnLCdub3Rpbic6J1xcdTIyMDknLCdub3RpbmRvdCc6J1xcdTIyRjVcXHUwMzM4Jywnbm90aW5FJzonXFx1MjJGOVxcdTAzMzgnLCdub3RpbnZhJzonXFx1MjIwOScsJ25vdGludmInOidcXHUyMkY3Jywnbm90aW52Yyc6J1xcdTIyRjYnLCdOb3RMZWZ0VHJpYW5nbGUnOidcXHUyMkVBJywnTm90TGVmdFRyaWFuZ2xlQmFyJzonXFx1MjlDRlxcdTAzMzgnLCdOb3RMZWZ0VHJpYW5nbGVFcXVhbCc6J1xcdTIyRUMnLCdOb3RMZXNzJzonXFx1MjI2RScsJ05vdExlc3NFcXVhbCc6J1xcdTIyNzAnLCdOb3RMZXNzR3JlYXRlcic6J1xcdTIyNzgnLCdOb3RMZXNzTGVzcyc6J1xcdTIyNkFcXHUwMzM4JywnTm90TGVzc1NsYW50RXF1YWwnOidcXHUyQTdEXFx1MDMzOCcsJ05vdExlc3NUaWxkZSc6J1xcdTIyNzQnLCdOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlcic6J1xcdTJBQTJcXHUwMzM4JywnTm90TmVzdGVkTGVzc0xlc3MnOidcXHUyQUExXFx1MDMzOCcsJ25vdG5pJzonXFx1MjIwQycsJ25vdG5pdmEnOidcXHUyMjBDJywnbm90bml2Yic6J1xcdTIyRkUnLCdub3RuaXZjJzonXFx1MjJGRCcsJ05vdFByZWNlZGVzJzonXFx1MjI4MCcsJ05vdFByZWNlZGVzRXF1YWwnOidcXHUyQUFGXFx1MDMzOCcsJ05vdFByZWNlZGVzU2xhbnRFcXVhbCc6J1xcdTIyRTAnLCdOb3RSZXZlcnNlRWxlbWVudCc6J1xcdTIyMEMnLCdOb3RSaWdodFRyaWFuZ2xlJzonXFx1MjJFQicsJ05vdFJpZ2h0VHJpYW5nbGVCYXInOidcXHUyOUQwXFx1MDMzOCcsJ05vdFJpZ2h0VHJpYW5nbGVFcXVhbCc6J1xcdTIyRUQnLCdOb3RTcXVhcmVTdWJzZXQnOidcXHUyMjhGXFx1MDMzOCcsJ05vdFNxdWFyZVN1YnNldEVxdWFsJzonXFx1MjJFMicsJ05vdFNxdWFyZVN1cGVyc2V0JzonXFx1MjI5MFxcdTAzMzgnLCdOb3RTcXVhcmVTdXBlcnNldEVxdWFsJzonXFx1MjJFMycsJ05vdFN1YnNldCc6J1xcdTIyODJcXHUyMEQyJywnTm90U3Vic2V0RXF1YWwnOidcXHUyMjg4JywnTm90U3VjY2VlZHMnOidcXHUyMjgxJywnTm90U3VjY2VlZHNFcXVhbCc6J1xcdTJBQjBcXHUwMzM4JywnTm90U3VjY2VlZHNTbGFudEVxdWFsJzonXFx1MjJFMScsJ05vdFN1Y2NlZWRzVGlsZGUnOidcXHUyMjdGXFx1MDMzOCcsJ05vdFN1cGVyc2V0JzonXFx1MjI4M1xcdTIwRDInLCdOb3RTdXBlcnNldEVxdWFsJzonXFx1MjI4OScsJ05vdFRpbGRlJzonXFx1MjI0MScsJ05vdFRpbGRlRXF1YWwnOidcXHUyMjQ0JywnTm90VGlsZGVGdWxsRXF1YWwnOidcXHUyMjQ3JywnTm90VGlsZGVUaWxkZSc6J1xcdTIyNDknLCdOb3RWZXJ0aWNhbEJhcic6J1xcdTIyMjQnLCducGFyJzonXFx1MjIyNicsJ25wYXJhbGxlbCc6J1xcdTIyMjYnLCducGFyc2wnOidcXHUyQUZEXFx1MjBFNScsJ25wYXJ0JzonXFx1MjIwMlxcdTAzMzgnLCducG9saW50JzonXFx1MkExNCcsJ25wcic6J1xcdTIyODAnLCducHJjdWUnOidcXHUyMkUwJywnbnByZSc6J1xcdTJBQUZcXHUwMzM4JywnbnByZWMnOidcXHUyMjgwJywnbnByZWNlcSc6J1xcdTJBQUZcXHUwMzM4JywnbnJhcnInOidcXHUyMTlCJywnbnJBcnInOidcXHUyMUNGJywnbnJhcnJjJzonXFx1MjkzM1xcdTAzMzgnLCducmFycncnOidcXHUyMTlEXFx1MDMzOCcsJ25yaWdodGFycm93JzonXFx1MjE5QicsJ25SaWdodGFycm93JzonXFx1MjFDRicsJ25ydHJpJzonXFx1MjJFQicsJ25ydHJpZSc6J1xcdTIyRUQnLCduc2MnOidcXHUyMjgxJywnbnNjY3VlJzonXFx1MjJFMScsJ25zY2UnOidcXHUyQUIwXFx1MDMzOCcsJ25zY3InOidcXHVEODM1XFx1RENDMycsJ05zY3InOidcXHVEODM1XFx1RENBOScsJ25zaG9ydG1pZCc6J1xcdTIyMjQnLCduc2hvcnRwYXJhbGxlbCc6J1xcdTIyMjYnLCduc2ltJzonXFx1MjI0MScsJ25zaW1lJzonXFx1MjI0NCcsJ25zaW1lcSc6J1xcdTIyNDQnLCduc21pZCc6J1xcdTIyMjQnLCduc3Bhcic6J1xcdTIyMjYnLCduc3FzdWJlJzonXFx1MjJFMicsJ25zcXN1cGUnOidcXHUyMkUzJywnbnN1Yic6J1xcdTIyODQnLCduc3ViZSc6J1xcdTIyODgnLCduc3ViRSc6J1xcdTJBQzVcXHUwMzM4JywnbnN1YnNldCc6J1xcdTIyODJcXHUyMEQyJywnbnN1YnNldGVxJzonXFx1MjI4OCcsJ25zdWJzZXRlcXEnOidcXHUyQUM1XFx1MDMzOCcsJ25zdWNjJzonXFx1MjI4MScsJ25zdWNjZXEnOidcXHUyQUIwXFx1MDMzOCcsJ25zdXAnOidcXHUyMjg1JywnbnN1cGUnOidcXHUyMjg5JywnbnN1cEUnOidcXHUyQUM2XFx1MDMzOCcsJ25zdXBzZXQnOidcXHUyMjgzXFx1MjBEMicsJ25zdXBzZXRlcSc6J1xcdTIyODknLCduc3Vwc2V0ZXFxJzonXFx1MkFDNlxcdTAzMzgnLCdudGdsJzonXFx1MjI3OScsJ250aWxkZSc6J1xceEYxJywnTnRpbGRlJzonXFx4RDEnLCdudGxnJzonXFx1MjI3OCcsJ250cmlhbmdsZWxlZnQnOidcXHUyMkVBJywnbnRyaWFuZ2xlbGVmdGVxJzonXFx1MjJFQycsJ250cmlhbmdsZXJpZ2h0JzonXFx1MjJFQicsJ250cmlhbmdsZXJpZ2h0ZXEnOidcXHUyMkVEJywnbnUnOidcXHUwM0JEJywnTnUnOidcXHUwMzlEJywnbnVtJzonIycsJ251bWVybyc6J1xcdTIxMTYnLCdudW1zcCc6J1xcdTIwMDcnLCdudmFwJzonXFx1MjI0RFxcdTIwRDInLCdudmRhc2gnOidcXHUyMkFDJywnbnZEYXNoJzonXFx1MjJBRCcsJ25WZGFzaCc6J1xcdTIyQUUnLCduVkRhc2gnOidcXHUyMkFGJywnbnZnZSc6J1xcdTIyNjVcXHUyMEQyJywnbnZndCc6Jz5cXHUyMEQyJywnbnZIYXJyJzonXFx1MjkwNCcsJ252aW5maW4nOidcXHUyOURFJywnbnZsQXJyJzonXFx1MjkwMicsJ252bGUnOidcXHUyMjY0XFx1MjBEMicsJ252bHQnOic8XFx1MjBEMicsJ252bHRyaWUnOidcXHUyMkI0XFx1MjBEMicsJ252ckFycic6J1xcdTI5MDMnLCdudnJ0cmllJzonXFx1MjJCNVxcdTIwRDInLCdudnNpbSc6J1xcdTIyM0NcXHUyMEQyJywnbndhcmhrJzonXFx1MjkyMycsJ253YXJyJzonXFx1MjE5NicsJ253QXJyJzonXFx1MjFENicsJ253YXJyb3cnOidcXHUyMTk2JywnbnduZWFyJzonXFx1MjkyNycsJ29hY3V0ZSc6J1xceEYzJywnT2FjdXRlJzonXFx4RDMnLCdvYXN0JzonXFx1MjI5QicsJ29jaXInOidcXHUyMjlBJywnb2NpcmMnOidcXHhGNCcsJ09jaXJjJzonXFx4RDQnLCdvY3knOidcXHUwNDNFJywnT2N5JzonXFx1MDQxRScsJ29kYXNoJzonXFx1MjI5RCcsJ29kYmxhYyc6J1xcdTAxNTEnLCdPZGJsYWMnOidcXHUwMTUwJywnb2Rpdic6J1xcdTJBMzgnLCdvZG90JzonXFx1MjI5OScsJ29kc29sZCc6J1xcdTI5QkMnLCdvZWxpZyc6J1xcdTAxNTMnLCdPRWxpZyc6J1xcdTAxNTInLCdvZmNpcic6J1xcdTI5QkYnLCdvZnInOidcXHVEODM1XFx1REQyQycsJ09mcic6J1xcdUQ4MzVcXHVERDEyJywnb2dvbic6J1xcdTAyREInLCdvZ3JhdmUnOidcXHhGMicsJ09ncmF2ZSc6J1xceEQyJywnb2d0JzonXFx1MjlDMScsJ29oYmFyJzonXFx1MjlCNScsJ29obSc6J1xcdTAzQTknLCdvaW50JzonXFx1MjIyRScsJ29sYXJyJzonXFx1MjFCQScsJ29sY2lyJzonXFx1MjlCRScsJ29sY3Jvc3MnOidcXHUyOUJCJywnb2xpbmUnOidcXHUyMDNFJywnb2x0JzonXFx1MjlDMCcsJ29tYWNyJzonXFx1MDE0RCcsJ09tYWNyJzonXFx1MDE0QycsJ29tZWdhJzonXFx1MDNDOScsJ09tZWdhJzonXFx1MDNBOScsJ29taWNyb24nOidcXHUwM0JGJywnT21pY3Jvbic6J1xcdTAzOUYnLCdvbWlkJzonXFx1MjlCNicsJ29taW51cyc6J1xcdTIyOTYnLCdvb3BmJzonXFx1RDgzNVxcdURENjAnLCdPb3BmJzonXFx1RDgzNVxcdURENDYnLCdvcGFyJzonXFx1MjlCNycsJ09wZW5DdXJseURvdWJsZVF1b3RlJzonXFx1MjAxQycsJ09wZW5DdXJseVF1b3RlJzonXFx1MjAxOCcsJ29wZXJwJzonXFx1MjlCOScsJ29wbHVzJzonXFx1MjI5NScsJ29yJzonXFx1MjIyOCcsJ09yJzonXFx1MkE1NCcsJ29yYXJyJzonXFx1MjFCQicsJ29yZCc6J1xcdTJBNUQnLCdvcmRlcic6J1xcdTIxMzQnLCdvcmRlcm9mJzonXFx1MjEzNCcsJ29yZGYnOidcXHhBQScsJ29yZG0nOidcXHhCQScsJ29yaWdvZic6J1xcdTIyQjYnLCdvcm9yJzonXFx1MkE1NicsJ29yc2xvcGUnOidcXHUyQTU3Jywnb3J2JzonXFx1MkE1QicsJ29TJzonXFx1MjRDOCcsJ29zY3InOidcXHUyMTM0JywnT3Njcic6J1xcdUQ4MzVcXHVEQ0FBJywnb3NsYXNoJzonXFx4RjgnLCdPc2xhc2gnOidcXHhEOCcsJ29zb2wnOidcXHUyMjk4Jywnb3RpbGRlJzonXFx4RjUnLCdPdGlsZGUnOidcXHhENScsJ290aW1lcyc6J1xcdTIyOTcnLCdPdGltZXMnOidcXHUyQTM3Jywnb3RpbWVzYXMnOidcXHUyQTM2Jywnb3VtbCc6J1xceEY2JywnT3VtbCc6J1xceEQ2Jywnb3ZiYXInOidcXHUyMzNEJywnT3ZlckJhcic6J1xcdTIwM0UnLCdPdmVyQnJhY2UnOidcXHUyM0RFJywnT3ZlckJyYWNrZXQnOidcXHUyM0I0JywnT3ZlclBhcmVudGhlc2lzJzonXFx1MjNEQycsJ3Bhcic6J1xcdTIyMjUnLCdwYXJhJzonXFx4QjYnLCdwYXJhbGxlbCc6J1xcdTIyMjUnLCdwYXJzaW0nOidcXHUyQUYzJywncGFyc2wnOidcXHUyQUZEJywncGFydCc6J1xcdTIyMDInLCdQYXJ0aWFsRCc6J1xcdTIyMDInLCdwY3knOidcXHUwNDNGJywnUGN5JzonXFx1MDQxRicsJ3BlcmNudCc6JyUnLCdwZXJpb2QnOicuJywncGVybWlsJzonXFx1MjAzMCcsJ3BlcnAnOidcXHUyMkE1JywncGVydGVuayc6J1xcdTIwMzEnLCdwZnInOidcXHVEODM1XFx1REQyRCcsJ1Bmcic6J1xcdUQ4MzVcXHVERDEzJywncGhpJzonXFx1MDNDNicsJ1BoaSc6J1xcdTAzQTYnLCdwaGl2JzonXFx1MDNENScsJ3BobW1hdCc6J1xcdTIxMzMnLCdwaG9uZSc6J1xcdTI2MEUnLCdwaSc6J1xcdTAzQzAnLCdQaSc6J1xcdTAzQTAnLCdwaXRjaGZvcmsnOidcXHUyMkQ0JywncGl2JzonXFx1MDNENicsJ3BsYW5jayc6J1xcdTIxMEYnLCdwbGFuY2toJzonXFx1MjEwRScsJ3BsYW5rdic6J1xcdTIxMEYnLCdwbHVzJzonKycsJ3BsdXNhY2lyJzonXFx1MkEyMycsJ3BsdXNiJzonXFx1MjI5RScsJ3BsdXNjaXInOidcXHUyQTIyJywncGx1c2RvJzonXFx1MjIxNCcsJ3BsdXNkdSc6J1xcdTJBMjUnLCdwbHVzZSc6J1xcdTJBNzInLCdQbHVzTWludXMnOidcXHhCMScsJ3BsdXNtbic6J1xceEIxJywncGx1c3NpbSc6J1xcdTJBMjYnLCdwbHVzdHdvJzonXFx1MkEyNycsJ3BtJzonXFx4QjEnLCdQb2luY2FyZXBsYW5lJzonXFx1MjEwQycsJ3BvaW50aW50JzonXFx1MkExNScsJ3BvcGYnOidcXHVEODM1XFx1REQ2MScsJ1BvcGYnOidcXHUyMTE5JywncG91bmQnOidcXHhBMycsJ3ByJzonXFx1MjI3QScsJ1ByJzonXFx1MkFCQicsJ3ByYXAnOidcXHUyQUI3JywncHJjdWUnOidcXHUyMjdDJywncHJlJzonXFx1MkFBRicsJ3ByRSc6J1xcdTJBQjMnLCdwcmVjJzonXFx1MjI3QScsJ3ByZWNhcHByb3gnOidcXHUyQUI3JywncHJlY2N1cmx5ZXEnOidcXHUyMjdDJywnUHJlY2VkZXMnOidcXHUyMjdBJywnUHJlY2VkZXNFcXVhbCc6J1xcdTJBQUYnLCdQcmVjZWRlc1NsYW50RXF1YWwnOidcXHUyMjdDJywnUHJlY2VkZXNUaWxkZSc6J1xcdTIyN0UnLCdwcmVjZXEnOidcXHUyQUFGJywncHJlY25hcHByb3gnOidcXHUyQUI5JywncHJlY25lcXEnOidcXHUyQUI1JywncHJlY25zaW0nOidcXHUyMkU4JywncHJlY3NpbSc6J1xcdTIyN0UnLCdwcmltZSc6J1xcdTIwMzInLCdQcmltZSc6J1xcdTIwMzMnLCdwcmltZXMnOidcXHUyMTE5JywncHJuYXAnOidcXHUyQUI5JywncHJuRSc6J1xcdTJBQjUnLCdwcm5zaW0nOidcXHUyMkU4JywncHJvZCc6J1xcdTIyMEYnLCdQcm9kdWN0JzonXFx1MjIwRicsJ3Byb2ZhbGFyJzonXFx1MjMyRScsJ3Byb2ZsaW5lJzonXFx1MjMxMicsJ3Byb2ZzdXJmJzonXFx1MjMxMycsJ3Byb3AnOidcXHUyMjFEJywnUHJvcG9ydGlvbic6J1xcdTIyMzcnLCdQcm9wb3J0aW9uYWwnOidcXHUyMjFEJywncHJvcHRvJzonXFx1MjIxRCcsJ3Byc2ltJzonXFx1MjI3RScsJ3BydXJlbCc6J1xcdTIyQjAnLCdwc2NyJzonXFx1RDgzNVxcdURDQzUnLCdQc2NyJzonXFx1RDgzNVxcdURDQUInLCdwc2knOidcXHUwM0M4JywnUHNpJzonXFx1MDNBOCcsJ3B1bmNzcCc6J1xcdTIwMDgnLCdxZnInOidcXHVEODM1XFx1REQyRScsJ1Fmcic6J1xcdUQ4MzVcXHVERDE0JywncWludCc6J1xcdTJBMEMnLCdxb3BmJzonXFx1RDgzNVxcdURENjInLCdRb3BmJzonXFx1MjExQScsJ3FwcmltZSc6J1xcdTIwNTcnLCdxc2NyJzonXFx1RDgzNVxcdURDQzYnLCdRc2NyJzonXFx1RDgzNVxcdURDQUMnLCdxdWF0ZXJuaW9ucyc6J1xcdTIxMEQnLCdxdWF0aW50JzonXFx1MkExNicsJ3F1ZXN0JzonPycsJ3F1ZXN0ZXEnOidcXHUyMjVGJywncXVvdCc6J1wiJywnUVVPVCc6J1wiJywnckFhcnInOidcXHUyMURCJywncmFjZSc6J1xcdTIyM0RcXHUwMzMxJywncmFjdXRlJzonXFx1MDE1NScsJ1JhY3V0ZSc6J1xcdTAxNTQnLCdyYWRpYyc6J1xcdTIyMUEnLCdyYWVtcHR5dic6J1xcdTI5QjMnLCdyYW5nJzonXFx1MjdFOScsJ1JhbmcnOidcXHUyN0VCJywncmFuZ2QnOidcXHUyOTkyJywncmFuZ2UnOidcXHUyOUE1JywncmFuZ2xlJzonXFx1MjdFOScsJ3JhcXVvJzonXFx4QkInLCdyYXJyJzonXFx1MjE5MicsJ3JBcnInOidcXHUyMUQyJywnUmFycic6J1xcdTIxQTAnLCdyYXJyYXAnOidcXHUyOTc1JywncmFycmInOidcXHUyMUU1JywncmFycmJmcyc6J1xcdTI5MjAnLCdyYXJyYyc6J1xcdTI5MzMnLCdyYXJyZnMnOidcXHUyOTFFJywncmFycmhrJzonXFx1MjFBQScsJ3JhcnJscCc6J1xcdTIxQUMnLCdyYXJycGwnOidcXHUyOTQ1JywncmFycnNpbSc6J1xcdTI5NzQnLCdyYXJydGwnOidcXHUyMUEzJywnUmFycnRsJzonXFx1MjkxNicsJ3JhcnJ3JzonXFx1MjE5RCcsJ3JhdGFpbCc6J1xcdTI5MUEnLCdyQXRhaWwnOidcXHUyOTFDJywncmF0aW8nOidcXHUyMjM2JywncmF0aW9uYWxzJzonXFx1MjExQScsJ3JiYXJyJzonXFx1MjkwRCcsJ3JCYXJyJzonXFx1MjkwRicsJ1JCYXJyJzonXFx1MjkxMCcsJ3JiYnJrJzonXFx1Mjc3MycsJ3JicmFjZSc6J30nLCdyYnJhY2snOiddJywncmJya2UnOidcXHUyOThDJywncmJya3NsZCc6J1xcdTI5OEUnLCdyYnJrc2x1JzonXFx1Mjk5MCcsJ3JjYXJvbic6J1xcdTAxNTknLCdSY2Fyb24nOidcXHUwMTU4JywncmNlZGlsJzonXFx1MDE1NycsJ1JjZWRpbCc6J1xcdTAxNTYnLCdyY2VpbCc6J1xcdTIzMDknLCdyY3ViJzonfScsJ3JjeSc6J1xcdTA0NDAnLCdSY3knOidcXHUwNDIwJywncmRjYSc6J1xcdTI5MzcnLCdyZGxkaGFyJzonXFx1Mjk2OScsJ3JkcXVvJzonXFx1MjAxRCcsJ3JkcXVvcic6J1xcdTIwMUQnLCdyZHNoJzonXFx1MjFCMycsJ1JlJzonXFx1MjExQycsJ3JlYWwnOidcXHUyMTFDJywncmVhbGluZSc6J1xcdTIxMUInLCdyZWFscGFydCc6J1xcdTIxMUMnLCdyZWFscyc6J1xcdTIxMUQnLCdyZWN0JzonXFx1MjVBRCcsJ3JlZyc6J1xceEFFJywnUkVHJzonXFx4QUUnLCdSZXZlcnNlRWxlbWVudCc6J1xcdTIyMEInLCdSZXZlcnNlRXF1aWxpYnJpdW0nOidcXHUyMUNCJywnUmV2ZXJzZVVwRXF1aWxpYnJpdW0nOidcXHUyOTZGJywncmZpc2h0JzonXFx1Mjk3RCcsJ3JmbG9vcic6J1xcdTIzMEInLCdyZnInOidcXHVEODM1XFx1REQyRicsJ1Jmcic6J1xcdTIxMUMnLCdySGFyJzonXFx1Mjk2NCcsJ3JoYXJkJzonXFx1MjFDMScsJ3JoYXJ1JzonXFx1MjFDMCcsJ3JoYXJ1bCc6J1xcdTI5NkMnLCdyaG8nOidcXHUwM0MxJywnUmhvJzonXFx1MDNBMScsJ3Job3YnOidcXHUwM0YxJywnUmlnaHRBbmdsZUJyYWNrZXQnOidcXHUyN0U5JywncmlnaHRhcnJvdyc6J1xcdTIxOTInLCdSaWdodGFycm93JzonXFx1MjFEMicsJ1JpZ2h0QXJyb3cnOidcXHUyMTkyJywnUmlnaHRBcnJvd0Jhcic6J1xcdTIxRTUnLCdSaWdodEFycm93TGVmdEFycm93JzonXFx1MjFDNCcsJ3JpZ2h0YXJyb3d0YWlsJzonXFx1MjFBMycsJ1JpZ2h0Q2VpbGluZyc6J1xcdTIzMDknLCdSaWdodERvdWJsZUJyYWNrZXQnOidcXHUyN0U3JywnUmlnaHREb3duVGVlVmVjdG9yJzonXFx1Mjk1RCcsJ1JpZ2h0RG93blZlY3Rvcic6J1xcdTIxQzInLCdSaWdodERvd25WZWN0b3JCYXInOidcXHUyOTU1JywnUmlnaHRGbG9vcic6J1xcdTIzMEInLCdyaWdodGhhcnBvb25kb3duJzonXFx1MjFDMScsJ3JpZ2h0aGFycG9vbnVwJzonXFx1MjFDMCcsJ3JpZ2h0bGVmdGFycm93cyc6J1xcdTIxQzQnLCdyaWdodGxlZnRoYXJwb29ucyc6J1xcdTIxQ0MnLCdyaWdodHJpZ2h0YXJyb3dzJzonXFx1MjFDOScsJ3JpZ2h0c3F1aWdhcnJvdyc6J1xcdTIxOUQnLCdSaWdodFRlZSc6J1xcdTIyQTInLCdSaWdodFRlZUFycm93JzonXFx1MjFBNicsJ1JpZ2h0VGVlVmVjdG9yJzonXFx1Mjk1QicsJ3JpZ2h0dGhyZWV0aW1lcyc6J1xcdTIyQ0MnLCdSaWdodFRyaWFuZ2xlJzonXFx1MjJCMycsJ1JpZ2h0VHJpYW5nbGVCYXInOidcXHUyOUQwJywnUmlnaHRUcmlhbmdsZUVxdWFsJzonXFx1MjJCNScsJ1JpZ2h0VXBEb3duVmVjdG9yJzonXFx1Mjk0RicsJ1JpZ2h0VXBUZWVWZWN0b3InOidcXHUyOTVDJywnUmlnaHRVcFZlY3Rvcic6J1xcdTIxQkUnLCdSaWdodFVwVmVjdG9yQmFyJzonXFx1Mjk1NCcsJ1JpZ2h0VmVjdG9yJzonXFx1MjFDMCcsJ1JpZ2h0VmVjdG9yQmFyJzonXFx1Mjk1MycsJ3JpbmcnOidcXHUwMkRBJywncmlzaW5nZG90c2VxJzonXFx1MjI1MycsJ3JsYXJyJzonXFx1MjFDNCcsJ3JsaGFyJzonXFx1MjFDQycsJ3JsbSc6J1xcdTIwMEYnLCdybW91c3QnOidcXHUyM0IxJywncm1vdXN0YWNoZSc6J1xcdTIzQjEnLCdybm1pZCc6J1xcdTJBRUUnLCdyb2FuZyc6J1xcdTI3RUQnLCdyb2Fycic6J1xcdTIxRkUnLCdyb2Jyayc6J1xcdTI3RTcnLCdyb3Bhcic6J1xcdTI5ODYnLCdyb3BmJzonXFx1RDgzNVxcdURENjMnLCdSb3BmJzonXFx1MjExRCcsJ3JvcGx1cyc6J1xcdTJBMkUnLCdyb3RpbWVzJzonXFx1MkEzNScsJ1JvdW5kSW1wbGllcyc6J1xcdTI5NzAnLCdycGFyJzonKScsJ3JwYXJndCc6J1xcdTI5OTQnLCdycHBvbGludCc6J1xcdTJBMTInLCdycmFycic6J1xcdTIxQzknLCdScmlnaHRhcnJvdyc6J1xcdTIxREInLCdyc2FxdW8nOidcXHUyMDNBJywncnNjcic6J1xcdUQ4MzVcXHVEQ0M3JywnUnNjcic6J1xcdTIxMUInLCdyc2gnOidcXHUyMUIxJywnUnNoJzonXFx1MjFCMScsJ3JzcWInOiddJywncnNxdW8nOidcXHUyMDE5JywncnNxdW9yJzonXFx1MjAxOScsJ3J0aHJlZSc6J1xcdTIyQ0MnLCdydGltZXMnOidcXHUyMkNBJywncnRyaSc6J1xcdTI1QjknLCdydHJpZSc6J1xcdTIyQjUnLCdydHJpZic6J1xcdTI1QjgnLCdydHJpbHRyaSc6J1xcdTI5Q0UnLCdSdWxlRGVsYXllZCc6J1xcdTI5RjQnLCdydWx1aGFyJzonXFx1Mjk2OCcsJ3J4JzonXFx1MjExRScsJ3NhY3V0ZSc6J1xcdTAxNUInLCdTYWN1dGUnOidcXHUwMTVBJywnc2JxdW8nOidcXHUyMDFBJywnc2MnOidcXHUyMjdCJywnU2MnOidcXHUyQUJDJywnc2NhcCc6J1xcdTJBQjgnLCdzY2Fyb24nOidcXHUwMTYxJywnU2Nhcm9uJzonXFx1MDE2MCcsJ3NjY3VlJzonXFx1MjI3RCcsJ3NjZSc6J1xcdTJBQjAnLCdzY0UnOidcXHUyQUI0Jywnc2NlZGlsJzonXFx1MDE1RicsJ1NjZWRpbCc6J1xcdTAxNUUnLCdzY2lyYyc6J1xcdTAxNUQnLCdTY2lyYyc6J1xcdTAxNUMnLCdzY25hcCc6J1xcdTJBQkEnLCdzY25FJzonXFx1MkFCNicsJ3NjbnNpbSc6J1xcdTIyRTknLCdzY3BvbGludCc6J1xcdTJBMTMnLCdzY3NpbSc6J1xcdTIyN0YnLCdzY3knOidcXHUwNDQxJywnU2N5JzonXFx1MDQyMScsJ3Nkb3QnOidcXHUyMkM1Jywnc2RvdGInOidcXHUyMkExJywnc2RvdGUnOidcXHUyQTY2Jywnc2VhcmhrJzonXFx1MjkyNScsJ3NlYXJyJzonXFx1MjE5OCcsJ3NlQXJyJzonXFx1MjFEOCcsJ3NlYXJyb3cnOidcXHUyMTk4Jywnc2VjdCc6J1xceEE3Jywnc2VtaSc6JzsnLCdzZXN3YXInOidcXHUyOTI5Jywnc2V0bWludXMnOidcXHUyMjE2Jywnc2V0bW4nOidcXHUyMjE2Jywnc2V4dCc6J1xcdTI3MzYnLCdzZnInOidcXHVEODM1XFx1REQzMCcsJ1Nmcic6J1xcdUQ4MzVcXHVERDE2Jywnc2Zyb3duJzonXFx1MjMyMicsJ3NoYXJwJzonXFx1MjY2RicsJ3NoY2hjeSc6J1xcdTA0NDknLCdTSENIY3knOidcXHUwNDI5Jywnc2hjeSc6J1xcdTA0NDgnLCdTSGN5JzonXFx1MDQyOCcsJ1Nob3J0RG93bkFycm93JzonXFx1MjE5MycsJ1Nob3J0TGVmdEFycm93JzonXFx1MjE5MCcsJ3Nob3J0bWlkJzonXFx1MjIyMycsJ3Nob3J0cGFyYWxsZWwnOidcXHUyMjI1JywnU2hvcnRSaWdodEFycm93JzonXFx1MjE5MicsJ1Nob3J0VXBBcnJvdyc6J1xcdTIxOTEnLCdzaHknOidcXHhBRCcsJ3NpZ21hJzonXFx1MDNDMycsJ1NpZ21hJzonXFx1MDNBMycsJ3NpZ21hZic6J1xcdTAzQzInLCdzaWdtYXYnOidcXHUwM0MyJywnc2ltJzonXFx1MjIzQycsJ3NpbWRvdCc6J1xcdTJBNkEnLCdzaW1lJzonXFx1MjI0MycsJ3NpbWVxJzonXFx1MjI0MycsJ3NpbWcnOidcXHUyQTlFJywnc2ltZ0UnOidcXHUyQUEwJywnc2ltbCc6J1xcdTJBOUQnLCdzaW1sRSc6J1xcdTJBOUYnLCdzaW1uZSc6J1xcdTIyNDYnLCdzaW1wbHVzJzonXFx1MkEyNCcsJ3NpbXJhcnInOidcXHUyOTcyJywnc2xhcnInOidcXHUyMTkwJywnU21hbGxDaXJjbGUnOidcXHUyMjE4Jywnc21hbGxzZXRtaW51cyc6J1xcdTIyMTYnLCdzbWFzaHAnOidcXHUyQTMzJywnc21lcGFyc2wnOidcXHUyOUU0Jywnc21pZCc6J1xcdTIyMjMnLCdzbWlsZSc6J1xcdTIzMjMnLCdzbXQnOidcXHUyQUFBJywnc210ZSc6J1xcdTJBQUMnLCdzbXRlcyc6J1xcdTJBQUNcXHVGRTAwJywnc29mdGN5JzonXFx1MDQ0QycsJ1NPRlRjeSc6J1xcdTA0MkMnLCdzb2wnOicvJywnc29sYic6J1xcdTI5QzQnLCdzb2xiYXInOidcXHUyMzNGJywnc29wZic6J1xcdUQ4MzVcXHVERDY0JywnU29wZic6J1xcdUQ4MzVcXHVERDRBJywnc3BhZGVzJzonXFx1MjY2MCcsJ3NwYWRlc3VpdCc6J1xcdTI2NjAnLCdzcGFyJzonXFx1MjIyNScsJ3NxY2FwJzonXFx1MjI5MycsJ3NxY2Fwcyc6J1xcdTIyOTNcXHVGRTAwJywnc3FjdXAnOidcXHUyMjk0Jywnc3FjdXBzJzonXFx1MjI5NFxcdUZFMDAnLCdTcXJ0JzonXFx1MjIxQScsJ3Nxc3ViJzonXFx1MjI4RicsJ3Nxc3ViZSc6J1xcdTIyOTEnLCdzcXN1YnNldCc6J1xcdTIyOEYnLCdzcXN1YnNldGVxJzonXFx1MjI5MScsJ3Nxc3VwJzonXFx1MjI5MCcsJ3Nxc3VwZSc6J1xcdTIyOTInLCdzcXN1cHNldCc6J1xcdTIyOTAnLCdzcXN1cHNldGVxJzonXFx1MjI5MicsJ3NxdSc6J1xcdTI1QTEnLCdzcXVhcmUnOidcXHUyNUExJywnU3F1YXJlJzonXFx1MjVBMScsJ1NxdWFyZUludGVyc2VjdGlvbic6J1xcdTIyOTMnLCdTcXVhcmVTdWJzZXQnOidcXHUyMjhGJywnU3F1YXJlU3Vic2V0RXF1YWwnOidcXHUyMjkxJywnU3F1YXJlU3VwZXJzZXQnOidcXHUyMjkwJywnU3F1YXJlU3VwZXJzZXRFcXVhbCc6J1xcdTIyOTInLCdTcXVhcmVVbmlvbic6J1xcdTIyOTQnLCdzcXVhcmYnOidcXHUyNUFBJywnc3F1Zic6J1xcdTI1QUEnLCdzcmFycic6J1xcdTIxOTInLCdzc2NyJzonXFx1RDgzNVxcdURDQzgnLCdTc2NyJzonXFx1RDgzNVxcdURDQUUnLCdzc2V0bW4nOidcXHUyMjE2Jywnc3NtaWxlJzonXFx1MjMyMycsJ3NzdGFyZic6J1xcdTIyQzYnLCdzdGFyJzonXFx1MjYwNicsJ1N0YXInOidcXHUyMkM2Jywnc3RhcmYnOidcXHUyNjA1Jywnc3RyYWlnaHRlcHNpbG9uJzonXFx1MDNGNScsJ3N0cmFpZ2h0cGhpJzonXFx1MDNENScsJ3N0cm5zJzonXFx4QUYnLCdzdWInOidcXHUyMjgyJywnU3ViJzonXFx1MjJEMCcsJ3N1YmRvdCc6J1xcdTJBQkQnLCdzdWJlJzonXFx1MjI4NicsJ3N1YkUnOidcXHUyQUM1Jywnc3ViZWRvdCc6J1xcdTJBQzMnLCdzdWJtdWx0JzonXFx1MkFDMScsJ3N1Ym5lJzonXFx1MjI4QScsJ3N1Ym5FJzonXFx1MkFDQicsJ3N1YnBsdXMnOidcXHUyQUJGJywnc3VicmFycic6J1xcdTI5NzknLCdzdWJzZXQnOidcXHUyMjgyJywnU3Vic2V0JzonXFx1MjJEMCcsJ3N1YnNldGVxJzonXFx1MjI4NicsJ3N1YnNldGVxcSc6J1xcdTJBQzUnLCdTdWJzZXRFcXVhbCc6J1xcdTIyODYnLCdzdWJzZXRuZXEnOidcXHUyMjhBJywnc3Vic2V0bmVxcSc6J1xcdTJBQ0InLCdzdWJzaW0nOidcXHUyQUM3Jywnc3Vic3ViJzonXFx1MkFENScsJ3N1YnN1cCc6J1xcdTJBRDMnLCdzdWNjJzonXFx1MjI3QicsJ3N1Y2NhcHByb3gnOidcXHUyQUI4Jywnc3VjY2N1cmx5ZXEnOidcXHUyMjdEJywnU3VjY2VlZHMnOidcXHUyMjdCJywnU3VjY2VlZHNFcXVhbCc6J1xcdTJBQjAnLCdTdWNjZWVkc1NsYW50RXF1YWwnOidcXHUyMjdEJywnU3VjY2VlZHNUaWxkZSc6J1xcdTIyN0YnLCdzdWNjZXEnOidcXHUyQUIwJywnc3VjY25hcHByb3gnOidcXHUyQUJBJywnc3VjY25lcXEnOidcXHUyQUI2Jywnc3VjY25zaW0nOidcXHUyMkU5Jywnc3VjY3NpbSc6J1xcdTIyN0YnLCdTdWNoVGhhdCc6J1xcdTIyMEInLCdzdW0nOidcXHUyMjExJywnU3VtJzonXFx1MjIxMScsJ3N1bmcnOidcXHUyNjZBJywnc3VwJzonXFx1MjI4MycsJ1N1cCc6J1xcdTIyRDEnLCdzdXAxJzonXFx4QjknLCdzdXAyJzonXFx4QjInLCdzdXAzJzonXFx4QjMnLCdzdXBkb3QnOidcXHUyQUJFJywnc3VwZHN1Yic6J1xcdTJBRDgnLCdzdXBlJzonXFx1MjI4NycsJ3N1cEUnOidcXHUyQUM2Jywnc3VwZWRvdCc6J1xcdTJBQzQnLCdTdXBlcnNldCc6J1xcdTIyODMnLCdTdXBlcnNldEVxdWFsJzonXFx1MjI4NycsJ3N1cGhzb2wnOidcXHUyN0M5Jywnc3VwaHN1Yic6J1xcdTJBRDcnLCdzdXBsYXJyJzonXFx1Mjk3QicsJ3N1cG11bHQnOidcXHUyQUMyJywnc3VwbmUnOidcXHUyMjhCJywnc3VwbkUnOidcXHUyQUNDJywnc3VwcGx1cyc6J1xcdTJBQzAnLCdzdXBzZXQnOidcXHUyMjgzJywnU3Vwc2V0JzonXFx1MjJEMScsJ3N1cHNldGVxJzonXFx1MjI4NycsJ3N1cHNldGVxcSc6J1xcdTJBQzYnLCdzdXBzZXRuZXEnOidcXHUyMjhCJywnc3Vwc2V0bmVxcSc6J1xcdTJBQ0MnLCdzdXBzaW0nOidcXHUyQUM4Jywnc3Vwc3ViJzonXFx1MkFENCcsJ3N1cHN1cCc6J1xcdTJBRDYnLCdzd2FyaGsnOidcXHUyOTI2Jywnc3dhcnInOidcXHUyMTk5Jywnc3dBcnInOidcXHUyMUQ5Jywnc3dhcnJvdyc6J1xcdTIxOTknLCdzd253YXInOidcXHUyOTJBJywnc3psaWcnOidcXHhERicsJ1RhYic6J1xcdCcsJ3RhcmdldCc6J1xcdTIzMTYnLCd0YXUnOidcXHUwM0M0JywnVGF1JzonXFx1MDNBNCcsJ3RicmsnOidcXHUyM0I0JywndGNhcm9uJzonXFx1MDE2NScsJ1RjYXJvbic6J1xcdTAxNjQnLCd0Y2VkaWwnOidcXHUwMTYzJywnVGNlZGlsJzonXFx1MDE2MicsJ3RjeSc6J1xcdTA0NDInLCdUY3knOidcXHUwNDIyJywndGRvdCc6J1xcdTIwREInLCd0ZWxyZWMnOidcXHUyMzE1JywndGZyJzonXFx1RDgzNVxcdUREMzEnLCdUZnInOidcXHVEODM1XFx1REQxNycsJ3RoZXJlNCc6J1xcdTIyMzQnLCd0aGVyZWZvcmUnOidcXHUyMjM0JywnVGhlcmVmb3JlJzonXFx1MjIzNCcsJ3RoZXRhJzonXFx1MDNCOCcsJ1RoZXRhJzonXFx1MDM5OCcsJ3RoZXRhc3ltJzonXFx1MDNEMScsJ3RoZXRhdic6J1xcdTAzRDEnLCd0aGlja2FwcHJveCc6J1xcdTIyNDgnLCd0aGlja3NpbSc6J1xcdTIyM0MnLCdUaGlja1NwYWNlJzonXFx1MjA1RlxcdTIwMEEnLCd0aGluc3AnOidcXHUyMDA5JywnVGhpblNwYWNlJzonXFx1MjAwOScsJ3Roa2FwJzonXFx1MjI0OCcsJ3Roa3NpbSc6J1xcdTIyM0MnLCd0aG9ybic6J1xceEZFJywnVEhPUk4nOidcXHhERScsJ3RpbGRlJzonXFx1MDJEQycsJ1RpbGRlJzonXFx1MjIzQycsJ1RpbGRlRXF1YWwnOidcXHUyMjQzJywnVGlsZGVGdWxsRXF1YWwnOidcXHUyMjQ1JywnVGlsZGVUaWxkZSc6J1xcdTIyNDgnLCd0aW1lcyc6J1xceEQ3JywndGltZXNiJzonXFx1MjJBMCcsJ3RpbWVzYmFyJzonXFx1MkEzMScsJ3RpbWVzZCc6J1xcdTJBMzAnLCd0aW50JzonXFx1MjIyRCcsJ3RvZWEnOidcXHUyOTI4JywndG9wJzonXFx1MjJBNCcsJ3RvcGJvdCc6J1xcdTIzMzYnLCd0b3BjaXInOidcXHUyQUYxJywndG9wZic6J1xcdUQ4MzVcXHVERDY1JywnVG9wZic6J1xcdUQ4MzVcXHVERDRCJywndG9wZm9yayc6J1xcdTJBREEnLCd0b3NhJzonXFx1MjkyOScsJ3RwcmltZSc6J1xcdTIwMzQnLCd0cmFkZSc6J1xcdTIxMjInLCdUUkFERSc6J1xcdTIxMjInLCd0cmlhbmdsZSc6J1xcdTI1QjUnLCd0cmlhbmdsZWRvd24nOidcXHUyNUJGJywndHJpYW5nbGVsZWZ0JzonXFx1MjVDMycsJ3RyaWFuZ2xlbGVmdGVxJzonXFx1MjJCNCcsJ3RyaWFuZ2xlcSc6J1xcdTIyNUMnLCd0cmlhbmdsZXJpZ2h0JzonXFx1MjVCOScsJ3RyaWFuZ2xlcmlnaHRlcSc6J1xcdTIyQjUnLCd0cmlkb3QnOidcXHUyNUVDJywndHJpZSc6J1xcdTIyNUMnLCd0cmltaW51cyc6J1xcdTJBM0EnLCdUcmlwbGVEb3QnOidcXHUyMERCJywndHJpcGx1cyc6J1xcdTJBMzknLCd0cmlzYic6J1xcdTI5Q0QnLCd0cml0aW1lJzonXFx1MkEzQicsJ3RycGV6aXVtJzonXFx1MjNFMicsJ3RzY3InOidcXHVEODM1XFx1RENDOScsJ1RzY3InOidcXHVEODM1XFx1RENBRicsJ3RzY3knOidcXHUwNDQ2JywnVFNjeSc6J1xcdTA0MjYnLCd0c2hjeSc6J1xcdTA0NUInLCdUU0hjeSc6J1xcdTA0MEInLCd0c3Ryb2snOidcXHUwMTY3JywnVHN0cm9rJzonXFx1MDE2NicsJ3R3aXh0JzonXFx1MjI2QycsJ3R3b2hlYWRsZWZ0YXJyb3cnOidcXHUyMTlFJywndHdvaGVhZHJpZ2h0YXJyb3cnOidcXHUyMUEwJywndWFjdXRlJzonXFx4RkEnLCdVYWN1dGUnOidcXHhEQScsJ3VhcnInOidcXHUyMTkxJywndUFycic6J1xcdTIxRDEnLCdVYXJyJzonXFx1MjE5RicsJ1VhcnJvY2lyJzonXFx1Mjk0OScsJ3VicmN5JzonXFx1MDQ1RScsJ1VicmN5JzonXFx1MDQwRScsJ3VicmV2ZSc6J1xcdTAxNkQnLCdVYnJldmUnOidcXHUwMTZDJywndWNpcmMnOidcXHhGQicsJ1VjaXJjJzonXFx4REInLCd1Y3knOidcXHUwNDQzJywnVWN5JzonXFx1MDQyMycsJ3VkYXJyJzonXFx1MjFDNScsJ3VkYmxhYyc6J1xcdTAxNzEnLCdVZGJsYWMnOidcXHUwMTcwJywndWRoYXInOidcXHUyOTZFJywndWZpc2h0JzonXFx1Mjk3RScsJ3Vmcic6J1xcdUQ4MzVcXHVERDMyJywnVWZyJzonXFx1RDgzNVxcdUREMTgnLCd1Z3JhdmUnOidcXHhGOScsJ1VncmF2ZSc6J1xceEQ5JywndUhhcic6J1xcdTI5NjMnLCd1aGFybCc6J1xcdTIxQkYnLCd1aGFycic6J1xcdTIxQkUnLCd1aGJsayc6J1xcdTI1ODAnLCd1bGNvcm4nOidcXHUyMzFDJywndWxjb3JuZXInOidcXHUyMzFDJywndWxjcm9wJzonXFx1MjMwRicsJ3VsdHJpJzonXFx1MjVGOCcsJ3VtYWNyJzonXFx1MDE2QicsJ1VtYWNyJzonXFx1MDE2QScsJ3VtbCc6J1xceEE4JywnVW5kZXJCYXInOidfJywnVW5kZXJCcmFjZSc6J1xcdTIzREYnLCdVbmRlckJyYWNrZXQnOidcXHUyM0I1JywnVW5kZXJQYXJlbnRoZXNpcyc6J1xcdTIzREQnLCdVbmlvbic6J1xcdTIyQzMnLCdVbmlvblBsdXMnOidcXHUyMjhFJywndW9nb24nOidcXHUwMTczJywnVW9nb24nOidcXHUwMTcyJywndW9wZic6J1xcdUQ4MzVcXHVERDY2JywnVW9wZic6J1xcdUQ4MzVcXHVERDRDJywndXBhcnJvdyc6J1xcdTIxOTEnLCdVcGFycm93JzonXFx1MjFEMScsJ1VwQXJyb3cnOidcXHUyMTkxJywnVXBBcnJvd0Jhcic6J1xcdTI5MTInLCdVcEFycm93RG93bkFycm93JzonXFx1MjFDNScsJ3VwZG93bmFycm93JzonXFx1MjE5NScsJ1VwZG93bmFycm93JzonXFx1MjFENScsJ1VwRG93bkFycm93JzonXFx1MjE5NScsJ1VwRXF1aWxpYnJpdW0nOidcXHUyOTZFJywndXBoYXJwb29ubGVmdCc6J1xcdTIxQkYnLCd1cGhhcnBvb25yaWdodCc6J1xcdTIxQkUnLCd1cGx1cyc6J1xcdTIyOEUnLCdVcHBlckxlZnRBcnJvdyc6J1xcdTIxOTYnLCdVcHBlclJpZ2h0QXJyb3cnOidcXHUyMTk3JywndXBzaSc6J1xcdTAzQzUnLCdVcHNpJzonXFx1MDNEMicsJ3Vwc2loJzonXFx1MDNEMicsJ3Vwc2lsb24nOidcXHUwM0M1JywnVXBzaWxvbic6J1xcdTAzQTUnLCdVcFRlZSc6J1xcdTIyQTUnLCdVcFRlZUFycm93JzonXFx1MjFBNScsJ3VwdXBhcnJvd3MnOidcXHUyMUM4JywndXJjb3JuJzonXFx1MjMxRCcsJ3VyY29ybmVyJzonXFx1MjMxRCcsJ3VyY3JvcCc6J1xcdTIzMEUnLCd1cmluZyc6J1xcdTAxNkYnLCdVcmluZyc6J1xcdTAxNkUnLCd1cnRyaSc6J1xcdTI1RjknLCd1c2NyJzonXFx1RDgzNVxcdURDQ0EnLCdVc2NyJzonXFx1RDgzNVxcdURDQjAnLCd1dGRvdCc6J1xcdTIyRjAnLCd1dGlsZGUnOidcXHUwMTY5JywnVXRpbGRlJzonXFx1MDE2OCcsJ3V0cmknOidcXHUyNUI1JywndXRyaWYnOidcXHUyNUI0JywndXVhcnInOidcXHUyMUM4JywndXVtbCc6J1xceEZDJywnVXVtbCc6J1xceERDJywndXdhbmdsZSc6J1xcdTI5QTcnLCd2YW5ncnQnOidcXHUyOTlDJywndmFyZXBzaWxvbic6J1xcdTAzRjUnLCd2YXJrYXBwYSc6J1xcdTAzRjAnLCd2YXJub3RoaW5nJzonXFx1MjIwNScsJ3ZhcnBoaSc6J1xcdTAzRDUnLCd2YXJwaSc6J1xcdTAzRDYnLCd2YXJwcm9wdG8nOidcXHUyMjFEJywndmFycic6J1xcdTIxOTUnLCd2QXJyJzonXFx1MjFENScsJ3ZhcnJobyc6J1xcdTAzRjEnLCd2YXJzaWdtYSc6J1xcdTAzQzInLCd2YXJzdWJzZXRuZXEnOidcXHUyMjhBXFx1RkUwMCcsJ3ZhcnN1YnNldG5lcXEnOidcXHUyQUNCXFx1RkUwMCcsJ3ZhcnN1cHNldG5lcSc6J1xcdTIyOEJcXHVGRTAwJywndmFyc3Vwc2V0bmVxcSc6J1xcdTJBQ0NcXHVGRTAwJywndmFydGhldGEnOidcXHUwM0QxJywndmFydHJpYW5nbGVsZWZ0JzonXFx1MjJCMicsJ3ZhcnRyaWFuZ2xlcmlnaHQnOidcXHUyMkIzJywndkJhcic6J1xcdTJBRTgnLCdWYmFyJzonXFx1MkFFQicsJ3ZCYXJ2JzonXFx1MkFFOScsJ3ZjeSc6J1xcdTA0MzInLCdWY3knOidcXHUwNDEyJywndmRhc2gnOidcXHUyMkEyJywndkRhc2gnOidcXHUyMkE4JywnVmRhc2gnOidcXHUyMkE5JywnVkRhc2gnOidcXHUyMkFCJywnVmRhc2hsJzonXFx1MkFFNicsJ3ZlZSc6J1xcdTIyMjgnLCdWZWUnOidcXHUyMkMxJywndmVlYmFyJzonXFx1MjJCQicsJ3ZlZWVxJzonXFx1MjI1QScsJ3ZlbGxpcCc6J1xcdTIyRUUnLCd2ZXJiYXInOid8JywnVmVyYmFyJzonXFx1MjAxNicsJ3ZlcnQnOid8JywnVmVydCc6J1xcdTIwMTYnLCdWZXJ0aWNhbEJhcic6J1xcdTIyMjMnLCdWZXJ0aWNhbExpbmUnOid8JywnVmVydGljYWxTZXBhcmF0b3InOidcXHUyNzU4JywnVmVydGljYWxUaWxkZSc6J1xcdTIyNDAnLCdWZXJ5VGhpblNwYWNlJzonXFx1MjAwQScsJ3Zmcic6J1xcdUQ4MzVcXHVERDMzJywnVmZyJzonXFx1RDgzNVxcdUREMTknLCd2bHRyaSc6J1xcdTIyQjInLCd2bnN1Yic6J1xcdTIyODJcXHUyMEQyJywndm5zdXAnOidcXHUyMjgzXFx1MjBEMicsJ3ZvcGYnOidcXHVEODM1XFx1REQ2NycsJ1ZvcGYnOidcXHVEODM1XFx1REQ0RCcsJ3Zwcm9wJzonXFx1MjIxRCcsJ3ZydHJpJzonXFx1MjJCMycsJ3ZzY3InOidcXHVEODM1XFx1RENDQicsJ1ZzY3InOidcXHVEODM1XFx1RENCMScsJ3ZzdWJuZSc6J1xcdTIyOEFcXHVGRTAwJywndnN1Ym5FJzonXFx1MkFDQlxcdUZFMDAnLCd2c3VwbmUnOidcXHUyMjhCXFx1RkUwMCcsJ3ZzdXBuRSc6J1xcdTJBQ0NcXHVGRTAwJywnVnZkYXNoJzonXFx1MjJBQScsJ3Z6aWd6YWcnOidcXHUyOTlBJywnd2NpcmMnOidcXHUwMTc1JywnV2NpcmMnOidcXHUwMTc0Jywnd2VkYmFyJzonXFx1MkE1RicsJ3dlZGdlJzonXFx1MjIyNycsJ1dlZGdlJzonXFx1MjJDMCcsJ3dlZGdlcSc6J1xcdTIyNTknLCd3ZWllcnAnOidcXHUyMTE4Jywnd2ZyJzonXFx1RDgzNVxcdUREMzQnLCdXZnInOidcXHVEODM1XFx1REQxQScsJ3dvcGYnOidcXHVEODM1XFx1REQ2OCcsJ1dvcGYnOidcXHVEODM1XFx1REQ0RScsJ3dwJzonXFx1MjExOCcsJ3dyJzonXFx1MjI0MCcsJ3dyZWF0aCc6J1xcdTIyNDAnLCd3c2NyJzonXFx1RDgzNVxcdURDQ0MnLCdXc2NyJzonXFx1RDgzNVxcdURDQjInLCd4Y2FwJzonXFx1MjJDMicsJ3hjaXJjJzonXFx1MjVFRicsJ3hjdXAnOidcXHUyMkMzJywneGR0cmknOidcXHUyNUJEJywneGZyJzonXFx1RDgzNVxcdUREMzUnLCdYZnInOidcXHVEODM1XFx1REQxQicsJ3hoYXJyJzonXFx1MjdGNycsJ3hoQXJyJzonXFx1MjdGQScsJ3hpJzonXFx1MDNCRScsJ1hpJzonXFx1MDM5RScsJ3hsYXJyJzonXFx1MjdGNScsJ3hsQXJyJzonXFx1MjdGOCcsJ3htYXAnOidcXHUyN0ZDJywneG5pcyc6J1xcdTIyRkInLCd4b2RvdCc6J1xcdTJBMDAnLCd4b3BmJzonXFx1RDgzNVxcdURENjknLCdYb3BmJzonXFx1RDgzNVxcdURENEYnLCd4b3BsdXMnOidcXHUyQTAxJywneG90aW1lJzonXFx1MkEwMicsJ3hyYXJyJzonXFx1MjdGNicsJ3hyQXJyJzonXFx1MjdGOScsJ3hzY3InOidcXHVEODM1XFx1RENDRCcsJ1hzY3InOidcXHVEODM1XFx1RENCMycsJ3hzcWN1cCc6J1xcdTJBMDYnLCd4dXBsdXMnOidcXHUyQTA0JywneHV0cmknOidcXHUyNUIzJywneHZlZSc6J1xcdTIyQzEnLCd4d2VkZ2UnOidcXHUyMkMwJywneWFjdXRlJzonXFx4RkQnLCdZYWN1dGUnOidcXHhERCcsJ3lhY3knOidcXHUwNDRGJywnWUFjeSc6J1xcdTA0MkYnLCd5Y2lyYyc6J1xcdTAxNzcnLCdZY2lyYyc6J1xcdTAxNzYnLCd5Y3knOidcXHUwNDRCJywnWWN5JzonXFx1MDQyQicsJ3llbic6J1xceEE1JywneWZyJzonXFx1RDgzNVxcdUREMzYnLCdZZnInOidcXHVEODM1XFx1REQxQycsJ3lpY3knOidcXHUwNDU3JywnWUljeSc6J1xcdTA0MDcnLCd5b3BmJzonXFx1RDgzNVxcdURENkEnLCdZb3BmJzonXFx1RDgzNVxcdURENTAnLCd5c2NyJzonXFx1RDgzNVxcdURDQ0UnLCdZc2NyJzonXFx1RDgzNVxcdURDQjQnLCd5dWN5JzonXFx1MDQ0RScsJ1lVY3knOidcXHUwNDJFJywneXVtbCc6J1xceEZGJywnWXVtbCc6J1xcdTAxNzgnLCd6YWN1dGUnOidcXHUwMTdBJywnWmFjdXRlJzonXFx1MDE3OScsJ3pjYXJvbic6J1xcdTAxN0UnLCdaY2Fyb24nOidcXHUwMTdEJywnemN5JzonXFx1MDQzNycsJ1pjeSc6J1xcdTA0MTcnLCd6ZG90JzonXFx1MDE3QycsJ1pkb3QnOidcXHUwMTdCJywnemVldHJmJzonXFx1MjEyOCcsJ1plcm9XaWR0aFNwYWNlJzonXFx1MjAwQicsJ3pldGEnOidcXHUwM0I2JywnWmV0YSc6J1xcdTAzOTYnLCd6ZnInOidcXHVEODM1XFx1REQzNycsJ1pmcic6J1xcdTIxMjgnLCd6aGN5JzonXFx1MDQzNicsJ1pIY3knOidcXHUwNDE2JywnemlncmFycic6J1xcdTIxREQnLCd6b3BmJzonXFx1RDgzNVxcdURENkInLCdab3BmJzonXFx1MjEyNCcsJ3pzY3InOidcXHVEODM1XFx1RENDRicsJ1pzY3InOidcXHVEODM1XFx1RENCNScsJ3p3aic6J1xcdTIwMEQnLCd6d25qJzonXFx1MjAwQyd9O1xuXHR2YXIgZGVjb2RlTWFwTGVnYWN5ID0geydhYWN1dGUnOidcXHhFMScsJ0FhY3V0ZSc6J1xceEMxJywnYWNpcmMnOidcXHhFMicsJ0FjaXJjJzonXFx4QzInLCdhY3V0ZSc6J1xceEI0JywnYWVsaWcnOidcXHhFNicsJ0FFbGlnJzonXFx4QzYnLCdhZ3JhdmUnOidcXHhFMCcsJ0FncmF2ZSc6J1xceEMwJywnYW1wJzonJicsJ0FNUCc6JyYnLCdhcmluZyc6J1xceEU1JywnQXJpbmcnOidcXHhDNScsJ2F0aWxkZSc6J1xceEUzJywnQXRpbGRlJzonXFx4QzMnLCdhdW1sJzonXFx4RTQnLCdBdW1sJzonXFx4QzQnLCdicnZiYXInOidcXHhBNicsJ2NjZWRpbCc6J1xceEU3JywnQ2NlZGlsJzonXFx4QzcnLCdjZWRpbCc6J1xceEI4JywnY2VudCc6J1xceEEyJywnY29weSc6J1xceEE5JywnQ09QWSc6J1xceEE5JywnY3VycmVuJzonXFx4QTQnLCdkZWcnOidcXHhCMCcsJ2RpdmlkZSc6J1xceEY3JywnZWFjdXRlJzonXFx4RTknLCdFYWN1dGUnOidcXHhDOScsJ2VjaXJjJzonXFx4RUEnLCdFY2lyYyc6J1xceENBJywnZWdyYXZlJzonXFx4RTgnLCdFZ3JhdmUnOidcXHhDOCcsJ2V0aCc6J1xceEYwJywnRVRIJzonXFx4RDAnLCdldW1sJzonXFx4RUInLCdFdW1sJzonXFx4Q0InLCdmcmFjMTInOidcXHhCRCcsJ2ZyYWMxNCc6J1xceEJDJywnZnJhYzM0JzonXFx4QkUnLCdndCc6Jz4nLCdHVCc6Jz4nLCdpYWN1dGUnOidcXHhFRCcsJ0lhY3V0ZSc6J1xceENEJywnaWNpcmMnOidcXHhFRScsJ0ljaXJjJzonXFx4Q0UnLCdpZXhjbCc6J1xceEExJywnaWdyYXZlJzonXFx4RUMnLCdJZ3JhdmUnOidcXHhDQycsJ2lxdWVzdCc6J1xceEJGJywnaXVtbCc6J1xceEVGJywnSXVtbCc6J1xceENGJywnbGFxdW8nOidcXHhBQicsJ2x0JzonPCcsJ0xUJzonPCcsJ21hY3InOidcXHhBRicsJ21pY3JvJzonXFx4QjUnLCdtaWRkb3QnOidcXHhCNycsJ25ic3AnOidcXHhBMCcsJ25vdCc6J1xceEFDJywnbnRpbGRlJzonXFx4RjEnLCdOdGlsZGUnOidcXHhEMScsJ29hY3V0ZSc6J1xceEYzJywnT2FjdXRlJzonXFx4RDMnLCdvY2lyYyc6J1xceEY0JywnT2NpcmMnOidcXHhENCcsJ29ncmF2ZSc6J1xceEYyJywnT2dyYXZlJzonXFx4RDInLCdvcmRmJzonXFx4QUEnLCdvcmRtJzonXFx4QkEnLCdvc2xhc2gnOidcXHhGOCcsJ09zbGFzaCc6J1xceEQ4Jywnb3RpbGRlJzonXFx4RjUnLCdPdGlsZGUnOidcXHhENScsJ291bWwnOidcXHhGNicsJ091bWwnOidcXHhENicsJ3BhcmEnOidcXHhCNicsJ3BsdXNtbic6J1xceEIxJywncG91bmQnOidcXHhBMycsJ3F1b3QnOidcIicsJ1FVT1QnOidcIicsJ3JhcXVvJzonXFx4QkInLCdyZWcnOidcXHhBRScsJ1JFRyc6J1xceEFFJywnc2VjdCc6J1xceEE3Jywnc2h5JzonXFx4QUQnLCdzdXAxJzonXFx4QjknLCdzdXAyJzonXFx4QjInLCdzdXAzJzonXFx4QjMnLCdzemxpZyc6J1xceERGJywndGhvcm4nOidcXHhGRScsJ1RIT1JOJzonXFx4REUnLCd0aW1lcyc6J1xceEQ3JywndWFjdXRlJzonXFx4RkEnLCdVYWN1dGUnOidcXHhEQScsJ3VjaXJjJzonXFx4RkInLCdVY2lyYyc6J1xceERCJywndWdyYXZlJzonXFx4RjknLCdVZ3JhdmUnOidcXHhEOScsJ3VtbCc6J1xceEE4JywndXVtbCc6J1xceEZDJywnVXVtbCc6J1xceERDJywneWFjdXRlJzonXFx4RkQnLCdZYWN1dGUnOidcXHhERCcsJ3llbic6J1xceEE1JywneXVtbCc6J1xceEZGJ307XG5cdHZhciBkZWNvZGVNYXBOdW1lcmljID0geycwJzonXFx1RkZGRCcsJzEyOCc6J1xcdTIwQUMnLCcxMzAnOidcXHUyMDFBJywnMTMxJzonXFx1MDE5MicsJzEzMic6J1xcdTIwMUUnLCcxMzMnOidcXHUyMDI2JywnMTM0JzonXFx1MjAyMCcsJzEzNSc6J1xcdTIwMjEnLCcxMzYnOidcXHUwMkM2JywnMTM3JzonXFx1MjAzMCcsJzEzOCc6J1xcdTAxNjAnLCcxMzknOidcXHUyMDM5JywnMTQwJzonXFx1MDE1MicsJzE0Mic6J1xcdTAxN0QnLCcxNDUnOidcXHUyMDE4JywnMTQ2JzonXFx1MjAxOScsJzE0Nyc6J1xcdTIwMUMnLCcxNDgnOidcXHUyMDFEJywnMTQ5JzonXFx1MjAyMicsJzE1MCc6J1xcdTIwMTMnLCcxNTEnOidcXHUyMDE0JywnMTUyJzonXFx1MDJEQycsJzE1Myc6J1xcdTIxMjInLCcxNTQnOidcXHUwMTYxJywnMTU1JzonXFx1MjAzQScsJzE1Nic6J1xcdTAxNTMnLCcxNTgnOidcXHUwMTdFJywnMTU5JzonXFx1MDE3OCd9O1xuXHR2YXIgaW52YWxpZFJlZmVyZW5jZUNvZGVQb2ludHMgPSBbMSwyLDMsNCw1LDYsNyw4LDExLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDEyNywxMjgsMTI5LDEzMCwxMzEsMTMyLDEzMywxMzQsMTM1LDEzNiwxMzcsMTM4LDEzOSwxNDAsMTQxLDE0MiwxNDMsMTQ0LDE0NSwxNDYsMTQ3LDE0OCwxNDksMTUwLDE1MSwxNTIsMTUzLDE1NCwxNTUsMTU2LDE1NywxNTgsMTU5LDY0OTc2LDY0OTc3LDY0OTc4LDY0OTc5LDY0OTgwLDY0OTgxLDY0OTgyLDY0OTgzLDY0OTg0LDY0OTg1LDY0OTg2LDY0OTg3LDY0OTg4LDY0OTg5LDY0OTkwLDY0OTkxLDY0OTkyLDY0OTkzLDY0OTk0LDY0OTk1LDY0OTk2LDY0OTk3LDY0OTk4LDY0OTk5LDY1MDAwLDY1MDAxLDY1MDAyLDY1MDAzLDY1MDA0LDY1MDA1LDY1MDA2LDY1MDA3LDY1NTM0LDY1NTM1LDEzMTA3MCwxMzEwNzEsMTk2NjA2LDE5NjYwNywyNjIxNDIsMjYyMTQzLDMyNzY3OCwzMjc2NzksMzkzMjE0LDM5MzIxNSw0NTg3NTAsNDU4NzUxLDUyNDI4Niw1MjQyODcsNTg5ODIyLDU4OTgyMyw2NTUzNTgsNjU1MzU5LDcyMDg5NCw3MjA4OTUsNzg2NDMwLDc4NjQzMSw4NTE5NjYsODUxOTY3LDkxNzUwMiw5MTc1MDMsOTgzMDM4LDk4MzAzOSwxMDQ4NTc0LDEwNDg1NzUsMTExNDExMCwxMTE0MTExXTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgc3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuXHR2YXIgb2JqZWN0ID0ge307XG5cdHZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdC5oYXNPd25Qcm9wZXJ0eTtcblx0dmFyIGhhcyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHlOYW1lKSB7XG5cdFx0cmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eU5hbWUpO1xuXHR9O1xuXG5cdHZhciBjb250YWlucyA9IGZ1bmN0aW9uKGFycmF5LCB2YWx1ZSkge1xuXHRcdHZhciBpbmRleCA9IC0xO1xuXHRcdHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG5cdFx0d2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcblx0XHRcdGlmIChhcnJheVtpbmRleF0gPT0gdmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXHR2YXIgbWVyZ2UgPSBmdW5jdGlvbihvcHRpb25zLCBkZWZhdWx0cykge1xuXHRcdGlmICghb3B0aW9ucykge1xuXHRcdFx0cmV0dXJuIGRlZmF1bHRzO1xuXHRcdH1cblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0dmFyIGtleTtcblx0XHRmb3IgKGtleSBpbiBkZWZhdWx0cykge1xuXHRcdFx0Ly8gQSBgaGFzT3duUHJvcGVydHlgIGNoZWNrIGlzIG5vdCBuZWVkZWQgaGVyZSwgc2luY2Ugb25seSByZWNvZ25pemVkXG5cdFx0XHQvLyBvcHRpb24gbmFtZXMgYXJlIHVzZWQgYW55d2F5LiBBbnkgb3RoZXJzIGFyZSBpZ25vcmVkLlxuXHRcdFx0cmVzdWx0W2tleV0gPSBoYXMob3B0aW9ucywga2V5KSA/IG9wdGlvbnNba2V5XSA6IGRlZmF1bHRzW2tleV07XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH07XG5cblx0Ly8gTW9kaWZpZWQgdmVyc2lvbiBvZiBgdWNzMmVuY29kZWA7IHNlZSBodHRwczovL210aHMuYmUvcHVueWNvZGUuXG5cdHZhciBjb2RlUG9pbnRUb1N5bWJvbCA9IGZ1bmN0aW9uKGNvZGVQb2ludCwgc3RyaWN0KSB7XG5cdFx0dmFyIG91dHB1dCA9ICcnO1xuXHRcdGlmICgoY29kZVBvaW50ID49IDB4RDgwMCAmJiBjb2RlUG9pbnQgPD0gMHhERkZGKSB8fCBjb2RlUG9pbnQgPiAweDEwRkZGRikge1xuXHRcdFx0Ly8gU2VlIGlzc3VlICM0OlxuXHRcdFx0Ly8g4oCcT3RoZXJ3aXNlLCBpZiB0aGUgbnVtYmVyIGlzIGluIHRoZSByYW5nZSAweEQ4MDAgdG8gMHhERkZGIG9yIGlzXG5cdFx0XHQvLyBncmVhdGVyIHRoYW4gMHgxMEZGRkYsIHRoZW4gdGhpcyBpcyBhIHBhcnNlIGVycm9yLiBSZXR1cm4gYSBVK0ZGRkRcblx0XHRcdC8vIFJFUExBQ0VNRU5UIENIQVJBQ1RFUi7igJ1cblx0XHRcdGlmIChzdHJpY3QpIHtcblx0XHRcdFx0cGFyc2VFcnJvcignY2hhcmFjdGVyIHJlZmVyZW5jZSBvdXRzaWRlIHRoZSBwZXJtaXNzaWJsZSBVbmljb2RlIHJhbmdlJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJ1xcdUZGRkQnO1xuXHRcdH1cblx0XHRpZiAoaGFzKGRlY29kZU1hcE51bWVyaWMsIGNvZGVQb2ludCkpIHtcblx0XHRcdGlmIChzdHJpY3QpIHtcblx0XHRcdFx0cGFyc2VFcnJvcignZGlzYWxsb3dlZCBjaGFyYWN0ZXIgcmVmZXJlbmNlJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZGVjb2RlTWFwTnVtZXJpY1tjb2RlUG9pbnRdO1xuXHRcdH1cblx0XHRpZiAoc3RyaWN0ICYmIGNvbnRhaW5zKGludmFsaWRSZWZlcmVuY2VDb2RlUG9pbnRzLCBjb2RlUG9pbnQpKSB7XG5cdFx0XHRwYXJzZUVycm9yKCdkaXNhbGxvd2VkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHR9XG5cdFx0aWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuXHRcdFx0Y29kZVBvaW50IC09IDB4MTAwMDA7XG5cdFx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRjtcblx0XHR9XG5cdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQpO1xuXHRcdHJldHVybiBvdXRwdXQ7XG5cdH07XG5cblx0dmFyIGhleEVzY2FwZSA9IGZ1bmN0aW9uKGNvZGVQb2ludCkge1xuXHRcdHJldHVybiAnJiN4JyArIGNvZGVQb2ludC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKSArICc7Jztcblx0fTtcblxuXHR2YXIgZGVjRXNjYXBlID0gZnVuY3Rpb24oY29kZVBvaW50KSB7XG5cdFx0cmV0dXJuICcmIycgKyBjb2RlUG9pbnQgKyAnOyc7XG5cdH07XG5cblx0dmFyIHBhcnNlRXJyb3IgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG5cdFx0dGhyb3cgRXJyb3IoJ1BhcnNlIGVycm9yOiAnICsgbWVzc2FnZSk7XG5cdH07XG5cblx0LyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cblx0dmFyIGVuY29kZSA9IGZ1bmN0aW9uKHN0cmluZywgb3B0aW9ucykge1xuXHRcdG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBlbmNvZGUub3B0aW9ucyk7XG5cdFx0dmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0O1xuXHRcdGlmIChzdHJpY3QgJiYgcmVnZXhJbnZhbGlkUmF3Q29kZVBvaW50LnRlc3Qoc3RyaW5nKSkge1xuXHRcdFx0cGFyc2VFcnJvcignZm9yYmlkZGVuIGNvZGUgcG9pbnQnKTtcblx0XHR9XG5cdFx0dmFyIGVuY29kZUV2ZXJ5dGhpbmcgPSBvcHRpb25zLmVuY29kZUV2ZXJ5dGhpbmc7XG5cdFx0dmFyIHVzZU5hbWVkUmVmZXJlbmNlcyA9IG9wdGlvbnMudXNlTmFtZWRSZWZlcmVuY2VzO1xuXHRcdHZhciBhbGxvd1Vuc2FmZVN5bWJvbHMgPSBvcHRpb25zLmFsbG93VW5zYWZlU3ltYm9scztcblx0XHR2YXIgZXNjYXBlQ29kZVBvaW50ID0gb3B0aW9ucy5kZWNpbWFsID8gZGVjRXNjYXBlIDogaGV4RXNjYXBlO1xuXG5cdFx0dmFyIGVzY2FwZUJtcFN5bWJvbCA9IGZ1bmN0aW9uKHN5bWJvbCkge1xuXHRcdFx0cmV0dXJuIGVzY2FwZUNvZGVQb2ludChzeW1ib2wuY2hhckNvZGVBdCgwKSk7XG5cdFx0fTtcblxuXHRcdGlmIChlbmNvZGVFdmVyeXRoaW5nKSB7XG5cdFx0XHQvLyBFbmNvZGUgQVNDSUkgc3ltYm9scy5cblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4QXNjaWlXaGl0ZWxpc3QsIGZ1bmN0aW9uKHN5bWJvbCkge1xuXHRcdFx0XHQvLyBVc2UgbmFtZWQgcmVmZXJlbmNlcyBpZiByZXF1ZXN0ZWQgJiBwb3NzaWJsZS5cblx0XHRcdFx0aWYgKHVzZU5hbWVkUmVmZXJlbmNlcyAmJiBoYXMoZW5jb2RlTWFwLCBzeW1ib2wpKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzeW1ib2xdICsgJzsnO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBlc2NhcGVCbXBTeW1ib2woc3ltYm9sKTtcblx0XHRcdH0pO1xuXHRcdFx0Ly8gU2hvcnRlbiBhIGZldyBlc2NhcGVzIHRoYXQgcmVwcmVzZW50IHR3byBzeW1ib2xzLCBvZiB3aGljaCBhdCBsZWFzdCBvbmVcblx0XHRcdC8vIGlzIHdpdGhpbiB0aGUgQVNDSUkgcmFuZ2UuXG5cdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzKSB7XG5cdFx0XHRcdHN0cmluZyA9IHN0cmluZ1xuXHRcdFx0XHRcdC5yZXBsYWNlKC8mZ3Q7XFx1MjBEMi9nLCAnJm52Z3Q7Jylcblx0XHRcdFx0XHQucmVwbGFjZSgvJmx0O1xcdTIwRDIvZywgJyZudmx0OycpXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyYjeDY2OyYjeDZBOy9nLCAnJmZqbGlnOycpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRW5jb2RlIG5vbi1BU0NJSSBzeW1ib2xzLlxuXHRcdFx0aWYgKHVzZU5hbWVkUmVmZXJlbmNlcykge1xuXHRcdFx0XHQvLyBFbmNvZGUgbm9uLUFTQ0lJIHN5bWJvbHMgdGhhdCBjYW4gYmUgcmVwbGFjZWQgd2l0aCBhIG5hbWVkIHJlZmVyZW5jZS5cblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFbmNvZGVOb25Bc2NpaSwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGVuY29kZU1hcCwgc3RyaW5nKWAgaGVyZS5cblx0XHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N0cmluZ10gKyAnOyc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTm90ZTogYW55IHJlbWFpbmluZyBub24tQVNDSUkgc3ltYm9scyBhcmUgaGFuZGxlZCBvdXRzaWRlIG9mIHRoZSBgaWZgLlxuXHRcdH0gZWxzZSBpZiAodXNlTmFtZWRSZWZlcmVuY2VzKSB7XG5cdFx0XHQvLyBBcHBseSBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcy5cblx0XHRcdC8vIEVuY29kZSBgPD5cIicmYCB1c2luZyBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcy5cblx0XHRcdGlmICghYWxsb3dVbnNhZmVTeW1ib2xzKSB7XG5cdFx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RXNjYXBlLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N0cmluZ10gKyAnOyc7IC8vIG5vIG5lZWQgdG8gY2hlY2sgYGhhcygpYCBoZXJlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gU2hvcnRlbiBlc2NhcGVzIHRoYXQgcmVwcmVzZW50IHR3byBzeW1ib2xzLCBvZiB3aGljaCBhdCBsZWFzdCBvbmUgaXNcblx0XHRcdC8vIGA8PlwiJyZgLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nXG5cdFx0XHRcdC5yZXBsYWNlKC8mZ3Q7XFx1MjBEMi9nLCAnJm52Z3Q7Jylcblx0XHRcdFx0LnJlcGxhY2UoLyZsdDtcXHUyMEQyL2csICcmbnZsdDsnKTtcblx0XHRcdC8vIEVuY29kZSBub24tQVNDSUkgc3ltYm9scyB0aGF0IGNhbiBiZSByZXBsYWNlZCB3aXRoIGEgbmFtZWQgcmVmZXJlbmNlLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFbmNvZGVOb25Bc2NpaSwgZnVuY3Rpb24oc3RyaW5nKSB7XG5cdFx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhlbmNvZGVNYXAsIHN0cmluZylgIGhlcmUuXG5cdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7Jztcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoIWFsbG93VW5zYWZlU3ltYm9scykge1xuXHRcdFx0Ly8gRW5jb2RlIGA8PlwiJyZgIHVzaW5nIGhleGFkZWNpbWFsIGVzY2FwZXMsIG5vdyB0aGF0IHRoZXnigJlyZSBub3QgaGFuZGxlZFxuXHRcdFx0Ly8gdXNpbmcgbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZXMuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVzY2FwZSwgZXNjYXBlQm1wU3ltYm9sKTtcblx0XHR9XG5cdFx0cmV0dXJuIHN0cmluZ1xuXHRcdFx0Ly8gRW5jb2RlIGFzdHJhbCBzeW1ib2xzLlxuXHRcdFx0LnJlcGxhY2UocmVnZXhBc3RyYWxTeW1ib2xzLCBmdW5jdGlvbigkMCkge1xuXHRcdFx0XHQvLyBodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZyNzdXJyb2dhdGUtZm9ybXVsYWVcblx0XHRcdFx0dmFyIGhpZ2ggPSAkMC5jaGFyQ29kZUF0KDApO1xuXHRcdFx0XHR2YXIgbG93ID0gJDAuY2hhckNvZGVBdCgxKTtcblx0XHRcdFx0dmFyIGNvZGVQb2ludCA9IChoaWdoIC0gMHhEODAwKSAqIDB4NDAwICsgbG93IC0gMHhEQzAwICsgMHgxMDAwMDtcblx0XHRcdFx0cmV0dXJuIGVzY2FwZUNvZGVQb2ludChjb2RlUG9pbnQpO1xuXHRcdFx0fSlcblx0XHRcdC8vIEVuY29kZSBhbnkgcmVtYWluaW5nIEJNUCBzeW1ib2xzIHRoYXQgYXJlIG5vdCBwcmludGFibGUgQVNDSUkgc3ltYm9sc1xuXHRcdFx0Ly8gdXNpbmcgYSBoZXhhZGVjaW1hbCBlc2NhcGUuXG5cdFx0XHQucmVwbGFjZShyZWdleEJtcFdoaXRlbGlzdCwgZXNjYXBlQm1wU3ltYm9sKTtcblx0fTtcblx0Ly8gRXhwb3NlIGRlZmF1bHQgb3B0aW9ucyAoc28gdGhleSBjYW4gYmUgb3ZlcnJpZGRlbiBnbG9iYWxseSkuXG5cdGVuY29kZS5vcHRpb25zID0ge1xuXHRcdCdhbGxvd1Vuc2FmZVN5bWJvbHMnOiBmYWxzZSxcblx0XHQnZW5jb2RlRXZlcnl0aGluZyc6IGZhbHNlLFxuXHRcdCdzdHJpY3QnOiBmYWxzZSxcblx0XHQndXNlTmFtZWRSZWZlcmVuY2VzJzogZmFsc2UsXG5cdFx0J2RlY2ltYWwnIDogZmFsc2Vcblx0fTtcblxuXHR2YXIgZGVjb2RlID0gZnVuY3Rpb24oaHRtbCwgb3B0aW9ucykge1xuXHRcdG9wdGlvbnMgPSBtZXJnZShvcHRpb25zLCBkZWNvZGUub3B0aW9ucyk7XG5cdFx0dmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0O1xuXHRcdGlmIChzdHJpY3QgJiYgcmVnZXhJbnZhbGlkRW50aXR5LnRlc3QoaHRtbCkpIHtcblx0XHRcdHBhcnNlRXJyb3IoJ21hbGZvcm1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlJyk7XG5cdFx0fVxuXHRcdHJldHVybiBodG1sLnJlcGxhY2UocmVnZXhEZWNvZGUsIGZ1bmN0aW9uKCQwLCAkMSwgJDIsICQzLCAkNCwgJDUsICQ2LCAkNywgJDgpIHtcblx0XHRcdHZhciBjb2RlUG9pbnQ7XG5cdFx0XHR2YXIgc2VtaWNvbG9uO1xuXHRcdFx0dmFyIGRlY0RpZ2l0cztcblx0XHRcdHZhciBoZXhEaWdpdHM7XG5cdFx0XHR2YXIgcmVmZXJlbmNlO1xuXHRcdFx0dmFyIG5leHQ7XG5cblx0XHRcdGlmICgkMSkge1xuXHRcdFx0XHRyZWZlcmVuY2UgPSAkMTtcblx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGRlY29kZU1hcCwgcmVmZXJlbmNlKWAuXG5cdFx0XHRcdHJldHVybiBkZWNvZGVNYXBbcmVmZXJlbmNlXTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCQyKSB7XG5cdFx0XHRcdC8vIERlY29kZSBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcyB3aXRob3V0IHRyYWlsaW5nIGA7YCwgZS5nLiBgJmFtcGAuXG5cdFx0XHRcdC8vIFRoaXMgaXMgb25seSBhIHBhcnNlIGVycm9yIGlmIGl0IGdldHMgY29udmVydGVkIHRvIGAmYCwgb3IgaWYgaXQgaXNcblx0XHRcdFx0Ly8gZm9sbG93ZWQgYnkgYD1gIGluIGFuIGF0dHJpYnV0ZSBjb250ZXh0LlxuXHRcdFx0XHRyZWZlcmVuY2UgPSAkMjtcblx0XHRcdFx0bmV4dCA9ICQzO1xuXHRcdFx0XHRpZiAobmV4dCAmJiBvcHRpb25zLmlzQXR0cmlidXRlVmFsdWUpIHtcblx0XHRcdFx0XHRpZiAoc3RyaWN0ICYmIG5leHQgPT0gJz0nKSB7XG5cdFx0XHRcdFx0XHRwYXJzZUVycm9yKCdgJmAgZGlkIG5vdCBzdGFydCBhIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuICQwO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGlmIChzdHJpY3QpIHtcblx0XHRcdFx0XHRcdHBhcnNlRXJyb3IoXG5cdFx0XHRcdFx0XHRcdCduYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbidcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhkZWNvZGVNYXBMZWdhY3ksIHJlZmVyZW5jZSlgLlxuXHRcdFx0XHRcdHJldHVybiBkZWNvZGVNYXBMZWdhY3lbcmVmZXJlbmNlXSArIChuZXh0IHx8ICcnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJDQpIHtcblx0XHRcdFx0Ly8gRGVjb2RlIGRlY2ltYWwgZXNjYXBlcywgZS5nLiBgJiMxMTk1NTg7YC5cblx0XHRcdFx0ZGVjRGlnaXRzID0gJDQ7XG5cdFx0XHRcdHNlbWljb2xvbiA9ICQ1O1xuXHRcdFx0XHRpZiAoc3RyaWN0ICYmICFzZW1pY29sb24pIHtcblx0XHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvZGVQb2ludCA9IHBhcnNlSW50KGRlY0RpZ2l0cywgMTApO1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50VG9TeW1ib2woY29kZVBvaW50LCBzdHJpY3QpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJDYpIHtcblx0XHRcdFx0Ly8gRGVjb2RlIGhleGFkZWNpbWFsIGVzY2FwZXMsIGUuZy4gYCYjeDFEMzA2O2AuXG5cdFx0XHRcdGhleERpZ2l0cyA9ICQ2O1xuXHRcdFx0XHRzZW1pY29sb24gPSAkNztcblx0XHRcdFx0aWYgKHN0cmljdCAmJiAhc2VtaWNvbG9uKSB7XG5cdFx0XHRcdFx0cGFyc2VFcnJvcignY2hhcmFjdGVyIHJlZmVyZW5jZSB3YXMgbm90IHRlcm1pbmF0ZWQgYnkgYSBzZW1pY29sb24nKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb2RlUG9pbnQgPSBwYXJzZUludChoZXhEaWdpdHMsIDE2KTtcblx0XHRcdFx0cmV0dXJuIGNvZGVQb2ludFRvU3ltYm9sKGNvZGVQb2ludCwgc3RyaWN0KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgd2XigJlyZSBzdGlsbCBoZXJlLCBgaWYgKCQ3KWAgaXMgaW1wbGllZDsgaXTigJlzIGFuIGFtYmlndW91c1xuXHRcdFx0Ly8gYW1wZXJzYW5kIGZvciBzdXJlLiBodHRwczovL210aHMuYmUvbm90ZXMvYW1iaWd1b3VzLWFtcGVyc2FuZHNcblx0XHRcdGlmIChzdHJpY3QpIHtcblx0XHRcdFx0cGFyc2VFcnJvcihcblx0XHRcdFx0XHQnbmFtZWQgY2hhcmFjdGVyIHJlZmVyZW5jZSB3YXMgbm90IHRlcm1pbmF0ZWQgYnkgYSBzZW1pY29sb24nXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gJDA7XG5cdFx0fSk7XG5cdH07XG5cdC8vIEV4cG9zZSBkZWZhdWx0IG9wdGlvbnMgKHNvIHRoZXkgY2FuIGJlIG92ZXJyaWRkZW4gZ2xvYmFsbHkpLlxuXHRkZWNvZGUub3B0aW9ucyA9IHtcblx0XHQnaXNBdHRyaWJ1dGVWYWx1ZSc6IGZhbHNlLFxuXHRcdCdzdHJpY3QnOiBmYWxzZVxuXHR9O1xuXG5cdHZhciBlc2NhcGUgPSBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRyZXR1cm4gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGZ1bmN0aW9uKCQwKSB7XG5cdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZXNjYXBlTWFwLCAkMClgIGhlcmUuXG5cdFx0XHRyZXR1cm4gZXNjYXBlTWFwWyQwXTtcblx0XHR9KTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgaGUgPSB7XG5cdFx0J3ZlcnNpb24nOiAnMS4yLjAnLFxuXHRcdCdlbmNvZGUnOiBlbmNvZGUsXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZXNjYXBlJzogZXNjYXBlLFxuXHRcdCd1bmVzY2FwZSc6IGRlY29kZVxuXHR9O1xuXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIGhlO1xuXHRcdH0pO1xuXHR9XHRlbHNlIGlmIChmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpIHtcblx0XHRpZiAoZnJlZU1vZHVsZSkgeyAvLyBpbiBOb2RlLmpzLCBpby5qcywgb3IgUmluZ29KUyB2MC44LjArXG5cdFx0XHRmcmVlTW9kdWxlLmV4cG9ydHMgPSBoZTtcblx0XHR9IGVsc2UgeyAvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yICh2YXIga2V5IGluIGhlKSB7XG5cdFx0XHRcdGhhcyhoZSwga2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IGhlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3NlclxuXHRcdHJvb3QuaGUgPSBoZTtcblx0fVxuXG59KHRoaXMpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IHtKc29uMkNzdn0gPSByZXF1aXJlKCcuL2pzb24yY3N2JyksIC8vIFJlcXVpcmUgb3VyIGpzb24tMi1jc3YgY29kZVxuICAgIHtDc3YySnNvbn0gPSByZXF1aXJlKCcuL2NzdjJqc29uJyksIC8vIFJlcXVpcmUgb3VyIGNzdi0yLWpzb24gY29kZVxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBqc29uMmNzdjogKGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSA9PiBjb252ZXJ0KEpzb24yQ3N2LCBkYXRhLCBjYWxsYmFjaywgb3B0aW9ucyksXG4gICAgY3N2Mmpzb246IChkYXRhLCBjYWxsYmFjaywgb3B0aW9ucykgPT4gY29udmVydChDc3YySnNvbiwgZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpLFxuICAgIGpzb24yY3N2QXN5bmM6IChqc29uLCBvcHRpb25zKSA9PiBjb252ZXJ0QXN5bmMoSnNvbjJDc3YsIGpzb24sIG9wdGlvbnMpLFxuICAgIGNzdjJqc29uQXN5bmM6IChjc3YsIG9wdGlvbnMpID0+IGNvbnZlcnRBc3luYyhDc3YySnNvbiwgY3N2LCBvcHRpb25zKSxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFNpbmNlIHYzLjAuMFxuICAgICAqL1xuICAgIGpzb24yY3N2UHJvbWlzaWZpZWQ6IChqc29uLCBvcHRpb25zKSA9PiBkZXByZWNhdGVkQXN5bmMoSnNvbjJDc3YsICdqc29uMmNzdlByb21pc2lmaWVkKCknLCAnanNvbjJjc3ZBc3luYygpJywganNvbiwgb3B0aW9ucyksXG5cbiAgICAvKipcbiAgICAgKiBAZGVwcmVjYXRlZCBTaW5jZSB2My4wLjBcbiAgICAgKi9cbiAgICBjc3YyanNvblByb21pc2lmaWVkOiAoY3N2LCBvcHRpb25zKSA9PiBkZXByZWNhdGVkQXN5bmMoQ3N2Mkpzb24sICdjc3YyanNvblByb21pc2lmaWVkKCknLCAnY3N2Mmpzb25Bc3luYygpJywgY3N2LCBvcHRpb25zKVxufTtcblxuLyoqXG4gKiBBYnN0cmFjdGVkIGNvbnZlcnRlciBmdW5jdGlvbiBmb3IganNvbjJjc3YgYW5kIGNzdjJqc29uIGZ1bmN0aW9uYWxpdHlcbiAqIFRha2VzIGluIHRoZSBjb252ZXJ0ZXIgdG8gYmUgdXNlZCAoZWl0aGVyIEpzb24yQ3N2IG9yIENzdjJKc29uKVxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBjYWxsYmFja1xuICogQHBhcmFtIG9wdGlvbnNcbiAqL1xuZnVuY3Rpb24gY29udmVydChjb252ZXJ0ZXIsIGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHV0aWxzLmNvbnZlcnQoe1xuICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgY29udmVydGVyOiBjb252ZXJ0ZXJcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBTaW1wbGUgd2F5IHRvIHByb21pc2lmeSBhIGNhbGxiYWNrIHZlcnNpb24gb2YganNvbjJjc3Ygb3IgY3N2Mmpzb25cbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBkYXRhXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge1Byb21pc2U8YW55Pn1cbiAqL1xuZnVuY3Rpb24gY29udmVydEFzeW5jKGNvbnZlcnRlciwgZGF0YSwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBjb252ZXJ0KGNvbnZlcnRlciwgZGF0YSwgKGVyciwgZGF0YSkgPT4ge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVqZWN0KGVycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc29sdmUoZGF0YSk7XG4gICAgfSwgb3B0aW9ucykpO1xufVxuXG4vKipcbiAqIFNpbXBsZSB3YXkgdG8gcHJvdmlkZSBhIGRlcHJlY2F0aW9uIHdhcm5pbmcgZm9yIHByZXZpb3VzIHByb21pc2lmaWVkIHZlcnNpb25zXG4gKiBvZiBtb2R1bGUgZnVuY3Rpb25hbGl0eS5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBkZXByZWNhdGVkTmFtZVxuICogQHBhcmFtIHJlcGxhY2VtZW50TmFtZVxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICovXG5mdW5jdGlvbiBkZXByZWNhdGVkQXN5bmMoY29udmVydGVyLCBkZXByZWNhdGVkTmFtZSwgcmVwbGFjZW1lbnROYW1lLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiAnICsgZGVwcmVjYXRlZE5hbWUgKyAnIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBzb29uLiBQbGVhc2UgdXNlICcgKyByZXBsYWNlbWVudE5hbWUgKyAnIGluc3RlYWQuJyk7XG4gICAgcmV0dXJuIGNvbnZlcnRBc3luYyhjb252ZXJ0ZXIsIGRhdGEsIG9wdGlvbnMpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanNvbicpLFxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpLFxuICAgIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgcGF0aCA9IHJlcXVpcmUoJ2RvYy1wYXRoJyk7XG5cbmNvbnN0IENzdjJKc29uID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IGVzY2FwZWRXcmFwRGVsaW1pdGVyUmVnZXggPSBuZXcgUmVnRXhwKG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgKyBvcHRpb25zLmRlbGltaXRlci53cmFwLCAnZycpLFxuICAgICAgICBleGNlbEJPTVJlZ2V4ID0gbmV3IFJlZ0V4cCgnXicgKyBjb25zdGFudHMudmFsdWVzLmV4Y2VsQk9NKTtcblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSBoZWFkZXIga2V5LCBpZiBzcGVjaWZpZWQgYnkgdGhlIHVzZXIgdmlhIHRoZSBwcm92aWRlZCBvcHRpb25zXG4gICAgICogQHBhcmFtIGhlYWRlcktleVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb2Nlc3NIZWFkZXJLZXkoaGVhZGVyS2V5KSB7XG4gICAgICAgIGhlYWRlcktleSA9IHJlbW92ZVdyYXBEZWxpbWl0ZXJzRnJvbVZhbHVlKGhlYWRlcktleSk7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1IZWFkZXJGaWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybiBoZWFkZXJLZXkuc3BsaXQoJy4nKVxuICAgICAgICAgICAgICAgIC5tYXAoKGNvbXBvbmVudCkgPT4gY29tcG9uZW50LnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuam9pbignLicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoZWFkZXJLZXk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGUgdGhlIEpTT04gaGVhZGluZyBmcm9tIHRoZSBDU1ZcbiAgICAgKiBAcGFyYW0gbGluZXMge1N0cmluZ1tdfSBjc3YgbGluZXMgc3BsaXQgYnkgRU9MIGRlbGltaXRlclxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlSGVhZGluZyhsaW5lcykge1xuICAgICAgICBsZXQgcGFyYW1zID0ge2xpbmVzfSxcbiAgICAgICAgICAgIC8vIEdlbmVyYXRlIGFuZCByZXR1cm4gdGhlIGhlYWRpbmcga2V5c1xuICAgICAgICAgICAgaGVhZGVyUm93ID0gcGFyYW1zLmxpbmVzWzBdO1xuICAgICAgICBwYXJhbXMuaGVhZGVyRmllbGRzID0gaGVhZGVyUm93Lm1hcCgoaGVhZGVyS2V5LCBpbmRleCkgPT4gKHtcbiAgICAgICAgICAgIHZhbHVlOiBwcm9jZXNzSGVhZGVyS2V5KGhlYWRlcktleSksXG4gICAgICAgICAgICBpbmRleDogaW5kZXhcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIHByb3ZpZGVkIGtleXMsIGZpbHRlciB0aGUgZ2VuZXJhdGVkIGtleXMgdG8ganVzdCB0aGUgdXNlciBwcm92aWRlZCBrZXlzIHNvIHdlIGFsc28gaGF2ZSB0aGUga2V5IGluZGV4XG4gICAgICAgIGlmIChvcHRpb25zLmtleXMpIHtcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBwYXJhbXMuaGVhZGVyRmllbGRzLmZpbHRlcigoaGVhZGVyS2V5KSA9PiBvcHRpb25zLmtleXMuaW5jbHVkZXMoaGVhZGVyS2V5LnZhbHVlKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNwbGl0cyB0aGUgbGluZXMgb2YgdGhlIENTViBzdHJpbmcgYnkgdGhlIEVPTCBkZWxpbWl0ZXIgYW5kIHJlc29sdmVzIGFuZCBhcnJheSBvZiBzdHJpbmdzIChsaW5lcylcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICogQHJldHVybnMge1Byb21pc2UuPFN0cmluZ1tdPn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzcGxpdENzdkxpbmVzKGNzdikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHNwbGl0TGluZXMoY3N2KSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgRXhjZWwgQk9NIHZhbHVlLCBpZiBzcGVjaWZpZWQgYnkgdGhlIG9wdGlvbnMgb2JqZWN0XG4gICAgICogQHBhcmFtIGNzdlxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxTdHJpbmc+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHN0cmlwRXhjZWxCT00oY3N2KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmV4Y2VsQk9NKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNzdi5yZXBsYWNlKGV4Y2VsQk9NUmVnZXgsICcnKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShjc3YpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHNwbGl0cyBhIGxpbmUgc28gdGhhdCB3ZSBjYW4gaGFuZGxlIHdyYXBwZWQgZmllbGRzXG4gICAgICogQHBhcmFtIGNzdlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNwbGl0TGluZXMoY3N2KSB7XG4gICAgICAgIC8vIFBhcnNlIG91dCB0aGUgbGluZS4uLlxuICAgICAgICBsZXQgbGluZXMgPSBbXSxcbiAgICAgICAgICAgIHNwbGl0TGluZSA9IFtdLFxuICAgICAgICAgICAgY2hhcmFjdGVyLFxuICAgICAgICAgICAgY2hhckJlZm9yZSxcbiAgICAgICAgICAgIGNoYXJBZnRlcixcbiAgICAgICAgICAgIG5leHROQ2hhcixcbiAgICAgICAgICAgIGxhc3RDaGFyYWN0ZXJJbmRleCA9IGNzdi5sZW5ndGggLSAxLFxuICAgICAgICAgICAgZW9sRGVsaW1pdGVyTGVuZ3RoID0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sLmxlbmd0aCxcbiAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzID0ge1xuICAgICAgICAgICAgICAgIGluc2lkZVdyYXBEZWxpbWl0ZXI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhcnNpbmdWYWx1ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBqdXN0UGFyc2VkRG91YmxlUXVvdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpbmRleCA9IDA7XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGVhY2ggY2hhcmFjdGVyIGluIHRoZSBsaW5lIHRvIGlkZW50aWZ5IHdoZXJlIHRvIHNwbGl0IHRoZSB2YWx1ZXNcbiAgICAgICAgd2hpbGUgKGluZGV4IDwgY3N2Lmxlbmd0aCkge1xuICAgICAgICAgICAgLy8gQ3VycmVudCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGNoYXJhY3RlciA9IGNzdltpbmRleF07XG4gICAgICAgICAgICAvLyBQcmV2aW91cyBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGNoYXJCZWZvcmUgPSBpbmRleCA/IGNzdltpbmRleCAtIDFdIDogJyc7XG4gICAgICAgICAgICAvLyBOZXh0IGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhckFmdGVyID0gaW5kZXggPCBsYXN0Q2hhcmFjdGVySW5kZXggPyBjc3ZbaW5kZXggKyAxXSA6ICcnO1xuICAgICAgICAgICAgLy8gTmV4dCBuIGNoYXJhY3RlcnMsIGluY2x1ZGluZyB0aGUgY3VycmVudCBjaGFyYWN0ZXIsIHdoZXJlIG4gPSBsZW5ndGgoRU9MIGRlbGltaXRlcilcbiAgICAgICAgICAgIC8vIFRoaXMgYWxsb3dzIGZvciB0aGUgY2hlY2tpbmcgb2YgYW4gRU9MIGRlbGltaXRlciB3aGVuIGlmIGl0IGlzIG1vcmUgdGhhbiBhIHNpbmdsZSBjaGFyYWN0ZXIgKGVnLiAnXFxyXFxuJylcbiAgICAgICAgICAgIG5leHROQ2hhciA9IHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXgsIGVvbERlbGltaXRlckxlbmd0aCk7XG5cbiAgICAgICAgICAgIGlmICgobmV4dE5DaGFyID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wgJiYgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgfHxcbiAgICAgICAgICAgICAgICBpbmRleCA9PT0gbGFzdENoYXJhY3RlckluZGV4KSAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYW4gRU9MIGRlbGltaXRlciBvciB0aGUgZW5kIG9mIHRoZSBjc3YgYW5kIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBmaWVsZCBkZWxpbWl0ZXIuLi5cblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzdGFydCBpbmRleCBpcyB0aGUgY3VycmVudCBpbmRleCAoYW5kIHNpbmNlIHRoZSBwcmV2aW91cyBjaGFyYWN0ZXIgaXMgYSBjb21tYSksXG4gICAgICAgICAgICAgICAgLy8gICB0aGVuIHRoZSB2YWx1ZSBiZWluZyBwYXJzZWQgaXMgYW4gZW1wdHkgdmFsdWUgYWNjb3JkaW5nbHksIGFkZCBhbiBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgICAgICBsZXQgcGFyc2VkVmFsdWUgPSBuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJiBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID09PSBpbmRleFxuICAgICAgICAgICAgICAgICAgICA/ICcnXG4gICAgICAgICAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlcmUncyBhIHZhbGlkIHZhbHVlLCBhbmQgdGhlIHN0YXJ0IGluZGV4IGlzbid0IHRoZSBjdXJyZW50IGluZGV4LCBncmFiIHRoZSB3aG9sZSB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICA6IGNzdi5zdWJzdHIoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCk7XG5cbiAgICAgICAgICAgICAgICAvLyBQdXNoIHRoZSB2YWx1ZSBmb3IgdGhlIGZpZWxkIHRoYXQgd2Ugd2VyZSBwYXJzaW5nXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2gocGFyc2VkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIGxhc3QgY2hhcmFjdGVyIGlzIGEgY29tbWEsIHRoZXJlJ3Mgc3RpbGwgYW4gYWRkaXRpb25hbCBpbXBsaWVkIGZpZWxkIHZhbHVlIHRyYWlsaW5nIHRoZSBjb21tYS5cbiAgICAgICAgICAgICAgICAvLyAgIFNpbmNlIHRoaXMgdmFsdWUgaXMgZW1wdHksIHdlIHB1c2ggYW4gZXh0cmEgZW1wdHkgdmFsdWVcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaCgnJyk7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBwdXNoIHRoZSBzcGxpdCBsaW5lIHZhbHVlcyBpbnRvIHRoZSBsaW5lcyBhcnJheSBhbmQgY2xlYXIgdGhlIHNwbGl0IGxpbmVcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHNwbGl0TGluZSk7XG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lID0gW107XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgZW9sRGVsaW1pdGVyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IGxhc3RDaGFyYWN0ZXJJbmRleCB8fCBuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJlxuICAgICAgICAgICAgICAgIC8vIGlmIHdlIGFyZW4ndCBpbnNpZGUgd3JhcCBkZWxpbWl0ZXJzIG9yIGlmIHdlIGFyZSBidXQgdGhlIGNoYXJhY3RlciBiZWZvcmUgd2FzIGEgd3JhcCBkZWxpbWl0ZXIgYW5kIHdlIGRpZG4ndCBqdXN0IHNlZSB0d29cbiAgICAgICAgICAgICAgICAoIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgfHxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmICFzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUpKSB7XG4gICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGlmIHdlIHJlYWNoZWQgdGhlIGVuZCBvZiB0aGUgbGluZSBvciBjc3YgKGFuZCBjdXJyZW50IGNoYXJhY3RlciBpcyBub3QgYSBmaWVsZCBkZWxpbWl0ZXIpXG5cbiAgICAgICAgICAgICAgICBsZXQgdG9JbmRleCA9IGluZGV4ICE9PSBsYXN0Q2hhcmFjdGVySW5kZXggfHwgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCA/IGluZGV4IDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgLy8gUmV0cmlldmUgdGhlIHJlbWFpbmluZyB2YWx1ZSBhbmQgYWRkIGl0IHRvIHRoZSBzcGxpdCBsaW5lIGxpc3Qgb2YgdmFsdWVzXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCB0b0luZGV4KSk7XG5cbiAgICAgICAgICAgICAgICAvLyBGaW5hbGx5LCBwdXNoIHRoZSBzcGxpdCBsaW5lIHZhbHVlcyBpbnRvIHRoZSBsaW5lcyBhcnJheSBhbmQgY2xlYXIgdGhlIHNwbGl0IGxpbmVcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHNwbGl0TGluZSk7XG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lID0gW107XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgZW9sRGVsaW1pdGVyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoKGNoYXJCZWZvcmUgIT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgfHwgc3RhdGVWYXJpYWJsZXMuanVzdFBhcnNlZERvdWJsZVF1b3RlICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXApICYmXG4gICAgICAgICAgICAgICAgY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXggKyAxLCBlb2xEZWxpbWl0ZXJMZW5ndGgpID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaCBhIHdyYXAgd2hpY2ggaXMgbm90IHByZWNlZGVkIGJ5IGEgd3JhcCBkZWxpbSBhbmQgdGhlIG5leHQgY2hhcmFjdGVyIGlzIGFuIEVPTCBkZWxpbSAoaWUuICpcIlxcbilcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAvLyBOZXh0IGl0ZXJhdGlvbiB3aWxsIHN1YnN0cmluZywgYWRkIHRoZSB2YWx1ZSB0byB0aGUgbGluZSwgYW5kIHB1c2ggdGhlIGxpbmUgb250byB0aGUgYXJyYXkgb2YgbGluZXNcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIChpbmRleCA9PT0gMCB8fCB1dGlscy5nZXROQ2hhcmFjdGVycyhjc3YsIGluZGV4IC0gMSwgZW9sRGVsaW1pdGVyTGVuZ3RoKSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sKSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBsaW5lIHN0YXJ0cyB3aXRoIGEgd3JhcCBkZWxpbWl0ZXIgKGllLiBcIiopXG5cbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgd3JhcCBkZWxpbWl0ZXIgd2l0aCBhIGZpZWxkIGRlbGltaXRlciBhZnRlciBpdCAoaWUuICpcIiwpXG5cbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIGluZGV4ICsgMSkpO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleCArIDI7IC8vIG5leHQgdmFsdWUgc3RhcnRzIGFmdGVyIHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCAmJlxuICAgICAgICAgICAgICAgICFzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyICYmICFzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgd3JhcCBkZWxpbWl0ZXIgYWZ0ZXIgYSBjb21tYSBhbmQgd2UgYXJlbid0IGluc2lkZSBhIHdyYXAgZGVsaW1pdGVyXG5cbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkICYmXG4gICAgICAgICAgICAgICAgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgJiYgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIHdyYXAgZGVsaW1pdGVyIHdpdGggYSBmaWVsZCBkZWxpbWl0ZXIgYWZ0ZXIgaXQgKGllLiAsXCIqKVxuXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCBpbmRleCAtIDEpKTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGNoYXJBZnRlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJ1biBpbnRvIGFuIGVzY2FwZWQgcXVvdGUgKGllLiBcIlwiKSBza2lwIHBhc3QgdGhlIHNlY29uZCBxdW90ZVxuXG4gICAgICAgICAgICAgICAgaW5kZXggKz0gMjtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkICYmIGNoYXJCZWZvcmUgIT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiZcbiAgICAgICAgICAgICAgICBjaGFyQWZ0ZXIgIT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgJiZcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgZmllbGQgZGVsaW1pdGVyIGFuZCBhcmUgbm90IGluc2lkZSB0aGUgd3JhcCBkZWxpbWl0ZXJzIChpZS4gKiwqKVxuXG4gICAgICAgICAgICAgICAgc3BsaXRMaW5lLnB1c2goY3N2LnN1YnN0cmluZyhzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4LCBpbmRleCkpO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleCArIDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJlxuICAgICAgICAgICAgICAgIGNoYXJBZnRlciAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiAhc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhIGZpZWxkIGRlbGltaXRlciwgdGhlIHByZXZpb3VzIGNoYXJhY3RlciB3YXMgYSB3cmFwIGRlbGltaXRlciwgYW5kIHRoZVxuICAgICAgICAgICAgICAgIC8vICAgbmV4dCBjaGFyYWN0ZXIgaXMgbm90IGEgd3JhcCBkZWxpbWl0ZXIgKGllLiBcIiwqKVxuXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgdG8gdGhlIG5leHQgY2hhcmFjdGVyXG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgLy8gUmVzZXQgdGhlIGRvdWJsZSBxdW90ZSBzdGF0ZSB2YXJpYWJsZVxuICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuanVzdFBhcnNlZERvdWJsZVF1b3RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbGluZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSByZWNvcmQgbGluZXMgZnJvbSB0aGUgc3BsaXQgQ1NWIGxpbmVzIGFuZCBzZXRzIGl0IG9uIHRoZSBwYXJhbXMgb2JqZWN0XG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlUmVjb3JkTGluZXMocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5yZWNvcmRMaW5lcyA9IHBhcmFtcy5saW5lcy5zcGxpY2UoMSk7IC8vIEFsbCBsaW5lcyBleGNlcHQgZm9yIHRoZSBoZWFkZXIgbGluZVxuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmVzIHRoZSB2YWx1ZSBmb3IgdGhlIHJlY29yZCBmcm9tIHRoZSBsaW5lIGF0IHRoZSBwcm92aWRlZCBrZXkuXG4gICAgICogQHBhcmFtIGxpbmUge1N0cmluZ1tdfSBzcGxpdCBsaW5lIHZhbHVlcyBmb3IgdGhlIHJlY29yZFxuICAgICAqIEBwYXJhbSBrZXkge09iamVjdH0ge2luZGV4OiBOdW1iZXIsIHZhbHVlOiBTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVSZWNvcmRWYWx1ZUZyb21MaW5lKGxpbmUsIGtleSkge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIHZhbHVlIGF0IHRoZSBrZXkncyBpbmRleCwgdXNlIGl0OyBvdGhlcndpc2UsIG51bGxcbiAgICAgICAgbGV0IHZhbHVlID0gbGluZVtrZXkuaW5kZXhdO1xuXG4gICAgICAgIC8vIFBlcmZvcm0gYW55IG5lY2Vzc2FyeSB2YWx1ZSBjb252ZXJzaW9ucyBvbiB0aGUgcmVjb3JkIHZhbHVlXG4gICAgICAgIHJldHVybiBwcm9jZXNzUmVjb3JkVmFsdWUodmFsdWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyB0aGUgcmVjb3JkJ3MgdmFsdWUgYnkgcGFyc2luZyB0aGUgZGF0YSB0byBlbnN1cmUgdGhlIENTViBpc1xuICAgICAqIGNvbnZlcnRlZCB0byB0aGUgSlNPTiB0aGF0IGNyZWF0ZWQgaXQuXG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWUge1N0cmluZ31cbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVjb3JkVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICAvLyBJZiB0aGUgdmFsdWUgaXMgYW4gYXJyYXkgcmVwcmVzZW50YXRpb24sIGNvbnZlcnQgaXRcbiAgICAgICAgbGV0IHBhcnNlZEpzb24gPSBwYXJzZVZhbHVlKGZpZWxkVmFsdWUpO1xuICAgICAgICAvLyBJZiBwYXJzZWRKc29uIGlzIGFueXRoaW5nIGFzaWRlIGZyb20gYW4gZXJyb3IsIHRoZW4gd2Ugd2FudCB0byB1c2UgdGhlIHBhcnNlZCB2YWx1ZVxuICAgICAgICAvLyBUaGlzIGFsbG93cyB1cyB0byBpbnRlcnByZXQgdmFsdWVzIGxpa2UgJ251bGwnIC0tPiBudWxsLCAnZmFsc2UnIC0tPiBmYWxzZVxuICAgICAgICBpZiAoIV8uaXNFcnJvcihwYXJzZWRKc29uKSkge1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHBhcnNlZEpzb247XG4gICAgICAgIH0gZWxzZSBpZiAoZmllbGRWYWx1ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyB0aGUgcmVjb3JkIHZhbHVlLCBpZiBzcGVjaWZpZWQgYnkgdGhlIHVzZXIgdmlhIHRoZSBvcHRpb25zIG9iamVjdFxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ3xudWxsfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyaW1SZWNvcmRWYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1GaWVsZFZhbHVlcyAmJiAhXy5pc051bGwoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBKU09OIGRvY3VtZW50IHdpdGggdGhlIGdpdmVuIGtleXMgKGRlc2lnbmF0ZWQgYnkgdGhlIENTViBoZWFkZXIpXG4gICAgICogICBhbmQgdGhlIHZhbHVlcyAoZnJvbSB0aGUgZ2l2ZW4gbGluZSlcbiAgICAgKiBAcGFyYW0ga2V5cyBTdHJpbmdbXVxuICAgICAqIEBwYXJhbSBsaW5lIFN0cmluZ1xuICAgICAqIEByZXR1cm5zIHtPYmplY3R9IGNyZWF0ZWQganNvbiBkb2N1bWVudFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNyZWF0ZURvY3VtZW50KGtleXMsIGxpbmUpIHtcbiAgICAgICAgLy8gUmVkdWNlIHRoZSBrZXlzIGludG8gYSBKU09OIGRvY3VtZW50IHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gbGluZVxuICAgICAgICByZXR1cm4ga2V5cy5yZWR1Y2UoKGRvY3VtZW50LCBrZXkpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgdmFsdWUgYXQgdGhlIGtleSdzIGluZGV4IGluIHRoZSBsaW5lLCBzZXQgdGhlIHZhbHVlOyBvdGhlcndpc2UgbnVsbFxuICAgICAgICAgICAgbGV0IHZhbHVlID0gcmV0cmlldmVSZWNvcmRWYWx1ZUZyb21MaW5lKGxpbmUsIGtleSk7XG5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSBhZGQgdGhlIGtleSBhbmQgdmFsdWUgdG8gdGhlIGRvY3VtZW50XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5zZXRQYXRoKGRvY3VtZW50LCBrZXkudmFsdWUsIHZhbHVlKTtcbiAgICAgICAgfSwge30pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIG91dGVybW9zdCB3cmFwIGRlbGltaXRlcnMgZnJvbSBhIHZhbHVlLCBpZiB0aGV5IGFyZSBwcmVzZW50XG4gICAgICogT3RoZXJ3aXNlLCB0aGUgbm9uLXdyYXBwZWQgdmFsdWUgaXMgcmV0dXJuZWQgYXMgaXNcbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICBsZXQgZmlyc3RDaGFyID0gZmllbGRWYWx1ZVswXSxcbiAgICAgICAgICAgIGxhc3RJbmRleCA9IGZpZWxkVmFsdWUubGVuZ3RoIC0gMSxcbiAgICAgICAgICAgIGxhc3RDaGFyID0gZmllbGRWYWx1ZVtsYXN0SW5kZXhdO1xuICAgICAgICAvLyBJZiB0aGUgZmllbGQgc3RhcnRzIGFuZCBlbmRzIHdpdGggYSB3cmFwIGRlbGltaXRlclxuICAgICAgICBpZiAoZmlyc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGxhc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS5zdWJzdHIoMSwgbGFzdEluZGV4IC0gMSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVW5lc2NhcGVzIHdyYXAgZGVsaW1pdGVycyBieSByZXBsYWNpbmcgZHVwbGljYXRlcyB3aXRoIGEgc2luZ2xlIChlZy4gXCJcIiAtPiBcIilcbiAgICAgKiBUaGlzIGlzIGRvbmUgaW4gb3JkZXIgdG8gcGFyc2UgUkZDIDQxODAgY29tcGxpYW50IENTViBiYWNrIHRvIEpTT05cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdW5lc2NhcGVXcmFwRGVsaW1pdGVySW5GaWVsZChmaWVsZFZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnJlcGxhY2UoZXNjYXBlZFdyYXBEZWxpbWl0ZXJSZWdleCwgb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWFpbiBoZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCB0aGUgQ1NWIHRvIHRoZSBKU09OIGRvY3VtZW50IGFycmF5XG4gICAgICogQHBhcmFtIHBhcmFtcyB7T2JqZWN0fSB7bGluZXM6IFtTdHJpbmddLCBjYWxsYmFjazogRnVuY3Rpb259XG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVJlY29yZExpbmVzKHBhcmFtcykge1xuICAgICAgICBwYXJhbXMuanNvbiA9IHBhcmFtcy5yZWNvcmRMaW5lcy5yZWR1Y2UoKGdlbmVyYXRlZEpzb25PYmplY3RzLCBsaW5lKSA9PiB7IC8vIEZvciBlYWNoIGxpbmUsIGNyZWF0ZSB0aGUgZG9jdW1lbnQgYW5kIGFkZCBpdCB0byB0aGUgYXJyYXkgb2YgZG9jdW1lbnRzXG4gICAgICAgICAgICBsaW5lID0gbGluZS5tYXAoKGZpZWxkVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBQZXJmb3JtIHRoZSBuZWNlc3Nhcnkgb3BlcmF0aW9ucyBvbiBlYWNoIGxpbmVcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHVuZXNjYXBlV3JhcERlbGltaXRlckluRmllbGQoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHRyaW1SZWNvcmRWYWx1ZShmaWVsZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxldCBnZW5lcmF0ZWREb2N1bWVudCA9IGNyZWF0ZURvY3VtZW50KHBhcmFtcy5oZWFkZXJGaWVsZHMsIGxpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIGdlbmVyYXRlZEpzb25PYmplY3RzLmNvbmNhdChnZW5lcmF0ZWREb2N1bWVudCk7XG4gICAgICAgIH0sIFtdKTtcblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEF0dGVtcHRzIHRvIHBhcnNlIHRoZSBwcm92aWRlZCB2YWx1ZS4gSWYgaXQgaXMgbm90IHBhcnNhYmxlLCB0aGVuIGFuIGVycm9yIGlzIHJldHVybmVkXG4gICAgICogQHBhcmFtIHZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcGFyc2VWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nUmVwcmVzZW50YXRpb24odmFsdWUsIG9wdGlvbnMpICYmICF1dGlscy5pc0RhdGVSZXByZXNlbnRhdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBwYXJzZWRKc29uID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBwYXJzZWQgdmFsdWUgaXMgYW4gYXJyYXksIHRoZW4gd2UgYWxzbyBuZWVkIHRvIHRyaW0gcmVjb3JkIHZhbHVlcywgaWYgc3BlY2lmaWVkXG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHBhcnNlZEpzb24pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlZEpzb24ubWFwKHRyaW1SZWNvcmRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZWRKc29uO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnI7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbGx5IGV4cG9ydGVkIGNzdjJqc29uIGZ1bmN0aW9uXG4gICAgICogVGFrZXMgb3B0aW9ucyBhcyBhIGRvY3VtZW50LCBkYXRhIGFzIGEgQ1NWIHN0cmluZywgYW5kIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwb3J0IHRoZSByZXN1bHRzXG4gICAgICogQHBhcmFtIGRhdGEgU3RyaW5nIGNzdiBzdHJpbmdcbiAgICAgKiBAcGFyYW0gY2FsbGJhY2sgRnVuY3Rpb24gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb252ZXJ0KGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNwbGl0IHRoZSBDU1YgaW50byBsaW5lcyB1c2luZyB0aGUgc3BlY2lmaWVkIEVPTCBvcHRpb25cbiAgICAgICAgLy8gdmFsaWRhdGVDc3YoZGF0YSwgY2FsbGJhY2spXG4gICAgICAgIC8vICAgICAudGhlbihzdHJpcEV4Y2VsQk9NKVxuICAgICAgICBzdHJpcEV4Y2VsQk9NKGRhdGEpXG4gICAgICAgICAgICAudGhlbihzcGxpdENzdkxpbmVzKVxuICAgICAgICAgICAgLnRoZW4ocmV0cmlldmVIZWFkaW5nKSAvLyBSZXRyaWV2ZSB0aGUgaGVhZGluZ3MgZnJvbSB0aGUgQ1NWLCB1bmxlc3MgdGhlIHVzZXIgc3BlY2lmaWVkIHRoZSBrZXlzXG4gICAgICAgICAgICAudGhlbihyZXRyaWV2ZVJlY29yZExpbmVzKSAvLyBSZXRyaWV2ZSB0aGUgcmVjb3JkIGxpbmVzIGZyb20gdGhlIENTVlxuICAgICAgICAgICAgLnRoZW4odHJhbnNmb3JtUmVjb3JkTGluZXMpIC8vIFJldHJpZXZlIHRoZSBKU09OIGRvY3VtZW50IGFycmF5XG4gICAgICAgICAgICAudGhlbigocGFyYW1zKSA9PiBjYWxsYmFjayhudWxsLCBwYXJhbXMuanNvbikpIC8vIFNlbmQgdGhlIGRhdGEgYmFjayB0byB0aGUgY2FsbGVyXG4gICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnZlcnQsXG4gICAgICAgIHZhbGlkYXRpb25GbjogXy5pc1N0cmluZyxcbiAgICAgICAgdmFsaWRhdGlvbk1lc3NhZ2VzOiBjb25zdGFudHMuZXJyb3JzLmNzdjJqc29uXG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geyBDc3YySnNvbiB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanNvbicpLFxuICAgIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpLFxuICAgIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyksXG4gICAgcGF0aCA9IHJlcXVpcmUoJ2RvYy1wYXRoJyksXG4gICAgZGVla3MgPSByZXF1aXJlKCdkZWVrcycpO1xuXG5jb25zdCBKc29uMkNzdiA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICBjb25zdCB3cmFwRGVsaW1pdGVyQ2hlY2tSZWdleCA9IG5ldyBSZWdFeHAob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCwgJ2cnKSxcbiAgICAgICAgY3JsZlNlYXJjaFJlZ2V4ID0gL1xccj9cXG58XFxyLyxcbiAgICAgICAgZGVla3NPcHRpb25zID0ge1xuICAgICAgICAgICAgZXhwYW5kQXJyYXlPYmplY3RzOiBvcHRpb25zLmV4cGFuZEFycmF5T2JqZWN0cyxcbiAgICAgICAgICAgIGlnbm9yZUVtcHR5QXJyYXlzV2hlbkV4cGFuZGluZzogb3B0aW9ucy5leHBhbmRBcnJheU9iamVjdHNcbiAgICAgICAgfTtcblxuICAgIC8qKiBIRUFERVIgRklFTEQgRlVOQ1RJT05TICoqL1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbGlzdCBvZiBkYXRhIGZpZWxkIG5hbWVzIG9mIGFsbCBkb2N1bWVudHMgaW4gdGhlIHByb3ZpZGVkIGxpc3RcbiAgICAgKiBAcGFyYW0gZGF0YSB7QXJyYXk8T2JqZWN0Pn0gRGF0YSB0byBiZSBjb252ZXJ0ZWRcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QXJyYXlbU3RyaW5nXT59XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0RmllbGROYW1lTGlzdChkYXRhKSB7XG4gICAgICAgIC8vIElmIGtleXMgd2VyZW4ndCBzcGVjaWZpZWQsIHRoZW4gd2UnbGwgdXNlIHRoZSBsaXN0IG9mIGtleXMgZ2VuZXJhdGVkIGJ5IHRoZSBkZWVrcyBtb2R1bGVcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShkZWVrcy5kZWVwS2V5c0Zyb21MaXN0KGRhdGEsIGRlZWtzT3B0aW9ucykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3NlcyB0aGUgc2NoZW1hcyBieSBjaGVja2luZyBmb3Igc2NoZW1hIGRpZmZlcmVuY2VzLCBpZiBzbyBkZXNpcmVkLlxuICAgICAqIElmIHNjaGVtYSBkaWZmZXJlbmNlcyBhcmUgbm90IHRvIGJlIGNoZWNrZWQsIHRoZW4gaXQgcmVzb2x2ZXMgdGhlIHVuaXF1ZVxuICAgICAqIGxpc3Qgb2YgZmllbGQgbmFtZXMuXG4gICAgICogQHBhcmFtIGRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheVtTdHJpbmddPn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzU2NoZW1hcyhkb2N1bWVudFNjaGVtYXMpIHtcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgd2FudHMgdG8gY2hlY2sgZm9yIHRoZSBzYW1lIHNjaGVtYSAocmVnYXJkbGVzcyBvZiBzY2hlbWEgb3JkZXJpbmcpXG4gICAgICAgIGlmIChvcHRpb25zLmNoZWNrU2NoZW1hRGlmZmVyZW5jZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVja1NjaGVtYURpZmZlcmVuY2VzKGRvY3VtZW50U2NoZW1hcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGRvIG5vdCBjYXJlIGlmIHRoZSBzY2hlbWFzIGFyZSBkaWZmZXJlbnQsIHNvIHdlIHNob3VsZCBnZXQgdGhlIHVuaXF1ZSBsaXN0IG9mIGtleXNcbiAgICAgICAgICAgIGxldCB1bmlxdWVGaWVsZE5hbWVzID0gXy51bmlxKF8uZmxhdHRlbihkb2N1bWVudFNjaGVtYXMpKTtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodW5pcXVlRmllbGROYW1lcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHBlcmZvcm1zIHRoZSBzY2hlbWEgZGlmZmVyZW5jZSBjaGVjaywgaWYgdGhlIHVzZXIgc3BlY2lmaWVzIHRoYXQgaXQgc2hvdWxkIGJlIGNoZWNrZWQuXG4gICAgICogSWYgdGhlcmUgYXJlIG5vIGZpZWxkIG5hbWVzLCB0aGVuIHRoZXJlIGFyZSBubyBkaWZmZXJlbmNlcy5cbiAgICAgKiBPdGhlcndpc2UsIHdlIGdldCB0aGUgZmlyc3Qgc2NoZW1hIGFuZCB0aGUgcmVtYWluaW5nIGxpc3Qgb2Ygc2NoZW1hc1xuICAgICAqIEBwYXJhbSBkb2N1bWVudFNjaGVtYXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjaGVja1NjaGVtYURpZmZlcmVuY2VzKGRvY3VtZW50U2NoZW1hcykge1xuICAgICAgICAvLyBoYXZlIG11bHRpcGxlIGRvY3VtZW50cyAtIGVuc3VyZSBvbmx5IG9uZSBzY2hlbWEgKHJlZ2FyZGxlc3Mgb2YgZmllbGQgb3JkZXJpbmcpXG4gICAgICAgIGxldCBmaXJzdERvY1NjaGVtYSA9IGRvY3VtZW50U2NoZW1hc1swXSxcbiAgICAgICAgICAgIHJlc3RPZkRvY3VtZW50U2NoZW1hcyA9IGRvY3VtZW50U2NoZW1hcy5zbGljZSgxKSxcbiAgICAgICAgICAgIHNjaGVtYURpZmZlcmVuY2VzID0gY29tcHV0ZU51bWJlck9mU2NoZW1hRGlmZmVyZW5jZXMoZmlyc3REb2NTY2hlbWEsIHJlc3RPZkRvY3VtZW50U2NoZW1hcyk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIHNjaGVtYSBpbmNvbnNpc3RlbmNpZXMsIHRocm93IGEgc2NoZW1hIG5vdCB0aGUgc2FtZSBlcnJvclxuICAgICAgICBpZiAoc2NoZW1hRGlmZmVyZW5jZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoY29uc3RhbnRzLmVycm9ycy5qc29uMmNzdi5ub3RTYW1lU2NoZW1hKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZpcnN0RG9jU2NoZW1hKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlcyB0aGUgbnVtYmVyIG9mIHNjaGVtYSBkaWZmZXJlbmNlc1xuICAgICAqIEBwYXJhbSBmaXJzdERvY1NjaGVtYVxuICAgICAqIEBwYXJhbSByZXN0T2ZEb2N1bWVudFNjaGVtYXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb21wdXRlTnVtYmVyT2ZTY2hlbWFEaWZmZXJlbmNlcyhmaXJzdERvY1NjaGVtYSwgcmVzdE9mRG9jdW1lbnRTY2hlbWFzKSB7XG4gICAgICAgIHJldHVybiByZXN0T2ZEb2N1bWVudFNjaGVtYXMucmVkdWNlKChzY2hlbWFEaWZmZXJlbmNlcywgZG9jdW1lbnRTY2hlbWEpID0+IHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBzY2hlbWFzLCBpbmNyZW1lbnQgdGhlIGNvdW50ZXIgb2Ygc2NoZW1hIGluY29uc2lzdGVuY2llc1xuICAgICAgICAgICAgbGV0IG51bWJlck9mRGlmZmVyZW5jZXMgPSB1dGlscy5jb21wdXRlU2NoZW1hRGlmZmVyZW5jZXMoZmlyc3REb2NTY2hlbWEsIGRvY3VtZW50U2NoZW1hKS5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyT2ZEaWZmZXJlbmNlcyA+IDBcbiAgICAgICAgICAgICAgICA/IHNjaGVtYURpZmZlcmVuY2VzICsgMVxuICAgICAgICAgICAgICAgIDogc2NoZW1hRGlmZmVyZW5jZXM7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIElmIHNvIHNwZWNpZmllZCwgdGhpcyBzb3J0cyB0aGUgaGVhZGVyIGZpZWxkIG5hbWVzIGFscGhhYmV0aWNhbGx5XG4gICAgICogQHBhcmFtIGZpZWxkTmFtZXMge0FycmF5PFN0cmluZz59XG4gICAgICogQHJldHVybnMge0FycmF5PFN0cmluZz59IHNvcnRlZCBmaWVsZCBuYW1lcywgb3IgdW5zb3J0ZWQgaWYgc29ydGluZyBub3Qgc3BlY2lmaWVkXG4gICAgICovXG4gICAgZnVuY3Rpb24gc29ydEhlYWRlckZpZWxkcyhmaWVsZE5hbWVzKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnNvcnRIZWFkZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZE5hbWVzLnNvcnQoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGROYW1lcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyB0aGUgaGVhZGVyIGZpZWxkcywgaWYgdGhlIHVzZXIgZGVzaXJlcyB0aGVtIHRvIGJlIHRyaW1tZWQuXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHRyaW1IZWFkZXJGaWVsZHMocGFyYW1zKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1IZWFkZXJGaWVsZHMpIHtcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBwYXJhbXMuaGVhZGVyRmllbGRzLm1hcCgoZmllbGQpID0+IGZpZWxkLnNwbGl0KCcuJylcbiAgICAgICAgICAgICAgICAubWFwKChjb21wb25lbnQpID0+IGNvbXBvbmVudC50cmltKCkpXG4gICAgICAgICAgICAgICAgLmpvaW4oJy4nKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFdyYXAgdGhlIGhlYWRpbmdzLCBpZiBkZXNpcmVkIGJ5IHRoZSB1c2VyLlxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB3cmFwSGVhZGVyRmllbGRzKHBhcmFtcykge1xuICAgICAgICAvLyBvbmx5IHBlcmZvcm0gdGhpcyBpZiB3ZSBhcmUgYWN0dWFsbHkgcHJlcGVuZGluZyB0aGUgaGVhZGVyXG4gICAgICAgIGlmIChvcHRpb25zLnByZXBlbmRIZWFkZXIpIHtcbiAgICAgICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBwYXJhbXMuaGVhZGVyRmllbGRzLm1hcChmdW5jdGlvbihoZWFkaW5nS2V5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdyYXBGaWVsZFZhbHVlSWZOZWNlc3NhcnkoaGVhZGluZ0tleSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgQ1NWIGhlYWRlciBzdHJpbmcgYnkgam9pbmluZyB0aGUgaGVhZGVyRmllbGRzIGJ5IHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDc3ZIZWFkZXIocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5oZWFkZXIgPSBwYXJhbXMuaGVhZGVyRmllbGRzLmpvaW4ob3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpO1xuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlIHRoZSBoZWFkaW5ncyBmb3IgYWxsIGRvY3VtZW50cyBhbmQgcmV0dXJuIGl0LlxuICAgICAqIFRoaXMgY2hlY2tzIHRoYXQgYWxsIGRvY3VtZW50cyBoYXZlIHRoZSBzYW1lIHNjaGVtYS5cbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJldHJpZXZlSGVhZGVyRmllbGRzKGRhdGEpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMua2V5cykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShvcHRpb25zLmtleXMpXG4gICAgICAgICAgICAgICAgLnRoZW4oc29ydEhlYWRlckZpZWxkcyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZ2V0RmllbGROYW1lTGlzdChkYXRhKVxuICAgICAgICAgICAgLnRoZW4ocHJvY2Vzc1NjaGVtYXMpXG4gICAgICAgICAgICAudGhlbihzb3J0SGVhZGVyRmllbGRzKTtcbiAgICB9XG5cbiAgICAvKiogUkVDT1JEIEZJRUxEIEZVTkNUSU9OUyAqKi9cblxuICAgIC8qKlxuICAgICAqIE1haW4gZnVuY3Rpb24gd2hpY2ggaGFuZGxlcyB0aGUgcHJvY2Vzc2luZyBvZiBhIHJlY29yZCwgb3IgZG9jdW1lbnQgdG8gYmUgY29udmVydGVkIHRvIENTViBmb3JtYXRcbiAgICAgKiBUaGlzIGZ1bmN0aW9uIHNwZWNpZmllcyBhbmQgcGVyZm9ybXMgdGhlIG5lY2Vzc2FyeSBvcGVyYXRpb25zIGluIHRoZSBuZWNlc3Nhcnkgb3JkZXJcbiAgICAgKiBpbiBvcmRlciB0byBvYnRhaW4gdGhlIGRhdGEgYW5kIGNvbnZlcnQgaXQgdG8gQ1NWIGZvcm0gd2hpbGUgbWFpbnRhaW5pbmcgUkZDIDQxODAgY29tcGxpYW5jZS5cbiAgICAgKiAqIE9yZGVyIG9mIG9wZXJhdGlvbnM6XG4gICAgICogLSBHZXQgZmllbGRzIGZyb20gcHJvdmlkZWQga2V5IGxpc3QgKGFzIGFycmF5IG9mIGFjdHVhbCB2YWx1ZXMpXG4gICAgICogLSBDb252ZXJ0IHRoZSB2YWx1ZXMgdG8gY3N2L3N0cmluZyByZXByZXNlbnRhdGlvbiBbcG9zc2libGUgb3B0aW9uIGhlcmUgZm9yIGN1c3RvbSBjb252ZXJ0ZXJzP11cbiAgICAgKiAtIFRyaW0gZmllbGRzXG4gICAgICogLSBEZXRlcm1pbmUgaWYgdGhleSBuZWVkIHRvIGJlIHdyYXBwZWQgKCYgd3JhcCBpZiBuZWNlc3NhcnkpXG4gICAgICogLSBDb21iaW5lIHZhbHVlcyBmb3IgZWFjaCBsaW5lIChieSBqb2luaW5nIGJ5IGZpZWxkIGRlbGltaXRlcilcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1JlY29yZHMocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5yZWNvcmRzID0gcGFyYW1zLnJlY29yZHMubWFwKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIC8vIFJldHJpZXZlIGRhdGEgZm9yIGVhY2ggb2YgdGhlIGhlYWRlckZpZWxkcyBmcm9tIHRoaXMgcmVjb3JkXG4gICAgICAgICAgICBsZXQgcmVjb3JkRmllbGREYXRhID0gcmV0cmlldmVSZWNvcmRGaWVsZERhdGEocmVjb3JkLCBwYXJhbXMuaGVhZGVyRmllbGRzKSxcblxuICAgICAgICAgICAgICAgIC8vIFByb2Nlc3MgdGhlIGRhdGEgaW4gdGhpcyByZWNvcmQgYW5kIHJldHVybiB0aGVcbiAgICAgICAgICAgICAgICBwcm9jZXNzZWRSZWNvcmREYXRhID0gcmVjb3JkRmllbGREYXRhLm1hcCgoZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdHJpbVJlY29yZEZpZWxkVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSByZWNvcmRGaWVsZFZhbHVlVG9TdHJpbmcoZmllbGRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB3cmFwRmllbGRWYWx1ZUlmTmVjZXNzYXJ5KGZpZWxkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBKb2luIHRoZSByZWNvcmQgZGF0YSBieSB0aGUgZmllbGQgZGVsaW1pdGVyXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVDc3ZSb3dGcm9tUmVjb3JkKHByb2Nlc3NlZFJlY29yZERhdGEpO1xuICAgICAgICB9KS5qb2luKG9wdGlvbnMuZGVsaW1pdGVyLmVvbCk7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gaW50ZW5kZWQgdG8gcHJvY2VzcyAqanVzdCogYXJyYXkgdmFsdWVzIHdoZW4gdGhlIGV4cGFuZEFycmF5T2JqZWN0cyBzZXR0aW5nIGlzIHNldCB0byB0cnVlXG4gICAgICogQHBhcmFtIHJlY29yZEZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn0gcHJvY2Vzc2VkIGFycmF5IHZhbHVlXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc1JlY29yZEZpZWxkRGF0YUZvckV4cGFuZGVkQXJyYXlPYmplY3QocmVjb3JkRmllbGRWYWx1ZSkge1xuICAgICAgICBsZXQgZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlID0gdXRpbHMucmVtb3ZlRW1wdHlGaWVsZHMocmVjb3JkRmllbGRWYWx1ZSk7XG5cbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBhbiBhcnJheSBhbmQgaXQncyBlaXRoZXIgZW1wdHkgb2YgZnVsbCBvZiBlbXB0eSB2YWx1ZXMsIHRoZW4gdXNlIGFuIGVtcHR5IHZhbHVlIHJlcHJlc2VudGF0aW9uXG4gICAgICAgIGlmICghcmVjb3JkRmllbGRWYWx1ZS5sZW5ndGggfHwgIWZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zLmVtcHR5RmllbGRWYWx1ZSB8fCAnJztcbiAgICAgICAgfSBlbHNlIGlmIChmaWx0ZXJlZFJlY29yZEZpZWxkVmFsdWUubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGhhdmUgYW4gYXJyYXkgb2YgYWN0dWFsIHZhbHVlcy4uLlxuICAgICAgICAgICAgLy8gU2luY2Ugd2UgYXJlIGV4cGFuZGluZyBhcnJheSBvYmplY3RzLCB3ZSB3aWxsIHdhbnQgdG8ga2V5IGluIG9uIHZhbHVlcyBvZiBvYmplY3RzLlxuICAgICAgICAgICAgcmV0dXJuIGZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZVswXTsgLy8gRXh0cmFjdCB0aGUgc2luZ2xlIHZhbHVlIGluIHRoZSBhcnJheVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlY29yZEZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgZmllbGQgdmFsdWVzIGZyb20gYSBwYXJ0aWN1bGFyIHJlY29yZCBmb3IgdGhlIGdpdmVuIGxpc3Qgb2YgZmllbGRzXG4gICAgICogQHBhcmFtIHJlY29yZFxuICAgICAqIEBwYXJhbSBmaWVsZHNcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVSZWNvcmRGaWVsZERhdGEocmVjb3JkLCBmaWVsZHMpIHtcbiAgICAgICAgbGV0IHJlY29yZFZhbHVlcyA9IFtdO1xuXG4gICAgICAgIGZpZWxkcy5mb3JFYWNoKChmaWVsZCkgPT4ge1xuICAgICAgICAgICAgbGV0IHJlY29yZEZpZWxkVmFsdWUgPSBwYXRoLmV2YWx1YXRlUGF0aChyZWNvcmQsIGZpZWxkKTtcblxuICAgICAgICAgICAgaWYgKCFfLmlzVW5kZWZpbmVkKG9wdGlvbnMuZW1wdHlGaWVsZFZhbHVlKSAmJiB1dGlscy5pc0VtcHR5RmllbGQocmVjb3JkRmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRGaWVsZFZhbHVlID0gb3B0aW9ucy5lbXB0eUZpZWxkVmFsdWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9wdGlvbnMuZXhwYW5kQXJyYXlPYmplY3RzICYmIEFycmF5LmlzQXJyYXkocmVjb3JkRmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZWNvcmRGaWVsZFZhbHVlID0gcHJvY2Vzc1JlY29yZEZpZWxkRGF0YUZvckV4cGFuZGVkQXJyYXlPYmplY3QocmVjb3JkRmllbGRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJlY29yZFZhbHVlcy5wdXNoKHJlY29yZEZpZWxkVmFsdWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gcmVjb3JkVmFsdWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIGEgcmVjb3JkIGZpZWxkIHZhbHVlIHRvIGl0cyBzdHJpbmcgcmVwcmVzZW50YXRpb25cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHJlY29yZEZpZWxkVmFsdWVUb1N0cmluZyhmaWVsZFZhbHVlKSB7XG4gICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkgfHwgXy5pc09iamVjdChmaWVsZFZhbHVlKSAmJiAhXy5pc0RhdGUoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShmaWVsZFZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzVW5kZWZpbmVkKGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc051bGwoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIHJlY29yZCBmaWVsZCB2YWx1ZSwgaWYgc3BlY2lmaWVkIGJ5IHRoZSB1c2VyJ3MgcHJvdmlkZWQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbVJlY29yZEZpZWxkVmFsdWUoZmllbGRWYWx1ZSkge1xuICAgICAgICBpZiAob3B0aW9ucy50cmltRmllbGRWYWx1ZXMpIHtcbiAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS5tYXAodHJpbVJlY29yZEZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzU3RyaW5nKGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUudHJpbSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRXNjYXBlcyBxdW90YXRpb24gbWFya3MgaW4gdGhlIGZpZWxkIHZhbHVlLCBpZiBuZWNlc3NhcnksIGFuZCBhcHByb3ByaWF0ZWx5XG4gICAgICogd3JhcHMgdGhlIHJlY29yZCBmaWVsZCB2YWx1ZSBpZiBpdCBjb250YWlucyBhIGNvbW1hIChmaWVsZCBkZWxpbWl0ZXIpLFxuICAgICAqIHF1b3RhdGlvbiBtYXJrICh3cmFwIGRlbGltaXRlciksIG9yIGEgbGluZSBicmVhayAoQ1JMRilcbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBGaWVsZFZhbHVlSWZOZWNlc3NhcnkoZmllbGRWYWx1ZSkge1xuICAgICAgICBjb25zdCB3cmFwRGVsaW1pdGVyID0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcblxuICAgICAgICAvLyBlZy4gaW5jbHVkZXMgcXVvdGF0aW9uIG1hcmtzIChkZWZhdWx0IGRlbGltaXRlcilcbiAgICAgICAgaWYgKGZpZWxkVmFsdWUuaW5jbHVkZXMob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCkpIHtcbiAgICAgICAgICAgIC8vIGFkZCBhbiBhZGRpdGlvbmFsIHF1b3RhdGlvbiBtYXJrIGJlZm9yZSBlYWNoIHF1b3RhdGlvbiBtYXJrIGFwcGVhcmluZyBpbiB0aGUgZmllbGQgdmFsdWVcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSBmaWVsZFZhbHVlLnJlcGxhY2Uod3JhcERlbGltaXRlckNoZWNrUmVnZXgsIHdyYXBEZWxpbWl0ZXIgKyB3cmFwRGVsaW1pdGVyKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB0aGUgZmllbGQgY29udGFpbnMgYSBjb21tYSAoZmllbGQgZGVsaW1pdGVyKSwgcXVvdGF0aW9uIG1hcmsgKHdyYXAgZGVsaW1pdGVyKSwgbGluZSBicmVhaywgb3IgQ1JMRlxuICAgICAgICAvLyAgIHRoZW4gZW5jbG9zZSBpdCBpbiBxdW90YXRpb24gbWFya3MgKHdyYXAgZGVsaW1pdGVyKVxuICAgICAgICBpZiAoZmllbGRWYWx1ZS5pbmNsdWRlcyhvcHRpb25zLmRlbGltaXRlci5maWVsZCkgfHxcbiAgICAgICAgICAgIGZpZWxkVmFsdWUuaW5jbHVkZXMob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCkgfHxcbiAgICAgICAgICAgIGZpZWxkVmFsdWUubWF0Y2goY3JsZlNlYXJjaFJlZ2V4KSkge1xuICAgICAgICAgICAgLy8gd3JhcCB0aGUgZmllbGQncyB2YWx1ZSBpbiBhIHdyYXAgZGVsaW1pdGVyIChxdW90YXRpb24gbWFya3MgYnkgZGVmYXVsdClcbiAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB3cmFwRGVsaW1pdGVyICsgZmllbGRWYWx1ZSArIHdyYXBEZWxpbWl0ZXI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZXMgdGhlIENTViByZWNvcmQgc3RyaW5nIGJ5IGpvaW5pbmcgdGhlIGZpZWxkIHZhbHVlcyB0b2dldGhlciBieSB0aGUgZmllbGQgZGVsaW1pdGVyXG4gICAgICogQHBhcmFtIHJlY29yZEZpZWxkVmFsdWVzXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDc3ZSb3dGcm9tUmVjb3JkKHJlY29yZEZpZWxkVmFsdWVzKSB7XG4gICAgICAgIHJldHVybiByZWNvcmRGaWVsZFZhbHVlcy5qb2luKG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKTtcbiAgICB9XG5cbiAgICAvKiogQ1NWIENPTVBPTkVOVCBDT01CSU5FUi9GSU5BTCBQUk9DRVNTT1IgKiovXG4gICAgLyoqXG4gICAgICogUGVyZm9ybXMgdGhlIGZpbmFsIENTViBjb25zdHJ1Y3Rpb24gYnkgY29tYmluaW5nIHRoZSBmaWVsZHMgaW4gdGhlIGFwcHJvcHJpYXRlXG4gICAgICogb3JkZXIgZGVwZW5kaW5nIG9uIHRoZSBwcm92aWRlZCBvcHRpb25zIHZhbHVlcyBhbmQgc2VuZHMgdGhlIGdlbmVyYXRlZCBDU1ZcbiAgICAgKiBiYWNrIHRvIHRoZSB1c2VyXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdlbmVyYXRlQ3N2RnJvbUNvbXBvbmVudHMocGFyYW1zKSB7XG4gICAgICAgIGxldCBoZWFkZXIgPSBwYXJhbXMuaGVhZGVyLFxuICAgICAgICAgICAgcmVjb3JkcyA9IHBhcmFtcy5yZWNvcmRzLFxuXG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgcHJlcGVuZGluZyB0aGUgaGVhZGVyLCB0aGVuIGFkZCBhbiBFT0wsIG90aGVyd2lzZSBqdXN0IHJldHVybiB0aGUgcmVjb3Jkc1xuICAgICAgICAgICAgY3N2ID0gKG9wdGlvbnMuZXhjZWxCT00gPyBjb25zdGFudHMudmFsdWVzLmV4Y2VsQk9NIDogJycpICtcbiAgICAgICAgICAgICAgICAob3B0aW9ucy5wcmVwZW5kSGVhZGVyID8gaGVhZGVyICsgb3B0aW9ucy5kZWxpbWl0ZXIuZW9sIDogJycpICtcbiAgICAgICAgICAgICAgICByZWNvcmRzO1xuXG4gICAgICAgIHJldHVybiBwYXJhbXMuY2FsbGJhY2sobnVsbCwgY3N2KTtcbiAgICB9XG5cbiAgICAvKiogTUFJTiBDT05WRVJURVIgRlVOQ1RJT04gKiovXG5cbiAgICAvKipcbiAgICAgKiBJbnRlcm5hbGx5IGV4cG9ydGVkIGpzb24yY3N2IGZ1bmN0aW9uXG4gICAgICogVGFrZXMgZGF0YSBhcyBlaXRoZXIgYSBkb2N1bWVudCBvciBhcnJheSBvZiBkb2N1bWVudHMgYW5kIGEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwb3J0IHRoZSByZXN1bHRzXG4gICAgICogQHBhcmFtIGRhdGEge09iamVjdHxBcnJheTxPYmplY3Q+fSBkb2N1bWVudHMgdG8gYmUgY29udmVydGVkIHRvIGNzdlxuICAgICAqIEBwYXJhbSBjYWxsYmFjayB7RnVuY3Rpb259IGNhbGxiYWNrIGZ1bmN0aW9uXG4gICAgICovXG4gICAgZnVuY3Rpb24gY29udmVydChkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAvLyBTaW5nbGUgZG9jdW1lbnQsIG5vdCBhbiBhcnJheVxuICAgICAgICBpZiAoXy5pc09iamVjdChkYXRhKSAmJiAhZGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07IC8vIENvbnZlcnQgdG8gYW4gYXJyYXkgb2YgdGhlIGdpdmVuIGRvY3VtZW50XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgaGVhZGluZyBhbmQgdGhlbiBnZW5lcmF0ZSB0aGUgQ1NWIHdpdGggdGhlIGtleXMgdGhhdCBhcmUgaWRlbnRpZmllZFxuICAgICAgICByZXRyaWV2ZUhlYWRlckZpZWxkcyhkYXRhKVxuICAgICAgICAgICAgLnRoZW4oKGhlYWRlckZpZWxkcykgPT4gKHtcbiAgICAgICAgICAgICAgICBoZWFkZXJGaWVsZHMsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgcmVjb3JkczogZGF0YVxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICAudGhlbihwcm9jZXNzUmVjb3JkcylcbiAgICAgICAgICAgIC50aGVuKHdyYXBIZWFkZXJGaWVsZHMpXG4gICAgICAgICAgICAudGhlbih0cmltSGVhZGVyRmllbGRzKVxuICAgICAgICAgICAgLnRoZW4oZ2VuZXJhdGVDc3ZIZWFkZXIpXG4gICAgICAgICAgICAudGhlbihnZW5lcmF0ZUNzdkZyb21Db21wb25lbnRzKVxuICAgICAgICAgICAgLmNhdGNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBjb252ZXJ0LFxuICAgICAgICB2YWxpZGF0aW9uRm46IF8uaXNPYmplY3QsXG4gICAgICAgIHZhbGlkYXRpb25NZXNzYWdlczogY29uc3RhbnRzLmVycm9ycy5qc29uMmNzdlxuICAgIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgSnNvbjJDc3YgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxubGV0IGNvbnN0YW50cyA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzb24nKSxcbiAgICBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG5jb25zdCBkYXRlU3RyaW5nUmVnZXggPSAvXFxkezR9LVxcZHsyfS1cXGR7Mn1UXFxkezJ9OlxcZHsyfTpcXGR7Mn0uXFxkezN9Wi87XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzU3RyaW5nUmVwcmVzZW50YXRpb24sXG4gICAgaXNEYXRlUmVwcmVzZW50YXRpb24sXG4gICAgY29tcHV0ZVNjaGVtYURpZmZlcmVuY2VzLFxuICAgIGRlZXBDb3B5LFxuICAgIGNvbnZlcnQsXG4gICAgaXNFbXB0eUZpZWxkLFxuICAgIHJlbW92ZUVtcHR5RmllbGRzLFxuICAgIGdldE5DaGFyYWN0ZXJzXG59O1xuXG4vKipcbiAqIEJ1aWxkIHRoZSBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb25cbiAqIElmIGEgdXNlciBkb2VzIG5vdCBwcm92aWRlIGN1c3RvbSBvcHRpb25zLCB0aGVuIHdlIHVzZSBvdXIgZGVmYXVsdFxuICogSWYgb3B0aW9ucyBhcmUgcHJvdmlkZWQsIHRoZW4gd2Ugc2V0IGVhY2ggdmFsaWQga2V5IHRoYXQgd2FzIHBhc3NlZFxuICogQHBhcmFtIG9wdHMge09iamVjdH0gb3B0aW9ucyBvYmplY3RcbiAqIEByZXR1cm4ge09iamVjdH0gb3B0aW9ucyBvYmplY3RcbiAqL1xuZnVuY3Rpb24gYnVpbGRPcHRpb25zKG9wdHMpIHtcbiAgICBvcHRzID0gXy5kZWZhdWx0cyhvcHRzIHx8IHt9LCBjb25zdGFudHMuZGVmYXVsdE9wdGlvbnMpO1xuXG4gICAgLy8gTm90ZTogXy5kZWZhdWx0cyBkb2VzIGEgc2hhbGxvdyBkZWZhdWx0LCB3ZSBuZWVkIHRvIGRlZXAgY29weSB0aGUgREVMSU1JVEVSIG9iamVjdFxuICAgIG9wdHMuZGVsaW1pdGVyID0gXy5kZWZhdWx0cyhvcHRzLmRlbGltaXRlciwgY29uc3RhbnRzLmRlZmF1bHRPcHRpb25zLmRlbGltaXRlcik7XG5cbiAgICAvLyBPdGhlcndpc2UsIHNlbmQgdGhlIG9wdGlvbnMgYmFja1xuICAgIHJldHVybiBvcHRzO1xufVxuXG4vKipcbiAqIFdoZW4gcHJvbWlzaWZpZWQsIHRoZSBjYWxsYmFjayBhbmQgb3B0aW9ucyBhcmd1bWVudCBvcmRlcmluZyBpcyBzd2FwcGVkLCBzb1xuICogdGhpcyBmdW5jdGlvbiBpcyBpbnRlbmRlZCB0byBkZXRlcm1pbmUgd2hpY2ggYXJndW1lbnQgaXMgd2hpY2ggYW5kIHJldHVyblxuICogdGhlbSBpbiB0aGUgY29ycmVjdCBvcmRlclxuICogQHBhcmFtIGFyZzEge09iamVjdHxGdW5jdGlvbn0gb3B0aW9ucyBvciBjYWxsYmFja1xuICogQHBhcmFtIGFyZzIge09iamVjdHxGdW5jdGlvbn0gb3B0aW9ucyBvciBjYWxsYmFja1xuICovXG5mdW5jdGlvbiBwYXJzZUFyZ3VtZW50cyhhcmcxLCBhcmcyKSB7XG4gICAgLy8gSWYgdGhpcyB3YXMgcHJvbWlzaWZpZWQgKGNhbGxiYWNrIGFuZCBvcHRzIGFyZSBzd2FwcGVkKSB0aGVuIGZpeCB0aGUgYXJndW1lbnQgb3JkZXIuXG4gICAgaWYgKF8uaXNPYmplY3QoYXJnMSkgJiYgIV8uaXNGdW5jdGlvbihhcmcxKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb3B0aW9uczogYXJnMSxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBhcmcyXG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vIFJlZ3VsYXIgb3JkZXJpbmcgd2hlcmUgdGhlIGNhbGxiYWNrIGlzIHByb3ZpZGVkIGJlZm9yZSB0aGUgb3B0aW9ucyBvYmplY3RcbiAgICByZXR1cm4ge1xuICAgICAgICBvcHRpb25zOiBhcmcyLFxuICAgICAgICBjYWxsYmFjazogYXJnMVxuICAgIH07XG59XG5cbi8qKlxuICogVmFsaWRhdGVzIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCBpbiB0byBqc29uMmNzdiBhbmQgY3N2Mmpzb25cbiAqIEBwYXJhbSBjb25maWcge09iamVjdH0gb2YgdGhlIGZvcm06IHsgZGF0YToge0FueX0sIGNhbGxiYWNrOiB7RnVuY3Rpb259LCBkYXRhQ2hlY2tGbjogRnVuY3Rpb24sIGVycm9yTWVzc2FnZXM6IHtPYmplY3R9IH1cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVQYXJhbWV0ZXJzKGNvbmZpZykge1xuICAgIC8vIElmIGEgY2FsbGJhY2sgd2Fzbid0IHByb3ZpZGVkLCB0aHJvdyBhbiBlcnJvclxuICAgIGlmICghY29uZmlnLmNhbGxiYWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihjb25zdGFudHMuZXJyb3JzLmNhbGxiYWNrUmVxdWlyZWQpO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGRvbid0IHJlY2VpdmUgZGF0YSwgcmVwb3J0IGFuIGVycm9yXG4gICAgaWYgKCFjb25maWcuZGF0YSkge1xuICAgICAgICBjb25maWcuY2FsbGJhY2sobmV3IEVycm9yKGNvbmZpZy5lcnJvck1lc3NhZ2VzLmNhbm5vdENhbGxPbiArIGNvbmZpZy5kYXRhICsgJy4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZGF0YSBwcm92aWRlZCBkYXRhIGRvZXMgbm90IG1lZXQgdGhlIHR5cGUgY2hlY2sgcmVxdWlyZW1lbnRcbiAgICBpZiAoIWNvbmZpZy5kYXRhQ2hlY2tGbihjb25maWcuZGF0YSkpIHtcbiAgICAgICAgY29uZmlnLmNhbGxiYWNrKG5ldyBFcnJvcihjb25maWcuZXJyb3JNZXNzYWdlcy5kYXRhQ2hlY2tGYWlsdXJlKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBkaWRuJ3QgaGl0IGFueSBrbm93biBlcnJvciBjb25kaXRpb25zLCB0aGVuIHRoZSBkYXRhIGlzIHNvIGZhciBkZXRlcm1pbmVkIHRvIGJlIHZhbGlkXG4gICAgLy8gTm90ZToganNvbjJjc3YvY3N2Mmpzb24gbWF5IHBlcmZvcm0gYWRkaXRpb25hbCB2YWxpZGl0eSBjaGVja3Mgb24gdGhlIGRhdGFcbiAgICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdGVkIGZ1bmN0aW9uIHRvIHBlcmZvcm0gdGhlIGNvbnZlcnNpb24gb2YganNvbi0tPmNzdiBvciBjc3YtLT5qc29uXG4gKiBkZXBlbmRpbmcgb24gdGhlIGNvbnZlcnRlciBjbGFzcyB0aGF0IGlzIHBhc3NlZCB2aWEgdGhlIHBhcmFtcyBvYmplY3RcbiAqIEBwYXJhbSBwYXJhbXMge09iamVjdH1cbiAqL1xuZnVuY3Rpb24gY29udmVydChwYXJhbXMpIHtcbiAgICBsZXQge29wdGlvbnMsIGNhbGxiYWNrfSA9IHBhcnNlQXJndW1lbnRzKHBhcmFtcy5jYWxsYmFjaywgcGFyYW1zLm9wdGlvbnMpO1xuICAgIG9wdGlvbnMgPSBidWlsZE9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBsZXQgY29udmVydGVyID0gbmV3IHBhcmFtcy5jb252ZXJ0ZXIob3B0aW9ucyksXG5cbiAgICAgICAgLy8gVmFsaWRhdGUgdGhlIHBhcmFtZXRlcnMgYmVmb3JlIGNhbGxpbmcgdGhlIGNvbnZlcnRlcidzIGNvbnZlcnQgZnVuY3Rpb25cbiAgICAgICAgdmFsaWQgPSB2YWxpZGF0ZVBhcmFtZXRlcnMoe1xuICAgICAgICAgICAgZGF0YTogcGFyYW1zLmRhdGEsXG4gICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgIGVycm9yTWVzc2FnZXM6IGNvbnZlcnRlci52YWxpZGF0aW9uTWVzc2FnZXMsXG4gICAgICAgICAgICBkYXRhQ2hlY2tGbjogY29udmVydGVyLnZhbGlkYXRpb25GblxuICAgICAgICB9KTtcblxuICAgIGlmICh2YWxpZCkgY29udmVydGVyLmNvbnZlcnQocGFyYW1zLmRhdGEsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGRlZXAgY29weSBhbiBvYmplY3QsIHVzZWQgYnkgdGhlIG1vZHVsZSB0ZXN0c1xuICogQHBhcmFtIG9ialxuICogQHJldHVybnMge2FueX1cbiAqL1xuZnVuY3Rpb24gZGVlcENvcHkob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhIHJlcHJlc2VudGF0aW9uXG4gKiAgIG9mIGEgc3RyaW5nLiBHaXZlbiB0aGUgUkZDNDE4MCByZXF1aXJlbWVudHMsIHRoYXQgbWVhbnMgdGhhdCB0aGUgdmFsdWUgaXNcbiAqICAgd3JhcHBlZCBpbiB2YWx1ZSB3cmFwIGRlbGltaXRlcnMgKHVzdWFsbHkgYSBxdW90YXRpb24gbWFyayBvbiBlYWNoIHNpZGUpLlxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNTdHJpbmdSZXByZXNlbnRhdGlvbihmaWVsZFZhbHVlLCBvcHRpb25zKSB7XG4gICAgY29uc3QgZmlyc3RDaGFyID0gZmllbGRWYWx1ZVswXSxcbiAgICAgICAgbGFzdEluZGV4ID0gZmllbGRWYWx1ZS5sZW5ndGggLSAxLFxuICAgICAgICBsYXN0Q2hhciA9IGZpZWxkVmFsdWVbbGFzdEluZGV4XTtcblxuICAgIC8vIElmIHRoZSBmaWVsZCBzdGFydHMgYW5kIGVuZHMgd2l0aCBhIHdyYXAgZGVsaW1pdGVyXG4gICAgcmV0dXJuIGZpcnN0Q2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiBsYXN0Q2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcDtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGEgcmVwcmVzZW50YXRpb25cbiAqICAgb2YgYSBkYXRlLlxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RhdGVSZXByZXNlbnRhdGlvbihmaWVsZFZhbHVlKSB7XG4gICAgcmV0dXJuIGRhdGVTdHJpbmdSZWdleC50ZXN0KGZpZWxkVmFsdWUpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgdGhlIHNjaGVtYSBkaWZmZXJlbmNlcyBiZXR3ZWVuIHR3byBvYmplY3RzLlxuICogQHBhcmFtIHNjaGVtYUFcbiAqIEBwYXJhbSBzY2hlbWFCXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVNjaGVtYURpZmZlcmVuY2VzKHNjaGVtYUEsIHNjaGVtYUIpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKHNjaGVtYUEsIHNjaGVtYUIpXG4gICAgICAgIC5jb25jYXQoXy5kaWZmZXJlbmNlKHNjaGVtYUIsIHNjaGVtYUEpKTtcbn1cblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIGEgZmllbGQgaXMgY29uc2lkZXJlZCBlbXB0eSBzbyB0aGF0IHRoZSBlbXB0eUZpZWxkVmFsdWUgY2FuIGJlIHVzZWQgaW5zdGVhZFxuICogQHBhcmFtIGZpZWxkVmFsdWVcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5RmllbGQoZmllbGRWYWx1ZSkge1xuICAgIHJldHVybiBfLmlzVW5kZWZpbmVkKGZpZWxkVmFsdWUpIHx8IF8uaXNOdWxsKGZpZWxkVmFsdWUpIHx8IGZpZWxkVmFsdWUgPT09ICcnO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJlbW92ZXMgZW1wdHkgZmllbGQgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gKiBAcGFyYW0gZmllbGRzXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUVtcHR5RmllbGRzKGZpZWxkcykge1xuICAgIHJldHVybiBfLmZpbHRlcihmaWVsZHMsIChmaWVsZCkgPT4gIWlzRW1wdHlGaWVsZChmaWVsZCkpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHJpZXZlcyB0aGUgbmV4dCBuIGNoYXJhY3RlcnMgZnJvbSB0aGUgc3RhcnQgaW5kZXggaW5cbiAqICAgdGhlIHN0cmluZyBpbmNsdWRpbmcgdGhlIGNoYXJhY3RlciBhdCB0aGUgc3RhcnQgaW5kZXguIFRoaXMgaXMgdXNlZCB0b1xuICogICBjaGVjayBpZiBhcmUgY3VycmVudGx5IGF0IGFuIEVPTCB2YWx1ZSwgc2luY2UgaXQgY291bGQgYmUgbXVsdGlwbGVcbiAqICAgY2hhcmFjdGVycyBpbiBsZW5ndGggKGVnLiAnXFxyXFxuJylcbiAqIEBwYXJhbSBzdHJcbiAqIEBwYXJhbSBzdGFydFxuICogQHBhcmFtIG5cbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldE5DaGFyYWN0ZXJzKHN0ciwgc3RhcnQsIG4pIHtcbiAgICByZXR1cm4gc3RyLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyBuKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuKGZ1bmN0aW9uIChnbG9iYWwpIHtcblxuICAgIC8vIG1pbmltYWwgc3ltYm9sIHBvbHlmaWxsIGZvciBJRTExIGFuZCBvdGhlcnNcbiAgICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgU3ltYm9sID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH1cblxuICAgICAgICBTeW1ib2wubm9uTmF0aXZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBTVEFURV9QTEFJTlRFWFQgPSBTeW1ib2woJ3BsYWludGV4dCcpO1xuICAgIGNvbnN0IFNUQVRFX0hUTUwgICAgICA9IFN5bWJvbCgnaHRtbCcpO1xuICAgIGNvbnN0IFNUQVRFX0NPTU1FTlQgICA9IFN5bWJvbCgnY29tbWVudCcpO1xuXG4gICAgY29uc3QgQUxMT1dFRF9UQUdTX1JFR0VYICA9IC88KFxcdyopPi9nO1xuICAgIGNvbnN0IE5PUk1BTElaRV9UQUdfUkVHRVggPSAvPFxcLz8oW15cXHNcXC8+XSspLztcblxuICAgIGZ1bmN0aW9uIHN0cmlwdGFncyhodG1sLCBhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGh0bWwgICAgICAgICAgICA9IGh0bWwgfHwgJyc7XG4gICAgICAgIGFsbG93YWJsZV90YWdzICA9IGFsbG93YWJsZV90YWdzIHx8IFtdO1xuICAgICAgICB0YWdfcmVwbGFjZW1lbnQgPSB0YWdfcmVwbGFjZW1lbnQgfHwgJyc7XG5cbiAgICAgICAgbGV0IGNvbnRleHQgPSBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIHN0cmlwdGFnc19pbnRlcm5hbChodG1sLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0X3N0cmlwdGFnc19zdHJlYW0oYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCkge1xuICAgICAgICBhbGxvd2FibGVfdGFncyAgPSBhbGxvd2FibGVfdGFncyB8fCBbXTtcbiAgICAgICAgdGFnX3JlcGxhY2VtZW50ID0gdGFnX3JlcGxhY2VtZW50IHx8ICcnO1xuXG4gICAgICAgIGxldCBjb250ZXh0ID0gaW5pdF9jb250ZXh0KGFsbG93YWJsZV90YWdzLCB0YWdfcmVwbGFjZW1lbnQpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdHJpcHRhZ3Nfc3RyZWFtKGh0bWwpIHtcbiAgICAgICAgICAgIHJldHVybiBzdHJpcHRhZ3NfaW50ZXJuYWwoaHRtbCB8fCAnJywgY29udGV4dCk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgc3RyaXB0YWdzLmluaXRfc3RyZWFtaW5nX21vZGUgPSBpbml0X3N0cmlwdGFnc19zdHJlYW07XG5cbiAgICBmdW5jdGlvbiBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCkge1xuICAgICAgICBhbGxvd2FibGVfdGFncyA9IHBhcnNlX2FsbG93YWJsZV90YWdzKGFsbG93YWJsZV90YWdzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWxsb3dhYmxlX3RhZ3MgOiBhbGxvd2FibGVfdGFncyxcbiAgICAgICAgICAgIHRhZ19yZXBsYWNlbWVudDogdGFnX3JlcGxhY2VtZW50LFxuXG4gICAgICAgICAgICBzdGF0ZSAgICAgICAgIDogU1RBVEVfUExBSU5URVhULFxuICAgICAgICAgICAgdGFnX2J1ZmZlciAgICA6ICcnLFxuICAgICAgICAgICAgZGVwdGggICAgICAgICA6IDAsXG4gICAgICAgICAgICBpbl9xdW90ZV9jaGFyIDogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdHJpcHRhZ3NfaW50ZXJuYWwoaHRtbCwgY29udGV4dCkge1xuICAgICAgICBsZXQgYWxsb3dhYmxlX3RhZ3MgID0gY29udGV4dC5hbGxvd2FibGVfdGFncztcbiAgICAgICAgbGV0IHRhZ19yZXBsYWNlbWVudCA9IGNvbnRleHQudGFnX3JlcGxhY2VtZW50O1xuXG4gICAgICAgIGxldCBzdGF0ZSAgICAgICAgID0gY29udGV4dC5zdGF0ZTtcbiAgICAgICAgbGV0IHRhZ19idWZmZXIgICAgPSBjb250ZXh0LnRhZ19idWZmZXI7XG4gICAgICAgIGxldCBkZXB0aCAgICAgICAgID0gY29udGV4dC5kZXB0aDtcbiAgICAgICAgbGV0IGluX3F1b3RlX2NoYXIgPSBjb250ZXh0LmluX3F1b3RlX2NoYXI7XG4gICAgICAgIGxldCBvdXRwdXQgICAgICAgID0gJyc7XG5cbiAgICAgICAgZm9yIChsZXQgaWR4ID0gMCwgbGVuZ3RoID0gaHRtbC5sZW5ndGg7IGlkeCA8IGxlbmd0aDsgaWR4KyspIHtcbiAgICAgICAgICAgIGxldCBjaGFyID0gaHRtbFtpZHhdO1xuXG4gICAgICAgICAgICBpZiAoc3RhdGUgPT09IFNUQVRFX1BMQUlOVEVYVCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlICAgICAgID0gU1RBVEVfSFRNTDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFX0hUTUwpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgJzwnIGlmIGluc2lkZSBhIHF1b3RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5fcXVvdGVfY2hhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3ZSdyZSBzZWVpbmcgYSBuZXN0ZWQgJzwnXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpZ25vcmUgJz4nIGlmIGluc2lkZSBhIHF1b3RlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5fcXVvdGVfY2hhcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzb21ldGhpbmcgbGlrZSB0aGlzIGlzIGhhcHBlbmluZzogJzw8Pj4nXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXB0aC0tO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgaXMgY2xvc2luZyB0aGUgdGFnIGluIHRhZ19idWZmZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlICAgICAgICAgPSBTVEFURV9QTEFJTlRFWFQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICAgKz0gJz4nO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsb3dhYmxlX3RhZ3MuaGFzKG5vcm1hbGl6ZV90YWcodGFnX2J1ZmZlcikpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRhZ19idWZmZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSB0YWdfcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1wiJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXFwnJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNhdGNoIGJvdGggc2luZ2xlIGFuZCBkb3VibGUgcXVvdGVzXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFyID09PSBpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5fcXVvdGVfY2hhciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9xdW90ZV9jaGFyID0gaW5fcXVvdGVfY2hhciB8fCBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICctJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyID09PSAnPCEtJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlID0gU1RBVEVfQ09NTUVOVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnICc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ1xcbic6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFnX2J1ZmZlciA9PT0gJzwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgICAgKz0gJzwgJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyID0gJyc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxzZSBpZiAoc3RhdGUgPT09IFNUQVRFX0NPTU1FTlQpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGNoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGFnX2J1ZmZlci5zbGljZSgtMikgPT0gJy0tJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNsb3NlIHRoZSBjb21tZW50XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURV9QTEFJTlRFWFQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzYXZlIHRoZSBjb250ZXh0IGZvciBmdXR1cmUgaXRlcmF0aW9uc1xuICAgICAgICBjb250ZXh0LnN0YXRlICAgICAgICAgPSBzdGF0ZTtcbiAgICAgICAgY29udGV4dC50YWdfYnVmZmVyICAgID0gdGFnX2J1ZmZlcjtcbiAgICAgICAgY29udGV4dC5kZXB0aCAgICAgICAgID0gZGVwdGg7XG4gICAgICAgIGNvbnRleHQuaW5fcXVvdGVfY2hhciA9IGluX3F1b3RlX2NoYXI7XG5cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZV9hbGxvd2FibGVfdGFncyhhbGxvd2FibGVfdGFncykge1xuICAgICAgICBsZXQgdGFnX3NldCA9IG5ldyBTZXQoKTtcblxuICAgICAgICBpZiAodHlwZW9mIGFsbG93YWJsZV90YWdzID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbGV0IG1hdGNoO1xuXG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gQUxMT1dFRF9UQUdTX1JFR0VYLmV4ZWMoYWxsb3dhYmxlX3RhZ3MpKSkge1xuICAgICAgICAgICAgICAgIHRhZ19zZXQuYWRkKG1hdGNoWzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKCFTeW1ib2wubm9uTmF0aXZlICYmXG4gICAgICAgICAgICAgICAgIHR5cGVvZiBhbGxvd2FibGVfdGFnc1tTeW1ib2wuaXRlcmF0b3JdID09PSAnZnVuY3Rpb24nKSB7XG5cbiAgICAgICAgICAgIHRhZ19zZXQgPSBuZXcgU2V0KGFsbG93YWJsZV90YWdzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBhbGxvd2FibGVfdGFncy5mb3JFYWNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAvLyBJRTExIGNvbXBhdGlibGVcbiAgICAgICAgICAgIGFsbG93YWJsZV90YWdzLmZvckVhY2godGFnX3NldC5hZGQsIHRhZ19zZXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRhZ19zZXQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbm9ybWFsaXplX3RhZyh0YWdfYnVmZmVyKSB7XG4gICAgICAgIGxldCBtYXRjaCA9IE5PUk1BTElaRV9UQUdfUkVHRVguZXhlYyh0YWdfYnVmZmVyKTtcblxuICAgICAgICByZXR1cm4gbWF0Y2ggPyBtYXRjaFsxXS50b0xvd2VyQ2FzZSgpIDogbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRFxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gbW9kdWxlX2ZhY3RvcnkoKSB7IHJldHVybiBzdHJpcHRhZ3M7IH0pO1xuICAgIH1cblxuICAgIGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIC8vIE5vZGVcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBzdHJpcHRhZ3M7XG4gICAgfVxuXG4gICAgZWxzZSB7XG4gICAgICAgIC8vIEJyb3dzZXJcbiAgICAgICAgZ2xvYmFsLnN0cmlwdGFncyA9IHN0cmlwdGFncztcbiAgICB9XG59KHRoaXMpKTtcbiIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuOS4xXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE4IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgKGBzZWxmYCkgaW4gdGhlIGJyb3dzZXIsIGBnbG9iYWxgXG4gIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgdmFyIHJvb3QgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzIHx8XG4gICAgICAgICAgICB7fTtcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG4gIHZhciBTeW1ib2xQcm90byA9IHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnID8gU3ltYm9sLnByb3RvdHlwZSA6IG51bGw7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhciBwdXNoID0gQXJyYXlQcm90by5wdXNoLFxuICAgICAgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgICAgdG9TdHJpbmcgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICAgIGhhc093blByb3BlcnR5ID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXIgbmF0aXZlSXNBcnJheSA9IEFycmF5LmlzQXJyYXksXG4gICAgICBuYXRpdmVLZXlzID0gT2JqZWN0LmtleXMsXG4gICAgICBuYXRpdmVDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4gIC8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGVpciBvbGQgbW9kdWxlIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICAvLyAoYG5vZGVUeXBlYCBpcyBjaGVja2VkIHRvIGVuc3VyZSB0aGF0IGBtb2R1bGVgXG4gIC8vIGFuZCBgZXhwb3J0c2AgYXJlIG5vdCBIVE1MIGVsZW1lbnRzLilcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9ICd1bmRlZmluZWQnICYmICFleHBvcnRzLm5vZGVUeXBlKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS45LjEnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgb3B0aW1pemVDYiA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICAvLyBUaGUgMi1hcmd1bWVudCBjYXNlIGlzIG9taXR0ZWQgYmVjYXVzZSB3ZeKAmXJlIG5vdCB1c2luZyBpdC5cbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBidWlsdGluSXRlcmF0ZWU7XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWQgdG8gZWFjaFxuICAvLyBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyIGBpZGVudGl0eWAsXG4gIC8vIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoXy5pdGVyYXRlZSAhPT0gYnVpbHRpbkl0ZXJhdGVlKSByZXR1cm4gXy5pdGVyYXRlZSh2YWx1ZSwgY29udGV4dCk7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gb3B0aW1pemVDYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSAmJiAhXy5pc0FycmF5KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuXG4gIC8vIEV4dGVybmFsIHdyYXBwZXIgZm9yIG91ciBjYWxsYmFjayBnZW5lcmF0b3IuIFVzZXJzIG1heSBjdXN0b21pemVcbiAgLy8gYF8uaXRlcmF0ZWVgIGlmIHRoZXkgd2FudCBhZGRpdGlvbmFsIHByZWRpY2F0ZS9pdGVyYXRlZSBzaG9ydGhhbmQgc3R5bGVzLlxuICAvLyBUaGlzIGFic3RyYWN0aW9uIGhpZGVzIHRoZSBpbnRlcm5hbC1vbmx5IGFyZ0NvdW50IGFyZ3VtZW50LlxuICBfLml0ZXJhdGVlID0gYnVpbHRpbkl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY2IodmFsdWUsIGNvbnRleHQsIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBTb21lIGZ1bmN0aW9ucyB0YWtlIGEgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cywgb3IgYSBmZXcgZXhwZWN0ZWRcbiAgLy8gYXJndW1lbnRzIGF0IHRoZSBiZWdpbm5pbmcgYW5kIHRoZW4gYSB2YXJpYWJsZSBudW1iZXIgb2YgdmFsdWVzIHRvIG9wZXJhdGVcbiAgLy8gb24uIFRoaXMgaGVscGVyIGFjY3VtdWxhdGVzIGFsbCByZW1haW5pbmcgYXJndW1lbnRzIHBhc3QgdGhlIGZ1bmN0aW9u4oCZc1xuICAvLyBhcmd1bWVudCBsZW5ndGggKG9yIGFuIGV4cGxpY2l0IGBzdGFydEluZGV4YCksIGludG8gYW4gYXJyYXkgdGhhdCBiZWNvbWVzXG4gIC8vIHRoZSBsYXN0IGFyZ3VtZW50LiBTaW1pbGFyIHRvIEVTNuKAmXMgXCJyZXN0IHBhcmFtZXRlclwiLlxuICB2YXIgcmVzdEFyZ3VtZW50cyA9IGZ1bmN0aW9uKGZ1bmMsIHN0YXJ0SW5kZXgpIHtcbiAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKSxcbiAgICAgICAgICByZXN0ID0gQXJyYXkobGVuZ3RoKSxcbiAgICAgICAgICBpbmRleCA9IDA7XG4gICAgICBmb3IgKDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgIH1cbiAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jLmNhbGwodGhpcywgcmVzdCk7XG4gICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICBjYXNlIDI6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0sIHJlc3QpO1xuICAgICAgfVxuICAgICAgdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgIGFyZ3NbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4XTtcbiAgICAgIH1cbiAgICAgIGFyZ3Nbc3RhcnRJbmRleF0gPSByZXN0O1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBhbm90aGVyLlxuICB2YXIgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XG4gICAgaWYgKG5hdGl2ZUNyZWF0ZSkgcmV0dXJuIG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcbiAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgc2hhbGxvd1Byb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICB2YXIgaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBwYXRoKTtcbiAgfVxuXG4gIHZhciBkZWVwR2V0ID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICAgIG9iaiA9IG9ialtwYXRoW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGxlbmd0aCA/IG9iaiA6IHZvaWQgMDtcbiAgfTtcblxuICAvLyBIZWxwZXIgZm9yIGNvbGxlY3Rpb24gbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGNvbGxlY3Rpb25cbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdC5cbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBzaGFsbG93UHJvcGVydHkoJ2xlbmd0aCcpO1xuICB2YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbiAgdmFyIGNyZWF0ZVJlZHVjZSA9IGZ1bmN0aW9uKGRpcikge1xuICAgIC8vIFdyYXAgY29kZSB0aGF0IHJlYXNzaWducyBhcmd1bWVudCB2YXJpYWJsZXMgaW4gYSBzZXBhcmF0ZSBmdW5jdGlvbiB0aGFuXG4gICAgLy8gdGhlIG9uZSB0aGF0IGFjY2Vzc2VzIGBhcmd1bWVudHMubGVuZ3RoYCB0byBhdm9pZCBhIHBlcmYgaGl0LiAoIzE5OTEpXG4gICAgdmFyIHJlZHVjZXIgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBpbml0aWFsKSB7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xuICAgICAgICBpbmRleCArPSBkaXI7XG4gICAgICB9XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIHZhciBpbml0aWFsID0gYXJndW1lbnRzLmxlbmd0aCA+PSAzO1xuICAgICAgcmV0dXJuIHJlZHVjZXIob2JqLCBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KSwgbWVtbywgaW5pdGlhbCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gY3JlYXRlUmVkdWNlKDEpO1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGNyZWF0ZVJlZHVjZSgtMSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGtleUZpbmRlciA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmZpbmRJbmRleCA6IF8uZmluZEtleTtcbiAgICB2YXIga2V5ID0ga2V5RmluZGVyKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBpZiAoa2V5ICE9PSB2b2lkIDAgJiYga2V5ICE9PSAtMSkgcmV0dXJuIG9ialtrZXldO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gaXRlbSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlc2AgYW5kIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIGl0ZW0sIGZyb21JbmRleCwgZ3VhcmQpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggIT0gJ251bWJlcicgfHwgZ3VhcmQpIGZyb21JbmRleCA9IDA7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKG9iaiwgcGF0aCwgYXJncykge1xuICAgIHZhciBjb250ZXh0UGF0aCwgZnVuYztcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHBhdGgpKSB7XG4gICAgICBmdW5jID0gcGF0aDtcbiAgICB9IGVsc2UgaWYgKF8uaXNBcnJheShwYXRoKSkge1xuICAgICAgY29udGV4dFBhdGggPSBwYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgIHBhdGggPSBwYXRoW3BhdGgubGVuZ3RoIC0gMV07XG4gICAgfVxuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICAgIHZhciBtZXRob2QgPSBmdW5jO1xuICAgICAgaWYgKCFtZXRob2QpIHtcbiAgICAgICAgaWYgKGNvbnRleHRQYXRoICYmIGNvbnRleHRQYXRoLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRleHQgPSBkZWVwR2V0KGNvbnRleHQsIGNvbnRleHRQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29udGV4dCA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgICBtZXRob2QgPSBjb250ZXh0W3BhdGhdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1ldGhvZCA9PSBudWxsID8gbWV0aG9kIDogbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsIHx8IHR5cGVvZiBpdGVyYXRlZSA9PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2JqWzBdICE9ICdvYmplY3QnICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2LCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHYsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2O1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCB8fCB0eXBlb2YgaXRlcmF0ZWUgPT0gJ251bWJlcicgJiYgdHlwZW9mIG9ialswXSAhPSAnb2JqZWN0JyAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiB2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odiwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2LCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5zYW1wbGUob2JqLCBJbmZpbml0eSk7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24gdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgdmFyIHNhbXBsZSA9IGlzQXJyYXlMaWtlKG9iaikgPyBfLmNsb25lKG9iaikgOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoc2FtcGxlKTtcbiAgICBuID0gTWF0aC5tYXgoTWF0aC5taW4obiwgbGVuZ3RoKSwgMCk7XG4gICAgdmFyIGxhc3QgPSBsZW5ndGggLSAxO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBuOyBpbmRleCsrKSB7XG4gICAgICB2YXIgcmFuZCA9IF8ucmFuZG9tKGluZGV4LCBsYXN0KTtcbiAgICAgIHZhciB0ZW1wID0gc2FtcGxlW2luZGV4XTtcbiAgICAgIHNhbXBsZVtpbmRleF0gPSBzYW1wbGVbcmFuZF07XG4gICAgICBzYW1wbGVbcmFuZF0gPSB0ZW1wO1xuICAgIH1cbiAgICByZXR1cm4gc2FtcGxlLnNsaWNlKDAsIG4pO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4KyssXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwga2V5LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IsIHBhcnRpdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0gcGFydGl0aW9uID8gW1tdLCBbXV0gOiB7fTtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChoYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgdmFyIHJlU3RyU3ltYm9sID0gL1teXFx1ZDgwMC1cXHVkZmZmXXxbXFx1ZDgwMC1cXHVkYmZmXVtcXHVkYzAwLVxcdWRmZmZdfFtcXHVkODAwLVxcdWRmZmZdL2c7XG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChfLmlzU3RyaW5nKG9iaikpIHtcbiAgICAgIC8vIEtlZXAgc3Vycm9nYXRlIHBhaXIgY2hhcmFjdGVycyB0b2dldGhlclxuICAgICAgcmV0dXJuIG9iai5tYXRjaChyZVN0clN5bWJvbCk7XG4gICAgfVxuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iaikgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIHBhc3MpIHtcbiAgICByZXN1bHRbcGFzcyA/IDAgOiAxXS5wdXNoKHZhbHVlKTtcbiAgfSwgdHJ1ZSk7XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsIHx8IGFycmF5Lmxlbmd0aCA8IDEpIHJldHVybiBuID09IG51bGwgPyB2b2lkIDAgOiBbXTtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCB8fCBhcnJheS5sZW5ndGggPCAxKSByZXR1cm4gbiA9PSBudWxsID8gdm9pZCAwIDogW107XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBfLnJlc3QoYXJyYXksIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIG4pKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBCb29sZWFuKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KSB7XG4gICAgb3V0cHV0ID0gb3V0cHV0IHx8IFtdO1xuICAgIHZhciBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgLy8gRmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3QuXG4gICAgICAgIGlmIChzaGFsbG93KSB7XG4gICAgICAgICAgdmFyIGogPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKGogPCBsZW4pIG91dHB1dFtpZHgrK10gPSB2YWx1ZVtqKytdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCwgb3V0cHV0KTtcbiAgICAgICAgICBpZHggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5LCBvdGhlckFycmF5cykge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIG90aGVyQXJyYXlzKTtcbiAgfSk7XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBUaGUgZmFzdGVyIGFsZ29yaXRobSB3aWxsIG5vdCB3b3JrIHdpdGggYW4gaXRlcmF0ZWUgaWYgdGhlIGl0ZXJhdGVlXG4gIC8vIGlzIG5vdCBhIG9uZS10by1vbmUgZnVuY3Rpb24sIHNvIHByb3ZpZGluZyBhbiBpdGVyYXRlZSB3aWxsIGRpc2FibGVcbiAgLy8gdGhlIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQgJiYgIWl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghXy5jb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcnJheXMpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJyYXlzLCB0cnVlLCB0cnVlKSk7XG4gIH0pO1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgdmFyIGo7XG4gICAgICBmb3IgKGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oYXJyYXksIHJlc3QpIHtcbiAgICByZXN0ID0gZmxhdHRlbihyZXN0LCB0cnVlLCB0cnVlKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbiAgLy8gZWFjaCBhcnJheSdzIGVsZW1lbnRzIG9uIHNoYXJlZCBpbmRpY2VzLlxuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgXy5tYXgoYXJyYXksIGdldExlbmd0aCkubGVuZ3RoIHx8IDA7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gcmVzdEFyZ3VtZW50cyhfLnVuemlwKTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuIFBhc3NpbmcgYnkgcGFpcnMgaXMgdGhlIHJldmVyc2Ugb2YgXy5wYWlycy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGluZGV4IG9uIGFuIGFycmF5LWxpa2UgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kSW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigxKTtcbiAgXy5maW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUluZGV4RmluZGVyID0gZnVuY3Rpb24oZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGVuZ3RoID0gaWR4ID49IDAgPyBNYXRoLm1pbihpZHggKyAxLCBsZW5ndGgpIDogaWR4ICsgbGVuZ3RoICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzb3J0ZWRJbmRleCAmJiBpZHggJiYgbGVuZ3RoKSB7XG4gICAgICAgIGlkeCA9IHNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XG4gICAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgXy5pc05hTik7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCA/IGlkeCArIGkgOiAtMTtcbiAgICAgIH1cbiAgICAgIGZvciAoaWR4ID0gZGlyID4gMCA/IGkgOiBsZW5ndGggLSAxOyBpZHggPj0gMCAmJiBpZHggPCBsZW5ndGg7IGlkeCArPSBkaXIpIHtcbiAgICAgICAgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBpZiAoIXN0ZXApIHtcbiAgICAgIHN0ZXAgPSBzdG9wIDwgc3RhcnQgPyAtMSA6IDE7XG4gICAgfVxuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBDaHVuayBhIHNpbmdsZSBhcnJheSBpbnRvIG11bHRpcGxlIGFycmF5cywgZWFjaCBjb250YWluaW5nIGBjb3VudGAgb3IgZmV3ZXJcbiAgLy8gaXRlbXMuXG4gIF8uY2h1bmsgPSBmdW5jdGlvbihhcnJheSwgY291bnQpIHtcbiAgICBpZiAoY291bnQgPT0gbnVsbCB8fCBjb3VudCA8IDEpIHJldHVybiBbXTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGkgPSAwLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gICAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICAgIHJlc3VsdC5wdXNoKHNsaWNlLmNhbGwoYXJyYXksIGksIGkgKz0gY291bnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHMuXG4gIHZhciBleGVjdXRlQm91bmQgPSBmdW5jdGlvbihzb3VyY2VGdW5jLCBib3VuZEZ1bmMsIGNvbnRleHQsIGNhbGxpbmdDb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB2YXIgc2VsZiA9IGJhc2VDcmVhdGUoc291cmNlRnVuYy5wcm90b3R5cGUpO1xuICAgIHZhciByZXN1bHQgPSBzb3VyY2VGdW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgdmFyIGJvdW5kID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihjYWxsQXJncykge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoY2FsbEFyZ3MpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyIGJ5IGRlZmF1bHQsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmVcbiAgLy8gcHJlLWZpbGxlZC4gU2V0IGBfLnBhcnRpYWwucGxhY2Vob2xkZXJgIGZvciBhIGN1c3RvbSBwbGFjZWhvbGRlciBhcmd1bWVudC5cbiAgXy5wYXJ0aWFsID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihmdW5jLCBib3VuZEFyZ3MpIHtcbiAgICB2YXIgcGxhY2Vob2xkZXIgPSBfLnBhcnRpYWwucGxhY2Vob2xkZXI7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBwbGFjZWhvbGRlciA/IGFyZ3VtZW50c1twb3NpdGlvbisrXSA6IGJvdW5kQXJnc1tpXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgdGhpcywgdGhpcywgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH0pO1xuXG4gIF8ucGFydGlhbC5wbGFjZWhvbGRlciA9IF87XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICB2YXIgaW5kZXggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAoaW5kZXggPCAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICB3aGlsZSAoaW5kZXgtLSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICB9KTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gJycgKyAoaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXkpO1xuICAgICAgaWYgKCFoYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oZnVuYywgd2FpdCwgYXJncykge1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH0pO1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gXy5wYXJ0aWFsKF8uZGVsYXksIF8sIDEpO1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgdGltZW91dCwgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcblxuICAgIHZhciB0aHJvdHRsZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICB0aHJvdHRsZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBwcmV2aW91cyA9IDA7XG4gICAgICB0aW1lb3V0ID0gY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG5cbiAgICByZXR1cm4gdGhyb3R0bGVkO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbihjb250ZXh0LCBhcmdzKSB7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIGlmIChhcmdzKSByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIH07XG5cbiAgICB2YXIgZGVib3VuY2VkID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcmdzKSB7XG4gICAgICBpZiAodGltZW91dCkgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgaWYgKGltbWVkaWF0ZSkge1xuICAgICAgICB2YXIgY2FsbE5vdyA9ICF0aW1lb3V0O1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICAgIGlmIChjYWxsTm93KSByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IF8uZGVsYXkobGF0ZXIsIHdhaXQsIHRoaXMsIGFyZ3MpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0pO1xuXG4gICAgZGVib3VuY2VkLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiBkZWJvdW5jZWQ7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBvbiBhbmQgYWZ0ZXIgdGhlIE50aCBjYWxsLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCB1cCB0byAoYnV0IG5vdCBpbmNsdWRpbmcpIHRoZSBOdGggY2FsbC5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICBfLnJlc3RBcmd1bWVudHMgPSByZXN0QXJndW1lbnRzO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEtleXMgaW4gSUUgPCA5IHRoYXQgd29uJ3QgYmUgaXRlcmF0ZWQgYnkgYGZvciBrZXkgaW4gLi4uYCBhbmQgdGh1cyBtaXNzZWQuXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgdmFyIGNvbGxlY3ROb25FbnVtUHJvcHMgPSBmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgbm9uRW51bUlkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGg7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICAgIHZhciBwcm90byA9IF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlIHx8IE9ialByb3RvO1xuXG4gICAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gICAgdmFyIHByb3AgPSAnY29uc3RydWN0b3InO1xuICAgIGlmIChoYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgLlxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKGhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdC5cbiAgLy8gSW4gY29udHJhc3QgdG8gXy5tYXAgaXQgcmV0dXJucyBhbiBvYmplY3QuXG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0ge307XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICAvLyBUaGUgb3Bwb3NpdGUgb2YgXy5vYmplY3QuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgLlxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFzc2lnbmVyIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIGRlZmF1bHRzKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAoZGVmYXVsdHMpIG9iaiA9IE9iamVjdChvYmopO1xuICAgICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdLFxuICAgICAgICAgICAga2V5cyA9IGtleXNGdW5jKHNvdXJjZSksXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKCFkZWZhdWx0cyB8fCBvYmpba2V5XSA9PT0gdm9pZCAwKSBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzKTtcblxuICAvLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKS5cbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXG4gIF8uZXh0ZW5kT3duID0gXy5hc3NpZ24gPSBjcmVhdGVBc3NpZ25lcihfLmtleXMpO1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdC5cbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgcGljayBoZWxwZXIgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIGlmIGBvYmpgIGhhcyBrZXkgYGtleWAuXG4gIHZhciBrZXlJbk9iaiA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgIHJldHVybiBrZXkgaW4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBrZXlzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBpdGVyYXRlZSA9IGtleXNbMF07XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpZiAoa2V5cy5sZW5ndGggPiAxKSBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGtleXNbMV0pO1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGtleUluT2JqO1xuICAgICAga2V5cyA9IGZsYXR0ZW4oa2V5cywgZmFsc2UsIGZhbHNlKTtcbiAgICAgIG9iaiA9IE9iamVjdChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9KTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgaXRlcmF0ZWUgPSBrZXlzWzBdLCBjb250ZXh0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDEpIGNvbnRleHQgPSBrZXlzWzFdO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlzID0gXy5tYXAoZmxhdHRlbihrZXlzLCBmYWxzZSwgZmFsc2UpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfSk7XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cywgdHJ1ZSk7XG5cbiAgLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuICAvLyBJZiBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXJlIHByb3ZpZGVkIHRoZW4gdGhleSB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICAvLyBjcmVhdGVkIG9iamVjdC5cbiAgXy5jcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHByb3BzKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICBpZiAocHJvcHMpIF8uZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMoYXR0cnMpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxLCBkZWVwRXE7XG4gIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBgbnVsbGAgb3IgYHVuZGVmaW5lZGAgb25seSBlcXVhbCB0byBpdHNlbGYgKHN0cmljdCBjb21wYXJpc29uKS5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgaWYgKGEgIT09IGEpIHJldHVybiBiICE9PSBiO1xuICAgIC8vIEV4aGF1c3QgcHJpbWl0aXZlIGNoZWNrc1xuICAgIHZhciB0eXBlID0gdHlwZW9mIGE7XG4gICAgaWYgKHR5cGUgIT09ICdmdW5jdGlvbicgJiYgdHlwZSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gZGVlcEVxKGEsIGIsIGFTdGFjaywgYlN0YWNrKTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICBkZWVwRXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU4uXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBTeW1ib2xdJzpcbiAgICAgICAgcmV0dXJuIFN5bWJvbFByb3RvLnZhbHVlT2YuY2FsbChhKSA9PT0gU3ltYm9sUHJvdG8udmFsdWVPZi5jYWxsKGIpO1xuICAgIH1cblxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChhcmVBcnJheXMpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICBpZiAoXy5rZXlzKGIpLmxlbmd0aCAhPT0gbGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKCEoaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IsIGlzTWFwLCBpc1dlYWtNYXAsIGlzU2V0LCBpc1dlYWtTZXQuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJywgJ1N5bWJvbCcsICdNYXAnLCAnV2Vha01hcCcsICdTZXQnLCAnV2Vha1NldCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxuICAvLyBJRSAxMSAoIzE2MjEpLCBTYWZhcmkgOCAoIzE5MjkpLCBhbmQgUGhhbnRvbUpTICgjMjIzNikuXG4gIHZhciBub2RlbGlzdCA9IHJvb3QuZG9jdW1lbnQgJiYgcm9vdC5kb2N1bWVudC5jaGlsZE5vZGVzO1xuICBpZiAodHlwZW9mIC8uLyAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiBJbnQ4QXJyYXkgIT0gJ29iamVjdCcgJiYgdHlwZW9mIG5vZGVsaXN0ICE9ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhXy5pc1N5bWJvbChvYmopICYmIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gP1xuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBpc05hTihvYmopO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBoYXMob2JqLCBwYXRoKTtcbiAgICB9XG4gICAgdmFyIGxlbmd0aCA9IHBhdGgubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBwYXRoW2ldO1xuICAgICAgaWYgKG9iaiA9PSBudWxsIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBvYmogPSBvYmpba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuICEhbGVuZ3RoO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gcGFzc2VkIGFuIG9iamVjdCwgd2lsbCB0cmF2ZXJzZSB0aGF0IG9iamVjdOKAmXNcbiAgLy8gcHJvcGVydGllcyBkb3duIHRoZSBnaXZlbiBgcGF0aGAsIHNwZWNpZmllZCBhcyBhbiBhcnJheSBvZiBrZXlzIG9yIGluZGV4ZXMuXG4gIF8ucHJvcGVydHkgPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgaWYgKCFfLmlzQXJyYXkocGF0aCkpIHtcbiAgICAgIHJldHVybiBzaGFsbG93UHJvcGVydHkocGF0aCk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBkZWVwR2V0KG9iaiwgcGF0aCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7fTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgIHJldHVybiAhXy5pc0FycmF5KHBhdGgpID8gb2JqW3BhdGhdIDogZGVlcEdldChvYmosIHBhdGgpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkLlxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIFRyYXZlcnNlcyB0aGUgY2hpbGRyZW4gb2YgYG9iamAgYWxvbmcgYHBhdGhgLiBJZiBhIGNoaWxkIGlzIGEgZnVuY3Rpb24sIGl0XG4gIC8vIGlzIGludm9rZWQgd2l0aCBpdHMgcGFyZW50IGFzIGNvbnRleHQuIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBmaW5hbFxuICAvLyBjaGlsZCwgb3IgYGZhbGxiYWNrYCBpZiBhbnkgY2hpbGQgaXMgdW5kZWZpbmVkLlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iaiwgcGF0aCwgZmFsbGJhY2spIHtcbiAgICBpZiAoIV8uaXNBcnJheShwYXRoKSkgcGF0aCA9IFtwYXRoXTtcbiAgICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gICAgaWYgKCFsZW5ndGgpIHtcbiAgICAgIHJldHVybiBfLmlzRnVuY3Rpb24oZmFsbGJhY2spID8gZmFsbGJhY2suY2FsbChvYmopIDogZmFsbGJhY2s7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwcm9wID0gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpbcGF0aFtpXV07XG4gICAgICBpZiAocHJvcCA9PT0gdm9pZCAwKSB7XG4gICAgICAgIHByb3AgPSBmYWxsYmFjaztcbiAgICAgICAgaSA9IGxlbmd0aDsgLy8gRW5zdXJlIHdlIGRvbid0IGNvbnRpbnVlIGl0ZXJhdGluZy5cbiAgICAgIH1cbiAgICAgIG9iaiA9IF8uaXNGdW5jdGlvbihwcm9wKSA/IHByb3AuY2FsbChvYmopIDogcHJvcDtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGU6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6IFwiJ1wiLFxuICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICdcXHInOiAncicsXG4gICAgJ1xcbic6ICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZVJlZ0V4cCA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZVJlZ0V4cCwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2Zmc2V0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHZhciByZW5kZXI7XG4gICAgdHJ5IHtcbiAgICAgIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgY2hhaW5SZXN1bHQgPSBmdW5jdGlvbihpbnN0YW5jZSwgb2JqKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiBfO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhaW5SZXN1bHQodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cbiAgXy5wcm90b3R5cGUudmFsdWVPZiA9IF8ucHJvdG90eXBlLnRvSlNPTiA9IF8ucHJvdG90eXBlLnZhbHVlO1xuXG4gIF8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFN0cmluZyh0aGlzLl93cmFwcGVkKTtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufSgpKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdGlmICghbW9kdWxlLndlYnBhY2tQb2x5ZmlsbCkge1xuXHRcdG1vZHVsZS5kZXByZWNhdGUgPSBmdW5jdGlvbigpIHt9O1xuXHRcdG1vZHVsZS5wYXRocyA9IFtdO1xuXHRcdC8vIG1vZHVsZS5wYXJlbnQgPSB1bmRlZmluZWQgYnkgZGVmYXVsdFxuXHRcdGlmICghbW9kdWxlLmNoaWxkcmVuKSBtb2R1bGUuY2hpbGRyZW4gPSBbXTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCBcImxvYWRlZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5sO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwiaWRcIiwge1xuXHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBtb2R1bGUuaTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRtb2R1bGUud2VicGFja1BvbHlmaWxsID0gMTtcblx0fVxuXHRyZXR1cm4gbW9kdWxlO1xufTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgdGltZXN0YW1wXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdGltZXN0YW1wXCIpKTtcbmNsYXNzIENhcHRpb25zUGFyc2VyIHtcbiAgICBjb25zdHJ1Y3RvcigpIHsgfVxuICAgIC8qKlxuICAgICAqIERlY29tcG9zZSB4bWwgdGV4dCBsaW5lIGJ5IGxpbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWxpbmVcbiAgICAgKiBAcmV0dXJucyB7QWxpbmV9XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIGRlY29kZUFsaW5lKGFsaW5lKSB7XG4gICAgICAgIGNvbnN0IHRpbWVzdGFtcCA9IHRoaXMucHVsbFRpbWUoYWxpbmUpO1xuICAgICAgICBjb25zdCBodG1sVGV4dCA9IGFsaW5lXG4gICAgICAgICAgICAucmVwbGFjZSgvPHRleHQuKz4vLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mYW1wOy9naSwgJyYnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzxcXC8/W14+XSsoPnwkKS9nLCAnJyk7XG4gICAgICAgIGNvbnN0IHN0cmlwdGFncyA9IHJlcXVpcmUoJ3N0cmlwdGFncycpO1xuICAgICAgICBjb25zdCBoZSA9IHJlcXVpcmUoJ2hlJyk7XG4gICAgICAgIGNvbnN0IGRlY29kZWRUZXh0ID0gaGUuZGVjb2RlKGh0bWxUZXh0KTtcbiAgICAgICAgY29uc3QgdGV4dCA9IHN0cmlwdGFncyhkZWNvZGVkVGV4dCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0aW1lc3RhbXA6IHRpbWVzdGFtcCxcbiAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogU3BsaXQgbGluZXMgaW50byBieSBhIGxpbmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbGluZXNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIGV4cGxvZGUobGluZXMpIHtcbiAgICAgICAgcmV0dXJuIGxpbmVzLnNwbGl0KCc8L3RleHQ+JykuZmlsdGVyKChsaW5lKSA9PiBsaW5lICYmIGxpbmUudHJpbSgpKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogVHJpbSB4bWwgdGFnIGluIGZpcnN0IGxpbmVcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB0cmFuc2NyaXB0XG4gICAgICogQHJldHVybnMge3N0cmluZ1tdfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICByZW1vdmVYbWxUYWcodHJhbnNjcmlwdCkge1xuICAgICAgICByZXR1cm4gdHJhbnNjcmlwdC5yZXBsYWNlKCc8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJ1dGYtOFwiID8+PHRyYW5zY3JpcHQ+JywgJycpLnJlcGxhY2UoJzwvdHJhbnNjcmlwdD4nLCAnJyk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1bGwgdGltZSBmcm9tIHRleHQgZGF0YS5cbiAgICAgKiA8dGV4dCBzdGFydD1cIjEwLjE1OVwiIGR1cj1cIjIuNTYzXCI+XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGFsaW5lXG4gICAgICogQHJldHVybnMge1RpbWVzdGFtcH1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgcHVsbFRpbWUoYWxpbmUpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRSZWdleCA9IC9zdGFydD1cIihbXFxkLl0rKVwiLztcbiAgICAgICAgY29uc3QgZHVyUmVnZXggPSAvZHVyPVwiKFtcXGQuXSspXCIvO1xuICAgICAgICBjb25zdCBbLCBzdGFydF0gPSBzdGFydFJlZ2V4LmV4ZWMoYWxpbmUpO1xuICAgICAgICBjb25zdCBbLCBkdXJdID0gZHVyUmVnZXguZXhlYyhhbGluZSk7XG4gICAgICAgIHJldHVybiBuZXcgdGltZXN0YW1wXzEuZGVmYXVsdChOdW1iZXIoc3RhcnQpLCBOdW1iZXIoZHVyKSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ2FwdGlvbnNQYXJzZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNsYXNzIENsaWVudFlvdXR1YmUge1xuICAgIGdldFZpZGVvSW5mbyh2aWRlb0lkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlcXVlc3QoYGh0dHBzOi8veW91dHViZS5jb20vZ2V0X3ZpZGVvX2luZm8/dmlkZW9faWQ9JHt2aWRlb0lkfWApO1xuICAgIH1cbiAgICBnZXRTdWJ0aXRsZShsYW5ndWFnZVVybCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRSZXF1ZXN0KGxhbmd1YWdlVXJsKTtcbiAgICB9XG4gICAgZ2V0UmVxdWVzdCh1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIGNvbnN0IHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignWE1MSHR0cFJlcXVlc3QgRXJyb3I6ICcgKyB0aGlzLnN0YXR1c1RleHQpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXF1ZXN0Lm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICAgICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gQ2xpZW50WW91dHViZTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgY2FwdGlvbnNQYXJzZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9jYXB0aW9uc1BhcnNlclwiKSk7XG5jbGFzcyBDb252ZXJ0ZXIge1xuICAgIGNvbnN0cnVjdG9yKHhtbFJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMueG1sUmVzcG9uc2UgPSB4bWxSZXNwb25zZTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBzYXZlIGluIENTViBmb3JtYXRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtDc3ZBbGluZVtdfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICB0b0NzdigpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IGNhcHRpb25zUGFyc2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB0cmltVHJhbnNjcmlwdCA9IHBhcnNlci5leHBsb2RlKHBhcnNlci5yZW1vdmVYbWxUYWcodGhpcy54bWxSZXNwb25zZSkpO1xuICAgICAgICByZXR1cm4gdHJpbVRyYW5zY3JpcHQubWFwKChsaW5lKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBhbGluZSA9IHBhcnNlci5kZWNvZGVBbGluZShsaW5lKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgc3RhcnRUaW1lOiBhbGluZS50aW1lc3RhbXAuZ2V0U3RhcnRUaW1lKCksXG4gICAgICAgICAgICAgICAgZHVyYXRpb25UaW1lOiBhbGluZS50aW1lc3RhbXAuZ2V0RHVyYXRpb25UaW1lKCksXG4gICAgICAgICAgICAgICAgdGV4dDogYWxpbmUudGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gc2F2ZSBpbiBTcnQgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7U3J0QWxpbmVbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgdG9TcnQoKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBjYXB0aW9uc1BhcnNlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbVRyYW5zY3JpcHQgPSBwYXJzZXIuZXhwbG9kZShwYXJzZXIucmVtb3ZlWG1sVGFnKHRoaXMueG1sUmVzcG9uc2UpKTtcbiAgICAgICAgcmV0dXJuIHRyaW1UcmFuc2NyaXB0Lm1hcCgobGluZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG51bWVyaWNDb3VudGVyID0gaW5kZXggKyAxICsgJ1xcbic7XG4gICAgICAgICAgICBjb25zdCBhbGluZSA9IHBhcnNlci5kZWNvZGVBbGluZShsaW5lKTtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhbGluZS50ZXh0LnJlcGxhY2UoL1xcbi8sICcgJykgKyAnXFxuJztcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaW5kZXg6IG51bWVyaWNDb3VudGVyLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogYWxpbmUudGltZXN0YW1wLmZvcm1hdFNydCgpLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gVnR0IGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge1Z0dEFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvVnR0KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGFsaW5lLnRleHQucmVwbGFjZSgvXFxuLywgJyAnKSArICdcXG4nO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IGFsaW5lLnRpbWVzdGFtcC5mb3JtYXRWdHQoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiB0ZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDb252ZXJ0ZXI7XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IHN1YnRpdGxlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vc3VidGl0bGVcIikpO1xuY29uc3QgY2xpZW50WW91dHViZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NsaWVudC9jbGllbnRZb3V0dWJlXCIpKTtcbmNvbnN0IHNlbmREYXRhID0ge1xuICAgIHJlYXNvbjogJ2NoZWNrJ1xufTtcbnZhciB2aWRlb1RpdGxlO1xud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcbiAgICBjaHJvbWUudGFicy5xdWVyeSh7IGFjdGl2ZTogdHJ1ZSwgY3VycmVudFdpbmRvdzogdHJ1ZSB9LCBmdW5jdGlvbiAodGFicykge1xuICAgICAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWJzWzBdLmlkLCBzZW5kRGF0YSwgZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5lcnJvcik7XG4gICAgICAgICAgICAgICAgZGlzcGxheU1lc3NhZ2UoJ1RoaXMgdmlkZW8gaGFzIG5vbmUgY2FwdGlvbi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuY2FwdGlvbnMpIHtcbiAgICAgICAgICAgICAgICB2aWRlb1RpdGxlID0gcmVzcG9uc2UudGl0bGU7XG4gICAgICAgICAgICAgICAgYWRkU2VsZWN0Qm94KCk7XG4gICAgICAgICAgICAgICAgcmVzcG9uc2UuY2FwdGlvbnMuZmlsdGVyKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBhZGRTZWxlY3RCb3hPcHRpb24odmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFkZERvd25sb2FkQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgYWRkU2VsZWN0Qm94Rm9ybWF0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbmZ1bmN0aW9uIGFkZFNlbGVjdEJveEZvcm1hdCgpIHtcbiAgICBkb2N1bWVudFxuICAgICAgICAuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKVxuICAgICAgICAuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgXCI8c2VsZWN0IGNsYXNzPSd1ay1zZWxlY3QnIHN0eWxlPSdtYXJnaW4tYm90dG9tOjVweCcgaWQ9J2Zvcm1hdCc+PG9wdGlvbiB2YWx1ZT0nY3N2Jz4uY3N2PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0ndGV4dCc+LnR4dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3Z0dCc+LnZ0dDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9J3NydCc+LnNydDwvb3B0aW9uPjwvc2VsZWN0PlwiKTtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdEJveCgpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsIFwiPHNlbGVjdCBjbGFzcz0ndWstc2VsZWN0JyBpZD0nbGFuZ3VhZ2UnPjwvc2VsZWN0PlwiKTtcbn1cbmZ1bmN0aW9uIGFkZFNlbGVjdEJveE9wdGlvbih2YWx1ZSkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYW5ndWFnZScpLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlZW5kJywgYDxvcHRpb24gdmFsdWU9JHt2YWx1ZS5iYXNlVXJsfT4ke3ZhbHVlLm5hbWUuc2ltcGxlVGV4dH08L29wdGlvbj5gKTtcbn1cbmZ1bmN0aW9uIGFkZERvd25sb2FkQnV0dG9uKCkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpXG4gICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyZW5kJywgXCI8ZGl2IGNsYXNzPSd1ay1tYXJnaW4nPjxidXR0b24gaWQ9J2Rvd25sb2FkLWJ1dHRvbicgY2xhc3M9J3VrLWJ1dHRvbiB1ay1idXR0b24tcHJpbWFyeScgb25jbGljaz1kb3dubG9hZCgpPkRvd25sb2FkPC9idXR0b24+PC9kaXY+XCIpO1xuICAgIC8vIHJlZ2lzdGVyIGV2ZW50SGFuZGxlciBmdW5jdGlvbiBkb3dubG9hZCgpXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Rvd25sb2FkLWJ1dHRvbicpLm9uY2xpY2sgPSAoKSA9PiBkb3dubG9hZCgpO1xufVxuZnVuY3Rpb24gZGVidWcocmVzcG9uc2UpIHtcbiAgICBjb25zdCBkZWJ1ZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkZWJ1ZycpO1xuICAgIGRlYnVnLmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCByZXNwb25zZSk7XG59XG5mdW5jdGlvbiBkaXNwbGF5TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50Jyk7XG4gICAgY29udGVudC5pbnNlcnRBZGphY2VudEhUTUwoJ2JlZm9yZWJlZ2luJywgYDxwIGNsYXNzPSd1ay10ZXh0LWRhbmdlcic+JHttZXNzYWdlfTwvcD5gKTtcbn1cbmZ1bmN0aW9uIGRvd25sb2FkKCkge1xuICAgIGNvbnN0IGxhbmd1YWdlX3VybCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsYW5ndWFnZScpLnZhbHVlO1xuICAgIGNvbnN0IGZvcm1hdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmb3JtYXQnKS52YWx1ZTtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgY2xpZW50WW91dHViZV8xLmRlZmF1bHQoKTtcbiAgICBjbGllbnRcbiAgICAgICAgLmdldFN1YnRpdGxlKGxhbmd1YWdlX3VybClcbiAgICAgICAgLnRoZW4oKHhtbFJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGlmICgheG1sUmVzcG9uc2UpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Jlc3BvbnNlIGVtcHR5LicpO1xuICAgICAgICBjb25zdCBzdWJ0aXRsZSA9IG5ldyBzdWJ0aXRsZV8xLmRlZmF1bHQoeG1sUmVzcG9uc2UpO1xuICAgICAgICBpZiAoZm9ybWF0ID09PSAnY3N2Jykge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0Q3N2KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZvcm1hdCA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRUZXh0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZvcm1hdCA9PT0gJ3Z0dCcpIHtcbiAgICAgICAgICAgIHN1YnRpdGxlLmdldFZ0dCh2aWRlb1RpdGxlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1YnRpdGxlLmdldFNydCh2aWRlb1RpdGxlKTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICBkZWJ1ZyhlcnJvcik7XG4gICAgfSk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGNvbnZlcnRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NvbnZlcnRlclwiKSk7XG5jb25zdCBqc29uMmNzdiA9IHJlcXVpcmUoJ2pzb24tMi1jc3YnKTtcbmNvbnN0IG9wdGlvbnMgPSB7XG4gICAgZGVsaW1pdGVyOiB7XG4gICAgICAgIHdyYXA6ICcnLFxuICAgICAgICBmaWVsZDogJycsXG4gICAgICAgIGVvbDogJ1xcbidcbiAgICB9LFxuICAgIHByZXBlbmRIZWFkZXI6IGZhbHNlXG59O1xuY2xhc3MgU3VidGl0bGUge1xuICAgIGNvbnN0cnVjdG9yKHhtbFJlc3BvbnNlKSB7XG4gICAgICAgIHRoaXMueG1sUmVzcG9uc2UgPSB4bWxSZXNwb25zZTtcbiAgICB9XG4gICAgZ2V0VnR0KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b1Z0dCgpLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGNzdikgPT4ge1xuICAgICAgICAgICAgY2hyb21lLmRvd25sb2Fkcy5kb3dubG9hZCh7XG4gICAgICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFsnV0VCVlRUXFxuXFxuJyArIGNzdl0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyAnLnZ0dCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0U3J0KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b1NydCgpLCBvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oKGNzdikgPT4ge1xuICAgICAgICAgICAgY2hyb21lLmRvd25sb2Fkcy5kb3dubG9hZCh7XG4gICAgICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtjc3ZdLCB7IHR5cGU6ICd0ZXh0L3BsYWluJyB9KSksXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVuYW1lICsgJy5zcnQnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyKVxuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGdldENzdihmaWxlbmFtZSkge1xuICAgICAgICBqc29uMmNzdlxuICAgICAgICAgICAgLmpzb24yY3N2QXN5bmMobmV3IGNvbnZlcnRlcl8xLmRlZmF1bHQodGhpcy54bWxSZXNwb25zZSkudG9Dc3YoKSlcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiAndGV4dC9jc3YnIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyAnLmNzdidcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0VGV4dChmaWxlbmFtZSkge1xuICAgICAgICBjb25zdCBqc29uMmNzdiA9IHJlcXVpcmUoJ2pzb24tMi1jc3YnKTtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvQ3N2KCkpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2Nzdl0sIHsgdHlwZTogJ3RleHQvcGxhbmUnIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyAnLnR4dCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBTdWJ0aXRsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgVGltZXN0YW1wIHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydCwgZHVyYXRpb24pIHtcbiAgICAgICAgdGhpcy5zdGFydCA9IHN0YXJ0O1xuICAgICAgICB0aGlzLmR1cmF0aW9uID0gZHVyYXRpb247XG4gICAgfVxuICAgIGdldFN0YXJ0VGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udmVydFRpbWUodGhpcy5zdGFydCk7XG4gICAgfVxuICAgIGdldER1cmF0aW9uVGltZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVyZ2VUaW1lKHRoaXMuc3RhcnQsIHRoaXMuZHVyYXRpb24pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgU1JUIHRpbWVzdGFtcCBmb3JtYXQuXG4gICAgICogZXhhbXBsZTogMDA6MDA6MDAsMDAwIC0tPiAwMDowMDowMCwwMDBcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICogQG1lbWJlcm9mIFRpbWVzdGFtcFxuICAgICAqL1xuICAgIGZvcm1hdFNydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUaW1lKCkucmVwbGFjZSgvWy5dLywgJywnKSArICcgLS0+ICcgKyB0aGlzLmdldER1cmF0aW9uVGltZSgpLnJlcGxhY2UoL1suXS8sICcsJykgKyAnXFxuJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIFZUVCB0aW1lc3RhbXAgZm9ybWF0LlxuICAgICAqIGV4YW1wbGU6IDAwOjAwOjAwLjAwMCAtLT4gMDA6MDA6MDAuMDAwXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBmb3JtYXRWdHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0YXJ0VGltZSgpICsgJyAtLT4gJyArIHRoaXMuZ2V0RHVyYXRpb25UaW1lKCkgKyAnXFxuJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIHN0YXJ0IHRpbWUgYW5kIGR1cmF0aW9uIHRpbWVcbiAgICAgKlxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXJ0U2Vjb25kc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvblNlY29uZHNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBtZXJnZVRpbWUoc3RhcnRTZWNvbmRzLCBkdXJhdGlvblNlY29uZHMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKHN0YXJ0U2Vjb25kcyAqIDEwMDAgKyBkdXJhdGlvblNlY29uZHMgKiAxMDAwKS50b0lTT1N0cmluZygpLnNsaWNlKDExLCAtMSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdGltZSBmb3JtYXQgZnJvbSBtbS5zcyB0byBISDptbTpzc3MuXG4gICAgICogZXhhbXBsZTogMTAuMTU5ID0+IDAwOjAwOjEwLjE1OVxuICAgICAqIEBwcml2YXRlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHNlY29uZHNcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqIEBtZW1iZXJvZiBUaW1lc3RhbXBcbiAgICAgKi9cbiAgICBjb252ZXJ0VGltZShzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShzZWNvbmRzICogMTAwMCkudG9JU09TdHJpbmcoKS5zbGljZSgxMSwgLTEpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFRpbWVzdGFtcDtcbiJdLCJzb3VyY2VSb290IjoiIn0=