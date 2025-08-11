var IOSAS = IOSAS || {};
IOSAS.InspectionCycle = IOSAS.InspectionCycle || {
    SHOW_InspectionCycle_BUTTON: true
};
// Start ISOFMR-424
IOSAS.InspectionCycle.RefreshInspectionList = function (primaryControl) {
    //var refresh=true;
    IOSAS.InspectionCycle.GenerateInspectionList(primaryControl, "Re-generate Inspection List, please wait...");
}
IOSAS.InspectionCycle.GenerateInspectionList = function (primaryControl, message) {

    if (message != null) {
        Xrm.Utility.showProgressIndicator(message);
    } else
        Xrm.Utility.showProgressIndicator("Generating Inspection List, please wait...");

    let formContext = primaryControl;
    let id, nextEvaluation, nextMonitoring, specialinspection, programEval, secondMonitoring;
    id = formContext.data.entity.getId().replace("{", "").replace("}", "");
    nextEvaluation = formContext.getAttribute("iosas_nextevaluation").getValue();
    nextMonitoring = formContext.getAttribute("iosas_nextmonitoring").getValue();
    specialinspection = formContext.getAttribute("iosas_specialinspection").getValue();
    programEval = formContext.getAttribute("iosas_programevaluation").getValue();
    // secondMonitoring = formContext.getAttribute("iosas_secondmonitor").getValue();
    //iosas_programevaluation

    let url = formContext.context.getClientUrl();
    fetch(
        url +
        "/api/data/v9.1/environmentvariabledefinitions?$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)&$filter=schemaname eq 'iosas_InspectionListURL'")

        .then((re) => re.json())
        .then((re) => {
            let flowURL = re.value[0].environmentvariabledefinition_environmentvariablevalue[0].value;
            let input = JSON.stringify({
                iosas_inspectioncycleid: id,
                iosas_nextevaluation: nextEvaluation,
                iosas_nextmonitoring: nextMonitoring,
                iosas_specialinspection: specialinspection,
                iosas_programevaluation: programEval,

            });
            let req = new XMLHttpRequest();
            req.open("POST", flowURL, true);
            req.setRequestHeader('Content-Type', 'application/json');
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    req.onreadystatechange = null;
                    if (this.status === 200) {
                        Xrm.Utility.closeProgressIndicator();
                        let result = this.response;
                        formContext.getControl("Subgrid_School_iosas_InspectionCycle_edu_School_edu_Scho").refresh();
                        let count = formContext.getControl("Subgrid_School_iosas_InspectionCycle_edu_School_edu_Scho").getGrid().getTotalRecordCount();
                        if (count < 1) {
                            setTimeout(IOSAS.InspectionCycle.getCountofRecords, 1000, formContext);
                        }
                        return;
                        console.log("Success response received from flow")
                    } else if (this.status === 202) { // Async                       
                        let messageId = "68d4f6ba-a765-48ae-8770-4a6171d1f5eb";
                        formContext.ui.tabs.get("tab_inspectionSchoolList").setFocus();
                        formContext.ui.setFormNotification("Inspection list is being generated in the background. Please refresh the form after a few minutes to see the final result.", "WARNING", messageId);
                        const throwAwayVar = setTimeout(Xrm.Utility.closeProgressIndicator(), 60000); //60 seconds    
                        setTimeout(formContext.ui.refreshRibbon(), 6000);

                    } else {
                        Xrm.Utility.closeProgressIndicator();
                        let result = this.response;
                        console.log("Error in Flow " + result);
                    }
                }
            };

            //End for ISOFMR-130
            req.send(input);


        });
}
var triggered = 0;
console.log(triggered);
//A function to checkt he countof records in Subgrid() if its less than one refresh the grid.ISOFMR-130
IOSAS.InspectionCycle.getCountofRecords = function (formContext) {
    let count = formContext.getControl("Subgrid_School_iosas_InspectionCycle_edu_School_edu_Scho").getGrid().getTotalRecordCount();
    Xrm.Utility.closeProgressIndicator();
    if (count < 1) {
        formContext.getControl("Subgrid_School_iosas_InspectionCycle_edu_School_edu_Scho").refresh();
        triggered++
        if (triggered > 10) {
            triggered = 0;
            return;
        }
        IOSAS.InspectionCycle.getCountofRecords(formContext);


    }
    return;
}
// A function to show/hide inspectioncustom button on ribbon.
IOSAS.InspectionCycle.showhideinspectionlistbuttons = function (formContext) {
    if (formContext.data.entity.getEntityName() == "iosas_inspectioncycle") {
        var isValid = false;
        // isValid = IOSAS.InspectionCycle.showhideCustomButton(formContext); 
        isValid = IOSAS.InspectionCycle.showhideCustomButtonRibbon(formContext, true);
        return isValid;

    } else {
        return false;
    }
}

