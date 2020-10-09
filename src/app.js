/* eslint-disable no-restricted-syntax */
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
  {   /* ssid: SEARCH_SSID, 
        pw: SEARCH_PW, */
    serveruri: "/example-performance/services.json?token={{OPENTHEATER_APP_ID}}"
  },
  {
    serveruri: SERVER_URI
  },
];

console.log("loaded", openTheater);

openTheater.helloWorld();

openTheater.getWifiSsid().then((res)=>{
  console.log(`wifi/network info: ${JSON.stringify(res)}`)
});


async function loadServicesFileIfExists() {
  return new Promise((resolve,reject)=>{
    reject(null)
  }) // TODO: Philip
}

async function showServicesToUser(services) {
  console.log("showServicesToUser got:",services);
      
  if (services.length < 1) {return null}

  let choice = null; // with rxjs this could become a return value

  // document.querySelector("#serviceList")// show ServiceList

  for (const service of services) {
    console.log(service);

    // create buttons:
    const button = htmlToElem(
      `<div style="margin:5px">
        <button class="btn-large waves-effect waves-light">${service.label}</button>
      </div>`);
    document.querySelector('#serviceListButtons').appendChild(button);
    button.addEventListener('click', ()=> {
      document.dispatchEvent(new CustomEvent('serviceChosen', {detail:service}))
    })

  }
    
  return true
}

function htmlToElem(html) {
  let temp = document.createElement('template');
  html = html.trim(); // Never return a space text node as a result
  temp.innerHTML = html;
  return temp.content.firstChild;
}

window.openTheater = openTheater;



// 1. find servers & connect to one

// 2. check if you need to update any data via provisioning API

// 3. wait for user inputs or start of incoming cues via trigger API


///////////// MAIN FLOW /////////////
/////// to be read top to bottom ////

(async function init() {

  let services = await loadServicesFileIfExists().catch((err)=>{});

  if (!services) {
    services = await openTheater.detectServer(TESTCONFIG) // searches list of repositories for list of services
    services = services.services;
    console.log(`found services:`,services);
    (services)
  }

  console.log("awaiting showServices with param", services);
    
  let service_chosen = await showServicesToUser(services); // TODO: Philip
    
  document.addEventListener("serviceChosen",function(e) { // and wait for input
    console.log(e);
    
    initService(e.detail) // NEXT

  },{ once: true }) // close EventListener after being triggered
    
})()

async function initService(service_chosen){
  console.log(`service ${service_chosen.label} was chosen by user and will be initiated`);
  
  let fileList =  await openTheater.checkForUpdates(service_chosen); // check provisioning API for new content

  /*
  if (fileList.stringify() !== lastFileList){
    await showUpdateOptionToUserOrUpdateAutomatically(fileList);
  }
  */
}


////// END MAIN FLOW //////////////////