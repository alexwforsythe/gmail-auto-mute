import { buildHomepageCard } from './homepage';
import Log from './logger';
import { loadProps } from './properties';

// Define GmailLabel.getId() because it's missing from type definitions.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace GoogleAppsScript {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Gmail {
      interface GmailLabel {
        getId(): string;
      }
    }
  }
}

export function onHomepageTrigger(e: GoogleAppsScript.Addons.EventObject) {
  const props = loadProps();
  Log.debug('onHomepageTrigger: loaded props', { props });
  return buildHomepageCard(props, e.commonEventObject.userLocale);
}
