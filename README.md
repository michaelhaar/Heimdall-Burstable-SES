# Heimdall-Burstable-SES 📊📧

## About the Project

### Main Goals

- Send emails without exceeding the AWS SES send rate limit. 📧
- Low cost 💲✂️
  - Pay as you use
  - Scales to zero

### Build With

- [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [AWS SES](https://aws.amazon.com/ses/), [AWS Lambda](https://aws.amazon.com/lambda/), [AWS SQS](https://aws.amazon.com/sqs/)
- [Node.js](https://nodejs.org/en/), [TypeScript](https://www.typescriptlang.org/), [esbuild](https://esbuild.github.io/)
- [prettier](https://prettier.io/), [eslint](https://eslint.org/), [jest](https://jestjs.io/)

### Problem description

AWS SES has a soft send rate limit, which is the maximum number of emails that Amazon SES can accept from your account each second. You can exceed this quota for short bursts, but not for sustained periods of time ([source](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html)). If you send more than that, you will get a `Throttling` error. This is a problem if you want to send a lot of emails at once, for example, if you want to send a newsletter to all your users.

Typical send rates:

- 1 email per second for AWS SES sandbox accounts ([source](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html))
- ~50 emails per second for AWS SES production accounts ([source](https://stackoverflow.com/questions/61708253/sending-emails-by-ses-as-fast-as-possible-without-exceeding-the-rate-limit))
- SendGrid has a default limit of 100 emails per second (600 emails/minute) ([source](https://docs.sendgrid.com/v2-api/using_the_web_api#rate-limits)).

There are multiple ways to solve this problem, but the most common one is to use a queue. You can send the emails to a queue and then process them one by one. See:

- [How to Automatically Prevent Email Throttling when Reaching Concurrency Limit](https://aws.amazon.com/blogs/messaging-and-targeting/prevent-email-throttling-concurrency-limit/)
- [Sending emails by SES as fast as possible without exceeding the rate limit](https://stackoverflow.com/a/61916362/6664400)

![Leaky bucket](/docs/images/leaky-bucket.png)

_Leaky bucket principle. Source: [How to Automatically Prevent Email Throttling when Reaching Concurrency Limit](https://aws.amazon.com/blogs/messaging-and-targeting/prevent-email-throttling-concurrency-limit/)_

These solutions are great in general, but doesn't seem to be optimal for our use case and might be a little bit outdated and therefore overly complex.

### Our Solution

AWS recently (12 JAN 2023) introduced the [maximum concurrency of AWS Lambda functions when using Amazon SQS as an event source](https://aws.amazon.com/blogs/compute/introducing-maximum-concurrency-of-aws-lambda-functions-when-using-amazon-sqs-as-an-event-source/#:~:text=You%20can%20configure%20the%20maximum,the%20maximum%20value%20is%201000.) feature, which seems to be a perfect fit for our use case. This feature allows us to set a maximum concurrency for a Lambda function that is triggered by a SQS queue. This means that we can set a maximum concurrency for our Lambda function, which will process the emails one by one. This will allow us to send a lot of emails without exceeding the SES send rate limit.

![Maximum concurrency is set to 10 for the SQS queue.](/docs/images/maximum-concurrency.png)
Source: [Introducing maximum concurrency of AWS Lambda functions when using Amazon SQS as an event source](https://aws.amazon.com/blogs/compute/introducing-maximum-concurrency-of-aws-lambda-functions-when-using-amazon-sqs-as-an-event-source/#:~:text=You%20can%20configure%20the%20maximum,the%20maximum%20value%20is%201000.)

By setting the maximum concurrency equal to our SES send rate limit and making sure that each lambda function runs at least 1s, we are able to send emails without exceeding the SES send rate limit! 🙌🎉

### Cost Estimation

![Architecture](/docs/images/architecture.png)

![Cost Estimation for 10k emails per month](/docs/images/cost-estimation-10k.png)

Cost estimation for emails per month

- 1k: ~0.10$
- 10k: ~1.03$
- 100k: ~10.27$

## Getting Started 🚀

This is an example of how you may give instructions on setting up your project locally. To get a local copy up and running follow these simple example steps.

### Prerequisites

For this project you will need:

- [Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com/) installed.

Optional:

- [Visual Studio Code](https://code.visualstudio.com/) with [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions installed.
- [SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed
  - [Docker](https://www.docker.com/) installed?
  - [AWS CLI](https://aws.amazon.com/cli/) installed?

### Usage

- Clone the repo

```sh
git clone
```

- Install NPM packages

```sh
yarn install
```

- Run the unit tests

```sh
yarn test
```

#### Deploying to AWS

The application will be automatically deployed by the cd pipeline for each PR and on every push to the main branch.

## Contributing 🤝

To get code to production:

1. Create a new branch from latest `main`.
2. Make your changes.
3. Push your branch to GitHub and open a pull request.
4. The pipeline will automatically run the CI checks (typecheck, prettier, linting & unit tests) and will create a new feature deployment.
5. Test the feature deployment.
6. The PR will be reviewed and merged to `main` and the pipeline will automatically create a new production deployment.

### Forking

If you want to fork this project, you will need to add the following secrets to your forked repository:

![Github Actions secrets](/docs/images/github-secrets.png)

- `AWS_ACCESS_KEY_ID` of the AWS User
- `AWS_SECRET_ACCESS_KEY` of the AWS User

- Note I recommend granting the AWS User full admin access for testing and reduce the permissions later on:
  - `AmazonSQSFullAccess`
  - `AWSLambdaFullAccess`
  - `AmazonS3FullAccess`
  - `AmazonSESFullAccess`
  - `AWSCloudFormationFullAccess`
  - `IAMFullAccess`
