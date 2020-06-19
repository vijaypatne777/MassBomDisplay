function initModel() {
	var sUrl = "/S4HC/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}