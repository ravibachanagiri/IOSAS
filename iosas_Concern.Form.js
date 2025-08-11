var IOSAS = IOSAS || {};

IOSAS.Concern = IOSAS.Concern || {};
IOSAS.Concern.onLoad = function (executionContext) {
    let formContext = executionContext.getFormContext();
    switch (formContext.ui.getFormType()) {
        case 0: //undefined
            break;
        case 1: //Create/QuickCreate
            IOSAS.Concern.prePopulateFields(executionContext);
            break;
        case 2: // update
            this.showhideStatusFields(executionContext);
            break;
        case 3: //readonly
            break;
        case 4: //disable
            break;
        case 6: //bulkedit
            break;
    }
},


    IOSAS.Concern.prePopulateFields = function (primaryControl) {

        var formContext = primaryControl.getFormContext();

        var url = formContext.context.getClientUrl();
        var InpectionID;
        if (formContext.ui.getFormType() == 1) // 1 is for new record
        {
            if (formContext.getAttribute("iosas_inspection").getValue()) {
                InpectionID = formContext.getAttribute("iosas_inspection").getValue()[0].id.replace("{", "").replace("}", "");
            }
            var lastestID;
            formContext.getAttribute("iosas_name").setValue("1");
            fetch(
                url +
                "/api/data/v9.1/iosas_concerns?$select=iosas_name&$orderby=iosas_name desc&$top=1&$filter=_iosas_inspection_value eq " + InpectionID)
                .then((re) => re.json())
                .then((re) => {
                    lastestID = re.value[0].iosas_name;

                    if (lastestID != null) {
                        lastestID = Number(lastestID) + 1

                        formContext.getAttribute("iosas_name").setValue(lastestID.toString());
                    }

                });
            fetch(
                url +
                "/api/data/v9.1/iosas_inspections?$select=iosas_schoolname,iosas_schoolmincode,iosas_inspectionstartdate&$filter=iosas_inspectionid eq " + InpectionID)
                .then((re) => re.json())
                .then((re) => {

                    formContext.getAttribute("iosas_schoolname").setValue(re.value[0].iosas_schoolname);
                    formContext.getAttribute("iosas_schoolmincode").setValue(re.value[0].iosas_schoolmincode);
                    if (re.value[0].iosas_inspectionstartdate != null) {
                        formContext.getAttribute("iosas_inspectiondate").setValue(new Date(re.value[0].iosas_inspectionstartdate));
                    }

                });
        }
    }

IOSAS.Concern.clearSubgroup = function (primaryControl) {
    //Clear Concern Subgroup when Concern Group has changed 

    var formContext = primaryControl.getFormContext();
    formContext.getAttribute("iosas_concernsubgroup").setValue(null);

}

IOSAS.Concern.hideFields = function (primaryControl) {
    //fields when Class is "Recomendation"  
    var formContext = primaryControl.getFormContext();
    var selectedConcern = formContext.getAttribute("iosas_concernclass").getValue();

    if (selectedConcern && selectedConcern[0].name == "Recommendation") {
        formContext.getControl("iosas_duedate").setVisible(false);
        formContext.getControl("iosas_statusupdatedate").setVisible(false);
        formContext.getAttribute("statuscode").setValue(100000003); //No Follow-up required = 100000003

    } else {
        formContext.getControl("iosas_duedate").setVisible(true);
        formContext.getControl("iosas_statusupdatedate").setVisible(true);
        formContext.getAttribute("statuscode").setValue(100000000);
    }


}
IOSAS.Concern.showhideStatusFields = function (primaryControl) {
    //fields when Class is "Recomendation"  
    var formContext = primaryControl.getFormContext();
    var selectedConcern = formContext.getAttribute("iosas_concernclass").getValue();

    if (selectedConcern && selectedConcern[0].name == "Recommendation") {
        formContext.getControl("iosas_duedate").setVisible(false);
        formContext.getControl("iosas_statusupdatedate").setVisible(false);

    } else {
        formContext.getControl("iosas_duedate").setVisible(true);
        formContext.getControl("iosas_statusupdatedate").setVisible(true);
    }


}
IOSAS.Concern.onsave = function (primaryControl) {
    let formContext = primaryControl.getFormContext();
    let concernWording = formContext.getAttribute("iosas_wording").getValue();
    if (concernWording == null) return;

    concernWording = concernWording.replace(/(\r\n|\n|\r)/gm, " ");
    formContext.getAttribute("iosas_wording").setValue(concernWording);

}