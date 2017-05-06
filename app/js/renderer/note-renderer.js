import Color from "color";
import SkinSetting from "../../skin/skin-setting.json";

class NoteRenderer {
	constructor(canvas, assetLoader) {
		this.canvas = canvas;
		this.assets = assetLoader;
		this.skinSetting = SkinSetting;
		this.ctx = this.canvas.getContext('2d');
		this.bgCanvas = document.createElement('canvas');
		this.bgCanvas.width = canvas.width;
		this.bgCanvas.height = canvas.height;
		this.bgCtx = this.bgCanvas.getContext('2d');
		this.renderTick = 0;

		this.renderBG();
	}

	render(){
		this.runOnMainContext(async (ctx, canvas) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.drawImage(this.bgCanvas, 0, 0);
			requestAnimationFrame(() => this.render());
		});
	}

	renderBG(){
		this.runOnBGContext(async (ctx, canvas) => {
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

	}

	async runOnBGContext(func){
		await func(this.bgCtx, this.bgCanvas);
	}

	async runOnMainContext(func){
		await func(this.ctx, this.canvas);
	}
}

export default NoteRenderer;
