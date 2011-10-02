function ByteBuffer() {
	this.buffer = new Buffer(1024);	
	this.end = 0;
	this.pos = 0;
};

exports.ByteBuffer = ByteBuffer;

ByteBuffer.prototype.accumulate = function(chunk) {
	this.ensure(chunk.length);
	//console.log('After esnure buffer.length: ' + this.buffer.length + ', end: ' + this.end);
	chunk.copy(this.buffer, this.end);
	this.end += chunk.length
};

ByteBuffer.prototype.get = function(obj) {
	var type = typeof obj;
	if (typeof obj == 'undefined') {
		if (this.pos + 1 > this.end) { throw new Error('oob'); }
		nib = this.buffer.get(this.pos++);
		return nib;
	} else if (typeof obj == 'number') {
		size = this.pos + obj;
	    if (size > this.end) { throw new Error('oob'); }
		chunk = this.buffer.slice(this.pos, size);
		this.pos += obj;
		return chunk;
	} else {
		if (obj.length > this.end) { throw new Error('oob'); }
		this.buffer.copy(obj, 0, this.pos);
		this.pos += obj.length;
	}
};

ByteBuffer.prototype.getInt = function() {
	var chunk = this.get(4);
	return (chunk[0] << 24) + (chunk[1] << 16) + (chunk[2] <<  8) + chunk[3];
};

ByteBuffer.prototype.remaining = function() {
	return this.end - this.pos;
};

ByteBuffer.prototype.resize = function() {	 
	this.ensure(this.buffer.length * 2 + 1);
};

ByteBuffer.prototype.ensure = function(size) {
	if (this.buffer.length - this.end >= size) {
		return;
	}
	var tmp = new Buffer(this.buffer.length + size);
	this.buffer.copy(tmp);
	this.buffer = tmp;
};

ByteBuffer.prototype.reset = function() {
	this.end = 0;
	this.pos = 0;
};

ByteBuffer.prototype.rebase = function(obj) {
	var base = new Buffer(this.remaining());
	this.buffer.copy(base, 0, this.pos, this.end);
	this.buffer = base;
	this.pos = 0;
	this.end = this.buffer.length;
};