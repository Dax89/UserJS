// ==UserScript==
// @name         UserJS
// @namespace    http://localhost
// @version      1.8
// @description  Lightweight wrapper around WebAPI
// @author       Dax
// @grant        none
// @match        *://*/*
// @run-at       document-start
// ==/UserScript==

window.UserJSObject = function() {
	this._origcreateelement = { };
	this.domain = window.location.hostname;
	this.html = document.getElementsByTagName("HTML")[0];
};

window.UserJSObject.prototype.redirect = function(url) {
	if(!/^([^:]+):\/\//.test(url))
		url = "https://" + url; // Fallback to HTTPS
	
	window.location.href = url;
};

window.UserJSObject.prototype.path = function(/* arguments */) {
	return this.domain + arguments.join("/");
};

window.UserJSObject.prototype.capture = function(rgx, s, callback, idx) {
	if(typeof callback !== "function") {
		console.error("Invalid callback");
		return null;
	}
	
	if(typeof idx !== "number")
		idx = 1;

	var cap = rgx.exec(s);

	if(!cap) {
		console.error("Invalid capture");
		return null;
	}

	if(!cap[idx]) {
		console.error("Invalid capture at index " + idx);
		return null;
	}

	callback(cap[idx], cap);
};

window.UserJSObject.prototype.inject = function(domain, callback, waitload, interval, repeat) {	
	var domainrgx = new RegExp(domain);

	if(!domainrgx.test(this.domain) || !callback)
		return;

	if(typeof waitload !== "boolean")
		waitload = false;

	if(typeof interval !== "number")
		interval = 0;

	if(typeof repeat !== "boolean")
		repeat = false;

	if(waitload) {
		if(interval) {
			document.addEventListener("DOMContentLoaded", function() { 
				if(repeat) setInterval(callback, interval);
				else setTimeout(callback, interval);
			});

			return;
		}

		document.addEventListener("DOMContentLoaded", callback);
		return;
	}

	callback();
};

window.UserJSObject.prototype.whenClicked = function(selector, callback, autoremove) {
	var icallback = function(clickevent) {
		if(this.isElement(clickevent.target, selector)) {
			if(callback(clickevent.target) === true)
				clickevent.preventDefault();
		}

		if(autoremove === true)
			document.removeEventListener("click", icallback.bind(this), true);
	};

	document.addEventListener("click", icallback.bind(this), true);
};

window.UserJSObject.prototype.whenCreated = function(nodename, property, valuergx, callback) {
	var regexp = (typeof valuergx !== undefined) ? new RegExp(valuergx) : null;
	nodename = nodename.toUpperCase();
	property = property.toUpperCase();

	var observer = new MutationObserver(function(mutations) {
		var done = false;

		for(var i = 0; (done !== true) && (i < mutations.length); i++) {
			var mutation = mutations[i];

			if(mutation.type === "childList") {
				if(mutation.addedNodes.length <= 0)
					continue;

				mutation.addedNodes.forEach(function(n) { 
					if((n.tagName === nodename) && ((typeof property !== undefined) && regexp && regexp.test(n.getAttribute(property)))) {
						done = callback(n) || false;
					}
				});
			}
			else if(mutation.type === "attributes") {
				if((mutation.target.tagName == nodename) && (mutation.attributeName.toUpperCase() === property) && regexp && regexp.test(mutation.target.getAttribute(property)))
					done = callback(mutation.target) || false;
			}
			else
				console.warn("Unhandled mutation type: '" + mutation.type + "'");
		}

		if(done === true)
			observer.disconnect();
	});

	var config = { subtree: true,
				  childList: true,
				  attributes: true,
				  attributeOldValue: true };

	var html = document.getElementsByTagName("HTML")[0];
	observer.observe(html, config);
};	

window.UserJSObject.prototype.injectCSS = function(css) {	
	this.appendElement("STYLE", document.head, { type: "text/css", innerHTML: css });
};

window.UserJSObject.prototype.query = function(selector, cb) {
	var element = document.querySelector(selector);

	if(!element || !cb)
		return;

	cb(element);
};

window.UserJSObject.prototype.disableListeners = function(listeners) {
	if(listeners.length <= 0) {
		console.log("No listener set");
		return;
	}

	var listenerarray = listeners.split("|");

	for(var i = 0; i < listenerarray.length; i++) {
		Object.defineProperty(window, listenerarray[i], { "get": function() { return null; }, 
														 "set": function() { } });
	}
};

window.UserJSObject.prototype.clearListeners = function(selector) {
	this.query(selector, function(element) {
		var cloneelement = element.cloneNode(true);
		element.parentNode.replaceChild(cloneelement, element);
	});
};

window.UserJSObject.prototype.addClass = function(selector, classname) {
	this.query(selector, function(element) {
		element.className = element.className + " " + classname;
	});
};

window.UserJSObject.prototype.replaceClass = function(selector, oldclassname, newclassname) {
	this.query(selector, function(element) {
		element.className = element.className.replace(oldclassname, newclassname);
	});
};

window.UserJSObject.prototype.removeClass = function(selector, classname) {
	this.query(selector, function(element) {
		element.className = element.className.replace(classname, "");
	});
};

window.UserJSObject.prototype.overrideStyle = function(selector, style) {		
	this.query(selector, function(element) {
		element.setAttribute("style", style);
	});
};

window.UserJSObject.prototype.whenReady = function(callback) {
	var icallback = function() { callback(); document.removeEventListener("DOMContentLoaded", icallback); };
	document.addEventListener("DOMContentLoaded", icallback.bind(this));
};

window.UserJSObject.prototype.whenFullScreen = function(callback) {
	var icallback = function() { 
		var fullscreen = false;

		if(document.webkitIsFullScreen)
			fullscreen = document.webkitIsFullScreen;

		if(document.mozFullScreen)
			fullscreen = document.mozFullScreen;

		if(document.msFullscreenElement)
			fullscreen = document.msFullscreenElement !== null;

		callback(fullscreen);
	};

	document.addEventListener("webkitfullscreenchange", icallback.bind(this));
	document.addEventListener("mozfullscreenchange", icallback.bind(this));
	document.addEventListener("MSFullscreenChange", icallback.bind(this));
	document.addEventListener("fullscreenchange", icallback.bind(this));
};

window.UserJSObject.prototype.hide = function(selector) {
	this.overrideStyle(selector, "visibility: invisible !important; display: none !important; padding: 0; margin: 0");
};

window.UserJSObject.prototype.show = function(selector) {
	this.overrideStyle(selector, "visibility: visible !important; display: block !important;");
};

window.UserJSObject.prototype.removeElement = function(selector) {
	this.query(selector, function(element) { element.remove(); });
};

window.UserJSObject.prototype.appendElement = function(tag, where, options, callback) {
	options = options || { };

	var element = document.createElement(tag);

	for(var key in options) {
		if(!options.hasOwnProperty(key))
			continue;

		element[key] = options[key];
	}

	if(typeof callback === "function")
		callback(element);

	where.appendChild(element);
	return element;
};

window.UserJSObject.prototype.isElement = function(element, selector) {
	var parentelement = element.parentElement || document.documentElement;
	var elements = parentelement.querySelectorAll(selector);

	for(var i = 0; i < elements.length; i++) {
		if(element === elements[i])
			return true;
	}

	return false;
};

window.UserJSObject.prototype.ajax = function(type, url, callback, data, header, responsetype) {
	if(typeof callback !== "function") {
		console.error("Invalid callback");
		return;
	}

	var req = new XMLHttpRequest();

	if(typeof header === "object") {
		for(var i = 0; i < header.length; i++)
			req.setRequestHeader(header[i].header, header[i].value);
	}

	if(typeof responsetype === "string")
		req.responseType = responsetype;

	if(typeof data === "string")
		data = data.replace("|", "&");

	req.onreadystatechange = function() {
		if(req.readyState === XMLHttpRequest.DONE) {
			if(typeof responsetype !== "string")
				callback(req.responseText);
			else
				callback(req.responseXML, req.responseText);
		}
	};

	if(type === "GET") {
		if(typeof data === "string")
			req.open(type, url + "?" + data);
		else
			req.open(type, url);

		req.send();
	}
	else if(type === "POST") {
		req.open(type, url);
		req.send(data);
	}
	else
		console.error("AJAX request's type should be POST or GET not '" + type + "'");
};

window.UserJSObject.prototype.get = function(url, callback, data, header, responsetype) {	
	this.ajax("GET", url, callback, data, header, responsetype);
};

window.UserJSObject.prototype.post = function(url, callback, data, header, responsetype) {	
	this.ajax("POST", url, callback, data, header, responsetype);
};

window.UserJSObject.prototype.jsonp = function(url, params, callback) {
	if(typeof callback !== "function") {
		console.error("Invalid callback");
		return;
	}

	var uid = Math.floor(Math.random() * 999999).toString();
	var callbackid = "callback_" + uid;
	var req = url + "?";

	if(typeof params === "string")
		req += params.replace("|", "&"); 

	var e = document.createElement("SCRIPT");
	e.type = "text/javascript";
	e.id = "__jsonp__" + id + "__";
	e.async = 1;

	e.onerror = function(errorevent) { 
		delete window[callbackid];
		document.body.removeChild(e);
		throw new URIError("The script " + errorevent.target.src + " is not accessible.");
	};

	e.src = req + "&callback=" + callbackid;

	window[callbackid] = function(data) {
		delete window[callbackid];
		document.body.removeChild(e);
		callback(data);
	};

	document.body.appendChild(e);
};

window.UserJS = new window.UserJSObject();