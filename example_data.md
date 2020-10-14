
/// possible config for detectServer()

[
    {ssid: mythaternetwork, serveruri: myprivatelocalserverURI},
    {ssid: mythaternetwork, serveruri: SERVER_URI},
    {serveruri: SERVER_URI},
    {ssid: mythaternetwork, serveruri: SERVER_URI},
    // {file:./APP_CONFIG/myconfig.json}
]




// example responses to detectServer()


// SERVICELIST:

{
    "serviceGroups": [
        {
            "projectPath":["MY INDEPENDENT EXAMPLE PIECE"],
            "channelList":   
            [
                {
                    "triggerUri": "wss://foo.bar",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "text",
                    "label": "DE Read"
                },
                {
                    "triggerUri": "mqtt://foo.bar/service?token={{OPENTHEATER_APP_ID}}",
                    "COMMENT":"{{ }} is not URL safe. what to use instead? // i dont really like the communication here. it seems hacked. Why not ask for data with a specific, clear list param? for example: ?dataNeeded=OPENTHEATER_APP_ID+BATTERY ?I mean: what is this used for? usually for stuff that the server knows that it needs/wants to know, right?",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "video",
                    "label": "DE Sign"
                },
                {
                    "triggerUri": "https://foo.bar",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "video",
                    "label": "EN Sign"
                }
            ]
        },
        {
            "projectPath":["FREIES THEATER FESTIVAL Mannheim","Kammerspiele","Shakespears anderes Stück"],
            "channelList":   
            [
                {
                    "triggerUri": "wss://foo.bar/2",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "text",
                    "label": "DE Untertitel"
                },
                {
                    "triggerUri": "https://foo.bar/2",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "video",
                    "label": "EN Subtitles"
                }
            ]
        }
    ]
      
}







/// example response to getFileListFromService()

{
    files:[
        { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
        { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
        { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
        { filename: xxxxx, filesize: yyyy, lastmodified: ooooooo },
    ]
}