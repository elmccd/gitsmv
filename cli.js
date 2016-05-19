#!/usr/bin/env node
'use strict';
var meow = require('meow');
var gitsmv = require('./');

var cli = meow(`
    Usage,
      $ gitsmv [input],

    Columns,
      1. Repository path base name
      2. Active branch
      3. Number of commits in HEAD that are missing (not yet pushed) in remote
      4. Number of commits in remote branch missing in HEAD
      5. Is working directory clean (ignoring untracked files)
      .. Custom tracked branches goes here. See --track
      6. Last commit hash
      7. Last commit date
      8. Last commit author
      9. Last commit message

    Options,
      --fetch         Fetch upstream branches [Default: false].

                      Run git fetch for all current branches remote. If there is no
                      default upstream set origin/[currentBranch] is being fetched

      --match=regexp  Filter entries by paths [Default: all],

                      Match entire path to repository/submodule to provided
                      regular expression.
                      Root repository is always included

      --track=branch  Extra branches to track. [Default: none]
                      Displays number of commits in origin/[branch] but not in HEAD 

                      Specify additional branches that will be listed after status column.
                      Displayed value represent number of commits in tracked branch that 
                      are not included in actual HEAD
                      Might contain multiple branches "gitsmv --track dev --track master"

      --debug         Display executed commands [Default: false],
      --no-color      Disable colors,
      --help          Show this instruction
`);

gitsmv(cli.flags, res => {
	console.log(res);
});
