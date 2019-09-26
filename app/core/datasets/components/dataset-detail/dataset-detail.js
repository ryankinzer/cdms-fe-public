﻿/*
* Dataset Details is the page you get when you click the "Metadata" button on the dataset activities view page.
*  It displays all of the fields for the dataset. You can also edit those details in this view.
*    e.g.:  http://localhost/cdms/index.html#/dataset-details/1004
*/

var dataset_detail = ['$scope', '$routeParams', 'DatasetService', 'ProjectService', 'CommonService', '$location', '$filter',
    function (scope, routeParams, DatasetService,  ProjectService, CommonService, $location, $filter){
        scope.dataset = DatasetService.getDataset(routeParams.Id);

        //common fields we show for all datasets
        scope.metadataList = {};

        //select lists
        scope.CellOptions = {};
        
        scope.dataset.$promise.then(function(){
            
            scope.project = ProjectService.getProject(scope.dataset.ProjectId);
            scope.project.$promise.then(function(){
                scope.metadataList.Owner = {
                    field: 'Owner',
                    value: scope.project.Owner.Organization.Name + " / "+ scope.project.Owner.Department.Name + " / " +  scope.project.Owner.Fullname ,
                    locked: true
                };

            })

            //prepopulate the dataset fields that are included in the dataset's details (not strictly "metadata" -- but interfaced the same way)
            scope.metadataList = angular.extend(scope.metadataList, {
                Name: {
                        field: 'Name',
                        value: scope.dataset.Name,
                        controlType: 'text',
                },
                Description: {
                        field: 'Description',
                        value: scope.dataset.Description,
                        controlType: 'text',
                },
                Dataset: {
                        field: 'Dataset',
                        value: scope.dataset.Datastore.Name,
                        locked: true
                },
                Created: {
                        field: 'Created',
                        value: $filter('date')(scope.dataset.CreateDateTime, "MM/dd/yyyy") ,
                        locked: true
                }
            });

            //add in the metadata that came with this dataset
            scope.dataset.Metadata.forEach(function(value, key){
                try{
                        var property = CommonService.getMetadataProperty(value.MetadataPropertyId);
                        property.$promise.then(function(){
                            populateMetadataDropdowns(scope,property); //setup any dropdown

                            scope.metadataList[property.Name] =
                            {
                                field: property.Name,
                                propertyId: property.Id,
                                controlType: property.ControlType,
                                value: value.Values,
                                options: scope.CellOptions[property.Id+"_Options"]
                            };
                        })

                }catch(e)
                {
                    console.dir(e);
                }
            });

            //now load the properties
            scope.metadataProperties = CommonService.getMetadataProperties(METADATA_ENTITY_DATASETTYPEID); 

            //these are all the metadata properties configured for all datasets
            // -- add in the ones that aren't already being used in this particular dataset.
            scope.metadataProperties.$promise.then(function(){

                scope.metadataProperties.forEach(function(property, key){
                    //if it isn't already there, add it as an available option
                    if(!(property.Name in scope.metadataList))
                    {
                        populateMetadataDropdowns(scope,property); //setup the dropdown

                        scope.metadataList[property.Name] =
                        {
                            field: property.Name,
                            propertyId: property.Id,
                            controlType: property.ControlType,
                            value: "",
                            options: scope.CellOptions[property.Id+"_Options"]
                        };
                        
                    }
                });
                
            });

        });

        scope.saveResults = {};

        scope.save = function(){
            var metadata = [];
            angular.forEach(scope.metadataList, function(item, key){
                metadata.push({ MetadataPropertyId: item.propertyId, Values: item.value});
            });

            console.log("metadatalist - ");
            console.dir(scope.metadataList);
            console.log("what we're sending - ");
            console.dir(metadata);

            var promise = CommonService.saveDatasetMetadata(scope.dataset.Id, metadata, scope.saveResults);

            promise.$promise.then(function(){
                DatasetService.clearDataset();
                setTimeout(function(){
                    console.log("boom ready to move on.");
                    scope.dataset = DatasetService.getDataset(routeParams.Id);
                    $location.path("/dataset-details/"+routeParams.Id);    
                    console.log("moving on.");
                },250);
                //$location.path("/dataset-details/"+routeParams.Id);    
            });
                
        };

        scope.cancel = function(){
            $location.path("/dataset-details/"+scope.dataset.Id);
        };

        scope.close = function(){
            $location.path("/activities/"+scope.dataset.Id);   
        };

        scope.edit = function(){
  			$location.path("/dataset-edit/"+scope.dataset.Id);   
        };

		
	}
];