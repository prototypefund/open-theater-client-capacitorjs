
import * as openTheater from "./open-theater.js";
window.openTheater = openTheater;
import path from 'path-browserify';
import sanitizeHtml from 'sanitize-html';

console.log("loaded openTheater.js",openTheater);


let context = null;
window.context = context;
try{
    context = JSON.parse( decodeURI( getGetParam("data") ) ); // TODO: replace with openTheater.localStorage

    if (!context.projectUuid || !context.repository || !context.chosenChannels){
        throw("data JSON handed over from provisioning URI broken")
    }
    console.log(context);

    console.log("repository:", context.repository);
    console.log("projectUuid:", context.projectUuid);
    console.log("chosenChannels:", context.chosenChannels);

    main(context);

}
catch{
    alert("error, need channel and projectPath. Will go back to Provisioning.");
    //window.location = "./index.html";
}

function getGetParam(name) {

    let result = null;
    const urlParams = new URLSearchParams(document.location.search);
    result = urlParams.get(name);
    return result;
}

window.getGetParam = getGetParam;



async function main(context){

    openTheater.hideAndroidNavigationBar();

    // Pull Project data and channel data from Disk and repository server

    const repo = await (await fetch(context.repository)).json()
    .catch((err)=>{
        console.error(err);
        alert("error fetching projectList.json from repository. will reload.");
        window.location = "./index.html";
    });
    const project = repo.projects.find((r)=>{return r.projectUuid === context.projectUuid});

    // complete obj required
    const startChannel = project.channelList.find((r)=>{return r.channelUuid === context.chosenChannels[0].channelUuid});

    const chosenChannels = context.chosenChannels;

    clientApp(project,startChannel,chosenChannels);


}






