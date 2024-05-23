#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { WcsbJournalStack } from "../lib/wcsb-journal-stack";

const app = new cdk.App();
new WcsbJournalStack(app, "WcsbJournalStack");
