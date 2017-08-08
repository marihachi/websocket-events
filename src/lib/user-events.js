'use strict';

const globalOptions = {
	keys: {
		eventName: 'name',
		eventContent: 'content'
	}
};

const coreEventNames = [
	'frame',
	'error',
	'close',
	'drain',
	'pause',
	'resume',
	'ping',
	'pong',
	'message'
];

const validateUserEvent = (event) => {
	if (coreEventNames.some(i => i == event[globalOptions.keys.eventName])) {
		throw new Error('invalid event name');
	}

	return true;
};

const parse = (json) => {
	const {eventName, eventContent} = globalOptions.keys;

	const event = JSON.parse(json);

	if (event[eventName] == null || event[eventContent] == null || typeof event[eventName] != 'string') {
		throw new Error('invalid event data');
	}

	return event;
};

const serialize = (eventName, content) => {
	const event = {};
	event[globalOptions.keys.eventName] = eventName;
	event[globalOptions.keys.eventContent] = content;

	return JSON.stringify(event);
};

module.exports = (connection, options) => {
	if (options != null && typeof options === 'object') {
		Object.assign(globalOptions, options);
	}

	connection.on('message', message => {
		if (message.type === 'utf8') {
			try {
				const event = parse(message.utf8Data);
				validateUserEvent(event);
				connection.emit(event[globalOptions.keys.eventName], event[globalOptions.keys.eventContent]);
			}
			catch (err) {
				console.log('error');
				console.dir(err);
			}
		}
	});

	connection.sendEvent = (event, content, cb) => {
		connection.sendUTF(serialize(event, content), cb);
	};

	connection._send = connection.send;
	connection.send = (arg1, arg2, arg3) => {
		const eventMode = typeof arg1 === 'string' && typeof arg2 !== 'function' && arg2 != null;
		if (eventMode) {
			connection.sendEvent(arg1, arg2, arg3);
		}
		else {
			connection._send(arg1, arg2);
		}
	};
};
