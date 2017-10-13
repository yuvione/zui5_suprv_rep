sap.ui.define([
		"ewpsupr1/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("ewpsupr1.controller.NotFound", {

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