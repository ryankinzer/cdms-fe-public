//this file is the require optimization config file that can be used
// to generate a single js source file that can be minified.

//it requires npm and the r.js node package to be installed.
// then here is how I run it:
//
// "c:\ctuir-data01\oit-gis\oit-gis-users\kenb\Application Data"\npm\r.js.cmd -o build.js
//

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
	optimize: "none"
	
 })	