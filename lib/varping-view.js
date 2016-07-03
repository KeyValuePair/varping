'use babel';

import request from "request";

const compare_substr = function(pattern, target) {
    if(pattern.length > target.length) {
        return false;
    }

    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] !== target[i]) {
            return false;
        }
    }

    return true;
}

let getRelatedStrings = function(pattern, targets) {
    if (pattern.length == 0)
        return [];

    let result = [];
    for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        if (compare_substr(pattern, target)) {
            result.push(target);
        }
    }

    return result;
};

export default class VarpingView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('our-wordcount');

    const getWordForm = document.createElement('form');
    const inputArea = document.createElement('input');
    inputArea.type = "text";
    inputArea.id = "inputArea";
    inputArea.tabindex = -1;
    inputArea.classList.add('native-key-bindings');
    getWordForm.classList.add('varping_form');
    inputArea.oninput = function() {
        view.clearAllTags();
        /*
        let targets = ['Kasdf', 'Kanan', 'Kotnda'];
        view.addStrings(getRelatedStrings(inputArea.value, targets));
        */
        request('http://192.168.0.16:9200/refined_words/javascript/_search?q=term:r*&sort=ttf:desc&pretty=true',
        function(error, response, body) {
            let targets = [];

            if (!error && response.statusCode == 200) {
                let obj = JSON.parse(body);

                for (let i = 0; i < obj["hits"]["total"]; i++) {
                    targets.push(obj["hits"]["hits"][i]["_source"]["term"]);
                     console.log("terms: " + obj["hits"]["hits"][i]["_source"]["term"]);
                }

                console.log("targets: " + targets);

                view.addStrings(getRelatedStrings(inputArea.value, targets));
            }
        });

        if (view.addedElements.length > 0)
            view.addedElements[view.currentIndex].classList.add('varping_active');
    };

    this.inputArea = inputArea;
    this.currentIndex = 0;

    const setButton = document.createElement('button');

    let view = this;

    setButton.onclick = function() {
        let editor = atom.workspace.getActiveTextEditor();
        const start = editor.getCursorBufferPosition().column;

        for (let i = 0; i < view.currentOffset; ++i) {
            editor.moveLeft();
        }

        for (let i = 0; i < view.inputArea.value.length; ++i) {
            editor.moveRight();
            editor.backspace();
        }

        editor.insertText(view.addedElements[view.currentIndex].textContent);

        view.modalPanel.hide();
    };

    setButton.textContent = 'set'

    getWordForm.appendChild(inputArea);
    getWordForm.appendChild(setButton);

    this.element.appendChild(getWordForm);

    this.addedElements = [];

  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  clearAllTags() {
      // TODO: Clear things added by "addStrings()"
      for (let i = 0; i < this.addedElements.length; i++){
        this.element.removeChild(this.addedElements[i]);
      }
      this.addedElements = [];
  }

  addStrings(entrys) {
      for (let i = 0; i < entrys.length; i++) {
          const message = document.createElement('div');
          message.textContent = entrys[i];
          message.classList.add('varping_entry');
          this.element.appendChild(message);

          this.addedElements.push(message);
      }
  }
}
