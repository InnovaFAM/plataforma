resource "aws_dynamodb_table" "core_business" {
  name                        = "CoreBusiness_${var.aws_env}"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "parentId"
    type = "S"
  }

  attribute {
    name = "entityId"
    type = "S"
  }

  global_secondary_index {
    name            = "ParentIndex"
    key_schema {
      attribute_name = "parentId"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "entityId"
      key_type       = "RANGE"
    }
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = false
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "audit_logs" {
  name                        = "AuditLogs_${var.aws_env}"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name            = "CategoryIndex"

    key_schema {
      attribute_name = "category"
      key_type       = "HASH"
    }

    key_schema {
      attribute_name = "sk"
      key_type       = "RANGE"
    }
    projection_type = "ALL"
  }

  point_in_time_recovery {
    enabled = false
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "temps" {
  name                        = "Temps_${var.aws_env}"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true

  hash_key  = "pk"

  attribute {
    name = "pk"
    type = "S"
  }

  ttl {
    enabled = true
    attribute_name = "ttl"

  }

  point_in_time_recovery {
    enabled = false
  }

  tags = local.common_tags
}

resource "aws_dynamodb_table" "analytics" {
  name                        = "Analytics_${var.aws_env}"
  billing_mode                = "PAY_PER_REQUEST"
  deletion_protection_enabled = true

  hash_key  = "pk"
  range_key = "sk"

  attribute {
    name = "pk"
    type = "S"
  }

  attribute {
    name = "sk"
    type = "S"
  }

  point_in_time_recovery {
    enabled = false
  }

  tags = local.common_tags
}
