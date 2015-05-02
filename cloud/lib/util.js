"use strict";

const
	crypto   = require('crypto'),
    mode     = 'aes-256-ctr',
    password = 'cherry',
    size     = 15;

// Return the buffer's length as a three-character,
// zero-padded string (e.g. printf's `%03d`)
function bufferLength(buffer) {
	var lenStr = "" + buffer.length;
	while (lenStr.length < 3) {
		lenStr = "0" + lenStr;
	}
	return lenStr;
}

// Return the buffer's contents as printable text if every
// character is printable, or as hexadecimal otherwise
function formatBuffer(buffer) {
	for (var i = 0; i < buffer.length; i++) {
		if (buffer[i] < 32 || buffer[i] > 127) {
			return buffer.toString("hex");
		}
	}
	return buffer.toString("utf8");
}

module.exports = {

	encrypt: function(text) {
		var cipher  = crypto.createCipher(mode, password);
		var crypted = cipher.update(text, 'utf8', 'hex');

		crypted += cipher.final('hex');
		return crypted;
	},

	decrypt: function(text) {
		var decipher = crypto.createDecipher(mode, password);
		var dec = decipher.update(text,'hex','utf8');

		dec += decipher.final('utf8');
		return dec;
	},

	toBase64: function(str) {
		return new Buffer(str).toString('base64');
	},

	fromBase64: function (str) {
		return new Buffer(str, 'base64').toString('ascii');
	},

	add_padding: function(str) {
		let 
			buffer = '',
			limit  = size - String(str).length;

		for (var i = 0; i < limit; i++) {
			buffer += '0';
		};
		return buffer+str;
	},

	// Encrypt Id into 15 character token.
	idToToken: function(id) {
		let
			padded    = this.add_padding(id),
			encrypted = this.encrypt(padded),
			encoded   = this.toBase64(encrypted);
		return encoded;
	},

	// Decrypt Id from token.
	idFromToken: function(str) {
		let id;
		try {
			let
				decoded   = this.fromBase64(str),
				decrepted = this.decrypt(decoded);
			id = parseInt(decrepted, 10);

		} catch(e) {
			id = 0;
		}
		return id;
	},

	dumpFrames: function() {
		var frames;
		if (arguments.length == 1) {
			var arg = arguments[0];
			if (Array.isArray(arg)) {
				// Single argument is an array of frames (buffers)
				frames = arg;
			} else {
				// Single argument is a single frame (buffer)
				frames = [arg];
			}

		} else {
			// Multiple arguments; each is a frame (buffer)
			frames = Array.prototype.slice.call(arguments);
		}

		console.log("----------------------------------------");
		frames.forEach(function(frame) {
			console.log("[%s] %s", bufferLength(frame), formatBuffer(frame));
		});
	}
};