function clientApp(project,startChannel,chosenChannels) {

    console.log("project",project);
    console.log("startChannel",startChannel);


    const triggerEndpoint = project.triggerUri;
    if (startChannel.triggerEndpoint) {
        triggerEndpoint = startChannel.triggerUri;
    }

    
    // actual app

    const socket = io(triggerEndpoint, {
        transport : ['websocket']
    });




    function getRenderer(uri,callback) {

        return fetch(uri)
            .then(response => {
                return response.text()
            })
            .then(data => {
                document.getElementById("opentheaterapp").innerHTML = data;
            });
    }


    function getRendererDynamic(uri,callback) {

        return fetch(uri)
            .then(response => {
                return response.text()
            })
            .then(data => {
                console.log(data);
                const script = document.createElement('script');
                script.innerText = data;
                document.getElementById('dynamicScript').innerText = '';
                document.getElementById('dynamicScript').appendChild(script);
            });
    }



    // this would come in from the provisioning API before DOM is built
    // channelList keys

    let availableChannels = []
    for(let channel of chosenChannels/*project.channelList*/) {

        availableChannels.push({
            "channelUuid": channel.channelUuid,
            "keys": channel.containerIds,
            "label": channel.label
        })
    }

    /*
    availableChannels.push({
        "channelUuid": "d2ec3720-e0d5-42d7-a59e-c7fbcbaf6e3c",
        "renderer": "customRenderer.html",
        "rendererJS": "customRenderer.js",
        "rendererCSS": "customRenderer.css",
        "keys": ["text_de", "video_de", "image_de"], // mandatory (until we know a better way). konvention: renderingMediumType_languagelabel
        "label": "Multimedia Präsentation DE" // mandatory (humans need this)
    });
    */

    console.log('availableChannels',availableChannels);

    let chosenChannel = availableChannels[0];
    buildDefaultContainer();


    // build menu here
    document.getElementById("track-selector").innerHTML = `<select id="channels" onchange="switchChannel(this)">
    ${
        availableChannels.map((channelOption,channelIndex) => {
            return `<option value="${channelIndex}">${channelOption.label}</option>`
        })
        .join("\n")
    }
    </select>`

    renderMSelect();


        
    function renderMSelect(){
        let elems = document.querySelectorAll('select');
        let instances = M.FormSelect.init(elems);
        console.log("MSelect:",instances);
        
    }



    window.updateBatteryStatus = updateBatteryStatus;

    function updateBatteryStatus() {

        let batteryIcon =  'battery_full';
        openTheater.getBattery().then((b) => {

            if(b.charging) {
                batteryIcon =  'battery_charging_full';
            }

            let percentage = 0;
            percentage = Math.round((b.level + Number.EPSILON) * 100)

            document.getElementById('btn-battery').innerHTML = '<i class="material-icons left">'+batteryIcon+'</i>'+percentage+' %</a>'
        })
    }

    window.setInterval(updateBatteryStatus,5000);


    const DOM_btn_size_plus = document.getElementById('size-plus');
    const DOM_btn_size_minus = document.getElementById('size-minus');

    const DOM_btn_color_white = document.getElementById('color-white');
    const DOM_btn_color_yellow = document.getElementById('color-yellow');
    const DOM_btn_color_orange = document.getElementById('color-orange');

    const DOM_opentheater_app = document.getElementById("opentheaterapp");

    DOM_btn_size_plus.addEventListener("click",changeSizePlus);
    DOM_btn_size_minus.addEventListener("click",changeSizeMinus);

    function changeSizePlus(e) {

        let scale_increment = 0.1;
        let fontSize_increment = 2;

        console.log('changeSize', e.target.parentElement)

        let current_scale = Number(DOM_opentheater_app.style.transform.replace(/scale\(|\)/g,''));
        let current_fontSize = parseInt(DOM_opentheater_app.style.fontSize);

        console.log('current_fontSize',current_fontSize);

        if(chosenChannel.keys[0].startsWith('video_')) {
            DOM_opentheater_app.style.transform = 'scale(' + (current_scale + scale_increment) + ')';
        } else {
            DOM_opentheater_app.style.transform = 'scale(1)';
            DOM_opentheater_app.style.fontSize = (current_fontSize + fontSize_increment) + 'px';
        }
        console.log('click', scale_increment, fontSize_increment,e,current_scale);

    }

    function changeSizeMinus(e) {

        let scale_increment = -0.1;
        let fontSize_increment = -2;

        let current_scale = Number(DOM_opentheater_app.style.transform.replace(/scale\(|\)/g,''));
        let current_fontSize = parseInt(DOM_opentheater_app.style.fontSize);

        if(chosenChannel.keys[0].startsWith('video_')) {
            DOM_opentheater_app.style.transform = 'scale(' + (current_scale + scale_increment) + ')';
        } else {
            DOM_opentheater_app.style.transform = 'scale(1)';
            DOM_opentheater_app.style.fontSize = (current_fontSize + fontSize_increment) + 'px';
        }
        console.log('click', scale_increment, fontSize_increment,e,current_scale);

    }

    DOM_btn_color_white.addEventListener("click",(e)=>{
        console.log('color white');
        DOM_opentheater_app.style.color = 'white'        
    });

    DOM_btn_color_yellow.addEventListener("click",(e)=>{
        DOM_opentheater_app.style.color = 'yellow'        
    });

    DOM_btn_color_orange.addEventListener("click",(e)=>{
        DOM_opentheater_app.style.color = 'orange'        
    });

    const DOM_menu = document.getElementById("menu");

    let hideTimeout;

    hideTimeout = window.setTimeout(function() {
        document.body.classList.add('hide-menu');
    },4000)

    function autoHideMenu() {
        console.log('autoHideMenu');
        window.clearTimeout(hideTimeout);
        hideTimeout = window.setTimeout(function() {
            document.body.classList.add('hide-menu');
        },4000)
        document.body.classList.remove('hide-menu');        
    }

    document.body.addEventListener("click",autoHideMenu);
    document.body.addEventListener("mousemove",autoHideMenu);

    document.body.addEventListener("touchend",function() {
        console.log('touchend');
        autoHideMenu();
    });

    function switchChannel(selectObject) {
        chosenChannel = availableChannels[selectObject.value];

        console.log('chosenChannel',chosenChannel);

        if(chosenChannel.renderer) {

            getRenderer("/assets/" + chosenChannel.renderer).then(() => {
                getRendererDynamic("/assets/" + chosenChannel.rendererJS).then(() => {                        
                    displayContentDefault(lastTriggerObj);
                });
                registerAllDraggables();
            });
        }
        else {
            buildDefaultContainer();
            displayContentDefault(lastTriggerObj);
        }

        
    }
    window.switchChannel = switchChannel;


    function buildDefaultContainer() {

        document.getElementById("opentheaterapp").innerHTML = `
        ${chosenChannel.keys.map((key) => {


                if (key.startsWith("text_")) {
                    return `<div id="${key}" class="ot_default ">
                                <div>placeholder ${key}</div>
                            </div>`
                }
                else if (key.startsWith("image_")) {
                    return `<div id="${key}" class="ot_default ">
                                <img alt="" src="">
                            </div>`
                }
                else if (key.startsWith("video_")) {
                    return `<div id="${key}" class="">
                                <video style="width:500px"  alt="" src="" autoplay muted playsinline></video>
                            </div>`
                }
                else if (key.startsWith("audio_")) {
                    return `<div id="${key}" class="">
                                <audio alt="" src="" autoplay ></audio>
                            </div>`
                }
            })
            .join("\n")
                }
        `;
        renderMSelect();
        registerAllDraggables();
    }



    /////////////////////
    // Trigger coming in

    let lastTriggerObj;

    socket.on('displayContent', function (payload) {

        lastTriggerObj = payload;

        if(typeof(displayContent) === "function") {
            displayContentCustom(payload) // dangerous. normally deactivated unless for hand out devices.
        } else {
            displayContentDefault(lastTriggerObj);
        }

    });

    socket.on('disconnect', () => {
        M.toast({html: 'Server disconnected'})
    });

    socket.on("connect", () => {
        M.toast({html: 'Server connected'})
      });


    async function cloneItem(selector) {

        
        // get original element
        let parent = document.getElementById(selector);

        // TODO MAKE NICER AND CHECK IF DIV EXISTS
        let children = parent.children;
        let firstchild  = children[0];


        // make sure you do not already have clone
        for (let child of children) {
            let isClone = (child.getAttribute('data-isclone') == "true");
            if(isClone) {
                child.remove();
            }
        }
        
        // remove animate classes form original
        removeAllAnimateClasses(firstchild);

        // create clone  true = deepClone
        let clone = firstchild.cloneNode(true);

        if(clone.id) {
            // append id with  -clone
            clone.id += '-clone';
        }

        // mark as clone
        clone.setAttribute('data-isclone',"true");

        // clean up element after element is no longer needed
        addCleanUpBinder(clone);

        // add clone one layer original
        parent.prepend(clone);

        return clone;

    }

    function removeAllAnimateClasses(element) {
        if(element.classList) {
            for (let className of element.classList) {
                // animate.style specific
                if(className.indexOf('animate__') > -1) {
                    element.classList.remove(className);
                }
            }
        }
        return true;
    }

    function addCleanUpBinder(element) {

        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/animationend_event
        element.addEventListener('animationend', () => {
            let animationDone = element.classList.contains('animate__animated'); // animate.style specific
            let isClone = (element.getAttribute('data-isclone') == "true");

            // bug as animationend is already triggerd after cloning is perfomed
            // not triggered first time as no animate__animated is present
            console.log('animationend', element, ' isClone', isClone, ' ::: animationDone', animationDone);
                    
            
            if(isClone) {
                console.log('animation done clone')

                
            } else {
                console.log('animation done - not a clone')

                if(element.parentElement) {
                    removeCloneAndRename(element.parentElement.id)
                } else {
                    console.log('ERROR - element is gone already')
                }
                
            }            
        
        });

    }


    function removeCloneAndRename(elementId) {
        // ♥ // protected typo DO NOT REMOVE. evah.

        console.log('removeCloneAndRename', elementId)
        // keep this as a reference as it is gone after element.remove()
        let parent = document.getElementById(elementId);

        if(parent) {

            // remove original element            
            let originals = parent.querySelectorAll('div:not([data-isclone])');
            let clones = parent.querySelectorAll('div[data-isclone]');

            if(originals.length > 0 && clones.length > 0) {
                console.log('originals', originals);
                for (let original of originals) {
                    original.remove();
                }
                for (let clone of clones) {
                    // rename -clone to original
                    if(clone.id) {
                        clone.id = clone.id.replace('-clone','')
                    }
                    // remove data-isclone attribute
                    clone.removeAttribute('data-isclone');
                }
            }
        }
    }


    async function displayContentDefault(payload) {


        console.log('displayContentDefault', 'payload:',payload);

        // REPLACE CONTENT
        if(payload && payload.content) {
            console.log('/// 1. REPLACE CONTENT ///');
            for (let contentBlockId of Object.keys(payload.content)) {

                const blockElement = document.getElementById(contentBlockId);
                
                if (blockElement) {

                    let replaceContent = payload.content[contentBlockId];

                    if (contentBlockId.startsWith("image_") || contentBlockId.startsWith("audio_") || contentBlockId.startsWith("video_")) {
                        if(replaceContent.startsWith('http') === false) {
                            // local file such as 1.mp4
                            let capacitorAssetUriForChannel = await openTheater.getCapacitorAssetUriForChannel(project.projectPath,chosenChannel.channelUuid,replaceContent);                 
                            if(capacitorAssetUriForChannel) {
                                replaceContent = capacitorAssetUriForChannel; // 
                            }
                        }
                    }


                    if (contentBlockId.startsWith("text_")) {
                        let clone = await cloneItem(blockElement.id);
                        // replace \n with br
                        let replaceContentBr = replaceContent.split('\n').join('<br />');
                        // replaceContent needs sanitation!    
                        clone.innerHTML = sanitizeHtml(replaceContentBr);

                    } else if (contentBlockId.startsWith("image_")) {
                        let clone = await cloneItem(blockElement.id);                        
                        clone.setAttribute("src", replaceContent);
                        console.log(clone);                                   
                    }
                    else if (contentBlockId.startsWith("audio_")) {
                        let audioElements = blockElement.children;
                        if(audioElements && audioElements[0]) {
                            
                            audioElements[0].setAttribute("src", replaceContent);
                            audioElements[0].play();                            
                        }
                    }
                    else if (contentBlockId.startsWith("video_")) {
                        console.log('blockElement', blockElement);
                        let videoElements = blockElement.children;
                        console.log('videoElements', videoElements);
                        if(videoElements && videoElements[0]) {
                            videoElements[0].setAttribute("src", replaceContent);
                            videoElements[0].play();
                        }
                    } else if (contentBlockId.startsWith("html_")) {
                        // custom html                        
                        blockElement.innerHTML = sanitizeHtml(replaceContent);
                    }
                } else {
                    console.log(`${contentBlockId} content has no template block avaible to be rendered to`);
                }
            }            
        }





        // APPLY STYLES
        if(payload && payload.styles) {
                        
            console.log('/// 2. APPLY STYLES ///');
            for (let styleSelectorname of Object.keys(payload.styles)) {

                console.log('styleSelectorname', styleSelectorname);

                let styleClassesToAdd = payload.styles[styleSelectorname].classList;
                let inlineStylesToAdd = payload.styles[styleSelectorname].inline;
                
                for (let styleSelector of document.querySelectorAll(styleSelectorname)) {


                    for (let styleClassName of styleClassesToAdd) {
                        styleSelector.classList.add(styleClassName);
                    }

                    for (let styleName of Object.keys(inlineStylesToAdd)) {
                        let styleValue = inlineStylesToAdd[styleName];                        
                        console.log('inlineStyleName: ',styleName, ' inlineStyleValue:', styleValue);                
                        if(typeof(styleSelector.style[styleName]) === "string") {
                            styleSelector.style[styleName] = styleValue;
                        } else {
                            console.error(styleSelectorname, ':::', styleName, 'is not a valid inline style property');
                        }
                    }

                }
            }
            
        }


        

        // APPLY TRANSITIONS
        if(payload && payload.transitions) {
            console.log('/// 3. APPLY TRANSITIONS ///');

            for (let transitionSelectorname of Object.keys(payload.transitions)) {

                let transitions = payload.transitions[transitionSelectorname];
                    
                    if(transitions) {

                        console.log('transitions', transitions);

                        // rename transitionSelectorname to .ot_default
                        if(transitionSelectorname == 'default') {
                            transitionSelectorname = '.ot_default';
                        }


                        for (let transitionSelectorParent of document.querySelectorAll(transitionSelectorname)) {

                            console.log('transitionSelectorParent', transitionSelectorParent);

                            let transitionSelectorChildren = transitionSelectorParent.children;

                            for (let transitionSelectorDOM of transitionSelectorChildren) {

                            if(transitionSelectorDOM) {

                                // only run if element is not a clone
                                // needed as .ot_default is cloned with the element
                                let isClone = (transitionSelectorDOM.getAttribute('data-isclone') == "true");


                                // clean up original element
                                addCleanUpBinder(transitionSelectorDOM);
                            
                                // iterate through classList and check for any existing classes
                                removeAllAnimateClasses(transitionSelectorDOM);

                                console.log('transitionSelectorDOM',transitionSelectorDOM);


                                // FADE IN IS APPLIED ON CLONE
                                if(isClone) {


                                    if(transitions.fadeInTime > -1) {
                                        transitionSelectorDOM.style.setProperty('--animate-duration', transitions.fadeInTime + 'ms');                                            
                                    }

                                    if(transitions.fadeInClass !== 'animate__none') {     
                                        if(transitionSelectorDOM.classList) {                                                    
                                            transitionSelectorDOM.classList.add('animate__animated', transitions.fadeInClass);                                
                                        }
                                    } else {
                                        removeCloneAndRename(transitionSelectorParent.id);
                                    }

                                    if(transitions.fadeInDelay > 0) {                                            
                                        //transitionSelectorDOM.style.setProperty('--animate-delay', transitions.fadeInDelay + 'ms');
                                        transitionSelectorDOM.style.setProperty('--animate-delay', '2s');
                                    }


                                // FADE OUT IS APPLIED ON ORIGINAL
                                } else {


                                    if(transitions.fadeOutTime > -1) {
                                        transitionSelectorDOM.style.setProperty('--animate-duration', transitions.fadeOutTime + 'ms');
                                    }

                                    if(transitions.fadeOutClass !== 'animate__none') {
                                        if(transitionSelectorDOM.classList) {
                                            transitionSelectorDOM.classList.add('animate__animated', transitions.fadeOutClass)
                                        } else {
                                            console.log('COULD NOT ADD ANIMATE CLASS TO ', transitionSelectorDOM);
                                        }
                                    } else {
                                        removeCloneAndRename(transitionSelectorParent.id);
                                    }
                                    
                                    if(transitions.fadeOutDelay > 0) {
                                        transitionSelectorDOM.style.setProperty('--animate-delay', transitions.fadeOutDelay + 'ms');
                                    }

                                    
                            
                                }
                            }
                        }
                    }
                }                

            }

        }





    }

    socket.on('reload-client', function (payload) {
        console.log('reload requested');
        location.reload();
    });






    ////////////////////////
    // Helper functions UI






    //registerAllDraggables();

    function registerAllDraggables(){
        const draggables = document.getElementsByClassName("draggable");
        for (const draggable of draggables){
            makeElementdraggable(draggable);
        }
    }

    function makeElementdraggable(element) {
        let x = 0, y = 0, x2 = 0, y2 = 0, lastTouch = Date.now()
        element.lastTouch = lastTouch;
        
        element.onmousedown = dragMouseDown;
        element.ontouchstart = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            console.log('dragging',e);
            console.log('this',this);

            //this.classList.add('dragging');
            
            if (e.touches){
                x2 = e.touches[0].clientX;
                y2 = e.touches[0].clientY;

                //get doubletaps:
                if (Date.now() - element.lastTouch < 300)
                {
                    console.log("doubletap on",element);
                    
                    return // do sth here with doubletap
                }
                element.lastTouch = Date.now();
            }
            else
            {
                x2 = e.clientX;
                y2 = e.clientY;
            }
            document.onmouseup = deleteMouseListeners;
            document.ontouchend = deleteMouseListeners;

            document.onmousemove = monitorDraggingOfElement;
            document.ontouchmove = monitorDraggingOfElement;
        }

        function deleteMouseListeners() {
            document.onmouseup = null; document.ontouchend = null;
            document.onmousemove = null; document.ontouchmove = null;
        }


        function monitorDraggingOfElement(e) {
            e = e || window.event;
            e.preventDefault();
            console.log('monitorDraggingOfElement',e);

            if (e.touches){
                x = x2 - e.touches[0].clientX;
                y = y2 - e.touches[0].clientY;
                x2 = e.touches[0].clientX;
                y2 = e.touches[0].clientY;
            }
            else{
                x = x2 - e.clientX;
                y = y2 - e.clientY;
                x2 = e.clientX;
                y2 = e.clientY;
            }

           //console.log("dragged to",x,y,x2,y2);
           let newTop = element.offsetTop - y
           let newLeft = element.offsetLeft - x

            let spaceBottom = screen.availHeight - (e.target.offsetTop + e.target.offsetHeight);
           console.log('new top', newTop, 'spaceBottom', spaceBottom);

           if(newTop < 1) {
               newTop = 0;
           }


           let halfItem = e.target.offsetWidth * -1

           if(newLeft < halfItem) {
               newLeft = halfItem
           }

           /*
           if(y > (screen.availHeight)) {
               newTop = screen.availHeight;
           }
           */

            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }

    }

  
}
//*/