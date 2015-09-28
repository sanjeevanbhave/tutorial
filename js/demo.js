'use strict';
// define angular module for Product App
var app = angular.module('productapp', ['ngSanitize', 'ui.select']);

/**
 * AngularJS default filter with the following expression:
 * "product in products | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */ 
app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if(item[prop]!=null){
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  }
});

// Define controller
app.controller('DemoCtrl', function($scope, $http, dbService) {
  // Handle enable/disable flags
  $scope.disabled = undefined;

  $scope.save = function() {
    var unitCost = parseFloat(angular.element(document.getElementById("unitCost")).html());
    var sellingPrice = parseFloat(angular.element(document.getElementById("unitSellingPrice")).html());
    if(sellingPrice < unitCost){
      alert("Selling Price can not be less than Unit Cost!");
    }else{
      $scope.disabled = false;
      $scope.product.selected = undefined;
      dbService.editProduct();
      $scope.products = dbService.loadDataFromDB();
    }
  };

  $scope.disable = function() {
    $scope.disabled = true;
  };
  
  $scope.clear = function() {
    $scope.product.selected = undefined;
  };
  // Add/Edit handlers
  $scope.addNew = function() {
    $scope.product.selected = undefined;
    $scope.disabled = true;
    $scope.addProduct = true;
    $scope.btnClearDisable = true;
  };

  $scope.saveNewProduct = function() {
    var unitCost = parseFloat(angular.element(document.getElementById("addUnitCost")).html());
    var sellingPrice = parseFloat(angular.element(document.getElementById("addUnitSellingPrice")).html());
    if(sellingPrice < unitCost){
      alert("Selling Price can not be less than Unit Cost!");
    }else {
      $scope.btnClearDisable = false;
      $scope.disabled = false;
      $scope.product.selected = undefined;
      $scope.addProduct = false;
      dbService.addProduct();
      $scope.products = dbService.loadDataFromDB();
    }
  }

  // Initialise database
  dbService.initDb();

  // load data from db to UI
  $scope.product = {};
  $scope.products = dbService.loadDataFromDB();

  // Validation
  $scope.validateName = function(keyEvent){
    if (!(keyEvent.which > 47 && keyEvent.which < 58) && // numeric (0-9)
        !(keyEvent.which > 64 && keyEvent.which < 91) && // upper alpha (A-Z)
        !(keyEvent.which > 96 && keyEvent.which < 123)) { // lower alpha (a-z)
      keyEvent.preventDefault();
    } else {
      return true;
    }
  }

  $scope.validatePrice = function(keyEvent){
    if (!(keyEvent.which > 47 && keyEvent.which < 58)) {
      keyEvent.preventDefault();
    } else {
      return true;
    }
  }

});
