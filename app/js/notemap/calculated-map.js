class CalculatedMap {
	constructor(unit) {
		this.map = {};
		this.maxGrade = 0;
		this.unit = unit;
	}

	getGrade(index) {
		return Math.floor(index / this.unit);
	}

	add(index, value) {
		const grade = this.getGrade(index);
		for(let i = 0; i <= grade; i++){
			if(!this.map[i]) this.map[i] = {};
		}
		if(this.maxGrade < grade) this.maxGrade = grade;

		this.map[grade][index] = value;
	}

	get(index) {
		const grade = this.getGrade(index);
		if(!this.map[grade]) return undefined;
		return this.map[grade][index];
	}

	getFutherOne(index) {
		const grade = this.getGrade(index);
		if(this.map[grade]){
			const keys = Object.keys(this.map[grade]);
			for(let i = 0; i < keys.length; i++) if(grade < keys[i])
				return this.map[grade][keys[i]];
		}

		if(grade >= this.maxGrade) return undefined;
		for(let i = grade; i <= maxGrade; i++){
			if(this.map[i]){
				const keys = Object.keys(this.map[i]);
				if(keys.length > 0) return this.map[i][keys[0]];
			}
		}

		return undefined;
	}

	getRange(from, length) {
		
	}
}

export default CalculatedMap;
