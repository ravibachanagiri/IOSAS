var IOSAS = IOSAS || {};

IOSAS.Certificate = IOSAS.Certificate || {
    LATEST_CERTIFICATE_ID: 0,
    NEW_TIMELINE_NAME: "Certificates",
    SHOW_CERTIFICATE_BUTTON: true
};

const FORM_STATE = {
    UNDEFINED: 0,
    CREATE: 1,
    UPDATE: 2,
    READ_ONLY: 3,
    DISABLED: 4,
    BULK_EDIT: 6
};

const SCHOOL_CATEGORY = {
    INDEPEND: 101,
    OFFSHORE: 102
};
IOSAS.Certificate = {
    onsave: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let formState = formContext.ui.getFormType();
        switch (formState) {
            case 0: //undefined
                break;
            case 1: //Create/QuickCreate
                this.setFormattedcreatedonDate(executionContext);
                break;
            case 2: // update
                break;
            case 3: //readonly
                break;
            case 4: //disable
                break;
            case 6: //bulkedit
                break;
        }
    },
    onLoad: function (executionContext) {
        let formContext = executionContext.getFormContext();
        let formState = formContext.ui.getFormType();
        var schoolCategory;
        switch (formState) {
            case 0: //undefined
                break;
            case 1: //Create/QuickCreate
                this.SetOrDisplayFields(executionContext);
                this.prefillCertDetails(executionContext);
                break;
            case 2: // update
                this.SetOrDisplayFields(executionContext);
                this.disableFormFields(formContext);
                this.getSchoolCategoryType(formContext);

                break;
            case 3: //readonly
                this.getSchoolCategoryType(formContext);
                break;
            case 4: //disable
                break;
            case 6: //bulkedit
                break;
        }
    },

};


IOSAS.Certificate.SetOrDisplayFields = function (executionContext) {
    let formContext = executionContext.getFormContext();
    if (formContext.getAttribute("iosas_edu_school").getValue() !== null && formContext.getAttribute("iosas_edu_school").getValue()[0].id !== null) {
        let schoolid = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
        //Get School fields
        Xrm.WebApi.retrieveRecord("edu_school", schoolid, "?$select=edu_schoolcategory").then(
            function success(result) {
                if (result !== null) {
                    let qvf_school = formContext.ui.quickForms.get("qvf_school");
                    if (result.edu_schoolcategory === SCHOOL_CATEGORY.OFFSHORE) {
                        formContext.ui.quickForms.get("qvf_FundingGroup").setVisible(false);
                        if (qvf_school && qvf_school !== undefined) {
                            qvf_school.getControl("iosas_authority").setVisible(false);
                        }
                        formContext.getControl("iosas_certificationtype").setVisible(false);
                        formContext.getControl("iosas_preferredclassification").setVisible(false);
                        formContext.getControl("iosas_classification").setVisible(false);
                        formContext.getControl("iosas_isinterim").setVisible(false);
                        //set certificate name
                        IOSAS.Certificate.SetCertificateName(formContext, result.edu_schoolcategory);
                    } else {
                        if (qvf_school !== undefined) {
                            qvf_school.getControl("iosas_owneroperator").setVisible(false);
                            qvf_school.getControl("iosas_certifiedsince").setVisible(false);
                        }
                    }
                }
            },
            function (error) {
                console.log(error.message);
            });
    }
    IOSAS.Certificate.RenameTimeline(formContext);
};

IOSAS.Certificate.SetCertificateName = function (formContext, schoolCategory) {
    let formState = formContext.ui.getFormType();
    if (formState === FORM_STATE.CREATE) {
        let url = formContext.context.getClientUrl();
        fetch(url + "/api/data/v9.2/edu_years?$filter=statuscode eq 1&$orderby=edu_name desc&$top=1")
            .then((re) => re.json())
            .then((re) => {
                let yearName = re.value[0].edu_name;
                if (schoolCategory === SCHOOL_CATEGORY.OFFSHORE) {
                    formContext.getAttribute("iosas_name").setValue(`SY ${yearName.replace("SY", "")}Certificate`);
                }
            });
    }
};

