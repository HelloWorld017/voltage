const B62_CHAR = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const B62_TABLE = {};

B62_CHAR.split('').forEach((v, k) => B62_TABLE[v] = k);

class KnobCheckPoint{
	constructor(timestamp, checkpoint, is2X, point){
		this.timestamp = timestamp;
		this.checkpoint = checkpoint;
		this.is2X = is2X;
		this.point = point;
	}

	get checkPos(){
		const def = KnobCheckPoint.decodeBase62(this.checkpoint) / 50;
		if(!this.is2X) return def;

		return def * 2 - 0.5;
	}

	static decodeBase62(number){
		return number.split('').reverse().reduce((prev, curr, k) => {
			return prev + B62_TABLE[curr] * Math.pow(62, k);
		}, 0);
	}
}

export default KnobCheckPoint;
