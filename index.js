'use strict'

var Coll = require("./collection");
var fm = require("./fileManager");
var util = require('util');
var hashes = require('hashes');
var RBTree = require('bintrees').RBTree;
var bool = require("./bool");
var wildcard = require("./wildcard");

// a tree of all unique words
var tree = new RBTree(function(a, b) { return a.localeCompare(b);; });

// a collection of all unique words
var dictionary = new Coll();

// the inverted index
var map = new hashes.HashTable(); 

// the 2- and 3- gram 
var grams2 = new hashes.HashTable(); 
var grams3 = new hashes.HashTable(); 

// the permuterm index (i hope so)
var permuterm = new hashes.HashTable();

// creates the dictionary and the inverted index
var fillCollectionsFromFile = function(file){
	var tmp = fm.readFile("./files/" + file);
	var tmpSet = new hashes.HashSet();
	for (var i = 0; i < tmp.length; i++) {
		dictionary.add(tmp[i]);
		if(!tmpSet.contains(tmp[i])) {
			tmpSet.add(tmp[i]);
			if(map.contains(tmp[i])) {
				let list = map.get(tmp[i]).value;
				list.push(file);
				map.add(tmp[i], list)
			} else {
				map.add(tmp[i], [file])
			}
		}
	}
}

// is used for creating permuterm index
String.prototype.rotate = function(x) {
    var a = x % this.length,b;
    if(a>0){
        b = this.length - a;
    } else {
        b = -a;
    }
    var c = this.substr(b,this.length),
        d = this.substr(0,b),
                proof = c + d;
    return c + d;
};

// adds value to the existing key or just adds the new one key-value pair
var pushToMap = function(map, key, value){
	if(map.contains(key)) {
		let list = map.get(key).value;
		list.push(value);
		map.add(key, list)
	} else {
		map.add(key, [value])
	}
}

// read the files
var files = fm.readDir('./files');
for (var i = 0; i < files.length; i++) {
	fillCollectionsFromFile(files[i]);
}

// cretes the tree, permuterm and k-gram indexes 
for(var i = 0; i < dictionary.arr.length; i++){
	var item = dictionary.arr[i];
  	tree.insert(item);
  	var tItem = item + "$";
  	var per = [];
  	for(var j = 1; j <= tItem.length; j++){
  		tItem = tItem.rotate(1);
  		pushToMap(permuterm, item, tItem);
  	}
  	tItem = "$" + item + "$";
  	for(var j = 0; j < tItem.length - 2; j++){
  		pushToMap(grams3, tItem.substring(j, j+3), item);
  	}
  	for(var j = 0; j < tItem.length - 1; j++){
  		pushToMap(grams2, tItem.substring(j, j+2), item);
  	}

};

// save info int txt files 
fm.writeFile(dictionary.arr, "./dictionary.txt")
fm.writeFile(grams2.getKeyValuePairs(), "./grams2.txt")
fm.writeFile(grams3.getKeyValuePairs(), "./grams3.txt")
fm.writeFile(permuterm.getKeyValuePairs(), "./permuterm.txt")

//wildcard search
console.log(wildcard.search(grams2, "*tes*"));