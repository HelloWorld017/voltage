import CalculatedMap from "./calculated-map";
import NodePoint from "./node-point";
import NotePoint from "./note-point";
import SettingPoint from "./setting-point";

const RegexPalette = {
	line: /\r|\n|\r\n/g,
	setting: /^(.*)=(.*)$/,
	note: /^(.{4})\|(.{2})\|(.{2})$/,
	numericTempo: /^\d+$/,
	beat: /^(\d+)\/(\d+)$/
};

class NoteMap {
	constructor(points) {
		this.points = points;
		this.nodes = [[]];
		this.timings = [[]];
		this.calculated = new CalculatedMap(5000);

		this.points.forEach((el, i) => {
			el.setIndex(i);

			if(el instanceof NodePoint) this.nodes.push([]);
			else this.nodes[this.nodes.length - 1].push(el);

			if(el instanceof SettingPoint){
				if(el.key === 't' || el.key === 'beat') this.timings.push([el]);
				else this.timings[this.timings.length - 1].push(el);
			}else this.timings[this.timings.length - 1].push(el);
		});

		this.nodes.forEach((arr) => {
			let i = 0;
			let notes = arr.filter((v) => v instanceof NotePoint);
			arr.forEach((v) => {
				v.setNodeLength(arr.length);
				v.setNodeIndex(i);

				if(v instanceof NotePoint) i++;
			});
		});

		const checkTimingValue = (arr, key, test) => {
			if(!(arr[0] instanceof SettingPoint && arr[0].key === key)) return false;
			if(!test.test(arr[0].value)) return false;
			return true;
		}

		const getTimingValue = (key, test, def) => timings.reduceRight((prev, v) => {
			return checkTimingValue(v, key, test) ? v[0].value :  prev;
		}, def);

		const parseBeat = (val) => {
			const match = val.match(RegexPalette.beat);
			if(!match) throw new Error("Wrong beat syntax!");

			const res = match.slice();
			res.shift();
			return res.map((v) => parseInt(v));
		};

		let tempo = parseInt(getTimingValue('t', RegexPalette.numericTempo, '120'));
		let beat = parseBeat(getTimingValue('beat', RegexPalette.beat, '4/4'));

		this.timings.reduce((prev, arr) => {
			tempo = checkTimingValue(arr, 't', RegexPalette.numericTempo) ?
				parseInt(arr[0].value) : tempo;

			beat = checkTimingValue(arr, 'beat', RegexPalette.beat) ?
				parseBeat(arr[0].value) : beat;

			const msPerNode = (beat[0] / beat[1]) * (tempo / 60) * 1000;
			arr.forEach((v) => {
				v.setTiming(prev);
				this.calculated.add(prev, v);
				
				if(v instanceof NotePoint) prev += msPerNode / v.nodeLength;
			});
		}, 0);
	}

	const compile(mapText){
		return new NoteMap(
			mapText.split(RegexPalette.line)
			.map((v) => {
				if(v === '') return;
				if(v === '--') return new NodePoint();

				let match;

				if((match = v.match(RegexPalette.setting))){
					return new SettingPoint(match[1], match[2]);
				}

				if((match = v.match(RegexPalette.note))){
					return new NotePoint(match[1].split(''), match[2].split(''), match[3].split(''));
				}

				return;
			})
			.filter((v) => v !== undefined)
		);
	}
}

export default NoteMap;
