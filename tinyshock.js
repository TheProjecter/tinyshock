/***

TinyShock ALPHA

TinyShock is a Javascript engine including support for these modules:
	- Screen
	- Rect
	- Timing
	- Surface
	- Sound
	- Events
These have limited support:
	- Fonts
The following submodules are TODO:
	- Networking

For networking I'll probably end up using node.js or something similar

This program uses a hack for functions referencing their class, borrowed from http://stackoverflow.com/questions/2393901/referring-to-parent-class-properties-and-methods-when-inside-a-class-property-ob

This project's webpage is located here:
http://code.google.com/p/tinyshock/
To obtain the latest version, install mercurial (sudo apt-get install mercurial) and run:
hg clone http://code.google.com/p/tinyshock
A new directory "tinyshock" will be created with the library inside.

This library written by nyrpnz.
http://nyrpnz.blogspot.com/

***/

var verboseLogging = true;
function shockLog(message) { // Custom logging function, can be enabled/disabled with verboseLogging
	if (verboseLogging) {
		console.log("TinyShock: "+message);
	}
};

var KEY = new function() { // Singleton of constants
	/*
		You can generate rough keycodes this way (python script):

		for i in range(0, 126):
			print "t."+chr(i)+" = "+str(i)+";"
	*/
	var t = this;
	t.TAB = 9;
	t.ENTER = 13;
	t.ESCAPE = 27;
	t.SPACE = 32;
	t.LEFT = 37;
	t.UP = 38;
	t.RIGHT = 39;
	t.DOWN = 40;
	t.N_0 = 41;
	t.ASTERISK = 42;
	t.PLUS = 43;
	t.COMMA = 44;
	t.MINUS = 45;
	t.PERIOD = 46;
	t.SLASH = 47;
	t.N_1 = 49;
	t.N_2 = 50;
	t.N_3 = 51;
	t.N_4 = 52;
	t.N_5 = 53;
	t.N_6 = 54;
	t.N_7 = 55;
	t.N_8 = 56;
	t.N_9 = 57;
	t.COLON = 58;
	t.SEMICOLON = 59;
	t.LESSTHAN = 60;
	t.EQUALS = 61;
	t.GREATERTHAN = 62;
	t.QUESTIONMARK = 63;
	t.NP_1 = 97;
	t.NP_2 = 98;
	t.NP_3 = 99;
	t.NP_4 = 100;
	t.NP_5 = 101;
	t.NP_6 = 102;
	t.NP_7 = 103;
	t.NP_8 = 104;
	t.NP_9 = 105;
	t.NUMLOCK = 144;
	t.A = 65;
	t.B = 66;
	t.C = 67;
	t.D = 68;
	t.E = 69;
	t.F = 70;
	t.G = 71;
	t.H = 72;
	t.I = 73;
	t.J = 74;
	t.K = 75;
	t.L = 76;
	t.M = 77;
	t.N = 78;
	t.O = 79;
	t.P = 80;
	t.Q = 81;
	t.R = 82;
	t.S = 83;
	t.T = 84;
	t.U = 85;
	t.V = 86;
	t.W = 87;
	t.X = 88;
	t.Y = 89;
	t.Z = 90;
	t.F1 = 112;
	t.F2 = 113;
	t.F3 = 114;
	t.F4 = 115;
	t.F5 = 116;
	t.F6 = 117;
	t.F7 = 118;
	t.F8 = 119;
	t.F9 = 120;
	t.F10 = 121;
	t.F11 = 122;
	t.F12 = 123;
	t.TILDE = 192;
};

