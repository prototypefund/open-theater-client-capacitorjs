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

import { Plugins, FilesystemDirectory, FilesystemEncoding, Capacitor, Network } from '@capacitor/core';

const { Filesystem } = Plugins;


async function createDir(path){
    
    try {
        let ret = await Filesystem.mkdir({
        path: path,
        directory: FilesystemDirectory.Documents,
        recursive: false // like mkdir -p
        });
        return ret
    } catch(e) {
        console.error('Unable to make directory', e);
        return null
    }
    
}

async function readDir(path){
    try {
        let ret = await Filesystem.readdir({
          path: path,
          directory: FilesystemDirectory.Documents
        });
        return ret
      } catch(e) {
        console.error('Unable to read dir', e);
        return null
      }
}

async function fileWrite(filepath, content) {
    try {
      const result = await Filesystem.writeFile({
        path: filepath,
        data: content,
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      })
      console.log('Wrote file', result);
      return result
    } catch(e) {
      console.error('Unable to write file', e);
      return null
    }
}

async function readFile(filepath){
    let contents = await Filesystem.readFile({
        path: filepath,
        directory: FilesystemDirectory.Documents,
        encoding: FilesystemEncoding.UTF8
      });
    console.log(contents);
    return contents
}

async function deleteFile(path) {
    await Filesystem.deleteFile({
      path: path,
      directory: FilesystemDirectory.Documents
    });
    console.log("file delete was forwarded to system");
    return true
  }

  async function getFileStat(path) {
    try {
      let ret = await Filesystem.stat({
        path: path,
        directory: FilesystemDirectory.Documents
      });
      return ret
    } catch(e) {
      console.error('Unable to stat file', e);
      return null
    }
  }





function helloWorld(){
    console.log("]OPEN THEATER[ Client is starting");
    console.log("we are running in",Capacitor.getPlatform(), "environment");
    console.log("Screenreader is available:",Capacitor.isPluginAvailable("ScreenReader"));
}

async function getWifiSsid(){
    
    if(Capacitor.getPlatform() === "web")
    {
      console.log("scanSSIDs is not available on this platform. You better involve the user here.");
      return false
    }
    
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

/**
 * 
 * @param {Obj} config 
 * tries to connect to wifi with config.ssid if possible
 * then tries to connect to serveruri in whichever network is available
 * reports back
 */
async function detectServer(config={ssid:"opentheater",serveruri:"http://192.168.3.189:8080/"}){
  
  // TODO: this should be its own method/function, and not necessary be part of detectServer. 
  if (Capacitor.getPlatform() === "android"){
      
    let networksAvailable= await scanSSIDs();
    let wifinetwork = null;
    
    for (let network of networksAvailable){

      if (network.SSID && network.SSID.contains(config.ssid) ){

        console.log(`found wifi network with ssid ${config.ssid}. will attempt to connect`);
        wifinetwork = await connectToSSID(network.SSID,false); // false because opentheater networks should be open anyhow
        break;

      }

    }
    
    console.log(`connected to ${wifinetwork}`)
  }



  // actual serverConnection/search:

  let services = await fetch(config.serveruri).json(); // CONTINUE HERE
  console.log(services);

}

/**
 * 
 * @param {String} serviceUri 
 * checks serviceUri for its file list and compares with files on the device storage
 * updates the files in device storage to be in sync with files provided by serviceUri
 */
async function updateFiles(config) { // config obj: { urls:[] , updateObj: null}
    for (fileuri in config.uris){
        // download all files to device storage and report back
    }
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
        newssid = await WifiWizard2.connect(ssid,wifipassword).catch((err)=>{}); // Cordova Plugin
        if (newssid === "NETWORK_CONNECTION_COMPLETED"){
            newssid = ssid;
        }
    }
    else {
        console.log("connectToSSID is not available on this platform");
    }
    return newssid
}

async function scanSSIDs(){ // possible with WifiWizard2 but only for Android devices. iOS blocks this in general.
    if(Capacitor.getPlatform() !== "android")
    {
      console.log("scanSSIDs is not available on this platform. You better involve the user here.");
      return false
    }
    let networks = await WifiWizard2.scan();
    console.log(networks);
    
    return networks
}


function setScreenBrightness(level)
{
    return new Promise((resolve,reject)=>{

        console.log("setScreenBrightness is not available atm");
        cordova.plugins.brightness.setBrightness(level, 
            ()=>{
            resolve(true)
            },
            (err)=>{
                console.log("error setting screen brightness",err);
                
                reject(null)
            }
        );

    })   
}


export { 
  helloWorld, getWifiSsid, getBattery, detectServer, setScreenBrightness, connectToSSID, 
  scanSSIDs/*updateFiles*/, createDir, readDir, fileWrite, readFile, deleteFile, getFileStat
};
 