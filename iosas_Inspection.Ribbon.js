// JavaScript source code
var IOSAS = IOSAS || {};
var inspectionStartDate, inspectorName;

function onclickofInspectionLetterButton(primaryControl, commandProperties) {
    inspectionStartDate = primaryControl.getAttribute("iosas_inspectionstartdate").getValue();
    inspectorName = primaryControl.getAttribute("iosas_inspectorname").getValue();
    displayDialog(primaryControl, commandProperties, inspectionStartDate, inspectorName);
}

function displayDialog(primaryControl, commandProperties) {
    var dialogParameters = {
        pageType: "webresource",
        webresourceName: "iosas_inspectionletters.html",

    };
    let formContext = primaryControl;
    var navigationOptions = {
        target: 2,
        width: 300,
        height: 300,
        position: 1

    };
    Xrm.Navigation.navigateTo(dialogParameters, navigationOptions).then(
        function (returnValue) {
            if (returnValue == null || returnValue.returnValue == null) {
                return;
            }
            console.log(returnValue);
            if (returnValue.returnValue.value == 200) {
                //                formContext.data.refresh(true);
                var entityFormOptions = {};
                entityFormOptions["entityName"] = formContext.data.entity.getEntityName();
                entityFormOptions["entityId"] = formContext.data.entity.getId();

                Xrm.Navigation.openForm(entityFormOptions);
            }

        },
        function (e) {
            // error handler here
            console.log(`error in displayDialog ${e}`);
        });
}

