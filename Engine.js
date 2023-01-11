const TabName = "mdl-tabs";
const TabStrip = "mdl-tabs__tab-bar";
const TabBodyIDPre = "tab_body_";
const TabGridBodyIDPre = "tab_grid_body_";
const TabStripIDPre = "tab_strip_";
const JSONFileStorageName = "tasker_saved_json";
const CardIDPre = "card_id_";
const AddStr = "Add";
const UpdateStr = "Update";
const notesTaskEditText = "Edit";
const notesTaskSaveText = "Save";

//////////////////////////////////////////////////
let PageJson = null;
let TaskCategories = null;

function checkNullability(object)
{
	return object === null || object === undefined || object === "";
}

function mdlRefresh(obj)
{
	componentHandler.downgradeElements(obj);
	componentHandler.upgradeElement(obj);
}

function addClass(objectStr, addedClass)
{
	document.getElementById(objectStr).classList.add(addedClass);
}


function removeClass(objectStr, addedClass)
{
	document.getElementById(objectStr).classList.remove(addedClass);
}

function getHolder(str)
{
	ret = document.getElementsByClassName(str);
	console.log(ret);
	if(ret !== undefined && ret.length >= 1)
	{
		return ret[0];
	}
	return undefined;
}

function createMetaData(object)
{
	const taskCategories = new Set()
	console.log(object);
	for (const task of object.tasks) 
	{
		if(checkNullability(task.category)){continue;}
		taskCategories.add(task.category.toLowerCase());
	}
	return taskCategories;
}

function addTab(tabString)
{
	areaToAddTab = getHolder(TabName);
	tabStrip = getHolder(TabStrip);
	var anch = document.createElement('a'); 
	anch.innerHTML = tabString;
	anch.href = "#" + TabBodyIDPre + tabString;
	anch.className  = "mdl-tabs__tab";
	anch.setAttribute("id",TabStripIDPre+tabString);
	tabStrip.appendChild(anch);
	
	var div = document.createElement('div'); 
	div.className = "mdl-tabs__panel";
	div.setAttribute("id",TabBodyIDPre+tabString);
	var gridDiv = document.createElement('div'); 
	gridDiv.className = "mdl-grid";
	gridDiv.setAttribute("id",TabGridBodyIDPre+tabString);
	
	div.appendChild(gridDiv);
	//div.innerHTML = tabString;
	areaToAddTab.appendChild(div);
	
	mdlRefresh(tabStrip);
	mdlRefresh(areaToAddTab);

	console.log(tabStrip);
	console.log(areaToAddTab);
}

function addTabsForTaskCategories(object)
{
	for (const tabStr of object) 
	{
		addTab(tabStr);
	}
}


function setActiveTab(id)
{
	console.log("setActiveTab - " + id);
	
	var objs = document.getElementsByClassName("is-active");
	var index = objs.length;
	while (index--) {
		var activeObj = objs[index];
		console.log(activeObj);
		if(activeObj.id.includes(TabStripIDPre) || activeObj.id.includes(TabBodyIDPre))
		{
			removeClass(activeObj.id,"is-active");
		}
	}
	
	/*var activeTab = getHolder("is-active");
	if(activeTab !== undefined)
	{
		activeTab.className = "mdl-tabs__tab";
	}*/
	
	//document.getElementById(TabStripIDPre+id).click();
	addClass(TabStripIDPre+id,"is-active");
	addClass(TabBodyIDPre+id,"is-active");
}

