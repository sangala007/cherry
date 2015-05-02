#!/usr/bin/env node --harmony

'use strict';

const
	Util = require('../lib/util'),
	id   = 12345;

var token     = Util.idToToken(id);
var fromToken = Util.idFromToken(token);

console.log(id+' -> '+token+' -> '+fromToken);


