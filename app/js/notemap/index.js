import BTNote from "./bt-note";
import BTLongNote from "./bt-long-note";
import CalculatedMap from "./calculated-map";
import EffectPoint from "./effect-point";
import FXNote from "./fx-note";
import FXLongNote from "./fx-long-note";
import KnobCheckPoint from "./knob-checkpoint";
import KnobNote from "./knob-note";
import NodePoint from "./node-point";
import NotePoint from "./note-point";
import NotePos from "./note-pos";
import SettingPoint from "./setting-point";

const RegexPalette = {
	line: /\r|\n|\r\n/g,
	setting: /^(.*)=(.*)$/,
	note: /^(.{4})\|(.{2})\|(.{2})([@S][)>(<](?:(?:\d+;)*(?:\d+))?)?$/,
	effect: /^([@S])([)>(<])((?:\d+;)*(?:\d+))?$/,
	numericTempo: /^\d+$/,
	beat: /^(\d+)\/(\d+)$/
};

class NoteMap {
	constructor(points) {
		this.points = points;
		this.nodes = [[]];
		this.timings = [[]];
		this.pointsCalculated = new CalculatedMap(5000);
		this.notesCalculated = new CalculatedMap(5000);
		this.tempo = [];

		this.points.forEach((el, i) => {
			el.setIndex(i);

			if(el instanceof NodePoint) this.nodes.push([el]);
			else this.nodes[this.nodes.length - 1].push(el);

			if(el instanceof SettingPoint){
				if(el.key === 't' || el.key === 'beat') this.timings.push([el]);
				else this.timings[this.timings.length - 1].push(el);
			}else this.timings[this.timings.length - 1].push(el);


			if(el instanceof SettingPoint){
				if(el.key === 'stop') this.points.splice(
					i + el.value, 0, new SettingPoint('stopend', el.value)
				);
			}
		});

		this.nodes.forEach((arr, k) => {
			const len = arr.filter((v) => v instanceof NotePoint).length;
			let i = 0;
			arr.forEach((v) => {
				v.setNodeLength(len);
				v.setNodeIndex(i);
				v.setIndexOfNode(k);

				if(v instanceof NotePoint) i++;
			});
		});

		const checkTimingValue = (arr, key, test) => {
			if(!(arr[0] instanceof SettingPoint && arr[0].key === key)) return false;
			if(!test.test(arr[0].value)) return false;
			return true;
		}

		const getTimingValue = (key, test, def) => this.timings.reduceRight((prev, v) => {
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

			const msPerNode = (beat[0] / beat[1]) * (240 / tempo) * 1000;
			arr.forEach((v) => {
				v.setTiming(prev);
				this.pointsCalculated.add(prev, v);

				if(v instanceof NotePoint) prev += msPerNode / v.nodeLength;
			});

			return prev;
		}, 0);

		this.timings.reduce((prev, arr) => {
			const tempo = checkTimingValue(arr, 't', RegexPalette.numericTempo);
			if(tempo) this.tempo.push(arr[0]);
		});

		const long = {};
		const setting = {};

		NotePos.POS_LIST.forEach((v) => long[v] = []);
		let offset = 0;
		let isVanishing = false;
		let vanishStart = undefined;

		this.points.forEach((v, i, arr) => {
			let nextNote = undefined;
			for(let j = i + 1; j < arr.length; j++){
				if(arr[j] instanceof NotePoint){
					nextNote = arr[j];
					break;
				}
			}

			if(isVanishing){
				v.setVanishment(vanishStart);
			}

			if(v instanceof SettingPoint && v.key === 'stop'){
				isVanishing = true;
				vanishStart = v.nodes;
			}

			if(v instanceof SettingPoint && v.key === 'stopend'){
				offset += v.value / v.nodeLength;
			}

			v.setRenderHeightOffset(offset);

			if(v instanceof NotePoint) {
				[
					{
						notes: 'bt',
						posList: NotePos.BT_LIST,
						shortNote: BTNote,
						shortValue: '1',
						longNote: BTLongNote,
						longValue: '2',
					},
					{
						notes: 'fx',
						posList: NotePos.FX_LIST,
						shortNote: FXNote,
						shortValue: '2',
						longNote: FXLongNote,
						longValue: '1'
					}
				].forEach(({
					notes,
					posList,
					shortNote,
					shortValue,
					longNote,
					longValue
				}) => {
					posList.forEach((pos, i) => {
						if(v[notes][i] === shortValue) {
							this.notesCalculated.add(
								v.timing,
								new shortNote(v.timing, v, pos)
							);
						}else if(v[notes][i] === longValue){
							let noteList = long[pos];

							noteList.push(v);
							if(nextNote[notes][i] !== longValue){
								this.notesCalculated.add(
									noteList[0].timing,
									new longNote(
										noteList[0].timing,
										noteList[noteList.length - 1].timing,
										noteList,
										pos
									)
								);

								long[pos] = [];
							}
						}
					});
				});

				const KNOB_RANGE = ['laserrange_l', 'laserrange_r'];

				NotePos.KNOB_LIST.forEach((pos, i) => {
					if(v.knob[i] === '-') return;
					if(!long[pos].checkpoints) long[pos] = {
						checkpoints: [],
						points: []
					};

					const noteList = long[pos];
					noteList.points.push(v);
					if(v.knob[i] !== ':') noteList.checkpoints.push(
						new KnobCheckPoint(
							v.timing,
							v.knob[i],
							setting[KNOB_RANGE[i]] === '2x',
							v
						)
					);

					if(nextNote.knob[i] === '-') {
						this.notesCalculated.add(
							noteList.points[0].timing,
							new KnobNote(
								noteList.points[0].timing,
								noteList.points[noteList.points.length - 1].timing,
								noteList.points,
								pos,
								noteList.checkpoints
							)
						);

						long[pos] = {};
					}
				});

			}else if(v instanceof SettingPoint){
				setting[v.key] = v.value;
			}
		});
	}

	static compile(mapText){
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
					const note = new NotePoint(match[1].split(''), match[2].split(''), match[3].split(''));

					if(match[4]){
						const effectMatch = match[4].match(RegexPalette.effect);

						let type = undefined;
						if(effectMatch[1] === 's' || effectMatch[1] === 'S'){
							type = EffectPoint.TYPE_SPRING;
						}else if(effectMatch[2] === '>' || effectMatch[2] === '<'){
							type = EffectPoint.TYPE_RETURN;
						} else type = EffectPoint.TYPE_NORMAL;

						let direction =
							(effectMatch[2] === ')' || effectMatch[2] === '<') ?
							EffectPoint.DIRECTION_FINISH_RIGHT :
							EffectPoint.DIRECTION_FINISH_LEFT;

						return [
							note,
							new EffectPoint(
								type,
								direction,
								effectMatch[3].split(';').map((v) => parseInt(v))
							)
						];
					}else return note;
				}

				return;
			})
			.filter((v) => v !== undefined)
			.reduce((prev, curr) => prev.concat(curr), [])
		);
	}

	static get BEAT_SPEED(){
		return 8;
	}
}

export default NoteMap;
