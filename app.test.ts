import { SQSEvent } from 'aws-lambda';
import { lambdaHandler, TEmailSendData } from './app';
import { SESClient } from '@aws-sdk/client-ses';

describe('Unit test for app handler', function () {
  const sesClientSendMock = jest.spyOn(SESClient.prototype, 'send').mockImplementation(() => ({}));

  beforeEach(() => {
    sesClientSendMock.mockClear();
  });

  it('runs at least 1 second', async () => {
    const start = Date.now();

    await lambdaHandler(testEvent);
    const end = Date.now();

    expect(end - start).toBeGreaterThanOrEqual(1000);
  });

  it('should call send function', async () => {
    await lambdaHandler(testEvent);

    expect(sesClientSendMock).toHaveBeenCalledTimes(1);
  });
});

const testEvent: SQSEvent = {
  Records: [
    {
      messageId: '19dd0b57-b21e-4ac1-a2ac-11b019e8e7b3',
      receiptHandle: 'MessageReceiptHandle',
      body: JSON.stringify({
        to: 'testy.mctestison@gmail.com',
        subject: 'Favorite Fruit',
        html: '<p>Banana</p>',
      } as TEmailSendData),
      attributes: {
        ApproximateReceiveCount: '1',
        SentTimestamp: '1523232000000',
        SenderId: '123456789012',
        ApproximateFirstReceiveTimestamp: '1523232000001',
      },
      messageAttributes: {},
      md5OfBody: '7b270e59b47ff90a553787216d55d91d',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-2:123456789012:MyQueue',
      awsRegion: 'eu-central-1',
    },
  ],
};
