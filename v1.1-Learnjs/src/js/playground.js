// CodeMirror
let htmlEditor, cssEditor, jsEditor;

document.addEventListener("DOMContentLoaded", function () {
    htmlEditor = CodeMirror.fromTextArea(document.getElementById("html-code"), {
        mode: "text/html",
        lineNumbers: true,
        theme: "default",
        lineWrapping: true,
        tabSize: 2,
    });

    cssEditor = CodeMirror.fromTextArea(document.getElementById("css-code"), {
        mode: "text/css",
        lineNumbers: true,
        theme: "default",
        lineWrapping: true,
        tabSize: 2,
    });

    jsEditor = CodeMirror.fromTextArea(document.getElementById("js-code"), {
        mode: "text/javascript",
        lineNumbers: true,
        theme: "default",
        lineWrapping: true,
        tabSize: 2,
    });
    console.log("Line Numbers Enabled:", htmlEditor.getOption("lineNumbers"));

    // Trigger the run function when any editor content changes
    htmlEditor.on("change", runCode);
    cssEditor.on("change", runCode);
    jsEditor.on("change", runCode);
});

function runCode() {
    let htmlCode = htmlEditor.getValue();
    let cssCode = cssEditor.getValue();
    let jsCode = jsEditor.getValue();
    let output = document.getElementById("output");

    output.contentDocument.body.innerHTML = htmlCode;
    let style = document.createElement("style");
    style.textContent = cssCode;
    output.contentDocument.head.appendChild(style);

    let script = output.contentDocument.createElement("script");
    script.textContent = jsCode;
    output.contentDocument.head.appendChild(script);
}