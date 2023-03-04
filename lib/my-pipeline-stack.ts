import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage } from './my-pipeline-app-stage';
import { ManualApprovalStep } from 'aws-cdk-lib/pipelines';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class MyPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'MyPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub('daorders/my-pipeline', 'main'),
        installCommands: ['npm i -g npm@latest'],
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    const stringValue = ssm.StringParameter.fromStringParameterAttributes(this, 'region1', {
      parameterName: 'region1',
    }).stringValue;

    const testingStage = pipeline.addStage(new MyPipelineAppStage(this, "test", {
      env: {region: stringValue}
    }));

    testingStage.addPost(new ManualApprovalStep('approval'));

  }
}

