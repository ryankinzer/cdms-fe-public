/* -- bootstraps angular via dojo --*/


require([
  'angular',
  'dojo/parser',
  'dijit/Menu',
  'dijit/MenuItem',
  'dijit/form/DropDownButton',
  'app',
  'app/directives/Map',
  'app/directives/FeatureLayer',
  'app/directives/AppraisalMap',
  'app/directives/CrppContractsMap',
  'app/core/projects/projects-module'

], function(angular,parser) {
  angular.element(document).ready(function(){
	//check our authentication and setup our user profile first of all!
	//http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
	
  	$.get(WHOAMI_URL, function(data){
		console.log("Inside init.js, $.get...");
		//console.log("data is next...");
		//console.dir(data);
  		profile = data;
  	})
    .fail(function(){
      window.location=LOGIN_URL;
    })
  	.always(function(){
		console.log("Booting angular.");
  		angular.bootstrap(document.body, ['app']);
      console.log("Booting dojo.");
      parser.parse();
  	});
	  
  });
  
});

