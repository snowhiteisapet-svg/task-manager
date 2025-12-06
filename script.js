
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const clearAllBtn = document.getElementById('clearAll');
const exportBtn = document.getElementById('exportBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const themeToggle = document.getElementById('themeToggle');
const editModal = document.getElementById('editModal');
const modalClose = document.getElementById('modalClose');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalSaveBtn = document.getElementById('modalSaveBtn');
const editTaskInput = document.getElementById('editTaskInput');
const editCategorySelect = document.getElementById('editCategorySelect');
const editPrioritySelect = document.getElementById('editPrioritySelect');
const editNotesInput = document.getElementById('editNotesInput');

const dingSound = document.getElementById('dingSound');
const addSound = document.getElementById('addSound');

let tasks = [];
let currentFilter = 'all';
let currentEditId = null;

function init() {
  updateDate();
  renderTasks();
  setupEventListeners();
  loadTheme();
  showNotification('Welcome to Task Manager', 'success');
}

function setupEventListeners() {
  addBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  clearCompletedBtn.addEventListener('click', clearCompleted);
  clearAllBtn.addEventListener('click', clearAll);
  exportBtn.addEventListener('click', exportTasks);
  
  searchInput.addEventListener('input', renderTasks);
  sortSelect.addEventListener('change', renderTasks);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      setFilter(filter);
    });
  });
  
  themeToggle.addEventListener('click', toggleTheme);
  
  modalClose.addEventListener('click', closeModal);
  modalCancelBtn.addEventListener('click', closeModal);
  modalSaveBtn.addEventListener('click', saveEditedTask);
  
  editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeModal();
  });
}

function toggleTheme() {
  document.body.classList.toggle('night-mode');
  
  const icon = themeToggle.querySelector('i');
  if (document.body.classList.contains('night-mode')) {
    icon.className = 'fas fa-sun';
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    icon.className = 'fas fa-moon';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Night Mode';
  }
}

function loadTheme() {
  // Default to light mode
}

function updateDate() {
  const dateDisplay = document.getElementById('dateDisplay');
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  dateDisplay.textContent = now.toLocaleDateString('en-US', options);
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    showNotification('Please enter a task', 'warning');
    return;
  }
  
  const task = {
    id: Date.now(),
    text: text,
    category: categorySelect.value,
    priority: prioritySelect.value,
    completed: false,
    notes: '',
    createdAt: new Date().toISOString()
  };
  
  tasks.unshift(task);
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
  
  addSound.currentTime = 0;
  addSound.play().catch(e => console.log('Audio error:', e));
  
  showNotification('Task added successfully', 'success');
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
    
    if (task.completed) {
      dingSound.currentTime = 0;
      dingSound.play().catch(e => console.log('Audio error:', e));
      showNotification('Task completed', 'success');
    }
  }
}

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    currentEditId = id;
    editTaskInput.value = task.text;
    editCategorySelect.value = task.category;
    editPrioritySelect.value = task.priority;
    editNotesInput.value = task.notes || '';
    editModal.classList.add('show');
  }
}

function closeModal() {
  editModal.classList.remove('show');
  currentEditId = null;
}

function saveEditedTask() {
  const task = tasks.find(t => t.id === currentEditId);
  if (task) {
    task.text = editTaskInput.value.trim();
    task.category = editCategorySelect.value;
    task.priority = editPrioritySelect.value;
    task.notes = editNotesInput.value.trim();
    
    renderTasks();
    closeModal();
    showNotification('Task updated successfully', 'success');
  }
}

function deleteTask(id) {
  if (confirm('Are you sure you want to delete this task?')) {
    tasks = tasks.filter(task => task.id !== id);
    renderTasks();
    showNotification('Task deleted', 'danger');
  }
}

function clearCompleted() {
  const completedCount = tasks.filter(t => t.completed).length;
  if (completedCount === 0) {
    showNotification('No completed tasks to clear', 'warning');
    return;
  }
  
  if (confirm(`Clear ${completedCount} completed tasks?`)) {
    tasks = tasks.filter(task => !task.completed);
    renderTasks();
    showNotification(`Cleared ${completedCount} completed tasks`, 'success');
  }
}

function clearAll() {
  if (tasks.length === 0) {
    showNotification('No tasks to clear', 'warning');
    return;
  }
  
  if (confirm('Are you sure you want to delete all tasks?')) {
    tasks = [];
    renderTasks();
    showNotification('All tasks cleared', 'danger');
  }
}

function exportTasks() {
  if (tasks.length === 0) {
    showNotification('No tasks to export', 'warning');
    return;
  }
  
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tasks_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  showNotification('Tasks exported successfully', 'success');
}

function setFilter(filter) {
  currentFilter = filter;
  
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
  
  renderTasks();
}

function sortTasks(tasksToSort) {
  const sortMethod = sortSelect.value;
  const sorted = [...tasksToSort];
  
  switch(sortMethod) {
    case 'priority':
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
    case 'category':
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;
    case 'status':
      sorted.sort((a, b) => a.completed - b.completed);
      break;
    case 'date':
    default:
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  return sorted;
}

function renderTasks() {
  let filteredTasks = tasks;
  
  // Apply priority filter
  if (currentFilter !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === currentFilter);
  }
  
  // Apply search filter
  const searchTerm = searchInput.value.toLowerCase().trim();
  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => 
      task.text.toLowerCase().includes(searchTerm) ||
      task.category.toLowerCase().includes(searchTerm) ||
      (task.notes && task.notes.toLowerCase().includes(searchTerm))
    );
  }
  
  // Sort tasks
  filteredTasks = sortTasks(filteredTasks);
  
  updateStats();
  
  const emptyState = document.getElementById('emptyState');
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
    taskList.innerHTML = '';
    return;
  }
  emptyState.style.display = 'none';
  
  taskList.innerHTML = '';
  filteredTasks.forEach(task => {
    const taskItem = createTaskElement(task);
    taskList.appendChild(taskItem);
  });
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
  
  const date = new Date(task.createdAt);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  li.innerHTML = `
    <div class="task-checkbox ${task.completed ? 'checked' : ''}"></div>
    <div class="task-content">
      <span class="task-text">${task.text}</span>
      <div class="task-meta">
        <span class="task-category">${task.category}</span>
        <span class="task-priority">${task.priority}</span>
        <span class="task-date">${dateStr}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="edit-btn">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-btn">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
  
  const checkbox = li.querySelector('.task-checkbox');
  const editBtn = li.querySelector('.edit-btn');
  const deleteBtn = li.querySelector('.delete-btn');
  
  checkbox.addEventListener('click', () => toggleTask(task.id));
  editBtn.addEventListener('click', () => openEditModal(task.id));
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  
  return li;
}

function updateStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks;
  
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  document.getElementById('progressFill').style.width = percentage + '%';
  document.getElementById('progressText').textContent = percentage + '%';
}

function showNotification(message, type = 'success') {
  notificationText.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

init();
 