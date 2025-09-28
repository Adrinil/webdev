// To-Do List Application

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const clearAllBtn = document.getElementById('clear-all');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} data-idx="${idx}">
      <span>${todo.text}</span>
      <button class="delete-btn" data-idx="${idx}">&times;</button>
    `;
    todoList.appendChild(li);
  });
}

todoForm.onsubmit = function(e) {
  e.preventDefault();
  const value = todoInput.value.trim();
  if (!value) return;
  todos.push({ text: value, completed: false });
  saveTodos();
  todoInput.value = '';
  renderTodos();
};

todoList.onclick = function(e) {
  if (e.target.classList.contains('delete-btn')) {
    const idx = e.target.getAttribute('data-idx');
    todos.splice(idx, 1);
    saveTodos();
    renderTodos();
  }
  if (e.target.classList.contains('todo-checkbox')) {
    const idx = e.target.getAttribute('data-idx');
    todos[idx].completed = !todos[idx].completed;
    saveTodos();
    renderTodos();
  }
};

clearAllBtn.onclick = function() {
  if (confirm('Clear all tasks?')) {
    todos = [];
    saveTodos();
    renderTodos();
  }
};

// Initial render
renderTodos();