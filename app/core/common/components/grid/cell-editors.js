/* These custom ag-grid cell editors provide improved behavior for our purposes. 
* a couple of helpful sites for documentation and examples
* https://www.ag-grid.com/javascript-grid-cell-editor
* https://spapas.github.io/2017/01/03/ag-grid-custom-components/
*/

//here are the custom cell editors defined in this file:
function CDMSMultiselectCellEditor() { };
function CDMSSelectCellEditor() { };
function CDMSTextareaCellEditor() { };



var onKeyDown = function (event) {
    //console.log("Keypress: " + event.key + " >> " + event.keyCode);
    var key = event.which || event.keyCode;
    if (key == 37 ||  // left
        key == 39 ||  // right
        key == 9 ||   // tab
        key == 40 ||  // down
        key == 38)    // up
        {    
            //console.log("stopping progopation for "+ key);
            if (key == 9 || key == 40 || key == 38) {
                event.preventDefault();
            }
            event.stopPropagation();
        }
}



/*
* The MULTISELECT cell editor provides a basic multiselect dropdown since one is not included in ag-grid

//params.values are the possible values.
//params.value is our selection

*/

CDMSMultiselectCellEditor.prototype.init = function (params) {
    //console.log("init: editor params = ");
    //console.dir(params);

    var _this = this;

    _this.values = params.values;
    _this.container = document.createElement('div');
    _this.container.style = "border-radius: 3px; border: 1px solid grey;background: #e6e6e6;";
    _this.container.onkeydown = onKeyDown;
    _this.eSelect = document.createElement("select");
    _this.eSelect.multiple = "multiple";
    _this.eSelect.size = 7;
    _this.container.appendChild(_this.eSelect);

    if (params.column.tabbingIn) { 
        console.log("--- cancelling becauswe we are tabbing in ------- .>>>>>>>>>>>>>>>>");
        params.column.tabbingIn = false;
        this.cancelBeforeStart = true;
    }

    if (params.value === null)
        params.value = [];
    
    if (Array.isArray(params.values)) {
        //console.log("params.values is an array");
        params.values.sort().forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            if (params.value && params.value.contains(value)) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }

    if (!Array.isArray(params.values) && typeof params.values === 'object') {
        //console.log("params.values is an object");
        var ordered_values = getOrderedObjectList(params.values);

        ordered_values.forEach(function (item) {

            var option = document.createElement('option');
            option.value = item.Id;
            option.text = item.Label;
            if (Object.values(params.value).contains(item.Id)) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }
};

CDMSMultiselectCellEditor.prototype.getGui = function () {
    //this.eSelect.focus();
    return this.container;
};

CDMSMultiselectCellEditor.prototype.getValue = function () {
    //console.log("getvalue fired ------------ ");

    var selecteditems = [];
    for (var i = 0; i < this.eSelect.length; i++) {
        if (this.eSelect.options[i].selected)
            selecteditems.push(this.eSelect.options[i].value);
    }
    
    return selecteditems;
};

CDMSMultiselectCellEditor.prototype.isCancelBeforeStart = function () { 
    //console.log("cancel before start: " + this.cancelBeforeStart);
    return this.cancelBeforeStart;
};

CDMSMultiselectCellEditor.prototype.destroy = function () {};
CDMSMultiselectCellEditor.prototype.isPopup = function () { return true; };
CDMSMultiselectCellEditor.prototype.afterGuiAttached = function () { this.eSelect.focus(); };


//SELECT cell edit control provides standard ["label"] as well as {"id":"label"}
CDMSSelectCellEditor.prototype.init = function (params) {
    //console.log("init: editor params = ");
    //console.dir(params);

    var _this = this;

    _this.values = params.values;
    _this.container = document.createElement('div');
    _this.container.style = "width: 420px;border-radius: 3px; border: 1px solid grey;background: #e6e6e6";
    _this.container.onkeydown = onKeyDown;
    _this.eSelect = document.createElement("select");
    _this.eSelect.size = 7;
    _this.container.appendChild(_this.eSelect);

    //_this.keypress = function (event) { console.dir(event); }
    
    //this.cancelBeforeStart = (params.charPress == null && params.keyPress == null) ? true : false;
    
    //this gets set in dataset-edit-form when tabbing. a work-around because the grid was stealing the focus after edit and tab.
    if (params.column.tabbingIn) {
        //console.log("--- cancelling becauswe we are tabbing in ------- .>>>>>>>>>>>>>>>>");
        params.column.tabbingIn = false;
        this.cancelBeforeStart = true;
    } else { 
        this.cancelBeforeStart = false;
    }

    if (params.value === null)
        params.value = [];

    if (Array.isArray(params.values)) {
        params.values.sort().forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            if (params.value === value) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }

    if (!Array.isArray(params.values) && typeof params.values === 'object') {

        var ordered_values = getOrderedObjectList(params.values);

        ordered_values.forEach(function (item) {
            
            var option = document.createElement('option');
            option.value = item.Id;
            option.text = item.Label;
            if (params.value == item.Id) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }

    //_this.eSelect.focus();

};

CDMSSelectCellEditor.prototype.isCancelBeforeStart = function () { 
    //console.log("cancel before start: " + this.cancelBeforeStart);
    return this.cancelBeforeStart;
};

CDMSSelectCellEditor.prototype.getGui = function () {
    //console.log("getgui fired");
    //console.dir(this.container);
    //this.eSelect.focus();
    return this.container;
};

CDMSSelectCellEditor.prototype.getValue = function () {
    //console.log("getvalue fired ------------ " + this.eSelect.value);
    return this.eSelect.value;
};

CDMSSelectCellEditor.prototype.destroy = function () { };
CDMSSelectCellEditor.prototype.isPopup = function () { return true; };
CDMSSelectCellEditor.prototype.afterGuiAttached = function () { 
    //console.log("afterguiattched"); 
    //var _this = this;
    //setTimeout(function () {
    //    console.log("timout reached! focusing");
        this.eSelect.focus();
    //}, 500);
    
};



//TEXTAREA custom cell edit control
CDMSTextareaCellEditor.prototype.init = function (params) {
    var _this = this;

    _this.value = (params.value) ? params.value : "";
    _this.container = document.createElement('div');
    _this.container.style = "border-radius: 3px; border: 1px solid grey;background: #e6e6e6;padding: 1px;";
    _this.eSelect = document.createElement("textarea");
    _this.eSelect.rows = 7;
    _this.eSelect.cols = 40;
    _this.eSelect.value = _this.value;
    _this.container.appendChild(_this.eSelect);

    if (params.column.tabbingIn) { 
        console.log("--- cancelling becauswe we are tabbing in ------- .>>>>>>>>>>>>>>>>");
        params.column.tabbingIn = false;
        this.cancelBeforeStart = true;
    }

};

CDMSTextareaCellEditor.prototype.getGui = function () {
    return this.container;
};

CDMSTextareaCellEditor.prototype.getValue = function () {
    return (this.eSelect.value) ? this.eSelect.value : "";
};

CDMSTextareaCellEditor.prototype.isCancelBeforeStart = function () { 
    //console.log("cancel before start: " + this.cancelBeforeStart);
    return this.cancelBeforeStart;
};

CDMSTextareaCellEditor.prototype.destroy = function () { };
CDMSTextareaCellEditor.prototype.isPopup = function () { return true; };
CDMSTextareaCellEditor.prototype.afterGuiAttached = function () { this.eSelect.focus(); };





