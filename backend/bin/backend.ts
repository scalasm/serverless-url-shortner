#!/usr/bin/env node

// Copyright Mario Scalas 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ZoorlPipelineStack } from '../lib/zoorl-pipeline-stack';

const app = new cdk.App();

// If you want to support multiple environments, this is where to intervene
const currentEnvironment = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

new ZoorlPipelineStack(app, 'ZoorlBackendStack', {
  // This is the environment where the CI/CD pipeline will be actually created
  env: currentEnvironment,
  // This is the environment where the application stack (e.g., APIs, DynamoDB tables, ...) will be deployed
  preprodEnv: currentEnvironment
});

app.synth();