IOSAS.Certificate.RenameTimeline = function (formContext) {
    let formState = formContext.ui.getFormType();
    let interval = 3000;
    if (formState === FORM_STATE.UPDATE) {
        interval = 10;
    }
    setTimeout(() => {
        if (parent.document.getElementById("action_bar_header_title")) {
            parent.document.getElementById("action_bar_header_title").innerHTML = "Certificates";
        }
    }, interval);
};

IOSAS.Certificate.setCertificateTypeValue = function (executionContext) {
    // When Is Interim choice changes set certificate type
    var formContext = executionContext.getFormContext();
    var bolInterim = formContext.getAttribute("iosas_isinterim").getValue();
    if (bolInterim) {
        formContext.getAttribute("iosas_certificationtype").setValue("Interim");
    } else {
        formContext.getAttribute("iosas_certificationtype").setValue("Regular");
    }
};

IOSAS.Certificate.prefillCertDetails = function (executionContext) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute("iosas_edu_school").getValue() != null && formContext.getAttribute("iosas_edu_school").getValue()[0].id != null) {
        var schoolid = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
        //Get School fields
        Xrm.WebApi.retrieveRecord("edu_school", schoolid, "?$select=iosas_schooltype,iosas_certificategrades,edu_facilitytype,edu_schoolcategory,edu_mincode&$expand=iosas_fundinggroup($select=iosas_fundinggroupid,iosas_name)").then(

            function success(result) {
                if (result != null) {
                    // Set Certification Number
                    if (result.edu_mincode != null) {
                        formContext.getAttribute("iosas_certificationnumber").setValue(Number(result.edu_mincode).toString());
                    }
                    // Set Grades name
                    var schoolType = "";
                    let edu_facilitytype = result.edu_facilitytype;
                    if (result.iosas_certificategrades != null) {
                        schoolType = " " + result.iosas_certificategrades;
                    }
                    //Set Certification Type
                    if (result.iosas_fundinggroup != null) {
                        //Set Classification 
                        Xrm.WebApi.retrieveMultipleRecords("iosas_certificateclassification", "?$select=iosas_name,iosas_certificateclassificationid&$filter=iosas_name eq '" + result.iosas_fundinggroup.iosas_name + "' ").then(

                            function _success(result) {
                                for (var i = 0; i < result.entities.length; i++) {
                                    var lookupValue = new Array();
                                    lookupValue[0] = new Object();
                                    lookupValue[0].id = result.entities[i].iosas_certificateclassificationid;
                                    lookupValue[0].name = result.entities[i].iosas_name;
                                    lookupValue[0].entityType = "iosas_certificateclassification";
                                    formContext.getAttribute("iosas_classification").setValue(lookupValue);
                                    break;
                                }
                            },

                            function (error) {
                                alert("Error: " + error.message);
                            });
                        formContext.getAttribute("iosas_name").setValue(result.iosas_fundinggroup.iosas_name + schoolType);
                        formContext.getAttribute("iosas_certificationtype").setValue(result.iosas_fundinggroup.iosas_name);

                    } else {
                        formContext.getAttribute("iosas_certificationtype").setValue("Interim");
                        formContext.getAttribute("iosas_name").setValue("Group 3 Interim" + schoolType);
                        formContext.getAttribute("iosas_isinterim").setValue(true);
                    }
                    // Set Start and End dates based on Certifiction Type
                    //Independant schools
                    //101 = Independant
                    //102 = OffShore
                    // Set Issue Date default value

                    formContext.getAttribute("iosas_issuedate").setValue(new Date());
                    if (result.edu_schoolcategory == '101') {
                        console.log(edu_facilitytype);
                        formContext.ui.quickForms.get("qvf_FundingGroup").setVisible(true);
                        IOSAS.Certificate.SetCertStartEndDate(formContext, edu_facilitytype);
                    } else if (result.edu_schoolcategory == '102') {
                        //getOffShoreDates(formContext);

                        IOSAS.Certificate.setExpiryDate(formContext);



                        IOSAS.Certificate.setEffectiveDate(formContext);

                        IOSAS.Certificate.getSchoolDetails(formContext);
                        formContext.ui.quickForms.get("qvf_FundingGroup").setVisible(false);
                        //set Certification Type
                        formContext.getAttribute("iosas_certificationtype").setValue("Regular");
                    }
                }
            },

            function (error) {
                alert(error.message);
            });

    }

};
// Format save date for Letter Use 
IOSAS.Certificate.setFormattedcreatedonDate = function (executionContext) {
    var formContext = executionContext.getFormContext();
    var d = new Date();
    const month = d.getMonth();
    const date = d.getDate();
    const year = d.getFullYear();
    let formattedDate = this.setFormattedDate(month, year, date);
    formContext.getAttribute("iosas_formattedcreatedon").setValue(formattedDate);


};

