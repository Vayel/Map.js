var Map = (function() {
	var ErrorsMsg = {
		container: 'The container must be an existing HTML element reference.',
		image: 'You must specify a data-img attribute for the container.',
		thumbnail: 'The thumbnail must be an existing HTML element reference.'
	};
	
	/*
	* Global functions
	*/
	
	function addEvent(element, event, func) {
		if (element.addEventListener) element.addEventListener(event, func, false);
		else element.attachEvent('on' + event, func);
	}
	
	function setCSS(element, data) {
		for(var i in data) element.style[i] = data[i];
	}
	
	function getCSS(element, prop) {
		return element.style[prop] || getComputedStyle(element, null)[prop] || element.currentStyle[prop];
	}
	
	function getAbsPos(element) {
		// Returns the absolute coordinates of element
		var x = 0, y = 0;
		while(element) {
			x += element.offsetLeft;
			y += element.offsetTop;
			element = element.offsetParent;
		}
		return {x: x, y: y};
	}
	
	function getImgDims(src, callback) {
		var image = new Image();
		image.onload = function(){
			  callback({
				  width: image.width,
				  height: image.height
			  });
		};
		image.src = src;
	}
	
	/*
	* Map's functions
	*/
	
	function obj(data) {
		/*
		* Vars
		*/
		var Elements = {
			container: { div: null, image: null, imageSrc: null },		
			thumbnail: { div: null, imageSrc: null, marker: null }
		};
	
		var mousedown = false;
	
		var Positions = {
			image: { left: 0, top: 0 },
			marker: { left: 0, top: 0 },
			beginning: { left: 0, top: 0 }
		};
	
		var Dimensions = {
			container: {
				div: { width: null, height: null },
				image: { width: null, height: null }
			},
			thumbnail: {
				div: { width: null, height: null },
				marker: { width: null, height: null }
			},
			widthFactor: null,
			heightFactor: null
		};
	
		var maxMovements = {
			image: { left: null, top: null },
			marker: { left: null, top: null }
		};
		
		var Controller = {};
		var View = {};
		
		/*
		*
		* Controller
		*
		*/
		Controller.Measure = {};
		Controller.Measure.dimensions = {
			container: {
				div: function() {
					Dimensions.container.div.width = parseInt(getCSS(Elements.container.div, 'width'));
					Dimensions.container.div.height = parseInt(getCSS(Elements.container.div, 'height'));
				},
				image: function() {
					Dimensions.container.image.width = parseInt(getCSS(Elements.container.image, 'width'));
					Dimensions.container.image.height = parseInt(getCSS(Elements.container.image, 'height'));
				}
			},
			thumbnail: {
				div: function() {
					if(parseInt(getCSS(Elements.thumbnail.div, 'width'))) {
						Dimensions.thumbnail.div.width = parseInt(getCSS(Elements.thumbnail.div, 'width'));
						Dimensions.thumbnail.div.height = Dimensions.container.image.height / (Dimensions.container.image.width / Dimensions.thumbnail.div.width);
					} else {
						Dimensions.thumbnail.div.height = parseInt(getCSS(Elements.thumbnail.div, 'height'));
						Dimensions.thumbnail.div.width = Dimensions.container.image.width / (Dimensions.container.image.height / Dimensions.thumbnail.div.height);
					}
				},
				marker: function() {
					Dimensions.thumbnail.marker.width = Dimensions.thumbnail.div.width * Dimensions.container.div.width / Dimensions.container.image.width;
					Dimensions.thumbnail.marker.height = Dimensions.thumbnail.div.height * Dimensions.container.div.height / Dimensions.container.image.height;
				}
			}
		};
		Controller.Measure.factors = function() {
			// Size factor between image and thumbnail
			Dimensions.widthFactor = Dimensions.container.image.width / Dimensions.thumbnail.div.width;
			Dimensions.heightFactor = Dimensions.container.image.height / Dimensions.thumbnail.div.height;
		};
		Controller.Measure.maxMovements = {
			image: function() {
				maxMovements.image.left = -1 * Dimensions.container.image.width + Dimensions.container.div.width;
				maxMovements.image.top = -1 * Dimensions.container.image.height + Dimensions.container.div.height;
			},
			marker: function() {
				maxMovements.marker.left = Dimensions.thumbnail.div.width - Dimensions.thumbnail.marker.width;
				maxMovements.marker.top = Dimensions.thumbnail.div.height - Dimensions.thumbnail.marker.height;
			}
		};
	
		Controller.Events = {};
		Controller.Events.container = {
			add: function() {
				var mouseCoords = {
					x: 0, y: 0,
					beginning: { x: 0, y: 0 }
				};
				
				// Mousedown
				addEvent(Elements.container.div, 'mousedown', function(e) {
					var e = window.event || e;
					e.preventDefault();
					mousedown = true;
				
					Elements.container.div.style.cursor = 'move';
				
					Positions.beginning.left = Positions.image.left; 
					Positions.beginning.top = Positions.image.top;
				
					mouseCoords.beginning.x = e.clientX;
					mouseCoords.beginning.y = e.clientY;
				});
			
				// Mousemove
				addEvent(Elements.container.div, 'mousemove', function(e) {
					if (mousedown) {
						var e = window.event || e;
					
						mouseCoords.x = e.clientX;
						mouseCoords.y = e.clientY;
					
						var xDelta = mouseCoords.x - mouseCoords.beginning.x,
							yDelta = mouseCoords.y - mouseCoords.beginning.y;
					
						Positions.image.left = Positions.beginning.left + xDelta;
						Positions.image.top = Positions.beginning.top + yDelta;
					
						Controller.Move.fromImage();
					}
				});
			
				function end() {
					mousedown = false;
					Elements.container.div.style.cursor = 'default';
				}
			
				addEvent(Elements.container.div, 'mouseout', end);
				addEvent(Elements.container.div, 'mouseup', end);
			
				// Keydown
				addEvent(document.querySelector('body'), 'keypress', function(e) {
					var e = window.event || e,
						key = e.keyCode;
				
					switch(key) {
						case 37: // left arrow
							Positions.image.left += Dimensions.container.div.width/2;
						break;
						case 38: // top arrow
							Positions.image.top += Dimensions.container.div.height/2;
						break;
						case 39: // right arrow
							Positions.image.left -= Dimensions.container.div.width/2;
						break;
						case 40: // bottom arrow
							Positions.image.top -= Dimensions.container.div.height/2;
						break;
					}
					Controller.Move.fromImage();
				});		
			},
			remove: function() {}
		};
		Controller.Events.thumbnail = {
			add: function() {
				var mouseCoords = {
					x: 0, y: 0,
					beginning: { x: 0, y: 0 }
				};
			
				// Mousedown
				addEvent(Elements.thumbnail.div, 'mousedown', function(e) {
					var e = window.event || e;
					e.preventDefault();
				
					mousedown = true;
					Elements.thumbnail.div.style.cursor = 'move';
				
					var x = e.clientX,
						y = e.clientY;
				
					x -= getAbsPos(Elements.thumbnail.div).x - (document.documentElement.scrollLeft + document.body.scrollLeft);
					y -= getAbsPos(Elements.thumbnail.div).y - (document.documentElement.scrollTop + document.body.scrollTop);	
				
					Positions.marker.top = y - Dimensions.thumbnail.marker.height/2;
					Positions.marker.left = x - Dimensions.thumbnail.marker.width/2;
				
					Positions.beginning.left = Positions.marker.left; 
					Positions.beginning.top = Positions.marker.top;
				
					mouseCoords.beginning.x = e.clientX;
					mouseCoords.beginning.y = e.clientY;
				
					Controller.Move.fromMarker();
				});
			
				// Mouseup
				addEvent(Elements.thumbnail.div, 'mouseup', function() {
					mousedown = false;
					Elements.thumbnail.div.style.cursor = 'default';
				});
			
				// Mousemove
				addEvent(Elements.thumbnail.div, 'mousemove', function(e) { 
					if (mousedown) {
						var e = window.event || e;
						mouseCoords.x = e.clientX;
						mouseCoords.y = e.clientY;
					
						var xDelta = mouseCoords.x - mouseCoords.beginning.x,
							yDelta = mouseCoords.y - mouseCoords.beginning.y;
					
						Positions.marker.left = Positions.beginning.left + xDelta;
						Positions.marker.top = Positions.beginning.top + yDelta;
					
						Controller.Move.fromMarker();
					}	
				});
			},
			remove: function() {}			
		};
	
		Controller.Move = {};
		Controller.Move.check = {
			position: function() {
				// Image must fill the whole container
				if (Positions.image.left > 0)
					Positions.image.left = 0;
				if (Positions.image.top > 0)
					Positions.image.top = 0;
				if (Positions.image.left < maxMovements.image.left)
					Positions.image.left = maxMovements.image.left;
				if (Positions.image.top < maxMovements.image.top)
					Positions.image.top = maxMovements.image.top;
			
				// Marker must stay in the thumbnail
				if(Elements.thumbnail.div) {
					if (Positions.marker.left > maxMovements.marker.left)
						Positions.marker.left = maxMovements.marker.left;	
					if (Positions.marker.left < 0)
						Positions.marker.left = 0;
					if (Positions.marker.top > maxMovements.marker.top)
						Positions.marker.top = maxMovements.marker.top;	
					if (Positions.marker.top < 0)
						Positions.marker.top = 0;
				}
			}
		};
		Controller.Move.fromImage = function() {
			if(Elements.thumbnail.div) {
				// Marker position from which of image
				Positions.marker.left = -1 * Positions.image.left / Dimensions.widthFactor;
				Positions.marker.top = -1 * Positions.image.top / Dimensions.heightFactor;
			}
			
			Controller.Move.check.position();
			View.move();
		};
		Controller.Move.fromMarker = function() {
			// Image position from which of marker
			Positions.image.top = -1 * Positions.marker.top * Dimensions.heightFactor;	
			Positions.image.left = -1 * Positions.marker.left * Dimensions.widthFactor;	
			
			Controller.Move.check.position();
			View.move();
		};
		Controller.Move.goTo = function(x, y) {
			x = (x < 0) ? 0 : ((x > 100) ? 100 : x);
			y = (y < 0) ? 0 : ((y > 100) ? 100 : y);
	
			// Image
			Positions.image.top = -1 * Dimensions.container.image.height * y / 100;	
			Positions.image.left = -1 * Dimensions.container.image.width * x / 100;
			
			if(Elements.thumbnail.div) {
				// Marker position from which of image
				Positions.marker.left = -1 * Positions.image.left * Dimensions.thumbnail.div.width / Dimensions.container.image.width;
				Positions.marker.top = -1 * Positions.image.top * Dimensions.thumbnail.div.height / Dimensions.container.image.height;
			}
			
			Controller.Move.check.position();
			View.move();
		};
		Controller.Move.center = function(left, top) {
			var x = left - 100 * (Dimensions.container.div.width/2) / Dimensions.container.image.width;	
			var y = top - 100 * (Dimensions.container.div.height/2) / Dimensions.container.image.height;
			
			Controller.Move.goTo(x, y);
		};
		
		/*
		*
		* View
		*
		*/
		View.move = function() {
			setCSS(Elements.container.image, {
				left: Positions.image.left + 'px', 
				top: Positions.image.top + 'px'
			});
			if(Elements.thumbnail.div) {
				setCSS(Elements.thumbnail.marker, {
					left: Positions.marker.left + 'px', 
					top: Positions.marker.top + 'px'
				});
			}
		};
		
		View.addLink = function(data) {
			var left = data.nw[0] * Dimensions.container.image.width / 100,
				top = data.nw[1] * Dimensions.container.image.height / 100;
			var width = (data.se[0] - data.nw[0]) * Dimensions.container.image.width / 100,
				height = (data.se[1] - data.nw[1]) * Dimensions.container.image.height / 100;
			
			var link = document.createElement('a');
			link.setAttribute('href', data.href);
			link.style.display = 'block';
			link.style.width = width + 'px';
			link.style.height = height + 'px';
			link.style.position = 'absolute';
			link.style.left = left + 'px';
			link.style.top = top + 'px';
			
			Elements.container.image.appendChild(link);
		};
		
		View.display = function() {
			Elements.container.div.style.overflow = 'hidden';
			Elements.container.image.style.position = 'relative';
			
			if(Elements.thumbnail.div) {
				setCSS(Elements.thumbnail.marker, { 
					position: 'relative',
					overflow: 'hidden',
					left: Positions.marker.left + 'px', 
					top: Positions.marker.top + 'px', 
					width: Dimensions.thumbnail.marker.width + 'px',
					height: Dimensions.thumbnail.marker.height + 'px'
				});
				setCSS(Elements.thumbnail.div, { 
					background: 'url("' + Elements.thumbnail.imageSrc + '")',
					backgroundSize: '100% 100%',
					overflow: 'hidden',
					width: Dimensions.thumbnail.div.width + 'px',
					height: Dimensions.thumbnail.div.height + 'px'
				});
			}
			
			data.cb();
		};
		
		/*
		*
		* Initialization
		*
		*/
		Elements.container.div = data.container.div;
		Elements.container.imageSrc = Elements.container.div.dataset.img;
		
		getImgDims(Elements.container.imageSrc, function(dims) {
			var mapDiv = document.createElement('div');
			mapDiv.style.background = 'url("' + Elements.container.imageSrc + '")';
			mapDiv.style.width = dims.width + 'px';
			mapDiv.style.height = dims.height + 'px';
			
			Elements.container.div.appendChild(mapDiv);
			Elements.container.image = mapDiv;
			
			// Optional parameters
			if(data.thumbnail) {
				Elements.thumbnail.div = data.thumbnail.div;
				
				var markerDiv = document.createElement('div');
			
				Elements.thumbnail.div.appendChild(markerDiv);
				Elements.thumbnail.marker = markerDiv;
			
				if(data.thumbnail.src) { // If another image is used for the thumbnail
					Elements.thumbnail.imageSrc = data.thumbnail.src;
				} else {
					Elements.thumbnail.imageSrc = Elements.container.imageSrc;
				}
			}	
			
			Controller.Measure.dimensions.container.div();
			
			Controller.Measure.dimensions.container.image();
			Controller.Measure.maxMovements.image();
			Controller.Events.container.add();
	
			if(Elements.thumbnail.div) {
				Controller.Measure.dimensions.thumbnail.div();
				Controller.Measure.dimensions.thumbnail.marker();
				Controller.Measure.maxMovements.marker();
				Controller.Measure.factors();
				Controller.Events.thumbnail.add();
			}
			
			View.display();
		});
		
		return {
			addLink: View.addLink,
			center: Controller.Move.center
		};
	}
	
	function create(data) {
		function check() {
			if(!data.container.div) throw new Error(ErrorsMsg.container);
			else if(!data.container.div.dataset.img) throw new Error(ErrorsMsg.image);
			if(data.thumbnail && !data.thumbnail.div) throw new Error(ErrorsMsg.thumbnail);
		}
		
		try {
			check();
		} catch(e) {
			alert(e.message);
			return;
		}
		
		return obj(data);
	}
	
	return {
		create: create
	};
})();
