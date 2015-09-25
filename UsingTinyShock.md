# Introduction #

TinyShock is an object-oriented Javascript engine. You need to know Javascript to use TinyShock.

# Getting Started #

To create a program, create a new function (called `go()`) or something like that. Then set it to run once body has loaded.
```
function go() {
}
```

Now you need to create a canvas tag in the document. You could do this dynamically with Javascript, but I usually do it in the HTML:
```
<html>
	<head>
		<script src="tinyshock.js"></script>
		<script>
			// Your code here
		</script>
	</head>
	<body bgcolor="#000000" onload="go()">
		<canvas id="screen">You need HTML5 to view this page.</canvas>
	</body>
</html>
```

The first command you will need is `initTS()`. `initTS()` takes three arguments:
  * The id of the canvas, in this case "screen".
  * The width of the game.
  * The height of the game.

For example,
```
initTS("screen", 640, 480);
```

Once TinyShock is initialized, you can run the engine with this command:
```
TinyShock.launch();
```

That's all there is to running a blank 640x480 screen. The whole program looks like this now:
```
function go() {
	initTS("screen", 640, 480);
	TinyShock.launch();
}
```

The next step is to add an Actor. Actors are ducktyped classes, which means you define your own class and fill in as few or as many of the functions as you like. For instance, here's a class that implements `update()` and `draw()`:
```
function Ball() {
	var self = this;
	self.rect = new Rect(0, 0, 50, 50);

	self.update = function() {
		this.rect.y += 1;
	};
	self.draw = function(screen) {
		screen.fill("blue", self.rect);
	};
}
```
Here's an example class that doesn't have `update()` or `draw()` methods, but has `isReady()` and `processEvent()` methods.
```
function PianoPlayer() {
	var self = this;
	self.sound = new Sound("piano.wav");

	self.isReady = function() {
		return this.sound.ready;
	};
	self.processEvent = function(event) {
		if (event.type == "keydown") {
			if (event.key == KEY.SPACE) {
				self.sound.play();
			} else if (event.key == KEY.ESCAPE) {
				self.sound.stop();
			}
		}
	};
};
```

The methods which will be called by TinyShock if they exist are:
```
update()
draw(screen)
processEvent(event)
isReady() -> bool
onLaunch()
```

The isReady function has special meaning. If the `isReady()` method of an Actor is defined, the program will not start until it returns true. If it is not defined, the program assumes the Actor is ready.

When all actors are ready, the program calls the `onLaunch()` method of every registered Actor. You can use this like this:

```
function Monster() {
	var self = this;
	self.image = new Surface("monster.bmp");
	self.rect = false;

	self.isReady = function() {
		if (self.image.ready)
			return true;
		else
			return false;
	};
	self.onLaunch = function() {
		self.rect = self.image.getRect();
		self.rect.x = 320;
	};
}
```

The general idea to follow is this:
  * Start loading your resources (images and sounds) in the constructor
  * When the images and sounds are loaded, make `isReady()` return `true`.
  * Position the actor and set up whatever logic is necessary in `onLaunch()`.

An additional bonus of the isReady method: TinyShock will display a loading bar representing how many of the Actors have marked themselves as ready so far when the page is initially loaded.

To register new objects with the TinyShock engine, do something like this:
```
TinyShock.register(new Ball());
```

