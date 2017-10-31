//analytics configuration
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', ANALYTICS_CODE, 'auto');
ga('send', 'pageview');

define([
  'angular'
], function(angular){


  // define our app as an angular module - with our dependencies and our routes
  var app = angular.module("app",
	 [
	  'ngRoute',						// assets/js/angular/angular-route.js (referred to in js/controllers/login-controller.js)
      'ngGrid',							// assets/js/ng-grid-2.0.7.ken.js (referred to in js/main.js)
      'angularFileUpload',				// assets/js/angular-file-upload/angular-file-upload.js (referred to in controllers.js)
      'angularCharts',					// assets/js/angular-charts.ken.js


      //these are the cdms modules
      'CommonModule',
      'ProjectModule',
      'DatasetModule',
      'AdminModule',
      'PreferencesModule',

      //these are ctuir specific
      'AppraisalsModule',
      'CrppModule',
      'HabitatModule',

      'DatasetServices',
      


	  ])
	    .config(['$routeProvider', function($routeProvider) {

            $routeProvider.when('/projects', { templateUrl: 'app/core/projects/components/project-list/templates/projects.html', controller: 'project-list-ctrl'});
            $routeProvider.when('/projects/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-datasets.html', controller: 'project-detail-ctrl'});

	        $routeProvider.when('/mydata', {templateUrl: 'app/core/preferences/components/dataset-preferences/templates/mydatasets.html', controller: 'MyDatasetsCtrl'});
            $routeProvider.when('/myprojects', { templateUrl: 'app/core/preferences/components/project-preferences/templates/myprojects.html', controller: 'MyProjectsCtrl'});
            $routeProvider.when('/mypreferences', { templateUrl: 'app/core/preferences/components/my-preferences/templates/mypreferences.html', controller: 'MyPreferencesCtrl'});
            $routeProvider.when('/activities/:Id', { templateUrl: 'app/core/datasets/components/dataset-activities-list/templates/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit'});
	        $routeProvider.when('/dataview/:Id', {templateUrl: 'app/core/datasets/components/dataset-view/templates/dataset-view.html', controller: 'DatasetViewCtrl'});
	        $routeProvider.when('/dataentry/:Id',{templateUrl: 'app/core/datasets/components/dataset-entry-sheet/templates/dataset-entry-sheet.html', controller: 'DataEntryDatasheetCtrl', permission: 'Edit'});
            $routeProvider.when('/dataentryform/:Id', { templateUrl: 'app/core/datasets/components/dataset-entry-form/templates/dataset-entry-form.html', controller: 'DataEntryFormCtrl', permission: 'Edit'});
            $routeProvider.when('/edit/:Id', { templateUrl: 'app/core/datasets/components/dataset-editor/templates/dataset-edit-form.html', controller: 'DataEditCtrl', permission: 'Edit'});
	        $routeProvider.when('/datasetquery/:Id',{templateUrl: 'app/core/datasets/components/dataset-query/templates/dataset-query.html', controller: 'DataQueryCtrl'});
	        $routeProvider.when('/dataset-details/:Id',{templateUrl: 'app/core/datasets/components/dataset-detail/templates/dataset-details-view.html', controller: 'DatasetDetailsCtrl'});
	        $routeProvider.when('/datasetimport/:Id',{templateUrl: 'app/core/datasets/components/dataset-import/templates/dataset-import.html', controller: 'DatasetImportCtrl', permission: 'Edit'});
            $routeProvider.when('/dataset-edit/:Id', { templateUrl: 'app/core/datasets/components/dataset-detail/templates/dataset-details-edit.html', controller: 'DatasetDetailsCtrl', permission: 'Edit'});

	        $routeProvider.when('/query/:Id', {templateUrl: 'app/core/datasets/components/dataset-query/templates/dataset-query.html', controller: 'DatastoreQueryCtrl'});
            $routeProvider.when('/admin', { templateUrl: 'app/core/admin/components/admin-page/templates/admin.html', controller: 'AdminCtrl'});
            $routeProvider.when('/admin-dataset/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-dataset.html', controller: 'AdminEditDatasetCtrl'});

            $routeProvider.when('/admin-master/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-master.html', controller: 'AdminEditMasterCtrl'});

	        //custom routes for datasets that require custom controller+pages
	        $routeProvider.when('/appraisals/:Id', {templateUrl: 'app/ctuir/appraisals/components/appraisal-activities/templates/appraisal-activities.html', controller: 'AppraisalCtrl'});
            //$routeProvider.when('/crpp/:Id', { templateUrl: 'app/ctuir/crpp/components/crpp-contracts/templates/Crpp-contracts.html', controller: 'CrppContractsCtrl'});
	        $routeProvider.when('/unauthorized', {templateUrl: 'app/core/common/templates/unauthorized.html',controller: 'ErrorCtrl'});

	        //when all else fails...
	        $routeProvider.otherwise({redirectTo: '/projects'});
	    }]);

	//any functions in here are available to EVERY scope.  use sparingly!
	app.run(function($rootScope,$window, $location) {
	  $rootScope.config = {
	      version: CURRENT_VERSION,
	      CDMS_DOCUMENTATION_URL: CDMS_DOCUMENTATION_URL,
	  };

	  $rootScope.Cache = {};
	  $rootScope.Profile = configureProfile(profile); // profile defined in init.js

	  $rootScope.go = function ( path ) {
		  $location.path( path );
	  };

	  angular.rootScope = $rootScope; //just so we can get to it later. :)

	  $rootScope.SystemTimezones = SystemTimezones; //defined in init.js
	  $rootScope.DataGradeMethods = DataGradeMethods; //ditto

    //Fire analytics call on location change in URL for SPA.
    $rootScope.$on('$locationChangeSuccess', function () {
      console.log("Sending "+ $location.url() +" to: "+ANALYTICS_CODE);
      $window.ga('send', {
        'hitType': 'screenview',
        'appName' : 'CDMS',
        'screenName' : $location.url()
      });
    });
  });

	return app;

});


