//define all of the core modules we use -- this is required for proper loading and optimizing
var common_module = angular.module('CommonModule', ['ui.bootstrap', 'ngResource']);
var admin_module = angular.module('AdminModule', ['ui.bootstrap', 'ngResource']);
var datasets_module = angular.module('DatasetModule', ['ui.bootstrap', 'ngResource','ngFileUpload']);
var user_module = angular.module('UserModule', ['ui.bootstrap', 'ngResource']);
var projects_module = angular.module('ProjectModule', ['ui.bootstrap', 'ngFileUpload', 'ui.select2', 'ngResource']);
