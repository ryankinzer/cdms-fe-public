/* These custom ag-grid cell editors provide improved behavior for our purposes. 
* a couple of helpful sites for documentation and examples
* https://www.ag-grid.com/javascript-grid-cell-editor
* https://spapas.github.io/2017/01/03/ag-grid-custom-components/
*/

//here are the custom cell editors defined in this file:
function CDMSMultiselectCellEditor() { };
function CDMSSelectCellEditor() { };



var onKeyDown = function (event) {
    var key = event.which || event.keyCode;
    if (key == 37 ||  // left
        key == 39 || // right
        key == 9) {  // tab
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
    _this.container.style = "border-radius: 3px; border: 1px solid grey;background: #e6e6e6;padding: 1px;";
    //this.container.onkeydown = onKeyDown
    _this.eSelect = document.createElement("select");
    _this.eSelect.multiple = "multiple";
    _this.eSelect.size = 7;
    _this.container.appendChild(_this.eSelect);

    /*
    console.log(" typeof values ");
    console.log(typeof params.values);
    console.log("values:");
    console.dir(params.values);
    console.log("value: ");
    console.dir(params.value);
    */

    if (params.value === null)
        params.value = [];
    
    if (Array.isArray(params.values)) {
        console.log("params.values is an array");
        params.values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            option.text = value;
            if (params.value.contains(value)) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }

    if (!Array.isArray(params.values) && typeof params.values === 'object') {
        console.log("params.values is an object");
        params.values.forEach(function (key, value) {
            var option = document.createElement('option');
            option.value = key;
            option.text = value;
            if (Object.values(params.value).contains(value)) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
    }
    
};

CDMSMultiselectCellEditor.prototype.getGui = function () {
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

CDMSMultiselectCellEditor.prototype.destroy = function () {};
CDMSMultiselectCellEditor.prototype.isPopup = function () { return true; };
CDMSMultiselectCellEditor.prototype.afterGuiAttached = function () { this.eSelect.focus(); };


//SELECT cell edit control provides standard ability as well as 
CDMSSelectCellEditor.prototype.init = function (params) {
    //console.log("init: editor params = ");
    //console.dir(params);

    var _this = this;

    _this.values = params.values;
    _this.container = document.createElement('div');
    _this.container.style = "border-radius: 3px; border: 1px solid grey;background: #e6e6e6;padding: 1px;";
    _this.container.onkeydown = onKeyDown;
    _this.eSelect = document.createElement("select");
    _this.eSelect.size = 7;
    _this.container.appendChild(_this.eSelect);

    /*
    console.log(" typeof values ");
    console.log(typeof params.values);
    console.log("values:");
    console.dir(params.values);
    console.log("value: ");
    console.dir(params.value);
    */

    if (params.value === null)
        params.value = [];

    if (Array.isArray(params.values)) {
        console.log("params.values is an array");
        params.values.forEach(function (value) {
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
        console.log("params.values is an object");
        for (key in params.values)
        {
            var option = document.createElement('option');
            option.value = key;
            option.text = params.values[key];
            if (params.value === key) { //is this one already selected?
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        };
    }

};

CDMSSelectCellEditor.prototype.getGui = function () {
    return this.container;
};

CDMSSelectCellEditor.prototype.getValue = function () {
    //console.log("getvalue fired ------------ ");
    return this.eSelect.value;
};

CDMSSelectCellEditor.prototype.destroy = function () { };
CDMSSelectCellEditor.prototype.isPopup = function () { return true; };
CDMSSelectCellEditor.prototype.afterGuiAttached = function () { this.eSelect.focus(); };
CDMSSelectCellEditor.prototype.focusIn = function () { this.eSelect.focus(); };






/*

these are the ag-grid controls as examples...

SelectCellEditor = (function (_super) {
    __extends(SelectCellEditor, _super);
    function SelectCellEditor() {
        var _this = _super.call(this, '<div class="ag-cell-edit-input"><select class="ag-cell-edit-input"/></div>') || this;
        _this.eSelect = _this.getHtmlElement().querySelector('select');
        return _this;
    }
    SelectCellEditor.prototype.init = function (params) {
        var _this = this;
        this.focusAfterAttached = params.cellStartedEdit;
        if (utils_1.Utils.missing(params.values)) {
            console.log('ag-Grid: no values found for select cellEditor');
            return;
        }
        params.values.forEach(function (value) {
            var option = document.createElement('option');
            option.value = value;
            var valueFormatted = _this.valueFormatterService.formatValue(params.column, null, null, value);
            var valueFormattedExits = valueFormatted !== null && valueFormatted !== undefined;
            option.text = valueFormattedExits ? valueFormatted : value;
            if (params.value === value) {
                option.selected = true;
            }
            _this.eSelect.appendChild(option);
        });
        // we don't want to add this if full row editing, otherwise selecting will stop the
        // full row editing.
        if (!this.gridOptionsWrapper.isFullRowEdit()) {
            this.addDestroyableEventListener(this.eSelect, 'change', function () { return params.stopEditing(); });
        }
        this.addDestroyableEventListener(this.eSelect, 'keydown', function (event) {
            var isNavigationKey = event.keyCode === constants_1.Constants.KEY_UP || event.keyCode === constants_1.Constants.KEY_DOWN;
            if (isNavigationKey) {
                event.stopPropagation();
            }
        });
        this.addDestroyableEventListener(this.eSelect, 'mousedown', function (event) {
            event.stopPropagation();
        });
    };
    SelectCellEditor.prototype.afterGuiAttached = function () {
        if (this.focusAfterAttached) {
            this.eSelect.focus();
        }
    };
    SelectCellEditor.prototype.focusIn = function () {
        this.eSelect.focus();
    };
    SelectCellEditor.prototype.getValue = function () {
        return this.eSelect.value;
    };
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], SelectCellEditor.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('valueFormatterService'),
        __metadata("design:type", valueFormatterService_1.ValueFormatterService)
    ], SelectCellEditor.prototype, "valueFormatterService", void 0);
    return SelectCellEditor;
}(component_1.Component))





var RichSelectCellEditor = (function (_super) {
    __extends(RichSelectCellEditor, _super);
    function RichSelectCellEditor() {
        var _this = _super.call(this, RichSelectCellEditor.TEMPLATE) || this;
        _this.selectionConfirmed = false;
        return _this;
    }
    RichSelectCellEditor.prototype.init = function (params) {
        this.params = params;
        this.selectedValue = params.value;
        this.originalSelectedValue = params.value;
        this.focusAfterAttached = params.cellStartedEdit;
        this.virtualList = new virtualList_1.VirtualList();
        this.context.wireBean(this.virtualList);
        this.virtualList.setComponentCreator(this.createRowComponent.bind(this));
        this.getRefElement('eList').appendChild(this.virtualList.getGui());
        if (main_1.Utils.exists(this.params.cellHeight)) {
            this.virtualList.setRowHeight(this.params.cellHeight);
        }
        this.renderSelectedValue();
        if (main_1.Utils.missing(params.values)) {
            console.log('ag-Grid: richSelectCellEditor requires values for it to work');
            return;
        }
        var values = params.values;
        this.virtualList.setModel({
            getRowCount: function () { return values.length; },
            getRow: function (index) { return values[index]; }
        });
        this.addGuiEventListener('keydown', this.onKeyDown.bind(this));
        this.addDestroyableEventListener(this.virtualList.getGui(), 'click', this.onClick.bind(this));
        this.addDestroyableEventListener(this.virtualList.getGui(), 'mousemove', this.onMouseMove.bind(this));
    };
    RichSelectCellEditor.prototype.onKeyDown = function (event) {
        var key = event.which || event.keyCode;
        switch (key) {
            case main_1.Constants.KEY_ENTER:
                this.onEnterKeyDown();
                break;
            case main_1.Constants.KEY_DOWN:
            case main_1.Constants.KEY_UP:
                this.onNavigationKeyPressed(event, key);
                break;
        }
    };
    RichSelectCellEditor.prototype.onEnterKeyDown = function () {
        this.selectionConfirmed = true;
        this.params.stopEditing();
    };
    RichSelectCellEditor.prototype.onNavigationKeyPressed = function (event, key) {
        // if we don't stop propagation, then the grids navigation kicks in
        event.stopPropagation();
        var oldIndex = this.params.values.indexOf(this.selectedValue);
        var newIndex = key === main_1.Constants.KEY_UP ? oldIndex - 1 : oldIndex + 1;
        if (newIndex >= 0 && newIndex < this.params.values.length) {
            var valueToSelect = this.params.values[newIndex];
            this.setSelectedValue(valueToSelect);
        }
    };
    RichSelectCellEditor.prototype.renderSelectedValue = function () {
        var _this = this;
        var valueFormatted = this.params.formatValue(this.selectedValue);
        var eValue = this.getRefElement('eValue');
        var promise = this.cellRendererService.useRichSelectCellRenderer(this.params.column.getColDef(), eValue, { value: this.selectedValue, valueFormatted: valueFormatted });
        var foundRenderer = ag_grid_1._.exists(promise);
        if (foundRenderer) {
            promise.then(function (renderer) {
                if (renderer && renderer.destroy) {
                    _this.addDestroyFunc(function () { return renderer.destroy(); });
                }
            });
        }
        else {
            if (main_1.Utils.exists(this.selectedValue)) {
                eValue.innerHTML = valueFormatted;
            }
            else {
                eValue.innerHTML = '';
            }
        }
    };
    RichSelectCellEditor.prototype.setSelectedValue = function (value) {
        if (this.selectedValue === value) {
            return;
        }
        var index = this.params.values.indexOf(value);
        if (index >= 0) {
            this.selectedValue = value;
            this.virtualList.ensureIndexVisible(index);
            this.virtualList.refresh();
        }
    };
    RichSelectCellEditor.prototype.createRowComponent = function (value) {
        var valueFormatted = this.params.formatValue(value);
        var row = new richSelectRow_1.RichSelectRow(this.params.column.getColDef());
        this.context.wireBean(row);
        row.setState(value, valueFormatted, value === this.selectedValue);
        return row;
    };
    RichSelectCellEditor.prototype.onMouseMove = function (mouseEvent) {
        var rect = this.virtualList.getGui().getBoundingClientRect();
        var scrollTop = this.virtualList.getScrollTop();
        var mouseY = mouseEvent.clientY - rect.top + scrollTop;
        var row = Math.floor(mouseY / this.virtualList.getRowHeight());
        var value = this.params.values[row];
        // not using utils.exist() as want empty string test to pass
        if (value !== undefined) {
            this.setSelectedValue(value);
        }
    };
    RichSelectCellEditor.prototype.onClick = function () {
        this.selectionConfirmed = true;
        this.params.stopEditing();
    };
    // we need to have the gui attached before we can draw the virtual rows, as the
    // virtual row logic needs info about the gui state
    RichSelectCellEditor.prototype.afterGuiAttached = function () {
        var selectedIndex = this.params.values.indexOf(this.selectedValue);
        // we have to call this here to get the list to have the right height, ie
        // otherwise it would not have scrolls yet and ensureIndeVisible would do nothing
        this.virtualList.refresh();
        if (selectedIndex >= 0) {
            this.virtualList.ensureIndexVisible(selectedIndex);
        }
        // we call refresh again, as the list could of moved, and we need to render the new rows
        this.virtualList.refresh();
        if (this.focusAfterAttached) {
            this.getGui().focus();
        }
    };
    RichSelectCellEditor.prototype.getValue = function () {
        if (this.selectionConfirmed) {
            return this.selectedValue;
        }
        else {
            return this.originalSelectedValue;
        }
    };
    RichSelectCellEditor.prototype.isPopup = function () {
        return true;
    };
    RichSelectCellEditor.TEMPLATE = 
    // tab index is needed so we can focus, which is needed for keyboard events
    '<div class="ag-rich-select" tabindex="0">' +
        '<div ref="eValue" class="ag-rich-select-value"></div>' +
        '<div ref="eList" class="ag-rich-select-list"></div>' +
        '</div>';
    __decorate([
        main_1.Autowired('context'),
        __metadata("design:type", main_1.Context)
    ], RichSelectCellEditor.prototype, "context", void 0);
    __decorate([
        main_1.Autowired('cellRendererService'),
        __metadata("design:type", main_1.CellRendererService)
    ], RichSelectCellEditor.prototype, "cellRendererService", void 0);
    return RichSelectCellEditor;
}(main_1.Component));
exports.RichSelectCellEditor = RichSelectCellEditor;
*/


/*
//we might not need this - the default renderer is doing what we want.
function CDMSMultiselectCellRenderer() {
}

CDMSMultiselectCellRenderer.prototype.init = function (params) {
    this.values = params.values;
    this.span = document.createElement('span');
    this.span.innerHTML = '';
    this.refresh(params);
};

CDMSMultiselectCellRenderer.prototype.refresh = function (params) {
    this.span.innerHTML = params.valueFormatted;
}

CDMSMultiselectCellRenderer.prototype.getGui = function () {
    return this.span;
};
*/
