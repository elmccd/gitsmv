'use strict';

const async = require('async');

module.exports = function (exec, options) {
	const pwd = cb => exec('pwd', cb);

	const currentBranch = cb => exec('git rev-parse --abbrev-ref HEAD', cb);

	const currentUpstream = cb => exec('git rev-parse --abbrev-ref --symbolic-full-name @{u}', cb);

	const fetchOrigin = (res, cb) => {
		if (options.fetch) {
			exec(`git fetch origin ${res.upBranch}`, cb);
		} else {
			cb(null, null);
		}
	};

	const lastCommitHash = cb => exec(`git log --pretty=format:"%h" --decorate -n 1`, cb);

	const lastCommitDate = cb => exec(`git log --pretty=format:"%ad" --decorate --date=relative -n 1`, cb);

	const lastCommitAuthor = cb => exec(`git log --pretty=format:"%cn" --decorate -n 1`, cb);

	const lastCommitMessage = cb => exec(`git log --pretty=format:"%s" --decorate -n 1`, cb);

	const getUpBranch = (res, cb) => {
		const upBranch = res.currentUpstream ? res.currentUpstream : 'origin/' + res.currentBranch;

		cb(null, upBranch);
	};

	const branchBehind = cb => {
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

	const branchAhead = cb => {
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

	const customBranchBehind = (branch) => cb => {
		async.auto({
			upBranch: async.constant(branch),
			fetchOrigin: ['upBranch', fetchOrigin]
		}, (err) => {
			if (err) {
				console.log(err);
			}

			exec(`git log ${branch}..origin/${branch} --pretty=oneline | wc -l`, cb);
		});
	};

	return {
		pwd,
		currentBranch,
		currentUpstream,
		lastCommitHash,
		lastCommitDate,
		lastCommitAuthor,
		lastCommitMessage,
		customBranchBehind,
		branchAhead,
		branchBehind
	};
};
