# Open-Theater-Client-CapacitorJS

Demo client to display text, video and audio snippets triggered by the ]OPEN THEATER[ API.

Build in as a WebApp in js, HTML, css wrapped with CapacitorJS to deploy as "native" mobile APP on iOS and Android.

Work in Progress

<a href="https://www.bmbf.de/"><img src="https://prototypefund.de/wp-content/uploads/2016/07/logo-bmbf.svg"></a>

via:
<a href="https://www.prototypefund.de/">prototypefund.de</a>

started with code donated by:

<a href="https://www.panthea.com/">panthea.com</a>

____

## Repository Structure

To work with CapacitorJS we use `www/` as our base directory.

`www/index.html` is the entry point which will include `www/app.js`

`www/app.js` is the main script that should include and manage all dependencies. 

The App can be used in 3 ways:

1) as a WebApp to be run in the browser
2) as an App wrapped with CapacitorJS for iOS
3) as an App wrapped with CapacitorJS for Android

we will try to build open-theater.js as a bridge module to be imported into any webapp (in our case `www/app.js`) to keep the open-theater API functions and the API functions of different runtime environments (browser, capacitorjs, other wrappers like Kiosk Wrappers etc.) seperate and modular, yet in a consistent js API to be used inside of the main script (`www/app.js`)