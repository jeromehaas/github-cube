const { Octokit } = require('@octokit/rest');
const { request } = require('@octokit/request');
const _ = require('lodash');
const fs = require('fs');
const touch = require('touch');
const glob = require('glob');
const chalk = require('chalk');
const inquirer = require('./inquirer');
const ora = require('ora');
const simpleGit = require('simple-git');
const git = simpleGit();


// ---------------------------------------------------------- // 
// ASK USER FOR ACTION
// ---------------------------------------------------------- // 


const askForAction = async () => {
	const answers = await inquirer.askForAction(['create-repo', 'clone-repo', 'create-gitignore', 'add-remote', 'remove-remote', 'push', 'add-live-remote', 'deploy', 'add', 'commit', 'status']);	
	switch(answers.action) {
	case 'create-repo':
		createRemoteRepoOnGithub();
		break;
	case 'clone-repo':
		cloneRepository();
		break;
	case 'create-gitignore':
		createGitignore();
		break;
	case 'add-remote':
		addRemote();
		break;
	case 'remove-remote':
		removeRemote();
		break;
	case 'push':
		push();
		break;
	case 'deploy':
		deploy();
		break;
	case 'add-live-remote':
		addLiveRemote();
		break;
	case 'add':
		add();
		break;
	case 'commit':
		commit();
		break;
	case 'status':
		status();
		break;
	default: 
		askForAction();
	}
};


// ---------------------------------------------------------- // 
// REUSABLE PATHS AND VARIABLES 
// ---------------------------------------------------------- // 


const spinner = new ora({
	discardStdin: false,
	text: 'Loading...',
});


const path = `${__dirname}/.userdata.json`;


// ---------------------------------------------------------- // 
// LOGIN FUNCTIONS AND AUTHENTIFICATION
// ---------------------------------------------------------- // 


const setGithubCredentials = async () => {
	try {
		if (!fs.existsSync(path)) {
			const credentials = await inquirer.askGithubCredentials();
			await request('GET /user/repos', {
				headers: {
					authorization: `token ${credentials.token}`,
				},
				type: 'private',
			});	
			fs.writeFileSync(path, JSON.stringify({ username: credentials.username, token: credentials.token }));	
			return { username: credentials.username, token: credentials.token };
		}	
	} catch (error) {
		return spinner.fail(chalk.red('Error -> token is not valid!'));	
	}
};


const validateToken = async () => {
	spinner.start('Authorizing user...');
	try {
		const credentials = await getGithubCredentials();
		await request('GET /user/repos', {
			headers: {
				authorization: `token ${credentials.token}`,
			},
			type: 'private',
		});
		spinner.succeed(chalk.green('Success -> logged in!'));	
		return credentials.token;
	}  catch(error) {

		spinner.fail(chalk.red('Error -> could not validate token!'));		
		return false;	
	} 
};


const getGithubCredentials = async () => {
	try {
		spinner.start(chalk.blue('Fetching credentials...'));	
		if (fs.existsSync(path)) {
			const credentialsFile = await JSON.parse(fs.readFileSync(path));
			spinner.succeed(chalk.green('Success -> Fetched credentials'));	
			if (credentialsFile.username && credentialsFile.token)  return {username: credentialsFile.username, token: credentialsFile.token};
		} else {
			spinner.succeed(chalk.green('Success -> Fetched credentials'));	
			return await setGithubCredentials();
		}
	} catch (error) {
		spinner.fail(chalk.red('Error -> could not get credentials!'));	
	}
};


// ---------------------------------------------------------- // 
// GITHUB ACTIONS (AUTH)
// ---------------------------------------------------------- // 


const createRemoteRepoOnGithub = async () => {
	const token = await validateToken();
	if (token === false) return spinner.fail(chalk.red('Error -> token is not valid!'));	
	const answers = await inquirer.askRepoDetails();
	spinner.start(chalk.blue('Creating repository...'));
	try {
		await request('POST /user/repos', {
			headers: {
				authorization: `token ${token}`,
			},
			type: answers.visibility,
			name: answers.name_of_repo
		});
		spinner.succeed(chalk.green('Success -> repository created!'));
	} catch (error) {
		spinner.fail(chalk.red('Error -> could not create repository!'));
	}
};
	

