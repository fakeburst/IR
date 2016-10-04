var bool = require("./bool");

var test = "monst*r";


var search = function(coll, word) {
	word = ("$" + word + "$").split(/\*/g)
	var grams = new Array(), arrs = new Array();
	for(var j = 0; j < word.length; j++){
		if(word[j] != '$'){
			for(var i = 0; i < word[j].length - 1; ++i){
				arrs.push(coll.get(word[j].substring(i, i + 2)).value);
				grams.push(word[j].substring(i, i + 2).replace("$",""));
			}
		}
	}
	for (var i = 0; i < arrs.length - 1; i++) {
		arrs[i + 1] = bool.and(arrs[i], arrs[i + 1]);
	}
	return arrs[arrs.length - 1].filter(function(elem) {
		for(var i = 0; i < grams.length; i++){
			if(!(elem.includes(word[i].replace("$",""))))
				return false;
		}
		return true;
	});
}

module.exports.search = search;
