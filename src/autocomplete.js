import {render} from 'react-dom';
import React from 'React';
import {Editor, EditorState} from 'draft-js';
import styles from './styles';
import * as triggers from './triggers';



export class AutocompleteEditor extends Editor {
  constructor(props) {
    super(props);
    this.autocompleteState = null;

    this.onChange = (editorState) => {
      const {
        onChange,
        onAutocompleteChange
      } = this.props;
      onChange(editorState);
      if (onAutocompleteChange) {
        window.requestAnimationFrame(() => {
          onAutocompleteChange(this.getAutocompleteState());
        });
      }
    };

    this.onArrow = (e, originalHandler, nudgeAmount) => {
      const {
        onAutocompleteChange
      } = this.props;
      let autocompleteState = this.getAutocompleteState(false);
      if (!autocompleteState) {
        if (originalHandler) {
          originalHandler(e);
        }
        return;
      }

      e.preventDefault();
      autocompleteState.selectedIndex += nudgeAmount;
      this.autocompleteState = autocompleteState;
      if (onAutocompleteChange) {
        onAutocompleteChange(autocompleteState);
      }
    };

    this.onUpArrow = (e) => {
      this.onArrow(e, this.props.onUpArrow, -1);
      const contentState = editorState.getCurrentContent();
    };

    this.onDownArrow = (e) => {
      this.onArrow(e, this.props.onDownArrow, 1);
    };


    this.onEscape = (e) => {
      const {
        onEscape,
        onAutocompleteChange
      } = this.props;

      if (!this.getAutocompleteState(false)) {
        if (onEscape) {
          onEscape(e);
        }
        return;
      }

      e.preventDefault();
      this.autocompleteState = null;

      if (onAutocompleteChange) {
        onAutocompleteChange(null);
      }
    };

    this.onTab = (e) => {
      this.commitSelection(e)
    };

    this.handleReturn = (e) => {
      return this.commitSelection(e);
    }

  }

  commitSelection(e) {
    const {
      onAutocompleteChange
    } = this.props;
    let autocompleteState = this.getAutocompleteState(false);
    if (!autocompleteState) {
      return false;
    }
    e.preventDefault();
    this.onMentionSelect();
    this.autocompleteState = null;

    if (onAutocompleteChange) {
      onAutocompleteChange(null);
    }
    return true;
  };

  onMentionSelect() {
    let autocompleteState = this.getAutocompleteState(false);
    const {
      editorState
    } = this.props;
    const insertState = this.getInsertState(autocompleteState.selectedIndex, autocompleteState.trigger);
    const {
      onInsert
    } = this.props;
    const newEditorState = onInsert(insertState);
    const {
      onChange
    } = this.props;
    onChange(newEditorState);
  };

  getInsertState(selectedIndex, trigger) {
    const {
      editorState
    } = this.props;
    const currentSelectionState = editorState.getSelection();
    const end = currentSelectionState.getAnchorOffset();
    const anchorKey = currentSelectionState.getAnchorKey();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(anchorKey);
    const blockText = currentBlock.getText();
    const start = blockText.substring(0, end).lastIndexOf(trigger);
    return {
      editorState,
      start,
      end,
      trigger,
      selectedIndex
    }
  }

  hasEntityAtSelection() {
    const {
      editorState
    } = this.props;

    const selection = editorState.getSelection();
    if (!selection.getHasFocus()) {
      return false;
    }

    const contentState = editorState.getCurrentContent();
    const block = contentState.getBlockForKey(selection.getStartKey());
    return !!block.getEntityAt(selection.getStartOffset() - 1);
  };

  getAutocompleteRange(trigger) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
      return null;
    }

    if (this.hasEntityAtSelection()) {
      return null;
    }

    const range = selection.getRangeAt(0);
    let text = range.startContainer.textContent;
    text = text.substring(0, range.startOffset);
    const index = text.lastIndexOf(trigger);
    if (index === -1) {
      return null;
    }
    text = text.substring(index);
    return {
      text,
      start: index,
      end: range.startOffset
    };
  };

  getAutocompleteState(invalidate = true) {
    if (!invalidate) {
      return this.autocompleteState;
    }

    var type = null;
    var trigger = null;
    const tagRange = this.getAutocompleteRange(triggers.TAG_TRIGGER);
    const personRange = this.getAutocompleteRange(triggers.PERSON_TRIGGER);
    if (!tagRange && !personRange) {
      this.autocompleteState = null;
      return null;
    }
    var range = null;
    if (!tagRange) {
      range = personRange;
      type = triggers.PERSON;
      trigger = triggers.PERSON_TRIGGER;
    }

    if (!personRange) {
      range = tagRange;
      type = triggers.TAG;
      trigger = triggers.TAG_TRIGGER;
    }

    if (!range) {
      range = tagRange.start > personRange.start ? tagRange : personRange;
      type = tagRange.start > personRange.start ? triggers.TAG : triggers.PERSON;
      trigger = tagRange.start > personRange.start ? triggers.TAG_TRIGGER : triggers.PERSON_TRIGGER;
    }

    const tempRange = window.getSelection().getRangeAt(0).cloneRange();
    tempRange.setStart(tempRange.startContainer, range.start);

    const rangeRect = tempRange.getBoundingClientRect();
    let [left, top] = [rangeRect.left, rangeRect.bottom];

    this.autocompleteState = {
      trigger,
      type,
      left,
      top,
      text: range.text,
      selectedIndex: 0
    };
    return this.autocompleteState;
  };


  render() {
    const {
      onChange,
      editorState,
      onEscape,
      onUpArrow,
      onDownArrow,
      onAutocompleteChange,
    } = this.props;

    return ( 
      < Editor customStyleMap = {styles}
      editorState = {editorState}
      handleReturn = {this.handleReturn}
      onChange = {this.onChange}
      onEscape = {this.onEscape}
      onUpArrow = {this.onUpArrow}
      onDownArrow = {this.onDownArrow}
      onTab = {this.onTab}
      />
    );
  }
};