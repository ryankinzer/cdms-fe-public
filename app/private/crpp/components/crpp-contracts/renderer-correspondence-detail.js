//in project-detail.js there is a grid to display the correspondence event items.
//  each event can expand and show its items. this renderer provides that detail grid view.

var FileListCellTemplate = function (params) {
    if (params.node.data.EventFiles === undefined || params.node.data.EventFiles === null)
        return;

    var files = angular.fromJson(params.node.data.EventFiles);    
    files = (files === null || !Array.isArray(files)) ? [] : files; //if it isn't an array, make it an empty array
    
    var list = '<div class="event-file-list"><ul>';

    files.forEach(function (file) {
        list += '<li>' + file.Name + '</li>';
    });

    list += '</ul></div>';

    return list;
};


var detailColumnDefs = [
    {
        headerName: 'Contact Date', field: 'CorrespondenceDate', width: 120, cellClass: 'event-record-cell',
        valueFormatter: function (params) {
            if (params.node.data.CorrespondenceDate !== undefined)
                return moment(params.node.data.CorrespondenceDate).format('L');
        }
    },
    {
        field: 'ResponseDate',
        headerName: 'Response Date',
        width: 120,
        valueFormatter: function (params) {
            if (params.node.data.ResponseDate !== undefined)
                return moment(params.node.data.ResponseDate).format('L');
        }
    },
    { headerName: 'Staff Member', field: 'StaffMember', cellClass: 'event-record-cell', width: 150 },
    {
        headerName: 'Comments', field: 'EventComments', cellClass: 'event-record-cell', width: 300, cellStyle: {
            'white-space': 'normal'
        }
    },
    { headerName: 'Correspondence Type', field: 'CorrespondenceType', cellClass: 'event-record-cell', width: 150 },
    { headerName: 'Response Type', field: 'ResponseType', cellClass: 'event-record-cell', width: 150 },
    { headerName: 'Documents', field: 'EventFiles', width: 300, cellRenderer: FileListCellTemplate},
    //{ headerName: 'Number Of Days', field: 'NumberOfDays', cellClass: 'event-record-cell' },
    //{ headerName: 'EventFiles', field: 'EventFiles', cellClass: 'event-record-cell', cellRenderer: FileListCellTemplate },
];

function CorrespondenceDetailCellRenderer() { }

CorrespondenceDetailCellRenderer.prototype.init = function (params) {
    console.log("init on detail renderer! ----------------------------------");
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
    console.log("setting up the detail grid... ------------- incoming params.data");
    console.dir(eventRecords);

    this.detailGridOptions = {
        enableSorting: true,
        enableFilter: true,
        enableColResize: true,
        rowData: eventRecords,
        columnDefs: detailColumnDefs,
        onGridReady: function (params) {
            setTimeout(function () { params.api.sizeColumnsToFit(); }, 0);
        },
        getRowHeight: function (params) {
            console.dir(params);
            var rowIsDetailRow = params.node.level === 1;
            // return dynamic height when detail row, otherwise return 25
            var comment_length = (params.data.EventComments === null) ? 1 : params.data.EventComments.length;
            return 25 * (Math.floor(comment_length / 45) + 1); //base our detail height on the comments field.
            //return rowIsDetailRow ? 200 : 25;
        },
        //defaultColDef: {
        //    editable: true
        //},
        //enableRangeSelection: true
    };

    var eDetailGrid = this.eGui.querySelector('.full-width-grid');
    console.log("did we find the element?");
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
