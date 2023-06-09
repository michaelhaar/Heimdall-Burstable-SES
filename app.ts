import { APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

const region = 'eu-central-1';
const sesClient = new SESClient({ region });
const fromAddress = 'michael.haar92@gmail.com';

export const lambdaHandler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  return await useMinFunctionRuntime(async () => {
    const sendData = getSendData(event);

    try {
      for (const data of sendData) {
        const sendEmailCommand = createSendEmailCommand(data, fromAddress);
        await sesClient.send(sendEmailCommand);
      }
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'OK',
        }),
      };
    } catch (err) {
      console.log(err);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Internal Server Error',
        }),
      };
    }
  });
};

const useMinFunctionRuntime = async <T>(
  func: () => Promise<T>,
  minRuntimeInMs = 1000,
): Promise<T> => {
  const start = Date.now();
  const result = await func();
  const end = Date.now();

  if (end - start < minRuntimeInMs) {
    const sleepTime = minRuntimeInMs - (end - start);
    await new Promise((resolve) => setTimeout(resolve, sleepTime));
  }

  return result;
};

export type TEmailSendData = {
  to: string;
  subject: string;
  html: string;
};

const getSendData = (event: SQSEvent): TEmailSendData[] => {
  const messages = event.Records.map((record) => JSON.parse(record.body));
  return messages.filter(validateEmailSendData);
};

const validateEmailSendData = (data: unknown): data is TEmailSendData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as TEmailSendData).to === 'string' &&
    typeof (data as TEmailSendData).subject === 'string' &&
    typeof (data as TEmailSendData).html === 'string'
  );
};

const createSendEmailCommand = ({ to, subject, html }: TEmailSendData, fromAddress: string) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: html,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};
