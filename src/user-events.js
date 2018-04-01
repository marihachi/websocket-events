'use strict';

const globalOptions = {
	keys: {
		eventName: 'type',
		eventContent: 'data'
	},
	defaultEventName: 'default'
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
	const { eventName, eventContent } = globalOptions.keys;

	let event;
	try {
		event = JSON.parse(json);
	}
	catch (err) {
		throw new Error(`invalid json: ${json}`);
	}

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

			let event;
			try {
				event = parse(message.utf8Data);
				validateUserEvent(event);
			}
			catch (err) {
				err.userEventError = true;
				connection.emit('error', err);
				return;
			}

			if (connection.listenerCount(event[globalOptions.keys.eventName]) != 0) {
				connection.emit(event[globalOptions.keys.eventName], event[globalOptions.keys.eventContent]);
			}
			else {
				connection.emit(globalOptions.defaultEventName, event);
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
