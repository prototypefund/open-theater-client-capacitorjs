/*
 will update repoFilePath based on fileList.json's of each provisioningUri to their latest lastmodified timestamp.

 to be run every 15 minutes on Repository Server to keep everything up to date.

 TODO: 
 - add further checks into repository to e.g. clean out or mark unreachable or malformed provisioningServers.
 - delete files, how to check for that?
 */

const fs = require("fs");
const fetch = require("node-fetch");

const repoFilePath = "./example-repo/projectList.json";

const fileListName = "fileList.json";

fs.promises.readFile(repoFilePath,{encoding:"utf-8"})
.then(async (projectList)=>{
    let needsUpdate = false;

    let projectListObj = JSON.parse(projectList);
    let projects = projectListObj.projects;

    // iterate through all channels and check their provisioningUri + fileList.json
    for (let i in projects){
        let proj = projects[i];
        for (let j in proj.channelList){
            let channel = proj.channelList[j];
            if (channel.provisioningUri === undefined || channel.provisioningUri === null){continue}
            
            const result = await fetch(new URL(fileListName,channel.provisioningUri))
            if(result.status !== 200){
                console.log("could not access",channel.provisioningUri, result.status);
                continue
            }
            const body = await result.json()
            .catch((err)=>{"json body malformed",err});
            for (file of body.files){
                console.log(file);
                // compare timestamps
                if (file.lastmodified > channel.lastmodified)
                {
                    console.log("UPDATE!!!!",file.lastmodified);
                    // update projectListObj
                    projectListObj.projects[i].channelList[j].lastmodified = file.lastmodified;
                    needsUpdate = true;
                }
            }
            
        }
    }

    if (needsUpdate){
        // write new projectListObj
        const newProjectList = JSON.stringify(projectListObj,null,2);
        await fs.promises.writeFile(repoFilePath,newProjectList,"utf-8")
    }
    
})
.catch((err)=>{
    throw err;
})


