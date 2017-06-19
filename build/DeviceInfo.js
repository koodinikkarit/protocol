
import classes from "./"

export default class {
	constructor(context, {
		id,
		keyValues
	}) {
		var _id = id;
		var _keyValues = keyValues;

		Object.defineProperties(this, {
			"keyValues": {
				get: () => {
					return context.loaders.undefined(_keyValues);
				}	
			}
		})
	}
	
}
