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

    const region1 = ssm.StringParameter.fromStringParameterAttributes(this, 'region1', {
      parameterName: 'region1',
    }).stringValue;

    const region2 = ssm.StringParameter.fromStringParameterAttributes(this, 'region2', {
      parameterName: 'region2',
    }).stringValue;

    
    const wave = pipeline.addWave('wave');
    wave.addStage(new MyPipelineAppStage(this, 'MyAppSE', {
      env: { region: region1 }
    }));
    wave.addStage(new MyPipelineAppStage(this, 'MyAppUS', {
      env: { region: region2 }
    }));

    wave.addPost(new ManualApprovalStep('approval'));

  }
}

