#!/bin/bash
# Usage: ./new_post.sh "Post Title"
set -e
TITLE="$1"
DATE=$(date +%Y-%m-%d)
SLUG=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]+/-/g' | sed 's/^-\|-$//g')
FILENAME="_posts/${DATE}-${SLUG}.md"
cat > "$FILENAME" <<EOF
---
title: "$TITLE"
date: $DATE
layout: post
tags: []
---

Write your post in Markdown here.
EOF
echo "New post created: $FILENAME"
