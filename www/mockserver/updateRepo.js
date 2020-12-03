const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch")

const repoFilePath = "./example-repo/services.json";


fs.promises.readFile(repoFilePath,{encoding:"utf-8"})
.then((projectList)=>{
    projects = JSON.parse(projectList).projects
    console.log(projects);
    
    // iterate through all channels and check their provisioningUri + fileList.json
    for (const proj of projects){
        //console.log(proj.channelList);
        for (const channel of proj.channelList){
            console.log(channel.provisioningUri);
            fetch(provisioningUri)
        }
    }
})
