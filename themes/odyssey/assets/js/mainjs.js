{{- $TextareaAutoResize    := resources.Get "/js/TextareaAutoResize.js" -}}

import TextareaAutoResize from {{ $TextareaAutoResize.RelPermalink }}

// import TextareaAutoResize from "./TextareaAutoResize.js";

document.addEventListener('DOMContentLoaded', function() {
    const textareaElements = document.querySelectorAll('textarea');
    for (const textareaElement of textareaElements) {
        new TextareaAutoResize( textareaElement );
    }
});