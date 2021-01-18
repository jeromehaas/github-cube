<img src="./images/github-cube-logo.png" style="margin-bottom: 30px">

# github-cube
This CLI allows you to perform Git and Github tasks straight form the terminal and it allows you to deploy your code directly to your webserver.

## Installation
Install the package globally with npm with the command: 
```sh
npm i github-cube
```

## Dependencies 
Git and Node.js must be installed to run this package.

## Usage
After you installed the package globally you can run the CLI by just enter `ghc` in your terminal. This will give you an overview of the available actions.  
You can also provide arguments to access the functions directly.
The following functions are at the moment available:

- [Init](#init)
- [Create gitignore file](#create-gitignore-file)
- [Add](#add)
- [Status](#status)
- [Commit](#commit)
- [Push](#push)
- [Add remote](#add-remote)
- [#Add live-remote](#add-live-remote)
- [Remove remote](#remove-remote)
- [Deploy](#deploy)
- [Authentification](#authentification)
- [Dependencies for deploy function](#dependencies-for-deploy-function)

### Init
This will create an empty Git repository.

### Create gitignore file
This command will give you recursivley all the files in your directroy. You will be promtes to choose all the files you want to add to the gitignore file.

### Add
You have the option to add all files or you can choose from all the files in your directory which ones you want to add.

### Status
With this command you'll get an overview over all change in your directories. You can see the following categories:
- 🟡 Untracked  
- 🟠 Conflicted   
- 🔵 Created  
- 🔴 Deleted:  
- 🟣 Modified  
- ⚪ Renamed  
- 🟢 Staged  

### Commit 
WIth the commit command you can choose between predefined categories for a standardized commit-system. 
You can choose between these categories:
- Feature
- Fix
- Docs
- Style
- Refactor
- Performance
- Test
- Build

### Push
It will propt you all your remotes from which you can choose to which remote you want to push your changes.

### Add remote
Let's you add a remote to your git repository

## #Add live-remote
Let's you add a live remote to push your repository to your webserver via SSH.

### Remove remote
Let's you remove already created removes

### Deploy
It's acutally the same as push, but it will only show you the remotes that contains an SSH address.
Use the function [Add Live Remote](#add-live-remote) to define a remote which points to your server. To learn how to configure your server to make the deploy function work, read aboout the [dependencies for deploy function](#dependencies-for-deploy-function)

### Authentification
For some functions, GitHub must identify you in order to provide the functionallities to clone or create projects from GitHub. In order to do so, this package uses a personal access token. 
The first time you use a function like [clone](#clone) or [create repository](#create-repository) the terminal will prompt you a message and it will ask you for your username and your personal access token.
You can create a personal access token by following the [manual from GitHub](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).
Your credentials will be safed locally and it will not be uploaded at any time. If you want to change the credentials once you set them up, you can find and edit them in the directory `/lib/userdata.json`.

### Dependencies for deploy function
In order to use the deploy function, you need: 
- access to a webserver (Ngnix or Apache will work)
- an adminuser or an user with read and write permissions for the 'www' or 'html' (depending on your webserver)

How to use the deploy function:

	Before you use and follow this function, let me tell you that this script is written by a fool. If you are not familar with SSH, Ngnix or Apache do not blindly use this script, because it has the potencial to overwrite data on your server.
	You will follow this manual on your own responsibility.

  1. Login to your webserver and create anfolder called ${domain-name}.git and create a bare git repository inside it with the following command:

	```sh
		git init --bare
	```  
	If you use an Nginx webserver you probably want to initialize the git repository in the directory `/usr/share/nginx/repositories/${domain-name}.git/` and if you are using an apache webserver you probably want to create the repository inside `/var/repositories/${domain-name}.git/`
 
   2. In the created repository cd into the folder `/hooks` and create a the file `post-receive`
	```sh
	# for Nginx
	cd /usr/share/nginx/repositories/${domain-name}.git/	
	touch post-receive

	# for Apache
	/var/www/repositories/${domain-name}.git/	
	touch post-receive
	```

   3. In the newly created `post-receive` file, declare the script as bash script and set the path of the Git repository and the path of the public html folder like in the snippet below:
	```sh
	#!/bin/sh

	# for Nginx
	git --work-tree=/usr/share/nginx/html/ --git-dir=/usr/share/nginx/repositories/${domain-name}.git checkout -f master

	# for Apache
	git --work-tree=/var/www/ --git-dir=/var/repositories/${domain-name}.git/ checkout -f master
	```

	The snippets below can be used as an example, but it can be that your server is configured differently and that you have to adjust the paths.

	4. Make sure that the file `post-receive` is executable by the command:
	```sh
	chmod +x post-receive
	```

  5. Make a [Live-Remote](#add-live-remote) and provide the username and the host or IP address to the function

	6. Use the function [Deploy](#deplay) to push your repository to the server. 
	That's it, if you have done everything correctly, your repository will now be deployed!





