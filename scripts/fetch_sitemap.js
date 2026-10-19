#!/usr/bin/env node
'use strict'
/**
 * prebuild 钩子：构建前从 bing-wallpaper-api 仓库拉取最新 sitemap.xml。
 *
 * sitemap.xml 由 bing-wallpaper-api 仓库的 update-sitemap workflow 每日生成并提交：
 *   https://github.com/flow2000/bing-wallpaper-api/blob/master/sitemap/sitemap.xml
 * 本脚本在 npm run build 前执行，将其下载到 static/sitemap.xml，
 * 随后由 webpack copy-webpack-plugin 拷贝进 dist 根目录。
 *
 * 拉取失败时不阻断构建：若 static/sitemap.xml 已存在（仓库内兜底副本），
 * 打印警告并继续；仅当本地完全无副本时以非零码退出。
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

const SITEMAP_URL =
  'https://raw.githubusercontent.com/flow2000/bing-wallpaper-api/master/sitemap/sitemap.xml'
const OUTPUT = path.join(__dirname, '..', 'static', 'sitemap.xml')
const TIMEOUT_MS = 30000

function download(url, redirectsLeft) {
  return new Promise((resolve, reject) => {
    const req = https
      .get(url, { headers: { 'User-Agent': 'bing-wallpaper-prebuild/1.0' } }, res => {
        // 跟随重定向（raw.githubusercontent 偶尔 302）
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume()
          if (redirectsLeft <= 0) {
            reject(new Error('重定向次数过多'))
            return
          }
          resolve(download(res.headers.location, redirectsLeft - 1))
          return
        }
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error('HTTP ' + res.statusCode))
          return
        }
        const chunks = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error('请求超时（' + TIMEOUT_MS / 1000 + 's）'))
    })
    req.on('error', reject)
  })
}

async function main() {
  console.log('[prebuild] 拉取最新 sitemap.xml: ' + SITEMAP_URL)
  try {
    const buf = await download(SITEMAP_URL, 3)
    // 基本校验：XML 且包含 urlset，避免把错误页写进 sitemap
    const head = buf.slice(0, 2000).toString('utf8')
    if (head.indexOf('<urlset') === -1) {
      throw new Error('下载内容不是有效的 sitemap（缺少 <urlset>）')
    }
    fs.writeFileSync(OUTPUT, buf)
    console.log(
      '[prebuild] sitemap.xml 已更新（' +
        (buf.length / 1024 / 1024).toFixed(2) +
        ' MiB）→ ' +
        path.relative(process.cwd(), OUTPUT)
    )
  } catch (err) {
    if (fs.existsSync(OUTPUT)) {
      console.warn(
        '[prebuild] 警告：sitemap.xml 拉取失败（' +
          err.message +
          '），使用仓库内现有副本继续构建'
      )
      return
    }
    console.error('[prebuild] 错误：sitemap.xml 拉取失败且本地无副本：' + err.message)
    process.exit(1)
  }
}

main()
