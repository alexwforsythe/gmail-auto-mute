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
  Log.debug(`Initial props: ${JSON.stringify(props)}`);
  return buildHomepageCard(props.settings, e.commonEventObject.userLocale);
}
