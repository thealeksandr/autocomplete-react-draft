import {Entity, Modifier, Editor, EditorState} from 'draft-js';
import {render} from 'react-dom';
import React from 'React';
import {AutocompleteEditor} from './autocomplete';
import SuggestionList from './suggestions';
import styles from './styles'
import {normalizeIndex, filterArray} from './utils';
import * as triggers from './triggers';
import * as data from './data';
import addSuggestion from './addsuggestion';



var filteredArrayTemp;

class AutocompleteInput extends React.Component {

  constructor() {
    super();
    this.state = {
      editorState: EditorState.createEmpty(),
      autocompleteState: null,
    };

    this.onChange = (editorState) => this.setState({
      editorState
    });

    this.onAutocompleteChange = (autocompleteState) => this.setState({
      autocompleteState
    });

    this.onInsert = (insertState) => {
      if (!filteredArrayTemp) {
        return null;
      }
      const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
      insertState.text = insertState.trigger + filteredArrayTemp[index];
      return addSuggestion(insertState);
    };

  }


  renderAutocomplete() {
    const {
      autocompleteState,
      onSuggestionClick
    } = this.state;
    if (!autocompleteState) {
      return null;
    }
    filteredArrayTemp = this.getFilteredArray(autocompleteState.type, autocompleteState.text);
    autocompleteState.array = filteredArrayTemp;
    autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
    return <SuggestionList suggestionsState = {
      autocompleteState
    }
    />;
  };

  getFilteredArray(type, text) {
    const dataArray = type == triggers.PERSON ? data.persons : data.tags;
    const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type), ''));
    return filteredArray;
  }

  render() {
    return ( < div style = {
        styles.root
      } > {
        this.renderAutocomplete()
      } < div style = {
        styles.editor
      } >
      < AutocompleteEditor editorState = {
        this.state.editorState
      }
      onChange = {
        this.onChange
      }
      onAutocompleteChange = {
        this.onAutocompleteChange
      }
      onInsert = {
        this.onInsert
      }
      /> < /div> < /div>
    );
  }

}



render( < AutocompleteInput / > ,
  document.getElementById('app')
);