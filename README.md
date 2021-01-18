# Open-Theater-Client-CapacitorJS

Demo client to display text, video and audio snippets triggered by the ]OPEN THEATER[ API.

Build in as a WebApp in js, HTML, css wrapped with CapacitorJS to deploy as "native" mobile APP on iOS and Android.

Work in Progress

<a href="https://www.bmbf.de/"><img src="https://prototypefund.de/wp-content/uploads/2016/07/logo-bmbf.svg"></a>

via:
<a href="https://www.prototypefund.de/">prototypefund.de</a>

started with code donated by:

<a href="https://www.panthea.com/">panthea.com</a>

## API documentation

The software in this repository is the demo software presenting the (mainly) JSON and HTTP API defined and described at

____

## Repository Structure

To work with CapacitorJS we use `www/` as our base directory.

`www/index.html` is the entry point which will include `www/app.js`

`www/app.js` is the main script that should include and manage all dependencies. 

The App can be used in 3 ways:

1) as a WebApp to be run in the browser (ATTENTION: broken atm for all things provisioning for large file chaching on disk not possible in the browser, plan is to keep it this way and make trigger Client work in web midterm.)
2) as an App wrapped with CapacitorJS for iOS
3) as an App wrapped with CapacitorJS for Android

we will try to build open-theater.js as a bridge module to be imported into any webapp (in our case `www/app.js`) to keep the open-theater API functions and the API functions of different runtime environments (browser, capacitorjs, other wrappers like Kiosk Wrappers etc.) seperate and modular, yet in a consistent js API to be used inside of the main script (`www/app.js`)

`/ios` and `/android` contain all data needed for XCode and Android Studio to build native apps. all contents

normally that should not be touched by you other than to change icons, splashscreens and to build the apps but there a few exceptions:

`android/app/src/main/java/de/open_theater/client/MainActivity.java` contains some the bridge API between this webapp and the native android APIs.

`android/app/src/main/AndroidManifest.xml` contains some references to network security configuration which furthermore is defined in
`android/app/src/main/res/xml/network_security_config.xml` where inside all cleartext (aka non TLS/SSL encrypted) network connections are whitelisted. In case you have a local testing fileserver you must add an entry. Otherwise `localhost` is allowed to be in cleartext for the <a href="https://github.com/diachedelic/capacitor-blob-writer">capacitor-blob-writer plugin</a>. for more information see the plugin's readme and <a href="https://github.com/diachedelic/capacitor-blob-writer/issues/20">this</a> issue.
More information about netword_security_config on the <a href="https://developer.android.com/training/articles/security-config">officical android documentation</a>

### Webpack

This repo utilizes webpack to built `www/app.js`. So don't freak out if this looks a little bit unreadable. You can find the original app.js at `src/app.js` as well as `src/open-theater.js` which is the adapter script that will be included into app.js to bridge between all hardware and framework APIs and the open-theater client functions. 

To build it, open a terminal window, navigate to the root directory of this repository and do: 

```bash
npm install;
npm build;
```

this way `www/app.js` will be build by webpack and webpack will include `open-theater.js` into it.

If you don't like build tools, we understand (we also don't love them): You can also import `open-theater.js` manually as ES6 module into app.js for app.js is included as script of type="module" in ìndex.html.

If you don't understand what we are talking about, learn about ES6 modules and/or webpack or open an issue. We are also fighting with javascript fatique, so we understand.


### Dependencies

this particular demo client works with CapacitorJS as wrapper around the javascript functions and HTML

in order to create ios and android specific projects, after the above installation process do

```bash
npx cap add ios;
npx cap open ios;
npx cap add android;
npx cap open;
```

this will create and open the Android Studio (needs to be installed) and XCode (needs to be installed) projects.

`npm run build` will internally not just do the webpack build, but also call `npx update` which will keep the Android Studio and XCode Projects up-to-date with all changes made inside the javascript and HTML files


## icons & Splashscreens iOS

please change the icon-set if you build your version. You find instructions how to change icons and splashscreens on iOS & Android in capacitorJS on the web, for example here (although the link provided to make the icon sets requires giving them data, so maybe just follow the instructions and create your icons elsewhere): https://www.joshmorony.com/adding-icons-splash-screens-launch-images-to-capacitor-projects/