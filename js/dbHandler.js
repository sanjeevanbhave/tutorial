// Define factory service for CRUD operations - IndexedDB
angular.module('productapp').factory('dbService', function() {
	// Variable decalration
	var db;
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
	var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
	var prodData = [];

	// Default Data tobe insterted on load
	var productData = [
			{ name: 'AutoCAD',              sellingPrice: 24, unitCost: 10, availableUnits: 14 },
			{ name: 'Alias Products',       sellingPrice: 23, unitCost: 12, availableUnits: 14 },
			{ name: 'Maya',           	    sellingPrice: 45, unitCost: 30, availableUnits: 14 },
			{ name: 'Navisworks Products',  sellingPrice: 12, unitCost: 31, availableUnits: 14 },
			{ name: 'Smoke',                sellingPrice: 24, unitCost: 16, availableUnits: 14 },
			{ name: 'Autodesk PLM 360',     sellingPrice: 45, unitCost: 54, availableUnits: 14 },
			{ name: '3ds Max',              sellingPrice: 42, unitCost: 43, availableUnits: 14 },
			{ name: 'Buzzsaw',              sellingPrice: 34, unitCost: 21, availableUnits: 14 },
			{ name: 'Buzzsaw Professional', sellingPrice: 54, unitCost: 24, availableUnits: 17 }
		];
	// Set db readwrite mode
	if(IDBTransaction){
		IDBTransaction.READ_WRITE = IDBTransaction.READ_WRITE || 'readwrite';
		IDBTransaction.READ_ONLY = IDBTransaction.READ_ONLY || 'readonly';
	}
	return {
		initDb: function() {

			// Uncomment following only for Testing Purpose - will delete db
			//indexedDB.deleteDatabase("ProductDB");

			// create db
			var request = indexedDB.open("ProductDB", 1);  
			request.onsuccess = function (evt) {
				db = evt.target.result;			
			};

			// handle err if any
			request.onerror = function (evt) {
				console.log("IndexedDB error: " + evt.target.errorCode);
			};

			// create db definition
			request.onupgradeneeded = function (evt) {                   
				var objectStore = evt.currentTarget.result.createObjectStore("product", { keyPath: "id", autoIncrement: true });

				objectStore.createIndex("name", "name", { unique: true });
				objectStore.createIndex("sellingPrice", "sellingPrice", { unique: false });
				objectStore.createIndex("unitCost", "unitCost", { unique: false });
				objectStore.createIndex("availableUnits", "availableUnits", { unique: false });

				// Store values in the newly created objectStore.  
				for (i in productData) {
					objectStore.add(productData[i]);
				}
			};	
		},

		// load data from database
		loadDataFromDB: function() {
			var request = indexedDB.open("ProductDB", 1);
			request.onsuccess = function (evt) {
				db = evt.target.result;							
				
				var transaction = db.transaction("product", IDBTransaction.READ_WRITE);
				var objectStore = transaction.objectStore("product");

				var request = objectStore.openCursor();
				request.onsuccess = function(event) {  
					var cursor = event.target.result;  
					if (cursor) {  
						prodData.push(cursor.value);
						cursor.continue();  
					}  		
					else {
						console.log("ProductDB Data +++ ",JSON.stringify(prodData));
					}
				};
			};
			return prodData;
		},

		// Add new product in db
		addProduct: function () {
			var name = angular.element(document.getElementById("addProductName")).html();
			var unitCost = angular.element(document.getElementById("addUnitCost")).html();
			var sellingPrice = angular.element(document.getElementById("addUnitSellingPrice")).html();
			var availableUnits = angular.element(document.getElementById("addAvailableUnits")).html();
			var id = prodData.length+1;

			var transaction = db.transaction("product", IDBTransaction.READ_WRITE);
			var objectStore = transaction.objectStore("product");
			var request = objectStore.add({ name: name, sellingPrice: sellingPrice, unitCost: unitCost, availableUnits: availableUnits, id: id });
			request.onsuccess = function (event) {
				// event.target.result == productData[i].id
				alert("Product Data Saved");
				console.log("Saved");
			};					
			request.onerror = function (event) {
				// event.target.result == productData[i].id
				console.log("Err");
			};
		},

		// Edit selected product data
		editProduct: function () {
			var request = indexedDB.open("ProductDB", 1);
			var newname = angular.element(document.getElementById("productName")).html();
			var newsellingPrice = angular.element(document.getElementById("unitSellingPrice")).html();
			var id = angular.element(document.getElementById("prodId")).html();

			var objectStore = db.transaction(["product"], "readwrite").objectStore("product");
			var request = objectStore.get(parseInt(id));
			request.onerror = function(event) {
				// Handle errors!
			};
			request.onsuccess = function(event) {
				// Get the old value that we want to update
				var data = request.result;

				// update the value(s) in the object that you want to change
				data.name = newname;
				data.sellingPrice = newsellingPrice

				// Put this updated object back into the database.
				var requestUpdate = objectStore.put(data);
				requestUpdate.onerror = function(event) {
					// Do something with the error
				};
				requestUpdate.onsuccess = function(event) {
					// Refresh page so that changes can take place
					window.location = "/tutorial";
				};
			};
		},

		// delete data for selected product - Out of scope for now - not in requirement
		deleteProduct: function () {
			var id = document.getElementById('prodID').value;

			var transaction = db.transaction("product", IDBTransaction.READ_WRITE);
			var objectStore = transaction.objectStore("product");
			var request = objectStore.delete(parseInt(id));
			request.onsuccess = function(event) {
				// It's gone!  
			};
		}
    };
	
});