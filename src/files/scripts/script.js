(function (window, document) {

	window.addEventListener('load', function () {

		var nav, altNav, height;

		function getScroll() {
			if (window.pageYOffset !== undefined) {
				return window.pageYOffset;
			}
			else {
				return document.documentElement.scrollTop ||
				        document.body.scrollTop ||
				        0;
			}
		}

		function update() {
			var pos = -1 * (height - Math.min(getScroll(), height)) + 'px';
			if (pos !== altNav.style.bottom) {
				altNav.style.bottom = pos;
			}
		}

		nav = document.querySelector('div.navbar');
		height = nav.getBoundingClientRect().height;

		altNav = document.createElement('div');
		altNav.appendChild(nav.cloneNode(true));
		altNav.className = 'navbar navbar-alt navbar-fixed-bottom hide-print';
		altNav.style.position = 'fixed';
		altNav.style.marginBottom = '0';
		altNav.style.width = '100%';

		update();
		window.addEventListener('scroll', update);
		nav.parentNode.insertBefore(altNav, nav);

	});

}(window, document));
