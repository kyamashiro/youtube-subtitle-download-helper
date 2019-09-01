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
     */
    formatSrt() {
        return this.getStartTime().replace(/[.]/, ',') + ' --> ' + this.getDurationTime().replace(/[.]/, ',') + '\n';
    }
    /**
     * Create VTT timestamp format.
     * example: 00:00:00.000 --> 00:00:00.000
     */
    formatVtt() {
        return this.getStartTime() + ' --> ' + this.getDurationTime() + '\n';
    }
    /**
     * Add start time and duration time
     */
    mergeTime(startSeconds, durationSeconds) {
        return new Date(startSeconds * 1000 + durationSeconds * 1000).toISOString().slice(11, -1);
    }
    /**
     * Convert time format from mm.ss to HH:mm:sss.
     * example: 10.159 => 00:00:10.159
     */
    convertTime(seconds) {
        return new Date(seconds * 1000).toISOString().slice(11, -1);
    }
}
exports.default = Timestamp;


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2RlZWtzL3NyYy9kZWVrcy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZG9jLXBhdGgvc3JjL3BhdGguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2hlL2hlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy9jb252ZXJ0ZXIuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2pzb24tMi1jc3Yvc3JjL2NzdjJqc29uLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9qc29uLTItY3N2L3NyYy9qc29uMmNzdi5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbi0yLWNzdi9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3N0cmlwdGFncy9zcmMvc3RyaXB0YWdzLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91bmRlcnNjb3JlL3VuZGVyc2NvcmUuanMiLCJ3ZWJwYWNrOi8vLyh3ZWJwYWNrKS9idWlsZGluL21vZHVsZS5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2FwdGlvbnNQYXJzZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NsaWVudC9jbGllbnRZb3V0dWJlLnRzIiwid2VicGFjazovLy8uL3NyYy9jb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3BvcHVwLnRzIiwid2VicGFjazovLy8uL3NyYy9zdWJ0aXRsZS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdGltZXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNsRmE7O0FBRWIsVUFBVSxtQkFBTyxDQUFDLDJEQUFZOztBQUU5QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7Ozs7Ozs7Ozs7Ozs7QUNwSWE7O0FBRWI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUyx5Q0FBeUM7O0FBRWxEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTLHlDQUF5Qzs7QUFFbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3pFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQSxtQkFBbUIsS0FBMEI7O0FBRTdDO0FBQ0Esa0JBQWtCLEtBQXlCO0FBQzNDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQiw4aUJBQThpQix3WkFBd1osV0FBVzs7QUFFbitCO0FBQ0E7QUFDQSxjQUFjO0FBQ2QsYUFBYTtBQUNiLGVBQWU7QUFDZixZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7O0FBRUE7QUFDQTtBQUNBLHd4ZkFBd3hmLGluQkFBaW5CLDZCQUE2Qix5QkFBeUI7QUFDLzdnQixrQkFBa0IsNHRlQUE0dGUsd0tBQXdLLDJ1WkFBMnVaLHdLQUF3Syw2Z0ZBQTZnRjtBQUN0ejlCLHdCQUF3QjtBQUN4Qix5QkFBeUI7QUFDekI7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDBEQUEwRDtBQUMxRDs7QUFFQTtBQUNBLDhCQUE4QjtBQUM5Qjs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixpQkFBaUI7QUFDcEMsbUJBQW1CLGlCQUFpQjtBQUNwQyxxQkFBcUIsTUFBTSxZQUFZO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QyxLQUFLO0FBQ0w7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QyxFQUFFO0FBQzFDLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixpQkFBaUI7QUFDbkMsa0JBQWtCLGlCQUFpQjtBQUNuQztBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkMsSUFBSTtBQUNKLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0REFBNEQ7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE4QztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esa0RBQWtEO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLElBRVU7QUFDWjtBQUNBLEVBQUUsbUNBQU87QUFDVDtBQUNBLEdBQUc7QUFBQSxvR0FBQztBQUNKLEVBQUUsTUFBTSxZQVVOOztBQUVGLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4Vlk7O0FBRWIsS0FBSyxTQUFTLEdBQUcsbUJBQU8sQ0FBQyw2REFBWTtBQUNyQyxLQUFLLFNBQVMsR0FBRyxtQkFBTyxDQUFDLDZEQUFZO0FBQ3JDLFlBQVksbUJBQU8sQ0FBQyx1REFBUzs7QUFFN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUNyRWE7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsc0VBQWtCO0FBQzFDLFlBQVksbUJBQU8sQ0FBQyx1REFBUztBQUM3QixRQUFRLG1CQUFPLENBQUMsMkRBQVk7QUFDNUIsV0FBVyxtQkFBTyxDQUFDLHFEQUFVOztBQUU3QjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxxQkFBcUIsU0FBUztBQUM5QixpQkFBaUI7QUFDakI7QUFDQTtBQUNBLHNCQUFzQixNQUFNO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLG9EQUFvRDs7QUFFcEQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLFNBQVM7QUFDN0IsbUJBQW1CLE9BQU8sRUFBRTtBQUM1QjtBQUNBO0FBQ0EsMERBQTBEO0FBQzFEOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLE9BQU87QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7O0FBRUE7QUFDQTtBQUNBLFNBQVMsSUFBSTtBQUNiOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFzQixPQUFPLEVBQUU7QUFDL0IsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGtCQUFrQjs7Ozs7Ozs7Ozs7OztBQ2hZTDs7QUFFYixnQkFBZ0IsbUJBQU8sQ0FBQyxzRUFBa0I7QUFDMUMsWUFBWSxtQkFBTyxDQUFDLHVEQUFTO0FBQzdCLFFBQVEsbUJBQU8sQ0FBQywyREFBWTtBQUM1QixXQUFXLG1CQUFPLENBQUMscURBQVU7QUFDN0IsWUFBWSxtQkFBTyxDQUFDLGdEQUFPOztBQUUzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0Esb0JBQW9CLGNBQWM7QUFDbEMsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUIsaUJBQWlCLGNBQWM7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlCQUFpQjs7QUFFakI7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsRUFBRTtBQUNuQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixxQkFBcUI7QUFDekMsd0JBQXdCLFNBQVM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEI7QUFDMUI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxrQkFBa0I7Ozs7Ozs7Ozs7Ozs7QUNwV0w7O0FBRWIsZ0JBQWdCLG1CQUFPLENBQUMsc0VBQWtCO0FBQzFDLFFBQVEsbUJBQU8sQ0FBQywyREFBWTs7QUFFNUIsNEJBQTRCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7O0FBRWxFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkIsWUFBWSxPQUFPO0FBQ25CO0FBQ0E7QUFDQSxnQ0FBZ0M7O0FBRWhDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGdCQUFnQjtBQUNoQyxnQkFBZ0IsZ0JBQWdCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU8sZUFBZSxRQUFRLElBQUksYUFBYSxTQUFTLHlDQUF5QyxPQUFPO0FBQzFIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQSxTQUFTLGtCQUFrQjtBQUMzQjs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ3ZMQSxrQ0FBYTs7QUFFYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLCtDQUErQyxjQUFjO0FBQzdEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUJBQXlCO0FBQ3pCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxRQUFRLElBQTBDO0FBQ2xEO0FBQ0EsUUFBUSxtQ0FBTywyQkFBMkIsa0JBQWtCLEVBQUU7QUFBQSxvR0FBQztBQUMvRDs7QUFFQSxTQUFTLEVBUUo7QUFDTCxDQUFDOzs7Ozs7Ozs7Ozs7QUMxT0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sS0FBNkI7QUFDbkMsUUFBUSxLQUE0QjtBQUNwQztBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksZ0JBQWdCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsb0JBQW9CO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixZQUFZO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxZQUFZO0FBQ2xEO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSx1Q0FBdUMsWUFBWTtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLDhCQUE4QjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGdCQUFnQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixnQkFBZ0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxZQUFZO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxZQUFZO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFdBQVc7QUFDbEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esa0RBQWtEO0FBQ2xELEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDO0FBQ3hDLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLFlBQVk7QUFDMUQ7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCLGdCQUFnQjtBQUNqQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLFlBQVk7QUFDekQ7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksOEJBQThCO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsMEJBQTBCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSxxQkFBcUIsY0FBYztBQUNuQztBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLFlBQVk7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLGVBQWU7QUFDdEI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxxQkFBcUIsZUFBZTtBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsZ0JBQWdCO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLGdCQUFnQjtBQUN6QztBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsT0FBTztBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxZQUFZO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5Q0FBeUMsWUFBWTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EscURBQXFEO0FBQ3JEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNLEtBQXdCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFlBQVk7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixPQUFPO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZUFBZTtBQUNmLGNBQWM7QUFDZCxjQUFjO0FBQ2QsZ0JBQWdCO0FBQ2hCLGdCQUFnQjtBQUNoQixnQkFBZ0I7QUFDaEI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsWUFBWTtBQUMvQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCOztBQUU1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxPQUFPO0FBQ1AscUJBQXFCO0FBQ3JCOztBQUVBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsaUJBQWlCOztBQUVqQjtBQUNBLGtEQUFrRCxFQUFFLGlCQUFpQjs7QUFFckU7QUFDQSx3QkFBd0IsOEJBQThCO0FBQ3RELDJCQUEyQjs7QUFFM0I7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGtEQUFrRCxpQkFBaUI7O0FBRW5FO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBeUM7QUFDL0MsSUFBSSxpQ0FBcUIsRUFBRSxtQ0FBRTtBQUM3QjtBQUNBLEtBQUs7QUFBQSxvR0FBQztBQUNOO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7OztBQzNwREQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDckJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCxvQ0FBb0MsbUJBQU8sQ0FBQyx1Q0FBYTtBQUN6RDtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0E7QUFDQSxlQUFlLE9BQU87QUFDdEIsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQjtBQUMzQjtBQUNBLDBCQUEwQixtQkFBTyxDQUFDLDREQUFXO0FBQzdDLG1CQUFtQixtQkFBTyxDQUFDLG1DQUFJO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxPQUFPO0FBQ3RCLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDakVhO0FBQ2IsOENBQThDLGNBQWM7QUFDNUQ7QUFDQTtBQUNBLDhFQUE4RSxRQUFRO0FBQ3RGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7O0FDNUJhO0FBQ2I7QUFDQSw0Q0FBNEM7QUFDNUM7QUFDQSw4Q0FBOEMsY0FBYztBQUM1RCx5Q0FBeUMsbUJBQU8sQ0FBQyxpREFBa0I7QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQ25FYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQsbUNBQW1DLG1CQUFPLENBQUMscUNBQVk7QUFDdkQsd0NBQXdDLG1CQUFPLENBQUMsNkRBQXdCO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsb0NBQW9DO0FBQzNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlGQUF5RixjQUFjLEdBQUcsc0JBQXNCO0FBQ2hJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyRUFBMkUsUUFBUTtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7Ozs7Ozs7Ozs7OztBQ3BGYTtBQUNiO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsOENBQThDLGNBQWM7QUFDNUQsb0NBQW9DLG1CQUFPLENBQUMsdUNBQWE7QUFDekQsaUJBQWlCLG1CQUFPLENBQUMsOERBQVk7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUVBQXlFLHFCQUFxQjtBQUM5RjtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCxxQkFBcUI7QUFDL0U7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsbUJBQW1CO0FBQzdFO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLHlCQUF5QixtQkFBTyxDQUFDLDhEQUFZO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMERBQTBELHFCQUFxQjtBQUMvRTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7OztBQzdFYTtBQUNiLDhDQUE4QyxjQUFjO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InBvcHVwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvcG9wdXAudHNcIik7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRlZXBLZXlzOiBkZWVwS2V5cyxcbiAgICBkZWVwS2V5c0Zyb21MaXN0OiBkZWVwS2V5c0Zyb21MaXN0XG59O1xuXG4vKipcbiAqIFJldHVybiB0aGUgZGVlcCBrZXlzIGxpc3QgZm9yIGEgc2luZ2xlIGRvY3VtZW50XG4gKiBAcGFyYW0gb2JqZWN0XG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMge0FycmF5fVxuICovXG5mdW5jdGlvbiBkZWVwS2V5cyhvYmplY3QsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIGlmIChfLmlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgICAgcmV0dXJuIGdlbmVyYXRlRGVlcEtleXNMaXN0KCcnLCBvYmplY3QsIG9wdGlvbnMpO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBkZWVwIGtleXMgbGlzdCBmb3IgYWxsIGRvY3VtZW50cyBpbiB0aGUgcHJvdmlkZWQgbGlzdFxuICogQHBhcmFtIGxpc3RcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyBBcnJheVtBcnJheVtTdHJpbmddXVxuICovXG5mdW5jdGlvbiBkZWVwS2V5c0Zyb21MaXN0KGxpc3QsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gbWVyZ2VPcHRpb25zKG9wdGlvbnMpO1xuICAgIHJldHVybiBsaXN0Lm1hcCgoZG9jdW1lbnQpID0+IHsgLy8gZm9yIGVhY2ggZG9jdW1lbnRcbiAgICAgICAgaWYgKF8uaXNPYmplY3QoZG9jdW1lbnQpKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgZGF0YSBhdCB0aGUga2V5IGlzIGEgZG9jdW1lbnQsIHRoZW4gd2UgcmV0cmlldmUgdGhlIHN1YkhlYWRpbmcgc3RhcnRpbmcgd2l0aCBhbiBlbXB0eSBzdHJpbmcgaGVhZGluZyBhbmQgdGhlIGRvY1xuICAgICAgICAgICAgcmV0dXJuIGRlZXBLZXlzKGRvY3VtZW50LCBvcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW107XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlRGVlcEtleXNMaXN0KGhlYWRpbmcsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKGRhdGEpLm1hcCgoY3VycmVudEtleSkgPT4ge1xuICAgICAgICAvLyBJZiB0aGUgZ2l2ZW4gaGVhZGluZyBpcyBlbXB0eSwgdGhlbiB3ZSBzZXQgdGhlIGhlYWRpbmcgdG8gYmUgdGhlIHN1YktleSwgb3RoZXJ3aXNlIHNldCBpdCBhcyBhIG5lc3RlZCBoZWFkaW5nIHcvIGEgZG90XG4gICAgICAgIGxldCBrZXlOYW1lID0gYnVpbGRLZXlOYW1lKGhlYWRpbmcsIGN1cnJlbnRLZXkpO1xuXG4gICAgICAgIC8vIElmIHdlIGhhdmUgYW5vdGhlciBuZXN0ZWQgZG9jdW1lbnQsIHJlY3VyIG9uIHRoZSBzdWItZG9jdW1lbnQgdG8gcmV0cmlldmUgdGhlIGZ1bGwga2V5IG5hbWVcbiAgICAgICAgaWYgKGlzRG9jdW1lbnRUb1JlY3VyT24oZGF0YVtjdXJyZW50S2V5XSkpIHtcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZURlZXBLZXlzTGlzdChrZXlOYW1lLCBkYXRhW2N1cnJlbnRLZXldLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIGlmIChvcHRpb25zLmV4cGFuZEFycmF5T2JqZWN0cyAmJiBpc0FycmF5VG9SZWN1ck9uKGRhdGFbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBoYXZlIGEgbmVzdGVkIGFycmF5IHRoYXQgd2UgbmVlZCB0byByZWN1ciBvblxuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3NBcnJheUtleXMoZGF0YVtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb3B0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlIHJldHVybiB0aGlzIGtleSBuYW1lIHNpbmNlIHdlIGRvbid0IGhhdmUgYSBzdWIgZG9jdW1lbnRcbiAgICAgICAgcmV0dXJuIGtleU5hbWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gXy5mbGF0dGVuKGtleXMpO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBoYW5kbGUgdGhlIHByb2Nlc3Npbmcgb2YgYXJyYXlzIHdoZW4gdGhlIGV4cGFuZEFycmF5T2JqZWN0c1xuICogb3B0aW9uIGlzIHNwZWNpZmllZC5cbiAqIEBwYXJhbSBzdWJBcnJheVxuICogQHBhcmFtIGN1cnJlbnRLZXlQYXRoXG4gKiBAcGFyYW0gb3B0aW9uc1xuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NBcnJheUtleXMoc3ViQXJyYXksIGN1cnJlbnRLZXlQYXRoLCBvcHRpb25zKSB7XG4gICAgbGV0IHN1YkFycmF5S2V5cyA9IGRlZXBLZXlzRnJvbUxpc3Qoc3ViQXJyYXkpO1xuXG4gICAgaWYgKCFzdWJBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMuaWdub3JlRW1wdHlBcnJheXNXaGVuRXhwYW5kaW5nID8gW10gOiBbY3VycmVudEtleVBhdGhdO1xuICAgIH0gZWxzZSBpZiAoc3ViQXJyYXkubGVuZ3RoICYmIF8uZmxhdHRlbihzdWJBcnJheUtleXMpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBIYXMgaXRlbXMgaW4gdGhlIGFycmF5LCBidXQgbm8gb2JqZWN0c1xuICAgICAgICByZXR1cm4gW2N1cnJlbnRLZXlQYXRoXTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzdWJBcnJheUtleXMgPSBzdWJBcnJheUtleXMubWFwKChzY2hlbWFLZXlzKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNFbXB0eUFycmF5KHNjaGVtYUtleXMpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtjdXJyZW50S2V5UGF0aF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2NoZW1hS2V5cy5tYXAoKHN1YktleSkgPT4gYnVpbGRLZXlOYW1lKGN1cnJlbnRLZXlQYXRoLCBzdWJLZXkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIF8udW5pcShfLmZsYXR0ZW4oc3ViQXJyYXlLZXlzKSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGtleSBwYXRoXG4gKiBAcGFyYW0gdXBwZXJLZXlOYW1lIFN0cmluZyBhY2N1bXVsYXRlZCBrZXkgcGF0aFxuICogQHBhcmFtIGN1cnJlbnRLZXlOYW1lIFN0cmluZyBjdXJyZW50IGtleSBuYW1lXG4gKiBAcmV0dXJucyBTdHJpbmdcbiAqL1xuZnVuY3Rpb24gYnVpbGRLZXlOYW1lKHVwcGVyS2V5TmFtZSwgY3VycmVudEtleU5hbWUpIHtcbiAgICBpZiAodXBwZXJLZXlOYW1lKSB7XG4gICAgICAgIHJldHVybiB1cHBlcktleU5hbWUgKyAnLicgKyBjdXJyZW50S2V5TmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnRLZXlOYW1lO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciB0aGlzIHZhbHVlIGlzIGEgZG9jdW1lbnQgdG8gcmVjdXIgb24gb3Igbm90XG4gKiBAcGFyYW0gdmFsIEFueSBpdGVtIHdob3NlIHR5cGUgd2lsbCBiZSBldmFsdWF0ZWRcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0RvY3VtZW50VG9SZWN1ck9uKHZhbCkge1xuICAgIHJldHVybiBfLmlzT2JqZWN0KHZhbCkgJiYgIV8uaXNOdWxsKHZhbCkgJiYgIUFycmF5LmlzQXJyYXkodmFsKSAmJiBPYmplY3Qua2V5cyh2YWwpLmxlbmd0aDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgdGhpcyB2YWx1ZSBpcyBhbiBhcnJheSB0byByZWN1ciBvbiBvciBub3RcbiAqIEBwYXJhbSB2YWwgQW55IGl0ZW0gd2hvc2UgdHlwZSB3aWxsIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlUb1JlY3VyT24odmFsKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IGEgdmFsdWUgaXMgYW4gZW1wdHkgYXJyYXlcbiAqIEBwYXJhbSB2YWxcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0VtcHR5QXJyYXkodmFsKSB7XG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsKSAmJiAhdmFsLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gbWVyZ2VPcHRpb25zKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gXy5kZWZhdWx0cyhvcHRpb25zIHx8IHt9LCB7XG4gICAgICAgIGV4cGFuZEFycmF5T2JqZWN0czogZmFsc2UsXG4gICAgICAgIGlnbm9yZUVtcHR5QXJyYXlzV2hlbkV4cGFuZGluZzogZmFsc2VcbiAgICB9KTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZXZhbHVhdGVQYXRoLFxuICAgIHNldFBhdGhcbn07XG5cbmZ1bmN0aW9uIGV2YWx1YXRlUGF0aChkb2N1bWVudCwga2V5UGF0aCkge1xuICAgIGlmICghZG9jdW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHtpbmRleE9mRG90LCBjdXJyZW50S2V5LCByZW1haW5pbmdLZXlQYXRofSA9IGNvbXB1dGVTdGF0ZUluZm9ybWF0aW9uKGtleVBhdGgpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSAnLicgaW4gdGhlIGtleVBhdGggYW5kIGtleVBhdGggZG9lc24ndCBhcHBlYXIgaW4gdGhlIGRvY3VtZW50LCByZWN1ciBvbiB0aGUgc3ViZG9jdW1lbnRcbiAgICBpZiAoaW5kZXhPZkRvdCA+PSAwICYmICFkb2N1bWVudFtrZXlQYXRoXSkge1xuICAgICAgICAvLyBJZiB0aGVyZSdzIGFuIGFycmF5IGF0IHRoZSBjdXJyZW50S2V5IGluIHRoZSBkb2N1bWVudCwgdGhlbiBpdGVyYXRlIG92ZXIgdGhvc2UgaXRlbXMgZXZhbHVhdGluZyB0aGUgcmVtYWluaW5nIHBhdGhcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZG9jdW1lbnRbY3VycmVudEtleV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnRbY3VycmVudEtleV0ubWFwKChkb2MpID0+IGV2YWx1YXRlUGF0aChkb2MsIHJlbWFpbmluZ0tleVBhdGgpKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGNhbiBqdXN0IHJlY3VyXG4gICAgICAgIHJldHVybiBldmFsdWF0ZVBhdGgoZG9jdW1lbnRbY3VycmVudEtleV0sIHJlbWFpbmluZ0tleVBhdGgpO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkb2N1bWVudCkpIHtcbiAgICAgICAgLy8gSWYgdGhpcyBcImRvY3VtZW50XCIgaXMgYWN0dWFsbHkgYW4gYXJyYXksIHRoZW4gaXRlcmF0ZSBvdmVyIHRob3NlIGl0ZW1zIGV2YWx1YXRpbmcgdGhlIHBhdGhcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50Lm1hcCgoZG9jKSA9PiBldmFsdWF0ZVBhdGgoZG9jLCBrZXlQYXRoKSk7XG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4ganVzdCByZXR1cm4gdmFsdWUgZGlyZWN0bHlcbiAgICByZXR1cm4gZG9jdW1lbnRba2V5UGF0aF07XG59XG5cbmZ1bmN0aW9uIHNldFBhdGgoZG9jdW1lbnQsIGtleVBhdGgsIHZhbHVlKSB7XG4gICAgaWYgKCFkb2N1bWVudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGRvY3VtZW50IHdhcyBwcm92aWRlZC4nKTtcbiAgICB9XG5cbiAgICBsZXQge2luZGV4T2ZEb3QsIGN1cnJlbnRLZXksIHJlbWFpbmluZ0tleVBhdGh9ID0gY29tcHV0ZVN0YXRlSW5mb3JtYXRpb24oa2V5UGF0aCk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhICcuJyBpbiB0aGUga2V5UGF0aCwgcmVjdXIgb24gdGhlIHN1YmRvYyBhbmQgLi4uXG4gICAgaWYgKGluZGV4T2ZEb3QgPj0gMCkge1xuICAgICAgICBpZiAoIWRvY3VtZW50W2N1cnJlbnRLZXldICYmIEFycmF5LmlzQXJyYXkoZG9jdW1lbnQpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIGFycmF5IGFuZCB0aGVyZSBhcmUgbXVsdGlwbGUgbGV2ZWxzIG9mIGtleXMgdG8gaXRlcmF0ZSBvdmVyLCByZWN1ci5cbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudC5mb3JFYWNoKChkb2MpID0+IHNldFBhdGgoZG9jLCBrZXlQYXRoLCB2YWx1ZSkpO1xuICAgICAgICB9IGVsc2UgaWYgKCFkb2N1bWVudFtjdXJyZW50S2V5XSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlIGN1cnJlbnRLZXkgZG9lc24ndCBleGlzdCB5ZXQsIHBvcHVsYXRlIGl0XG4gICAgICAgICAgICBkb2N1bWVudFtjdXJyZW50S2V5XSA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIHNldFBhdGgoZG9jdW1lbnRbY3VycmVudEtleV0sIHJlbWFpbmluZ0tleVBhdGgsIHZhbHVlKTtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZG9jdW1lbnQpKSB7XG4gICAgICAgIC8vIElmIHRoaXMgXCJkb2N1bWVudFwiIGlzIGFjdHVhbGx5IGFuIGFycmF5LCB0aGVuIHdlIGNhbiBsb29wIG92ZXIgZWFjaCBvZiB0aGUgdmFsdWVzIGFuZCBzZXQgdGhlIHBhdGhcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmZvckVhY2goKGRvYykgPT4gc2V0UGF0aChkb2MsIHJlbWFpbmluZ0tleVBhdGgsIHZhbHVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4gc2V0IHRoZSBwYXRoIGRpcmVjdGx5XG4gICAgICAgIGRvY3VtZW50W2tleVBhdGhdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRvY3VtZW50O1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgc29tZSBpbmZvcm1hdGlvbiBuZWNlc3NhcnkgdG8gZXZhbHVhdGUgb3Igc2V0IGEgcGF0aFxuICogICBiYXNlZCBvbiB0aGUgcHJvdmlkZWQga2V5UGF0aCB2YWx1ZVxuICogQHBhcmFtIGtleVBhdGhcbiAqIEByZXR1cm5zIHt7aW5kZXhPZkRvdDogTnVtYmVyLCBjdXJyZW50S2V5OiBTdHJpbmcsIHJlbWFpbmluZ0tleVBhdGg6IFN0cmluZ319XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVTdGF0ZUluZm9ybWF0aW9uKGtleVBhdGgpIHtcbiAgICBsZXQgaW5kZXhPZkRvdCA9IGtleVBhdGguaW5kZXhPZignLicpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5kZXhPZkRvdCxcbiAgICAgICAgY3VycmVudEtleToga2V5UGF0aC5zbGljZSgwLCBpbmRleE9mRG90ID49IDAgPyBpbmRleE9mRG90IDogdW5kZWZpbmVkKSxcbiAgICAgICAgcmVtYWluaW5nS2V5UGF0aDoga2V5UGF0aC5zbGljZShpbmRleE9mRG90ICsgMSlcbiAgICB9O1xufVxuIiwiLyohIGh0dHBzOi8vbXRocy5iZS9oZSB2MS4yLjAgYnkgQG1hdGhpYXMgfCBNSVQgbGljZW5zZSAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0Ly8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYC5cblx0dmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cztcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC5cblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdG1vZHVsZS5leHBvcnRzID09IGZyZWVFeHBvcnRzICYmIG1vZHVsZTtcblxuXHQvLyBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCwgZnJvbSBOb2RlLmpzIG9yIEJyb3dzZXJpZmllZCBjb2RlLFxuXHQvLyBhbmQgdXNlIGl0IGFzIGByb290YC5cblx0dmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbDtcblx0aWYgKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsIHx8IGZyZWVHbG9iYWwud2luZG93ID09PSBmcmVlR2xvYmFsKSB7XG5cdFx0cm9vdCA9IGZyZWVHbG9iYWw7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvLyBBbGwgYXN0cmFsIHN5bWJvbHMuXG5cdHZhciByZWdleEFzdHJhbFN5bWJvbHMgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXS9nO1xuXHQvLyBBbGwgQVNDSUkgc3ltYm9scyAobm90IGp1c3QgcHJpbnRhYmxlIEFTQ0lJKSBleGNlcHQgdGhvc2UgbGlzdGVkIGluIHRoZVxuXHQvLyBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZS5cblx0Ly8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjdGFibGUtY2hhcnJlZi1vdmVycmlkZXNcblx0dmFyIHJlZ2V4QXNjaWlXaGl0ZWxpc3QgPSAvW1xceDAxLVxceDdGXS9nO1xuXHQvLyBBbGwgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IEFTQ0lJIG5ld2xpbmVzLCBwcmludGFibGUgQVNDSUkgc3ltYm9scywgb3Jcblx0Ly8gY29kZSBwb2ludHMgbGlzdGVkIGluIHRoZSBmaXJzdCBjb2x1bW4gb2YgdGhlIG92ZXJyaWRlcyB0YWJsZSBvblxuXHQvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCN0YWJsZS1jaGFycmVmLW92ZXJyaWRlcy5cblx0dmFyIHJlZ2V4Qm1wV2hpdGVsaXN0ID0gL1tcXHgwMS1cXHRcXHgwQlxcZlxceDBFLVxceDFGXFx4N0ZcXHg4MVxceDhEXFx4OEZcXHg5MFxceDlEXFx4QTAtXFx1RkZGRl0vZztcblxuXHR2YXIgcmVnZXhFbmNvZGVOb25Bc2NpaSA9IC88XFx1MjBEMnw9XFx1MjBFNXw+XFx1MjBEMnxcXHUyMDVGXFx1MjAwQXxcXHUyMTlEXFx1MDMzOHxcXHUyMjAyXFx1MDMzOHxcXHUyMjIwXFx1MjBEMnxcXHUyMjI5XFx1RkUwMHxcXHUyMjJBXFx1RkUwMHxcXHUyMjNDXFx1MjBEMnxcXHUyMjNEXFx1MDMzMXxcXHUyMjNFXFx1MDMzM3xcXHUyMjQyXFx1MDMzOHxcXHUyMjRCXFx1MDMzOHxcXHUyMjREXFx1MjBEMnxcXHUyMjRFXFx1MDMzOHxcXHUyMjRGXFx1MDMzOHxcXHUyMjUwXFx1MDMzOHxcXHUyMjYxXFx1MjBFNXxcXHUyMjY0XFx1MjBEMnxcXHUyMjY1XFx1MjBEMnxcXHUyMjY2XFx1MDMzOHxcXHUyMjY3XFx1MDMzOHxcXHUyMjY4XFx1RkUwMHxcXHUyMjY5XFx1RkUwMHxcXHUyMjZBXFx1MDMzOHxcXHUyMjZBXFx1MjBEMnxcXHUyMjZCXFx1MDMzOHxcXHUyMjZCXFx1MjBEMnxcXHUyMjdGXFx1MDMzOHxcXHUyMjgyXFx1MjBEMnxcXHUyMjgzXFx1MjBEMnxcXHUyMjhBXFx1RkUwMHxcXHUyMjhCXFx1RkUwMHxcXHUyMjhGXFx1MDMzOHxcXHUyMjkwXFx1MDMzOHxcXHUyMjkzXFx1RkUwMHxcXHUyMjk0XFx1RkUwMHxcXHUyMkI0XFx1MjBEMnxcXHUyMkI1XFx1MjBEMnxcXHUyMkQ4XFx1MDMzOHxcXHUyMkQ5XFx1MDMzOHxcXHUyMkRBXFx1RkUwMHxcXHUyMkRCXFx1RkUwMHxcXHUyMkY1XFx1MDMzOHxcXHUyMkY5XFx1MDMzOHxcXHUyOTMzXFx1MDMzOHxcXHUyOUNGXFx1MDMzOHxcXHUyOUQwXFx1MDMzOHxcXHUyQTZEXFx1MDMzOHxcXHUyQTcwXFx1MDMzOHxcXHUyQTdEXFx1MDMzOHxcXHUyQTdFXFx1MDMzOHxcXHUyQUExXFx1MDMzOHxcXHUyQUEyXFx1MDMzOHxcXHUyQUFDXFx1RkUwMHxcXHUyQUFEXFx1RkUwMHxcXHUyQUFGXFx1MDMzOHxcXHUyQUIwXFx1MDMzOHxcXHUyQUM1XFx1MDMzOHxcXHUyQUM2XFx1MDMzOHxcXHUyQUNCXFx1RkUwMHxcXHUyQUNDXFx1RkUwMHxcXHUyQUZEXFx1MjBFNXxbXFx4QTAtXFx1MDExM1xcdTAxMTYtXFx1MDEyMlxcdTAxMjQtXFx1MDEyQlxcdTAxMkUtXFx1MDE0RFxcdTAxNTAtXFx1MDE3RVxcdTAxOTJcXHUwMUI1XFx1MDFGNVxcdTAyMzdcXHUwMkM2XFx1MDJDN1xcdTAyRDgtXFx1MDJERFxcdTAzMTFcXHUwMzkxLVxcdTAzQTFcXHUwM0EzLVxcdTAzQTlcXHUwM0IxLVxcdTAzQzlcXHUwM0QxXFx1MDNEMlxcdTAzRDVcXHUwM0Q2XFx1MDNEQ1xcdTAzRERcXHUwM0YwXFx1MDNGMVxcdTAzRjVcXHUwM0Y2XFx1MDQwMS1cXHUwNDBDXFx1MDQwRS1cXHUwNDRGXFx1MDQ1MS1cXHUwNDVDXFx1MDQ1RVxcdTA0NUZcXHUyMDAyLVxcdTIwMDVcXHUyMDA3LVxcdTIwMTBcXHUyMDEzLVxcdTIwMTZcXHUyMDE4LVxcdTIwMUFcXHUyMDFDLVxcdTIwMUVcXHUyMDIwLVxcdTIwMjJcXHUyMDI1XFx1MjAyNlxcdTIwMzAtXFx1MjAzNVxcdTIwMzlcXHUyMDNBXFx1MjAzRVxcdTIwNDFcXHUyMDQzXFx1MjA0NFxcdTIwNEZcXHUyMDU3XFx1MjA1Ri1cXHUyMDYzXFx1MjBBQ1xcdTIwREJcXHUyMERDXFx1MjEwMlxcdTIxMDVcXHUyMTBBLVxcdTIxMTNcXHUyMTE1LVxcdTIxMUVcXHUyMTIyXFx1MjEyNFxcdTIxMjctXFx1MjEyOVxcdTIxMkNcXHUyMTJEXFx1MjEyRi1cXHUyMTMxXFx1MjEzMy1cXHUyMTM4XFx1MjE0NS1cXHUyMTQ4XFx1MjE1My1cXHUyMTVFXFx1MjE5MC1cXHUyMTlCXFx1MjE5RC1cXHUyMUE3XFx1MjFBOS1cXHUyMUFFXFx1MjFCMC1cXHUyMUIzXFx1MjFCNS1cXHUyMUI3XFx1MjFCQS1cXHUyMURCXFx1MjFERFxcdTIxRTRcXHUyMUU1XFx1MjFGNVxcdTIxRkQtXFx1MjIwNVxcdTIyMDctXFx1MjIwOVxcdTIyMEJcXHUyMjBDXFx1MjIwRi1cXHUyMjE0XFx1MjIxNi1cXHUyMjE4XFx1MjIxQVxcdTIyMUQtXFx1MjIzOFxcdTIyM0EtXFx1MjI1N1xcdTIyNTlcXHUyMjVBXFx1MjI1Q1xcdTIyNUYtXFx1MjI2MlxcdTIyNjQtXFx1MjI4QlxcdTIyOEQtXFx1MjI5QlxcdTIyOUQtXFx1MjJBNVxcdTIyQTctXFx1MjJCMFxcdTIyQjItXFx1MjJCQlxcdTIyQkQtXFx1MjJEQlxcdTIyREUtXFx1MjJFM1xcdTIyRTYtXFx1MjJGN1xcdTIyRjktXFx1MjJGRVxcdTIzMDVcXHUyMzA2XFx1MjMwOC1cXHUyMzEwXFx1MjMxMlxcdTIzMTNcXHUyMzE1XFx1MjMxNlxcdTIzMUMtXFx1MjMxRlxcdTIzMjJcXHUyMzIzXFx1MjMyRFxcdTIzMkVcXHUyMzM2XFx1MjMzRFxcdTIzM0ZcXHUyMzdDXFx1MjNCMFxcdTIzQjFcXHUyM0I0LVxcdTIzQjZcXHUyM0RDLVxcdTIzREZcXHUyM0UyXFx1MjNFN1xcdTI0MjNcXHUyNEM4XFx1MjUwMFxcdTI1MDJcXHUyNTBDXFx1MjUxMFxcdTI1MTRcXHUyNTE4XFx1MjUxQ1xcdTI1MjRcXHUyNTJDXFx1MjUzNFxcdTI1M0NcXHUyNTUwLVxcdTI1NkNcXHUyNTgwXFx1MjU4NFxcdTI1ODhcXHUyNTkxLVxcdTI1OTNcXHUyNUExXFx1MjVBQVxcdTI1QUJcXHUyNUFEXFx1MjVBRVxcdTI1QjFcXHUyNUIzLVxcdTI1QjVcXHUyNUI4XFx1MjVCOVxcdTI1QkQtXFx1MjVCRlxcdTI1QzJcXHUyNUMzXFx1MjVDQVxcdTI1Q0JcXHUyNUVDXFx1MjVFRlxcdTI1RjgtXFx1MjVGQ1xcdTI2MDVcXHUyNjA2XFx1MjYwRVxcdTI2NDBcXHUyNjQyXFx1MjY2MFxcdTI2NjNcXHUyNjY1XFx1MjY2NlxcdTI2NkFcXHUyNjZELVxcdTI2NkZcXHUyNzEzXFx1MjcxN1xcdTI3MjBcXHUyNzM2XFx1Mjc1OFxcdTI3NzJcXHUyNzczXFx1MjdDOFxcdTI3QzlcXHUyN0U2LVxcdTI3RURcXHUyN0Y1LVxcdTI3RkFcXHUyN0ZDXFx1MjdGRlxcdTI5MDItXFx1MjkwNVxcdTI5MEMtXFx1MjkxM1xcdTI5MTZcXHUyOTE5LVxcdTI5MjBcXHUyOTIzLVxcdTI5MkFcXHUyOTMzXFx1MjkzNS1cXHUyOTM5XFx1MjkzQ1xcdTI5M0RcXHUyOTQ1XFx1Mjk0OC1cXHUyOTRCXFx1Mjk0RS1cXHUyOTc2XFx1Mjk3OFxcdTI5NzlcXHUyOTdCLVxcdTI5N0ZcXHUyOTg1XFx1Mjk4NlxcdTI5OEItXFx1Mjk5NlxcdTI5OUFcXHUyOTlDXFx1Mjk5RFxcdTI5QTQtXFx1MjlCN1xcdTI5QjlcXHUyOUJCXFx1MjlCQ1xcdTI5QkUtXFx1MjlDNVxcdTI5QzlcXHUyOUNELVxcdTI5RDBcXHUyOURDLVxcdTI5REVcXHUyOUUzLVxcdTI5RTVcXHUyOUVCXFx1MjlGNFxcdTI5RjZcXHUyQTAwLVxcdTJBMDJcXHUyQTA0XFx1MkEwNlxcdTJBMENcXHUyQTBEXFx1MkExMC1cXHUyQTE3XFx1MkEyMi1cXHUyQTI3XFx1MkEyOVxcdTJBMkFcXHUyQTJELVxcdTJBMzFcXHUyQTMzLVxcdTJBM0NcXHUyQTNGXFx1MkE0MFxcdTJBNDItXFx1MkE0RFxcdTJBNTBcXHUyQTUzLVxcdTJBNThcXHUyQTVBLVxcdTJBNURcXHUyQTVGXFx1MkE2NlxcdTJBNkFcXHUyQTZELVxcdTJBNzVcXHUyQTc3LVxcdTJBOUFcXHUyQTlELVxcdTJBQTJcXHUyQUE0LVxcdTJBQjBcXHUyQUIzLVxcdTJBQzhcXHUyQUNCXFx1MkFDQ1xcdTJBQ0YtXFx1MkFEQlxcdTJBRTRcXHUyQUU2LVxcdTJBRTlcXHUyQUVCLVxcdTJBRjNcXHUyQUZEXFx1RkIwMC1cXHVGQjA0XXxcXHVEODM1W1xcdURDOUNcXHVEQzlFXFx1REM5RlxcdURDQTJcXHVEQ0E1XFx1RENBNlxcdURDQTktXFx1RENBQ1xcdURDQUUtXFx1RENCOVxcdURDQkJcXHVEQ0JELVxcdURDQzNcXHVEQ0M1LVxcdURDQ0ZcXHVERDA0XFx1REQwNVxcdUREMDctXFx1REQwQVxcdUREMEQtXFx1REQxNFxcdUREMTYtXFx1REQxQ1xcdUREMUUtXFx1REQzOVxcdUREM0ItXFx1REQzRVxcdURENDAtXFx1REQ0NFxcdURENDZcXHVERDRBLVxcdURENTBcXHVERDUyLVxcdURENkJdL2c7XG5cdHZhciBlbmNvZGVNYXAgPSB7J1xceEFEJzonc2h5JywnXFx1MjAwQyc6J3p3bmonLCdcXHUyMDBEJzonendqJywnXFx1MjAwRSc6J2xybScsJ1xcdTIwNjMnOidpYycsJ1xcdTIwNjInOidpdCcsJ1xcdTIwNjEnOidhZicsJ1xcdTIwMEYnOidybG0nLCdcXHUyMDBCJzonWmVyb1dpZHRoU3BhY2UnLCdcXHUyMDYwJzonTm9CcmVhaycsJ1xcdTAzMTEnOidEb3duQnJldmUnLCdcXHUyMERCJzondGRvdCcsJ1xcdTIwREMnOidEb3REb3QnLCdcXHQnOidUYWInLCdcXG4nOidOZXdMaW5lJywnXFx1MjAwOCc6J3B1bmNzcCcsJ1xcdTIwNUYnOidNZWRpdW1TcGFjZScsJ1xcdTIwMDknOid0aGluc3AnLCdcXHUyMDBBJzonaGFpcnNwJywnXFx1MjAwNCc6J2Vtc3AxMycsJ1xcdTIwMDInOidlbnNwJywnXFx1MjAwNSc6J2Vtc3AxNCcsJ1xcdTIwMDMnOidlbXNwJywnXFx1MjAwNyc6J251bXNwJywnXFx4QTAnOiduYnNwJywnXFx1MjA1RlxcdTIwMEEnOidUaGlja1NwYWNlJywnXFx1MjAzRSc6J29saW5lJywnXyc6J2xvd2JhcicsJ1xcdTIwMTAnOidkYXNoJywnXFx1MjAxMyc6J25kYXNoJywnXFx1MjAxNCc6J21kYXNoJywnXFx1MjAxNSc6J2hvcmJhcicsJywnOidjb21tYScsJzsnOidzZW1pJywnXFx1MjA0Ric6J2JzZW1pJywnOic6J2NvbG9uJywnXFx1MkE3NCc6J0NvbG9uZScsJyEnOidleGNsJywnXFx4QTEnOidpZXhjbCcsJz8nOidxdWVzdCcsJ1xceEJGJzonaXF1ZXN0JywnLic6J3BlcmlvZCcsJ1xcdTIwMjUnOidubGRyJywnXFx1MjAyNic6J21sZHInLCdcXHhCNyc6J21pZGRvdCcsJ1xcJyc6J2Fwb3MnLCdcXHUyMDE4JzonbHNxdW8nLCdcXHUyMDE5JzoncnNxdW8nLCdcXHUyMDFBJzonc2JxdW8nLCdcXHUyMDM5JzonbHNhcXVvJywnXFx1MjAzQSc6J3JzYXF1bycsJ1wiJzoncXVvdCcsJ1xcdTIwMUMnOidsZHF1bycsJ1xcdTIwMUQnOidyZHF1bycsJ1xcdTIwMUUnOidiZHF1bycsJ1xceEFCJzonbGFxdW8nLCdcXHhCQic6J3JhcXVvJywnKCc6J2xwYXInLCcpJzoncnBhcicsJ1snOidsc3FiJywnXSc6J3JzcWInLCd7JzonbGN1YicsJ30nOidyY3ViJywnXFx1MjMwOCc6J2xjZWlsJywnXFx1MjMwOSc6J3JjZWlsJywnXFx1MjMwQSc6J2xmbG9vcicsJ1xcdTIzMEInOidyZmxvb3InLCdcXHUyOTg1JzonbG9wYXInLCdcXHUyOTg2Jzoncm9wYXInLCdcXHUyOThCJzonbGJya2UnLCdcXHUyOThDJzoncmJya2UnLCdcXHUyOThEJzonbGJya3NsdScsJ1xcdTI5OEUnOidyYnJrc2xkJywnXFx1Mjk4Ric6J2xicmtzbGQnLCdcXHUyOTkwJzoncmJya3NsdScsJ1xcdTI5OTEnOidsYW5nZCcsJ1xcdTI5OTInOidyYW5nZCcsJ1xcdTI5OTMnOidscGFybHQnLCdcXHUyOTk0JzoncnBhcmd0JywnXFx1Mjk5NSc6J2d0bFBhcicsJ1xcdTI5OTYnOidsdHJQYXInLCdcXHUyN0U2JzonbG9icmsnLCdcXHUyN0U3Jzoncm9icmsnLCdcXHUyN0U4JzonbGFuZycsJ1xcdTI3RTknOidyYW5nJywnXFx1MjdFQSc6J0xhbmcnLCdcXHUyN0VCJzonUmFuZycsJ1xcdTI3RUMnOidsb2FuZycsJ1xcdTI3RUQnOidyb2FuZycsJ1xcdTI3NzInOidsYmJyaycsJ1xcdTI3NzMnOidyYmJyaycsJ1xcdTIwMTYnOidWZXJ0JywnXFx4QTcnOidzZWN0JywnXFx4QjYnOidwYXJhJywnQCc6J2NvbW1hdCcsJyonOidhc3QnLCcvJzonc29sJywndW5kZWZpbmVkJzpudWxsLCcmJzonYW1wJywnIyc6J251bScsJyUnOidwZXJjbnQnLCdcXHUyMDMwJzoncGVybWlsJywnXFx1MjAzMSc6J3BlcnRlbmsnLCdcXHUyMDIwJzonZGFnZ2VyJywnXFx1MjAyMSc6J0RhZ2dlcicsJ1xcdTIwMjInOididWxsJywnXFx1MjA0Myc6J2h5YnVsbCcsJ1xcdTIwMzInOidwcmltZScsJ1xcdTIwMzMnOidQcmltZScsJ1xcdTIwMzQnOid0cHJpbWUnLCdcXHUyMDU3JzoncXByaW1lJywnXFx1MjAzNSc6J2JwcmltZScsJ1xcdTIwNDEnOidjYXJldCcsJ2AnOidncmF2ZScsJ1xceEI0JzonYWN1dGUnLCdcXHUwMkRDJzondGlsZGUnLCdeJzonSGF0JywnXFx4QUYnOidtYWNyJywnXFx1MDJEOCc6J2JyZXZlJywnXFx1MDJEOSc6J2RvdCcsJ1xceEE4JzonZGllJywnXFx1MDJEQSc6J3JpbmcnLCdcXHUwMkREJzonZGJsYWMnLCdcXHhCOCc6J2NlZGlsJywnXFx1MDJEQic6J29nb24nLCdcXHUwMkM2JzonY2lyYycsJ1xcdTAyQzcnOidjYXJvbicsJ1xceEIwJzonZGVnJywnXFx4QTknOidjb3B5JywnXFx4QUUnOidyZWcnLCdcXHUyMTE3JzonY29weXNyJywnXFx1MjExOCc6J3dwJywnXFx1MjExRSc6J3J4JywnXFx1MjEyNyc6J21obycsJ1xcdTIxMjknOidpaW90YScsJ1xcdTIxOTAnOidsYXJyJywnXFx1MjE5QSc6J25sYXJyJywnXFx1MjE5Mic6J3JhcnInLCdcXHUyMTlCJzonbnJhcnInLCdcXHUyMTkxJzondWFycicsJ1xcdTIxOTMnOidkYXJyJywnXFx1MjE5NCc6J2hhcnInLCdcXHUyMUFFJzonbmhhcnInLCdcXHUyMTk1JzondmFycicsJ1xcdTIxOTYnOidud2FycicsJ1xcdTIxOTcnOiduZWFycicsJ1xcdTIxOTgnOidzZWFycicsJ1xcdTIxOTknOidzd2FycicsJ1xcdTIxOUQnOidyYXJydycsJ1xcdTIxOURcXHUwMzM4JzonbnJhcnJ3JywnXFx1MjE5RSc6J0xhcnInLCdcXHUyMTlGJzonVWFycicsJ1xcdTIxQTAnOidSYXJyJywnXFx1MjFBMSc6J0RhcnInLCdcXHUyMUEyJzonbGFycnRsJywnXFx1MjFBMyc6J3JhcnJ0bCcsJ1xcdTIxQTQnOidtYXBzdG9sZWZ0JywnXFx1MjFBNSc6J21hcHN0b3VwJywnXFx1MjFBNic6J21hcCcsJ1xcdTIxQTcnOidtYXBzdG9kb3duJywnXFx1MjFBOSc6J2xhcnJoaycsJ1xcdTIxQUEnOidyYXJyaGsnLCdcXHUyMUFCJzonbGFycmxwJywnXFx1MjFBQyc6J3JhcnJscCcsJ1xcdTIxQUQnOidoYXJydycsJ1xcdTIxQjAnOidsc2gnLCdcXHUyMUIxJzoncnNoJywnXFx1MjFCMic6J2xkc2gnLCdcXHUyMUIzJzoncmRzaCcsJ1xcdTIxQjUnOidjcmFycicsJ1xcdTIxQjYnOidjdWxhcnInLCdcXHUyMUI3JzonY3VyYXJyJywnXFx1MjFCQSc6J29sYXJyJywnXFx1MjFCQic6J29yYXJyJywnXFx1MjFCQyc6J2xoYXJ1JywnXFx1MjFCRCc6J2xoYXJkJywnXFx1MjFCRSc6J3VoYXJyJywnXFx1MjFCRic6J3VoYXJsJywnXFx1MjFDMCc6J3JoYXJ1JywnXFx1MjFDMSc6J3JoYXJkJywnXFx1MjFDMic6J2RoYXJyJywnXFx1MjFDMyc6J2RoYXJsJywnXFx1MjFDNCc6J3JsYXJyJywnXFx1MjFDNSc6J3VkYXJyJywnXFx1MjFDNic6J2xyYXJyJywnXFx1MjFDNyc6J2xsYXJyJywnXFx1MjFDOCc6J3V1YXJyJywnXFx1MjFDOSc6J3JyYXJyJywnXFx1MjFDQSc6J2RkYXJyJywnXFx1MjFDQic6J2xyaGFyJywnXFx1MjFDQyc6J3JsaGFyJywnXFx1MjFEMCc6J2xBcnInLCdcXHUyMUNEJzonbmxBcnInLCdcXHUyMUQxJzondUFycicsJ1xcdTIxRDInOidyQXJyJywnXFx1MjFDRic6J25yQXJyJywnXFx1MjFEMyc6J2RBcnInLCdcXHUyMUQ0JzonaWZmJywnXFx1MjFDRSc6J25oQXJyJywnXFx1MjFENSc6J3ZBcnInLCdcXHUyMUQ2JzonbndBcnInLCdcXHUyMUQ3JzonbmVBcnInLCdcXHUyMUQ4Jzonc2VBcnInLCdcXHUyMUQ5Jzonc3dBcnInLCdcXHUyMURBJzonbEFhcnInLCdcXHUyMURCJzonckFhcnInLCdcXHUyMUREJzonemlncmFycicsJ1xcdTIxRTQnOidsYXJyYicsJ1xcdTIxRTUnOidyYXJyYicsJ1xcdTIxRjUnOidkdWFycicsJ1xcdTIxRkQnOidsb2FycicsJ1xcdTIxRkUnOidyb2FycicsJ1xcdTIxRkYnOidob2FycicsJ1xcdTIyMDAnOidmb3JhbGwnLCdcXHUyMjAxJzonY29tcCcsJ1xcdTIyMDInOidwYXJ0JywnXFx1MjIwMlxcdTAzMzgnOiducGFydCcsJ1xcdTIyMDMnOidleGlzdCcsJ1xcdTIyMDQnOiduZXhpc3QnLCdcXHUyMjA1JzonZW1wdHknLCdcXHUyMjA3JzonRGVsJywnXFx1MjIwOCc6J2luJywnXFx1MjIwOSc6J25vdGluJywnXFx1MjIwQic6J25pJywnXFx1MjIwQyc6J25vdG5pJywnXFx1MDNGNic6J2JlcHNpJywnXFx1MjIwRic6J3Byb2QnLCdcXHUyMjEwJzonY29wcm9kJywnXFx1MjIxMSc6J3N1bScsJysnOidwbHVzJywnXFx4QjEnOidwbScsJ1xceEY3JzonZGl2JywnXFx4RDcnOid0aW1lcycsJzwnOidsdCcsJ1xcdTIyNkUnOidubHQnLCc8XFx1MjBEMic6J252bHQnLCc9JzonZXF1YWxzJywnXFx1MjI2MCc6J25lJywnPVxcdTIwRTUnOidibmUnLCdcXHUyQTc1JzonRXF1YWwnLCc+JzonZ3QnLCdcXHUyMjZGJzonbmd0JywnPlxcdTIwRDInOidudmd0JywnXFx4QUMnOidub3QnLCd8JzondmVydCcsJ1xceEE2JzonYnJ2YmFyJywnXFx1MjIxMic6J21pbnVzJywnXFx1MjIxMyc6J21wJywnXFx1MjIxNCc6J3BsdXNkbycsJ1xcdTIwNDQnOidmcmFzbCcsJ1xcdTIyMTYnOidzZXRtbicsJ1xcdTIyMTcnOidsb3dhc3QnLCdcXHUyMjE4JzonY29tcGZuJywnXFx1MjIxQSc6J1NxcnQnLCdcXHUyMjFEJzoncHJvcCcsJ1xcdTIyMUUnOidpbmZpbicsJ1xcdTIyMUYnOidhbmdydCcsJ1xcdTIyMjAnOidhbmcnLCdcXHUyMjIwXFx1MjBEMic6J25hbmcnLCdcXHUyMjIxJzonYW5nbXNkJywnXFx1MjIyMic6J2FuZ3NwaCcsJ1xcdTIyMjMnOidtaWQnLCdcXHUyMjI0Jzonbm1pZCcsJ1xcdTIyMjUnOidwYXInLCdcXHUyMjI2JzonbnBhcicsJ1xcdTIyMjcnOidhbmQnLCdcXHUyMjI4Jzonb3InLCdcXHUyMjI5JzonY2FwJywnXFx1MjIyOVxcdUZFMDAnOidjYXBzJywnXFx1MjIyQSc6J2N1cCcsJ1xcdTIyMkFcXHVGRTAwJzonY3VwcycsJ1xcdTIyMkInOidpbnQnLCdcXHUyMjJDJzonSW50JywnXFx1MjIyRCc6J3RpbnQnLCdcXHUyQTBDJzoncWludCcsJ1xcdTIyMkUnOidvaW50JywnXFx1MjIyRic6J0NvbmludCcsJ1xcdTIyMzAnOidDY29uaW50JywnXFx1MjIzMSc6J2N3aW50JywnXFx1MjIzMic6J2N3Y29uaW50JywnXFx1MjIzMyc6J2F3Y29uaW50JywnXFx1MjIzNCc6J3RoZXJlNCcsJ1xcdTIyMzUnOidiZWNhdXMnLCdcXHUyMjM2JzoncmF0aW8nLCdcXHUyMjM3JzonQ29sb24nLCdcXHUyMjM4JzonbWludXNkJywnXFx1MjIzQSc6J21ERG90JywnXFx1MjIzQic6J2hvbXRodCcsJ1xcdTIyM0MnOidzaW0nLCdcXHUyMjQxJzonbnNpbScsJ1xcdTIyM0NcXHUyMEQyJzonbnZzaW0nLCdcXHUyMjNEJzonYnNpbScsJ1xcdTIyM0RcXHUwMzMxJzoncmFjZScsJ1xcdTIyM0UnOidhYycsJ1xcdTIyM0VcXHUwMzMzJzonYWNFJywnXFx1MjIzRic6J2FjZCcsJ1xcdTIyNDAnOid3cicsJ1xcdTIyNDInOidlc2ltJywnXFx1MjI0MlxcdTAzMzgnOiduZXNpbScsJ1xcdTIyNDMnOidzaW1lJywnXFx1MjI0NCc6J25zaW1lJywnXFx1MjI0NSc6J2NvbmcnLCdcXHUyMjQ3JzonbmNvbmcnLCdcXHUyMjQ2Jzonc2ltbmUnLCdcXHUyMjQ4JzonYXAnLCdcXHUyMjQ5JzonbmFwJywnXFx1MjI0QSc6J2FwZScsJ1xcdTIyNEInOidhcGlkJywnXFx1MjI0QlxcdTAzMzgnOiduYXBpZCcsJ1xcdTIyNEMnOidiY29uZycsJ1xcdTIyNEQnOidDdXBDYXAnLCdcXHUyMjZEJzonTm90Q3VwQ2FwJywnXFx1MjI0RFxcdTIwRDInOidudmFwJywnXFx1MjI0RSc6J2J1bXAnLCdcXHUyMjRFXFx1MDMzOCc6J25idW1wJywnXFx1MjI0Ric6J2J1bXBlJywnXFx1MjI0RlxcdTAzMzgnOiduYnVtcGUnLCdcXHUyMjUwJzonZG90ZXEnLCdcXHUyMjUwXFx1MDMzOCc6J25lZG90JywnXFx1MjI1MSc6J2VEb3QnLCdcXHUyMjUyJzonZWZEb3QnLCdcXHUyMjUzJzonZXJEb3QnLCdcXHUyMjU0JzonY29sb25lJywnXFx1MjI1NSc6J2Vjb2xvbicsJ1xcdTIyNTYnOidlY2lyJywnXFx1MjI1Nyc6J2NpcmUnLCdcXHUyMjU5Jzond2VkZ2VxJywnXFx1MjI1QSc6J3ZlZWVxJywnXFx1MjI1Qyc6J3RyaWUnLCdcXHUyMjVGJzonZXF1ZXN0JywnXFx1MjI2MSc6J2VxdWl2JywnXFx1MjI2Mic6J25lcXVpdicsJ1xcdTIyNjFcXHUyMEU1JzonYm5lcXVpdicsJ1xcdTIyNjQnOidsZScsJ1xcdTIyNzAnOidubGUnLCdcXHUyMjY0XFx1MjBEMic6J252bGUnLCdcXHUyMjY1JzonZ2UnLCdcXHUyMjcxJzonbmdlJywnXFx1MjI2NVxcdTIwRDInOidudmdlJywnXFx1MjI2Nic6J2xFJywnXFx1MjI2NlxcdTAzMzgnOidubEUnLCdcXHUyMjY3JzonZ0UnLCdcXHUyMjY3XFx1MDMzOCc6J25nRScsJ1xcdTIyNjhcXHVGRTAwJzonbHZuRScsJ1xcdTIyNjgnOidsbkUnLCdcXHUyMjY5JzonZ25FJywnXFx1MjI2OVxcdUZFMDAnOidndm5FJywnXFx1MjI2QSc6J2xsJywnXFx1MjI2QVxcdTAzMzgnOiduTHR2JywnXFx1MjI2QVxcdTIwRDInOiduTHQnLCdcXHUyMjZCJzonZ2cnLCdcXHUyMjZCXFx1MDMzOCc6J25HdHYnLCdcXHUyMjZCXFx1MjBEMic6J25HdCcsJ1xcdTIyNkMnOid0d2l4dCcsJ1xcdTIyNzInOidsc2ltJywnXFx1MjI3NCc6J25sc2ltJywnXFx1MjI3Myc6J2dzaW0nLCdcXHUyMjc1JzonbmdzaW0nLCdcXHUyMjc2JzonbGcnLCdcXHUyMjc4JzonbnRsZycsJ1xcdTIyNzcnOidnbCcsJ1xcdTIyNzknOidudGdsJywnXFx1MjI3QSc6J3ByJywnXFx1MjI4MCc6J25wcicsJ1xcdTIyN0InOidzYycsJ1xcdTIyODEnOiduc2MnLCdcXHUyMjdDJzoncHJjdWUnLCdcXHUyMkUwJzonbnByY3VlJywnXFx1MjI3RCc6J3NjY3VlJywnXFx1MjJFMSc6J25zY2N1ZScsJ1xcdTIyN0UnOidwcnNpbScsJ1xcdTIyN0YnOidzY3NpbScsJ1xcdTIyN0ZcXHUwMzM4JzonTm90U3VjY2VlZHNUaWxkZScsJ1xcdTIyODInOidzdWInLCdcXHUyMjg0JzonbnN1YicsJ1xcdTIyODJcXHUyMEQyJzondm5zdWInLCdcXHUyMjgzJzonc3VwJywnXFx1MjI4NSc6J25zdXAnLCdcXHUyMjgzXFx1MjBEMic6J3Zuc3VwJywnXFx1MjI4Nic6J3N1YmUnLCdcXHUyMjg4JzonbnN1YmUnLCdcXHUyMjg3Jzonc3VwZScsJ1xcdTIyODknOiduc3VwZScsJ1xcdTIyOEFcXHVGRTAwJzondnN1Ym5lJywnXFx1MjI4QSc6J3N1Ym5lJywnXFx1MjI4QlxcdUZFMDAnOid2c3VwbmUnLCdcXHUyMjhCJzonc3VwbmUnLCdcXHUyMjhEJzonY3VwZG90JywnXFx1MjI4RSc6J3VwbHVzJywnXFx1MjI4Ric6J3Nxc3ViJywnXFx1MjI4RlxcdTAzMzgnOidOb3RTcXVhcmVTdWJzZXQnLCdcXHUyMjkwJzonc3FzdXAnLCdcXHUyMjkwXFx1MDMzOCc6J05vdFNxdWFyZVN1cGVyc2V0JywnXFx1MjI5MSc6J3Nxc3ViZScsJ1xcdTIyRTInOiduc3FzdWJlJywnXFx1MjI5Mic6J3Nxc3VwZScsJ1xcdTIyRTMnOiduc3FzdXBlJywnXFx1MjI5Myc6J3NxY2FwJywnXFx1MjI5M1xcdUZFMDAnOidzcWNhcHMnLCdcXHUyMjk0Jzonc3FjdXAnLCdcXHUyMjk0XFx1RkUwMCc6J3NxY3VwcycsJ1xcdTIyOTUnOidvcGx1cycsJ1xcdTIyOTYnOidvbWludXMnLCdcXHUyMjk3Jzonb3RpbWVzJywnXFx1MjI5OCc6J29zb2wnLCdcXHUyMjk5Jzonb2RvdCcsJ1xcdTIyOUEnOidvY2lyJywnXFx1MjI5Qic6J29hc3QnLCdcXHUyMjlEJzonb2Rhc2gnLCdcXHUyMjlFJzoncGx1c2InLCdcXHUyMjlGJzonbWludXNiJywnXFx1MjJBMCc6J3RpbWVzYicsJ1xcdTIyQTEnOidzZG90YicsJ1xcdTIyQTInOid2ZGFzaCcsJ1xcdTIyQUMnOidudmRhc2gnLCdcXHUyMkEzJzonZGFzaHYnLCdcXHUyMkE0JzondG9wJywnXFx1MjJBNSc6J2JvdCcsJ1xcdTIyQTcnOidtb2RlbHMnLCdcXHUyMkE4JzondkRhc2gnLCdcXHUyMkFEJzonbnZEYXNoJywnXFx1MjJBOSc6J1ZkYXNoJywnXFx1MjJBRSc6J25WZGFzaCcsJ1xcdTIyQUEnOidWdmRhc2gnLCdcXHUyMkFCJzonVkRhc2gnLCdcXHUyMkFGJzonblZEYXNoJywnXFx1MjJCMCc6J3BydXJlbCcsJ1xcdTIyQjInOid2bHRyaScsJ1xcdTIyRUEnOidubHRyaScsJ1xcdTIyQjMnOid2cnRyaScsJ1xcdTIyRUInOiducnRyaScsJ1xcdTIyQjQnOidsdHJpZScsJ1xcdTIyRUMnOidubHRyaWUnLCdcXHUyMkI0XFx1MjBEMic6J252bHRyaWUnLCdcXHUyMkI1JzoncnRyaWUnLCdcXHUyMkVEJzonbnJ0cmllJywnXFx1MjJCNVxcdTIwRDInOidudnJ0cmllJywnXFx1MjJCNic6J29yaWdvZicsJ1xcdTIyQjcnOidpbW9mJywnXFx1MjJCOCc6J211bWFwJywnXFx1MjJCOSc6J2hlcmNvbicsJ1xcdTIyQkEnOidpbnRjYWwnLCdcXHUyMkJCJzondmVlYmFyJywnXFx1MjJCRCc6J2JhcnZlZScsJ1xcdTIyQkUnOidhbmdydHZiJywnXFx1MjJCRic6J2xydHJpJywnXFx1MjJDMCc6J1dlZGdlJywnXFx1MjJDMSc6J1ZlZScsJ1xcdTIyQzInOid4Y2FwJywnXFx1MjJDMyc6J3hjdXAnLCdcXHUyMkM0JzonZGlhbScsJ1xcdTIyQzUnOidzZG90JywnXFx1MjJDNic6J1N0YXInLCdcXHUyMkM3JzonZGl2b254JywnXFx1MjJDOCc6J2Jvd3RpZScsJ1xcdTIyQzknOidsdGltZXMnLCdcXHUyMkNBJzoncnRpbWVzJywnXFx1MjJDQic6J2x0aHJlZScsJ1xcdTIyQ0MnOidydGhyZWUnLCdcXHUyMkNEJzonYnNpbWUnLCdcXHUyMkNFJzonY3V2ZWUnLCdcXHUyMkNGJzonY3V3ZWQnLCdcXHUyMkQwJzonU3ViJywnXFx1MjJEMSc6J1N1cCcsJ1xcdTIyRDInOidDYXAnLCdcXHUyMkQzJzonQ3VwJywnXFx1MjJENCc6J2ZvcmsnLCdcXHUyMkQ1JzonZXBhcicsJ1xcdTIyRDYnOidsdGRvdCcsJ1xcdTIyRDcnOidndGRvdCcsJ1xcdTIyRDgnOidMbCcsJ1xcdTIyRDhcXHUwMzM4JzonbkxsJywnXFx1MjJEOSc6J0dnJywnXFx1MjJEOVxcdTAzMzgnOiduR2cnLCdcXHUyMkRBXFx1RkUwMCc6J2xlc2cnLCdcXHUyMkRBJzonbGVnJywnXFx1MjJEQic6J2dlbCcsJ1xcdTIyREJcXHVGRTAwJzonZ2VzbCcsJ1xcdTIyREUnOidjdWVwcicsJ1xcdTIyREYnOidjdWVzYycsJ1xcdTIyRTYnOidsbnNpbScsJ1xcdTIyRTcnOidnbnNpbScsJ1xcdTIyRTgnOidwcm5zaW0nLCdcXHUyMkU5Jzonc2Nuc2ltJywnXFx1MjJFRSc6J3ZlbGxpcCcsJ1xcdTIyRUYnOidjdGRvdCcsJ1xcdTIyRjAnOid1dGRvdCcsJ1xcdTIyRjEnOidkdGRvdCcsJ1xcdTIyRjInOidkaXNpbicsJ1xcdTIyRjMnOidpc2luc3YnLCdcXHUyMkY0JzonaXNpbnMnLCdcXHUyMkY1JzonaXNpbmRvdCcsJ1xcdTIyRjVcXHUwMzM4Jzonbm90aW5kb3QnLCdcXHUyMkY2Jzonbm90aW52YycsJ1xcdTIyRjcnOidub3RpbnZiJywnXFx1MjJGOSc6J2lzaW5FJywnXFx1MjJGOVxcdTAzMzgnOidub3RpbkUnLCdcXHUyMkZBJzonbmlzZCcsJ1xcdTIyRkInOid4bmlzJywnXFx1MjJGQyc6J25pcycsJ1xcdTIyRkQnOidub3RuaXZjJywnXFx1MjJGRSc6J25vdG5pdmInLCdcXHUyMzA1JzonYmFyd2VkJywnXFx1MjMwNic6J0JhcndlZCcsJ1xcdTIzMEMnOidkcmNyb3AnLCdcXHUyMzBEJzonZGxjcm9wJywnXFx1MjMwRSc6J3VyY3JvcCcsJ1xcdTIzMEYnOid1bGNyb3AnLCdcXHUyMzEwJzonYm5vdCcsJ1xcdTIzMTInOidwcm9mbGluZScsJ1xcdTIzMTMnOidwcm9mc3VyZicsJ1xcdTIzMTUnOid0ZWxyZWMnLCdcXHUyMzE2JzondGFyZ2V0JywnXFx1MjMxQyc6J3VsY29ybicsJ1xcdTIzMUQnOid1cmNvcm4nLCdcXHUyMzFFJzonZGxjb3JuJywnXFx1MjMxRic6J2RyY29ybicsJ1xcdTIzMjInOidmcm93bicsJ1xcdTIzMjMnOidzbWlsZScsJ1xcdTIzMkQnOidjeWxjdHknLCdcXHUyMzJFJzoncHJvZmFsYXInLCdcXHUyMzM2JzondG9wYm90JywnXFx1MjMzRCc6J292YmFyJywnXFx1MjMzRic6J3NvbGJhcicsJ1xcdTIzN0MnOidhbmd6YXJyJywnXFx1MjNCMCc6J2xtb3VzdCcsJ1xcdTIzQjEnOidybW91c3QnLCdcXHUyM0I0JzondGJyaycsJ1xcdTIzQjUnOidiYnJrJywnXFx1MjNCNic6J2Jicmt0YnJrJywnXFx1MjNEQyc6J092ZXJQYXJlbnRoZXNpcycsJ1xcdTIzREQnOidVbmRlclBhcmVudGhlc2lzJywnXFx1MjNERSc6J092ZXJCcmFjZScsJ1xcdTIzREYnOidVbmRlckJyYWNlJywnXFx1MjNFMic6J3RycGV6aXVtJywnXFx1MjNFNyc6J2VsaW50ZXJzJywnXFx1MjQyMyc6J2JsYW5rJywnXFx1MjUwMCc6J2JveGgnLCdcXHUyNTAyJzonYm94dicsJ1xcdTI1MEMnOidib3hkcicsJ1xcdTI1MTAnOidib3hkbCcsJ1xcdTI1MTQnOidib3h1cicsJ1xcdTI1MTgnOidib3h1bCcsJ1xcdTI1MUMnOidib3h2cicsJ1xcdTI1MjQnOidib3h2bCcsJ1xcdTI1MkMnOidib3hoZCcsJ1xcdTI1MzQnOidib3hodScsJ1xcdTI1M0MnOidib3h2aCcsJ1xcdTI1NTAnOidib3hIJywnXFx1MjU1MSc6J2JveFYnLCdcXHUyNTUyJzonYm94ZFInLCdcXHUyNTUzJzonYm94RHInLCdcXHUyNTU0JzonYm94RFInLCdcXHUyNTU1JzonYm94ZEwnLCdcXHUyNTU2JzonYm94RGwnLCdcXHUyNTU3JzonYm94REwnLCdcXHUyNTU4JzonYm94dVInLCdcXHUyNTU5JzonYm94VXInLCdcXHUyNTVBJzonYm94VVInLCdcXHUyNTVCJzonYm94dUwnLCdcXHUyNTVDJzonYm94VWwnLCdcXHUyNTVEJzonYm94VUwnLCdcXHUyNTVFJzonYm94dlInLCdcXHUyNTVGJzonYm94VnInLCdcXHUyNTYwJzonYm94VlInLCdcXHUyNTYxJzonYm94dkwnLCdcXHUyNTYyJzonYm94VmwnLCdcXHUyNTYzJzonYm94VkwnLCdcXHUyNTY0JzonYm94SGQnLCdcXHUyNTY1JzonYm94aEQnLCdcXHUyNTY2JzonYm94SEQnLCdcXHUyNTY3JzonYm94SHUnLCdcXHUyNTY4JzonYm94aFUnLCdcXHUyNTY5JzonYm94SFUnLCdcXHUyNTZBJzonYm94dkgnLCdcXHUyNTZCJzonYm94VmgnLCdcXHUyNTZDJzonYm94VkgnLCdcXHUyNTgwJzondWhibGsnLCdcXHUyNTg0JzonbGhibGsnLCdcXHUyNTg4JzonYmxvY2snLCdcXHUyNTkxJzonYmxrMTQnLCdcXHUyNTkyJzonYmxrMTInLCdcXHUyNTkzJzonYmxrMzQnLCdcXHUyNUExJzonc3F1JywnXFx1MjVBQSc6J3NxdWYnLCdcXHUyNUFCJzonRW1wdHlWZXJ5U21hbGxTcXVhcmUnLCdcXHUyNUFEJzoncmVjdCcsJ1xcdTI1QUUnOidtYXJrZXInLCdcXHUyNUIxJzonZmx0bnMnLCdcXHUyNUIzJzoneHV0cmknLCdcXHUyNUI0JzondXRyaWYnLCdcXHUyNUI1JzondXRyaScsJ1xcdTI1QjgnOidydHJpZicsJ1xcdTI1QjknOidydHJpJywnXFx1MjVCRCc6J3hkdHJpJywnXFx1MjVCRSc6J2R0cmlmJywnXFx1MjVCRic6J2R0cmknLCdcXHUyNUMyJzonbHRyaWYnLCdcXHUyNUMzJzonbHRyaScsJ1xcdTI1Q0EnOidsb3onLCdcXHUyNUNCJzonY2lyJywnXFx1MjVFQyc6J3RyaWRvdCcsJ1xcdTI1RUYnOid4Y2lyYycsJ1xcdTI1RjgnOid1bHRyaScsJ1xcdTI1RjknOid1cnRyaScsJ1xcdTI1RkEnOidsbHRyaScsJ1xcdTI1RkInOidFbXB0eVNtYWxsU3F1YXJlJywnXFx1MjVGQyc6J0ZpbGxlZFNtYWxsU3F1YXJlJywnXFx1MjYwNSc6J3N0YXJmJywnXFx1MjYwNic6J3N0YXInLCdcXHUyNjBFJzoncGhvbmUnLCdcXHUyNjQwJzonZmVtYWxlJywnXFx1MjY0Mic6J21hbGUnLCdcXHUyNjYwJzonc3BhZGVzJywnXFx1MjY2Myc6J2NsdWJzJywnXFx1MjY2NSc6J2hlYXJ0cycsJ1xcdTI2NjYnOidkaWFtcycsJ1xcdTI2NkEnOidzdW5nJywnXFx1MjcxMyc6J2NoZWNrJywnXFx1MjcxNyc6J2Nyb3NzJywnXFx1MjcyMCc6J21hbHQnLCdcXHUyNzM2Jzonc2V4dCcsJ1xcdTI3NTgnOidWZXJ0aWNhbFNlcGFyYXRvcicsJ1xcdTI3QzgnOidic29saHN1YicsJ1xcdTI3QzknOidzdXBoc29sJywnXFx1MjdGNSc6J3hsYXJyJywnXFx1MjdGNic6J3hyYXJyJywnXFx1MjdGNyc6J3hoYXJyJywnXFx1MjdGOCc6J3hsQXJyJywnXFx1MjdGOSc6J3hyQXJyJywnXFx1MjdGQSc6J3hoQXJyJywnXFx1MjdGQyc6J3htYXAnLCdcXHUyN0ZGJzonZHppZ3JhcnInLCdcXHUyOTAyJzonbnZsQXJyJywnXFx1MjkwMyc6J252ckFycicsJ1xcdTI5MDQnOidudkhhcnInLCdcXHUyOTA1JzonTWFwJywnXFx1MjkwQyc6J2xiYXJyJywnXFx1MjkwRCc6J3JiYXJyJywnXFx1MjkwRSc6J2xCYXJyJywnXFx1MjkwRic6J3JCYXJyJywnXFx1MjkxMCc6J1JCYXJyJywnXFx1MjkxMSc6J0REb3RyYWhkJywnXFx1MjkxMic6J1VwQXJyb3dCYXInLCdcXHUyOTEzJzonRG93bkFycm93QmFyJywnXFx1MjkxNic6J1JhcnJ0bCcsJ1xcdTI5MTknOidsYXRhaWwnLCdcXHUyOTFBJzoncmF0YWlsJywnXFx1MjkxQic6J2xBdGFpbCcsJ1xcdTI5MUMnOidyQXRhaWwnLCdcXHUyOTFEJzonbGFycmZzJywnXFx1MjkxRSc6J3JhcnJmcycsJ1xcdTI5MUYnOidsYXJyYmZzJywnXFx1MjkyMCc6J3JhcnJiZnMnLCdcXHUyOTIzJzonbndhcmhrJywnXFx1MjkyNCc6J25lYXJoaycsJ1xcdTI5MjUnOidzZWFyaGsnLCdcXHUyOTI2Jzonc3dhcmhrJywnXFx1MjkyNyc6J253bmVhcicsJ1xcdTI5MjgnOid0b2VhJywnXFx1MjkyOSc6J3Rvc2EnLCdcXHUyOTJBJzonc3dud2FyJywnXFx1MjkzMyc6J3JhcnJjJywnXFx1MjkzM1xcdTAzMzgnOiducmFycmMnLCdcXHUyOTM1JzonY3VkYXJycicsJ1xcdTI5MzYnOidsZGNhJywnXFx1MjkzNyc6J3JkY2EnLCdcXHUyOTM4JzonY3VkYXJybCcsJ1xcdTI5MzknOidsYXJycGwnLCdcXHUyOTNDJzonY3VyYXJybScsJ1xcdTI5M0QnOidjdWxhcnJwJywnXFx1Mjk0NSc6J3JhcnJwbCcsJ1xcdTI5NDgnOidoYXJyY2lyJywnXFx1Mjk0OSc6J1VhcnJvY2lyJywnXFx1Mjk0QSc6J2x1cmRzaGFyJywnXFx1Mjk0Qic6J2xkcnVzaGFyJywnXFx1Mjk0RSc6J0xlZnRSaWdodFZlY3RvcicsJ1xcdTI5NEYnOidSaWdodFVwRG93blZlY3RvcicsJ1xcdTI5NTAnOidEb3duTGVmdFJpZ2h0VmVjdG9yJywnXFx1Mjk1MSc6J0xlZnRVcERvd25WZWN0b3InLCdcXHUyOTUyJzonTGVmdFZlY3RvckJhcicsJ1xcdTI5NTMnOidSaWdodFZlY3RvckJhcicsJ1xcdTI5NTQnOidSaWdodFVwVmVjdG9yQmFyJywnXFx1Mjk1NSc6J1JpZ2h0RG93blZlY3RvckJhcicsJ1xcdTI5NTYnOidEb3duTGVmdFZlY3RvckJhcicsJ1xcdTI5NTcnOidEb3duUmlnaHRWZWN0b3JCYXInLCdcXHUyOTU4JzonTGVmdFVwVmVjdG9yQmFyJywnXFx1Mjk1OSc6J0xlZnREb3duVmVjdG9yQmFyJywnXFx1Mjk1QSc6J0xlZnRUZWVWZWN0b3InLCdcXHUyOTVCJzonUmlnaHRUZWVWZWN0b3InLCdcXHUyOTVDJzonUmlnaHRVcFRlZVZlY3RvcicsJ1xcdTI5NUQnOidSaWdodERvd25UZWVWZWN0b3InLCdcXHUyOTVFJzonRG93bkxlZnRUZWVWZWN0b3InLCdcXHUyOTVGJzonRG93blJpZ2h0VGVlVmVjdG9yJywnXFx1Mjk2MCc6J0xlZnRVcFRlZVZlY3RvcicsJ1xcdTI5NjEnOidMZWZ0RG93blRlZVZlY3RvcicsJ1xcdTI5NjInOidsSGFyJywnXFx1Mjk2Myc6J3VIYXInLCdcXHUyOTY0JzonckhhcicsJ1xcdTI5NjUnOidkSGFyJywnXFx1Mjk2Nic6J2x1cnVoYXInLCdcXHUyOTY3JzonbGRyZGhhcicsJ1xcdTI5NjgnOidydWx1aGFyJywnXFx1Mjk2OSc6J3JkbGRoYXInLCdcXHUyOTZBJzonbGhhcnVsJywnXFx1Mjk2Qic6J2xsaGFyZCcsJ1xcdTI5NkMnOidyaGFydWwnLCdcXHUyOTZEJzonbHJoYXJkJywnXFx1Mjk2RSc6J3VkaGFyJywnXFx1Mjk2Ric6J2R1aGFyJywnXFx1Mjk3MCc6J1JvdW5kSW1wbGllcycsJ1xcdTI5NzEnOidlcmFycicsJ1xcdTI5NzInOidzaW1yYXJyJywnXFx1Mjk3Myc6J2xhcnJzaW0nLCdcXHUyOTc0JzoncmFycnNpbScsJ1xcdTI5NzUnOidyYXJyYXAnLCdcXHUyOTc2JzonbHRsYXJyJywnXFx1Mjk3OCc6J2d0cmFycicsJ1xcdTI5NzknOidzdWJyYXJyJywnXFx1Mjk3Qic6J3N1cGxhcnInLCdcXHUyOTdDJzonbGZpc2h0JywnXFx1Mjk3RCc6J3JmaXNodCcsJ1xcdTI5N0UnOid1ZmlzaHQnLCdcXHUyOTdGJzonZGZpc2h0JywnXFx1Mjk5QSc6J3Z6aWd6YWcnLCdcXHUyOTlDJzondmFuZ3J0JywnXFx1Mjk5RCc6J2FuZ3J0dmJkJywnXFx1MjlBNCc6J2FuZ2UnLCdcXHUyOUE1JzoncmFuZ2UnLCdcXHUyOUE2JzonZHdhbmdsZScsJ1xcdTI5QTcnOid1d2FuZ2xlJywnXFx1MjlBOCc6J2FuZ21zZGFhJywnXFx1MjlBOSc6J2FuZ21zZGFiJywnXFx1MjlBQSc6J2FuZ21zZGFjJywnXFx1MjlBQic6J2FuZ21zZGFkJywnXFx1MjlBQyc6J2FuZ21zZGFlJywnXFx1MjlBRCc6J2FuZ21zZGFmJywnXFx1MjlBRSc6J2FuZ21zZGFnJywnXFx1MjlBRic6J2FuZ21zZGFoJywnXFx1MjlCMCc6J2JlbXB0eXYnLCdcXHUyOUIxJzonZGVtcHR5dicsJ1xcdTI5QjInOidjZW1wdHl2JywnXFx1MjlCMyc6J3JhZW1wdHl2JywnXFx1MjlCNCc6J2xhZW1wdHl2JywnXFx1MjlCNSc6J29oYmFyJywnXFx1MjlCNic6J29taWQnLCdcXHUyOUI3Jzonb3BhcicsJ1xcdTI5QjknOidvcGVycCcsJ1xcdTI5QkInOidvbGNyb3NzJywnXFx1MjlCQyc6J29kc29sZCcsJ1xcdTI5QkUnOidvbGNpcicsJ1xcdTI5QkYnOidvZmNpcicsJ1xcdTI5QzAnOidvbHQnLCdcXHUyOUMxJzonb2d0JywnXFx1MjlDMic6J2NpcnNjaXInLCdcXHUyOUMzJzonY2lyRScsJ1xcdTI5QzQnOidzb2xiJywnXFx1MjlDNSc6J2Jzb2xiJywnXFx1MjlDOSc6J2JveGJveCcsJ1xcdTI5Q0QnOid0cmlzYicsJ1xcdTI5Q0UnOidydHJpbHRyaScsJ1xcdTI5Q0YnOidMZWZ0VHJpYW5nbGVCYXInLCdcXHUyOUNGXFx1MDMzOCc6J05vdExlZnRUcmlhbmdsZUJhcicsJ1xcdTI5RDAnOidSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEMFxcdTAzMzgnOidOb3RSaWdodFRyaWFuZ2xlQmFyJywnXFx1MjlEQyc6J2lpbmZpbicsJ1xcdTI5REQnOidpbmZpbnRpZScsJ1xcdTI5REUnOidudmluZmluJywnXFx1MjlFMyc6J2VwYXJzbCcsJ1xcdTI5RTQnOidzbWVwYXJzbCcsJ1xcdTI5RTUnOidlcXZwYXJzbCcsJ1xcdTI5RUInOidsb3pmJywnXFx1MjlGNCc6J1J1bGVEZWxheWVkJywnXFx1MjlGNic6J2Rzb2wnLCdcXHUyQTAwJzoneG9kb3QnLCdcXHUyQTAxJzoneG9wbHVzJywnXFx1MkEwMic6J3hvdGltZScsJ1xcdTJBMDQnOid4dXBsdXMnLCdcXHUyQTA2JzoneHNxY3VwJywnXFx1MkEwRCc6J2ZwYXJ0aW50JywnXFx1MkExMCc6J2NpcmZuaW50JywnXFx1MkExMSc6J2F3aW50JywnXFx1MkExMic6J3JwcG9saW50JywnXFx1MkExMyc6J3NjcG9saW50JywnXFx1MkExNCc6J25wb2xpbnQnLCdcXHUyQTE1JzoncG9pbnRpbnQnLCdcXHUyQTE2JzoncXVhdGludCcsJ1xcdTJBMTcnOidpbnRsYXJoaycsJ1xcdTJBMjInOidwbHVzY2lyJywnXFx1MkEyMyc6J3BsdXNhY2lyJywnXFx1MkEyNCc6J3NpbXBsdXMnLCdcXHUyQTI1JzoncGx1c2R1JywnXFx1MkEyNic6J3BsdXNzaW0nLCdcXHUyQTI3JzoncGx1c3R3bycsJ1xcdTJBMjknOidtY29tbWEnLCdcXHUyQTJBJzonbWludXNkdScsJ1xcdTJBMkQnOidsb3BsdXMnLCdcXHUyQTJFJzoncm9wbHVzJywnXFx1MkEyRic6J0Nyb3NzJywnXFx1MkEzMCc6J3RpbWVzZCcsJ1xcdTJBMzEnOid0aW1lc2JhcicsJ1xcdTJBMzMnOidzbWFzaHAnLCdcXHUyQTM0JzonbG90aW1lcycsJ1xcdTJBMzUnOidyb3RpbWVzJywnXFx1MkEzNic6J290aW1lc2FzJywnXFx1MkEzNyc6J090aW1lcycsJ1xcdTJBMzgnOidvZGl2JywnXFx1MkEzOSc6J3RyaXBsdXMnLCdcXHUyQTNBJzondHJpbWludXMnLCdcXHUyQTNCJzondHJpdGltZScsJ1xcdTJBM0MnOidpcHJvZCcsJ1xcdTJBM0YnOidhbWFsZycsJ1xcdTJBNDAnOidjYXBkb3QnLCdcXHUyQTQyJzonbmN1cCcsJ1xcdTJBNDMnOiduY2FwJywnXFx1MkE0NCc6J2NhcGFuZCcsJ1xcdTJBNDUnOidjdXBvcicsJ1xcdTJBNDYnOidjdXBjYXAnLCdcXHUyQTQ3JzonY2FwY3VwJywnXFx1MkE0OCc6J2N1cGJyY2FwJywnXFx1MkE0OSc6J2NhcGJyY3VwJywnXFx1MkE0QSc6J2N1cGN1cCcsJ1xcdTJBNEInOidjYXBjYXAnLCdcXHUyQTRDJzonY2N1cHMnLCdcXHUyQTREJzonY2NhcHMnLCdcXHUyQTUwJzonY2N1cHNzbScsJ1xcdTJBNTMnOidBbmQnLCdcXHUyQTU0JzonT3InLCdcXHUyQTU1JzonYW5kYW5kJywnXFx1MkE1Nic6J29yb3InLCdcXHUyQTU3Jzonb3JzbG9wZScsJ1xcdTJBNTgnOidhbmRzbG9wZScsJ1xcdTJBNUEnOidhbmR2JywnXFx1MkE1Qic6J29ydicsJ1xcdTJBNUMnOidhbmRkJywnXFx1MkE1RCc6J29yZCcsJ1xcdTJBNUYnOid3ZWRiYXInLCdcXHUyQTY2Jzonc2RvdGUnLCdcXHUyQTZBJzonc2ltZG90JywnXFx1MkE2RCc6J2Nvbmdkb3QnLCdcXHUyQTZEXFx1MDMzOCc6J25jb25nZG90JywnXFx1MkE2RSc6J2Vhc3RlcicsJ1xcdTJBNkYnOidhcGFjaXInLCdcXHUyQTcwJzonYXBFJywnXFx1MkE3MFxcdTAzMzgnOiduYXBFJywnXFx1MkE3MSc6J2VwbHVzJywnXFx1MkE3Mic6J3BsdXNlJywnXFx1MkE3Myc6J0VzaW0nLCdcXHUyQTc3JzonZUREb3QnLCdcXHUyQTc4JzonZXF1aXZERCcsJ1xcdTJBNzknOidsdGNpcicsJ1xcdTJBN0EnOidndGNpcicsJ1xcdTJBN0InOidsdHF1ZXN0JywnXFx1MkE3Qyc6J2d0cXVlc3QnLCdcXHUyQTdEJzonbGVzJywnXFx1MkE3RFxcdTAzMzgnOidubGVzJywnXFx1MkE3RSc6J2dlcycsJ1xcdTJBN0VcXHUwMzM4JzonbmdlcycsJ1xcdTJBN0YnOidsZXNkb3QnLCdcXHUyQTgwJzonZ2VzZG90JywnXFx1MkE4MSc6J2xlc2RvdG8nLCdcXHUyQTgyJzonZ2VzZG90bycsJ1xcdTJBODMnOidsZXNkb3RvcicsJ1xcdTJBODQnOidnZXNkb3RvbCcsJ1xcdTJBODUnOidsYXAnLCdcXHUyQTg2JzonZ2FwJywnXFx1MkE4Nyc6J2xuZScsJ1xcdTJBODgnOidnbmUnLCdcXHUyQTg5JzonbG5hcCcsJ1xcdTJBOEEnOidnbmFwJywnXFx1MkE4Qic6J2xFZycsJ1xcdTJBOEMnOidnRWwnLCdcXHUyQThEJzonbHNpbWUnLCdcXHUyQThFJzonZ3NpbWUnLCdcXHUyQThGJzonbHNpbWcnLCdcXHUyQTkwJzonZ3NpbWwnLCdcXHUyQTkxJzonbGdFJywnXFx1MkE5Mic6J2dsRScsJ1xcdTJBOTMnOidsZXNnZXMnLCdcXHUyQTk0JzonZ2VzbGVzJywnXFx1MkE5NSc6J2VscycsJ1xcdTJBOTYnOidlZ3MnLCdcXHUyQTk3JzonZWxzZG90JywnXFx1MkE5OCc6J2Vnc2RvdCcsJ1xcdTJBOTknOidlbCcsJ1xcdTJBOUEnOidlZycsJ1xcdTJBOUQnOidzaW1sJywnXFx1MkE5RSc6J3NpbWcnLCdcXHUyQTlGJzonc2ltbEUnLCdcXHUyQUEwJzonc2ltZ0UnLCdcXHUyQUExJzonTGVzc0xlc3MnLCdcXHUyQUExXFx1MDMzOCc6J05vdE5lc3RlZExlc3NMZXNzJywnXFx1MkFBMic6J0dyZWF0ZXJHcmVhdGVyJywnXFx1MkFBMlxcdTAzMzgnOidOb3ROZXN0ZWRHcmVhdGVyR3JlYXRlcicsJ1xcdTJBQTQnOidnbGonLCdcXHUyQUE1JzonZ2xhJywnXFx1MkFBNic6J2x0Y2MnLCdcXHUyQUE3JzonZ3RjYycsJ1xcdTJBQTgnOidsZXNjYycsJ1xcdTJBQTknOidnZXNjYycsJ1xcdTJBQUEnOidzbXQnLCdcXHUyQUFCJzonbGF0JywnXFx1MkFBQyc6J3NtdGUnLCdcXHUyQUFDXFx1RkUwMCc6J3NtdGVzJywnXFx1MkFBRCc6J2xhdGUnLCdcXHUyQUFEXFx1RkUwMCc6J2xhdGVzJywnXFx1MkFBRSc6J2J1bXBFJywnXFx1MkFBRic6J3ByZScsJ1xcdTJBQUZcXHUwMzM4JzonbnByZScsJ1xcdTJBQjAnOidzY2UnLCdcXHUyQUIwXFx1MDMzOCc6J25zY2UnLCdcXHUyQUIzJzoncHJFJywnXFx1MkFCNCc6J3NjRScsJ1xcdTJBQjUnOidwcm5FJywnXFx1MkFCNic6J3NjbkUnLCdcXHUyQUI3JzoncHJhcCcsJ1xcdTJBQjgnOidzY2FwJywnXFx1MkFCOSc6J3BybmFwJywnXFx1MkFCQSc6J3NjbmFwJywnXFx1MkFCQic6J1ByJywnXFx1MkFCQyc6J1NjJywnXFx1MkFCRCc6J3N1YmRvdCcsJ1xcdTJBQkUnOidzdXBkb3QnLCdcXHUyQUJGJzonc3VicGx1cycsJ1xcdTJBQzAnOidzdXBwbHVzJywnXFx1MkFDMSc6J3N1Ym11bHQnLCdcXHUyQUMyJzonc3VwbXVsdCcsJ1xcdTJBQzMnOidzdWJlZG90JywnXFx1MkFDNCc6J3N1cGVkb3QnLCdcXHUyQUM1Jzonc3ViRScsJ1xcdTJBQzVcXHUwMzM4JzonbnN1YkUnLCdcXHUyQUM2Jzonc3VwRScsJ1xcdTJBQzZcXHUwMzM4JzonbnN1cEUnLCdcXHUyQUM3Jzonc3Vic2ltJywnXFx1MkFDOCc6J3N1cHNpbScsJ1xcdTJBQ0JcXHVGRTAwJzondnN1Ym5FJywnXFx1MkFDQic6J3N1Ym5FJywnXFx1MkFDQ1xcdUZFMDAnOid2c3VwbkUnLCdcXHUyQUNDJzonc3VwbkUnLCdcXHUyQUNGJzonY3N1YicsJ1xcdTJBRDAnOidjc3VwJywnXFx1MkFEMSc6J2NzdWJlJywnXFx1MkFEMic6J2NzdXBlJywnXFx1MkFEMyc6J3N1YnN1cCcsJ1xcdTJBRDQnOidzdXBzdWInLCdcXHUyQUQ1Jzonc3Vic3ViJywnXFx1MkFENic6J3N1cHN1cCcsJ1xcdTJBRDcnOidzdXBoc3ViJywnXFx1MkFEOCc6J3N1cGRzdWInLCdcXHUyQUQ5JzonZm9ya3YnLCdcXHUyQURBJzondG9wZm9yaycsJ1xcdTJBREInOidtbGNwJywnXFx1MkFFNCc6J0Rhc2h2JywnXFx1MkFFNic6J1ZkYXNobCcsJ1xcdTJBRTcnOidCYXJ2JywnXFx1MkFFOCc6J3ZCYXInLCdcXHUyQUU5JzondkJhcnYnLCdcXHUyQUVCJzonVmJhcicsJ1xcdTJBRUMnOidOb3QnLCdcXHUyQUVEJzonYk5vdCcsJ1xcdTJBRUUnOidybm1pZCcsJ1xcdTJBRUYnOidjaXJtaWQnLCdcXHUyQUYwJzonbWlkY2lyJywnXFx1MkFGMSc6J3RvcGNpcicsJ1xcdTJBRjInOiduaHBhcicsJ1xcdTJBRjMnOidwYXJzaW0nLCdcXHUyQUZEJzoncGFyc2wnLCdcXHUyQUZEXFx1MjBFNSc6J25wYXJzbCcsJ1xcdTI2NkQnOidmbGF0JywnXFx1MjY2RSc6J25hdHVyJywnXFx1MjY2Ric6J3NoYXJwJywnXFx4QTQnOidjdXJyZW4nLCdcXHhBMic6J2NlbnQnLCckJzonZG9sbGFyJywnXFx4QTMnOidwb3VuZCcsJ1xceEE1JzoneWVuJywnXFx1MjBBQyc6J2V1cm8nLCdcXHhCOSc6J3N1cDEnLCdcXHhCRCc6J2hhbGYnLCdcXHUyMTUzJzonZnJhYzEzJywnXFx4QkMnOidmcmFjMTQnLCdcXHUyMTU1JzonZnJhYzE1JywnXFx1MjE1OSc6J2ZyYWMxNicsJ1xcdTIxNUInOidmcmFjMTgnLCdcXHhCMic6J3N1cDInLCdcXHUyMTU0JzonZnJhYzIzJywnXFx1MjE1Nic6J2ZyYWMyNScsJ1xceEIzJzonc3VwMycsJ1xceEJFJzonZnJhYzM0JywnXFx1MjE1Nyc6J2ZyYWMzNScsJ1xcdTIxNUMnOidmcmFjMzgnLCdcXHUyMTU4JzonZnJhYzQ1JywnXFx1MjE1QSc6J2ZyYWM1NicsJ1xcdTIxNUQnOidmcmFjNTgnLCdcXHUyMTVFJzonZnJhYzc4JywnXFx1RDgzNVxcdURDQjYnOidhc2NyJywnXFx1RDgzNVxcdURENTInOidhb3BmJywnXFx1RDgzNVxcdUREMUUnOidhZnInLCdcXHVEODM1XFx1REQzOCc6J0FvcGYnLCdcXHVEODM1XFx1REQwNCc6J0FmcicsJ1xcdUQ4MzVcXHVEQzlDJzonQXNjcicsJ1xceEFBJzonb3JkZicsJ1xceEUxJzonYWFjdXRlJywnXFx4QzEnOidBYWN1dGUnLCdcXHhFMCc6J2FncmF2ZScsJ1xceEMwJzonQWdyYXZlJywnXFx1MDEwMyc6J2FicmV2ZScsJ1xcdTAxMDInOidBYnJldmUnLCdcXHhFMic6J2FjaXJjJywnXFx4QzInOidBY2lyYycsJ1xceEU1JzonYXJpbmcnLCdcXHhDNSc6J2FuZ3N0JywnXFx4RTQnOidhdW1sJywnXFx4QzQnOidBdW1sJywnXFx4RTMnOidhdGlsZGUnLCdcXHhDMyc6J0F0aWxkZScsJ1xcdTAxMDUnOidhb2dvbicsJ1xcdTAxMDQnOidBb2dvbicsJ1xcdTAxMDEnOidhbWFjcicsJ1xcdTAxMDAnOidBbWFjcicsJ1xceEU2JzonYWVsaWcnLCdcXHhDNic6J0FFbGlnJywnXFx1RDgzNVxcdURDQjcnOidic2NyJywnXFx1RDgzNVxcdURENTMnOidib3BmJywnXFx1RDgzNVxcdUREMUYnOidiZnInLCdcXHVEODM1XFx1REQzOSc6J0JvcGYnLCdcXHUyMTJDJzonQnNjcicsJ1xcdUQ4MzVcXHVERDA1JzonQmZyJywnXFx1RDgzNVxcdUREMjAnOidjZnInLCdcXHVEODM1XFx1RENCOCc6J2NzY3InLCdcXHVEODM1XFx1REQ1NCc6J2NvcGYnLCdcXHUyMTJEJzonQ2ZyJywnXFx1RDgzNVxcdURDOUUnOidDc2NyJywnXFx1MjEwMic6J0NvcGYnLCdcXHUwMTA3JzonY2FjdXRlJywnXFx1MDEwNic6J0NhY3V0ZScsJ1xcdTAxMDknOidjY2lyYycsJ1xcdTAxMDgnOidDY2lyYycsJ1xcdTAxMEQnOidjY2Fyb24nLCdcXHUwMTBDJzonQ2Nhcm9uJywnXFx1MDEwQic6J2Nkb3QnLCdcXHUwMTBBJzonQ2RvdCcsJ1xceEU3JzonY2NlZGlsJywnXFx4QzcnOidDY2VkaWwnLCdcXHUyMTA1JzonaW5jYXJlJywnXFx1RDgzNVxcdUREMjEnOidkZnInLCdcXHUyMTQ2JzonZGQnLCdcXHVEODM1XFx1REQ1NSc6J2RvcGYnLCdcXHVEODM1XFx1RENCOSc6J2RzY3InLCdcXHVEODM1XFx1REM5Ric6J0RzY3InLCdcXHVEODM1XFx1REQwNyc6J0RmcicsJ1xcdTIxNDUnOidERCcsJ1xcdUQ4MzVcXHVERDNCJzonRG9wZicsJ1xcdTAxMEYnOidkY2Fyb24nLCdcXHUwMTBFJzonRGNhcm9uJywnXFx1MDExMSc6J2RzdHJvaycsJ1xcdTAxMTAnOidEc3Ryb2snLCdcXHhGMCc6J2V0aCcsJ1xceEQwJzonRVRIJywnXFx1MjE0Nyc6J2VlJywnXFx1MjEyRic6J2VzY3InLCdcXHVEODM1XFx1REQyMic6J2VmcicsJ1xcdUQ4MzVcXHVERDU2JzonZW9wZicsJ1xcdTIxMzAnOidFc2NyJywnXFx1RDgzNVxcdUREMDgnOidFZnInLCdcXHVEODM1XFx1REQzQyc6J0VvcGYnLCdcXHhFOSc6J2VhY3V0ZScsJ1xceEM5JzonRWFjdXRlJywnXFx4RTgnOidlZ3JhdmUnLCdcXHhDOCc6J0VncmF2ZScsJ1xceEVBJzonZWNpcmMnLCdcXHhDQSc6J0VjaXJjJywnXFx1MDExQic6J2VjYXJvbicsJ1xcdTAxMUEnOidFY2Fyb24nLCdcXHhFQic6J2V1bWwnLCdcXHhDQic6J0V1bWwnLCdcXHUwMTE3JzonZWRvdCcsJ1xcdTAxMTYnOidFZG90JywnXFx1MDExOSc6J2VvZ29uJywnXFx1MDExOCc6J0VvZ29uJywnXFx1MDExMyc6J2VtYWNyJywnXFx1MDExMic6J0VtYWNyJywnXFx1RDgzNVxcdUREMjMnOidmZnInLCdcXHVEODM1XFx1REQ1Nyc6J2ZvcGYnLCdcXHVEODM1XFx1RENCQic6J2ZzY3InLCdcXHVEODM1XFx1REQwOSc6J0ZmcicsJ1xcdUQ4MzVcXHVERDNEJzonRm9wZicsJ1xcdTIxMzEnOidGc2NyJywnXFx1RkIwMCc6J2ZmbGlnJywnXFx1RkIwMyc6J2ZmaWxpZycsJ1xcdUZCMDQnOidmZmxsaWcnLCdcXHVGQjAxJzonZmlsaWcnLCdmaic6J2ZqbGlnJywnXFx1RkIwMic6J2ZsbGlnJywnXFx1MDE5Mic6J2Zub2YnLCdcXHUyMTBBJzonZ3NjcicsJ1xcdUQ4MzVcXHVERDU4JzonZ29wZicsJ1xcdUQ4MzVcXHVERDI0JzonZ2ZyJywnXFx1RDgzNVxcdURDQTInOidHc2NyJywnXFx1RDgzNVxcdUREM0UnOidHb3BmJywnXFx1RDgzNVxcdUREMEEnOidHZnInLCdcXHUwMUY1JzonZ2FjdXRlJywnXFx1MDExRic6J2dicmV2ZScsJ1xcdTAxMUUnOidHYnJldmUnLCdcXHUwMTFEJzonZ2NpcmMnLCdcXHUwMTFDJzonR2NpcmMnLCdcXHUwMTIxJzonZ2RvdCcsJ1xcdTAxMjAnOidHZG90JywnXFx1MDEyMic6J0djZWRpbCcsJ1xcdUQ4MzVcXHVERDI1JzonaGZyJywnXFx1MjEwRSc6J3BsYW5ja2gnLCdcXHVEODM1XFx1RENCRCc6J2hzY3InLCdcXHVEODM1XFx1REQ1OSc6J2hvcGYnLCdcXHUyMTBCJzonSHNjcicsJ1xcdTIxMEMnOidIZnInLCdcXHUyMTBEJzonSG9wZicsJ1xcdTAxMjUnOidoY2lyYycsJ1xcdTAxMjQnOidIY2lyYycsJ1xcdTIxMEYnOidoYmFyJywnXFx1MDEyNyc6J2hzdHJvaycsJ1xcdTAxMjYnOidIc3Ryb2snLCdcXHVEODM1XFx1REQ1QSc6J2lvcGYnLCdcXHVEODM1XFx1REQyNic6J2lmcicsJ1xcdUQ4MzVcXHVEQ0JFJzonaXNjcicsJ1xcdTIxNDgnOidpaScsJ1xcdUQ4MzVcXHVERDQwJzonSW9wZicsJ1xcdTIxMTAnOidJc2NyJywnXFx1MjExMSc6J0ltJywnXFx4RUQnOidpYWN1dGUnLCdcXHhDRCc6J0lhY3V0ZScsJ1xceEVDJzonaWdyYXZlJywnXFx4Q0MnOidJZ3JhdmUnLCdcXHhFRSc6J2ljaXJjJywnXFx4Q0UnOidJY2lyYycsJ1xceEVGJzonaXVtbCcsJ1xceENGJzonSXVtbCcsJ1xcdTAxMjknOidpdGlsZGUnLCdcXHUwMTI4JzonSXRpbGRlJywnXFx1MDEzMCc6J0lkb3QnLCdcXHUwMTJGJzonaW9nb24nLCdcXHUwMTJFJzonSW9nb24nLCdcXHUwMTJCJzonaW1hY3InLCdcXHUwMTJBJzonSW1hY3InLCdcXHUwMTMzJzonaWpsaWcnLCdcXHUwMTMyJzonSUpsaWcnLCdcXHUwMTMxJzonaW1hdGgnLCdcXHVEODM1XFx1RENCRic6J2pzY3InLCdcXHVEODM1XFx1REQ1Qic6J2pvcGYnLCdcXHVEODM1XFx1REQyNyc6J2pmcicsJ1xcdUQ4MzVcXHVEQ0E1JzonSnNjcicsJ1xcdUQ4MzVcXHVERDBEJzonSmZyJywnXFx1RDgzNVxcdURENDEnOidKb3BmJywnXFx1MDEzNSc6J2pjaXJjJywnXFx1MDEzNCc6J0pjaXJjJywnXFx1MDIzNyc6J2ptYXRoJywnXFx1RDgzNVxcdURENUMnOidrb3BmJywnXFx1RDgzNVxcdURDQzAnOidrc2NyJywnXFx1RDgzNVxcdUREMjgnOidrZnInLCdcXHVEODM1XFx1RENBNic6J0tzY3InLCdcXHVEODM1XFx1REQ0Mic6J0tvcGYnLCdcXHVEODM1XFx1REQwRSc6J0tmcicsJ1xcdTAxMzcnOidrY2VkaWwnLCdcXHUwMTM2JzonS2NlZGlsJywnXFx1RDgzNVxcdUREMjknOidsZnInLCdcXHVEODM1XFx1RENDMSc6J2xzY3InLCdcXHUyMTEzJzonZWxsJywnXFx1RDgzNVxcdURENUQnOidsb3BmJywnXFx1MjExMic6J0xzY3InLCdcXHVEODM1XFx1REQwRic6J0xmcicsJ1xcdUQ4MzVcXHVERDQzJzonTG9wZicsJ1xcdTAxM0EnOidsYWN1dGUnLCdcXHUwMTM5JzonTGFjdXRlJywnXFx1MDEzRSc6J2xjYXJvbicsJ1xcdTAxM0QnOidMY2Fyb24nLCdcXHUwMTNDJzonbGNlZGlsJywnXFx1MDEzQic6J0xjZWRpbCcsJ1xcdTAxNDInOidsc3Ryb2snLCdcXHUwMTQxJzonTHN0cm9rJywnXFx1MDE0MCc6J2xtaWRvdCcsJ1xcdTAxM0YnOidMbWlkb3QnLCdcXHVEODM1XFx1REQyQSc6J21mcicsJ1xcdUQ4MzVcXHVERDVFJzonbW9wZicsJ1xcdUQ4MzVcXHVEQ0MyJzonbXNjcicsJ1xcdUQ4MzVcXHVERDEwJzonTWZyJywnXFx1RDgzNVxcdURENDQnOidNb3BmJywnXFx1MjEzMyc6J01zY3InLCdcXHVEODM1XFx1REQyQic6J25mcicsJ1xcdUQ4MzVcXHVERDVGJzonbm9wZicsJ1xcdUQ4MzVcXHVEQ0MzJzonbnNjcicsJ1xcdTIxMTUnOidOb3BmJywnXFx1RDgzNVxcdURDQTknOidOc2NyJywnXFx1RDgzNVxcdUREMTEnOidOZnInLCdcXHUwMTQ0JzonbmFjdXRlJywnXFx1MDE0Myc6J05hY3V0ZScsJ1xcdTAxNDgnOiduY2Fyb24nLCdcXHUwMTQ3JzonTmNhcm9uJywnXFx4RjEnOidudGlsZGUnLCdcXHhEMSc6J050aWxkZScsJ1xcdTAxNDYnOiduY2VkaWwnLCdcXHUwMTQ1JzonTmNlZGlsJywnXFx1MjExNic6J251bWVybycsJ1xcdTAxNEInOidlbmcnLCdcXHUwMTRBJzonRU5HJywnXFx1RDgzNVxcdURENjAnOidvb3BmJywnXFx1RDgzNVxcdUREMkMnOidvZnInLCdcXHUyMTM0Jzonb3NjcicsJ1xcdUQ4MzVcXHVEQ0FBJzonT3NjcicsJ1xcdUQ4MzVcXHVERDEyJzonT2ZyJywnXFx1RDgzNVxcdURENDYnOidPb3BmJywnXFx4QkEnOidvcmRtJywnXFx4RjMnOidvYWN1dGUnLCdcXHhEMyc6J09hY3V0ZScsJ1xceEYyJzonb2dyYXZlJywnXFx4RDInOidPZ3JhdmUnLCdcXHhGNCc6J29jaXJjJywnXFx4RDQnOidPY2lyYycsJ1xceEY2Jzonb3VtbCcsJ1xceEQ2JzonT3VtbCcsJ1xcdTAxNTEnOidvZGJsYWMnLCdcXHUwMTUwJzonT2RibGFjJywnXFx4RjUnOidvdGlsZGUnLCdcXHhENSc6J090aWxkZScsJ1xceEY4Jzonb3NsYXNoJywnXFx4RDgnOidPc2xhc2gnLCdcXHUwMTREJzonb21hY3InLCdcXHUwMTRDJzonT21hY3InLCdcXHUwMTUzJzonb2VsaWcnLCdcXHUwMTUyJzonT0VsaWcnLCdcXHVEODM1XFx1REQyRCc6J3BmcicsJ1xcdUQ4MzVcXHVEQ0M1JzoncHNjcicsJ1xcdUQ4MzVcXHVERDYxJzoncG9wZicsJ1xcdTIxMTknOidQb3BmJywnXFx1RDgzNVxcdUREMTMnOidQZnInLCdcXHVEODM1XFx1RENBQic6J1BzY3InLCdcXHVEODM1XFx1REQ2Mic6J3FvcGYnLCdcXHVEODM1XFx1REQyRSc6J3FmcicsJ1xcdUQ4MzVcXHVEQ0M2JzoncXNjcicsJ1xcdUQ4MzVcXHVEQ0FDJzonUXNjcicsJ1xcdUQ4MzVcXHVERDE0JzonUWZyJywnXFx1MjExQSc6J1FvcGYnLCdcXHUwMTM4Jzona2dyZWVuJywnXFx1RDgzNVxcdUREMkYnOidyZnInLCdcXHVEODM1XFx1REQ2Myc6J3JvcGYnLCdcXHVEODM1XFx1RENDNyc6J3JzY3InLCdcXHUyMTFCJzonUnNjcicsJ1xcdTIxMUMnOidSZScsJ1xcdTIxMUQnOidSb3BmJywnXFx1MDE1NSc6J3JhY3V0ZScsJ1xcdTAxNTQnOidSYWN1dGUnLCdcXHUwMTU5JzoncmNhcm9uJywnXFx1MDE1OCc6J1JjYXJvbicsJ1xcdTAxNTcnOidyY2VkaWwnLCdcXHUwMTU2JzonUmNlZGlsJywnXFx1RDgzNVxcdURENjQnOidzb3BmJywnXFx1RDgzNVxcdURDQzgnOidzc2NyJywnXFx1RDgzNVxcdUREMzAnOidzZnInLCdcXHVEODM1XFx1REQ0QSc6J1NvcGYnLCdcXHVEODM1XFx1REQxNic6J1NmcicsJ1xcdUQ4MzVcXHVEQ0FFJzonU3NjcicsJ1xcdTI0QzgnOidvUycsJ1xcdTAxNUInOidzYWN1dGUnLCdcXHUwMTVBJzonU2FjdXRlJywnXFx1MDE1RCc6J3NjaXJjJywnXFx1MDE1Qyc6J1NjaXJjJywnXFx1MDE2MSc6J3NjYXJvbicsJ1xcdTAxNjAnOidTY2Fyb24nLCdcXHUwMTVGJzonc2NlZGlsJywnXFx1MDE1RSc6J1NjZWRpbCcsJ1xceERGJzonc3psaWcnLCdcXHVEODM1XFx1REQzMSc6J3RmcicsJ1xcdUQ4MzVcXHVEQ0M5JzondHNjcicsJ1xcdUQ4MzVcXHVERDY1JzondG9wZicsJ1xcdUQ4MzVcXHVEQ0FGJzonVHNjcicsJ1xcdUQ4MzVcXHVERDE3JzonVGZyJywnXFx1RDgzNVxcdURENEInOidUb3BmJywnXFx1MDE2NSc6J3RjYXJvbicsJ1xcdTAxNjQnOidUY2Fyb24nLCdcXHUwMTYzJzondGNlZGlsJywnXFx1MDE2Mic6J1RjZWRpbCcsJ1xcdTIxMjInOid0cmFkZScsJ1xcdTAxNjcnOid0c3Ryb2snLCdcXHUwMTY2JzonVHN0cm9rJywnXFx1RDgzNVxcdURDQ0EnOid1c2NyJywnXFx1RDgzNVxcdURENjYnOid1b3BmJywnXFx1RDgzNVxcdUREMzInOid1ZnInLCdcXHVEODM1XFx1REQ0Qyc6J1VvcGYnLCdcXHVEODM1XFx1REQxOCc6J1VmcicsJ1xcdUQ4MzVcXHVEQ0IwJzonVXNjcicsJ1xceEZBJzondWFjdXRlJywnXFx4REEnOidVYWN1dGUnLCdcXHhGOSc6J3VncmF2ZScsJ1xceEQ5JzonVWdyYXZlJywnXFx1MDE2RCc6J3VicmV2ZScsJ1xcdTAxNkMnOidVYnJldmUnLCdcXHhGQic6J3VjaXJjJywnXFx4REInOidVY2lyYycsJ1xcdTAxNkYnOid1cmluZycsJ1xcdTAxNkUnOidVcmluZycsJ1xceEZDJzondXVtbCcsJ1xceERDJzonVXVtbCcsJ1xcdTAxNzEnOid1ZGJsYWMnLCdcXHUwMTcwJzonVWRibGFjJywnXFx1MDE2OSc6J3V0aWxkZScsJ1xcdTAxNjgnOidVdGlsZGUnLCdcXHUwMTczJzondW9nb24nLCdcXHUwMTcyJzonVW9nb24nLCdcXHUwMTZCJzondW1hY3InLCdcXHUwMTZBJzonVW1hY3InLCdcXHVEODM1XFx1REQzMyc6J3ZmcicsJ1xcdUQ4MzVcXHVERDY3Jzondm9wZicsJ1xcdUQ4MzVcXHVEQ0NCJzondnNjcicsJ1xcdUQ4MzVcXHVERDE5JzonVmZyJywnXFx1RDgzNVxcdURENEQnOidWb3BmJywnXFx1RDgzNVxcdURDQjEnOidWc2NyJywnXFx1RDgzNVxcdURENjgnOid3b3BmJywnXFx1RDgzNVxcdURDQ0MnOid3c2NyJywnXFx1RDgzNVxcdUREMzQnOid3ZnInLCdcXHVEODM1XFx1RENCMic6J1dzY3InLCdcXHVEODM1XFx1REQ0RSc6J1dvcGYnLCdcXHVEODM1XFx1REQxQSc6J1dmcicsJ1xcdTAxNzUnOid3Y2lyYycsJ1xcdTAxNzQnOidXY2lyYycsJ1xcdUQ4MzVcXHVERDM1JzoneGZyJywnXFx1RDgzNVxcdURDQ0QnOid4c2NyJywnXFx1RDgzNVxcdURENjknOid4b3BmJywnXFx1RDgzNVxcdURENEYnOidYb3BmJywnXFx1RDgzNVxcdUREMUInOidYZnInLCdcXHVEODM1XFx1RENCMyc6J1hzY3InLCdcXHVEODM1XFx1REQzNic6J3lmcicsJ1xcdUQ4MzVcXHVEQ0NFJzoneXNjcicsJ1xcdUQ4MzVcXHVERDZBJzoneW9wZicsJ1xcdUQ4MzVcXHVEQ0I0JzonWXNjcicsJ1xcdUQ4MzVcXHVERDFDJzonWWZyJywnXFx1RDgzNVxcdURENTAnOidZb3BmJywnXFx4RkQnOid5YWN1dGUnLCdcXHhERCc6J1lhY3V0ZScsJ1xcdTAxNzcnOid5Y2lyYycsJ1xcdTAxNzYnOidZY2lyYycsJ1xceEZGJzoneXVtbCcsJ1xcdTAxNzgnOidZdW1sJywnXFx1RDgzNVxcdURDQ0YnOid6c2NyJywnXFx1RDgzNVxcdUREMzcnOid6ZnInLCdcXHVEODM1XFx1REQ2Qic6J3pvcGYnLCdcXHUyMTI4JzonWmZyJywnXFx1MjEyNCc6J1pvcGYnLCdcXHVEODM1XFx1RENCNSc6J1pzY3InLCdcXHUwMTdBJzonemFjdXRlJywnXFx1MDE3OSc6J1phY3V0ZScsJ1xcdTAxN0UnOid6Y2Fyb24nLCdcXHUwMTdEJzonWmNhcm9uJywnXFx1MDE3Qyc6J3pkb3QnLCdcXHUwMTdCJzonWmRvdCcsJ1xcdTAxQjUnOidpbXBlZCcsJ1xceEZFJzondGhvcm4nLCdcXHhERSc6J1RIT1JOJywnXFx1MDE0OSc6J25hcG9zJywnXFx1MDNCMSc6J2FscGhhJywnXFx1MDM5MSc6J0FscGhhJywnXFx1MDNCMic6J2JldGEnLCdcXHUwMzkyJzonQmV0YScsJ1xcdTAzQjMnOidnYW1tYScsJ1xcdTAzOTMnOidHYW1tYScsJ1xcdTAzQjQnOidkZWx0YScsJ1xcdTAzOTQnOidEZWx0YScsJ1xcdTAzQjUnOidlcHNpJywnXFx1MDNGNSc6J2Vwc2l2JywnXFx1MDM5NSc6J0Vwc2lsb24nLCdcXHUwM0REJzonZ2FtbWFkJywnXFx1MDNEQyc6J0dhbW1hZCcsJ1xcdTAzQjYnOid6ZXRhJywnXFx1MDM5Nic6J1pldGEnLCdcXHUwM0I3JzonZXRhJywnXFx1MDM5Nyc6J0V0YScsJ1xcdTAzQjgnOid0aGV0YScsJ1xcdTAzRDEnOid0aGV0YXYnLCdcXHUwMzk4JzonVGhldGEnLCdcXHUwM0I5JzonaW90YScsJ1xcdTAzOTknOidJb3RhJywnXFx1MDNCQSc6J2thcHBhJywnXFx1MDNGMCc6J2thcHBhdicsJ1xcdTAzOUEnOidLYXBwYScsJ1xcdTAzQkInOidsYW1iZGEnLCdcXHUwMzlCJzonTGFtYmRhJywnXFx1MDNCQyc6J211JywnXFx4QjUnOidtaWNybycsJ1xcdTAzOUMnOidNdScsJ1xcdTAzQkQnOidudScsJ1xcdTAzOUQnOidOdScsJ1xcdTAzQkUnOid4aScsJ1xcdTAzOUUnOidYaScsJ1xcdTAzQkYnOidvbWljcm9uJywnXFx1MDM5Ric6J09taWNyb24nLCdcXHUwM0MwJzoncGknLCdcXHUwM0Q2JzoncGl2JywnXFx1MDNBMCc6J1BpJywnXFx1MDNDMSc6J3JobycsJ1xcdTAzRjEnOidyaG92JywnXFx1MDNBMSc6J1JobycsJ1xcdTAzQzMnOidzaWdtYScsJ1xcdTAzQTMnOidTaWdtYScsJ1xcdTAzQzInOidzaWdtYWYnLCdcXHUwM0M0JzondGF1JywnXFx1MDNBNCc6J1RhdScsJ1xcdTAzQzUnOid1cHNpJywnXFx1MDNBNSc6J1Vwc2lsb24nLCdcXHUwM0QyJzonVXBzaScsJ1xcdTAzQzYnOidwaGknLCdcXHUwM0Q1JzoncGhpdicsJ1xcdTAzQTYnOidQaGknLCdcXHUwM0M3JzonY2hpJywnXFx1MDNBNyc6J0NoaScsJ1xcdTAzQzgnOidwc2knLCdcXHUwM0E4JzonUHNpJywnXFx1MDNDOSc6J29tZWdhJywnXFx1MDNBOSc6J29obScsJ1xcdTA0MzAnOidhY3knLCdcXHUwNDEwJzonQWN5JywnXFx1MDQzMSc6J2JjeScsJ1xcdTA0MTEnOidCY3knLCdcXHUwNDMyJzondmN5JywnXFx1MDQxMic6J1ZjeScsJ1xcdTA0MzMnOidnY3knLCdcXHUwNDEzJzonR2N5JywnXFx1MDQ1Myc6J2dqY3knLCdcXHUwNDAzJzonR0pjeScsJ1xcdTA0MzQnOidkY3knLCdcXHUwNDE0JzonRGN5JywnXFx1MDQ1Mic6J2RqY3knLCdcXHUwNDAyJzonREpjeScsJ1xcdTA0MzUnOidpZWN5JywnXFx1MDQxNSc6J0lFY3knLCdcXHUwNDUxJzonaW9jeScsJ1xcdTA0MDEnOidJT2N5JywnXFx1MDQ1NCc6J2p1a2N5JywnXFx1MDQwNCc6J0p1a2N5JywnXFx1MDQzNic6J3poY3knLCdcXHUwNDE2JzonWkhjeScsJ1xcdTA0MzcnOid6Y3knLCdcXHUwNDE3JzonWmN5JywnXFx1MDQ1NSc6J2RzY3knLCdcXHUwNDA1JzonRFNjeScsJ1xcdTA0MzgnOidpY3knLCdcXHUwNDE4JzonSWN5JywnXFx1MDQ1Nic6J2l1a2N5JywnXFx1MDQwNic6J0l1a2N5JywnXFx1MDQ1Nyc6J3lpY3knLCdcXHUwNDA3JzonWUljeScsJ1xcdTA0MzknOidqY3knLCdcXHUwNDE5JzonSmN5JywnXFx1MDQ1OCc6J2pzZXJjeScsJ1xcdTA0MDgnOidKc2VyY3knLCdcXHUwNDNBJzona2N5JywnXFx1MDQxQSc6J0tjeScsJ1xcdTA0NUMnOidramN5JywnXFx1MDQwQyc6J0tKY3knLCdcXHUwNDNCJzonbGN5JywnXFx1MDQxQic6J0xjeScsJ1xcdTA0NTknOidsamN5JywnXFx1MDQwOSc6J0xKY3knLCdcXHUwNDNDJzonbWN5JywnXFx1MDQxQyc6J01jeScsJ1xcdTA0M0QnOiduY3knLCdcXHUwNDFEJzonTmN5JywnXFx1MDQ1QSc6J25qY3knLCdcXHUwNDBBJzonTkpjeScsJ1xcdTA0M0UnOidvY3knLCdcXHUwNDFFJzonT2N5JywnXFx1MDQzRic6J3BjeScsJ1xcdTA0MUYnOidQY3knLCdcXHUwNDQwJzoncmN5JywnXFx1MDQyMCc6J1JjeScsJ1xcdTA0NDEnOidzY3knLCdcXHUwNDIxJzonU2N5JywnXFx1MDQ0Mic6J3RjeScsJ1xcdTA0MjInOidUY3knLCdcXHUwNDVCJzondHNoY3knLCdcXHUwNDBCJzonVFNIY3knLCdcXHUwNDQzJzondWN5JywnXFx1MDQyMyc6J1VjeScsJ1xcdTA0NUUnOid1YnJjeScsJ1xcdTA0MEUnOidVYnJjeScsJ1xcdTA0NDQnOidmY3knLCdcXHUwNDI0JzonRmN5JywnXFx1MDQ0NSc6J2toY3knLCdcXHUwNDI1JzonS0hjeScsJ1xcdTA0NDYnOid0c2N5JywnXFx1MDQyNic6J1RTY3knLCdcXHUwNDQ3JzonY2hjeScsJ1xcdTA0MjcnOidDSGN5JywnXFx1MDQ1Ric6J2R6Y3knLCdcXHUwNDBGJzonRFpjeScsJ1xcdTA0NDgnOidzaGN5JywnXFx1MDQyOCc6J1NIY3knLCdcXHUwNDQ5Jzonc2hjaGN5JywnXFx1MDQyOSc6J1NIQ0hjeScsJ1xcdTA0NEEnOidoYXJkY3knLCdcXHUwNDJBJzonSEFSRGN5JywnXFx1MDQ0Qic6J3ljeScsJ1xcdTA0MkInOidZY3knLCdcXHUwNDRDJzonc29mdGN5JywnXFx1MDQyQyc6J1NPRlRjeScsJ1xcdTA0NEQnOidlY3knLCdcXHUwNDJEJzonRWN5JywnXFx1MDQ0RSc6J3l1Y3knLCdcXHUwNDJFJzonWVVjeScsJ1xcdTA0NEYnOid5YWN5JywnXFx1MDQyRic6J1lBY3knLCdcXHUyMTM1JzonYWxlcGgnLCdcXHUyMTM2JzonYmV0aCcsJ1xcdTIxMzcnOidnaW1lbCcsJ1xcdTIxMzgnOidkYWxldGgnfTtcblxuXHR2YXIgcmVnZXhFc2NhcGUgPSAvW1wiJic8PmBdL2c7XG5cdHZhciBlc2NhcGVNYXAgPSB7XG5cdFx0J1wiJzogJyZxdW90OycsXG5cdFx0JyYnOiAnJmFtcDsnLFxuXHRcdCdcXCcnOiAnJiN4Mjc7Jyxcblx0XHQnPCc6ICcmbHQ7Jyxcblx0XHQvLyBTZWUgaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2FtYmlndW91cy1hbXBlcnNhbmRzOiBpbiBIVE1MLCB0aGVcblx0XHQvLyBmb2xsb3dpbmcgaXMgbm90IHN0cmljdGx5IG5lY2Vzc2FyeSB1bmxlc3MgaXTigJlzIHBhcnQgb2YgYSB0YWcgb3IgYW5cblx0XHQvLyB1bnF1b3RlZCBhdHRyaWJ1dGUgdmFsdWUuIFdl4oCZcmUgb25seSBlc2NhcGluZyBpdCB0byBzdXBwb3J0IHRob3NlXG5cdFx0Ly8gc2l0dWF0aW9ucywgYW5kIGZvciBYTUwgc3VwcG9ydC5cblx0XHQnPic6ICcmZ3Q7Jyxcblx0XHQvLyBJbiBJbnRlcm5ldCBFeHBsb3JlciDiiaQgOCwgdGhlIGJhY2t0aWNrIGNoYXJhY3RlciBjYW4gYmUgdXNlZFxuXHRcdC8vIHRvIGJyZWFrIG91dCBvZiAodW4pcXVvdGVkIGF0dHJpYnV0ZSB2YWx1ZXMgb3IgSFRNTCBjb21tZW50cy5cblx0XHQvLyBTZWUgaHR0cDovL2h0bWw1c2VjLm9yZy8jMTAyLCBodHRwOi8vaHRtbDVzZWMub3JnLyMxMDgsIGFuZFxuXHRcdC8vIGh0dHA6Ly9odG1sNXNlYy5vcmcvIzEzMy5cblx0XHQnYCc6ICcmI3g2MDsnXG5cdH07XG5cblx0dmFyIHJlZ2V4SW52YWxpZEVudGl0eSA9IC8mIyg/Olt4WF1bXmEtZkEtRjAtOV18W14wLTl4WF0pLztcblx0dmFyIHJlZ2V4SW52YWxpZFJhd0NvZGVQb2ludCA9IC9bXFwwLVxceDA4XFx4MEJcXHgwRS1cXHgxRlxceDdGLVxceDlGXFx1RkREMC1cXHVGREVGXFx1RkZGRVxcdUZGRkZdfFtcXHVEODNGXFx1RDg3RlxcdUQ4QkZcXHVEOEZGXFx1RDkzRlxcdUQ5N0ZcXHVEOUJGXFx1RDlGRlxcdURBM0ZcXHVEQTdGXFx1REFCRlxcdURBRkZcXHVEQjNGXFx1REI3RlxcdURCQkZcXHVEQkZGXVtcXHVERkZFXFx1REZGRl18W1xcdUQ4MDAtXFx1REJGRl0oPyFbXFx1REMwMC1cXHVERkZGXSl8KD86W15cXHVEODAwLVxcdURCRkZdfF4pW1xcdURDMDAtXFx1REZGRl0vO1xuXHR2YXIgcmVnZXhEZWNvZGUgPSAvJihDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsfERvdWJsZUxvbmdMZWZ0UmlnaHRBcnJvd3xDbG9ja3dpc2VDb250b3VySW50ZWdyYWx8Tm90TmVzdGVkR3JlYXRlckdyZWF0ZXJ8Tm90U3F1YXJlU3VwZXJzZXRFcXVhbHxEaWFjcml0aWNhbERvdWJsZUFjdXRlfE5vdFJpZ2h0VHJpYW5nbGVFcXVhbHxOb3RTdWNjZWVkc1NsYW50RXF1YWx8Tm90UHJlY2VkZXNTbGFudEVxdWFsfENsb3NlQ3VybHlEb3VibGVRdW90ZXxOZWdhdGl2ZVZlcnlUaGluU3BhY2V8RG91YmxlQ29udG91ckludGVncmFsfEZpbGxlZFZlcnlTbWFsbFNxdWFyZXxDYXBpdGFsRGlmZmVyZW50aWFsRHxPcGVuQ3VybHlEb3VibGVRdW90ZXxFbXB0eVZlcnlTbWFsbFNxdWFyZXxOZXN0ZWRHcmVhdGVyR3JlYXRlcnxEb3VibGVMb25nUmlnaHRBcnJvd3xOb3RMZWZ0VHJpYW5nbGVFcXVhbHxOb3RHcmVhdGVyU2xhbnRFcXVhbHxSZXZlcnNlVXBFcXVpbGlicml1bXxEb3VibGVMZWZ0UmlnaHRBcnJvd3xOb3RTcXVhcmVTdWJzZXRFcXVhbHxOb3REb3VibGVWZXJ0aWNhbEJhcnxSaWdodEFycm93TGVmdEFycm93fE5vdEdyZWF0ZXJGdWxsRXF1YWx8Tm90UmlnaHRUcmlhbmdsZUJhcnxTcXVhcmVTdXBlcnNldEVxdWFsfERvd25MZWZ0UmlnaHRWZWN0b3J8RG91YmxlTG9uZ0xlZnRBcnJvd3xsZWZ0cmlnaHRzcXVpZ2Fycm93fExlZnRBcnJvd1JpZ2h0QXJyb3d8TmVnYXRpdmVNZWRpdW1TcGFjZXxibGFja3RyaWFuZ2xlcmlnaHR8UmlnaHREb3duVmVjdG9yQmFyfFByZWNlZGVzU2xhbnRFcXVhbHxSaWdodERvdWJsZUJyYWNrZXR8U3VjY2VlZHNTbGFudEVxdWFsfE5vdExlZnRUcmlhbmdsZUJhcnxSaWdodFRyaWFuZ2xlRXF1YWx8U3F1YXJlSW50ZXJzZWN0aW9ufFJpZ2h0RG93blRlZVZlY3RvcnxSZXZlcnNlRXF1aWxpYnJpdW18TmVnYXRpdmVUaGlja1NwYWNlfGxvbmdsZWZ0cmlnaHRhcnJvd3xMb25nbGVmdHJpZ2h0YXJyb3d8TG9uZ0xlZnRSaWdodEFycm93fERvd25SaWdodFRlZVZlY3RvcnxEb3duUmlnaHRWZWN0b3JCYXJ8R3JlYXRlclNsYW50RXF1YWx8U3F1YXJlU3Vic2V0RXF1YWx8TGVmdERvd25WZWN0b3JCYXJ8TGVmdERvdWJsZUJyYWNrZXR8VmVydGljYWxTZXBhcmF0b3J8cmlnaHRsZWZ0aGFycG9vbnN8Tm90R3JlYXRlckdyZWF0ZXJ8Tm90U3F1YXJlU3VwZXJzZXR8YmxhY2t0cmlhbmdsZWxlZnR8YmxhY2t0cmlhbmdsZWRvd258TmVnYXRpdmVUaGluU3BhY2V8TGVmdERvd25UZWVWZWN0b3J8Tm90TGVzc1NsYW50RXF1YWx8bGVmdHJpZ2h0aGFycG9vbnN8RG91YmxlVXBEb3duQXJyb3d8RG91YmxlVmVydGljYWxCYXJ8TGVmdFRyaWFuZ2xlRXF1YWx8RmlsbGVkU21hbGxTcXVhcmV8dHdvaGVhZHJpZ2h0YXJyb3d8Tm90TmVzdGVkTGVzc0xlc3N8RG93bkxlZnRUZWVWZWN0b3J8RG93bkxlZnRWZWN0b3JCYXJ8UmlnaHRBbmdsZUJyYWNrZXR8Tm90VGlsZGVGdWxsRXF1YWx8Tm90UmV2ZXJzZUVsZW1lbnR8UmlnaHRVcERvd25WZWN0b3J8RGlhY3JpdGljYWxUaWxkZXxOb3RTdWNjZWVkc1RpbGRlfGNpcmNsZWFycm93cmlnaHR8Tm90UHJlY2VkZXNFcXVhbHxyaWdodGhhcnBvb25kb3dufERvdWJsZVJpZ2h0QXJyb3d8Tm90U3VjY2VlZHNFcXVhbHxOb25CcmVha2luZ1NwYWNlfE5vdFJpZ2h0VHJpYW5nbGV8TGVzc0VxdWFsR3JlYXRlcnxSaWdodFVwVGVlVmVjdG9yfExlZnRBbmdsZUJyYWNrZXR8R3JlYXRlckZ1bGxFcXVhbHxEb3duQXJyb3dVcEFycm93fFJpZ2h0VXBWZWN0b3JCYXJ8dHdvaGVhZGxlZnRhcnJvd3xHcmVhdGVyRXF1YWxMZXNzfGRvd25oYXJwb29ucmlnaHR8UmlnaHRUcmlhbmdsZUJhcnxudHJpYW5nbGVyaWdodGVxfE5vdFN1cGVyc2V0RXF1YWx8TGVmdFVwRG93blZlY3RvcnxEaWFjcml0aWNhbEFjdXRlfHJpZ2h0cmlnaHRhcnJvd3N8dmFydHJpYW5nbGVyaWdodHxVcEFycm93RG93bkFycm93fERpYWNyaXRpY2FsR3JhdmV8VW5kZXJQYXJlbnRoZXNpc3xFbXB0eVNtYWxsU3F1YXJlfExlZnRVcFZlY3RvckJhcnxsZWZ0cmlnaHRhcnJvd3N8RG93blJpZ2h0VmVjdG9yfGRvd25oYXJwb29ubGVmdHx0cmlhbmdsZXJpZ2h0ZXF8U2hvcnRSaWdodEFycm93fE92ZXJQYXJlbnRoZXNpc3xEb3VibGVMZWZ0QXJyb3d8RG91YmxlRG93bkFycm93fE5vdFNxdWFyZVN1YnNldHxiaWd0cmlhbmdsZWRvd258bnRyaWFuZ2xlbGVmdGVxfFVwcGVyUmlnaHRBcnJvd3xjdXJ2ZWFycm93cmlnaHR8dmFydHJpYW5nbGVsZWZ0fE5vdExlZnRUcmlhbmdsZXxubGVmdHJpZ2h0YXJyb3d8TG93ZXJSaWdodEFycm93fE5vdEh1bXBEb3duSHVtcHxOb3RHcmVhdGVyVGlsZGV8cmlnaHR0aHJlZXRpbWVzfExlZnRVcFRlZVZlY3RvcnxOb3RHcmVhdGVyRXF1YWx8c3RyYWlnaHRlcHNpbG9ufExlZnRUcmlhbmdsZUJhcnxyaWdodHNxdWlnYXJyb3d8Q29udG91ckludGVncmFsfHJpZ2h0bGVmdGFycm93c3xDbG9zZUN1cmx5UXVvdGV8UmlnaHREb3duVmVjdG9yfExlZnRSaWdodFZlY3RvcnxuTGVmdHJpZ2h0YXJyb3d8bGVmdGhhcnBvb25kb3dufGNpcmNsZWFycm93bGVmdHxTcXVhcmVTdXBlcnNldHxPcGVuQ3VybHlRdW90ZXxob29rcmlnaHRhcnJvd3xIb3Jpem9udGFsTGluZXxEaWFjcml0aWNhbERvdHxOb3RMZXNzR3JlYXRlcnxudHJpYW5nbGVyaWdodHxEb3VibGVSaWdodFRlZXxJbnZpc2libGVDb21tYXxJbnZpc2libGVUaW1lc3xMb3dlckxlZnRBcnJvd3xEb3duTGVmdFZlY3RvcnxOb3RTdWJzZXRFcXVhbHxjdXJ2ZWFycm93bGVmdHx0cmlhbmdsZWxlZnRlcXxOb3RWZXJ0aWNhbEJhcnxUaWxkZUZ1bGxFcXVhbHxkb3duZG93bmFycm93c3xOb3RHcmVhdGVyTGVzc3xSaWdodFRlZVZlY3RvcnxaZXJvV2lkdGhTcGFjZXxsb29wYXJyb3dyaWdodHxMb25nUmlnaHRBcnJvd3xkb3VibGViYXJ3ZWRnZXxTaG9ydExlZnRBcnJvd3xTaG9ydERvd25BcnJvd3xSaWdodFZlY3RvckJhcnxHcmVhdGVyR3JlYXRlcnxSZXZlcnNlRWxlbWVudHxyaWdodGhhcnBvb251cHxMZXNzU2xhbnRFcXVhbHxsZWZ0dGhyZWV0aW1lc3x1cGhhcnBvb25yaWdodHxyaWdodGFycm93dGFpbHxMZWZ0RG93blZlY3RvcnxMb25ncmlnaHRhcnJvd3xOZXN0ZWRMZXNzTGVzc3xVcHBlckxlZnRBcnJvd3xuc2hvcnRwYXJhbGxlbHxsZWZ0bGVmdGFycm93c3xsZWZ0cmlnaHRhcnJvd3xMZWZ0cmlnaHRhcnJvd3xMZWZ0UmlnaHRBcnJvd3xsb25ncmlnaHRhcnJvd3x1cGhhcnBvb25sZWZ0fFJpZ2h0QXJyb3dCYXJ8QXBwbHlGdW5jdGlvbnxMZWZ0VGVlVmVjdG9yfGxlZnRhcnJvd3RhaWx8Tm90RXF1YWxUaWxkZXx2YXJzdWJzZXRuZXFxfHZhcnN1cHNldG5lcXF8UmlnaHRUZWVBcnJvd3xTdWNjZWVkc0VxdWFsfFN1Y2NlZWRzVGlsZGV8TGVmdFZlY3RvckJhcnxTdXBlcnNldEVxdWFsfGhvb2tsZWZ0YXJyb3d8RGlmZmVyZW50aWFsRHxWZXJ0aWNhbFRpbGRlfFZlcnlUaGluU3BhY2V8YmxhY2t0cmlhbmdsZXxiaWd0cmlhbmdsZXVwfExlc3NGdWxsRXF1YWx8ZGl2aWRlb250aW1lc3xsZWZ0aGFycG9vbnVwfFVwRXF1aWxpYnJpdW18bnRyaWFuZ2xlbGVmdHxSaWdodFRyaWFuZ2xlfG1lYXN1cmVkYW5nbGV8c2hvcnRwYXJhbGxlbHxsb25nbGVmdGFycm93fExvbmdsZWZ0YXJyb3d8TG9uZ0xlZnRBcnJvd3xEb3VibGVMZWZ0VGVlfFBvaW5jYXJlcGxhbmV8UHJlY2VkZXNFcXVhbHx0cmlhbmdsZXJpZ2h0fERvdWJsZVVwQXJyb3d8UmlnaHRVcFZlY3RvcnxmYWxsaW5nZG90c2VxfGxvb3BhcnJvd2xlZnR8UHJlY2VkZXNUaWxkZXxOb3RUaWxkZUVxdWFsfE5vdFRpbGRlVGlsZGV8c21hbGxzZXRtaW51c3xQcm9wb3J0aW9uYWx8dHJpYW5nbGVsZWZ0fHRyaWFuZ2xlZG93bnxVbmRlckJyYWNrZXR8Tm90SHVtcEVxdWFsfGV4cG9uZW50aWFsZXxFeHBvbmVudGlhbEV8Tm90TGVzc1RpbGRlfEhpbGJlcnRTcGFjZXxSaWdodENlaWxpbmd8YmxhY2tsb3plbmdlfHZhcnN1cHNldG5lcXxIdW1wRG93bkh1bXB8R3JlYXRlckVxdWFsfFZlcnRpY2FsTGluZXxMZWZ0VGVlQXJyb3d8Tm90TGVzc0VxdWFsfERvd25UZWVBcnJvd3xMZWZ0VHJpYW5nbGV8dmFyc3Vic2V0bmVxfEludGVyc2VjdGlvbnxOb3RDb25ncnVlbnR8RG93bkFycm93QmFyfExlZnRVcFZlY3RvcnxMZWZ0QXJyb3dCYXJ8cmlzaW5nZG90c2VxfEdyZWF0ZXJUaWxkZXxSb3VuZEltcGxpZXN8U3F1YXJlU3Vic2V0fFNob3J0VXBBcnJvd3xOb3RTdXBlcnNldHxxdWF0ZXJuaW9uc3xwcmVjbmFwcHJveHxiYWNrZXBzaWxvbnxwcmVjY3VybHllcXxPdmVyQnJhY2tldHxibGFja3NxdWFyZXxNZWRpdW1TcGFjZXxWZXJ0aWNhbEJhcnxjaXJjbGVkY2lyY3xjaXJjbGVkZGFzaHxDaXJjbGVNaW51c3xDaXJjbGVUaW1lc3xMZXNzR3JlYXRlcnxjdXJseWVxcHJlY3xjdXJseWVxc3VjY3xkaWFtb25kc3VpdHxVcERvd25BcnJvd3xVcGRvd25hcnJvd3xSdWxlRGVsYXllZHxScmlnaHRhcnJvd3x1cGRvd25hcnJvd3xSaWdodFZlY3RvcnxuUmlnaHRhcnJvd3xucmlnaHRhcnJvd3xlcXNsYW50bGVzc3xMZWZ0Q2VpbGluZ3xFcXVpbGlicml1bXxTbWFsbENpcmNsZXxleHBlY3RhdGlvbnxOb3RTdWNjZWVkc3x0aGlja2FwcHJveHxHcmVhdGVyTGVzc3xTcXVhcmVVbmlvbnxOb3RQcmVjZWRlc3xOb3RMZXNzTGVzc3xzdHJhaWdodHBoaXxzdWNjbmFwcHJveHxzdWNjY3VybHllcXxTdWJzZXRFcXVhbHxzcXN1cHNldGVxfFByb3BvcnRpb258TGFwbGFjZXRyZnxJbWFnaW5hcnlJfHN1cHNldG5lcXF8Tm90R3JlYXRlcnxndHJlcXFsZXNzfE5vdEVsZW1lbnR8VGhpY2tTcGFjZXxUaWxkZUVxdWFsfFRpbGRlVGlsZGV8Rm91cmllcnRyZnxybW91c3RhY2hlfEVxdWFsVGlsZGV8ZXFzbGFudGd0cnxVbmRlckJyYWNlfExlZnRWZWN0b3J8VXBBcnJvd0JhcnxuTGVmdGFycm93fG5zdWJzZXRlcXF8c3Vic2V0bmVxcXxuc3Vwc2V0ZXFxfG5sZWZ0YXJyb3d8c3VjY2FwcHJveHxsZXNzYXBwcm94fFVwVGVlQXJyb3d8dXB1cGFycm93c3xjdXJseXdlZGdlfGxlc3NlcXFndHJ8dmFyZXBzaWxvbnx2YXJub3RoaW5nfFJpZ2h0Rmxvb3J8Y29tcGxlbWVudHxDaXJjbGVQbHVzfHNxc3Vic2V0ZXF8TGxlZnRhcnJvd3xjaXJjbGVkYXN0fFJpZ2h0QXJyb3d8UmlnaHRhcnJvd3xyaWdodGFycm93fGxtb3VzdGFjaGV8QmVybm91bGxpc3xwcmVjYXBwcm94fG1hcHN0b2xlZnR8bWFwc3RvZG93bnxsb25nbWFwc3RvfGRvdHNxdWFyZXxkb3duYXJyb3d8RG91YmxlRG90fG5zdWJzZXRlcXxzdXBzZXRuZXF8bGVmdGFycm93fG5zdXBzZXRlcXxzdWJzZXRuZXF8VGhpblNwYWNlfG5nZXFzbGFudHxzdWJzZXRlcXF8SHVtcEVxdWFsfE5vdFN1YnNldHx0cmlhbmdsZXF8Tm90Q3VwQ2FwfGxlc3NlcWd0cnxoZWFydHN1aXR8VHJpcGxlRG90fExlZnRhcnJvd3xDb3Byb2R1Y3R8Q29uZ3J1ZW50fHZhcnByb3B0b3xjb21wbGV4ZXN8Z3ZlcnRuZXFxfExlZnRBcnJvd3xMZXNzVGlsZGV8c3Vwc2V0ZXFxfE1pbnVzUGx1c3xDaXJjbGVEb3R8bmxlcXNsYW50fE5vdEV4aXN0c3xndHJlcWxlc3N8bnBhcmFsbGVsfFVuaW9uUGx1c3xMZWZ0Rmxvb3J8Y2hlY2ttYXJrfENlbnRlckRvdHxjZW50ZXJkb3R8TWVsbGludHJmfGd0cmFwcHJveHxiaWdvdGltZXN8T3ZlckJyYWNlfHNwYWRlc3VpdHx0aGVyZWZvcmV8cGl0Y2hmb3JrfHJhdGlvbmFsc3xQbHVzTWludXN8QmFja3NsYXNofFRoZXJlZm9yZXxEb3duQnJldmV8YmFja3NpbWVxfGJhY2twcmltZXxEb3duQXJyb3d8bnNob3J0bWlkfERvd25hcnJvd3xsdmVydG5lcXF8ZXF2cGFyc2x8aW1hZ2xpbmV8aW1hZ3BhcnR8aW5maW50aWV8aW50ZWdlcnN8SW50ZWdyYWx8aW50ZXJjYWx8TGVzc0xlc3N8VWFycm9jaXJ8aW50bGFyaGt8c3FzdXBzZXR8YW5nbXNkYWZ8c3FzdWJzZXR8bGxjb3JuZXJ8dmFydGhldGF8Y3VwYnJjYXB8bG5hcHByb3h8U3VwZXJzZXR8U3VjaFRoYXR8c3VjY25zaW18c3VjY25lcXF8YW5nbXNkYWd8YmlndXBsdXN8Y3VybHl2ZWV8dHJwZXppdW18U3VjY2VlZHN8Tm90VGlsZGV8Ymlnd2VkZ2V8YW5nbXNkYWh8YW5ncnR2YmR8dHJpbWludXN8Y3djb25pbnR8ZnBhcnRpbnR8bHJjb3JuZXJ8c21lcGFyc2x8c3Vic2V0ZXF8dXJjb3JuZXJ8bHVyZHNoYXJ8bGFlbXB0eXZ8RERvdHJhaGR8YXBwcm94ZXF8bGRydXNoYXJ8YXdjb25pbnR8bWFwc3RvdXB8YmFja2Nvbmd8c2hvcnRtaWR8dHJpYW5nbGV8Z2Vxc2xhbnR8Z2VzZG90b2x8dGltZXNiYXJ8Y2lyY2xlZFJ8Y2lyY2xlZFN8c2V0bWludXN8bXVsdGltYXB8bmF0dXJhbHN8c2Nwb2xpbnR8bmNvbmdkb3R8UmlnaHRUZWV8Ym94bWludXN8Z25hcHByb3h8Ym94dGltZXN8YW5kc2xvcGV8dGhpY2tzaW18YW5nbXNkYWF8dmFyc2lnbWF8Y2lyZm5pbnR8cnRyaWx0cml8YW5nbXNkYWJ8cnBwb2xpbnR8YW5nbXNkYWN8YmFyd2VkZ2V8ZHJia2Fyb3d8Y2x1YnN1aXR8dGhldGFzeW18YnNvbGhzdWJ8Y2FwYnJjdXB8ZHppZ3JhcnJ8ZG90ZXFkb3R8RG90RXF1YWx8ZG90bWludXN8VW5kZXJCYXJ8Tm90RXF1YWx8cmVhbHBhcnR8b3RpbWVzYXN8dWxjb3JuZXJ8aGtzZWFyb3d8aGtzd2Fyb3d8cGFyYWxsZWx8UGFydGlhbER8ZWxpbnRlcnN8ZW1wdHlzZXR8cGx1c2FjaXJ8YmJya3Ricmt8YW5nbXNkYWR8cG9pbnRpbnR8Ymlnb3BsdXN8YW5nbXNkYWV8UHJlY2VkZXN8Ymlnc3FjdXB8dmFya2FwcGF8bm90aW5kb3R8c3Vwc2V0ZXF8cHJlY25lcXF8cHJlY25zaW18cHJvZmFsYXJ8cHJvZmxpbmV8cHJvZnN1cmZ8bGVxc2xhbnR8bGVzZG90b3J8cmFlbXB0eXZ8c3VicGx1c3xub3RuaXZifG5vdG5pdmN8c3VicmFycnx6aWdyYXJyfHZ6aWd6YWd8c3VibXVsdHxzdWJlZG90fEVsZW1lbnR8YmV0d2VlbnxjaXJzY2lyfGxhcnJiZnN8bGFycnNpbXxsb3RpbWVzfGxicmtzbGR8bGJya3NsdXxsb3plbmdlfGxkcmRoYXJ8ZGJrYXJvd3xiaWdjaXJjfGVwc2lsb258c2ltcmFycnxzaW1wbHVzfGx0cXVlc3R8RXBzaWxvbnxsdXJ1aGFyfGd0cXVlc3R8bWFsdGVzZXxucG9saW50fGVxY29sb258bnByZWNlcXxiaWdvZG90fGRkYWdnZXJ8Z3RybGVzc3xibmVxdWl2fGhhcnJjaXJ8ZGRvdHNlcXxlcXVpdkREfGJhY2tzaW18ZGVtcHR5dnxuc3FzdWJlfG5zcXN1cGV8VXBzaWxvbnxuc3Vic2V0fHVwc2lsb258bWludXNkdXxuc3VjY2VxfHN3YXJyb3d8bnN1cHNldHxjb2xvbmVxfHNlYXJyb3d8Ym94cGx1c3xuYXBwcm94fG5hdHVyYWx8YXN5bXBlcXxhbGVmc3ltfGNvbmdkb3R8bmVhcnJvd3xiaWdzdGFyfGRpYW1vbmR8c3VwcGx1c3x0cml0aW1lfExlZnRUZWV8bnZpbmZpbnx0cmlwbHVzfE5ld0xpbmV8bnZsdHJpZXxudnJ0cmllfG53YXJyb3d8bmV4aXN0c3xEaWFtb25kfHJ1bHVoYXJ8SW1wbGllc3xzdXBtdWx0fGFuZ3phcnJ8c3VwbGFycnxzdXBoc3VifHF1ZXN0ZXF8YmVjYXVzZXxkaWdhbW1hfEJlY2F1c2V8b2xjcm9zc3xiZW1wdHl2fG9taWNyb258T21pY3Jvbnxyb3RpbWVzfE5vQnJlYWt8aW50cHJvZHxhbmdydHZifG9yZGVyb2Z8dXdhbmdsZXxzdXBoc29sfGxlc2RvdG98b3JzbG9wZXxEb3duVGVlfHJlYWxpbmV8Y3VkYXJybHxyZGxkaGFyfE92ZXJCYXJ8c3VwZWRvdHxsZXNzZG90fHN1cGRzdWJ8dG9wZm9ya3xzdWNjc2ltfHJicmtzbHV8cmJya3NsZHxwZXJ0ZW5rfGN1ZGFycnJ8aXNpbmRvdHxwbGFuY2tofGxlc3NndHJ8cGx1c2NpcnxnZXNkb3RvfHBsdXNzaW18cGx1c3R3b3xsZXNzc2ltfGN1bGFycnB8cmFycnNpbXxDYXlsZXlzfG5vdGludmF8bm90aW52Ynxub3RpbnZjfFVwQXJyb3d8VXBhcnJvd3x1cGFycm93fE5vdExlc3N8ZHdhbmdsZXxwcmVjc2ltfFByb2R1Y3R8Y3VyYXJybXxDY29uaW50fGRvdHBsdXN8cmFycmJmc3xjY3Vwc3NtfENlZGlsbGF8Y2VtcHR5dnxub3RuaXZhfHF1YXRpbnR8ZnJhYzM1fGZyYWMzOHxmcmFjNDV8ZnJhYzU2fGZyYWM1OHxmcmFjNzh8dHJpZG90fHhvcGx1c3xnYWN1dGV8Z2FtbWFkfEdhbW1hZHxsZmlzaHR8bGZsb29yfGJpZ2N1cHxzcXN1cGV8Z2JyZXZlfEdicmV2ZXxsaGFydWx8c3FzdWJlfHNxY3Vwc3xHY2VkaWx8YXBhY2lyfGxsaGFyZHxsbWlkb3R8TG1pZG90fGxtb3VzdHxhbmRhbmR8c3FjYXBzfGFwcHJveHxBYnJldmV8c3BhZGVzfGNpcmNlcXx0cHJpbWV8ZGl2aWRlfHRvcGNpcnxBc3NpZ258dG9wYm90fGdlc2RvdHxkaXZvbnh8eHVwbHVzfHRpbWVzZHxnZXNsZXN8YXRpbGRlfHNvbGJhcnxTT0ZUY3l8bG9wbHVzfHRpbWVzYnxsb3dhc3R8bG93YmFyfGRsY29ybnxkbGNyb3B8c29mdGN5fGRvbGxhcnxscGFybHR8dGhrc2ltfGxyaGFyZHxBdGlsZGV8bHNhcXVvfHNtYXNocHxiaWd2ZWV8dGhpbnNwfHdyZWF0aHxia2Fyb3d8bHNxdW9yfGxzdHJva3xMc3Ryb2t8bHRocmVlfGx0aW1lc3xsdGxhcnJ8RG90RG90fHNpbWRvdHxsdHJQYXJ8d2VpZXJwfHhzcWN1cHxhbmdtc2R8c2lnbWF2fHNpZ21hZnx6ZWV0cmZ8WmNhcm9ufHpjYXJvbnxtYXBzdG98dnN1cG5lfHRoZXRhdnxjaXJtaWR8bWFya2VyfG1jb21tYXxaYWN1dGV8dnN1Ym5FfHRoZXJlNHxndGxQYXJ8dnN1Ym5lfGJvdHRvbXxndHJhcnJ8U0hDSGN5fHNoY2hjeXxtaWRhc3R8bWlkY2lyfG1pZGRvdHxtaW51c2J8bWludXNkfGd0cmRvdHxib3d0aWV8c2Zyb3dufG1ucGx1c3xtb2RlbHN8Y29sb25lfHNlc3dhcnxDb2xvbmV8bXN0cG9zfHNlYXJoa3xndHJzaW18bmFjdXRlfE5hY3V0ZXxib3hib3h8dGVscmVjfGhhaXJzcHxUY2VkaWx8bmJ1bXBlfHNjbnNpbXxuY2Fyb258TmNhcm9ufG5jZWRpbHxOY2VkaWx8aGFtaWx0fFNjZWRpbHxuZWFyaGt8aGFyZGN5fEhBUkRjeXx0Y2VkaWx8VGNhcm9ufGNvbW1hdHxuZXF1aXZ8bmVzZWFyfHRjYXJvbnx0YXJnZXR8aGVhcnRzfG5leGlzdHx2YXJyaG98c2NlZGlsfFNjYXJvbnxzY2Fyb258aGVsbGlwfFNhY3V0ZXxzYWN1dGV8aGVyY29ufHN3bndhcnxjb21wZm58cnRpbWVzfHJ0aHJlZXxyc3F1b3J8cnNhcXVvfHphY3V0ZXx3ZWRnZXF8aG9tdGh0fGJhcnZlZXxiYXJ3ZWR8QmFyd2VkfHJwYXJndHxob3JiYXJ8Y29uaW50fHN3YXJoa3xyb3BsdXN8bmx0cmllfGhzbGFzaHxoc3Ryb2t8SHN0cm9rfHJtb3VzdHxDb25pbnR8YnByaW1lfGh5YnVsbHxoeXBoZW58aWFjdXRlfElhY3V0ZXxzdXBzdXB8c3Vwc3VifHN1cHNpbXx2YXJwaGl8Y29wcm9kfGJydmJhcnxhZ3JhdmV8U3Vwc2V0fHN1cHNldHxpZ3JhdmV8SWdyYXZlfG5vdGluRXxBZ3JhdmV8aWlpaW50fGlpbmZpbnxjb3B5c3J8d2VkYmFyfFZlcmJhcnx2YW5ncnR8YmVjYXVzfGluY2FyZXx2ZXJiYXJ8aW5vZG90fGJ1bGxldHxkcmNvcm58aW50Y2FsfGRyY3JvcHxjdWxhcnJ8dmVsbGlwfFV0aWxkZXxidW1wZXF8Y3VwY2FwfGRzdHJva3xEc3Ryb2t8Q3VwQ2FwfGN1cGN1cHxjdXBkb3R8ZWFjdXRlfEVhY3V0ZXxzdXBkb3R8aXF1ZXN0fGVhc3RlcnxlY2Fyb258RWNhcm9ufGVjb2xvbnxpc2luc3Z8dXRpbGRlfGl0aWxkZXxJdGlsZGV8Y3VyYXJyfHN1Y2NlcXxCdW1wZXF8Y2FjdXRlfHVsY3JvcHxucGFyc2x8Q2FjdXRlfG5wcmN1ZXxlZ3JhdmV8RWdyYXZlfG5yYXJyY3xucmFycnd8c3Vic3VwfHN1YnN1YnxucnRyaWV8anNlcmN5fG5zY2N1ZXxKc2VyY3l8a2FwcGF2fGtjZWRpbHxLY2VkaWx8c3Vic2ltfHVsY29ybnxuc2ltZXF8ZWdzZG90fHZlZWJhcnxrZ3JlZW58Y2FwYW5kfGVsc2RvdHxTdWJzZXR8c3Vic2V0fGN1cnJlbnxhYWN1dGV8bGFjdXRlfExhY3V0ZXxlbXB0eXZ8bnRpbGRlfE50aWxkZXxsYWdyYW58bGFtYmRhfExhbWJkYXxjYXBjYXB8VWdyYXZlfGxhbmdsZXxzdWJkb3R8ZW1zcDEzfG51bWVyb3xlbXNwMTR8bnZkYXNofG52RGFzaHxuVmRhc2h8blZEYXNofHVncmF2ZXx1ZmlzaHR8bnZIYXJyfGxhcnJmc3xudmxBcnJ8bGFycmhrfGxhcnJscHxsYXJycGx8bnZyQXJyfFVkYmxhY3xud2FyaGt8bGFycnRsfG53bmVhcnxvYWN1dGV8T2FjdXRlfGxhdGFpbHxsQXRhaWx8c3N0YXJmfGxicmFjZXxvZGJsYWN8T2RibGFjfGxicmFja3x1ZGJsYWN8b2Rzb2xkfGVwYXJzbHxsY2Fyb258TGNhcm9ufG9ncmF2ZXxPZ3JhdmV8bGNlZGlsfExjZWRpbHxBYWN1dGV8c3NtaWxlfHNzZXRtbnxzcXVhcmZ8bGRxdW9yfGNhcGN1cHxvbWludXN8Y3lsY3R5fHJoYXJ1bHxlcWNpcmN8ZGFnZ2VyfHJmbG9vcnxyZmlzaHR8RGFnZ2VyfGRhbGV0aHxlcXVhbHN8b3JpZ29mfGNhcGRvdHxlcXVlc3R8ZGNhcm9ufERjYXJvbnxyZHF1b3J8b3NsYXNofE9zbGFzaHxvdGlsZGV8T3RpbGRlfG90aW1lc3xPdGltZXN8dXJjcm9wfFVicmV2ZXx1YnJldmV8WWFjdXRlfFVhY3V0ZXx1YWN1dGV8UmNlZGlsfHJjZWRpbHx1cmNvcm58cGFyc2ltfFJjYXJvbnxWZGFzaGx8cmNhcm9ufFRzdHJva3xwZXJjbnR8cGVyaW9kfHBlcm1pbHxFeGlzdHN8eWFjdXRlfHJicmFja3xyYnJhY2V8cGhtbWF0fGNjYXJvbnxDY2Fyb258cGxhbmNrfGNjZWRpbHxwbGFua3Z8dHN0cm9rfGZlbWFsZXxwbHVzZG98cGx1c2R1fGZmaWxpZ3xwbHVzbW58ZmZsbGlnfENjZWRpbHxyQXRhaWx8ZGZpc2h0fGJlcm5vdXxyYXRhaWx8UmFycnRsfHJhcnJ0bHxhbmdzcGh8cmFycnBsfHJhcnJscHxyYXJyaGt8eHdlZGdlfHhvdGltZXxmb3JhbGx8Rm9yQWxsfFZ2ZGFzaHx2c3VwbkV8cHJlY2VxfGJpZ2NhcHxmcmFjMTJ8ZnJhYzEzfGZyYWMxNHxwcmltZXN8cmFycmZzfHBybnNpbXxmcmFjMTV8U3F1YXJlfGZyYWMxNnxzcXVhcmV8bGVzZG90fGZyYWMxOHxmcmFjMjN8cHJvcHRvfHBydXJlbHxyYXJyYXB8cmFuZ2xlfHB1bmNzcHxmcmFjMjV8UmFjdXRlfHFwcmltZXxyYWN1dGV8bGVzZ2VzfGZyYWMzNHxhYnJldmV8QUVsaWd8ZXFzaW18dXRkb3R8c2V0bW58dXJ0cml8RXF1YWx8VXJpbmd8c2VBcnJ8dXJpbmd8c2VhcnJ8ZGFzaHZ8RGFzaHZ8bXVtYXB8bmFibGF8aW9nb258SW9nb258c2RvdGV8c2RvdGJ8c2NzaW18bmFwaWR8bmFwb3N8ZXF1aXZ8bmF0dXJ8QWNpcmN8ZGJsYWN8ZXJhcnJ8bmJ1bXB8aXByb2R8ZXJEb3R8dWNpcmN8YXdpbnR8ZXNkb3R8YW5ncnR8bmNvbmd8aXNpbkV8c2NuYXB8U2NpcmN8c2NpcmN8bmRhc2h8aXNpbnN8VWJyY3l8bmVhcnJ8bmVBcnJ8aXNpbnZ8bmVkb3R8dWJyY3l8YWN1dGV8WWNpcmN8aXVrY3l8SXVrY3l8eHV0cml8bmVzaW18Y2FyZXR8amNpcmN8SmNpcmN8Y2Fyb258dHdpeHR8ZGRhcnJ8c2NjdWV8ZXhpc3R8am1hdGh8c2JxdW98bmdlcXF8YW5nc3R8Y2NhcHN8bGNlaWx8bmdzaW18VXBUZWV8ZGVsdGF8RGVsdGF8cnRyaWZ8bmhhcnJ8bmhBcnJ8bmhwYXJ8cnRyaWV8anVrY3l8SnVrY3l8a2FwcGF8cnNxdW98S2FwcGF8bmxhcnJ8bmxBcnJ8VFNIY3l8cnJhcnJ8YW9nb258QW9nb258ZmZsaWd8eHJhcnJ8dHNoY3l8Y2NpcmN8bmxlcXF8ZmlsaWd8dXBzaWh8bmxlc3N8ZGhhcmx8bmxzaW18ZmpsaWd8cm9wYXJ8bmx0cml8ZGhhcnJ8cm9icmt8cm9hcnJ8ZmxsaWd8Zmx0bnN8cm9hbmd8cm5taWR8c3VibkV8c3VibmV8bEFhcnJ8dHJpc2J8Q2NpcmN8YWNpcmN8Y2N1cHN8Ymxhbmt8VkRhc2h8Zm9ya3Z8VmRhc2h8bGFuZ2R8Y2VkaWx8YmxrMTJ8YmxrMTR8bGFxdW98c3RybnN8ZGlhbXN8bm90aW58dkRhc2h8bGFycmJ8YmxrMzR8YmxvY2t8ZGlzaW58dXBsdXN8dmRhc2h8dkJhcnZ8YWVsaWd8c3RhcmZ8V2VkZ2V8Y2hlY2t8eHJBcnJ8bGF0ZXN8bGJhcnJ8bEJhcnJ8bm90bml8bGJicmt8YmNvbmd8ZnJhc2x8bGJya2V8ZnJvd258dnJ0cml8dnByb3B8dm5zdXB8Z2FtbWF8R2FtbWF8d2VkZ2V8eG9kb3R8YmRxdW98c3JhcnJ8ZG90ZXF8bGRxdW98Ym94ZGx8Ym94ZEx8Z2NpcmN8R2NpcmN8Ym94RGx8Ym94REx8Ym94ZHJ8Ym94ZFJ8Ym94RHJ8VFJBREV8dHJhZGV8cmxoYXJ8Ym94RFJ8dm5zdWJ8bnBhcnR8dmx0cml8cmxhcnJ8Ym94aGR8Ym94aER8bnByZWN8Z2VzY2N8bnJhcnJ8bnJBcnJ8Ym94SGR8Ym94SER8Ym94aHV8Ym94aFV8bnJ0cml8Ym94SHV8Y2x1YnN8Ym94SFV8dGltZXN8Y29sb258Q29sb258Z2ltZWx8eGxBcnJ8VGlsZGV8bnNpbWV8dGlsZGV8bnNtaWR8bnNwYXJ8VEhPUk58dGhvcm58eGxhcnJ8bnN1YmV8bnN1YkV8dGhrYXB8eGhBcnJ8Y29tbWF8bnN1Y2N8Ym94dWx8Ym94dUx8bnN1cGV8bnN1cEV8Z25lcXF8Z25zaW18Ym94VWx8Ym94VUx8Z3JhdmV8Ym94dXJ8Ym94dVJ8Ym94VXJ8Ym94VVJ8bGVzY2N8YW5nbGV8YmVwc2l8Ym94dmh8dmFycGl8Ym94dkh8bnVtc3B8VGhldGF8Z3NpbWV8Z3NpbWx8dGhldGF8Ym94Vmh8Ym94Vkh8Ym94dmx8Z3RjaXJ8Z3Rkb3R8Ym94dkx8Ym94Vmx8Ym94Vkx8Y3JhcnJ8Y3Jvc3N8Q3Jvc3N8bnZzaW18Ym94dnJ8bndhcnJ8bndBcnJ8c3FzdXB8ZHRkb3R8VW9nb258bGhhcmR8bGhhcnV8ZHRyaWZ8b2NpcmN8T2NpcmN8bGhibGt8ZHVhcnJ8b2Rhc2h8c3FzdWJ8SGFjZWt8c3FjdXB8bGxhcnJ8ZHVoYXJ8b2VsaWd8T0VsaWd8b2ZjaXJ8Ym94dlJ8dW9nb258bGx0cml8Ym94VnJ8Y3N1YmV8dXVhcnJ8b2hiYXJ8Y3N1cGV8Y3Rkb3R8b2xhcnJ8b2xjaXJ8aGFycnd8b2xpbmV8c3FjYXB8b21hY3J8T21hY3J8b21lZ2F8T21lZ2F8Ym94VlJ8YWxlcGh8bG5lcXF8bG5zaW18bG9hbmd8bG9hcnJ8cmhhcnV8bG9icmt8aGNpcmN8b3BlcnB8b3BsdXN8cmhhcmR8SGNpcmN8b3JhcnJ8VW5pb258b3JkZXJ8ZWNpcmN8RWNpcmN8Y3VlcHJ8c3psaWd8Y3Vlc2N8YnJldmV8cmVhbHN8ZUREb3R8QnJldmV8aG9hcnJ8bG9wYXJ8dXRyaWZ8cmRxdW98VW1hY3J8dW1hY3J8ZWZEb3R8c3dBcnJ8dWx0cml8YWxwaGF8cmNlaWx8b3ZiYXJ8c3dhcnJ8V2NpcmN8d2NpcmN8c210ZXN8c21pbGV8YnNlbWl8bHJhcnJ8YXJpbmd8cGFyc2x8bHJoYXJ8YnNpbWV8dWhibGt8bHJ0cml8Y3Vwb3J8QXJpbmd8dWhhcnJ8dWhhcmx8c2xhcnJ8cmJya2V8YnNvbGJ8bHNpbWV8cmJicmt8UkJhcnJ8bHNpbWd8cGhvbmV8ckJhcnJ8cmJhcnJ8aWNpcmN8bHNxdW98SWNpcmN8ZW1hY3J8RW1hY3J8cmF0aW98c2ltbmV8cGx1c2J8c2ltbEV8c2ltZ0V8c2ltZXF8cGx1c2V8bHRjaXJ8bHRkb3R8ZW1wdHl8eGhhcnJ8eGR0cml8aWV4Y2x8QWxwaGF8bHRyaWV8cmFycnd8cG91bmR8bHRyaWZ8eGNpcmN8YnVtcGV8cHJjdWV8YnVtcEV8YXN5bXB8YW1hY3J8Y3V2ZWV8U2lnbWF8c2lnbWF8aWlpbnR8dWRoYXJ8aWlvdGF8aWpsaWd8SUpsaWd8c3VwbkV8aW1hY3J8SW1hY3J8cHJpbWV8UHJpbWV8aW1hZ2V8cHJuYXB8ZW9nb258RW9nb258cmFycmN8bWRhc2h8bUREb3R8Y3V3ZWR8aW1hdGh8c3VwbmV8aW1wZWR8QW1hY3J8dWRhcnJ8cHJzaW18bWljcm98cmFycmJ8Y3dpbnR8cmFxdW98aW5maW58ZXBsdXN8cmFuZ2V8cmFuZ2R8VWNpcmN8cmFkaWN8bWludXN8YW1hbGd8dmVlZXF8ckFhcnJ8ZXBzaXZ8eWNpcmN8cXVlc3R8c2hhcnB8cXVvdHx6d25qfFFzY3J8cmFjZXxxc2NyfFFvcGZ8cW9wZnxxaW50fHJhbmd8UmFuZ3xac2NyfHpzY3J8Wm9wZnx6b3BmfHJhcnJ8ckFycnxSYXJyfFBzY3J8cHNjcnxwcm9wfHByb2R8cHJuRXxwcmVjfFpIY3l8emhjeXxwcmFwfFpldGF8emV0YXxQb3BmfHBvcGZ8WmRvdHxwbHVzfHpkb3R8WXVtbHx5dW1sfHBoaXZ8WVVjeXx5dWN5fFlzY3J8eXNjcnxwZXJwfFlvcGZ8eW9wZnxwYXJ0fHBhcmF8WUljeXxPdW1sfHJjdWJ8eWljeXxZQWN5fHJkY2F8b3VtbHxvc29sfE9zY3J8cmRzaHx5YWN5fHJlYWx8b3Njcnx4dmVlfGFuZGR8cmVjdHxhbmR2fFhzY3J8b3JvcnxvcmRtfG9yZGZ8eHNjcnxhbmdlfGFvcGZ8QW9wZnxySGFyfFhvcGZ8b3BhcnxPb3BmfHhvcGZ8eG5pc3xyaG92fG9vcGZ8b21pZHx4bWFwfG9pbnR8YXBpZHxhcG9zfG9nb258YXNjcnxBc2NyfG9kb3R8b2Rpdnx4Y3VwfHhjYXB8b2NpcnxvYXN0fG52bHR8bnZsZXxudmd0fG52Z2V8bnZhcHxXc2NyfHdzY3J8YXVtbHxudGxnfG50Z2x8bnN1cHxuc3VifG5zaW18TnNjcnxuc2NyfG5zY2V8V29wZnxyaW5nfG5wcmV8d29wZnxucGFyfEF1bWx8QmFydnxiYnJrfE5vcGZ8bm9wZnxubWlkfG5MdHZ8YmV0YXxyb3BmfFJvcGZ8QmV0YXxiZXRofG5sZXN8cnBhcnxubGVxfGJub3R8Yk5vdHxubGRyfE5KY3l8cnNjcnxSc2NyfFZzY3J8dnNjcnxyc3FifG5qY3l8Ym9wZnxuaXNkfEJvcGZ8cnRyaXxWb3BmfG5HdHZ8bmd0cnx2b3BmfGJveGh8Ym94SHxib3h2fG5nZXN8bmdlcXxib3hWfGJzY3J8c2NhcHxCc2NyfGJzaW18VmVydHx2ZXJ0fGJzb2x8YnVsbHxidW1wfGNhcHN8Y2RvdHxuY3VwfHNjbkV8bmNhcHxuYnNwfG5hcEV8Q2RvdHxjZW50fHNkb3R8VmJhcnxuYW5nfHZCYXJ8Y2hjeXxNc2NyfG1zY3J8c2VjdHxzZW1pfENIY3l8TW9wZnxtb3BmfHNleHR8Y2lyY3xjaXJlfG1sZHJ8bWxjcHxjaXJFfGNvbXB8c2hjeXxTSGN5fHZBcnJ8dmFycnxjb25nfGNvcGZ8Q29wZnxjb3B5fENPUFl8bWFsdHxtYWxlfG1hY3J8bHZuRXxjc2NyfGx0cml8c2ltZXxsdGNjfHNpbWd8Q3NjcnxzaW1sfGNzdWJ8VXVtbHxsc3FifGxzaW18dXVtbHxjc3VwfExzY3J8bHNjcnx1dHJpfHNtaWR8bHBhcnxjdXBzfHNtdGV8bG96ZnxkYXJyfExvcGZ8VXNjcnxzb2xifGxvcGZ8c29wZnxTb3BmfGxuZXF8dXNjcnxzcGFyfGRBcnJ8bG5hcHxEYXJyfGRhc2h8U3FydHxMSmN5fGxqY3l8bEhhcnxkSGFyfFVwc2l8dXBzaXxkaWFtfGxlc2d8ZGpjeXxESmN5fGxlcXF8ZG9wZnxEb3BmfGRzY3J8RHNjcnxkc2N5fGxkc2h8bGRjYXxzcXVmfERTY3l8c3NjcnxTc2NyfGRzb2x8bGN1YnxsYXRlfHN0YXJ8U3RhcnxVb3BmfExhcnJ8bEFycnxsYXJyfHVvcGZ8ZHRyaXxkemN5fHN1YmV8c3ViRXxMYW5nfGxhbmd8S3Njcnxrc2NyfEtvcGZ8a29wZnxLSmN5fGtqY3l8S0hjeXxraGN5fERaY3l8ZWNpcnxlZG90fGVEb3R8SnNjcnxqc2NyfHN1Y2N8Sm9wZnxqb3BmfEVkb3R8dUhhcnxlbXNwfGVuc3B8SXVtbHxpdW1sfGVvcGZ8aXNpbnxJc2NyfGlzY3J8RW9wZnxlcGFyfHN1bmd8ZXBzaXxlc2NyfHN1cDF8c3VwMnxzdXAzfElvdGF8aW90YXxzdXBlfHN1cEV8SW9wZnxpb3BmfElPY3l8aW9jeXxFc2NyfGVzaW18RXNpbXxpbW9mfFVhcnJ8UVVPVHx1QXJyfHVhcnJ8ZXVtbHxJRWN5fGllY3l8SWRvdHxFdW1sfGV1cm98ZXhjbHxIc2NyfGhzY3J8SG9wZnxob3BmfFRTY3l8dHNjeXxUc2NyfGhiYXJ8dHNjcnxmbGF0fHRicmt8Zm5vZnxoQXJyfGhhcnJ8aGFsZnxmb3BmfEZvcGZ8dGRvdHxndm5FfGZvcmt8dHJpZXxndGNjfGZzY3J8RnNjcnxnZG90fGdzaW18R3Njcnxnc2NyfEdvcGZ8Z29wZnxnbmVxfEdkb3R8dG9zYXxnbmFwfFRvcGZ8dG9wZnxnZXFxfHRvZWF8R0pjeXxnamN5fHRpbnR8Z2VzbHxtaWR8U2ZyfGdnZ3x0b3B8Z2VzfGdsYXxnbEV8Z2xqfGdlcXxnbmV8Z0VsfGdlbHxnbkV8R2N5fGdjeXxnYXB8VGZyfHRmcnxUY3l8dGN5fEhhdHxUYXV8RmZyfHRhdXxUYWJ8aGZyfEhmcnxmZnJ8RmN5fGZjeXxpY3l8SWN5fGlmZnxFVEh8ZXRofGlmcnxJZnJ8RXRhfGV0YXxpbnR8SW50fFN1cHxzdXB8dWN5fFVjeXxTdW18c3VtfGpjeXxFTkd8dWZyfFVmcnxlbmd8SmN5fGpmcnxlbHN8ZWxsfGVnc3xFZnJ8ZWZyfEpmcnx1bWx8a2N5fEtjeXxFY3l8ZWN5fGtmcnxLZnJ8bGFwfFN1YnxzdWJ8bGF0fGxjeXxMY3l8bGVnfERvdHxkb3R8bEVnfGxlcXxsZXN8c3F1fGRpdnxkaWV8bGZyfExmcnxsZ0V8RGZyfGRmcnxEZWx8ZGVnfERjeXxkY3l8bG5lfGxuRXxzb2x8bG96fHNtdHxDdXB8bHJtfGN1cHxsc2h8THNofHNpbXxzaHl8bWFwfE1hcHxtY3l8TWN5fG1mcnxNZnJ8bWhvfGdmcnxHZnJ8c2ZyfGNpcnxDaGl8Y2hpfG5hcHxDZnJ8dmN5fFZjeXxjZnJ8U2N5fHNjeXxuY3l8TmN5fHZlZXxWZWV8Q2FwfGNhcHxuZnJ8c2NFfHNjZXxOZnJ8bmdlfG5nRXxuR2d8dmZyfFZmcnxuZ3R8Ym90fG5HdHxuaXN8bml2fFJzaHxyc2h8bmxlfG5sRXxibmV8QmZyfGJmcnxuTGx8bmx0fG5MdHxCY3l8YmN5fG5vdHxOb3R8cmxtfHdmcnxXZnJ8bnByfG5zY3xudW18b2N5fGFzdHxPY3l8b2ZyfHhmcnxYZnJ8T2ZyfG9ndHxvaG18YXBFfG9sdHxSaG98YXBlfHJob3xSZnJ8cmZyfG9yZHxSRUd8YW5nfHJlZ3xvcnZ8QW5kfGFuZHxBTVB8UmN5fGFtcHxBZnJ8eWN5fFljeXx5ZW58eWZyfFlmcnxyY3l8cGFyfHBjeXxQY3l8cGZyfFBmcnxwaGl8UGhpfGFmcnxBY3l8YWN5fHpjeXxaY3l8cGl2fGFjRXxhY2R8emZyfFpmcnxwcmV8cHJFfHBzaXxQc2l8cWZyfFFmcnx6d2p8T3J8Z2V8R2d8Z3R8Z2d8ZWx8b1N8bHR8THR8TFR8UmV8bGd8Z2x8ZWd8bmV8SW18aXR8bGV8RER8d3B8d3J8bnV8TnV8ZGR8bEV8U2N8c2N8cGl8UGl8ZWV8YWZ8bGx8TGx8cnh8Z0V8eGl8cG18WGl8aWN8cHJ8UHJ8aW58bml8bXB8bXV8YWN8TXV8b3J8YXB8R3R8R1R8aWkpO3wmKEFhY3V0ZXxBZ3JhdmV8QXRpbGRlfENjZWRpbHxFYWN1dGV8RWdyYXZlfElhY3V0ZXxJZ3JhdmV8TnRpbGRlfE9hY3V0ZXxPZ3JhdmV8T3NsYXNofE90aWxkZXxVYWN1dGV8VWdyYXZlfFlhY3V0ZXxhYWN1dGV8YWdyYXZlfGF0aWxkZXxicnZiYXJ8Y2NlZGlsfGN1cnJlbnxkaXZpZGV8ZWFjdXRlfGVncmF2ZXxmcmFjMTJ8ZnJhYzE0fGZyYWMzNHxpYWN1dGV8aWdyYXZlfGlxdWVzdHxtaWRkb3R8bnRpbGRlfG9hY3V0ZXxvZ3JhdmV8b3NsYXNofG90aWxkZXxwbHVzbW58dWFjdXRlfHVncmF2ZXx5YWN1dGV8QUVsaWd8QWNpcmN8QXJpbmd8RWNpcmN8SWNpcmN8T2NpcmN8VEhPUk58VWNpcmN8YWNpcmN8YWN1dGV8YWVsaWd8YXJpbmd8Y2VkaWx8ZWNpcmN8aWNpcmN8aWV4Y2x8bGFxdW98bWljcm98b2NpcmN8cG91bmR8cmFxdW98c3psaWd8dGhvcm58dGltZXN8dWNpcmN8QXVtbHxDT1BZfEV1bWx8SXVtbHxPdW1sfFFVT1R8VXVtbHxhdW1sfGNlbnR8Y29weXxldW1sfGl1bWx8bWFjcnxuYnNwfG9yZGZ8b3JkbXxvdW1sfHBhcmF8cXVvdHxzZWN0fHN1cDF8c3VwMnxzdXAzfHV1bWx8eXVtbHxBTVB8RVRIfFJFR3xhbXB8ZGVnfGV0aHxub3R8cmVnfHNoeXx1bWx8eWVufEdUfExUfGd0fGx0KSg/ITspKFs9YS16QS1aMC05XT8pfCYjKFswLTldKykoOz8pfCYjW3hYXShbYS1mQS1GMC05XSspKDs/KXwmKFswLTlhLXpBLVpdKykvZztcblx0dmFyIGRlY29kZU1hcCA9IHsnYWFjdXRlJzonXFx4RTEnLCdBYWN1dGUnOidcXHhDMScsJ2FicmV2ZSc6J1xcdTAxMDMnLCdBYnJldmUnOidcXHUwMTAyJywnYWMnOidcXHUyMjNFJywnYWNkJzonXFx1MjIzRicsJ2FjRSc6J1xcdTIyM0VcXHUwMzMzJywnYWNpcmMnOidcXHhFMicsJ0FjaXJjJzonXFx4QzInLCdhY3V0ZSc6J1xceEI0JywnYWN5JzonXFx1MDQzMCcsJ0FjeSc6J1xcdTA0MTAnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FmJzonXFx1MjA2MScsJ2Fmcic6J1xcdUQ4MzVcXHVERDFFJywnQWZyJzonXFx1RDgzNVxcdUREMDQnLCdhZ3JhdmUnOidcXHhFMCcsJ0FncmF2ZSc6J1xceEMwJywnYWxlZnN5bSc6J1xcdTIxMzUnLCdhbGVwaCc6J1xcdTIxMzUnLCdhbHBoYSc6J1xcdTAzQjEnLCdBbHBoYSc6J1xcdTAzOTEnLCdhbWFjcic6J1xcdTAxMDEnLCdBbWFjcic6J1xcdTAxMDAnLCdhbWFsZyc6J1xcdTJBM0YnLCdhbXAnOicmJywnQU1QJzonJicsJ2FuZCc6J1xcdTIyMjcnLCdBbmQnOidcXHUyQTUzJywnYW5kYW5kJzonXFx1MkE1NScsJ2FuZGQnOidcXHUyQTVDJywnYW5kc2xvcGUnOidcXHUyQTU4JywnYW5kdic6J1xcdTJBNUEnLCdhbmcnOidcXHUyMjIwJywnYW5nZSc6J1xcdTI5QTQnLCdhbmdsZSc6J1xcdTIyMjAnLCdhbmdtc2QnOidcXHUyMjIxJywnYW5nbXNkYWEnOidcXHUyOUE4JywnYW5nbXNkYWInOidcXHUyOUE5JywnYW5nbXNkYWMnOidcXHUyOUFBJywnYW5nbXNkYWQnOidcXHUyOUFCJywnYW5nbXNkYWUnOidcXHUyOUFDJywnYW5nbXNkYWYnOidcXHUyOUFEJywnYW5nbXNkYWcnOidcXHUyOUFFJywnYW5nbXNkYWgnOidcXHUyOUFGJywnYW5ncnQnOidcXHUyMjFGJywnYW5ncnR2Yic6J1xcdTIyQkUnLCdhbmdydHZiZCc6J1xcdTI5OUQnLCdhbmdzcGgnOidcXHUyMjIyJywnYW5nc3QnOidcXHhDNScsJ2FuZ3phcnInOidcXHUyMzdDJywnYW9nb24nOidcXHUwMTA1JywnQW9nb24nOidcXHUwMTA0JywnYW9wZic6J1xcdUQ4MzVcXHVERDUyJywnQW9wZic6J1xcdUQ4MzVcXHVERDM4JywnYXAnOidcXHUyMjQ4JywnYXBhY2lyJzonXFx1MkE2RicsJ2FwZSc6J1xcdTIyNEEnLCdhcEUnOidcXHUyQTcwJywnYXBpZCc6J1xcdTIyNEInLCdhcG9zJzonXFwnJywnQXBwbHlGdW5jdGlvbic6J1xcdTIwNjEnLCdhcHByb3gnOidcXHUyMjQ4JywnYXBwcm94ZXEnOidcXHUyMjRBJywnYXJpbmcnOidcXHhFNScsJ0FyaW5nJzonXFx4QzUnLCdhc2NyJzonXFx1RDgzNVxcdURDQjYnLCdBc2NyJzonXFx1RDgzNVxcdURDOUMnLCdBc3NpZ24nOidcXHUyMjU0JywnYXN0JzonKicsJ2FzeW1wJzonXFx1MjI0OCcsJ2FzeW1wZXEnOidcXHUyMjREJywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2F3Y29uaW50JzonXFx1MjIzMycsJ2F3aW50JzonXFx1MkExMScsJ2JhY2tjb25nJzonXFx1MjI0QycsJ2JhY2tlcHNpbG9uJzonXFx1MDNGNicsJ2JhY2twcmltZSc6J1xcdTIwMzUnLCdiYWNrc2ltJzonXFx1MjIzRCcsJ2JhY2tzaW1lcSc6J1xcdTIyQ0QnLCdCYWNrc2xhc2gnOidcXHUyMjE2JywnQmFydic6J1xcdTJBRTcnLCdiYXJ2ZWUnOidcXHUyMkJEJywnYmFyd2VkJzonXFx1MjMwNScsJ0JhcndlZCc6J1xcdTIzMDYnLCdiYXJ3ZWRnZSc6J1xcdTIzMDUnLCdiYnJrJzonXFx1MjNCNScsJ2Jicmt0YnJrJzonXFx1MjNCNicsJ2Jjb25nJzonXFx1MjI0QycsJ2JjeSc6J1xcdTA0MzEnLCdCY3knOidcXHUwNDExJywnYmRxdW8nOidcXHUyMDFFJywnYmVjYXVzJzonXFx1MjIzNScsJ2JlY2F1c2UnOidcXHUyMjM1JywnQmVjYXVzZSc6J1xcdTIyMzUnLCdiZW1wdHl2JzonXFx1MjlCMCcsJ2JlcHNpJzonXFx1MDNGNicsJ2Jlcm5vdSc6J1xcdTIxMkMnLCdCZXJub3VsbGlzJzonXFx1MjEyQycsJ2JldGEnOidcXHUwM0IyJywnQmV0YSc6J1xcdTAzOTInLCdiZXRoJzonXFx1MjEzNicsJ2JldHdlZW4nOidcXHUyMjZDJywnYmZyJzonXFx1RDgzNVxcdUREMUYnLCdCZnInOidcXHVEODM1XFx1REQwNScsJ2JpZ2NhcCc6J1xcdTIyQzInLCdiaWdjaXJjJzonXFx1MjVFRicsJ2JpZ2N1cCc6J1xcdTIyQzMnLCdiaWdvZG90JzonXFx1MkEwMCcsJ2JpZ29wbHVzJzonXFx1MkEwMScsJ2JpZ290aW1lcyc6J1xcdTJBMDInLCdiaWdzcWN1cCc6J1xcdTJBMDYnLCdiaWdzdGFyJzonXFx1MjYwNScsJ2JpZ3RyaWFuZ2xlZG93bic6J1xcdTI1QkQnLCdiaWd0cmlhbmdsZXVwJzonXFx1MjVCMycsJ2JpZ3VwbHVzJzonXFx1MkEwNCcsJ2JpZ3ZlZSc6J1xcdTIyQzEnLCdiaWd3ZWRnZSc6J1xcdTIyQzAnLCdia2Fyb3cnOidcXHUyOTBEJywnYmxhY2tsb3plbmdlJzonXFx1MjlFQicsJ2JsYWNrc3F1YXJlJzonXFx1MjVBQScsJ2JsYWNrdHJpYW5nbGUnOidcXHUyNUI0JywnYmxhY2t0cmlhbmdsZWRvd24nOidcXHUyNUJFJywnYmxhY2t0cmlhbmdsZWxlZnQnOidcXHUyNUMyJywnYmxhY2t0cmlhbmdsZXJpZ2h0JzonXFx1MjVCOCcsJ2JsYW5rJzonXFx1MjQyMycsJ2JsazEyJzonXFx1MjU5MicsJ2JsazE0JzonXFx1MjU5MScsJ2JsazM0JzonXFx1MjU5MycsJ2Jsb2NrJzonXFx1MjU4OCcsJ2JuZSc6Jz1cXHUyMEU1JywnYm5lcXVpdic6J1xcdTIyNjFcXHUyMEU1JywnYm5vdCc6J1xcdTIzMTAnLCdiTm90JzonXFx1MkFFRCcsJ2JvcGYnOidcXHVEODM1XFx1REQ1MycsJ0JvcGYnOidcXHVEODM1XFx1REQzOScsJ2JvdCc6J1xcdTIyQTUnLCdib3R0b20nOidcXHUyMkE1JywnYm93dGllJzonXFx1MjJDOCcsJ2JveGJveCc6J1xcdTI5QzknLCdib3hkbCc6J1xcdTI1MTAnLCdib3hkTCc6J1xcdTI1NTUnLCdib3hEbCc6J1xcdTI1NTYnLCdib3hETCc6J1xcdTI1NTcnLCdib3hkcic6J1xcdTI1MEMnLCdib3hkUic6J1xcdTI1NTInLCdib3hEcic6J1xcdTI1NTMnLCdib3hEUic6J1xcdTI1NTQnLCdib3hoJzonXFx1MjUwMCcsJ2JveEgnOidcXHUyNTUwJywnYm94aGQnOidcXHUyNTJDJywnYm94aEQnOidcXHUyNTY1JywnYm94SGQnOidcXHUyNTY0JywnYm94SEQnOidcXHUyNTY2JywnYm94aHUnOidcXHUyNTM0JywnYm94aFUnOidcXHUyNTY4JywnYm94SHUnOidcXHUyNTY3JywnYm94SFUnOidcXHUyNTY5JywnYm94bWludXMnOidcXHUyMjlGJywnYm94cGx1cyc6J1xcdTIyOUUnLCdib3h0aW1lcyc6J1xcdTIyQTAnLCdib3h1bCc6J1xcdTI1MTgnLCdib3h1TCc6J1xcdTI1NUInLCdib3hVbCc6J1xcdTI1NUMnLCdib3hVTCc6J1xcdTI1NUQnLCdib3h1cic6J1xcdTI1MTQnLCdib3h1Uic6J1xcdTI1NTgnLCdib3hVcic6J1xcdTI1NTknLCdib3hVUic6J1xcdTI1NUEnLCdib3h2JzonXFx1MjUwMicsJ2JveFYnOidcXHUyNTUxJywnYm94dmgnOidcXHUyNTNDJywnYm94dkgnOidcXHUyNTZBJywnYm94VmgnOidcXHUyNTZCJywnYm94VkgnOidcXHUyNTZDJywnYm94dmwnOidcXHUyNTI0JywnYm94dkwnOidcXHUyNTYxJywnYm94VmwnOidcXHUyNTYyJywnYm94VkwnOidcXHUyNTYzJywnYm94dnInOidcXHUyNTFDJywnYm94dlInOidcXHUyNTVFJywnYm94VnInOidcXHUyNTVGJywnYm94VlInOidcXHUyNTYwJywnYnByaW1lJzonXFx1MjAzNScsJ2JyZXZlJzonXFx1MDJEOCcsJ0JyZXZlJzonXFx1MDJEOCcsJ2JydmJhcic6J1xceEE2JywnYnNjcic6J1xcdUQ4MzVcXHVEQ0I3JywnQnNjcic6J1xcdTIxMkMnLCdic2VtaSc6J1xcdTIwNEYnLCdic2ltJzonXFx1MjIzRCcsJ2JzaW1lJzonXFx1MjJDRCcsJ2Jzb2wnOidcXFxcJywnYnNvbGInOidcXHUyOUM1JywnYnNvbGhzdWInOidcXHUyN0M4JywnYnVsbCc6J1xcdTIwMjInLCdidWxsZXQnOidcXHUyMDIyJywnYnVtcCc6J1xcdTIyNEUnLCdidW1wZSc6J1xcdTIyNEYnLCdidW1wRSc6J1xcdTJBQUUnLCdidW1wZXEnOidcXHUyMjRGJywnQnVtcGVxJzonXFx1MjI0RScsJ2NhY3V0ZSc6J1xcdTAxMDcnLCdDYWN1dGUnOidcXHUwMTA2JywnY2FwJzonXFx1MjIyOScsJ0NhcCc6J1xcdTIyRDInLCdjYXBhbmQnOidcXHUyQTQ0JywnY2FwYnJjdXAnOidcXHUyQTQ5JywnY2FwY2FwJzonXFx1MkE0QicsJ2NhcGN1cCc6J1xcdTJBNDcnLCdjYXBkb3QnOidcXHUyQTQwJywnQ2FwaXRhbERpZmZlcmVudGlhbEQnOidcXHUyMTQ1JywnY2Fwcyc6J1xcdTIyMjlcXHVGRTAwJywnY2FyZXQnOidcXHUyMDQxJywnY2Fyb24nOidcXHUwMkM3JywnQ2F5bGV5cyc6J1xcdTIxMkQnLCdjY2Fwcyc6J1xcdTJBNEQnLCdjY2Fyb24nOidcXHUwMTBEJywnQ2Nhcm9uJzonXFx1MDEwQycsJ2NjZWRpbCc6J1xceEU3JywnQ2NlZGlsJzonXFx4QzcnLCdjY2lyYyc6J1xcdTAxMDknLCdDY2lyYyc6J1xcdTAxMDgnLCdDY29uaW50JzonXFx1MjIzMCcsJ2NjdXBzJzonXFx1MkE0QycsJ2NjdXBzc20nOidcXHUyQTUwJywnY2RvdCc6J1xcdTAxMEInLCdDZG90JzonXFx1MDEwQScsJ2NlZGlsJzonXFx4QjgnLCdDZWRpbGxhJzonXFx4QjgnLCdjZW1wdHl2JzonXFx1MjlCMicsJ2NlbnQnOidcXHhBMicsJ2NlbnRlcmRvdCc6J1xceEI3JywnQ2VudGVyRG90JzonXFx4QjcnLCdjZnInOidcXHVEODM1XFx1REQyMCcsJ0Nmcic6J1xcdTIxMkQnLCdjaGN5JzonXFx1MDQ0NycsJ0NIY3knOidcXHUwNDI3JywnY2hlY2snOidcXHUyNzEzJywnY2hlY2ttYXJrJzonXFx1MjcxMycsJ2NoaSc6J1xcdTAzQzcnLCdDaGknOidcXHUwM0E3JywnY2lyJzonXFx1MjVDQicsJ2NpcmMnOidcXHUwMkM2JywnY2lyY2VxJzonXFx1MjI1NycsJ2NpcmNsZWFycm93bGVmdCc6J1xcdTIxQkEnLCdjaXJjbGVhcnJvd3JpZ2h0JzonXFx1MjFCQicsJ2NpcmNsZWRhc3QnOidcXHUyMjlCJywnY2lyY2xlZGNpcmMnOidcXHUyMjlBJywnY2lyY2xlZGRhc2gnOidcXHUyMjlEJywnQ2lyY2xlRG90JzonXFx1MjI5OScsJ2NpcmNsZWRSJzonXFx4QUUnLCdjaXJjbGVkUyc6J1xcdTI0QzgnLCdDaXJjbGVNaW51cyc6J1xcdTIyOTYnLCdDaXJjbGVQbHVzJzonXFx1MjI5NScsJ0NpcmNsZVRpbWVzJzonXFx1MjI5NycsJ2NpcmUnOidcXHUyMjU3JywnY2lyRSc6J1xcdTI5QzMnLCdjaXJmbmludCc6J1xcdTJBMTAnLCdjaXJtaWQnOidcXHUyQUVGJywnY2lyc2Npcic6J1xcdTI5QzInLCdDbG9ja3dpc2VDb250b3VySW50ZWdyYWwnOidcXHUyMjMyJywnQ2xvc2VDdXJseURvdWJsZVF1b3RlJzonXFx1MjAxRCcsJ0Nsb3NlQ3VybHlRdW90ZSc6J1xcdTIwMTknLCdjbHVicyc6J1xcdTI2NjMnLCdjbHVic3VpdCc6J1xcdTI2NjMnLCdjb2xvbic6JzonLCdDb2xvbic6J1xcdTIyMzcnLCdjb2xvbmUnOidcXHUyMjU0JywnQ29sb25lJzonXFx1MkE3NCcsJ2NvbG9uZXEnOidcXHUyMjU0JywnY29tbWEnOicsJywnY29tbWF0JzonQCcsJ2NvbXAnOidcXHUyMjAxJywnY29tcGZuJzonXFx1MjIxOCcsJ2NvbXBsZW1lbnQnOidcXHUyMjAxJywnY29tcGxleGVzJzonXFx1MjEwMicsJ2NvbmcnOidcXHUyMjQ1JywnY29uZ2RvdCc6J1xcdTJBNkQnLCdDb25ncnVlbnQnOidcXHUyMjYxJywnY29uaW50JzonXFx1MjIyRScsJ0NvbmludCc6J1xcdTIyMkYnLCdDb250b3VySW50ZWdyYWwnOidcXHUyMjJFJywnY29wZic6J1xcdUQ4MzVcXHVERDU0JywnQ29wZic6J1xcdTIxMDInLCdjb3Byb2QnOidcXHUyMjEwJywnQ29wcm9kdWN0JzonXFx1MjIxMCcsJ2NvcHknOidcXHhBOScsJ0NPUFknOidcXHhBOScsJ2NvcHlzcic6J1xcdTIxMTcnLCdDb3VudGVyQ2xvY2t3aXNlQ29udG91ckludGVncmFsJzonXFx1MjIzMycsJ2NyYXJyJzonXFx1MjFCNScsJ2Nyb3NzJzonXFx1MjcxNycsJ0Nyb3NzJzonXFx1MkEyRicsJ2NzY3InOidcXHVEODM1XFx1RENCOCcsJ0NzY3InOidcXHVEODM1XFx1REM5RScsJ2NzdWInOidcXHUyQUNGJywnY3N1YmUnOidcXHUyQUQxJywnY3N1cCc6J1xcdTJBRDAnLCdjc3VwZSc6J1xcdTJBRDInLCdjdGRvdCc6J1xcdTIyRUYnLCdjdWRhcnJsJzonXFx1MjkzOCcsJ2N1ZGFycnInOidcXHUyOTM1JywnY3VlcHInOidcXHUyMkRFJywnY3Vlc2MnOidcXHUyMkRGJywnY3VsYXJyJzonXFx1MjFCNicsJ2N1bGFycnAnOidcXHUyOTNEJywnY3VwJzonXFx1MjIyQScsJ0N1cCc6J1xcdTIyRDMnLCdjdXBicmNhcCc6J1xcdTJBNDgnLCdjdXBjYXAnOidcXHUyQTQ2JywnQ3VwQ2FwJzonXFx1MjI0RCcsJ2N1cGN1cCc6J1xcdTJBNEEnLCdjdXBkb3QnOidcXHUyMjhEJywnY3Vwb3InOidcXHUyQTQ1JywnY3Vwcyc6J1xcdTIyMkFcXHVGRTAwJywnY3VyYXJyJzonXFx1MjFCNycsJ2N1cmFycm0nOidcXHUyOTNDJywnY3VybHllcXByZWMnOidcXHUyMkRFJywnY3VybHllcXN1Y2MnOidcXHUyMkRGJywnY3VybHl2ZWUnOidcXHUyMkNFJywnY3VybHl3ZWRnZSc6J1xcdTIyQ0YnLCdjdXJyZW4nOidcXHhBNCcsJ2N1cnZlYXJyb3dsZWZ0JzonXFx1MjFCNicsJ2N1cnZlYXJyb3dyaWdodCc6J1xcdTIxQjcnLCdjdXZlZSc6J1xcdTIyQ0UnLCdjdXdlZCc6J1xcdTIyQ0YnLCdjd2NvbmludCc6J1xcdTIyMzInLCdjd2ludCc6J1xcdTIyMzEnLCdjeWxjdHknOidcXHUyMzJEJywnZGFnZ2VyJzonXFx1MjAyMCcsJ0RhZ2dlcic6J1xcdTIwMjEnLCdkYWxldGgnOidcXHUyMTM4JywnZGFycic6J1xcdTIxOTMnLCdkQXJyJzonXFx1MjFEMycsJ0RhcnInOidcXHUyMUExJywnZGFzaCc6J1xcdTIwMTAnLCdkYXNodic6J1xcdTIyQTMnLCdEYXNodic6J1xcdTJBRTQnLCdkYmthcm93JzonXFx1MjkwRicsJ2RibGFjJzonXFx1MDJERCcsJ2RjYXJvbic6J1xcdTAxMEYnLCdEY2Fyb24nOidcXHUwMTBFJywnZGN5JzonXFx1MDQzNCcsJ0RjeSc6J1xcdTA0MTQnLCdkZCc6J1xcdTIxNDYnLCdERCc6J1xcdTIxNDUnLCdkZGFnZ2VyJzonXFx1MjAyMScsJ2RkYXJyJzonXFx1MjFDQScsJ0REb3RyYWhkJzonXFx1MjkxMScsJ2Rkb3RzZXEnOidcXHUyQTc3JywnZGVnJzonXFx4QjAnLCdEZWwnOidcXHUyMjA3JywnZGVsdGEnOidcXHUwM0I0JywnRGVsdGEnOidcXHUwMzk0JywnZGVtcHR5dic6J1xcdTI5QjEnLCdkZmlzaHQnOidcXHUyOTdGJywnZGZyJzonXFx1RDgzNVxcdUREMjEnLCdEZnInOidcXHVEODM1XFx1REQwNycsJ2RIYXInOidcXHUyOTY1JywnZGhhcmwnOidcXHUyMUMzJywnZGhhcnInOidcXHUyMUMyJywnRGlhY3JpdGljYWxBY3V0ZSc6J1xceEI0JywnRGlhY3JpdGljYWxEb3QnOidcXHUwMkQ5JywnRGlhY3JpdGljYWxEb3VibGVBY3V0ZSc6J1xcdTAyREQnLCdEaWFjcml0aWNhbEdyYXZlJzonYCcsJ0RpYWNyaXRpY2FsVGlsZGUnOidcXHUwMkRDJywnZGlhbSc6J1xcdTIyQzQnLCdkaWFtb25kJzonXFx1MjJDNCcsJ0RpYW1vbmQnOidcXHUyMkM0JywnZGlhbW9uZHN1aXQnOidcXHUyNjY2JywnZGlhbXMnOidcXHUyNjY2JywnZGllJzonXFx4QTgnLCdEaWZmZXJlbnRpYWxEJzonXFx1MjE0NicsJ2RpZ2FtbWEnOidcXHUwM0REJywnZGlzaW4nOidcXHUyMkYyJywnZGl2JzonXFx4RjcnLCdkaXZpZGUnOidcXHhGNycsJ2RpdmlkZW9udGltZXMnOidcXHUyMkM3JywnZGl2b254JzonXFx1MjJDNycsJ2RqY3knOidcXHUwNDUyJywnREpjeSc6J1xcdTA0MDInLCdkbGNvcm4nOidcXHUyMzFFJywnZGxjcm9wJzonXFx1MjMwRCcsJ2RvbGxhcic6JyQnLCdkb3BmJzonXFx1RDgzNVxcdURENTUnLCdEb3BmJzonXFx1RDgzNVxcdUREM0InLCdkb3QnOidcXHUwMkQ5JywnRG90JzonXFx4QTgnLCdEb3REb3QnOidcXHUyMERDJywnZG90ZXEnOidcXHUyMjUwJywnZG90ZXFkb3QnOidcXHUyMjUxJywnRG90RXF1YWwnOidcXHUyMjUwJywnZG90bWludXMnOidcXHUyMjM4JywnZG90cGx1cyc6J1xcdTIyMTQnLCdkb3RzcXVhcmUnOidcXHUyMkExJywnZG91YmxlYmFyd2VkZ2UnOidcXHUyMzA2JywnRG91YmxlQ29udG91ckludGVncmFsJzonXFx1MjIyRicsJ0RvdWJsZURvdCc6J1xceEE4JywnRG91YmxlRG93bkFycm93JzonXFx1MjFEMycsJ0RvdWJsZUxlZnRBcnJvdyc6J1xcdTIxRDAnLCdEb3VibGVMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxRDQnLCdEb3VibGVMZWZ0VGVlJzonXFx1MkFFNCcsJ0RvdWJsZUxvbmdMZWZ0QXJyb3cnOidcXHUyN0Y4JywnRG91YmxlTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGQScsJ0RvdWJsZUxvbmdSaWdodEFycm93JzonXFx1MjdGOScsJ0RvdWJsZVJpZ2h0QXJyb3cnOidcXHUyMUQyJywnRG91YmxlUmlnaHRUZWUnOidcXHUyMkE4JywnRG91YmxlVXBBcnJvdyc6J1xcdTIxRDEnLCdEb3VibGVVcERvd25BcnJvdyc6J1xcdTIxRDUnLCdEb3VibGVWZXJ0aWNhbEJhcic6J1xcdTIyMjUnLCdkb3duYXJyb3cnOidcXHUyMTkzJywnRG93bmFycm93JzonXFx1MjFEMycsJ0Rvd25BcnJvdyc6J1xcdTIxOTMnLCdEb3duQXJyb3dCYXInOidcXHUyOTEzJywnRG93bkFycm93VXBBcnJvdyc6J1xcdTIxRjUnLCdEb3duQnJldmUnOidcXHUwMzExJywnZG93bmRvd25hcnJvd3MnOidcXHUyMUNBJywnZG93bmhhcnBvb25sZWZ0JzonXFx1MjFDMycsJ2Rvd25oYXJwb29ucmlnaHQnOidcXHUyMUMyJywnRG93bkxlZnRSaWdodFZlY3Rvcic6J1xcdTI5NTAnLCdEb3duTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUUnLCdEb3duTGVmdFZlY3Rvcic6J1xcdTIxQkQnLCdEb3duTGVmdFZlY3RvckJhcic6J1xcdTI5NTYnLCdEb3duUmlnaHRUZWVWZWN0b3InOidcXHUyOTVGJywnRG93blJpZ2h0VmVjdG9yJzonXFx1MjFDMScsJ0Rvd25SaWdodFZlY3RvckJhcic6J1xcdTI5NTcnLCdEb3duVGVlJzonXFx1MjJBNCcsJ0Rvd25UZWVBcnJvdyc6J1xcdTIxQTcnLCdkcmJrYXJvdyc6J1xcdTI5MTAnLCdkcmNvcm4nOidcXHUyMzFGJywnZHJjcm9wJzonXFx1MjMwQycsJ2RzY3InOidcXHVEODM1XFx1RENCOScsJ0RzY3InOidcXHVEODM1XFx1REM5RicsJ2RzY3knOidcXHUwNDU1JywnRFNjeSc6J1xcdTA0MDUnLCdkc29sJzonXFx1MjlGNicsJ2RzdHJvayc6J1xcdTAxMTEnLCdEc3Ryb2snOidcXHUwMTEwJywnZHRkb3QnOidcXHUyMkYxJywnZHRyaSc6J1xcdTI1QkYnLCdkdHJpZic6J1xcdTI1QkUnLCdkdWFycic6J1xcdTIxRjUnLCdkdWhhcic6J1xcdTI5NkYnLCdkd2FuZ2xlJzonXFx1MjlBNicsJ2R6Y3knOidcXHUwNDVGJywnRFpjeSc6J1xcdTA0MEYnLCdkemlncmFycic6J1xcdTI3RkYnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWFzdGVyJzonXFx1MkE2RScsJ2VjYXJvbic6J1xcdTAxMUInLCdFY2Fyb24nOidcXHUwMTFBJywnZWNpcic6J1xcdTIyNTYnLCdlY2lyYyc6J1xceEVBJywnRWNpcmMnOidcXHhDQScsJ2Vjb2xvbic6J1xcdTIyNTUnLCdlY3knOidcXHUwNDREJywnRWN5JzonXFx1MDQyRCcsJ2VERG90JzonXFx1MkE3NycsJ2Vkb3QnOidcXHUwMTE3JywnZURvdCc6J1xcdTIyNTEnLCdFZG90JzonXFx1MDExNicsJ2VlJzonXFx1MjE0NycsJ2VmRG90JzonXFx1MjI1MicsJ2Vmcic6J1xcdUQ4MzVcXHVERDIyJywnRWZyJzonXFx1RDgzNVxcdUREMDgnLCdlZyc6J1xcdTJBOUEnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZWdzJzonXFx1MkE5NicsJ2Vnc2RvdCc6J1xcdTJBOTgnLCdlbCc6J1xcdTJBOTknLCdFbGVtZW50JzonXFx1MjIwOCcsJ2VsaW50ZXJzJzonXFx1MjNFNycsJ2VsbCc6J1xcdTIxMTMnLCdlbHMnOidcXHUyQTk1JywnZWxzZG90JzonXFx1MkE5NycsJ2VtYWNyJzonXFx1MDExMycsJ0VtYWNyJzonXFx1MDExMicsJ2VtcHR5JzonXFx1MjIwNScsJ2VtcHR5c2V0JzonXFx1MjIwNScsJ0VtcHR5U21hbGxTcXVhcmUnOidcXHUyNUZCJywnZW1wdHl2JzonXFx1MjIwNScsJ0VtcHR5VmVyeVNtYWxsU3F1YXJlJzonXFx1MjVBQicsJ2Vtc3AnOidcXHUyMDAzJywnZW1zcDEzJzonXFx1MjAwNCcsJ2Vtc3AxNCc6J1xcdTIwMDUnLCdlbmcnOidcXHUwMTRCJywnRU5HJzonXFx1MDE0QScsJ2Vuc3AnOidcXHUyMDAyJywnZW9nb24nOidcXHUwMTE5JywnRW9nb24nOidcXHUwMTE4JywnZW9wZic6J1xcdUQ4MzVcXHVERDU2JywnRW9wZic6J1xcdUQ4MzVcXHVERDNDJywnZXBhcic6J1xcdTIyRDUnLCdlcGFyc2wnOidcXHUyOUUzJywnZXBsdXMnOidcXHUyQTcxJywnZXBzaSc6J1xcdTAzQjUnLCdlcHNpbG9uJzonXFx1MDNCNScsJ0Vwc2lsb24nOidcXHUwMzk1JywnZXBzaXYnOidcXHUwM0Y1JywnZXFjaXJjJzonXFx1MjI1NicsJ2VxY29sb24nOidcXHUyMjU1JywnZXFzaW0nOidcXHUyMjQyJywnZXFzbGFudGd0cic6J1xcdTJBOTYnLCdlcXNsYW50bGVzcyc6J1xcdTJBOTUnLCdFcXVhbCc6J1xcdTJBNzUnLCdlcXVhbHMnOic9JywnRXF1YWxUaWxkZSc6J1xcdTIyNDInLCdlcXVlc3QnOidcXHUyMjVGJywnRXF1aWxpYnJpdW0nOidcXHUyMUNDJywnZXF1aXYnOidcXHUyMjYxJywnZXF1aXZERCc6J1xcdTJBNzgnLCdlcXZwYXJzbCc6J1xcdTI5RTUnLCdlcmFycic6J1xcdTI5NzEnLCdlckRvdCc6J1xcdTIyNTMnLCdlc2NyJzonXFx1MjEyRicsJ0VzY3InOidcXHUyMTMwJywnZXNkb3QnOidcXHUyMjUwJywnZXNpbSc6J1xcdTIyNDInLCdFc2ltJzonXFx1MkE3MycsJ2V0YSc6J1xcdTAzQjcnLCdFdGEnOidcXHUwMzk3JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2V1cm8nOidcXHUyMEFDJywnZXhjbCc6JyEnLCdleGlzdCc6J1xcdTIyMDMnLCdFeGlzdHMnOidcXHUyMjAzJywnZXhwZWN0YXRpb24nOidcXHUyMTMwJywnZXhwb25lbnRpYWxlJzonXFx1MjE0NycsJ0V4cG9uZW50aWFsRSc6J1xcdTIxNDcnLCdmYWxsaW5nZG90c2VxJzonXFx1MjI1MicsJ2ZjeSc6J1xcdTA0NDQnLCdGY3knOidcXHUwNDI0JywnZmVtYWxlJzonXFx1MjY0MCcsJ2ZmaWxpZyc6J1xcdUZCMDMnLCdmZmxpZyc6J1xcdUZCMDAnLCdmZmxsaWcnOidcXHVGQjA0JywnZmZyJzonXFx1RDgzNVxcdUREMjMnLCdGZnInOidcXHVEODM1XFx1REQwOScsJ2ZpbGlnJzonXFx1RkIwMScsJ0ZpbGxlZFNtYWxsU3F1YXJlJzonXFx1MjVGQycsJ0ZpbGxlZFZlcnlTbWFsbFNxdWFyZSc6J1xcdTI1QUEnLCdmamxpZyc6J2ZqJywnZmxhdCc6J1xcdTI2NkQnLCdmbGxpZyc6J1xcdUZCMDInLCdmbHRucyc6J1xcdTI1QjEnLCdmbm9mJzonXFx1MDE5MicsJ2ZvcGYnOidcXHVEODM1XFx1REQ1NycsJ0ZvcGYnOidcXHVEODM1XFx1REQzRCcsJ2ZvcmFsbCc6J1xcdTIyMDAnLCdGb3JBbGwnOidcXHUyMjAwJywnZm9yayc6J1xcdTIyRDQnLCdmb3Jrdic6J1xcdTJBRDknLCdGb3VyaWVydHJmJzonXFx1MjEzMScsJ2ZwYXJ0aW50JzonXFx1MkEwRCcsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzEzJzonXFx1MjE1MycsJ2ZyYWMxNCc6J1xceEJDJywnZnJhYzE1JzonXFx1MjE1NScsJ2ZyYWMxNic6J1xcdTIxNTknLCdmcmFjMTgnOidcXHUyMTVCJywnZnJhYzIzJzonXFx1MjE1NCcsJ2ZyYWMyNSc6J1xcdTIxNTYnLCdmcmFjMzQnOidcXHhCRScsJ2ZyYWMzNSc6J1xcdTIxNTcnLCdmcmFjMzgnOidcXHUyMTVDJywnZnJhYzQ1JzonXFx1MjE1OCcsJ2ZyYWM1Nic6J1xcdTIxNUEnLCdmcmFjNTgnOidcXHUyMTVEJywnZnJhYzc4JzonXFx1MjE1RScsJ2ZyYXNsJzonXFx1MjA0NCcsJ2Zyb3duJzonXFx1MjMyMicsJ2ZzY3InOidcXHVEODM1XFx1RENCQicsJ0ZzY3InOidcXHUyMTMxJywnZ2FjdXRlJzonXFx1MDFGNScsJ2dhbW1hJzonXFx1MDNCMycsJ0dhbW1hJzonXFx1MDM5MycsJ2dhbW1hZCc6J1xcdTAzREQnLCdHYW1tYWQnOidcXHUwM0RDJywnZ2FwJzonXFx1MkE4NicsJ2dicmV2ZSc6J1xcdTAxMUYnLCdHYnJldmUnOidcXHUwMTFFJywnR2NlZGlsJzonXFx1MDEyMicsJ2djaXJjJzonXFx1MDExRCcsJ0djaXJjJzonXFx1MDExQycsJ2djeSc6J1xcdTA0MzMnLCdHY3knOidcXHUwNDEzJywnZ2RvdCc6J1xcdTAxMjEnLCdHZG90JzonXFx1MDEyMCcsJ2dlJzonXFx1MjI2NScsJ2dFJzonXFx1MjI2NycsJ2dlbCc6J1xcdTIyREInLCdnRWwnOidcXHUyQThDJywnZ2VxJzonXFx1MjI2NScsJ2dlcXEnOidcXHUyMjY3JywnZ2Vxc2xhbnQnOidcXHUyQTdFJywnZ2VzJzonXFx1MkE3RScsJ2dlc2NjJzonXFx1MkFBOScsJ2dlc2RvdCc6J1xcdTJBODAnLCdnZXNkb3RvJzonXFx1MkE4MicsJ2dlc2RvdG9sJzonXFx1MkE4NCcsJ2dlc2wnOidcXHUyMkRCXFx1RkUwMCcsJ2dlc2xlcyc6J1xcdTJBOTQnLCdnZnInOidcXHVEODM1XFx1REQyNCcsJ0dmcic6J1xcdUQ4MzVcXHVERDBBJywnZ2cnOidcXHUyMjZCJywnR2cnOidcXHUyMkQ5JywnZ2dnJzonXFx1MjJEOScsJ2dpbWVsJzonXFx1MjEzNycsJ2dqY3knOidcXHUwNDUzJywnR0pjeSc6J1xcdTA0MDMnLCdnbCc6J1xcdTIyNzcnLCdnbGEnOidcXHUyQUE1JywnZ2xFJzonXFx1MkE5MicsJ2dsaic6J1xcdTJBQTQnLCdnbmFwJzonXFx1MkE4QScsJ2duYXBwcm94JzonXFx1MkE4QScsJ2duZSc6J1xcdTJBODgnLCdnbkUnOidcXHUyMjY5JywnZ25lcSc6J1xcdTJBODgnLCdnbmVxcSc6J1xcdTIyNjknLCdnbnNpbSc6J1xcdTIyRTcnLCdnb3BmJzonXFx1RDgzNVxcdURENTgnLCdHb3BmJzonXFx1RDgzNVxcdUREM0UnLCdncmF2ZSc6J2AnLCdHcmVhdGVyRXF1YWwnOidcXHUyMjY1JywnR3JlYXRlckVxdWFsTGVzcyc6J1xcdTIyREInLCdHcmVhdGVyRnVsbEVxdWFsJzonXFx1MjI2NycsJ0dyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMicsJ0dyZWF0ZXJMZXNzJzonXFx1MjI3NycsJ0dyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RScsJ0dyZWF0ZXJUaWxkZSc6J1xcdTIyNzMnLCdnc2NyJzonXFx1MjEwQScsJ0dzY3InOidcXHVEODM1XFx1RENBMicsJ2dzaW0nOidcXHUyMjczJywnZ3NpbWUnOidcXHUyQThFJywnZ3NpbWwnOidcXHUyQTkwJywnZ3QnOic+JywnR3QnOidcXHUyMjZCJywnR1QnOic+JywnZ3RjYyc6J1xcdTJBQTcnLCdndGNpcic6J1xcdTJBN0EnLCdndGRvdCc6J1xcdTIyRDcnLCdndGxQYXInOidcXHUyOTk1JywnZ3RxdWVzdCc6J1xcdTJBN0MnLCdndHJhcHByb3gnOidcXHUyQTg2JywnZ3RyYXJyJzonXFx1Mjk3OCcsJ2d0cmRvdCc6J1xcdTIyRDcnLCdndHJlcWxlc3MnOidcXHUyMkRCJywnZ3RyZXFxbGVzcyc6J1xcdTJBOEMnLCdndHJsZXNzJzonXFx1MjI3NycsJ2d0cnNpbSc6J1xcdTIyNzMnLCdndmVydG5lcXEnOidcXHUyMjY5XFx1RkUwMCcsJ2d2bkUnOidcXHUyMjY5XFx1RkUwMCcsJ0hhY2VrJzonXFx1MDJDNycsJ2hhaXJzcCc6J1xcdTIwMEEnLCdoYWxmJzonXFx4QkQnLCdoYW1pbHQnOidcXHUyMTBCJywnaGFyZGN5JzonXFx1MDQ0QScsJ0hBUkRjeSc6J1xcdTA0MkEnLCdoYXJyJzonXFx1MjE5NCcsJ2hBcnInOidcXHUyMUQ0JywnaGFycmNpcic6J1xcdTI5NDgnLCdoYXJydyc6J1xcdTIxQUQnLCdIYXQnOideJywnaGJhcic6J1xcdTIxMEYnLCdoY2lyYyc6J1xcdTAxMjUnLCdIY2lyYyc6J1xcdTAxMjQnLCdoZWFydHMnOidcXHUyNjY1JywnaGVhcnRzdWl0JzonXFx1MjY2NScsJ2hlbGxpcCc6J1xcdTIwMjYnLCdoZXJjb24nOidcXHUyMkI5JywnaGZyJzonXFx1RDgzNVxcdUREMjUnLCdIZnInOidcXHUyMTBDJywnSGlsYmVydFNwYWNlJzonXFx1MjEwQicsJ2hrc2Vhcm93JzonXFx1MjkyNScsJ2hrc3dhcm93JzonXFx1MjkyNicsJ2hvYXJyJzonXFx1MjFGRicsJ2hvbXRodCc6J1xcdTIyM0InLCdob29rbGVmdGFycm93JzonXFx1MjFBOScsJ2hvb2tyaWdodGFycm93JzonXFx1MjFBQScsJ2hvcGYnOidcXHVEODM1XFx1REQ1OScsJ0hvcGYnOidcXHUyMTBEJywnaG9yYmFyJzonXFx1MjAxNScsJ0hvcml6b250YWxMaW5lJzonXFx1MjUwMCcsJ2hzY3InOidcXHVEODM1XFx1RENCRCcsJ0hzY3InOidcXHUyMTBCJywnaHNsYXNoJzonXFx1MjEwRicsJ2hzdHJvayc6J1xcdTAxMjcnLCdIc3Ryb2snOidcXHUwMTI2JywnSHVtcERvd25IdW1wJzonXFx1MjI0RScsJ0h1bXBFcXVhbCc6J1xcdTIyNEYnLCdoeWJ1bGwnOidcXHUyMDQzJywnaHlwaGVuJzonXFx1MjAxMCcsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpYyc6J1xcdTIwNjMnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2ljeSc6J1xcdTA0MzgnLCdJY3knOidcXHUwNDE4JywnSWRvdCc6J1xcdTAxMzAnLCdpZWN5JzonXFx1MDQzNScsJ0lFY3knOidcXHUwNDE1JywnaWV4Y2wnOidcXHhBMScsJ2lmZic6J1xcdTIxRDQnLCdpZnInOidcXHVEODM1XFx1REQyNicsJ0lmcic6J1xcdTIxMTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaWknOidcXHUyMTQ4JywnaWlpaW50JzonXFx1MkEwQycsJ2lpaW50JzonXFx1MjIyRCcsJ2lpbmZpbic6J1xcdTI5REMnLCdpaW90YSc6J1xcdTIxMjknLCdpamxpZyc6J1xcdTAxMzMnLCdJSmxpZyc6J1xcdTAxMzInLCdJbSc6J1xcdTIxMTEnLCdpbWFjcic6J1xcdTAxMkInLCdJbWFjcic6J1xcdTAxMkEnLCdpbWFnZSc6J1xcdTIxMTEnLCdJbWFnaW5hcnlJJzonXFx1MjE0OCcsJ2ltYWdsaW5lJzonXFx1MjExMCcsJ2ltYWdwYXJ0JzonXFx1MjExMScsJ2ltYXRoJzonXFx1MDEzMScsJ2ltb2YnOidcXHUyMkI3JywnaW1wZWQnOidcXHUwMUI1JywnSW1wbGllcyc6J1xcdTIxRDInLCdpbic6J1xcdTIyMDgnLCdpbmNhcmUnOidcXHUyMTA1JywnaW5maW4nOidcXHUyMjFFJywnaW5maW50aWUnOidcXHUyOUREJywnaW5vZG90JzonXFx1MDEzMScsJ2ludCc6J1xcdTIyMkInLCdJbnQnOidcXHUyMjJDJywnaW50Y2FsJzonXFx1MjJCQScsJ2ludGVnZXJzJzonXFx1MjEyNCcsJ0ludGVncmFsJzonXFx1MjIyQicsJ2ludGVyY2FsJzonXFx1MjJCQScsJ0ludGVyc2VjdGlvbic6J1xcdTIyQzInLCdpbnRsYXJoayc6J1xcdTJBMTcnLCdpbnRwcm9kJzonXFx1MkEzQycsJ0ludmlzaWJsZUNvbW1hJzonXFx1MjA2MycsJ0ludmlzaWJsZVRpbWVzJzonXFx1MjA2MicsJ2lvY3knOidcXHUwNDUxJywnSU9jeSc6J1xcdTA0MDEnLCdpb2dvbic6J1xcdTAxMkYnLCdJb2dvbic6J1xcdTAxMkUnLCdpb3BmJzonXFx1RDgzNVxcdURENUEnLCdJb3BmJzonXFx1RDgzNVxcdURENDAnLCdpb3RhJzonXFx1MDNCOScsJ0lvdGEnOidcXHUwMzk5JywnaXByb2QnOidcXHUyQTNDJywnaXF1ZXN0JzonXFx4QkYnLCdpc2NyJzonXFx1RDgzNVxcdURDQkUnLCdJc2NyJzonXFx1MjExMCcsJ2lzaW4nOidcXHUyMjA4JywnaXNpbmRvdCc6J1xcdTIyRjUnLCdpc2luRSc6J1xcdTIyRjknLCdpc2lucyc6J1xcdTIyRjQnLCdpc2luc3YnOidcXHUyMkYzJywnaXNpbnYnOidcXHUyMjA4JywnaXQnOidcXHUyMDYyJywnaXRpbGRlJzonXFx1MDEyOScsJ0l0aWxkZSc6J1xcdTAxMjgnLCdpdWtjeSc6J1xcdTA0NTYnLCdJdWtjeSc6J1xcdTA0MDYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdqY2lyYyc6J1xcdTAxMzUnLCdKY2lyYyc6J1xcdTAxMzQnLCdqY3knOidcXHUwNDM5JywnSmN5JzonXFx1MDQxOScsJ2pmcic6J1xcdUQ4MzVcXHVERDI3JywnSmZyJzonXFx1RDgzNVxcdUREMEQnLCdqbWF0aCc6J1xcdTAyMzcnLCdqb3BmJzonXFx1RDgzNVxcdURENUInLCdKb3BmJzonXFx1RDgzNVxcdURENDEnLCdqc2NyJzonXFx1RDgzNVxcdURDQkYnLCdKc2NyJzonXFx1RDgzNVxcdURDQTUnLCdqc2VyY3knOidcXHUwNDU4JywnSnNlcmN5JzonXFx1MDQwOCcsJ2p1a2N5JzonXFx1MDQ1NCcsJ0p1a2N5JzonXFx1MDQwNCcsJ2thcHBhJzonXFx1MDNCQScsJ0thcHBhJzonXFx1MDM5QScsJ2thcHBhdic6J1xcdTAzRjAnLCdrY2VkaWwnOidcXHUwMTM3JywnS2NlZGlsJzonXFx1MDEzNicsJ2tjeSc6J1xcdTA0M0EnLCdLY3knOidcXHUwNDFBJywna2ZyJzonXFx1RDgzNVxcdUREMjgnLCdLZnInOidcXHVEODM1XFx1REQwRScsJ2tncmVlbic6J1xcdTAxMzgnLCdraGN5JzonXFx1MDQ0NScsJ0tIY3knOidcXHUwNDI1Jywna2pjeSc6J1xcdTA0NUMnLCdLSmN5JzonXFx1MDQwQycsJ2tvcGYnOidcXHVEODM1XFx1REQ1QycsJ0tvcGYnOidcXHVEODM1XFx1REQ0MicsJ2tzY3InOidcXHVEODM1XFx1RENDMCcsJ0tzY3InOidcXHVEODM1XFx1RENBNicsJ2xBYXJyJzonXFx1MjFEQScsJ2xhY3V0ZSc6J1xcdTAxM0EnLCdMYWN1dGUnOidcXHUwMTM5JywnbGFlbXB0eXYnOidcXHUyOUI0JywnbGFncmFuJzonXFx1MjExMicsJ2xhbWJkYSc6J1xcdTAzQkInLCdMYW1iZGEnOidcXHUwMzlCJywnbGFuZyc6J1xcdTI3RTgnLCdMYW5nJzonXFx1MjdFQScsJ2xhbmdkJzonXFx1Mjk5MScsJ2xhbmdsZSc6J1xcdTI3RTgnLCdsYXAnOidcXHUyQTg1JywnTGFwbGFjZXRyZic6J1xcdTIxMTInLCdsYXF1byc6J1xceEFCJywnbGFycic6J1xcdTIxOTAnLCdsQXJyJzonXFx1MjFEMCcsJ0xhcnInOidcXHUyMTlFJywnbGFycmInOidcXHUyMUU0JywnbGFycmJmcyc6J1xcdTI5MUYnLCdsYXJyZnMnOidcXHUyOTFEJywnbGFycmhrJzonXFx1MjFBOScsJ2xhcnJscCc6J1xcdTIxQUInLCdsYXJycGwnOidcXHUyOTM5JywnbGFycnNpbSc6J1xcdTI5NzMnLCdsYXJydGwnOidcXHUyMUEyJywnbGF0JzonXFx1MkFBQicsJ2xhdGFpbCc6J1xcdTI5MTknLCdsQXRhaWwnOidcXHUyOTFCJywnbGF0ZSc6J1xcdTJBQUQnLCdsYXRlcyc6J1xcdTJBQURcXHVGRTAwJywnbGJhcnInOidcXHUyOTBDJywnbEJhcnInOidcXHUyOTBFJywnbGJicmsnOidcXHUyNzcyJywnbGJyYWNlJzoneycsJ2xicmFjayc6J1snLCdsYnJrZSc6J1xcdTI5OEInLCdsYnJrc2xkJzonXFx1Mjk4RicsJ2xicmtzbHUnOidcXHUyOThEJywnbGNhcm9uJzonXFx1MDEzRScsJ0xjYXJvbic6J1xcdTAxM0QnLCdsY2VkaWwnOidcXHUwMTNDJywnTGNlZGlsJzonXFx1MDEzQicsJ2xjZWlsJzonXFx1MjMwOCcsJ2xjdWInOid7JywnbGN5JzonXFx1MDQzQicsJ0xjeSc6J1xcdTA0MUInLCdsZGNhJzonXFx1MjkzNicsJ2xkcXVvJzonXFx1MjAxQycsJ2xkcXVvcic6J1xcdTIwMUUnLCdsZHJkaGFyJzonXFx1Mjk2NycsJ2xkcnVzaGFyJzonXFx1Mjk0QicsJ2xkc2gnOidcXHUyMUIyJywnbGUnOidcXHUyMjY0JywnbEUnOidcXHUyMjY2JywnTGVmdEFuZ2xlQnJhY2tldCc6J1xcdTI3RTgnLCdsZWZ0YXJyb3cnOidcXHUyMTkwJywnTGVmdGFycm93JzonXFx1MjFEMCcsJ0xlZnRBcnJvdyc6J1xcdTIxOTAnLCdMZWZ0QXJyb3dCYXInOidcXHUyMUU0JywnTGVmdEFycm93UmlnaHRBcnJvdyc6J1xcdTIxQzYnLCdsZWZ0YXJyb3d0YWlsJzonXFx1MjFBMicsJ0xlZnRDZWlsaW5nJzonXFx1MjMwOCcsJ0xlZnREb3VibGVCcmFja2V0JzonXFx1MjdFNicsJ0xlZnREb3duVGVlVmVjdG9yJzonXFx1Mjk2MScsJ0xlZnREb3duVmVjdG9yJzonXFx1MjFDMycsJ0xlZnREb3duVmVjdG9yQmFyJzonXFx1Mjk1OScsJ0xlZnRGbG9vcic6J1xcdTIzMEEnLCdsZWZ0aGFycG9vbmRvd24nOidcXHUyMUJEJywnbGVmdGhhcnBvb251cCc6J1xcdTIxQkMnLCdsZWZ0bGVmdGFycm93cyc6J1xcdTIxQzcnLCdsZWZ0cmlnaHRhcnJvdyc6J1xcdTIxOTQnLCdMZWZ0cmlnaHRhcnJvdyc6J1xcdTIxRDQnLCdMZWZ0UmlnaHRBcnJvdyc6J1xcdTIxOTQnLCdsZWZ0cmlnaHRhcnJvd3MnOidcXHUyMUM2JywnbGVmdHJpZ2h0aGFycG9vbnMnOidcXHUyMUNCJywnbGVmdHJpZ2h0c3F1aWdhcnJvdyc6J1xcdTIxQUQnLCdMZWZ0UmlnaHRWZWN0b3InOidcXHUyOTRFJywnTGVmdFRlZSc6J1xcdTIyQTMnLCdMZWZ0VGVlQXJyb3cnOidcXHUyMUE0JywnTGVmdFRlZVZlY3Rvcic6J1xcdTI5NUEnLCdsZWZ0dGhyZWV0aW1lcyc6J1xcdTIyQ0InLCdMZWZ0VHJpYW5nbGUnOidcXHUyMkIyJywnTGVmdFRyaWFuZ2xlQmFyJzonXFx1MjlDRicsJ0xlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJCNCcsJ0xlZnRVcERvd25WZWN0b3InOidcXHUyOTUxJywnTGVmdFVwVGVlVmVjdG9yJzonXFx1Mjk2MCcsJ0xlZnRVcFZlY3Rvcic6J1xcdTIxQkYnLCdMZWZ0VXBWZWN0b3JCYXInOidcXHUyOTU4JywnTGVmdFZlY3Rvcic6J1xcdTIxQkMnLCdMZWZ0VmVjdG9yQmFyJzonXFx1Mjk1MicsJ2xlZyc6J1xcdTIyREEnLCdsRWcnOidcXHUyQThCJywnbGVxJzonXFx1MjI2NCcsJ2xlcXEnOidcXHUyMjY2JywnbGVxc2xhbnQnOidcXHUyQTdEJywnbGVzJzonXFx1MkE3RCcsJ2xlc2NjJzonXFx1MkFBOCcsJ2xlc2RvdCc6J1xcdTJBN0YnLCdsZXNkb3RvJzonXFx1MkE4MScsJ2xlc2RvdG9yJzonXFx1MkE4MycsJ2xlc2cnOidcXHUyMkRBXFx1RkUwMCcsJ2xlc2dlcyc6J1xcdTJBOTMnLCdsZXNzYXBwcm94JzonXFx1MkE4NScsJ2xlc3Nkb3QnOidcXHUyMkQ2JywnbGVzc2VxZ3RyJzonXFx1MjJEQScsJ2xlc3NlcXFndHInOidcXHUyQThCJywnTGVzc0VxdWFsR3JlYXRlcic6J1xcdTIyREEnLCdMZXNzRnVsbEVxdWFsJzonXFx1MjI2NicsJ0xlc3NHcmVhdGVyJzonXFx1MjI3NicsJ2xlc3NndHInOidcXHUyMjc2JywnTGVzc0xlc3MnOidcXHUyQUExJywnbGVzc3NpbSc6J1xcdTIyNzInLCdMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0QnLCdMZXNzVGlsZGUnOidcXHUyMjcyJywnbGZpc2h0JzonXFx1Mjk3QycsJ2xmbG9vcic6J1xcdTIzMEEnLCdsZnInOidcXHVEODM1XFx1REQyOScsJ0xmcic6J1xcdUQ4MzVcXHVERDBGJywnbGcnOidcXHUyMjc2JywnbGdFJzonXFx1MkE5MScsJ2xIYXInOidcXHUyOTYyJywnbGhhcmQnOidcXHUyMUJEJywnbGhhcnUnOidcXHUyMUJDJywnbGhhcnVsJzonXFx1Mjk2QScsJ2xoYmxrJzonXFx1MjU4NCcsJ2xqY3knOidcXHUwNDU5JywnTEpjeSc6J1xcdTA0MDknLCdsbCc6J1xcdTIyNkEnLCdMbCc6J1xcdTIyRDgnLCdsbGFycic6J1xcdTIxQzcnLCdsbGNvcm5lcic6J1xcdTIzMUUnLCdMbGVmdGFycm93JzonXFx1MjFEQScsJ2xsaGFyZCc6J1xcdTI5NkInLCdsbHRyaSc6J1xcdTI1RkEnLCdsbWlkb3QnOidcXHUwMTQwJywnTG1pZG90JzonXFx1MDEzRicsJ2xtb3VzdCc6J1xcdTIzQjAnLCdsbW91c3RhY2hlJzonXFx1MjNCMCcsJ2xuYXAnOidcXHUyQTg5JywnbG5hcHByb3gnOidcXHUyQTg5JywnbG5lJzonXFx1MkE4NycsJ2xuRSc6J1xcdTIyNjgnLCdsbmVxJzonXFx1MkE4NycsJ2xuZXFxJzonXFx1MjI2OCcsJ2xuc2ltJzonXFx1MjJFNicsJ2xvYW5nJzonXFx1MjdFQycsJ2xvYXJyJzonXFx1MjFGRCcsJ2xvYnJrJzonXFx1MjdFNicsJ2xvbmdsZWZ0YXJyb3cnOidcXHUyN0Y1JywnTG9uZ2xlZnRhcnJvdyc6J1xcdTI3RjgnLCdMb25nTGVmdEFycm93JzonXFx1MjdGNScsJ2xvbmdsZWZ0cmlnaHRhcnJvdyc6J1xcdTI3RjcnLCdMb25nbGVmdHJpZ2h0YXJyb3cnOidcXHUyN0ZBJywnTG9uZ0xlZnRSaWdodEFycm93JzonXFx1MjdGNycsJ2xvbmdtYXBzdG8nOidcXHUyN0ZDJywnbG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y2JywnTG9uZ3JpZ2h0YXJyb3cnOidcXHUyN0Y5JywnTG9uZ1JpZ2h0QXJyb3cnOidcXHUyN0Y2JywnbG9vcGFycm93bGVmdCc6J1xcdTIxQUInLCdsb29wYXJyb3dyaWdodCc6J1xcdTIxQUMnLCdsb3Bhcic6J1xcdTI5ODUnLCdsb3BmJzonXFx1RDgzNVxcdURENUQnLCdMb3BmJzonXFx1RDgzNVxcdURENDMnLCdsb3BsdXMnOidcXHUyQTJEJywnbG90aW1lcyc6J1xcdTJBMzQnLCdsb3dhc3QnOidcXHUyMjE3JywnbG93YmFyJzonXycsJ0xvd2VyTGVmdEFycm93JzonXFx1MjE5OScsJ0xvd2VyUmlnaHRBcnJvdyc6J1xcdTIxOTgnLCdsb3onOidcXHUyNUNBJywnbG96ZW5nZSc6J1xcdTI1Q0EnLCdsb3pmJzonXFx1MjlFQicsJ2xwYXInOicoJywnbHBhcmx0JzonXFx1Mjk5MycsJ2xyYXJyJzonXFx1MjFDNicsJ2xyY29ybmVyJzonXFx1MjMxRicsJ2xyaGFyJzonXFx1MjFDQicsJ2xyaGFyZCc6J1xcdTI5NkQnLCdscm0nOidcXHUyMDBFJywnbHJ0cmknOidcXHUyMkJGJywnbHNhcXVvJzonXFx1MjAzOScsJ2xzY3InOidcXHVEODM1XFx1RENDMScsJ0xzY3InOidcXHUyMTEyJywnbHNoJzonXFx1MjFCMCcsJ0xzaCc6J1xcdTIxQjAnLCdsc2ltJzonXFx1MjI3MicsJ2xzaW1lJzonXFx1MkE4RCcsJ2xzaW1nJzonXFx1MkE4RicsJ2xzcWInOidbJywnbHNxdW8nOidcXHUyMDE4JywnbHNxdW9yJzonXFx1MjAxQScsJ2xzdHJvayc6J1xcdTAxNDInLCdMc3Ryb2snOidcXHUwMTQxJywnbHQnOic8JywnTHQnOidcXHUyMjZBJywnTFQnOic8JywnbHRjYyc6J1xcdTJBQTYnLCdsdGNpcic6J1xcdTJBNzknLCdsdGRvdCc6J1xcdTIyRDYnLCdsdGhyZWUnOidcXHUyMkNCJywnbHRpbWVzJzonXFx1MjJDOScsJ2x0bGFycic6J1xcdTI5NzYnLCdsdHF1ZXN0JzonXFx1MkE3QicsJ2x0cmknOidcXHUyNUMzJywnbHRyaWUnOidcXHUyMkI0JywnbHRyaWYnOidcXHUyNUMyJywnbHRyUGFyJzonXFx1Mjk5NicsJ2x1cmRzaGFyJzonXFx1Mjk0QScsJ2x1cnVoYXInOidcXHUyOTY2JywnbHZlcnRuZXFxJzonXFx1MjI2OFxcdUZFMDAnLCdsdm5FJzonXFx1MjI2OFxcdUZFMDAnLCdtYWNyJzonXFx4QUYnLCdtYWxlJzonXFx1MjY0MicsJ21hbHQnOidcXHUyNzIwJywnbWFsdGVzZSc6J1xcdTI3MjAnLCdtYXAnOidcXHUyMUE2JywnTWFwJzonXFx1MjkwNScsJ21hcHN0byc6J1xcdTIxQTYnLCdtYXBzdG9kb3duJzonXFx1MjFBNycsJ21hcHN0b2xlZnQnOidcXHUyMUE0JywnbWFwc3RvdXAnOidcXHUyMUE1JywnbWFya2VyJzonXFx1MjVBRScsJ21jb21tYSc6J1xcdTJBMjknLCdtY3knOidcXHUwNDNDJywnTWN5JzonXFx1MDQxQycsJ21kYXNoJzonXFx1MjAxNCcsJ21ERG90JzonXFx1MjIzQScsJ21lYXN1cmVkYW5nbGUnOidcXHUyMjIxJywnTWVkaXVtU3BhY2UnOidcXHUyMDVGJywnTWVsbGludHJmJzonXFx1MjEzMycsJ21mcic6J1xcdUQ4MzVcXHVERDJBJywnTWZyJzonXFx1RDgzNVxcdUREMTAnLCdtaG8nOidcXHUyMTI3JywnbWljcm8nOidcXHhCNScsJ21pZCc6J1xcdTIyMjMnLCdtaWRhc3QnOicqJywnbWlkY2lyJzonXFx1MkFGMCcsJ21pZGRvdCc6J1xceEI3JywnbWludXMnOidcXHUyMjEyJywnbWludXNiJzonXFx1MjI5RicsJ21pbnVzZCc6J1xcdTIyMzgnLCdtaW51c2R1JzonXFx1MkEyQScsJ01pbnVzUGx1cyc6J1xcdTIyMTMnLCdtbGNwJzonXFx1MkFEQicsJ21sZHInOidcXHUyMDI2JywnbW5wbHVzJzonXFx1MjIxMycsJ21vZGVscyc6J1xcdTIyQTcnLCdtb3BmJzonXFx1RDgzNVxcdURENUUnLCdNb3BmJzonXFx1RDgzNVxcdURENDQnLCdtcCc6J1xcdTIyMTMnLCdtc2NyJzonXFx1RDgzNVxcdURDQzInLCdNc2NyJzonXFx1MjEzMycsJ21zdHBvcyc6J1xcdTIyM0UnLCdtdSc6J1xcdTAzQkMnLCdNdSc6J1xcdTAzOUMnLCdtdWx0aW1hcCc6J1xcdTIyQjgnLCdtdW1hcCc6J1xcdTIyQjgnLCduYWJsYSc6J1xcdTIyMDcnLCduYWN1dGUnOidcXHUwMTQ0JywnTmFjdXRlJzonXFx1MDE0MycsJ25hbmcnOidcXHUyMjIwXFx1MjBEMicsJ25hcCc6J1xcdTIyNDknLCduYXBFJzonXFx1MkE3MFxcdTAzMzgnLCduYXBpZCc6J1xcdTIyNEJcXHUwMzM4JywnbmFwb3MnOidcXHUwMTQ5JywnbmFwcHJveCc6J1xcdTIyNDknLCduYXR1cic6J1xcdTI2NkUnLCduYXR1cmFsJzonXFx1MjY2RScsJ25hdHVyYWxzJzonXFx1MjExNScsJ25ic3AnOidcXHhBMCcsJ25idW1wJzonXFx1MjI0RVxcdTAzMzgnLCduYnVtcGUnOidcXHUyMjRGXFx1MDMzOCcsJ25jYXAnOidcXHUyQTQzJywnbmNhcm9uJzonXFx1MDE0OCcsJ05jYXJvbic6J1xcdTAxNDcnLCduY2VkaWwnOidcXHUwMTQ2JywnTmNlZGlsJzonXFx1MDE0NScsJ25jb25nJzonXFx1MjI0NycsJ25jb25nZG90JzonXFx1MkE2RFxcdTAzMzgnLCduY3VwJzonXFx1MkE0MicsJ25jeSc6J1xcdTA0M0QnLCdOY3knOidcXHUwNDFEJywnbmRhc2gnOidcXHUyMDEzJywnbmUnOidcXHUyMjYwJywnbmVhcmhrJzonXFx1MjkyNCcsJ25lYXJyJzonXFx1MjE5NycsJ25lQXJyJzonXFx1MjFENycsJ25lYXJyb3cnOidcXHUyMTk3JywnbmVkb3QnOidcXHUyMjUwXFx1MDMzOCcsJ05lZ2F0aXZlTWVkaXVtU3BhY2UnOidcXHUyMDBCJywnTmVnYXRpdmVUaGlja1NwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVGhpblNwYWNlJzonXFx1MjAwQicsJ05lZ2F0aXZlVmVyeVRoaW5TcGFjZSc6J1xcdTIwMEInLCduZXF1aXYnOidcXHUyMjYyJywnbmVzZWFyJzonXFx1MjkyOCcsJ25lc2ltJzonXFx1MjI0MlxcdTAzMzgnLCdOZXN0ZWRHcmVhdGVyR3JlYXRlcic6J1xcdTIyNkInLCdOZXN0ZWRMZXNzTGVzcyc6J1xcdTIyNkEnLCdOZXdMaW5lJzonXFxuJywnbmV4aXN0JzonXFx1MjIwNCcsJ25leGlzdHMnOidcXHUyMjA0JywnbmZyJzonXFx1RDgzNVxcdUREMkInLCdOZnInOidcXHVEODM1XFx1REQxMScsJ25nZSc6J1xcdTIyNzEnLCduZ0UnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXEnOidcXHUyMjcxJywnbmdlcXEnOidcXHUyMjY3XFx1MDMzOCcsJ25nZXFzbGFudCc6J1xcdTJBN0VcXHUwMzM4Jywnbmdlcyc6J1xcdTJBN0VcXHUwMzM4JywnbkdnJzonXFx1MjJEOVxcdTAzMzgnLCduZ3NpbSc6J1xcdTIyNzUnLCduZ3QnOidcXHUyMjZGJywnbkd0JzonXFx1MjI2QlxcdTIwRDInLCduZ3RyJzonXFx1MjI2RicsJ25HdHYnOidcXHUyMjZCXFx1MDMzOCcsJ25oYXJyJzonXFx1MjFBRScsJ25oQXJyJzonXFx1MjFDRScsJ25ocGFyJzonXFx1MkFGMicsJ25pJzonXFx1MjIwQicsJ25pcyc6J1xcdTIyRkMnLCduaXNkJzonXFx1MjJGQScsJ25pdic6J1xcdTIyMEInLCduamN5JzonXFx1MDQ1QScsJ05KY3knOidcXHUwNDBBJywnbmxhcnInOidcXHUyMTlBJywnbmxBcnInOidcXHUyMUNEJywnbmxkcic6J1xcdTIwMjUnLCdubGUnOidcXHUyMjcwJywnbmxFJzonXFx1MjI2NlxcdTAzMzgnLCdubGVmdGFycm93JzonXFx1MjE5QScsJ25MZWZ0YXJyb3cnOidcXHUyMUNEJywnbmxlZnRyaWdodGFycm93JzonXFx1MjFBRScsJ25MZWZ0cmlnaHRhcnJvdyc6J1xcdTIxQ0UnLCdubGVxJzonXFx1MjI3MCcsJ25sZXFxJzonXFx1MjI2NlxcdTAzMzgnLCdubGVxc2xhbnQnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXMnOidcXHUyQTdEXFx1MDMzOCcsJ25sZXNzJzonXFx1MjI2RScsJ25MbCc6J1xcdTIyRDhcXHUwMzM4JywnbmxzaW0nOidcXHUyMjc0Jywnbmx0JzonXFx1MjI2RScsJ25MdCc6J1xcdTIyNkFcXHUyMEQyJywnbmx0cmknOidcXHUyMkVBJywnbmx0cmllJzonXFx1MjJFQycsJ25MdHYnOidcXHUyMjZBXFx1MDMzOCcsJ25taWQnOidcXHUyMjI0JywnTm9CcmVhayc6J1xcdTIwNjAnLCdOb25CcmVha2luZ1NwYWNlJzonXFx4QTAnLCdub3BmJzonXFx1RDgzNVxcdURENUYnLCdOb3BmJzonXFx1MjExNScsJ25vdCc6J1xceEFDJywnTm90JzonXFx1MkFFQycsJ05vdENvbmdydWVudCc6J1xcdTIyNjInLCdOb3RDdXBDYXAnOidcXHUyMjZEJywnTm90RG91YmxlVmVydGljYWxCYXInOidcXHUyMjI2JywnTm90RWxlbWVudCc6J1xcdTIyMDknLCdOb3RFcXVhbCc6J1xcdTIyNjAnLCdOb3RFcXVhbFRpbGRlJzonXFx1MjI0MlxcdTAzMzgnLCdOb3RFeGlzdHMnOidcXHUyMjA0JywnTm90R3JlYXRlcic6J1xcdTIyNkYnLCdOb3RHcmVhdGVyRXF1YWwnOidcXHUyMjcxJywnTm90R3JlYXRlckZ1bGxFcXVhbCc6J1xcdTIyNjdcXHUwMzM4JywnTm90R3JlYXRlckdyZWF0ZXInOidcXHUyMjZCXFx1MDMzOCcsJ05vdEdyZWF0ZXJMZXNzJzonXFx1MjI3OScsJ05vdEdyZWF0ZXJTbGFudEVxdWFsJzonXFx1MkE3RVxcdTAzMzgnLCdOb3RHcmVhdGVyVGlsZGUnOidcXHUyMjc1JywnTm90SHVtcERvd25IdW1wJzonXFx1MjI0RVxcdTAzMzgnLCdOb3RIdW1wRXF1YWwnOidcXHUyMjRGXFx1MDMzOCcsJ25vdGluJzonXFx1MjIwOScsJ25vdGluZG90JzonXFx1MjJGNVxcdTAzMzgnLCdub3RpbkUnOidcXHUyMkY5XFx1MDMzOCcsJ25vdGludmEnOidcXHUyMjA5Jywnbm90aW52Yic6J1xcdTIyRjcnLCdub3RpbnZjJzonXFx1MjJGNicsJ05vdExlZnRUcmlhbmdsZSc6J1xcdTIyRUEnLCdOb3RMZWZ0VHJpYW5nbGVCYXInOidcXHUyOUNGXFx1MDMzOCcsJ05vdExlZnRUcmlhbmdsZUVxdWFsJzonXFx1MjJFQycsJ05vdExlc3MnOidcXHUyMjZFJywnTm90TGVzc0VxdWFsJzonXFx1MjI3MCcsJ05vdExlc3NHcmVhdGVyJzonXFx1MjI3OCcsJ05vdExlc3NMZXNzJzonXFx1MjI2QVxcdTAzMzgnLCdOb3RMZXNzU2xhbnRFcXVhbCc6J1xcdTJBN0RcXHUwMzM4JywnTm90TGVzc1RpbGRlJzonXFx1MjI3NCcsJ05vdE5lc3RlZEdyZWF0ZXJHcmVhdGVyJzonXFx1MkFBMlxcdTAzMzgnLCdOb3ROZXN0ZWRMZXNzTGVzcyc6J1xcdTJBQTFcXHUwMzM4Jywnbm90bmknOidcXHUyMjBDJywnbm90bml2YSc6J1xcdTIyMEMnLCdub3RuaXZiJzonXFx1MjJGRScsJ25vdG5pdmMnOidcXHUyMkZEJywnTm90UHJlY2VkZXMnOidcXHUyMjgwJywnTm90UHJlY2VkZXNFcXVhbCc6J1xcdTJBQUZcXHUwMzM4JywnTm90UHJlY2VkZXNTbGFudEVxdWFsJzonXFx1MjJFMCcsJ05vdFJldmVyc2VFbGVtZW50JzonXFx1MjIwQycsJ05vdFJpZ2h0VHJpYW5nbGUnOidcXHUyMkVCJywnTm90UmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDBcXHUwMzM4JywnTm90UmlnaHRUcmlhbmdsZUVxdWFsJzonXFx1MjJFRCcsJ05vdFNxdWFyZVN1YnNldCc6J1xcdTIyOEZcXHUwMzM4JywnTm90U3F1YXJlU3Vic2V0RXF1YWwnOidcXHUyMkUyJywnTm90U3F1YXJlU3VwZXJzZXQnOidcXHUyMjkwXFx1MDMzOCcsJ05vdFNxdWFyZVN1cGVyc2V0RXF1YWwnOidcXHUyMkUzJywnTm90U3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCdOb3RTdWJzZXRFcXVhbCc6J1xcdTIyODgnLCdOb3RTdWNjZWVkcyc6J1xcdTIyODEnLCdOb3RTdWNjZWVkc0VxdWFsJzonXFx1MkFCMFxcdTAzMzgnLCdOb3RTdWNjZWVkc1NsYW50RXF1YWwnOidcXHUyMkUxJywnTm90U3VjY2VlZHNUaWxkZSc6J1xcdTIyN0ZcXHUwMzM4JywnTm90U3VwZXJzZXQnOidcXHUyMjgzXFx1MjBEMicsJ05vdFN1cGVyc2V0RXF1YWwnOidcXHUyMjg5JywnTm90VGlsZGUnOidcXHUyMjQxJywnTm90VGlsZGVFcXVhbCc6J1xcdTIyNDQnLCdOb3RUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDcnLCdOb3RUaWxkZVRpbGRlJzonXFx1MjI0OScsJ05vdFZlcnRpY2FsQmFyJzonXFx1MjIyNCcsJ25wYXInOidcXHUyMjI2JywnbnBhcmFsbGVsJzonXFx1MjIyNicsJ25wYXJzbCc6J1xcdTJBRkRcXHUyMEU1JywnbnBhcnQnOidcXHUyMjAyXFx1MDMzOCcsJ25wb2xpbnQnOidcXHUyQTE0JywnbnByJzonXFx1MjI4MCcsJ25wcmN1ZSc6J1xcdTIyRTAnLCducHJlJzonXFx1MkFBRlxcdTAzMzgnLCducHJlYyc6J1xcdTIyODAnLCducHJlY2VxJzonXFx1MkFBRlxcdTAzMzgnLCducmFycic6J1xcdTIxOUInLCduckFycic6J1xcdTIxQ0YnLCducmFycmMnOidcXHUyOTMzXFx1MDMzOCcsJ25yYXJydyc6J1xcdTIxOURcXHUwMzM4JywnbnJpZ2h0YXJyb3cnOidcXHUyMTlCJywnblJpZ2h0YXJyb3cnOidcXHUyMUNGJywnbnJ0cmknOidcXHUyMkVCJywnbnJ0cmllJzonXFx1MjJFRCcsJ25zYyc6J1xcdTIyODEnLCduc2NjdWUnOidcXHUyMkUxJywnbnNjZSc6J1xcdTJBQjBcXHUwMzM4JywnbnNjcic6J1xcdUQ4MzVcXHVEQ0MzJywnTnNjcic6J1xcdUQ4MzVcXHVEQ0E5JywnbnNob3J0bWlkJzonXFx1MjIyNCcsJ25zaG9ydHBhcmFsbGVsJzonXFx1MjIyNicsJ25zaW0nOidcXHUyMjQxJywnbnNpbWUnOidcXHUyMjQ0JywnbnNpbWVxJzonXFx1MjI0NCcsJ25zbWlkJzonXFx1MjIyNCcsJ25zcGFyJzonXFx1MjIyNicsJ25zcXN1YmUnOidcXHUyMkUyJywnbnNxc3VwZSc6J1xcdTIyRTMnLCduc3ViJzonXFx1MjI4NCcsJ25zdWJlJzonXFx1MjI4OCcsJ25zdWJFJzonXFx1MkFDNVxcdTAzMzgnLCduc3Vic2V0JzonXFx1MjI4MlxcdTIwRDInLCduc3Vic2V0ZXEnOidcXHUyMjg4JywnbnN1YnNldGVxcSc6J1xcdTJBQzVcXHUwMzM4JywnbnN1Y2MnOidcXHUyMjgxJywnbnN1Y2NlcSc6J1xcdTJBQjBcXHUwMzM4JywnbnN1cCc6J1xcdTIyODUnLCduc3VwZSc6J1xcdTIyODknLCduc3VwRSc6J1xcdTJBQzZcXHUwMzM4JywnbnN1cHNldCc6J1xcdTIyODNcXHUyMEQyJywnbnN1cHNldGVxJzonXFx1MjI4OScsJ25zdXBzZXRlcXEnOidcXHUyQUM2XFx1MDMzOCcsJ250Z2wnOidcXHUyMjc5JywnbnRpbGRlJzonXFx4RjEnLCdOdGlsZGUnOidcXHhEMScsJ250bGcnOidcXHUyMjc4JywnbnRyaWFuZ2xlbGVmdCc6J1xcdTIyRUEnLCdudHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkVDJywnbnRyaWFuZ2xlcmlnaHQnOidcXHUyMkVCJywnbnRyaWFuZ2xlcmlnaHRlcSc6J1xcdTIyRUQnLCdudSc6J1xcdTAzQkQnLCdOdSc6J1xcdTAzOUQnLCdudW0nOicjJywnbnVtZXJvJzonXFx1MjExNicsJ251bXNwJzonXFx1MjAwNycsJ252YXAnOidcXHUyMjREXFx1MjBEMicsJ252ZGFzaCc6J1xcdTIyQUMnLCdudkRhc2gnOidcXHUyMkFEJywnblZkYXNoJzonXFx1MjJBRScsJ25WRGFzaCc6J1xcdTIyQUYnLCdudmdlJzonXFx1MjI2NVxcdTIwRDInLCdudmd0JzonPlxcdTIwRDInLCdudkhhcnInOidcXHUyOTA0JywnbnZpbmZpbic6J1xcdTI5REUnLCdudmxBcnInOidcXHUyOTAyJywnbnZsZSc6J1xcdTIyNjRcXHUyMEQyJywnbnZsdCc6JzxcXHUyMEQyJywnbnZsdHJpZSc6J1xcdTIyQjRcXHUyMEQyJywnbnZyQXJyJzonXFx1MjkwMycsJ252cnRyaWUnOidcXHUyMkI1XFx1MjBEMicsJ252c2ltJzonXFx1MjIzQ1xcdTIwRDInLCdud2FyaGsnOidcXHUyOTIzJywnbndhcnInOidcXHUyMTk2JywnbndBcnInOidcXHUyMUQ2JywnbndhcnJvdyc6J1xcdTIxOTYnLCdud25lYXInOidcXHUyOTI3Jywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29hc3QnOidcXHUyMjlCJywnb2Npcic6J1xcdTIyOUEnLCdvY2lyYyc6J1xceEY0JywnT2NpcmMnOidcXHhENCcsJ29jeSc6J1xcdTA0M0UnLCdPY3knOidcXHUwNDFFJywnb2Rhc2gnOidcXHUyMjlEJywnb2RibGFjJzonXFx1MDE1MScsJ09kYmxhYyc6J1xcdTAxNTAnLCdvZGl2JzonXFx1MkEzOCcsJ29kb3QnOidcXHUyMjk5Jywnb2Rzb2xkJzonXFx1MjlCQycsJ29lbGlnJzonXFx1MDE1MycsJ09FbGlnJzonXFx1MDE1MicsJ29mY2lyJzonXFx1MjlCRicsJ29mcic6J1xcdUQ4MzVcXHVERDJDJywnT2ZyJzonXFx1RDgzNVxcdUREMTInLCdvZ29uJzonXFx1MDJEQicsJ29ncmF2ZSc6J1xceEYyJywnT2dyYXZlJzonXFx4RDInLCdvZ3QnOidcXHUyOUMxJywnb2hiYXInOidcXHUyOUI1Jywnb2htJzonXFx1MDNBOScsJ29pbnQnOidcXHUyMjJFJywnb2xhcnInOidcXHUyMUJBJywnb2xjaXInOidcXHUyOUJFJywnb2xjcm9zcyc6J1xcdTI5QkInLCdvbGluZSc6J1xcdTIwM0UnLCdvbHQnOidcXHUyOUMwJywnb21hY3InOidcXHUwMTREJywnT21hY3InOidcXHUwMTRDJywnb21lZ2EnOidcXHUwM0M5JywnT21lZ2EnOidcXHUwM0E5Jywnb21pY3Jvbic6J1xcdTAzQkYnLCdPbWljcm9uJzonXFx1MDM5RicsJ29taWQnOidcXHUyOUI2Jywnb21pbnVzJzonXFx1MjI5NicsJ29vcGYnOidcXHVEODM1XFx1REQ2MCcsJ09vcGYnOidcXHVEODM1XFx1REQ0NicsJ29wYXInOidcXHUyOUI3JywnT3BlbkN1cmx5RG91YmxlUXVvdGUnOidcXHUyMDFDJywnT3BlbkN1cmx5UXVvdGUnOidcXHUyMDE4Jywnb3BlcnAnOidcXHUyOUI5Jywnb3BsdXMnOidcXHUyMjk1Jywnb3InOidcXHUyMjI4JywnT3InOidcXHUyQTU0Jywnb3JhcnInOidcXHUyMUJCJywnb3JkJzonXFx1MkE1RCcsJ29yZGVyJzonXFx1MjEzNCcsJ29yZGVyb2YnOidcXHUyMTM0Jywnb3JkZic6J1xceEFBJywnb3JkbSc6J1xceEJBJywnb3JpZ29mJzonXFx1MjJCNicsJ29yb3InOidcXHUyQTU2Jywnb3JzbG9wZSc6J1xcdTJBNTcnLCdvcnYnOidcXHUyQTVCJywnb1MnOidcXHUyNEM4Jywnb3Njcic6J1xcdTIxMzQnLCdPc2NyJzonXFx1RDgzNVxcdURDQUEnLCdvc2xhc2gnOidcXHhGOCcsJ09zbGFzaCc6J1xceEQ4Jywnb3NvbCc6J1xcdTIyOTgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3RpbWVzJzonXFx1MjI5NycsJ090aW1lcyc6J1xcdTJBMzcnLCdvdGltZXNhcyc6J1xcdTJBMzYnLCdvdW1sJzonXFx4RjYnLCdPdW1sJzonXFx4RDYnLCdvdmJhcic6J1xcdTIzM0QnLCdPdmVyQmFyJzonXFx1MjAzRScsJ092ZXJCcmFjZSc6J1xcdTIzREUnLCdPdmVyQnJhY2tldCc6J1xcdTIzQjQnLCdPdmVyUGFyZW50aGVzaXMnOidcXHUyM0RDJywncGFyJzonXFx1MjIyNScsJ3BhcmEnOidcXHhCNicsJ3BhcmFsbGVsJzonXFx1MjIyNScsJ3BhcnNpbSc6J1xcdTJBRjMnLCdwYXJzbCc6J1xcdTJBRkQnLCdwYXJ0JzonXFx1MjIwMicsJ1BhcnRpYWxEJzonXFx1MjIwMicsJ3BjeSc6J1xcdTA0M0YnLCdQY3knOidcXHUwNDFGJywncGVyY250JzonJScsJ3BlcmlvZCc6Jy4nLCdwZXJtaWwnOidcXHUyMDMwJywncGVycCc6J1xcdTIyQTUnLCdwZXJ0ZW5rJzonXFx1MjAzMScsJ3Bmcic6J1xcdUQ4MzVcXHVERDJEJywnUGZyJzonXFx1RDgzNVxcdUREMTMnLCdwaGknOidcXHUwM0M2JywnUGhpJzonXFx1MDNBNicsJ3BoaXYnOidcXHUwM0Q1JywncGhtbWF0JzonXFx1MjEzMycsJ3Bob25lJzonXFx1MjYwRScsJ3BpJzonXFx1MDNDMCcsJ1BpJzonXFx1MDNBMCcsJ3BpdGNoZm9yayc6J1xcdTIyRDQnLCdwaXYnOidcXHUwM0Q2JywncGxhbmNrJzonXFx1MjEwRicsJ3BsYW5ja2gnOidcXHUyMTBFJywncGxhbmt2JzonXFx1MjEwRicsJ3BsdXMnOicrJywncGx1c2FjaXInOidcXHUyQTIzJywncGx1c2InOidcXHUyMjlFJywncGx1c2Npcic6J1xcdTJBMjInLCdwbHVzZG8nOidcXHUyMjE0JywncGx1c2R1JzonXFx1MkEyNScsJ3BsdXNlJzonXFx1MkE3MicsJ1BsdXNNaW51cyc6J1xceEIxJywncGx1c21uJzonXFx4QjEnLCdwbHVzc2ltJzonXFx1MkEyNicsJ3BsdXN0d28nOidcXHUyQTI3JywncG0nOidcXHhCMScsJ1BvaW5jYXJlcGxhbmUnOidcXHUyMTBDJywncG9pbnRpbnQnOidcXHUyQTE1JywncG9wZic6J1xcdUQ4MzVcXHVERDYxJywnUG9wZic6J1xcdTIxMTknLCdwb3VuZCc6J1xceEEzJywncHInOidcXHUyMjdBJywnUHInOidcXHUyQUJCJywncHJhcCc6J1xcdTJBQjcnLCdwcmN1ZSc6J1xcdTIyN0MnLCdwcmUnOidcXHUyQUFGJywncHJFJzonXFx1MkFCMycsJ3ByZWMnOidcXHUyMjdBJywncHJlY2FwcHJveCc6J1xcdTJBQjcnLCdwcmVjY3VybHllcSc6J1xcdTIyN0MnLCdQcmVjZWRlcyc6J1xcdTIyN0EnLCdQcmVjZWRlc0VxdWFsJzonXFx1MkFBRicsJ1ByZWNlZGVzU2xhbnRFcXVhbCc6J1xcdTIyN0MnLCdQcmVjZWRlc1RpbGRlJzonXFx1MjI3RScsJ3ByZWNlcSc6J1xcdTJBQUYnLCdwcmVjbmFwcHJveCc6J1xcdTJBQjknLCdwcmVjbmVxcSc6J1xcdTJBQjUnLCdwcmVjbnNpbSc6J1xcdTIyRTgnLCdwcmVjc2ltJzonXFx1MjI3RScsJ3ByaW1lJzonXFx1MjAzMicsJ1ByaW1lJzonXFx1MjAzMycsJ3ByaW1lcyc6J1xcdTIxMTknLCdwcm5hcCc6J1xcdTJBQjknLCdwcm5FJzonXFx1MkFCNScsJ3BybnNpbSc6J1xcdTIyRTgnLCdwcm9kJzonXFx1MjIwRicsJ1Byb2R1Y3QnOidcXHUyMjBGJywncHJvZmFsYXInOidcXHUyMzJFJywncHJvZmxpbmUnOidcXHUyMzEyJywncHJvZnN1cmYnOidcXHUyMzEzJywncHJvcCc6J1xcdTIyMUQnLCdQcm9wb3J0aW9uJzonXFx1MjIzNycsJ1Byb3BvcnRpb25hbCc6J1xcdTIyMUQnLCdwcm9wdG8nOidcXHUyMjFEJywncHJzaW0nOidcXHUyMjdFJywncHJ1cmVsJzonXFx1MjJCMCcsJ3BzY3InOidcXHVEODM1XFx1RENDNScsJ1BzY3InOidcXHVEODM1XFx1RENBQicsJ3BzaSc6J1xcdTAzQzgnLCdQc2knOidcXHUwM0E4JywncHVuY3NwJzonXFx1MjAwOCcsJ3Fmcic6J1xcdUQ4MzVcXHVERDJFJywnUWZyJzonXFx1RDgzNVxcdUREMTQnLCdxaW50JzonXFx1MkEwQycsJ3FvcGYnOidcXHVEODM1XFx1REQ2MicsJ1FvcGYnOidcXHUyMTFBJywncXByaW1lJzonXFx1MjA1NycsJ3FzY3InOidcXHVEODM1XFx1RENDNicsJ1FzY3InOidcXHVEODM1XFx1RENBQycsJ3F1YXRlcm5pb25zJzonXFx1MjEwRCcsJ3F1YXRpbnQnOidcXHUyQTE2JywncXVlc3QnOic/JywncXVlc3RlcSc6J1xcdTIyNUYnLCdxdW90JzonXCInLCdRVU9UJzonXCInLCdyQWFycic6J1xcdTIxREInLCdyYWNlJzonXFx1MjIzRFxcdTAzMzEnLCdyYWN1dGUnOidcXHUwMTU1JywnUmFjdXRlJzonXFx1MDE1NCcsJ3JhZGljJzonXFx1MjIxQScsJ3JhZW1wdHl2JzonXFx1MjlCMycsJ3JhbmcnOidcXHUyN0U5JywnUmFuZyc6J1xcdTI3RUInLCdyYW5nZCc6J1xcdTI5OTInLCdyYW5nZSc6J1xcdTI5QTUnLCdyYW5nbGUnOidcXHUyN0U5JywncmFxdW8nOidcXHhCQicsJ3JhcnInOidcXHUyMTkyJywnckFycic6J1xcdTIxRDInLCdSYXJyJzonXFx1MjFBMCcsJ3JhcnJhcCc6J1xcdTI5NzUnLCdyYXJyYic6J1xcdTIxRTUnLCdyYXJyYmZzJzonXFx1MjkyMCcsJ3JhcnJjJzonXFx1MjkzMycsJ3JhcnJmcyc6J1xcdTI5MUUnLCdyYXJyaGsnOidcXHUyMUFBJywncmFycmxwJzonXFx1MjFBQycsJ3JhcnJwbCc6J1xcdTI5NDUnLCdyYXJyc2ltJzonXFx1Mjk3NCcsJ3JhcnJ0bCc6J1xcdTIxQTMnLCdSYXJydGwnOidcXHUyOTE2JywncmFycncnOidcXHUyMTlEJywncmF0YWlsJzonXFx1MjkxQScsJ3JBdGFpbCc6J1xcdTI5MUMnLCdyYXRpbyc6J1xcdTIyMzYnLCdyYXRpb25hbHMnOidcXHUyMTFBJywncmJhcnInOidcXHUyOTBEJywnckJhcnInOidcXHUyOTBGJywnUkJhcnInOidcXHUyOTEwJywncmJicmsnOidcXHUyNzczJywncmJyYWNlJzonfScsJ3JicmFjayc6J10nLCdyYnJrZSc6J1xcdTI5OEMnLCdyYnJrc2xkJzonXFx1Mjk4RScsJ3JicmtzbHUnOidcXHUyOTkwJywncmNhcm9uJzonXFx1MDE1OScsJ1JjYXJvbic6J1xcdTAxNTgnLCdyY2VkaWwnOidcXHUwMTU3JywnUmNlZGlsJzonXFx1MDE1NicsJ3JjZWlsJzonXFx1MjMwOScsJ3JjdWInOid9JywncmN5JzonXFx1MDQ0MCcsJ1JjeSc6J1xcdTA0MjAnLCdyZGNhJzonXFx1MjkzNycsJ3JkbGRoYXInOidcXHUyOTY5JywncmRxdW8nOidcXHUyMDFEJywncmRxdW9yJzonXFx1MjAxRCcsJ3Jkc2gnOidcXHUyMUIzJywnUmUnOidcXHUyMTFDJywncmVhbCc6J1xcdTIxMUMnLCdyZWFsaW5lJzonXFx1MjExQicsJ3JlYWxwYXJ0JzonXFx1MjExQycsJ3JlYWxzJzonXFx1MjExRCcsJ3JlY3QnOidcXHUyNUFEJywncmVnJzonXFx4QUUnLCdSRUcnOidcXHhBRScsJ1JldmVyc2VFbGVtZW50JzonXFx1MjIwQicsJ1JldmVyc2VFcXVpbGlicml1bSc6J1xcdTIxQ0InLCdSZXZlcnNlVXBFcXVpbGlicml1bSc6J1xcdTI5NkYnLCdyZmlzaHQnOidcXHUyOTdEJywncmZsb29yJzonXFx1MjMwQicsJ3Jmcic6J1xcdUQ4MzVcXHVERDJGJywnUmZyJzonXFx1MjExQycsJ3JIYXInOidcXHUyOTY0JywncmhhcmQnOidcXHUyMUMxJywncmhhcnUnOidcXHUyMUMwJywncmhhcnVsJzonXFx1Mjk2QycsJ3Jobyc6J1xcdTAzQzEnLCdSaG8nOidcXHUwM0ExJywncmhvdic6J1xcdTAzRjEnLCdSaWdodEFuZ2xlQnJhY2tldCc6J1xcdTI3RTknLCdyaWdodGFycm93JzonXFx1MjE5MicsJ1JpZ2h0YXJyb3cnOidcXHUyMUQyJywnUmlnaHRBcnJvdyc6J1xcdTIxOTInLCdSaWdodEFycm93QmFyJzonXFx1MjFFNScsJ1JpZ2h0QXJyb3dMZWZ0QXJyb3cnOidcXHUyMUM0JywncmlnaHRhcnJvd3RhaWwnOidcXHUyMUEzJywnUmlnaHRDZWlsaW5nJzonXFx1MjMwOScsJ1JpZ2h0RG91YmxlQnJhY2tldCc6J1xcdTI3RTcnLCdSaWdodERvd25UZWVWZWN0b3InOidcXHUyOTVEJywnUmlnaHREb3duVmVjdG9yJzonXFx1MjFDMicsJ1JpZ2h0RG93blZlY3RvckJhcic6J1xcdTI5NTUnLCdSaWdodEZsb29yJzonXFx1MjMwQicsJ3JpZ2h0aGFycG9vbmRvd24nOidcXHUyMUMxJywncmlnaHRoYXJwb29udXAnOidcXHUyMUMwJywncmlnaHRsZWZ0YXJyb3dzJzonXFx1MjFDNCcsJ3JpZ2h0bGVmdGhhcnBvb25zJzonXFx1MjFDQycsJ3JpZ2h0cmlnaHRhcnJvd3MnOidcXHUyMUM5JywncmlnaHRzcXVpZ2Fycm93JzonXFx1MjE5RCcsJ1JpZ2h0VGVlJzonXFx1MjJBMicsJ1JpZ2h0VGVlQXJyb3cnOidcXHUyMUE2JywnUmlnaHRUZWVWZWN0b3InOidcXHUyOTVCJywncmlnaHR0aHJlZXRpbWVzJzonXFx1MjJDQycsJ1JpZ2h0VHJpYW5nbGUnOidcXHUyMkIzJywnUmlnaHRUcmlhbmdsZUJhcic6J1xcdTI5RDAnLCdSaWdodFRyaWFuZ2xlRXF1YWwnOidcXHUyMkI1JywnUmlnaHRVcERvd25WZWN0b3InOidcXHUyOTRGJywnUmlnaHRVcFRlZVZlY3Rvcic6J1xcdTI5NUMnLCdSaWdodFVwVmVjdG9yJzonXFx1MjFCRScsJ1JpZ2h0VXBWZWN0b3JCYXInOidcXHUyOTU0JywnUmlnaHRWZWN0b3InOidcXHUyMUMwJywnUmlnaHRWZWN0b3JCYXInOidcXHUyOTUzJywncmluZyc6J1xcdTAyREEnLCdyaXNpbmdkb3RzZXEnOidcXHUyMjUzJywncmxhcnInOidcXHUyMUM0JywncmxoYXInOidcXHUyMUNDJywncmxtJzonXFx1MjAwRicsJ3Jtb3VzdCc6J1xcdTIzQjEnLCdybW91c3RhY2hlJzonXFx1MjNCMScsJ3JubWlkJzonXFx1MkFFRScsJ3JvYW5nJzonXFx1MjdFRCcsJ3JvYXJyJzonXFx1MjFGRScsJ3JvYnJrJzonXFx1MjdFNycsJ3JvcGFyJzonXFx1Mjk4NicsJ3JvcGYnOidcXHVEODM1XFx1REQ2MycsJ1JvcGYnOidcXHUyMTFEJywncm9wbHVzJzonXFx1MkEyRScsJ3JvdGltZXMnOidcXHUyQTM1JywnUm91bmRJbXBsaWVzJzonXFx1Mjk3MCcsJ3JwYXInOicpJywncnBhcmd0JzonXFx1Mjk5NCcsJ3JwcG9saW50JzonXFx1MkExMicsJ3JyYXJyJzonXFx1MjFDOScsJ1JyaWdodGFycm93JzonXFx1MjFEQicsJ3JzYXF1byc6J1xcdTIwM0EnLCdyc2NyJzonXFx1RDgzNVxcdURDQzcnLCdSc2NyJzonXFx1MjExQicsJ3JzaCc6J1xcdTIxQjEnLCdSc2gnOidcXHUyMUIxJywncnNxYic6J10nLCdyc3F1byc6J1xcdTIwMTknLCdyc3F1b3InOidcXHUyMDE5JywncnRocmVlJzonXFx1MjJDQycsJ3J0aW1lcyc6J1xcdTIyQ0EnLCdydHJpJzonXFx1MjVCOScsJ3J0cmllJzonXFx1MjJCNScsJ3J0cmlmJzonXFx1MjVCOCcsJ3J0cmlsdHJpJzonXFx1MjlDRScsJ1J1bGVEZWxheWVkJzonXFx1MjlGNCcsJ3J1bHVoYXInOidcXHUyOTY4JywncngnOidcXHUyMTFFJywnc2FjdXRlJzonXFx1MDE1QicsJ1NhY3V0ZSc6J1xcdTAxNUEnLCdzYnF1byc6J1xcdTIwMUEnLCdzYyc6J1xcdTIyN0InLCdTYyc6J1xcdTJBQkMnLCdzY2FwJzonXFx1MkFCOCcsJ3NjYXJvbic6J1xcdTAxNjEnLCdTY2Fyb24nOidcXHUwMTYwJywnc2NjdWUnOidcXHUyMjdEJywnc2NlJzonXFx1MkFCMCcsJ3NjRSc6J1xcdTJBQjQnLCdzY2VkaWwnOidcXHUwMTVGJywnU2NlZGlsJzonXFx1MDE1RScsJ3NjaXJjJzonXFx1MDE1RCcsJ1NjaXJjJzonXFx1MDE1QycsJ3NjbmFwJzonXFx1MkFCQScsJ3NjbkUnOidcXHUyQUI2Jywnc2Nuc2ltJzonXFx1MjJFOScsJ3NjcG9saW50JzonXFx1MkExMycsJ3Njc2ltJzonXFx1MjI3RicsJ3NjeSc6J1xcdTA0NDEnLCdTY3knOidcXHUwNDIxJywnc2RvdCc6J1xcdTIyQzUnLCdzZG90Yic6J1xcdTIyQTEnLCdzZG90ZSc6J1xcdTJBNjYnLCdzZWFyaGsnOidcXHUyOTI1Jywnc2VhcnInOidcXHUyMTk4Jywnc2VBcnInOidcXHUyMUQ4Jywnc2VhcnJvdyc6J1xcdTIxOTgnLCdzZWN0JzonXFx4QTcnLCdzZW1pJzonOycsJ3Nlc3dhcic6J1xcdTI5MjknLCdzZXRtaW51cyc6J1xcdTIyMTYnLCdzZXRtbic6J1xcdTIyMTYnLCdzZXh0JzonXFx1MjczNicsJ3Nmcic6J1xcdUQ4MzVcXHVERDMwJywnU2ZyJzonXFx1RDgzNVxcdUREMTYnLCdzZnJvd24nOidcXHUyMzIyJywnc2hhcnAnOidcXHUyNjZGJywnc2hjaGN5JzonXFx1MDQ0OScsJ1NIQ0hjeSc6J1xcdTA0MjknLCdzaGN5JzonXFx1MDQ0OCcsJ1NIY3knOidcXHUwNDI4JywnU2hvcnREb3duQXJyb3cnOidcXHUyMTkzJywnU2hvcnRMZWZ0QXJyb3cnOidcXHUyMTkwJywnc2hvcnRtaWQnOidcXHUyMjIzJywnc2hvcnRwYXJhbGxlbCc6J1xcdTIyMjUnLCdTaG9ydFJpZ2h0QXJyb3cnOidcXHUyMTkyJywnU2hvcnRVcEFycm93JzonXFx1MjE5MScsJ3NoeSc6J1xceEFEJywnc2lnbWEnOidcXHUwM0MzJywnU2lnbWEnOidcXHUwM0EzJywnc2lnbWFmJzonXFx1MDNDMicsJ3NpZ21hdic6J1xcdTAzQzInLCdzaW0nOidcXHUyMjNDJywnc2ltZG90JzonXFx1MkE2QScsJ3NpbWUnOidcXHUyMjQzJywnc2ltZXEnOidcXHUyMjQzJywnc2ltZyc6J1xcdTJBOUUnLCdzaW1nRSc6J1xcdTJBQTAnLCdzaW1sJzonXFx1MkE5RCcsJ3NpbWxFJzonXFx1MkE5RicsJ3NpbW5lJzonXFx1MjI0NicsJ3NpbXBsdXMnOidcXHUyQTI0Jywnc2ltcmFycic6J1xcdTI5NzInLCdzbGFycic6J1xcdTIxOTAnLCdTbWFsbENpcmNsZSc6J1xcdTIyMTgnLCdzbWFsbHNldG1pbnVzJzonXFx1MjIxNicsJ3NtYXNocCc6J1xcdTJBMzMnLCdzbWVwYXJzbCc6J1xcdTI5RTQnLCdzbWlkJzonXFx1MjIyMycsJ3NtaWxlJzonXFx1MjMyMycsJ3NtdCc6J1xcdTJBQUEnLCdzbXRlJzonXFx1MkFBQycsJ3NtdGVzJzonXFx1MkFBQ1xcdUZFMDAnLCdzb2Z0Y3knOidcXHUwNDRDJywnU09GVGN5JzonXFx1MDQyQycsJ3NvbCc6Jy8nLCdzb2xiJzonXFx1MjlDNCcsJ3NvbGJhcic6J1xcdTIzM0YnLCdzb3BmJzonXFx1RDgzNVxcdURENjQnLCdTb3BmJzonXFx1RDgzNVxcdURENEEnLCdzcGFkZXMnOidcXHUyNjYwJywnc3BhZGVzdWl0JzonXFx1MjY2MCcsJ3NwYXInOidcXHUyMjI1Jywnc3FjYXAnOidcXHUyMjkzJywnc3FjYXBzJzonXFx1MjI5M1xcdUZFMDAnLCdzcWN1cCc6J1xcdTIyOTQnLCdzcWN1cHMnOidcXHUyMjk0XFx1RkUwMCcsJ1NxcnQnOidcXHUyMjFBJywnc3FzdWInOidcXHUyMjhGJywnc3FzdWJlJzonXFx1MjI5MScsJ3Nxc3Vic2V0JzonXFx1MjI4RicsJ3Nxc3Vic2V0ZXEnOidcXHUyMjkxJywnc3FzdXAnOidcXHUyMjkwJywnc3FzdXBlJzonXFx1MjI5MicsJ3Nxc3Vwc2V0JzonXFx1MjI5MCcsJ3Nxc3Vwc2V0ZXEnOidcXHUyMjkyJywnc3F1JzonXFx1MjVBMScsJ3NxdWFyZSc6J1xcdTI1QTEnLCdTcXVhcmUnOidcXHUyNUExJywnU3F1YXJlSW50ZXJzZWN0aW9uJzonXFx1MjI5MycsJ1NxdWFyZVN1YnNldCc6J1xcdTIyOEYnLCdTcXVhcmVTdWJzZXRFcXVhbCc6J1xcdTIyOTEnLCdTcXVhcmVTdXBlcnNldCc6J1xcdTIyOTAnLCdTcXVhcmVTdXBlcnNldEVxdWFsJzonXFx1MjI5MicsJ1NxdWFyZVVuaW9uJzonXFx1MjI5NCcsJ3NxdWFyZic6J1xcdTI1QUEnLCdzcXVmJzonXFx1MjVBQScsJ3NyYXJyJzonXFx1MjE5MicsJ3NzY3InOidcXHVEODM1XFx1RENDOCcsJ1NzY3InOidcXHVEODM1XFx1RENBRScsJ3NzZXRtbic6J1xcdTIyMTYnLCdzc21pbGUnOidcXHUyMzIzJywnc3N0YXJmJzonXFx1MjJDNicsJ3N0YXInOidcXHUyNjA2JywnU3Rhcic6J1xcdTIyQzYnLCdzdGFyZic6J1xcdTI2MDUnLCdzdHJhaWdodGVwc2lsb24nOidcXHUwM0Y1Jywnc3RyYWlnaHRwaGknOidcXHUwM0Q1Jywnc3RybnMnOidcXHhBRicsJ3N1Yic6J1xcdTIyODInLCdTdWInOidcXHUyMkQwJywnc3ViZG90JzonXFx1MkFCRCcsJ3N1YmUnOidcXHUyMjg2Jywnc3ViRSc6J1xcdTJBQzUnLCdzdWJlZG90JzonXFx1MkFDMycsJ3N1Ym11bHQnOidcXHUyQUMxJywnc3VibmUnOidcXHUyMjhBJywnc3VibkUnOidcXHUyQUNCJywnc3VicGx1cyc6J1xcdTJBQkYnLCdzdWJyYXJyJzonXFx1Mjk3OScsJ3N1YnNldCc6J1xcdTIyODInLCdTdWJzZXQnOidcXHUyMkQwJywnc3Vic2V0ZXEnOidcXHUyMjg2Jywnc3Vic2V0ZXFxJzonXFx1MkFDNScsJ1N1YnNldEVxdWFsJzonXFx1MjI4NicsJ3N1YnNldG5lcSc6J1xcdTIyOEEnLCdzdWJzZXRuZXFxJzonXFx1MkFDQicsJ3N1YnNpbSc6J1xcdTJBQzcnLCdzdWJzdWInOidcXHUyQUQ1Jywnc3Vic3VwJzonXFx1MkFEMycsJ3N1Y2MnOidcXHUyMjdCJywnc3VjY2FwcHJveCc6J1xcdTJBQjgnLCdzdWNjY3VybHllcSc6J1xcdTIyN0QnLCdTdWNjZWVkcyc6J1xcdTIyN0InLCdTdWNjZWVkc0VxdWFsJzonXFx1MkFCMCcsJ1N1Y2NlZWRzU2xhbnRFcXVhbCc6J1xcdTIyN0QnLCdTdWNjZWVkc1RpbGRlJzonXFx1MjI3RicsJ3N1Y2NlcSc6J1xcdTJBQjAnLCdzdWNjbmFwcHJveCc6J1xcdTJBQkEnLCdzdWNjbmVxcSc6J1xcdTJBQjYnLCdzdWNjbnNpbSc6J1xcdTIyRTknLCdzdWNjc2ltJzonXFx1MjI3RicsJ1N1Y2hUaGF0JzonXFx1MjIwQicsJ3N1bSc6J1xcdTIyMTEnLCdTdW0nOidcXHUyMjExJywnc3VuZyc6J1xcdTI2NkEnLCdzdXAnOidcXHUyMjgzJywnU3VwJzonXFx1MjJEMScsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N1cGRvdCc6J1xcdTJBQkUnLCdzdXBkc3ViJzonXFx1MkFEOCcsJ3N1cGUnOidcXHUyMjg3Jywnc3VwRSc6J1xcdTJBQzYnLCdzdXBlZG90JzonXFx1MkFDNCcsJ1N1cGVyc2V0JzonXFx1MjI4MycsJ1N1cGVyc2V0RXF1YWwnOidcXHUyMjg3Jywnc3VwaHNvbCc6J1xcdTI3QzknLCdzdXBoc3ViJzonXFx1MkFENycsJ3N1cGxhcnInOidcXHUyOTdCJywnc3VwbXVsdCc6J1xcdTJBQzInLCdzdXBuZSc6J1xcdTIyOEInLCdzdXBuRSc6J1xcdTJBQ0MnLCdzdXBwbHVzJzonXFx1MkFDMCcsJ3N1cHNldCc6J1xcdTIyODMnLCdTdXBzZXQnOidcXHUyMkQxJywnc3Vwc2V0ZXEnOidcXHUyMjg3Jywnc3Vwc2V0ZXFxJzonXFx1MkFDNicsJ3N1cHNldG5lcSc6J1xcdTIyOEInLCdzdXBzZXRuZXFxJzonXFx1MkFDQycsJ3N1cHNpbSc6J1xcdTJBQzgnLCdzdXBzdWInOidcXHUyQUQ0Jywnc3Vwc3VwJzonXFx1MkFENicsJ3N3YXJoayc6J1xcdTI5MjYnLCdzd2Fycic6J1xcdTIxOTknLCdzd0Fycic6J1xcdTIxRDknLCdzd2Fycm93JzonXFx1MjE5OScsJ3N3bndhcic6J1xcdTI5MkEnLCdzemxpZyc6J1xceERGJywnVGFiJzonXFx0JywndGFyZ2V0JzonXFx1MjMxNicsJ3RhdSc6J1xcdTAzQzQnLCdUYXUnOidcXHUwM0E0JywndGJyayc6J1xcdTIzQjQnLCd0Y2Fyb24nOidcXHUwMTY1JywnVGNhcm9uJzonXFx1MDE2NCcsJ3RjZWRpbCc6J1xcdTAxNjMnLCdUY2VkaWwnOidcXHUwMTYyJywndGN5JzonXFx1MDQ0MicsJ1RjeSc6J1xcdTA0MjInLCd0ZG90JzonXFx1MjBEQicsJ3RlbHJlYyc6J1xcdTIzMTUnLCd0ZnInOidcXHVEODM1XFx1REQzMScsJ1Rmcic6J1xcdUQ4MzVcXHVERDE3JywndGhlcmU0JzonXFx1MjIzNCcsJ3RoZXJlZm9yZSc6J1xcdTIyMzQnLCdUaGVyZWZvcmUnOidcXHUyMjM0JywndGhldGEnOidcXHUwM0I4JywnVGhldGEnOidcXHUwMzk4JywndGhldGFzeW0nOidcXHUwM0QxJywndGhldGF2JzonXFx1MDNEMScsJ3RoaWNrYXBwcm94JzonXFx1MjI0OCcsJ3RoaWNrc2ltJzonXFx1MjIzQycsJ1RoaWNrU3BhY2UnOidcXHUyMDVGXFx1MjAwQScsJ3RoaW5zcCc6J1xcdTIwMDknLCdUaGluU3BhY2UnOidcXHUyMDA5JywndGhrYXAnOidcXHUyMjQ4JywndGhrc2ltJzonXFx1MjIzQycsJ3Rob3JuJzonXFx4RkUnLCdUSE9STic6J1xceERFJywndGlsZGUnOidcXHUwMkRDJywnVGlsZGUnOidcXHUyMjNDJywnVGlsZGVFcXVhbCc6J1xcdTIyNDMnLCdUaWxkZUZ1bGxFcXVhbCc6J1xcdTIyNDUnLCdUaWxkZVRpbGRlJzonXFx1MjI0OCcsJ3RpbWVzJzonXFx4RDcnLCd0aW1lc2InOidcXHUyMkEwJywndGltZXNiYXInOidcXHUyQTMxJywndGltZXNkJzonXFx1MkEzMCcsJ3RpbnQnOidcXHUyMjJEJywndG9lYSc6J1xcdTI5MjgnLCd0b3AnOidcXHUyMkE0JywndG9wYm90JzonXFx1MjMzNicsJ3RvcGNpcic6J1xcdTJBRjEnLCd0b3BmJzonXFx1RDgzNVxcdURENjUnLCdUb3BmJzonXFx1RDgzNVxcdURENEInLCd0b3Bmb3JrJzonXFx1MkFEQScsJ3Rvc2EnOidcXHUyOTI5JywndHByaW1lJzonXFx1MjAzNCcsJ3RyYWRlJzonXFx1MjEyMicsJ1RSQURFJzonXFx1MjEyMicsJ3RyaWFuZ2xlJzonXFx1MjVCNScsJ3RyaWFuZ2xlZG93bic6J1xcdTI1QkYnLCd0cmlhbmdsZWxlZnQnOidcXHUyNUMzJywndHJpYW5nbGVsZWZ0ZXEnOidcXHUyMkI0JywndHJpYW5nbGVxJzonXFx1MjI1QycsJ3RyaWFuZ2xlcmlnaHQnOidcXHUyNUI5JywndHJpYW5nbGVyaWdodGVxJzonXFx1MjJCNScsJ3RyaWRvdCc6J1xcdTI1RUMnLCd0cmllJzonXFx1MjI1QycsJ3RyaW1pbnVzJzonXFx1MkEzQScsJ1RyaXBsZURvdCc6J1xcdTIwREInLCd0cmlwbHVzJzonXFx1MkEzOScsJ3RyaXNiJzonXFx1MjlDRCcsJ3RyaXRpbWUnOidcXHUyQTNCJywndHJwZXppdW0nOidcXHUyM0UyJywndHNjcic6J1xcdUQ4MzVcXHVEQ0M5JywnVHNjcic6J1xcdUQ4MzVcXHVEQ0FGJywndHNjeSc6J1xcdTA0NDYnLCdUU2N5JzonXFx1MDQyNicsJ3RzaGN5JzonXFx1MDQ1QicsJ1RTSGN5JzonXFx1MDQwQicsJ3RzdHJvayc6J1xcdTAxNjcnLCdUc3Ryb2snOidcXHUwMTY2JywndHdpeHQnOidcXHUyMjZDJywndHdvaGVhZGxlZnRhcnJvdyc6J1xcdTIxOUUnLCd0d29oZWFkcmlnaHRhcnJvdyc6J1xcdTIxQTAnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWFycic6J1xcdTIxOTEnLCd1QXJyJzonXFx1MjFEMScsJ1VhcnInOidcXHUyMTlGJywnVWFycm9jaXInOidcXHUyOTQ5JywndWJyY3knOidcXHUwNDVFJywnVWJyY3knOidcXHUwNDBFJywndWJyZXZlJzonXFx1MDE2RCcsJ1VicmV2ZSc6J1xcdTAxNkMnLCd1Y2lyYyc6J1xceEZCJywnVWNpcmMnOidcXHhEQicsJ3VjeSc6J1xcdTA0NDMnLCdVY3knOidcXHUwNDIzJywndWRhcnInOidcXHUyMUM1JywndWRibGFjJzonXFx1MDE3MScsJ1VkYmxhYyc6J1xcdTAxNzAnLCd1ZGhhcic6J1xcdTI5NkUnLCd1ZmlzaHQnOidcXHUyOTdFJywndWZyJzonXFx1RDgzNVxcdUREMzInLCdVZnInOidcXHVEODM1XFx1REQxOCcsJ3VncmF2ZSc6J1xceEY5JywnVWdyYXZlJzonXFx4RDknLCd1SGFyJzonXFx1Mjk2MycsJ3VoYXJsJzonXFx1MjFCRicsJ3VoYXJyJzonXFx1MjFCRScsJ3VoYmxrJzonXFx1MjU4MCcsJ3VsY29ybic6J1xcdTIzMUMnLCd1bGNvcm5lcic6J1xcdTIzMUMnLCd1bGNyb3AnOidcXHUyMzBGJywndWx0cmknOidcXHUyNUY4JywndW1hY3InOidcXHUwMTZCJywnVW1hY3InOidcXHUwMTZBJywndW1sJzonXFx4QTgnLCdVbmRlckJhcic6J18nLCdVbmRlckJyYWNlJzonXFx1MjNERicsJ1VuZGVyQnJhY2tldCc6J1xcdTIzQjUnLCdVbmRlclBhcmVudGhlc2lzJzonXFx1MjNERCcsJ1VuaW9uJzonXFx1MjJDMycsJ1VuaW9uUGx1cyc6J1xcdTIyOEUnLCd1b2dvbic6J1xcdTAxNzMnLCdVb2dvbic6J1xcdTAxNzInLCd1b3BmJzonXFx1RDgzNVxcdURENjYnLCdVb3BmJzonXFx1RDgzNVxcdURENEMnLCd1cGFycm93JzonXFx1MjE5MScsJ1VwYXJyb3cnOidcXHUyMUQxJywnVXBBcnJvdyc6J1xcdTIxOTEnLCdVcEFycm93QmFyJzonXFx1MjkxMicsJ1VwQXJyb3dEb3duQXJyb3cnOidcXHUyMUM1JywndXBkb3duYXJyb3cnOidcXHUyMTk1JywnVXBkb3duYXJyb3cnOidcXHUyMUQ1JywnVXBEb3duQXJyb3cnOidcXHUyMTk1JywnVXBFcXVpbGlicml1bSc6J1xcdTI5NkUnLCd1cGhhcnBvb25sZWZ0JzonXFx1MjFCRicsJ3VwaGFycG9vbnJpZ2h0JzonXFx1MjFCRScsJ3VwbHVzJzonXFx1MjI4RScsJ1VwcGVyTGVmdEFycm93JzonXFx1MjE5NicsJ1VwcGVyUmlnaHRBcnJvdyc6J1xcdTIxOTcnLCd1cHNpJzonXFx1MDNDNScsJ1Vwc2knOidcXHUwM0QyJywndXBzaWgnOidcXHUwM0QyJywndXBzaWxvbic6J1xcdTAzQzUnLCdVcHNpbG9uJzonXFx1MDNBNScsJ1VwVGVlJzonXFx1MjJBNScsJ1VwVGVlQXJyb3cnOidcXHUyMUE1JywndXB1cGFycm93cyc6J1xcdTIxQzgnLCd1cmNvcm4nOidcXHUyMzFEJywndXJjb3JuZXInOidcXHUyMzFEJywndXJjcm9wJzonXFx1MjMwRScsJ3VyaW5nJzonXFx1MDE2RicsJ1VyaW5nJzonXFx1MDE2RScsJ3VydHJpJzonXFx1MjVGOScsJ3VzY3InOidcXHVEODM1XFx1RENDQScsJ1VzY3InOidcXHVEODM1XFx1RENCMCcsJ3V0ZG90JzonXFx1MjJGMCcsJ3V0aWxkZSc6J1xcdTAxNjknLCdVdGlsZGUnOidcXHUwMTY4JywndXRyaSc6J1xcdTI1QjUnLCd1dHJpZic6J1xcdTI1QjQnLCd1dWFycic6J1xcdTIxQzgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd1d2FuZ2xlJzonXFx1MjlBNycsJ3ZhbmdydCc6J1xcdTI5OUMnLCd2YXJlcHNpbG9uJzonXFx1MDNGNScsJ3ZhcmthcHBhJzonXFx1MDNGMCcsJ3Zhcm5vdGhpbmcnOidcXHUyMjA1JywndmFycGhpJzonXFx1MDNENScsJ3ZhcnBpJzonXFx1MDNENicsJ3ZhcnByb3B0byc6J1xcdTIyMUQnLCd2YXJyJzonXFx1MjE5NScsJ3ZBcnInOidcXHUyMUQ1JywndmFycmhvJzonXFx1MDNGMScsJ3ZhcnNpZ21hJzonXFx1MDNDMicsJ3ZhcnN1YnNldG5lcSc6J1xcdTIyOEFcXHVGRTAwJywndmFyc3Vic2V0bmVxcSc6J1xcdTJBQ0JcXHVGRTAwJywndmFyc3Vwc2V0bmVxJzonXFx1MjI4QlxcdUZFMDAnLCd2YXJzdXBzZXRuZXFxJzonXFx1MkFDQ1xcdUZFMDAnLCd2YXJ0aGV0YSc6J1xcdTAzRDEnLCd2YXJ0cmlhbmdsZWxlZnQnOidcXHUyMkIyJywndmFydHJpYW5nbGVyaWdodCc6J1xcdTIyQjMnLCd2QmFyJzonXFx1MkFFOCcsJ1ZiYXInOidcXHUyQUVCJywndkJhcnYnOidcXHUyQUU5JywndmN5JzonXFx1MDQzMicsJ1ZjeSc6J1xcdTA0MTInLCd2ZGFzaCc6J1xcdTIyQTInLCd2RGFzaCc6J1xcdTIyQTgnLCdWZGFzaCc6J1xcdTIyQTknLCdWRGFzaCc6J1xcdTIyQUInLCdWZGFzaGwnOidcXHUyQUU2JywndmVlJzonXFx1MjIyOCcsJ1ZlZSc6J1xcdTIyQzEnLCd2ZWViYXInOidcXHUyMkJCJywndmVlZXEnOidcXHUyMjVBJywndmVsbGlwJzonXFx1MjJFRScsJ3ZlcmJhcic6J3wnLCdWZXJiYXInOidcXHUyMDE2JywndmVydCc6J3wnLCdWZXJ0JzonXFx1MjAxNicsJ1ZlcnRpY2FsQmFyJzonXFx1MjIyMycsJ1ZlcnRpY2FsTGluZSc6J3wnLCdWZXJ0aWNhbFNlcGFyYXRvcic6J1xcdTI3NTgnLCdWZXJ0aWNhbFRpbGRlJzonXFx1MjI0MCcsJ1ZlcnlUaGluU3BhY2UnOidcXHUyMDBBJywndmZyJzonXFx1RDgzNVxcdUREMzMnLCdWZnInOidcXHVEODM1XFx1REQxOScsJ3ZsdHJpJzonXFx1MjJCMicsJ3Zuc3ViJzonXFx1MjI4MlxcdTIwRDInLCd2bnN1cCc6J1xcdTIyODNcXHUyMEQyJywndm9wZic6J1xcdUQ4MzVcXHVERDY3JywnVm9wZic6J1xcdUQ4MzVcXHVERDREJywndnByb3AnOidcXHUyMjFEJywndnJ0cmknOidcXHUyMkIzJywndnNjcic6J1xcdUQ4MzVcXHVEQ0NCJywnVnNjcic6J1xcdUQ4MzVcXHVEQ0IxJywndnN1Ym5lJzonXFx1MjI4QVxcdUZFMDAnLCd2c3VibkUnOidcXHUyQUNCXFx1RkUwMCcsJ3ZzdXBuZSc6J1xcdTIyOEJcXHVGRTAwJywndnN1cG5FJzonXFx1MkFDQ1xcdUZFMDAnLCdWdmRhc2gnOidcXHUyMkFBJywndnppZ3phZyc6J1xcdTI5OUEnLCd3Y2lyYyc6J1xcdTAxNzUnLCdXY2lyYyc6J1xcdTAxNzQnLCd3ZWRiYXInOidcXHUyQTVGJywnd2VkZ2UnOidcXHUyMjI3JywnV2VkZ2UnOidcXHUyMkMwJywnd2VkZ2VxJzonXFx1MjI1OScsJ3dlaWVycCc6J1xcdTIxMTgnLCd3ZnInOidcXHVEODM1XFx1REQzNCcsJ1dmcic6J1xcdUQ4MzVcXHVERDFBJywnd29wZic6J1xcdUQ4MzVcXHVERDY4JywnV29wZic6J1xcdUQ4MzVcXHVERDRFJywnd3AnOidcXHUyMTE4Jywnd3InOidcXHUyMjQwJywnd3JlYXRoJzonXFx1MjI0MCcsJ3dzY3InOidcXHVEODM1XFx1RENDQycsJ1dzY3InOidcXHVEODM1XFx1RENCMicsJ3hjYXAnOidcXHUyMkMyJywneGNpcmMnOidcXHUyNUVGJywneGN1cCc6J1xcdTIyQzMnLCd4ZHRyaSc6J1xcdTI1QkQnLCd4ZnInOidcXHVEODM1XFx1REQzNScsJ1hmcic6J1xcdUQ4MzVcXHVERDFCJywneGhhcnInOidcXHUyN0Y3JywneGhBcnInOidcXHUyN0ZBJywneGknOidcXHUwM0JFJywnWGknOidcXHUwMzlFJywneGxhcnInOidcXHUyN0Y1JywneGxBcnInOidcXHUyN0Y4JywneG1hcCc6J1xcdTI3RkMnLCd4bmlzJzonXFx1MjJGQicsJ3hvZG90JzonXFx1MkEwMCcsJ3hvcGYnOidcXHVEODM1XFx1REQ2OScsJ1hvcGYnOidcXHVEODM1XFx1REQ0RicsJ3hvcGx1cyc6J1xcdTJBMDEnLCd4b3RpbWUnOidcXHUyQTAyJywneHJhcnInOidcXHUyN0Y2JywneHJBcnInOidcXHUyN0Y5JywneHNjcic6J1xcdUQ4MzVcXHVEQ0NEJywnWHNjcic6J1xcdUQ4MzVcXHVEQ0IzJywneHNxY3VwJzonXFx1MkEwNicsJ3h1cGx1cyc6J1xcdTJBMDQnLCd4dXRyaSc6J1xcdTI1QjMnLCd4dmVlJzonXFx1MjJDMScsJ3h3ZWRnZSc6J1xcdTIyQzAnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWFjeSc6J1xcdTA0NEYnLCdZQWN5JzonXFx1MDQyRicsJ3ljaXJjJzonXFx1MDE3NycsJ1ljaXJjJzonXFx1MDE3NicsJ3ljeSc6J1xcdTA0NEInLCdZY3knOidcXHUwNDJCJywneWVuJzonXFx4QTUnLCd5ZnInOidcXHVEODM1XFx1REQzNicsJ1lmcic6J1xcdUQ4MzVcXHVERDFDJywneWljeSc6J1xcdTA0NTcnLCdZSWN5JzonXFx1MDQwNycsJ3lvcGYnOidcXHVEODM1XFx1REQ2QScsJ1lvcGYnOidcXHVEODM1XFx1REQ1MCcsJ3lzY3InOidcXHVEODM1XFx1RENDRScsJ1lzY3InOidcXHVEODM1XFx1RENCNCcsJ3l1Y3knOidcXHUwNDRFJywnWVVjeSc6J1xcdTA0MkUnLCd5dW1sJzonXFx4RkYnLCdZdW1sJzonXFx1MDE3OCcsJ3phY3V0ZSc6J1xcdTAxN0EnLCdaYWN1dGUnOidcXHUwMTc5JywnemNhcm9uJzonXFx1MDE3RScsJ1pjYXJvbic6J1xcdTAxN0QnLCd6Y3knOidcXHUwNDM3JywnWmN5JzonXFx1MDQxNycsJ3pkb3QnOidcXHUwMTdDJywnWmRvdCc6J1xcdTAxN0InLCd6ZWV0cmYnOidcXHUyMTI4JywnWmVyb1dpZHRoU3BhY2UnOidcXHUyMDBCJywnemV0YSc6J1xcdTAzQjYnLCdaZXRhJzonXFx1MDM5NicsJ3pmcic6J1xcdUQ4MzVcXHVERDM3JywnWmZyJzonXFx1MjEyOCcsJ3poY3knOidcXHUwNDM2JywnWkhjeSc6J1xcdTA0MTYnLCd6aWdyYXJyJzonXFx1MjFERCcsJ3pvcGYnOidcXHVEODM1XFx1REQ2QicsJ1pvcGYnOidcXHUyMTI0JywnenNjcic6J1xcdUQ4MzVcXHVEQ0NGJywnWnNjcic6J1xcdUQ4MzVcXHVEQ0I1JywnendqJzonXFx1MjAwRCcsJ3p3bmonOidcXHUyMDBDJ307XG5cdHZhciBkZWNvZGVNYXBMZWdhY3kgPSB7J2FhY3V0ZSc6J1xceEUxJywnQWFjdXRlJzonXFx4QzEnLCdhY2lyYyc6J1xceEUyJywnQWNpcmMnOidcXHhDMicsJ2FjdXRlJzonXFx4QjQnLCdhZWxpZyc6J1xceEU2JywnQUVsaWcnOidcXHhDNicsJ2FncmF2ZSc6J1xceEUwJywnQWdyYXZlJzonXFx4QzAnLCdhbXAnOicmJywnQU1QJzonJicsJ2FyaW5nJzonXFx4RTUnLCdBcmluZyc6J1xceEM1JywnYXRpbGRlJzonXFx4RTMnLCdBdGlsZGUnOidcXHhDMycsJ2F1bWwnOidcXHhFNCcsJ0F1bWwnOidcXHhDNCcsJ2JydmJhcic6J1xceEE2JywnY2NlZGlsJzonXFx4RTcnLCdDY2VkaWwnOidcXHhDNycsJ2NlZGlsJzonXFx4QjgnLCdjZW50JzonXFx4QTInLCdjb3B5JzonXFx4QTknLCdDT1BZJzonXFx4QTknLCdjdXJyZW4nOidcXHhBNCcsJ2RlZyc6J1xceEIwJywnZGl2aWRlJzonXFx4RjcnLCdlYWN1dGUnOidcXHhFOScsJ0VhY3V0ZSc6J1xceEM5JywnZWNpcmMnOidcXHhFQScsJ0VjaXJjJzonXFx4Q0EnLCdlZ3JhdmUnOidcXHhFOCcsJ0VncmF2ZSc6J1xceEM4JywnZXRoJzonXFx4RjAnLCdFVEgnOidcXHhEMCcsJ2V1bWwnOidcXHhFQicsJ0V1bWwnOidcXHhDQicsJ2ZyYWMxMic6J1xceEJEJywnZnJhYzE0JzonXFx4QkMnLCdmcmFjMzQnOidcXHhCRScsJ2d0JzonPicsJ0dUJzonPicsJ2lhY3V0ZSc6J1xceEVEJywnSWFjdXRlJzonXFx4Q0QnLCdpY2lyYyc6J1xceEVFJywnSWNpcmMnOidcXHhDRScsJ2lleGNsJzonXFx4QTEnLCdpZ3JhdmUnOidcXHhFQycsJ0lncmF2ZSc6J1xceENDJywnaXF1ZXN0JzonXFx4QkYnLCdpdW1sJzonXFx4RUYnLCdJdW1sJzonXFx4Q0YnLCdsYXF1byc6J1xceEFCJywnbHQnOic8JywnTFQnOic8JywnbWFjcic6J1xceEFGJywnbWljcm8nOidcXHhCNScsJ21pZGRvdCc6J1xceEI3JywnbmJzcCc6J1xceEEwJywnbm90JzonXFx4QUMnLCdudGlsZGUnOidcXHhGMScsJ050aWxkZSc6J1xceEQxJywnb2FjdXRlJzonXFx4RjMnLCdPYWN1dGUnOidcXHhEMycsJ29jaXJjJzonXFx4RjQnLCdPY2lyYyc6J1xceEQ0Jywnb2dyYXZlJzonXFx4RjInLCdPZ3JhdmUnOidcXHhEMicsJ29yZGYnOidcXHhBQScsJ29yZG0nOidcXHhCQScsJ29zbGFzaCc6J1xceEY4JywnT3NsYXNoJzonXFx4RDgnLCdvdGlsZGUnOidcXHhGNScsJ090aWxkZSc6J1xceEQ1Jywnb3VtbCc6J1xceEY2JywnT3VtbCc6J1xceEQ2JywncGFyYSc6J1xceEI2JywncGx1c21uJzonXFx4QjEnLCdwb3VuZCc6J1xceEEzJywncXVvdCc6J1wiJywnUVVPVCc6J1wiJywncmFxdW8nOidcXHhCQicsJ3JlZyc6J1xceEFFJywnUkVHJzonXFx4QUUnLCdzZWN0JzonXFx4QTcnLCdzaHknOidcXHhBRCcsJ3N1cDEnOidcXHhCOScsJ3N1cDInOidcXHhCMicsJ3N1cDMnOidcXHhCMycsJ3N6bGlnJzonXFx4REYnLCd0aG9ybic6J1xceEZFJywnVEhPUk4nOidcXHhERScsJ3RpbWVzJzonXFx4RDcnLCd1YWN1dGUnOidcXHhGQScsJ1VhY3V0ZSc6J1xceERBJywndWNpcmMnOidcXHhGQicsJ1VjaXJjJzonXFx4REInLCd1Z3JhdmUnOidcXHhGOScsJ1VncmF2ZSc6J1xceEQ5JywndW1sJzonXFx4QTgnLCd1dW1sJzonXFx4RkMnLCdVdW1sJzonXFx4REMnLCd5YWN1dGUnOidcXHhGRCcsJ1lhY3V0ZSc6J1xceEREJywneWVuJzonXFx4QTUnLCd5dW1sJzonXFx4RkYnfTtcblx0dmFyIGRlY29kZU1hcE51bWVyaWMgPSB7JzAnOidcXHVGRkZEJywnMTI4JzonXFx1MjBBQycsJzEzMCc6J1xcdTIwMUEnLCcxMzEnOidcXHUwMTkyJywnMTMyJzonXFx1MjAxRScsJzEzMyc6J1xcdTIwMjYnLCcxMzQnOidcXHUyMDIwJywnMTM1JzonXFx1MjAyMScsJzEzNic6J1xcdTAyQzYnLCcxMzcnOidcXHUyMDMwJywnMTM4JzonXFx1MDE2MCcsJzEzOSc6J1xcdTIwMzknLCcxNDAnOidcXHUwMTUyJywnMTQyJzonXFx1MDE3RCcsJzE0NSc6J1xcdTIwMTgnLCcxNDYnOidcXHUyMDE5JywnMTQ3JzonXFx1MjAxQycsJzE0OCc6J1xcdTIwMUQnLCcxNDknOidcXHUyMDIyJywnMTUwJzonXFx1MjAxMycsJzE1MSc6J1xcdTIwMTQnLCcxNTInOidcXHUwMkRDJywnMTUzJzonXFx1MjEyMicsJzE1NCc6J1xcdTAxNjEnLCcxNTUnOidcXHUyMDNBJywnMTU2JzonXFx1MDE1MycsJzE1OCc6J1xcdTAxN0UnLCcxNTknOidcXHUwMTc4J307XG5cdHZhciBpbnZhbGlkUmVmZXJlbmNlQ29kZVBvaW50cyA9IFsxLDIsMyw0LDUsNiw3LDgsMTEsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMTI3LDEyOCwxMjksMTMwLDEzMSwxMzIsMTMzLDEzNCwxMzUsMTM2LDEzNywxMzgsMTM5LDE0MCwxNDEsMTQyLDE0MywxNDQsMTQ1LDE0NiwxNDcsMTQ4LDE0OSwxNTAsMTUxLDE1MiwxNTMsMTU0LDE1NSwxNTYsMTU3LDE1OCwxNTksNjQ5NzYsNjQ5NzcsNjQ5NzgsNjQ5NzksNjQ5ODAsNjQ5ODEsNjQ5ODIsNjQ5ODMsNjQ5ODQsNjQ5ODUsNjQ5ODYsNjQ5ODcsNjQ5ODgsNjQ5ODksNjQ5OTAsNjQ5OTEsNjQ5OTIsNjQ5OTMsNjQ5OTQsNjQ5OTUsNjQ5OTYsNjQ5OTcsNjQ5OTgsNjQ5OTksNjUwMDAsNjUwMDEsNjUwMDIsNjUwMDMsNjUwMDQsNjUwMDUsNjUwMDYsNjUwMDcsNjU1MzQsNjU1MzUsMTMxMDcwLDEzMTA3MSwxOTY2MDYsMTk2NjA3LDI2MjE0MiwyNjIxNDMsMzI3Njc4LDMyNzY3OSwzOTMyMTQsMzkzMjE1LDQ1ODc1MCw0NTg3NTEsNTI0Mjg2LDUyNDI4Nyw1ODk4MjIsNTg5ODIzLDY1NTM1OCw2NTUzNTksNzIwODk0LDcyMDg5NSw3ODY0MzAsNzg2NDMxLDg1MTk2Niw4NTE5NjcsOTE3NTAyLDkxNzUwMyw5ODMwMzgsOTgzMDM5LDEwNDg1NzQsMTA0ODU3NSwxMTE0MTEwLDExMTQxMTFdO1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBzdHJpbmdGcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuXG5cdHZhciBvYmplY3QgPSB7fTtcblx0dmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0Lmhhc093blByb3BlcnR5O1xuXHR2YXIgaGFzID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eU5hbWUpIHtcblx0XHRyZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5TmFtZSk7XG5cdH07XG5cblx0dmFyIGNvbnRhaW5zID0gZnVuY3Rpb24oYXJyYXksIHZhbHVlKSB7XG5cdFx0dmFyIGluZGV4ID0gLTE7XG5cdFx0dmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcblx0XHR3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuXHRcdFx0aWYgKGFycmF5W2luZGV4XSA9PSB2YWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cdHZhciBtZXJnZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIGRlZmF1bHRzKSB7XG5cdFx0aWYgKCFvcHRpb25zKSB7XG5cdFx0XHRyZXR1cm4gZGVmYXVsdHM7XG5cdFx0fVxuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHR2YXIga2V5O1xuXHRcdGZvciAoa2V5IGluIGRlZmF1bHRzKSB7XG5cdFx0XHQvLyBBIGBoYXNPd25Qcm9wZXJ0eWAgY2hlY2sgaXMgbm90IG5lZWRlZCBoZXJlLCBzaW5jZSBvbmx5IHJlY29nbml6ZWRcblx0XHRcdC8vIG9wdGlvbiBuYW1lcyBhcmUgdXNlZCBhbnl3YXkuIEFueSBvdGhlcnMgYXJlIGlnbm9yZWQuXG5cdFx0XHRyZXN1bHRba2V5XSA9IGhhcyhvcHRpb25zLCBrZXkpID8gb3B0aW9uc1trZXldIDogZGVmYXVsdHNba2V5XTtcblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fTtcblxuXHQvLyBNb2RpZmllZCB2ZXJzaW9uIG9mIGB1Y3MyZW5jb2RlYDsgc2VlIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZS5cblx0dmFyIGNvZGVQb2ludFRvU3ltYm9sID0gZnVuY3Rpb24oY29kZVBvaW50LCBzdHJpY3QpIHtcblx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0aWYgKChjb2RlUG9pbnQgPj0gMHhEODAwICYmIGNvZGVQb2ludCA8PSAweERGRkYpIHx8IGNvZGVQb2ludCA+IDB4MTBGRkZGKSB7XG5cdFx0XHQvLyBTZWUgaXNzdWUgIzQ6XG5cdFx0XHQvLyDigJxPdGhlcndpc2UsIGlmIHRoZSBudW1iZXIgaXMgaW4gdGhlIHJhbmdlIDB4RDgwMCB0byAweERGRkYgb3IgaXNcblx0XHRcdC8vIGdyZWF0ZXIgdGhhbiAweDEwRkZGRiwgdGhlbiB0aGlzIGlzIGEgcGFyc2UgZXJyb3IuIFJldHVybiBhIFUrRkZGRFxuXHRcdFx0Ly8gUkVQTEFDRU1FTlQgQ0hBUkFDVEVSLuKAnVxuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIG91dHNpZGUgdGhlIHBlcm1pc3NpYmxlIFVuaWNvZGUgcmFuZ2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAnXFx1RkZGRCc7XG5cdFx0fVxuXHRcdGlmIChoYXMoZGVjb2RlTWFwTnVtZXJpYywgY29kZVBvaW50KSkge1xuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKCdkaXNhbGxvd2VkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBkZWNvZGVNYXBOdW1lcmljW2NvZGVQb2ludF07XG5cdFx0fVxuXHRcdGlmIChzdHJpY3QgJiYgY29udGFpbnMoaW52YWxpZFJlZmVyZW5jZUNvZGVQb2ludHMsIGNvZGVQb2ludCkpIHtcblx0XHRcdHBhcnNlRXJyb3IoJ2Rpc2FsbG93ZWQgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdH1cblx0XHRpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG5cdFx0XHRjb2RlUG9pbnQgLT0gMHgxMDAwMDtcblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKTtcblx0XHRcdGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGO1xuXHRcdH1cblx0XHRvdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCk7XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fTtcblxuXHR2YXIgaGV4RXNjYXBlID0gZnVuY3Rpb24oY29kZVBvaW50KSB7XG5cdFx0cmV0dXJuICcmI3gnICsgY29kZVBvaW50LnRvU3RyaW5nKDE2KS50b1VwcGVyQ2FzZSgpICsgJzsnO1xuXHR9O1xuXG5cdHZhciBkZWNFc2NhcGUgPSBmdW5jdGlvbihjb2RlUG9pbnQpIHtcblx0XHRyZXR1cm4gJyYjJyArIGNvZGVQb2ludCArICc7Jztcblx0fTtcblxuXHR2YXIgcGFyc2VFcnJvciA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcblx0XHR0aHJvdyBFcnJvcignUGFyc2UgZXJyb3I6ICcgKyBtZXNzYWdlKTtcblx0fTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHR2YXIgZW5jb2RlID0gZnVuY3Rpb24oc3RyaW5nLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGVuY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRSYXdDb2RlUG9pbnQudGVzdChzdHJpbmcpKSB7XG5cdFx0XHRwYXJzZUVycm9yKCdmb3JiaWRkZW4gY29kZSBwb2ludCcpO1xuXHRcdH1cblx0XHR2YXIgZW5jb2RlRXZlcnl0aGluZyA9IG9wdGlvbnMuZW5jb2RlRXZlcnl0aGluZztcblx0XHR2YXIgdXNlTmFtZWRSZWZlcmVuY2VzID0gb3B0aW9ucy51c2VOYW1lZFJlZmVyZW5jZXM7XG5cdFx0dmFyIGFsbG93VW5zYWZlU3ltYm9scyA9IG9wdGlvbnMuYWxsb3dVbnNhZmVTeW1ib2xzO1xuXHRcdHZhciBlc2NhcGVDb2RlUG9pbnQgPSBvcHRpb25zLmRlY2ltYWwgPyBkZWNFc2NhcGUgOiBoZXhFc2NhcGU7XG5cblx0XHR2YXIgZXNjYXBlQm1wU3ltYm9sID0gZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KHN5bWJvbC5jaGFyQ29kZUF0KDApKTtcblx0XHR9O1xuXG5cdFx0aWYgKGVuY29kZUV2ZXJ5dGhpbmcpIHtcblx0XHRcdC8vIEVuY29kZSBBU0NJSSBzeW1ib2xzLlxuXHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhBc2NpaVdoaXRlbGlzdCwgZnVuY3Rpb24oc3ltYm9sKSB7XG5cdFx0XHRcdC8vIFVzZSBuYW1lZCByZWZlcmVuY2VzIGlmIHJlcXVlc3RlZCAmIHBvc3NpYmxlLlxuXHRcdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzICYmIGhhcyhlbmNvZGVNYXAsIHN5bWJvbCkpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyYnICsgZW5jb2RlTWFwW3N5bWJvbF0gKyAnOyc7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGVzY2FwZUJtcFN5bWJvbChzeW1ib2wpO1xuXHRcdFx0fSk7XG5cdFx0XHQvLyBTaG9ydGVuIGEgZmV3IGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZVxuXHRcdFx0Ly8gaXMgd2l0aGluIHRoZSBBU0NJSSByYW5nZS5cblx0XHRcdGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nXG5cdFx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHRcdC5yZXBsYWNlKC8mbHQ7XFx1MjBEMi9nLCAnJm52bHQ7Jylcblx0XHRcdFx0XHQucmVwbGFjZSgvJiN4NjY7JiN4NkE7L2csICcmZmpsaWc7Jyk7XG5cdFx0XHR9XG5cdFx0XHQvLyBFbmNvZGUgbm9uLUFTQ0lJIHN5bWJvbHMuXG5cdFx0XHRpZiAodXNlTmFtZWRSZWZlcmVuY2VzKSB7XG5cdFx0XHRcdC8vIEVuY29kZSBub24tQVNDSUkgc3ltYm9scyB0aGF0IGNhbiBiZSByZXBsYWNlZCB3aXRoIGEgbmFtZWQgcmVmZXJlbmNlLlxuXHRcdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZW5jb2RlTWFwLCBzdHJpbmcpYCBoZXJlLlxuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7Jztcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBOb3RlOiBhbnkgcmVtYWluaW5nIG5vbi1BU0NJSSBzeW1ib2xzIGFyZSBoYW5kbGVkIG91dHNpZGUgb2YgdGhlIGBpZmAuXG5cdFx0fSBlbHNlIGlmICh1c2VOYW1lZFJlZmVyZW5jZXMpIHtcblx0XHRcdC8vIEFwcGx5IG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0Ly8gRW5jb2RlIGA8PlwiJyZgIHVzaW5nIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzLlxuXHRcdFx0aWYgKCFhbGxvd1Vuc2FmZVN5bWJvbHMpIHtcblx0XHRcdFx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocmVnZXhFc2NhcGUsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0XHRcdHJldHVybiAnJicgKyBlbmNvZGVNYXBbc3RyaW5nXSArICc7JzsgLy8gbm8gbmVlZCB0byBjaGVjayBgaGFzKClgIGhlcmVcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBTaG9ydGVuIGVzY2FwZXMgdGhhdCByZXByZXNlbnQgdHdvIHN5bWJvbHMsIG9mIHdoaWNoIGF0IGxlYXN0IG9uZSBpc1xuXHRcdFx0Ly8gYDw+XCInJmAuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmdcblx0XHRcdFx0LnJlcGxhY2UoLyZndDtcXHUyMEQyL2csICcmbnZndDsnKVxuXHRcdFx0XHQucmVwbGFjZSgvJmx0O1xcdTIwRDIvZywgJyZudmx0OycpO1xuXHRcdFx0Ly8gRW5jb2RlIG5vbi1BU0NJSSBzeW1ib2xzIHRoYXQgY2FuIGJlIHJlcGxhY2VkIHdpdGggYSBuYW1lZCByZWZlcmVuY2UuXG5cdFx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleEVuY29kZU5vbkFzY2lpLCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGVuY29kZU1hcCwgc3RyaW5nKWAgaGVyZS5cblx0XHRcdFx0cmV0dXJuICcmJyArIGVuY29kZU1hcFtzdHJpbmddICsgJzsnO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmICghYWxsb3dVbnNhZmVTeW1ib2xzKSB7XG5cdFx0XHQvLyBFbmNvZGUgYDw+XCInJmAgdXNpbmcgaGV4YWRlY2ltYWwgZXNjYXBlcywgbm93IHRoYXQgdGhleeKAmXJlIG5vdCBoYW5kbGVkXG5cdFx0XHQvLyB1c2luZyBuYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlcy5cblx0XHRcdHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJlZ2V4RXNjYXBlLCBlc2NhcGVCbXBTeW1ib2wpO1xuXHRcdH1cblx0XHRyZXR1cm4gc3RyaW5nXG5cdFx0XHQvLyBFbmNvZGUgYXN0cmFsIHN5bWJvbHMuXG5cdFx0XHQucmVwbGFjZShyZWdleEFzdHJhbFN5bWJvbHMsIGZ1bmN0aW9uKCQwKSB7XG5cdFx0XHRcdC8vIGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nI3N1cnJvZ2F0ZS1mb3JtdWxhZVxuXHRcdFx0XHR2YXIgaGlnaCA9ICQwLmNoYXJDb2RlQXQoMCk7XG5cdFx0XHRcdHZhciBsb3cgPSAkMC5jaGFyQ29kZUF0KDEpO1xuXHRcdFx0XHR2YXIgY29kZVBvaW50ID0gKGhpZ2ggLSAweEQ4MDApICogMHg0MDAgKyBsb3cgLSAweERDMDAgKyAweDEwMDAwO1xuXHRcdFx0XHRyZXR1cm4gZXNjYXBlQ29kZVBvaW50KGNvZGVQb2ludCk7XG5cdFx0XHR9KVxuXHRcdFx0Ly8gRW5jb2RlIGFueSByZW1haW5pbmcgQk1QIHN5bWJvbHMgdGhhdCBhcmUgbm90IHByaW50YWJsZSBBU0NJSSBzeW1ib2xzXG5cdFx0XHQvLyB1c2luZyBhIGhleGFkZWNpbWFsIGVzY2FwZS5cblx0XHRcdC5yZXBsYWNlKHJlZ2V4Qm1wV2hpdGVsaXN0LCBlc2NhcGVCbXBTeW1ib2wpO1xuXHR9O1xuXHQvLyBFeHBvc2UgZGVmYXVsdCBvcHRpb25zIChzbyB0aGV5IGNhbiBiZSBvdmVycmlkZGVuIGdsb2JhbGx5KS5cblx0ZW5jb2RlLm9wdGlvbnMgPSB7XG5cdFx0J2FsbG93VW5zYWZlU3ltYm9scyc6IGZhbHNlLFxuXHRcdCdlbmNvZGVFdmVyeXRoaW5nJzogZmFsc2UsXG5cdFx0J3N0cmljdCc6IGZhbHNlLFxuXHRcdCd1c2VOYW1lZFJlZmVyZW5jZXMnOiBmYWxzZSxcblx0XHQnZGVjaW1hbCcgOiBmYWxzZVxuXHR9O1xuXG5cdHZhciBkZWNvZGUgPSBmdW5jdGlvbihodG1sLCBvcHRpb25zKSB7XG5cdFx0b3B0aW9ucyA9IG1lcmdlKG9wdGlvbnMsIGRlY29kZS5vcHRpb25zKTtcblx0XHR2YXIgc3RyaWN0ID0gb3B0aW9ucy5zdHJpY3Q7XG5cdFx0aWYgKHN0cmljdCAmJiByZWdleEludmFsaWRFbnRpdHkudGVzdChodG1sKSkge1xuXHRcdFx0cGFyc2VFcnJvcignbWFsZm9ybWVkIGNoYXJhY3RlciByZWZlcmVuY2UnKTtcblx0XHR9XG5cdFx0cmV0dXJuIGh0bWwucmVwbGFjZShyZWdleERlY29kZSwgZnVuY3Rpb24oJDAsICQxLCAkMiwgJDMsICQ0LCAkNSwgJDYsICQ3LCAkOCkge1xuXHRcdFx0dmFyIGNvZGVQb2ludDtcblx0XHRcdHZhciBzZW1pY29sb247XG5cdFx0XHR2YXIgZGVjRGlnaXRzO1xuXHRcdFx0dmFyIGhleERpZ2l0cztcblx0XHRcdHZhciByZWZlcmVuY2U7XG5cdFx0XHR2YXIgbmV4dDtcblxuXHRcdFx0aWYgKCQxKSB7XG5cdFx0XHRcdHJlZmVyZW5jZSA9ICQxO1xuXHRcdFx0XHQvLyBOb3RlOiB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGBoYXMoZGVjb2RlTWFwLCByZWZlcmVuY2UpYC5cblx0XHRcdFx0cmV0dXJuIGRlY29kZU1hcFtyZWZlcmVuY2VdO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoJDIpIHtcblx0XHRcdFx0Ly8gRGVjb2RlIG5hbWVkIGNoYXJhY3RlciByZWZlcmVuY2VzIHdpdGhvdXQgdHJhaWxpbmcgYDtgLCBlLmcuIGAmYW1wYC5cblx0XHRcdFx0Ly8gVGhpcyBpcyBvbmx5IGEgcGFyc2UgZXJyb3IgaWYgaXQgZ2V0cyBjb252ZXJ0ZWQgdG8gYCZgLCBvciBpZiBpdCBpc1xuXHRcdFx0XHQvLyBmb2xsb3dlZCBieSBgPWAgaW4gYW4gYXR0cmlidXRlIGNvbnRleHQuXG5cdFx0XHRcdHJlZmVyZW5jZSA9ICQyO1xuXHRcdFx0XHRuZXh0ID0gJDM7XG5cdFx0XHRcdGlmIChuZXh0ICYmIG9wdGlvbnMuaXNBdHRyaWJ1dGVWYWx1ZSkge1xuXHRcdFx0XHRcdGlmIChzdHJpY3QgJiYgbmV4dCA9PSAnPScpIHtcblx0XHRcdFx0XHRcdHBhcnNlRXJyb3IoJ2AmYCBkaWQgbm90IHN0YXJ0IGEgY2hhcmFjdGVyIHJlZmVyZW5jZScpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gJDA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRcdFx0cGFyc2VFcnJvcihcblx0XHRcdFx0XHRcdFx0J25hbWVkIGNoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJ1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gTm90ZTogdGhlcmUgaXMgbm8gbmVlZCB0byBjaGVjayBgaGFzKGRlY29kZU1hcExlZ2FjeSwgcmVmZXJlbmNlKWAuXG5cdFx0XHRcdFx0cmV0dXJuIGRlY29kZU1hcExlZ2FjeVtyZWZlcmVuY2VdICsgKG5leHQgfHwgJycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkNCkge1xuXHRcdFx0XHQvLyBEZWNvZGUgZGVjaW1hbCBlc2NhcGVzLCBlLmcuIGAmIzExOTU1ODtgLlxuXHRcdFx0XHRkZWNEaWdpdHMgPSAkNDtcblx0XHRcdFx0c2VtaWNvbG9uID0gJDU7XG5cdFx0XHRcdGlmIChzdHJpY3QgJiYgIXNlbWljb2xvbikge1xuXHRcdFx0XHRcdHBhcnNlRXJyb3IoJ2NoYXJhY3RlciByZWZlcmVuY2Ugd2FzIG5vdCB0ZXJtaW5hdGVkIGJ5IGEgc2VtaWNvbG9uJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29kZVBvaW50ID0gcGFyc2VJbnQoZGVjRGlnaXRzLCAxMCk7XG5cdFx0XHRcdHJldHVybiBjb2RlUG9pbnRUb1N5bWJvbChjb2RlUG9pbnQsIHN0cmljdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgkNikge1xuXHRcdFx0XHQvLyBEZWNvZGUgaGV4YWRlY2ltYWwgZXNjYXBlcywgZS5nLiBgJiN4MUQzMDY7YC5cblx0XHRcdFx0aGV4RGlnaXRzID0gJDY7XG5cdFx0XHRcdHNlbWljb2xvbiA9ICQ3O1xuXHRcdFx0XHRpZiAoc3RyaWN0ICYmICFzZW1pY29sb24pIHtcblx0XHRcdFx0XHRwYXJzZUVycm9yKCdjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvZGVQb2ludCA9IHBhcnNlSW50KGhleERpZ2l0cywgMTYpO1xuXHRcdFx0XHRyZXR1cm4gY29kZVBvaW50VG9TeW1ib2woY29kZVBvaW50LCBzdHJpY3QpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB3ZeKAmXJlIHN0aWxsIGhlcmUsIGBpZiAoJDcpYCBpcyBpbXBsaWVkOyBpdOKAmXMgYW4gYW1iaWd1b3VzXG5cdFx0XHQvLyBhbXBlcnNhbmQgZm9yIHN1cmUuIGh0dHBzOi8vbXRocy5iZS9ub3Rlcy9hbWJpZ3VvdXMtYW1wZXJzYW5kc1xuXHRcdFx0aWYgKHN0cmljdCkge1xuXHRcdFx0XHRwYXJzZUVycm9yKFxuXHRcdFx0XHRcdCduYW1lZCBjaGFyYWN0ZXIgcmVmZXJlbmNlIHdhcyBub3QgdGVybWluYXRlZCBieSBhIHNlbWljb2xvbidcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAkMDtcblx0XHR9KTtcblx0fTtcblx0Ly8gRXhwb3NlIGRlZmF1bHQgb3B0aW9ucyAoc28gdGhleSBjYW4gYmUgb3ZlcnJpZGRlbiBnbG9iYWxseSkuXG5cdGRlY29kZS5vcHRpb25zID0ge1xuXHRcdCdpc0F0dHJpYnV0ZVZhbHVlJzogZmFsc2UsXG5cdFx0J3N0cmljdCc6IGZhbHNlXG5cdH07XG5cblx0dmFyIGVzY2FwZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdHJldHVybiBzdHJpbmcucmVwbGFjZShyZWdleEVzY2FwZSwgZnVuY3Rpb24oJDApIHtcblx0XHRcdC8vIE5vdGU6IHRoZXJlIGlzIG5vIG5lZWQgdG8gY2hlY2sgYGhhcyhlc2NhcGVNYXAsICQwKWAgaGVyZS5cblx0XHRcdHJldHVybiBlc2NhcGVNYXBbJDBdO1xuXHRcdH0pO1xuXHR9O1xuXG5cdC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG5cdHZhciBoZSA9IHtcblx0XHQndmVyc2lvbic6ICcxLjIuMCcsXG5cdFx0J2VuY29kZSc6IGVuY29kZSxcblx0XHQnZGVjb2RlJzogZGVjb2RlLFxuXHRcdCdlc2NhcGUnOiBlc2NhcGUsXG5cdFx0J3VuZXNjYXBlJzogZGVjb2RlXG5cdH07XG5cblx0Ly8gU29tZSBBTUQgYnVpbGQgb3B0aW1pemVycywgbGlrZSByLmpzLCBjaGVjayBmb3Igc3BlY2lmaWMgY29uZGl0aW9uIHBhdHRlcm5zXG5cdC8vIGxpa2UgdGhlIGZvbGxvd2luZzpcblx0aWYgKFxuXHRcdHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJlxuXHRcdHR5cGVvZiBkZWZpbmUuYW1kID09ICdvYmplY3QnICYmXG5cdFx0ZGVmaW5lLmFtZFxuXHQpIHtcblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gaGU7XG5cdFx0fSk7XG5cdH1cdGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmICFmcmVlRXhwb3J0cy5ub2RlVHlwZSkge1xuXHRcdGlmIChmcmVlTW9kdWxlKSB7IC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IGhlO1xuXHRcdH0gZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gaGUpIHtcblx0XHRcdFx0aGFzKGhlLCBrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gaGVba2V5XSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2UgeyAvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5oZSA9IGhlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQge0pzb24yQ3N2fSA9IHJlcXVpcmUoJy4vanNvbjJjc3YnKSwgLy8gUmVxdWlyZSBvdXIganNvbi0yLWNzdiBjb2RlXG4gICAge0NzdjJKc29ufSA9IHJlcXVpcmUoJy4vY3N2Mmpzb24nKSwgLy8gUmVxdWlyZSBvdXIgY3N2LTItanNvbiBjb2RlXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGpzb24yY3N2OiAoZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpID0+IGNvbnZlcnQoSnNvbjJDc3YsIGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSxcbiAgICBjc3YyanNvbjogKGRhdGEsIGNhbGxiYWNrLCBvcHRpb25zKSA9PiBjb252ZXJ0KENzdjJKc29uLCBkYXRhLCBjYWxsYmFjaywgb3B0aW9ucyksXG4gICAganNvbjJjc3ZBc3luYzogKGpzb24sIG9wdGlvbnMpID0+IGNvbnZlcnRBc3luYyhKc29uMkNzdiwganNvbiwgb3B0aW9ucyksXG4gICAgY3N2Mmpzb25Bc3luYzogKGNzdiwgb3B0aW9ucykgPT4gY29udmVydEFzeW5jKENzdjJKc29uLCBjc3YsIG9wdGlvbnMpLFxuXG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgU2luY2UgdjMuMC4wXG4gICAgICovXG4gICAganNvbjJjc3ZQcm9taXNpZmllZDogKGpzb24sIG9wdGlvbnMpID0+IGRlcHJlY2F0ZWRBc3luYyhKc29uMkNzdiwgJ2pzb24yY3N2UHJvbWlzaWZpZWQoKScsICdqc29uMmNzdkFzeW5jKCknLCBqc29uLCBvcHRpb25zKSxcblxuICAgIC8qKlxuICAgICAqIEBkZXByZWNhdGVkIFNpbmNlIHYzLjAuMFxuICAgICAqL1xuICAgIGNzdjJqc29uUHJvbWlzaWZpZWQ6IChjc3YsIG9wdGlvbnMpID0+IGRlcHJlY2F0ZWRBc3luYyhDc3YySnNvbiwgJ2NzdjJqc29uUHJvbWlzaWZpZWQoKScsICdjc3YyanNvbkFzeW5jKCknLCBjc3YsIG9wdGlvbnMpXG59O1xuXG4vKipcbiAqIEFic3RyYWN0ZWQgY29udmVydGVyIGZ1bmN0aW9uIGZvciBqc29uMmNzdiBhbmQgY3N2Mmpzb24gZnVuY3Rpb25hbGl0eVxuICogVGFrZXMgaW4gdGhlIGNvbnZlcnRlciB0byBiZSB1c2VkIChlaXRoZXIgSnNvbjJDc3Ygb3IgQ3N2Mkpzb24pXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIGNhbGxiYWNrXG4gKiBAcGFyYW0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBjb252ZXJ0KGNvbnZlcnRlciwgZGF0YSwgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdXRpbHMuY29udmVydCh7XG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIGNhbGxiYWNrLFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBjb252ZXJ0ZXI6IGNvbnZlcnRlclxuICAgIH0pO1xufVxuXG4vKipcbiAqIFNpbXBsZSB3YXkgdG8gcHJvbWlzaWZ5IGEgY2FsbGJhY2sgdmVyc2lvbiBvZiBqc29uMmNzdiBvciBjc3YyanNvblxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGRhdGFcbiAqIEBwYXJhbSBvcHRpb25zXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxhbnk+fVxuICovXG5mdW5jdGlvbiBjb252ZXJ0QXN5bmMoY29udmVydGVyLCBkYXRhLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IGNvbnZlcnQoY29udmVydGVyLCBkYXRhLCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzb2x2ZShkYXRhKTtcbiAgICB9LCBvcHRpb25zKSk7XG59XG5cbi8qKlxuICogU2ltcGxlIHdheSB0byBwcm92aWRlIGEgZGVwcmVjYXRpb24gd2FybmluZyBmb3IgcHJldmlvdXMgcHJvbWlzaWZpZWQgdmVyc2lvbnNcbiAqIG9mIG1vZHVsZSBmdW5jdGlvbmFsaXR5LlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGRlcHJlY2F0ZWROYW1lXG4gKiBAcGFyYW0gcmVwbGFjZW1lbnROYW1lXG4gKiBAcGFyYW0gZGF0YVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtQcm9taXNlPGFueT59XG4gKi9cbmZ1bmN0aW9uIGRlcHJlY2F0ZWRBc3luYyhjb252ZXJ0ZXIsIGRlcHJlY2F0ZWROYW1lLCByZXBsYWNlbWVudE5hbWUsIGRhdGEsIG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLndhcm4oJ1dBUk5JTkc6ICcgKyBkZXByZWNhdGVkTmFtZSArICcgaXMgZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIHNvb24uIFBsZWFzZSB1c2UgJyArIHJlcGxhY2VtZW50TmFtZSArICcgaW5zdGVhZC4nKTtcbiAgICByZXR1cm4gY29udmVydEFzeW5jKGNvbnZlcnRlciwgZGF0YSwgb3B0aW9ucyk7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy5qc29uJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyksXG4gICAgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICBwYXRoID0gcmVxdWlyZSgnZG9jLXBhdGgnKTtcblxuY29uc3QgQ3N2Mkpzb24gPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgY29uc3QgZXNjYXBlZFdyYXBEZWxpbWl0ZXJSZWdleCA9IG5ldyBSZWdFeHAob3B0aW9ucy5kZWxpbWl0ZXIud3JhcCArIG9wdGlvbnMuZGVsaW1pdGVyLndyYXAsICdnJyksXG4gICAgICAgIGV4Y2VsQk9NUmVnZXggPSBuZXcgUmVnRXhwKCdeJyArIGNvbnN0YW50cy52YWx1ZXMuZXhjZWxCT00pO1xuXG4gICAgLyoqXG4gICAgICogVHJpbXMgdGhlIGhlYWRlciBrZXksIGlmIHNwZWNpZmllZCBieSB0aGUgdXNlciB2aWEgdGhlIHByb3ZpZGVkIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gaGVhZGVyS2V5XG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJvY2Vzc0hlYWRlcktleShoZWFkZXJLZXkpIHtcbiAgICAgICAgaGVhZGVyS2V5ID0gcmVtb3ZlV3JhcERlbGltaXRlcnNGcm9tVmFsdWUoaGVhZGVyS2V5KTtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUhlYWRlckZpZWxkcykge1xuICAgICAgICAgICAgcmV0dXJuIGhlYWRlcktleS5zcGxpdCgnLicpXG4gICAgICAgICAgICAgICAgLm1hcCgoY29tcG9uZW50KSA9PiBjb21wb25lbnQudHJpbSgpKVxuICAgICAgICAgICAgICAgIC5qb2luKCcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhlYWRlcktleTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZW5lcmF0ZSB0aGUgSlNPTiBoZWFkaW5nIGZyb20gdGhlIENTVlxuICAgICAqIEBwYXJhbSBsaW5lcyB7U3RyaW5nW119IGNzdiBsaW5lcyBzcGxpdCBieSBFT0wgZGVsaW1pdGVyXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVIZWFkaW5nKGxpbmVzKSB7XG4gICAgICAgIGxldCBwYXJhbXMgPSB7bGluZXN9LFxuICAgICAgICAgICAgLy8gR2VuZXJhdGUgYW5kIHJldHVybiB0aGUgaGVhZGluZyBrZXlzXG4gICAgICAgICAgICBoZWFkZXJSb3cgPSBwYXJhbXMubGluZXNbMF07XG4gICAgICAgIHBhcmFtcy5oZWFkZXJGaWVsZHMgPSBoZWFkZXJSb3cubWFwKChoZWFkZXJLZXksIGluZGV4KSA9PiAoe1xuICAgICAgICAgICAgdmFsdWU6IHByb2Nlc3NIZWFkZXJLZXkoaGVhZGVyS2V5KSxcbiAgICAgICAgICAgIGluZGV4OiBpbmRleFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgcHJvdmlkZWQga2V5cywgZmlsdGVyIHRoZSBnZW5lcmF0ZWQga2V5cyB0byBqdXN0IHRoZSB1c2VyIHByb3ZpZGVkIGtleXMgc28gd2UgYWxzbyBoYXZlIHRoZSBrZXkgaW5kZXhcbiAgICAgICAgaWYgKG9wdGlvbnMua2V5cykge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMuZmlsdGVyKChoZWFkZXJLZXkpID0+IG9wdGlvbnMua2V5cy5pbmNsdWRlcyhoZWFkZXJLZXkudmFsdWUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU3BsaXRzIHRoZSBsaW5lcyBvZiB0aGUgQ1NWIHN0cmluZyBieSB0aGUgRU9MIGRlbGltaXRlciBhbmQgcmVzb2x2ZXMgYW5kIGFycmF5IG9mIHN0cmluZ3MgKGxpbmVzKVxuICAgICAqIEBwYXJhbSBjc3ZcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZS48U3RyaW5nW10+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHNwbGl0Q3N2TGluZXMoY3N2KSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoc3BsaXRMaW5lcyhjc3YpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZW1vdmVzIHRoZSBFeGNlbCBCT00gdmFsdWUsIGlmIHNwZWNpZmllZCBieSB0aGUgb3B0aW9ucyBvYmplY3RcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICogQHJldHVybnMge1Byb21pc2UuPFN0cmluZz59XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3RyaXBFeGNlbEJPTShjc3YpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuZXhjZWxCT00pIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY3N2LnJlcGxhY2UoZXhjZWxCT01SZWdleCwgJycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNzdik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgc3BsaXRzIGEgbGluZSBzbyB0aGF0IHdlIGNhbiBoYW5kbGUgd3JhcHBlZCBmaWVsZHNcbiAgICAgKiBAcGFyYW0gY3N2XG4gICAgICovXG4gICAgZnVuY3Rpb24gc3BsaXRMaW5lcyhjc3YpIHtcbiAgICAgICAgLy8gUGFyc2Ugb3V0IHRoZSBsaW5lLi4uXG4gICAgICAgIGxldCBsaW5lcyA9IFtdLFxuICAgICAgICAgICAgc3BsaXRMaW5lID0gW10sXG4gICAgICAgICAgICBjaGFyYWN0ZXIsXG4gICAgICAgICAgICBjaGFyQmVmb3JlLFxuICAgICAgICAgICAgY2hhckFmdGVyLFxuICAgICAgICAgICAgbmV4dE5DaGFyLFxuICAgICAgICAgICAgbGFzdENoYXJhY3RlckluZGV4ID0gY3N2Lmxlbmd0aCAtIDEsXG4gICAgICAgICAgICBlb2xEZWxpbWl0ZXJMZW5ndGggPSBvcHRpb25zLmRlbGltaXRlci5lb2wubGVuZ3RoLFxuICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMgPSB7XG4gICAgICAgICAgICAgICAgaW5zaWRlV3JhcERlbGltaXRlcjogZmFsc2UsXG4gICAgICAgICAgICAgICAgcGFyc2luZ1ZhbHVlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGp1c3RQYXJzZWREb3VibGVRdW90ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3RhcnRJbmRleDogMFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluZGV4ID0gMDtcblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIGxpbmUgdG8gaWRlbnRpZnkgd2hlcmUgdG8gc3BsaXQgdGhlIHZhbHVlc1xuICAgICAgICB3aGlsZSAoaW5kZXggPCBjc3YubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDdXJyZW50IGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhcmFjdGVyID0gY3N2W2luZGV4XTtcbiAgICAgICAgICAgIC8vIFByZXZpb3VzIGNoYXJhY3RlclxuICAgICAgICAgICAgY2hhckJlZm9yZSA9IGluZGV4ID8gY3N2W2luZGV4IC0gMV0gOiAnJztcbiAgICAgICAgICAgIC8vIE5leHQgY2hhcmFjdGVyXG4gICAgICAgICAgICBjaGFyQWZ0ZXIgPSBpbmRleCA8IGxhc3RDaGFyYWN0ZXJJbmRleCA/IGNzdltpbmRleCArIDFdIDogJyc7XG4gICAgICAgICAgICAvLyBOZXh0IG4gY2hhcmFjdGVycywgaW5jbHVkaW5nIHRoZSBjdXJyZW50IGNoYXJhY3Rlciwgd2hlcmUgbiA9IGxlbmd0aChFT0wgZGVsaW1pdGVyKVxuICAgICAgICAgICAgLy8gVGhpcyBhbGxvd3MgZm9yIHRoZSBjaGVja2luZyBvZiBhbiBFT0wgZGVsaW1pdGVyIHdoZW4gaWYgaXQgaXMgbW9yZSB0aGFuIGEgc2luZ2xlIGNoYXJhY3RlciAoZWcuICdcXHJcXG4nKVxuICAgICAgICAgICAgbmV4dE5DaGFyID0gdXRpbHMuZ2V0TkNoYXJhY3RlcnMoY3N2LCBpbmRleCwgZW9sRGVsaW1pdGVyTGVuZ3RoKTtcblxuICAgICAgICAgICAgaWYgKChuZXh0TkNoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCAmJiAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciB8fFxuICAgICAgICAgICAgICAgIGluZGV4ID09PSBsYXN0Q2hhcmFjdGVySW5kZXgpICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcmVhY2hlZCBhbiBFT0wgZGVsaW1pdGVyIG9yIHRoZSBlbmQgb2YgdGhlIGNzdiBhbmQgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGZpZWxkIGRlbGltaXRlci4uLlxuXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIHN0YXJ0IGluZGV4IGlzIHRoZSBjdXJyZW50IGluZGV4IChhbmQgc2luY2UgdGhlIHByZXZpb3VzIGNoYXJhY3RlciBpcyBhIGNvbW1hKSxcbiAgICAgICAgICAgICAgICAvLyAgIHRoZW4gdGhlIHZhbHVlIGJlaW5nIHBhcnNlZCBpcyBhbiBlbXB0eSB2YWx1ZSBhY2NvcmRpbmdseSwgYWRkIGFuIGVtcHR5IHN0cmluZ1xuICAgICAgICAgICAgICAgIGxldCBwYXJzZWRWYWx1ZSA9IG5leHROQ2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sICYmIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPT09IGluZGV4XG4gICAgICAgICAgICAgICAgICAgID8gJydcbiAgICAgICAgICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGVyZSdzIGEgdmFsaWQgdmFsdWUsIGFuZCB0aGUgc3RhcnQgaW5kZXggaXNuJ3QgdGhlIGN1cnJlbnQgaW5kZXgsIGdyYWIgdGhlIHdob2xlIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgIDogY3N2LnN1YnN0cihzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4KTtcblxuICAgICAgICAgICAgICAgIC8vIFB1c2ggdGhlIHZhbHVlIGZvciB0aGUgZmllbGQgdGhhdCB3ZSB3ZXJlIHBhcnNpbmdcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChwYXJzZWRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGUgbGFzdCBjaGFyYWN0ZXIgaXMgYSBjb21tYSwgdGhlcmUncyBzdGlsbCBhbiBhZGRpdGlvbmFsIGltcGxpZWQgZmllbGQgdmFsdWUgdHJhaWxpbmcgdGhlIGNvbW1hLlxuICAgICAgICAgICAgICAgIC8vICAgU2luY2UgdGhpcyB2YWx1ZSBpcyBlbXB0eSwgd2UgcHVzaCBhbiBleHRyYSBlbXB0eSB2YWx1ZVxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKCcnKTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmFsbHksIHB1c2ggdGhlIHNwbGl0IGxpbmUgdmFsdWVzIGludG8gdGhlIGxpbmVzIGFycmF5IGFuZCBjbGVhciB0aGUgc3BsaXQgbGluZVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3BsaXRMaW5lKTtcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUgPSBbXTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyBlb2xEZWxpbWl0ZXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gbGFzdENoYXJhY3RlckluZGV4IHx8IG5leHROQ2hhciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZW9sICYmXG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgYXJlbid0IGluc2lkZSB3cmFwIGRlbGltaXRlcnMgb3IgaWYgd2UgYXJlIGJ1dCB0aGUgY2hhcmFjdGVyIGJlZm9yZSB3YXMgYSB3cmFwIGRlbGltaXRlciBhbmQgd2UgZGlkbid0IGp1c3Qgc2VlIHR3b1xuICAgICAgICAgICAgICAgICghc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciB8fFxuICAgICAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgIXN0YXRlVmFyaWFibGVzLmp1c3RQYXJzZWREb3VibGVRdW90ZSkpIHtcbiAgICAgICAgICAgICAgICAvLyBPdGhlcndpc2UgaWYgd2UgcmVhY2hlZCB0aGUgZW5kIG9mIHRoZSBsaW5lIG9yIGNzdiAoYW5kIGN1cnJlbnQgY2hhcmFjdGVyIGlzIG5vdCBhIGZpZWxkIGRlbGltaXRlcilcblxuICAgICAgICAgICAgICAgIGxldCB0b0luZGV4ID0gaW5kZXggIT09IGxhc3RDaGFyYWN0ZXJJbmRleCB8fCBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwID8gaW5kZXggOiB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXRyaWV2ZSB0aGUgcmVtYWluaW5nIHZhbHVlIGFuZCBhZGQgaXQgdG8gdGhlIHNwbGl0IGxpbmUgbGlzdCBvZiB2YWx1ZXNcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIHRvSW5kZXgpKTtcblxuICAgICAgICAgICAgICAgIC8vIEZpbmFsbHksIHB1c2ggdGhlIHNwbGl0IGxpbmUgdmFsdWVzIGludG8gdGhlIGxpbmVzIGFycmF5IGFuZCBjbGVhciB0aGUgc3BsaXQgbGluZVxuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2goc3BsaXRMaW5lKTtcbiAgICAgICAgICAgICAgICBzcGxpdExpbmUgPSBbXTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyBlb2xEZWxpbWl0ZXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuICAgICAgICAgICAgfSBlbHNlIGlmICgoY2hhckJlZm9yZSAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCB8fCBzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCkgJiZcbiAgICAgICAgICAgICAgICBjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgdXRpbHMuZ2V0TkNoYXJhY3RlcnMoY3N2LCBpbmRleCArIDEsIGVvbERlbGltaXRlckxlbmd0aCkgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmVvbCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoIGEgd3JhcCB3aGljaCBpcyBub3QgcHJlY2VkZWQgYnkgYSB3cmFwIGRlbGltIGFuZCB0aGUgbmV4dCBjaGFyYWN0ZXIgaXMgYW4gRU9MIGRlbGltIChpZS4gKlwiXFxuKVxuXG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vIE5leHQgaXRlcmF0aW9uIHdpbGwgc3Vic3RyaW5nLCBhZGQgdGhlIHZhbHVlIHRvIHRoZSBsaW5lLCBhbmQgcHVzaCB0aGUgbGluZSBvbnRvIHRoZSBhcnJheSBvZiBsaW5lc1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgKGluZGV4ID09PSAwIHx8IHV0aWxzLmdldE5DaGFyYWN0ZXJzKGNzdiwgaW5kZXggLSAxLCBlb2xEZWxpbWl0ZXJMZW5ndGgpID09PSBvcHRpb25zLmRlbGltaXRlci5lb2wpKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGxpbmUgc3RhcnRzIHdpdGggYSB3cmFwIGRlbGltaXRlciAoaWUuIFwiKilcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSB3cmFwIGRlbGltaXRlciB3aXRoIGEgZmllbGQgZGVsaW1pdGVyIGFmdGVyIGl0IChpZS4gKlwiLClcblxuICAgICAgICAgICAgICAgIHNwbGl0TGluZS5wdXNoKGNzdi5zdWJzdHJpbmcoc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCwgaW5kZXggKyAxKSk7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgMjsgLy8gbmV4dCB2YWx1ZSBzdGFydHMgYWZ0ZXIgdGhlIGZpZWxkIGRlbGltaXRlclxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGNoYXJCZWZvcmUgPT09IG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkICYmXG4gICAgICAgICAgICAgICAgIXN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgJiYgIXN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSB3cmFwIGRlbGltaXRlciBhZnRlciBhIGNvbW1hIGFuZCB3ZSBhcmVuJ3QgaW5zaWRlIGEgd3JhcCBkZWxpbWl0ZXJcblxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXggPSBpbmRleDtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckJlZm9yZSA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiZcbiAgICAgICAgICAgICAgICAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJiBzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgd3JhcCBkZWxpbWl0ZXIgd2l0aCBhIGZpZWxkIGRlbGltaXRlciBhZnRlciBpdCAoaWUuICxcIiopXG5cbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIGluZGV4IC0gMSkpO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmluc2lkZVdyYXBEZWxpbWl0ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgY2hhckFmdGVyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwKSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgd2UgcnVuIGludG8gYW4gZXNjYXBlZCBxdW90ZSAoaWUuIFwiXCIpIHNraXAgcGFzdCB0aGUgc2Vjb25kIHF1b3RlXG5cbiAgICAgICAgICAgICAgICBpbmRleCArPSAyO1xuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLmp1c3RQYXJzZWREb3VibGVRdW90ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJhY3RlciA9PT0gb3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQgJiYgY2hhckJlZm9yZSAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJlxuICAgICAgICAgICAgICAgIGNoYXJBZnRlciAhPT0gb3B0aW9ucy5kZWxpbWl0ZXIud3JhcCAmJiAhc3RhdGVWYXJpYWJsZXMuaW5zaWRlV3JhcERlbGltaXRlciAmJlxuICAgICAgICAgICAgICAgIHN0YXRlVmFyaWFibGVzLnBhcnNpbmdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIElmIHdlIHJlYWNoZWQgYSBmaWVsZCBkZWxpbWl0ZXIgYW5kIGFyZSBub3QgaW5zaWRlIHRoZSB3cmFwIGRlbGltaXRlcnMgKGllLiAqLCopXG5cbiAgICAgICAgICAgICAgICBzcGxpdExpbmUucHVzaChjc3Yuc3Vic3RyaW5nKHN0YXRlVmFyaWFibGVzLnN0YXJ0SW5kZXgsIGluZGV4KSk7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMuc3RhcnRJbmRleCA9IGluZGV4ICsgMTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hhcmFjdGVyID09PSBvcHRpb25zLmRlbGltaXRlci5maWVsZCAmJiBjaGFyQmVmb3JlID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmXG4gICAgICAgICAgICAgICAgY2hhckFmdGVyICE9PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmICFzdGF0ZVZhcmlhYmxlcy5wYXJzaW5nVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB3ZSByZWFjaGVkIGEgZmllbGQgZGVsaW1pdGVyLCB0aGUgcHJldmlvdXMgY2hhcmFjdGVyIHdhcyBhIHdyYXAgZGVsaW1pdGVyLCBhbmQgdGhlXG4gICAgICAgICAgICAgICAgLy8gICBuZXh0IGNoYXJhY3RlciBpcyBub3QgYSB3cmFwIGRlbGltaXRlciAoaWUuIFwiLCopXG5cbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5pbnNpZGVXcmFwRGVsaW1pdGVyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc3RhdGVWYXJpYWJsZXMucGFyc2luZ1ZhbHVlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5zdGFydEluZGV4ID0gaW5kZXggKyAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCB0byB0aGUgbmV4dCBjaGFyYWN0ZXJcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAvLyBSZXNldCB0aGUgZG91YmxlIHF1b3RlIHN0YXRlIHZhcmlhYmxlXG4gICAgICAgICAgICBzdGF0ZVZhcmlhYmxlcy5qdXN0UGFyc2VkRG91YmxlUXVvdGUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaW5lcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHJlY29yZCBsaW5lcyBmcm9tIHRoZSBzcGxpdCBDU1YgbGluZXMgYW5kIHNldHMgaXQgb24gdGhlIHBhcmFtcyBvYmplY3RcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVSZWNvcmRMaW5lcyhwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnJlY29yZExpbmVzID0gcGFyYW1zLmxpbmVzLnNwbGljZSgxKTsgLy8gQWxsIGxpbmVzIGV4Y2VwdCBmb3IgdGhlIGhlYWRlciBsaW5lXG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgdGhlIHZhbHVlIGZvciB0aGUgcmVjb3JkIGZyb20gdGhlIGxpbmUgYXQgdGhlIHByb3ZpZGVkIGtleS5cbiAgICAgKiBAcGFyYW0gbGluZSB7U3RyaW5nW119IHNwbGl0IGxpbmUgdmFsdWVzIGZvciB0aGUgcmVjb3JkXG4gICAgICogQHBhcmFtIGtleSB7T2JqZWN0fSB7aW5kZXg6IE51bWJlciwgdmFsdWU6IFN0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZVJlY29yZFZhbHVlRnJvbUxpbmUobGluZSwga2V5KSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgdmFsdWUgYXQgdGhlIGtleSdzIGluZGV4LCB1c2UgaXQ7IG90aGVyd2lzZSwgbnVsbFxuICAgICAgICBsZXQgdmFsdWUgPSBsaW5lW2tleS5pbmRleF07XG5cbiAgICAgICAgLy8gUGVyZm9ybSBhbnkgbmVjZXNzYXJ5IHZhbHVlIGNvbnZlcnNpb25zIG9uIHRoZSByZWNvcmQgdmFsdWVcbiAgICAgICAgcmV0dXJuIHByb2Nlc3NSZWNvcmRWYWx1ZSh2YWx1ZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIHRoZSByZWNvcmQncyB2YWx1ZSBieSBwYXJzaW5nIHRoZSBkYXRhIHRvIGVuc3VyZSB0aGUgQ1NWIGlzXG4gICAgICogY29udmVydGVkIHRvIHRoZSBKU09OIHRoYXQgY3JlYXRlZCBpdC5cbiAgICAgKiBAcGFyYW0gZmllbGRWYWx1ZSB7U3RyaW5nfVxuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb2Nlc3NSZWNvcmRWYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIC8vIElmIHRoZSB2YWx1ZSBpcyBhbiBhcnJheSByZXByZXNlbnRhdGlvbiwgY29udmVydCBpdFxuICAgICAgICBsZXQgcGFyc2VkSnNvbiA9IHBhcnNlVmFsdWUoZmllbGRWYWx1ZSk7XG4gICAgICAgIC8vIElmIHBhcnNlZEpzb24gaXMgYW55dGhpbmcgYXNpZGUgZnJvbSBhbiBlcnJvciwgdGhlbiB3ZSB3YW50IHRvIHVzZSB0aGUgcGFyc2VkIHZhbHVlXG4gICAgICAgIC8vIFRoaXMgYWxsb3dzIHVzIHRvIGludGVycHJldCB2YWx1ZXMgbGlrZSAnbnVsbCcgLS0+IG51bGwsICdmYWxzZScgLS0+IGZhbHNlXG4gICAgICAgIGlmICghXy5pc0Vycm9yKHBhcnNlZEpzb24pKSB7XG4gICAgICAgICAgICBmaWVsZFZhbHVlID0gcGFyc2VkSnNvbjtcbiAgICAgICAgfSBlbHNlIGlmIChmaWVsZFZhbHVlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSByZWNvcmQgdmFsdWUsIGlmIHNwZWNpZmllZCBieSB0aGUgdXNlciB2aWEgdGhlIG9wdGlvbnMgb2JqZWN0XG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbVJlY29yZFZhbHVlKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUZpZWxkVmFsdWVzICYmICFfLmlzTnVsbChmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUudHJpbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBhIEpTT04gZG9jdW1lbnQgd2l0aCB0aGUgZ2l2ZW4ga2V5cyAoZGVzaWduYXRlZCBieSB0aGUgQ1NWIGhlYWRlcilcbiAgICAgKiAgIGFuZCB0aGUgdmFsdWVzIChmcm9tIHRoZSBnaXZlbiBsaW5lKVxuICAgICAqIEBwYXJhbSBrZXlzIFN0cmluZ1tdXG4gICAgICogQHBhcmFtIGxpbmUgU3RyaW5nXG4gICAgICogQHJldHVybnMge09iamVjdH0gY3JlYXRlZCBqc29uIGRvY3VtZW50XG4gICAgICovXG4gICAgZnVuY3Rpb24gY3JlYXRlRG9jdW1lbnQoa2V5cywgbGluZSkge1xuICAgICAgICAvLyBSZWR1Y2UgdGhlIGtleXMgaW50byBhIEpTT04gZG9jdW1lbnQgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBsaW5lXG4gICAgICAgIHJldHVybiBrZXlzLnJlZHVjZSgoZG9jdW1lbnQsIGtleSkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSB2YWx1ZSBhdCB0aGUga2V5J3MgaW5kZXggaW4gdGhlIGxpbmUsIHNldCB0aGUgdmFsdWU7IG90aGVyd2lzZSBudWxsXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSByZXRyaWV2ZVJlY29yZFZhbHVlRnJvbUxpbmUobGluZSwga2V5KTtcblxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlIGFkZCB0aGUga2V5IGFuZCB2YWx1ZSB0byB0aGUgZG9jdW1lbnRcbiAgICAgICAgICAgIHJldHVybiBwYXRoLnNldFBhdGgoZG9jdW1lbnQsIGtleS52YWx1ZSwgdmFsdWUpO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyB0aGUgb3V0ZXJtb3N0IHdyYXAgZGVsaW1pdGVycyBmcm9tIGEgdmFsdWUsIGlmIHRoZXkgYXJlIHByZXNlbnRcbiAgICAgKiBPdGhlcndpc2UsIHRoZSBub24td3JhcHBlZCB2YWx1ZSBpcyByZXR1cm5lZCBhcyBpc1xuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZW1vdmVXcmFwRGVsaW1pdGVyc0Zyb21WYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGxldCBmaXJzdENoYXIgPSBmaWVsZFZhbHVlWzBdLFxuICAgICAgICAgICAgbGFzdEluZGV4ID0gZmllbGRWYWx1ZS5sZW5ndGggLSAxLFxuICAgICAgICAgICAgbGFzdENoYXIgPSBmaWVsZFZhbHVlW2xhc3RJbmRleF07XG4gICAgICAgIC8vIElmIHRoZSBmaWVsZCBzdGFydHMgYW5kIGVuZHMgd2l0aCBhIHdyYXAgZGVsaW1pdGVyXG4gICAgICAgIGlmIChmaXJzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXAgJiYgbGFzdENoYXIgPT09IG9wdGlvbnMuZGVsaW1pdGVyLndyYXApIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnN1YnN0cigxLCBsYXN0SW5kZXggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBVbmVzY2FwZXMgd3JhcCBkZWxpbWl0ZXJzIGJ5IHJlcGxhY2luZyBkdXBsaWNhdGVzIHdpdGggYSBzaW5nbGUgKGVnLiBcIlwiIC0+IFwiKVxuICAgICAqIFRoaXMgaXMgZG9uZSBpbiBvcmRlciB0byBwYXJzZSBSRkMgNDE4MCBjb21wbGlhbnQgQ1NWIGJhY2sgdG8gSlNPTlxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMge1N0cmluZ31cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1bmVzY2FwZVdyYXBEZWxpbWl0ZXJJbkZpZWxkKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWUucmVwbGFjZShlc2NhcGVkV3JhcERlbGltaXRlclJlZ2V4LCBvcHRpb25zLmRlbGltaXRlci53cmFwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNYWluIGhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IHRoZSBDU1YgdG8gdGhlIEpTT04gZG9jdW1lbnQgYXJyYXlcbiAgICAgKiBAcGFyYW0gcGFyYW1zIHtPYmplY3R9IHtsaW5lczogW1N0cmluZ10sIGNhbGxiYWNrOiBGdW5jdGlvbn1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtUmVjb3JkTGluZXMocGFyYW1zKSB7XG4gICAgICAgIHBhcmFtcy5qc29uID0gcGFyYW1zLnJlY29yZExpbmVzLnJlZHVjZSgoZ2VuZXJhdGVkSnNvbk9iamVjdHMsIGxpbmUpID0+IHsgLy8gRm9yIGVhY2ggbGluZSwgY3JlYXRlIHRoZSBkb2N1bWVudCBhbmQgYWRkIGl0IHRvIHRoZSBhcnJheSBvZiBkb2N1bWVudHNcbiAgICAgICAgICAgIGxpbmUgPSBsaW5lLm1hcCgoZmllbGRWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFBlcmZvcm0gdGhlIG5lY2Vzc2FyeSBvcGVyYXRpb25zIG9uIGVhY2ggbGluZVxuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSByZW1vdmVXcmFwRGVsaW1pdGVyc0Zyb21WYWx1ZShmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdW5lc2NhcGVXcmFwRGVsaW1pdGVySW5GaWVsZChmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gdHJpbVJlY29yZFZhbHVlKGZpZWxkVmFsdWUpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGV0IGdlbmVyYXRlZERvY3VtZW50ID0gY3JlYXRlRG9jdW1lbnQocGFyYW1zLmhlYWRlckZpZWxkcywgbGluZSk7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVkSnNvbk9iamVjdHMuY29uY2F0KGdlbmVyYXRlZERvY3VtZW50KTtcbiAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXR0ZW1wdHMgdG8gcGFyc2UgdGhlIHByb3ZpZGVkIHZhbHVlLiBJZiBpdCBpcyBub3QgcGFyc2FibGUsIHRoZW4gYW4gZXJyb3IgaXMgcmV0dXJuZWRcbiAgICAgKiBAcGFyYW0gdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwYXJzZVZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodXRpbHMuaXNTdHJpbmdSZXByZXNlbnRhdGlvbih2YWx1ZSwgb3B0aW9ucykgJiYgIXV0aWxzLmlzRGF0ZVJlcHJlc2VudGF0aW9uKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IHBhcnNlZEpzb24gPSBKU09OLnBhcnNlKHZhbHVlKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhlIHBhcnNlZCB2YWx1ZSBpcyBhbiBhcnJheSwgdGhlbiB3ZSBhbHNvIG5lZWQgdG8gdHJpbSByZWNvcmQgdmFsdWVzLCBpZiBzcGVjaWZpZWRcbiAgICAgICAgICAgIGlmIChfLmlzQXJyYXkocGFyc2VkSnNvbikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VkSnNvbi5tYXAodHJpbVJlY29yZFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlZEpzb247XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsbHkgZXhwb3J0ZWQgY3N2Mmpzb24gZnVuY3Rpb25cbiAgICAgKiBUYWtlcyBvcHRpb25zIGFzIGEgZG9jdW1lbnQsIGRhdGEgYXMgYSBDU1Ygc3RyaW5nLCBhbmQgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBvcnQgdGhlIHJlc3VsdHNcbiAgICAgKiBAcGFyYW0gZGF0YSBTdHJpbmcgY3N2IHN0cmluZ1xuICAgICAqIEBwYXJhbSBjYWxsYmFjayBGdW5jdGlvbiBjYWxsYmFjayBmdW5jdGlvblxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbnZlcnQoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgLy8gU3BsaXQgdGhlIENTViBpbnRvIGxpbmVzIHVzaW5nIHRoZSBzcGVjaWZpZWQgRU9MIG9wdGlvblxuICAgICAgICAvLyB2YWxpZGF0ZUNzdihkYXRhLCBjYWxsYmFjaylcbiAgICAgICAgLy8gICAgIC50aGVuKHN0cmlwRXhjZWxCT00pXG4gICAgICAgIHN0cmlwRXhjZWxCT00oZGF0YSlcbiAgICAgICAgICAgIC50aGVuKHNwbGl0Q3N2TGluZXMpXG4gICAgICAgICAgICAudGhlbihyZXRyaWV2ZUhlYWRpbmcpIC8vIFJldHJpZXZlIHRoZSBoZWFkaW5ncyBmcm9tIHRoZSBDU1YsIHVubGVzcyB0aGUgdXNlciBzcGVjaWZpZWQgdGhlIGtleXNcbiAgICAgICAgICAgIC50aGVuKHJldHJpZXZlUmVjb3JkTGluZXMpIC8vIFJldHJpZXZlIHRoZSByZWNvcmQgbGluZXMgZnJvbSB0aGUgQ1NWXG4gICAgICAgICAgICAudGhlbih0cmFuc2Zvcm1SZWNvcmRMaW5lcykgLy8gUmV0cmlldmUgdGhlIEpTT04gZG9jdW1lbnQgYXJyYXlcbiAgICAgICAgICAgIC50aGVuKChwYXJhbXMpID0+IGNhbGxiYWNrKG51bGwsIHBhcmFtcy5qc29uKSkgLy8gU2VuZCB0aGUgZGF0YSBiYWNrIHRvIHRoZSBjYWxsZXJcbiAgICAgICAgICAgIC5jYXRjaChjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgY29udmVydCxcbiAgICAgICAgdmFsaWRhdGlvbkZuOiBfLmlzU3RyaW5nLFxuICAgICAgICB2YWxpZGF0aW9uTWVzc2FnZXM6IGNvbnN0YW50cy5lcnJvcnMuY3N2Mmpzb25cbiAgICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7IENzdjJKc29uIH07XG4iLCIndXNlIHN0cmljdCc7XG5cbmxldCBjb25zdGFudHMgPSByZXF1aXJlKCcuL2NvbnN0YW50cy5qc29uJyksXG4gICAgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyksXG4gICAgXyA9IHJlcXVpcmUoJ3VuZGVyc2NvcmUnKSxcbiAgICBwYXRoID0gcmVxdWlyZSgnZG9jLXBhdGgnKSxcbiAgICBkZWVrcyA9IHJlcXVpcmUoJ2RlZWtzJyk7XG5cbmNvbnN0IEpzb24yQ3N2ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIGNvbnN0IHdyYXBEZWxpbWl0ZXJDaGVja1JlZ2V4ID0gbmV3IFJlZ0V4cChvcHRpb25zLmRlbGltaXRlci53cmFwLCAnZycpLFxuICAgICAgICBjcmxmU2VhcmNoUmVnZXggPSAvXFxyP1xcbnxcXHIvLFxuICAgICAgICBkZWVrc09wdGlvbnMgPSB7XG4gICAgICAgICAgICBleHBhbmRBcnJheU9iamVjdHM6IG9wdGlvbnMuZXhwYW5kQXJyYXlPYmplY3RzLFxuICAgICAgICAgICAgaWdub3JlRW1wdHlBcnJheXNXaGVuRXhwYW5kaW5nOiBvcHRpb25zLmV4cGFuZEFycmF5T2JqZWN0c1xuICAgICAgICB9O1xuXG4gICAgLyoqIEhFQURFUiBGSUVMRCBGVU5DVElPTlMgKiovXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGRhdGEgZmllbGQgbmFtZXMgb2YgYWxsIGRvY3VtZW50cyBpbiB0aGUgcHJvdmlkZWQgbGlzdFxuICAgICAqIEBwYXJhbSBkYXRhIHtBcnJheTxPYmplY3Q+fSBEYXRhIHRvIGJlIGNvbnZlcnRlZFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBcnJheVtTdHJpbmddPn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRGaWVsZE5hbWVMaXN0KGRhdGEpIHtcbiAgICAgICAgLy8gSWYga2V5cyB3ZXJlbid0IHNwZWNpZmllZCwgdGhlbiB3ZSdsbCB1c2UgdGhlIGxpc3Qgb2Yga2V5cyBnZW5lcmF0ZWQgYnkgdGhlIGRlZWtzIG1vZHVsZVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRlZWtzLmRlZXBLZXlzRnJvbUxpc3QoZGF0YSwgZGVla3NPcHRpb25zKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJvY2Vzc2VzIHRoZSBzY2hlbWFzIGJ5IGNoZWNraW5nIGZvciBzY2hlbWEgZGlmZmVyZW5jZXMsIGlmIHNvIGRlc2lyZWQuXG4gICAgICogSWYgc2NoZW1hIGRpZmZlcmVuY2VzIGFyZSBub3QgdG8gYmUgY2hlY2tlZCwgdGhlbiBpdCByZXNvbHZlcyB0aGUgdW5pcXVlXG4gICAgICogbGlzdCBvZiBmaWVsZCBuYW1lcy5cbiAgICAgKiBAcGFyYW0gZG9jdW1lbnRTY2hlbWFzXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFycmF5W1N0cmluZ10+fVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByb2Nlc3NTY2hlbWFzKGRvY3VtZW50U2NoZW1hcykge1xuICAgICAgICAvLyBJZiB0aGUgdXNlciB3YW50cyB0byBjaGVjayBmb3IgdGhlIHNhbWUgc2NoZW1hIChyZWdhcmRsZXNzIG9mIHNjaGVtYSBvcmRlcmluZylcbiAgICAgICAgaWYgKG9wdGlvbnMuY2hlY2tTY2hlbWFEaWZmZXJlbmNlcykge1xuICAgICAgICAgICAgcmV0dXJuIGNoZWNrU2NoZW1hRGlmZmVyZW5jZXMoZG9jdW1lbnRTY2hlbWFzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgZG8gbm90IGNhcmUgaWYgdGhlIHNjaGVtYXMgYXJlIGRpZmZlcmVudCwgc28gd2Ugc2hvdWxkIGdldCB0aGUgdW5pcXVlIGxpc3Qgb2Yga2V5c1xuICAgICAgICAgICAgbGV0IHVuaXF1ZUZpZWxkTmFtZXMgPSBfLnVuaXEoXy5mbGF0dGVuKGRvY3VtZW50U2NoZW1hcykpO1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmlxdWVGaWVsZE5hbWVzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gcGVyZm9ybXMgdGhlIHNjaGVtYSBkaWZmZXJlbmNlIGNoZWNrLCBpZiB0aGUgdXNlciBzcGVjaWZpZXMgdGhhdCBpdCBzaG91bGQgYmUgY2hlY2tlZC5cbiAgICAgKiBJZiB0aGVyZSBhcmUgbm8gZmllbGQgbmFtZXMsIHRoZW4gdGhlcmUgYXJlIG5vIGRpZmZlcmVuY2VzLlxuICAgICAqIE90aGVyd2lzZSwgd2UgZ2V0IHRoZSBmaXJzdCBzY2hlbWEgYW5kIHRoZSByZW1haW5pbmcgbGlzdCBvZiBzY2hlbWFzXG4gICAgICogQHBhcmFtIGRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNoZWNrU2NoZW1hRGlmZmVyZW5jZXMoZG9jdW1lbnRTY2hlbWFzKSB7XG4gICAgICAgIC8vIGhhdmUgbXVsdGlwbGUgZG9jdW1lbnRzIC0gZW5zdXJlIG9ubHkgb25lIHNjaGVtYSAocmVnYXJkbGVzcyBvZiBmaWVsZCBvcmRlcmluZylcbiAgICAgICAgbGV0IGZpcnN0RG9jU2NoZW1hID0gZG9jdW1lbnRTY2hlbWFzWzBdLFxuICAgICAgICAgICAgcmVzdE9mRG9jdW1lbnRTY2hlbWFzID0gZG9jdW1lbnRTY2hlbWFzLnNsaWNlKDEpLFxuICAgICAgICAgICAgc2NoZW1hRGlmZmVyZW5jZXMgPSBjb21wdXRlTnVtYmVyT2ZTY2hlbWFEaWZmZXJlbmNlcyhmaXJzdERvY1NjaGVtYSwgcmVzdE9mRG9jdW1lbnRTY2hlbWFzKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgc2NoZW1hIGluY29uc2lzdGVuY2llcywgdGhyb3cgYSBzY2hlbWEgbm90IHRoZSBzYW1lIGVycm9yXG4gICAgICAgIGlmIChzY2hlbWFEaWZmZXJlbmNlcykge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihjb25zdGFudHMuZXJyb3JzLmpzb24yY3N2Lm5vdFNhbWVTY2hlbWEpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZmlyc3REb2NTY2hlbWEpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXB1dGVzIHRoZSBudW1iZXIgb2Ygc2NoZW1hIGRpZmZlcmVuY2VzXG4gICAgICogQHBhcmFtIGZpcnN0RG9jU2NoZW1hXG4gICAgICogQHBhcmFtIHJlc3RPZkRvY3VtZW50U2NoZW1hc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGNvbXB1dGVOdW1iZXJPZlNjaGVtYURpZmZlcmVuY2VzKGZpcnN0RG9jU2NoZW1hLCByZXN0T2ZEb2N1bWVudFNjaGVtYXMpIHtcbiAgICAgICAgcmV0dXJuIHJlc3RPZkRvY3VtZW50U2NoZW1hcy5yZWR1Y2UoKHNjaGVtYURpZmZlcmVuY2VzLCBkb2N1bWVudFNjaGVtYSkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIHNjaGVtYXMsIGluY3JlbWVudCB0aGUgY291bnRlciBvZiBzY2hlbWEgaW5jb25zaXN0ZW5jaWVzXG4gICAgICAgICAgICBsZXQgbnVtYmVyT2ZEaWZmZXJlbmNlcyA9IHV0aWxzLmNvbXB1dGVTY2hlbWFEaWZmZXJlbmNlcyhmaXJzdERvY1NjaGVtYSwgZG9jdW1lbnRTY2hlbWEpLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBudW1iZXJPZkRpZmZlcmVuY2VzID4gMFxuICAgICAgICAgICAgICAgID8gc2NoZW1hRGlmZmVyZW5jZXMgKyAxXG4gICAgICAgICAgICAgICAgOiBzY2hlbWFEaWZmZXJlbmNlcztcbiAgICAgICAgfSwgMCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSWYgc28gc3BlY2lmaWVkLCB0aGlzIHNvcnRzIHRoZSBoZWFkZXIgZmllbGQgbmFtZXMgYWxwaGFiZXRpY2FsbHlcbiAgICAgKiBAcGFyYW0gZmllbGROYW1lcyB7QXJyYXk8U3RyaW5nPn1cbiAgICAgKiBAcmV0dXJucyB7QXJyYXk8U3RyaW5nPn0gc29ydGVkIGZpZWxkIG5hbWVzLCBvciB1bnNvcnRlZCBpZiBzb3J0aW5nIG5vdCBzcGVjaWZpZWRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzb3J0SGVhZGVyRmllbGRzKGZpZWxkTmFtZXMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuc29ydEhlYWRlcikge1xuICAgICAgICAgICAgcmV0dXJuIGZpZWxkTmFtZXMuc29ydCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZE5hbWVzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyaW1zIHRoZSBoZWFkZXIgZmllbGRzLCBpZiB0aGUgdXNlciBkZXNpcmVzIHRoZW0gdG8gYmUgdHJpbW1lZC5cbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gdHJpbUhlYWRlckZpZWxkcyhwYXJhbXMpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMudHJpbUhlYWRlckZpZWxkcykge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMubWFwKChmaWVsZCkgPT4gZmllbGQuc3BsaXQoJy4nKVxuICAgICAgICAgICAgICAgIC5tYXAoKGNvbXBvbmVudCkgPT4gY29tcG9uZW50LnRyaW0oKSlcbiAgICAgICAgICAgICAgICAuam9pbignLicpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogV3JhcCB0aGUgaGVhZGluZ3MsIGlmIGRlc2lyZWQgYnkgdGhlIHVzZXIuXG4gICAgICogQHBhcmFtIHBhcmFtc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHdyYXBIZWFkZXJGaWVsZHMocGFyYW1zKSB7XG4gICAgICAgIC8vIG9ubHkgcGVyZm9ybSB0aGlzIGlmIHdlIGFyZSBhY3R1YWxseSBwcmVwZW5kaW5nIHRoZSBoZWFkZXJcbiAgICAgICAgaWYgKG9wdGlvbnMucHJlcGVuZEhlYWRlcikge1xuICAgICAgICAgICAgcGFyYW1zLmhlYWRlckZpZWxkcyA9IHBhcmFtcy5oZWFkZXJGaWVsZHMubWFwKGZ1bmN0aW9uKGhlYWRpbmdLZXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd3JhcEZpZWxkVmFsdWVJZk5lY2Vzc2FyeShoZWFkaW5nS2V5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2VuZXJhdGVzIHRoZSBDU1YgaGVhZGVyIHN0cmluZyBieSBqb2luaW5nIHRoZSBoZWFkZXJGaWVsZHMgYnkgdGhlIGZpZWxkIGRlbGltaXRlclxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNzdkhlYWRlcihwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLmhlYWRlciA9IHBhcmFtcy5oZWFkZXJGaWVsZHMuam9pbihvcHRpb25zLmRlbGltaXRlci5maWVsZCk7XG4gICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0cmlldmUgdGhlIGhlYWRpbmdzIGZvciBhbGwgZG9jdW1lbnRzIGFuZCByZXR1cm4gaXQuXG4gICAgICogVGhpcyBjaGVja3MgdGhhdCBhbGwgZG9jdW1lbnRzIGhhdmUgdGhlIHNhbWUgc2NoZW1hLlxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmV0cmlldmVIZWFkZXJGaWVsZHMoZGF0YSkge1xuICAgICAgICBpZiAob3B0aW9ucy5rZXlzKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdGlvbnMua2V5cylcbiAgICAgICAgICAgICAgICAudGhlbihzb3J0SGVhZGVyRmllbGRzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBnZXRGaWVsZE5hbWVMaXN0KGRhdGEpXG4gICAgICAgICAgICAudGhlbihwcm9jZXNzU2NoZW1hcylcbiAgICAgICAgICAgIC50aGVuKHNvcnRIZWFkZXJGaWVsZHMpO1xuICAgIH1cblxuICAgIC8qKiBSRUNPUkQgRklFTEQgRlVOQ1RJT05TICoqL1xuXG4gICAgLyoqXG4gICAgICogTWFpbiBmdW5jdGlvbiB3aGljaCBoYW5kbGVzIHRoZSBwcm9jZXNzaW5nIG9mIGEgcmVjb3JkLCBvciBkb2N1bWVudCB0byBiZSBjb252ZXJ0ZWQgdG8gQ1NWIGZvcm1hdFxuICAgICAqIFRoaXMgZnVuY3Rpb24gc3BlY2lmaWVzIGFuZCBwZXJmb3JtcyB0aGUgbmVjZXNzYXJ5IG9wZXJhdGlvbnMgaW4gdGhlIG5lY2Vzc2FyeSBvcmRlclxuICAgICAqIGluIG9yZGVyIHRvIG9idGFpbiB0aGUgZGF0YSBhbmQgY29udmVydCBpdCB0byBDU1YgZm9ybSB3aGlsZSBtYWludGFpbmluZyBSRkMgNDE4MCBjb21wbGlhbmNlLlxuICAgICAqICogT3JkZXIgb2Ygb3BlcmF0aW9uczpcbiAgICAgKiAtIEdldCBmaWVsZHMgZnJvbSBwcm92aWRlZCBrZXkgbGlzdCAoYXMgYXJyYXkgb2YgYWN0dWFsIHZhbHVlcylcbiAgICAgKiAtIENvbnZlcnQgdGhlIHZhbHVlcyB0byBjc3Yvc3RyaW5nIHJlcHJlc2VudGF0aW9uIFtwb3NzaWJsZSBvcHRpb24gaGVyZSBmb3IgY3VzdG9tIGNvbnZlcnRlcnM/XVxuICAgICAqIC0gVHJpbSBmaWVsZHNcbiAgICAgKiAtIERldGVybWluZSBpZiB0aGV5IG5lZWQgdG8gYmUgd3JhcHBlZCAoJiB3cmFwIGlmIG5lY2Vzc2FyeSlcbiAgICAgKiAtIENvbWJpbmUgdmFsdWVzIGZvciBlYWNoIGxpbmUgKGJ5IGpvaW5pbmcgYnkgZmllbGQgZGVsaW1pdGVyKVxuICAgICAqIEBwYXJhbSBwYXJhbXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVjb3JkcyhwYXJhbXMpIHtcbiAgICAgICAgcGFyYW1zLnJlY29yZHMgPSBwYXJhbXMucmVjb3Jkcy5tYXAoKHJlY29yZCkgPT4ge1xuICAgICAgICAgICAgLy8gUmV0cmlldmUgZGF0YSBmb3IgZWFjaCBvZiB0aGUgaGVhZGVyRmllbGRzIGZyb20gdGhpcyByZWNvcmRcbiAgICAgICAgICAgIGxldCByZWNvcmRGaWVsZERhdGEgPSByZXRyaWV2ZVJlY29yZEZpZWxkRGF0YShyZWNvcmQsIHBhcmFtcy5oZWFkZXJGaWVsZHMpLFxuXG4gICAgICAgICAgICAgICAgLy8gUHJvY2VzcyB0aGUgZGF0YSBpbiB0aGlzIHJlY29yZCBhbmQgcmV0dXJuIHRoZVxuICAgICAgICAgICAgICAgIHByb2Nlc3NlZFJlY29yZERhdGEgPSByZWNvcmRGaWVsZERhdGEubWFwKChmaWVsZFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUgPSB0cmltUmVjb3JkRmllbGRWYWx1ZShmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHJlY29yZEZpZWxkVmFsdWVUb1N0cmluZyhmaWVsZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHdyYXBGaWVsZFZhbHVlSWZOZWNlc3NhcnkoZmllbGRWYWx1ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkVmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIEpvaW4gdGhlIHJlY29yZCBkYXRhIGJ5IHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUNzdlJvd0Zyb21SZWNvcmQocHJvY2Vzc2VkUmVjb3JkRGF0YSk7XG4gICAgICAgIH0pLmpvaW4ob3B0aW9ucy5kZWxpbWl0ZXIuZW9sKTtcblxuICAgICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiBpbnRlbmRlZCB0byBwcm9jZXNzICpqdXN0KiBhcnJheSB2YWx1ZXMgd2hlbiB0aGUgZXhwYW5kQXJyYXlPYmplY3RzIHNldHRpbmcgaXMgc2V0IHRvIHRydWVcbiAgICAgKiBAcGFyYW0gcmVjb3JkRmllbGRWYWx1ZVxuICAgICAqIEByZXR1cm5zIHsqfSBwcm9jZXNzZWQgYXJyYXkgdmFsdWVcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcm9jZXNzUmVjb3JkRmllbGREYXRhRm9yRXhwYW5kZWRBcnJheU9iamVjdChyZWNvcmRGaWVsZFZhbHVlKSB7XG4gICAgICAgIGxldCBmaWx0ZXJlZFJlY29yZEZpZWxkVmFsdWUgPSB1dGlscy5yZW1vdmVFbXB0eUZpZWxkcyhyZWNvcmRGaWVsZFZhbHVlKTtcblxuICAgICAgICAvLyBJZiB3ZSBoYXZlIGFuIGFycmF5IGFuZCBpdCdzIGVpdGhlciBlbXB0eSBvZiBmdWxsIG9mIGVtcHR5IHZhbHVlcywgdGhlbiB1c2UgYW4gZW1wdHkgdmFsdWUgcmVwcmVzZW50YXRpb25cbiAgICAgICAgaWYgKCFyZWNvcmRGaWVsZFZhbHVlLmxlbmd0aCB8fCAhZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMuZW1wdHlGaWVsZFZhbHVlIHx8ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKGZpbHRlcmVkUmVjb3JkRmllbGRWYWx1ZS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgd2UgaGF2ZSBhbiBhcnJheSBvZiBhY3R1YWwgdmFsdWVzLi4uXG4gICAgICAgICAgICAvLyBTaW5jZSB3ZSBhcmUgZXhwYW5kaW5nIGFycmF5IG9iamVjdHMsIHdlIHdpbGwgd2FudCB0byBrZXkgaW4gb24gdmFsdWVzIG9mIG9iamVjdHMuXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRSZWNvcmRGaWVsZFZhbHVlWzBdOyAvLyBFeHRyYWN0IHRoZSBzaW5nbGUgdmFsdWUgaW4gdGhlIGFycmF5XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVjb3JkRmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIGFsbCBmaWVsZCB2YWx1ZXMgZnJvbSBhIHBhcnRpY3VsYXIgcmVjb3JkIGZvciB0aGUgZ2l2ZW4gbGlzdCBvZiBmaWVsZHNcbiAgICAgKiBAcGFyYW0gcmVjb3JkXG4gICAgICogQHBhcmFtIGZpZWxkc1xuICAgICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXRyaWV2ZVJlY29yZEZpZWxkRGF0YShyZWNvcmQsIGZpZWxkcykge1xuICAgICAgICBsZXQgcmVjb3JkVmFsdWVzID0gW107XG5cbiAgICAgICAgZmllbGRzLmZvckVhY2goKGZpZWxkKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmVjb3JkRmllbGRWYWx1ZSA9IHBhdGguZXZhbHVhdGVQYXRoKHJlY29yZCwgZmllbGQpO1xuXG4gICAgICAgICAgICBpZiAoIV8uaXNVbmRlZmluZWQob3B0aW9ucy5lbXB0eUZpZWxkVmFsdWUpICYmIHV0aWxzLmlzRW1wdHlGaWVsZChyZWNvcmRGaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJlY29yZEZpZWxkVmFsdWUgPSBvcHRpb25zLmVtcHR5RmllbGRWYWx1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob3B0aW9ucy5leHBhbmRBcnJheU9iamVjdHMgJiYgQXJyYXkuaXNBcnJheShyZWNvcmRGaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJlY29yZEZpZWxkVmFsdWUgPSBwcm9jZXNzUmVjb3JkRmllbGREYXRhRm9yRXhwYW5kZWRBcnJheU9iamVjdChyZWNvcmRGaWVsZFZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVjb3JkVmFsdWVzLnB1c2gocmVjb3JkRmllbGRWYWx1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiByZWNvcmRWYWx1ZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29udmVydHMgYSByZWNvcmQgZmllbGQgdmFsdWUgdG8gaXRzIHN0cmluZyByZXByZXNlbnRhdGlvblxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gcmVjb3JkRmllbGRWYWx1ZVRvU3RyaW5nKGZpZWxkVmFsdWUpIHtcbiAgICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFZhbHVlKSB8fCBfLmlzT2JqZWN0KGZpZWxkVmFsdWUpICYmICFfLmlzRGF0ZShmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGZpZWxkVmFsdWUpO1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNVbmRlZmluZWQoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgICAgICAgfSBlbHNlIGlmIChfLmlzTnVsbChmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuICdudWxsJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmltcyB0aGUgcmVjb3JkIGZpZWxkIHZhbHVlLCBpZiBzcGVjaWZpZWQgYnkgdGhlIHVzZXIncyBwcm92aWRlZCBvcHRpb25zXG4gICAgICogQHBhcmFtIGZpZWxkVmFsdWVcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB0cmltUmVjb3JkRmllbGRWYWx1ZShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGlmIChvcHRpb25zLnRyaW1GaWVsZFZhbHVlcykge1xuICAgICAgICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlLm1hcCh0cmltUmVjb3JkRmllbGRWYWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uaXNTdHJpbmcoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS50cmltKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmllbGRWYWx1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBFc2NhcGVzIHF1b3RhdGlvbiBtYXJrcyBpbiB0aGUgZmllbGQgdmFsdWUsIGlmIG5lY2Vzc2FyeSwgYW5kIGFwcHJvcHJpYXRlbHlcbiAgICAgKiB3cmFwcyB0aGUgcmVjb3JkIGZpZWxkIHZhbHVlIGlmIGl0IGNvbnRhaW5zIGEgY29tbWEgKGZpZWxkIGRlbGltaXRlciksXG4gICAgICogcXVvdGF0aW9uIG1hcmsgKHdyYXAgZGVsaW1pdGVyKSwgb3IgYSBsaW5lIGJyZWFrIChDUkxGKVxuICAgICAqIEBwYXJhbSBmaWVsZFZhbHVlXG4gICAgICogQHJldHVybnMgeyp9XG4gICAgICovXG4gICAgZnVuY3Rpb24gd3JhcEZpZWxkVmFsdWVJZk5lY2Vzc2FyeShmaWVsZFZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHdyYXBEZWxpbWl0ZXIgPSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xuXG4gICAgICAgIC8vIGVnLiBpbmNsdWRlcyBxdW90YXRpb24gbWFya3MgKGRlZmF1bHQgZGVsaW1pdGVyKVxuICAgICAgICBpZiAoZmllbGRWYWx1ZS5pbmNsdWRlcyhvcHRpb25zLmRlbGltaXRlci53cmFwKSkge1xuICAgICAgICAgICAgLy8gYWRkIGFuIGFkZGl0aW9uYWwgcXVvdGF0aW9uIG1hcmsgYmVmb3JlIGVhY2ggcXVvdGF0aW9uIG1hcmsgYXBwZWFyaW5nIGluIHRoZSBmaWVsZCB2YWx1ZVxuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkVmFsdWUucmVwbGFjZSh3cmFwRGVsaW1pdGVyQ2hlY2tSZWdleCwgd3JhcERlbGltaXRlciArIHdyYXBEZWxpbWl0ZXIpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIHRoZSBmaWVsZCBjb250YWlucyBhIGNvbW1hIChmaWVsZCBkZWxpbWl0ZXIpLCBxdW90YXRpb24gbWFyayAod3JhcCBkZWxpbWl0ZXIpLCBsaW5lIGJyZWFrLCBvciBDUkxGXG4gICAgICAgIC8vICAgdGhlbiBlbmNsb3NlIGl0IGluIHF1b3RhdGlvbiBtYXJrcyAod3JhcCBkZWxpbWl0ZXIpXG4gICAgICAgIGlmIChmaWVsZFZhbHVlLmluY2x1ZGVzKG9wdGlvbnMuZGVsaW1pdGVyLmZpZWxkKSB8fFxuICAgICAgICAgICAgZmllbGRWYWx1ZS5pbmNsdWRlcyhvcHRpb25zLmRlbGltaXRlci53cmFwKSB8fFxuICAgICAgICAgICAgZmllbGRWYWx1ZS5tYXRjaChjcmxmU2VhcmNoUmVnZXgpKSB7XG4gICAgICAgICAgICAvLyB3cmFwIHRoZSBmaWVsZCdzIHZhbHVlIGluIGEgd3JhcCBkZWxpbWl0ZXIgKHF1b3RhdGlvbiBtYXJrcyBieSBkZWZhdWx0KVxuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IHdyYXBEZWxpbWl0ZXIgKyBmaWVsZFZhbHVlICsgd3JhcERlbGltaXRlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdlbmVyYXRlcyB0aGUgQ1NWIHJlY29yZCBzdHJpbmcgYnkgam9pbmluZyB0aGUgZmllbGQgdmFsdWVzIHRvZ2V0aGVyIGJ5IHRoZSBmaWVsZCBkZWxpbWl0ZXJcbiAgICAgKiBAcGFyYW0gcmVjb3JkRmllbGRWYWx1ZXNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUNzdlJvd0Zyb21SZWNvcmQocmVjb3JkRmllbGRWYWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHJlY29yZEZpZWxkVmFsdWVzLmpvaW4ob3B0aW9ucy5kZWxpbWl0ZXIuZmllbGQpO1xuICAgIH1cblxuICAgIC8qKiBDU1YgQ09NUE9ORU5UIENPTUJJTkVSL0ZJTkFMIFBST0NFU1NPUiAqKi9cbiAgICAvKipcbiAgICAgKiBQZXJmb3JtcyB0aGUgZmluYWwgQ1NWIGNvbnN0cnVjdGlvbiBieSBjb21iaW5pbmcgdGhlIGZpZWxkcyBpbiB0aGUgYXBwcm9wcmlhdGVcbiAgICAgKiBvcmRlciBkZXBlbmRpbmcgb24gdGhlIHByb3ZpZGVkIG9wdGlvbnMgdmFsdWVzIGFuZCBzZW5kcyB0aGUgZ2VuZXJhdGVkIENTVlxuICAgICAqIGJhY2sgdG8gdGhlIHVzZXJcbiAgICAgKiBAcGFyYW0gcGFyYW1zXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVDc3ZGcm9tQ29tcG9uZW50cyhwYXJhbXMpIHtcbiAgICAgICAgbGV0IGhlYWRlciA9IHBhcmFtcy5oZWFkZXIsXG4gICAgICAgICAgICByZWNvcmRzID0gcGFyYW1zLnJlY29yZHMsXG5cbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBwcmVwZW5kaW5nIHRoZSBoZWFkZXIsIHRoZW4gYWRkIGFuIEVPTCwgb3RoZXJ3aXNlIGp1c3QgcmV0dXJuIHRoZSByZWNvcmRzXG4gICAgICAgICAgICBjc3YgPSAob3B0aW9ucy5leGNlbEJPTSA/IGNvbnN0YW50cy52YWx1ZXMuZXhjZWxCT00gOiAnJykgK1xuICAgICAgICAgICAgICAgIChvcHRpb25zLnByZXBlbmRIZWFkZXIgPyBoZWFkZXIgKyBvcHRpb25zLmRlbGltaXRlci5lb2wgOiAnJykgK1xuICAgICAgICAgICAgICAgIHJlY29yZHM7XG5cbiAgICAgICAgcmV0dXJuIHBhcmFtcy5jYWxsYmFjayhudWxsLCBjc3YpO1xuICAgIH1cblxuICAgIC8qKiBNQUlOIENPTlZFUlRFUiBGVU5DVElPTiAqKi9cblxuICAgIC8qKlxuICAgICAqIEludGVybmFsbHkgZXhwb3J0ZWQganNvbjJjc3YgZnVuY3Rpb25cbiAgICAgKiBUYWtlcyBkYXRhIGFzIGVpdGhlciBhIGRvY3VtZW50IG9yIGFycmF5IG9mIGRvY3VtZW50cyBhbmQgYSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBvcnQgdGhlIHJlc3VsdHNcbiAgICAgKiBAcGFyYW0gZGF0YSB7T2JqZWN0fEFycmF5PE9iamVjdD59IGRvY3VtZW50cyB0byBiZSBjb252ZXJ0ZWQgdG8gY3N2XG4gICAgICogQHBhcmFtIGNhbGxiYWNrIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjb252ZXJ0KGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIC8vIFNpbmdsZSBkb2N1bWVudCwgbm90IGFuIGFycmF5XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGRhdGEpICYmICFkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTsgLy8gQ29udmVydCB0byBhbiBhcnJheSBvZiB0aGUgZ2l2ZW4gZG9jdW1lbnRcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJldHJpZXZlIHRoZSBoZWFkaW5nIGFuZCB0aGVuIGdlbmVyYXRlIHRoZSBDU1Ygd2l0aCB0aGUga2V5cyB0aGF0IGFyZSBpZGVudGlmaWVkXG4gICAgICAgIHJldHJpZXZlSGVhZGVyRmllbGRzKGRhdGEpXG4gICAgICAgICAgICAudGhlbigoaGVhZGVyRmllbGRzKSA9PiAoe1xuICAgICAgICAgICAgICAgIGhlYWRlckZpZWxkcyxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayxcbiAgICAgICAgICAgICAgICByZWNvcmRzOiBkYXRhXG4gICAgICAgICAgICB9KSlcbiAgICAgICAgICAgIC50aGVuKHByb2Nlc3NSZWNvcmRzKVxuICAgICAgICAgICAgLnRoZW4od3JhcEhlYWRlckZpZWxkcylcbiAgICAgICAgICAgIC50aGVuKHRyaW1IZWFkZXJGaWVsZHMpXG4gICAgICAgICAgICAudGhlbihnZW5lcmF0ZUNzdkhlYWRlcilcbiAgICAgICAgICAgIC50aGVuKGdlbmVyYXRlQ3N2RnJvbUNvbXBvbmVudHMpXG4gICAgICAgICAgICAuY2F0Y2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGNvbnZlcnQsXG4gICAgICAgIHZhbGlkYXRpb25GbjogXy5pc09iamVjdCxcbiAgICAgICAgdmFsaWRhdGlvbk1lc3NhZ2VzOiBjb25zdGFudHMuZXJyb3JzLmpzb24yY3N2XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geyBKc29uMkNzdiB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5sZXQgY29uc3RhbnRzID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanNvbicpLFxuICAgIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbmNvbnN0IGRhdGVTdHJpbmdSZWdleCA9IC9cXGR7NH0tXFxkezJ9LVxcZHsyfVRcXGR7Mn06XFxkezJ9OlxcZHsyfS5cXGR7M31aLztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgaXNTdHJpbmdSZXByZXNlbnRhdGlvbixcbiAgICBpc0RhdGVSZXByZXNlbnRhdGlvbixcbiAgICBjb21wdXRlU2NoZW1hRGlmZmVyZW5jZXMsXG4gICAgZGVlcENvcHksXG4gICAgY29udmVydCxcbiAgICBpc0VtcHR5RmllbGQsXG4gICAgcmVtb3ZlRW1wdHlGaWVsZHMsXG4gICAgZ2V0TkNoYXJhY3RlcnNcbn07XG5cbi8qKlxuICogQnVpbGQgdGhlIG9wdGlvbnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBhcHByb3ByaWF0ZSBmdW5jdGlvblxuICogSWYgYSB1c2VyIGRvZXMgbm90IHByb3ZpZGUgY3VzdG9tIG9wdGlvbnMsIHRoZW4gd2UgdXNlIG91ciBkZWZhdWx0XG4gKiBJZiBvcHRpb25zIGFyZSBwcm92aWRlZCwgdGhlbiB3ZSBzZXQgZWFjaCB2YWxpZCBrZXkgdGhhdCB3YXMgcGFzc2VkXG4gKiBAcGFyYW0gb3B0cyB7T2JqZWN0fSBvcHRpb25zIG9iamVjdFxuICogQHJldHVybiB7T2JqZWN0fSBvcHRpb25zIG9iamVjdFxuICovXG5mdW5jdGlvbiBidWlsZE9wdGlvbnMob3B0cykge1xuICAgIG9wdHMgPSBfLmRlZmF1bHRzKG9wdHMgfHwge30sIGNvbnN0YW50cy5kZWZhdWx0T3B0aW9ucyk7XG5cbiAgICAvLyBOb3RlOiBfLmRlZmF1bHRzIGRvZXMgYSBzaGFsbG93IGRlZmF1bHQsIHdlIG5lZWQgdG8gZGVlcCBjb3B5IHRoZSBERUxJTUlURVIgb2JqZWN0XG4gICAgb3B0cy5kZWxpbWl0ZXIgPSBfLmRlZmF1bHRzKG9wdHMuZGVsaW1pdGVyLCBjb25zdGFudHMuZGVmYXVsdE9wdGlvbnMuZGVsaW1pdGVyKTtcblxuICAgIC8vIE90aGVyd2lzZSwgc2VuZCB0aGUgb3B0aW9ucyBiYWNrXG4gICAgcmV0dXJuIG9wdHM7XG59XG5cbi8qKlxuICogV2hlbiBwcm9taXNpZmllZCwgdGhlIGNhbGxiYWNrIGFuZCBvcHRpb25zIGFyZ3VtZW50IG9yZGVyaW5nIGlzIHN3YXBwZWQsIHNvXG4gKiB0aGlzIGZ1bmN0aW9uIGlzIGludGVuZGVkIHRvIGRldGVybWluZSB3aGljaCBhcmd1bWVudCBpcyB3aGljaCBhbmQgcmV0dXJuXG4gKiB0aGVtIGluIHRoZSBjb3JyZWN0IG9yZGVyXG4gKiBAcGFyYW0gYXJnMSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRpb25zIG9yIGNhbGxiYWNrXG4gKiBAcGFyYW0gYXJnMiB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRpb25zIG9yIGNhbGxiYWNrXG4gKi9cbmZ1bmN0aW9uIHBhcnNlQXJndW1lbnRzKGFyZzEsIGFyZzIpIHtcbiAgICAvLyBJZiB0aGlzIHdhcyBwcm9taXNpZmllZCAoY2FsbGJhY2sgYW5kIG9wdHMgYXJlIHN3YXBwZWQpIHRoZW4gZml4IHRoZSBhcmd1bWVudCBvcmRlci5cbiAgICBpZiAoXy5pc09iamVjdChhcmcxKSAmJiAhXy5pc0Z1bmN0aW9uKGFyZzEpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvcHRpb25zOiBhcmcxLFxuICAgICAgICAgICAgY2FsbGJhY2s6IGFyZzJcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gUmVndWxhciBvcmRlcmluZyB3aGVyZSB0aGUgY2FsbGJhY2sgaXMgcHJvdmlkZWQgYmVmb3JlIHRoZSBvcHRpb25zIG9iamVjdFxuICAgIHJldHVybiB7XG4gICAgICAgIG9wdGlvbnM6IGFyZzIsXG4gICAgICAgIGNhbGxiYWNrOiBhcmcxXG4gICAgfTtcbn1cblxuLyoqXG4gKiBWYWxpZGF0ZXMgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIGluIHRvIGpzb24yY3N2IGFuZCBjc3YyanNvblxuICogQHBhcmFtIGNvbmZpZyB7T2JqZWN0fSBvZiB0aGUgZm9ybTogeyBkYXRhOiB7QW55fSwgY2FsbGJhY2s6IHtGdW5jdGlvbn0sIGRhdGFDaGVja0ZuOiBGdW5jdGlvbiwgZXJyb3JNZXNzYWdlczoge09iamVjdH0gfVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZVBhcmFtZXRlcnMoY29uZmlnKSB7XG4gICAgLy8gSWYgYSBjYWxsYmFjayB3YXNuJ3QgcHJvdmlkZWQsIHRocm93IGFuIGVycm9yXG4gICAgaWYgKCFjb25maWcuY2FsbGJhY2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGNvbnN0YW50cy5lcnJvcnMuY2FsbGJhY2tSZXF1aXJlZCk7XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgZG9uJ3QgcmVjZWl2ZSBkYXRhLCByZXBvcnQgYW4gZXJyb3JcbiAgICBpZiAoIWNvbmZpZy5kYXRhKSB7XG4gICAgICAgIGNvbmZpZy5jYWxsYmFjayhuZXcgRXJyb3IoY29uZmlnLmVycm9yTWVzc2FnZXMuY2Fubm90Q2FsbE9uICsgY29uZmlnLmRhdGEgKyAnLicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIFRoZSBkYXRhIHByb3ZpZGVkIGRhdGEgZG9lcyBub3QgbWVldCB0aGUgdHlwZSBjaGVjayByZXF1aXJlbWVudFxuICAgIGlmICghY29uZmlnLmRhdGFDaGVja0ZuKGNvbmZpZy5kYXRhKSkge1xuICAgICAgICBjb25maWcuY2FsbGJhY2sobmV3IEVycm9yKGNvbmZpZy5lcnJvck1lc3NhZ2VzLmRhdGFDaGVja0ZhaWx1cmUpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGRpZG4ndCBoaXQgYW55IGtub3duIGVycm9yIGNvbmRpdGlvbnMsIHRoZW4gdGhlIGRhdGEgaXMgc28gZmFyIGRldGVybWluZWQgdG8gYmUgdmFsaWRcbiAgICAvLyBOb3RlOiBqc29uMmNzdi9jc3YyanNvbiBtYXkgcGVyZm9ybSBhZGRpdGlvbmFsIHZhbGlkaXR5IGNoZWNrcyBvbiB0aGUgZGF0YVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIEFic3RyYWN0ZWQgZnVuY3Rpb24gdG8gcGVyZm9ybSB0aGUgY29udmVyc2lvbiBvZiBqc29uLS0+Y3N2IG9yIGNzdi0tPmpzb25cbiAqIGRlcGVuZGluZyBvbiB0aGUgY29udmVydGVyIGNsYXNzIHRoYXQgaXMgcGFzc2VkIHZpYSB0aGUgcGFyYW1zIG9iamVjdFxuICogQHBhcmFtIHBhcmFtcyB7T2JqZWN0fVxuICovXG5mdW5jdGlvbiBjb252ZXJ0KHBhcmFtcykge1xuICAgIGxldCB7b3B0aW9ucywgY2FsbGJhY2t9ID0gcGFyc2VBcmd1bWVudHMocGFyYW1zLmNhbGxiYWNrLCBwYXJhbXMub3B0aW9ucyk7XG4gICAgb3B0aW9ucyA9IGJ1aWxkT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIGxldCBjb252ZXJ0ZXIgPSBuZXcgcGFyYW1zLmNvbnZlcnRlcihvcHRpb25zKSxcblxuICAgICAgICAvLyBWYWxpZGF0ZSB0aGUgcGFyYW1ldGVycyBiZWZvcmUgY2FsbGluZyB0aGUgY29udmVydGVyJ3MgY29udmVydCBmdW5jdGlvblxuICAgICAgICB2YWxpZCA9IHZhbGlkYXRlUGFyYW1ldGVycyh7XG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMuZGF0YSxcbiAgICAgICAgICAgIGNhbGxiYWNrLFxuICAgICAgICAgICAgZXJyb3JNZXNzYWdlczogY29udmVydGVyLnZhbGlkYXRpb25NZXNzYWdlcyxcbiAgICAgICAgICAgIGRhdGFDaGVja0ZuOiBjb252ZXJ0ZXIudmFsaWRhdGlvbkZuXG4gICAgICAgIH0pO1xuXG4gICAgaWYgKHZhbGlkKSBjb252ZXJ0ZXIuY29udmVydChwYXJhbXMuZGF0YSwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gZGVlcCBjb3B5IGFuIG9iamVjdCwgdXNlZCBieSB0aGUgbW9kdWxlIHRlc3RzXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJucyB7YW55fVxuICovXG5mdW5jdGlvbiBkZWVwQ29weShvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcbn1cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGEgcmVwcmVzZW50YXRpb25cbiAqICAgb2YgYSBzdHJpbmcuIEdpdmVuIHRoZSBSRkM0MTgwIHJlcXVpcmVtZW50cywgdGhhdCBtZWFucyB0aGF0IHRoZSB2YWx1ZSBpc1xuICogICB3cmFwcGVkIGluIHZhbHVlIHdyYXAgZGVsaW1pdGVycyAodXN1YWxseSBhIHF1b3RhdGlvbiBtYXJrIG9uIGVhY2ggc2lkZSkuXG4gKiBAcGFyYW0gZmllbGRWYWx1ZVxuICogQHBhcmFtIG9wdGlvbnNcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc1N0cmluZ1JlcHJlc2VudGF0aW9uKGZpZWxkVmFsdWUsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBmaXJzdENoYXIgPSBmaWVsZFZhbHVlWzBdLFxuICAgICAgICBsYXN0SW5kZXggPSBmaWVsZFZhbHVlLmxlbmd0aCAtIDEsXG4gICAgICAgIGxhc3RDaGFyID0gZmllbGRWYWx1ZVtsYXN0SW5kZXhdO1xuXG4gICAgLy8gSWYgdGhlIGZpZWxkIHN0YXJ0cyBhbmQgZW5kcyB3aXRoIGEgd3JhcCBkZWxpbWl0ZXJcbiAgICByZXR1cm4gZmlyc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwICYmIGxhc3RDaGFyID09PSBvcHRpb25zLmRlbGltaXRlci53cmFwO1xufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgcHJvdmlkZWQgdmFsdWUgaXMgYSByZXByZXNlbnRhdGlvblxuICogICBvZiBhIGRhdGUuXG4gKiBAcGFyYW0gZmllbGRWYWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRGF0ZVJlcHJlc2VudGF0aW9uKGZpZWxkVmFsdWUpIHtcbiAgICByZXR1cm4gZGF0ZVN0cmluZ1JlZ2V4LnRlc3QoZmllbGRWYWx1ZSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB0aGUgc2NoZW1hIGRpZmZlcmVuY2VzIGJldHdlZW4gdHdvIG9iamVjdHMuXG4gKiBAcGFyYW0gc2NoZW1hQVxuICogQHBhcmFtIHNjaGVtYUJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBjb21wdXRlU2NoZW1hRGlmZmVyZW5jZXMoc2NoZW1hQSwgc2NoZW1hQikge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2Uoc2NoZW1hQSwgc2NoZW1hQilcbiAgICAgICAgLmNvbmNhdChfLmRpZmZlcmVuY2Uoc2NoZW1hQiwgc2NoZW1hQSkpO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY2hlY2sgaWYgYSBmaWVsZCBpcyBjb25zaWRlcmVkIGVtcHR5IHNvIHRoYXQgdGhlIGVtcHR5RmllbGRWYWx1ZSBjYW4gYmUgdXNlZCBpbnN0ZWFkXG4gKiBAcGFyYW0gZmllbGRWYWx1ZVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzRW1wdHlGaWVsZChmaWVsZFZhbHVlKSB7XG4gICAgcmV0dXJuIF8uaXNVbmRlZmluZWQoZmllbGRWYWx1ZSkgfHwgXy5pc051bGwoZmllbGRWYWx1ZSkgfHwgZmllbGRWYWx1ZSA9PT0gJyc7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmVtb3ZlcyBlbXB0eSBmaWVsZCB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAqIEBwYXJhbSBmaWVsZHNcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRW1wdHlGaWVsZHMoZmllbGRzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGZpZWxkcywgKGZpZWxkKSA9PiAhaXNFbXB0eUZpZWxkKGZpZWxkKSk7XG59XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0cmlldmVzIHRoZSBuZXh0IG4gY2hhcmFjdGVycyBmcm9tIHRoZSBzdGFydCBpbmRleCBpblxuICogICB0aGUgc3RyaW5nIGluY2x1ZGluZyB0aGUgY2hhcmFjdGVyIGF0IHRoZSBzdGFydCBpbmRleC4gVGhpcyBpcyB1c2VkIHRvXG4gKiAgIGNoZWNrIGlmIGFyZSBjdXJyZW50bHkgYXQgYW4gRU9MIHZhbHVlLCBzaW5jZSBpdCBjb3VsZCBiZSBtdWx0aXBsZVxuICogICBjaGFyYWN0ZXJzIGluIGxlbmd0aCAoZWcuICdcXHJcXG4nKVxuICogQHBhcmFtIHN0clxuICogQHBhcmFtIHN0YXJ0XG4gKiBAcGFyYW0gblxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0TkNoYXJhY3RlcnMoc3RyLCBzdGFydCwgbikge1xuICAgIHJldHVybiBzdHIuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIG4pO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKGdsb2JhbCkge1xuXG4gICAgLy8gbWluaW1hbCBzeW1ib2wgcG9seWZpbGwgZm9yIElFMTEgYW5kIG90aGVyc1xuICAgIGlmICh0eXBlb2YgU3ltYm9sICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHZhciBTeW1ib2wgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm4gbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIFN5bWJvbC5ub25OYXRpdmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IFNUQVRFX1BMQUlOVEVYVCA9IFN5bWJvbCgncGxhaW50ZXh0Jyk7XG4gICAgY29uc3QgU1RBVEVfSFRNTCAgICAgID0gU3ltYm9sKCdodG1sJyk7XG4gICAgY29uc3QgU1RBVEVfQ09NTUVOVCAgID0gU3ltYm9sKCdjb21tZW50Jyk7XG5cbiAgICBjb25zdCBBTExPV0VEX1RBR1NfUkVHRVggID0gLzwoXFx3Kik+L2c7XG4gICAgY29uc3QgTk9STUFMSVpFX1RBR19SRUdFWCA9IC88XFwvPyhbXlxcc1xcLz5dKykvO1xuXG4gICAgZnVuY3Rpb24gc3RyaXB0YWdzKGh0bWwsIGFsbG93YWJsZV90YWdzLCB0YWdfcmVwbGFjZW1lbnQpIHtcbiAgICAgICAgaHRtbCAgICAgICAgICAgID0gaHRtbCB8fCAnJztcbiAgICAgICAgYWxsb3dhYmxlX3RhZ3MgID0gYWxsb3dhYmxlX3RhZ3MgfHwgW107XG4gICAgICAgIHRhZ19yZXBsYWNlbWVudCA9IHRhZ19yZXBsYWNlbWVudCB8fCAnJztcblxuICAgICAgICBsZXQgY29udGV4dCA9IGluaXRfY29udGV4dChhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KTtcblxuICAgICAgICByZXR1cm4gc3RyaXB0YWdzX2ludGVybmFsKGh0bWwsIGNvbnRleHQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluaXRfc3RyaXB0YWdzX3N0cmVhbShhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGFsbG93YWJsZV90YWdzICA9IGFsbG93YWJsZV90YWdzIHx8IFtdO1xuICAgICAgICB0YWdfcmVwbGFjZW1lbnQgPSB0YWdfcmVwbGFjZW1lbnQgfHwgJyc7XG5cbiAgICAgICAgbGV0IGNvbnRleHQgPSBpbml0X2NvbnRleHQoYWxsb3dhYmxlX3RhZ3MsIHRhZ19yZXBsYWNlbWVudCk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHN0cmlwdGFnc19zdHJlYW0oaHRtbCkge1xuICAgICAgICAgICAgcmV0dXJuIHN0cmlwdGFnc19pbnRlcm5hbChodG1sIHx8ICcnLCBjb250ZXh0KTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdHJpcHRhZ3MuaW5pdF9zdHJlYW1pbmdfbW9kZSA9IGluaXRfc3RyaXB0YWdzX3N0cmVhbTtcblxuICAgIGZ1bmN0aW9uIGluaXRfY29udGV4dChhbGxvd2FibGVfdGFncywgdGFnX3JlcGxhY2VtZW50KSB7XG4gICAgICAgIGFsbG93YWJsZV90YWdzID0gcGFyc2VfYWxsb3dhYmxlX3RhZ3MoYWxsb3dhYmxlX3RhZ3MpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhbGxvd2FibGVfdGFncyA6IGFsbG93YWJsZV90YWdzLFxuICAgICAgICAgICAgdGFnX3JlcGxhY2VtZW50OiB0YWdfcmVwbGFjZW1lbnQsXG5cbiAgICAgICAgICAgIHN0YXRlICAgICAgICAgOiBTVEFURV9QTEFJTlRFWFQsXG4gICAgICAgICAgICB0YWdfYnVmZmVyICAgIDogJycsXG4gICAgICAgICAgICBkZXB0aCAgICAgICAgIDogMCxcbiAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0cmlwdGFnc19pbnRlcm5hbChodG1sLCBjb250ZXh0KSB7XG4gICAgICAgIGxldCBhbGxvd2FibGVfdGFncyAgPSBjb250ZXh0LmFsbG93YWJsZV90YWdzO1xuICAgICAgICBsZXQgdGFnX3JlcGxhY2VtZW50ID0gY29udGV4dC50YWdfcmVwbGFjZW1lbnQ7XG5cbiAgICAgICAgbGV0IHN0YXRlICAgICAgICAgPSBjb250ZXh0LnN0YXRlO1xuICAgICAgICBsZXQgdGFnX2J1ZmZlciAgICA9IGNvbnRleHQudGFnX2J1ZmZlcjtcbiAgICAgICAgbGV0IGRlcHRoICAgICAgICAgPSBjb250ZXh0LmRlcHRoO1xuICAgICAgICBsZXQgaW5fcXVvdGVfY2hhciA9IGNvbnRleHQuaW5fcXVvdGVfY2hhcjtcbiAgICAgICAgbGV0IG91dHB1dCAgICAgICAgPSAnJztcblxuICAgICAgICBmb3IgKGxldCBpZHggPSAwLCBsZW5ndGggPSBodG1sLmxlbmd0aDsgaWR4IDwgbGVuZ3RoOyBpZHgrKykge1xuICAgICAgICAgICAgbGV0IGNoYXIgPSBodG1sW2lkeF07XG5cbiAgICAgICAgICAgIGlmIChzdGF0ZSA9PT0gU1RBVEVfUExBSU5URVhUKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChjaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJzwnOlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICAgPSBTVEFURV9IVE1MO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEVfSFRNTCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSAnPCcgaWYgaW5zaWRlIGEgcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIHNlZWluZyBhIG5lc3RlZCAnPCdcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoKys7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlnbm9yZSAnPicgaWYgaW5zaWRlIGEgcXVvdGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbl9xdW90ZV9jaGFyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNvbWV0aGluZyBsaWtlIHRoaXMgaXMgaGFwcGVuaW5nOiAnPDw+PidcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXB0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoLS07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhpcyBpcyBjbG9zaW5nIHRoZSB0YWcgaW4gdGFnX2J1ZmZlclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5fcXVvdGVfY2hhciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgICAgICAgICA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgICArPSAnPic7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbGxvd2FibGVfdGFncy5oYXMobm9ybWFsaXplX3RhZyh0YWdfYnVmZmVyKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gdGFnX2J1ZmZlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IHRhZ19yZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdcXCcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2F0Y2ggYm90aCBzaW5nbGUgYW5kIGRvdWJsZSBxdW90ZXNcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoYXIgPT09IGluX3F1b3RlX2NoYXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbl9xdW90ZV9jaGFyID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluX3F1b3RlX2NoYXIgPSBpbl9xdW90ZV9jaGFyIHx8IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJy0nOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRhZ19idWZmZXIgPT09ICc8IS0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBTVEFURV9DT01NRU5UO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlICcgJzpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnXFxuJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyID09PSAnPCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSAgICAgID0gU1RBVEVfUExBSU5URVhUO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCAgICArPSAnPCAnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdfYnVmZmVyICs9IGNoYXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciArPSBjaGFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0ZSA9PT0gU1RBVEVfQ09NTUVOVCkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoY2hhcikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICc+JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0YWdfYnVmZmVyLnNsaWNlKC0yKSA9PSAnLS0nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2xvc2UgdGhlIGNvbW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZSA9IFNUQVRFX1BMQUlOVEVYVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGFnX2J1ZmZlciA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ19idWZmZXIgKz0gY2hhcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNhdmUgdGhlIGNvbnRleHQgZm9yIGZ1dHVyZSBpdGVyYXRpb25zXG4gICAgICAgIGNvbnRleHQuc3RhdGUgICAgICAgICA9IHN0YXRlO1xuICAgICAgICBjb250ZXh0LnRhZ19idWZmZXIgICAgPSB0YWdfYnVmZmVyO1xuICAgICAgICBjb250ZXh0LmRlcHRoICAgICAgICAgPSBkZXB0aDtcbiAgICAgICAgY29udGV4dC5pbl9xdW90ZV9jaGFyID0gaW5fcXVvdGVfY2hhcjtcblxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBhcnNlX2FsbG93YWJsZV90YWdzKGFsbG93YWJsZV90YWdzKSB7XG4gICAgICAgIGxldCB0YWdfc2V0ID0gbmV3IFNldCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgYWxsb3dhYmxlX3RhZ3MgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBsZXQgbWF0Y2g7XG5cbiAgICAgICAgICAgIHdoaWxlICgobWF0Y2ggPSBBTExPV0VEX1RBR1NfUkVHRVguZXhlYyhhbGxvd2FibGVfdGFncykpKSB7XG4gICAgICAgICAgICAgICAgdGFnX3NldC5hZGQobWF0Y2hbMV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAoIVN5bWJvbC5ub25OYXRpdmUgJiZcbiAgICAgICAgICAgICAgICAgdHlwZW9mIGFsbG93YWJsZV90YWdzW1N5bWJvbC5pdGVyYXRvcl0gPT09ICdmdW5jdGlvbicpIHtcblxuICAgICAgICAgICAgdGFnX3NldCA9IG5ldyBTZXQoYWxsb3dhYmxlX3RhZ3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGFsbG93YWJsZV90YWdzLmZvckVhY2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIElFMTEgY29tcGF0aWJsZVxuICAgICAgICAgICAgYWxsb3dhYmxlX3RhZ3MuZm9yRWFjaCh0YWdfc2V0LmFkZCwgdGFnX3NldCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFnX3NldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3JtYWxpemVfdGFnKHRhZ19idWZmZXIpIHtcbiAgICAgICAgbGV0IG1hdGNoID0gTk9STUFMSVpFX1RBR19SRUdFWC5leGVjKHRhZ19idWZmZXIpO1xuXG4gICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiBudWxsO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1EXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiBtb2R1bGVfZmFjdG9yeSgpIHsgcmV0dXJuIHN0cmlwdGFnczsgfSk7XG4gICAgfVxuXG4gICAgZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgLy8gTm9kZVxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHN0cmlwdGFncztcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlclxuICAgICAgICBnbG9iYWwuc3RyaXB0YWdzID0gc3RyaXB0YWdzO1xuICAgIH1cbn0odGhpcykpO1xuIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS45LjFcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTggSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgLy8gb24gdGhlIHNlcnZlciwgb3IgYHRoaXNgIGluIHNvbWUgdmlydHVhbCBtYWNoaW5lcy4gV2UgdXNlIGBzZWxmYFxuICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbC5nbG9iYWwgPT09IGdsb2JhbCAmJiBnbG9iYWwgfHxcbiAgICAgICAgICAgIHRoaXMgfHxcbiAgICAgICAgICAgIHt9O1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcbiAgdmFyIFN5bWJvbFByb3RvID0gdHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgPyBTeW1ib2wucHJvdG90eXBlIDogbnVsbDtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyIHB1c2ggPSBBcnJheVByb3RvLnB1c2gsXG4gICAgICBzbGljZSA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgICB0b1N0cmluZyA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgICAgaGFzT3duUHJvcGVydHkgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhciBuYXRpdmVJc0FycmF5ID0gQXJyYXkuaXNBcnJheSxcbiAgICAgIG5hdGl2ZUtleXMgPSBPYmplY3Qua2V5cyxcbiAgICAgIG5hdGl2ZUNyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZWlyIG9sZCBtb2R1bGUgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIC8vIChgbm9kZVR5cGVgIGlzIGNoZWNrZWQgdG8gZW5zdXJlIHRoYXQgYG1vZHVsZWBcbiAgLy8gYW5kIGBleHBvcnRzYCBhcmUgbm90IEhUTUwgZWxlbWVudHMuKVxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT0gJ3VuZGVmaW5lZCcgJiYgIWV4cG9ydHMubm9kZVR5cGUpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJyAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjkuMSc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBvcHRpbWl6ZUNiID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgICBzd2l0Y2ggKGFyZ0NvdW50ID09IG51bGwgPyAzIDogYXJnQ291bnQpIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIC8vIFRoZSAyLWFyZ3VtZW50IGNhc2UgaXMgb21pdHRlZCBiZWNhdXNlIHdl4oCZcmUgbm90IHVzaW5nIGl0LlxuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgdmFyIGJ1aWx0aW5JdGVyYXRlZTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZCB0byBlYWNoXG4gIC8vIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXIgYGlkZW50aXR5YCxcbiAgLy8gYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIHZhciBjYiA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChfLml0ZXJhdGVlICE9PSBidWlsdGluSXRlcmF0ZWUpIHJldHVybiBfLml0ZXJhdGVlKHZhbHVlLCBjb250ZXh0KTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpICYmICFfLmlzQXJyYXkodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG5cbiAgLy8gRXh0ZXJuYWwgd3JhcHBlciBmb3Igb3VyIGNhbGxiYWNrIGdlbmVyYXRvci4gVXNlcnMgbWF5IGN1c3RvbWl6ZVxuICAvLyBgXy5pdGVyYXRlZWAgaWYgdGhleSB3YW50IGFkZGl0aW9uYWwgcHJlZGljYXRlL2l0ZXJhdGVlIHNob3J0aGFuZCBzdHlsZXMuXG4gIC8vIFRoaXMgYWJzdHJhY3Rpb24gaGlkZXMgdGhlIGludGVybmFsLW9ubHkgYXJnQ291bnQgYXJndW1lbnQuXG4gIF8uaXRlcmF0ZWUgPSBidWlsdGluSXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIFNvbWUgZnVuY3Rpb25zIHRha2UgYSB2YXJpYWJsZSBudW1iZXIgb2YgYXJndW1lbnRzLCBvciBhIGZldyBleHBlY3RlZFxuICAvLyBhcmd1bWVudHMgYXQgdGhlIGJlZ2lubmluZyBhbmQgdGhlbiBhIHZhcmlhYmxlIG51bWJlciBvZiB2YWx1ZXMgdG8gb3BlcmF0ZVxuICAvLyBvbi4gVGhpcyBoZWxwZXIgYWNjdW11bGF0ZXMgYWxsIHJlbWFpbmluZyBhcmd1bWVudHMgcGFzdCB0aGUgZnVuY3Rpb27igJlzXG4gIC8vIGFyZ3VtZW50IGxlbmd0aCAob3IgYW4gZXhwbGljaXQgYHN0YXJ0SW5kZXhgKSwgaW50byBhbiBhcnJheSB0aGF0IGJlY29tZXNcbiAgLy8gdGhlIGxhc3QgYXJndW1lbnQuIFNpbWlsYXIgdG8gRVM24oCZcyBcInJlc3QgcGFyYW1ldGVyXCIuXG4gIHZhciByZXN0QXJndW1lbnRzID0gZnVuY3Rpb24oZnVuYywgc3RhcnRJbmRleCkge1xuICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoYXJndW1lbnRzLmxlbmd0aCAtIHN0YXJ0SW5kZXgsIDApLFxuICAgICAgICAgIHJlc3QgPSBBcnJheShsZW5ndGgpLFxuICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgIGZvciAoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgfVxuICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIGFyZ3VtZW50c1swXSwgcmVzdCk7XG4gICAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSwgcmVzdCk7XG4gICAgICB9XG4gICAgICB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgfVxuICAgICAgYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBzaGFsbG93UHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBoYXMgPSBmdW5jdGlvbihvYmosIHBhdGgpIHtcbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHBhdGgpO1xuICB9XG5cbiAgdmFyIGRlZXBHZXQgPSBmdW5jdGlvbihvYmosIHBhdGgpIHtcbiAgICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgICAgb2JqID0gb2JqW3BhdGhbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gbGVuZ3RoID8gb2JqIDogdm9pZCAwO1xuICB9O1xuXG4gIC8vIEhlbHBlciBmb3IgY29sbGVjdGlvbiBtZXRob2RzIHRvIGRldGVybWluZSB3aGV0aGVyIGEgY29sbGVjdGlvblxuICAvLyBzaG91bGQgYmUgaXRlcmF0ZWQgYXMgYW4gYXJyYXkgb3IgYXMgYW4gb2JqZWN0LlxuICAvLyBSZWxhdGVkOiBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy10b2xlbmd0aFxuICAvLyBBdm9pZHMgYSB2ZXJ5IG5hc3R5IGlPUyA4IEpJVCBidWcgb24gQVJNLTY0LiAjMjA5NFxuICB2YXIgTUFYX0FSUkFZX0lOREVYID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIGdldExlbmd0aCA9IHNoYWxsb3dQcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICB2YXIgY3JlYXRlUmVkdWNlID0gZnVuY3Rpb24oZGlyKSB7XG4gICAgLy8gV3JhcCBjb2RlIHRoYXQgcmVhc3NpZ25zIGFyZ3VtZW50IHZhcmlhYmxlcyBpbiBhIHNlcGFyYXRlIGZ1bmN0aW9uIHRoYW5cbiAgICAvLyB0aGUgb25lIHRoYXQgYWNjZXNzZXMgYGFyZ3VtZW50cy5sZW5ndGhgIHRvIGF2b2lkIGEgcGVyZiBoaXQuICgjMTk5MSlcbiAgICB2YXIgcmVkdWNlciA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGluaXRpYWwpIHtcbiAgICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgICAgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgICBpZiAoIWluaXRpYWwpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgICAgdmFyIGluaXRpYWwgPSBhcmd1bWVudHMubGVuZ3RoID49IDM7XG4gICAgICByZXR1cm4gcmVkdWNlcihvYmosIG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDQpLCBtZW1vLCBpbml0aWFsKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBjcmVhdGVSZWR1Y2UoMSk7XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gY3JlYXRlUmVkdWNlKC0xKTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIga2V5RmluZGVyID0gaXNBcnJheUxpa2Uob2JqKSA/IF8uZmluZEluZGV4IDogXy5maW5kS2V5O1xuICAgIHZhciBrZXkgPSBrZXlGaW5kZXIob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIGlmIChrZXkgIT09IHZvaWQgMCAmJiBrZXkgIT09IC0xKSByZXR1cm4gb2JqW2tleV07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm5lZ2F0ZShjYihwcmVkaWNhdGUpKSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKCFwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiBpdGVtICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVzYCBhbmQgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlcyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgaXRlbSwgZnJvbUluZGV4LCBndWFyZCkge1xuICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICBpZiAodHlwZW9mIGZyb21JbmRleCAhPSAnbnVtYmVyJyB8fCBndWFyZCkgZnJvbUluZGV4ID0gMDtcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgaXRlbSwgZnJvbUluZGV4KSA+PSAwO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24ob2JqLCBwYXRoLCBhcmdzKSB7XG4gICAgdmFyIGNvbnRleHRQYXRoLCBmdW5jO1xuICAgIGlmIChfLmlzRnVuY3Rpb24ocGF0aCkpIHtcbiAgICAgIGZ1bmMgPSBwYXRoO1xuICAgIH0gZWxzZSBpZiAoXy5pc0FycmF5KHBhdGgpKSB7XG4gICAgICBjb250ZXh0UGF0aCA9IHBhdGguc2xpY2UoMCwgLTEpO1xuICAgICAgcGF0aCA9IHBhdGhbcGF0aC5sZW5ndGggLSAxXTtcbiAgICB9XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24oY29udGV4dCkge1xuICAgICAgdmFyIG1ldGhvZCA9IGZ1bmM7XG4gICAgICBpZiAoIW1ldGhvZCkge1xuICAgICAgICBpZiAoY29udGV4dFBhdGggJiYgY29udGV4dFBhdGgubGVuZ3RoKSB7XG4gICAgICAgICAgY29udGV4dCA9IGRlZXBHZXQoY29udGV4dCwgY29udGV4dFBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb250ZXh0ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgICAgIG1ldGhvZCA9IGNvbnRleHRbcGF0aF07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWV0aG9kID09IG51bGwgPyBtZXRob2QgOiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgfHwgdHlwZW9mIGl0ZXJhdGVlID09ICdudW1iZXInICYmIHR5cGVvZiBvYmpbMF0gIT0gJ29iamVjdCcgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgdmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHYsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodiwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IC1JbmZpbml0eSAmJiByZXN1bHQgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHY7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsIHx8IHR5cGVvZiBpdGVyYXRlZSA9PSAnbnVtYmVyJyAmJiB0eXBlb2Ygb2JqWzBdICE9ICdvYmplY3QnICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSAhPSBudWxsICYmIHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2LCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHYsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdjtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhIGNvbGxlY3Rpb24uXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLnNhbXBsZShvYmosIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbiB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICB2YXIgc2FtcGxlID0gaXNBcnJheUxpa2Uob2JqKSA/IF8uY2xvbmUob2JqKSA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChzYW1wbGUpO1xuICAgIG4gPSBNYXRoLm1heChNYXRoLm1pbihuLCBsZW5ndGgpLCAwKTtcbiAgICB2YXIgbGFzdCA9IGxlbmd0aCAtIDE7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IG47IGluZGV4KyspIHtcbiAgICAgIHZhciByYW5kID0gXy5yYW5kb20oaW5kZXgsIGxhc3QpO1xuICAgICAgdmFyIHRlbXAgPSBzYW1wbGVbaW5kZXhdO1xuICAgICAgc2FtcGxlW2luZGV4XSA9IHNhbXBsZVtyYW5kXTtcbiAgICAgIHNhbXBsZVtyYW5kXSA9IHRlbXA7XG4gICAgfVxuICAgIHJldHVybiBzYW1wbGUuc2xpY2UoMCwgbik7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgrKyxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBrZXksIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvciwgcGFydGl0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSBwYXJ0aXRpb24gPyBbW10sIFtdXSA6IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChoYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTsgZWxzZSByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKGhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldKys7IGVsc2UgcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICB2YXIgcmVTdHJTeW1ib2wgPSAvW15cXHVkODAwLVxcdWRmZmZdfFtcXHVkODAwLVxcdWRiZmZdW1xcdWRjMDAtXFx1ZGZmZl18W1xcdWQ4MDAtXFx1ZGZmZl0vZztcbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKF8uaXNTdHJpbmcob2JqKSkge1xuICAgICAgLy8gS2VlcCBzdXJyb2dhdGUgcGFpciBjaGFyYWN0ZXJzIHRvZ2V0aGVyXG4gICAgICByZXR1cm4gb2JqLm1hdGNoKHJlU3RyU3ltYm9sKTtcbiAgICB9XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwgcGFzcykge1xuICAgIHJlc3VsdFtwYXNzID8gMCA6IDFdLnB1c2godmFsdWUpO1xuICB9LCB0cnVlKTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwgfHwgYXJyYXkubGVuZ3RoIDwgMSkgcmV0dXJuIG4gPT0gbnVsbCA/IHZvaWQgMCA6IFtdO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICByZXR1cm4gXy5pbml0aWFsKGFycmF5LCBhcnJheS5sZW5ndGggLSBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIChuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbikpKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsIHx8IGFycmF5Lmxlbmd0aCA8IDEpIHJldHVybiBuID09IG51bGwgPyB2b2lkIDAgOiBbXTtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIEJvb2xlYW4pO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpIHtcbiAgICBvdXRwdXQgPSBvdXRwdXQgfHwgW107XG4gICAgdmFyIGlkeCA9IG91dHB1dC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvLyBGbGF0dGVuIGN1cnJlbnQgbGV2ZWwgb2YgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdC5cbiAgICAgICAgaWYgKHNoYWxsb3cpIHtcbiAgICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgICB3aGlsZSAoaiA8IGxlbikgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0LCBvdXRwdXQpO1xuICAgICAgICAgIGlkeCA9IG91dHB1dC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oYXJyYXksIG90aGVyQXJyYXlzKSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgb3RoZXJBcnJheXMpO1xuICB9KTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIFRoZSBmYXN0ZXIgYWxnb3JpdGhtIHdpbGwgbm90IHdvcmsgd2l0aCBhbiBpdGVyYXRlZSBpZiB0aGUgaXRlcmF0ZWVcbiAgLy8gaXMgbm90IGEgb25lLXRvLW9uZSBmdW5jdGlvbiwgc28gcHJvdmlkaW5nIGFuIGl0ZXJhdGVlIHdpbGwgZGlzYWJsZVxuICAvLyB0aGUgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKCFfLmlzQm9vbGVhbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRlZTtcbiAgICAgIGl0ZXJhdGVlID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXRlcmF0ZWUgIT0gbnVsbCkgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV0sXG4gICAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSA/IGl0ZXJhdGVlKHZhbHVlLCBpLCBhcnJheSkgOiB2YWx1ZTtcbiAgICAgIGlmIChpc1NvcnRlZCAmJiAhaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFycmF5cykge1xuICAgIHJldHVybiBfLnVuaXEoZmxhdHRlbihhcnJheXMsIHRydWUsIHRydWUpKTtcbiAgfSk7XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICB2YXIgajtcbiAgICAgIGZvciAoaiA9IDE7IGogPCBhcmdzTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKGFyZ3VtZW50c1tqXSwgaXRlbSkpIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGogPT09IGFyZ3NMZW5ndGgpIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihhcnJheSwgcmVzdCkge1xuICAgIHJlc3QgPSBmbGF0dGVuKHJlc3QsIHRydWUsIHRydWUpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXMuXG4gIF8udW56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheSAmJiBfLm1heChhcnJheSwgZ2V0TGVuZ3RoKS5sZW5ndGggfHwgMDtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBfLnBsdWNrKGFycmF5LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSByZXN0QXJndW1lbnRzKF8udW56aXApO1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy4gUGFzc2luZyBieSBwYWlycyBpcyB0aGUgcmV2ZXJzZSBvZiBfLnBhaXJzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGxpc3QpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBmaW5kSW5kZXggYW5kIGZpbmRMYXN0SW5kZXggZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIgPSBmdW5jdGlvbihkaXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyYXksIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgICAgdmFyIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0LlxuICBfLmZpbmRJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKDEpO1xuICBfLmZpbmRMYXN0SW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigtMSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcbiAgICAgIGlmIChpdGVyYXRlZShhcnJheVttaWRdKSA8IHZhbHVlKSBsb3cgPSBtaWQgKyAxOyBlbHNlIGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgaW5kZXhPZiBhbmQgbGFzdEluZGV4T2YgZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlSW5kZXhGaW5kZXIgPSBmdW5jdGlvbihkaXIsIHByZWRpY2F0ZUZpbmQsIHNvcnRlZEluZGV4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpZHgpIHtcbiAgICAgIHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIGlmICh0eXBlb2YgaWR4ID09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZW5ndGggPSBpZHggPj0gMCA/IE1hdGgubWluKGlkeCArIDEsIGxlbmd0aCkgOiBpZHggKyBsZW5ndGggKyAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNvcnRlZEluZGV4ICYmIGlkeCAmJiBsZW5ndGgpIHtcbiAgICAgICAgaWR4ID0gc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaWR4XSA9PT0gaXRlbSA/IGlkeCA6IC0xO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW0gIT09IGl0ZW0pIHtcbiAgICAgICAgaWR4ID0gcHJlZGljYXRlRmluZChzbGljZS5jYWxsKGFycmF5LCBpLCBsZW5ndGgpLCBfLmlzTmFOKTtcbiAgICAgICAgcmV0dXJuIGlkeCA+PSAwID8gaWR4ICsgaSA6IC0xO1xuICAgICAgfVxuICAgICAgZm9yIChpZHggPSBkaXIgPiAwID8gaSA6IGxlbmd0aCAtIDE7IGlkeCA+PSAwICYmIGlkeCA8IGxlbmd0aDsgaWR4ICs9IGRpcikge1xuICAgICAgICBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpbiBhbiBhcnJheSxcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKDEsIF8uZmluZEluZGV4LCBfLnNvcnRlZEluZGV4KTtcbiAgXy5sYXN0SW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKC0xLCBfLmZpbmRMYXN0SW5kZXgpO1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKHN0b3AgPT0gbnVsbCkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIGlmICghc3RlcCkge1xuICAgICAgc3RlcCA9IHN0b3AgPCBzdGFydCA/IC0xIDogMTtcbiAgICB9XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIENodW5rIGEgc2luZ2xlIGFycmF5IGludG8gbXVsdGlwbGUgYXJyYXlzLCBlYWNoIGNvbnRhaW5pbmcgYGNvdW50YCBvciBmZXdlclxuICAvLyBpdGVtcy5cbiAgXy5jaHVuayA9IGZ1bmN0aW9uKGFycmF5LCBjb3VudCkge1xuICAgIGlmIChjb3VudCA9PSBudWxsIHx8IGNvdW50IDwgMSkgcmV0dXJuIFtdO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgICAgcmVzdWx0LnB1c2goc2xpY2UuY2FsbChhcnJheSwgaSwgaSArPSBjb3VudCkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIHRvIGV4ZWN1dGUgYSBmdW5jdGlvbiBhcyBhIGNvbnN0cnVjdG9yXG4gIC8vIG9yIGEgbm9ybWFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50cy5cbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IHJlc3RBcmd1bWVudHMoZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJncykge1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICB2YXIgYm91bmQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGNhbGxBcmdzKSB7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCBjb250ZXh0LCB0aGlzLCBhcmdzLmNvbmNhdChjYWxsQXJncykpO1xuICAgIH0pO1xuICAgIHJldHVybiBib3VuZDtcbiAgfSk7XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIgYnkgZGVmYXVsdCwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZVxuICAvLyBwcmUtZmlsbGVkLiBTZXQgYF8ucGFydGlhbC5wbGFjZWhvbGRlcmAgZm9yIGEgY3VzdG9tIHBsYWNlaG9sZGVyIGFyZ3VtZW50LlxuICBfLnBhcnRpYWwgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGZ1bmMsIGJvdW5kQXJncykge1xuICAgIHZhciBwbGFjZWhvbGRlciA9IF8ucGFydGlhbC5wbGFjZWhvbGRlcjtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGJvdW5kQXJncy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IEFycmF5KGxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3NbaV0gPSBib3VuZEFyZ3NbaV0gPT09IHBsYWNlaG9sZGVyID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfSk7XG5cbiAgXy5wYXJ0aWFsLnBsYWNlaG9sZGVyID0gXztcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICBrZXlzID0gZmxhdHRlbihrZXlzLCBmYWxzZSwgZmFsc2UpO1xuICAgIHZhciBpbmRleCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChpbmRleCA8IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpbmRleF07XG4gICAgICBvYmpba2V5XSA9IF8uYmluZChvYmpba2V5XSwgb2JqKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vaXplID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgY2FjaGUgPSBtZW1vaXplLmNhY2hlO1xuICAgICAgdmFyIGFkZHJlc3MgPSAnJyArIChoYXNoZXIgPyBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleSk7XG4gICAgICBpZiAoIWhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihmdW5jLCB3YWl0LCBhcmdzKSB7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfSk7XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciB0aW1lb3V0LCBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuXG4gICAgdmFyIHRocm90dGxlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcblxuICAgIHRocm90dGxlZC5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgIHByZXZpb3VzID0gMDtcbiAgICAgIHRpbWVvdXQgPSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcblxuICAgIHJldHVybiB0aHJvdHRsZWQ7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKGNvbnRleHQsIGFyZ3MpIHtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgaWYgKGFyZ3MpIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfTtcblxuICAgIHZhciBkZWJvdW5jZWQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIGlmICh0aW1lb3V0KSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICBpZiAoaW1tZWRpYXRlKSB7XG4gICAgICAgIHZhciBjYWxsTm93ID0gIXRpbWVvdXQ7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgICAgaWYgKGNhbGxOb3cpIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gXy5kZWxheShsYXRlciwgd2FpdCwgdGhpcywgYXJncyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSk7XG5cbiAgICBkZWJvdW5jZWQuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGRlYm91bmNlZDtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgbmVnYXRlZCB2ZXJzaW9uIG9mIHRoZSBwYXNzZWQtaW4gcHJlZGljYXRlLlxuICBfLm5lZ2F0ZSA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgc3RhcnQgPSBhcmdzLmxlbmd0aCAtIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSBzdGFydDtcbiAgICAgIHZhciByZXN1bHQgPSBhcmdzW3N0YXJ0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgd2hpbGUgKGktLSkgcmVzdWx0ID0gYXJnc1tpXS5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIG9uIGFuZCBhZnRlciB0aGUgTnRoIGNhbGwuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIHVwIHRvIChidXQgbm90IGluY2x1ZGluZykgdGhlIE50aCBjYWxsLlxuICBfLmJlZm9yZSA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBpZiAodGltZXMgPD0gMSkgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIF8ucmVzdEFyZ3VtZW50cyA9IHJlc3RBcmd1bWVudHM7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICB2YXIgY29sbGVjdE5vbkVudW1Qcm9wcyA9IGZ1bmN0aW9uKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gXy5pc0Z1bmN0aW9uKGNvbnN0cnVjdG9yKSAmJiBjb25zdHJ1Y3Rvci5wcm90b3R5cGUgfHwgT2JqUHJvdG87XG5cbiAgICAvLyBDb25zdHJ1Y3RvciBpcyBhIHNwZWNpYWwgY2FzZS5cbiAgICB2YXIgcHJvcCA9ICdjb25zdHJ1Y3Rvcic7XG4gICAgaWYgKGhhcyhvYmosIHByb3ApICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSBrZXlzLnB1c2gocHJvcCk7XG5cbiAgICB3aGlsZSAobm9uRW51bUlkeC0tKSB7XG4gICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25vbkVudW1JZHhdO1xuICAgICAgaWYgKHByb3AgaW4gb2JqICYmIG9ialtwcm9wXSAhPT0gcHJvdG9bcHJvcF0gJiYgIV8uY29udGFpbnMoa2V5cywgcHJvcCkpIHtcbiAgICAgICAga2V5cy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2AuXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgYWxsIHRoZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gIF8uYWxsS2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgICAvLyBBaGVtLCBJRSA8IDkuXG4gICAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudCBvZiB0aGUgb2JqZWN0LlxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdC5cbiAgXy5tYXBPYmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSB7fTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgcmVzdWx0c1tjdXJyZW50S2V5XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIC8vIFRoZSBvcHBvc2l0ZSBvZiBfLm9iamVjdC5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2AuXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYXNzaWduZXIgZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlQXNzaWduZXIgPSBmdW5jdGlvbihrZXlzRnVuYywgZGVmYXVsdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmIChkZWZhdWx0cykgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIWRlZmF1bHRzIHx8IG9ialtrZXldID09PSB2b2lkIDApIG9ialtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICAvLyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbilcbiAgXy5leHRlbmRPd24gPSBfLmFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKF8ua2V5cyk7XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3Qga2V5IG9uIGFuIG9iamVjdCB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0LlxuICBfLmZpbmRLZXkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKSwga2V5O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpba2V5XSwga2V5LCBvYmopKSByZXR1cm4ga2V5O1xuICAgIH1cbiAgfTtcblxuICAvLyBJbnRlcm5hbCBwaWNrIGhlbHBlciBmdW5jdGlvbiB0byBkZXRlcm1pbmUgaWYgYG9iamAgaGFzIGtleSBga2V5YC5cbiAgdmFyIGtleUluT2JqID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7XG4gICAgcmV0dXJuIGtleSBpbiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gcmVzdEFyZ3VtZW50cyhmdW5jdGlvbihvYmosIGtleXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIGl0ZXJhdGVlID0ga2V5c1swXTtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGlmIChrZXlzLmxlbmd0aCA+IDEpIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwga2V5c1sxXSk7XG4gICAgICBrZXlzID0gXy5hbGxLZXlzKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0ga2V5SW5PYmo7XG4gICAgICBrZXlzID0gZmxhdHRlbihrZXlzLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH0pO1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSByZXN0QXJndW1lbnRzKGZ1bmN0aW9uKG9iaiwga2V5cykge1xuICAgIHZhciBpdGVyYXRlZSA9IGtleXNbMF0sIGNvbnRleHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgICAgaWYgKGtleXMubGVuZ3RoID4gMSkgY29udGV4dCA9IGtleXNbMV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBfLm1hcChmbGF0dGVuKGtleXMsIGZhbHNlLCBmYWxzZSksIFN0cmluZyk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKGtleXMsIGtleSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gXy5waWNrKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpO1xuICB9KTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEsIGRlZXBFcTtcbiAgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIGBudWxsYCBvciBgdW5kZWZpbmVkYCBvbmx5IGVxdWFsIHRvIGl0c2VsZiAoc3RyaWN0IGNvbXBhcmlzb24pLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gZmFsc2U7XG4gICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICBpZiAoYSAhPT0gYSkgcmV0dXJuIGIgIT09IGI7XG4gICAgLy8gRXhoYXVzdCBwcmltaXRpdmUgY2hlY2tzXG4gICAgdmFyIHR5cGUgPSB0eXBlb2YgYTtcbiAgICBpZiAodHlwZSAhPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiBkZWVwRXEoYSwgYiwgYVN0YWNrLCBiU3RhY2spO1xuICB9O1xuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIGRlZXBFcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTi5cbiAgICAgICAgaWYgKCthICE9PSArYSkgcmV0dXJuICtiICE9PSArYjtcbiAgICAgICAgLy8gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvciBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuICthID09PSAwID8gMSAvICthID09PSAxIC8gYiA6ICthID09PSArYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IFN5bWJvbF0nOlxuICAgICAgICByZXR1cm4gU3ltYm9sUHJvdG8udmFsdWVPZi5jYWxsKGEpID09PSBTeW1ib2xQcm90by52YWx1ZU9mLmNhbGwoYik7XG4gICAgfVxuXG4gICAgdmFyIGFyZUFycmF5cyA9IGNsYXNzTmFtZSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICBpZiAoIWFyZUFycmF5cykge1xuICAgICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3RgcyBvciBgQXJyYXlgc1xuICAgICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cblxuICAgIC8vIEluaXRpYWxpemluZyBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICAvLyBJdCdzIGRvbmUgaGVyZSBzaW5jZSB3ZSBvbmx5IG5lZWQgdGhlbSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzIGNvbXBhcmlzb24uXG4gICAgYVN0YWNrID0gYVN0YWNrIHx8IFtdO1xuICAgIGJTdGFjayA9IGJTdGFjayB8fCBbXTtcbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT09IGI7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGFyZUFycmF5cykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmICghZXEoYVtsZW5ndGhdLCBiW2xlbmd0aF0sIGFTdGFjaywgYlN0YWNrKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKGEpLCBrZXk7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cbiAgICAgIGlmIChfLmtleXMoYikubGVuZ3RoICE9PSBsZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICAgICAga2V5ID0ga2V5c1tsZW5ndGhdO1xuICAgICAgICBpZiAoIShoYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopICYmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikgfHwgXy5pc0FyZ3VtZW50cyhvYmopKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgcmV0dXJuIF8ua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNFcnJvciwgaXNNYXAsIGlzV2Vha01hcCwgaXNTZXQsIGlzV2Vha1NldC5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnLCAnRXJyb3InLCAnU3ltYm9sJywgJ01hcCcsICdXZWFrTWFwJywgJ1NldCcsICdXZWFrU2V0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBoYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgc29tZSB0eXBlb2YgYnVncyBpbiBvbGQgdjgsXG4gIC8vIElFIDExICgjMTYyMSksIFNhZmFyaSA4ICgjMTkyOSksIGFuZCBQaGFudG9tSlMgKCMyMjM2KS5cbiAgdmFyIG5vZGVsaXN0ID0gcm9vdC5kb2N1bWVudCAmJiByb290LmRvY3VtZW50LmNoaWxkTm9kZXM7XG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0JyAmJiB0eXBlb2Ygbm9kZWxpc3QgIT0gJ2Z1bmN0aW9uJykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICFfLmlzU3ltYm9sKG9iaikgJiYgaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/XG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIGlzTmFOKG9iaik7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIHBhdGgpIHtcbiAgICBpZiAoIV8uaXNBcnJheShwYXRoKSkge1xuICAgICAgcmV0dXJuIGhhcyhvYmosIHBhdGgpO1xuICAgIH1cbiAgICB2YXIgbGVuZ3RoID0gcGF0aC5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IHBhdGhbaV07XG4gICAgICBpZiAob2JqID09IG51bGwgfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIG9iaiA9IG9ialtrZXldO1xuICAgIH1cbiAgICByZXR1cm4gISFsZW5ndGg7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvLyBQcmVkaWNhdGUtZ2VuZXJhdGluZyBmdW5jdGlvbnMuIE9mdGVuIHVzZWZ1bCBvdXRzaWRlIG9mIFVuZGVyc2NvcmUuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCwgd2hlbiBwYXNzZWQgYW4gb2JqZWN0LCB3aWxsIHRyYXZlcnNlIHRoYXQgb2JqZWN04oCZc1xuICAvLyBwcm9wZXJ0aWVzIGRvd24gdGhlIGdpdmVuIGBwYXRoYCwgc3BlY2lmaWVkIGFzIGFuIGFycmF5IG9mIGtleXMgb3IgaW5kZXhlcy5cbiAgXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICBpZiAoIV8uaXNBcnJheShwYXRoKSkge1xuICAgICAgcmV0dXJuIHNoYWxsb3dQcm9wZXJ0eShwYXRoKTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIGRlZXBHZXQob2JqLCBwYXRoKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlcyBhIGZ1bmN0aW9uIGZvciBhIGdpdmVuIG9iamVjdCB0aGF0IHJldHVybnMgYSBnaXZlbiBwcm9wZXJ0eS5cbiAgXy5wcm9wZXJ0eU9mID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKXt9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24ocGF0aCkge1xuICAgICAgcmV0dXJuICFfLmlzQXJyYXkocGF0aCkgPyBvYmpbcGF0aF0gOiBkZWVwR2V0KG9iaiwgcGF0aCk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2ZcbiAgLy8gYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlciA9IF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgYXR0cnMgPSBfLmV4dGVuZE93bih7fSwgYXR0cnMpO1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBhdHRycyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0ZWUoaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWQuXG4gICAgdmFyIHNvdXJjZSA9ICcoPzonICsgXy5rZXlzKG1hcCkuam9pbignfCcpICsgJyknO1xuICAgIHZhciB0ZXN0UmVnZXhwID0gUmVnRXhwKHNvdXJjZSk7XG4gICAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZyA9PSBudWxsID8gJycgOiAnJyArIHN0cmluZztcbiAgICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIF8uZXNjYXBlID0gY3JlYXRlRXNjYXBlcihlc2NhcGVNYXApO1xuICBfLnVuZXNjYXBlID0gY3JlYXRlRXNjYXBlcih1bmVzY2FwZU1hcCk7XG5cbiAgLy8gVHJhdmVyc2VzIHRoZSBjaGlsZHJlbiBvZiBgb2JqYCBhbG9uZyBgcGF0aGAuIElmIGEgY2hpbGQgaXMgYSBmdW5jdGlvbiwgaXRcbiAgLy8gaXMgaW52b2tlZCB3aXRoIGl0cyBwYXJlbnQgYXMgY29udGV4dC4gUmV0dXJucyB0aGUgdmFsdWUgb2YgdGhlIGZpbmFsXG4gIC8vIGNoaWxkLCBvciBgZmFsbGJhY2tgIGlmIGFueSBjaGlsZCBpcyB1bmRlZmluZWQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqLCBwYXRoLCBmYWxsYmFjaykge1xuICAgIGlmICghXy5pc0FycmF5KHBhdGgpKSBwYXRoID0gW3BhdGhdO1xuICAgIHZhciBsZW5ndGggPSBwYXRoLmxlbmd0aDtcbiAgICBpZiAoIWxlbmd0aCkge1xuICAgICAgcmV0dXJuIF8uaXNGdW5jdGlvbihmYWxsYmFjaykgPyBmYWxsYmFjay5jYWxsKG9iaikgOiBmYWxsYmFjaztcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHByb3AgPSBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtwYXRoW2ldXTtcbiAgICAgIGlmIChwcm9wID09PSB2b2lkIDApIHtcbiAgICAgICAgcHJvcCA9IGZhbGxiYWNrO1xuICAgICAgICBpID0gbGVuZ3RoOyAvLyBFbnN1cmUgd2UgZG9uJ3QgY29udGludWUgaXRlcmF0aW5nLlxuICAgICAgfVxuICAgICAgb2JqID0gXy5pc0Z1bmN0aW9uKHByb3ApID8gcHJvcC5jYWxsKG9iaikgOiBwcm9wO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGU6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGU6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZTogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogXCInXCIsXG4gICAgJ1xcXFwnOiAnXFxcXCcsXG4gICAgJ1xccic6ICdyJyxcbiAgICAnXFxuJzogJ24nLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlUmVnRXhwID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlUmVnRXhwLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZzZXQuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdmFyIHJlbmRlcjtcbiAgICB0cnkge1xuICAgICAgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciBjaGFpblJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBjaGFpblJlc3VsdCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgcmV0dXJuIF87XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiBjaGFpblJlc3VsdCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaGFpblJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gU3RyaW5nKHRoaXMuX3dyYXBwZWQpO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59KCkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0aWYgKCFtb2R1bGUud2VicGFja1BvbHlmaWxsKSB7XG5cdFx0bW9kdWxlLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKCkge307XG5cdFx0bW9kdWxlLnBhdGhzID0gW107XG5cdFx0Ly8gbW9kdWxlLnBhcmVudCA9IHVuZGVmaW5lZCBieSBkZWZhdWx0XG5cdFx0aWYgKCFtb2R1bGUuY2hpbGRyZW4pIG1vZHVsZS5jaGlsZHJlbiA9IFtdO1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUsIFwibG9hZGVkXCIsIHtcblx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRnZXQ6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gbW9kdWxlLmw7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG1vZHVsZSwgXCJpZFwiLCB7XG5cdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuXHRcdFx0Z2V0OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIG1vZHVsZS5pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG1vZHVsZS53ZWJwYWNrUG9seWZpbGwgPSAxO1xuXHR9XG5cdHJldHVybiBtb2R1bGU7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCB0aW1lc3RhbXBfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi90aW1lc3RhbXBcIikpO1xuY2xhc3MgQ2FwdGlvbnNQYXJzZXIge1xuICAgIGNvbnN0cnVjdG9yKCkgeyB9XG4gICAgLyoqXG4gICAgICogRGVjb21wb3NlIHhtbCB0ZXh0IGxpbmUgYnkgbGluZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbGluZVxuICAgICAqIEByZXR1cm5zIHtBbGluZX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgZGVjb2RlQWxpbmUoYWxpbmUpIHtcbiAgICAgICAgY29uc3QgdGltZXN0YW1wID0gdGhpcy5wdWxsVGltZShhbGluZSk7XG4gICAgICAgIGNvbnN0IGh0bWxUZXh0ID0gYWxpbmVcbiAgICAgICAgICAgIC5yZXBsYWNlKC88dGV4dC4rPi8sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZhbXA7L2dpLCAnJicpXG4gICAgICAgICAgICAucmVwbGFjZSgvPFxcLz9bXj5dKyg+fCQpL2csICcnKTtcbiAgICAgICAgY29uc3Qgc3RyaXB0YWdzID0gcmVxdWlyZSgnc3RyaXB0YWdzJyk7XG4gICAgICAgIGNvbnN0IGhlID0gcmVxdWlyZSgnaGUnKTtcbiAgICAgICAgY29uc3QgZGVjb2RlZFRleHQgPSBoZS5kZWNvZGUoaHRtbFRleHQpO1xuICAgICAgICBjb25zdCB0ZXh0ID0gc3RyaXB0YWdzKGRlY29kZWRUZXh0KTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHRpbWVzdGFtcDogdGltZXN0YW1wLFxuICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICB9O1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTcGxpdCBsaW5lcyBpbnRvIGJ5IGEgbGluZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBsaW5lc1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmdbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgZXhwbG9kZShsaW5lcykge1xuICAgICAgICByZXR1cm4gbGluZXMuc3BsaXQoJzwvdGV4dD4nKS5maWx0ZXIoKGxpbmUpID0+IGxpbmUgJiYgbGluZS50cmltKCkpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBUcmltIHhtbCB0YWcgaW4gZmlyc3QgbGluZVxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zY3JpcHRcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHJlbW92ZVhtbFRhZyh0cmFuc2NyaXB0KSB7XG4gICAgICAgIHJldHVybiB0cmFuc2NyaXB0LnJlcGxhY2UoJzw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cInV0Zi04XCIgPz48dHJhbnNjcmlwdD4nLCAnJykucmVwbGFjZSgnPC90cmFuc2NyaXB0PicsICcnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVsbCB0aW1lIGZyb20gdGV4dCBkYXRhLlxuICAgICAqIDx0ZXh0IHN0YXJ0PVwiMTAuMTU5XCIgZHVyPVwiMi41NjNcIj5cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYWxpbmVcbiAgICAgKiBAcmV0dXJucyB7VGltZXN0YW1wfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICBwdWxsVGltZShhbGluZSkge1xuICAgICAgICBjb25zdCBzdGFydFJlZ2V4ID0gL3N0YXJ0PVwiKFtcXGQuXSspXCIvO1xuICAgICAgICBjb25zdCBkdXJSZWdleCA9IC9kdXI9XCIoW1xcZC5dKylcIi87XG4gICAgICAgIGNvbnN0IFssIHN0YXJ0XSA9IHN0YXJ0UmVnZXguZXhlYyhhbGluZSk7XG4gICAgICAgIGNvbnN0IFssIGR1cl0gPSBkdXJSZWdleC5leGVjKGFsaW5lKTtcbiAgICAgICAgcmV0dXJuIG5ldyB0aW1lc3RhbXBfMS5kZWZhdWx0KE51bWJlcihzdGFydCksIE51bWJlcihkdXIpKTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDYXB0aW9uc1BhcnNlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY2xhc3MgQ2xpZW50WW91dHViZSB7XG4gICAgZ2V0VmlkZW9JbmZvKHZpZGVvSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UmVxdWVzdChgaHR0cHM6Ly95b3V0dWJlLmNvbS9nZXRfdmlkZW9faW5mbz92aWRlb19pZD0ke3ZpZGVvSWR9YCk7XG4gICAgfVxuICAgIGdldFN1YnRpdGxlKGxhbmd1YWdlVXJsKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFJlcXVlc3QobGFuZ3VhZ2VVcmwpO1xuICAgIH1cbiAgICBnZXRSZXF1ZXN0KHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgY29uc3QgcmVxdWVzdCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IodGhpcy5zdGF0dXNUZXh0KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub25lcnJvciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdYTUxIdHRwUmVxdWVzdCBFcnJvcjogJyArIHRoaXMuc3RhdHVzVGV4dCkpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlcXVlc3Qub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICAgIHJlcXVlc3Quc2VuZCgpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5leHBvcnRzLmRlZmF1bHQgPSBDbGllbnRZb3V0dWJlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjYXB0aW9uc1BhcnNlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NhcHRpb25zUGFyc2VyXCIpKTtcbmNsYXNzIENvbnZlcnRlciB7XG4gICAgY29uc3RydWN0b3IoeG1sUmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy54bWxSZXNwb25zZSA9IHhtbFJlc3BvbnNlO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRvIHNhdmUgaW4gQ1NWIGZvcm1hdFxuICAgICAqXG4gICAgICogQHJldHVybnMge0NzdkFsaW5lW119XG4gICAgICogQG1lbWJlcm9mIENvbnZlcnRlclxuICAgICAqL1xuICAgIHRvQ3N2KCkge1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgY2FwdGlvbnNQYXJzZXJfMS5kZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IHRyaW1UcmFuc2NyaXB0ID0gcGFyc2VyLmV4cGxvZGUocGFyc2VyLnJlbW92ZVhtbFRhZyh0aGlzLnhtbFJlc3BvbnNlKSk7XG4gICAgICAgIHJldHVybiB0cmltVHJhbnNjcmlwdC5tYXAoKGxpbmUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBzdGFydFRpbWU6IGFsaW5lLnRpbWVzdGFtcC5nZXRTdGFydFRpbWUoKSxcbiAgICAgICAgICAgICAgICBkdXJhdGlvblRpbWU6IGFsaW5lLnRpbWVzdGFtcC5nZXREdXJhdGlvblRpbWUoKSxcbiAgICAgICAgICAgICAgICB0ZXh0OiBhbGluZS50ZXh0XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ29udmVydCB0byBzYXZlIGluIFNydCBmb3JtYXRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtTcnRBbGluZVtdfVxuICAgICAqIEBtZW1iZXJvZiBDb252ZXJ0ZXJcbiAgICAgKi9cbiAgICB0b1NydCgpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IGNhcHRpb25zUGFyc2VyXzEuZGVmYXVsdCgpO1xuICAgICAgICBjb25zdCB0cmltVHJhbnNjcmlwdCA9IHBhcnNlci5leHBsb2RlKHBhcnNlci5yZW1vdmVYbWxUYWcodGhpcy54bWxSZXNwb25zZSkpO1xuICAgICAgICByZXR1cm4gdHJpbVRyYW5zY3JpcHQubWFwKChsaW5lLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbnVtZXJpY0NvdW50ZXIgPSBpbmRleCArIDEgKyAnXFxuJztcbiAgICAgICAgICAgIGNvbnN0IGFsaW5lID0gcGFyc2VyLmRlY29kZUFsaW5lKGxpbmUpO1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGFsaW5lLnRleHQucmVwbGFjZSgvXFxuLywgJyAnKSArICdcXG4nO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBpbmRleDogbnVtZXJpY0NvdW50ZXIsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBhbGluZS50aW1lc3RhbXAuZm9ybWF0U3J0KCksXG4gICAgICAgICAgICAgICAgdGV4dDogdGV4dFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENvbnZlcnQgdG8gc2F2ZSBpbiBWdHQgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7VnR0QWxpbmVbXX1cbiAgICAgKiBAbWVtYmVyb2YgQ29udmVydGVyXG4gICAgICovXG4gICAgdG9WdHQoKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyBjYXB0aW9uc1BhcnNlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgdHJpbVRyYW5zY3JpcHQgPSBwYXJzZXIuZXhwbG9kZShwYXJzZXIucmVtb3ZlWG1sVGFnKHRoaXMueG1sUmVzcG9uc2UpKTtcbiAgICAgICAgcmV0dXJuIHRyaW1UcmFuc2NyaXB0Lm1hcCgobGluZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgYWxpbmUgPSBwYXJzZXIuZGVjb2RlQWxpbmUobGluZSk7XG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gYWxpbmUudGV4dC5yZXBsYWNlKC9cXG4vLCAnICcpICsgJ1xcbic7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogYWxpbmUudGltZXN0YW1wLmZvcm1hdFZ0dCgpLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRleHRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IENvbnZlcnRlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgc3VidGl0bGVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9zdWJ0aXRsZVwiKSk7XG5jb25zdCBjbGllbnRZb3V0dWJlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY2xpZW50L2NsaWVudFlvdXR1YmVcIikpO1xuY29uc3Qgc2VuZERhdGEgPSB7XG4gICAgcmVhc29uOiAnY2hlY2snXG59O1xudmFyIHZpZGVvVGl0bGU7XG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0sIGZ1bmN0aW9uICh0YWJzKSB7XG4gICAgICAgIGNocm9tZS50YWJzLnNlbmRNZXNzYWdlKHRhYnNbMF0uaWQsIHNlbmREYXRhLCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlLmVycm9yKTtcbiAgICAgICAgICAgICAgICBkaXNwbGF5TWVzc2FnZSgnVGhpcyB2aWRlbyBoYXMgbm9uZSBjYXB0aW9uLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5jYXB0aW9ucykge1xuICAgICAgICAgICAgICAgIHZpZGVvVGl0bGUgPSByZXNwb25zZS50aXRsZTtcbiAgICAgICAgICAgICAgICBhZGRTZWxlY3RCb3goKTtcbiAgICAgICAgICAgICAgICByZXNwb25zZS5jYXB0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFNlbGVjdEJveE9wdGlvbih2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYWRkRG93bmxvYWRCdXR0b24oKTtcbiAgICAgICAgICAgICAgICBhZGRTZWxlY3RCb3hGb3JtYXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuZnVuY3Rpb24gYWRkU2VsZWN0Qm94Rm9ybWF0KCkge1xuICAgIGRvY3VtZW50XG4gICAgICAgIC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpXG4gICAgICAgIC5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBcIjxzZWxlY3QgY2xhc3M9J3VrLXNlbGVjdCcgc3R5bGU9J21hcmdpbi1ib3R0b206NXB4JyBpZD0nZm9ybWF0Jz48b3B0aW9uIHZhbHVlPSdjc3YnPi5jc3Y8L29wdGlvbj48b3B0aW9uIHZhbHVlPSd0ZXh0Jz4udHh0PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0ndnR0Jz4udnR0PC9vcHRpb24+PG9wdGlvbiB2YWx1ZT0nc3J0Jz4uc3J0PC9vcHRpb24+PC9zZWxlY3Q+XCIpO1xufVxuZnVuY3Rpb24gYWRkU2VsZWN0Qm94KCkge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW50JykuaW5zZXJ0QWRqYWNlbnRIVE1MKCdhZnRlcmJlZ2luJywgXCI8c2VsZWN0IGNsYXNzPSd1ay1zZWxlY3QnIGlkPSdsYW5ndWFnZSc+PC9zZWxlY3Q+XCIpO1xufVxuZnVuY3Rpb24gYWRkU2VsZWN0Qm94T3B0aW9uKHZhbHVlKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhbmd1YWdlJykuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmVlbmQnLCBgPG9wdGlvbiB2YWx1ZT0ke3ZhbHVlLmJhc2VVcmx9PiR7dmFsdWUubmFtZS5zaW1wbGVUZXh0fTwvb3B0aW9uPmApO1xufVxuZnVuY3Rpb24gYWRkRG93bmxvYWRCdXR0b24oKSB7XG4gICAgZG9jdW1lbnRcbiAgICAgICAgLmdldEVsZW1lbnRCeUlkKCdjb250ZW50JylcbiAgICAgICAgLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJlbmQnLCBcIjxkaXYgY2xhc3M9J3VrLW1hcmdpbic+PGJ1dHRvbiBpZD0nZG93bmxvYWQtYnV0dG9uJyBjbGFzcz0ndWstYnV0dG9uIHVrLWJ1dHRvbi1wcmltYXJ5JyBvbmNsaWNrPWRvd25sb2FkKCk+RG93bmxvYWQ8L2J1dHRvbj48L2Rpdj5cIik7XG4gICAgLy8gcmVnaXN0ZXIgZXZlbnRIYW5kbGVyIGZ1bmN0aW9uIGRvd25sb2FkKClcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZG93bmxvYWQtYnV0dG9uJykub25jbGljayA9ICgpID0+IGRvd25sb2FkKCk7XG59XG5mdW5jdGlvbiBkZWJ1ZyhyZXNwb25zZSkge1xuICAgIGNvbnN0IGRlYnVnID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RlYnVnJyk7XG4gICAgZGVidWcuaW5zZXJ0QWRqYWNlbnRIVE1MKCdiZWZvcmViZWdpbicsIHJlc3BvbnNlKTtcbn1cbmZ1bmN0aW9uIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbnQnKTtcbiAgICBjb250ZW50Lmluc2VydEFkamFjZW50SFRNTCgnYmVmb3JlYmVnaW4nLCBgPHAgY2xhc3M9J3VrLXRleHQtZGFuZ2VyJz4ke21lc3NhZ2V9PC9wPmApO1xufVxuZnVuY3Rpb24gZG93bmxvYWQoKSB7XG4gICAgY29uc3QgbGFuZ3VhZ2VfdXJsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xhbmd1YWdlJykudmFsdWU7XG4gICAgY29uc3QgZm9ybWF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Zvcm1hdCcpLnZhbHVlO1xuICAgIGNvbnN0IGNsaWVudCA9IG5ldyBjbGllbnRZb3V0dWJlXzEuZGVmYXVsdCgpO1xuICAgIGNsaWVudFxuICAgICAgICAuZ2V0U3VidGl0bGUobGFuZ3VhZ2VfdXJsKVxuICAgICAgICAudGhlbigoeG1sUmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKCF4bWxSZXNwb25zZSlcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUmVzcG9uc2UgZW1wdHkuJyk7XG4gICAgICAgIGNvbnN0IHN1YnRpdGxlID0gbmV3IHN1YnRpdGxlXzEuZGVmYXVsdCh4bWxSZXNwb25zZSk7XG4gICAgICAgIGlmIChmb3JtYXQgPT09ICdjc3YnKSB7XG4gICAgICAgICAgICBzdWJ0aXRsZS5nZXRDc3YodmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9ybWF0ID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHN1YnRpdGxlLmdldFRleHQodmlkZW9UaXRsZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZm9ybWF0ID09PSAndnR0Jykge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0VnR0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc3VidGl0bGUuZ2V0U3J0KHZpZGVvVGl0bGUpO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIGRlYnVnKGVycm9yKTtcbiAgICB9KTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgY29udmVydGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY29udmVydGVyXCIpKTtcbmNvbnN0IGpzb24yY3N2ID0gcmVxdWlyZSgnanNvbi0yLWNzdicpO1xuY29uc3Qgb3B0aW9ucyA9IHtcbiAgICBkZWxpbWl0ZXI6IHtcbiAgICAgICAgd3JhcDogJycsXG4gICAgICAgIGZpZWxkOiAnJyxcbiAgICAgICAgZW9sOiAnXFxuJ1xuICAgIH0sXG4gICAgcHJlcGVuZEhlYWRlcjogZmFsc2Vcbn07XG5jbGFzcyBTdWJ0aXRsZSB7XG4gICAgY29uc3RydWN0b3IoeG1sUmVzcG9uc2UpIHtcbiAgICAgICAgdGhpcy54bWxSZXNwb25zZSA9IHhtbFJlc3BvbnNlO1xuICAgIH1cbiAgICBnZXRWdHQoZmlsZW5hbWUpIHtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvVnR0KCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoWydXRUJWVFRcXG5cXG4nICsgY3N2XSwgeyB0eXBlOiAndGV4dC9wbGFpbicgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArICcudnR0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRTcnQoZmlsZW5hbWUpIHtcbiAgICAgICAganNvbjJjc3ZcbiAgICAgICAgICAgIC5qc29uMmNzdkFzeW5jKG5ldyBjb252ZXJ0ZXJfMS5kZWZhdWx0KHRoaXMueG1sUmVzcG9uc2UpLnRvU3J0KCksIG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbigoY3N2KSA9PiB7XG4gICAgICAgICAgICBjaHJvbWUuZG93bmxvYWRzLmRvd25sb2FkKHtcbiAgICAgICAgICAgICAgICB1cmw6IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2Nzdl0sIHsgdHlwZTogJ3RleHQvcGxhaW4nIH0pKSxcbiAgICAgICAgICAgICAgICBmaWxlbmFtZTogZmlsZW5hbWUgKyAnLnNydCdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZ2V0Q3N2KGZpbGVuYW1lKSB7XG4gICAgICAgIGpzb24yY3N2XG4gICAgICAgICAgICAuanNvbjJjc3ZBc3luYyhuZXcgY29udmVydGVyXzEuZGVmYXVsdCh0aGlzLnhtbFJlc3BvbnNlKS50b0NzdigpKVxuICAgICAgICAgICAgLnRoZW4oKGNzdikgPT4ge1xuICAgICAgICAgICAgY2hyb21lLmRvd25sb2Fkcy5kb3dubG9hZCh7XG4gICAgICAgICAgICAgICAgdXJsOiBVUkwuY3JlYXRlT2JqZWN0VVJMKG5ldyBCbG9iKFtjc3ZdLCB7IHR5cGU6ICd0ZXh0L2NzdicgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArICcuY3N2J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBnZXRUZXh0KGZpbGVuYW1lKSB7XG4gICAgICAgIGNvbnN0IGpzb24yY3N2ID0gcmVxdWlyZSgnanNvbi0yLWNzdicpO1xuICAgICAgICBqc29uMmNzdlxuICAgICAgICAgICAgLmpzb24yY3N2QXN5bmMobmV3IGNvbnZlcnRlcl8xLmRlZmF1bHQodGhpcy54bWxSZXNwb25zZSkudG9Dc3YoKSlcbiAgICAgICAgICAgIC50aGVuKChjc3YpID0+IHtcbiAgICAgICAgICAgIGNocm9tZS5kb3dubG9hZHMuZG93bmxvYWQoe1xuICAgICAgICAgICAgICAgIHVybDogVVJMLmNyZWF0ZU9iamVjdFVSTChuZXcgQmxvYihbY3N2XSwgeyB0eXBlOiAndGV4dC9wbGFuZScgfSkpLFxuICAgICAgICAgICAgICAgIGZpbGVuYW1lOiBmaWxlbmFtZSArICcudHh0J1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFN1YnRpdGxlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jbGFzcyBUaW1lc3RhbXAge1xuICAgIGNvbnN0cnVjdG9yKHN0YXJ0LCBkdXJhdGlvbikge1xuICAgICAgICB0aGlzLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICB9XG4gICAgZ2V0U3RhcnRUaW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb252ZXJ0VGltZSh0aGlzLnN0YXJ0KTtcbiAgICB9XG4gICAgZ2V0RHVyYXRpb25UaW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXJnZVRpbWUodGhpcy5zdGFydCwgdGhpcy5kdXJhdGlvbik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBTUlQgdGltZXN0YW1wIGZvcm1hdC5cbiAgICAgKiBleGFtcGxlOiAwMDowMDowMCwwMDAgLS0+IDAwOjAwOjAwLDAwMFxuICAgICAqL1xuICAgIGZvcm1hdFNydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhcnRUaW1lKCkucmVwbGFjZSgvWy5dLywgJywnKSArICcgLS0+ICcgKyB0aGlzLmdldER1cmF0aW9uVGltZSgpLnJlcGxhY2UoL1suXS8sICcsJykgKyAnXFxuJztcbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIFZUVCB0aW1lc3RhbXAgZm9ybWF0LlxuICAgICAqIGV4YW1wbGU6IDAwOjAwOjAwLjAwMCAtLT4gMDA6MDA6MDAuMDAwXG4gICAgICovXG4gICAgZm9ybWF0VnR0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGFydFRpbWUoKSArICcgLS0+ICcgKyB0aGlzLmdldER1cmF0aW9uVGltZSgpICsgJ1xcbic7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEFkZCBzdGFydCB0aW1lIGFuZCBkdXJhdGlvbiB0aW1lXG4gICAgICovXG4gICAgbWVyZ2VUaW1lKHN0YXJ0U2Vjb25kcywgZHVyYXRpb25TZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShzdGFydFNlY29uZHMgKiAxMDAwICsgZHVyYXRpb25TZWNvbmRzICogMTAwMCkudG9JU09TdHJpbmcoKS5zbGljZSgxMSwgLTEpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDb252ZXJ0IHRpbWUgZm9ybWF0IGZyb20gbW0uc3MgdG8gSEg6bW06c3NzLlxuICAgICAqIGV4YW1wbGU6IDEwLjE1OSA9PiAwMDowMDoxMC4xNTlcbiAgICAgKi9cbiAgICBjb252ZXJ0VGltZShzZWNvbmRzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShzZWNvbmRzICogMTAwMCkudG9JU09TdHJpbmcoKS5zbGljZSgxMSwgLTEpO1xuICAgIH1cbn1cbmV4cG9ydHMuZGVmYXVsdCA9IFRpbWVzdGFtcDtcbiJdLCJzb3VyY2VSb290IjoiIn0=