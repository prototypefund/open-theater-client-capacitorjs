/* 
the actual app, handling open-theater-api via open-theater.js as well as
all the UI things and other stuff that you might to customize that has 
nothing to do with the API nor the runtime environment of this app:
*/
import * as openTheater from "./open-theater.js";

const TESTCONFIG = [  // REPOLIST
  {   /* ssid: "open.theater", 
        pw: "live1234" */
    serveruri: "/mockserver/example-repo/services.json?token={{OPENTHEATER_APP_ID}}"
  },
  {
    serveruri: "https://www.open-theater.de/example-repo/services.json"
  },
];
const DOM_SERVICELISTBUTTONS = document.querySelector('#serviceListButtons');
const DOM_SERVICELIST = document.querySelector('#serviceList')


//////////////////////////////////////////////////////////////////


console.log("loaded", openTheater);

openTheater.helloWorld();

openTheater.getWifiSsid().then((res)=>{
  console.log(`wifi/network info: ${JSON.stringify(res)}`)
});


async function loadServiceListFileIfExists() {
  return new Promise((resolve,reject)=>{
    reject(null)
  }) // Placeholder
}

async function showServicesToUser(serviceGroups) {
  console.log("showServicesToUser got:",serviceGroups);
      
  if (serviceGroups.length < 1) {return null}

  // document.querySelector("#serviceList")// show ServiceList

  for (const serviceGroup of serviceGroups) {
    console.log("serviceGroup",serviceGroup);

    // create serviceGroup DIV
    const serviceGroupTitle = serviceGroup.projectPath.join(":<br>");
    const dom_serviceGroupDiv = htmlToElem(
      `<div class="serviceGroup">
        <hr>  
        <h5>${serviceGroupTitle}</h5>
      </div>
      `
    );
    DOM_SERVICELISTBUTTONS.appendChild(dom_serviceGroupDiv);

    for (const service of serviceGroup.channelList){
      console.log(service);
      
      // create a button for each CHANNEL inside the serviceGroups CHANNELLIST:
      const button = htmlToElem(
        `<div style="margin:5px">
          <button class="btn-large waves-effect waves-light">
            ${service.label}
          </button>
        </div>`);
      dom_serviceGroupDiv.appendChild(button);
      button.addEventListener('click', ()=> {
        document.dispatchEvent(new CustomEvent('serviceChosen', {detail:{service:service, serviceGroup:serviceGroup}}))
      })
    }
      
  }
    
  return true
}

function htmlToElem(html) {
  let temp = document.createElement('template');
  html = html.trim(); // Never return a space text node as a result
  temp.innerHTML = html;
  return temp.content.firstChild;
}

async function showUpdateOptionToUserOrUpdateAutomatically(fileList){
  console.log("showUpdateOptionToUserOrUpdateAutomatically got:",fileList);

  return true
}

window.openTheater = openTheater;


/////////////////////////////////////
///////////// MAIN FLOW /////////////
/////// to be read top to bottom ////
initUserFlow();

// 1. find servers & connect to one
async function initUserFlow() {

  // create Media Root Directory if does not exist yet
  await openTheater.initMediaRootDir();

  DOM_SERVICELISTBUTTONS.innerHTML = "";
  DOM_SERVICELIST.classList.remove("hidden");

  // only for demo reference (how to ignore REPOs)
  let serviceList = await loadServiceListFileIfExists().catch((err)=>{});

  // 1) Use REPOLIST (TESTCONFIG) to get SERVICELIST from one REPO:
  if (!serviceList) { 
  // 2) searches REPOLIST for SERVICELIST
    serviceList = await openTheater.detectServer(TESTCONFIG) 
    console.log(`found serviceList:`,serviceList);
  }

  // 3) get SERVICEGROUPS from SERVICELIST
  let serviceGroups = serviceList.serviceGroups;

  console.log("awaiting showServices with param", serviceGroups);

  await showServicesToUser(serviceGroups);
  
  // 4) choose CHANNEL from SERVICELIST
  document.addEventListener("serviceChosen",function(e) { 
    console.log(e);
    
    DOM_SERVICELIST.classList.add("hidden");
    initService(e.detail.service, e.detail.serviceGroup.projectPath) // NEXT

  },{ once: true }) // close EventListener after being triggered
    
}

// 2. check if you need to update any data via provisioning API
async function initService(service,projectPath){
  console.log(`service ${service.label} was chosen by user and will be initiated`);
  
  const fileList =  await openTheater.getProvisioningFilesFromService(service,projectPath); // check provisioning API for new content
  if (!fileList){

    alert(`could not connect to ${service.label}'s provisioning endpoint.`+
    "Please check your Network connection and then press OK\n"+
    "Will reconnect on OK and restart the process. If error remains, please contact the theater")
    
    return initUserFlow(); // go back to start
  }
  console.log("fileList:",fileList) // success // CONTINUE HERE

  const lastFileList = await openTheater.getFileListFromCache(projectPath);
  
  console.log("cached fileList:", lastFileList);
  if (!lastFileList){
    console.log("dir of filelist does not exist. gonna have to download everything...");
    showUpdateOptionToUserOrUpdateAutomatically(fileList);
  }
  else if (JSON.stringify(fileList) !== JSON.stringify(lastFileList)){
    console.log(`directory of filelist exists but has deviations from filelist received 
    from provisioning server. gonna have to download everything or at least the changed files...`);
    showUpdateOptionToUserOrUpdateAutomatically(fileList);
  }
  else
  {
    console.log("directory of filelist exists and did not change. ready to trigger now");
    document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{service:service}}))
  }


  document.addEventListener("provisioningDone",function(e) { 
    console.log(e);
    
    DOM_SERVICELIST.classList.add("hidden");
    enterTriggerMode(e.detail.service, e.detail.serviceGroup.projectPath) // NEXT

  },{ once: true })
  
}

// 3. wait for user inputs or start of incoming cues via trigger API
async function enterTriggerMode()
{

}

////// END MAIN FLOW //////////////////
///////////////////////////////////////