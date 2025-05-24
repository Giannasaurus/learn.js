function loadLessons() {
    console.log("loadLessons is running...");

    fetch('test.json')
        .then(res => {
            console.log("Fetch response received:", res);
            return res.json();
        })
        .then(data => {
            console.log("Data fetched successfully:", data);

            const basics = data.find(topic => topic.title === "Basics");
            if (!basics || !basics.subtopics) {
                console.error("No 'Basics' section found in test.json.");
                return;
            }
            console.log("'Basics' section found:", basics);

            const lessonMenu = document.querySelector('.lesson-menu');
            const lessonMenuList = document.querySelector('.lesson-menu-list');
            const lessonContent = document.querySelector('.lesson-content');

            if (!lessonMenu || !lessonMenuList || !lessonContent) {
                console.error("Required DOM elements not found:", {
                    lessonMenu,
                    lessonMenuList,
                    lessonContent
                });
                return;
            }
            console.log("DOM elements found:", {
                lessonMenu,
                lessonMenuList,
                lessonContent
            });

            basics.subtopics.forEach(item => {
                console.log("Processing subtopic:", item);

                const newLessonItem = document.createElement('li');
                newLessonItem.innerHTML = `<li class="title_underline">${item.title}</li>`;
                
                newLessonItem.addEventListener('click', () => {
                    console.log(`Subtopic clicked: ${item.title}`);
                    lessonContent.innerHTML = `<h2>JavaScript ${item.title}</h2>`;
                    renderSections(item.sections, lessonContent);
                });

                lessonMenuList.appendChild(newLessonItem);
                console.log(`Subtopic added to menu: ${item.title}`);
            });

            lessonMenu.appendChild(lessonMenuList);
            console.log("Lesson menu updated successfully.");
        })
        .catch(err => {
            console.error('Failed to load content:', err);

            const lessonContent = document.querySelector('.lesson-content');
            if (lessonContent) {
                lessonContent.innerHTML = `
                    <div class="error-message">
                        <h2>⚠️ Oops! Failed to load lessons.</h2>
                        <p>${err.message}</p>
                        <p>Please check your connection or try again later.</p>
                    </div>
                `;
            }
        });
}

function renderSections(sections, container) {
    console.log("Rendering sections:", sections);

    if (!Array.isArray(sections)) {
        console.warn("No sections array provided.");
        return;
    }

    sections.forEach(block => {
        console.log("Processing section block:", block);

        switch (block.type) {
            case 'text':
                const p = document.createElement('p');
                p.innerHTML = block.content.map(part => {
                    if (typeof part === 'string') return part;
                    if (part.type === 'highlight') return `<span class="highlight">${part.text}</span>`;
                    if (part.type === 'tooltip') return `<span class="tooltip" title="${part.tip}">${part.word}</span>`;
                    return '';
                }).join('');
                container.appendChild(p);
                console.log("Text section rendered.");
                break;

            case 'code':
                const pre = document.createElement('pre');
                const code = document.createElement('code');
                code.className = `language-${block.language || 'js'}`;
                code.textContent = block.content;
                pre.appendChild(code);
                container.appendChild(pre);
                console.log("Code section rendered.");
                break;

            case 'bookmark':
                const btn = document.createElement('button');
                btn.className = 'bookmark';
                btn.dataset.id = block.id;
                btn.textContent = '🔖 Bookmark';
                container.appendChild(btn);
                console.log("Bookmark section rendered.");
                break;

            default:
                console.warn("Unknown section type:", block.type);
        }
    });
}