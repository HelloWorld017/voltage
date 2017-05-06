import Point from "./point";

class NotePoint extends Point {
	constructor(bt, fx, knob) {
		super();
		this.bt = bt;
		this.fx = fx;
		this.knob = knob;
	}

	get knobL(){
		return this.knob[0];
	}

	get knobR(){
		return this.knob[1];
	}

	get fxL(){
		return this.fx[0];
	}

	get fxR(){
		return this.fx[1];
	}

	get btA(){
		return this.bt[0];
	}

	get btB(){
		return this.bt[1];
	}

	get btC(){
		return this.bt[2];
	}

	get btD(){
		return this.bt[3];
	}
}

export default NotePoint;
