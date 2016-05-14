#!/usr/bin/env node
'use strict';
var meow = require('meow');
var gitsmv = require('./');

var cli = meow([
	'Usage',
	'  $ gitsmv [input]',
	'',
	'Options',
	'  --fetch  Fetch upstream branches [Default: false]',
	'  --debug  Display executed commands [Default: false]',
	'',
	'Examples',
	'  $ gitsmv'
]);

gitsmv(cli.flags);
