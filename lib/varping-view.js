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

    const setButton = document.createElement('button');

    let view = this;

    setButton.onclick = function() {
        view.clearAllTags();

        let targets = [];

        request("http://www.json-generator.com/api/json/get/bViVzEjwFu?indent=2",
        function(error, response, body) {
            if (!error && response.statusCode == 200) {
                let obj = JSON.parse(body);

                for (let i = 0; i < obj.length; i++) {
                    targets.push(obj[i]["_id"]);
                }

                view.addStrings(getRelatedStrings(inputArea.value, targets));

                inputArea.value = "";
            }
        });
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
          message.classList.add('message');
          this.element.appendChild(message);

          this.addedElements.push(message);
      }
  }
}
