#!/usr/bin/env bash
apt-get install -y tesseract-ocr tesseract-ocr-eng 2>/dev/null || true
pip install -r requirements.txt
