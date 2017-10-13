sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				var n = sValue.search('%');
				if (!sValue) {
					return "";
				}
					if (sValue=='-') {
					return "-";
				}
				if (n > 0) {
					var str1 = 	parseFloat(sValue).toFixed(0);
					return str1.concat('%');
				}
				return parseFloat(sValue).toFixed(0);
			}

		};

	}
);