import Point from "./point";

class EffectPoint extends Point{
	constructor(type, direction, args){
		super();
		this.length = args[0];
	}

	static get TYPE_NORMAL(){
		return 0;
	}

	static get TYPE_RETURN(){
		return 1;
	}

	static get TYPE_SPRING(){
		return 2;
	}

	static get DIRECTION_FINISH_LEFT(){
		return 0;
	}

	static get DIRECTION_FINISH_RIGHT(){
		return 1;
	}
}

export default EffectPoint;
