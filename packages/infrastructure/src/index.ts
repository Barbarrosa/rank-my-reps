import AWS from "aws-sdk";
import { config } from "dotenv";
import fs from "fs";
import {
  CreateStackInput,
  UpdateStackInput
} from "aws-sdk/clients/cloudformation";

config();

const cloudFormation = new AWS.CloudFormation({
  apiVersion: "2010-05-15",
  region: process.env.AWS_REGION || "us-east-1"
});

export default async function createInfrastructure() {
  console.log(`Fetching stack info...`);
  const stackConf: CreateStackInput | UpdateStackInput = {
    StackName: process.env.STACK_NAME || "RankMyReps",
    Tags: [
      {
        Key: "project",
        Value: "rank-my-reps"
      }
    ],
    TemplateBody: fs
      .readFileSync(`${__dirname}/../templates/cloudformation-stack.json`)
      .toString()
  };

  const stacks =
    (await cloudFormation.listStacks().promise()).StackSummaries || [];

  let previousStack = stacks.find(
    s =>
      s.StackName === stackConf.StackName && s.StackStatus !== "DELETE_COMPLETE"
  );
  console.log(JSON.stringify(previousStack, undefined, 4));
  if (previousStack && previousStack.StackStatus === "ROLLBACK_COMPLETE") {
    console.log(`Previous stack rolled back, deleting it first...`);
    await cloudFormation
      .deleteStack({ StackName: stackConf.StackName })
      .promise();
    await cloudFormation
      .waitFor("stackDeleteComplete", { StackName: stackConf.StackName })
      .promise();
    console.log(`Old stack deleted.`);
    previousStack = undefined;
  }

  try {
    if (previousStack) {
      console.log(`Updating Rank My Reps infrastructure...`);
      const result = await cloudFormation.updateStack(stackConf).promise();
      console.log(result);
      console.log(`Updated Stack ${result.StackId}`);
    } else {
      console.log(`Creating Rank My Reps infrastructure...`);
      console.log(
        `Created Stack ${
          (await cloudFormation.createStack(stackConf).promise()).StackId
        }`
      );
    }
    console.log(`Infrastructure generation complete.`);
  } catch (e) {
    console.log(`An error occurred preventing infrastructure generation.`);
    console.log(e);
  }
}

createInfrastructure();
