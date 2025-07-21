import { render } from 'solid-js/web';
import { OptionsApp } from './App';

const root = document.getElementById('options-root');
if (root) {
  render(() => <OptionsApp />, root);
}