/* 
the actual app, handling open-theater-api via open-theater.js as well as
all the UI things and other stuff that you might to customize that has 
nothing to do with the API nor the runtime environment of this app:
*/
import * as openTheater from "./open-theater.js";

const SEARCH_SSID = "open.theater";
const SEARCH_PW = "live1234";
const SERVER_URI = "https://www.open-theater.de/example-performance/services.json";
const TESTCONFIG = [ 
    {ssid: SEARCH_SSID, pw: SEARCH_PW, serveruri: SERVER_URI},
    {serveruri: SERVER_URI},
];

console.log("loaded", openTheater);

openTheater.helloWorld();

openTheater.getWifiSsid().then((res)=>{
    console.log(`wifi/network info: ${JSON.stringify(res)}`)
});

////// MAIN ////////

(async function(){

    let services = loadServicesFileIfExists();

    if (!services){
    
        services = await openTheater.detectServer(TESTCONFIG) // searches list of repositories for list of services
        console.log(`found services:`,services);
    }
    /*
    let service_chosen = await showServicesToUserAndAwaitInput();

    let fileList =  await openTheater.checkForUpdates(service_chosen); // check provisioning API for new content

    if (fileList.stringify() !== lastFileList){
        await showUpdateOptionToUserOrUpdateAutomatically(fileList);
    
    */
    
    

})()

////// END MAIN //////


function loadServicesFileIfExists(){
    return null
}

window.openTheater = openTheater;


// 1. find servers & connect to one

// 2. check if you need to update any data via provisioning API

// 3. wait for user inputs or start of incoming cues via trigger API