const getNamesOfReposOnGithub = async () => {
	const token = await validateToken();
	try {
		spinner.start(chalk.blue('Fetching names of repositories...'));	
		const result = await request('GET /user/repos', {
			headers: {
				authorization: `token ${token}`,
			},
			type: 'all',
			sort: 'created',
			per_page: 100
		});
		const repos = [];
		for (let repo of result.data) {
			repos.push(repo.name);
		}
		spinner.succeed(chalk.green('Success -> fetched names of repositories!'));	
		return repos;
	} catch (error) {
		spinner.fail(chalk.red('Error -> not able to get names of repositories!'));	
	} 
};


const cloneRepository = async () => {
	const repoNames = await getNamesOfReposOnGithub();
	const answers = await inquirer.askWhichRepoToClone(repoNames);
	const credentials = await getGithubCredentials();
	if (answers.confirm_clone === false) return spinner.fail('Error -> stopped trough user!');
	if (fs.existsSync(`./${answers.name_of_repo}`)) return spinner.fail('Error -> repo already exists!');
	const repo = `https://github.com/${credentials.username}/${answers.name_of_repo}.git`;
	const path = ['.'];
	const options = [];
	spinner.start('Cloning repository...');
	await git.clone(repo, path, options);
	spinner.succeed('Repository cloned');
};


// ---------------------------------------------------------- // 
// GIT ACTIONS
// ---------------------------------------------------------- // 


const init = async () => {
	try {
		await git.init();
	} catch (error) {		
		spinner.fail(chalk.red('Error -> could not init git repository!'));	
	}
};


const createGitignore = async () => {
	try {
		const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');
		if (filelist.length) {
			const answers = await inquirer.askIgnoreFiles(filelist);
			spinner.start(chalk.blue('Creating .gitignore file...'));	
			if (answers.ignore.length) {
				fs.writeFileSync( '.gitignore', answers.ignore.join( '\n' ) );
			} else {
				touch( '.gitignore' );
			}
		} else {
			touch('.gitignore');
		}
		spinner.succeed(chalk.green('Success -> the .gitignore file has been created!'));	
	} catch (error) {
		spinner.fail(chalk.red('Error -> could not create the .gitognore file!'));	
	}
};


const add = async () => {
	try {
		await glob('./**/*', async (error, res) => {
			if (error) {
				spinner.fail(chalk.red('Error -> could not add remote!'));	
			}
			res = res.filter((string) => !string.includes('node_modules'));
			const answers = await inquirer.askAdd(_.without(res, 'node_modules'));
			if (answers.specific_files === 'all') {
				await git.add('./*');
			} else if (answers.specific_files === 'specific') {
				await git.add(answers.choosen_files);
			}
			spinner.succeed(chalk.green('Success -> files are successfully added to stage!'));	
		});
	} catch (error) {
		spinner.fail(chalk.red('Error -> could not add files to stage!'));	
	}
};


const commit = async () => {
	try {
		const answers = await inquirer.askCommit();
		spinner.start(chalk.blue('Commiting...'));	
		await git.commit(`${answers.type_of_commit}: ${answers.commit_message}`);
		spinner.succeed(chalk.green('Success -> fiiles are successfully commited!'));	
	} catch (error) {
		spinner.fail(chalk.red('Error -> could commit!'));	
	}
};


