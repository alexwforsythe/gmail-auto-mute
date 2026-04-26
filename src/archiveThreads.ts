import Log from './logger';
import { loadProps, saveState } from './properties';

const initialLookbackPeriod = '1m';

export function archiveThreads() {
  const nowMs = new Date().getTime();
  const props = loadProps();

  const { settings, state } = props;
  const label = GmailApp.getUserLabels().find(
    (l) => l.getId() === settings.labelId,
  );
  if (!label) {
    Log.error('Missing label, skipping archiveThreads', {
      labelId: settings.labelId,
    });
    return 'Error: No label selected';
  }

  const threads = getThreadsToArchive(label, [
    ...(settings.excludeRead ? ['is:unread'] : []),
    ...(settings.excludeImportant ? ['-is:important'] : []),
    // The advanced search syntax accepts timestamps in seconds:
    // https://developers.google.com/workspace/gmail/api/guides/filtering
    ...(state.lastRunMs
      ? [`after:${Math.floor(state.lastRunMs / 1000)}`]
      : // If the trigger has never been run, limit the lookback window to avoid
        // scanning all threads.
        [`newer_than:${initialLookbackPeriod}`]),
  ]);
  Log.debug(`Got ${threads.length} threads to archive`);

  // Archive the threads in batches of 100 to avoid timeouts.
  for (let i = 0; i < threads.length; i += 100) {
    const batch = threads.slice(i, i + 100);
    GmailApp.moveThreadsToArchive(batch);
    Log.info(
      `Archived ${batch.length} threads, remaining: ${threads.length - i + 100}`,
    );
  }

  saveState({
    lastRunMs: nowMs,
    lastRunArchivedCount: threads.length,
    totalArchivedCount: state.totalArchivedCount + threads.length,
  });

  return `Archived ${threads.length} threads`;
}

/**
 * Gmail only searches labels in a thread's newest message when querying with
 * in:inbox, so replies to previously archived threads with our label(s) won't
 * appear in the results. Instead, we query for all inbox threads and all
 * threads with the label and find the intersection of the two. This can be
 * inefficient if the user has a large number of threads, so we rely on limiting
 * the time window of the search for efficiency.
 *
 * Note: reapplying the label to the matched threads will add it to their newest
 * messages, causing them to appear in future searches (until a newer message is
 * received), but we don't do it because we can archive the threads directly.
 */
function getThreadsToArchive(
  label: GoogleAppsScript.Gmail.GmailLabel,
  queryParams: string[],
) {
  const inboxThreads = getThreads('in:inbox', ...queryParams);
  const labelThreads = getThreads(`label:${label.getName()}`, ...queryParams);
  const labelThreadIdsSet = new Set(labelThreads.map((t) => t.getId()));
  return inboxThreads.filter((t) => labelThreadIdsSet.has(t.getId()));
}

/**
 * Queries threads with the given query params in batches of 500 (the max per
 * request).
 *
 * @param queryParams the query params to use when searching threads
 * @returns all threads matching the given query params
 */
function getThreads(...queryParams: string[]) {
  const max = 500;

  const threads = [];
  let offset = 0;
  let page: GoogleAppsScript.Gmail.GmailThread[];
  do {
    Log.debug('Querying threads', { offset, max, queryParams });
    page = GmailApp.search(queryParams.join(' AND '), offset, max);
    threads.push(...page);
    offset += max;
  } while (page.length >= max);

  return threads;
}
