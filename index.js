'use strict';

const chalk = require('chalk');
const async = require('async');
const columnify = require('columnify');

const columnifyOptions = {
	columnSplitter: chalk.gray(' | '),
	showHeaders: false,
	config: {
		lastCommitData: {
			align: 'left',
			truncate: true,
			width: 20
		}
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
		transform: val => {
			const map = {
				'': () => '',
				'0': () => chalk.cyan.bold('−')
			};

			const def = val => chalk.green.bold(val + '↑');

			return (map[val] || def)(val);
		}
	},
	{
		id: 'UpstreamCommits',
		resolve: methods => methods.branchBehind,
		transform: val => {
			const map = {
				'': () => '',
				'0': () => chalk.cyan.bold('−')
			};

			const def = val => chalk.red.bold(val + '↓');

			return (map[val] || def)(val);
		}
	},
	{
		id: 'lastCommitData',
		resolve: methods => methods.lastCommitData
	}
];

const Methods = require('./methods.js');

const readForPath = path => callback => {
	const methods = new Methods(exec(path), options);
	const dependencies = columns.map(col => col.resolve(methods));

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
	const pathData = paths.map(readForPath);

	async.parallel(pathData, (err, results) => {
		const toDisplay = transformToDisplay(results);
		const toDisplayColumnify = columnify(toDisplay, columnifyOptions);

		if (err) {
			log(err);
		}

		callback(toDisplayColumnify);
	});
};

const cli = (opt, callback) => {
	Object.assign(options, opt);

	readGitModules('./', paths => readPaths(paths, callback));
};

module.exports = cli;
