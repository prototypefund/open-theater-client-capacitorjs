
/// possible config for detectServer()

[
    {ssid: mythaternetwork, serveruri: myprivatelocalserverURI},
    {ssid: mythaternetwork, serveruri: SERVER_URI},
    {serveruri: SERVER_URI},
    {ssid: mythaternetwork, serveruri: SERVER_URI},
    // {file:./APP_CONFIG/myconfig.json}
]




// example responses to detectServer()



[ 
    { serviceUri: xxxxxxx, serviceType: "text", label:"DE Read" } , 
    { serviceUri: xxxxxxx, serviceType: "video"  label: "DE Sign"},
    { serviceUri: xxxxxxx, serviceType: "video"  label: "EN Sign"} 
]







/// example response to getFileListFromService()


[
    { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
    { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
    { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
    { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
]