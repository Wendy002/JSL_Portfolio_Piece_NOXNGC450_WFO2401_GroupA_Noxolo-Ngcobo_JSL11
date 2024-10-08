// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, patchTask, putTask, deleteTask} from "./utils/taskFunctions.js";
import { initialData } from "./initialData.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}
initializeData(); // fix:  call the function

// TASK: Get elements from the DOM
const elements = {
  headerBoardName : document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  filterDiv: document.getElementById('filterDiv'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  themeSwitch: document.getElementById('switch'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  createTaskBtn: document.getElementById('createNewTaskBtn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  editTaskModal: document.querySelector('.edit-task-modal-window')
  
};

let activeBoard = "";

// Extracts unique board names from tasks
// TASK: FIX BUGS

function fetchAndDisplayBoardsAndTasks() {      //fix syntax add semi lons too
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; // insert : for ternary operator
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.querySelector("#boards-nav-links-div"); // change id to 'container'
  boardsContainer.innerHTML = ''; // Clears the container ***
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => {   // replace click() with addeventListener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board;//assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}
const colTitles = {
  todo: 'todo',
  doing: "doing",            // column titles before the function below
  done: "done"
};

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    const colTitle = colTitles[status]; // add this to match object with status ib the document
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${colTitle.toUpperCase()}</h4>
                        </div>`;   //replace status with colTitle

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => {  // add === for comparison
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener('click', () => {   //changed the click() to eventlistener
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Style the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { // from foreach to forEach
    
    if(btn.textContent === boardName) {
      btn.classList.add('active');
    }
    else {                              // added  .classList
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector('.column-div[data-status="${task.status}"]'); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div'; // change class name OR task-div
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement);  // insert taskElement that you are appending
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', (e) => {
    e.stopPropagation(); //added that
    toggleModal(false, elements.editTaskModal)});

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => {toggleSidebar(false)});
  elements.showSideBarBtn.addEventListener('click', () => {toggleSidebar(true)});

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  //create task button 
  //elements.createTaskBtn.addEventListener('click', ()=>{})

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none';  //fix this
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
   
    const task = {

      "title":  document.getElementById('title-input').value,
      "description": document.getElementById('desc-input').value,
      "status": document.getElementById('select-status').value,
      "board": elements.headerBoardName.textContent
    };

    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();  
      refreshTasksUI(); // refresh user interface
    }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar-div');
  if (show){
    sidebar.style.display = 'block'; // Show the sidebar
    elements.showSideBarBtn.style.display ='none'; //hide the sidebar button

  } else{
    sidebar.style.display = 'none'; // hide the sidebar
    elements.showSideBarBtn.style.display ='block'; //show the sidebar button
  }

}

function toggleTheme() {
  const isLightTheme = elements.themeSwitch.checked;
  if (isLightTheme) {
    localStorage.setItem('light-theme', 'enabled' ); // set to light mode
  } else{
    localStorage.setItem('light-theme','disabled'); // set back to default
  }

  document.body.classList.toggle('light-theme', isLightTheme); //Toggle the 'light-theme' class
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  const title = document.getElementById('edit-task-title-input');
  const description = document.getElementById('edit-task-desc-input');
  const status = document.getElementById('edit-select-status');

  title.value = task.title;
  description.value= task.description;
  status.value = task.status;

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
   
  //remove existing event listeners
  saveTaskChangesBtn.replaceWith(saveTaskChangesBtn.cloneNode(true));
  deleteTaskBtn.replaceWith(deleteTaskBtn.cloneNode(true));

  // Re-select the buttons after replacing
  const newSaveTaskChangesBtn = document.getElementById('save-task-changes-btn');
  const newDeleteTaskBtn = document.getElementById('delete-task-btn');


  // Call saveTaskChanges upon click of Save Changes button
  newSaveTaskChangesBtn.addEventListener('click', function (e){
    e.stopPropagation();  //prevent same event being called
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
    elements.filterDiv.style.display = 'none';
    refreshTasksUI();
  
  });

  // Delete task using a helper function and close the task modal
 
  newDeleteTaskBtn.addEventListener('click', function (e){
    e.stopPropagation();
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal); //close modal
    elements.filterDiv.style.display = 'none'; 
    refreshTasksUI(); // refresh user interface

  });
  

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
  elements.filterDiv.style.display = 'block'; 
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitleInput = document.getElementById('edit-task-title-input').value;
  const updatedDescriptionInput = document.getElementById('edit-task-desc-input').value;
  const updatedStatusInput = document.getElementById('edit-select-status').value;
  

  // Create an object with the updated task details
  const updates = {};
  //checking for only updated items
  if (updatedTitleInput !== '') {updates.title = updatedTitleInput;}
  if (updatedDescriptionInput !== '') {updates.description = updatedDescriptionInput;}
  if (updatedStatusInput !== '') {updates.status = updatedStatusInput;}
  

  // Update task using a helper functoin
  patchTask(taskId,updates);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}