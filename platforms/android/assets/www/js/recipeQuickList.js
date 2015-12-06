//Matt Treichel - 120585470
//Giovanni Romano - 120324160

//Use: On Button Click
//Page Changing Navigation
function Menu() {
 	this.goHome = function() { document.location.href = "index.html"; }
	this.goToRecipes = function() { document.location.href = "recipeMenu.html"; }
	this.goToRecipeInput = function() { document.location.href = "recipeInput.html"; }
	this.goToRecipeEdit = function() { document.location.href = "recipeEdit.html"; }
	this.goToRecipeDelete = function() { document.location.href = "recipeDelete.html"; }
	this.goToRecipeView = function() { document.location.href = "recipeView.html"; }
	this.goToCalendar = function() { document.location.href = "calendar.html"; }
	this.goToShoppingLists = function() { document.location.href = "shoppingLists.html"; }
	//Using $.mobile.changePage without some sort of re-haul of how we do pages leads to errors with document.ready() Javascript use
/*	this.goHome = function() { $.mobile.changePage( "index.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToRecipes = function() { $.mobile.changePage( "recipeMenu.html", { transition: "slide", changeHash: false, reloadPage: true }); }
 	this.goToRecipeInput = function() { $.mobile.changePage( "recipeInput.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToRecipeEdit = function() { $.mobile.changePage( "recipeEdit.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToRecipeDelete = function() { $.mobile.changePage( "recipeDelete.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToRecipeView = function() { $.mobile.changePage( "recipeView.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToCalendar = function() { $.mobile.changePage( "calendar.html", { transition: "slide", changeHash: false, reloadPage: true }); }
	this.goToShoppingLists = function() { $.mobile.changePage( "shoppingLists.html", { transition: "slide", changeHash: false, reloadPage: true }); } */
}

function Recipes() {
	//Use: Internal
	//Check LocalStorage value is a Recipe (ie. it could also be a Date)
	this.isRecipe = function(localStorageKey) {
		return localStorageKey.indexOf("00:00:00") === -1; //Quick Fix, assuming Date Format has this and Recipe Name won't.
	}

	//Use: On HTML Document Load
	//Create Select HTML Element with Recipe Options in LocalStorage
	this.loadRecipeOptions = function() { 
		var select = document.getElementById('recipeSelect');
		for (var i = 0, retrievedRecipe = null, option = null; i < localStorage.length; i++) {
			if(this.isRecipe(localStorage.key(i))) {
				retrievedRecipe = JSON.parse(localStorage.getItem(localStorage.key(i)));
				option = document.createElement('option');
				option.value = retrievedRecipe.recipeName;
				option.innerHTML = retrievedRecipe.recipeName;
				select.appendChild(option);
			}
		}
	}
}

function RecipeControl() {
	//Use: On Button Click
	//Add Ingredient Input to RecipeInput/Edit Page
	this.addIngredient = function() {
		$("#inputs").append("<label>Ingredient " + ($("[name='ingredient']").length + 1) + ": </label><input name='ingredient'>");
		$("#inputs").trigger("create"); //Reloads CSS
	}

	//Use: On Button Click
	//Save Recipe in LocalStorage
	this.saveRecipe = function() { 
		var recipeName = $("[name='name']").val(); //Grab Name Input
		var recipeObject = {"recipeName" : recipeName}; //Store Everything in an Object
		var ingredients = $("[name='ingredient']"); //Grab all the Ingredient Inputs as a JQuery Element
		var ingredientCount = ingredients.length;
		for (var i = 0, ingredient = null, ingredientLabel = ""; i < ingredientCount; i++) {
			ingredient = ingredients.eq(i); //Grab the Individual Ingredient Input JQuery Elements
			ingredientLabel = "ingredient" + i;
			recipeObject[ingredientLabel] = ingredient.val();
		}
		localStorage.setItem(recipeName, JSON.stringify(recipeObject)); //Save Recipe Object
		location.reload(); //Reload Page
	}

	//Use: On Button Click
	//Retrieve Recipe from LocalStorage to be Edited
	this.editRecipe = function() {
		var recipeName = $("#recipeSelect").find(":selected").text(); //Get Recipe Name to Retrieve
		retrievedRecipe = JSON.parse(localStorage.getItem(recipeName));
		$("#editSelection").remove(); //Edit Form is Hidden on the Page as a Quick Solution, Selection Removed and Form Summoned
		$("#editForm").css("display","block"); 
		$("[name='name']").val(recipeName); //Set Values of Form from LocalStorage Values
		for (var ingredient in retrievedRecipe) {
			if (ingredient !== "recipeName") {
				this.addIngredient();
				$("[name='ingredient']").last().val(retrievedRecipe[ingredient]);
			}
		}
	}

	//Use: On Button Click
	//Delete Recipe from LocalStorage
	this.deleteRecipe = function() {
		var recipeName = $("#recipeSelect").find(":selected").text(); //Get Recipe Name to Delete
		var calendar = new Calendar();
		localStorage.removeItem(recipeName); //Remove Recipe from LocalStorage
		for (var i = 0, retrievedRecipe = null; i < localStorage.length; i++) {
			if (calendar.isDate(localStorage.key(i))) { //Remove Recipe from Dates in LocalStorage
				retrievedRecipes = localStorage.getItem(localStorage.key(i)).split(/,/);
				if (retrievedRecipes.length === 1 &&  retrievedRecipes[0] === recipeName) { //Only 1 Recipe
					localStorage.removeItem(localStorage.key(i));
					i--;
				} else { //Search Date Recipe List
					retrievedRecipes.forEach(function (recipe, index) {
						if (recipe === recipeName) retrievedRecipes.splice(index, 1); //Remove Recipe from Date
					});
					retrievedRecipes = retrievedRecipes.join();
					localStorage.setItem(localStorage.key(i), retrievedRecipes); //Re-save Date List
				}
			}
		}
		location.reload();
	}
}

