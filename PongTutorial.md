# Introduction #

This is a step-by-step tutorial on writing the computer game Pong in TinyShock. You can play the completed game by cloning the repository and opening `examples/pong.html` in Firefox or Chrome (or another browser with HTML5 support).

# Structure #

Our Pong program is going to have three Actors:
  * A red player-controlled paddle.
  * A blue computer-controlled paddle.
  * A green ball.

For simplicity we'll declare these classes as singletons. Here is a class definition for the ball:
```
var ball = new function() {
	var self = this;
	self.mov_x = 2;
	self.mov_y = 1;

	self.onLaunch = function() {
		self.rect = new Rect(TinyShock.screen.getWidth() / 2, TinyShock.screen.getHeight() / 2, 10, 10);
	};
	self.update = function() {
		var estimated = self.rect.move(self.mov_x, 0); // Estimated position after X movement
		if (leftPaddle.rect.collideRect(estimated) || rightPaddle.rect.collideRect(estimated)) {
			self.mov_x *= -1;
		}
		estimated = self.rect.move(0, self.mov_y); // Estimated position after Y movement
		if (estimated.y < 0) {
			self.mov_y *= -1;
		} else if (estimated.bottom() > TinyShock.screen.getHeight()) {
			self.mov_y *= -1;
		}

		self.rect.moveIP(self.mov_x, self.mov_y);
	};
	self.draw = function(screen) {
		screen.fill("green", self.rect);
	};
};
```
This class is pretty straightforward. When the game is launched, the rectangle representing the ball is positioned. Why wait until launch? Because we are using `TinyShock.screen` to position the rect, and the `TinyShock` singleton is not set up until `initTS()` has been called. Never make a reference to `TinyShock` before the initialization has completed.

Every frame, the estimated position is calculated, first X, then Y. If the estimated X position collides with a paddle, the X velocity is reversed, to simulate a bounce. If the estimated Y position colides with the bottom or top of the screen, the Y velocity is reversed. This is handled in the `update()` function.

Lastly, the draw function fills the screen with green, but just at the rectangle representing the ball.

Next we create the player-controlled paddle:
```
var leftPaddle = new function() {
	var self = this;
	self.speed = 0;
	self.rect = new Rect(10, 10, 15, 70);

	self.update = function() {
		self.rect.y += self.speed;
		return;
	};

	self.processEvent = function(event) {
		if (event.type == "keydown") {
			if (event.key == KEY.DOWN) {
				self.speed = 2;
			} else if (event.key == KEY.UP) {
				self.speed = -2;
			}
		} else if (event.type == "keyup") {
			if (event.key == KEY.DOWN && self.speed == 2) {
				self.speed = 0;
			} else if (event.key == KEY.UP && self.speed == -2) {
				self.speed = 0;
			}
		}
	};

	self.draw = function(screen) {
		screen.fill("red", self.rect);
	};
};
```
The main differences from the ball class are:
  * A `processEvent` function is declared, as this object needs to recieve keyboard input.
  * The rectangle is filled with red instead of green in `draw()`.
  * The X velocity of the object is not tracked, because the paddle can only move up and down.

Processing events is pretty straightforward. The Event class in tinyshock.js looks like this:
```
function Event(type) {
	var self = this;
	self.type = type;
	self.key = false;
	self.mouseX = false;
	self.mouseY = false;
}
```
The event type will be a string, and it will be one of these:
  * mousemove
  * mouseup
  * mousedown
  * keyup
  * keydown

If the event is a mouse event, `event.mouseX` and `event.mouseY` will be integers representing the mouseX and mouseY, respectively. If the event is a key event, `event.key` will be a integer representing the key pressed. Part of the tinyshock library is a singleton constant class titled `KEY`, with useful members like these:
```
KEY.SPACE
KEY.UP, KEY.DOWN, KEY.RIGHT, KEY.LEFT
KEY.A, KEY.B, KEY.C... KEY.Z
KEY.ENTER
KEY.ESCAPE
```
For a complete listing, open tinyshock.js. The `KEY` definition is the first thing in the file.

The main point of all this is that objects with `processEvent()` methods will recieve calls with one argument: an event.

Next up: the computer controlled paddle.
```
var rightPaddle = new function() {
	var self = this;

	self.onLaunch = function() {
		self.rect = new Rect(TinyShock.screen.getWidth() - 25, 10, 15, 70);
	};
	self.update = function() {
		if (self.rect.centerY() < ball.rect.centerY()) {
			if (ball.rect.centerY() - self.rect.centerY() < 5) {
				self.rect.y = ball.rect.centerY() - self.rect.h / 2;
			} else {
				self.rect.y += 3;
			}
		} else if (ball.rect.centerY() < self.rect.centerY()) {
			if (ball.rect.centerY() - self.rect.centerY() < 4) {
				self.rect.y = ball.rect.centerY() - self.rect.h / 2;
			} else {
				self.rect.y -= 3;
			}
		}
	};
	self.draw = function(screen) {
		screen.fill("blue", self.rect);
	};
};
```
This class is lacking a processEvent function, because it doesn't need keyboard input. All of the work in this class is done in the `update()` function. The code is a bit complicated, so here's the psuedocode:
```
if we are above the paddle
	and we are within five pixels
		snap directly to it
	otherwise
		move five pixels closer
if we are below the paddle
	and we are within five pixels
		snap directly to it
	otherwise
		move five pixels closer
```

This program uses the rectangle convenience functions `centerX()` and `centerY()`.

Now for the last part of the program, the main loop.
```
function go() {
	initTS("screen", 640, 480);

	TinyShock.clearEveryFrame = true;

	TinyShock.register(leftPaddle);
	TinyShock.register(ball);
	TinyShock.register(rightPaddle);

	TinyShock.setBPS(60);

	TinyShock.launch();
}
```

The `clearEveryFrame` is a variable which can be set if your game is not very complicated. It causes TinyShock to completely clear and re-render the game every frame. The default value is false, which assumes you are using dirty rects or are clearing the screen yourself. It is fastest to use some sort of optimized clearing method, but in early development this can be handy.

Right before launch we set the desired Beats Per Second (BPS). This program will run no faster than 60 frames per second (although if it is run on a slow computer, it may run at less than 60 BPS). This is a way of making sure the program will run the same on all computers. The default BPS is (very roughly) half that. I tried running the pong demo at the default, and found it too slow, so I upped the BPS.

That's all, thanks for reading.

