var _ = require('underscore');

var and = function(a, b) {
	var res = _.intersection(a, b)
	if(_.isEmpty(res))
		return a;
	return res;
}

module.exports.and = and;