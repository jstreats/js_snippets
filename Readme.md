Standard Operating Procedure (SOP) for Upgrading Node.js on Windows Server
1. Pre-Upgrade Preparation
Backup Important Data: Ensure all critical data, including application files, databases, and configurations, are backed up.
Document Current Environment: List all globally installed packages, including versions, and specific configurations like environment variables or custom paths.
shell
Copy code
npm list -g --depth=0
Check Compatibility: Verify that the applications and their dependencies are compatible with the new Node.js version. This includes any native modules that may need recompilation.
2. Extension and Dependency Audit
List Extensions and Plugins: For tools like PM2, document all installed extensions, plugins, and their configurations. For PM2, you can use:
shell
Copy code
pm2 list
pm2 show <app_name>
Dependency Check: Ensure all dependencies, especially those critical to application operation (like PM2 for process management), are compatible with the new Node.js version.
3. Performing the Upgrade
Uninstall Previous Node.js Version: Uninstall the current Node.js version from the server to avoid any version conflicts.
Install New Node.js Version: Download and install the new version of Node.js from the official website or use a version manager like nvm for Windows to manage multiple Node.js versions.
Environment Variables: Update any system environment variables related to Node.js, such as NODE_PATH.
4. Post-Upgrade Steps
Reinstall Global Packages: Using the list from the preparation step, reinstall all global packages to ensure they are compiled against the new Node.js runtime.
shell
Copy code
npm install -g <package_name>
Restore PM2 Extensions and Configurations: Reinstall PM2 and any extensions/plugins you documented earlier. Apply the configurations as needed.
shell
Copy code
npm install -g pm2
# Follow with extension/plugin installation and configuration restoration.
Verify Application Functionality: Test all applications in a staging environment before deploying to production. Check for deprecated features or any new warnings/errors.
5. Log Management
Configure Log Rotation: Ensure PM2 or any other log management tool is configured for log rotation to prevent disk space issues.
shell
Copy code
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
