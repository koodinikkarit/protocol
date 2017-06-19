
import classes from "./"

export default class {
	constructor(context, {
		id,
		arttuId,
		deviceInfoId
	}) {
		var _id = id;
		var _arttuId = arttuId;
		var _deviceInfoId = deviceInfoId;

		Object.defineProperties(this, {
			"arttuId": {
				get: () => {
					return context.loaders.fetchArttuById(_arttuId);
				},
				set: (arttuId) => {
					_arttuId = arttuId;
					context.editComputer({
						id: _id,
						arttuId
					})
				}	
			},
			"deviceInfoId": {
				get: () => {
					return context.loaders.fetchDeviceInfoById(_deviceInfoId);
				},
				set: (deviceInfoId) => {
					_deviceInfoId = deviceInfoId;
					context.editComputer({
						id: _id,
						deviceInfoId
					})
				}	
			}
		})
	}
	editComputer({
		computerId,
		arttuId	
	}) {
		
	}
}
