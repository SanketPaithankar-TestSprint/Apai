terraform {
  backend "s3" {
    bucket  = "apai-admin-terraform-state" # Replace with your actual state bucket name
    key     = "admin-panel/prod/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  # Set the AWS region for your infrastructure (e.g., us-east-1 is recommended for CloudFront certificates if you eventually use a custom domain)
  region = var.aws_region
}
