import AssetLoader from "./assets/asset-loader";
import HudRenderer from "./renderer/hud-renderer";
import NoteRenderer from "./renderer/note-renderer";
import SkinList from "./assets/skin-list";

class SDVXGame {
	constructor(map, options){
		this.map = map;
		this.loader = new AssetLoader();
		this.options = options;
	}

	async load(){
		await this.loader.loadAssets(SkinList);
		this.hudRenderer = new HudRenderer(document.querySelector('.hud'), this);
		this.hudRenderer.render();

		this.renderer = new NoteRenderer(document.querySelector('.notes'), this);
		await this.renderer.load();

		requestAnimationFrame(() => this.renderer.render());
		this.tick();
		this.renderer.multiplier = 2;
	}

	tick(){
		this.renderer.updateRenderTick();
		setTimeout(() => this.tick(), 25);
	}
}

export default SDVXGame;
