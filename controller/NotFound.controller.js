sap.ui.define([
		"ewpsupr/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ewpsupr.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);