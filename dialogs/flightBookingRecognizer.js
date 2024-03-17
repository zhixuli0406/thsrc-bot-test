// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class FlightBookingRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            // Set the recognizer options depending on which endpoint version you want to use e.g v2 or v3.
            // More details can be found in https://docs.microsoft.com/en-gb/azure/cognitive-services/luis/luis-migration-api-v3
            const recognizerOptions = {
                apiVersion: 'v3'
            };

            this.recognizer = new LuisRecognizer(config, recognizerOptions);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getFromEntities(result) {
        let fromValue, fromAirportValue;
        if (result.entities.$instance.From) {
            fromValue = result.entities.$instance.From[0].text;
        }
        if (fromValue && result.entities.From[0].Airport) {
            fromAirportValue = result.entities.From[0].Airport[0][0];
        }

        return { from: fromValue, airport: fromAirportValue };
    }

    getToEntities(result) {
        let toValue, toAirportValue;
        if (result.entities.$instance.To) {
            toValue = result.entities.$instance.To[0].text;
        }
        if (toValue && result.entities.To[0].Airport) {
            toAirportValue = result.entities.To[0].Airport[0][0];
        }

        return { to: toValue, airport: toAirportValue };
    }

    getPositionEntities(result) {
        let positionValue, positionAirportValue;
        if (result.entities.$instance.Position) {
            positionValue = result.entities.$instance.Position[0].text;
        }
        if (positionValue && result.entities.Position[0].Airport) {
            positionAirportValue = result.entities.Position[0].Airport[0][0];
        }

        return { to: positionValue, airport: positionAirportValue };
    }

    /**
     * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
     * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
     */
    getDateTime(result) {
        const datetimeEntity = result.entities.datetime;
        if (!datetimeEntity || !datetimeEntity[0]) return undefined;

        const timex = datetimeEntity[0].timex;
        if (!timex || !timex[0]) return undefined;

        const datetime = timex[0].split('T')[0];
        return datetime;
    }

    getPeopleEntities(result) {
        let peopleValue, peopleAirportValue;
        if (result.entities.$instance.Position) {
            peopleValue = result.entities.$instance.Position[0].text;
        }
        if (peopleValue && result.entities.Position[0].Airport) {
            peopleAirportValue = result.entities.Position[0].Airport[0][0];
        }

        return { to: peopleValue, airport: peopleAirportValue };
    }

    getDetailsEntities(result) {
        let detailsValue, detailsAirportValue;
        if (result.entities.$instance.Position) {
            detailsValue = result.entities.$instance.Position[0].text;
        }
        if (detailsValue && result.entities.Position[0].Airport) {
            detailsAirportValue = result.entities.Position[0].Airport[0][0];
        }

        return { to: detailsValue, airport: detailsAirportValue };
    }

    getInformEntities(result) {
        let informValue, informAirportValue;
        if (result.entities.$instance.Position) {
            informValue = result.entities.$instance.Position[0].text;
        }
        if (informValue && result.entities.Position[0].Airport) {
            informAirportValue = result.entities.Position[0].Airport[0][0];
        }

        return { to: informValue, airport: informAirportValue };
    }
}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;