IOSAS.Certificate.SetCertStartEndDate = function (executionContext, edu_facilitytype) {
    var formContext = executionContext;
    var CertType = "";
    //   if (formContext.getAttribute("iosas_certificationtype").getValue() != null) {
    //get Cert. Type       
    CertType = formContext.getAttribute("iosas_certificationtype").getValue();
    //    }
    if (formContext.ui.getFormType() == 1) // 1 is for new record
    {
        var d = new Date();
        //Set Certificate Effective Date
        d.setDate(1);
        d.setMonth(6);
        d.setFullYear(d.getFullYear());
        //Certficate Issue Date
        formContext.getAttribute("iosas_effectivedate").setValue(d);

        //Below lines of code added as a part of ISOFMR-164
        const month = d.getMonth();
        const date = d.getDate();
        const year = d.getFullYear();
        let formattedDate = this.setFormattedDate(month, year, date);
        formContext.getAttribute("iosas_formattedeffectivedate")
            .setValue(formattedDate); //end of ISOFMR-164

        //Set Certificate Expiry Date based on Classification		
        if (CertType == 'Interim' && edu_facilitytype != 757500008) {
            d.setDate(30);
            d.setMonth(5);
            d.setFullYear(d.getFullYear() + 1);
            formContext.getAttribute("iosas_expirydate").setValue(d);

        } else if (CertType == 'Group 1' && edu_facilitytype != 757500008) {
            d.setDate(30);
            d.setMonth(5);
            d.setFullYear(d.getFullYear() + 6);
            formContext.getAttribute("iosas_expirydate").setValue(d);
            formContext.getAttribute("iosas_certificationtype").setValue("Regular");
        } else if (CertType == 'Group 2' && edu_facilitytype != 757500008) {
            d.setDate(30);
            d.setMonth(5);
            d.setFullYear(d.getFullYear() + 6);
            formContext.getAttribute("iosas_expirydate").setValue(d);
            formContext.getAttribute("iosas_certificationtype").setValue("Regular");
        } else if (CertType == 'Group 3' && edu_facilitytype != 757500008) {
            d.setDate(30);
            d.setMonth(5);
            d.setFullYear(d.getFullYear() + 2);
            formContext.getAttribute("iosas_expirydate").setValue(d);
            formContext.getAttribute("iosas_certificationtype").setValue("Regular");
        } else if (CertType == 'Group 4' && edu_facilitytype != 757500008) {
            d.setDate(30);
            d.setMonth(5);
            d.setFullYear(d.getFullYear() + 1);
            formContext.getAttribute("iosas_expirydate").setValue(d);
            formContext.getAttribute("iosas_certificationtype").setValue("Regular");
        }
        if (edu_facilitytype == 757500008) { // If the factulityType is DL ISOFMR-671
            const r = new Date();
            r.setDate(30);
            r.setMonth(5);
            r.setFullYear(r.getFullYear() + 2);
            formContext.getAttribute("iosas_expirydate").setValue(r);
            let formattedDate = this.setFormattedDate(r.getMonth(), r.getFullYear(), r.getDate());
            formContext.getAttribute("iosas_formattedexpirydate").setValue(formattedDate);
            return;


        }

    }
    const month = d.getMonth();
    const date = d.getDate();
    const year = d.getFullYear();
    let formattedDate = this.setFormattedDate(month, year, date);
    formContext.getAttribute("iosas_formattedexpirydate").setValue(formattedDate); //end of ISOFMR-164  

};

// Start here

//A function to set Effective and formatted Date ISOFMR-164
IOSAS.Certificate.setEffectiveDate = function (executionContext) {

    var formContext = executionContext;
    var d = new Date();
    //Set Certificate Effective Date
    d.setDate(1);
    d.setMonth(6);
    d.setFullYear(d.getFullYear());
    formContext.getAttribute("iosas_effectivedate").setValue(d);
    const month = d.getMonth();
    const date = d.getDate();
    const year = d.getFullYear();
    let formattedEffectiveDate = this.setFormattedDate(month, year, date);
    formContext.getAttribute("iosas_formattedeffectivedate")
        .setValue(formattedEffectiveDate);
};
//A function to set Expiry and formatted Date ISOFMR-164

