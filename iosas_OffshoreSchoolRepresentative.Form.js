if (typeof (IOSAS) === "undefined") {
    IOSAS = {};
} else { }

IOSAS.OffshorSchoolRepresentative = IOSAS.OffshorSchoolRepresentative || {};
}
IOSAS.OffshorSchoolRepresentative.onsave = function (executionContext) {
    let formContext = executionContext.getFormContext();
    let fn = formContext.getAttribute("iosas_firstname").getValue();
    let ln = formContext.getAttribute("iosas_lastname").getValue();
    formContext.getAttribute("iosas_name").setValue(fn + " " + ln);

}