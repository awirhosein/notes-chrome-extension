const notesContainer = document.getElementById('notes');
const noteInput = document.getElementById('note-input');
const addButton = document.getElementById('add-note');

let notes = [];
let editingId = null;

chrome.storage.local.get(['notes'], (result) => {
    notes = result.notes || [];
    renderNotes();
});

function renderNotes() {
    notesContainer.innerHTML = '';

    notes.forEach((note) => {
        const element = document.createElement('div');

        element.className = 'bg-white p-3 rounded-lg shadow';

        element.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <p class="text-sm text-gray-800 whitespace-pre-wrap cursor-pointer" data-edit="${note.id}">${note.text}</p>

                <button class="text-red-500 hover:text-red-700 cursor-pointer" data-id="${note.id}">
                    ✕
                </button>
            </div>

            <p class="text-xs text-gray-400 mt-2">
                ${note.date}
            </p>
        `;

        notesContainer.appendChild(element);
    });
}

function addNote() {
    const text = noteInput.value.trim();
    if (!text) return;

    if (editingId !== null) {
        const note = notes.find(n => n.id === editingId);
        note.text = text;
        note.date = new Date().toLocaleString();
        editingId = null;
    } else {
        notes.unshift({
            id: crypto.randomUUID(),
            text,
            date: new Date().toLocaleString()
        });
    }

    noteInput.value = '';

    saveNotes();
    renderNotes();
}

function saveNotes() {
    chrome.storage.local.set({
        notes: notes
    });
}

function startEdit(note) {
    noteInput.value = note.text;
    editingId = note.id;
    noteInput.focus();
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);

    saveNotes();
    renderNotes();
}


addButton.addEventListener('click', addNote);

noteInput.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        addNote();
    }
});

notesContainer.addEventListener('click', (e) => {

    const deleteBtn = e.target.closest('[data-id]');
    if (deleteBtn) {
        deleteNote(deleteBtn.dataset.id);
        return;
    }

    const editEl = e.target.closest('[data-edit]');
    if (editEl) {
        const note = notes.find(n => n.id === editEl.dataset.edit);
        if (note) startEdit(note);
    }

});
