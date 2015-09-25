# About #
TinyShock is a very small cross-browser 2D Javascript game engine for use with the HTML5 canvas element.

# Get TinyShock #
Download the latest version from the download tab above, or alternatively get the latest version by checking it out through Mercurial (you must have [Mercurial](http://mercurial.selenic.com/) installed):
```
hg clone https://code.google.com/p/tinyshock
```

# Why TinyShock? #
TinyShock handles things like:
  * Mouse position
  * Keyboard events
  * Image and sound loading
  * Specified Beats-Per-Second.
Without you having to mess with complicated, non-cross-browser code. As an example, look at this standard Javascript code for finding the mouse position:
```
document.getElementById("screen").addEventListener("mousemove", function (event) {
	if (event.offsetX) {
		mouseX = event.offsetX;
		mouseY = event.offsetY;
		return;
	} else if (event.layerX || event.layerY) {
		mouseX = event.layerX;
		mouseY = event.layerY;
	} else if (event.clientX || event.clientY) {
		// Yet another case
		mouseX = event.clientX + document.body.scrollLeft + document.getElementById("screen").scrollLeft;
		mouseY = event.clientY + document.body.scrollTop + document.getElementById("screen").scrollTop;
	}
	console.log("Mouse has moved to "+mouseX+", "+mouseY);
	return;
}, false);
```

As compared to this:
```
console.log("Mouse has a current position of "+TinyShock.mouseX+", "+TinyShock.mouseY);
```

TinyShock has been tested and runs in Chrome, Firefox, and Opera.

# Getting Started #
To start using TinyShock, read through some of the wiki pages. The best one to read first is the PongTutorial, followed by the [draggable object tutorial](http://code.google.com/p/tinyshock/wiki/CreatingADraggableObject) page.

# Example Program #
TinyShock is more of an engine than a library. Here's an example program:

```
function Box() {
	var self = this;
	self.rect = new Rect(0, 0, 50, 50);
	self.update = function() {
		self.rect.x += 1;
		self.rect.y += 1;
	};
	self.processEvent = function(event) {
		if (event.type == "keydown" && event.key == KEY.SPACE) {
			self.rect.x = 0;
			self.rect.y = 0;
		}
	};
	self.draw = function(screen) {
		screen.fill("blue", self.rect);
	};
};

initTS("screen", 640, 480);
var myBox = new Box();
TinyShock.register(myBox);
TinyShock.launch();
```

# Features #
TinyShock currently supports:
  * Surfaces
  * Rects
  * Timing
  * Sound/Music
  * Events (event queues)

Things which are not completed but are planned are:
  * Fonts
  * Some sort of networking support.