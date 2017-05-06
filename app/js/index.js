import AssetLoader from "./assets/asset-loader";
import HudRenderer from "./renderer/hud-renderer";
import NoteRenderer from "./renderer/note-renderer";
import SkinList from "./assets/skin-list";

class SDVXGame {
	constructor(){
		this.loader = new AssetLoader();
	}

	async load(){
		await this.loader.loadAssets(SkinList);
		this.hudRenderer = new HudRenderer(document.querySelector('.hud'), this.loader);
		this.hudRenderer.render();
		
		this.renderer = new NoteRenderer(document.querySelector('.notes'), this.loader);
		this.renderer.render();
		this.tick();
	}

	tick(){
		this.renderer.renderTick++;
		setTimeout(() => this.tick, 50);
	}
}

export default SDVXGame;
