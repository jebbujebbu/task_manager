const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const filterInput = document.getElementById('filterInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const taskList = document.getElementById('taskList');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const priorityOrder = { high: 1, normal: 2, low: 3 };

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Sort tasks by priority and due date
function sortTasks() {
  tasks.sort((a, b) => {
    // Sort by priority
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Sort by due date (nulls last)
    if (!a.dueDate && b.dueDate) return 1;
    if (a.dueDate && !b.dueDate) return -1;
    if (a.dueDate && b.dueDate) {
      const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
      if (dateDiff !== 0) return dateDiff;
    }

    // Sort alphabetically by task text
    return a.text.localeCompare(b.text);
});
}

// Render tasks on the page
function renderTasks(filter = '') {
    sortTasks();    
    taskList.innerHTML = '';

  tasks
    // Filter from anywhere inside the text
    //.filter(task => task.text.toLowerCase().includes(filter.toLowerCase()))
    // Filter from the beginning of the text
    .filter(task => task.text.toLowerCase().startsWith(filter.toLowerCase()))
    .forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'task';
        li.dataset.index = index;

        const spanText = document.createElement('span');
        spanText.className = 'task-text';
        spanText.textContent = task.text;
        spanText.setAttribute('tabindex', 0);

        const spanDue = document.createElement('span');
        spanDue.className = 'task-dueDate';
        spanDue.textContent = task.dueDate ? formatDateUS(task.dueDate) : 'No date';

        const spanPriority = document.createElement('span');
        spanPriority.className = 'task-priority';
        spanPriority.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

        // // Edit button
        // const editBtn = document.createElement('button');
        // editBtn.textContent = 'Edit';
        // editBtn.className = 'edit-btn';

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';

        li.appendChild(spanText);
        li.appendChild(spanDue);
        li.appendChild(spanPriority);
        // li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

// Add new task
addTaskBtn.addEventListener('click', () => {
  const text = taskInput.value.trim();
  const dueDate = dueDateInput.value || null;
  const priority = priorityInput.value;

  if (text === '') 
    return alert('Please enter a task');

  tasks.push({ text, dueDate, priority });
  saveTasks();
  renderTasks(filterInput.value);
  taskInput.value = '';
  dueDateInput.value = '';
  priorityInput.value = 'normal';
});

taskList.addEventListener('click', (e) => {
  const target = e.target;
  const index = target.parentElement.dataset.index;
  
  // Delete task
  if (target.classList.contains('delete-btn')) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(filterInput.value);
    return;
  }

  // Inline edit task text
  if (target.classList.contains('task-text')) {
    target.contentEditable = true;
    target.focus();
  }

  // Edit due date with input[type=date]
  if (target.classList.contains('task-dueDate')) {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = tasks[index].dueDate || '';
    input.style.minWidth = '110px';

    target.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
      tasks[index].dueDate = input.value || null;
      saveTasks();
      renderTasks(filterInput.value);
    });
  }

  // Edit priority with select dropdown
  if (target.classList.contains('task-priority')) {
    const select = document.createElement('select');
    select.className = 'edit-priority';
    
    ['high', 'normal', 'low'].forEach(p => {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p.charAt(0).toUpperCase() + p.slice(1);
      if (tasks[index].priority === p) option.selected = true;
      select.appendChild(option);
    });

    target.replaceWith(select);
    select.focus();

    select.addEventListener('blur', () => {
      tasks[index].priority = select.value;
      saveTasks();
      renderTasks(filterInput.value);
    });
  }
});

// Save edited task text on blur or Enter key
taskList.addEventListener('blur', (e) => {
  const target = e.target;
  if (target.classList.contains('task-text')) {
    target.contentEditable = false;
    const index = target.parentElement.dataset.index;
    const newText = target.textContent.trim();

    if (!newText) {
      alert('Task text cannot be empty');
      target.textContent = tasks[index].text;
    } else {
      tasks[index].text = newText;
      saveTasks();
      renderTasks(filterInput.value);
    }
  }
}, true);

taskList.addEventListener('keydown', (e) => {
  if (e.target.classList.contains('task-text') && e.key === 'Enter') {
    e.preventDefault();
    e.target.blur();
  }
});

// // Delete and Edit actions
// taskList.addEventListener('click', (e) => {
//   const index = e.target.parentElement.dataset.index;

//   if (e.target.classList.contains('delete-btn')) {
//     tasks.splice(index, 1);
//     saveTasks();
//     renderTasks(filterInput.value);
//   }

//   if (e.target.classList.contains('edit-btn')) {
//     const newText = prompt('Edit task:', tasks[index].text);
//     if (newText !== null) {
//       tasks[index].text = newText.trim();
//       saveTasks();
//       renderTasks(filterInput.value);
//     }
//   }
// });

// Filter tasks as you type
filterInput.addEventListener('input', (e) => {
  renderTasks(e.target.value);
});

// Clear all tasks button
clearAllBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all tasks?')) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

// Format date
function formatDateUS(isoDate) {
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year}`;
}


// Initial render
renderTasks();
