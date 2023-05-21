import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Code, Function, LayerVersion, Runtime } from '@aws-cdk/aws-lambda';
import { RetentionDays } from '@aws-cdk/aws-logs';
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { Effect } from '@aws-cdk/aws-iam';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources'
import * as iam from '@aws-cdk/aws-iam';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sqs from '@aws-cdk/aws-sqs'

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const marketUpdateLambda = new Function(this, 'MarketUpdateLambda', {
      functionName: 'MarketUpdate',
      description: '',
      runtime: Runtime.NODEJS_14_X,
      handler: 'lambda.marketUpdateHandler',
      code: Code.fromAsset('../dist/lambda.zip'),
      memorySize: 256,
      timeout: Duration.seconds(1 * 60),
      logRetention: RetentionDays.ONE_DAY,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      reservedConcurrentExecutions: 1,
    });

    new Rule(this, 'MarketUpdateSchedule', {
      description: 'Triggers updates for funding rates and oracle prices',
      schedule: Schedule.rate(Duration.minutes(1)),
      targets: [new LambdaFunction(marketUpdateLambda)],
    });

    const liquidatorBotLambda = new Function(this, 'LiquidatorBotLambda', {
      functionName: 'LiquidatorBot',
      description: '',
      runtime: Runtime.NODEJS_14_X,
      handler: 'lambda.liquidationBotHandler',
      code: Code.fromAsset('../dist/lambda.zip'),
      memorySize: 256,
      timeout: Duration.seconds(1 * 60),
      logRetention: RetentionDays.ONE_DAY,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
      reservedConcurrentExecutions: 1,
    });

    new Rule(this, 'LiquidatorBotSchedule', {
      description: 'Triggers the liquidator bot',
      schedule: Schedule.rate(Duration.minutes(1)),
      targets: [new LambdaFunction(liquidatorBotLambda)],
    });

    const lambdas = [marketUpdateLambda, liquidatorBotLambda];

    const timestreamPolicy = new iam.PolicyStatement({
      actions: ['timestream:*'],
      effect: Effect.ALLOW,
      resources: [
        'arn:aws:timestream:us-east-1:636866651708:database/Tides',
        'arn:aws:timestream:us-east-1:636866651708:database/Tides/*',
      ],
    });

    const timestreamDescribeEnpointsPolicy = new iam.PolicyStatement({
      actions: ['timestream:DescribeEndpoints'],
      effect: Effect.ALLOW,
      resources: ['*'],
    });

    const dynamoPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:*'],
      effect: Effect.ALLOW,
      resources: ["*"],
    });

    const sqsPolicy = new iam.PolicyStatement({
      actions: ['sqs:*'],
      effect: Effect.ALLOW,
      resources: ["*"],
    });

    for (const lambda of lambdas) {
      lambda.role?.attachInlinePolicy(
        new iam.Policy(
          this,
          `${lambda.node.id.toLowerCase()}-timestream-policy`,
          {
            statements: [timestreamPolicy],
          },
        ),
      );

      lambda.role?.attachInlinePolicy(
        new iam.Policy(
          this,
          `${lambda.node.id.toLowerCase()}-timestream-describe-endpoints-policy`,
          {
            statements: [timestreamDescribeEnpointsPolicy],
          },
        ),
      );

      lambda.role?.attachInlinePolicy(
        new iam.Policy(this, `${lambda.node.id.toLowerCase()}-dynamo-policy`, {
          statements: [dynamoPolicy],
        }),
      );

      lambda.role?.attachInlinePolicy(
        new iam.Policy(this, `${lambda.node.id.toLowerCase()}-sqs-policy`, {
          statements: [sqsPolicy],
        }),
      );
    }


  }
}
