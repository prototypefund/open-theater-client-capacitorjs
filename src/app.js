/* 
the actual app, handling open-theater-api via open-theater.js as well as
all the UI things and other stuff that you might to customize that has 
nothing to do with the API nor the runtime environment of this app:
*/

// TODO:
//    - https://www.npmjs.com/package/fetch-progress
//    - hand data over to trigger api and show triggerMode UI

import * as openTheater from "./open-theater.js";
import path from 'path-browserify';

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

async function showProjectsToUser(projects) {
  console.log("showProjectsToUser got:",projects);
      
  if (projects.length < 1) {return null}

  // document.querySelector("#projectList")// show ProjectList

  for (const project of projects) {
    console.log("channelList",project);

    // create channelList DIV
    const projectTitle = project.projectPath.join(":<br>");
    const dom_projectDiv = htmlToElem(
      `<div class="project">
        <hr>
        <h5>${projectTitle}</h5>
      </div>
      `
    );
    DOM_PROJECTLISTBUTTONS.appendChild(dom_projectDiv);

    for (const channel of project.channelList){
      console.log(channel);
      
      // create a button for each CHANNEL inside the channelLists CHANNELLIST:
      const button = htmlToElem(
        `<div style="margin:5px">
          <button id="${channel.provisioningUri}" class="btn-large waves-effect waves-light btn-provisioning">
            ${channel.label}
          </button>
        </div>`);
      dom_projectDiv.appendChild(button);
      button.addEventListener('click', function handler() {
        document.dispatchEvent(new CustomEvent('channelChosen', {detail:{project:project, channel:channel}}));
        this.removeEventListener('click', handler);
      })
    }
  
  }

  return true
}

function htmlToElem(html) {
  let temp = document.createElement('template');
  html = html.trim(); // Do not return a space in a text node
  temp.innerHTML = html;
  return temp.content.firstChild;
}



async function showUpdateOptionToUserOrUpdateAutomatically(fileList,project,channel){
  console.log("showUpdateOptionToUserOrUpdateAutomatically got:",channel.provisioningUri);


  // CONTINUE HERE:
  // TODO: implement fetch-progress only as file done and then multifile fetch-promise with counter

  let progressbar = bar(channel.provisioningUri);
  let progress = 0;

  console.log(`files to download for ${channel.label}`, fileList);
  
  let fetchPromises = [];

  const progressPerFile = 100/fileList.files.length; // TODO: make fancier by using total bytes instead of num of files...

  for (const file of fileList.files){
    
    const newpath = mergeProvisioningUriWithfilepath(channel.provisioningUri,file.filepath);

    console.log("downloading ",newpath);
    
    const fetchProm = fetch(newpath) // CONTINUE HERE: fix the weird double path issue (http:// instead of http:/)
    .then((res)=>{
      if (res.status === 200){
        // add to progressbar
        progress = progress + progressPerFile;
        progressbar.set(progress);
        // TODO: save to openTheater FileSystem / Asset Cache
        return res.blob();
      }
      return res
    })
    .then((blob)=>{
      return openTheater.fileWrite(file.filepath,blob); // write to Disk / Cache // TODO: write to correct Project Subdir!!!!!!!! // Test if loadable again!!!
/*
// TODO: add this as helper into openTheater.toBase64
// check if this is fast enough for video or if we have a problem with the loading behaviour here (toBase64 should take time even from disk no?)

openTheater.readFile("/2.mp4").then((blob)=>{
    var reader = new FileReader();
     reader.readAsDataURL(blob.data); 
     reader.onloadend = function() {
         var base64data = reader.result;                
         //console.log(base64data);
        document.body.innerHTML = `
<video src="${base64data}" autoplay controls>
`
     }
})

*/


    })
    fetchPromises.push(fetchProm);
  }

  Promise.all(fetchPromises)
  .then((resArray)=>{
    console.log("download attempts done",resArray); 
    // TODO: check for NON 200 responses and react to failed Downloads

    progressbar.bar.remove();
    //document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{project: project, chosenChannel:channel}}))

  })

  //return true
}

function mergeProvisioningUriWithfilepath(provisioningUri,filepath){
  if (filepath.startsWith("http://") || filepath.startsWith("https://")){
    return filepath // nothing needs to be merged. file has its own valid url
  }
  else{
    let url = new URL(provisioningUri);
    url.pathname = path.join(url.pathname,filepath);
    return url.toString()
  }
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
  document.addEventListener("channelChosen",function(e) { 
    console.log(e);
    
    //DOM_PROJECTLIST.classList.add("hidden");
    initChannel(e.detail.project, e.detail.channel) // NEXT

  },{ once: false }) // dont close EventListener after being triggered in case more than one are chosen
    
}

// 2. check if you need to update any data via provisioning API
async function initChannel(project,channel){
  console.log(`channel ${channel.label} was chosen by user and will be initiated`);
  
  const fileList =  await openTheater.getProvisioningFilesFromProject(channel,project.projectPath); // check provisioning API for new content
  if (!fileList){

    alert(`could not connect to ${channel.label}'s provisioning endpoint.`+
    "Please check your network connection and then press OK\n"+
    "Will reconnect on OK and restart the process. If error remains, please contact the theater")
    
    return initUserFlow(); // go back to start
  }
  
  const lastFileList = await openTheater.getFileListFromCache(project.projectPath).catch(async (err)=>{
    console.log("dir of filelist does not exist. gonna have to download everything...",err);
    return showUpdateOptionToUserOrUpdateAutomatically(fileList,project,channel); // TODO: philip
    // CONTINUE HERE: Problem: projectPath contains ALL content for project. so comparing the filelist will not have the effect we want unless we make subdirs per channel OR make a function comparing every item of fileList with the needed files...
  })

  if (JSON.stringify(fileList) !== JSON.stringify(lastFileList)){
    console.log(`directory of filelist exists but has deviations from filelist received `+
    `from provisioning server. gonna have to download everything or at least the changed files...`,
    lastFileList, fileList);
    return showUpdateOptionToUserOrUpdateAutomatically(fileList,project,channel); // TODO: philip
    // CONTINUE HERE: Problem: projectPath contains ALL content for project. so comparing the filelist will not have the effect we want unless we make subdirs per channel OR make a function comparing every item of fileList with the needed files...
  }
  else
  {
    console.log("directory of filelist exists and did not change. ready to trigger now");
    console.log("will dispatch CustomEvent provisiongDone now");
    
    document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{project: project, chosenChannel:channel}}))
  }
  
}

document.addEventListener("provisioningDone",function(e) { 
  console.log("provisioningDone eventListener triggered:",e);
  
  activateTriggerModeForProjectButton(e.detail); 

  //enterTriggerMode(e.detail.chosenProject, e.detail.channelList.projectPath) // NEXT

},{ once: false }) // once per project


async function activateTriggerModeForProjectButton(detail){
  console.log("activateTriggerModeForProjectButton",detail);
  let button = document.getElementById(detail.chosenChannel.provisioningUri);
  button.classList.add("readyToTrigger");
  button.addEventListener("click",()=>{
    enterTriggerMode(detail.chosenChannel,detail.project.projectPath)
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