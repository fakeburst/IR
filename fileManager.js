var fs = require('fs');
var util = require('util');
var _ = require('underscore');
var jsonfile = require('jsonfile')

var rf = function (file){
	return fs.readFileSync(file, 'utf8').replace(/(\r\n|\n|\r|\t|\f|\.|\?|\!|\,|\:|\;|\||\'|\(|\)|\[|\]|\“|\”|\‘|\’|(\s\s+)|\-|\"|\\|\/|\*|\_|\<|\>)/gm," ").split(' ');
};

var wf = function (data, file){
	if(_.isArray(data)){
		jsonfile.writeFileSync(file, data);
	} else {
		fs.writeFileSync(file,data);
	}
}

var rd = function (dir){
	return fs.readdirSync(dir);
}

module.exports.readFile = rf;
module.exports.writeFile = wf;
module.exports.readDir = rd;