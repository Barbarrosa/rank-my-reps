import AWS from "aws-sdk";
import Command from "@oclif/command";
import glob = require("glob");
import { dirname, relative } from "path";
import { realpathSync, readFileSync, lstatSync } from "fs";

export default class DeployUi extends Command {
  private readonly UI_PATH = realpathSync(
    dirname(require.resolve("glob")) + "/../@rank-my-reps/ui/build"
  );
  static description = "Deploy Rank My Reps UI to S3";

  static examples = [`$ rmr-deploy deploy-ui`];

  public async run() {
    if (!process.env.STATIC_DEPLOY_BUCKET) {
      throw new Error("Missing required variable STATIC_DEPLOY_URL");
    }
    if (!process.env.ORIGIN_ACCESS_USER) {
      throw new Error("Missing required variable ORIGIN_ACCESS_USER");
    }
    console.log("Bucket:", process.env.STATIC_DEPLOY_BUCKET);
    console.log("User:", process.env.ORIGIN_ACCESS_USER);
    const s3 = new AWS.S3();
    const globPattern = this.UI_PATH + "/**/*";
    console.log("Glob", globPattern);
    glob(globPattern, async (err, result) => {
      if (err) throw err;

      await Promise.all(
        result.map(async r => {
          if (lstatSync(r).isDirectory()) return;
          console.log("Uploading", r);
          const targetPath = relative(this.UI_PATH, r).replace(/\\/g, "/");
          const result = await s3
            .putObject({
              Bucket: process.env.STATIC_DEPLOY_BUCKET as string,
              Key: targetPath,
              Body: readFileSync(r),
              GrantRead: `id=${process.env.ORIGIN_ACCESS_USER}`
            })
            .promise();
          console.log("Uploaded", targetPath, result);
        })
      );
      console.log("Finished uploading files.");
    });

    return;
  }
}
