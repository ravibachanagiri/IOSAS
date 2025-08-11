//A  webresource which is used in Inspection form only

if (typeof (IOSAS) === "undefined") {
    IOSAS = {};
} else {

}

IOSAS.InspectionForm = {
    onLoad: function (executionContext) {
        // Set variables
        let formContext = executionContext.getFormContext();
        let formState = formContext.ui.getFormType();
        switch (formState) {
            case 0: //undefined
                break;
            case 1: //Create/QuickCreate
                let columnNames = ["iosas_isschooltype"];
                this.disableEnableColumns(columnNames, formContext, false);
                break;
            case 2: // update
                let DisablecolumnNames = ["iosas_isschooltype"];
                this.disableEnableColumns(DisablecolumnNames, formContext, true);
                this.setNA(formContext);
                this.showhideParentInspector(formContext);
                this.CheckDirtyFieldsOnForm(formContext);
                this.setFormFocus(formContext);
                break;
            case 3: //readonly
                this.showhideParentInspector(formContext);
                break;
            case 4: //disable
                break;
            case 6: //bulkedit
                break;
        }
    },
    // A function triggered on change of InspectionStartDate to set formattedInspectionStartDate
    onchangeofInspectionStartDate: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let d = formContext.getAttribute("iosas_inspectionstartdate").getValue();
        if (d != null) {
            const month = d.getMonth();
            const date = d.getDate();
            const year = d.getFullYear();
            let formattedEffectiveDate = this.setFormattedDate(month, year, date);
            formContext.getAttribute("iosas_formattedinspectionstartdate")
                .setValue(formattedEffectiveDate);
        } else {
            formContext.getAttribute("iosas_formattedinspectionstartdate")
                .setValue('N/A');
        }
        // this.onchangeofInspectionDate(executionContext,d,null);
        formContext.data.entity.save();
    },
    //A fuction to format the date
    setFormattedDate: function (m, y, d) {
        const name = new Array(
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        );
        let month = name[m];
        let formattedDate = `${month} ${d}, ${y}`;
        return formattedDate;
    },
    // A function triggered on change of statutorydate to set formattedstatutorydate
    onchangeofStatutoryDate: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let d = formContext.getAttribute("iosas_statutorydate").getValue();
        if (d != null) {
            const month = d.getMonth();
            const date = d.getDate();
            const year = d.getFullYear();
            let formattedEffectiveDate = this.setFormattedDate(month, year, date);
            formContext.getAttribute("iosas_formattedstatutorydate")
                .setValue(formattedEffectiveDate);
        } else {
            formContext.getAttribute("iosas_formattedstatutorydate")
                .setValue('N/A');
        }
        formContext.data.entity.save();

    },
    // A function triggered on change of policydate to set formattedpolicy date
    onchangeofPolicyDate: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let d = formContext.getAttribute("iosas_policydate").getValue();
        if (d != null) {
            const month = d.getMonth();
            const date = d.getDate();
            const year = d.getFullYear();
            let formattedEffectiveDate = this.setFormattedDate(month, year, date);
            formContext.getAttribute("iosas_formattedpolicydate")
                .setValue(formattedEffectiveDate);
        } else {
            formContext.getAttribute("iosas_formattedpolicydate")
                .setValue('N/A');
        }
        formContext.data.entity.save();
    },
    //A  function to set formated date if null on load. 
    setNA: function (formContext) {
        let formatedColumns = ["iosas_formattedstatutorydate", "iosas_formattedpolicydate"];
        for (i = 0; i < formatedColumns.length; i++) {
            let name = formatedColumns[i];
            let d = formContext.getAttribute(name).getValue();
            if (d == null) {
                formContext.getAttribute(name)
                    .setValue('N/A');
            }
        }

    },
    //A function to check if the columns are dirty or not ISOFMR-681
    CheckDirtyFieldsOnForm: function (formContext) {
        var attributes = formContext.data.entity.attributes.get();
        var dirtyAttributes = [];
        if (attributes != null) {
            var isDirty = false;
            for (var i in attributes) {
                if (attributes[i].getIsDirty()) {
                    // dirtyAttributes.push(attributes[i].getName());
                    isDirty = true;
                }
            } if (isDirty == true) {
                formContext.data.entity.save();
            }
        }
    },
    //A function to disable or enable columns 
    disableEnableColumns: function (columnNames, formContext, boolValue) {
        for (i = 0; i < columnNames.length; i++) {
            let name = columnNames[i];
            formContext.getControl(name).setDisabled(boolValue);
        }
    },
    // A function which sets letter uploaded time ISOFMR-474.
    onchangeofletters: function (executionContext, parent, child) {
        let formContext = executionContext.getFormContext();
        let iosas_inspectionID = formContext.data.entity.getId().replace("{", "").replace("}", "");
        url = formContext.context.getClientUrl();
        setTimeout(() => {
            fetch(
                url +
                "/api/data/v8.2/iosas_inspections(" + iosas_inspectionID + ")?$select=" + parent + "")
                .then((re) => re.json())
                .then((re) => {
                    let letter;
                    if (parent == "iosas_inspectorletter") {
                        letter = re.iosas_inspectorletter;
                    } else if (parent == "iosas_ministryletter") {
                        letter = re.iosas_ministryletter;
                    } else if (parent == "iosas_originalletter") { // Need to get info on what Business wants here for original
                        letter = re.iosas_originalletter;
                    }
                    console.log(`Letter Name ${letter}`);
                    if (letter == null || letter == " ") {
                        formContext.getAttribute(child).setValue();
                        console.log(`childvalue  to null ${child}`);
                    } else {
                        var childval = formContext.getAttribute(child).getValue();
                        if (childval != null) return;
                        var currentDate = new Date();
                        formContext.getAttribute(child).setValue(currentDate);
                        console.log(`childvalue  to currentDate ${currentDate}`);
                    }
                    console.log(`ChildName :${child}\n ChildVal : ${currentDate}`);
                    setTimeout(() => {
                        console.log(`ChildName :${child}\n ChildVal : ${currentDate}`);
                        //formContext.data.refresh(true).then(successCallback(iosas_inspectionID), errorCallback);
                        formContext.data.save().then(
                            function (sucess) {
                                let val = formContext.getAttribute(parent).getValue();
                                var childval = formContext.getAttribute(child).getValue();
                                count = 10;
                                if (val == null && childval != null) {
                                    for (i = 0; i < count; i++) {
                                        const val = formContext.getAttribute(parent).getValue();
                                        if (val != null) return;
                                        console.log(i);
                                        setTimeout(() => {
                                            formContext.data.refresh(true);
                                            const val = formContext.getAttribute(parent).getValue();
                                            if (val != null) return;
                                        }, 100);
                                    }
                                }

                            },
                            function (error) {
                                // failure
                                // you get more information about why saving data failed in error argument:
                                var errorCode = error.errorCode;
                                var errorMessage = error.message;
                                console.log(errorMessage);
                            });

                    }, 100);

                })
        }, 2000);
    },
    successCallback: function (iosas_inspectionID) {
        var entityFormOptions = {};
        entityFormOptions["entityName"] = "contact";
        entityFormOptions["entityId"] = iosas_inspectionID;

        // Open the form.
        Xrm.Navigation.openForm(entityFormOptions).then(
            function (success) {
                console.log(success);
            },
            function (error) {
                console.log(error);
            });
    },
    // Afunction to shoeHide SchoolInspection and Inspectiontype ISOFMR-624
    showhideParentInspector: function (formContext) {
        let reInspection = formContext.getAttribute("iosas_reinspection").getValue();
        if (reInspection == true) {
            formContext.getControl("iosas_parent_inspection").setVisible(true);
            formContext.getControl("iosas_inspectiontype").setDisabled(false);
            this.hideOptionSetValue(formContext, "iosas_inspectiontype");
            formContext.getAttribute("iosas_inspectiontype").setRequiredLevel("required"); //

        } else {
            formContext.getControl("iosas_parent_inspection").setVisible(false);
            // formContext.getControl("iosas_inspectiontype").setVisible(false);
            formContext.getControl("iosas_inspectiontype").setDisabled(true);
            formContext.getAttribute("iosas_inspectiontype").setRequiredLevel("none");
            // formContext.getControl("iosas_schoolinspectiontype").setVisible(true);
        }
    },
    // A function called to create modified letter message field for word template ISOFMR-647
    setLetterMessageforTemplate: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let lettermessage = formContext.getAttribute("iosas_lettermessage").getValue();
        if (lettermessage != null) {
            if (lettermessage != '') {
                let lettermessagefortemplate = "\n" + "\n" + lettermessage;
                formContext.getAttribute("iosas_lettermessagefortemplate").setValue(lettermessagefortemplate);
            } else {
                let lettermessagefortemplate = lettermessage;
                formContext.getAttribute("iosas_lettermessagefortemplate").setValue(lettermessagefortemplate);
            }
        } else {
            let lettermessagefortemplate = lettermessage;
            formContext.getAttribute("iosas_lettermessagefortemplate").setValue(lettermessagefortemplate);
        }
    },
    // A function to show only fpllowup optionsetvalues
    hideOptionSetValue: function (formContext, arg) {
        formContext.getControl(arg).removeOption(100000000);
        formContext.getControl(arg).removeOption(100000001);
        formContext.getControl(arg).removeOption(100000002);
        formContext.getControl(arg).removeOption(100000003);
    },
    //A function called on change of InspectionType ISOFMR-624
    //Follow up: Name of the Inspection Cycle - Schoolcode- Inspection Type (for follow-up) [-sequential #] if it has duplication 
    onchangeofInspectionType: function (executionContext) {
        let formContext = executionContext.getFormContext();
        this.hideOptionSetValue(formContext, "iosas_inspectiontype");
        let iosas_inspectiontype = formContext.getAttribute("iosas_inspectiontype").getText();
        if (iosas_inspectiontype != null) {
            let iosas_inspectionId = formContext.data.entity.getId().replace("{", "").replace("}", "");
            let iosas_inspectioncycleID = formContext.getAttribute("iosas_inspectioncycle").getValue();
            let iosas_inspectioncycleName = iosas_inspectioncycleID[0].name;
            let iosas_schoolcode = formContext.getAttribute("iosas_schoolcode").getValue();
            let iosas_name = formContext.getAttribute("iosas_name").getValue();
            iosas_name = iosas_name.substring(iosas_name.length - 2);
            iosas_name = iosas_name.replace(/\s/g, '');
            var isbool = /^[0-9]+$/.test(iosas_name);
            let edu_schoolId = formContext.getAttribute("iosas_edu_school").getValue()[0].id.replace("{", "").replace("}", "");;
            let iosas_SchoolYear = formContext.getAttribute("iosas_schoolyear").getValue()[0].id.replace("{", "").replace("}", "");;
            let inspectionType = formContext.getAttribute("iosas_inspectiontype").getValue();
            let rollupColumns = ["iosas_numberofconcerns", "iosas_initialnumberofconcerns"];
            this.updateRollupColumns("iosas_inspections", iosas_inspectionId, rollupColumns, formContext);
            Xrm.WebApi.online.retrieveMultipleRecords("iosas_inspection", "?$select=iosas_name&$filter=_iosas_schoolyear_value eq " + iosas_SchoolYear + " and  iosas_inspectiontype eq " + inspectionType + " and  _iosas_edu_school_value eq " + edu_schoolId + "").then(
                function success(results) {
                    if (results.entities.length > 0) {
                        var count = results.entities.length;
                        console.log(count);
                        count++;
                        var name = `${iosas_inspectioncycleName} - ${iosas_schoolcode} - ${iosas_inspectiontype} (${count})`;
                    } else {
                        var name = `${iosas_inspectioncycleName} - ${iosas_schoolcode} - ${iosas_inspectiontype}`;
                    }
                    formContext.getAttribute("iosas_name").setValue(name);
                    formContext.data.entity.save();
                    return;
                },
                function (error) {
                    Xrm.Navigation.openAlertDialog(error.message);
                }
            );
        }
    },
    // A function called onchange of Inspection start and update to set the concerns date
    onchangeofInspectionDate: function (executionContext, sourceColumn, destinationColumn) {
        let formContext = executionContext.getFormContext();
        let sourceDate = formContext.getAttribute(sourceColumn).getValue();
        if (sourceDate == null || sourceDate == undefined) return;
        sourceDate = new Date(sourceDate).toISOString();
        let inspectionId = formContext.data.entity.getId().replace("{", "").replace("}", "");
        let url = formContext.context.getClientUrl();
        fetch(url + "/api/data/v8.2/iosas_concerns?$select=iosas_concernid,iosas_inspectiondate,iosas_duedate&$filter=(_iosas_inspection_value eq " + inspectionId + " )").then((re) => re.json())
            .then((re) => {
                let count = re.value.length;
                console.log(sourceDate);
                console.log(destinationColumn);
                if (count == 0) return;
                for (i = 0; i < count; i++) {
                    sourceDate = (sourceDate.slice(0, 10));
                    //this.updateConcenDate(formContext, re.value[i].iosas_concernid, sourceDate, destinationColumn);
                    if (destinationColumn == "iosas_inspectiondate") {
                        var entity = {};
                        entity.iosas_inspectiondate = sourceDate;
                    } else {
                        var entity = {};
                        entity.iosas_duedate = sourceDate;
                    }
                    Xrm.WebApi.online.updateRecord("iosas_concern", re.value[i].iosas_concernid, entity).then(
                        function success(result) {
                            console.log('update sucessfully');

                        },
                        function (error) {
                            console.log(error.message);
                        }
                    );
                }
            });
    },
    //A function to update rollupColumns
    updateRollupColumns: function (entityName, iosas_inspectionId, RollUpFieldName, formContext) {
        let url = formContext.context.getClientUrl();
        for (i = 0; i < RollUpFieldName.length; i++) {
            let columnName = RollUpFieldName[i];
            fetch(url + "/api/data/v9.0/CalculateRollupField(Target=@Target,FieldName=@FieldName)?@Target=%7B%22%40odata.id%22%3A%22" + entityName + "(" + iosas_inspectionId + ")%22%7D&@FieldName=%27" + columnName + "%27")
                .then((re) => re.json())
                .then((re) => { })
        }
    },
    setFormFocus: function (formContext) {
        if (this.checkLetterDate(formContext, "iosas_inspectorletter", "iosas_inspectorletterdate")
            || this.checkLetterDate(formContext, "iosas_ministryletter", "iosas_ministryletterdate")) {

            formContext.ui.tabs.get("tab_3_PostInspection").setFocus();
        }
    },
    checkLetterDate: function (formContext, file, date) {
        let MaxElapseTimeAllowed = 30; //in seconds
        let printedDate = formContext.getAttribute(date).getValue();
        let letter = formContext.getAttribute(file).getValue();

        if (printedDate !== null && letter !== null) {
            let letterCreatedSince = (Date.now() - printedDate.getTime()) * 0.001; //in seconds
            return (letterCreatedSince <= MaxElapseTimeAllowed);
        }

        return false;
    }
}