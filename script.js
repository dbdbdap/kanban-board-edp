// ----------------------
// SELECT ELEMENTS
// ----------------------
const lists = document.querySelectorAll(".list");
const taskInput = document.getElementById("taskInput");
const taskCategoryInput = document.getElementById("taskCategoryInput");
const taskListSelect = document.getElementById("taskListSelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const categorySelect = document.getElementById("categorySelect");

let cardIdCounter = 1;

// ----------------------
// DRAG & DROP FUNCTIONS
// ----------------------
function dragStart(e) {
    e.dataTransfer.setData("text/plain", this.id);
}

function dragEnd() {
    saveAllTasks(); // save positions after drag
}

function dragOver(e) {
    e.preventDefault();
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add("over");
}

function dragLeave(e) {
    this.classList.remove("over");
}

function dragDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const card = document.getElementById(id);
    this.appendChild(card);
    this.classList.remove("over");
    saveAllTasks(); // save positions after drop
}

// Add drag events to all lists
lists.forEach(list => {
    list.addEventListener("dragover", dragOver);
    list.addEventListener("dragenter", dragEnter);
    list.addEventListener("dragleave", dragLeave);
    list.addEventListener("drop", dragDrop);
});

// ----------------------
// CREATE NEW CARD
// ----------------------
addTaskBtn.addEventListener("click", () => {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const categoryText = taskCategoryInput.value.trim();
    const listId = taskListSelect.value;

    createCard(taskText, categoryText, listId);
    saveAllTasks(); // save after adding

    // Clear inputs
    taskInput.value = "";
    taskCategoryInput.value = "";
});

// ----------------------
// CREATE CARD FUNCTION
// ----------------------
function createCard(title, category, listId, id = null) {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("draggable", "true");
    card.id = id ? id : `card${cardIdCounter++}`;

    // Title
    const titleSpan = document.createElement("span");
    titleSpan.textContent = title;
    card.appendChild(titleSpan);

    // Optional category
    if (category) {
        const catSpan = document.createElement("span");
        catSpan.classList.add("category");
        catSpan.textContent = category;
        card.appendChild(catSpan);

        // Update category dropdown dynamically
        updateCategoryOptions(category);
    }

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => editCard(card));
    card.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", () => {
        card.remove();
        saveAllTasks();
    });
    card.appendChild(deleteBtn);

    // Drag events
    card.addEventListener("dragstart", dragStart);
    card.addEventListener("dragend", dragEnd);

    // Append to list
    document.getElementById(listId).appendChild(card);
}

// ----------------------
// EDIT CARD FUNCTION
// ----------------------
function editCard(card) {
    const titleSpan = card.querySelector("span:not(.category)");
    const categorySpan = card.querySelector(".category");

    const newTitle = prompt("Edit task title:", titleSpan.textContent);
    if (newTitle !== null && newTitle.trim() !== "") {
        titleSpan.textContent = newTitle.trim();
    }

    const newCategory = prompt(
        "Edit category (optional):",
        categorySpan ? categorySpan.textContent : ""
    );

    if (newCategory !== null) {
        if (newCategory.trim() === "") {
            if (categorySpan) categorySpan.remove();
        } else {
            if (categorySpan) {
                categorySpan.textContent = newCategory.trim();
            } else {
                const newCatSpan = document.createElement("span");
                newCatSpan.classList.add("category");
                newCatSpan.textContent = newCategory.trim();
                card.insertBefore(newCatSpan, card.querySelector("button"));
            }
            // Update dropdown dynamically
            updateCategoryOptions(newCategory.trim());
        }
    }

    saveAllTasks(); // save changes
}

// ----------------------
// LOCAL STORAGE FUNCTIONS
// ----------------------
function saveAllTasks() {
    const tasks = [];
    lists.forEach(list => {
        const listId = list.id;
        list.querySelectorAll(".card").forEach(card => {
            const title = card.querySelector("span:not(.category)").textContent;
            const categoryEl = card.querySelector(".category");
            const category = categoryEl ? categoryEl.textContent : "";
            tasks.push({ id: card.id, title, category, listId });
        });
    });
    localStorage.setItem("kanbanTasks", JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];
    tasks.forEach(task => {
        createCard(task.title, task.category, task.listId, task.id);
    });

    // Update cardIdCounter to avoid duplicate IDs
    if (tasks.length > 0) {
        const lastId = Math.max(...tasks.map(t => parseInt(t.id.replace("card", ""))));
        cardIdCounter = lastId + 1;
    }
}

// Load tasks on page load
document.addEventListener("DOMContentLoaded", loadTasks);

const taskSearch = document.getElementById("taskSearch");

taskSearch.addEventListener("input", () => {
    const query = taskSearch.value.toLowerCase();

    lists.forEach(list => {
        list.querySelectorAll(".card").forEach(card => {
            const title = card.querySelector("span:not(.category)").textContent.toLowerCase();
            const categoryEl = card.querySelector(".category");
            const category = categoryEl ? categoryEl.textContent.toLowerCase() : "";

            // Show if title or category contains the query
            if (title.includes(query) || category.includes(query)) {
                card.style.display = "flex"; // show
            } else {
                card.style.display = "none"; // hide
            }
        });
    });
});

// Add a category to the dropdown if it doesn't exist yet
function updateCategoryOptions(newCategory) {
    if (!newCategory) return;
    const options = Array.from(categorySelect.options).map(opt => opt.value);
    if (!options.includes(newCategory)) {
        const option = document.createElement("option");
        option.value = newCategory;
        option.textContent = newCategory;
        categorySelect.appendChild(option);
    }
}

// Filter tasks when category is selected
categorySelect.addEventListener("change", () => {
    const selected = categorySelect.value.toLowerCase();

    lists.forEach(list => {
        list.querySelectorAll(".card").forEach(card => {
            const categoryEl = card.querySelector(".category");
            const category = categoryEl ? categoryEl.textContent.toLowerCase() : "";

            // Show if matches or if "All Categories" selected
            if (!selected || category === selected) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    });
});