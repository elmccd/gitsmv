'use strict';

const async = require('async');

module.exports = function (exec, options) {
	var pwd = cb => exec('pwd', cb);

	var currentBranch = cb => exec('git rev-parse --abbrev-ref HEAD', cb);

	var currentUpstream = cb => exec('git rev-parse --abbrev-ref --symbolic-full-name @{u}', cb);

	var fetchOrigin = (res, cb) => {
		if (options.fetch) {
			let branch = res.upBranch.replace(/^origin\//, '');
			exec(`git fetch origin ${branch}`, cb);
		} else {
			cb(null, null);
		}
	};

	var lastCommitData = cb => exec(
		`git log --pretty=format:"%C(green)%h %C(yellow)[%ad] %Cblue[%cn]  %Creset%s" --decorate --date=relative -n 1`,
		cb
	);

	var getUpBranch = (res, cb) => {
		const upBranch = res.currentUpstream || `origin/${res.currentBranch}`;

		cb(null, upBranch);
	};

	var branchBehind = cb => {
		async.auto({
			currentBranch,
			currentUpstream,
			upBranch: ['currentBranch', 'currentUpstream', getUpBranch],
			fetchOrigin: ['upBranch', fetchOrigin]
		}, (err, res) => {
			if (err) {
				console.log(err);
			}

			exec(`git log ${res.currentBranch}..${res.upBranch} --pretty=oneline | wc -l`, cb);
		});
	};

	var branchAhead = cb => {
		async.auto({
			currentBranch,
			currentUpstream,
			upBranch: ['currentBranch', 'currentUpstream', getUpBranch],
			fetchOrigin: ['upBranch', fetchOrigin]
		}, (err, res) => {
			if (err) {
				console.log(err);
			}

			exec(`git log ${res.upBranch}..${res.currentBranch} --pretty=oneline | wc -l`, cb);
		});
	};

	return {
		pwd,
		currentBranch,
		currentUpstream,
		lastCommitData,
		branchAhead,
		branchBehind
	};
};
