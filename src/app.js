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
import "lodash"; // can be used as _ // TODO: import only used code

const TESTCONFIG = [  // REPOLIST
  { ssid: "open.theater", 
    pw: "live1234",
    serveruri: "http://192.168.178.38:8080/mockserver/example-repo/projectList.json?token={{OPENTHEATER_APP_ID}}"
  },
  {
    serveruri: "http://192.168.178.38:8080/mockserver/example-repo/projectList.json?token={{OPENTHEATER_APP_ID}}"
  },
  {
    serveruri: "https://www.open-theater.de/example-repo/projectList.json"
  },
];
const DOM_PROJECTLISTBUTTONS = document.querySelector('#projectListButtons');
const DOM_PROJECTLIST = document.querySelector('#projectList')


//////////////////////////////////////////////////////////////////
 

console.log("loaded", openTheater);

openTheater.getWifiSsid().then((res)=>{
  console.log(`wifi/network info: ${JSON.stringify(res)}`)
});

async function showProjectsToUser(projects) {
  console.log("showProjectsToUser got:",projects);
      
  if (projects.length < 1) {return null}

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
      console.log("channel:",channel);
      
      // create a button for each CHANNEL inside the channelLists CHANNELLIST:
      const button = htmlToElem(
        `<div style="margin:5px">
          <button id="${channel.provisioningUri}" class="btn-large waves-effect waves-light btn-provisioning">
            ${channel.label}
          </button>
        </div>`);
      dom_projectDiv.appendChild(button);

      // mark as up-to-date if channel has .lastmodified and up to date with client's cached fileList of channel
      if(channel.lastmodified !== undefined && channel.lastmodified !== null){
        markButtonIfUpToDate(button,project,channel);
      }

      function markButtonIfUpToDate(button,project,channel){
        console.log(`channel ${channel.label} has lastmodified flag:`, channel.lastmodified, "will check local cached fileList.json");
        openTheater.getFileListFromCache(project.projectPath, channel.channelId).then((res)=>{
          // get latest lastmodified from FileList // CONTINUE HERE: error catching and helper functions
          let lastmodified = 0;
          for (const file of res.files){
            if (file.lastmodified > lastmodified){
              lastmodified = file.lastmodified;
            }
          }
          console.log(`latest last modified from cached FileList for channel ${channel.label}:`
            , lastmodified);
          if (lastmodified === channel.lastmodified)
          {
            console.log(`channel ${channel.label} seems to have up-to-date fileList. Will mark it...`);
            button.classList.add("up-to-date-filelist")
          }
          else
          {
            console.log(`channel ${channel.label} not up-to-date`);
          }
        })
        .catch((err)=>{
          console.log(`could not find a fileList in cache for channel ${channel.label}. 
          So: channel needs to check for updates.`,err);
        })
      }

      // add Eventhandler
      button.addEventListener('click', function handler() {
        console.log("########## got clicked ############");
        
        this.removeEventListener('click', handler);
        document.dispatchEvent(new CustomEvent('channelChosen', {detail:{project:project, channel:channel}}));
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



async function showUpdateOptionToUserOrUpdateAutomatically(updateList,project,channel){
  console.log("showUpdateOptionToUserOrUpdateAutomatically got:",channel.provisioningUri);

  // TODO: implement multifile fetch-promise with counter

  let progressbar = bar(channel.provisioningUri);
  let progress = 0;

  console.log(`files to download for ${channel.label}`, updateList);
  
  let fetchPromises = [];
  // TODO: make fancier by using total bytes instead of num of files...
  const progressPerFile = 100/updateList.length; 

  for (const file of updateList){
    
    const newpath = mergeProvisioningUriWithfilepath(channel.provisioningUri,file.filepath);

    console.log("downloading ",newpath);
    
    const fetchProm = fetch(newpath)
    .then((res)=>{
      if (res.status === 200){
        return res.blob();
      }
      else if (res.status >= 400){
        console.error("ERROR CODE WHILE FETCHING ASSET", res);
        throw "HTTP ERROR CODE RECEIVED"
      }
      else
      {
        throw "this should never happen"
      }
    })
    .then((blob)=>{
      // add to progressbar
      progress = progress + progressPerFile;
      progressbar.set(progress);
      // write to Disk / Cache
      return openTheater.fileWrite(path.join(project.projectPath.join("/"),channel.channelId,file.filepath),blob); 
    })
    fetchPromises.push(fetchProm);
  }

  Promise.all(fetchPromises)
  .then(async (resArray)=>{
    console.log("download attempts done",resArray); 
    
    resArray.forEach((res)=>{
      console.log("res",res);
    })
    // write new FileList.json into Cache
    const fileListPathCache = path.join(project.projectPath.join("/"),channel.channelId,"fileList.json");

    const oldFileListFile = await openTheater.readFile(fileListPathCache)
    .catch(
      (err)=>{
        console.error("could not read old fileList.json from device",err);
        return {data:`{"files":[]}`};
    });
    console.log("oldFileListFile", oldFileListFile);
    
    const oldFileList = JSON.parse(oldFileListFile.data);
    console.log("oldFileList is",oldFileList, "updateList is", updateList);
    
    let newFileList = oldFileList; // CONTINUE HERE: test
    newFileList.files = _.unionBy(updateList, oldFileList.files,"filepath");
    console.log("newFileList:", newFileList);
    

    openTheater.fileWrite(fileListPathCache,JSON.stringify(newFileList))
    .then((res)=>{console.log("wrote fileList to device",res);
    })
    
    progressbar.bar.remove();
    document.dispatchEvent(new CustomEvent('provisioningDone', 
      {detail:{project: project, chosenChannel:channel}})
    )
  })
  .catch((err)=>{
    console.error(err);
    
    alert(`We could not download ${channel.label}. Seems the server is not working.`)
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

  // 1) Use REPOLIST (TESTCONFIG) to get PROJECTLIST from one REPO:
  // 2) searches REPOLIST for PROJECTLIST
  const projectList = await openTheater.detectServer(TESTCONFIG)
  if (projectList == undefined || projectList == null){
    alert("could not fetch projectList from any of the Repo Servers."+ 
          "Please check if you are online and restart app.")
  }
  console.log(`found projectList:`,projectList);

  // 3) get projects from PROJECTLIST
  let projects = projectList.projects;

  console.log("projectList from service.json:",projectList);
  

  if (!projects || projects === null || projects === undefined){
    alert("could not access projects from repository. Please restart the app.");
    throw `could not access projects from returned projectList. Probably malformed response from projectList.json`
  }
  console.log("awaiting showProjects with param", projects);

  await showProjectsToUser(projects);
  
  console.log("waiting for user input (to choose projects to provision and prepare)");

  // 4) choose CHANNEL from PROJECTLIST
  document.addEventListener("channelChosen",function(e) { 
    console.log("4) channelChosen event", e);
    
    //DOM_PROJECTLIST.classList.add("hidden");
    initChannel(e.detail.project, e.detail.channel) // NEXT

  },{ once: false }) // dont close EventListener after being triggered in case more than one are chosen
    
}

// 2. check if you need to update any data via provisioning API
async function initChannel(project,channel){
  console.log(`channel ${channel.label} was chosen by user and will be initiated`);
  
  if(channel.provisioningUri === null || channel.provisioningUri === undefined)
  {
    console.log("this channel does not have any provisioningUri and will not need any provisioning");
    return document.dispatchEvent(new CustomEvent('provisioningDone', {detail:{project: project, chosenChannel:channel}}))
  }

  const fileList =  await openTheater.getProvisioningFilesFromProject(channel)
  .catch((err)=>{
    alert(`could not connect to ${channel.label}'s provisioning endpoint.`+
    "Please check your network connection and then press OK\n"+
    "Will reconnect on OK and restart the process. If error remains, please contact the theater")
     window.location.reload(); // go back to start
     throw("restarting after issue in initChannel")
  }); // check provisioning API for new content
  console.log("initChannel has now fileList", fileList);

  const lastFileList = await openTheater.getFileListFromCache(project.projectPath, channel.channelId)
  .catch(async (err)=>{
    console.log("dir or file of filelist.json does not exist. gonna have to download everything...",err);
    return null
  })
  
  if (!fileList || fileList === null || fileList === undefined){
    return showUpdateOptionToUserOrUpdateAutomatically(null,project,channel); 
  }

  const updateList = openTheater.getFileListDiff(lastFileList,fileList);

  if (updateList.length > 0){
    console.log(`directory of filelist exists but has deviations from filelist received `+
    `from provisioning server. gonna have to download everything or at least the changed files...`,
    lastFileList, fileList);
    return showUpdateOptionToUserOrUpdateAutomatically(updateList,project,channel); 
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

},{ once: false }) // once per channel


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