function addCard(body,name,description,index)
{
	if(body === null || body === undefined || index < 0)
	{
		return;
	}
	if(checkNullability(name))
	{
		name = "NA";
	}
	if(checkNullability(description))
	{
		description = "NA";
	}

	var boxDiv = document.createElement('div'); 
	boxDiv.className  = "mdl-cell mdl-card mdl-shadow--2dp";
	boxDiv.setAttribute("id",CardIDPre+index);
	
	//heading
	var headerDiv = document.createElement('div'); 
	headerDiv.className  = "mdl-card__title";
	var heading = document.createElement('h2'); 
	heading.className = "mdl-card__title-text";
	heading.innerHTML = name;
	headerDiv.appendChild(heading);
	boxDiv.appendChild(headerDiv);
	
	//description
	var descriptionDiv = document.createElement('div'); 
	descriptionDiv.className  = "mdl-card__supporting-text";
	descriptionDiv.innerHTML = description;
	boxDiv.appendChild(descriptionDiv);
	
	//notes
	var notesDiv = document.createElement('div'); 
	notesDiv.className  = "mdl-card__actions mdl-card--border";
	var notesDivHref = document.createElement('a'); 
	notesDivHref.className = "mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect";
	notesDivHref.innerHTML = "Notes";
	notesDivHref.onclick = function() { showNotesTask(index); };
	notesDiv.appendChild(notesDivHref);
	boxDiv.appendChild(notesDiv);
	
	//edit button
	var cardButtonDiv = document.createElement('div'); 
	cardButtonDiv.className  = "mdl-card__menu";
	var editDivButton = document.createElement('button'); 
	editDivButton.className = "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect";
	editDivButton.onclick = function() { showAddOrUpdateTask(false,index); };
	var editDivButtonIcon = document.createElement('i'); 
	editDivButtonIcon.className = "material-icons";
	editDivButtonIcon.innerHTML = "edit";
	editDivButton.appendChild(editDivButtonIcon);
	cardButtonDiv.appendChild(editDivButton);
	var deleteDivButton = document.createElement('button'); 
	deleteDivButton.className = "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect";
	deleteDivButton.onclick = function() { deleteTask(index); };
	var deleteDivButtonIcon = document.createElement('i'); 
	deleteDivButtonIcon.className = "material-icons";
	deleteDivButtonIcon.innerHTML = "delete";
	deleteDivButton.appendChild(deleteDivButtonIcon);
	cardButtonDiv.appendChild(deleteDivButton);
	boxDiv.appendChild(cardButtonDiv);

	//append boxDiv
	mdlRefresh(boxDiv);
	body.appendChild(boxDiv);
}

function addCards(object)
{
	const taskCategories = new Set()
	index = 0;
	for (const task of object.tasks) 
	{ 
		var tabBody = document.getElementById((TabGridBodyIDPre+task.category).toLowerCase());
		addCard(tabBody,task.name,task.description,index);
		index++;
	}
}

function cleanPageJson(object)
{
	var index = object.tasks.length;
	while (index--) {
		if (checkNullability(object.tasks[index].category)) { 
			object.tasks.splice(index, 1);
		} 
		else
		{
			object.tasks[index].category = object.tasks[index].category.replace(/ /g,'');
		}
	}
}

function init(skipParse=true)
{
	if(skipParse === true)
	{
		var localJson = localStorage.getItem(JSONFileStorageName);
		if(checkNullability(localJson))
		{
			localJson = tasks;
		}
		PageJson = JSON.parse(localJson);
	}
	
	cleanPageJson(PageJson);
	updateStorage();
	
	TaskCategories = createMetaData(PageJson);
	if(TaskCategories.size <= 0 )
	{return;}
	console.log(TaskCategories);
	
	addTabsForTaskCategories(TaskCategories);
	
	const [activeTab] = TaskCategories;
	
	addCards(PageJson);
	
	setActiveTab(activeTab);
	
}

function updateStorage()
{
	localStorage.setItem(JSONFileStorageName, JSON.stringify(PageJson));
}

function addNewTask(category,name,description)
{
	console.log("Adding Task: " + name.value + ", with description: " + description.value);	
	var taskJson = {};
	taskJson["category"] = category.value.toLowerCase();
	taskJson["name"] = name.value;
	taskJson["description"] = description.value;
	PageJson.tasks.push(taskJson);
	console.log(PageJson);
	console.log("Index: "+(PageJson.tasks.length-1));
	
	if(TaskCategories.has(taskJson["category"]) === false)
	{
		addTab(taskJson["category"]);
		TaskCategories.add(taskJson["category"]);
		setActiveTab(taskJson["category"]);
	}
	var tabBody = document.getElementById(TabGridBodyIDPre+taskJson.category);
	addCard(tabBody,taskJson.name,taskJson.description,PageJson.tasks.length-1);
	mdlRefresh(tabBody);
	updateStorage();
}

function deleteCard(index)
{
	var cardToDelete = document.getElementById(CardIDPre+index);
	cardToDelete.remove();
}

function deleteTask(index)
{
	//task is not deleted as it will change index
	//this will be refined aat init
	let isExecuted = confirm("Are you sure to delete this action?");
	if(isExecuted === false) {return;}
	console.log("Deleting for index: "+index);
	PageJson.tasks[index] = {};
	updateStorage();
	deleteCard(index);
}

