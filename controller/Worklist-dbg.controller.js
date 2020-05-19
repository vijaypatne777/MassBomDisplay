sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Token, Export, ExportTypeCSV, MessageBox) {
	"use strict";

	return BaseController.extend("com.bom.sap.com.zbomapp.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("table");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("saveAsTileTitle", this.getResourceBundle().getText("worklistViewTitle")),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");

			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			// Add the worklist page to the flp routing history
			this.addHistoryEntry({
				title: this.getResourceBundle().getText("worklistViewTitle"),
				icon: "sap-icon://table-view",
				intent: "#BillOfMaterialApp-display"
			}, true);
			this.onComplete = false;
			this.oBusyDialog = new sap.m.BusyDialog();
			this.oTableRecCount = 0;

		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},

		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					var contains = sap.ui.model.FilterOperator.Contains;
					// Make case sensitive start
					var sQueryLower = sQuery.toLowerCase();
					var sQueryUpper = sQuery.toUpperCase();
					var sQueryUpLow = sQuery[0].toUpperCase() + sQuery.substr(1).toLowerCase(); // Scentence case
					var sQueryAllFirstLtrUp = sQuery.replace(/\b\w/g, function (l) {
						return l.toUpperCase();
					});
					/*oTableSearchState = [new Filter("PARTNUM", FilterOperator.Contains, sQuery)];*/

					aTableSearchState = [new sap.ui.model.Filter([
						new sap.ui.model.Filter("Material", contains, sQuery),
						new sap.ui.model.Filter("Material", contains, sQueryLower),
						new sap.ui.model.Filter("Material", contains, sQueryUpper),
						new sap.ui.model.Filter("Material", contains, sQueryUpLow),
						new sap.ui.model.Filter("Material", contains, sQueryAllFirstLtrUp),

						new sap.ui.model.Filter("BillOfMaterialVersion", contains, sQuery),
						new sap.ui.model.Filter("BillOfMaterialVersion", contains, sQueryLower),
						new sap.ui.model.Filter("BillOfMaterialVersion", contains, sQueryUpper),
						new sap.ui.model.Filter("BillOfMaterialVersion", contains, sQueryUpLow),
						new sap.ui.model.Filter("BillOfMaterialVersion", contains, sQueryAllFirstLtrUp),

						new sap.ui.model.Filter("ComponentDescription", contains, sQuery),
						new sap.ui.model.Filter("ComponentDescription", contains, sQueryLower),
						new sap.ui.model.Filter("ComponentDescription", contains, sQueryUpper),
						new sap.ui.model.Filter("ComponentDescription", contains, sQueryUpLow),
						new sap.ui.model.Filter("ComponentDescription", contains, sQueryAllFirstLtrUp)
					], false)];
				}
				this._applySearch(aTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("BillOfMaterialHeaderUUID")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		onLiveChange: function (oEvent) {
			var oPlant = oEvent.getSource().getValue();
			this.getView().byId("idPlant").setValue(oPlant.toUpperCase());
		},
		onEnterMatNo: function (sValue) {

			var allTokens = this.getView().byId("multiInput").getValue();
			var oLastChar = allTokens[allTokens.length - 1];
			//alert(" Last Char - "+oLastChar);
			if (oLastChar === ",") {
				allTokens = allTokens.substring(0, allTokens.length - 1);
				//alert(" New String - "+allTokens);
			}

			var oMaterialArr = new Array();
			// this will return an array with strings "1", "2", etc.
			oMaterialArr = allTokens.split(",");

			/*alert(" First  tonek String - "+oMaterialArr[0]+ " Array Size -"+oMaterialArr.length);
			alert(" Second tonek String - "+oMaterialArr[1]);*/

			for (var i = 0; i < oMaterialArr.length; i++) {
				this.getView().byId("multiInput").addToken(new sap.m.Token({
					text: oMaterialArr[i]
				}));
				this.getView().byId("multiInput").setValue("");
			}
		},

		/*onBOMSearch: function () {
			var oBusyDialog = new sap.m.BusyDialog();
			oBusyDialog.open();
			this.onEnter();
			oBusyDialog.clo();
		},*/
		onEnter: function () {
			//sap.m.MessageBox.warning("Do you want to proceed?");

			this.oBusyDialog.open();
			var that = this;
			sap.m.MessageBox.show(
				" Do you want to proceed?.", {
					icon: sap.m.MessageBox.Icon.INFORMATION,
					title: "          Search BOM",
					actions: ["OK", "Cancel"],
					onClose: function (oAction) {
						if (oAction === "OK") {
							that.onBOMSerch();
						}
						if (oAction === "Cancel") {
							that.oBusyDialog.close();

						}
					},
					initialFocus: "OK"
				}
			);

		},
		testExpand:function(oEvent){
			
			var jsonArr = [];

for (var i = 0; i < 5; i++) {
    jsonArr.push({
						name: "BOM Material"+i,
						template: {
							content: "{BillOfMaterialVersion}"
						}
					});
}
			
		},
		onBOMSerch: function () {
			//alert(" Start Search");
			//sap.ui.core.BusyIndicator.show();

			var oBusyDialog = new sap.m.BusyDialog();
			var url = "/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";
			var oModelForBusy = new sap.ui.model.odata.ODataModel(url, true);
			oModelForBusy.setDefaultBindingMode("TwoWay");

			oModelForBusy.attachRequestSent(function () {
				oBusyDialog.open();
			});
			//oBusyDialog.open();

			var oJsonModelFinal = new sap.ui.model.json.JSONModel();
			var jsonModel = new sap.ui.model.json.JSONModel();
			var oSetTableModell = new sap.ui.model.json.JSONModel();
			oSetTableModell.results = [];
			var oAllAssemplyMaterial = [];
			var countLevel = 0;
			var isAssembly = "";
			var oFilter = new Array();
			var newDataResult = [];
			var ifFirst = true;
			var oAssemblCounter = 0;
			var oValidProdUsageMat = [];
			var oValidMaterialCounter = 0;
			var oValidMaterial = 0;
			var oKeepLooping = false;
			var oFirstInpurMat = true;
			var oAllAssemplyMatCounter = 0;
			var oLevelShift = false;
			var oBOMVarUsage="";
			//var jsonModel = new sap.ui.model.json.JSONModel();

			var oMateriaNo = this.getView().byId("multiInput").getTokens();
			var oPlant = this.getView().byId("idPlant").getValue().toString();
			var oBomUsage1 = this.getView().byId("idBOMUsage1").getValue().toString();
			var oBomUsage2 = this.getView().byId("idBOMUsage2").getValue().toString();
			var oBomApp = this.getView().byId("idBOMApp").getValue().toString();
			//alert(" Bom App"+oBomApp);
			

			if (oMateriaNo.length === 0 || oPlant.length === 0) {
				//var oMatNoMsg = this.getView().byId().getModel("i18n").getResourceBundle().getText("matNoMandatory");
				sap.m.MessageBox.warning("Please enter all mandatory fields.");
				this.oBusyDialog.close();
			} else {
				// Check the Material for Production Usage and Service Usage -  Start
				var url = "/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";
				var oModel = new sap.ui.model.odata.ODataModel(url, true);
				oModel.setDefaultBindingMode("TwoWay");
				var oMatInputNo = 3;
				/*				oFilter[0] = new sap.ui.model.Filter("BillOfMaterialVariant", sap.ui.model.FilterOperator.EQ, "1");
								oFilter[1] = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, "2102582");
								oFilter[2] = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, "2102792");
								oFilter[3] = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, "IT01");*/

				oFilter[0] = new sap.ui.model.Filter("BillOfMaterialVariant", sap.ui.model.FilterOperator.EQ, oBomApp);
				oFilter[1] = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oPlant);
				oFilter[2] = new sap.ui.model.Filter("BillOfMaterialVariantUsage", sap.ui.model.FilterOperator.EQ, oBomUsage1);
				oFilter[3] = new sap.ui.model.Filter("BillOfMaterialVariantUsage", sap.ui.model.FilterOperator.EQ, oBomUsage2);
				for (var inputMatIndex = 0; inputMatIndex < oMateriaNo.length; inputMatIndex++) {
					oMatInputNo++;
					var oInpurMatNo = this.getView().byId("multiInput").getTokens()[inputMatIndex].getProperty("text");
					oFilter[oMatInputNo] = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oInpurMatNo);
				}

				oModel.read("/MaterialBOM", { // Get all valid material
					filters: oFilter,
					urlParameters: {
						"$select": "Material"
					},
					async: false,
					success: function (oData, response) {
						//Add all the Valid MAterial  here -  Start
						for (var prodUsage = 0; prodUsage < oData.results.length; prodUsage++) {
							oValidProdUsageMat[prodUsage] = oData.results[prodUsage].Material;
							//alert("Success -OnlyValid Material -   " + oData.results[prodUsage].Material);
						}
						//Add all the Valid MAterial  here -  End

						// Run the second Level oData call -   Start
						var url = "/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";
						var oModel = new sap.ui.model.odata.ODataModel(url, true);
						oModel.setDefaultBindingMode("TwoWay");

						oValidMaterialCounter = oValidProdUsageMat.length;
						//alert(" Valid Material Usage - " + oValidMaterialCounter);
						do {
							oFilter = [];
						
							var j = 1;
							oFilter[0] = new sap.ui.model.Filter("BillOfMaterialVariant", sap.ui.model.FilterOperator.EQ, oBomApp);
							oFilter[1] = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oPlant);
							//oValidMaterialCounter = oValidMaterialCounter+1;
							j++;
							oFilter[j] = new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, oValidProdUsageMat[oValidMaterial]);
								
							// Execute the oData for diffrent level -  Start

							// All parameters -  Start

							// All Parameters -  End
							

							oModel.read("/MaterialBOMItem", {
							
								urlParameters: {
									//$expand: "to_BillOfMaterial"//"to_BillOfMaterial", to_BillOfMaterialUsage
									//"$select": "Material"
									$select: "BillOfMaterialVersion,Material,ComponentDescription,Plant,BillOfMaterialItemQuantity,BillOfMaterialCategory,IsAssembly,BillOfMaterialComponent,IsSubItem,BillOfMaterialItemNumber,BillOfMaterial,BillOfMaterialVariant,EngineeringChangeDocument,SpecialProcurementType"
									//filters: oFilter
								},
								filters: oFilter,

								async: false,
								success: function (oData, response) {
									//alert("Success - Next Level Data " + oData.results.length);
									var oBillOfMaterial=oData.results[0].BillOfMaterial;
									var oBillOfMaterialCategory=oData.results[0].BillOfMaterialCategory; 
									var oBillOfMaterialVariant=oData.results[0].BillOfMaterialVariant;
									var oBillOfMaterialVersion=oData.results[0].BillOfMaterialVersion;
									var oEngineeringChangeDocument=oData.results[0].EngineeringChangeDocument;
									var oMaterial=oData.results[0].Material;
									var oPlant=oData.results[0].Plant;
									
									// Search the BomUsage -  Start    '" + param + "'
									
										//var oSpath ="/MaterialBOM(BillOfMaterial='00025899',BillOfMaterialCategory='M',BillOfMaterialVariant='1',BillOfMaterialVersion='',EngineeringChangeDocument='',Material='2301139',Plant='IT01')";
									var oSpath ="/MaterialBOM(BillOfMaterial='" + oBillOfMaterial + "',BillOfMaterialCategory='" + oBillOfMaterialCategory + "',BillOfMaterialVariant='" + oBillOfMaterialVariant + "',BillOfMaterialVersion='" + oBillOfMaterialVersion + "',EngineeringChangeDocument='" + oEngineeringChangeDocument + "',Material='" + oMaterial + "',Plant='" + oPlant + "')";

							oModel.read(oSpath, {
							
								urlParameters: {
									//$expand: "to_BillOfMaterial"
									"$select": "BillOfMaterialVariantUsage,Material"
								},
								filters: oFilter,
								async: false,
								success: function (oData, response) {
								oBOMVarUsage = oData.BillOfMaterialVariantUsage;

									//alert("Success - Next Level Data " + oData.results.length);


								},
								error: function (oError) {

								}
							});

									
									
									
									// Search the BomUsage - end
									if (!oLevelShift) {
										// Do nothing
									} else {
										countLevel = countLevel + 1;
										oLevelShift = false;
									}
									//alert("Success - Next Level Data " + oData.results.length);
									//Add all the data here -  Start
									if (ifFirst) {

										for (var firstLev = 0; firstLev < oData.results.length; firstLev++) {
											oData.results[firstLev].IsSubItem = countLevel;
											oData.results[firstLev].SpecialProcurementType = oBOMVarUsage; // Added - 19th May
										}

										for (var oSetBomMaterail = 0; oSetBomMaterail < oData.results.length; oSetBomMaterail++) {
											oData.results[oSetBomMaterail].BillOfMaterialVersion = oValidProdUsageMat[oValidMaterial];
											oData.results[oSetBomMaterail].Material = oData.results[oSetBomMaterail].BillOfMaterialComponent;
										}

										jsonModel.setData(oData);
										ifFirst = false;

									} else {

										/*for (var subLev = 0; subLev < oData.results.length; subLev++) {
											oData.results[subLev].IsSubItem = countLevel;

											if (oData.results[subLev].IsAssembly.length > 0) {
												alert("Sub Material - " + oData.results[subLev].BillOfMaterialComponent
													.toString());
												oIsAssempleComponet = oData.results[subLev].BillOfMaterialComponent;
											}
										}*/
										for (var subLev = 0; subLev < oData.results.length; subLev++) {
											oData.results[subLev].BillOfMaterialVersion = oValidProdUsageMat[oValidMaterial];
											oData.results[subLev].Material = oData.results[subLev].BillOfMaterialComponent;
											oData.results[subLev].IsSubItem = countLevel;
											oData.results[subLev].SpecialProcurementType = oBOMVarUsage;  // Added - 19th May
										}
										// Check teh assemble component -  End

										oJsonModelFinal.setData(oData);
										// Merge Here -  Start
										for (var i = 0; i < oJsonModelFinal.getProperty("/results").length; i++) {
											jsonModel.getProperty("/results").push(oJsonModelFinal.getProperty("/results/" + i));
										}

										// End
									}
									/*oFilter = [];
									j = 1;
									oFilter[0] = new sap.ui.model.Filter("BillOfMaterialVariant", sap.ui.model.FilterOperator.EQ, oBomApp);
									oFilter[1] = new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oPlant);*/

									for (var i = 0; i < oData.results.length; i++) {
										if (oData.results[i].IsAssembly.length > 0) {
											//alert("Sub Material - " + oData.results[i].BillOfMaterialComponent.toString());
											// Run the service again - Start

											isAssembly = "X";
											oAllAssemplyMaterial[oAllAssemplyMatCounter] = oData.results[i].BillOfMaterialComponent;
											oAllAssemplyMatCounter++;
										}
									}
									if (oAllAssemplyMaterial.length > 0) {
										isAssembly = "X";

									} else {
										isAssembly = "";
									}
								},
								error: function (oError) {
									oBusyDialog.close();
									sap.m.MessageBox.error(oError.message);
									//console.log(oError);
								}
							});

							// Execute the oData for diffrent level -  End 

							oValidMaterial = oValidMaterial + 1;
							if (oValidMaterial < oValidProdUsageMat.length) {
								oKeepLooping = true;
							} else if (isAssembly.length > 0) {
								oValidProdUsageMat = [];
								oValidProdUsageMat = oAllAssemplyMaterial;
								oValidMaterial = 0;
								oLevelShift = true;
								oAllAssemplyMatCounter = 0;
								oAllAssemplyMaterial = [];
								oKeepLooping = true;
							} else {
								oKeepLooping = false;
							}
						}
						while (oKeepLooping);

						// Run the second level oData call -  End

					},
					error: function (oError) {
						oBusyDialog.close();
						sap.m.MessageBox.error(oError.message);
					}
				});
				var that = this;
				that.getView().setModel(jsonModel, "itemModel");
				that.oTableRecCount = jsonModel.getData().results.length;
				that.onComplete = true;
				this.oBusyDialog.close();

				/*oModelForBusy.attachRequestCompleted(function () {
					oBusyDialog.close();
				});*/
			}
			// Call teh oData Servie  - End
		},

		onExport: function (oEvent) {
			var oTableCount = this.oTableRecCount;
			if (oTableCount === 0) {
				var noRecordMsg = this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");
				sap.m.MessageBox.warning(noRecordMsg);

			} else {
				
			var comnArraDesc = ["BOM Material","Material"];	
			var comnArraFld = ["BillOfMaterialVersion","Material"];
			var jsonArr = [];
			

for (var i = 0; i < 2; i++) {
	var oContent = "{"+comnArraFld[i]+"}";
    jsonArr.push({
						name: comnArraDesc[i],
						template: {
							content: oContent
						}
					});
}			
		

				// Start Array
				var oExecelCol = [{
						name: "BOM Material",
						template: {
							content: "{BillOfMaterialVersion}"
						}
					}, {
						name: "Material",
						template: {
							content: "{Material}"
						}
					}, {
						name: "Level",
						template: {
							content: "{IsSubItem}"
						}
					}, {
						name: "Component Description",
						template: {
							content: "{ComponentDescription}"
						}
					}, {
						name: "BOM Quantity",
						template: {
							content: "{BillOfMaterialItemQuantity}"
						}
					}, {
						name: "Plant",
						template: {
							content: "{Plant}"
						}
					}, {
						name: "BOM Category",
						template: {
							content: "{BillOfMaterialCategory}"
						}
					}];
					// End Array
				var m = new Date();
				var oCurrentTimeStamp = m.getUTCDate() + "-" + (m.getUTCMonth() + 1) + "-" + m.getUTCFullYear() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() +
					":" + m.getUTCSeconds();
				var oFileName = "Bom Data_".concat(oCurrentTimeStamp);
				var oExport = new sap.ui.core.util.Export({
					exportType: new sap.ui.core.util.ExportTypeCSV({
						separatorChar: ",",
						charset: "utf-8"
					}),

					models: this.getView().getModel("itemModel"),
					rows: {
						path: "/results"
					},
					columns: oExecelCol
						/*[{
							name: "BOM Material",
							template: {
								content: "{BillOfMaterialVersion}"
							}
						}, {
							name: "Material",
							template: {
								content: "{Material}"
							}
						}, {
							name: "Level",
							template: {
								content: "{IsSubItem}"
							}
						}, {
							name: "Comp Desc",
							template: {
								content: "{ComponentDescription}"
							}
						}, {
							name: "BOM Quantity",
							template: {
								content: "{BillOfMaterialItemQuantity}"
							}
						}, {
							name: "Plant",
							template: {
								content: "{Plant}"
							}
						}, {
							name: "BOM Category",
							template: {
								content: "{BillOfMaterialCategory}"
							}
						}]*/
				});
				// download exported file
				oExport.saveFile(oFileName).catch(function (oError) {
					MessageBox.error("Error when downloading data. Browser might not be supported!\n\n" + oError);
				}).then(function () {
					oExport.destroy();
				});
			}
		},
		onReset: function (oEvent) {
			this.getView().byId("multiInput").removeAllTokens();
			this.getView().byId("idPlant").setValue("");
			this.getView().byId("idBOMUsage1").setValue("");
			this.getView().byId("idBOMUsage2").setValue("");
			//this.getView().byId("idBOMApp").setValue("");

			// Reset Table -  Start
			//var table = this.getView().byId("table");
			var oModelReset = new sap.ui.model.json.JSONModel();
			var data = [];
			oModelReset.setData(data);
			var aData = oModelReset.getProperty("/d/results");

			oModelReset.setData({
				modelData: aData
			});

			this.getView().setModel(oModelReset, "itemModel");
			// Reset Table -  End

		},
		handleSortButtonPressed: function (oEvent) {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("com.bom.sap.com.zbomapp.view.SortDialog", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				// forward compact/cozy style into Dialog
				this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			}
			this._oViewSettingsDialog.open();
		},
		onCancelReject: function (oEvent) {
			if (this._oViewSettingsDialog.isOpen()) {
				//this._valueHelpDialog.getContent()[3].removeSelections();
				this._oViewSettingsDialog.close();
				//this._oViewSettingsDialog.destroy(true);
			}
			//this._Dialog.close();
		},
		handleSortStdConfirm: function (oEvent) {

			//alert(" Table Data"+this.oTableRecCount);
			var oTableCount = this.oTableRecCount;
			if (oTableCount === 0) {
				var noRecordMsg = this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");
				sap.m.MessageBox.warning(noRecordMsg);

			} else {
				var oSortByDescnd = oEvent.getParameters().sortDescending; // Get Sort By (Ascending/Descending)
				var oSortObj = oEvent.getParameters().sortItem.getText(); // get the sort Obj Value (Mat No/Cust Name etc)
				var DESCENDING;
				var GROUP = false;
				var aSorter = [];
				var SORTKEY;
				if (oSortByDescnd) {
					DESCENDING = true;
				} else {
					DESCENDING = false;
				}

				var oView = this.getView();
				var oTable = oView.byId("table");
				//var oBinding = oTable.getBinding("items");
				var oBinding = oTable.getBinding("items");
				if (oSortObj === "Material") {
					SORTKEY = "Material";
				} else if (oSortObj === "Component Description") {
					SORTKEY = "ComponentDescription";
				} else if (oSortObj === "BOM Quantity") {
					SORTKEY = "BillOfMaterialItemQuantity";
				} else if (oSortObj === "Level") {
					SORTKEY = "IsSubItem";
				} else if (oSortObj === "BOM Qty Item No") {
					SORTKEY = "BOM Qty Item No";
				}
				aSorter.push(new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP));
				oBinding.sort(aSorter);
				// Now Apply your logic -  End
			}
		}

	});
});