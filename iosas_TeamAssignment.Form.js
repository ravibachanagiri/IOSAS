var IOSAS = IOSAS || {};
IOSAS.TeamAssignment = IOSAS.TeamAssignment || {};

IOSAS.TeamAssignment.prePopulateFields = function (executionContext) {
    var formContext = executionContext.getFormContext();
    var InpectorID;

    if (formContext.ui.getFormType() == 1) // 1 is for new record
    {
        InpectorID = formContext.getAttribute("iosas_inspectorcontractor").getValue();
        if (InpectorID == undefined || InpectorID == null) return;
        InpectorID = formContext.getAttribute("iosas_inspectorcontractor").getValue()[0].id.replace("{", "").replace("}", "");
        Xrm.WebApi.retrieveRecord("contact", InpectorID, "?$select=fullname,iosas_classification,iosas_gstnumber,iosas_suppliername,iosas_suppliercode,iosas_suppliersite,iosas_offshore,iosas_independent,telephone1,telephone2,mobilephone,emailaddress1,address1_line1,address1_line2,address1_city,address1_stateorprovince,address1_postalcode,address1_country").then(
            function _success(result) {
                if (result.fullname != null) {
                    formContext.getAttribute("iosas_inspectorname").setValue(result.fullname);
                    formContext.getAttribute("iosas_name").setValue(result.fullname);
                }
                if (result.iosas_classification != null) {
                    formContext.getAttribute("iosas_teamassignmentrole").setValue(result.iosas_classification);
                    formContext.getAttribute("iosas_classification").setValue(result["iosas_classification@OData.Community.Display.V1.FormattedValue"]);
                }
                if (result.iosas_gstnumber != null) {
                    formContext.getAttribute("iosas_gstnumber").setValue(result.iosas_gstnumber);
                }
                if (result.iosas_suppliername != null) {
                    formContext.getAttribute("iosas_suppliername").setValue(result.iosas_suppliername);
                }
                if (result.iosas_suppliercode != null) {
                    formContext.getAttribute("iosas_suppliercode").setValue(result.iosas_suppliercode);
                }
                if (result.iosas_suppliersite != null) {
                    formContext.getAttribute("iosas_suppliersite").setValue(result.iosas_suppliersite);
                }
                if (result.iosas_offshore != null) {
                    formContext.getAttribute("iosas_offshore").setValue(result["iosas_offshore@OData.Community.Display.V1.FormattedValue"]);
                }
                if (result.iosas_independent != null) {
                    formContext.getAttribute("iosas_independent").setValue(result["iosas_independent@OData.Community.Display.V1.FormattedValue"]);
                }
                if (result.telephone1 != null) {
                    formContext.getAttribute("iosas_workphone").setValue(result.telephone1);
                }
                if (result.telephone2 != null) {
                    formContext.getAttribute("iosas_homephone").setValue(result.telephone2);
                }
                if (result.mobilephone != null) {
                    formContext.getAttribute("iosas_cellphone").setValue(result.mobilephone);
                }
                if (result.emailaddress1 != null) {
                    formContext.getAttribute("iosas_emailaddress1").setValue(result.emailaddress1);
                }
                if (result.address1_line1 != null) {
                    formContext.getAttribute("iosas_address1_line1").setValue(result.address1_line1);
                }
                if (result.address1_line2 != null) {
                    formContext.getAttribute("iosas_address1_line2").setValue(result.address1_line2);
                }
                if (result.address1_city != null) {
                    formContext.getAttribute("iosas_address1_city").setValue(result.address1_city);
                }
                if (result.address1_postalcode != null) {
                    formContext.getAttribute("iosas_address1_postalcode").setValue(result.address1_postalcode);
                }
                if (result.address1_stateorprovince != null) {
                    formContext.getAttribute("iosas_address1_stateprovince").setValue(result.address1_stateorprovince);
                }
                if (result.address1_country != null) {
                    formContext.getAttribute("iosas_address1_country").setValue(result.address1_country);
                }


            },

            function (error) {
                alert(error.message);
            });
    }

}

IOSAS.TeamAssignment.lockfields = function (executionContext) {
    var formContext = executionContext.getFormContext();


    if (formContext.ui.getFormType() != 1) // 1 is for new record
    {

        // for existing records, set inspector field as readonly

        formContext.getControl("iosas_inspectorcontractor").setDisabled(true);
    }

};

IOSAS.TeamAssignment.preFillFeilds = function (executionContext) {
    var formContext = executionContext.getFormContext();
    var InpectionID;
    if (formContext.getAttribute("iosas_inspection").getValue()) {
        var InpectionID = formContext.getAttribute("iosas_inspection").getValue()[0].id.replace("{", "").replace("}", "");
        if (formContext.ui.getFormType() == 1) // 1 is for new record
        {
            if (InpectionID == undefined || InpectionID == null) return;
            Xrm.WebApi.retrieveRecord("iosas_inspection", InpectionID, "?$select=iosas_schoolname,iosas_schoolinspectiontype,iosas_inspectiontype,iosas_inspectiontype&$expand=iosas_schoolyear($select=edu_yearid,edu_name)").then(
                function _success(result) {
                    if (result.iosas_schoolname != null) {

                        formContext.getAttribute("iosas_schoolname").setValue(result.iosas_schoolname);
                    }
                    if (result.iosas_schoolyear != null) {

                        formContext.getAttribute("iosas_schoolyear").setValue(result.iosas_schoolyear.edu_name);
                    }

                    if (result.iosas_inspectiontype != null) {
                        let iosas_inspectiontype = result.iosas_inspectiontype;
                        formContext.getAttribute("iosas_assignmenttype").setValue(result.iosas_inspectiontype);
                        // IOSAS.TeamAssignment.setInspectionType(iosas_inspectiontype, formContext);


                    }
                },

                function (error) {
                    alert(error.message);
                });

        }
    }
}

IOSAS.TeamAssignment.setInspectionType = function (iosas_inspectiontype, formContext) {
    if (iosas_inspectiontype != null) {
        switch (iosas_inspectiontype) {
            case "EEC":
                formContext.getAttribute("iosas_assignmenttype").setValue(100000003);
                formContext.data.entity.save();
                break;
            case "MI":
                formContext.getAttribute("iosas_assignmenttype").setValue(100000004);
                formContext.data.entity.save();
                break;
            case "PE":
                formContext.getAttribute("iosas_assignmenttype").setValue(100000005);
                formContext.data.entity.save();
                break;
            case "SP":
                formContext.getAttribute("iosas_assignmenttype").setValue(100000006);
                formContext.data.entity.save();
                break;
        }
    }

}