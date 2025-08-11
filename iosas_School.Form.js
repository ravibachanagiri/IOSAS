// A webresource for SchoolForm only

//Create Namespace Object if its defined
if (typeof (IOSAS) === "undefined") {
    IOSAS = {};
} else {

}


//Formload logic starts here
IOSAS.SchoolForm = {
    OnLoad: function (executionContext) {
        let formContext = executionContext.getFormContext();
        switch (formContext.ui.getFormType()) {
            case 0: //undefined
                break;
            case 1: //Create/QuickCreate
                this.SetCertificateGrade(executionContext);
                this.showorhideSpecialInspectionComment(executionContext);
                this.showorhideExceptionComment(executionContext);
                this.showorhideProgramEvaluationComment(executionContext);
                break;
            case 2: // update
                this.showorhideContactsDetailsTab(formContext);
                this.setCertifiedSince(formContext);
                this.ToggleControlsVisisbility(executionContext);
                this.showorhideSpecialInspectionComment(executionContext);
                this.showorhideExceptionComment(executionContext);
                this.showorhideProgramEvaluationComment(executionContext);
                formContext.data.entity.save();
                break;
            case 3: //readonly
                break;
            case 4: //disable
                break;
            case 6: //bulkedit
                break;
        }
    },

    //A function to trim the date value to set only year ISOFMR-214
    setCertifiedSince: function (formContext) {
        let certifiedSince = formContext
            .getAttribute("iosas_certifiedsince")
            .getValue();
        if (certifiedSince == null) return;
        if (certifiedSince.length > 4) {
            certifiedSince = certifiedSince.substring(0, 4);
            formContext.getAttribute("iosas_certifiedsince").setValue(certifiedSince);
            formContext.data.entity.save();
        }
    },
    //A function to show or hide tab contadetails if schoolCategory is OSP ISOFMR-214
    showorhideContactsDetailsTab: function (formContext) {
        let schoolCategory = formContext
            .getAttribute("edu_schoolcategory")
            .getValue();
        if (schoolCategory === 101) {
            formContext.ui.tabs.get("tab2_contactdetails").setVisible(true);
            return;
        }
        formContext.ui.tabs.get("tab2_contactdetails").setVisible(false);
        var preImageOwnerOperatorRep = formContext.getAttribute("iosas_owneroperatorrepresentative").getValue();

    },
    //function to clear Inspection Funding Group triggered on change on school Category
    clearInspectionFundingGroup: function (executionContext) {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("edu_schoolcategory").getValue() == 101) { //Indepedent
            formContext.getAttribute("iosas_inspectionfundinggroup").setValue(null);

            let schoolDistrict = formContext.getAttribute("edu_schooldistrict").getValue();
            if (schoolDistrict == null) return;
            schoolDistrict = schoolDistrict[0].name
            if (schoolDistrict.toLowerCase() == 'offshore') { //Clear district if offshore
                formContext.getAttribute("edu_schooldistrict").setValue();

            }

        } else {
            IOSAS.SchoolForm.getSchoolDistrict(formContext);
            IOSAS.SchoolForm.getInspectionFundingGroup(formContext);


        }
    },

    //A function to set schooldistrict to offshore 
    getSchoolDistrict: function (formContext) {
        Xrm.WebApi.online.retrieveMultipleRecords("edu_schooldistrict", "?$select=edu_name&$filter=edu_name eq 'offshore'").then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var edu_name = results.entities[i]["edu_name"];
                    var id = results.entities[i].edu_schooldistrictid;
                    var lookupValue = new Array();
                    lookupValue[0] = new Object();
                    lookupValue[0].id = id;
                    lookupValue[0].name = edu_name
                    lookupValue[0].entityType = "edu_schooldistrict";
                    formContext.getAttribute("edu_schooldistrict").setValue(lookupValue);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );
    },
    getInspectionFundingGroup: function (formContext) {
        Xrm.WebApi.online.retrieveMultipleRecords("iosas_inspectionfundinggroup", "?$select=iosas_name&$filter=iosas_name eq 'Offshore%20Schools'").then(
            function success(results) {
                for (var i = 0; i < results.entities.length; i++) {
                    var iosas_name = results.entities[i]["iosas_name"];
                    var id = results.entities[i].iosas_inspectionfundinggroupid;
                    var lookupValue = new Array();
                    lookupValue[0] = new Object();
                    lookupValue[0].id = id;
                    lookupValue[0].name = iosas_name
                    lookupValue[0].entityType = "iosas_inspectionfundinggroup";
                    formContext.getAttribute("iosas_inspectionfundinggroup").setValue(lookupValue);
                }
            },
            function (error) {
                Xrm.Navigation.openAlertDialog(error.message);
            }
        );
    },

    //// Common Function to show/hide column
    showhideColumns: function (columnNames, formContext, isvisible) {
        for (i = 0; i < columnNames.length; i++) {
            let name = columnNames[i];
            formContext.getControl(name).setVisible(isvisible);
        }
    },

    clearValue: function (columnNames, formContext) {
        for (i = 0; i < columnNames.length; i++) {
            let name = columnNames[i];
            formContext.getAttribute(name).setValue(null);
        }
    },

    ToggleControlsVisisbility: function (executionContext) {
        //Depending on the School Category toggle visisbility for controls on edu_schoolcategory field change
        var formContext = executionContext.getFormContext();
        //101 = Independant school
        //102 = offshore school
        var selectedVal = formContext.getAttribute("edu_schoolcategory").getValue();

        if (formContext.getAttribute("edu_schoolcategory").getValue() == 101) {
            // Show Authority
            formContext.getControl("iosas_authority").setVisible(true);
            formContext.ui.quickForms.get("qvc_AuthorityNumber").setVisible(true);

            // Show Funding Group
            formContext.getControl("iosas_fundinggroup").setVisible(true);

            // Hide owner/operator iosas_isschooltype
            formContext.getControl("iosas_owneroperator").setVisible(false);
            formContext.getControl("iosas_isschooltype").setVisible(true);
            // Reset value for Owner Operator
            formContext.getAttribute("iosas_owneroperator").setValue(null);

            // show contact details tab ISOFMR-214
            formContext.ui.tabs.get("tab2_contactdetails").setVisible(true);
            formContext.ui.tabs.get("tab_schoolrepresentative").setVisible(false);

            //SHow inspection type
            //  formContext.getControl("iosas_inspectiontype").setVisible(true);

            // hide Owner Operator representative and set value to null ISOFMR-214
            formContext
                .getControl("iosas_owneroperatorrepresentative")
                .setVisible(false);
            formContext
                .getAttribute("iosas_owneroperatorrepresentative")
                .setValue(null);
            formContext.ui.tabs.get('tab_general').sections.get("address").setLabel('Address');

        } else {
            // Hide Authority
            formContext.getControl("iosas_authority").setVisible(false);
            formContext.ui.quickForms.get("qvc_AuthorityNumber").setVisible(false);

            // Hide Funding Group
            formContext.getControl("iosas_fundinggroup").setVisible(false);
            formContext.getAttribute("iosas_fundinggroup").setValue(null);

            // Show owner/operator
            formContext.getControl("iosas_owneroperator").setVisible(true);

            // Reset value for Authority
            formContext.getAttribute("iosas_authority").setValue(null);

            //Hide contactdetails tab ISOFMR-214
            formContext.ui.tabs.get("tab2_contactdetails").setVisible(false);
            formContext.ui.tabs.get("tab_schoolrepresentative").setVisible(true);

            // Show Owner Operator representative ISOFMR-214
            formContext
                .getControl("iosas_owneroperatorrepresentative")
                .setVisible(true);

            //Hide  IssueType
            formContext.getControl("iosas_isschooltype").setVisible(false);
            //Hide InspectionTypeiosas_inspectiontype  
            //formContext.getControl("iosas_inspectiontype").setVisible(false);
            formContext.ui.tabs.get('tab_general').sections.get("address").setLabel('Physical Address');
        }
    },
    // function to show or hide Exception Comment field
    showorhideExceptionComment: function (executionContext) {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("iosas_exception").getValue() == true)
            formContext.getControl("iosas_exceptioncomment").setVisible(true);
        else {
            formContext.getControl("iosas_exceptioncomment").setVisible(false);
            formContext.getAttribute("iosas_exceptioncomment").setValue(null);
        }


    },
    //function to show or hide special inspectionComment field
    showorhideSpecialInspectionComment: function (executionContext) {
        var formContext = executionContext.getFormContext();

        if (formContext.getAttribute("iosas_specialinspection").getValue()) {
            formContext.getControl("iosas_specialinspectioncomment").setVisible(true);
        } else {
            formContext.getControl("iosas_specialinspectioncomment").setVisible(false);
            formContext.getAttribute("iosas_specialinspectioncomment").setValue(null);
        }
    },
    //function to show or hide special Program Evaluation field
    showorhideProgramEvaluationComment: function (executionContext) {
        var formContext = executionContext.getFormContext();

        if (formContext.getAttribute("iosas_programevaluation").getValue()) {
            formContext.getControl("iosas_programevaluationcomment").setVisible(true);
        } else {
            formContext.getControl("iosas_programevaluationcomment").setVisible(false);
            formContext.getAttribute("iosas_programevaluationcomment").setValue(null);
        }
    },
    SetCertificateGrade: function (executionContext) {
        var formContext = executionContext.getFormContext();
        // Enable School Category field for new records
        if (formContext.ui.getFormType() == 1) // 1 is for new record) 
        {

            formContext.getControl("iosas_schooltype").setDisabled(false);
        }
        // Set Certificte Grade
        //100 = Elementary (GR K-7, EU)
        //101 = Elem Jr. Secondary (GR K-10, EU, SU)
        //102 = Elementary-Secondary (GR K-12, EU, SU)
        //103 = Junior Secondary (GR 8-10, SU)
        //104 = Secondary (GR 8-12, SU)
        //105 = Senior Secondary (GR 11-12)
        //106 = Middle School (5-8,6-8,6-9,7-8,7-9,EU,SU)
        var selectedGrade = formContext.getAttribute("iosas_schooltype").getValue();
        if (selectedGrade != null) { //&& (!formContext.getAttribute("iosas_certificategrades").getValue())) {
            switch (selectedGrade) {
                case 100:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Kindergarten - Grade 7)");
                    break;
                case 101:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Kindergarten - Grade 10)");
                    break;
                case 102:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Kindergarten - Grade 12)");
                    break;
                case 103:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Grades 8 - 10)");
                    break;
                case 104:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Grades 8 - 12)");
                    break;
                case 105:
                    formContext.getAttribute("iosas_certificategrades").setValue(" (Grades 11 - 12)");
                    break;
                default:


            }

        }
    },
    setAuthorityNo: function (executionContext) {
        var formContext = executionContext.getFormContext();
        if (formContext.data.entity.attributes.get('iosas_authority').getValue()) {
            var AuthID = formContext.data.entity.attributes.get('iosas_authority').getValue()[0].id;
            //Set Classification 
            //Get School fields
            Xrm.WebApi.retrieveRecord("edu_schoolauthority", AuthID, "?$select=edu_authority_no").then(function success(result) {
                if (result != null) {

                    formContext.getAttribute("iosas_authoritynumber").setValue(result.edu_authority_no);
                }
            });
        }

    },
    //A function to set inspection funding group.
    setInspectionFundingGroup: function (executionContext) {
        var formContext = executionContext.getFormContext();
        if (formContext.ui.getFormType() == 1) // New record
        {
            if (formContext.getAttribute("edu_schoolcategory").getValue() == 101 && formContext.getAttribute("edu_facilitytype").getValue() == 757500008) {
                this.getAndSetInspFundingGrp(formContext, "DL Schools");
            } else if (formContext.getAttribute("edu_schoolcategory").getValue() == 101 &&
                formContext.getAttribute("edu_facilitytype").getValue() != 757500008 &&
                formContext.getAttribute("edu_schoolcategory").getValue() != null &&
                formContext.getAttribute("edu_schoolcategory").getValue() != undefined) {

                attributes = formContext.data.entity.attributes.get();
                if (attributes != null) {
                    for (var i in attributes) {
                        if (attributes[i].getIsDirty()) {
                            if (attributes[i].getName() == "iosas_fundinggroup") {
                                var fundingGroup = attributes[i].getValue();
                                if (fundingGroup != null) {
                                    var fundingGroupName = fundingGroup[0].name;
                                    this.getAndSetInspFundingGrp(formContext, fundingGroupName);

                                }
                            }
                        }
                    }
                }
            }

        }
    },
    //A function called on change of mincode to update schoolcode
    onchangeofMincode: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let formtype = formContext.ui.getFormType();
        if (formtype == 2) {
            let mincode, schoolcode;
            mincode = formContext.getAttribute("edu_mincode").getValue();
            if (mincode == null || mincode.length < 5) return;
            schoolcode = mincode.slice(-5);
            formContext.getAttribute("edu_schoolcode").setValue(schoolcode);
            formContext.data.entity.save();

        }
    },

    getAndSetInspFundingGrp: function (formContext, name) {
        var req = new XMLHttpRequest();
        let url = formContext.context.getClientUrl();
        req.open("GET", url + "/api/data/v9.1/iosas_inspectionfundinggroups?$select=iosas_inspectionfundinggroupid,iosas_name&$filter=contains(iosas_name, '" + name + "')", false); //DL%20Schools
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.setRequestHeader("Prefer", "odata.include-annotations=\"*\"");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 200) {
                    var results = JSON.parse(this.response);
                    if (results.value.length > 0) {
                        var iosas_inspectionfundinggroupid = results.value[0]["iosas_inspectionfundinggroupid"];
                        var iosas_name = results.value[0]["iosas_name"];
                        // Set Inspection Funding Group lookup value.
                        var inspectionFundingGrp = new Array();
                        inspectionFundingGrp[0] = new Object();
                        inspectionFundingGrp[0].id = iosas_inspectionfundinggroupid;
                        inspectionFundingGrp[0].name = iosas_name;
                        inspectionFundingGrp[0].entityType = "iosas_inspectionfundinggroup";
                        formContext.getAttribute("iosas_inspectionfundinggroup").setValue(inspectionFundingGrp);
                    }
                } else {
                    Xrm.Navigation.openAlertDialog(this.statusText);
                }
            }
        };
        req.send();
    },
    //A function to refresh ribbon
    RibbonRefresh: function (executionContext, tabObj) {
        tabName = tabObj;
        var formContext = executionContext.getFormContext();
        formContext.ui.refreshRibbon();
    },
    //A common function to set last updated column(Primary, Secondary and Teritory Email) ISOFMR-627
    setLastupdate: function (executionContext, destinationColumns) {
        debugger;
        let formContext = executionContext.getFormContext();
        const currentdate = new Date();
        let hours = currentdate.getHours();
        let minutes = currentdate.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        var date = currentdate.getFullYear() + '-' + (currentdate.getMonth() + 1) + '-' + currentdate.getDate();
        formContext.getAttribute(destinationColumns).setValue(date + " " + strTime);
        // formContext.data.entity.save();

    },
    //A function called on save
    onSave: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let formtype = formContext.ui.getFormType();
        if (formtype == 1) {
            this.setInspectionFundingGroup(executionContext);
            let mincode, schoolcode;
            mincode = formContext.getAttribute("edu_mincode").getValue();
            if (mincode == null || mincode.length < 5) return;
            schoolcode = mincode.slice(-5);
            formContext.getAttribute("edu_schoolcode").setValue(schoolcode);

        }

    }

};

var tabName;
//A function to show or hide delete button called from schoolribbon enable rule
EnableDisableDeleteButton = function (formContext) {
    var showdeletenBtn = false;
    if (tabName == "general" || tabName == undefined) {
        showdeletenBtn = true;
    }
    return showdeletenBtn;
}

IOSAS.Schools.setAuthorityNo = function (executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.data.entity.attributes.get('iosas_authority').getValue()) {

        var AuthID = formContext.data.entity.attributes.get('iosas_authority').getValue()[0].id;

        //Set Classification 
        //Get School fields
        Xrm.WebApi.retrieveRecord("edu_schoolauthority", AuthID, "?$select=edu_authority_no").then(function success(result) {
            if (result != null) {

                formContext.getAttribute("iosas_authoritynumber").setValue(result.edu_authority_no);
            }
        });
    }

}