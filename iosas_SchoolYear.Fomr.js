var IOSAS = IOSAS || {};

IOSAS.SchoolYear = IOSAS.SchoolYear || {};

IOSAS.SchoolYear.setYearStartEndDate = function (executionContext) {

    var formContext = executionContext.getFormContext();
    //Set School year Start Date
    if (formContext.ui.getFormType() == 1) { // 1 is for new record
        var d = new Date();
        d.setDate(1);
        d.setMonth(6);
        d.setFullYear(d.getFullYear());
        formContext.getAttribute("edu_startdate").setValue(d);
        //Set School Year End Date
        d.setDate(30);
        d.setMonth(5);
        d.setFullYear(d.getFullYear() + 1);
        formContext.getAttribute("edu_enddate").setValue(d);

    }

};

IOSAS.SchoolYear.formatYearName = function (executionContext) {
    // Make sure the school year name is saved formatted
    var formContext = executionContext.getFormContext();
    var _name = formContext.getAttribute("edu_name").getValue();
    var re = new RegExp(/([0-9]{4}[/][0-9]{2}[ ][A-Z]{2})/g);

    if (!re.test(_name)) {
        _name = _name.substr(0, 4) + '/' + _name.substr(4, 2) + ' ' + _name.substr(6, 2);
        formContext.getAttribute("edu_name").setValue(_name);
    }
};