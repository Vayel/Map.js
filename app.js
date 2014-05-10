var map = Map.create({
	container: {
		div: document.querySelector('#map-container')
	},
	thumbnail: {
		div: document.querySelector('#map-thumbnail')
	},
	cb: function() { // After the map was created
		$('#show-map-btn').click(function(e) {
			var data = document.querySelector('#show-map-btn').dataset;
			map.center(data.left, data.top);
		});	
		
		map.addLink({
			nw: [49.5, 79.5], // North-West: (49.5%, 79.5%)
			se: [59, 81.5], // South-East: (59%, 81.5%)
			href: '#aljeit'
		});
	}
});
