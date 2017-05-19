import "babel-polyfill";
import NoteMap from "./js/notemap";
import SDVXGame from "./js/";

fetch('/test/colorfulsky/colorfulsky_lt.ksh').then((v) => v.text()).then(async (v) => {
	const map = NoteMap.compile(v);
	window.map = map;
	window.gamegame = new SDVXGame(map, {
		speed: 3
	});
	await window.gamegame.load();
	window.renderer = window.gamegame.renderer;

	window.map.points.forEach((v) => console.log(renderer.getRelativeNoteHeight(v)));
});
