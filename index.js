var defaults = require('defaults');
var debug = require('debug')('SpeakerControl');

function trim(data) {
  return data.replace(/^\s+|\s+$/g, "");
};

function SpeakerControl(options) {
	this.options = defaults(options, {
		socket: '/run/speakers/socket',
		name: 'SocketClient'
	});
	this.lockAcquired = false;

	this.client = net.connect(this.options.socket, () => {
		// 'connect' listener
		debug('Connected');
	});

	this.client.on('data', (data) => {
		data = trim(data.toString());
		debug('Incoming data: ' + data);

		// Do the Login
		if (data == 'This is speakers') {
			this.client.write('This is ' + this.options.name + "\n");
		}
		if (data == 'acquired') {
			this.lockAcquired = true;
		}
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

exports = module.exports = SpeakerControl