IOSAS.Certificate.setExpiryDate = function (executionContext) {
    var formContext = executionContext;
    /* Commented ISOFMR-618
     var ed = new Date();
    ed.setDate(30);
    ed.setMonth(5);
    ed.setFullYear(ed.getFullYear() + 1);*/
    let edYear = new Date().getFullYear();
    edYear = edYear + 1;
    const edDate = 30;
    const edMonth = 'Jun';
    const ed = new Date("30-Jun-'" + edYear + "'");
    formContext.getAttribute("iosas_expirydate").setValue(ed);
    const month = ed.getMonth();
    const date = ed.getDate();
    const year = ed.getFullYear();
    const formattedExpiryDate = this.setFormattedDate(month, year, date);
    formContext.getAttribute("iosas_formattedexpirydate")
        .setValue(formattedExpiryDate); //end of ISOFMR-164

};
//A function to get the current status records date and format it.ISOFMR-164

IOSAS.Certificate.setCertificateNumber = function (formContext) {
    //  var minCode= getSchoolDetails (formContext);
    let url = formContext.context.getClientUrl();
    fetch(url + "/api/data/v9.2/edu_years?$filter=statuscode eq 1")
        .then((re) => re.json())
        .then((re) => {
            let schoolName = re.value[0].edu_name;
            if (schoolName == null) return;
            schoolName = schoolName.substring(1, 4);
            let cNumber = formContext.getAttribute("iosas_certificationnumber")
                .getValue();
            const dCode = "103";
            let formatedNumber;
            if (cNumber == null) {
                formatedNumber = dCode + "-" + schoolName;
            } else formatedNumber = dCode + cNumber + "-" + schoolName;
            formContext.getAttribute("iosas_certificationnumber")
                .setValue(formatedNumber);
        });
};
// A function to get school Certificate Number ISOFMR-164.

IOSAS.Certificate.getSchoolDetails = function (formContext) {
    let url = formContext.context.getClientUrl();
    let schoolID = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
    fetch(
        url +
        "/api/data/v9.2/edu_schools(" + schoolID.replace(/[{}]/g, "") +
        ")?$select=edu_mincode")
        .then((re) => re.json())
        .then((re) => {
            var mincode = re.edu_mincode;
            if (mincode != null) {
                mincode = mincode.substring(3, 8);
            }
            formContext.getAttribute("iosas_certificationnumber").setValue(mincode);
            IOSAS.Certificate.setCertificateNumber(formContext, mincode);
        });
};
//A function to disable all fields if status  Expired/Revoked/Cancelled/Archived, s
IOSAS.Certificate.disableFormFields = function (formContext) {
    const current = 100000000;
    const expired = 100000001;
    const revoked = 100000003;
    const canceled = 100000004;
    const archived = 100000005;
    let status = formContext.getAttribute("statuscode").getValue();
    let schoolID = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
    if (schoolID == null) return;
    if (status == current) return;
    formContext.ui.controls.forEach(function (control, index) {
        var controlType = control.getControlType();
        if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid") {
            control.setDisabled(true);
        }
    });
    formContext.data.entity.save();

};

//A function to show or hide quick view control based on the schoolCategory
IOSAS.Certificate.getSchoolCategoryType = function (formContext) {
    let schoolID = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
    let url = formContext.context.getClientUrl();
    fetch(url + "/api/data/v9.2/edu_schools(" + schoolID.replace(/[{}]/g, "") +
        ")?$select=edu_schoolcategory")
        .then((re) => re.json())
        .then((re) => {
            schoolCategory = re.edu_schoolcategory;
            if (schoolCategory == 101) {
                //SHow Funding Group type
                formContext.ui.quickForms.get("qvf_FundingGroup").setVisible(true);
                return
            } else formContext.ui.quickForms.get("qvf_FundingGroup").setVisible(false);
        });
};
//A function to set formated date for expirty and effective date ISOFMR-422
IOSAS.Certificate.setEffectiveExpiryDate = function (executionContext, currentvalue, formattedColumn) {
    var formContext = executionContext.getFormContext();
    let dateValue = formContext.getAttribute(currentvalue).getValue();
    let formattedExpiryDate = " ";
    if (dateValue != null) {
        const month = dateValue.getMonth();
        const date = dateValue.getDate();
        const year = dateValue.getFullYear();
        formattedExpiryDate = IOSAS.Certificate.setFormattedDate(month, year, date);
    }
    formContext.getAttribute(formattedColumn)
        .setValue(formattedExpiryDate);
    //formContext.data.entity.save();


};
//A fuction to format the date per Certificate ISOFMR-422
IOSAS.Certificate.setFormattedDate = function (m, y, d) {
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
};


