var modal_choose_summary_images = ['$scope','$modalInstance', 'DatasetService','DatastoreService',
  function($scope,  $modalInstance, DatasetService, DatastoreService){

     var galleryLinkTemplate = '<a href="{{row.getProperty(\'Link\')}}" target="_blank" title="{{row.getProperty(\'Link\')}}">' +
                                '<img ng-src="{{row.getProperty(\'Link\')}}" width="150px"/><br/><div class="ngCellText" ng-class="col.colIndex()">' +
                               '</a>' +
                               '</div>';
        $scope.chooseSummaryImagesSelection = [];
        
        $scope.chooseSummaryImagesGallery = {
            data: 'project.Images',
            columnDefs:
            [
                {field:'Name',displayName: 'File', cellTemplate: galleryLinkTemplate},
                {field: 'Title'},
                {field: 'Description'},
                //{field: 'Size'},
            ],
            multiSelect: true,
            selectedItems: $scope.chooseSummaryImagesSelection

        };
    

    $scope.save = function(){

        if($scope.chooseSummaryImagesSelection.length == 0)
        {
            alert("Please choose at least one image to save by clicking on it and try again.");
            return;
        }

        //is there already a metadata record?
        var imgmd = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE, "MetadataPropertyId");
        var imgmd_html = getByField($scope.project.Metadata, METADATA_PROPERTY_SUMMARYIMAGE_HTML, "MetadataPropertyId");

        if(!imgmd)
        {
            imgmd = {   MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd);
        }

        if(!imgmd_html)
        {
            imgmd_html = {  MetadataPropertyId: METADATA_PROPERTY_SUMMARYIMAGE_HTML, UserId: $scope.Profile.Id  };
            $scope.project.Metadata.push(imgmd_html);
        }        

        var selections = [];
        var the_html = "";

        for (var i = $scope.chooseSummaryImagesSelection.length - 1; i >= 0; i--) {
            var selection = $scope.chooseSummaryImagesSelection[i];

            //whip up the html .. might be good to have this in a pattern somewhere external!
            the_html += "<div class='selected-image-div'>";
                the_html += "<img src='" + selection.Link + "' class='selected-image'>";
                if (selection.Description)
                    the_html += "<p>" + selection.Description + "</p>";
                the_html += "</div>";

            selections.push(selection.Id);

        }

        imgmd_html.Values = the_html;
        imgmd.Values = selections.toString();

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