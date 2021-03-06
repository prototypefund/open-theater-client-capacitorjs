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
import { writeFile } from 'capacitor-blob-writer' // use module directly not `Plugins.BlobWriter`
window.writeFile = writeFile;
window.FilesystemDirectory = FilesystemDirectory;
import path from 'path-browserify';

const { Device, Filesystem } = Plugins;


const MEDIA_BASE_PATH = "/media";

const PLATFORM_IS_WEB =  (getPlatform() === "web");
const PLATFORM_IS_ANDROID = (getPlatform() === "android");
const PLATFORM_IS_IOS = (getPlatform() === "ios");

/* 
TODO:
Downloading Assets: 
- fix on pwa 
- if works adapt into opentheater.helperfunctions as read and download
- find fixes for loading times of videos (preloading in trigger might be needed to bridge this)
*/


function getPlatform(){
  return Capacitor.getPlatform();
}

function hideStatusBar(){
  const { StatusBar } = Plugins;
  return StatusBar.hide();
}

function showStatusBar(){
  const { StatusBar } = Plugins;
  return StatusBar.show();
}

function exitApp() {
  const { App } = Plugins;
  App.exitApp()
  return false;
}

/**
 * based on cordova plugin https://github.com/fagundes/cordova-plugin-navigationbar
 */
function hideAndroidNavigationBar(){
  if (PLATFORM_IS_ANDROID){
    return NavigationBar.hide(); 
  }
  return
}

/**
 * based on cordova plugin https://github.com/fagundes/cordova-plugin-navigationbar
 */
function showAndroidNavigationBar(){
  if (PLATFORM_IS_ANDROID){
    return NavigationBar.show();
  }
  return
}

async function showToast(content){
  const { Toast } = Plugins;
  await Toast.show({
    text:content
  })
}

async function createDir(dirpath){
    
    try {
        let ret = await Filesystem.mkdir({
        path: dirpath,
        directory: FilesystemDirectory.Data,
        recursive: false
        });
        return ret
    } catch(e) {
        console.error('Unable to make directory', e);
        return null
    }
    
}

async function readDir(dirpath){
    console.log(`openTheater.readDir got ${dirpath}`);
    
    try {
        let ret = await Filesystem.readdir({
          path: path.join(MEDIA_BASE_PATH,dirpath),
          directory: FilesystemDirectory.Data
        });
        return ret
      } catch(e) {
        console.error('OpenTheater.readDir: Unable to read dir', e);
        return null
      }
}

// TODO: catch if running in web, then use different methods for caching or at least dont attempt using blob-writing
async function fileWrite(filepath, content) {
    try {
      const result = await writeFile({
                
        path: path.join(MEDIA_BASE_PATH, filepath),
        directory: FilesystemDirectory.Data,

        // data must be a Blob
        data: content,

        // create intermediate directories if they don't already exist
        // default: false
        recursive: true,

        // fallback to Filesystem.writeFile instead of throwing an error
        // default: true
        fallback: (err) => {
          console.error(err)
        }
      })
      /* await writeFile({
        path: path.join(MEDIA_BASE_PATH, filepath),
        recursive: true,
        data: content, 
        // because we use diachedelic's capacitor-blob-writer (writeFile instead of Filesystem.writeFile): 
        // data must be a Blob 
        directory: FilesystemDirectory.Data,
        fallback:function(err){
          console.error(err)
          throw(err)
        }
      })*/
      console.log('Wrote file', result);
      return result
    } catch(e) {
      console.error('Unable to write file', e);
      return null
    }
}

async function readFile(filepath, media_base_path = MEDIA_BASE_PATH){
    console.log("openTheater.readFile got", filepath);
    
    let contents = await Filesystem.readFile({
        path: path.join(media_base_path,filepath),
        directory: FilesystemDirectory.Data,
        encoding: FilesystemEncoding.UTF8
      })
      .catch((err)=>{
        console.log("openTheater.readFile got an error",err);
        
        throw err
      });
    //console.log(contents);
    return contents
}

