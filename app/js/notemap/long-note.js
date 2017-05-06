class LongNote {
	constructor(start, end, points, pos) {
		this.start = start;
		this.end = end;
		this.points = points;
		this.pos = pos;
	}

	get length(){
		return this.end - this.start;
	}
}

export default LongNote;
