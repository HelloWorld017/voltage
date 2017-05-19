import AssetLoader from "../assets/asset-loader";
import Color from "color";
import SkinSetting from "../../skin/skin-setting.json";
import NoteMap from "../notemap/";
import NotePos from "../notemap/note-pos";
import NodePoint from "../notemap/node-point";
import LongNote from "../notemap/long-note";
import ShortNote from "../notemap/short-note";
import BTNote from "../notemap/bt-note";
import BTLongNote from "../notemap/bt-long-note";
import KnobNote from "../notemap/knob-note";

const FUTURE_SEEING = 5000;
const FPS = 30;
let prevRender = 0;
let interval = 1000 / FPS;

class NoteRenderer {
	constructor(canvas, game) {
		this.canvas = canvas;
		this.assets = game.loader;
		this.map = game.map;
		this.setting = {};
		this.options = game.options;
		this.skinSetting = SkinSetting;
		this.ctx = this.canvas.getContext('2d');
		this.bgCanvas = document.createElement('canvas');
		this.bgCanvas.width = canvas.width;
		this.bgCanvas.height = canvas.height;
		this.bgCtx = this.bgCanvas.getContext('2d');
		this.renderTick = 0;
		this.realTick = 0;
		this.multiplier = 1;
		this.ongoingObjects = [];

		//this.noteHeight = NoteMap.BEAT_SPEED / (this.options.speed * 96);
		this.noteHeight = NoteMap.BEAT_SPEED / (this.options.speed * 192);
		this.knob90Height = NoteMap.BEAT_SPEED / (this.options.speed * 96);
		this.renderBG();

		this.innerAssets = {};
	}

	async load(){
		['knobStartL', 'knobStartR'].forEach(async (v) => {
			const img = await AssetLoader.arrayBufferAsImage(
				this.assets.get(v)
			);

			const canv = document.createElement('canvas');
			canv.width = this.canvas.width / 6;
			canv.height = (img.height / img.width) * canv.width;

			const ctx = canv.getContext('2d');
			ctx.drawImage(img, 0, 0, canv.width, canv.height);

			this.innerAssets[v] = canv;
		});
	}

