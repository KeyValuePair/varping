'use babel';

import VarpingView from './varping-view';
import { CompositeDisposable } from 'atom';

function findCurrentWord(str, cursor)
{
    // if (str[cursor] == ' '
    //     || str[cursor] == '.'
    //     || str[cursor] == '('
    //     || str[cursor] == ')') // TODO: Change to compare with special characters(except "_")
    //     return null;

    const splittedWords = str.split(/[\(\)\;\:\[\]\.\,\'\"\s]/);

    let offset = 0;
    const space_indices = [];
    for (let i = 0; i < splittedWords.length; i++) {
        space_indices.push({ "start" : offset, "end" : offset + splittedWords[i].length });
        offset += splittedWords[i].length + 1;
    }

    for (let i = 0; i < space_indices.length; i++) {
        if (space_indices[i].start <= cursor
            && space_indices[i].end >= cursor)
        {

            return { "splittedWord" : splittedWords[i],
                     "offset": cursor - space_indices[i].start };
        }
    }

    return null;
}

export default {

  varpingView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.varpingView = new VarpingView(state.varpingViewState);

    this.modalPanel = atom.workspace.addModalPanel({
      item: this.varpingView.getElement(),
      visible: false
    });

    this.varpingView.modalPanel = this.modalPanel;

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'varping:toggle': () => this.toggle()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'varping:downward': () => this.downward()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'varping:upward': () => this.upward()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.varpingView.destroy();
  },

  serialize() {
    return {
      varpingViewState: this.varpingView.serialize()
    };
  },

  toggle() {
    if (this.modalPanel.isVisible()) {
        return (this.modalPanel.hide());
    } else {

        let editor = atom.workspace.getActiveTextEditor();

        let targetString = editor.lineTextForBufferRow(editor.getCursorBufferPosition().row);

        let pickedWord = findCurrentWord(targetString, editor.getCursorBufferPosition().column);
        if (pickedWord != null) {
            this.varpingView.inputArea.value = pickedWord.splittedWord;
            this.varpingView.currentOffset = pickedWord.offset;
        }

        this.varpingView.inputArea.oninput();

        return (this.modalPanel.show());
    }
},

  downward() {
      if (this.modalPanel.isVisible()) {
          const maxIndex = this.varpingView.addedElements.length;
          this.varpingView.currentIndex = (this.varpingView.currentIndex + 1) % maxIndex;

          this.varpingView.inputArea.oninput();
      }

  },

  upward() {
      if (this.modalPanel.isVisible()) {
          const maxIndex = this.varpingView.addedElements.length;
          this.varpingView.currentIndex = (this.varpingView.currentIndex - 1 + maxIndex) % maxIndex;

          this.varpingView.inputArea.oninput();
      }
  }

};
