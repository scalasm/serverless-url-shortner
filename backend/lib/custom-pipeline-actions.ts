// Copyright Mario Scalas 2020. All Rights Reserved.
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as iam from "@aws-cdk/aws-iam";
import { CdkPipeline, ShellScriptAction } from "@aws-cdk/pipelines";
import { ZoorlApplicationStage } from "./zoorl-application-stage";

export function pythonUnitTestsAction(sourceArtifact: codepipeline.Artifact, lambdaCodeDirectory: string = "backend/lambda"): ShellScriptAction {
  return new ShellScriptAction({
    actionName: "RunUnitTests",
    // Acceptance tests code is in the ... source code, so we need the pipeline to unzip it for us in the working folder :)
    additionalArtifacts: [
      sourceArtifact
    ],
    commands: [
      "env",
      "python --version",
      "pipenv --version",
      `cd ${lambdaCodeDirectory}`,
      "pipenv install",
      "pipenv install --dev",
      "pipenv run ./tests/run-unit-tests.sh"
    ]
  });
}

export function acceptanceTestsAction(
  pipeline: CdkPipeline,
  zoorlApplicationStage: ZoorlApplicationStage,
  sourceArtifact: codepipeline.Artifact,
  lambdaCodeDirectory: string = "backend/lambda"): ShellScriptAction {
  return new ShellScriptAction({
    actionName: "RunAcceptanceTests",
    // Acceptance tests code is in the ... source code, so we need the pipeline to unzip it for us in the working folder :)
    additionalArtifacts: [
      sourceArtifact
    ],
    useOutputs: {
      // Get the stack Output from the Stage and make it available in
      // the shell script as $ENDPOINT_URL.
      ENDPOINT_URL: pipeline.stackOutput(zoorlApplicationStage.apiUrlOutput),
      TARGET_AWS_REGION: pipeline.stackOutput(zoorlApplicationStage.regionOutput),
      USER_POOL_ID: pipeline.stackOutput(zoorlApplicationStage.userPoolIdOutput),
      USER_POOL_CLIENT_ID: pipeline.stackOutput(zoorlApplicationStage.userPoolClientIdOutput),
    },
    commands: [
      "python --version",
      "pipenv --version",
      `cd ${lambdaCodeDirectory}`,
      "pipenv install",
      "pipenv install --dev",
      "pipenv run pytest tests/acceptance/"
    ],
    rolePolicyStatements: [
      // Allow for creating / destroying / authenticating test users 
      new iam.PolicyStatement({
        resources: ["*"],
        actions: [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminDeleteUser",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminInitiateAuth"
        ],
      })
    ]
  });
}