const inquirer = require('inquirer');


// ---------------------------------------------------------- // 
// ASK FOR WEBSERVER CREDENTIALS
// ---------------------------------------------------------- // 
const askWebserverCredentials = () => {
	const questions = [
		{
			name: 'username',
			type: 'input', 
			message: 'Enter your username:',
			validate: function( value ) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your username.';
				}
			}
		},
		{
			name: 'host',
			type: 'input', 
			message: 'Enter your IP address:',
			validate: function( value ) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your IP address.';
				}
			}
		},
		{
			name: 'password',
			type: 'input', 
			message: 'Enter your password:',
			validate: function( value ) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your password.';
				}
			}
		}
	];
	return inquirer.prompt(questions);
};


// ---------------------------------------------------------- // 
// ASK FOR GITHUB CREDENTIALS
// ---------------------------------------------------------- // 
const askGithubCredentials = () => {
	const questions = [
		{
			name: 'username',
			type: 'input',
			message: 'Enter your GitHub username:',
			validate: function( value ) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your username.';
				}
			}
		},
		{
			name: 'token',
			type: 'password',
			message: 'Enter your GitHub token:',
			validate: function(value) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter your GitHub token.';
				}
			}
		}
	];
	return inquirer.prompt(questions);
};


// ---------------------------------------------------------- // 
// ASK FOR REPO DETAILS
// ---------------------------------------------------------- // 
const askRepoDetails = () => {
	const questions = [
		{
			name: 'name_of_repo',
			type: 'input',
			message: 'Enter a name for the repository:',
			validate: function( value ) {
				if (value.length) {
					return true;
				} else {
					return 'Please enter a name for the repository.';
				}
			}
		},
		{
			name: 'description_of_repo',
			type: 'input',
			message: 'Optionally enter a description of the repository:'
		},
		{
			name: 'visibility',
			type: 'list',
			message: 'Public or private:',
			choices: [ 'public', 'private' ],
			default: 'public'
		}
	];
	return inquirer.prompt(questions);
};


// ---------------------------------------------------------- // 
// ASK WHICH REOP TO CLONE
// ---------------------------------------------------------- // 
async function askWhichRepoToClone(repos) {
	const questions = [
		{
			name: 'name_of_repo',
			type: 'list',
			message: 'Choose the repo you want to clone:',
			choices: repos
		},
		{
			name: 'confirm_clone',
			type: 'confirm',
			message: 'Are you sure you want to clone this repo to your current working directory?',
		}
	];
	return inquirer.prompt(questions);
}


// ---------------------------------------------------------- // 
// ASK FOR GITIGNORE ENTRIES
// ---------------------------------------------------------- // 
const askIgnoreFiles = (filelist) => {
	const questions = [
		{
			type: 'checkbox',
			name: 'ignore',
			message: 'Select the files and/or folders you wish to ignore:',
			choices: filelist,
			default: ['node_modules', '.env']
		}
	];
	return inquirer.prompt(questions);
};


// ---------------------------------------------------------- // 
// ASK FOR ACTION
// ---------------------------------------------------------- // 
const askForAction = (actions) => {
	const questions = [
		{
			name: 'action',
			type: 'list',
			message: 'Choose the repo you want to clone:',
			choices: actions
		}
	];
	return inquirer.prompt(questions);	
};


// ---------------------------------------------------------- // 
// ASK FOR ADD REMOTE
// ---------------------------------------------------------- // 
const askRemoteAdd = async () => {
	const questions = [
		{ 
			name: 'name_of_remote',
			type: 'input',
			message: 'What is the name of the remote?',
			validate: (value) => value !== '' ? true : 'Please provide a name.'
		},
		{ 
			name: 'url_of_remote',
			type: 'input',
			message: 'What is the URL of the remote?',
			validate: (value) => value !== '' ? true : 'Please provide an URL.'
		}
	];
	return inquirer.prompt(questions);		
};


