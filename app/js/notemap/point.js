import NoteMap from "./index";

class Point {
	setIndex(key){
		this.index = key;
	}

	setNodeLength(len){
		this.nodeLength = len;
	}

	//Index inside of node
	setNodeIndex(index){
		this.nodeIndex = index;
	}

	//Index of node
	setIndexOfNode(index){
		this.indexOfNode = index;
	}

	setTiming(timing){
		this.timing = timing;
	}

	get nodes(){
		if(this.vanished) return this.vanishStart;
		if(this.nodeLength === 0) return this.indexOfNode;
		return this.indexOfNode + this.nodeIndex / this.nodeLength - this.offset;
	}

	getHeight(speed, height){
		const modifier = (NoteMap.BEAT_SPEED / speed) * height;
		return this.nodes * modifier;
	}

	setRenderHeightOffset(count){
		this.offset = count;
	}

	setVanishment(vanishStart){
		//Van!shment th!s world!!
		this.vanished = true;
		this.vanishStart = vanishStart;
	}
}

export default Point;
