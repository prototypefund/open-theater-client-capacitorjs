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

function helloWorld(){
    console.log("hello world",Plugins);
    console.log("we are running in",Capacitor.getPlatform(), "environment");
    console.log("Screenreader is available:",Capacitor.isPluginAvailable("ScreenReader"));
}

async function getWifiSsid(){
    console.log("TODO: getting wifi ssid from hardcoded function inside openTheater.js");
    
    let ssid = await WifiWizard2.getConnectedSSID(); // Cordova Plugin
    let status = await Plugins.Network.getStatus();
    status.wifissid = ssid;

    return status
}

function getBattery(){
    let batterystate = Plugins.Device.getBatteryInfo();
    console.log("battery:", batterystate);
    return batterystate
}

function detectServer(){
    console.log("TODO: detecting from hardcoded function inside open-theater.js");
     
}

/**
 * 
 * @param {String} ssid
 * @param {String} wifipassword
 * iOS / Android only
 * connects to wifi network via ssid and wifipassword if possible
 * returns ssid if successful or null if unsucessful or in case that this feature is not supported
 */
async function connectToSSID(ssid,wifipassword){
    let newssid = null;
    if (Capacitor.getPlatform() === "ios") {
        newssid = await WifiWizard2.iOSConnectNetwork(ssid,wifipassword).catch((err)=>{}); // Cordova Plugin
    }
    else if (Capacitor.getPlatform() === "android") {
        newssid = await WifiWizard2.connect(ssid,wifipassword).catch((err)=>{}; // Cordova Plugin
        if (newssid === "NETWORK_CONNECTION_COMPLETED"){
            newssid = ssid;
        }
    }
    else {
        console.log("connectToSSID is not available on this platform");
    }
    return newssid
}


function setScreenBrightness(level)
{
    console.log("setScreenBrightness is not available atm");
}

export { helloWorld, getWifiSsid, getBattery, detectServer, setScreenBrightness, connectToSSID/*updateFiles*/};
 