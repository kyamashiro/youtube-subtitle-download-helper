!function(e){var t={};function r(o){if(t[o])return t[o].exports;var n=t[o]={i:o,l:!1,exports:{}};return e[o].call(n.exports,n,n.exports,r),n.l=!0,n.exports}r.m=e,r.c=t,r.d=function(e,t,o){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(r.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)r.d(o,n,function(t){return e[t]}.bind(null,n));return o},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=7)}([,function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{getVideoInfo(e){return this.getRequest(`https://youtube.com/get_video_info?video_id=${e}`)}getSubtitle(e){return this.getRequest(e)}getRequest(e){return new Promise(function(t,r){const o=new XMLHttpRequest;o.onload=function(){200===this.status?t(this.response):r(new Error(this.statusText))},o.onerror=function(){r(new Error("XMLHttpRequest Error: "+this.statusText))},o.open("GET",e),o.send()})}}},,,,,,function(e,t,r){"use strict";var o=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=o(r(8)),s=o(r(9)),i=o(r(1));chrome.runtime.onMessage.addListener(function(e,t,r){try{const e=new n.default(document.URL).getParam("v");(new i.default).getVideoInfo(e).then(t=>{const o=new s.default(t);r({captions:o.getCaptionsData(),videoId:e,title:o.getVideoTitle(),error:null})}).catch(e=>{console.log(e),r({error:e})})}catch(e){console.log(e),r({error:e})}return!0})},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(e){this.url=e}getParam(e){e=e.replace(/[\[\]]/g,"\\$&");const t=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(this.url);if(!t)throw new Error("Url query parameter does not contain videoid.");return t[2]?decodeURIComponent(t[2].replace(/\+/g," ")):""}}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(e){this.videoInfoResponse=e}getCaptionsData(){if(!this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks)throw new Error("This video has not caption.");return this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks}getVideoTitle(){return this.decodeVideoInfoResponse().videoDetails.title.replace(/\+\|/g,"").replace(/[\+]/g," ").replace(/[\?\^\.<>":]/g,"")}decodeVideoInfoResponse(){const e=this.parseQuery(this.videoInfoResponse);return JSON.parse(e.player_response)}parseQuery(e){let t={};for(var r=("?"===e[0]?e.substr(1):e).split("&"),o=0;o<r.length;o++){var n=r[o].split("=");t[decodeURIComponent(n[0])]=decodeURIComponent(n[1]||"")}return t}}}]);