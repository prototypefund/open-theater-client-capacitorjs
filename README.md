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

### Webpack

This repo utilizes webpack to built `www/app.js`. So don't freak out if this looks a little bit unreadable. You can find the original app.js at `src/app.js` as well as `src/open-theater.js` which is the adapter script that will be included into app.js to bridge between all hardware and framework APIs and the open-theater client functions. 

To build it, do 

```bash
npm install;
npx webpack;
```

this way `www/app.js` will be build by webpack and webpack will include `open-theater.js` into it.

If you don't like build tools, we understand (we also don't love them): You can also import `open-theater.js` manually into app.js for app.js is included as script of type="module" in ìndex.html. 

If you don't understand what we are talking about, learn about ES6 modules and/or webpack or open an issue. We are also fighting with javascript.
