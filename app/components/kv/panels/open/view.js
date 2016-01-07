import {div, h1, h3, ul, li, button, input} from '@cycle/dom';

import examples from './examples';

export default () => div([
  h1('.modal-box-title', 'Open...'),
  h3('Examples'),
  ul('.block-list', [
    examples.map((example) =>
      li([button('.block-button', {
        attributes: {
          'data-open-json': JSON.stringify(example.data),
        },
      }, example.name)])
    ),
  ]),
  h3('From File'),
  div([
    input('.block-button', {
      attributes: {'data-file-picker': 'json'},
      type: 'file',
    }),
  ]),
])
;