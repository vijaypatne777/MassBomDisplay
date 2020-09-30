sap.ui.define([
	"./BaseController",
	/*"com/bom/sap/com/zbomapp/controller/BaseController",*/
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV",
	"sap/m/MessageBox",
	"sap/m/MultiInput",
	"sap/ui/export/Spreadsheet",
	"sap/m/Token",
	"sap/ui/core/library",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast"
], function ( /*BaseController, JSONModel,formatter,Filter, Export, ExportTypeCSV, MessageBox, MultiInput, Spreadsheet,FilterOperator,MessageToast */
	BaseController, JSONModel, formatter, Filter, Export, ExportTypeCSV, MessageBox, MultiInput, Spreadsheet, FilterOperator, MessageToast) {
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

			//this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this.getView().setModel(this.getOwnerComponent().getModel(), "BaseModel");

			// Set the mtadata -  Start
			var url = "/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";
			var oModel = new sap.ui.model.odata.ODataModel(url, true);
			this.setModel(oModel, "oRefModel");
			sap.ui.getCore().setModel(oModel, "oRefModel");

			//var oMetadataText=  this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[3].property[0].extensions[1].value;
			// Set the meta data -  End
			///this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[3].property[1].name
			// Start the Tabe Col Data
			this.oDataInitial = {
				// Static data
				Items: [{
					columnKey: "BOMCategory", //"BillOfMaterialCategory"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[1].extensions[1].value // "BOM Category"
				}, {
					columnKey: "BOMVariant", //"BillOfMaterialVariant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[2].extensions[1].value //"Alternative BOM"
				}, {
					columnKey: "BOMVersion", //"BillOfMaterialVersion"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[3].extensions[1].value // "BOM Version"
				}, {
					columnKey: "BOMItemNoNode", //"BillOfMaterialItemNodeNumber"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[4].extensions[1].value //"Item node"
				}, {
					columnKey: "mat", //"Material"
					text: "Father Material" //this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[6].extensions[1].value //"Material""
				}, {
					columnKey: "plant", //"Plant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[7].extensions[1].value //"Plant"
				}, {
					columnKey: "BillOfMaterialItemUUID", //"BillOfMaterialItemUUID"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[8].extensions[0].value //"ID item chge status"
				}, {
					columnKey: "ValidityStartDate", //"ValidityStartDate"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[10].extensions[1].value //"Valid From"
				}, {
					columnKey: "ValidityEndDate", //"ValidityEndDate"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[11].extensions[1].value //"Valid to"
				}, {
					columnKey: "EngineeringChangeDocument", //"EngineeringChangeDocument"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[13].extensions[1].value //"Change Number"
				}, {
					columnKey: "bom", //"BillOfMaterialComponent"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[20].extensions[1].value //"Component"
				}, {
					columnKey: "BillOfMaterialItemCategory", //"BillOfMaterialItemCategory"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[21].extensions[1].value //"Item category"
				}, {
					columnKey: "itm", //"BillOfMaterialItemNumber"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[22].extensions[1].value //"Item Number"
				}, {
					columnKey: "BillOfMaterialItemUnit", //"BillOfMaterialItemUnit"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[23].extensions[1].value //"Component Unit of Measure"
				}, {
					columnKey: "qty", //"BillOfMaterialItemQuantity"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[24].extensions[1].value //"Component Quantity"
				}, {
					columnKey: "asm", //"IsAssembly"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[25].extensions[1].value //"Assembly"
				}, {
					columnKey: "des", //"ComponentDescription"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[41].extensions[0].value //"Item Text"
				}, {
					columnKey: "BOMItemIsSalesRelevant", //"BOMItemIsSalesRelevant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[57].extensions[1].value //"Relevant to sales"
				}, {
					columnKey: "IsProductionRelevant", //"IsProductionRelevant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[58].extensions[1].value //"Production relevant"
				}, {
					columnKey: "BOMItemIsCostingRelevant", //"BOMItemIsCostingRelevant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[60].extensions[1].value //"Relevancy to costing"
				}, {
					columnKey: "IsEngineeringRelevant", //"IsEngineeringRelevant"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[61].extensions[1].value // "Engineering/design"
				}, {
					columnKey: "RequiredComponent", //"RequiredComponent"
					text: this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[79].extensions[1].value //"Required Component"
				}, {
					columnKey: "usg", //"RequiredComponent"
					text: "BOM Usage"
				}, {
					columnKey: "lvl", //"RequiredComponent"
					text: "Level"
				}],
				// Runtime data
				ColumnsItems: [{
					columnKey: "mat",
					visible: true,
					index: 0
				}, {
					columnKey: "BOMCategory",
					visible: false

				}, {
					columnKey: "BOMVariant",
					visible: false

				}, {
					columnKey: "BOMVersion",
					visible: false
				}, {
					columnKey: "BOMItemNoNode",
					visible: false
				}, {
					columnKey: "plant",
					visible: false
				}, {
					columnKey: "BillOfMaterialItemUUID",
					visible: false
				}, {
					columnKey: "ValidityStartDate",
					visible: false
				}, {
					columnKey: "ValidityEndDate",
					visible: false
				}, {
					columnKey: "EngineeringChangeDocument",
					visible: false
				}, {
					columnKey: "bom",
					visible: false
				}, {
					columnKey: "BillOfMaterialItemCategory",
					visible: false
				}, {
					columnKey: "itm",
					visible: false
				}, {
					columnKey: "BillOfMaterialItemUnit",
					visible: false
				}, {
					columnKey: "qty",
					visible: false
				}, {
					columnKey: "asm",
					visible: false
				}, {
					columnKey: "des",
					visible: false
				}, {
					columnKey: "BOMItemIsSalesRelevant",
					visible: false
				}, {
					columnKey: "IsProductionRelevant",
					visible: false
				}, {
					columnKey: "BOMItemIsCostingRelevant",
					visible: false
				}, {
					columnKey: "IsEngineeringRelevant",
					visible: false
				}, {
					columnKey: "RequiredComponent",
					visible: false
				}, {
					columnKey: "usg",
					visible: false
				}, {
					columnKey: "lvl",
					visible: false
				}],
				ShowResetEnabled: false
			};
			// End the table col data
			// Runtime model
			this.oJSONModel = null;
			this.oDataBeforeOpen = {};
			this.oJSONModel = new JSONModel(jQuery.extend(true, {}, this.oDataInitial));
			this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

			// Multi input validator Start
			var oView = this.getView();
			var oMultiInput3 = oView.byId("multiInput");
			var fValidator = function (args) {
				window.setTimeout(function () {
					args.asyncCallback(new sap.m.Token({
						text: args.text
					}));
				}, 500);
				return MultiInput.WaitForAsyncValidation;
			};

			oMultiInput3.addValidator(fValidator);
			// Multi input vlidator -  End

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
						new sap.ui.model.Filter("mat", contains, sQuery),
						new sap.ui.model.Filter("mat", contains, sQueryLower),
						new sap.ui.model.Filter("mat", contains, sQueryUpper),
						new sap.ui.model.Filter("mat", contains, sQueryUpLow),
						new sap.ui.model.Filter("mat", contains, sQueryAllFirstLtrUp)

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
			if (oLastChar === ",") {
				allTokens = allTokens.substring(0, allTokens.length - 1);
			}

			var oMaterialArr = new Array();
			// this will return an array with strings "1", "2", etc.
			oMaterialArr = allTokens.split(",");

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
		onCustomExcel: function (oEvent) {
			var oPersonalizationDialog = sap.ui.xmlfragment("com.bom.sap.com.zbomapp.view.PersonalizationDialog", this);
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
			oPersonalizationDialog.setModel(this.oJSONModel);

			this.getView().addDependent(oPersonalizationDialog);

			this.oDataBeforeOpen = jQuery.extend(true, {}, this.oJSONModel.getData());
			oPersonalizationDialog.open();

		},
		onBOMSerch: function () {

			var m = new Date();
			var oCurrentTimeStamp = "datetime '" + m.getUTCFullYear() + "/" + (m.getUTCMonth() + 1) + "/" + m.getUTCDate()
				/*+ "T" + m.getUTCHours() + ":" + m.getUTCMinutes() +
					":" + m.getUTCSeconds()+"'"*/
			;
			//var oCurrentTimeStamp = "datetime'"+"2020-08-03T00:00:00'";

			/*var oDateFormat = sap.ui.core.format.DateFormat.getInstance({
				pattern: "yyyy-MM-ddTHH:mm:ss"
			});*/
			//var oDate = oDateFormat.format(oDateFormat.parse(date));
			// alert("Curr date Time - " + oCurrentTimeStamp); //alert removed.
			//alert(" Formatted Curr date Time - " + oCurrentTimeStamp);

			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});
			var ocModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(ocModel, "BRF");
			var j = 0,
				q = false,
				g,
				alt = [],
				p = true,
				rcdidx = 0,
				arr = [],
				d = [],
				dWithDate = [],
				zFilter = [],
				zFilterWithDate = [],
				count = 0;
			var oMateriaNo = this.getView().byId("multiInput").getTokens();
			var oPlant = this.getView().byId("idPlant").getValue().toString();
			var materialX = [];
			for (var inputMatIndex = 0; inputMatIndex < oMateriaNo.length; inputMatIndex++) {
				materialX.push(this.getView().byId("multiInput").getTokens()[inputMatIndex].getProperty("text"));
			}
			var far = this.getView().getModel();
			$.sap.brk = far;
			var that = this;
			var oFunc = function (far, cry) { // eslint-disable-line
				if (cry === null || cry === undefined || cry.length === 0 || far === null) {
					that.oBusyDialog.close();
					ocModel = new sap.ui.model.json.JSONModel();
					//ocModel.setSizeLimit(alt.length);
					ocModel.setData(alt);
					that.getView().setModel(ocModel, "BRF");
					return (1);
				}
				for (var i = 0; i < cry.length; i++) {
					d.push(new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, cry[i]),
							new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oPlant)
							//new sap.ui.model.Filter("ValidityEndDate", sap.ui.model.FilterOperator.GT,oCurrentTimeStamp)
						],
						and: true
					}));

					// Start 
					dWithDate.push(new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, cry[i]),
							new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, oPlant),
							//new sap.ui.model.Filter("BOMItemIsCostingRelevant", sap.ui.model.FilterOperator.EQ,"X")
							new sap.ui.model.Filter("ValidityEndDate", sap.ui.model.FilterOperator.GT, oCurrentTimeStamp) //"datetime'"+"2020-08-03T00:00:00'"
						],
						and: true
					}));
					// End
				}
				zFilter.push(new sap.ui.model.Filter({
					filters: d,
					and: false
				}));
				zFilterWithDate.push(new sap.ui.model.Filter({
					filters: dWithDate,
					and: false
				}));
				var pfunc = function (z) {
					return new Promise(
						function (resolve, reject) {
							far.read(z, {
								filters: zFilter,
								urlParameters: {
									"$select": "BillOfMaterialCategory,BillOfMaterialVariant,BillOfMaterialVersion,BillOfMaterialItemNodeNumber,Material,Plant,BillOfMaterialItemUUID,ValidityStartDate,ValidityEndDate,EngineeringChangeDocument,BillOfMaterialComponent,BillOfMaterialItemCategory,BillOfMaterialItemNumber,BillOfMaterialItemUnit,BillOfMaterialItemQuantity,IsAssembly,ComponentDescription,BOMItemIsSalesRelevant,IsProductionRelevant,BOMItemIsCostingRelevant,IsEngineeringRelevant,RequiredComponent,IsSubItem,BillOfMaterial,SpecialProcurementType",
									"$orderby": "BillOfMaterialItemNumber"
								},
								async: false,
								success: function (x) {
									resolve(x);
								},
								error: function (y) {
									reject(y);
								}
							});
						});
				};
				var qfunc = function (zz) {
					return new Promise(function (resolve, reject) {
						far.read(zz, {
							filters: zFilter,
							urlParameters: {
								"$select": "BillOfMaterialVariantUsage,Material"
							},
							async: false,
							success: function (foo) {
								resolve(foo);
							},
							error: function (bar) {
								reject(bar);
							}
						});
					});

				};
				Promise.all([pfunc("/MaterialBOMItem"), qfunc("/MaterialBOM")]).then(function (x) {
					count += 1;
					for (var O = 0; O < x[0].results.length; O++) {
						for (var V = 0; V < x[1].results.length; V++) {
							if (x[0].results[O].Material === x[1].results[V].Material) {
								// Check the date format -  Start
								var oValidStrDate = oDateFormat.format(new Date(x[0].results[O].ValidityStartDate));
								oValidStrDate = oValidStrDate + "T00:00:00";
								if (x[0].results[O].ValidityStartDate.length === 0) {
									var oValidStrDtFormat = "0000-00-00T00:00:00";

								} else {
									var oValidStrDtFormat = oDateFormat.format(new Date(x[0].results[O].ValidityStartDate));
									oValidStrDtFormat = oValidStrDtFormat + "T00:00:00";

								}

								var oValidEndDate = oDateFormat.format(new Date(x[0].results[O].ValidityEndDate));
								oValidEndDate = oValidEndDate + "T00:00:00";
								if (x[0].results[O].ValidityEndDate.length === 0) {
									var oValidEndDtFormat = "0000-00-00T00:00:00";

								} else {
									var oValidEndDtFormat = oDateFormat.format(new Date(x[0].results[O].ValidityEndDate));
									oValidEndDtFormat = oValidEndDtFormat + "T00:00:00";

								}

								// Check the date format -  End

								rcdidx += 1;
								arr.push({
									mat: x[0].results[O].Material,
									itm: x[0].results[O].BillOfMaterialItemNumber,
									bom: x[0].results[O].BillOfMaterialComponent,
									asm: x[0].results[O].IsAssembly,
									des: x[0].results[O].ComponentDescription,
									qty: x[0].results[O].BillOfMaterialItemQuantity,
									usg: x[1].results[V].BillOfMaterialVariantUsage,
									lvl: count,
									BOMCategory: x[0].results[O].BillOfMaterialCategory,
									BOMVariant: x[0].results[O].BillOfMaterialVariant,
									BOMVersion: x[0].results[O].BillOfMaterialVersion,
									BOMItemNoNode: x[0].results[O].BillOfMaterialItemNodeNumber,
									plant: x[0].results[O].Plant,
									BillOfMaterialItemUUID: x[0].results[O].BillOfMaterialItemUUID,
									ValidityStartDate: oValidStrDtFormat, //x[0].results[O].ValidityStartDate,
									ValidityEndDate: oValidEndDtFormat, //x[0].results[O].ValidityEndDate,
									EngineeringChangeDocument: x[0].results[O].EngineeringChangeDocument,
									BillOfMaterialItemCategory: x[0].results[O].BillOfMaterialItemCategory,
									BillOfMaterialItemUnit: x[0].results[O].BillOfMaterialItemUnit,
									BOMItemIsSalesRelevant: x[0].results[O].BOMItemIsSalesRelevant,
									IsProductionRelevant: x[0].results[O].IsProductionRelevant,
									BOMItemIsCostingRelevant: x[0].results[O].BOMItemIsCostingRelevant,
									IsEngineeringRelevant: x[0].results[O].IsEngineeringRelevant,
									RequiredComponent: x[0].results[O].RequiredComponent,
									idx: rcdidx
								});
							}
						}
					}

					if (p) {
						for (var f = 0; f < materialX.length; f++) {
							for (var c = 0; c < arr.length; c++) {
								if (materialX[f] === arr[c].mat) {
									alt.push(arr[c]);
								}
							}
						}
					}
					if (x[0].results === undefined || x[0].results.length === 0 || x[1].results === undefined || x[1].results.length === 0) {
						//alert(arr.length); // eslint-disable-line no-alert 
						oFunc(null, null);
					}
					if (q) {
						for (var u = 0; u < alt.length; u++) {
							for (var v = 0; v < arr.length; v++) {
								// if (alt[u].asm.length > 0) {
								if (alt[u].bom === arr[v].mat) {
									alt[u].asm = "X";
									j += 1;
									alt.splice(u + j, 0, arr[v]);
								}
								// }
							}
							j = 0;
						}
					}
					arr = [];
					p = false;
					q = true;
					g = [];
					// ------------
					var sapMaterial = x[0].results;
					// var patchMat = that.patch(sapMaterial);
					// -------------
					var sapnd = [],
						sapnzFilter = [];
					for (i = 0; i < sapMaterial.length; i++) {
						sapnd.push(new sap.ui.model.Filter({
							filters: [
								new sap.ui.model.Filter("Material", sap.ui.model.FilterOperator.EQ, sapMaterial[i].BillOfMaterialComponent),
								new sap.ui.model.Filter("Plant", sap.ui.model.FilterOperator.EQ, sapMaterial[i].Plant)
							],
							and: true
						}));
					}
					sapnzFilter.push(new sap.ui.model.Filter({
						filters: sapnd,
						and: false
					}));
					var oModel = that.getView().getModel();
					var prom = function (pz) {
						return new Promise(
							function (resolve, reject) {
								oModel.read(pz, {
									filters: sapnzFilter,
									urlParameters: {
										"$select": "Material"
									},
									success: function (k) {
										resolve(k);
									},
									error: function () {

									}
								});
							});
					};
					prom("/MaterialBOM").then(function (py) {
						for (var y = 0; y < py.results.length; y++) {
							// if (x[0].results[y].IsAssembly.length > 0) {
							g.push(py.results[y].Material);
							// }
						}
						d = [];
						zFilter = [];
						oFunc($.sap.brk, g);
					});
					//-------------
					// for (var y = 0; y < x[0].results.length; y++) {
					// 	if (x[0].results[y].IsAssembly.length > 0) {
					// 		g.push(x[0].results[y].BillOfMaterialComponent);
					// 	}
					// }
					// d = [];
					// zFilter = [];
					// oFunc($.sap.brk, g);

				});
			};
			oFunc($.sap.brk, materialX);

		},
		onBOMSerch1: function () {
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
			var oBOMVarUsage = "";
			//var jsonModel = new sap.ui.model.json.JSONModel();

			var oMateriaNo = this.getView().byId("multiInput").getTokens();
			var oPlant = this.getView().byId("idPlant").getValue().toString();
			var oBomUsage1 = this.getView().byId("idBOMUsage1").getValue().toString();
			var oBomUsage2 = this.getView().byId("idBOMUsage2").getValue().toString();
			var oBomApp = this.getView().byId("idBOMApp").getValue().toString();
			if (oBomUsage1.length === 0 && oBomUsage2.length === 0) {
				oBomUsage1 = "1";
				oBomUsage2 = "5";
			}
			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "yyyy-MM-dd"
			});

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
						}
						//Add all the Valid MAterial  here -  End

						// Run the second Level oData call -   Start
						var url = "/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";
						var oModel = new sap.ui.model.odata.ODataModel(url, true);
						oModel.setDefaultBindingMode("TwoWay");

						oValidMaterialCounter = oValidProdUsageMat.length;
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
									//$select: "BillOfMaterialVersion,Material,ComponentDescription,Plant,BillOfMaterialItemQuantity,BillOfMaterialCategory,IsAssembly,BillOfMaterialComponent,IsSubItem,BillOfMaterialItemNumber,BillOfMaterial,BillOfMaterialVariant,EngineeringChangeDocument,SpecialProcurementType"
									$select: "BillOfMaterialCategory,BillOfMaterialVariant,BillOfMaterialVersion,BillOfMaterialItemNodeNumber,Material,Plant,BillOfMaterialItemUUID,ValidityStartDate,ValidityEndDate,EngineeringChangeDocument,BillOfMaterialComponent,BillOfMaterialItemCategory,BillOfMaterialItemNumber,BillOfMaterialItemUnit,BillOfMaterialItemQuantity,IsAssembly,ComponentDescription,BOMItemIsSalesRelevant,IsProductionRelevant,BOMItemIsCostingRelevant,IsEngineeringRelevant,RequiredComponent,IsSubItem,BillOfMaterial,SpecialProcurementType"
								},
								filters: oFilter,

								async: false,
								success: function (oData, response) {
									var oBillOfMaterial = oData.results[0].BillOfMaterial;
									var oBillOfMaterialCategory = oData.results[0].BillOfMaterialCategory;
									var oBillOfMaterialVariant = oData.results[0].BillOfMaterialVariant;
									var oBillOfMaterialVersion = oData.results[0].BillOfMaterialVersion;
									var oEngineeringChangeDocument = oData.results[0].EngineeringChangeDocument;
									var oMaterial = oData.results[0].Material;
									var oPlant = oData.results[0].Plant;

									// Search the BomUsage -  Start    '" + param + "'

									//var oSpath ="/MaterialBOM(BillOfMaterial='00025899',BillOfMaterialCategory='M',BillOfMaterialVariant='1',BillOfMaterialVersion='',EngineeringChangeDocument='',Material='2301139',Plant='IT01')";
									var oSpath = "/MaterialBOM(BillOfMaterial='" + oBillOfMaterial + "',BillOfMaterialCategory='" + oBillOfMaterialCategory +
										"',BillOfMaterialVariant='" + oBillOfMaterialVariant + "',BillOfMaterialVersion='" + oBillOfMaterialVersion +
										"',EngineeringChangeDocument='" + oEngineeringChangeDocument + "',Material='" + oMaterial + "',Plant='" + oPlant +
										"')";

									oModel.read(oSpath, {

										urlParameters: {
											//$expand: "to_BillOfMaterial"
											"$select": "BillOfMaterialVariantUsage,Material"
										},
										filters: oFilter,
										async: false,
										success: function (oData, response) {
											oBOMVarUsage = oData.BillOfMaterialVariantUsage;

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
											//alert(" BOM Component - BOM Item No "+oData.results[oSetBomMaterail].Material+" - "+oData.results[oSetBomMaterail].BillOfMaterialItemNumber);
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
											oData.results[subLev].SpecialProcurementType = oBOMVarUsage; // Added - 19th May
											//alert(" BOM Component - BOM Item No "+oData.results[subLev].Material+" - "+oData.results[subLev].BillOfMaterialItemNumber);
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
											// Run the service again - Start

											isAssembly = "X";
											oAllAssemplyMaterial[oAllAssemplyMatCounter] = oData.results[i].BillOfMaterialComponent;
											oAllAssemplyMatCounter++;

										}
										// Check the date format -  Start
										var oProdDate = oDateFormat.format(new Date(oData.results[i].ValidityStartDate));
										oProdDate = oProdDate + "T00:00:00";
										if (oData.results[i].ValidityStartDate.length === 0) {
											var oSled = "0000-00-00T00:00:00";
											oData.results[i].ValidityStartDate = oSled;
										} else {
											var oSled = oDateFormat.format(new Date(oData.results[i].ValidityStartDate));
											oSled = oSled + "T00:00:00";
											oData.results[i].ValidityStartDate = oSled;
										}

										var oProdDate = oDateFormat.format(new Date(oData.results[i].ValidityEndDate));
										oProdDate = oProdDate + "T00:00:00";
										if (oData.results[i].ValidityEndDate.length === 0) {
											var oSled = "0000-00-00T00:00:00";
											oData.results[i].ValidityEndDate = oSled;
										} else {
											var oSled = oDateFormat.format(new Date(oData.results[i].ValidityEndDate));
											oSled = oSled + "T00:00:00";
											oData.results[i].ValidityEndDate = oSled;
										}

										// Check the date format -  End
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

		onExport: function () {
			var oTableCount = this.oTableRecCount;
			if (oTableCount === 0) {
				var noRecordMsg = this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");
				sap.m.MessageBox.warning(noRecordMsg);

			} else {

				var m = new Date();
				var oCurrentTimeStamp = m.getUTCDate() + "-" + (m.getUTCMonth() + 1) + "-" + m.getUTCFullYear() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() +
					":" + m.getUTCSeconds();
				var oFileName = "Bom Data_".concat(oCurrentTimeStamp);
				var oExport = new sap.ui.core.util.Export({
					exportType: new sap.ui.core.util.ExportTypeCSV({

						separatorChar: ",",
						charset: "utf-8"

						/*separatorChar: "\t",
						mimeType: "application/vnd.ms-excel",
						charset: "utf-8",
						fileExtension: "xls"*/
					}),

					models: this.getView().getModel("itemModel"),
					rows: {
						path: "/results"
					},
					columns: this.jsonArr
						/*[{
							name: "              Weekly data           \n             past to 15.5.2020              \n  Gross Req  |  Gross Req  | Projected QOH",
							template: {

								content: "{BillOfMaterialVersion}"
							},
							
						sub:	[{	
							name: "BOM Material",
							template: {
								name:"sandip",
								content: "{BillOfMaterialVersion}"
							}
						}]
						},
								
						
						
						{
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
						}],*/

					// start
					/*[
        {
            type: "autocomplete",
            title: "Country",
            width: "300",
            url: "/jexcel/countries"
        },
        {
            type: "dropdown",
            title: "Food",
            width: "150",
            source: ["Apple"]
        },
        {
            type: "checkbox",
            title: "Stock",
            width:"100"
        }
    ],
    nestedHeaders:[
        [
            {
                title: "Supermarket information",
                colspan: "3",
            },
        ],
        [
            {
                title: "Location",
                colspan: "1",
            },
            {
                title: "Other Information",
                colspan: "2"
            }
        ],
    ],*/
					// End
				});
				// download exported file
				oExport.saveFile(oFileName).catch(function (oError) {
					MessageBox.error("Error when downloading data." + oError);
				}).then(function () {
					oExport.destroy();
				});
			}
		},
		onExport1: function () {

			var oTableCount = this.getView().getModel("BRF").getData();
			if (oTableCount === 0) {
				var noRecordMsg = this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");
				sap.m.MessageBox.warning(noRecordMsg);

			} else {

				var m = new Date();
				var oCurrentTimeStamp = m.getUTCDate() + "-" + (m.getUTCMonth() + 1) + "-" + m.getUTCFullYear() + " " + m.getUTCHours() + ":" + m.getUTCMinutes() +
					":" + m.getUTCSeconds();
				var oFileName = "Bom Data_".concat(oCurrentTimeStamp);
				var oColArray = this.jsonArr;
				var ajSonDataForExcel, oSettingsForFile, oSheet;
				ajSonDataForExcel = this.getView().getModel("BRF").getProperty("/");
				oSettingsForFile = {
					workbook: {
						columns: oColArray
					},
					dataSource: ajSonDataForExcel,
					showProgress: false,
					fileName: oFileName
				};
				oSheet = new Spreadsheet(oSettingsForFile);

				oSheet.build()
					.then(function () {
						MessageToast.show("Spreadsheet export has finished");
					})
					.finally(function () {
						oSheet.destroy();
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
				if (oSortObj === "Header Material") {
					SORTKEY = "BillOfMaterialVersion";
				} else if (oSortObj === "BOM Component") {
					SORTKEY = "Material";
				} else if (oSortObj === "Component Description") {
					SORTKEY = "ComponentDescription";
				} else if (oSortObj === "Level") {
					SORTKEY = "IsSubItem";
				} else if (oSortObj === "BOM Item No") {
					SORTKEY = "BillOfMaterialItemNumber";
				}
				/*else if (oSortObj === "BOM Quantity") {
									SORTKEY = "BillOfMaterialItemQuantity";
								}*/
				aSorter.push(new sap.ui.model.Sorter(SORTKEY, DESCENDING, GROUP));
				oBinding.sort(aSorter);
				// Now Apply your logic -  End
			}
		},

		// All Code for Pop Up -  Start

		onOK: function (oEvent) {
			var oColArrayinExcelField = [];
			var oColArrayinExcelDesc = [];
			var oColItemLenght = this.oJSONModel.oData.Items.length;
			var j = 0;
			for (var i = 0; i < oColItemLenght; i++) {
				if (this.oJSONModel.oData.ColumnsItems[i].visible === true) {
					oColArrayinExcelField[j] = this.oJSONModel.oData.ColumnsItems[i].columnKey;
					var oColKey = this.oJSONModel.oData.ColumnsItems[i].columnKey;
					for (var itemCount = 0; itemCount < oColItemLenght; itemCount++) {
						if (oColKey === this.oJSONModel.oData.Items[itemCount].columnKey) {
							//alert(" - true - ");
							oColArrayinExcelDesc[j] = this.oJSONModel.oData.Items[itemCount].text;

							j = j + 1;
						}
					}

				}

			}

			// Create JSON ARRAY for Export to Excel Col -  Start
			this.jsonArr = [];
			for (var oExportToExcel = 0; oExportToExcel < oColArrayinExcelField.length; oExportToExcel++) {
				//var oContent = "{" + oColArrayinExcelField[oExportToExcel] + "}";
				var oContent = oColArrayinExcelField[oExportToExcel];
				this.jsonArr.push({
					/*
										name: oColArrayinExcelDesc[oExportToExcel],
										template: {
											content: oContent
										}
									*/

					label: oColArrayinExcelDesc[oExportToExcel],
					property: oContent

				});
			}

			//Create JSON ARRAY for Export to Excel Col -  End
			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
			this.onExport1();
		},

		onCancel: function (oEvent) {
			this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataBeforeOpen));

			this.oDataBeforeOpen = {};
			oEvent.getSource().close();
			oEvent.getSource().destroy();
		},
		/*onSelect: function(oEvent) {
			alert("Selected check box");
			var bSelected = oEvent.getParameter("selected"),
				sText = oEvent.getSource().getText(),
				oTable = this.byId("table"),
				aSticky = oTable.getSticky() || [];

			if (bSelected) {
				aSticky.push(sText);
			} else if (aSticky.length) {
				var iElementIndex = aSticky.indexOf(sText);
				aSticky.splice(iElementIndex, 1);
			}

			oTable.setSticky(aSticky);
		},*/

		onReset1: function () {
			this.oJSONModel.setProperty("/", jQuery.extend(true, [], this.oDataInitial));
		},

		onChangeColumnsItems: function (oEvent) {
			this.oJSONModel.setProperty("/ColumnsItems", oEvent.getParameter("items"));
			this.oJSONModel.setProperty("/ShowResetEnabled", this._isChangedColumnsItems());
		},

		_isChangedColumnsItems: function () {
			var fnGetArrayElementByKey = function (sKey, sValue, aArray) {
				var aElements = aArray.filter(function (oElement) {
					return oElement[sKey] !== undefined && oElement[sKey] === sValue;
				});
				return aElements.length ? aElements[0] : null;
			};
			var fnGetUnion = function (aDataBase, aData) {
				if (!aData) {
					return jQuery.extend(true, [], aDataBase);
				}
				var aUnion = jQuery.extend(true, [], aData);
				aDataBase.forEach(function (oMItemBase) {
					var oMItemUnion = fnGetArrayElementByKey("columnKey", oMItemBase.columnKey, aUnion);
					if (!oMItemUnion) {
						aUnion.push(oMItemBase);
						return;
					}
					if (oMItemUnion.visible === undefined && oMItemBase.visible !== undefined) {
						oMItemUnion.visible = oMItemBase.visible;
					}
					if (oMItemUnion.width === undefined && oMItemBase.width !== undefined) {
						oMItemUnion.width = oMItemBase.width;
					}
					if (oMItemUnion.total === undefined && oMItemBase.total !== undefined) {
						oMItemUnion.total = oMItemBase.total;
					}
					if (oMItemUnion.index === undefined && oMItemBase.index !== undefined) {
						oMItemUnion.index = oMItemBase.index;
					}
				});
				return aUnion;
			};
			var fnIsEqual = function (aDataBase, aData) {
				if (!aData) {
					return true;
				}
				if (aDataBase.length !== aData.length) {
					return false;
				}
				var fnSort = function (a, b) {
					if (a.columnKey < b.columnKey) {
						return -1;
					} else if (a.columnKey > b.columnKey) {
						return 1;
					} else {
						return 0;
					}
				};
				aDataBase.sort(fnSort);
				aData.sort(fnSort);
				var aItemsNotEqual = aDataBase.filter(function (oDataBase, iIndex) {
					return oDataBase.columnKey !== aData[iIndex].columnKey || oDataBase.visible !== aData[iIndex].visible || oDataBase.index !==
						aData[iIndex].index || oDataBase.width !== aData[iIndex].width || oDataBase.total !== aData[iIndex].total;
				});
				return aItemsNotEqual.length === 0;
			};

			var aDataRuntime = fnGetUnion(this.oDataInitial.ColumnsItems, this.oJSONModel.getProperty("/ColumnsItems"));
			return !fnIsEqual(aDataRuntime, this.oDataInitial.ColumnsItems);
		}

		// All Code for pop up  -  End

	});
});