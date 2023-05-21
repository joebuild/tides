#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { LambdaStack } from '../lib/LambdaStack';
import { TimestreamStack } from '../lib/TimestreamStack';

const app = new App();

new LambdaStack(app, 'TidesLambdaStack');
new TimestreamStack(app, 'TidesTimestreamStack');
