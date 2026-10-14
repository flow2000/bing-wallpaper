#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 GitHub 仓库 flow2000/bing-wallpaper-api 的 data 目录拉取 xx_all.json，
生成符合 SEO 规范的 sitemap.xml 网址地图。

数据来源：https://github.com/flow2000/bing-wallpaper-api/tree/master/data
对应 raw URL：https://raw.githubusercontent.com/flow2000/bing-wallpaper-api/master/data/{mkt}_all.json

包含的页面类型（按 SEO 优先级排序）：
  1. 首页        https://bimg.cc/index.html          priority=1.0  changefreq=daily
  2. 关于页      https://bimg.cc/about.html          priority=0.5  changefreq=monthly
  3. 地区页      https://bimg.cc/region/{mkt}.html   priority=0.9  changefreq=daily
  4. 壁纸详情页  https://bimg.cc/wallpaper/detail/{mkt}-{id}.html
                                                        priority=0.8  changefreq=yearly

URL 格式与壁纸项目 prerender.js 保持一致。

SEO 规范说明：
  - 首页优先级最高（1.0），搜索引擎最常抓取
  - 地区页内容每日更新，changefreq=daily，priority=0.9
  - 壁纸详情页内容发布后基本不变，changefreq=yearly，priority=0.8
  - 关于页更新频率低，changefreq=monthly，priority=0.5
  - lastmod 使用 YYYY-MM-DD 格式，符合 sitemaps.org 规范
  - URL 全部使用完整绝对路径，避免重复索引

用法：
  python scripts/generate_sitemap.py                 # 生成所有地区的 sitemap.xml
  python scripts/generate_sitemap.py zh-CN           # 仅生成指定地区的 sitemap.xml
  python scripts/generate_sitemap.py -o sitemap.xml  # 指定输出文件路径
