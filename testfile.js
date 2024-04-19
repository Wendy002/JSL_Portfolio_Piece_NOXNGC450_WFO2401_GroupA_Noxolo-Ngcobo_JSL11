// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, putTask, deleteTask} from "./utils/taskFunctions";
import { initialData } from "./initialData";

// TASK: Get elements from the DOM
const elements = {
    headerBoardName : document.getElementById('header-board-name'),
    columnDivs: document.querySelector('.column-div'),
    filterDiv: document.getElementById('filterDiv'),
    hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
    showSideBarBtn: document.getElementById('show-side-bar-btn'),
    themeSwitch: document.getElementById('switch'),
    createNewTaskBtn: document.getElementById('create-task-btn'),
    modalWindow: document.getElementById('new-task-modal-window'),
    editTaskModal: document.querySelector('.edit-task-modal-window')
    
  }

  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];

  function displayBoards(boards) {
    const boardsContainer = document.getElementById("container"); // change id to 'container'
    boardsContainer.innerHTML = ''; // Clears the container ***
    boards.forEach(board => {
      const boardElement = document.createElement("button");
      boardElement.textContent = board;
      boardElement.classList.add("board-btn");
      boardElement.addEventListener('click')  { 
        elements.headerBoardName.textContent = board;
        filterAndDisplayTasksByBoard(board);
        activeBoard = board //assigns active board
        localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
        styleActiveBoard(activeBoard)
      };
      boardsContainer.appendChild(boardElement);
    });
  
  }
