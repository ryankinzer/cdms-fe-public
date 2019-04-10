//analytics configuration
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', ANALYTICS_CODE, 'auto');
ga('send', 'pageview');

var BUILD_VERSION = "2.0.0"; //increment the last number as desired to show in the footer

define([
  'angular'
], function(angular){


  // define our app as an angular module - with our dependencies and our routes
  var app = angular.module("app",
	 [
	  'ngRoute',						// assets/js/angular/angular-route.js (referred to in js/controllers/login-controller.js)
      'ui.mask',
      'ui.utils.masks',
      
      //these are the cdms modules
      'CommonModule',
      'ProjectModule',
      'DatasetModule',
      'AdminModule',
      'UserModule',

      'ngFileUpload',				
      'nvd3',					

      //these are ctuir specific
      'CrppModule',
      'AppraisalsModule',
         'HabitatModule',
        'LeasingModule',

      'ngMaterial', 'ngMessages',

	  ])
	    .config(['$routeProvider', function($routeProvider) {

            /* 
            if (typeof TRIBALCDMS_TEMPLATES !== 'undefined') {
                $routeProvider.when('/projects', { templateUrl: 'app/core/projects/components/project-list/' + TRIBALCDMS_TEMPLATES +'/projects.html', controller: 'project-list-ctrl' });
                $routeProvider.when('/projects/:Id', { templateUrl: 'app/core/projects/components/project-detail/' + TRIBALCDMS_TEMPLATES +'/project-datasets.html', controller: 'project-detail-ctrl' });
                $routeProvider.when('/activities/:Id', { templateUrl: 'app/core/datasets/components/dataset-activities-list/' + TRIBALCDMS_TEMPLATES +'/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit' });
            }
            else {
                $routeProvider.when('/projects', { templateUrl: 'app/core/projects/components/project-list/templates/projects.html', controller: 'project-list-ctrl' });
                $routeProvider.when('/projects/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-datasets.html', controller: 'project-detail-ctrl' });
                $routeProvider.when('/activities/:Id', { templateUrl: 'app/core/datasets/components/dataset-activities-list/templates/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit' });
            }
            */

            $routeProvider.when('/dashboard', { templateUrl: 'app/core/user/components/landing-page/templates/landing-page.html', controller: 'LandingPage'});

            $routeProvider.when('/projects', { templateUrl: 'app/core/projects/components/project-list/templates/projects.html', controller: 'ProjectListCtrl'});
            $routeProvider.when('/datasets', { templateUrl: 'app/core/datasets/components/datasets-list/templates/datasets.html', controller: 'DatasetsListCtrl'});
            $routeProvider.when('/projects/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-landing.html', controller: 'ProjectLandingCtrl'});
            $routeProvider.when('/projectFiles/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-files.html', controller: 'ProjectFilesCtrl'});
            $routeProvider.when('/projectData/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-data.html', controller: 'ProjectDataCtrl'});
            $routeProvider.when('/projectEditors/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-editors.html', controller: 'ProjectEditorsCtrl'});
            $routeProvider.when('/projectLookups/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-lookups.html', controller: 'ProjectLookupsCtrl'});
            $routeProvider.when('/projectLocations/:Id', { templateUrl: 'app/core/projects/components/project-detail/templates/project-locations.html', controller: 'ProjectLocationsCtrl'});

            $routeProvider.when('/analytics', { templateUrl: 'app/core/user/components/analytics/templates/user-analytics.html', controller: 'UserAnalyticsCtrl'});

            $routeProvider.when('/mydata', { templateUrl: 'app/core/user/components/dataset-preferences/templates/mydatasets.html', controller: 'MyDatasetsCtrl'});
            $routeProvider.when('/myprojects', { templateUrl: 'app/core/user/components/project-preferences/templates/myprojects.html', controller: 'MyProjectsCtrl'});
            $routeProvider.when('/mypreferences', { templateUrl: 'app/core/user/components/my-preferences/templates/mypreferences.html', controller: 'MyPreferencesCtrl'});
            $routeProvider.when('/activities/:Id', { templateUrl: 'app/core/datasets/components/dataset-activities-list/templates/dataset-activities.html', controller: 'DatasetActivitiesCtrl', permission: 'Edit'});
            $routeProvider.when('/dataentryform/:Id', { templateUrl: 'app/core/datasets/components/dataset-editor/templates/dataset-edit-form.html', controller: 'DataEditCtrl', permission: 'Edit'});
       
            $routeProvider.when('/edit/:Id', { templateUrl: 'app/core/datasets/components/dataset-editor/templates/dataset-edit-form.html', controller: 'DataEditCtrl', permission: 'Edit'});
            $routeProvider.when('/dataview/:Id', { templateUrl: 'app/core/datasets/components/dataset-view/templates/dataset-view.html', controller: 'DataEditCtrl'});

            $routeProvider.when('/datasetquery/:Id', { templateUrl: 'app/core/datasets/components/dataset-query/templates/dataset-query.html', controller: 'DataQueryCtrl'});
            $routeProvider.when('/dataset-details/:Id', { templateUrl: 'app/core/datasets/components/dataset-detail/templates/dataset-details-view.html', controller: 'DatasetDetailsCtrl'});
            $routeProvider.when('/datasetimport/:Id', { templateUrl: 'app/core/datasets/components/dataset-import/templates/dataset-import.html', controller: 'DatasetImportCtrl', permission: 'Edit'});

            $routeProvider.when('/query/:Id', { templateUrl: 'app/core/datasets/components/dataset-query/templates/dataset-query.html', controller: 'DatastoreQueryCtrl'});
            $routeProvider.when('/admin', { templateUrl: 'app/core/admin/components/admin-page/templates/admin.html', controller: 'AdminCtrl'});

            $routeProvider.when('/admin-dataset/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-dataset-fields.html', controller: 'AdminEditDatasetFieldsCtrl'});
            $routeProvider.when('/admin-config/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-dataset-config.html', controller: 'AdminEditDatasetConfigCtrl'});
            $routeProvider.when('/admin-metafields', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-metafields.html', controller: 'AdminMetafieldsCtrl'});

            $routeProvider.when('/admin-users', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-users.html', controller: 'AdminUsersCtrl' });

            $routeProvider.when('/admin-master/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-master.html', controller: 'AdminEditMasterCtrl' });
            $routeProvider.when('/admin-new-dataset/:Id', { templateUrl: 'app/core/admin/components/admin-page/templates/admin-new-dataset.html', controller: 'AdminNewDatasetCtrl' });

            $routeProvider.when('/leasing', { templateUrl: 'app/private/leasing/components/manage/templates/manage-leases.html', controller: 'LeasingHomeController' });
            $routeProvider.when('/active-leases', { templateUrl: 'app/private/leasing/components/manage/templates/active-leases.html', controller: 'ActiveLeasesController' });
            $routeProvider.when('/pending-leases', { templateUrl: 'app/private/leasing/components/manage/templates/pending-leases.html', controller: 'PendingLeasesController' });
            $routeProvider.when('/view-lease/:Id', { templateUrl: 'app/private/leasing/components/manage/templates/view-lease.html', controller: 'ViewLeaseController' });
            $routeProvider.when('/available-land', { templateUrl: 'app/private/leasing/components/manage/templates/available-land.html', controller: 'AvailableLandController' });
            $routeProvider.when('/violations', { templateUrl: 'app/private/leasing/components/manage/templates/inspection-violations.html', controller: 'ViolationsController' });
            $routeProvider.when('/manage-operators', { templateUrl: 'app/private/leasing/components/manage/templates/manage-operators.html', controller: 'ManageOperatorsController' });
            $routeProvider.when('/manage-lookups', { templateUrl: 'app/private/leasing/components/manage/templates/lookups.html', controller: 'LookupListsController' });
            
            

	        //custom routes for datasets that require custom controller+pages
            //$routeProvider.when('/appraisals/:Id', { templateUrl: 'app/private/appraisals/components/appraisal-activities/templates/appraisal-activities.html', controller: 'AppraisalCtrl'});
            $routeProvider.when('/crppcorrespondence/:Id', { templateUrl: 'app/private/crpp/components/correspondence/templates/correspondence.html', controller: 'CRPPCorrespondenceCtrl'});
            $routeProvider.when('/habitatsites/:Id', { templateUrl: 'app/private/habitat/components/habitat-sites/templates/sites.html', controller: 'HabitatSitesCtrl'});

            $routeProvider.when('/unauthorized', { templateUrl: 'app/core/common/templates/unauthorized.html',controller: 'ErrorCtrl'});

	        //when all else fails...
	        $routeProvider.otherwise({redirectTo: '/dashboard'});
	    }]);

	//any functions in here are available to EVERY scope.  use sparingly!
	app.run(function($rootScope,$window, $location) {
	  $rootScope.config = {
	      version: CURRENT_VERSION,
          CDMS_DOCUMENTATION_URL: CDMS_DOCUMENTATION_URL,
          REPORTSERVER_URL: REPORTSERVER_URL,
          build_version: BUILD_VERSION,
          DISPLAY_NAME: DISPLAY_NAME,
	  };

      $rootScope.serverUrl = serverUrl; 

	  $rootScope.Cache = {};
	  $rootScope.Profile = configureProfile(profile); // profile defined in init.js

	  $rootScope.go = function ( path ) {
		  $location.path( path );
	  };

      $rootScope.$location = $location;

	  angular.rootScope = $rootScope; //just so we can get to it later. :)

	  $rootScope.SystemTimezones = SystemTimezones; //defined in init.js
      $rootScope.DataGradeMethods = DataGradeMethods; //ditto

        if ('serviceWorker' in navigator) {
            console.log("We are good to go with service workers.");
            $rootScope.ServiceWorkers = true;
        }
        else {
            console.log("browser does not support service workers");
            $rootScope.ServiceWorkers = false;
        }

    //Fire analytics call on location change in URL for SPA.
      $rootScope.$on('$locationChangeSuccess', function () {

          //clear out the $rootScope variables that control the file path filter...
          $rootScope.viewSubproject = null;
          $rootScope.datasetId = null;
          $rootScope.newSubproject = null;

          if (ENVIRONMENT != "prod") return; 

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

    //landing page
    profile.LandingPage = getByName(profile.UserPreferences, "LandingPage");
    if (profile.LandingPage)
        profile.LandingPage = profile.LandingPage.Value;
    
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

    //if is project owner, has role of editor or admin.
	profile.canEdit = function(project)
    {
        if (!project)
            return null;

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

    //is the user marked with group "ExternalUser"?
    profile.isExternal = function () {
        return profile.hasRole("ExternalUser");
    }

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

    profile.setLandingPage = function () { 
        //console.log(" our location: " + angular.rootScope.$location.url());
        profile.LandingPage = angular.rootScope.$location.url();
        angular.rootScope.go("/mypreferences");
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