// a function called on change of cetificate to set school certificate expiry date iosas_certificateexpiration ISOFMR-415
IOSAS.Certificate.setSchoolExpiryDate = function (executionContext) {
    var formContext = executionContext.getFormContext();
    let dateValue = formContext.getAttribute("iosas_expirydate").getValue();
    if (dateValue == null) return;
    let school = formContext.getAttribute("iosas_edu_school").getValue();
    if (school == null) return;
    certificateexpiry = new Date(dateValue).toISOString();
    let url = formContext.context.getClientUrl();
    fetch(url + "/api/data/v8.2/edu_schools(" + school[0].id.replace(/[{}]/g, "") + ")", {
        method: "patch",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "iosas_certificateexpiration": certificateexpiry
        })
    })
};
//A function called on save to set the schoolexpirydate. Replacing existing flow.
IOSAS.Certificate.onSave = function (executionContext) {
    let formContext = executionContext.getFormContext();
    let formState = formContext.ui.getFormType();
    if (formState == 1) {
        IOSAS.Certificate.setSchoolExpiryDate(executionContext);
    }

};

//A function called on click of button generatecoverletter to generate PDF coverletter.
IOSAS.Certificate.GenerateCoverLetterPDF = function (primaryControl) {
    let formContext = primaryControl;
    let certificateID = formContext.data.entity.getId().replace("{", "").replace("}", "");
    let url, flowURL, certificateName;
    url = formContext.context.getClientUrl();
    certificateName = formContext.getAttribute("iosas_name").getValue();
    environmentVariable = "iosas_IOSASCertificateGenerateCoverLetterHTTPRequestURL";
    fetch("/api/data/v9.2/EntityDefinitions(LogicalName='iosas_certificate')?$select=ObjectTypeCode&$expand=Attributes").then((re) => re.json()).then((re) => {
        entityTypeCode = re["ObjectTypeCode"];
        fetch(
            url +
            "/api/data/v9.2/environmentvariabledefinitions?$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)&$filter=schemaname eq '" + environmentVariable + "'")
            .then((re) => re.json())
            .then((re) => {
                flowURL = re.value[0].environmentvariabledefinition_environmentvariablevalue[0].value
                let input = JSON.stringify({
                    iosas_certificateid: certificateID,
                    iosas_entityTypeCode: entityTypeCode,
                    iosas_apiURL: url,
                    iosas_name: certificateName

                });
                // Call PA flow to generate PDF
                let req = new XMLHttpRequest();
                req.open("POST", flowURL, false);
                req.setRequestHeader('Content-Type', 'application/json');
                req.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        req.onreadystatechange = null;
                        if (this.status === 200) {
                            setTimeout(function () {
                                Xrm.Utility.closeProgressIndicator();
                                formContext.getControl("Timeline").refresh();
                                formContext.data.refresh();
                            }, 5000); //Time out after 5seconds

                        } else {
                            Xrm.Utility.closeProgressIndicator();
                            let result = this.response;
                            console.log("Error in Flow " + result);
                        }
                    }
                };
                req.send(input);

                //});
            });
    });
};

