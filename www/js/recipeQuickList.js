//Navigation

function goHome() {
	$.mobile.changePage( "index.html", { transition: "slide", changeHash: false });
}
function goToRecipes() {
	$.mobile.changePage( "recipeMenu.html", { transition: "slide", changeHash: false });
}
function goToCalendar() {
	document.location.href = "calendar.html";
}
function goToShoppingLists() {
    document.location.href = "shoppingLists.html";
}

//LocalStorage Checks

function isRecipe(localStorageKey) {
	return localStorageKey.indexOf("00:00:00") === -1; //Quick and Dirty, assuming Date Format has this and Recipe Name won't.
}

function isDate(localStorageKey) {
	return localStorageKey.indexOf("00:00:00") !== -1; //Quick and Dirty, assuming Date Format has this and Recipe Name won't.
}

//Calendar

function loadCalendar() {
	$('#calendar').fullCalendar({
		events: loadCalendarEvents(),
		timeFormat: ' ', //Otherwise Prepends '12a' to Loaded Events
		eventStartEditable : true, //Draggable Events
		selectable: true,
		select: function(start, end) {
			$("#recipePicker").popup("open");
			$("#pickRecipeButton").unbind().click(function(){
				var eventData;
				var title = $("#recipeSelect").find(":selected").text();
				eventData = {
					title: title,
					start: start,
					end: end,
					textColor: 'white'
				};
				$('#calendar').fullCalendar('renderEvent', eventData, true); // stick? = true
				
				var dateData = localStorage.getItem(start);
				if (dateData === null) {
					localStorage.setItem(start, title);
				} else {
					dateData = dateData.concat("," + title); //Yes, I'm concatenating within concatenating
					localStorage.setItem(start, dateData);
				}
				
				$("#recipePicker").popup("close");
			});
		},
		eventDrop: function(event, dayDelta) {
			//Need to remove old dates spot, using delta? 
			//moment().toDate(); //olddate.setDate(start.getDate() + dayDelta); //Then search in localStorage
			console.log(dayDelta); 
			var start = event.start;
			var title = event.title;
			var dateData = localStorage.getItem(start);
			if (dateData === null) {
				localStorage.setItem(start, title);
			} else {
				dateData = dateData.concat("," + title);
				localStorage.setItem(start, dateData);
			}
		}
	});
}

function loadCalendarEvents() { //Used in loadCalendar()
	eventsData = [];
	for (var i = 0, event = null; i < localStorage.length; i++) {
		if(isDate(localStorage.key(i))) {
			retrievedRecipes = localStorage.getItem(localStorage.key(i)).split(/,/);
			retrievedRecipes.forEach(function (recipe) {
				event = { title: recipe, start: localStorage.key(i), textColor: 'white' }
				eventsData.push(event);
			});
		}
	}
	return eventsData;
}

function loadRecipeOptions() {
	var select = document.getElementById('recipeSelect');
	for (var i = 0, retrievedRecipe = null, option = null; i < localStorage.length; i++) {
		if(isRecipe(localStorage.key(i))) {
			retrievedRecipe = JSON.parse(localStorage.getItem(localStorage.key(i)));
			option = document.createElement('option');
			option.value = retrievedRecipe.recipeName;
			option.innerHTML = retrievedRecipe.recipeName;
			select.appendChild(option);
		}
	}
}

//RecipeInput

function addIngredient() {
	//Ingredient Numbering should come from Recipes Class
	$("#inputs").append("<label>Ingredient " + ($("[name='ingredient']").length + 1) + ": </label><input name='ingredient'>");
	$("#inputs").trigger("create"); //Reloads CSS
}
function saveRecipe() {
	var recipeName = $("[name='name']").val();
	var recipeObject = {"recipeName" : recipeName};
	var ingredients = $("[name='ingredient']"); //Selects all the Ingredient Inputs as a JQuery Element
	var ingredientCount = ingredients.length;
	for (var i = 0, ingredient = null, ingredientLabel = ""; i < ingredientCount; i++) {
		ingredient = ingredients.eq(i); //Grab the Individual Ingredient Input JQuery Elements
		ingredientLabel = "ingredient" + i;
		recipeObject[ingredientLabel] = ingredient.val();
	}
	localStorage.setItem(recipeName, JSON.stringify(recipeObject)); //JSON sets off a "TypeError: a is undefined in JQuery" unless we do some fix
	location.reload(); //Reload Page
}

//RecipeView

function loadRecipes() {
	var content = $('.content');
	for (var i = 0, retrievedRecipe = null; i < localStorage.length; i++) {
		if(isRecipe(localStorage.key(i))) {
			retrievedRecipe = JSON.parse(localStorage.getItem(localStorage.key(i)));
			content.append(formatRecipe(retrievedRecipe));
		}
	}
}

function formatRecipe(retrievedRecipe) {
	var recipeString = "";
	recipeString = recipeString.concat("<p><b>" + retrievedRecipe.recipeName + "</b><br>");
	for (var ingredient in retrievedRecipe) {
		if (ingredient !== "recipeName") recipeString = recipeString.concat(retrievedRecipe[ingredient] + "<br>");
	}
	recipeString = recipeString.concat("</p>");
	return recipeString;
}

//ShoppingLists

function loadWeekCalendar() {
	$('#calendar').fullCalendar({
		defaultView: 'basicWeek',
		height: 200,
		events: loadCalendarEvents(),
		timeFormat: ' ' //Otherwise Prepends '12a' to Loaded Events
	});
}

function getShoppingList() {
	var WEEK_LENGTH = 7;
	var shoppingList = [];
	var initialDate = $('#calendar').fullCalendar('getDate');
	var date = initialDate;
	for (var i = 0, dateString = ""; i < WEEK_LENGTH; i++) {
		dateString = date.format("ddd MMM DD YYYY [00:00:00 GMT+0000]")
		var dateRecipes = localStorage.getItem(dateString);
		if (dateRecipes !== null) {
			shoppingList = addIngredientsToList(shoppingList, dateRecipes);
		}
		date.add(1, 'days');
	}
	printShoppingList(shoppingList);
}

function addIngredientsToList(shoppingList, dateRecipes) {
	dateRecipes = dateRecipes.split(/,/);
	dateRecipes.forEach(function (recipe) {
		var retrievedRecipe = JSON.parse(localStorage.getItem(recipe));
		if (retrievedRecipe !== null) {
			for (var ingredient in retrievedRecipe) {
				if (ingredient !== "recipeName" && shoppingList.indexOf(retrievedRecipe[ingredient]) === -1) {
					shoppingList.push(retrievedRecipe[ingredient]);
				}
			}
		}
	});
	return shoppingList;
}

function printShoppingList(shoppingList) {
    $('.ShoppingListDiv').html('');
	shoppingList.forEach(function (ingredient) {
	    $('.ShoppingListDiv').append(ingredient + "<br>");
	});
}