function showAddOrUpdateTask(isAdd,index=-1)
{	
	/*var classValue = "mdl-textfield mdl-js-textfield";
	if(isAdd)
	{
		classValue += " is-dirty";
	}
	document.getElementById("AUTask_category_div").className = classValue;
	document.getElementById("AUTask_name_div").className = classValue;
	document.getElementById("AUTask_description_div").className = classValue;*/
	if(isAdd)
	{
		removeClass("AUTask_category_div","is-dirty");
		removeClass("AUTask_name_div","is-dirty");
		removeClass("AUTask_description_div","is-dirty");
	}
	else
	{
		addClass("AUTask_category_div","is-dirty");
		addClass("AUTask_name_div","is-dirty");
		addClass("AUTask_description_div","is-dirty");
	}
	
	document.getElementById("AddOrUpdateTaskDialog_Title").innerHTML = isAdd ? "Add Task" : "Update Task";
	document.getElementById("AUTask_Category").value = isAdd ? "" : PageJson.tasks[index].category;
	document.getElementById("AUTask_name").value = isAdd ? "" : PageJson.tasks[index].name;
	document.getElementById("AUTask_description").value = isAdd ? "" : PageJson.tasks[index].description;
	document.getElementById("AUTask_Action").innerHTML = isAdd ? AddStr : UpdateStr;
	if(isAdd)
	{
		document.getElementById("AUTask_Action").onclick = function() {actionTask(AUTask_Action,AUTask_Category,AUTask_name,AUTask_description);AddOrUpdateTaskDialog.close();};
	}
	else
	{
		document.getElementById("AUTask_Action").onclick = function() {actionTask(AUTask_Action,AUTask_Category,AUTask_name,AUTask_description,index);AddOrUpdateTaskDialog.close();};
	}
	AddOrUpdateTaskDialog.showModal();
}

function updateTask(index,category,name,description)
{
	var isRemove = false;
	deleteCard(index);	
	
	PageJson.tasks[index].category = category.value.toLowerCase();
	PageJson.tasks[index].name = name.value;
	PageJson.tasks[index].description = description.value;	
	
	var taskJson = {};
	taskJson["category"] = category.value.toLowerCase();
	taskJson["name"] = name.value;
	taskJson["description"] = description.value;
	
	if(TaskCategories.has(taskJson["category"]) === false)
	{
		addTab(taskJson["category"]);
		TaskCategories.add(taskJson["category"]);
		setActiveTab(taskJson["category"]);
	}
	var tabBody = document.getElementById(TabGridBodyIDPre+taskJson.category);
	addCard(tabBody,taskJson.name,taskJson.description,index);
	mdlRefresh(tabBody);
	updateStorage();
}

function actionTask(action,category,name,description,index=-1)
{
	if(action.innerHTML === AddStr)
	{
		addNewTask(category,name,description);
	}

	if(action.innerHTML === UpdateStr)
	{
		updateTask(index,category,name,description);
	}
}

function notesTaskAction(object,index)
{
	if(object.innerHTML === notesTaskEditText)
	{
		object.innerHTML = notesTaskSaveText;
		if(checkNullability(document.getElementById("NotesTaskDiv").innerHTML) === true)
		{
			document.getElementById("NotesTaskDiv").innerHTML = "Edit Here";
		}
		document.getElementById("NotesTaskDiv").setAttribute("contenteditable",true);
	}
	else if (object.innerHTML === notesTaskSaveText)
	{
		object.innerHTML = notesTaskEditText;
		PageJson.tasks[index].notes = encodeB64(document.getElementById("NotesTaskDiv").innerHTML);
		updateStorage();
		document.getElementById("NotesTaskDiv").setAttribute("contenteditable",false);
		
	}
}

function encodeB64(str)
{
	
	if(str !== null && str !== undefined && str !== "")
	{
		return btoa(unescape(encodeURIComponent(str)));
		//return btoa(str);
	}
	else
	{
		return "";
	}
}

function decodeB64(str)
{
	if(str !== null && str !== undefined && str !== "")
	{
		return decodeURIComponent(escape(atob(str)));
		//return atob(str);
	}
	else
	{
		return "";
	}
}

function showNotesTask(index)
{
	document.getElementById("NotesTask_Action").innerHTML = notesTaskEditText;
	document.getElementById("NotesTaskDiv").innerHTML = decodeB64(PageJson.tasks[index].notes);
	document.getElementById("NotesTaskDiv").setAttribute("contenteditable",false);
	document.getElementById("NotesTask_Action").onclick = function() {notesTaskAction(NotesTask_Action,index);};
	NotesDailog.showModal();
}



function downloadJSON()
{
	console.log("In downloadJSON");
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent("tasks = `"+JSON.stringify(PageJson)+"`;");
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", "tasks.json");
	dlAnchorElem.click();
}

init();