 ({
	baseUrl: "./app",
	paths: {
        'angular':'bower_components/angular/angular',
		'esri':'empty:',
		'dojo':'empty:',
		'dijit':'empty:',
    },

    shim: {
        'angular': {
            exports: 'angular'
        },
		
	},
	name: "init",
	out: "init-build.js",
	
 })	