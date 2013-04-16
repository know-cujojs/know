// shim to run on Cloud Foundry
var path = require('path'),
    fs = require('fs'),
    child = require('child_process'),
    cmd = path.join('node_modules', 'docpad', 'bin', 'docpad-server');
fs.chmodSync(cmd, '755');
child.spawn(cmd, ['--env', 'production'], { stdio: 'inherit' });
