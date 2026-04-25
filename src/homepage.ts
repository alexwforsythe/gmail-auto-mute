import { clearStateAction, manualTriggerAction } from './actions';
import { archiveThreads } from './archiveThreads';
import Log from './logger';
import {
  defaultEvaluationIntervalHours,
  loadProps,
  saveSettings,
  type Settings,
} from './properties';

const helpLink =
  'https://github.com/alexwforsythe/gmail-auto-mute/blob/main/README.md';
const evaluationIntervalsHours = [1, 6, defaultEvaluationIntervalHours, 24];

export function buildHomepageCard(
  settings: Settings,
  userLocale: string | undefined,
) {
  // Label selection
  const labelSelect = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Archive inbox threads with label')
    .setFieldName('labelId')
    .setOnChangeAction(
      CardService.newAction().setFunctionName(handleChangeLabelId.name),
    );
  const userLabels = getUserLabels(userLocale);
  userLabels.forEach((l) => {
    labelSelect.addItem(l.getName(), l.getId(), l.getId() === settings.labelId);
  });

  // Interval selection
  const intervalSelect = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.DROPDOWN)
    .setTitle('Archive matching threads every')
    .setFieldName('intervalHours')
    .setOnChangeAction(
      CardService.newAction().setFunctionName(handleChangeIntervalHours.name),
    );
  evaluationIntervalsHours.forEach((h) => {
    intervalSelect.addItem(
      `${h} hour${h > 1 ? 's' : ''}`,
      h.toString(),
      h === settings.intervalHours,
    );
  });

  return (
    CardService.newCardBuilder()
      .setHeader(CardService.newCardHeader().setTitle('Settings'))
      .addCardAction(
        CardService.newCardAction()
          .setText('Help')
          .setOpenLink(CardService.newOpenLink().setUrl(helpLink)),
      )
      .addCardAction(
        CardService.newCardAction()
          .setText('Clear state')
          .setOnClickAction(
            CardService.newAction().setFunctionName(clearStateAction.name),
          ),
      )
      .addSection(
        CardService.newCardSection()
          .setHeader('Filters')
          .addWidget(labelSelect)
          .addWidget(
            CardService.newDecoratedText()
              .setText('Exclude read messages')
              .setSwitchControl(
                CardService.newSwitch()
                  .setFieldName('excludeRead')
                  .setValue('true')
                  .setSelected(settings.excludeRead)
                  .setOnChangeAction(
                    CardService.newAction().setFunctionName(
                      handleChangeExcludeRead.name,
                    ),
                  ),
              ),
          )
          .addWidget(
            CardService.newDecoratedText()
              .setText('Exclude important messages')
              .setSwitchControl(
                CardService.newSwitch()
                  .setFieldName('excludeImportant')
                  .setValue('true')
                  .setSelected(settings.excludeImportant)
                  .setOnChangeAction(
                    CardService.newAction().setFunctionName(
                      handleChangeExcludeImportant.name,
                    ),
                  ),
              ),
          ),
      )
      .addSection(
        CardService.newCardSection()
          .setHeader('Cleanup Schedule')
          .addWidget(
            CardService.newDecoratedText()
              .setText('Enabled')
              .setSwitchControl(
                CardService.newSwitch()
                  .setFieldName('enableTimerTrigger')
                  .setValue('true')
                  .setSelected(settings.enableTimerTrigger)
                  .setOnChangeAction(
                    CardService.newAction().setFunctionName(
                      handleChangeEnableTimerTrigger.name,
                    ),
                  ),
              ),
          )
          .addWidget(intervalSelect)
          .addWidget(
            CardService.newButtonSet().addButton(
              CardService.newTextButton()
                .setText('Run Now')
                .setOnClickAction(
                  CardService.newAction()
                    .setFunctionName(manualTriggerAction.name)
                    .addRequiredWidget('labelId'),
                ),
            ),
          ),
      )
      // .setFixedFooter(
      //   CardService.newFixedFooter().setPrimaryButton(
      //     CardService.newTextButton()
      //       .setText('Run now')
      //       .setOnClickAction(
      //         CardService.newAction()
      //           .setFunctionName(manualTriggerAction.name)
      //           .addRequiredWidget('labelId'),
      //       ),
      //   ),
      // )
      .build()
  );
}

