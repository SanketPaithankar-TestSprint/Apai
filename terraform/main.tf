# ------------------------------------------------------------------------------
# S3 BUCKET FOR HOSTING
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "admin_panel" {
  bucket = "${var.project_name}-static-hosting"
}

# Ensure the bucket is private (CloudFront will access it securely via OAC)
resource "aws_s3_bucket_ownership_controls" "admin_panel" {
  bucket = aws_s3_bucket.admin_panel.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "admin_panel" {
  bucket                  = aws_s3_bucket.admin_panel.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# CLOUDFRONT ORIGIN ACCESS CONTROL (OAC)
# ------------------------------------------------------------------------------
resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for ${var.project_name} S3 Access"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ------------------------------------------------------------------------------
# CLOUDFRONT DISTRIBUTION
# ------------------------------------------------------------------------------
resource "aws_cloudfront_distribution" "admin_panel" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # Map 404/403 errors to index.html for client-side routing fallback
  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  origin {
    domain_name              = aws_s3_bucket.admin_panel.bucket_regional_domain_name
    origin_id                = aws_s3_bucket.admin_panel.id
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = aws_s3_bucket.admin_panel.id

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # Uses the default cloudfront.net domain. 
  # Note: If adding a custom domain, you need `aliases` and a valid ACM certificate.
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Environment = "prod"
    Project     = var.project_name
  }
}

# ------------------------------------------------------------------------------
# S3 BUCKET POLICY (Allow CloudFront to access the bucket objects)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket_policy" "admin_panel" {
  bucket = aws_s3_bucket.admin_panel.id
  policy = templatefile("${path.module}/s3_bucket_policy.json.tftpl", {
    bucket_arn     = aws_s3_bucket.admin_panel.arn
    cloudfront_arn = aws_cloudfront_distribution.admin_panel.arn
  })
}
