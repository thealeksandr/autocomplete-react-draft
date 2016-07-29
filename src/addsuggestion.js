import { Entity, Modifier, Editor, EditorState } from 'draft-js';

const addSuggestion = ({editorState, start, end, trigger, text}) => {
  const entityKey = Entity.create('MENTION', 'IMMUTABLE', "http://vk.com");
  const currentSelectionState = editorState.getSelection();
  const mentionTextSelection = currentSelectionState.merge({
    anchorOffset: start,
    focusOffset: end
  });

  let insertingContent = Modifier.replaceText(
    editorState.getCurrentContent(),
    mentionTextSelection,
    text, ['link', 'BOLD'],
    entityKey
  );

  const blockKey = mentionTextSelection.getAnchorKey();
  const blockSize = editorState.getCurrentContent().getBlockForKey(blockKey).getLength();
  if (blockSize === end) {
    insertingContent = Modifier.insertText(
      insertingContent,
      insertingContent.getSelectionAfter(),
      ' '
    );
  }

  const newEditorState = EditorState.push(
    editorState,
    insertingContent,
    'insert-mention'
  );

  return EditorState.forceSelection(newEditorState, insertingContent.getSelectionAfter());
};


export default addSuggestion;