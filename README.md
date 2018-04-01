# websocket-events
user events for [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) connections.

[![NPM](https://nodei.co/npm/websocket-events.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/websocket-events/)

## Installation
	npm i websocket-events

## Usage
```js
const websocket = require('websocket');
const events = require('websocket-events');

/* -- instance creation of http.Server is omitted -- */

const server = new websocket.server({httpServer: http});

server.on('request', request => {
	const connection = request.accept();

	connection.on('error', err => {
		if (err.userEventError) {
			console.log('user event error:', err);
		}
		else {
			console.log('error:', err);
		}
	});

	connection.on('close', (reasonCode, description) => {
		console.log('closed:', reasonCode, description);
	});

	// use here
	const options = {};
	events(connection, options);

	connection.on('user-event', data => {
		console.log('user-event:', data);
	});

	// this listener is only used when not set listeners
	connection.on('default', event => {
		console.log('default listener:', event.name, event.content);
	});

	// send user event as message of json data
	connection.send('user-event', { hoge: 'piyo' });

	// send normal text message
	connection.send('normal message');
});
```
:bulb: The example is used on the server, but it can also be used on the client.

## Usable Options
### keys.eventName
The name used as key of event name.
Default value is `type`.

### keys.eventContent
The name used as key of event content.
Default value is `data`.

### defaultEventName
The name used when event listeners is not set.
Default value is `default`.

## License
MIT
