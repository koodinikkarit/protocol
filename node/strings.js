exports.capitalizeFirstLetter = s => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

exports.deCapalizeFirstLetter = s => {
	return s.charAt(0).toLowerCase() + s.slice(1);
};

exports.capitilizeOnlyFirstLetter = s => {
	const newS = s.toLowerCase();
	return exports.capitalizeFirstLetter(newS);
};
