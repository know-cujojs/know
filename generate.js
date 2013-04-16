// shim to run on Cloud Foundry
require('docpad').createInstance({ env: 'production' }, function(err, docpadInstance) {
	if (err) { return console.log(err.stack); }
	docpadInstance.action('generate', function (err, result){
		if (err) { return console.log(err.stack); }
		console.log('OK');
	});
});
