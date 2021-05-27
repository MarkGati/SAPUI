var myFormatter = {
	formatColor: function(v) {
	console.log(v);
	  var oValue = parseInt(v)
	  if (oValue > 3) {
		this.addStyleClass("customGreen");
		return oValue;
	  } else if (oValue > 0) {
		this.addStyleClass("customOrange");
		return oValue;
	  } else if (oValue == 0) {
		this.addStyleClass("customRed");
		return oValue;
	  }
	  return oValue;
	}
  };

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/ValueState",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'jquery.sap.global'
//	'sap/ushell_abap/bootstrap/abap'
 ], function (Controller, ValueState, Dialog, DialogType, Button, ButtonType, Text, Fragment, MessageToast, Filter, FilterOperator, Sorter, jQuery) {
	"use strict";
	return Controller.extend("org.ubb.books.controller.App", {

		onInit : function() {
			this.book = {
                ISBN: "",
                Author: "",
                Title: "",
                PublicationDate: "",
                Language: "",
                AvailableNumber: "",
                TotalNumber: ""
            }
		},

		onRefresh : function () {
			console.log(this.byId("idBooksTable").getBinding("items"))
			this.byId("idBooksTable").getBinding("items").refresh();
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z801_BOOKS_MAGA_SRV", false );
			oModel.setRefreshAfterChange(true);
		},

		onDeleteDialogPress : function (oEvent) {
			var oView = this.getView();
				var path = oEvent.getSource().getBindingContext().getPath();
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "org.ubb.books.view.DeleteDialog",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					oDialog.bindElement({
						path: path,
						});
					return oDialog;
				});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onOpenUpdateFragment : function (oEvent) {

			var oView = this.getView();
			var path = oEvent.getSource().getBindingContext().getPath();
			this.pDialog = Fragment.load({
				id: oView.getId(),
				name: "org.ubb.books.view.UpdateDialog",
				controller: this
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.bindElement({
					path: path,
					});
				return oDialog;
			});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		 },

		 areFiltersValid: function(isbn, dateStart, dateEnd, language){
            var isValid = true;
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            if(isbn != "" && isbn.length != 13){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("isbnWarning"));
            }            
            else if(language != "" && language.length != 2){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("languageCodeWarning"));
            }
            else if(dateStart != "" && dateEnd != "" && dateStart > dateEnd){
                isValid = false;
                MessageToast.show(oResourceBundle.getText("datesOrderWarning"));
            }
            return isValid;
        },

		onSearchButtonPressed(oEvent){
            var isbn = this.byId("inputISBN").getValue();
            var title = this.byId("inputTitle").getValue();
            var author = this.byId("inputAuthor").getValue();
            var language = this.byId("inputLanguage").getValue();
            var dateStart = this.byId("inputDateStart").getDateValue();
            var dateEnd = this.byId("inputDateEnd").getDateValue();

            var aFilter = [];
            var oList = this.getView().byId("idBooksTable");
            var oBinding = oList.getBinding("items");

            var valid = this.areFiltersValid(isbn, dateStart, dateEnd, language);
            if(valid) {
                if(isbn){
                    aFilter.push(new Filter("ISBN", FilterOperator.Contains, isbn));
                }
                if(author){
                    aFilter.push(new Filter("Author", FilterOperator.Contains, author));
                }
                if(title){
                    aFilter.push(new Filter("Title", FilterOperator.Contains, title));
                }
                if(dateStart && dateEnd){
                    var filter = new Filter("PublishDate", FilterOperator.BT, dateStart, dateEnd)
                    aFilter.push(filter);
                }
                if(language){
                    aFilter.push(new Filter("Language", FilterOperator.Contains, language));
                }
                oBinding.filter(aFilter);
            }            
        },

		onSortButtonPressed: function(oEvent) { 
			var oView = this.getView();
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "org.ubb.books.view.Sorter",
					controller: this
				}).then(function (oDialog) {
					oDialog.setModel(oView.getModel("i18n"), "i18n");
					return oDialog;
				});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
        },

		onConfirm: function(oEvent) {
            var oView = this.getView();
            var oTable = oView.byId("idBooksTable");
            var mParams = oEvent.getParameters();
            var oBinding = oTable.getBinding("items");

            // apply sorter
            var aSorters = [];
            var sPath = mParams.sortItem.getKey();
            var bDescending = mParams.sortDescending;
            aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
            oBinding.sort(aSorters);

        },

		onHistoryDialogPress : function(oEvent) {
			var oView = this.getView();
				var path = oEvent.getSource().getBindingContext().getPath();
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "org.ubb.books.view.HistoryDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					oDialog.bindElement({
						path: path,
						});
					return oDialog;
				});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},
		
		onInsertBookPress : function (oEvent) {
			var oView = this.getView();
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "org.ubb.books.view.InsertDialog",
					controller: this
				}).then(function (oDialog) {
					oView.addDependent(oDialog);
					return oDialog;
				});
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onHistoryCancelPress : function () {
			this.byId("HistoryDialog").close();
			this.byId("HistoryDialog").destroy();
		},

		onUpdateBookCancelPress : function () {
			this.byId("UpdateBookDialog").close();
			this.byId("UpdateBookDialog").destroy();
		},

		onSaveUpdatePress : function (oEvent) {

			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z801_BOOKS_MAGA_SRV", false );
			var oEntry = {};
			oEntry.Isbn = parseInt(this.getView().byId("isbn").getValue());
			oEntry.Author = this.getView().byId("author").getValue();
			oEntry.Title = this.getView().byId("title").getValue();
			let date = this.getView().byId("published").getValue() ;
			date = Date(date)
			oEntry.PublishDate = new Date(date);
			oEntry.Language = this.getView().byId("language").getValue();
			oEntry.NrAvBooks = parseInt(this.getView().byId("nravbooks").getValue());
			oEntry.NrBooks = parseInt(this.getView().byId("nrbooks").getValue());
			oEntry.ChangedOn =  new Date(Date.now());
			//var sysinfo = window["sap-ushell-config"].services.Container.adapter.config;
			//oEntry.ChangedBy = sysinfo.id;
			oEntry.ChangedBy = "MGATI";
			oModel.update(oEvent.getSource().getParent().getBindingContext().sPath, oEntry, {
				success:function(){
					var msg = 'Update Successful';
					MessageToast.show(msg);
				},
				error:function(){
					var msg = 'Update Failed';
					MessageToast.show(msg);
				}
			});
			this.byId("UpdateBookDialog").close();
			this.byId("UpdateBookDialog").destroy();

		},

		onInsertBookCancelPress : function () {
			this.byId("InsertBookDialog").close();
			this.byId("InsertBookDialog").destroy();
		},

		onInsertBookSavePress : function () {
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z801_BOOKS_MAGA_SRV", false );
			var oEntry = {};
			oEntry.Isbn = parseInt(this.getView().byId("isbn").getValue());
			oEntry.Author = this.getView().byId("author").getValue();
			oEntry.Title = this.getView().byId("title").getValue();
			oEntry.PublishDate = new Date(this.getView().byId("publishdate").getValue());
			oEntry.Language = this.getView().byId("language").getValue();
			oEntry.NrAvBooks = parseInt(this.getView().byId("nravbooks").getValue());
			oEntry.NrBooks = parseInt(this.getView().byId("nrbooks").getValue());
			oEntry.CreatedOn = new Date(Date.now());
			oEntry.CreatedBy = "MGATI";
			oEntry.ChangedOn =  new Date(Date.now());
			oEntry.ChangedBy = "MGATI";
			oModel.create("/Books", oEntry, {
				success:function(){
					var msg = 'Insert Successful';
					MessageToast.show(msg);
				},
				error:function(){
					var msg = 'Insert Failed';
					MessageToast.show(msg);
				}
			});
			this.byId("InsertBookDialog").close();
			this.byId("InsertBookDialog").destroy();
		},

		onViewCheckoutsPress : function(oEvent){
			let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("checkout");
		},

		
		onBackButtonPressed : function(){

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("app", true);
		},

		onDeleteSavePress : function (oEvent){
			var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/Z801_BOOKS_MAGA_SRV", false );
			console.log(oEvent.getSource().getParent());
			oModel.remove(oEvent.getSource().getParent().getBindingContext().sPath, {
				success:function(){
					var msg = 'Delete Successful';
					MessageToast.show(msg);
				},
				error:function(){
					var msg = 'Delete Failed';
					MessageToast.show(msg);
				}
			})
			this.byId("DeleteDialog").close();
			this.byId("DeleteDialog").destroy();
		},

		onDeleteCancelPress : function(){
			this.byId("DeleteDialog").close();
			this.byId("DeleteDialog").destroy();
		}
 	})
})