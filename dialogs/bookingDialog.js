// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverDialog } = require('./dateResolverDialog');

const { CardFactory } = require('botbuilder-core');
const WelcomeCard = require('../resources/welcomeCard.json');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_DIALOG = 'dateResolverDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class BookingDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'bookingDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverDialog(DATE_RESOLVER_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.welcomeStep.bind(this),
                this.dateTimeStep.bind(this),
                this.positionStep.bind(this),
                this.accidentStep.bind(this),
                this.peopleStep.bind(this),
                this.peopleDieStep.bind(this),
                this.detailsStep.bind(this),
                this.endStep.bind(this),
                this.informStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async welcomeStep(stepContext) {
        const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
        await stepContext.context.sendActivity({ attachments: [welcomeCard] });
        return await stepContext.prompt(TEXT_PROMPT);
    }

    async dateTimeStep(stepContext) {
        const bookingDetails = stepContext.options;

        // Capture the results of the previous step
        bookingDetails.origin = stepContext.result;
        if (!bookingDetails.date || this.isAmbiguous(bookingDetails.date)) {
            return await stepContext.beginDialog(DATE_RESOLVER_DIALOG, { date: bookingDetails.date });
        }
        return await stepContext.next(bookingDetails.date);
    }

    async positionStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.position) {
            const messageText = '請問發生地點？ 例如：正線上、車廂內、總公司辦公室、OMC、台北車站';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.position);
    }

    async accidentStep(stepContext) {
        const messageText = '是否造成衝撞、出軌、火災?';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    async peopleStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.people) {
            const messageText = '請問受影響人員？ 例如：旅客、員工、大眾、承商';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }

        return await stepContext.next(bookingDetails.people);
    }

    async peopleDieStep(stepContext) {
        const messageText = '請問有無人員當場死亡、或須送醫治療?';
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    async detailsStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.details) {
            const messageText = '請簡單描述事件內容';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }

        return await stepContext.next(bookingDetails.details);
    }

    async endStep(stepContext) {
        await stepContext.context.sendActivity('以上事件機器人初判為虛驚事件，已為您通報為虛驚事件，通報單號VSRP202312XXX');
        return await stepContext.next();
    }

    async informStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.inform) {
            const messageText = '您通報的案件同時有危害風險之虞，經查可能與危害風險編號XXXX有關，請問您要通報危害嗎?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            // Offer a YES/NO prompt.
            return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.inform);
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.BookingDialog = BookingDialog;
