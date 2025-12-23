terraform {
  backend "s3" {
    bucket = "mis-tfstates-wotklaus"
    key    = "tfstate/terraform.tfstate"
    region = "us-east-1"
  }
}