var tabName;
IOSAS.InspectionCycle.EnableDisableDeleteButton = function (formContext) {
    var showRibbon = false;
    if (tabName == "general" || tabName == undefined) {
        showRibbon = true;
    }
    return showRibbon;
}
IOSAS.InspectionCycle.RibbonRefresh = function (executionContext, tabObj) {
    tabName = tabObj;
    var formContext = executionContext.getFormContext();
    formContext.ui.refreshRibbon();
}
//    //A function to hide custombutton for below rolesISOFMR-534
IOSAS.InspectionCycle.showhideCustomButton = function (primaryControl) {
    let formContext = primaryControl;
    var hasRole = false;
    var globalContext = Xrm.Utility.getGlobalContext();
    var userRoles = globalContext.userSettings.roles;
    let formType = formContext.ui.getFormType();
    if (formType != 1) {
        userRoles.forEach(function hasRoleName(item, index) {
            const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
            if (roleName.includes(item.name)) {
                hasRole = true;
            };
        });
    }
    return hasRole;
}
//    //A function to hide custombutton for below rolesISOFMR-534 ISOFMR-629
IOSAS.InspectionCycle.showhideCustomButtonRibbon = function (primaryControl, isSubgridbtn) {
    let formContext = primaryControl;
    var globalContext = Xrm.Utility.getGlobalContext();
    var userRoles = globalContext.userSettings.roles;
    let formType = formContext.ui.getFormType();
    if (formType != 1) {
        var hasRole = false;
        const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
        inspectionId = formContext.data.entity.getId().replace("{", "").replace("}", "");
        let url = formContext.context.getClientUrl();
        var req = new XMLHttpRequest();
        req.open("GET", url + "/api/data/v9.1/iosas_inspectioncycles(" + inspectionId + ")?$expand=iosas_InspectionCycle_edu_School_edu_Scho($select=edu_schoolid)", false);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var result = JSON.parse(this.response);
                    var iosas_inspectioncycleid = result["iosas_inspectioncycleid"];
                    if (isSubgridbtn == undefined) { // This block of code to show Main from button
                        if (result.iosas_InspectionCycle_edu_School_edu_Scho.length == 0) {
                            var userRoles = globalContext.userSettings.roles;
                            userRoles.forEach(function hasRoleName(item, index) {
                                const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
                                if (roleName.includes(item.name)) {
                                    return hasRole = true;
                                };
                            });
                        } else {
                            return hasRole = false;
                        }
                    }
                    if (isSubgridbtn == true) { // This block of code to show subgrid button
                        if (result.iosas_InspectionCycle_edu_School_edu_Scho.length > 0) {
                            var userRoles = globalContext.userSettings.roles;
                            userRoles.forEach(function hasRoleName(item, index) {
                                const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
                                if (roleName.includes(item.name)) {
                                    return hasRole = true;
                                };
                            });
                        } else {
                            return hasRole = false;
                        }
                    }

                } else {
                    Xrm.Navigation.openAlertDialog(this.statusText);
                }
            }
        };
        req.send();
        return hasRole;

    }
}
// Legacy code: TOBE DELETED RAVI
IOSAS.InspectionCycle.CountofRecords = function () {
    fetch(url + "/api/data/v9.2/edu_schools?$select=edu_schoolid,edu_name,createdon&$expand=iosas_InspectionCycle_edu_School_edu_Scho($filter=(iosas_inspectioncycleid eq " + inspectionId + "))&$filter=(iosas_InspectionCycle_edu_School_edu_Scho/any(o1:(o1/iosas_inspectioncycleid eq " + inspectionId + ")))").then((re) => re.json())
        .then((re) => {
            var hasRole = false;
            if (re.value.length == 0) {
                console.log(hasRole = true)
                hasRole = true;
            }
            return hasRole;
        });
}
// Legacy code: TOBE DELETED RAVI
IOSAS.InspectionCycle.showhideCustomButton2 = function (primaryControl) {
    let formContext = primaryControl;
    var globalContext = Xrm.Utility.getGlobalContext();
    var userRoles = globalContext.userSettings.roles;
    let formType = formContext.ui.getFormType();
    if (formType != 1) {
        var hasRole = false;
        userRoles.forEach(function hasRoleName(item, index) {
            const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
            if (roleName.includes(item.name)) {
                inspectionId = formContext.data.entity.getId().replace("{", "").replace("}", "");
                let url = formContext.context.getClientUrl();
                fetch(url + "/api/data/v9.2/edu_schools?$select=edu_schoolid,edu_name,createdon&$expand=iosas_InspectionCycle_edu_School_edu_Scho($filter=(iosas_inspectioncycleid eq " + inspectionId + "))&$filter=(iosas_InspectionCycle_edu_School_edu_Scho/any(o1:(o1/iosas_inspectioncycleid eq " + inspectionId + ")))").then((re) => re.json())
                    .then((re) => {
                        if (re.value.length == 0) {
                            console.log(hasRole = true)
                            hasRole = true;
                        }

                    });

            };
            return hasRole;
        });
    }


}