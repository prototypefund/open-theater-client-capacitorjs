const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { Resource$Liasettings } = require("googleapis/build/src/apis/content/v2");

const repoFilePath = "./example-repo/services.json";


fs.promises.readFile(repoFilePath,{encoding:"utf-8"})
.then(async (projectList)=>{
    let projectListObj = JSON.parse(projectList);
    let projects = projectListObj.projects;

    // iterate through all channels and check their provisioningUri + fileList.json
    for (let i in projects){
        let proj = projects[i];
        for (let j in proj.channelList){
            let channel = proj.channelList[j];
            if (channel.provisioningUri === undefined || channel.provisioningUri === null){continue}
            
            const result = await fetch(new URL("fileList.json",channel.provisioningUri))
            if(result.status !== 200){
                console.log("could not access",channel.provisioningUri);
                continue
            }
            const body = await result.json()
            .catch((err)=>{"json body malformed",err});
            //console.log(body);
            for (file of body.files){
                console.log(file);
                // compare timestamps
                if (file.lastmodified > channel.lastmodified)
                {
                    console.log("UPDATE!!!!",file.lastmodified);
                    projectListObj.projects[i].channelList[j].lastmodified = file.lastmodified;
                    console.log(projectListObj.projects[i].channelList[j].lastmodified);
                }
            }
            
        }
    }
    
    const newProjectList = JSON.stringify(projectListObj,null,2);
    //console.log(JSON.stringify(projectListObj,null,2));
    await fs.promises.writeFile(repoFilePath,newProjectList,"utf-8")
})
.catch((err)=>{
    console.log(err);
})