async function deleteFile(path) {
    await Filesystem.deleteFile({
      path: path,
      directory: FilesystemDirectory.Data
    });
    console.log("file delete was forwarded to system");
    return true
  }

  async function getFileStat(filepath,media_base_path = MEDIA_BASE_PATH) {
    try {
      let stat = await Filesystem.stat({
        path: path.join(media_base_path,filepath),
        directory: FilesystemDirectory.Data
      });

      /*
       * stat = { ctime: 000, mtime: 000, size: 000, type: "NSFileTypeRegular", uri: "file://xyz" }
       * 
       */
      return stat
    } catch(e) {      
      console.error(`openTheater.getFileStat: Unable to stat file ${filepath}`, e);
      return null
    }
  }

  //path.join(project.projectPath.join("/"),channel.channelUuid,file.filepath
  // project.projectPath,selectedChannel.channelUuid,payloadSrc
  async function getCapacitorAssetUriForChannel(projectPath,channelUuid,filename) {

    let filepath = path.join(projectPath.join("/"),channelUuid,filename);
    let stat = await getFileStat(filepath);
    let capacitorUri = null;

    console.log('projectPath',projectPath,'channelUuid',channelUuid,'filename',filename);
    console.log('filepath',filepath);
    console.log('!!!! stat', stat);

    if(stat && stat.uri) {
      capacitorUri = Capacitor.convertFileSrc(stat.uri);
    }
    console.log('capacitorUri', capacitorUri);

    return capacitorUri
    
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

async function getBattery() {
    let batterystate = await Device.getBatteryInfo();
    console.log("battery:", batterystate);
    // rename to match navigator.getBattery()
    return {
      charging: batterystate.isCharging,
      level: batterystate.batteryLevel
    }
}

/**
 * 
 * @param {Obj} config 
 * tries to connect to wifi with config.ssid if possible
 * then tries to connect to serveruri in whichever network is available
 * reports back
 * @example [ {ssid: SEARCH_SSID, pw: SEARCH_PW, serveruri: SERVER_URI} ]
 */
async function detectServer(config,timeout = 8000){
  
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
    console.log("fetching projects from", endpoint.serveruri);
    let projects = await Promise.race([
        fetch(endpoint.serveruri,{cache: "no-store"}),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
    ])
    .then(async (res)=>{
      console.log("got response from",endpoint.serveruri)
      return await res.json()}
    )
    .catch((err)=>{
      console.error(`openTheater.detectServer could not fetch from endpoint.serveruri 
      ${endpoint.serveruri}`,err);
      return null
    });
    console.log(projects);

    if (!projects){
      console.log(`
        could not connect to server ${endpoint.serveruri}. 
        will try next repo server in config...`);        
        continue;
    }

    return {repository:endpoint.serveruri,projectList:projects}
  }

  console.log(`could not connect to any server listed in the repo list config`);
  
  return null

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

async function getProvisioningFilesFromProject(channel){
  
  if(!channel.provisioningUri || typeof channel.provisioningUri !== "string"){
    throw "getProvisioningFilesFromProject requires Project obj to contain provisioningUri (string)"
  }

  let url = new URL(channel.provisioningUri);
  url.pathname = path.join(url.pathname,"fileList.json");
  url = url.toString();

  const listOfAssetFilesResponse = await fetch(url,{cache: "no-store"});
  if (!listOfAssetFilesResponse.ok){
    throw "getProvisioningFilesFromProject encountered an error communicating with provisioning server"
  }
  const listOfAssetFiles = await listOfAssetFilesResponse.json()
  .catch((err)=>{ throw {message:"getProvisioningFilesFromProject got falsy response from provisioning server",error:err}});
  console.log("listOfAssetFiles:",listOfAssetFiles);
  
  return listOfAssetFiles
}

// TODO: compare filebyfile instead complete list
/**
 * 
 * @param {array} projectPath - Array of strings defining the path of the project's root asset directory
 * @param {string} channelUuid - defines the name of this channel's subdirectory in the projects cache
 */
async function getFileListFromCache(projectPath, channelUuid){
  console.log(`getFileListFromCache got ${projectPath}`);
  
    const projectsAssetDir = path.join(MEDIA_BASE_PATH,projectPath.join("/"), channelUuid); // CONTINUE HERE
    
    const file = await readFile(path.join(projectPath.join("/"),channelUuid,"fileList.json"))
      .catch((err)=>{throw {message:"getFileListFromCache could not find projects fileList.json",stack:err}})
    
    console.log("file is", file);
    
    const fileList = JSON.parse(file.data);

    console.log("fileList is", fileList);
    
    let output = fileList;

    if (!fileList || fileList === null || fileList === undefined){
        console.error(`getFileListFromCache could not find 
        ${path.join(projectPath.join("/"),"fileList.json")}`)
        const fileList = await readDir(projectPath.join("/")) // fallback if no fileList.json present

        const fileListFormatted = await Promise.all(
          fileList.files.map(async (filename) =>{
            const filestats = await getFileStat(path.join(projectsAssetDir,filename),"");
            const lastmodified = filestats.mtime;
            const filesize = filestats.size;
    
            return {filepath:filename, filesize: filesize, lastmodified: lastmodified}
          })
        )
    
        output = {
          files: fileListFormatted
        }
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
  const dir = await readDir("/")
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

/**
 * compares to fileListObjects and returns an array of files to be updated
 * depending on whether the files are either newer or unknown to the cache 
 * object (oldFileList)
 * 
 * @param {object} oldFileList - the fileList.json object from Cache
 * @param {object} newFileList - the fileList.json object from the provisioningserver
 */
function getFileListDiff(oldFileList,newFileList){

  if (oldFileList === null || oldFileList === undefined){
    return newFileList.files
  }
  let nonmatching = [];

  for (const newfile of newFileList.files){
    // if newfile.filepath is not to be found at all in oldFileList:
    if (!oldFileList.files.some((oldfile)=>{return oldfile.filepath === newfile.filepath})){
      nonmatching.push(newfile);
    }
    // if newfile.filepath matches a file in oldfiles but its timestamp is newer:
    else if (oldFileList.files.some(
        (oldfile)=>{
          console.log(oldfile,"is older than", 
            newfile, ((oldfile.filepath === newfile.filepath) && (oldfile.lastmodified < newfile.lastmodified)))
          return ((oldfile.filepath === newfile.filepath) && (oldfile.lastmodified < newfile.lastmodified))
        })
    ){
      nonmatching.push(newfile);
    }
  }
  
  console.log("openTheater.getFileListDiff nonmatching:",nonmatching);
  return nonmatching
}

export { 
  helloWorld,
  getPlatform,
  hideStatusBar,
  exitApp,
  showStatusBar,
  showToast,
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
  getProvisioningFilesFromProject,
  getFileListFromCache,
  initMediaRootDir,
  getFileListDiff,
  getCapacitorAssetUriForChannel,
  hideAndroidNavigationBar,
  showAndroidNavigationBar
  /*updateFiles,*/
};
??