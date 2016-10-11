'use strict'

const v8 = require('v8');
v8.setFlagsFromString('--max_executable_size=16');
setTimeout(function() { v8.setFlagsFromString('--notrace_gc'); }, 60e3);

var fs = require('fs');
var Coll = require("./collection");
var fm = require("./fileManager");
var util = require('util');
var hashes = require('hashes');
var RBTree = require('bintrees').RBTree;
var bool = require("./bool");
var wildcard = require("./wildcard");
var mrcluster = require("mrcluster").init();

var directory = "./files1/";

// a tree of all unique words
var tree = new RBTree(function(a, b) {
    return a.localeCompare(b);;
});

// a collection of all unique words
var dictionary = new Coll();

// the inverted index
var map = new hashes.HashTable();

// the 2- and 3- gram 
var grams2 = new hashes.HashTable();
var grams3 = new hashes.HashTable();

// the permuterm index (i hope so)
var permuterm = new hashes.HashTable();

var toCsv = function(map) {
    var res = "";
    Object.keys(map).forEach(function(a){
    	res += a + ", " + map[a] + "\n";
    })
    // var arr = map.getKeyValuePairs().sort(function(a, b) {
    //     return a.key.localeCompare(b.key);
    // });
    // //console.log(arr[0].key);
    // arr.forEach(function(key) {
    //     res += [key["key"], key["value"]] + "\n";
    // });
    return res;
};

// creates the dictionary and the inverted index
var fillCollectionsFromFile = function(file, id) {
    var tmp = fm.readFile(directory + file);
    var map = new hashes.HashTable();
    var tmpSet = new hashes.HashSet();
    var res = {};
    for (var i = 0; i < tmp.length; i++) {
        //dictionary.add(tmp[i]);
        if(!res[tmp[i]]){
        	res[tmp[i]] = id;
        }
        // if (!tmpSet.contains(tmp[i])) {
        //     tmpSet.add(tmp[i]);
        //     if (map.contains(tmp[i])) {
        //         let list = map.get(tmp[i]).value;
        //         list.push(id);
        //         map.add(tmp[i], list)
        //     } else {
        //         map.add(tmp[i], [id])
        //     }
        // }
    }
    fm.writeFile(toCsv(res), "./result/" + file.split('.')[0] + ".txt")
}

// is used for creating permuterm index
String.prototype.rotate = function(x) {
    var a = x % this.length,
        b;
    if (a > 0) {
        b = this.length - a;
    } else {
        b = -a;
    }
    var c = this.substr(b, this.length),
        d = this.substr(0, b),
        proof = c + d;
    return c + d;
};

// adds value to the existing key or just adds the new one key-value pair
var pushToMap = function(map, key, value) {
    if (map.contains(key)) {
        let list = map.get(key).value;
        list.push(value);
        map.add(key, list)
    } else {
        map.add(key, [value])
    }
}

// read the files
var files = fm.readDir(directory);
// var filesID = new Array();
// for (var i = 0; i < files.length; i++) {
// 	filesID.push({id: i, doc: files[i]});
//     fillCollectionsFromFile(files[i], i);
// }
// fm.writeFile(filesID, "./filesIds.txt");
// cretes the tree, permuterm and k-gram indexes 
for (var i = 0; i < dictionary.arr.length; i++) {
    var item = dictionary.arr[i];
    tree.insert(item);
    var tItem = item + "$";
    var per = [];
    for (var j = 1; j <= tItem.length; j++) {
        tItem = tItem.rotate(1);
        pushToMap(permuterm, item, tItem);
    }
    tItem = "$" + item + "$";
    for (var j = 0; j < tItem.length - 2; j++) {
        pushToMap(grams3, tItem.substring(j, j + 3), item);
    }
    for (var j = 0; j < tItem.length - 1; j++) {
        pushToMap(grams2, tItem.substring(j, j + 2), item);
    }

};


// save info int txt files 
fm.writeFile(dictionary.arr, "./dictionary.txt")
fm.writeFile(grams2.getKeyValuePairs(), "./grams2.txt")
fm.writeFile(grams3.getKeyValuePairs(), "./grams3.txt")
fm.writeFile(permuterm.getKeyValuePairs(), "./permuterm.txt")
for (var i = files.length - 1; i >= 0; i--) {
	files[i] = "./result/" + files[i].split('.')[0] + ".txt";
}

console.log(process.memoryUsage());

mrcluster.file(files).blockSize(1).numReducers(1).numReducers(3)
    .partition(3,
        function(key) { 
            return key.charCodeAt(0) % 3;
        })
    .map(function(line) {
        return [line.split(',')[0], line.split(',')[1]];
    }).reduce(function(a, b) {
        return a + "; " + b;
    })
    .post_reduce(function(obj) {
        var lines = "";
        Object.keys(obj).forEach(function (key) {
            lines += key+','+obj[key]+'\n';
        });
        fs.appendFile('./results.txt',lines);	
        return 0; 
    }).start();

//wildcard search
console.log(wildcard.search(grams2, "*tes*"));