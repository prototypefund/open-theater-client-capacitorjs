
const fs = require("fs");
const path = require("path");

const projectBaseFolder = './ntgent';


// BASE FOLDER
let projectFolders = fs.readdirSync(projectBaseFolder);

console.log(projectFolders);
projectFolders.forEach(projectFolder => {


    // PROJECT FOLDER
    let trackFolders = fs.readdirSync(path.join(projectBaseFolder, projectFolder));

    trackFolders.forEach(trackFolder => {
        console.log(trackFolder);

        let trackFolderPath = path.join(projectBaseFolder, projectFolder, trackFolder);
        // TRACK FOLDER CONTENT
        let trackFolderContent = fs.readdirSync(trackFolderPath);

        let fileList = [];

        trackFolderContent.sort(alphanumSort);

        trackFolderContent.forEach(filename => {

            if (path.extname(filename) !== '.json') {

                let fullpath = path.join(trackFolderPath, filename);

                //console.log(fullpath)

                let stats = fs.statSync(fullpath);

                if (stats) {

                    //console.log("Stats object for: " + filename);
                    //console.log(stats); 

                    if (stats.isFile()) {

                        console.log(filename);

                        fileList.push({
                            filepath: filename,
                            filesize: stats.size,
                            lastmodified: new Date(stats.mtime).getTime()
                        });
                    }

                }


            }
        });

        console.log('fileList', fileList);
        let targetFile = path.join(trackFolderPath,'fileList.json');
        
        // write new projectListObj
        const newFileList = JSON.stringify({files: fileList}, null, 2);
        fs.promises.writeFile(targetFile, newFileList, "utf-8")
        

    });

});











// http://web.archive.org/web/20130826203933/http://my.opera.com/GreyWyvern/blog/show.dml/1671288

function alphanumSort(a, b) {
    function chunkify(t) {
      var tz = [], x = 0, y = -1, n = 0, i, j;
  
      while (i = (j = t.charAt(x++)).charCodeAt(0)) {
        var m = (i == 46 || (i >=48 && i <= 57));
        if (m !== n) {
          tz[++y] = "";
          n = m;
        }
        tz[y] += j;
      }
      return tz;
    }
  
    var aa = chunkify(a);
    var bb = chunkify(b);
  
    for (x = 0; aa[x] && bb[x]; x++) {
      if (aa[x] !== bb[x]) {
        var c = Number(aa[x]), d = Number(bb[x]);
        if (c == aa[x] && d == bb[x]) {
          return c - d;
        } else return (aa[x] > bb[x]) ? 1 : -1;
      }
    }
    return aa.length - bb.length;
  }


