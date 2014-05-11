function addEvent(element, event, func) {
	if (element.addEventListener) element.addEventListener(event, func, false);
	else element.attachEvent('on' + event, func);
}

Map.create({
	container: {
		div: document.querySelector('#map-container'),
		map: {
			tiles: {
				width: 100,
				height: 100,
				images: [
					['./img/patterns/1.png', './img/patterns/2.png', './img/patterns/3.png', './img/patterns/4.png', './img/patterns/5.png',
					'./img/patterns/6.png', './img/patterns/7.png', './img/patterns/8.png', './img/patterns/9.png', './img/patterns/10.png'],
					['./img/patterns/10.png', './img/patterns/9.png', './img/patterns/8.png', './img/patterns/7.png', './img/patterns/6.png',
					'./img/patterns/5.png', './img/patterns/4.png', './img/patterns/3.png', './img/patterns/2.png', './img/patterns/1.png'],
					['./img/patterns/1.png', './img/patterns/2.png', './img/patterns/3.png', './img/patterns/4.png', './img/patterns/5.png',
					'./img/patterns/6.png', './img/patterns/7.png', './img/patterns/8.png', './img/patterns/9.png', './img/patterns/10.png'],
					['./img/patterns/10.png', './img/patterns/9.png', './img/patterns/8.png', './img/patterns/7.png', './img/patterns/6.png',
					'./img/patterns/5.png', './img/patterns/4.png', './img/patterns/3.png', './img/patterns/2.png', './img/patterns/1.png'],
					['./img/patterns/1.png', './img/patterns/2.png', './img/patterns/3.png', './img/patterns/4.png', './img/patterns/5.png',
					'./img/patterns/6.png', './img/patterns/7.png', './img/patterns/8.png', './img/patterns/9.png', './img/patterns/10.png'],
					['./img/patterns/10.png', './img/patterns/9.png', './img/patterns/8.png', './img/patterns/7.png', './img/patterns/6.png',
					'./img/patterns/5.png', './img/patterns/4.png', './img/patterns/3.png', './img/patterns/2.png', './img/patterns/1.png'],
					['./img/patterns/1.png', './img/patterns/2.png', './img/patterns/3.png', './img/patterns/4.png', './img/patterns/5.png',
					'./img/patterns/6.png', './img/patterns/7.png', './img/patterns/8.png', './img/patterns/9.png', './img/patterns/10.png'],
					['./img/patterns/10.png', './img/patterns/9.png', './img/patterns/8.png', './img/patterns/7.png', './img/patterns/6.png',
					'./img/patterns/5.png', './img/patterns/4.png', './img/patterns/3.png', './img/patterns/2.png', './img/patterns/1.png']
				]
			}
		}
	},
	thumbnail: {
		div: document.querySelector('#map-thumbnail'),
		src: './img/patterns/thumbnail.png'
	}
}).ready(function(map) {
	map.addLink({
		nw: [5, 5], // North-West: (5%, 5%)
		se: [15, 15], // South-East: (15%, 15%)
		href: '#aljeit'
	});
	
	map.center(50, 50); // (50%, 50%)
});
