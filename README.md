# websocket-events
user events for [WebSocket-Node](https://github.com/theturtle32/WebSocket-Node) connections.

[![NPM](https://nodei.co/npm/websocket-events.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/websocket-events/)

## Installation
	npm install websocket-events --save

## Usage
```js
const websocket = require('websocket');
const events = require('websocket-events');

/* -- http server creation is omitted -- */

const server = new websocket.server({httpServer: http});

server.on('request', request => {
	const connection = request.accept();

	connection.on('error', err => {
		console.log('error:', err);
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

	// send user event as message of json data
	connection.send('user-event', {hoge: 'piyo'});

	// send normal text message
	connection.send('normal message');
});
```
:bulb: The example is used on the server, but it can also be used on the client.

## Usable Options
### keys.eventName
The name used as key of event name.
Default is `name`.

### keys.eventContent
The name used as key of event content.
Default is `content`.

## License
MIT
