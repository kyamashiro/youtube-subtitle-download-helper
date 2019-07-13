import { Item } from './item';
var elem = document.getElementById('output');
var aBook = new Item('はじめてのTypeScript', 1980);
aBook.say(elem);
chrome.runtime.onInstalled.addListener((details) => {
    console.log('previousVersion', details.previousVersion);
  });
