import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    return useMinFunctionRuntime(async () => {
        try {
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
