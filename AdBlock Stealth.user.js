// ==UserScript==
// @name         AdBlock Stealth
// @version      2.1.1
// @description  Hide AdBlock from websites
// @author       Dax
// @grant        none
// @match        *://*/*
// @run-at       document-start
// @noframes
// ==/UserScript==

UserJS.inject("minecraft-forum.net", function() { window.ab = false; });

UserJS.inject("cloud-tivu.net", function() {
	UserJS.hide("#blockblockA");
	UserJS.hide("#blockblockA td");
	UserJS.hide("#blockblockA td p");
	UserJS.show("#blockblockB");	
}, true);
	
UserJS.inject("forbes.com", function() {
	UserJS.clearListeners("#navigation");
	UserJS.query(".continue-button", function(element) { element.click(); });
}, true, 500);

UserJS.inject("fosshub.com", function() {
	UserJS.hide(".container iframe[src*='donate']");
}, true, 500);
	
UserJS.inject("freebitcoins4u.co.uk", function() {
	window.canRunAds = false;	
	UserJS.appendElement("DIV", document.documentElement, { "id": "tester" });
	
	UserJS.whenReady(function() {
		window.disableButtonTimer();
		window.startTimer(0);
		setTimeout(function() { UserJS.query("#subbtn input", function(element) { element.value = "Claim Reward!"; }); }, 1000);
	});
});

UserJS.inject("nowdownload.ec", function() {	
	UserJS.whenCreated("SCRIPT", "src", "banner.php", function(element) {
		UserJS.capture(/size=([0-9]+x[0-9]+)/, element.src, function(vsize) { window["v" + vsize] = 1; });
		return true;
	});
});