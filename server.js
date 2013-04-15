// shim to run on Cloud Foundry
require('child_process').spawn('docpad', ['server', '--env', 'production'], { stdio: 'inherit' });
