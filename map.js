var Map = (function() {
	var ErrorsMsg = {
		container: 'The container must be an existing HTML element reference.',
		container_dimensions: 'Please, specify image\'s width and height.',
		container_tiles: 'Please, specify some tiles.',
		image: 'You must specify a data-img attribute for the container.',
		thumbnail_div: 'The thumbnail div must be an existing HTML element reference.',
		thumbnail_src: 'Please, specify an image src for the thumbnail.'
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
	
	function getEventArg(e) {
		return window.e || e;
	}
	
	/*
	* Map's functions
	*/
	
	function generate(data) {
		/*
		* Vars
		*/
		var Elements = {
			container: { div: null, map: null, tiles: null },		
			thumbnail: { div: null, src: null, marker: null }
		};
	
		var mousedown = false;
	
		var Positions = {
			map: { left: 0, top: 0 },
			marker: { left: 0, top: 0 },
			beginning: { left: 0, top: 0 }
		};
	
		var Dimensions = {
			container: {
				div: { width: null, height: null },
				map: { width: null, height: null }
			},
			thumbnail: {
				div: { width: null, height: null },
				marker: { width: null, height: null }
			},
			widthFactor: null,
			heightFactor: null
		};
	
		var maxMovements = {
			map: { left: null, top: null },
			marker: { left: null, top: null }
		};
		
		var Tiles = {
			width: null, height: null,
			numHori: null, numVerti: null,
			perContainer: { x: null, y: null },
			images: null, states: null
		};
		var VISIBLE_TILE = 1,
			HIDDEN_TILE = 0;
		
		var LEFT_ARROW_KEYCODE = 37,
			RIGHT_ARROW_KEYCODE = 39,
			TOP_ARROW_KEYCODE = 38,
			BOTTOM_ARROW_KEYCODE = 40;
		
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
				// Container div dimensions
				div: function() {
					Dimensions.container.div.width = parseInt(getCSS(Elements.container.div, 'width'));
					Dimensions.container.div.height = parseInt(getCSS(Elements.container.div, 'height'));
				},
				// Whole map dimensions
				map: function(obj) {
					Dimensions.container.map.width = obj.width;
					Dimensions.container.map.height = obj.height;
				}
			},
			thumbnail: {
				div: function() {
					// If width is specified
					if(parseInt(getCSS(Elements.thumbnail.div, 'width'))) {
						Dimensions.thumbnail.div.width = parseInt(getCSS(Elements.thumbnail.div, 'width'));
						Dimensions.thumbnail.div.height = Dimensions.container.map.height / (Dimensions.container.map.width / Dimensions.thumbnail.div.width);
					} else {
						Dimensions.thumbnail.div.height = parseInt(getCSS(Elements.thumbnail.div, 'height'));
						Dimensions.thumbnail.div.width = Dimensions.container.map.width / (Dimensions.container.map.height / Dimensions.thumbnail.div.height);
					}
				},
				// Thumbnail marker dimensions
				marker: function() {
					Dimensions.thumbnail.marker.width = Dimensions.thumbnail.div.width * Dimensions.container.div.width / Dimensions.container.map.width;
					Dimensions.thumbnail.marker.height = Dimensions.thumbnail.div.height * Dimensions.container.div.height / Dimensions.container.map.height;
				}
			}
		};
		Controller.Measure.factors = function() {
			// Size factor between image and thumbnail
			Dimensions.widthFactor = Dimensions.container.map.width / Dimensions.thumbnail.div.width;
			Dimensions.heightFactor = Dimensions.container.map.height / Dimensions.thumbnail.div.height;
		};
		Controller.Measure.maxMovements = {
			map: function() {
				maxMovements.map.left = -1 * Dimensions.container.map.width + Dimensions.container.div.width;
				maxMovements.map.top = -1 * Dimensions.container.map.height + Dimensions.container.div.height;
			},
			marker: function() {
				maxMovements.marker.left = Dimensions.thumbnail.div.width - Dimensions.thumbnail.marker.width;
				maxMovements.marker.top = Dimensions.thumbnail.div.height - Dimensions.thumbnail.marker.height;
			}
		};
		Controller.Measure.tilesPerContainer = function() {
			Tiles.perContainer = {};
			Tiles.perContainer.x = Math.ceil(Dimensions.container.div.width / Tiles.width);
			Tiles.perContainer.y = Math.ceil(Dimensions.container.div.height / Tiles.height);
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
					e = getEventArg(e);
					e.preventDefault();
					mousedown = true;
				
					Elements.container.div.style.cursor = 'move';
				
					Positions.beginning.left = Positions.map.left; 
					Positions.beginning.top = Positions.map.top;
				
					mouseCoords.beginning.x = e.clientX;
					mouseCoords.beginning.y = e.clientY;
				});
			
				// Mousemove
				addEvent(Elements.container.div, 'mousemove', function(e) {
					if (mousedown) {
						e = getEventArg(e);
					
						mouseCoords.x = e.clientX;
						mouseCoords.y = e.clientY;
					
						var xDelta = mouseCoords.x - mouseCoords.beginning.x,
							yDelta = mouseCoords.y - mouseCoords.beginning.y;
					
						Positions.map.left = Positions.beginning.left + xDelta;
						Positions.map.top = Positions.beginning.top + yDelta;
					
						Controller.Move.fromImage();
					}
				});
				
				// End of movement
				function end() {
					mousedown = false;
					Elements.container.div.style.cursor = 'default';
				}
				addEvent(Elements.container.div, 'mouseout', end);
				addEvent(Elements.container.div, 'mouseup', end);
			
				// Keydown
				addEvent(document.querySelector('body'), 'keypress', function(e) {
					e = getEventArg(e);
					
					switch(e.keyCode) {
						case LEFT_ARROW_KEYCODE:
							Positions.map.left += Dimensions.container.div.width/2;
						break;
						case TOP_ARROW_KEYCODE:
							Positions.map.top += Dimensions.container.div.height/2;
						break;
						case RIGHT_ARROW_KEYCODE:
							Positions.map.left -= Dimensions.container.div.width/2;
						break;
						case BOTTOM_ARROW_KEYCODE:
							Positions.map.top -= Dimensions.container.div.height/2;
						break;
					}
					
					Controller.Move.fromImage();
				});		
			}
		};
		Controller.Events.thumbnail = {
			add: function() {
				var mouseCoords = {
					x: 0, y: 0,
					beginning: { x: 0, y: 0 }
				};
			
				// Mousedown
				addEvent(Elements.thumbnail.div, 'mousedown', function(e) {
					e = getEventArg(e);
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
						e = getEventArg(e);
						mouseCoords.x = e.clientX;
						mouseCoords.y = e.clientY;
					
						var xDelta = mouseCoords.x - mouseCoords.beginning.x,
							yDelta = mouseCoords.y - mouseCoords.beginning.y;
					
						Positions.marker.left = Positions.beginning.left + xDelta;
						Positions.marker.top = Positions.beginning.top + yDelta;
					
						Controller.Move.fromMarker();
					}	
				});
			}		
		};
	
		Controller.Move = {};
		Controller.Move.check = {
			position: function() {
				// Image must fill the whole container
				Positions.map.left = (Positions.map.left > 0) ? 0 : Positions.map.left;
				Positions.map.left = (Positions.map.left < maxMovements.map.left) ? maxMovements.map.left : Positions.map.left;
				Positions.map.top = (Positions.map.top > 0) ? 0 : Positions.map.top;
				Positions.map.top = (Positions.map.top < maxMovements.map.top) ? maxMovements.map.top : Positions.map.top;
			
				// Marker must stay in the thumbnail
				if(Elements.thumbnail.div) {
					Positions.marker.left = (Positions.marker.left < 0) ? 0 : Positions.marker.left;
					Positions.marker.left = (Positions.marker.left > maxMovements.marker.left) ? maxMovements.marker.left : Positions.marker.left;
					Positions.marker.top = (Positions.marker.top < 0) ? 0 : Positions.marker.top;
					Positions.marker.top = (Positions.marker.top > maxMovements.marker.top) ? maxMovements.marker.top : Positions.marker.top;
				}
			},
			tiles: function() {
				var tiles = [];
				var x = Math.abs(Math.floor(-1 * Positions.map.left / Tiles.width)),
					y = Math.abs(Math.floor(-1 * Positions.map.top / Tiles.height));
				
				var mi = y + Tiles.perContainer.y,
					mj = x + Tiles.perContainer.x;
				mj += (mj < Tiles.numHori) ? 1 : 0;
				mi += (mi < Tiles.numVerti) ? 1 : 0;
				
				for(var i = y; i < mi; i++) {
					for(var j = x; j < mj; j++) {
						if(Tiles.states[i][j] == HIDDEN_TILE) {
							tiles.push({
								left: j * Tiles.width + 'px',
								top: i * Tiles.height + 'px',
								src: Tiles.images[i][j]
							});
							Tiles.states[i][j] = VISIBLE_TILE;
						}
					}
				}
				
				return tiles;
			}
		};
		Controller.Move.fromImage = function() {
			if(Elements.thumbnail.div) {
				// Marker position from which of image
				Positions.marker.left = -1 * Positions.map.left / Dimensions.widthFactor;
				Positions.marker.top = -1 * Positions.map.top / Dimensions.heightFactor;
			}
			
			Controller.Move.check.position();
			View.Tiles.show(Controller.Move.check.tiles());
			View.move();
		};
		Controller.Move.fromMarker = function() {
			// Image position from which of marker
			Positions.map.top = -1 * Positions.marker.top * Dimensions.heightFactor;	
			Positions.map.left = -1 * Positions.marker.left * Dimensions.widthFactor;	
			
			Controller.Move.check.position();
			View.Tiles.show(Controller.Move.check.tiles());
			View.move();
		};
		Controller.Move.goTo = function(x, y) {
			x = (x < 0) ? 0 : ((x > 100) ? 100 : x);
			y = (y < 0) ? 0 : ((y > 100) ? 100 : y);
	
			// Image
			Positions.map.top = -1 * Dimensions.container.map.height * y / 100;	
			Positions.map.left = -1 * Dimensions.container.map.width * x / 100;
			
			if(Elements.thumbnail.div) {
				// Marker position from which of image
				Positions.marker.left = -1 * Positions.map.left * Dimensions.thumbnail.div.width / Dimensions.container.map.width;
				Positions.marker.top = -1 * Positions.map.top * Dimensions.thumbnail.div.height / Dimensions.container.map.height;
			}
			
			Controller.Move.check.position();
			View.Tiles.show(Controller.Move.check.tiles());
			View.move();
		};
		Controller.Move.center = function(left, top) {
			var x = left - 100 * (Dimensions.container.div.width/2) / Dimensions.container.map.width;	
			var y = top - 100 * (Dimensions.container.div.height/2) / Dimensions.container.map.height;
			
			Controller.Move.goTo(x, y);
		};
		
		Controller.ready = function(fn) { fn(); };
		
		/*
		*
		* View
		*
		*/
		View.move = function() {
			setCSS(Elements.container.map, {
				left: Positions.map.left + 'px', 
				top: Positions.map.top + 'px'
			});
			if(Elements.thumbnail.div) {
				setCSS(Elements.thumbnail.marker, {
					left: Positions.marker.left + 'px', 
					top: Positions.marker.top + 'px'
				});
			}
		};
		
		View.Tiles = {};
		View.Tiles.show = function(tiles) {
			var tile;
			var img;
			for(var i = 0, len = tiles.length; i < len; i++) {
				tile = tiles[i];
				
				img = document.createElement('img');
				img.src = tile.src;
				img.style.position = 'absolute';
				img.style.zIndex = '1';
				img.style.left = tile.left;
				img.style.top = tile.top;
				img.style.opacity = '0';
				
				Elements.container.map.appendChild(img);
				
				img.style.opacity = '1'; // TODO
			}
		};
		
		View.addLink = function(data) {
			var left = data.nw[0] * Dimensions.container.map.width / 100,
				top = data.nw[1] * Dimensions.container.map.height / 100;
			var width = (data.se[0] - data.nw[0]) * Dimensions.container.map.width / 100,
				height = (data.se[1] - data.nw[1]) * Dimensions.container.map.height / 100;
			
			var link = document.createElement('a');
			link.setAttribute('href', data.href);
			link.style.display = 'block';
			link.style.width = width + 'px';
			link.style.height = height + 'px';
			link.style.position = 'absolute';
			link.style.left = left + 'px';
			link.style.top = top + 'px';
			link.style.zIndex = '2';
			
			Elements.container.map.appendChild(link);
		};
		
		View.display = function() {
			Elements.container.div.style.overflow = 'hidden';
			Elements.container.map.style.position = 'relative';
			
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
					background: 'url("' + Elements.thumbnail.src + '")',
					backgroundSize: '100% 100%',
					overflow: 'hidden',
					width: Dimensions.thumbnail.div.width + 'px',
					height: Dimensions.thumbnail.div.height + 'px'
				});
			}
			
			Controller.Move.goTo(0, 0); // Show first tiles
		};
		
		/*
		*
		* Initialization
		*
		*/
		Controller.init = function(data) {
			Elements.container.div = data.container.div;
			Tiles = data.container.map.tiles;
			Tiles.states = data.container.map.tiles.images.map(function(el) { 
				return el.map(function() { 
					return HIDDEN_TILE; 
				}); 
			});
			Tiles.numHori = Tiles.states[0].length;
			Tiles.numVerti = Tiles.states.length;
			
			var map = document.createElement('div');
			map.style.width = data.container.map.width + 'px';
			map.style.height = data.container.map.height + 'px';
			
			Elements.container.div.appendChild(map);
			Elements.container.map = map;
			
			// Optional parameters
			if(data.thumbnail) {
				Elements.thumbnail.div = data.thumbnail.div;
				
				var marker = document.createElement('div');
			
				Elements.thumbnail.div.appendChild(marker);
				Elements.thumbnail.marker = marker;
			
				Elements.thumbnail.src = data.thumbnail.src;
			}	
			
			Controller.Measure.dimensions.container.div();
			Controller.Measure.dimensions.container.map(data.container.map);
			Controller.Measure.maxMovements.map();
			Controller.Measure.tilesPerContainer();
			Controller.Events.container.add();

			if(Elements.thumbnail.div) {
				Controller.Measure.dimensions.thumbnail.div();
				Controller.Measure.dimensions.thumbnail.marker();
				Controller.Measure.maxMovements.marker();
				Controller.Measure.factors();
				Controller.Events.thumbnail.add();
			}
			
			View.display();
			
			return 10;
		};
		
		return Controller.init(data);
	}
	
	function create(data) {
		function check() {
			// Container
			if(!data.container.div) throw new Error(ErrorsMsg.container);
			if(!data.container.map.width || !data.container.map.height) throw new Error(ErrorsMsg.container_dimensions);
			if(!data.container.map.tiles) throw new Error(ErrorsMsg.container_tiles);
			// Thumbnail
			if(data.thumbnail) {
				if(!data.thumbnail.div) throw new Error(ErrorsMsg.thumbnail_div);
				if(!data.thumbnail.src) throw new Error(ErrorsMsg.thumbnail_src);
			}
		}
		
		try {
			check();
		} catch(e) {
			alert(e.message);
			return;
		}
		
		return generate(data);
	}
	
	return {
		create: create
	};
})();
