import { slackHelper } from 'lt-utils-node-ts';
import { getLogger } from './logger'
const slackNotifierLogger = getLogger('slack-notifier-logger')

export const sendErrorToSlack = async (message: string, errorTitle: string, error?: Error, channel = '#ssl-generator-service') => {
    if (!message && message == '' && error?.message) {
        message = error.message
    }
    const payload = {
        "type": "error",
        "channel": channel,
        "title": errorTitle,
        "message": message,
        "authorName": "shubham negi"
    }
    try {
        await slackHelper.slackPostMessage(payload);
    } catch (error) {
        slackNotifierLogger.error(error, "Error sending slack message")
    }
}