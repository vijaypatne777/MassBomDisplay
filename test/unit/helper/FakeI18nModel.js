sap.ui.define(["sap/ui/model/Model"],function(t){"use strict";return t.extend("com.bom.sap.com.zbomapp.test.unit.helper.FakeI18nModel",{constructor:function(e){t.call(this);this.mTexts=e||{}},getResourceBundle:function(){return{getText:function(t){return this.mTexts[t]}.bind(this)}}})});