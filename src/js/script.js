async function loadLessonMenu() {
    const lessonMenu = document.querySelector('.lesson-menu-list');
    if (!lessonMenu) {
        console.error("Lesson menu container not found");
        showError("Lesson menu container not found");
        return;
    }
    
    try {
        const response = await fetch('/data/lesson-index.json');
        if (!response.ok) throw new Error("Failed to load lesson index");
        
        const lessonIndex = await response.json();
        lessonMenu.innerHTML = '';

        // Dynamically create menu items
        Object.entries(lessonIndex).forEach(([category, lessons]) => {
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            lessonMenu.appendChild(categoryHeader);

            lessons.forEach(lesson => {
                const item = document.createElement('li');
                item.textContent = lesson.title;
                item.classList.add('title-underline');
                item.dataset.file = lesson.file;

                // Click event to load the lesson
                item.addEventListener('click', () => loadLessonContent(item.dataset.file));
                lessonMenu.appendChild(item);
            });
        });
    } catch (err) {
        console.error("Error loading lesson menu:", err);
        showError("Failed to load lesson menu. Please try again later.");
    }
}

async function loadLessonContent(file) {
    try {
        const response = await fetch(`/data/${file}`);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        const lessonData = await response.json();
        renderLesson(lessonData);
    } catch (err) {
        console.error("Error loading lesson content:", err);
        showError(`Failed to load lesson content. Please try again later.`);
    }
}

function renderLesson(lesson) {
    if (!lesson || typeof lesson !== 'object') {
        console.error("Invalid lesson data:", lesson);
        showError("Invalid lesson data");
        return;
    }

    if (!lesson.title || !Array.isArray(lesson.sections)) {  // Changed condition
        console.error("Incomplete lesson data:", lesson);
        showError("Incomplete lesson data");
        return;
    }

    const lessonContent = document.querySelector('.lesson-content');
    if (!lessonContent) {
        console.error("Lesson content container not found");
        return;
    }

    // Clear previous content
    lessonContent.innerHTML = '';

    // Add title
    const titleElement = document.createElement('h2');
    titleElement.textContent = lesson.title;
    lessonContent.appendChild(titleElement);

    // Create container for sections
    const sectionContainer = document.createElement('div');
    sectionContainer.className = 'lesson-sections';
    lessonContent.appendChild(sectionContainer);

    // Render sections
    renderSections(lesson.sections, sectionContainer);
}

function renderSections(sections, container) {
    if (!Array.isArray(sections)) return;

    sections.forEach(section => {
        switch (section.type) {
            case 'heading-2':
                const h3 = document.createElement('h3');
                h3.textContent = section.text;
                h3.className = "section-heading-2";
                container.appendChild(h3);
                break;

            case 'heading-3':
                const h4 = document.createElement('h4');
                h4.textContent = section.text;
                h4.className = "section-heading-3";
                container.appendChild(h4);
                break;

            case 'heading-4':
                const h5 = document.createElement('h5');
                h5.textContent = section.text;
                h5.className = "section-heading-4";
                container.appendChild(h5);
                break;

            case 'text':
                const p = document.createElement('p');
                p.textContent = section.content;
                p.className = "section-text";
                container.appendChild(p);
                break;

            case 'unordered-list':
                const ul = document.createElement('ul');
                section.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ul.appendChild(li);
                });
                ul.className = "section-list";
                container.appendChild(ul);
                break;

            case 'ordered-list':
                const ol = document.createElement('ol');
                section.items.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    ol.appendChild(li);
                });
                ol.className = "section-list";
                container.appendChild(ol);
                break;

            case 'code-block':
                const pre = document.createElement('pre');
                pre.className = 'code-block-wrapper';
                
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.addEventListener('click', () => {
                    navigator.clipboard.writeText(section.code);
                });

                const code = document.createElement('code');
                code.className = `language-${section.language || 'javascript'}`;
                code.textContent = section.code;

                pre.appendChild(copyButton);
                pre.appendChild(code);
                container.appendChild(pre);
                
                Prism.highlightElement(code);
                break;

            case 'code-inline':
                const codeInline = document.createElement('code');
                codeInline.textContent = section.code;
                codeInline.className = "code-inline";
                container.appendChild(codeInline);
                break;

            case 'blockquote':
                const blockquote = document.createElement('blockquote');
                blockquote.className = "section-blockquote";

                if (section.text) {
                    const header = document.createElement('strong');
                    header.textContent = section.text;
                    blockquote.appendChild(header);
                }

                if (Array.isArray(section.content)) {
                    section.content.forEach(item => {
                        if (item.type === 'ordered-list') {
                            const listElement = document.createElement('ol');
                            listElement.className = 'blockquote-ordered-list';

                            item.items.forEach(listItem => {
                                const li = document.createElement('li');
                                li.textContent = listItem;
                                listElement.appendChild(li);
                            });
                            blockquote.appendChild(listElement);
                        } else {
                            const listElement = document.createElement('ul');
                            listElement.className = 'blockquote-unordered-list';
                            
                        }
                    });
                } else {
                    const p = document.createElement('p');
                    p.textContent = section.content;
                    blockquote.appendChild(p);
                }
                
                container.appendChild(blockquote);
                break;

            case 'table':
                const table = document.createElement('table');
                table.className = 'lesson-table';

                // Create table header
                if (section.headers) {
                    const thead = document.createElement('thead');
                    const headerRow = document.createElement('tr');
                    section.headers.forEach(header => {
                        const th = document.createElement('th');
                        th.textContent = header;
                        headerRow.appendChild(th);
                    });
                    thead.appendChild(headerRow);
                    table.appendChild(thead);
                }

                // Create table body
                if (section.rows) {
                    const tbody = document.createElement('tbody');
                    section.rows.forEach(row => {
                        const tr = document.createElement('tr');
                        row.forEach(cell => {
                            const td = document.createElement('td');
                            td.textContent = cell;
                            tr.appendChild(td);
                        });
                        tbody.appendChild(tr);
                    });
                    table.appendChild(tbody);
                }

                container.appendChild(table);
                break;

            case 'image':
                const img = document.createElement('img');
                img.src = section.src;
                img.alt = section.alt || '';
                img.className = "lesson-image";
                container.appendChild(img);
                break;

            default:
                console.warn("Unknown section type:", section.type);
        }
    });
}

function showError(message) {
    const lessonContent = document.querySelector('.lesson-content');
    lessonContent.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", loadLessonMenu);

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});