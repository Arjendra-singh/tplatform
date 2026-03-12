# Terraform (Sprint 5 baseline)

This module provisions baseline AWS ECS/Fargate runtime components for the API.

## Usage

```bash
terraform init
terraform plan \
  -var aws_region=ap-south-1 \
  -var project=tender-sahayak \
  -var environment=prod \
  -var container_image=ghcr.io/example/tender-sahayak-api:latest
```

> Note: networking (VPC/subnets/ALB/SG) is expected from a shared platform module and intentionally omitted in this baseline.
