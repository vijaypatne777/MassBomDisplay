sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter","sap/ui/model/Filter","sap/ui/core/util/Export","sap/ui/core/util/ExportTypeCSV","sap/m/MessageBox","sap/m/MultiInput","sap/ui/export/Spreadsheet","sap/m/Token","sap/ui/core/library","sap/ui/model/FilterOperator","sap/m/MessageToast"],function(e,t,a,i,l,s,r,o,n,u,d){"use strict";return e.extend("com.bom.sap.com.zbomapp.controller.Worklist",{formatter:a,onInit:function(){var e,a,i=this.byId("table");a=i.getBusyIndicatorDelay();this._aTableSearchState=[];e=new t({worklistTableTitle:this.getResourceBundle().getText("worklistTableTitle"),saveAsTileTitle:this.getResourceBundle().getText("saveAsTileTitle",this.getResourceBundle().getText("worklistViewTitle")),shareOnJamTitle:this.getResourceBundle().getText("worklistTitle"),shareSendEmailSubject:this.getResourceBundle().getText("shareSendEmailWorklistSubject"),shareSendEmailMessage:this.getResourceBundle().getText("shareSendEmailWorklistMessage",[location.href]),tableNoDataText:this.getResourceBundle().getText("tableNoDataText"),tableBusyDelay:0});this.setModel(e,"worklistView");i.attachEventOnce("updateFinished",function(){e.setProperty("/tableBusyDelay",a)});this.addHistoryEntry({title:this.getResourceBundle().getText("worklistViewTitle"),icon:"sap-icon://table-view",intent:"#BillOfMaterialApp-display"},true);this.onComplete=false;this.oBusyDialog=new sap.m.BusyDialog;this.oTableRecCount=0;this.getView().setModel(this.getOwnerComponent().getModel(),"BaseModel");var l="/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";var s=new sap.ui.model.odata.ODataModel(l,true);this.setModel(s,"oRefModel");sap.ui.getCore().setModel(s,"oRefModel");this.oDataInitial={Items:[{columnKey:"BOMCategory",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[1].extensions[1].value},{columnKey:"BOMVariant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[2].extensions[1].value},{columnKey:"BOMVersion",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[3].extensions[1].value},{columnKey:"BOMItemNoNode",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[4].extensions[1].value},{columnKey:"mat",text:"Father Material"},{columnKey:"plant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[7].extensions[1].value},{columnKey:"BillOfMaterialItemUUID",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[8].extensions[0].value},{columnKey:"ValidityStartDate",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[10].extensions[1].value},{columnKey:"ValidityEndDate",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[11].extensions[1].value},{columnKey:"EngineeringChangeDocument",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[13].extensions[1].value},{columnKey:"bom",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[20].extensions[1].value},{columnKey:"BillOfMaterialItemCategory",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[21].extensions[1].value},{columnKey:"itm",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[22].extensions[1].value},{columnKey:"BillOfMaterialItemUnit",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[23].extensions[1].value},{columnKey:"qty",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[24].extensions[1].value},{columnKey:"asm",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[25].extensions[1].value},{columnKey:"des",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[41].extensions[0].value},{columnKey:"BOMItemIsSalesRelevant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[57].extensions[1].value},{columnKey:"IsProductionRelevant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[58].extensions[1].value},{columnKey:"BOMItemIsCostingRelevant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[60].extensions[1].value},{columnKey:"IsEngineeringRelevant",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[61].extensions[1].value},{columnKey:"RequiredComponent",text:this.getModel("oRefModel").getServiceMetadata().dataServices.schema[0].entityType[0].property[79].extensions[1].value},{columnKey:"usg",text:"BOM Usage"},{columnKey:"lvl",text:"Level"}],ColumnsItems:[{columnKey:"mat",visible:true,index:0},{columnKey:"BOMCategory",visible:false},{columnKey:"BOMVariant",visible:false},{columnKey:"BOMVersion",visible:false},{columnKey:"BOMItemNoNode",visible:false},{columnKey:"plant",visible:false},{columnKey:"BillOfMaterialItemUUID",visible:false},{columnKey:"ValidityStartDate",visible:false},{columnKey:"ValidityEndDate",visible:false},{columnKey:"EngineeringChangeDocument",visible:false},{columnKey:"bom",visible:false},{columnKey:"BillOfMaterialItemCategory",visible:false},{columnKey:"itm",visible:false},{columnKey:"BillOfMaterialItemUnit",visible:false},{columnKey:"qty",visible:false},{columnKey:"asm",visible:false},{columnKey:"des",visible:false},{columnKey:"BOMItemIsSalesRelevant",visible:false},{columnKey:"IsProductionRelevant",visible:false},{columnKey:"BOMItemIsCostingRelevant",visible:false},{columnKey:"IsEngineeringRelevant",visible:false},{columnKey:"RequiredComponent",visible:false},{columnKey:"usg",visible:false},{columnKey:"lvl",visible:false}],ShowResetEnabled:false};this.oJSONModel=null;this.oDataBeforeOpen={};this.oJSONModel=new t(jQuery.extend(true,{},this.oDataInitial));this.oJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);var r=this.getView();var n=r.byId("multiInput");var u=function(e){window.setTimeout(function(){e.asyncCallback(new sap.m.Token({text:e.text}))},500);return o.WaitForAsyncValidation};n.addValidator(u)},onUpdateFinished:function(e){var t,a=e.getSource(),i=e.getParameter("total");if(i&&a.getBinding("items").isLengthFinal()){t=this.getResourceBundle().getText("worklistTableTitleCount",[i])}else{t=this.getResourceBundle().getText("worklistTableTitle")}this.getModel("worklistView").setProperty("/worklistTableTitle",t)},onPress:function(e){this._showObject(e.getSource())},onShareInJamPress:function(){var e=this.getModel("worklistView"),t=sap.ui.getCore().createComponent({name:"sap.collaboration.components.fiori.sharing.dialog",settings:{object:{id:location.href,share:e.getProperty("/shareOnJamTitle")}}});t.open()},onSearch:function(e){if(e.getParameters().refreshButtonPressed){this.onRefresh()}else{var t=[];var a=e.getParameter("query");if(a&&a.length>0){var i=sap.ui.model.FilterOperator.Contains;var l=a.toLowerCase();var s=a.toUpperCase();var r=a[0].toUpperCase()+a.substr(1).toLowerCase();var o=a.replace(/\b\w/g,function(e){return e.toUpperCase()});t=[new sap.ui.model.Filter([new sap.ui.model.Filter("mat",i,a),new sap.ui.model.Filter("mat",i,l),new sap.ui.model.Filter("mat",i,s),new sap.ui.model.Filter("mat",i,r),new sap.ui.model.Filter("mat",i,o)],false)]}this._applySearch(t)}},onRefresh:function(){var e=this.byId("table");e.getBinding("items").refresh()},_showObject:function(e){this.getRouter().navTo("object",{objectId:e.getBindingContext().getProperty("BillOfMaterialHeaderUUID")})},_applySearch:function(e){var t=this.byId("table"),a=this.getModel("worklistView");t.getBinding("items").filter(e,"Application");if(e.length!==0){a.setProperty("/tableNoDataText",this.getResourceBundle().getText("worklistNoDataWithSearchText"))}},onLiveChange:function(e){var t=e.getSource().getValue();this.getView().byId("idPlant").setValue(t.toUpperCase())},onEnterMatNo:function(e){var t=this.getView().byId("multiInput").getValue();var a=t[t.length-1];if(a===","){t=t.substring(0,t.length-1)}var i=new Array;i=t.split(",");for(var l=0;l<i.length;l++){this.getView().byId("multiInput").addToken(new sap.m.Token({text:i[l]}));this.getView().byId("multiInput").setValue("")}},onEnter:function(){this.oBusyDialog.open();var e=this;sap.m.MessageBox.show(" Do you want to proceed?.",{icon:sap.m.MessageBox.Icon.INFORMATION,title:"          Search BOM",actions:["OK","Cancel"],onClose:function(t){if(t==="OK"){e.onBOMSerch()}if(t==="Cancel"){e.oBusyDialog.close()}},initialFocus:"OK"})},onCustomExcel:function(e){var t=sap.ui.xmlfragment("com.bom.sap.com.zbomapp.view.PersonalizationDialog",this);this.oJSONModel.setProperty("/ShowResetEnabled",this._isChangedColumnsItems());t.setModel(this.oJSONModel);this.getView().addDependent(t);this.oDataBeforeOpen=jQuery.extend(true,{},this.oJSONModel.getData());t.open()},onBOMSerch:function(){var e=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd"});var t=new sap.ui.model.json.JSONModel;this.getView().setModel(t,"BRF");var a=0,i=false,l,s=[],r=true,o=0,n=[],u=[],d=[],m=0;var g=this.getView().byId("multiInput").getTokens();var c=this.getView().byId("idPlant").getValue().toString();var f=[];for(var p=0;p<g.length;p++){f.push(this.getView().byId("multiInput").getTokens()[p].getProperty("text"))}var v=this.getView().getModel();$.sap.brk=v;var h=this;var M=function(g,p){if(p===null||p===undefined||p.length===0||g===null){h.oBusyDialog.close();t=new sap.ui.model.json.JSONModel;t.setData(s);h.getView().setModel(t,"BRF");return 1}for(var v=0;v<p.length;v++){u.push(new sap.ui.model.Filter({filters:[new sap.ui.model.Filter("Material",sap.ui.model.FilterOperator.EQ,p[v]),new sap.ui.model.Filter("Plant",sap.ui.model.FilterOperator.EQ,c)],and:true}))}d.push(new sap.ui.model.Filter({filters:u,and:false}));var y=function(e){return new Promise(function(t,a){g.read(e,{filters:d,urlParameters:{$select:"BillOfMaterialCategory,BillOfMaterialVariant,BillOfMaterialVersion,BillOfMaterialItemNodeNumber,Material,Plant,BillOfMaterialItemUUID,ValidityStartDate,ValidityEndDate,EngineeringChangeDocument,BillOfMaterialComponent,BillOfMaterialItemCategory,BillOfMaterialItemNumber,BillOfMaterialItemUnit,BillOfMaterialItemQuantity,IsAssembly,ComponentDescription,BOMItemIsSalesRelevant,IsProductionRelevant,BOMItemIsCostingRelevant,IsEngineeringRelevant,RequiredComponent,IsSubItem,BillOfMaterial,SpecialProcurementType",$orderby:"BillOfMaterialItemNumber"},async:false,success:function(e){t(e)},error:function(e){a(e)}})})};var O=function(e){return new Promise(function(t,a){g.read(e,{filters:d,urlParameters:{$select:"BillOfMaterialVariantUsage,Material"},async:false,success:function(e){t(e)},error:function(e){a(e)}})})};Promise.all([y("/MaterialBOMItem"),O("/MaterialBOM")]).then(function(t){m+=1;for(var g=0;g<t[0].results.length;g++){for(var c=0;c<t[1].results.length;c++){if(t[0].results[g].Material===t[1].results[c].Material){var p=e.format(new Date(t[0].results[g].ValidityStartDate));p=p+"T00:00:00";if(t[0].results[g].ValidityStartDate.length===0){var v="0000-00-00T00:00:00"}else{var v=e.format(new Date(t[0].results[g].ValidityStartDate));v=v+"T00:00:00"}var h=e.format(new Date(t[0].results[g].ValidityEndDate));h=h+"T00:00:00";if(t[0].results[g].ValidityEndDate.length===0){var y="0000-00-00T00:00:00"}else{var y=e.format(new Date(t[0].results[g].ValidityEndDate));y=y+"T00:00:00"}o+=1;n.push({mat:t[0].results[g].Material,itm:t[0].results[g].BillOfMaterialItemNumber,bom:t[0].results[g].BillOfMaterialComponent,asm:t[0].results[g].IsAssembly,des:t[0].results[g].ComponentDescription,qty:t[0].results[g].BillOfMaterialItemQuantity,usg:t[1].results[c].BillOfMaterialVariantUsage,lvl:m,BOMCategory:t[0].results[g].BillOfMaterialCategory,BOMVariant:t[0].results[g].BillOfMaterialVariant,BOMVersion:t[0].results[g].BillOfMaterialVersion,BOMItemNoNode:t[0].results[g].BillOfMaterialItemNodeNumber,plant:t[0].results[g].Plant,BillOfMaterialItemUUID:t[0].results[g].BillOfMaterialItemUUID,ValidityStartDate:v,ValidityEndDate:y,EngineeringChangeDocument:t[0].results[g].EngineeringChangeDocument,BillOfMaterialItemCategory:t[0].results[g].BillOfMaterialItemCategory,BillOfMaterialItemUnit:t[0].results[g].BillOfMaterialItemUnit,BOMItemIsSalesRelevant:t[0].results[g].BOMItemIsSalesRelevant,IsProductionRelevant:t[0].results[g].IsProductionRelevant,BOMItemIsCostingRelevant:t[0].results[g].BOMItemIsCostingRelevant,IsEngineeringRelevant:t[0].results[g].IsEngineeringRelevant,RequiredComponent:t[0].results[g].RequiredComponent,idx:o})}}}if(r){for(var O=0;O<f.length;O++){for(var B=0;B<n.length;B++){if(f[O]===n[B].mat){s.push(n[B])}}}}if(t[0].results===undefined||t[0].results.length===0||t[1].results===undefined||t[1].results.length===0){M(null,null)}if(i){for(var I=0;I<s.length;I++){for(var S=0;S<n.length;S++){if(s[I].asm.length>0){if(s[I].bom===n[S].mat){a+=1;s.splice(I+a,0,n[S])}}}a=0}}n=[];r=false;i=true;l=[];for(var w=0;w<t[0].results.length;w++){if(t[0].results[w].IsAssembly.length>0){l.push(t[0].results[w].BillOfMaterialComponent)}}u=[];d=[];M($.sap.brk,l)})};M($.sap.brk,f)},onBOMSerch1:function(){var e=new sap.m.BusyDialog;var t="/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";var a=new sap.ui.model.odata.ODataModel(t,true);a.setDefaultBindingMode("TwoWay");a.attachRequestSent(function(){e.open()});var i=new sap.ui.model.json.JSONModel;var l=new sap.ui.model.json.JSONModel;var s=new sap.ui.model.json.JSONModel;s.results=[];var r=[];var o=0;var n="";var u=new Array;var d=[];var m=true;var g=0;var c=[];var f=0;var p=0;var v=false;var h=true;var M=0;var y=false;var O="";var B=this.getView().byId("multiInput").getTokens();var I=this.getView().byId("idPlant").getValue().toString();var S=this.getView().byId("idBOMUsage1").getValue().toString();var w=this.getView().byId("idBOMUsage2").getValue().toString();var D=this.getView().byId("idBOMApp").getValue().toString();if(S.length===0&&w.length===0){S="1";w="5"}var b=sap.ui.core.format.DateFormat.getDateTimeInstance({pattern:"yyyy-MM-dd"});if(B.length===0||I.length===0){sap.m.MessageBox.warning("Please enter all mandatory fields.");this.oBusyDialog.close()}else{var t="/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";var T=new sap.ui.model.odata.ODataModel(t,true);T.setDefaultBindingMode("TwoWay");var V=3;u[0]=new sap.ui.model.Filter("BillOfMaterialVariant",sap.ui.model.FilterOperator.EQ,D);u[1]=new sap.ui.model.Filter("Plant",sap.ui.model.FilterOperator.EQ,I);u[2]=new sap.ui.model.Filter("BillOfMaterialVariantUsage",sap.ui.model.FilterOperator.EQ,S);u[3]=new sap.ui.model.Filter("BillOfMaterialVariantUsage",sap.ui.model.FilterOperator.EQ,w);for(var x=0;x<B.length;x++){V++;var C=this.getView().byId("multiInput").getTokens()[x].getProperty("text");u[V]=new sap.ui.model.Filter("Material",sap.ui.model.FilterOperator.EQ,C)}T.read("/MaterialBOM",{filters:u,urlParameters:{$select:"Material"},async:false,success:function(t,a){for(var s=0;s<t.results.length;s++){c[s]=t.results[s].Material}var d="/OPENSAP/sap/opu/odata/sap/API_BILL_OF_MATERIAL_SRV;v=0002";var g=new sap.ui.model.odata.ODataModel(d,true);g.setDefaultBindingMode("TwoWay");f=c.length;do{u=[];var h=1;u[0]=new sap.ui.model.Filter("BillOfMaterialVariant",sap.ui.model.FilterOperator.EQ,D);u[1]=new sap.ui.model.Filter("Plant",sap.ui.model.FilterOperator.EQ,I);h++;u[h]=new sap.ui.model.Filter("Material",sap.ui.model.FilterOperator.EQ,c[p]);g.read("/MaterialBOMItem",{urlParameters:{$select:"BillOfMaterialCategory,BillOfMaterialVariant,BillOfMaterialVersion,BillOfMaterialItemNodeNumber,Material,Plant,BillOfMaterialItemUUID,ValidityStartDate,ValidityEndDate,EngineeringChangeDocument,BillOfMaterialComponent,BillOfMaterialItemCategory,BillOfMaterialItemNumber,BillOfMaterialItemUnit,BillOfMaterialItemQuantity,IsAssembly,ComponentDescription,BOMItemIsSalesRelevant,IsProductionRelevant,BOMItemIsCostingRelevant,IsEngineeringRelevant,RequiredComponent,IsSubItem,BillOfMaterial,SpecialProcurementType"},filters:u,async:false,success:function(e,t){var a=e.results[0].BillOfMaterial;var s=e.results[0].BillOfMaterialCategory;var d=e.results[0].BillOfMaterialVariant;var f=e.results[0].BillOfMaterialVersion;var v=e.results[0].EngineeringChangeDocument;var h=e.results[0].Material;var B=e.results[0].Plant;var I="/MaterialBOM(BillOfMaterial='"+a+"',BillOfMaterialCategory='"+s+"',BillOfMaterialVariant='"+d+"',BillOfMaterialVersion='"+f+"',EngineeringChangeDocument='"+v+"',Material='"+h+"',Plant='"+B+"')";g.read(I,{urlParameters:{$select:"BillOfMaterialVariantUsage,Material"},filters:u,async:false,success:function(e,t){O=e.BillOfMaterialVariantUsage},error:function(e){}});if(!y){}else{o=o+1;y=false}if(m){for(var S=0;S<e.results.length;S++){e.results[S].IsSubItem=o;e.results[S].SpecialProcurementType=O}for(var w=0;w<e.results.length;w++){e.results[w].BillOfMaterialVersion=c[p];e.results[w].Material=e.results[w].BillOfMaterialComponent}l.setData(e);m=false}else{for(var D=0;D<e.results.length;D++){e.results[D].BillOfMaterialVersion=c[p];e.results[D].Material=e.results[D].BillOfMaterialComponent;e.results[D].IsSubItem=o;e.results[D].SpecialProcurementType=O}i.setData(e);for(var T=0;T<i.getProperty("/results").length;T++){l.getProperty("/results").push(i.getProperty("/results/"+T))}}for(var T=0;T<e.results.length;T++){if(e.results[T].IsAssembly.length>0){n="X";r[M]=e.results[T].BillOfMaterialComponent;M++}var V=b.format(new Date(e.results[T].ValidityStartDate));V=V+"T00:00:00";if(e.results[T].ValidityStartDate.length===0){var x="0000-00-00T00:00:00";e.results[T].ValidityStartDate=x}else{var x=b.format(new Date(e.results[T].ValidityStartDate));x=x+"T00:00:00";e.results[T].ValidityStartDate=x}var V=b.format(new Date(e.results[T].ValidityEndDate));V=V+"T00:00:00";if(e.results[T].ValidityEndDate.length===0){var x="0000-00-00T00:00:00";e.results[T].ValidityEndDate=x}else{var x=b.format(new Date(e.results[T].ValidityEndDate));x=x+"T00:00:00";e.results[T].ValidityEndDate=x}}if(r.length>0){n="X"}else{n=""}},error:function(t){e.close();sap.m.MessageBox.error(t.message)}});p=p+1;if(p<c.length){v=true}else if(n.length>0){c=[];c=r;p=0;y=true;M=0;r=[];v=true}else{v=false}}while(v)},error:function(t){e.close();sap.m.MessageBox.error(t.message)}});var R=this;R.getView().setModel(l,"itemModel");R.oTableRecCount=l.getData().results.length;R.onComplete=true;this.oBusyDialog.close()}},onExport:function(){var e=this.oTableRecCount;if(e===0){var t=this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");sap.m.MessageBox.warning(t)}else{var a=new Date;var i=a.getUTCDate()+"-"+(a.getUTCMonth()+1)+"-"+a.getUTCFullYear()+" "+a.getUTCHours()+":"+a.getUTCMinutes()+":"+a.getUTCSeconds();var l="Bom Data_".concat(i);var s=new sap.ui.core.util.Export({exportType:new sap.ui.core.util.ExportTypeCSV({separatorChar:",",charset:"utf-8"}),models:this.getView().getModel("itemModel"),rows:{path:"/results"},columns:this.jsonArr});s.saveFile(l).catch(function(e){r.error("Error when downloading data."+e)}).then(function(){s.destroy()})}},onExport1:function(){var e=this.getView().getModel("BRF").getData();if(e===0){var t=this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");sap.m.MessageBox.warning(t)}else{var a=new Date;var i=a.getUTCDate()+"-"+(a.getUTCMonth()+1)+"-"+a.getUTCFullYear()+" "+a.getUTCHours()+":"+a.getUTCMinutes()+":"+a.getUTCSeconds();var l="Bom Data_".concat(i);var s=this.jsonArr;var r,o,u;r=this.getView().getModel("BRF").getProperty("/");o={workbook:{columns:s},dataSource:r,showProgress:false,fileName:l};u=new n(o);u.build().then(function(){d.show("Spreadsheet export has finished")}).finally(function(){u.destroy()})}},onReset:function(e){this.getView().byId("multiInput").removeAllTokens();this.getView().byId("idPlant").setValue("");this.getView().byId("idBOMUsage1").setValue("");this.getView().byId("idBOMUsage2").setValue("");var t=new sap.ui.model.json.JSONModel;var a=[];t.setData(a);var i=t.getProperty("/d/results");t.setData({modelData:i});this.getView().setModel(t,"itemModel")},handleSortButtonPressed:function(e){if(!this._oViewSettingsDialog){this._oViewSettingsDialog=sap.ui.xmlfragment("com.bom.sap.com.zbomapp.view.SortDialog",this);this.getView().addDependent(this._oViewSettingsDialog);this._oViewSettingsDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass())}this._oViewSettingsDialog.open()},onCancelReject:function(e){if(this._oViewSettingsDialog.isOpen()){this._oViewSettingsDialog.close()}},handleSortStdConfirm:function(e){var t=this.oTableRecCount;if(t===0){var a=this.getView().getModel("i18n").getResourceBundle().getText("oTableNoDataText");sap.m.MessageBox.warning(a)}else{var i=e.getParameters().sortDescending;var l=e.getParameters().sortItem.getText();var s;var r=false;var o=[];var n;if(i){s=true}else{s=false}var u=this.getView();var d=u.byId("table");var m=d.getBinding("items");if(l==="Header Material"){n="BillOfMaterialVersion"}else if(l==="BOM Component"){n="Material"}else if(l==="Component Description"){n="ComponentDescription"}else if(l==="Level"){n="IsSubItem"}else if(l==="BOM Item No"){n="BillOfMaterialItemNumber"}o.push(new sap.ui.model.Sorter(n,s,r));m.sort(o)}},onOK:function(e){var t=[];var a=[];var i=this.oJSONModel.oData.Items.length;var l=0;for(var s=0;s<i;s++){if(this.oJSONModel.oData.ColumnsItems[s].visible===true){t[l]=this.oJSONModel.oData.ColumnsItems[s].columnKey;var r=this.oJSONModel.oData.ColumnsItems[s].columnKey;for(var o=0;o<i;o++){if(r===this.oJSONModel.oData.Items[o].columnKey){a[l]=this.oJSONModel.oData.Items[o].text;l=l+1}}}}this.jsonArr=[];for(var n=0;n<t.length;n++){var u=t[n];this.jsonArr.push({label:a[n],property:u})}this.oDataBeforeOpen={};e.getSource().close();e.getSource().destroy();this.onExport1()},onCancel:function(e){this.oJSONModel.setProperty("/",jQuery.extend(true,[],this.oDataBeforeOpen));this.oDataBeforeOpen={};e.getSource().close();e.getSource().destroy()},onReset1:function(){this.oJSONModel.setProperty("/",jQuery.extend(true,[],this.oDataInitial))},onChangeColumnsItems:function(e){this.oJSONModel.setProperty("/ColumnsItems",e.getParameter("items"));this.oJSONModel.setProperty("/ShowResetEnabled",this._isChangedColumnsItems())},_isChangedColumnsItems:function(){var e=function(e,t,a){var i=a.filter(function(a){return a[e]!==undefined&&a[e]===t});return i.length?i[0]:null};var t=function(t,a){if(!a){return jQuery.extend(true,[],t)}var i=jQuery.extend(true,[],a);t.forEach(function(t){var a=e("columnKey",t.columnKey,i);if(!a){i.push(t);return}if(a.visible===undefined&&t.visible!==undefined){a.visible=t.visible}if(a.width===undefined&&t.width!==undefined){a.width=t.width}if(a.total===undefined&&t.total!==undefined){a.total=t.total}if(a.index===undefined&&t.index!==undefined){a.index=t.index}});return i};var a=function(e,t){if(!t){return true}if(e.length!==t.length){return false}var a=function(e,t){if(e.columnKey<t.columnKey){return-1}else if(e.columnKey>t.columnKey){return 1}else{return 0}};e.sort(a);t.sort(a);var i=e.filter(function(e,a){return e.columnKey!==t[a].columnKey||e.visible!==t[a].visible||e.index!==t[a].index||e.width!==t[a].width||e.total!==t[a].total});return i.length===0};var i=t(this.oDataInitial.ColumnsItems,this.oJSONModel.getProperty("/ColumnsItems"));return!a(i,this.oDataInitial.ColumnsItems)}})});