function RecipeView() {
	//Use: On HTML Document Load
	//Retrieve All Recipes from LocalStorage and Print
	this.loadRecipes = function() {
		var content = $('.content');
		var recipes = new Recipes();
		for (var i = 0, retrievedRecipe = null; i < localStorage.length; i++) {
			if(recipes.isRecipe(localStorage.key(i))) {
				retrievedRecipe = JSON.parse(localStorage.getItem(localStorage.key(i)));
				content.append(this.formatRecipe(retrievedRecipe)); //Print to Document after Formatting
			}
		}
	}

	//Use: Internal
	//Transform given Recipe Object into a well-formatted HTML string for display
	this.formatRecipe = function(retrievedRecipe) {
		var recipeString = "";
		recipeString = recipeString.concat("<p><b>" + retrievedRecipe.recipeName + "</b><br>"); //Bolded Recipe Name
		for (var ingredient in retrievedRecipe) {
			if (ingredient !== "recipeName") recipeString = recipeString.concat(retrievedRecipe[ingredient] + "<br>"); //List Ingredients
		}
		recipeString = recipeString.concat("</p>");
		return recipeString;
	}
}

function Calendar() {
	//Use: Internal
	//Check LocalStorage value is a Date (ie. it could also be a Recipe)
	this.isDate = function(localStorageKey) {
		return localStorageKey.indexOf("00:00:00") !== -1; //Quick Fix, assuming Date Format has this and Recipe Name won't.
	}

	//Use: On HTML Document Load
	//Load FullCalendar Plug-in for Recipe Date Selection
	this.loadCalendar = function() {
		$('#calendar').fullCalendar({
			height: "auto",
			events: this.loadCalendarEvents(),
			timeFormat: ' ', //Otherwise Prepends '12a' to Loaded Events
			eventStartEditable : true, //Draggable Events
			selectable: true,
			//Use: On Calendar Date Selection
			//Place Recipe on a Date by Selecting a Date
			select: function(start, end) {
				$("#recipePicker").popup("open"); //Open Recipe Picker
				$("#pickRecipeButton").unbind().click(function(){
					//Place Recipe in Calendar
					var eventData;
					var title = $("#recipeSelect").find(":selected").text(); //Get Selected Recipe Name
					eventData = { //Create Calendar Event
						title: title,
						start: start,
						end: end,
						backgroundColor: "#8debb9",
						textColor: "black"
					};
					$('#calendar').fullCalendar('renderEvent', eventData, true); //Save Recipe to Calendar
					
					//Save in LocalStorage
					var dateData = localStorage.getItem(start);
					if (dateData === null) { //If Date doesn't exist, Save Recipe to a new Date object in LocalStorage
						localStorage.setItem(start, title);
					} else { //If Date does exist, Concatenate Recipe to a the Date object in LocalStorage
						dateData = dateData.concat("," + title); 
						localStorage.setItem(start, dateData);
					}
					
					$("#recipePicker").popup("close");
				});
			},
			//Use: On Calendar Drag Action
			//When Recipe is Moved in Calendar, LocalStorage must be adjusted
			eventDrop: function(event, dayDelta) {
				//Save New Date
				var start = event.start;
				var title = event.title;
				var dateData = localStorage.getItem(start);
				if (dateData === null) { //If Date doesn't exist, Save Recipe to a new Date object in LocalStorage
					localStorage.setItem(start, title);
				} else { //If Date does exist, Concatenate Recipe to a the Date object in LocalStorage
					dateData = dateData.concat("," + title);
					localStorage.setItem(start, dateData);
				}
				
				//Delete Old Date
				var oldDate = moment(event.start); //This clones (ie. recreates) event.start
				oldDate.add(-dayDelta.asDays(), 'days');
				var dateString = oldDate.format("ddd MMM DD YYYY [00:00:00 GMT+0000]");
				localStorage.removeItem(dateString);
			}
		});
	}

	//Use: On HTML Document Load
	//Load Week-Long FullCalendar Plug-in for Shopping List Selection
	this.loadWeekCalendar = function() {
		$('#calendar').fullCalendar({
			defaultView: 'basicWeek', //Only Show 1 Week at a Time
			height: 200, //Small
			events: this.loadCalendarEvents(),
			header: {
				left:   'title',
				center: '',
				right:  'prev,next' //Issues with assigning Today Button an onClick Event
			},
			timeFormat: ' ' //Otherwise Prepends '12a' to Loaded Events
		});
	}

	//Use: Internal
	//Get Dates (with attached Recipes) from LocalStorage into an Array of Objects so FullCalendar can read them
	this.loadCalendarEvents = function() {
		eventsData = [];
		for (var i = 0, event = null; i < localStorage.length; i++) {
			if(this.isDate(localStorage.key(i))) {
				retrievedRecipes = localStorage.getItem(localStorage.key(i)).split(/,/);
				retrievedRecipes.forEach(function (recipe) { //Create an Event from Each Recipe on a Date
					event = { title: recipe, start: localStorage.key(i), backgroundColor: "#8debb9", textColor: "black" }
					eventsData.push(event);
				});
			}
		}
		return eventsData;
	}
}