//configure profile permission functions
function configureProfile(profile)
{
	//setup our favoritedatasets array for checking later.
	console.log("Inside main.js, configureProfile...");
	//console.log("profile is next...");
	//console.dir(profile);
	if ((typeof profile === 'undefined') || (profile === null))
	{
		return;
	}
	
	var favoriteDatasets = getByName(profile.UserPreferences, "Datasets");
	if(favoriteDatasets)
		profile.favoriteDatasets = favoriteDatasets.Value.split(",");
	else
		profile.favoriteDatasets = [];

	//same for favorite projects
	var favoriteProjects = getByName(profile.UserPreferences, "Projects");
	if(favoriteProjects)
		profile.favoriteProjects = favoriteProjects.Value.split(",");
	else
		profile.favoriteProjects = [];


	if(profile.Roles)
		profile.Roles = angular.fromJson(profile.Roles);

	profile.isAdmin = function()
	{
		return (profile.hasRole("Admin"));
	};

	profile.hasRole = function(role)
	{
		if(profile.Roles)
			return profile.Roles.contains(role);

		return false;
	}

	profile.canEdit = function(project)
	{
		return (profile.isProjectOwner(project) || profile.isProjectEditor(project));
	};

	//is the profile owner of the given project?
	profile.isProjectOwner = function(project){
		if(project && project.OwnerId == profile.Id)
			return true;

		if(profile.isAdmin())
			return true;

		//console.log(profile.Id + " is not owner: " + project.OwnerId);
		return false;
	};

	//is the profile editor for the given project?
	profile.isProjectEditor = function(project){

		var isEditor = false;

		if(project && project.Editors)
		{
        	for (var i = 0; i < project.Editors.length; i++) {
                var editor = project.Editors[i];
                if(editor.Id == profile.Id)
                {
             		isEditor = true;
             		break;
                }
            }
        }

        return isEditor;
	};

	profile.isDatasetFavorite = function(datasetId){
		return (profile.favoriteDatasets.indexOf(datasetId+"") != -1);
	};

	profile.isProjectFavorite = function(projectId){
		return (profile.favoriteProjects.indexOf(projectId+"") != -1);
	};

	profile.toggleDatasetFavorite = function(dataset)
	{
		var dsid = dataset.Id+"";
		var index = profile.favoriteDatasets.indexOf(dsid);
		if(index == -1) //doesn't exist
			profile.favoriteDatasets.push(dsid);
		else
			profile.favoriteDatasets.splice(index,1);
	};

	profile.toggleProjectFavorite = function(project)
	{
		var dsid = project.Id+"";
		var index = profile.favoriteProjects.indexOf(dsid);
		if(index == -1) //doesn't exist
			profile.favoriteProjects.push(dsid);
		else
			profile.favoriteProjects.splice(index,1);
	};


	return profile;
}
