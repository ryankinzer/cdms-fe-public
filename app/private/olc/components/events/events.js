//page for OLC Events.

var page_events = ['$scope', '$timeout', 'SubprojectService', 'ProjectService', 'DatasetService', 'CommonService', 'UserService',
    '$uibModal', 'ServiceUtilities', 'ConvertStatus', '$rootScope', '$routeParams',
    function (scope, $timeout, SubprojectService, ProjectService, DatasetService, CommonService, UserService, $modal,
        ServiceUtilities, ConvertStatus, $rootScope, $routeParams) {
        //console.log("Inside tab events controller...");

        scope.dataset = DatasetService.getDataset($routeParams.Id);

        scope.metafields = CommonService.getMetadataProperties(METADATA_ENTITY_OLCEVENTS);
        scope.metafields.$promise.then(function () { 
            //console.dir(scope.metafields);
            scope.metafields.forEach(function (field) { 
                field.PossibleValues = getParsedMetadataValues(field.PossibleValues);
            });
            
        });

        scope.getMetafield = function (in_name) { 
            if (!in_name)
                return null;

            var field = getByName(scope.metafields, in_name);
            if (!field)
                return null;

            return field.PossibleValues;
        };

        scope.dataset.$promise.then(function () {
            scope.project = ProjectService.getProject(scope.dataset.ProjectId);

            scope.project.$promise.then(function () {

                if (scope.project.Name === "Office of Legal Counsel") {
                    scope.Users = ProjectService.getOlcStaff();
                }

                var ag_grid_div = document.querySelector('#olc-events-grid');    //get the container id...
                //console.dir(ag_grid_div);
                scope.ag_grid = new agGrid.Grid(ag_grid_div, scope.olcAgGridOptions); //bind the grid to it.
                scope.olcAgGridOptions.api.showLoadingOverlay(); //show loading...

                scope.subprojectList = SubprojectService.getOlcSubprojects();

                //if user can edit, unhide the edit links
                if ($rootScope.Profile.canEdit(scope.project)) {
                    scope.olcAgGridOptions.columnApi.setColumnVisible("EditLinksMaster", true);
                    scope.olcDetailGridOptions.columnDefs.unshift({ colId: 'EditLinksDetail', cellRenderer: EditDetailLinksTemplate, width: 140, menuTabs: [] }); //add this column to the front of the detail grid cols
                }

                scope.subprojectList.$promise.then(function () {
                    scope.subprojectList.forEach(function (spItem) {
                        var strSpFullName = getNameFromUserId(spItem.ByUserId, scope.Users);
                        if (typeof strSpFullName === 'string') //backwards compatible - remove the quotes
                            the_str = strSpFullName.replace(/"/g, '');
                        spItem.SpByUserFullName = strSpFullName;

                        spItem.OlcEvents.forEach(function (eItem) {
                            var strEvFullName = getNameFromUserId(eItem.ByUserId, scope.Users);
                            if (typeof strEvFullName === 'string') //backwards compatible - remove the quotes
                                the_str = strEvFullName.replace(/"/g, '');
                            eItem.EventByUserFullName = strEvFullName;
                        });
                    });

                    scope.olcAgGridOptions.api.setRowData(scope.subprojectList);
                    scope.refreshSubprojectLists();
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
        

        var EventCount = function (params) {
            if (params.node.data.OlcEvents === undefined || params.node.data.OlcEvents === null)
                return '0';

            return '' + params.node.data.OlcEvents.length;
        };

        var EditMasterLinksTemplate = function (param) {

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.editOlcSubproject(param.data);
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeOlcSubproject(param.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode(" | "));

            //var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Event';
            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Item';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openOlcEventForm(param.data, {});
            });
            div.appendChild(addBtn);

            return div;
            
        };


        var FileListCellTemplate = function (params) {
            var list = '<div class="event-file-list"><ul>';

            var file_links = getSubprojectFilesArrayAsLinks(scope.project.Id, params.node.data.SubprojectId, params.node.data.FileAttach);

            file_links.forEach(function (link) {
                list += '<li>' + link + '</li>';
            });

            list += '</ul></div>';

            return list;
        };


        //this template gives the Edit|Delete|Add for the detail.
        var EditDetailLinksTemplate = function (detailparam) {
            var subproject = getById(scope.subprojectList, detailparam.data.SubprojectId);

            var div = document.createElement('div');

            var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
            editBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openOlcEventForm(subproject, detailparam.data); //parent subproject, detail line.
            });
            div.appendChild(editBtn);
            div.appendChild(document.createTextNode(" | "));

            var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
            delBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.removeOlcEvent(subproject, detailparam.data);
            });
            div.appendChild(delBtn);
            div.appendChild(document.createTextNode(" | "));

            //var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
            var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add Item';
            addBtn.addEventListener('click', function (event) {
                event.preventDefault();
                scope.openOlcEventForm(subproject, {});
            });
            div.appendChild(addBtn);

            return div;
            
        };


        //grid columns for OLC events tab (master/subprojects)
        scope.olcAgColumnDefs = [  //in order the columns will display, by the way...
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
            {
                headerName: '# Events', width: 110,
                cellRenderer: EventCount,
                valueGetter: function (params) {
                    return (params.data.OlcEvents !== undefined && params.data.OlcEvents.length > 0) ? params.data.OlcEvents.length : 0;
                },
                menuTabs: [],
            },

            //{ field: 'CatalogNumber', headerName: 'Catalog Number', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Agency', headerName: 'Agency', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'AgencyLocation', headerName: 'AgencyLocation', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'RecordGroup', headerName: 'Record Group', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'SeriesTitle', headerName: 'Series Title', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'FacilityHoused', headerName: 'Facility Housed', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'OtherFacilityHoused', headerName: 'Other Facility Housed', width: 150, menuTabs: ['filterMenuTab'], filter: 'text' },
            { field: 'Box', headerName: 'Box', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'BoxLocation', headerName: 'Box Location', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'CategoryTitle', headerName: 'Category Title', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'LitigationCategory', headerName: 'Litigation Category', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'CategoryIndex', headerName: 'Category Index', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'CategorySubtitle', headerName: 'CategorySubtitle', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'FileUnit', headerName: 'File Unit', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            { field: 'SourceArchiveId', headerName: 'Archive Id', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryTitle', headerName: 'Signatory Title', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryAgency', headerName: 'Signatory Agency', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'SignatoryName', headerName: 'Signatory Name', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            //{ field: 'ByUserId', headerName: 'By User', width: 100, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: 'By User',
                field: 'SpByUserFullName',
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return params.node.data.SpByUserFullName },
                valueFormatter: function (params) {
                    //params.node.data.ByUserId = JSON.parse(params.node.data.ByUserId);
                    //var the_str = getNameFromUserId(params.node.data.ByUserId, scope.Users);
                    //if (typeof the_str === 'string') //backwards compatible - remove the quotes
                    //    the_str = the_str.replace(/"/g, '');
                    //return the_str;
                    return params.node.data.SpByUserFullName;
                },
                width: 180,
                menuTabs: ['filterMenuTab'],
                filter: 'text' 
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
            { headerName: 'Document Type', field: 'DocumentType', cellClass: 'event-record-cell', width: 150, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'File Name', field: 'FileName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: 'Description', field: 'Description', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Description', field: 'Description', cellRenderer: ItemListCellTemplate, width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: 'Author', field: 'Author', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Agency', field: 'EventAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: 'Author Agency', field: 'AuthorAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            { headerName: 'Agency Division', field: 'AgencyDivision', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Agency Location', field: 'EventAgencyLocation', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Signatory Name', field: 'SignatoryName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Signatory Title', field: 'SignatoryTitle', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Recipient Name', field: 'RecipientName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'RecipientTitle', field: 'RecipientTitle', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Recipient Agency', field: 'RecipientAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Recipient Location', field: 'RecipientLocation', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: 'Boundary', field: 'Boundary', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Boundary',
                field: 'Boundary',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.Boundary },			
                valueFormatter: function (params) {
                    // Note1:  Sometimes the value can be null
                    // Note2:  The first time through, the JSON object is a string and must be converted to an array.
                    // Note3:  The second time through, the value is already an array, so doing JSON.parse will cause JavaScript to die.
                    if (params.node.data.Boundary !== null) {
                        if (!isArray(params.node.data.Boundary))
                            params.node.data.Boundary = JSON.parse(params.node.data.Boundary);

                        //var the_str = valueFormatterArrayToList(params.node.data.Boundary);
                        //if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        //    the_str = the_str.replace(/"/g, '');

                        //var the_str = buildBulletedItemList(params.node.data.Boundary);
                        //return the_str;
                    }
                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text' 
            },
            //{ headerName: 'Significant Area', field: 'SignificantArea', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Significant Area',
                field: 'SignificantArea',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.SignificantArea },
                valueFormatter: function (params) {
                    if (params.node.data.SignificantArea !== null) {
                        if (!isArray(params.node.data.SignificantArea))
                            params.node.data.SignificantArea = JSON.parse(params.node.data.SignificantArea);

                //        var the_str = valueFormatterArrayToList(params.node.data.SignificantArea);
                //        if (typeof the_str === 'string') //backwards compatible - remove the quotes
                //            the_str = the_str.replace(/"/g, '');
                //        return the_str;

                    }
                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text' 
            },
            //{ headerName: 'Miscellaneous Context', field: 'MiscellaneousContext', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'Miscellaneous Context',
                field: 'MiscellaneousContext',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.MiscellaneousContext },
                valueFormatter: function (params) {
                    if (params.node.data.MiscellaneousContext !== null) {
                        if (!isArray(params.node.data.MiscellaneousContext))
                            params.node.data.MiscellaneousContext = JSON.parse(params.node.data.MiscellaneousContext);

                //        var the_str = valueFormatterArrayToList(params.node.data.MiscellaneousContext);
                //        if (typeof the_str === 'string') //backwards compatible - remove the quotes
                //            the_str = the_str.replace(/"/g, '');
                //        return the_str;
                    }
                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text' 
            },
            { headerName: 'Survey Number', field: 'SurveyNumber', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Survey Contract Number', field: 'SurveyContractNumber', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Surveyor Name', field: 'SurveyorName', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Survey Authorizing Agency', field: 'SurveyAuthorizingAgency', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: 'Survey Dates', field: 'SurveyDates', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: 'Survey Dates',
                field: 'SurveyDates',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.SurveyDates },
                valueFormatter: function (params) {
                    //console.log("typeof params.node.data.SurveyDates = " + typeof params.node.data.SurveyDates);
                    //if ((params.node.data.SurveyDates !== null) && (typeof params.node.data.SurveyDates !== 'string')) {
                    if (params.node.data.SurveyDates !== null) {
                        try {
                            params.node.data.SurveyDates = JSON.parse(params.node.data.SurveyDates);
                        }
                        catch (err) {
                            // The value is not JSON (possibly already an array, or a non-JSON string)
                            if (params.node.data.SurveyDates.indexOf(";") > -1) {
                                params.node.data.SurveyDates = params.node.data.SurveyDates.split(";");
                                params.node.data.SurveyDates.splice(-1, 1);

                            }
                        }

                        //var the_str = valueFormatterArrayToList(params.node.data.Boundary);
                        //if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        //    the_str = the_str.replace(/"/g, '');

                        //var the_str = buildBulletedItemList(params.node.data.Boundary);
                        //return the_str;
                    }
                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text'
            },
            //{ headerName: 'Description', field: 'Description', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            //{ headerName: 'TwnRngSec', field: 'TwnRngSec', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: 'text' },
            {
                headerName: 'TwnRngSec',
                field: 'TwnRngSec',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.TwnRngSec },
                valueFormatter: function (params) {
                    //console.log("typeof params.node.data.TwnRngSec = " + typeof params.node.data.TwnRngSec);
                    //if ((params.node.data.TwnRngSec !== null) && (typeof params.node.data.TwnRngSec !== 'string')) {
                    if (params.node.data.TwnRngSec !== null) {
                        try {
                            params.node.data.TwnRngSec = JSON.parse(params.node.data.TwnRngSec);
                        }
                        catch (err) {
                            // The value is not JSON (possibly already an array, or a non-JSON string)
                            if (params.node.data.TwnRngSec.indexOf(";") > -1) {
                                params.node.data.TwnRngSec = params.node.data.TwnRngSec.split(";");
                                params.node.data.TwnRngSec.splice(-1, 1);

                            }
                        }

                        //var the_str = valueFormatterArrayToList(params.node.data.Boundary);
                        //if (typeof the_str === 'string') //backwards compatible - remove the quotes
                        //    the_str = the_str.replace(/"/g, '');

                        //var the_str = buildBulletedItemList(params.node.data.Boundary);
                        //return the_str;
                    }

                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text'
            },
            { headerName: 'Number Items', field: 'NumberItems', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            { headerName: 'Page Number', field: 'PageNumber', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
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
            { headerName: 'Person Discovered', field: 'PersonDiscovered', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: 'Reference', field: 'Reference', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            {
                headerName: 'Reference',
                field: 'Reference',
                cellClass: 'event-record-cell',
                width: 180,
                valueGetter: function (params) { return params.node.data.Reference },
                valueFormatter: function (params) {
                    //console.log("typeof params.node.data.Reference = " + typeof params.node.data.Reference);
                    if ((params.node !== null) && (params.node.data !== null) && (params.node.data.Reference !== null)) {
                        try {
                            params.node.data.Reference = JSON.parse(params.node.data.Reference);
                        }
                        catch (err) {
                            // The value is not JSON (possibly already an array, or a non-JSON string)
                            if (params.node.data.Reference.indexOf(";") > -1) {
                                params.node.data.Reference = params.node.data.Reference.split(";");
                                params.node.data.Reference.splice(-1, 1);

                            }
                        }
                    }

                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: true
            },
            {
                //headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 380, cellStyle: {
                headerName: 'Tasks',
                field: 'Tasks',
                cellClass: 'event-record-cell',
                width: 380,
                cellStyle: {
                    'white-space': 'normal'
                },
                valueGetter: function (params) { return params.node.data.Tasks },
                valueFormatter: function (params) {
                    //console.log("typeof params.node.data.Tasks = " + typeof params.node.data.Tasks);
                    if (params.node.data.Tasks !== null) {
                        try {
                            params.node.data.Tasks = JSON.parse(params.node.data.Tasks);
                        }
                        catch (err) {
                            // The value is not JSON (possibly already an array, or a non-JSON string)
                            if (params.node.data.Tasks.indexOf(";") > -1) {
                                params.node.data.Tasks = params.node.data.Tasks.split(";");
                                params.node.data.Tasks.splice(-1, 1);

                            }
                        }
                    }

                },
                cellRenderer: BulletedItemListCellTemplate,
                menuTabs: ['filterMenuTab'],
                filter: 'text'
            },

            //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
            { headerName: 'File Attach', field: 'FileAttach', width: 330, cellRenderer: FileListCellTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            { headerName: 'Archive Id', field: 'EventArchiveId', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], filter: true },
            //{ headerName: 'Documents', field: 'EventFiles', width: 330, cellRenderer: FileListCellTemplate, menuTabs: ['filterMenuTab'], filter: 'text' },
            //{ headerName: 'By User', field: 'ByUserId', cellClass: 'event-record-cell', width: 180, menuTabs: ['filterMenuTab'], },
            {
                headerName: 'By User',
                field: 'EventByUserFullName',
                cellClass: 'event-record-cell',
                valueGetter: function (params) { return params.node.data.EventByUserFullName },
                valueFormatter: function (params) {
                    //params.node.data.ByUserId = JSON.parse(params.node.data.ByUserId);
                    //var the_str = getNameFromUserId(params.node.data.ByUserId, scope.Users);
                    //if (typeof the_str === 'string') //backwards compatible - remove the quotes
                    //    the_str = the_str.replace(/"/g, '');
                    //return the_str;
                    return params.node.data.EventByUserFullName;
                },
                width: 180, menuTabs: ['filterMenuTab'],
                filter: 'text' 
            },
        ];

        //detail grid options correspondence events
        scope.olcDetailGridOptions = {
            columnDefs: detailColumnDefs,
            onGridReady: function (params) {
                //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
            },
            getRowHeight: function (params) {
                // Original way
                //var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
                // Notes...
                // When calculating on a free-text item (like comments), calculate like this:  25 * (Math.floor(Tasks_length / 45) + 1), allowing 45 chars per line.
                // When calculating on an array type of thing (a,b,c), or (a;b;c), calculated like this:  25 * (getFilesArrayAsList(params.data.FileAttach).length), putting each item on its own line.
                //var Tasks_length = (params.data.Tasks === null) ? 1 : params.data.Tasks.length;
                //var Tasks_height = 25 * (Math.floor(Tasks_length / 45) + 1); //base our detail height on the Tasks (comments) field.  We allow 45 chars per line.
                var Tasks_height = 25 * (getFilesArrayAsList(params.data.Tasks).length); //base our detail height on the Tasks (comments) field.
                var file_height = 25 * (getFilesArrayAsList(params.data.FileAttach).length); //count up the number of file lines we will have.
                var description_height = 25 * (getProjectItemsArrayAsTextList(params.data.Description).length);
                var boundary_height = 25 * (getProjectItemsArrayAsTextList(params.data.Boundary).length);
                var significantArea_height = 25 * (getProjectItemsArrayAsTextList(params.data.SignificantArea).length);
                var miscellaneoudContext_height = 25 * (getProjectItemsArrayAsTextList(params.data.MiscellaneousContext).length);
                var twnRngSec_height = 25 * (getProjectItemsArrayAsTextList(params.data.TwnRngSec).length);
                var reference_height = 25 * (getProjectItemsArrayAsTextList(params.data.Reference).length);
                var surveyDates_height = 25 * (getProjectItemsArrayAsTextList(params.data.SurveyDates).length);

                // Check the height required for the fields, to find the one that requires the most space.
                // Note:
                // If the user does not enter any of the items that we use to calculate the row height (below), the result will be zero.
                // Therefore, we must default the row height to the height for one row; if we set it to one or zero, the row will be there,
                // but the user/developer will not be able to see it.
                var maxHeight = 25; // Default the row height to one row to start with.
                if (Tasks_height > maxHeight)
                    maxHeight = Tasks_height;

                if (file_height > maxHeight)
                    maxHeight = file_height;

                if (description_height > maxHeight)
                    maxHeight = description_height;

                if (boundary_height > maxHeight)
                    maxHeight = boundary_height;

                if (significantArea_height > maxHeight)
                    maxHeight = significantArea_height;

                if (miscellaneoudContext_height > maxHeight)
                    maxHeight = miscellaneoudContext_height;

                if (twnRngSec_height > maxHeight)
                    maxHeight = twnRngSec_height;

                if (reference_height > maxHeight)
                    maxHeight = reference_height;

                if (surveyDates_height > maxHeight)
                    maxHeight = surveyDates_height;

                //return (Tasks_height > file_height) ? Tasks_height : file_height;
                return maxHeight;
            },

            defaultColDef: {
                sortable: true,
                resizable: true,
            },
        };



        scope.olcAgGridOptions = {

            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: scope.olcDetailGridOptions,
                getDetailRowData: function (params) {
                    params.successCallback(params.data.OlcEvents);
                },
            },

            animateRows: true,
            //enableSorting: true,
            //enableFilter: true,
            //enableColResize: true,
            showToolPanel: false,
            columnDefs: scope.olcAgColumnDefs,
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
                scope.olcAgGridOptions.api.collapseAll();
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



        //if you are creating a new one for the project, the ce_row should be empty {}
        // if you are editing an existing one, send in the project and the ce_row.
        scope.openOlcEventForm = function (subproject, event_row) {
            //console.log("Inside openOlcEventForm...")

            $rootScope.viewSubproject = scope.viewSubproject = subproject;
            //console.log("ok subproject set: ");
            //console.dir(scope.viewSubproject);

            scope.event_row = event_row;

            var modalInstance = $modal.open({
                templateUrl: 'app/private/olc/components/events/templates/modal-new-olcEvent.html',
                controller: 'ModalAddOlcEventCtrl',
                scope: scope, //very important to pass the scope along...
                backdrop: "static",
                keyboard: false
            });
        };

        scope.removeOlcSubproject = function (subproject) {
            //console.log("Inside removeOlcSubproject, scope is next...");

            if (!subproject)
                return;

            scope.viewSubproject = subproject;

            if (scope.viewSubproject.OlcEvents.length > 0) {
                alert("This project has associated OLC events.  Those must be deleted first.");
            } else {
                scope.verifyAction = "Delete";
                scope.verifyingCaller = "OlcSubproject";
                //console.log("scope.verifyAction = " + scope.verifyAction + ", scope.verifyingCaller = " + scope.verifyingCaller + ", scope.viewSubproject.Id = " + scope.viewSubproject.Id);
                var modalInstance = $modal.open({
                    templateUrl: 'app/core/common/components/modals/templates/modal-verifyAction.html',
                    controller: 'ModalVerifyActionCtrl',
                    scope: scope, //very important to pass the scope along...
                });
            }
        };

        scope.postRemoveSubprojectUpdateGrid = function () {
            //the scope.subproject is the one we removed.
            console.log("ok - we removed one so update the grid...");

            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === scope.viewSubproject.Id) {
                    scope.subprojectList.splice(index, 1);
                    //console.log("ok we removed :" + index);
                    //console.dir(scope.subprojectList[index]);
                    scope.olcAgGridOptions.api.setRowData(scope.subprojectList);
                    //scope.corrAgGridOptions.api.redrawRows();
                    //console.log("done reloading grid.");
                }
            });
        };

        //called by the modal once the correspondence event is successfully saved.
        scope.postEditOlcEventUpdateGrid = function (edited_event) {
            console.log("editOlcEvent..." + edited_event.Id + " for subproject " + edited_event.SubprojectId);

            //edit our event item and then reload the grid.
            scope.subprojectList.forEach(function (item, index) {
                if (item.Id === edited_event.SubprojectId) {
                    item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort. - this was already updated in the be
                    item.OlcEvents.forEach(function (event_item, event_item_index) {
                        if (event_item.Id === edited_event.Id) {
                            angular.extend(event_item, edited_event); //replace the data for that item
                            //console.log("OK!! we edited that correspondence event");
                        }
                    });
                }
            });

            scope.olcAgGridOptions.api.setRowData(scope.subprojectList);

            //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
            var the_node = scope.expandSubProjectById(edited_event.SubprojectId);
            if (the_node !== null)
                scope.olcAgGridOptions.api.ensureNodeVisible(the_node);

            console.log("done reloading grid after removing item.");

        };

        //called by the modal once a olc event (edit) is saved
        scope.postAddOlcEventUpdateGrid = function (new_event) {
            //console.dir(new_event);
            console.log("saving OLC event for " + new_event.SubprojectId);

            // EventByUserFullName is not stored; we set it so that we display the ByUser name, rather than the ByUserId.
            // Therefore, we must add it to new_event, before we add new_event to the Subproject list.
            new_event.EventByUserFullName = getNameFromUserId(new_event.ByUserId, scope.Users);

            var subproject = getById(scope.subprojectList, new_event.SubprojectId);

            if (subproject === undefined || subproject === null) { //TODO: the case where they create items before the project is saved?
                console.log("no subproject...");
            } else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === subproject.Id) {
                        item.EffDt = moment(new Date()).format() + ""; //touch the effdt to bump the sort - this was already updated in the be
                        item.OlcEvents.push(new_event);
                        //console.log("Added event " + new_event.Id + " to " + subproject.Id);
                    }
                });
                scope.olcAgGridOptions.api.setRowData(scope.subprojectList);

                //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                var the_node = scope.expandSubProjectById(subproject.Id);
                if (the_node !== null)
                    scope.olcAgGridOptions.api.ensureNodeVisible(the_node);

                console.log("done reloading grid after adding or removing item.");
            }
        };

        //returns the (last) node or null if none found.
        scope.expandSubProjectById = function (id_in) {
            var the_node = null;
            scope.olcAgGridOptions.api.forEachNode(function (node) {
                if (node.data.Id === id_in) {
                    //console.log("Expanding! " + id_in);
                    node.setExpanded(true);
                    the_node = node;
                }
            });
            return the_node;
        };

        //removes the correspondence event and then updates the grid
        scope.removeOlcEvent = function (subproject, event) {
            console.log("removeOlcEvent..." + event.Id + " for subproject " + subproject.Id);

            if (confirm('Are you sure that you want to delete this OLC Event?')) {
                var promise = SubprojectService.removeOlcEvent(scope.project.Id, subproject.Id, event.Id, scope.DatastoreTablePrefix);

                promise.$promise.then(function () {
                    //remove from our subprojectList and then reload the grid.
                    scope.subprojectList.forEach(function (item, index) {
                        if (item.Id === subproject.Id) {
                            item.OlcEvents.forEach(function (event_item, event_item_index) {
                                if (event_item.Id === event.Id) {
                                    item.OlcEvents.splice(event_item_index, 1);
                                    //console.log("OK!! we removed that OLC event");
                                }
                            });
                        }
                    });
                    scope.olcAgGridOptions.api.setRowData(scope.subprojectList);

                    //after we setRowData, the grid collapses our expanded item. we want it to re-expand that item and make sure it is visible.
                    var the_node = scope.expandSubProjectById(subproject.Id);
                    if (the_node !== null)
                        scope.olcAgGridOptions.api.ensureNodeVisible(the_node);

                    console.log("done reloading grid after removing item.");
                });
            }
        };

        //fired after a user saves a new or edited project.
        // we update the item in the main subproject array and then refresh the grid.
        scope.postSaveSubprojectUpdateGrid = function (the_promise) {
            //console.log("ok - we saved so update the grid...");
            //var total = scope.subprojectList.length;
            var total = scope.subprojectList.length;
            var count = 0;
            var updated = false;

            if (total === 0) {
                the_promise.OlcEvents = [];
                the_promise.Files = [];
                scope.subprojectList.push(the_promise); //add that item
                scope.olcAgGridOptions.api.setRowData([]);
                scope.olcAgGridOptions.api.setRowData(scope.subprojectList);
            }
            else {
                scope.subprojectList.forEach(function (item, index) {
                    if (item.Id === the_promise.Id) {
                        updated = true;
                        //console.log("ok we found a match! -- updating! before:");
                        //console.dir(scope.subprojectList[index]);

                        if (the_promise.OlcEvents !== undefined)
                            delete the_promise.OlcEvents; //remove this before the copy.

                        angular.extend(scope.subprojectList[index], the_promise); //replace the data for that item
                        //console.log("ok we found a match! -- updating! after:");
                        //console.dir(scope.subprojectList[index]);
                        scope.olcAgGridOptions.api.redrawRows();
                        //console.log("done reloading grid.");
                    }
                    count++;
                    if (count === total && updated === false) //if we get all done and we never found it, lets add it to the end.
                    {
                        //console.log("ok we found never a match! -- adding!");
                        the_promise.OlcEvents = [];
                        the_promise.Files = [];
                        scope.subprojectList.push(the_promise); //add that item
                        scope.olcAgGridOptions.api.setRowData([]);
                        scope.olcAgGridOptions.api.setRowData(scope.subprojectList);

                        //console.log("done reloading grid.");
                    }
                });
            }
            console.log("updated the list and the grid... now refreshing the OLC lists");
            //scope.refreshSubprojectLists(); //counties, etc.
        };

        //opens create olc subproject modal
        scope.createOlcSubproject = function () {
            scope.viewSubproject = null;
            scope.createNewSubproject = true;
            //scope.subprojectList = null;
            scope.subprojectOptions = null;
            //console.log("scope.createNewSubproject = " + scope.createNewSubproject);
            var modalInstance = $modal.open({
                templateUrl: 'app/private/olc/components/events/templates/modal-create-subproject.html',
                controller: 'ModalCreateOlcSubprojectCtrl',
                scope: scope, //very important to pass the scope along...
            });
        };

        /****** Working on this area ******/
        //refresh all of the project match lists
        scope.refreshSubprojectLists = function () {
            console.log("Inside events.js, scope.refreshSubprojectList...");

            //scope.subprojectList.forEach(function (subp) {
            //    console.log("subp is next...");
            //    console.dir(subp);
            //    subp.OlcEvents.forEach(function (olcE) {
            //    });
            //});


            scope.project.SubprojectFileList = SubprojectService.getOlcSubprojectFiles(scope.project.Id); //TODO: we already have this as scope.project.SubprojectFiles once the files load in project-detail.js

        };
        /**********************************/

        scope.editOlcSubproject = function (subproject) {
            //console.log("editOlcSubproject...");

            $rootScope.viewSubproject = scope.viewSubproject = subproject;

            var modalInstance = $modal.open({
                    templateUrl: 'app/private/olc/components/events/templates/modal-create-subproject.html',
                    controller: 'ModalCreateOlcSubprojectCtrl',
                    scope: scope, //very important to pass the scope along...
                    backdrop: "static",
                    keyboard: false
            });
        };

        scope.search = function (p) {
            console.log("Inside scope.search...");
            //location.path = "#!/olceventssearch/" + scope.project.Id;
            window.location.replace("#!/olceventssearch/" + scope.dataset.Id);

            //var modalInstance = $modal.open({
            //    templateUrl: 'app/private/olc/components/events/templates/events-search.html',
            //    controller: 'OlcEventsSearchCtrl',
            //    scope: scope, //very important to pass the scope along...
            //});
        };
		
        scope.redrawRows = function () {
            scope.olcAgGridOptions.api.setRowData([]);
            setTimeout(function () { scope.olcAgGridOptions.api.setRowData(scope.subprojectList); }, 4000);
        };

        scope.refreshCells = function () {
            scope.olcAgGridOptions.api.refreshCells();
        };

        scope.refreshMemory = function () {
            scope.olcAgGridOptions.api.refreshInMemoryRowModel('group');
        };

        //handle favorite toggle
        scope.isFavorite = $rootScope.Profile.isDatasetFavorite($routeParams.Id);
        scope.toggleFavorite = function () { 
            UserService.toggleFavoriteDataset(scope, $rootScope); 
        }

    }
];
