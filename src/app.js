/* 
the actual app, handling open-theater-api via open-theater.js as well as
all the UI things and other stuff that you might to customize that has 
nothing to do with the API nor the runtime environment of this app:
*/

// TODO:
//    - correct all 
//    - https://www.npmjs.com/package/fetch-progress

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
const DOM_PROJECTLISTBUTTONS = document.querySelector('#projectListButtons');
const DOM_PROJECTLIST = document.querySelector('#projectList')


//////////////////////////////////////////////////////////////////


console.log("loaded", openTheater);

openTheater.helloWorld();

openTheater.getWifiSsid().then((res)=>{
  console.log(`wifi/network info: ${JSON.stringify(res)}`)
});


async function loadProjectListFileIfExists() {
  return new Promise((resolve,reject)=>{
    reject(null)
  }) // Placeholder
}

async function showProjectsToUser(channelLists) {
  console.log("showProjectsToUser got:",channelLists);
      
  if (channelLists.length < 1) {return null}

  // document.querySelector("#projectList")// show ProjectList

  for (const channelList of channelLists) {
    console.log("channelList",channelList);

    // create channelList DIV
    const channelListTitle = channelList.projectPath.join(":<br>");
    const dom_channelListDiv = htmlToElem(
      `<div class="channelList">
        <hr>  
        <h5>${channelListTitle}</h5>
      </div>
      `
    );
    DOM_PROJECTLISTBUTTONS.appendChild(dom_channelListDiv);

    for (const project of channelList.channelList){
      console.log(project);
      
      // create a button for each CHANNEL inside the channelLists CHANNELLIST:
      const button = htmlToElem(
        `<div style="margin:5px">
          <button id="${project.provisioningUri}" class="btn-large waves-effect waves-light btn-provisioning">
            ${project.label}
          </button>
        </div>`);
      dom_channelListDiv.appendChild(button);
      button.addEventListener('click', function handler() {
        document.dispatchEvent(new CustomEvent('projectChosen', {detail:{project:project, channelList:channelList}}));
        this.removeEventListener('click', handler);
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

async function showUpdateOptionToUserOrUpdateAutomatically(channelList,project){
  console.log("showUpdateOptionToUserOrUpdateAutomatically got:",project.provisioningUri);


  // demo code only atm
  let progressbar = bar(project.provisioningUri);
  
  let progress = 0;
  let thisinterval = setInterval(()=>{
    console.log(progress+"%");
    if (progress >= 100){
      clearInterval(thisinterval);
      console.log("download finished");
      //progressbar.bar.remove();
      document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{channelList: channelList, chosenProject:project}}))
    }
    else{
      progress = progress+1;
      progressbar.set(progress)
    }
  },50)
  
    

  //return true
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

  DOM_PROJECTLISTBUTTONS.innerHTML = "";
  DOM_PROJECTLIST.classList.remove("hidden");

  // only for demo reference (how to ignore REPOs)
  let projectList = await loadProjectListFileIfExists().catch((err)=>{});

  // 1) Use REPOLIST (TESTCONFIG) to get PROJECTLIST from one REPO:
  if (!projectList) { 
  // 2) searches REPOLIST for PROJECTLIST
    projectList = await openTheater.detectServer(TESTCONFIG) 
    console.log(`found projectList:`,projectList);
  }

  // 3) get projects from PROJECTLIST
  let projects = projectList.projects;

  console.log("awaiting showProjects with param", projects);

  await showProjectsToUser(projects);
  
  console.log("waiting for user input (to choose projects to provision and prepare)");

  // 4) choose CHANNEL from PROJECTLIST
  document.addEventListener("projectChosen",function(e) { 
    console.log(e);
    
    //DOM_PROJECTLIST.classList.add("hidden");
    initProject(e.detail.project, e.detail.channelList) // NEXT

  },{ once: false }) // dont close EventListener after being triggered in case more than one are chosen
    
}

// 2. check if you need to update any data via provisioning API
async function initProject(project,channelList){
  console.log(`project ${project.label} was chosen by user and will be initiated`);
  
  const fileList =  await openTheater.getProvisioningFilesFromProject(project,channelList.projectPath); // check provisioning API for new content
  if (!fileList){

    alert(`could not connect to ${project.label}'s provisioning endpoint.`+
    "Please check your network connection and then press OK\n"+
    "Will reconnect on OK and restart the process. If error remains, please contact the theater")
    
    return initUserFlow(); // go back to start
  }
  
  const lastFileList = await openTheater.getFileListFromCache(channelList.projectPath).catch(async (err)=>{
    console.log("dir of filelist does not exist. gonna have to download everything...",err);
    return showUpdateOptionToUserOrUpdateAutomatically(channelList,project); // TODO: philip
    // CONTINUE HERE: Problem: projectPath contains ALL content for project. so comparing the filelist will not have the effect we want unless we make subdirs per channel OR make a function comparing every item of fileList with the needed files...
  })

  if (JSON.stringify(fileList) !== JSON.stringify(lastFileList)){
    console.log(`directory of filelist exists but has deviations from filelist received `+
    `from provisioning server. gonna have to download everything or at least the changed files...`,
    lastFileList, fileList);
    return showUpdateOptionToUserOrUpdateAutomatically(channelList,project); // TODO: philip
    // CONTINUE HERE: Problem: projectPath contains ALL content for project. so comparing the filelist will not have the effect we want unless we make subdirs per channel OR make a function comparing every item of fileList with the needed files...
  }
  else
  {
    console.log("directory of filelist exists and did not change. ready to trigger now");
    console.log("will dispatch CustomEvent provisiongDone now");
    
    document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{channelList: channelList, chosenProject:project}}))
  }
  
}

document.addEventListener("provisioningDone",function(e) { 
  console.log("provisioningDone eventListener triggered:",e);
  
  activateTriggerModeForProjectButton(e.detail); 

  //enterTriggerMode(e.detail.chosenProject, e.detail.channelList.projectPath) // NEXT

},{ once: false }) // once per project


async function activateTriggerModeForProjectButton(detail){
  console.log("activateTriggerModeForProjectButton",detail);
  let button = document.getElementById(detail.chosenProject.provisioningUri);
  button.classList.add("readyToTrigger");
  button.addEventListener("click",()=>{
    enterTriggerMode(detail.chosenProject,detail.channelList.projectPath)
  })
}


// CONTINUE HERE
// 3. wait for user inputs or start of incoming cues via trigger API
async function enterTriggerMode(project, projectPath)
{
  console.log("enterTriggerMode", project, projectPath);
  
}

////// END MAIN FLOW //////////////////
///////////////////////////////////////