IOSAS.InspectionRibbon = {
    // Create Inspection Record based on Items selected in Inspections List
    GenerateInspection: function (primaryControl, selectedIds) {
        var formContext = primaryControl;
        var Ids;
        if (selectedIds != null && selectedIds != "") {
            var iosas_inspectionCycleId = formContext.data.entity.getId().replace("{", "").replace("}", "");
            Ids = selectedIds.toString();
            Ids = JSON.stringify(Ids.split(","));
            var InspCycleName = formContext.getAttribute("iosas_name").getValue();
            var InspCycleSchoolYear = formContext.getAttribute("iosas_schoolyear").getValue()[0].name;
            var InspCycleSchoolYearID = formContext.getAttribute("iosas_schoolyear").getValue()[0].id;
            InspCycleSchoolYearID = InspCycleSchoolYearID.replace("{", "").replace("}", "");
            let url, flowURL;
            url = formContext.context.getClientUrl();
            var filter = 'edu_schoolid eq ';
            var schoolfilter = " ";
            var condition = ' ';
            for (i = 0; i < selectedIds.length; i++) {
                schoolID = selectedIds[i];
                if (selectedIds.length > i) condition = ' or ';
                schoolfilter = schoolfilter + filter + schoolID + condition;
            }
            //((edu_schoolid eq 8f3bb3c0-f272-ec11-8942-000d3a09ee59 or edu_schoolid eq 436a3493-8d32-ec11-b6e6-000d3a09ec8b))   iosas_inspectiontype
            schoolfilter = schoolfilter.slice(0, -4);
            //fetch(url + "/api/data/v9.1/edu_schools?$select=edu_schoolcode,iosas_isschooltype&$filter=" + schoolfilter + "").then((re) => re.json())
            fetch(url + "/api/data/v9.1/edu_schools?$select=edu_schoolcode,iosas_isschooltype,iosas_inspectiontype&$filter=" + schoolfilter + "").then((re) => re.json())
                .then((re) => {
                    var mincode = "";
                    if (re.value.length == null) {
                        var overwrite = false;
                        IOSAS.InspectionRibbon.callPA(url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, overwrite, iosas_inspectionCycleId);
                    }
                    if (re.value.length > 0) {
                        var filter = 'iosas_name eq ';
                        var inspectionfilter = "";
                        var inspectioncondition = ' or ';
                        for (i = 0; i < re.value.length; i++) {
                            //  inspectionfilter = inspectionfilter + filter + "'" + InspCycleName + ' - ' + re.value[i].edu_mincode + "'" + inspectioncondition;
                            let iosas_isschooltype;
                            if (re.value[i].iosas_inspectiontype == 100000000) {
                                iosas_isschooltype = 'PE'
                            } else if (re.value[i].iosas_inspectiontype == 100000001) {
                                iosas_isschooltype = 'MI'
                            } else if (re.value[i].iosas_inspectiontype == 100000002) {
                                iosas_isschooltype = 'SP'
                            } else if (re.value[i].iosas_inspectiontype == 100000003) {
                                iosas_isschooltype = 'EEC'
                            }
                            inspectionfilter = inspectionfilter + filter + "'" + InspCycleName + ' - ' + re.value[i].edu_schoolcode + ' - ' + iosas_isschooltype + "'" + inspectioncondition;

                        }
                        console.log('Before formating ' + url + "/api/data/v9.1/iosas_inspections?$filter=" + inspectionfilter + "");
                        inspectionfilter = inspectionfilter.slice(0, -4);
                        console.log('After formating ' + url + "/api/data/v9.1/iosas_inspections?$filter=" + inspectionfilter + "");
                        fetch(url + "/api/data/v9.1/iosas_inspections?$select=_iosas_edu_school_value,iosas_schoolname,iosas_schoolnameprint&$filter=" + inspectionfilter + "").then((re) => re.json())
                            .then((re) => {
                                var overwrite = false
                                if (re.value.length > 0) {
                                    var schoolName = "";
                                    for (i = 0; i < re.value.length; i++) {
                                        schoolName = schoolName + "\n" + re.value[i].iosas_schoolname;
                                    } //ISOFMR-471
                                    IOSAS.InspectionRibbon.ApproveRequest(schoolName, url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, selectedIds, iosas_inspectionCycleId);
                                    return;
                                }

                                IOSAS.InspectionRibbon.callPA(url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, overwrite, iosas_inspectionCycleId);
                            });
                    }
                });
        }
    },
    //ISOFMR-471
    ApproveRequest: function (schoolName, url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, selectedIds, iosas_inspectionCycleId) {
        var confirmStrings = {
            title: "The following schools already have inspection" + "\n" + "do you want to overwrite them?",
            text: schoolName,
            confirmButtonLabel: "Overwrite",
            cancelButtonLabel: "No"
        };
        var confirmOptions = {
            height: 200,
            width: 400
        };
        Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
            function (success) {
                var overwrite = false;
                if (success.confirmed) {
                    console.log("User selected  to overwrite");
                    overwrite = true;
                } else {
                    console.log("User selected Not to overwrite");
                    overwrite = false;
                    if (selectedIds.length == 1) {
                        console.log("Terminating process. Since user selected to optout");
                        return;

                    }

                }
                IOSAS.InspectionRibbon.callPA(url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, overwrite, iosas_inspectionCycleId);
            });
    },
    callPA: function (url, Ids, InspCycleName, InspCycleSchoolYear, InspCycleSchoolYearID, overwrite, iosas_inspectionCycleId) {
        fetch(
            url +
            "/api/data/v9.1/environmentvariabledefinitions?$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)&$filter=schemaname eq 'iosas_IOSASHTTPRequestURLGenerateInspection'")
            .then((re) => re.json())
            .then((re) => {
                var flowUrl = re.value[0].environmentvariabledefinition_environmentvariablevalue[0].value;
                //PA WF is always using Environment Variable - Current Value (not Default Value)
                Xrm.Utility.showProgressIndicator("Generating Inspection Records, please wait...");
                var input = JSON.stringify({
                    "edu_schoolids": Ids,
                    "iosas_Name": InspCycleName,
                    "iosas_SchoolYear": InspCycleSchoolYear,
                    "iosas_SchoolYearID": InspCycleSchoolYearID,
                    "iosas_overwrite": overwrite,
                    "iosas_inspectionCycleId": iosas_inspectionCycleId
                });
                var req = new XMLHttpRequest();
                req.open("POST", flowUrl, true);
                req.setRequestHeader('Content-Type', 'application/json');
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            Xrm.Utility.closeProgressIndicator();

                        } else {
                            Xrm.Utility.closeProgressIndicator();
                            let result = this.response;
                            console.log("Error :" + result);

                        }
                    }
                };

                req.send(input);

            });
    },
    //A function to hide custombutton for below rolesISOFMR-534
    showhideCustomButton: function (primaryControl) {
        let formContext = primaryControl;
        var hasRole = false;
        var globalContext = Xrm.Utility.getGlobalContext();
        var userRoles = globalContext.userSettings.roles;
        let formType = formContext.ui.getFormType();
        if (formType == 2) {
            userRoles.forEach(function hasRoleName(item, index) {
                const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
                if (roleName.includes(item.name)) {
                    hasRole = true;
                };
            });
        }
        return hasRole;

    },

    //A function to perform Followup Inspection ISOFMR-624
    followupInspection: function (primaryControl) {
        let url, flowURL, formContext, iosas_inspectionid, userId, iosas_parent_inspection, id;
        formContext = primaryControl;
        formContext.ui.setFormNotification("Creating Follow-up Record, please wait", "WARNING", "notification");
        Xrm.Utility.showProgressIndicator("Creating Follow-up Record, please wait...");
        url = formContext.context.getClientUrl();
        iosas_inspectionid = primaryControl.data.entity.getId().replace("{", "").replace("}", "");
        iosas_parent_inspection = formContext.getAttribute("iosas_parent_inspection").getValue();
        /*   if (iosas_parent_inspection == null) {
              id = iosas_inspectionid;
  
          } else {
              id = iosas_parent_inspection[0].id.replace("{", "").replace("}", "");
          }
  console.log(id); */
        if (iosas_parent_inspection != null) {
            iosas_parent_inspection = iosas_parent_inspection[0].id.replace("{", "").replace("}", "");
        } else {
            iosas_parent_inspection = "";
        }
        if (iosas_inspectionid != null) {
            userId = Xrm.Utility.getGlobalContext().userSettings.userId.replace("{", "").replace("}", "");
            formContext.ui.setFormNotification("Creating Follow-up Record, please wait", "WARNING", "notification");
            Xrm.Utility.showProgressIndicator("Creating Follow-up Record, please wait...");
            fetch(
                url +
                "/api/data/v9.1/environmentvariabledefinitions?$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)&$filter=schemaname eq 'iosas_InspectionGenerateFollowupInspection'")
                .then((re) => re.json())
                .then((re) => {
                    flowUrl = re.value[0].environmentvariabledefinition_environmentvariablevalue[0].value;
                    var input = JSON.stringify({
                        "iosas_inspectionid": iosas_inspectionid,
                        "iosas_parent_inspection": iosas_parent_inspection,
                        "userId": userId
                    });
                    Xrm.Utility.showProgressIndicator("Creating Follow-up Record, please wait...");
                    var req = new XMLHttpRequest();
                    req.open("POST", flowUrl, false);
                    req.setRequestHeader('Content-Type', 'application/json');
                    req.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            req.onreadystatechange = null;
                            if (this.status === 200) {
                                formContext.ui.clearFormNotification();
                                Xrm.Utility.closeProgressIndicator();
                                const responseobj = JSON.parse(this.response);
                                if (responseobj != null) {
                                    let iosas_inspectionid = responseobj.response;
                                    iosas_inspectionid = iosas_inspectionid.substring(0, iosas_inspectionid.length - 1);
                                    console.log(iosas_inspectionid);
                                    var entityFormOptions = {};
                                    entityFormOptions["entityName"] = "iosas_inspection";
                                    entityFormOptions["entityId"] = iosas_inspectionid;
                                    Xrm.Navigation.openForm(entityFormOptions).then(
                                        function (success) {
                                            console.log(success);
                                        },
                                        function (error) {
                                            console.log(error);
                                        });
                                    // Xrm.Navigation.openForm("iosas_inspection", iosas_inspectionid);
                                    // IOSAS.InspectionRibbon.openInspectionFollowupRecord(inspectionId);
                                }
                            } else {
                                formContext.ui.clearFormNotification();
                                Xrm.Utility.closeProgressIndicator();
                                let result = this.response;
                                console.log("Error :" + result);


                            }
                        }
                    };

                    req.send(input);
                });

        } else {
            formContext.ui.clearFormNotification();
            Xrm.Utility.closeProgressIndicator();
        }


    },
    //A function to hide custombutton for below roles ISOFMR-624
    showhideFollowupButton: function (primaryControl) {
        let formContext = primaryControl;
        var hasRole = false;
        var globalContext = Xrm.Utility.getGlobalContext();
        var userRoles = globalContext.userSettings.roles;
        let formType = formContext.ui.getFormType();
        let startDate = formContext.getAttribute("iosas_inspectionenddate").getValue();
        let outstandingConcerns = formContext.getAttribute("iosas_numberofconcerns").getValue();
        let todayDate = new Date();
        todayDate.setHours(0, 0, 0);
        if (startDate == undefined || startDate == null) return hasRole;
        if (String(startDate) == String(todayDate)) return hasRole;
        if (outstandingConcerns == 0) return hasRole;
        let parentInspection = formContext.getAttribute("iosas_parent_inspection").getValue();
        if (formType == 2 && startDate < todayDate) {
            userRoles.forEach(function hasRoleName(item, index) {
                const roleName = ['IOSAS Program Coordinator', 'IOSAS MoE IT Administrator', 'System Administrator']
                if (roleName.includes(item.name)) {

                    hasRole = true;
                };
            });
        }
        return hasRole;

    },

}