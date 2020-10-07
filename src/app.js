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
    {/*ssid: SEARCH_SSID, pw: SEARCH_PW, */serveruri: "/example-performance/services.json?token={{OPENTHEATER_APP_ID}}"},
    {serveruri: SERVER_URI},
];

console.log("loaded", openTheater);

openTheater.helloWorld();

openTheater.getWifiSsid().then((res)=>{
    console.log(`wifi/network info: ${JSON.stringify(res)}`)
});


var app = new Vue({ // imported in index.html because Philip is to dumb to do it with npm and webpack
    el: '#app',
    data: {
        serviceList:{
            visible:false,
            items:[]
        }
    }
  })
  window.app = app;

async function loadServicesFileIfExists(){
    return new Promise((resolve,reject)=>{
        reject(null)
    }) // TODO: Philip
}

async function showServicesToUserAndAwaitInput(services){
    console.log("showServicesToUserAndAwaitInput got:",services);
    
    if (services.length < 1){return null}

    let choice = null;

    app.serviceList.visible = true; // show list

    for (let service of services){
        console.log(service);
        let protocol = openTheater.getServiceProtocol(service.triggerUri);
        
        console.log(protocol)
        
        app.serviceList.items.push(service);
    }
    
    return choice
}

window.openTheater = openTheater;



// 1. find servers & connect to one

// 2. check if you need to update any data via provisioning API

// 3. wait for user inputs or start of incoming cues via trigger API


////// MAIN ////////

(async function(){

    let services = await loadServicesFileIfExists().catch((err)=>{});

    if (!services){
        services = await openTheater.detectServer(TESTCONFIG) // searches list of repositories for list of services
        services = services.services;
        console.log(`found services:`,services);
        (services)
    }

    console.log("awaiting showServices with param", services);
    
    let service_chosen = await showServicesToUserAndAwaitInput(services); // TODO: Philip
    console.log("service_chosen:",service_chosen);
    
    /*
    let fileList =  await openTheater.checkForUpdates(service_chosen); // check provisioning API for new content

    if (fileList.stringify() !== lastFileList){
        await showUpdateOptionToUserOrUpdateAutomatically(fileList);
    
    */
    
})()

////// END MAIN //////