	render(timestamp){
		if(interval > timestamp - prevRender) return;
		prevRender = timestamp;

		this.runOnMainContext((ctx, canvas) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(this.bgCanvas, 0, 0);
			//console.log(this.currentTiming);
			const noteMap =
				this.map.notesCalculated.getChunkArray(0, this.currentTiming + FUTURE_SEEING);

			const nodeMap =
				this.map.pointsCalculated.getChunkArray(this.currentTiming, FUTURE_SEEING);

			noteMap.forEach((v) => {
				if(v instanceof ShortNote){
					const h = this.getRelativeNoteHeight(v.point);
					if(0 <= h && h <= canvas.height){
						this.renderShortNote(v);
					}
				}
			});

			this.ongoingObjects.forEach((v) => {
				const first = this.getRelativeNoteHeight(v.first);
				const end = this.getRelativeNoteHeight(v.last);
				if((0 <= first && first <= canvas.height)
					|| (0 <= end && end <= canvas.height)
					|| (first < 0 && end > canvas.height)
				){
					this.renderLongNote(v);
				}
			});

			nodeMap.forEach((v) => {
				if(v instanceof NodePoint){
					const h = this.getRelativeNoteHeight(v);
					if(0 <= h && h <= canvas.height)
						this.renderNode(v);
				}
			});

			requestAnimationFrame(() => this.render());
		});
	}

	renderBG(){
		this.runOnBGContext((ctx, canvas) => {
			ctx.fillStyle = this.skinSetting.lane.background;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			const unit = canvas.width / 6;
			for(let i = 0; i <= 6; i++){
				ctx.lineWidth = this.skinSetting.lane['line-width'];

				let color = new Color((() => {
					/* eslint-disable no-fallthrough */
					switch(i){
						case 0:
							ctx.lineWidth *= 2;
						case 1:
							return this.skinSetting.note['knob-left'];
						case 2: case 3: case 4:
							return this.skinSetting.lane['line-color'];
						case 6:
							ctx.lineWidth *= 2;
						case 5:
							return this.skinSetting.note['knob-right'];
					}
					/* eslint-enable no-fallthrough */
				})());

				const currentPos = unit * i;
				const start = currentPos - this.skinSetting.lane['line-feather'];
				const end = currentPos + this.skinSetting.lane['line-feather'];
				ctx.strokeStyle = color.string();
				ctx.beginPath();
				ctx.moveTo(currentPos, 0);
				ctx.lineTo(currentPos, canvas.height);
				ctx.stroke();
				ctx.closePath();

				const grad = ctx.createLinearGradient(start, 0, end, 0);
				grad.addColorStop(0, 'transparent');
				grad.addColorStop(
					.5,
					color.alpha(this.skinSetting.lane.alpha).string()
				);
				grad.addColorStop(1, 'transparent');


				ctx.fillStyle = grad;
				ctx.fillRect(start, 0, end, canvas.height);
			}

			const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
			grad.addColorStop(0, '#000');
			grad.addColorStop(.1, 'transparent');

			ctx.fillStyle = grad;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		});
	}

	updateRenderTick(){
		this.renderTick += this.multiplier / 2;
		this.realTick += 1/2;
		if(Math.floor(this.realTick) !== this.realTick) return;

		const settingMap =
			this.map.pointsCalculated.getChunkArray(this.realTiming, 50);
		settingMap.forEach((v) => {
			//To support scrolling back
			if(v.key === 'stop') this.multiplier--;
			if(v.key === 'stopend') this.multiplier++;

			this.setting[v.key] = v.value;
		});

		const noteMap =
			this.map.notesCalculated.getChunkArray(this.currentTiming - FUTURE_SEEING, FUTURE_SEEING);

		noteMap.forEach((v) => {
			if(v instanceof LongNote && !v.markAdded){
				this.ongoingObjects.push(v);
				v.markAdded = true;
			}
		});
	}

	renderNode(node){
		console.log("Node render");
		this.runOnMainContext((ctx, canvas) => {
			const height = this.getRelativeNoteHeight(node);
			ctx.fillRect(0, canvas.height - height, canvas.width, canvas.height - height - this.noteHeight * 0.3);
		});
	}

	renderShortNote(note){
		this.runOnMainContext((ctx, canvas) => {
			const defaultUnit = canvas.width / 6;
			const firstHeight = this.getRelativeNoteHeight(note.point);
			const endHeight = Math.min(canvas.height, firstHeight + this.noteHeight * canvas.height);

			let startPos, w;
			if(note instanceof BTNote){
				startPos = defaultUnit + defaultUnit * note.pos;
				w = defaultUnit;
				ctx.fillStyle = this.skinSetting.note.bt;
			} else {
				startPos = defaultUnit + defaultUnit * 2 * (note.pos - 4);
				w = defaultUnit * 2;
				ctx.fillStyle = this.skinSetting.note.fx;
			}

			ctx.fillRect(
				startPos,
				canvas.height - firstHeight,
				w,
				endHeight - firstHeight
			);
		});
	}

	renderLongNote(note){
		if(note instanceof KnobNote) return this.renderKnob(note);

		this.runOnMainContext((ctx, canvas) => {
			const defaultUnit = canvas.width / 6;

			const firstHeight = this.getRelativeNoteHeight(note.first)
			const endHeight =
				Math.min(
					this.getRelativeNoteHeight(note.last),
					canvas.height
				);

			let startPos, w;
			if(note instanceof BTLongNote){
				startPos = defaultUnit + defaultUnit * note.pos;
				w = defaultUnit;
				ctx.fillStyle = this.skinSetting.note.bt;
			} else {
				startPos = defaultUnit + defaultUnit * 2 * (note.pos - 4);
				w = defaultUnit * 2;
				ctx.fillStyle = this.skinSetting.note.fx;
				//TODO add gradient
			}
			console.log(endHeight - firstHeight)
			ctx.fillRect(
				startPos,
				canvas.height - firstHeight,
				w,
				firstHeight - endHeight
			);
		});
	}

	renderKnob(knob){
		this.runOnMainContext((ctx, canvas) => {
			const isL = knob.pos === NotePos.POS_KNOB_L;
			const color = isL ?
				this.skinSetting.note['knob-left'] :
				this.skinSetting.note['knob-right'];
			const assetName = isL ? 'knobStartL' : 'knobStartR';
			const image = this.innerAssets[assetName];

			knob.checkpoints.reduce((prev, v, k, arr) => {
				let [currPosFirst, currPosEnd, currHeight] =
					this.parseKnobCheckPoint(v);

				const isLastCheckPoint = arr.length === k - 1;
				if(prev === undefined){
					if(currHeight < 0) return v;
					ctx.drawImage(image, currPosFirst, canvas.height - currHeight);
					return v;
				}

				let [prevPosFirst, prevPosEnd, prevHeight] =
					this.parseKnobCheckPoint(prev);

				if(prevHeight >= canvas.height && currHeight >= canvas.height) return v;
				if(prevHeight < 0 && currHeight < 0) return v;

				ctx.fillStyle = color;
				if(v.point.nodes - prev.point.nodes >= 1/24) {
					if(prevHeight < 0){
						const prevPos = v.checkPos + (prev.checkPos - v.checkPos) *
							(currHeight / (currHeight - prevHeight));

						prevPosFirst = prevPos * canvas.width * (5 / 6);
						prevPosEnd = prevPosFirst + canvas.width / 6;
						prevHeight = 0;
					}
					ctx.beginPath();
					ctx.moveTo(prevPosFirst, canvas.height - prevHeight);
					ctx.lineTo(prevPosEnd, canvas.height - prevHeight);
					ctx.lineTo(currPosEnd, canvas.height - currHeight);
					ctx.lineTo(currPosFirst, canvas.height - currHeight);
					ctx.closePath();
					ctx.fill();
				} else {
					//90 degree knob
					if(prevHeight < 0) prevHeight = 0;
					if(prevPosFirst > currPosFirst) {
						//Left-direction knob
						[
							currPosEnd, currPosFirst,
							prevPosEnd, prevPosFirst
						] = [
							currPosFirst, currPosEnd,
							prevPosFirst, prevPosEnd
						];
					}
					ctx.beginPath();
					ctx.moveTo(prevPosFirst, canvas.height - prevHeight);
					ctx.lineTo(currPosEnd, canvas.height - prevHeight);
					ctx.lineTo(currPosEnd, canvas.height - currHeight);
					ctx.lineTo(prevPosFirst, canvas.height - currHeight);
					ctx.closePath();
					ctx.fill();

					if(isLastCheckPoint){
						ctx.beginPath();
						ctx.moveTo(currPosFirst, canvas.height - currHeight);
						ctx.lineTo(currPosEnd, canvas.height - currHeight);
						ctx.lineTo(currPosEnd, canvas.height - currHeight - this.knob90Height);
						ctx.lineTo(currPosFirst, canvas.height - currHeight - this.knob90Height);
						ctx.closePath();
						ctx.fill();
					}
				}

				return v;
			}, undefined);
		});
	}

	parseKnobCheckPoint(v){
		const knobSpaceWidth = this.canvas.width * (5 / 6);
		const posFirst = v.checkPos * knobSpaceWidth;
		const posEnd = posFirst + this.canvas.width / 6;
		const height = this.getRelativeNoteHeight(v.point);

		return [posFirst, posEnd, height];
	}

	getRelativeNoteHeight(point){
		return point.getHeight(this.options.speed, this.canvas.height) -
			this.currentScrolledHeight;
	}

	get currentScrolledHeight(){
		return this.renderTick / (20 * 60) *
			this.currentTempo *
			this.options.speed *
			(this.canvas.height / NoteMap.BEAT_SPEED);
	}

	get currentTiming(){
		return this.renderTick / 20 * 1000;
	}

	get realTiming(){
		return this.realTick / 20 * 1000;
	}

	get currentTempo(){
		const timing = this.currentTiming;

		return parseInt(this.map.tempo.find((v, k, arr) => {
			if(v.timing > timing) return false;
			if(!arr[k + 1]) return true;
			if(v.timing <= timing && timing < arr[k + 1].timing) return true;
			return false;
		}).value);
	}

	runOnBGContext(func){
		func(this.bgCtx, this.bgCanvas);
	}

	runOnMainContext(func){
		func(this.ctx, this.canvas);
	}
}

export default NoteRenderer;
