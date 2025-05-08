function loadLessons() {
    console.log("loadLessons is running...");
    fetch('lesson-content.json')
        .then(res => res.json())
        .then(data => {
            const basics = data.find(topic => topic.title === "Basics");
            if (!basics || !basics.subtopics) {
                console.error("No 'Basics' section found in content.json.");
                return;
            }

            const lessonMenu = document.getElementsByClassName('lesson-menu')[0];
            const lessonMenuList = document.getElementsByClassName('lesson-menu-list')[0];
            const lessonContent = document.getElementsByClassName('lesson-content')[0];

            if (!lessonMenu || !lessonMenuList || !lessonContent) {
                console.error("Required DOM elements not found:", {
                    lessonMenu,
                    lessonMenuList,
                    lessonContent
                });
                return;
            }

            basics.subtopics.forEach(item => {
                const newLessonItem = document.createElement('li');
                newLessonItem.className = "title_underline";
                newLessonItem.innerText = item.title;
                
                newLessonItem.addEventListener('click', () => {
                    lessonContent.innerHTML = `<h2>JavaScript ${item.title}</h2>`;
                    renderSections(item.sections, lessonContent);
                });

                lessonMenuList.appendChild(newLessonItem);
            });

            lessonMenu.appendChild(lessonMenuList);
        })
        .catch(err => {
            console.error('Failed to load content:', err);
            const lessonContent = document.getElementsByClassName('lesson-content')[0];
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

    function renderSections(sections, container) {
        if (!Array.isArray(sections)) return;

        sections.forEach(section => {
            switch (section.type) {
                case 'subheading':
                    const h3 = document.createElement('h3');
                    h3.textContent = section.text;
                    container.appendChild(h3);
                    break;

                case 'text':
                    const p = document.createElement('p');
                    p.textContent = section.content;
                    container.appendChild(p);
                    break;

                case 'list':
                    const ul = document.createElement('ul');
                    section.items.forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item;
                        li.className = ".lesson-content ul";
                        ul.appendChild(li);
                    });
                    container.appendChild(ul);
                    break;
                    
                case 'code-block':
                    const divCodeBlock = document.createElement('div');
                    divCodeBlock.className = "code-block-container";
                    const pre = document.createElement('pre');
                    const code = document.createElement('code');
                    code.className = `language-${section.language || 'js'}`;
                    code.textContent = section.code;
                    code.className = "code-block";
                    pre.appendChild(code);
                    container.appendChild(pre);
                    break;

                case 'blockquote':
                    const blockquote = document.createElement('blockquote');
                    blockquote.textContent = section.blockquote;
                    blockquote.className = "blockquote";
                    container.appendChild(blockquote);
                    break;

                default:
                    console.warn("Unknown section type:", section.type);
            }
        });
    }
}