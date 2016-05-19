'use strict';

const chalk = require('chalk');
const async = require('async');
const columnify = require('columnify');
const sliceAsci = require('slice-ansi');
const size = require('window-size');

const columnifyOptions = {
	columnSplitter: chalk.gray(' | '),
	showHeaders: false,
	config: {
	}
};

const identity = v => v;

const options = {};

const log = msg => {
	if (options.debug) {
		console.log(msg);
	}
};

const exec = path => (command, callback) => {
	require('child_process').exec(`cd ${path} && ${command}`, (error, stdout, stderr) => {
		log(`cd ${path} && ${command}`);

		if (!error && !stderr) {
			callback(null, stdout.trim());
		} else {
			callback(null, '');
		}
	});
};

const getSubModules = (dir, cb) => {
	return exec(dir)(`git config --file .gitmodules --get-regexp path | awk '{ print $2 }'`, cb);
};

const readGitModules = (path, callback) => {
	let processing = 0;

	const results = ['./'];

	const readDir = (path) => {
		processing += 1;

		const readDirCallback = (err, paths) => {
			if (err) {
				console.log(err);
			}

			processing -= 1;

			paths.split('\n').forEach(subPath => {
				if (subPath) {
					let fullPath = require('path').join(path, subPath);

					results.push(fullPath);

					readDir(fullPath);
				}
			});

			if (processing === 0) {
				callback(results);
			}
		};

		getSubModules(path, readDirCallback);
	};

	readDir(path);
};

const transformDiff = params => {
	const map = {
		'': () => '',
		'0': () => chalk.cyan.bold('−')
	};

	return val => {
		const color = params.up ? 'green' : 'red';
		const arrow = params.up ? '↑' : '↓';

		const def = val => chalk[color].bold(val + arrow);

		return (map[val] || def)(val);
	};
};

const columns = [
	{
		id: 'Path',
		resolve: methods => methods.pwd,
		transform: val => {
			return require('path').basename(val);
		}
	},
	{
		id: 'Branch',
		resolve: methods => methods.currentBranch,
		transform: val => {
			const map = {
				'master': chalk.green.bold,
				'develop': chalk.green,
				'develop-fury': chalk.green.bold
			};

			return (map[val] || identity)(val);
		}
	},
	{
		id: 'LocalCommits',
		resolve: methods => methods.branchAhead,
		transform: transformDiff({up: true})
	},
	{
		id: 'UpstreamCommits',
		resolve: methods => methods.branchBehind,
		transform: transformDiff({down: true})
	},
	{
		id: 'Status',
		resolve: methods => methods.status,
		transform: val => {
			var statuses = val
				.trim()
				.split('\n')
				.map(l => l.substr(0, 2))
				.filter(l => l !== '')
				.filter(l => l !== '??');

			if (statuses.length === 0) {
				return chalk.green.bold('✔');
			}

			return chalk.red.bold('✘');
		}
	},
	{
		id: 'lastCommitHash',
		resolve: methods => methods.lastCommitHash,
		transform: val => chalk.green(val)
	},
	{
		id: 'lastCommitDate',
		resolve: methods => methods.lastCommitDate,
		transform: val => chalk.yellow(val)
	},
	{
		id: 'lastCommitAuthor',
		resolve: methods => methods.lastCommitAuthor,
		transform: val => chalk.blue(val)
	},
	{
		id: 'lastCommitMessage',
		resolve: methods => methods.lastCommitMessage
	}
];

const Methods = require('./methods.js');

const readForPath = path => callback => {
	const methods = new Methods(exec(path), options);
	const dependencies = columns.map(col => col.resolve(methods, col));

	async.parallel(
		dependencies,
		(err, results) => {
			callback(err, results);
		});
};

const transformToDisplay = results => {
	return results.map((result) => {
		const obj = {};

		columns.forEach((column, index) => {
			obj[column.id] = (column.transform || identity)(result[index]);
		});

		return obj;
	});
};

const readPaths = (paths, callback) => {
	paths = paths.filter(p => {
		if (p === './') {
			return true;
		}

		return options.match ? p.match(options.match) : true;
	});

	const pathData = paths.map(readForPath);

	async.parallel(pathData, (err, results) => {
		const toDisplay = transformToDisplay(results);
		const toDisplayColumnify = columnify(toDisplay, columnifyOptions);

		if (err) {
			log(err);
		}

		const toDisplayColumnifyTrimmed = toDisplayColumnify.split('\n').map(line => {
			return sliceAsci(line, 0, size.width);
		}).join('\n');

		callback(toDisplayColumnifyTrimmed);
	});
};

var addCustomBranchToTrack = branch => {
	const customBranch = {
		id: `Custom-${branch}`,
		branch: branch,
		resolve: (methods, col) => methods.customBranchBehind(col.branch),
		transform: transformDiff({down: true})
	};

	columns.splice(5, 0, customBranch);
};

const cli = (opt, callback) => {
	Object.assign(options, opt);

	if (options.track) {
		if (typeof options.track === 'string') {
			addCustomBranchToTrack(options.track);
		} else {
			options.track.reverse().forEach(t => addCustomBranchToTrack(t));
		}
	}

	readGitModules('./', paths => readPaths(paths, callback));
};

module.exports = cli;
