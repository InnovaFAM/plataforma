#!/bin/bash

ENV=$1

cd ./terraform/ && rm .terraform.lock.hcl terraform.tfvars && rm -r .terraform/
aws s3 cp s3://innovafam-infrastructure/"$ENV"/innovafam-api/terraform.tfvars ./
terraform init -backend-config=./configurations/"$ENV".conf