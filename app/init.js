// CDMS Application bootstrapper

// require loads each of the javascript files referenced below, which can in turn load other files.
require([
  'angular',
  'dojo/parser',
  'dijit/Menu',
  'dijit/MenuItem',
  'dijit/form/DropDownButton',
  'app',                                                    //main.js
  'app/core/common/common-module',
  'app/core/projects/projects-module',
  'app/core/datasets/datasets-module',
  'app/core/admin/admin-module',
  'app/core/preferences/preferences-module',
  'app/ctuir/appraisals/appraisals-module',
  'app/ctuir/crpp/crpp-module',


], function (angular, parser) {
   
    angular.element(document).ready(function () {           //punch it, Chewy!
      
	    //check our authentication and setup our user profile first of all!
	    //http://nadeemkhedr.wordpress.com/2013/11/25/how-to-do-authorization-and-role-based-permissions-in-angularjs/
	
  	    $.get(WHOAMI_URL, function(data){
		    //console.log("Inside init.js, $.get...");
		    //console.log("data is next...");
		    //console.dir(data);
  		    profile = data;
  	    })
        .fail(function(){
          window.location=LOGIN_URL;
        })
  	    .always(function(){
		    console.log("Booting angular...");
  		    angular.bootstrap(document.body, ['app']);
            console.log("Booting dojo...");
            parser.parse();
            console.log("all systems GO!")
  	    });
	  
  });
  
});

