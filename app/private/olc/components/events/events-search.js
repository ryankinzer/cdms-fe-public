//page for searching OLC Events.

var events_search = ['$scope', '$timeout', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$uibModal', 'ServiceUtilities', 'ConvertStatus', '$rootScope', '$routeParams',
    function ($scope, $timeout, SubprojectService, ProjectService, DatasetService, CommonService, UserService, $modal,
        ServiceUtilities, ConvertStatus, $rootScope, $routeParams) {
        //console.log("Inside tab events controller...");

        $scope.dataset = DatasetService.getDataset($routeParams.Id);

        $scope.metafields = CommonService.getMetadataProperties(METADATA_ENTITY_OLCEVENTS);
        $scope.metafields.$promise.then(function () { 
            //console.dir($scope.metafields);
            $scope.metafields.forEach(function (field) { 
                field.PossibleValues = getParsedMetadataValues(field.PossibleValues);
            });
            
        });

        $scope.getMetafield = function (in_name) { 
            if (!in_name)
                return null;

            var field = getByName($scope.metafields, in_name);
            if (!field)
                return null;

            return field.PossibleValues;
        };

        $scope.dataset.$promise.then(function () {
            $scope.project = ProjectService.getProject($scope.dataset.ProjectId);

            $scope.project.$promise.then(function () {

                if ($scope.project.Name === "Office of Legal Counsel") {
                    $scope.Users = ProjectService.getOlcStaff();
                }

                var ag_grid_div = document.querySelector('#olc-search-grid');    //get the container id...
                //console.dir(ag_grid_div);
                $scope.ag_grid = new agGrid.Grid(ag_grid_div, $scope.olcAgGridOptions); //bind the grid to it.
                $scope.olcAgGridOptions.api.showLoadingOverlay(); //show loading...

                $scope.subprojectList = SubprojectService.getOlcSubprojects();

                //if user can edit, unhide the edit links
                if ($rootScope.Profile.canEdit($scope.project)) {
                    $scope.olcAgGridOptions.columnApi.setColumnVisible("EditLinksMaster", true);
                    $scope.olcDetailGridOptions.columnDefs.unshift({ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 140, menuTabs: [] }); //add this column to the front of the detail grid cols
                }

                $scope.subprojectList.$promise.then( function () {
                    $scope.olcAgGridOptions.api.setRowData($scope.subprojectList);
                    $scope.refreshSubprojectLists();
                });

            });
        });


        
        //this is for the olc/subproject events tab below - might can move this all out sometime...
        //var otherAgencyTemplate = function (params) {
        //    if (params.node.data.Agency !== null || params.node.data.OtherAgency !== null) {
        //        return '<span>' + params.node.data.Agency + '</span>'
        //            + ((params.node.data.OtherAgency !== null) ? ('<span> (' + params.node.data.OtherAgency + ')</span>') : ''); //ternery: if otheragency then show it
        //    }
        //};
        

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.editOlcSubproject(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.removeOlcSubproject(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode(" | "));

            //var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Event';
            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Item';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openOlcEventForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
            
        };


        var FileListCellTemplate = function (params) {
            var list = '<div class="event-file-list"><ul>';

            var file_links = getSubprojectFilesArrayAsLinks($scope.project.Id, params.node.data.SubprojectId, params.node.data.FileAttach);

            file_links.forEach(function (link) {
                list += '<li>' + link + '</li>';
            });

            list += '</ul></div>';

            return list;
        };


        //this template gives the Edit|Delete|Add for the detail.
        var EditDetailLinksTemplate = function (detailparam) {
            var subproject = getById($scope.subprojectList, detailparam.data.SubprojectId);

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openOlcEventForm(subproject, detailparam.data); //parent subproject, detail line.
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.removeOlcEvent(subproject, detailparam.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode(" | "));

            //var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Item';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                $scope.openOlcEventForm(subproject, {});
            });
            div.appendChild(addBtn);

            return div;
            
        };


        //grid columns for OLC events tab (master/subprojects)
        $scope.olcAgColumnDefs = [  //in order the columns will display, by the way...
            { colId: 'EditLinksMaster', width: 180, cellRenderer: EditMasterLinksTemplate, menuTabs: [], hide: true },
            //{ colId: 'EditLinksMaster', width: 225, cellRenderer: EditMasterLinksTemplate, menuTabs: [], hide: true },
            {
                headerName: 'ID',
                field: 'Id',
                width: 80,
                cellRenderer: 'agGroupCellRenderer',
                cellRendererParams: { suppressCount: true },
                menuTabs: ['filterMenuTab'],
                filter: 'number'
            },
            {
                field: 'EffDt',
                headerName: 'Updated',
                width: 120,
                valueGetter: function (params) { return moment(params.node.data.EffDt) }, //date filter needs js date object			
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.EffDt);
                },
                sort: 'desc',
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            //{
            //    headerName: '# Events', width: 110,
            //    cellRenderer: EventCount,
            //    valueGetter: function (params) {
            //        return (params.data.OlcEvents !== undefined && params.data.OlcEvents.length > 0) ? params.data.OlcEvents.length : 0;
            //    },
            //    menuTabs: [],
            //},

            //{ field: 'CatalogNumber', headerName: 'Catalog Number', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'RecordGroup', headerName: 'Record Group', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'SeriesTitle', headerName: 'Series Title', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'FacilityHoused', headerName: 'Facility Housed', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'OtherFacilityHoused', headerName: 'Other Facility Housed', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Box', headerName: 'Box', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'BoxLocation', headerName: 'Box Location', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'CategoryTitle', headerName: 'Category Title', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'CategoryIndex', headerName: 'Category Index', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'CategorySubtitle', headerName: 'CategorySubtitle', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryTitle', headerName: 'Signatory Title', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryAgency', headerName: 'Signatory Agency', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryName', headerName: 'Signatory Name', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'ByUserId', headerName: 'By User', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: 'By User',
                field: 'ByUser',
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return params.node.data.ByUserId },
                valueFormatter: function (params) {
                    params.node.data.ByUserId = JSON.parse(params.node.data.ByUserId);
                    var the_str = getNameFromUserId(params.node.data.ByUserId, $scope.Users);
                    if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        the_str = the_str.replace(/"/g, '');
                    return the_str;
                },
                width: 180, menuTabs: ['filterMenuTab'],
            },

            //{
            //    //note: white-space here causes word-wrap
            //    field: 'Comments', headerName: 'Comments', width: 380, cellStyle: { 'white-space': 'normal' }, menuTabs: ['filterMenuTab'], filter: 'text'
            //},
        ];

        //details for the event
        var detailColumnDefs = [
            //{ colId: 'EditLinksDetail', headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate, menuTabs: [], },
            {
                headerName: 'Document Date',
                field: 'DocumentDate',
                width: 160,
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return moment(params.node.data.DocumentDate) }, //date filter needs js date object			
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.DocumentDate);
                },
                sort: 'desc',
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: 'Document Type', field: 'DocumentType', cellClass: 'event-record-cell', width: 150, menuTabs: ['filterMenuTab'], },
            { headerName: 'File Name', field: 'FileName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Author', field: 'Author', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            //{ headerName: 'Author Agency', field: 'AuthorAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Agency Division', field: 'AgencyDivision', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Signatory Name', field: 'SignatoryName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Signatory Title', field: 'SignatoryTitle', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Recipient Name', field: 'RecipientName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'RecipientTitle', field: 'RecipientTitle', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Recipient Name', field: 'RecipientName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Recipient Title', field: 'RecipientTitle', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Recipient Agency', field: 'RecipientAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Recipient Location', field: 'RecipientLocation', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            //{ headerName: 'Boundary', field: 'Boundary', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Boundary',
                field: 'Boundary',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.Boundary },			
                valueFormatter: function (params) {
                    params.node.data.Boundary = JSON.parse(params.node.data.Boundary);
                    var the_str = valueFormatterArrayToList(params.node.data.Boundary);
                    if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        the_str = the_str.replace(/"/g, '');
                    return the_str;
                },
                menuTabs: ['filterMenuTab']
            },
            //{ headerName: 'Significant Area', field: 'SignificantArea', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Significant Area',
                field: 'SignificantArea',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.SignificantArea },
                valueFormatter: function (params) {
                    params.node.data.SignificantArea = JSON.parse(params.node.data.SignificantArea);
                    var the_str = valueFormatterArrayToList(params.node.data.SignificantArea);
                    if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        the_str = the_str.replace(/"/g, '');
                    return the_str;
                },
                menuTabs: ['filterMenuTab']
            },
            //{ headerName: 'Miscellaneous Context', field: 'MiscellaneousContext', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Miscellaneous Context',
                field: 'MiscellaneousContext',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.MiscellaneousContext },
                valueFormatter: function (params) {
                    params.node.data.MiscellaneousContext = JSON.parse(params.node.data.MiscellaneousContext);
                    var the_str = valueFormatterArrayToList(params.node.data.MiscellaneousContext);
                    if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        the_str = the_str.replace(/"/g, '');
                    return the_str;
                },
                menuTabs: ['filterMenuTab']
            },
            { headerName: 'Survey Number', field: 'SurveyNumber', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Survey Contract Number', field: 'SurveyContractNumber', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Surveyor Name', field: 'SurveyorName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Survey Authorizing Agency', field: 'SurveyAuthorizingAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Survey Dates', field: 'SurveyDates', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Description', field: 'Description', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'TwnRngSec', field: 'TwnRngSec', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'NumberItems', field: 'NumberItems', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },

            {
                field: 'DateDiscovered',
                headerName: 'Date Discovered',
                valueGetter: function (params) { return moment(params.node.data.DateDiscovered) }, //date filter needs js date object			
                width: 150,
                valueFormatter: function (params) {
                    return valueFormatterDate(params.node.data.DateDiscovered);
                },
                filter: 'date',
                menuTabs: ['filterMenuTab'],
            },
            { headerName: 'Person Discovered', field: 'PersonDiscovered', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Reference', field: 'Reference', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },

            {
                //headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 380, cellStyle: {
                headerName: 'Tasks', field: 'Tasks', cellClass: 'event-record-cell', width: 380, cellStyle: {
                    'white-space': 'normal'
                },
                menuTabs: ['filterMenuTab'], filter: 'text'
            },

            //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
            { headerName: 'File Attach', field: 'FileAttach', width: 330, cellRenderer: FileListCellTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: 'Documents', field: 'EventFiles', width: 330, cellRenderer: FileListCellTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: 'By User', field: 'ByUserId', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'By User',
                field: 'ByUser',
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return params.node.data.ByUserId },
                valueFormatter: function (params) {
                    params.node.data.ByUserId = JSON.parse(params.node.data.ByUserId);
                    var the_str = getNameFromUserId(params.node.data.ByUserId, $scope.Users);
                    if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        the_str = the_str.replace(/"/g, '');
                    return the_str;
                },
                width: 180, menuTabs: ['filterMenuTab'],
            },
        ];

        //detail grid options correspondence events
        $scope.olcDetailGridOptions = {
            columnDefs: detailColumnDefs,
            onGridReady: function (params) {
                //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
            },
            getRowHeight: function (params) {
                //var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
                var comment_length = (params.data.Tasks === null) ? 1 : params.data.Tasks.length;
                var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                var file_height = 25 * (getFilesArrayAsList(params.data.EventFiles).length); //count up the number of file lines we will have.
                return (comment_height > file_height) ? comment_height : file_height;
            },

            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };



        $scope.olcAgGridOptions = {

            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: $scope.olcDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.OlcEvents);
                },
            },

            animateRows: true,
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: $scope.olcAgColumnDefs,
            rowData: null,
            //filterParams: { apply: true }, //enable option: doesn't do the filter unless you click apply
            //debug: true,
            rowSelection: 'single',
            onSelectionChanged: function (params) {
                console.log("selection changed fired!");
            },

            selectedItems: [],

            onGridReady: function (params) {
                //params.api.sizeColumnsToFit();
            },

            /*getRowHeight: function (params) {
                var rowIsDetailRow = params.node.level === 1;
                // return dynamic height when detail row, otherwise return 25
                if (rowIsDetailRow) {
                    return 300;
                } else {
                    var comment_length = (params.data.Comments === null) ? 1 : params.data.Comments.length;
                    return 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
                }
                //return rowIsDetailRow ? 200 : 25;
            },
            */
            onRowDoubleClicked: function (row) {
                $scope.olcAgGridOptions.api.collapseAll();
                row.node.setSelected(true);
                row.node.setExpanded(true);
            },
            onRowClicked: function (row) {
                row.node.setSelected(true);
            },
            defaultColDef: {
                sortable: true,
                resizable: true,
            },

        };





        //returns the (last) node or null if none found.
        $scope.expandSubProjectById = function (id_in) {
            var the_node = null;
            $scope.olcAgGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    //console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };







        /****** Working on this area ******/
        //refresh all of the project match lists
        $scope.refreshSubprojectLists = function () {
            console.log("Inside events.js, $scope.refreshSubprojectList...");

            //$scope.subprojectList.forEach(function (subp) {
            //    console.log("subp is next...");
            //    console.dir(subp);
            //    subp.OlcEvents.forEach(function (olcE) {
            //    });
            //});


            $scope.project.SubprojectFileList = SubprojectService.getOlcSubprojectFiles($scope.project.Id); //TODO: we already have this as $scope.project.SubprojectFiles once the files load in project-detail.js

        };
        /**********************************/

        $scope.editOlcSubproject = function (subproject) {
            //console.log("editOlcSubproject...");

            $rootScope.viewSubproject = $scope.viewSubproject = subproject;

            var modalInstance = $modal.open({
                    templateUrl: 'app/private/olc/components/events/templates/modal-create-subproject.html',
                    controller: 'ModalCreateOlcSubprojectCtrl',
                    $scope: $scope, //very important to pass the $scope along...
            });
        };
		
        $scope.redrawRows = function () {
            $scope.olcAgGridOptions.api.setRowData([]);
            setTimeout(function () { $scope.olcAgGridOptions.api.setRowData($scope.subprojectList); }, 4000);
        };

        $scope.refreshCells = function () {
            $scope.olcAgGridOptions.api.refreshCells();
        };

        $scope.refreshMemory = function () {
            $scope.olcAgGridOptions.api.refreshInMemoryRowModel('group');
        };

        //handle favorite toggle
        $scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
        $scope.toggleFavorite = function () { 
            UserService.toggleFavoriteDataset($scope, $rootScope); 
        }

    }
];
