terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" { type = string }
variable "project" { type = string }
variable "environment" { type = string }
variable "container_image" { type = string }
variable "desired_count" { type = number  default = 2 }

resource "aws_cloudwatch_log_group" "api" {
  name              = "/${var.project}/${var.environment}/api"
  retention_in_days = 30
}

resource "aws_ecs_cluster" "this" {
  name = "${var.project}-${var.environment}"
}

resource "aws_iam_role" "task_exec" {
  name = "${var.project}-${var.environment}-task-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "ecs-tasks.amazonaws.com" },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "task_exec" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.task_exec.arn

  container_definitions = jsonencode([
    {
      name      = "api"
      image     = var.container_image
      essential = true
      portMappings = [{ containerPort = 3001, protocol = "tcp" }]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:3001/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 20
      }
    }
  ])
}

output "ecs_cluster" { value = aws_ecs_cluster.this.name }
output "task_definition" { value = aws_ecs_task_definition.api.arn }
