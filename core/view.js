/* jslint node: true */
'use strict';

var events		= require('events');
var util		= require('util');
var assert		= require('assert');
var ansi		= require('./ansi_term.js');

exports.View			= View;

var VIEW_SPECIAL_KEY_MAP_DEFAULT = {
	enter		: [ 'enter' ],
	exit		: [ 'esc' ],
	backspace	: [ 'backspace' ],
	del			: [ 'del' ],
	next		: [ 'tab' ],
};

function View(client, options) {
	events.EventEmitter.call(this);

	assert(client);

	var self			= this;

	this.client			= client;
	this.options		= options || {};
	
	this.acceptsFocus	= false;
	this.acceptsInput	= false;

	this.position 		= { x : 0, y : 0 };
	this.dimens			= { height : 1, width : 0 };

	if(this.options.position) {
		this.setPosition(this.options.position);
	}

	if(this.options.dimens && this.options.dimens.height) {
		this.dimens.height = this.options.dimens.height;
	}

	if(this.options.dimens && this.options.dimens.width) {
		this.dimens.width = this.options.dimens.width;
	}

	this.color			= this.options.color || { flags : 0, fg : 7,  bg : 0 };
	this.focusColor		= this.options.focusColor || this.color;

	if(this.acceptsInput) {
		this.specialKeyMap = this.options.specialKeyMap || VIEW_SPECIAL_KEY_MAP_DEFAULT;
	}
}

util.inherits(View, events.EventEmitter);


View.prototype.setPosition = function(pos) {
	//
	//	We allow [x, y], { x : x, y : y }, or (x, y)
	//
	if(util.isArray(pos)) {
		this.position.x = pos[0];
		this.position.y = pos[1];
	} else if(pos.x && pos.y) {
		this.position.x = pos.x;
		this.position.y = pos.y;
	} else if(2 === arguments.length) {
		var x = parseInt(arguments[0], 10);
		var y = parseInt(arguments[1], 10);
		if(!isNaN(x) && !isNaN(y)) {
			this.position.x = x;
			this.position.y = y;
		}
	}

	assert(this.position.x > 0 && this.position.x < this.client.term.termHeight);
	assert(this.position.y > 0 && this.position.y < this.client.term.termWidth);
};

View.prototype.getColor = function() {
	return this.color;
};

View.prototype.getFocusColor = function() {
	return this.focusColor;
};

View.prototype.redraw = function() {
	this.client.term.write(ansi.goto(this.position.x, this.position.y));
};

View.prototype.setFocus = function(focused) {
	assert(this.acceptsFocus, 'View does not accept focus');

	this.hasFocus = focused;
};