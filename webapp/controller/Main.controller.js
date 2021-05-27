sap.ui.define(['sap/m/MessageToast','sap/ui/core/mvc/Controller'],
	function(MessageToast, Controller) {
	"use strict";

	var PageController = Controller.extend("org.ubb.books.controller.Main", {

		onPress: function (evt) {
			MessageToast.show("Logged In");
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("app");
		}
	});

	return PageController;

});
