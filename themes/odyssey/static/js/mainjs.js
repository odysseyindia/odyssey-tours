import TextareaAutoResize from "./js/TextareaAutoResize.js";

document.addEventListener('DOMContentLoaded', function() {
    const textareaElements = document.querySelectorAll('textarea');
    for (const textareaElement of textareaElements) {
        new TextareaAutoResize( textareaElement );
    }
});