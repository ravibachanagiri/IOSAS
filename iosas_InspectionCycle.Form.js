if (typeof (IOSAS) === "undefined") {
    IOSAS = {};
} else {

}

IOSAS.InpectionCycle = {
    onLoad: function (executionContext) {
        // Set variables
        let formContext = executionContext.getFormContext();
        let formState = formContext.ui.getFormType();
        switch (formState) {
            case 0: //undefined
                break;
            case 1: //Create/QuickCreate
                this.setSchoolYear(formContext);
                break;
            case 2: // update
                //debugger;
                this.setName(executionContext);
                formContext.ui.refreshRibbon(true);
                break;
            case 3: //readonly
                break;
            case 4: //disable
                break;
            case 6: //bulkedit
                break;
        }
    },
    setSchoolYear: function (formContext) {
        let url = formContext.context.getClientUrl();

        fetch(url + "/api/data/v9.1/edu_years?$filter=statuscode eq 1")
            .then((re) => re.json())
            .then((re) => {
                let currentYearID = re.value[0].edu_yearid;
                let name = re.value[0].edu_name;
                if (currentYearID == null) return;

                formContext.getAttribute("iosas_schoolyear")
                    .setValue([{
                        entityType: 'edu_year',
                        id: currentYearID,
                        name: name
                    }]);
            });
    },

    //A function to append name with last 3 character of BU Name ISOFMR-417
    setName: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let formState = formContext.ui.getFormType();
        if (formState != 1) return;
        let url = formContext.context.getClientUrl();
        //let userId = formContext._globalContext.getUserId();
        let userId = Xrm.Utility.getGlobalContext().userSettings.userId;
        userId = userId.replace("{", "").replace("}", "");
        Xrm.WebApi.online.retrieveMultipleRecords("systemuser", "?$expand=businessunitid($select=divisionname)&$filter=systemuserid eq " + userId + "").then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var systemuserid = results.entities[i]["systemuserid"];
                    let devisionName = results.entities[i].businessunitid.divisionname
                    if (devisionName == null) return;
                    let name = formContext.getAttribute("iosas_name").getValue();
                    let substring = name.substring(name.length - 3);
                    if (substring == devisionName) return;
                    let formattedName = `${name} ${devisionName}`;
                    formContext.getAttribute("iosas_name").setValue(formattedName);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );

    },

};