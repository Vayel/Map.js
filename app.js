function addEvent(element, event, func) {
	if (element.addEventListener) element.addEventListener(event, func, false);
	else element.attachEvent('on' + event, func);
}

var map = Map.create({
	container: {
		div: document.querySelector('#map-container'),
		map: {
			width: 1528,
			height: 1198,
			tiles: {
				width: 306,
				height: 240,
				images: [
					['./img/1.png', './img/2.png', './img/3.png', './img/4.png', './img/5.png'],
					['./img/6.png', './img/7.png', './img/8.png', './img/9.png', './img/10.png'],
					['./img/11.png', './img/12.png', './img/13.png', './img/14.png', './img/15.png'],
					['./img/16.png', './img/17.png', './img/18.png', './img/19.png', './img/20.png'],
					['./img/21.png', './img/22.png', './img/23.png', './img/24.png', './img/25.png']
				]
			}
		}
	},
	thumbnail: {
		div: document.querySelector('#map-thumbnail'),
		src: './img/tiles_thumbnail.png'
	}
});
/* TODO
.ready(function() {
	console.log(this);
	Map.addLink({
		nw: [0, 0], // North-West: (49.5%, 79.5%)
		se: [2, 2], // South-East: (59%, 81.5%)
		href: '#aljeit'
	});
});
*/