function handleChangeLabelId(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { settings } = loadProps();
  const { commonEventObject } = e;
  const { formInputs: form } = commonEventObject;
  const labelId = form.labelId.stringInputs?.value[0];
  if (!labelId) {
    Log.error('Invalid labelId, skipping handler', { labelId });
    return buildHomepageResponse(
      e.commonEventObject.userLocale,
      'Error: Invalid label',
    );
  }

  if (settings.labelId === labelId) {
    Log.warn('labelId unchanged, skipping handler');
    return buildHomepageResponse(e.commonEventObject.userLocale);
  }

  saveSettings({ ...settings, labelId });
  return buildHomepageResponse(e.commonEventObject.userLocale);
}

function handleChangeIntervalHours(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { settings } = loadProps();
  const { commonEventObject } = e;
  const { formInputs: form } = commonEventObject;
  const val = form.intervalHours?.stringInputs?.value[0];
  const intervalHours = val ? parseInt(val) : undefined;
  if (!intervalHours || intervalHours <= 0) {
    Log.error('Invalid intervalHours, skipping handler', { intervalHours });
    return buildHomepageResponse(
      e.commonEventObject.userLocale,
      'Error: Invalid interval',
    );
  }

  if (settings.intervalHours === intervalHours) {
    Log.warn('intervalHours unchanged, skipping handler');
    return buildHomepageResponse(e.commonEventObject.userLocale);
  }

  saveSettings({ ...settings, intervalHours });
  return buildHomepageResponse(e.commonEventObject.userLocale);
}

function handleChangeExcludeRead(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { commonEventObject } = e;
  const { formInputs: form } = commonEventObject;
  const excludeRead = Boolean(form.excludeRead?.stringInputs?.value[0]);
  const { settings } = loadProps();
  if (settings.excludeRead === excludeRead) {
    Log.warn('excludeRead unchanged, skipping handler');
    return buildHomepageResponse(e.commonEventObject.userLocale);
  }

  saveSettings({ ...settings, excludeRead });
  return buildHomepageResponse(e.commonEventObject.userLocale);
}

function handleChangeExcludeImportant(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { commonEventObject } = e;
  const { formInputs: form } = commonEventObject;
  const excludeImportant = Boolean(
    form.excludeImportant?.stringInputs?.value[0],
  );
  const { settings } = loadProps();
  if (settings.excludeImportant === excludeImportant) {
    Log.warn('excludeImportant unchanged, skipping handler');
    return buildHomepageResponse(e.commonEventObject.userLocale);
  }

  saveSettings({ ...settings, excludeImportant });
  return buildHomepageResponse(e.commonEventObject.userLocale);
}

function buildHomepageResponse(
  userLocale: string | undefined,
  notificationText?: string,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { settings } = loadProps();
  const res = CardService.newActionResponseBuilder().setNavigation(
    CardService.newNavigation()
      .popToRoot()
      .updateCard(buildHomepageCard(settings, userLocale)),
  );
  if (notificationText) {
    res.setNotification(
      CardService.newNotification().setText(notificationText),
    );
  }
  return res.setStateChanged(true).build();
}

function handleChangeEnableTimerTrigger(
  e: GoogleAppsScript.Addons.EventObject,
): GoogleAppsScript.Card_Service.ActionResponse {
  const { commonEventObject } = e;
  const { formInputs: form } = commonEventObject;
  const enableTimerTrigger = Boolean(
    form.enableTimerTrigger?.stringInputs?.value[0],
  );
  const { settings } = loadProps();
  if (settings.enableTimerTrigger === enableTimerTrigger) {
    Log.warn('enableTimerTrigger unchanged, skipping handler');
    return buildHomepageResponse(e.commonEventObject.userLocale);
  }

  if (enableTimerTrigger) {
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (t.getHandlerFunction() === archiveThreads.name) {
        ScriptApp.deleteTrigger(t);
      }
    });

    ScriptApp.newTrigger(archiveThreads.name)
      .timeBased()
      .everyHours(settings.intervalHours)
      .create();
  } else {
    ScriptApp.getProjectTriggers().forEach((t) => {
      if (t.getHandlerFunction() === archiveThreads.name) {
        ScriptApp.deleteTrigger(t);
      }
    });
  }

  saveSettings({ ...settings, enableTimerTrigger });

  return buildHomepageResponse(
    e.commonEventObject.userLocale,
    enableTimerTrigger ? 'Schedule enabled' : 'Schedule disabled',
  );
}

function getUserLabels(userLocale?: string) {
  return GmailApp.getUserLabels().sort((a, b) =>
    a.getName().localeCompare(b.getName(), userLocale),
  );
}
