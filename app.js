function addEvent(element, event, func) {
	if (element.addEventListener) element.addEventListener(event, func, false);
	else element.attachEvent('on' + event, func);
}

var map = Map.create({
	container: {
		div: document.querySelector('#map-container')
	},
	thumbnail: {
		div: document.querySelector('#map-thumbnail')
	},
	cb: function() { // After the map was created
		map.addLink({
			nw: [49.5, 79.5], // North-West: (49.5%, 79.5%)
			se: [59, 81.5], // South-East: (59%, 81.5%)
			href: '#aljeit'
		});
	}
});
