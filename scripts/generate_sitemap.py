#!/usr/bin/env python3
"""
Generate sitemap.xml for bing-wallpaper static site.

Scans the dist/ directory for HTML files and generates a sitemap.xml
with proper lastmod dates based on file modification times.
"""

import os
import re
from datetime import datetime, timezone
from xml.etree import ElementTree as ET
from xml.dom import minidom

# Configuration
BASE_URL = "https://bimg.cc"
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dist")
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "static")
OUTPUT_FILE = os.path.join(STATIC_DIR, "sitemap.xml")

# Pages that should be excluded from sitemap
EXCLUDE_PATTERNS = [
    "baidu_verify",
]

# Priority and changefreq rules
def get_page_priority(rel_path):
    """Get priority based on page type."""
    if rel_path == "index.html":
        return "1.0"
    if rel_path.startswith("region/"):
        return "0.9"
    if rel_path.startswith("wallpaper/detail/"):
        return "0.7"
    if rel_path == "about.html":
        return "0.5"
    return "0.5"

def get_changefreq(rel_path):
    """Get changefreq based on page type."""
    if rel_path == "index.html" or rel_path.startswith("region/"):
        return "daily"
    return "monthly"

def get_file_mtime(filepath):
    """Get file modification time as YYYY-MM-DD string."""
    mtime = os.path.getmtime(filepath)
    dt = datetime.fromtimestamp(mtime, tz=timezone.utc)
    return dt.strftime("%Y-%m-%d")

def should_exclude(rel_path):
    """Check if file should be excluded from sitemap."""
    for pattern in EXCLUDE_PATTERNS:
        if pattern in rel_path:
            return True
    return False

def sort_key(rel_path):
    """Sort key for sitemap entries.
    
    Sort order:
    1. index.html
    2. about.html
    3. region pages (sorted by name)
    4. wallpaper detail pages (sorted by region, then by id descending)
    """
    if rel_path == "index.html":
        return (0, "", 0)
    if rel_path == "about.html":
        return (1, "", 0)
    if rel_path.startswith("region/"):
        region = rel_path.replace("region/", "").replace(".html", "")
        return (2, region, 0)
    if rel_path.startswith("wallpaper/detail/"):
        # Extract region and id from filename like "zh-CN-3850.html"
        basename = os.path.basename(rel_path).replace(".html", "")
        # Match pattern: region-id (e.g., zh-CN-3850, en-US-123)
        match = re.match(r'^(.+)-(\d+)$', basename)
        if match:
            region = match.group(1)
            page_id = int(match.group(2))
            # Negative id for descending order (newer wallpapers first)
            return (3, region, -page_id)
        return (3, basename, 0)
    return (4, rel_path, 0)

def generate_sitemap():
    """Generate sitemap.xml from HTML files in dist directory."""
    # Collect all HTML files
    html_files = []
    for root, dirs, files in os.walk(DIST_DIR):
        for filename in files:
            if filename.endswith(".html"):
                filepath = os.path.join(root, filename)
                rel_path = os.path.relpath(filepath, DIST_DIR).replace("\\", "/")
                if not should_exclude(rel_path):
                    html_files.append((rel_path, filepath))

    # Sort files
    html_files.sort(key=lambda x: sort_key(x[0]))

    # Create XML structure
    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    for rel_path, filepath in html_files:
        url = ET.SubElement(urlset, "url")

        loc = ET.SubElement(url, "loc")
        loc.text = f"{BASE_URL}/{rel_path}"

        lastmod = ET.SubElement(url, "lastmod")
        lastmod.text = get_file_mtime(filepath)

        changefreq = ET.SubElement(url, "changefreq")
        changefreq.text = get_changefreq(rel_path)

        priority = ET.SubElement(url, "priority")
        priority.text = get_page_priority(rel_path)

    # Pretty print XML
    rough_string = ET.tostring(urlset, encoding="unicode")
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ", encoding="UTF-8").decode("UTF-8")

    # Remove extra blank lines
    lines = [line for line in pretty_xml.split("\n") if line.strip()]
    pretty_xml = "\n".join(lines) + "\n"

    # Write to file
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="UTF-8") as f:
        f.write(pretty_xml)

    print(f"Generated sitemap with {len(html_files)} URLs")
    print(f"Output: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_sitemap()
