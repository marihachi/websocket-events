'use strict';

const globalOptions = {
	eventKeyName: '@event',
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

function isObject(v) {
	return (v != null && typeof v == 'object' && !Array.isArray(v));
}

function isString(v) {
	return (typeof v == 'string');
}

function parse(json) {
	const { eventKeyName } = globalOptions;

	let event;
	try {
		event = JSON.parse(json);
	}
	catch (err) {
		throw new Error(`invalid json: ${json}`);
	}

	if (!isObject(event) || !isString(event[eventKeyName])) {
		throw new Error('invalid event data');
	}

	return event;
}

function validateUserEvent(event) {
	if (coreEventNames.some(i => i == event[globalOptions.eventKeyName])) {
		throw new Error('invalid event name');
	}

	return true;
}

function serialize(eventName, content) {
	const event = {};
	Object.assign(event, content);
	event[globalOptions.eventKeyName] = eventName;

	return JSON.stringify(event);
}

module.exports = (connection, options) => {
	if (isObject(options)) {
		Object.assign(globalOptions, options);
	}

	connection.on('message', message => {
		if (message.type != 'utf8') {
			return;
		}

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

		const eventContent = Object.assign({}, event);
		delete eventContent[globalOptions.eventKeyName];

		if (connection.listenerCount(event[globalOptions.eventKeyName]) != 0) {
			connection.emit(event[globalOptions.eventKeyName], eventContent);
		}
		else {
			connection.emit(globalOptions.defaultEventName, {
				name: event[globalOptions.eventKeyName],
				content: eventContent
			});
		}
	});

	connection.sendEvent = (event, content, cb) => {
		connection.sendUTF(serialize(event, content), cb);
	};

	connection._send = connection.send;
	connection.send = (arg1, arg2, arg3) => {
		const eventMode = typeof arg1 == 'string' && typeof arg2 != 'function' && arg2 != null;
		if (eventMode) {
			connection.sendEvent(arg1, arg2, arg3);
		}
		else {
			connection._send(arg1, arg2);
		}
	};
};
