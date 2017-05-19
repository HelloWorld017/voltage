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

	get first(){
		return this.points[0];
	}

	get last(){
		return this.points[this.points.length - 1];
	}
}

export default LongNote;
