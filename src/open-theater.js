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
import path from 'path-browserify';

const { Filesystem } = Plugins;

const MEDIA_BASE_PATH = "/media";

const PLATFORM_IS_WEB =  (getPlatform() === "web");
const PLATFORM_IS_ANDROID = (getPlatform() === "android");
const PLATFORM_IS_IOS = (getPlatform() === "ios");

/*
const replaceURLStrings = [{
  "{{OPENTHEATER_APP_ID}}": openTheater.deviceId(),
  "{{OPENTHEATER_API_VERSION}}": openTheater.version
}]
*/

function modifyURLString(input){
  
  return input;
  
  // TODO: Kristian
    /*
    let triggerURL = new URL(services.triggerUri); 
          
    if(triggerURL.protocol == "wss:") {} // see getServiceProtocol() below, maybe it can shorten this part?
    if(triggerURL.protocol == "ws:") {}

    if(triggerURL.protocol == "mqtt:") {}

    if(triggerURL.protocol == "http:") {}
    if(triggerURL.protocol == "https:") {}

    triggerURL.searchParams.get('token');
    triggerURL.search == "?token={{OPENTHEATER_APP_ID}}"

    triggerURL.toString()
    */

  
}


function getPlatform(){
  return Capacitor.getPlatform();
}

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
    
    if(PLATFORM_IS_WEB)
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
async function detectServer(config /*= [ {ssid: SEARCH_SSID, pw: SEARCH_PW, serveruri: SERVER_URI} ]*/){
  
  for (let endpoint of config){

    if (endpoint.ssid){ // if ssid given, we try to connect to a wifi

      let wifinetwork = null;

      if (!endpoint.pw){endpoint.pw = false} 

      wifinetwork = await connectToSSID(endpoint.ssid,endpoint.pw);
      
      if (!wifinetwork){
        console.log(`
        could not connect to wifi network with ssid ${endpoint.ssid}. 
        will try next repo server in config...`);        
        continue;
      }
    
    }

  // actual serverConnection/search:
    console.log("fetching services from", endpoint.serveruri)
    let services = await fetch(endpoint.serveruri).then(async (res)=>{
      console.log("got response from",endpoint.serveruri)
      return await res.json()}
    );
    console.log(services);

    if (!services){
      console.log(`
        could not connect to server ${endpoint.serceruri}. 
        will try next repo server in config...`);        
        continue;
    }

    return services
  }

  console.log(`could not connect to any server listed in the repo list config`);
  
  return null

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
    if (PLATFORM_IS_IOS) {
        console.log("platform is IOS",PLATFORM_IS_IOS);
        
        newssid = await WifiWizard2.iOSConnectNetwork(ssid,wifipassword)
        .catch((err)=>{console.log("error connceting to ssid",ssid,err)}); // Cordova Plugin
    }
    else if (PLATFORM_IS_ANDROID) {
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
    if (!PLATFORM_IS_ANDROID)
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

function getServiceProtocol(service){
  if (!service || typeof service !== "string"){
    throw "getServiceProtocol requires parameter service (string)";
  }

  if (service.startsWith("ws://") || service.startsWith("wss://")){
    return "websockets"
  }
  if (service.startsWith("http://") || service.startsWith("https://")){
    return "http"
  }
  if (service.startsWith("mqtt://")){
    return "mqtt"
  }
}

// CONTINUE HERE
async function getProvisioningFilesFromService(service){
  if(!service.provisioningUri || typeof service.provisioningUri !== "string"){
    throw "getProvisioningFilesFromService requires service obj to contain provisioningUri (string)"
  }

  const listOfAssetFilesResponse = await fetch(service.provisioningUri);
  if (!listOfAssetFilesResponse.ok){
    throw "getProvisioningFilesFromService encountered an error communicating with provisioning server"
  }
  const listOfAssetFiles = await listOfAssetFilesResponse.json()
  .catch((err)=>{ throw {message:"getProvisioningFilesFromService got falsy response from provisioning server",error:err}});
  console.log("listOfAssetFiles:",listOfAssetFiles);
  
  return listOfAssetFiles
}


// TODO: return fileList from Cache in the same structure as we expect it from the provising servers

async function getFileListFromCache(projectPath){
    const projectsAssetDir = path.join(MEDIA_BASE_PATH,projectPath.join("/"));
    
    const fileList = await readDir(projectsAssetDir)
    .catch((err)=>{throw "getFileListFromCache could not find project Dir"})

    const fileListFormatted = await Promise.all(
      fileList.files.map(async (filename) =>{
        const filestats = await getFileStat(path.join(projectsAssetDir,filename));
        const lastmodified = filestats.mtime;
        const filesize = filestats.size;

        return {filepath:filename, filesize: filesize, lastmodified: lastmodified}
      })
    )

    const output = {
      files: fileListFormatted
    }

    return output
}

/**
 * initializes Open Theater MEDIA Base Directory on Client 
 * either in apps filesystem or if webapp inside of the browsers storage
 * 
 * checks if MEDIA_BASE_PATH exists as directory, and creates it if not
 */
async function initMediaRootDir(){
  const dir = await readDir(MEDIA_BASE_PATH)
  if (dir !== null)
  {
    console.log("Open Theater media root directory was initialized: directory already exists"); 
    return true
  }
  else
  {
    const newdir = await createDir(MEDIA_BASE_PATH);
    if (!newdir){throw `initMediaRootDir could not create MEDIA_BASE_PATH ${MEDIA_BASE_PATH}`}
    console.log("Open Theater media root directory was initialized: directory was created"); 
    return true
  }
}

export { 
  helloWorld,
  getPlatform, 
  getWifiSsid, 
  getBattery, 
  detectServer, 
  setScreenBrightness, 
  connectToSSID, 
  scanSSIDs,
  readFile, 
  createDir, 
  readDir, 
  fileWrite, 
  deleteFile, 
  getFileStat,
  getServiceProtocol,
  getProvisioningFilesFromService,
  getFileListFromCache,
  initMediaRootDir,
  /*updateFiles,*/
};
 