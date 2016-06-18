'use babel';

import VarpingView from './varping-view';
import { CompositeDisposable } from 'atom';

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

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'varping:toggle': () => this.toggle()
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
        return (this.modalPanel.show());
    }
  }
};