function Rect(sx, sy, sw, sh) {
	var self = this;

	this.x = sx;
	this.y = sy;
	this.w = sw;
	this.h = sh;

	// Convenience functions
	this.collideRect = function(other) {
		if (self.x > other.x + other.w) { return false; }
		if (self.x + self.w < other.x) { return false; }
		if (self.y > other.y + other.h) { return false; }
		if (self.y + self.h < other.y) { return false; }
		return true;
	};
	this.collidePoint = function(point) {
		if (point[0] < self.x) { return false; }
		if (point[0] > self.x + self.w) { return false; }
		if (point[1] < self.y) { return false; }
		if (point[1] > self.y + self.h) { return false; }
		return true;
	};
	this.center = function() {
		return [self.x + (self.w / 2), self.y + (self.h / 2)];
	};
	this.centerX = function() {
		return self.x + self.w / 2;
	};
	this.centerY = function() {
		return self.y + self.h / 2;
	};
	this.topleft = function() { return [self.x, self.y]; };
	this.bottomleft = function() { return [self.x, self.y + self.h]; };
	this.topright = function() { return [self.x + self.w, self.y]; };
	this.bottomright = function() { return [self.x + self.w, self.y + self.x]; };

	this.right = function() { return self.x + self.w; };
	this.bottom = function() { return self.y + self.h; };

	this.move = function(xOffset, yOffset) { return new Rect(self.x + xOffset, self.y + yOffset, self.w, self.h); };
	this.moveIP = function(xOffset, yOffset) { self.x += xOffset; self.y += yOffset; return self; };
}
function Surface(object, width, height) {
// First argument is either a canvas, a resolution, or a filename
// Width/height are optional if a canvas or a filename
	shockLog("Adding new Surface. "+object);
	var self = this;
	this.canvas = false;
	this.context = false;
	this.ready = false;

	// Setup canvas/context
	if (object == false) { // If the arguments are a resolution...
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		this.fromImage = false;
		this.context = this.canvas.getContext("2d");
		this.ready = true;
	} else if (object.width) { // If the first argument is a canvas...
		this.canvas = object;
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext("2d");
		this.ready = true;
	} else  if (typeof(object) == "string") { // If the first argument is a filename
		this.image =  new Image();
		this.canvas = document.createElement("canvas");
		this.image.onload = function() {
			self.canvas.width = self.image.width;
			self.canvas.height = self.image.height;
			self.context = self.canvas.getContext("2d");
			self.context.drawImage(self.image, 0, 0);
			self.ready = true;
		};
		this.image.src = object;
	}

	this.blit = function(surface, dest, src) {
		if (src) {
			if (self.getRect().collideRect(dest))
			{
				self.context.drawImage(surface.canvas, src.x, src.y, src.w, src.h, dest.x, dest.y, dest.w, dest.h);
			}
		} else {
			if (self.getRect().collideRect(dest)) {
				self.context.drawImage(surface.canvas, 0, 0, dest.w, dest.h, dest.x, dest.y, dest.w, dest.h);
			}
		}
	};
	this.getWidth = function() {
		return self.canvas.width;
	};
	this.getHeight = function() {
		return self.canvas.height;
	};
	this.stretchedBlit = function(surface, dest) { // TODO: Does not support a src argument
		self.context.drawImage(surface.canvas, dest.x, dest.y, dest.w, dest.h);
	};
	this.fill = function(color, rect) {
		self.context.fillStyle = color;
		self.context.fillRect(rect.x, rect.y, rect.w, rect.h);
		self.context.fill();
	};
	this.getRect = function() {
		return new Rect(0, 0, self.canvas.width, self.canvas.height);
	};
}

function Event(type) { // Will be recieved by processEvent functions of eventListeners
	var self = this;
	this.type = type;
	this.key = false;
	this.mouseX = false;
	this.mouseY = false;
}

function Sound(target) { // TinyShock wrapper around the HTML5 Audio tag
	var self = this;
	this.ready = false;
	if (typeof(target) == "string") {
		shockLog("Adding new Sound from file ["+target+"]");
		this.audio = new Audio();
		this.audio.onload = function() {
			self.ready = true;
		};
		this.audio.src = target;
	} else {
		shockLog("Adding new Sound from existing Audio object "+target);
		this.audio = target;
		this.ready = true;
	}

	this.play = function() {
		self.audio.play();
	};
	this.pause = function() {
		self.audio.pause();
	};
	this.stop = function() {
		self.audio.pause();
		self.audio.currentTime = 0;
	};
	this.seek = function(where) {
		self.audio.currentTime = where;
	};
	this.enableLooping = function() {
		self.audio.loop = "loop";
	};
	this.disableLooping = function() {
		self.audio.loop = "";
	};
}

