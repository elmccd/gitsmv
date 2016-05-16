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
	'  --match=regexp  Filter entries by paths [Default: all]',
	'  --track=branch  Extra branches to track number of commits in origin/[branch] but not in HEAD [Default: none]',
	'  --no-color  Disable colors',
	'',
	'Examples',
	'  $ gitsmv'
]);

gitsmv(cli.flags, res => {
	console.log(res);
});
