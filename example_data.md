
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
            "projectPath":"MY_INDEPENDENT_EXAMPLE_PIECE",
            "projectLabel":"Anderes Stück",
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
            "projectPath":"FREIES_THEATER_FESTIVAL_Mannheim/Kammerspiele/Shakespears_anderes_Stück",
            "projectLabel":"Anderes Stück",
            "channelList":  
            [
                {
                    "triggerUri": "wss://foo.bar/2",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "text",
                    "label": "Kammerspiele DE Untertitel" // styling allowed
                },
                {
                    "triggerUri": "https://foo.bar/2",
                    "provisioningUri": "xxxxxxx",
                    "channelType": "video",
                    "label": "Kammerspiele EN Subtitles"
                }
            ]
        }
    ]
      
}







/// example response to getFileListFromService()

{
    assetDirectory: "houseOrFestival/projectTitle/" // optional or mandatory?
    "files":[
        { "filepath": "xxxxx", "filesize": "yyyy", "lastmodified": "ooooooo" },
        { "filepath": "xxxxx", "filesize": "yyyy", "lastmodified": "ooooooo" },
        { "filepath": "xxxxx", "filesize": "yyyy", "lastmodified": "ooooooo" },
        { "filepath": "xxxxx", "filesize": "yyyy", "lastmodified": "ooooooo" }
    ]
}