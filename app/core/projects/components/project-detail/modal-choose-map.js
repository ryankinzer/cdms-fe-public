
var modal_choose_map = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
  function($scope,  $modalInstance, DatasetService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseMapSelection = [];
        
        $scope.chooseMapGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: false,
            selectedItems: $scope.chooseMapSelection

        };
    

    $scope.save = function(){

        if($scope.chooseMapSelection.length == 0)
        {
            alert("Please choose an image to save by clicking on it and try again.");
            return;
        }

        //is there already a mapselection?
        var mapmd = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE, "MetadataPropertyId");
        var mapmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_MAPIMAGE_HTML, "MetadataPropertyId");

        if(!mapmd)
        {
            mapmd = {   MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd);
        }

        if(!mapmd_html)
        {
            mapmd_html = {  MetadataPropertyId: METADATA_PROPERTY_MAPIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(mapmd_html);
        }        

        mapmd.Values = $scope.chooseMapSelection[0].Id; //fileid of the chosen image file

        //whip up the html .. might be good to have this in a pattern somewhere external!
        var the_html = "<div class='selected-image-div'>";
            the_html += "<img src='" + $scope.chooseMapSelection[0].Link + "' class='selected-image'>";
            if ($scope.chooseMapSelection[0].Description)
                the_html += "<p>" + $scope.chooseMapSelection[0].Description + "</p>";
            the_html += "</div>";

        mapmd_html.Values = the_html;

        //console.dir($scope.project.Metadata);

        var promise = ProjectService.saveProject($scope.project);
            promise.$promise.then(function(){
                $scope.reloadProject();
                $modalInstance.dismiss();
        });

    };


    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
  }
];



