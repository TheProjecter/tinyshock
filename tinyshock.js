/***
 ______   ___
|_  __/  /  _/
 / /    __\ \
/_/     \__/

TinyShock ALPHA

TinyShock is a Javascript game engine.

This project's webpage is located here:
http://code.google.com/p/tinyshock/
You can download new version and read tutorials and reference pages there.

To obtain the latest development commit, install mercurial (sudo apt-get install mercurial) and run:
hg clone http://code.google.com/p/tinyshock

A new directory "tinyshock" will be created with the library inside.

This library written by nyrpnz.
http://nyrpnz.blogspot.com/


This program uses a hack for functions referencing their class, borrowed from http://stackoverflow.com/questions/2393901/referring-to-parent-class-properties-and-methods-when-inside-a-class-property-ob

***/

var verboseLogging = true;
function shockLog(message) { // Custom logging function, can be enabled/disabled with verboseLogging
	if (verboseLogging) {
		console.log("TinyShock: "+message);
	}
};

var KEYDOWN = "keydown";
var KEYUP = "keyup";
var MOUSEMOVE = "mousemove";
var MOUSEDOWN = "mousedown";
var MOUSEUP = "mouseup";

var KEY = new function() { // Singleton of constants
	var t = this;
	t.TAB = 9;
	t.ENTER = 13;
	t.ESCAPE = 27;
	t.SPACE = 32;
	// Arrow keys
	t.LEFT = 37; t.UP = 38; t.RIGHT = 39; t.DOWN = 40;
	t.N_0 = 41;
	// Numpad operators
	t.ASTERISK = 42; t.PLUS = 43; t.COMMA = 44; t.MINUS = 45; t.PERIOD = 46; t.SLASH = 47;
	// Numbers
	t.N_1=49;t.N_2=50;t.N_3=51;t.N_4=52;t.N_5=53;t.N_6=54;t.N_7=55;t.N_8=56;t.N_9=57;
	t.COLON = 58;
	t.SEMICOLON = 59;
	// Comparison operators
	t.LESSTHAN = 60; t.EQUALS = 61; t.GREATERTHAN = 62;
	t.QUESTIONMARK = 63;
	// Number Pad
	t.NP_1=97;t.NP_2=98;t.NP_3=99;t.NP_4=100;t.NP_5=101;t.NP_6=102;t.NP_7=103;t.NP_8=104;t.NP_9=105;
	t.NUMLOCK = 144;
	// Letters
	t.A=65;t.B=66;t.C=67;t.D=68;t.E=69;t.F=70;t.G=71;t.H=72;t.I=73;t.J=74;t.K=75;t.L=76;t.M=77;t.N=78;
	t.O=79;t.P=80;t.Q=81;t.R=82;t.S=83;t.T=84;t.U=85;t.V=86;t.W=87;t.X=88;t.Y=89;t.Z=90;
	// Function keys
	t.F1=112;t.F2=113;t.F3=114;t.F4=115;t.F5=116;t.F6=117;t.F7=118;t.F8=119;t.F9=120;t.F10=121;t.F11=122;t.F12=123;
	t.TILDE = 192;
};