"""
import os
import sys
import time
from datetime import date
from xml.dom import minidom
from xml.etree import ElementTree as ET

import requests

SITE = "https://bimg.cc"
# GitHub raw 内容地址（flow2000/bing-wallpaper-api 仓库 master 分支的 data 目录）
GITHUB_RAW = "https://raw.githubusercontent.com/flow2000/bing-wallpaper-api/master/data"

# 地区列表（与 submit_seo.py、prerender.js 保持一致）
REGIONS = [
    "zh-CN",
    "en-US",
    "ja-JP",
    "de-DE",
    "en-GB",
    "fr-FR",
    "it-IT",
    "en-CA",
    "en-IN",
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 默认输出到 static/sitemap.xml（会被构建流程拷贝到 dist 根目录）
DEFAULT_OUTPUT = os.path.join(BASE_DIR, "..", "static", "sitemap.xml")


def _today_str():
    """返回今天的日期字符串 YYYY-MM-DD。"""
    return date.today().isoformat()


def fetch_wallpapers(mkt):
    """
    从 GitHub raw 拉取指定地区的 {mkt}_all.json，解析壁纸列表。
    返回 [(id, datetime_str), ...]，按 id 降序排列。
    """
    url = "{raw}/{mkt}_all.json".format(raw=GITHUB_RAW, mkt=mkt)

    try:
        resp = requests.get(url, timeout=30, headers={"User-Agent": "bing-wallpaper-sitemap/1.0"})
        resp.raise_for_status()
        body = resp.json()
    except Exception as e:
        # 失败重试 1 次
        print("[warn] {mkt} 拉取失败: {err}".format(mkt=mkt, err=e))
        time.sleep(2)
        try:
            resp = requests.get(url, timeout=30, headers={"User-Agent": "bing-wallpaper-sitemap/1.0"})
            resp.raise_for_status()
            body = resp.json()
        except Exception as e2:
            print("[error] {mkt} 重试仍失败: {err}，跳过该地区".format(mkt=mkt, err=e2))
            return []

    if body.get("code") != 200:
        print("[error] {mkt} JSON 返回错误: code={code} msg={msg}".format(
            mkt=mkt, code=body.get("code"), msg=body.get("msg")
        ))
        return []

    data = body.get("data", [])
    items = []
    seen = set()
    for item in data:
        pid = item.get("id")
        if pid is None or pid in seen:
            continue
        seen.add(pid)
        dt = item.get("datetime") or item.get("created_time") or ""
        items.append((pid, dt))

    # 按 id 降序排列
    items.sort(key=lambda x: x[0], reverse=True)
    print("[fetch] {mkt}: 共 {n} 条（来自 GitHub data/{mkt}_all.json）".format(
        mkt=mkt, n=len(items)
    ))
    return items


def _add_url(urlset, loc, lastmod=None, changefreq=None, priority=None):
    """向 urlset 中添加一个 <url> 节点。"""
    url_elem = ET.SubElement(urlset, "url")

    loc_elem = ET.SubElement(url_elem, "loc")
    loc_elem.text = loc

    if lastmod:
        lastmod_elem = ET.SubElement(url_elem, "lastmod")
        lastmod_elem.text = lastmod

    if changefreq:
        changefreq_elem = ET.SubElement(url_elem, "changefreq")
        changefreq_elem.text = changefreq

    if priority:
        priority_elem = ET.SubElement(url_elem, "priority")
        priority_elem.text = priority


def generate_sitemap(regions, output_path):
    """
    生成 sitemap.xml 文件。

    Args:
        regions: 要包含的地区列表
        output_path: 输出文件路径（含文件名）
    """
    today = _today_str()

    urlset = ET.Element("urlset")
    urlset.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

    total = 0
    region_data = {}  # mkt -> [(id, dt), ...]

    # ---------- 1. 首页（优先级最高） ----------
    _add_url(
        urlset,
        loc=SITE + "/index.html",
        lastmod=today,
        changefreq="daily",
        priority="1.0",
    )
    total += 1

    # ---------- 2. 关于页 ----------
    _add_url(
        urlset,
        loc=SITE + "/about.html",
        lastmod=today,
        changefreq="monthly",
        priority="0.5",
    )
    total += 1

    # ---------- 3. 地区页 ----------
    for mkt in regions:
        wallpapers = fetch_wallpapers(mkt)
        region_data[mkt] = wallpapers
        # 地区页的 lastmod 使用该地区最新壁纸的发布日期，没有则用今天
        latest_date = wallpapers[0][1] if wallpapers else today
        _add_url(
            urlset,
            loc="{site}/region/{mkt}.html".format(site=SITE, mkt=mkt),
            lastmod=latest_date or today,
            changefreq="daily",
            priority="0.9",
        )
        total += 1

    # ---------- 4. 壁纸详情页 ----------
    for mkt in regions:
        wallpapers = region_data.get(mkt, [])
        for pid, dt in wallpapers:
            _add_url(
                urlset,
                loc="{site}/wallpaper/detail/{mkt}-{pid}.html".format(
                    site=SITE, mkt=mkt, pid=pid
                ),
                lastmod=dt if dt else None,
                changefreq="yearly",
                priority="0.8",
            )
            total += 1

        print("[sitemap] {mkt}: 地区页 1 + 详情页 {n} 条".format(
            mkt=mkt, n=len(wallpapers)
        ))

    # 写入文件（使用 minidom 美化缩进，保证 XML 格式规范）
    rough_string = ET.tostring(urlset, encoding="utf-8")
    reparsed = minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ", encoding="utf-8")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(pretty_xml)

    detail_count = total - 2 - len(regions)
    print("[sitemap] 总计 {total} 条 URL（首页 1 + 关于页 1 + 地区页 {nr} + 详情页 {nd}），已写入: {path}".format(
        total=total,
        nr=len(regions),
        nd=detail_count,
        path=output_path,
    ))


def main():
    import argparse
    parser = argparse.ArgumentParser(description="生成 Bing 壁纸 sitemap.xml")
    parser.add_argument(
        "region",
        nargs="?",
        default=None,
        help="指定地区（如 zh-CN），不指定则生成所有地区",
    )
    parser.add_argument(
        "-o", "--output",
        default=DEFAULT_OUTPUT,
        help="输出文件路径，默认 static/sitemap.xml",
    )
    args = parser.parse_args()

    # 确定地区列表
    if args.region:
        if args.region not in REGIONS:
            print("[error] 未知地区: {r}，支持的地区: {regions}".format(
                r=args.region, regions=", ".join(REGIONS)
            ))
            sys.exit(1)
        regions = [args.region]
    else:
        regions = REGIONS

    output_path = args.output
    print("[sitemap] 生成地区: {regions}".format(regions=", ".join(regions)))
    generate_sitemap(regions, output_path)


if __name__ == "__main__":
    main()
