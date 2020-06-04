/* global QUnit */

QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function() {
	"use strict";

	sap.ui.require([
		"com/bom/sap/com/zbomapp/test/integration/AllJourneys"
	], function() {
		QUnit.start();
	});
});