function Rect(sx, sy, sw, sh) {
	var self = this;

	self.x = sx;
	self.y = sy;
	self.w = sw;
	self.h = sh;

	// Convenience functions
	self.copy = function() {
		return new Rect(self.x, self.y, self.w, self.h);
	};
	self.collideRect = function(other) {
		if (self.x > other.x + other.w) { return false; }
		if (self.x + self.w < other.x) { return false; }
		if (self.y > other.y + other.h) { return false; }
		if (self.y + self.h < other.y) { return false; }
		return true;
	};
	self.collidePoint = function(point) {
		if (point[0] < self.x) { return false; }
		if (point[0] > self.x + self.w) { return false; }
		if (point[1] < self.y) { return false; }
		if (point[1] > self.y + self.h) { return false; }
		return true;
	};
	self.inflate = function(ix, iy) {
		return new Rect(self.x - ix, self.y - iy, self.w + ix, self.h + iy);
	};
	self.inflateIP = function(ix, iy) {
		self.x -= ix;
		self.w += ix;
		self.y -= iy;
		self.h += iy;
	};
	self.center = function() {
		return [self.x + (self.w / 2), self.y + (self.h / 2)];
	};
	self.centerX = function() {
		return self.x + self.w / 2;
	};
	self.centerY = function() {
		return self.y + self.h / 2;
	};
	self.topleft = function() { return [self.x, self.y]; };
	self.bottomleft = function() { return [self.x, self.y + self.h]; };
	self.topright = function() { return [self.x + self.w, self.y]; };
	self.bottomright = function() { return [self.x + self.w, self.y + self.x]; };

	self.right = function() { return self.x + self.w; };
	self.bottom = function() { return self.y + self.h; };

	self.move = function(xOffset, yOffset) { return new Rect(self.x + xOffset, self.y + yOffset, self.w, self.h); };
	self.moveIP = function(xOffset, yOffset) { self.x += xOffset; self.y += yOffset; return self; };
}
function Surface(object, width, height) {
// First argument is either a canvas, a resolution, or a filename
// Width/height are optional if a canvas or a filename
	var self = this;
	self.canvas = false;
	self.context = false;
	self.ready = false;
	self.currentFont = "20pt sans-serif";

	// Setup canvas/context
	if (object == false) { // If the arguments are a resolution...
		shockLog("Adding new Surface from resolution ["+width+", "+height+"].");
		self.canvas = document.createElement("canvas");
		self.canvas.width = width;
		self.canvas.height = height;
		self.fromImage = false;
		self.context = self.canvas.getContext("2d");
		self.ready = true;
	} else if (object.width) { // If the first argument is a canvas...
		shockLog("Adding new Surface from existing HTML Canvas.");
		self.canvas = object;
		self.canvas.width = width;
		self.canvas.height = height;
		self.context = self.canvas.getContext("2d");
		self.ready = true;
	} else  if (typeof(object) == "string") { // If the first argument is a filename
		shockLog("Adding new Surface from file ["+object+"].");
		self.image =  new Image();
		self.canvas = document.createElement("canvas");
		self.image.onload = function() {
			self.canvas.width = self.image.width;
			self.canvas.height = self.image.height;
			self.context = self.canvas.getContext("2d");
			self.context.drawImage(self.image, 0, 0);
			self.ready = true;
		};
		self.image.src = object;
	}

	self.blit = function(surface, dest, src) {
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
	self.setFont = function(font) {
		self.currentFont = font;
	};
	self.drawText = function(text, color, textX, textY) {
		self.context.font = self.currentFont;
		self.context.fillStyle = color;
		self.context.fillText(text, textX, textY);
	};
	self.drawCenteredText = function(text, color) {
		var oldAlign = self.context.textAlign;
		self.context.font = self.currentFont;
		self.context.textAlign = "center";
		self.context.fillStyle = color;
		self.context.fillText(text, self.getWidth() / 2, self.getHeight() / 2);
		self.context.textAlign = oldAlign;
	};
	self.getWidth = function() {
		return self.canvas.width;
	};
	self.getHeight = function() {
		return self.canvas.height;
	};
	self.stretchedBlit = function(surface, dest) { // TODO: Does not support a src argument
		self.context.drawImage(surface.canvas, dest.x, dest.y, dest.w, dest.h);
	};
	self.fill = function(color, rect) {
		self.context.fillStyle = color;
		self.context.fillRect(rect.x, rect.y, rect.w, rect.h);
		self.context.fill();
	};
	self.getRect = function() {
		return new Rect(0, 0, self.canvas.width, self.canvas.height);
	};
}

function Event(type) { // Will be recieved by processEvent functions of actors
	var self = this;
	self.type = type;
	self.key = false;
	self.mouseX = false;
	self.mouseY = false;
}

function Sound(target) { // TinyShock wrapper around the HTML5 Audio tag
	var self = this;
	self.ready = false;

	if (typeof(target) == "string") {
		shockLog("Adding new Sound from file ["+target+"]");
		self.audio = new Audio();

		self.audio.addEventListener('loadedmetadata', function() { self.ready = true; }, false);
		self.audio.src = target;
	} else {
		shockLog("Adding new Sound from existing Audio object "+target);
		self.audio = target;
		self.ready = true;
	}

	self.play = function() {
		self.audio.play();
	};
	self.pause = function() {
		self.audio.pause();
	};
	self.stop = function() {
		self.audio.pause();
		self.audio.currentTime = 0;
	};
	self.seek = function(where) {
		self.audio.currentTime = where;
	};
	self.enableLooping = function() {
		self.audio.loop = "loop";
	};
	self.disableLooping = function() {
		self.audio.loop = "";
	};
}

var TinyShock; // Singleton
function initTS(screenid, scr_w, scr_h, flags) // TODO: No flags exist yet!
{
	TinyShock = new function() {
		shockLog("Building application.");
		var self = this;
		self.screen = new Surface(document.getElementById(screenid));
		self.screen.canvas.width = scr_w;
		self.screen.canvas.height = scr_h;
		self.rect = self.screen.getRect();
		self.millisecondsPerFrame = 30;

		// Screen clearing for the lazy
		self.clearEveryFrame = false;
		self.clearColor = "white";

		self.mouseX = 0;
		self.mouseY = 0;

		self.actors = [];
		self.eventQueue = [];
		self.allReady = false;

		self.screen.canvas.addEventListener("mousedown", function (event) {
			var newEvent = new Event(MOUSEDOWN);
			newEvent.mouseX = self.mouseX;
			newEvent.mouseY = self.mouseY;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		self.screen.canvas.addEventListener("mouseup", function (event) {
			var newEvent = new Event(MOUSEUP);
			newEvent.mouseX = self.mouseX;
			newEvent.mouseY = self.mouseY;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		self.screen.canvas.addEventListener("mousemove", function (event) {
			if (event.offsetX) {
				TinyShock.mouseX = event.offsetX;
				TinyShock.mouseY = event.offsetY;
				return;
			} else if (event.pageX || event.pageY) {
				TinyShock.mouseX = event.pageX;
				TinyShock.mouseY = event.pageY;
			} else if (event.clientX || event.clientY) {
				TinyShock.mouseX = event.clientX + document.body.scrollLeft + TinyShock.screen.canvas.scrollLeft;
				TinyShock.mouseY = event.clientY + document.body.scrollTop + TinyShock.screen.canvas.scrollTop;
			}
			return;
		}, false);
		document.addEventListener("keydown", function (event) {
			var newEvent = new Event(KEYDOWN);
			newEvent.key = event.keyCode;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		document.addEventListener("keyup", function (event) {
			var newEvent = new Event(KEYUP);
			newEvent.key = event.keyCode;
			TinyShock.eventQueue.push(newEvent);
		}, false);

		self.nextEvent = function() {
			if (self.eventQueue.length > 0) {
				return self.eventQueue.pop();
			} else {
				return -1;
			}
		};
		self.register = function(target) {
			self.registerActor(target);
			self.registerEventListener(target);
		};
		self.register = function(actor) {
			self.actors.push(actor);
		};
		self.deregister = function(actor) {
			// This function is safe to call multiple times.
			var index = self.actors.indexOf(actor);
			if (index != -1) {
				self.actors.splice(index, 1);
			}
		};
		self.setBPS = function(bps) { // Convenience function for computing milliseconds per frame from desired FPS
			self.millisecondsPerFrame = Math.round(1000 / bps);
			shockLog("Setting milliseconds per frame to "+self.millisecondsPerFrame+" ("+bps+" BPS)");
		};
		self.launch = function() {
			var i, j;
			var found;
			self.frame();
		};
		self.frame = function() {
			var oldtime = new Date().getTime();
			var curtime;
			var i;
			if (self.allReady) {
				var event;

				// Loop through events
				while (true) {
					event = self.nextEvent();
					if (event == -1) {
						break;
					}
					for (i in self.actors) {
						if (self.actors[i].processEvent) {
							self.actors[i].processEvent(event);
						}
					}
				}

				if (self.clearEveryFrame) {
					self.screen.fill(self.clearColor, self.screen.getRect());
				}
				for (i in self.actors) {
					if (self.actors[i].update) {
						self.actors[i].update();
					}
					if (self.actors[i].draw) {
						self.actors[i].draw(self.screen);
					}
				}
			} else {
				var numReady = 0;
				for (i in self.actors) {
					if (self.actors[i].isReady) {
						if (self.actors[i].isReady()) {
							numReady += 1;
						}
					} else {
						numReady += 1;
					}
				}
				self.screen.fill("black", self.screen.getRect());
				self.screen.drawCenteredText("Loading...", "white");

				if (numReady > 0) { // Prevent divide-by-0 problems
					self.screen.fill("green", new Rect(0, self.screen.getRect().bottom() - 50, self.screen.getWidth() * (numReady / self.actors.length), 25));
				}
				if (numReady == self.actors.length) {
					self.screen.fill("black", self.screen.getRect());
					self.allReady = true;
					self.screen.drawCenteredText("Launching...", "white");
					for (i in self.actors) {
						if (self.actors[i].onLaunch) {
							self.actors[i].onLaunch();
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


