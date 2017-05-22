exports.capitalizeFirstLetter = function(s) {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

exports.deCapalizeFirstLetter = function(s) {
	return s.charAt(0).toLowerCase() + s.slice(1);
}

exports.capitalizeOnlyFirstLetter = function(s) {
	var newS = s.toLowerCase();
	return exports.capitalizeFirstLetter(newS);
}
