import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AllowedMethods,
  CloudFrontWebDistribution,
  CloudFrontWebDistributionProps,
  Distribution,
  SSLMethod,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import { config } from "../config";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

const proj = "WCSBJournal";
const { certArn } = config;

export class WcsbJournalStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const websiteBucket = new Bucket(this, "WebsiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset("./src/.next/out")],
      destinationBucket: websiteBucket,
    });

    new Distribution(this, `${proj}Distribution`, {
      defaultBehavior: {
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        origin: new S3Origin(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: "/404/index.html",
          ttl: Duration.minutes(30),
        },
        {
          httpStatus: 500,
          responseHttpStatus: 500,
          responsePagePath: "/500/index.html",
          ttl: Duration.minutes(30),
        },
      ],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2019,
      certificate: certArn
        ? Certificate.fromCertificateArn(this, "SSLCertificate", certArn)
        : undefined,
      domainNames: certArn ? ["cory.school"] : undefined,
    });
  }
}
