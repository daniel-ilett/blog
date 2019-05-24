// looks for the ?darkmode parameter 
// sets global variable darkMode to true or false

const enteredURL = window.location.href;
if (enteredURL.includes('?darkmode')) {
	var darkMode = true; 
	} else {
        var darkMode = false;
    }

// these variables create the URL for switcher in the nav menu 

const darkModeLink = enteredURL + "?darkmode";
const lightModeLink = enteredURL.replace('?darkmode', '');

// loop through links on page to add '?darkmode' to internal links 
	
if (darkMode) {
	document.getElementById('CSS').href="/css/darkmode.css";
	const allLinks = document.getElementsByTagName("a");
	for (let i = 0; i < allLinks.length; i++) {
		if (allLinks[i].href.includes('https://danielilett.com/')
			|| allLinks[i].href.includes('localhost:4000/')) {
			allLinks[i].href = allLinks[i].href + '?darkmode';
		}
    }
}

// it's important for this to come after internal links have '?darkmode' added
// otherwise the switch in the nav menu to turn on light mode won't work!  

	document.getElementById('colorChanger').innerHTML="Light Mode";
	document.getElementById('colorChanger').href=lightModeLink;	
  
// sets nav switcher to allow dark mode to be enabled 

if (darkMode === false) {
	document.getElementById('CSS').href="/css/lightmode.css";
	document.getElementById('colorChanger').innerHTML="Dark Mode";
	document.getElementById('colorChanger').href=darkModeLink;
}

console.log("run")