var TinyShock; // Singleton
function initTS(screenid, scr_w, scr_h, flags) // TODO: No flags exist yet!
{
	TinyShock = new function() {
		shockLog("Building application.");
		var self = this;
		this.screen = new Surface(document.getElementById(screenid));
		this.screen.canvas.width = scr_w;
		this.screen.canvas.height = scr_h;
		this.rect = this.screen.getRect();
		this.millisecondsPerFrame = 30;
		this.clearEveryFrame = true;
		this.clearColor = "white"; // TODO: A better method screen clearing.

		this.mouseX = 0;
		this.mouseY = 0;

		this.actors = [];
		this.eventListeners = [];

		this.eventQueue = [];

		this.allReady = false;

		this.screen.canvas.addEventListener("mousedown", function (event) {
			var newEvent = new Event("mousedown");
			newEvent.mouseX = self.mouseX;
			newEvent.mouseY = self.mouseY;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		this.screen.canvas.addEventListener("mouseup", function (event) {
			var newEvent = new Event("mouseup");
			newEvent.mouseX = self.mouseX;
			newEvent.mouseY = self.mouseY;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		this.screen.canvas.addEventListener("mousemove", function (event) {
			// Works great in Chrome and Opera....
			if (event.offsetX) {
				TinyShock.mouseX = event.offsetX;
				TinyShock.mouseY = event.offsetY;
				return;
			} else if (event.pageX || event.pageY) {
				// Firefox.... y u no match others?
				posx = event.pageX;
				posy = event.pageY;
			} else if (event.clientX || event.clientY) {
				posx = event.clientX + document.body.scrollLeft + TinyShock.screen.canvas.scrollLeft;
				posy = event.clientY + document.body.scrollTop + TinyShock.screen.canvas.scrollTop;
			}
			return;
		}, false);
		document.addEventListener("keydown", function (event) {
			var newEvent = new Event("keydown");
			newEvent.key = event.keyCode;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		document.addEventListener("keyup", function (event) {
			var newEvent = new Event("keyup");
			newEvent.key = event.keyCode;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		this.nextEvent = function() {
			if (self.eventQueue.length > 0) {
				return self.eventQueue.pop();
			} else {
				return -1;
			}
		};
		this.register = function(target) {
			self.registerActor(target);
			self.registerEventListener(target);
		};
		this.registerActor = function(actor) {
			self.actors.push(actor);
		};
		this.deregisterActor = function(actor) {
			// This function is safe to call multiple times.
			var index = self.actors.indexOf(actor);
			if (index != -1) {
				self.actors.splice(index, 1);
			}
		};
		this.registerEventListener = function(listener) {
			self.eventListeners.push(listener);
		};
		this.setBPS = function(bps) { // Convenience function for computing milliseconds per frame from desired FPS
			self.millisecondsPerFrame = Math.round(1000 / bps);
			shockLog("Setting milliseconds per frame to "+self.millisecondsPerFrame+" ("+bps+" BPS)");
		};
		this.launch = function() {
			var i, j;
			var found;
			self.allObjects = [];
			for (i in self.actors) {
				found = false;
				for (j in self.allObjects) {
					if (self.allObjects[j] == self.actors[i]) {
						found = true;
					}
				}
				if (!found) {
					self.allObjects.push(self.actors[i]);
				}
			};
			for (i in self.eventListeners) {
				found = false;
				for (j in self.allObjects) {
					if (self.allObjects[j] == self.eventListeners[i]) {
						found = true;
					}
				}
				if (!found) {
					self.allObjects.push(self.eventListeners[i]);
				}
			};
			self.frame();
		};
		this.frame = function() {
			var oldtime = new Date().getTime();
			var curtime;
			var i;
			if (self.allReady) {
				var event;

				while (true) {
					event = self.nextEvent();
					if (event == -1) {
						break;
					}
					for (i in self.eventListeners) {
						self.eventListeners[i].processEvent(event);
					}
				}

				if (self.clearEveryFrame) {
					self.screen.fill(self.clearColor, self.screen.getRect());
				}
				for (i in self.actors) {
					self.actors[i].update();
					self.actors[i].draw(self.screen);
				}
			} else {
				self.allReady = true;
				for (i in self.allObjects) {
					if (self.allObjects[i].isReady) {
						if (!self.allObjects[i].isReady()) {
							self.allReady = false;
						}
						break;
					}
				}
				if (self.allReady) {
					shockLog("Loading complete, prepping actors and event listeners.");
					for (i in self.allObjects) {
						if (self.allObjects[i].onLaunch) {
							shockLog("Launching...");
							self.allObjects[i].onLaunch();
						}
					}
				}
			}

			// Execute the next frame after the set number of milliseconds from the beginning of this frame
			curtime = new Date().getTime();
			window.setTimeout(self.frame, self.millisecondsPerFrame - (curtime - oldtime));
		};

		shockLog("Init complete.");
	};
	return TinyShock;
}


