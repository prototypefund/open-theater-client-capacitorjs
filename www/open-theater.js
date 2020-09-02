/*
the adapter module to plug open-theater-client functions into different APIs depending on
its runtime environment (browser, capacitorjs, cordova, kiosk apps, differnt hardware API). 

here we plug in different hardware and/or other runtime dependend APIs into our standard
Open Theater Client methods.

TODO: create open-theater-client.js with all needed client functions but API agnostic to be either
overwritten in here manually or to be connected with the runtime APIs of our choice (for now:
    everything will be hardcoded inside of here)
*/

//import {updateFiles, setScreenBrightness} from './fullyApi.js'; // example of importing another API

import { Plugins, FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

console.log("hello world",Plugins);

function getWifiSsid(){
    console.log("TODO: getting wifi ssid from hardcoded function inside openTheater.js"); 
}

function detectServer(){
    console.log("TODO: detecting from hardcoded function inside openTheater.js");
}

export {/*updateFiles, setScreenBrightness, */getWifiSsid, detectServer };
 