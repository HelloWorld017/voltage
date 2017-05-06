import EventEmitter from 'events';
class AssetLoader extends EventEmitter{
	constructor(){
		super();
		this.assets = {};
	}

	async loadAssets(assets){
		for(let key in assets) {
			await this.loadAsset(key, assets[key]);
		}
	}

	async loadAsset(name, url){
		if(this.assets[name]) return this.assets[name];

		const res = await fetch(url);
		const buffer = await res.arrayBuffer();
		this.assets[name] = buffer;

		return buffer;
	}

	get(key){
		return this.assets[key];
	}

	static arrayBufferAsBlob(arrayBuffer){
		return new Blob([arrayBuffer]);
	}

	static blobAsArrayBuffer(blob){
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = () => {
				resolve(reader.result);
			};
			reader.readAsArrayBuffer(blob);
		});
	}

	static arrayBufferAsString(arrayBuffer){
		return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer));
	}

	static arrayBufferAsImage(arrayBuffer){
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.src = URL.createObjectURL(AssetLoader.arrayBufferAsBlob(arrayBuffer));
		});
	}
}

export default AssetLoader;
