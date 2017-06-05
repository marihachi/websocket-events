'use strict';

module.exports = (webSocketConnection) => {
	webSocketConnection.on('message', message => {
		if (message.type === 'utf8') {
			try {
				const event = parse(message.utf8Data);
				validateUserEvent(event);
				webSocketConnection.emit(event.name, event.content);
			}
			catch (err) {
				console.log('error');
				console.dir(err);
			}
		}
	});

	webSocketConnection.sendEvent = (event, content, cb) => {
		webSocketConnection.sendUTF(serialize(event, content), cb);
	};

	webSocketConnection._send = webSocketConnection.send;
	webSocketConnection.send = (arg1, arg2, arg3) => {
		const eventMode = typeof arg1 === 'string' && typeof arg2 !== 'function' && arg2 != null;
		if (eventMode) {
			webSocketConnection.sendEvent(arg1, arg2, arg3);
		}
		else {
			webSocketConnection._send(arg1, arg2);
		}
	};
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
	if (coreEventNames.some(i => i == event.name)) {
		throw new Error('invalid event name');
	}

	return true;
};

const parse = (json) => {
	const event = JSON.parse(json);
	if (event.name == null || event.content == null || typeof event.name != 'string') {
		throw new Error('invalid event data');
	}

	return event;
};

const serialize = (eventName, content) => {
	return JSON.stringify({name: eventName, content: content});
};
