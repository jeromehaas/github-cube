#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const func = require('./lib/functions');
var argv = require('minimist')(process.argv.slice(2));


const run = async () => {

	clear();
	console.log(chalk.blue(figlet.textSync('github-cube', {horizontalLayout: 'full'})));
	console.log(' ');
	
	const command = argv._[0];
	switch(command) {
	case 'create-repo':
		func.createRemoteRepoOnGithub();
		break;
	case 'clone-repo':
		func.cloneRepository();
		break;
	case 'create-gitignore':
		func.createGitignore();
		break;
	case 'add-remote':
		func.addRemote();
		break;
	case 'remove-remote':
		func.removeRemote();
		break;
	case 'push':
		func.push();
		break;
	case 'deploy':
		func.deploy();
		break;
	case 'add-live-remote':
		func.addLiveRemote();
		break;
	case 'add':
		func.add();
		break;
	case 'commit':
		func.commit();
		break;
	case 'status':
		func.status();
		break;
	default: 
		func.askForAction();
	}
};	

run();


	
	
	