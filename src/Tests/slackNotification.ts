import { sendErrorToSlack } from '../Helpers/slackHelper';

describe('test suite for slack notifications', () => {
    it('should be able to send error notification', async () => {
        try {
            await sendErrorToSlack(
                'reattempts reached for ssl verification  - test message',
                "ssl reattempts breach"
            );
        } catch (error) {
            console.log(error)
        }
    }).timeout(10000)
})