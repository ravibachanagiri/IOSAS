var IOSAS = IOSAS || {};


/*Function to call PA Generate PDF.*/
IOSAS.CertificateRibbon = {
    GeneratePDF: function (primaryControl) {
        Xrm.Utility.showProgressIndicator("Generating certificate, please wait...");
        let formContext = primaryControl;
        //get record Id
        let id = formContext.data.entity.getId().replace("{", "").replace("}", "");
        let cNumber = formContext.getAttribute("iosas_certificationnumber").getValue();
        let schoolID = formContext.getAttribute("iosas_edu_school").getValue()[0].id;
        let url, flowURL;
        url = formContext.context.getClientUrl();
        if (cNumber == null) {
            //Passing dummy date since for OPS time its set by default not for Indepedent type
            cNumber = "102";
        }
        let environmentVariable = "iosas_PDFFlowURL";
        let entityTypeCode;
        fetch("/api/data/v9.2/EntityDefinitions(LogicalName='iosas_certificate')?$select=ObjectTypeCode&$expand=Attributes").then((re) => re.json()).then((re) => {
            entityTypeCode = re["ObjectTypeCode"];
            fetch(
                url +
                "/api/data/v9.2/environmentvariabledefinitions?$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)&$filter=schemaname eq '" + environmentVariable + "'")
                .then((re) => re.json())
                .then((re) => {
                    flowURL = re.value[0].environmentvariabledefinition_environmentvariablevalue[0].value
                    let input = JSON.stringify({
                        iosas_certificateid: id,
                        edu_schoolcategory: schoolCategory,
                        iosas_certificationnumber: cNumber,
                        iosas_entityTypeCode: entityTypeCode,
                        iosas_apiURL: url,
                        iosas_schoolid: schoolID.replace(/[{}]/g, ""),
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
                 });

        });
    },
    //A function called on click of button generatecoverletter to generate PDF coverletter.
    GenerateCoverLetterPDF: function (primaryControl) {
        let formContext = primaryControl;
        Xrm.Utility.showProgressIndicator("Generating Cover Letter, please wait...");
        let certificateID = formContext.data.entity.getId().replace("{", "").replace("}", "");
        let url, flowURL, certificateName, environmentVariable, entityTypeCode, schoolCategory, certificateNumber, schoolID;
        url = formContext.context.getClientUrl();
        certificateName = formContext.getAttribute("iosas_name").getValue();
        certificateNumber = formContext.getAttribute("iosas_certificationnumber").getValue();
        schoolID = formContext.getAttribute("iosas_edu_school").getValue();
        environmentVariable = "iosas_IOSASCertificateGenerateCoverLetterHTTPRequestURL";
        fetch(
            url +
            "/api/data/v9.2/edu_schools(" + schoolID[0].id.replace(/[{}]/g, "") +
            ")?$select=edu_schoolcategory")
            .then((re) => re.json())
            .then((re) => {
                var edu_schoolcategory = re.edu_schoolcategory;
                if (edu_schoolcategory != null) {
                    schoolCategory = edu_schoolcategory;
                }
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
                                edu_schoolcategory: schoolCategory,
                                iosas_certificationnumber: certificateNumber,
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
                        });
                });
            });
    }
}