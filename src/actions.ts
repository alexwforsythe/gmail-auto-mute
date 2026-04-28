import { archiveThreads } from './archiveThreads';
import { buildHomepageCard } from './homepage';
import { clearState, loadProps } from './properties';

export function clearStateAction(e: GoogleAppsScript.Addons.EventObject) {
  clearState();
  return refreshHomepage(e, 'State cleared');
}

export function manualTriggerAction(e: GoogleAppsScript.Addons.EventObject) {
  const result = archiveThreads();
  return refreshHomepage(e, result);
}

function refreshHomepage(
  e: GoogleAppsScript.Addons.EventObject,
  notificationText?: string,
) {
  const props = loadProps();
  const res = CardService.newActionResponseBuilder()
    .setNavigation(
      CardService.newNavigation()
        .popToRoot()
        .updateCard(buildHomepageCard(props, e.commonEventObject.userLocale)),
    )
    .setStateChanged(true);

  if (notificationText) {
    res.setNotification(
      CardService.newNotification().setText(notificationText),
    );
  }

  return res.build();
}
