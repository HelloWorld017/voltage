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
		if(typeof index !== 'number') throw new Error("Wrong index!");

		const grade = this.getGrade(index);
		for(let i = 0; i <= grade; i++){
			if(!this.map[i]) this.map[i] = {};
		}
		if(this.maxGrade < grade) this.maxGrade = grade;

		if(Array.isArray(this.map[grade][index]))
			this.map[grade][index].push(value);
		else
			this.map[grade][index] = [value];
	}

	getValues(index) {
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
		for(let i = grade; i <= this.maxGrade; i++){
			if(this.map[i]){
				const keys = Object.keys(this.map[i]);
				if(keys.length > 0) return this.map[i][keys[0]];
			}
		}

		return undefined;
	}

	getChunk(start, length) {
		const end = start + length;

		const startGrade = this.getGrade(start);
		const endGrade = this.getGrade(end);
		const result = {};

		for(let i = startGrade; i <= endGrade; i++){
			const keys = Object.keys(this.map[i]);

			for(let j = 0; j < keys.length; j++)
				if(keys[j] >= start && keys[j] <= end)
					result[keys[j]] = this.maps[i][keys[j]];
		}

		return result;
	}

	getChunkArray(start, length) {
		const end = start + length;

		const startGrade = this.getGrade(start);
		const endGrade = this.getGrade(end);
		const result = [];

		for(let i = startGrade; i <= endGrade; i++)
			for(let j in this.map[i])
				if(parseFloat(j) >= start && parseFloat(j) <= end)
					result.push(...this.map[i][j]);

		return result;
	}
}

export default CalculatedMap;