function ShoppingLists() {
	//Use: Internal
	//For Consistent String Casing for Shopping List Ingredient Counting
	this.toTitleCase = function(string) {
		return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	}

	//Use: On HTML Document Load & On Button Click
	//Create Shopping List from Current Calendar Week
	this.getShoppingList = function() {
		var WEEK_LENGTH = 7;
		var shoppingList = [[],[]]; //shoppingList[0] is Ingredients, shoppingList[1] is Frequency
		var initialDate = $('#calendar').fullCalendar('getDate').startOf('week'); //Get Beginning of Week Calendar is currently on
		var date = initialDate;
		for (var i = 0, dateString = ""; i < WEEK_LENGTH; i++) {
			dateString = date.format("ddd MMM DD YYYY [00:00:00 GMT+0000]");
			var dateRecipes = localStorage.getItem(dateString); //Grab Date from LocalStorage
			if (dateRecipes !== null) {
				shoppingList = this.addIngredientsToList(shoppingList, dateRecipes);
			}
			date.add(1, 'days'); //Loop Through the Week
		}
		this.printShoppingList(shoppingList);
	}

	//Use: Internal
	//Add Ingredients from Recipes to the Shopping List Array
	this.addIngredientsToList = function(shoppingList, dateRecipes) {
		dateRecipes = dateRecipes.split(/,/);
		dateRecipes.forEach(function (recipe) { //Loop Through Every Recipe in Date
			var retrievedRecipe = JSON.parse(localStorage.getItem(recipe));
			if (retrievedRecipe !== null) {
				for (var ingredient in retrievedRecipe) { //Loop Through Every Ingredient in Recipe
					//If new ingredient, push to the Shopping List
					if (ingredient !== "recipeName" && shoppingList[0].indexOf(this.toTitleCase(retrievedRecipe[ingredient])) === -1) {
						shoppingList[0].push(this.toTitleCase(retrievedRecipe[ingredient]));
						shoppingList[1].push(1); //Start Corresponding Frequency List from this Ingredient
					//If ingredient is already on the List, Increment the Frequency of the Item instead
					} else if (ingredient !== "recipeName" && shoppingList[0].indexOf(this.toTitleCase(retrievedRecipe[ingredient])) !== -1) {
						shoppingList[1][shoppingList[0].indexOf(this.toTitleCase(retrievedRecipe[ingredient]))] += 1;
					}
				}
			}
		}, this); //'this' is an argument to .forEach() to use .toTitleCase()
		return shoppingList;
	}

	//Use: Internal
	//Print Shopping List to the Document
	this.printShoppingList = function(shoppingList) {
		$('.shoppingLists').html(''); //Clear Previous Shopping List
		shoppingList[0].forEach(function (ingredient, index) {
			$('.shoppingLists').append(ingredient + " x" + shoppingList[1][index] + "<br>"); //Print Ingredient xFrequency, ex. Onions x3
		});
	}
}