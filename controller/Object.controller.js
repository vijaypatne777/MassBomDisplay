sap.ui.define(["./BaseController","sap/ui/model/json/JSONModel","../model/formatter"],function(e,t,i){"use strict";return e.extend("com.bom.sap.com.zbomapp.controller.Object",{formatter:i,onInit:function(){var e,i=new t({busy:true,delay:0});this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched,this);e=this.getView().getBusyIndicatorDelay();this.setModel(i,"objectView");this.getOwnerComponent().getModel().metadataLoaded().then(function(){i.setProperty("/delay",e)})},onShareInJamPress:function(){var e=this.getModel("objectView"),t=sap.ui.getCore().createComponent({name:"sap.collaboration.components.fiori.sharing.dialog",settings:{object:{id:location.href,share:e.getProperty("/shareOnJamTitle")}}});t.open()},_onObjectMatched:function(e){var t=e.getParameter("arguments").objectId;this.getModel().metadataLoaded().then(function(){var e=this.getModel().createKey("A_BillOfMaterial",{BillOfMaterialHeaderUUID:t});this._bindView("/"+e)}.bind(this))},_bindView:function(e){var t=this.getModel("objectView"),i=this.getModel();this.getView().bindElement({path:e,events:{change:this._onBindingChange.bind(this),dataRequested:function(){i.metadataLoaded().then(function(){t.setProperty("/busy",true)})},dataReceived:function(){t.setProperty("/busy",false)}}})},_onBindingChange:function(){var e=this.getView(),t=this.getModel("objectView"),i=e.getElementBinding();if(!i.getBoundContext()){this.getRouter().getTargets().display("objectNotFound");return}var a=this.getResourceBundle(),n=e.getBindingContext().getObject(),o=n.BillOfMaterialHeaderUUID,r=n.BillOfMaterial;t.setProperty("/busy",false);this.addHistoryEntry({title:this.getResourceBundle().getText("objectTitle")+" - "+r,icon:"sap-icon://enter-more",intent:"#BillOfMaterialApp-display&/A_BillOfMaterial/"+o});t.setProperty("/saveAsTileTitle",a.getText("saveAsTileTitle",[r]));t.setProperty("/shareOnJamTitle",r);t.setProperty("/shareSendEmailSubject",a.getText("shareSendEmailObjectSubject",[o]));t.setProperty("/shareSendEmailMessage",a.getText("shareSendEmailObjectMessage",[r,o,location.href]))}})});