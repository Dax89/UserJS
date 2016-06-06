// ==UserScript==
// @name         Ads Killer
// @version      2.5
// @description  Bypass PayWalls, Ads an more
// @author       Dax
// @grant        none
// @run-at       document-start
// @match        *://*/*
// @noframes
// ==/UserScript==

UserJS.inject("adf.ly|ay.gy", function() {
	UserJS.disableListeners("onunload|onbeforeunload");

	UserJS.whenReady(function() {
		UserJS.capture(/var ysmm[ ]*=[ ]*'([^']+)'/, document.documentElement.innerHTML, function(hash) {
			var c = "", z = "";

			for(var i = 0; i < hash.length; i++) {
				if((i % 2) === 0)
					c += hash.charAt(i);
				else
					z = hash.charAt(i) + z;
			}

			var dest = window.atob(c + z);
			window.location.href = dest.substring(dest.length - (dest.length - 2));
		});
	});
});

UserJS.inject("linkshrink.net", function() {
	UserJS.query("div#skip a", function(element) { window.location.href = element.href; });
}, true);

UserJS.inject("shorte.st|sh.st", function() {
	UserJS.capture(/app.options = {([^]+?)};/, document.body.innerHTML, function(options) {
		var optionsobj = eval("({" + options + "})");
		var params = "adSessionId=" + optionsobj.adSessionNotifier.sessionId + "|adbd=1";

		UserJS.jsonp(optionsobj.adSessionNotifier.callbackUrl, params, function(reply) {
			window.location.href = reply.destinationUrl;
		});
	});
}, true, 4000);

UserJS.inject("wikia.com", function() {
	UserJS.whenClicked("a[class*='exitstitial']", function(element) {
		UserJS.redirect(element.href);
		return true;
	});
}, true);

UserJS.inject("quora.com", function() {	
	UserJS.hide("div[id*='signup_wall']");
	UserJS.removeClass("body", "signup_wall_prevent_scroll");
}, true, 1000);

UserJS.inject("pinterest.com", function() {
	UserJS.injectCSS(".UnauthBanner, body > .Modal, .ModalManager > .Modal {display: none !important; } " +
					 ".noScroll { overflow: auto !important; } " + 
					 "div.gridContainer > div, .Grid { height: auto !important; }");

	UserJS.removeClass("html", "noTouch");	
	UserJS.removeElement("div[class='ModalManager Module']");
}, true);

UserJS.inject("listenonrepeat.com", function() {
	UserJS.hide("div[id*='modal-controller-root']");
}, true);

UserJS.inject("facebook.com", function() {
	UserJS.hide("#pagelet_photo_viewer + div");
	UserJS.hide("#headerArea div div");
}, true);

UserJS.inject("igg-games.com", function() {
	UserJS.whenClicked("a[rel='nofollow'][href^='" + window.location.href + "']", function(element) {
		var done = false;
		var href = window.unescape(element.href);
		var lastxurl = href.substr(href.lastIndexOf("xurl="));
		
		UserJS.capture(/xurl=[a-z]*:\/\/(.+)/, lastxurl, function(xurl) {			
			done = true;
			UserJS.redirect(xurl);
		});
				
		return done;
	});
});

UserJS.inject("mpc-g.com", function() {
	UserJS.whenClicked("a[href^='javascript:document.forms']", function(element) {
		var done = false;
		
		UserJS.capture(/javascript\:document\.forms\['([^\']+)'\]\.submit\(\)/, element.href, function(formname) {			
			if((formname.indexOf("download") !== 0) || !document[formname].downloadLink)
				return;
			
			done = true;
			var downloadlink = document[formname].downloadLink;
			UserJS.redirect(downloadlink.value);
		});
				
		return done;
	});
});