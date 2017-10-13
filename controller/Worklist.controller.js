sap.ui.define([
	"ewpsupr/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"ewpsupr/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("ewpsupr.controller.Worklist", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oViewModel,
				iOriginalBusyDelay,
				oTable = this.byId("combo2");

			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._oTableSearchState = [];

			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				saveAsTileTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistViewTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");
			// this._wizard = this.getView().byId("CreateProductWizard");
			// this._oNavContainer = this.getView().byId("wizardNavContainer");
			// this._oWizardContentPage = this.getView().byId("wizardContentPage");
			// this._oWizardReviewPage = sap.ui.xmlfragment("ewpadmn.ReviewPage", this);
			// this.model = new sap.ui.model.json.JSONModel();
			// this._oNavContainer.addPage(this._oWizardReviewPage);
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function() {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
			var current = new Date().getFullYear();
			var prevyear = new Date().getFullYear() - 1;
			var nextyear = new Date().getFullYear() + 1;
			var all_years = {
				"years": [{
					"year": prevyear
				}, {
					"year": current
				}, {
					"year": nextyear
				}]
			};
			var oModelYears = new sap.ui.model.json.JSONModel();
			oModelYears.setData(all_years);
			this.byId("combo2").setModel(oModelYears);

			var checkV = this.byId("SupRev").getSelected();
			if (checkV == true) {
				var t1 = this.getView().byId('usr1');
				t1.setEditable(false);
			}
			var checkM = this.byId("MgrRev").getSelected();
			if (checkM == true) {
				var t1 = this.getView().byId('usr2');
				t1.setEditable(false);
			}
		},

		onRecal: function(oEvent) {
			for (var k = 0; k < 6; k++) {
				var oCombo = this.getView().byId('comboexcp' + k);
				this.getView().byId('cmt' + k).setValue('');
				oCombo.setSelectedKey('');
			}
			this.byId("SupRev").setProperty("selected", false);
			this.byId("SupRev").setEditable(true);
			this.byId("MgrRev").setProperty("selected", false);
			this.byId("MgrRev").setEditable(true);
			this.getView().byId('usr2').setValue('');
			this.getView().byId('usr1').setValue('');
			var oModel = this.byId('table');
			oModel.destroyItems();

			var yTxt = this.getView().byId('combo2').getValue();
			var mTxt = this.getView().byId('combo1').getValue();
			var dateTxt;
			dateTxt = mTxt.substr(0, 3).toUpperCase() + '-' + yTxt.substr(2, 2);
			var sTxt = this.getView().byId("combo").getValue();
			var t1 = this.getView().byId("table");
			var oTemplate = t1.getBindingInfo("items").template;
			t1.bindAggregation("items", "/suprvRepSet", oTemplate);
			var oFilterDist = new sap.ui.model.Filter("IvDistrict",
				sap.ui.model.FilterOperator.EQ, sTxt);
			var oFilterDate = new sap.ui.model.Filter("IvDate",
				sap.ui.model.FilterOperator.EQ, dateTxt);
			var oFilterMode = new sap.ui.model.Filter("IvMode",
				sap.ui.model.FilterOperator.EQ, 'L');
			t1.getBinding("items").filter(new Filter({
				filters: [
					oFilterDist,
					oFilterDate,
					oFilterMode
				],
				and: true
			}));

			var oFilterModeE = new sap.ui.model.Filter("IvMode",
				sap.ui.model.FilterOperator.EQ, 'E');
			var oFilterrow = new sap.ui.model.Filter("Ivrno",
				sap.ui.model.FilterOperator.EQ, 1);
			var aFiltersComboBox = [];
			aFiltersComboBox.push(oFilterDist);
			aFiltersComboBox.push(oFilterDate);
			aFiltersComboBox.push(oFilterModeE);
			aFiltersComboBox.push(oFilterrow);
			for (var i = 0; i < 6; i++) {
				var oComboBox = this.getView().byId("comboexcp" + i);
				oComboBox.bindItems("/excRepSet", new sap.ui.core.ListItem({
					key: "{ExcCat}",
					text: "{Comments}"
				}));
				var oBindingComboBox = oComboBox.getBinding("items");
				oBindingComboBox.filter(aFiltersComboBox);
			}
		},

		handleSubmit: function(oEvent) {
			var changeSetId = "foo";
			var mParameters = {
				"groupId": changeSetId,
				"changeSetId": changeSetId
			};
			var oModel = this.getModel();
			oModel.setUseBatch(true);
			var oTable = this.byId("table");
			var items = oTable.getItems();
			var j = items.length - 1;
			for (var i = 0; i < j; i++) {
				var row = items[i + 1];
				var context = row.getBindingContext();
				var itemObject = context.getObject();
				itemObject.ExcCat = this.byId("comboexcp" + i).getValue();
				if (this.byId("comboexcp" + i).getValueState() == 'Error') {
					sap.m.MessageToast.show("Fix the exception category");
					continue;
				}
				if (itemObject.ExcCat != '') {
					if (this.byId("cmt" + i).getValue() == '') {
						sap.m.MessageToast.show("Please add comments");
						continue;
					}
				}
				if (itemObject.Comments != this.byId("cmt" + i).getValue()) {
					if (itemObject.ExcCat == '') {
						sap.m.MessageToast.show("Fix the exception category");
						continue;
					}

					itemObject.Comments = this.byId("cmt" + i).getValue();

					oModel.update(context.sPath, itemObject, {
						success: function(oData, oResponse) {
							sap.m.MessageToast.show('Entries Added');
						},
						error: function(error) {
							sap.m.MessageToast.show('Entries Not Saved');
						}
					});
				}

			}
			var checkV = this.byId("SupRev").getSelected();
			if (checkV == true) {
				var row = items[0];
				var context = row.getBindingContext();
				var itemObject = context.getObject();
				var t1 = this.getView().byId('usr1').getValue();
				itemObject.Positions = 'Head';
				itemObject.SuprvAppr = 'X';
				itemObject.SuprvName = t1;

				var checkM = this.byId("MgrRev").getSelected();
				if (checkM == true) {
					var t2 = this.getView().byId('usr2').getValue();
					itemObject.Positions = 'Head';
					itemObject.MgrAppr = 'X';
					itemObject.MgrName = t2;
				}
				oModel.update(context.sPath, itemObject, mParameters);
			}
			oModel.submitChanges({
				success: function(oData) {
					sap.m.MessageToast.show('Entries Added');
				},
				error: function(oError) {
					sap.m.MessageToast.show('Entries Not Added');
				}
			});
			// sap.m.MessageToast.show("Entries Added");
		},

		updateCombo: function(oEvent) {
			var checkV = this.byId("SupRev").getSelected();
			if (checkV == true) {
				var oTable = this.byId("table");
				var items = oTable.getItems();
				var row = items[0];
				var context = row.getBindingContext();
				var itemObject = context.getObject();
				var t1 = this.getView().byId('usr1');
				var t1val = this.getView().byId('usr1').getValue();
				this.byId("SupRev").setEditable(false);
				if (t1val == '') {
					t1.setValue(itemObject.UsrName + '--' + new Date().toDateString());
				}
			}
			if (checkV == false) {
				var t1 = this.getView().byId('usr1');
				t1.setValue("");
			}
			var checkM = this.byId("MgrRev").getSelected();
			if (checkM == true) {
				var oTable = this.byId("table");
				var items = oTable.getItems();
				var row = items[0];
				var context = row.getBindingContext();
				var itemObject = context.getObject();
				var t1 = this.getView().byId('usr2');
				var t1val = this.getView().byId('usr2').getValue();
				t1.setEditable(false);
				if (t1val == '') {
					t1.setValue(itemObject.UsrName + '--' + new Date().toDateString());
				}
			}
			if (checkM == false) {
				var t1 = this.getView().byId('usr2');
				t1.setValue("");
			}
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
		onUpdateFinished: function(oEvent) {
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
			var lvcat;
			var t1 = this.getView().byId('table');
			var tabItems = t1.getItems();
			for (var k = 0; k < 6; k++) {

				if (k == 0) {
					lvcat = 'APPT HOURS';
				}
				if (k == 1) {
					lvcat = 'EMERG HOURS';

				}
				if (k == 2) {
					lvcat = 'NAPPT HOURS';
					// oCombo.setSelectedItem(tabItemObj.ExcCat);
				}
				if (k == 3) {
					lvcat = 'AVLB HOURS';
					// oCombo.setSelectedItem(tabItemObj.ExcCat);
				}
				if (k == 4) {
					lvcat = 'WREN HOURS';
					// oCombo.setSelectedItem(tabItemObj.ExcCat);
				}
				if (k == 5) {
					lvcat = 'EXPI HOURS';
					// oCombo.setSelectedItem(tabItemObj.ExcCat);
				}
				var oCombo = this.getView().byId('comboexcp' + k);
				var items = oCombo.getItems();

				for (var i = 0, j = items.length; i < j; i++) {
					var row = items[i];
					var context = row.getBindingContext();
					var itemObject = context.getObject();
					if (itemObject.IvCat != lvcat) {
						oCombo.removeItem(i);
						var items = oCombo.getItems();
						i = -1;
						j = items.length;
					}
				}

			}
			var t1 = this.getView().byId('table');
			var tabItems = t1.getItems();
			for (var k = 0; k < 7; k++) {
				var tabrow = tabItems[k];
				var tabcontext = tabrow.getBindingContext();
				var tabItemObj = tabcontext.getObject();
				if (k == 0) {
					if (tabItemObj.SuprvAppr == 'X') {
						var checkM = this.byId("SupRev");
						checkM.setProperty("selected", true);
						checkM.setEditable(false);
						var suptxtarea = this.getView().byId('usr1');
						suptxtarea.setValue(tabItemObj.SuprvName);
					}
					if (tabItemObj.MgrAppr == 'X') {
						var checkM = this.byId("MgrRev");
						checkM.setProperty("selected", true);
						checkM.setEditable(false);
						var suptxtarea = this.getView().byId('usr2');
						suptxtarea.setValue(tabItemObj.MgrName);
					}
					lvcat = 'TOTALS';
					continue;
				}
				if (k == 1) {
					lvcat = 0;
				}
				if (k == 2) {
					lvcat = 1;

				}
				if (k == 3) {
					lvcat = 2;
				}
				if (k == 4) {
					lvcat = 3;
				}
				if (k == 5) {
					lvcat = 4;
				}
				if (k == 6) {
					lvcat = 5;
				}
				var oCombo = this.getView().byId('comboexcp' + lvcat);
				var oCmt = this.getView().byId('cmt' + lvcat);
				var items = oCombo.getItems();
				for (var i = 0, j = items.length; i < j; i++) {
					var row = items[i];
					var context = row.getBindingContext();
					var itemObject = context.getObject();
					if (itemObject.Comments == tabItemObj.ExcCat) {
						oCmt.setValue(tabItemObj.Comments);
						oCombo.setSelectedKey(itemObject.ExcCat);
					}
					if (tabItemObj.ExcCat == '') {
						oCombo.setSelectedKey('DF');
					}
				}
			}
		},

		handleCancel: function(oEvent) {
			for (var k = 0; k < 6; k++) {
				var oCombo = this.getView().byId('comboexcp' + k);
				this.getView().byId('cmt' + k).setValue('');
				oCombo.setSelectedKey('');
			}
			this.getView().byId('combo2').setValue('');
			this.getView().byId('combo1').setValue('');
			this.getView().byId("combo").setValue('');
			this.byId("SupRev").setProperty("selected", false);
			this.byId("SupRev").setEditable(true);
			this.byId("MgrRev").setProperty("selected", false);
			this.byId("MgrRev").setEditable(true);
			this.getView().byId('usr2').setValue('');
			this.getView().byId('usr1').setValue('');
			var oModel = this.byId('table');
			oModel.destroyItems();
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function(oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},

		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser historz
		 * @public
		 */
		onNavBack: function() {
			history.go(-1);
		},

		onSearch: function(oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var oTableSearchState = [];
				var sQuery = oEvent.getParameter("query");

				if (sQuery && sQuery.length > 0) {
					oTableSearchState = [new Filter("EwpMonth", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(oTableSearchState);
			}

		},

		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function() {
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
		_showObject: function(oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("IvDate")
			});
		},

		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {object} oTableSearchState an array of filters for the search
		 * @private
		 */
		_applySearch: function(oTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(oTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (oTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},

		_onComboBoxChange: function(oEvent) {

			var newval = oEvent.getParameter("newValue");
			var key = oEvent.getSource().getSelectedItem();

			if (newval !== "" && key === null) {
				oEvent.getSource().setValue("");
				oEvent.getSource().setValueState("Error");
			} else {
				oEvent.getSource().setValueState("None");
			}

		}
	});
});