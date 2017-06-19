
import classes from "./"

export default class {
	constructor(context, {
		id,
		deviceInfoId,
		key,
		value
	}) {
		var _id = id;
		var _deviceInfoId = deviceInfoId;
		var _key = key;
		var _value = value;

		Object.defineProperties(this, {
			"deviceInfoId": {
				get: () => {
					return context.loaders.fetchDeviceInfoById(_deviceInfoId);
				}	
			}
		})
	}
	
}
