Here's a basic Draggable object implemented in TinyShock:

```
function Draggable(color) {
	var self = this;
	self.rect = new Rect(0, 0, 50, 50);
	self.color = color;
	self.beingDragged = false;
	self.dragPointX = 0;
	self.dragPointY = 0;

	self.update = function() {
		if (self.beingDragged) {
			self.rect.x = TinyShock.mouseX - self.dragPointX;
			self.rect.y = TinyShock.mouseY - self.dragPointY;
		}
	};
	self.processEvent = function(event) {
		if (event.type == "mousedown") {
			if (self.rect.collidePoint([event.mouseX, event.mouseY])) {
				// The mouse has grabbed us.
				self.dragPointX = event.mouseX - self.rect.x;
				self.dragPointY = event.mouseY - self.rect.y;
				self.beingDragged = true;
			} else {
				// It hasn't, so we aren't being dragged.
				self.beingDragged = false;
			}
		} else if (event.type == "mouseup") {
			// Release!
			if (self.beingDragged == true) {
				self.beingDragged = false;
				self.rect.x = event.mouseX - self.dragPointX;
				self.rect.y = event.mouseY - self.dragPointY;
			}
		}
	};
	self.draw = function(screen) {
		screen.fill(self.color, self.rect);
	};
}
```
