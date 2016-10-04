'use strict'
class Collection {
	constructor(){
		this.arr = new Array();
		this.count = 0;
	}

	add(elem){
		this.count++;
		let tmp = this.findBinary(elem);
		if(tmp <= 0){
			this.arr.splice(Math.abs(tmp), 0, elem);
			return true;
		}
		return false;
	}

	findBinary(searchElement){
		var minIndex = 0;
		var maxIndex = this.arr.length - 1;
		var currentIndex;
		var currentElement;
		var resultIndex;

		while (minIndex <= maxIndex) {
			resultIndex = currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = this.arr[currentIndex];

			if (currentElement < searchElement) {
				minIndex = currentIndex + 1;
			}
			else if (currentElement > searchElement) {
				maxIndex = currentIndex - 1;
			}
			else {
				return currentIndex;
			}
		}
		
		return ~maxIndex;
	}
}

module.exports = Collection;