// ---------------------------------------------------------- // 
// ASK FOR ADD LIVE-REMOTE
// ---------------------------------------------------------- // 
const askLiveRemoteAdd = async () => {
	const questions = [
		{
			name: 'name_of_remote',
			type: 'input',
			message: 'Specify the name of the remote:',
			valiedate: (value) => value !== '' ? true : 'Please provide a name for the remote.'
		},
		{
			name: 'username',
			tpye: 'input',
			message: 'Specify the username of the host:',
			validate: (value) => value !== '' ? true : 'Please provide the username of the host.'
		},
		{
			name: 'host',
			type: 'input',
			message: 'Specify the the address or the IP of the host',
			validate: (value) => value !== '' ? true : 'Please provide the address or the IP of the host.'

		},
		{
			name: 'path_of_repo',
			type: 'input',
			message: 'Specify the path of the repo:',
			validate: (value) => value !== '' ? true : 'Please provide the path of the repo.'
		}
	];
	return inquirer.prompt(questions);		
};
 

// ---------------------------------------------------------- // 
// ASK REMOVE REMOTE
// ---------------------------------------------------------- // 
const askRemoteRemove = (remotes) => {
	const questions = [
		{
			name: 'name_of_remote',
			type: 'list',
			message: 'Choose the remote you want to remove:',
			choices: remotes
		},
		{
			name: 'confirm_removeRemote',
			type: 'confirm',
			message: 'Are you sure you want to remove this remote?',
		}
	];
	return inquirer.prompt(questions);		
};


// ---------------------------------------------------------- // 
// PUSH
// ---------------------------------------------------------- // 
const askPush = (remotes) => {
	const questions = [
		{
			name: 'name_of_remote',
			type: 'list',
			message: 'Choose to which remote you want to push:',
			choices: remotes
		},
		{
			name: 'name_of_branch',
			type: 'input',
			message: 'Specify the name of the branch:',
			validate: (value) => value !== '' ? true : 'Please provide a name.'
		}	
	];
	return inquirer.prompt(questions);	
};


// ---------------------------------------------------------- // 
// ASK FOR DEPLOY
// ---------------------------------------------------------- // 
const askDeploy = (remotes) => {
	const questions = [
		{
			name: 'name_of_remote',
			type: 'list',
			message: 'Choose to which remote you want to push:',
			choices: remotes
		},
		{
			name: 'name_of_branch',
			type: 'input',
			message: 'Specify the name of the branch:',
			validate: (value) => value !== '' ? true : 'Please provide a name.'
		}
	];
	return inquirer.prompt(questions);	
};


// ---------------------------------------------------------- // 
// ASK FOR ADD
// ---------------------------------------------------------- // 
const askAdd = (files) => {
	const questions = [
		{
			name: 'specific_files',
			type: 'list',
			message: 'Choose if you want to add all files or only specific files:',
			choices: ['all', 'specific']
		},
		{
			name: 'choosen_files',
			type: 'checkbox',
			message: 'Choose to which remote you want to push:',
			choices: files,
			when: (answers) => answers.specific_files === 'specific'
		},
	];
	return inquirer.prompt(questions);	
};


// ---------------------------------------------------------- // 
// ASK FOR COMMIT 
// ---------------------------------------------------------- // 
const askCommit = () => {
	const questions = [
		{
			name: 'type_of_commit',
			type: 'list',
			message: 'Choose a type for your commit:',
			choices: ['Feature', 'Fix', 'Docs', 'Style', 'Refactor', 'Performance', 'Test', 'Build']
		},
		{
			name: 'commit_message',
			type: 'input',
			message: 'Enter your commit message:',
			validate: (value) => value !== '' ? true : 'Please provide a commit message.'
		}
	];
	return inquirer.prompt(questions);	
};


module.exports = {
	askGithubCredentials,
	askRepoDetails,
	askWhichRepoToClone,
	askIgnoreFiles,
	askForAction,
	askRemoteAdd,
	askRemoteRemove,
	askPush,
	askWebserverCredentials,
	askDeploy,
	askLiveRemoteAdd,
	askAdd,
	askCommit
};

