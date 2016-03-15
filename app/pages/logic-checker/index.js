import {Observable as O} from 'rx';
import I from 'immutable';
import Cycle from '@cycle/core';
import {makeDOMDriver} from '@cycle/dom';
import {div, h1, h2, ul, li, p} from '@cycle/dom';
import isolate from '@cycle/isolate';

import {preventDefaultDriver} from '../../drivers/prevent-default';
import {autoResizeDriver} from '../../drivers/textarea-resize';
import {selectAllDriver} from '../../drivers/select-all';
import {globalEventDriver} from '../../drivers/global-events';
import {insertStringDriver} from '../../drivers/rangy';

import LogicField from '../../components/logic/input-field';
import {diffNetworks} from '../../components/logic/lib/diff';
import {expressionToString} from '../../components/logic/lib/formatter';
import formatter from '../../components/logic/lib/formatter/math';

import './index.styl';

const render = (state, field1, field2) =>
  div([
    h1('Compare expressions'),
    div('.column', [
      h2('Expression 1'),
      field1,
    ]),
    div('.column', [
      h2('Expression 2'),
      field2,
    ]),
    state !== null ? div('.result', [
      state.error && div('.error', state.error),
      state.warnings.isEmpty() ? null :
      div('.warnings', state.warnings.map((warning) =>
        div('.warning', [
          warning.message,
          warning.details ? p('.warning-details', warning.details) : null,
        ])
      ).toArray()),

      div('.comparison', [
        ul('.comparison-list', state.comparisons.map((comparison) =>
          li('.comparison-list-item', {
            className: comparison.equal ? 'state-success' : 'state-fail',
          }, [
            div('.comparison-head', [
              `Comparing ${
                expressionToString(comparison.expressionA.body, formatter)
              } and ${
                expressionToString(comparison.expressionB.body, formatter)
              }`,
            ]),
            div('.comparison-result', {
              className: comparison.equal ? 'state-success' : 'state-fail',
            }, [
              comparison.equal ? 'Equal!' : 'Not Equal!',
              comparison.difference && div('.comparison-reason', [
                console.dir(comparison.difference.identifierMap.toJS()) ||
                `For assignment (${
                  I.List(comparison.difference.identifierMap.entries())
                  .filter(([id]) => id._name === 'identifier')
                  .map(([id, value]) =>
                    formatter.formatLabel(
                      formatter.formatName(id.name),
                      formatter.formatValue(value)
                    )
                  ).join(', ')
                }): ${
                  expressionToString(comparison.expressionA.body, formatter)
                } is ${
                  formatter.formatValue(comparison.difference.valueA)
                } but ${
                  expressionToString(comparison.expressionB.body, formatter)
                } is ${
                  formatter.formatValue(comparison.difference.valueB)
                }`,
              ]),
            ]),
          ])
        ).toArray()),
      ]),
    ]) : null,
  ])
;

const diff = (outputA, outputB) => {
  if (outputA.error !== null || outputB.error !== null) {
    return null;
  }

  if (outputA.network.sortedExpressions.size === 0 &&
    outputB.network.sortedExpressions.size === 0) {
    return null;
  }

  return diffNetworks(outputA.network, outputB.network);
};

const logicApp = (sources) => {
  const {
    DOM,
    preventDefault,
    globalEvents,
    autoResize,
    selectAll,
  } = sources;

  const logicFieldA = isolate(LogicField)({
    DOM, preventDefault, globalEvents, autoResize, selectAll,
  });

  const logicFieldB = isolate(LogicField)({
    DOM, preventDefault, globalEvents, autoResize, selectAll,
  });

  const fieldADOM$ = logicFieldA.DOM;
  const fieldBDOM$ = logicFieldB.DOM;

  const state$ = O.combineLatest(
    logicFieldA.output$,
    logicFieldB.output$,
    diff
  );

  const vtree$ = O.combineLatest(
    state$, fieldADOM$, fieldBDOM$,
    render
  );

  return {
    DOM: vtree$,
    preventDefault: O.merge([
      logicFieldA.preventDefault,
      logicFieldB.preventDefault,
    ]),
    autoResize: O.merge([
      logicFieldA.autoResize,
      logicFieldB.autoResize,
    ]),
    insertString: O.merge([
      logicFieldA.insertString,
      logicFieldB.insertString,
    ]),
  };
};

const drivers = {
  DOM: makeDOMDriver('#app'),
  preventDefault: preventDefaultDriver,
  autoResize: autoResizeDriver,
  selectAll: selectAllDriver,
  globalEvents: globalEventDriver,
  insertString: insertStringDriver,
};

Cycle.run(logicApp, drivers);
