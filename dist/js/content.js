!function(e){var t={};function o(r){if(t[r])return t[r].exports;var n=t[r]={i:r,l:!1,exports:{}};return e[r].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=t,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(r,n,function(t){return e[t]}.bind(null,n));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=5)}([function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{getVideoInfo(e){return this.getRequest("https://youtube.com/get_video_info?video_id="+e)}getSubtitle(e){return this.getRequest(e)}getRequest(e){return new Promise((function(t,o){const r=new XMLHttpRequest;r.onload=function(){200===this.status?t(this.response):o(new Error(this.statusText))},r.onerror=function(){o(new Error("XMLHttpRequest Error: "+this.statusText))},r.open("GET",e),r.send()}))}}},,,,,function(e,t,o){"use strict";var r=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(t,"__esModule",{value:!0});const n=r(o(6)),s=r(o(7)),i=r(o(0));chrome.runtime.onMessage.addListener((e,t,o)=>{try{const e=new n.default(document.URL).getParam("v");(new i.default).getVideoInfo(e).then(t=>{const r=new s.default(t);o({captions:r.getCaptionsData(),videoId:e,title:r.getVideoTitle(),error:null})}).catch(e=>{console.log(e),o({error:e})})}catch(e){console.log(e),o({error:e})}return!0})},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(e){this.url=e}getParam(e){e=e.replace(/[\[\]]/g,"\\$&");const t=new RegExp("[?&]"+e+"(=([^&#]*)|&|#|$)").exec(this.url);if(!t)throw new Error("Url query parameter does not contain videoid.");return t[2]?decodeURIComponent(t[2].replace(/\+/g," ")):""}}},function(e,t,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});t.default=class{constructor(e){this.videoInfoResponse=e}getCaptionsData(){if(!this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks)throw new Error("This video has not caption.");return this.decodeVideoInfoResponse().captions.playerCaptionsTracklistRenderer.captionTracks}getVideoTitle(){return this.decodeVideoInfoResponse().videoDetails.title.replace(/\+\|/g,"").replace(/[\+]/g," ").replace(/[\?\^\.<>":]/g,"")}decodeVideoInfoResponse(){const e=this.parseQuery(this.videoInfoResponse);return JSON.parse(e.player_response)}parseQuery(e){let t={};const o=("?"===e[0]?e.substr(1):e).split("&");for(let e=0;e<o.length;e++){const r=o[e].split("=");t[decodeURIComponent(r[0])]=decodeURIComponent(r[1]||"")}return t}}}]);