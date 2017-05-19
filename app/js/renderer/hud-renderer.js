import AssetLoader from "../assets/asset-loader";

class HudRenderer{
	constructor(canvas, game){
		this.assets = game.loader;
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
	}

	async render(){
		await this.runOnMainContext(async (ctx, canvas) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const img = await AssetLoader.arrayBufferAsImage(this.assets.get('judgeLine'));
			ctx.drawImage(img, 0, canvas.height - 50, canvas.width, img.height / img.width * canvas.width);
		});

		//requestAnimationFrame(async () => await this.render());
	}

	async runOnMainContext(func){
		await func(this.ctx, this.canvas);
	}
}

export default HudRenderer;