//A function triggered on change of Status to check if the close date on the school contains data or not. ISOFMR-188
IOSAS.Certificate.onChangeofStatus = function (executionContext) {
    const current = 100000000;
    const expired = 100000001;
    const revoked = 100000003;
    const canceled = 100000004;
    const archived = 100000005;
    let formContext = executionContext.getFormContext();
    const url = formContext.context.getClientUrl();
    let status = formContext.getAttribute("statuscode").getValue();
    let schoolID = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
    if (schoolID == null) return;
    if (status == current) return;
    if (status == expired) {
        console.log(` Status of Certificate is ${status}`);
        const currentDate = new Date();
        const formattedcurrentDate = currentDate.setHours(0, 0, 0);
        const expiryDate = formContext.getAttribute("iosas_expirydate").getValue();
        const formattedexpiryDate = expiryDate.setHours(0, 0, 0);
        const title = 'Not Valid';
        const text = 'Cannot change the status to Expiry since the expiry date must pass the current date';
        //If the expiry value is already passed then user should not able to change status to expiry
        if (formattedcurrentDate > formattedexpiryDate) {
            var confirmStrings = {
                title: title,
                text: text,
                subtitle: "",
                confirmButtonLabel: "Ok",
                cancelButtonLabel: "Cancel"
            };
            var confirmOptions = {
                height: 200,
                width: 450
            };
            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                function (success) {
                    if (success.confirmed) {
                        executionContext["_formContext"].getAttribute("statuscode").setValue(100000000);
                        executionContext["_formContext"].data.entity.save();
                    } else {
                        executionContext["_formContext"].getAttribute("statuscode").setValue(100000000);
                        executionContext["_formContext"].data.entity.save();

                    }
                },
                function (fail) {
                    console.log(fail);
                });
            return;
        } else {
            this.setCertificatetoReadOnly(formContext);
        }
    } else if (status == canceled || status == revoked) {
        console.log(` Status of Certificate is ${status}`);
        //from 'Current' to 'Canceled' or 'Revoked' –
        fetch(
            url +
            "/api/data/v8.2/edu_schools(" + schoolID.replace(/[{}]/g, "") +
            ")?$select=edu_closedate")
            .then((re) => re.json())
            .then((re) => {
                const closeDate = re.edu_closedate;
                if (closeDate != null) {
                    this.setCertificatetoReadOnly(formContext);
                    return;
                }
                const title = 'Close Date Required';
                const text = 'Please enter a close date for school before you can perform the action. Click  on School button to Navigate to School Record';
                const entityName = 'edu_school';
                const formTpe = 2;
                var confirmStrings = {
                    title: title,
                    text: text,
                    subtitle: "",
                    confirmButtonLabel: "School",
                    cancelButtonLabel: "Cancel"
                };
                var confirmOptions = {
                    height: 200,
                    width: 450
                };
                Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
                    function (success) {
                        if (success.confirmed) {
                            executionContext["_formContext"].getAttribute("statuscode").setValue(100000000);
                            executionContext["_formContext"].data.entity.save();
                            schoolID = schoolID.replace(/[{}]/g, "");
                            Xrm.Navigation.navigateTo({
                                pageType: "entityrecord",
                                entityName: entityName,
                                formType: formTpe,
                                entityId: schoolID
                            }, {
                                target: 2,
                                position: 1,
                                width: {
                                    value: 50,
                                    unit: "%"
                                }
                            });
                        } else {
                            //Do nothing since user clicked on canceled
                            executionContext["_formContext"].getAttribute("statuscode").setValue(100000000);
                            executionContext["_formContext"].data.entity.save();
                            // executionContext["_formContext"]._data.refresh(false);
                        }
                    },
                    function (fail) {
                        console.log(fail);
                    });
            });
    }
    //Archieved
    else {
        //To be discussed

    }
};
// A function to set the Certificate status to Inactive
IOSAS.Certificate.setCertificatetoReadOnly = function (formContext) {
    const title = 'Change of Status';
    const text = 'Are you sure to change the status';
    var confirmStrings = {
        title: title,
        text: text,
        subtitle: "",
        confirmButtonLabel: "Ok",
        cancelButtonLabel: "Cancel"
    };
    var confirmOptions = {
        height: 200,
        width: 450
    };
    Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
        function (success) {
            if (success.confirmed) {
                formContext.ui.controls.forEach(function (control, index) {
                    var controlType = control.getControlType();
                    if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid") {
                        control.setDisabled(true);
                    }

                });
                formContext.data.entity.save();

            } else {
                formContext.getAttribute("statuscode").setValue(100000000);
            }
        },
        function (fail) {
            console.log(fail);
        });
};