const status = async () => {
	try {
		const status = await git.status();
		if (status.not_added.length !== 0) {console.log('🟡 Untracked:');}
		status.not_added.map((entry) => console.log('- ', entry));
		if (status.conflicted.length !== 0) {console.log('🟠 Conflicted:');}
		status.conflicted.map((entry) => console.log('- ', entry));
		if (status.created.length !== 0) {console.log('🔵 Created:');}
		status.created.map((entry) => console.log('- ', entry));
		if (status.deleted.length !== 0) {console.log('🔴 Deleted:');}
		status.deleted.map((entry) => console.log('- ', entry));
		if (status.modified.length !== 0) {console.log('🟣 Modified:');}
		status.modified.map((entry) => console.log('- ', entry));
		if (status.renamed.length !== 0) {console.log('⚪️ Renamed:');}
		status.renamed.map((entry) => console.log('- ', entry.from + ' -> ' + entry.to));
		if (status.staged.length !== 0) {console.log('🟢 Staged:');}
		status.staged.map((entry) => console.log('- ', entry));
		if (status.not_added.length === 0 && status.conflicted.length === 0 && status.created.length === 0 && status.deleted.length === 0 && status.modified.length === 0 && status.renamed.length === 0 && status.staged.length === 0 && status.not_added.length === 0) {console.log(chalk.green('🟢', 'Working tree is clean!'));}
	} catch (error) {		
		spinner.fail(chalk.red('Error -> could not show status'));	
	}
};


const push = async () => {
	let remotes = await git.getRemotes(['./']);
	const remotesArray = [];	
	for (let remote of remotes) {
		remotesArray.push(remote.name);
	}
	if (remotesArray.length < 1) return spinner.fail(chalk.red('Error -> no remotes in this directory!'));		
	const answers = await inquirer.askPush(remotesArray);
	spinner.start(chalk.blue('Pushing...'));	
	git.push(answers.name_of_remote, answers.name_of_branch);	
	spinner.succeed(chalk.green('Success -> push successfull!'));	
};


const addRemote = async () => {
	try {
		const answers = await inquirer.askRemoteAdd();
		spinner.start(chalk.blue('Add remote...'));	
		git.addRemote(answers.name_of_remote, answers.url_of_remote);
		spinner.succeed(chalk.green('Success -> remote has been added!'));	
	} catch (error) {
		spinner.fail(chalk.red('Error -> could not add remote!'));		
	}
};


const removeRemote = async () => {
	try {
		let remotes = await git.getRemotes(['./']);
		const remotesArray = [];	
		for (let remote of remotes) {
			remotesArray.push(remote.name);
		}
		const answers = await inquirer.askRemoteRemove(remotesArray);
		spinner.start(chalk.blue('Add remote...'));	
		git.removeRemote(answers.name_of_remote);
		spinner.succeed(chalk.green('Success -> remote has been removed!'));	
	} catch (error) {
		spinner.fail(chalk.red('Error -> no remotes in this directory!'));	
	}
};


// ---------------------------------------------------------- // 
// DEPLOY FUNCTIONS
// ---------------------------------------------------------- //


const deploy = async () => {
	let remotes = await git.getRemotes(true);
	let liveRemotes = remotes.filter((remote) => remote.refs.push.includes('ssh://'));
	const liveRemotesArray = [];	
	for (let remote of liveRemotes) {
		liveRemotesArray.push(remote.name);
	}
	if (liveRemotesArray.length < 1) return spinner.fail(chalk.red('Error -> no remotes in this directory!'));		
	const answers = await inquirer.askDeploy(liveRemotesArray);
	spinner.start(chalk.blue('Deploying...'));	
	await git.push(answers.name_of_remote, answers.name_of_branch);	
	spinner.succeed(chalk.green('Success -> deploy successfull!'));	
};


const addLiveRemote = async () => {
	try {
		const answers = await inquirer.askLiveRemoteAdd();
		spinner.start(chalk.blue('Add live-remote...'));	
		git.addRemote(answers.name_of_remote, `ssh://${answers.username}@${answers.host}${answers.path_of_repo}`); spinner.succeed(chalk.green('Success -> live-remote has been added!'));	} catch (error) {
		spinner.fail(chalk.red('Error -> could not add remote!'));		
	}
};


module.exports = {
	askForAction,
	setGithubCredentials,
	getGithubCredentials,
	validateToken,
	createRemoteRepoOnGithub,
	getNamesOfReposOnGithub,
	cloneRepository,
	init,
	createGitignore,
	add,
	status,
	push,
	addRemote,
	removeRemote,
	deploy,
	addLiveRemote,
	commit,
};



