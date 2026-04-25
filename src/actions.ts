import { archiveThreads } from './archiveThreads';
import { buildHomepageCard } from './homepage';
import Log from './logger';
import { clearState, loadProps } from './properties';

export function clearStateAction(e: GoogleAppsScript.Addons.EventObject) {
  clearState();
  return refreshHomepage(e, 'State cleared');
}

export function manualTriggerAction(e: GoogleAppsScript.Addons.EventObject) {
  try {
    const result = archiveThreads();
    return refreshHomepage(e, result);
  } catch (error) {
    const msg = (
      error instanceof Error
        ? error
        : new Error(
            error instanceof Object ? JSON.stringify(error) : String(error),
          )
    ).message;
    Log.error(`Failed to archive threads: ${msg}`, { error });
    return refreshHomepage(e, msg);
  }
}

function refreshHomepage(
  e: GoogleAppsScript.Addons.EventObject,
  notificationText?: string,
) {
  const { settings } = loadProps();
  const res = CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popToRoot()
        .updateCard(
          buildHomepageCard(settings, e.commonEventObject.userLocale),
        ),
    )
    .setStateChanged(true);

  if (notificationText) {
    res.setNotification(
      CardService.newNotification().setText(notificationText),
    );
  }

  return res.build();
}
