//in project-detail.js there is a grid to display the correspondence event items.
//  each event can expand and show its items. this renderer provides that detail grid view.

var FileListCellTemplate = function (params) {
    var files = getEventFilesArray(params.node.data.EventFiles);  
    var list = '<div class="event-file-list"><ul>';

    files.forEach(function (file) {
        list += '<li>' + file.Name + '</li>';
    });

    list += '</ul></div>';

    return list;
};


//this template gives the Edit|Delete|Add for the detail.
var EditDetailLinksTemplate = function (detailparam) {
    var scope = angular.rootScope.scope;

    var div = document.createElement('div');

    var editBtn = document.createElement('a'); editBtn.href = '#'; editBtn.innerHTML = 'Edit';
    editBtn.addEventListener('click', function (event) {
        event.preventDefault();
        
        scope.openCorrespondenceEventForm(scope.viewSubproject, detailparam.data); //parent subproject, detail line.
    });
    div.appendChild(editBtn);
    div.appendChild(document.createTextNode("|"));

    var delBtn = document.createElement('a'); delBtn.href = '#'; delBtn.innerHTML = 'Delete';
    delBtn.addEventListener('click', function (event) {
        event.preventDefault();
        //scope.removeViewSubproject(param.data);
    });
    div.appendChild(delBtn);
    div.appendChild(document.createTextNode("|"));

    var addBtn = document.createElement('a'); addBtn.href = '#'; addBtn.innerHTML = 'Add';
    addBtn.addEventListener('click', function (event) {
        event.preventDefault();
        //scope.openCorrespondenceEventForm(param.data);
    });
    div.appendChild(addBtn);

    return div;
    /* can't do angular stuff in here unless we enable it as an angular grid... let's see if we can do without...
    return '<div project-role="editor">' +
                '<a ng-click="editViewSubproject();">Edit</a>|' +
                '<a ng-click="removeViewSubproject();">Delete</div>|' + 
                '<a ng-click="openCorrespondenceEventForm();">Add</div>' +
        '</div>';
        */
};


var detailColumnDefs = [
    {
        headerName: '', width: 100, cellRenderer: EditDetailLinksTemplate
    },
    {
        headerName: 'Notice Date', field: 'CorrespondenceDate', width: 120, cellClass: 'event-record-cell',
        valueFormatter: function (params) {
            if (params.node.data.CorrespondenceDate !== undefined && params.data.CorrespondenceDate !== null)
                return moment(params.node.data.CorrespondenceDate).format('L');
        },
        sort: 'desc'
    },
    { headerName: 'Notice Type', field: 'CorrespondenceType', cellClass: 'event-record-cell', width: 150 },
    { headerName: 'Type of Response', field: 'ResponseType', cellClass: 'event-record-cell', width: 150 },
    { headerName: 'Days to Respond', field: 'NumberOfDays', cellClass: 'event-record-cell', width: 100 },

    {
        field: 'ResponseDate',
        headerName: 'Date of Response',
        width: 120,
        valueFormatter: function (params) {
            if (params.data.ResponseDate !== undefined && params.data.ResponseDate !== null)
                return moment(params.node.data.ResponseDate).format('L');
        }
    },
    { headerName: 'Technician', field: 'StaffMember', cellClass: 'event-record-cell', width: 150 },
    {
        headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 300, cellStyle: {
            'white-space': 'normal'
        }
    },
    { headerName: 'Documents', field: 'EventFiles', width: 300, cellRenderer: FileListCellTemplate },
    
    //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
];

function CorrespondenceDetailCellRenderer() { }

CorrespondenceDetailCellRenderer.prototype.init = function (params) {
    //console.log("init on detail renderer! ----------------------------------");
    // trick to convert string of html into dom object
    var eTemp = document.createElement('div');
    eTemp.innerHTML = this.getTemplate(params);
    this.eGui = eTemp.firstElementChild;

    this.setupDetailGrid(params.data);
    this.consumeMouseWheelOnDetailGrid();
    //this.addSearchFeature();
    //this.addButtonListeners();
};

