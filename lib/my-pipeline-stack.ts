import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';

export class MyPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('daorders/my-pipeline', 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });
  }

}

pipeline.addStage({
  stageName: "Source",
  actions: [
    new codepipeline_actions.GitHubSourceAction({
      actionName: "Checkout",
      owner: "the-owner",
      repo: "the-repo",
      branch: "main",
      oauthToken: CDK.SecretValue.secretsManager(
        "Secret name", { jsonField: "key" }
      ),
      output: outputSources,
      trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
    }),
  ],
  ...
})