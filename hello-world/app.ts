import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const REGION = 'eu-central-1';
const sesClient = new SESClient({ region: REGION });

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return useMinFunctionRuntime(async () => {
        const sendEmailCommand = createSendEmailCommand('michael.haar92@gmail.com', 'michael.haar92@gmail.com');

        try {
            await sesClient.send(sendEmailCommand);
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'hello world',
                }),
            };
        } catch (err) {
            console.log(err);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'some error happened',
                }),
            };
        }
    });
};

const useMinFunctionRuntime = async <T>(func: () => Promise<T>, minRuntimeInMs = 1000): Promise<T> => {
    const start = Date.now();
    const result = func();
    const end = Date.now();

    if (end - start < minRuntimeInMs) {
        const sleepTime = minRuntimeInMs - (end - start);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
    }

    return result;
};

const createSendEmailCommand = (toAddress: string, fromAddress: string) => {
    return new SendEmailCommand({
        Destination: {
            /* required */
            CcAddresses: [
                /* more items */
            ],
            ToAddresses: [
                toAddress,
                /* more To-email addresses */
            ],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: 'UTF-8',
                    Data: 'HTML_FORMAT_BODY',
                },
                Text: {
                    Charset: 'UTF-8',
                    Data: 'TEXT_FORMAT_BODY',
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'EMAIL_SUBJECT',
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [
            /* more items */
        ],
    });
};