CorrespondenceDetailCellRenderer.prototype.setupDetailGrid = function (eventRecords) {
    //console.log("setting up the detail grid... ------------- incoming params.data");
    //console.dir(eventRecords);

    this.detailGridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        //rowSelection: 'single',
        //onSelectionChanged: function (params) {
        //    console.log("selection changed!");
            //scope.agGridOptions.selectedItems = scope.agGridOptions.api.getSelectedRows();
            //scope.$apply(); //trigger angular to update our view since it doesn't monitor ag-grid
        //},
        //onFilterModified: function () {
        //    scope.agGridOptions.api.deselectAll();
        //},
        //selectedItems: [],
        rowData: eventRecords,
        columnDefs: detailColumnDefs,
        onGridReady: function (params) {
            //setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
        },
        getRowHeight: function (params) {
            var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
            var comment_height = 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
            var file_height = 25 * (getEventFilesArray(params.data.EventFiles).length); //count up the number of file lines we will have.
            return (comment_height > file_height) ? comment_height : file_height;
        },
        //onRowClicked: function (row) {
            //console.dir(row);

        //    row.node.setSelected(true);
        //    console.log("detail selected!");
        //},
        //defaultColDef: {
        //    editable: true
        //},
        //enableRangeSelection: true
    };
/*
    this.detailGridOptions.api.addEventListener('rowDoubleClicked', function (row) {
        console.log("double clicked!");
        console.dir(row);
        alert("Do you want to edit this row?");

    });
    */

    var eDetailGrid = this.eGui.querySelector('.full-width-grid');
    //.log("did we find the element?");
    //console.dir(eDetailGrid);
    new agGrid.Grid(eDetailGrid, this.detailGridOptions);
    //console.dir(eDetailGrid);

};

CorrespondenceDetailCellRenderer.prototype.getTemplate = function (params) {

    var parentRecord = params.node.parent.data;

    var template =
        '<div class="full-width-panel">' +
        '  <div class="full-width-grid"></div>' +
        '</div>';
    console.dir(template);
    return template;
};


CorrespondenceDetailCellRenderer.prototype.getGui = function () {
    return this.eGui;
};

CorrespondenceDetailCellRenderer.prototype.destroy = function () {
    this.detailGridOptions.api.destroy();
};

/*
CorrespondenceDetailCellRenderer.prototype.addSearchFeature = function () {
    var tfSearch = this.eGui.querySelector('.full-width-search');
    var gridApi = this.detailGridOptions.api;

    var searchListener = function () {
        var filterText = tfSearch.value;
        gridApi.setQuickFilter(filterText);
    };

    tfSearch.addEventListener('input', searchListener);
};

CorrespondenceDetailCellRenderer.prototype.addButtonListeners = function () {
    var eButtons = this.eGui.querySelectorAll('.full-width-grid-toolbar button');

    for (var i = 0; i < eButtons.length; i++) {
        eButtons[i].addEventListener('click', function () {
            window.alert('Sample button pressed!!');
        });
    }
};
*/

// if we don't do this, then the mouse wheel will be picked up by the main
// grid and scroll the main grid and not this component. this ensures that
// the wheel move is only picked up by the text field
CorrespondenceDetailCellRenderer.prototype.consumeMouseWheelOnDetailGrid = function () {
    var eDetailGrid = this.eGui.querySelector('.full-width-grid');

    var mouseWheelListener = function (event) {
        event.stopPropagation();
    };

    // event is 'mousewheel' for IE9, Chrome, Safari, Opera
    eDetailGrid.addEventListener('mousewheel', mouseWheelListener);
    // event is 'DOMMouseScroll' Firefox
    eDetailGrid.addEventListener('DOMMouseScroll', mouseWheelListener);
};

//return an array from the eventfiles.
function getEventFilesArray(EventFiles)
{
    if (EventFiles === undefined || EventFiles === null)
        return [];

    var files = angular.fromJson(EventFiles);
    return (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make an empty array
    
}