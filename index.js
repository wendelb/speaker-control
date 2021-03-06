var defaults = require('defaults');
var net = require('net');
var debug = require('debug')('SpeakerControl');

function trim(data) {
  return data.replace(/^\s+|\s+$/g, "");
};

function SpeakerControl(options) {
	this.options = defaults(options, {
		socket: '/run/speakers/socket',
		name: 'SocketClient',
		debug: false
	});
	this.lockAcquired = false;

	this.client = net.connect(this.options.socket, () => {
		// 'connect' listener
		debug('Connected');
	});

	this.client.on('data', (data) => {
		data = trim(data.toString());
		if (this.options.debug) {
			debug('Incoming data: ' + data);
		}

		// Do the Login
		if (data == 'This is speakers') {
			this.client.write('This is ' + this.options.name + "\n");
		}

		// When a lock has been acquired
		if (data == 'acquired') {
			this.lockAcquired = true;
		}

		// When a lock has been released
		if (data == 'released') {
			this.lockAcquired = false;
		}
	});
	this.client.on('end', () => {
		debug('disconnected from server');
	});
}

SpeakerControl.prototype.acquire = function() {
	debug('Acquiring...');
	if (!this.lockAcquired) {
		this.client.write("acquire\n");
	}
};

SpeakerControl.prototype.release = function() {
	debug('Releasing...');
	if (this.lockAcquired) {
		this.client.write("release\n");
	}
};

SpeakerControl.prototype.getCurrentStatus = function() {
	return this.lockAcquired;
};

exports = module.exports = SpeakerControl
