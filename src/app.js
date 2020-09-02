/* 
the actual app, handling open-theater-api via open-theater.js as well as
all the UI things and other stuff that you might to customize that has 
nothing to do with the API nor the runtime environment of this app:
*/
import * as openTheater from "./open-theater.js";


console.log("loaded", openTheater);

openTheater.helloWorld();


window.openTheater = openTheater;


// 1. find servers & connect to one

// 2. check if you need to update any data via provisioning API

// 3. wait for user inputs or start of incoming cues via trigger API