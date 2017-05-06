class NotePos {
	static get POS_BT_A(){
		return 0;
	}

	static get POS_BT_B(){
		return 1;
	}

	static get POS_BT_C(){
		return 2;
	}

	static get POS_BT_D(){
		return 3;
	}

	static get POS_FX_L(){
		return 4;
	}

	static get POS_FX_R(){
		return 5;
	}

	static get POS_KNOB_L(){
		return 6;
	}

	static get POS_KNOB_R(){
		return 7;
	}

	static get BT_LIST(){
		return [
			this.POS_BT_A,
			this.POS_BT_B,
			this.POS_BT_C,
			this.POS_BT_D
		];
	}

	static get FX_LIST(){
		return [
			this.POS_FX_L,
			this.POS_FX_R
		];
	}

	static get KNOB_LIST(){
		return [
			this.POS_KNOB_L,
			this.POS_KNOB_R
		];
	}

	static get POS_LIST(){
		return [].concat(
			this.BT_LIST,
			this.FX_LIST,
			this.KNOB_LIST
		);
	}

}

export default NotePos;
