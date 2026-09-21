import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadRecipe } from './load-recipe.mjs';

const { ProcessingView } = await loadRecipe('processing');
test('processing recipe preserves unknown progress and caller-owned error announcements', () => {
  const markup = renderToStaticMarkup(createElement(ProcessingView, {
    title: 'Example task', description: 'Demonstration', context: 'Example',
    state: 'error', statusLabel: 'Retry needed', progress: null,
    progressLabel: 'Progress', progressDescription: 'Waiting for data',
    stepsLabel: 'Steps', steps: [], logs: [], detailsLabel: 'Details',
    announcement: 'The task could not finish',
    story: { title: 'Details', caption: '', speaker: '', elapsedLabel: '0',
      durationLabel: 'Unknown', transcriptLabel: 'Transcript', chapters: [] },
    motion: { paused: true, pauseLabel: 'Pause', resumeLabel: 'Resume',
      description: 'Motion paused', onPausedChange() {} },
  }));
  assert.match(markup, /role="progressbar"[^>]*aria-label="Progress"/);
  assert.doesNotMatch(markup, /aria-valuenow=/);
  assert.match(markup, /role="alert"[^>]*>The task could not finish/);
  assert.match(markup, /recipe-processing-announcement/);
});
