import LongNote from "./long-note";

class KnobNote extends LongNote {
	constructor(start, end, notes, pos, checkpoints){
		super(start, end, notes, pos);
		this.checkpoints = checkpoints;
	}
}

export default KnobNote;
