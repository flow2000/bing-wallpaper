// 前端内置地名 → 经纬度词典
// 数据源：必应壁纸 API 的 copyright 字段只含地点文字，无坐标。
// 本模块用于把地点文字近似映射到地球坐标：先匹配具体地点，再匹配国家，最后回退到地区市场中心。

// 9 个地区市场的默认中心坐标（最终回退）
export const REGION_CENTER = {
  'zh-CN': { lat: 35.8617, lng: 104.1954, name: '中国' },
  'en-US': { lat: 37.0902, lng: -95.7129, name: '美国' },
  'ja-JP': { lat: 36.2048, lng: 138.2529, name: '日本' },
  'de-DE': { lat: 51.1657, lng: 10.4515, name: '德国' },
  'fr-FR': { lat: 46.2276, lng: 2.2137, name: '法国' },
  'it-IT': { lat: 41.8719, lng: 12.5674, name: '意大利' },
  'en-GB': { lat: 55.3781, lng: -3.436, name: '英国' },
  'en-CA': { lat: 56.1304, lng: -106.3468, name: '加拿大' },
  'en-IN': { lat: 20.5937, lng: 78.9629, name: '印度' }
}

// 具体地点（城市 / 著名景点 / 自然景观）→ 坐标
// key 同时支持中英文，命中后 name 用中文规范名展示
const PLACES = {
  '维多利亚港': { lat: 22.288, lng: 114.169, name: '香港' },
  '香港': { lat: 22.3193, lng: 114.1694, name: '香港' },
  '北京': { lat: 39.9042, lng: 116.4074, name: '北京' },
  '上海': { lat: 31.2304, lng: 121.4737, name: '上海' },
  '广州': { lat: 23.1291, lng: 113.2644, name: '广州' },
  '深圳': { lat: 22.5431, lng: 114.0579, name: '深圳' },
  '杭州': { lat: 30.2741, lng: 120.1551, name: '杭州' },
  '宣城': { lat: 30.9407, lng: 118.7587, name: '宣城' },
  '张家界': { lat: 29.117, lng: 110.479, name: '张家界' },
  '桂林': { lat: 25.2736, lng: 110.29, name: '桂林' },
  '黄山': { lat: 30.134, lng: 118.167, name: '黄山' },
  '九寨沟': { lat: 33.26, lng: 103.918, name: '九寨沟' },
  '拉萨': { lat: 29.652, lng: 91.172, name: '拉萨' },
  '西藏': { lat: 29.652, lng: 91.172, name: '西藏' },
  '纽约': { lat: 40.7128, lng: -74.006, name: '纽约' },
  'New York': { lat: 40.7128, lng: -74.006, name: '纽约' },
  '洛杉矶': { lat: 34.0522, lng: -118.2437, name: '洛杉矶' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, name: '洛杉矶' },
  '旧金山': { lat: 37.7749, lng: -122.4194, name: '旧金山' },
  'San Francisco': { lat: 37.7749, lng: -122.4194, name: '旧金山' },
  '黄石': { lat: 44.428, lng: -110.5885, name: '黄石国家公园' },
  'Yellowstone': { lat: 44.428, lng: -110.5885, name: '黄石国家公园' },
  '大峡谷': { lat: 36.1069, lng: -112.1129, name: '大峡谷' },
  'Grand Canyon': { lat: 36.1069, lng: -112.1129, name: '大峡谷' },
  '拱门国家公园': { lat: 38.7331, lng: -109.5925, name: '拱门国家公园' },
  'Arches': { lat: 38.7331, lng: -109.5925, name: '拱门国家公园' },
  '优胜美地': { lat: 37.8651, lng: -119.5383, name: '优胜美地' },
  'Yosemite': { lat: 37.8651, lng: -119.5383, name: '优胜美地' },
  '罗斯福国家公园': { lat: 46.9786, lng: -103.5387, name: '罗斯福国家公园' },
  '哈莱亚卡拉': { lat: 20.7097, lng: -156.2532, name: '哈莱亚卡拉国家公园' },
  '夏威夷': { lat: 19.8968, lng: -155.5828, name: '夏威夷' },
  'Hawaii': { lat: 19.8968, lng: -155.5828, name: '夏威夷' },
  '毛伊岛': { lat: 20.7984, lng: -156.3319, name: '毛伊岛' },
  '伦敦': { lat: 51.5074, lng: -0.1278, name: '伦敦' },
  'London': { lat: 51.5074, lng: -0.1278, name: '伦敦' },
  '湖区': { lat: 54.4609, lng: -3.0886, name: '英格兰湖区' },
  'Lake District': { lat: 54.4609, lng: -3.0886, name: '英格兰湖区' },
  '爱丁堡': { lat: 55.9533, lng: -3.1883, name: '爱丁堡' },
  '巴黎': { lat: 48.8566, lng: 2.3522, name: '巴黎' },
  'Paris': { lat: 48.8566, lng: 2.3522, name: '巴黎' },
  '普罗旺斯': { lat: 43.9352, lng: 6.0679, name: '普罗旺斯' },
  'Provence': { lat: 43.9352, lng: 6.0679, name: '普罗旺斯' },
  '多洛米蒂': { lat: 46.4102, lng: 11.844, name: '多洛米蒂山脉' },
  'Dolomites': { lat: 46.4102, lng: 11.844, name: '多洛米蒂山脉' },
  '布莱埃斯湖': { lat: 46.6981, lng: 12.083, name: '布莱埃斯湖' },
  '罗马': { lat: 41.9028, lng: 12.4964, name: '罗马' },
  'Rome': { lat: 41.9028, lng: 12.4964, name: '罗马' },
  '威尼斯': { lat: 45.4408, lng: 12.3155, name: '威尼斯' },
  'Venice': { lat: 45.4408, lng: 12.3155, name: '威尼斯' },
  '托斯卡纳': { lat: 43.7711, lng: 11.2486, name: '托斯卡纳' },
  '柏林': { lat: 52.52, lng: 13.405, name: '柏林' },
  'Berlin': { lat: 52.52, lng: 13.405, name: '柏林' },
  '黑森林': { lat: 48.275, lng: 8.15, name: '黑森林' },
  'Black Forest': { lat: 48.275, lng: 8.15, name: '黑森林' },
  '新天鹅堡': { lat: 47.5576, lng: 10.7498, name: '新天鹅堡' },
  '东京': { lat: 35.6762, lng: 139.6503, name: '东京' },
  'Tokyo': { lat: 35.6762, lng: 139.6503, name: '东京' },
  '富士山': { lat: 35.3606, lng: 138.7274, name: '富士山' },
  'Mount Fuji': { lat: 35.3606, lng: 138.7274, name: '富士山' },
  '京都': { lat: 35.0116, lng: 135.7681, name: '京都' },
  'Kyoto': { lat: 35.0116, lng: 135.7681, name: '京都' },
  '孟买': { lat: 19.076, lng: 72.8777, name: '孟买' },
  'Mumbai': { lat: 19.076, lng: 72.8777, name: '孟买' },
  '泰姬陵': { lat: 27.1751, lng: 78.0421, name: '泰姬陵' },
  'Taj Mahal': { lat: 27.1751, lng: 78.0421, name: '泰姬陵' },
  '塞维利亚': { lat: 37.3891, lng: -5.9845, name: '塞维利亚' },
  'Seville': { lat: 37.3891, lng: -5.9845, name: '塞维利亚' },
  '巴塞罗那': { lat: 41.3874, lng: 2.1686, name: '巴塞罗那' },
  'Barcelona': { lat: 41.3874, lng: 2.1686, name: '巴塞罗那' },
  '马德里': { lat: 40.4168, lng: -3.7038, name: '马德里' },
  'Madrid': { lat: 40.4168, lng: -3.7038, name: '马德里' },
  '里斯本': { lat: 38.7223, lng: -9.1393, name: '里斯本' },
  '圣托里尼': { lat: 36.3932, lng: 25.4615, name: '圣托里尼' },
  'Santorini': { lat: 36.3932, lng: 25.4615, name: '圣托里尼' },
  '迪拜': { lat: 25.2048, lng: 55.2708, name: '迪拜' },
  'Dubai': { lat: 25.2048, lng: 55.2708, name: '迪拜' },
  '悉尼': { lat: -33.8688, lng: 151.2093, name: '悉尼' },
  'Sydney': { lat: -33.8688, lng: 151.2093, name: '悉尼' },
  '墨尔本': { lat: -37.8136, lng: 144.9631, name: '墨尔本' },
  '大堡礁': { lat: -18.2871, lng: 147.6992, name: '大堡礁' },
  'Great Barrier Reef': { lat: -18.2871, lng: 147.6992, name: '大堡礁' },
  '皇后镇': { lat: -45.0312, lng: 168.6626, name: '皇后镇' },
  '雷克雅未克': { lat: 64.1466, lng: -21.9426, name: '雷克雅未克' },
  '尼亚加拉': { lat: 43.0962, lng: -79.0377, name: '尼亚加拉瀑布' },
  'Niagara': { lat: 43.0962, lng: -79.0377, name: '尼亚加拉瀑布' },
  '班夫': { lat: 51.1784, lng: -115.5708, name: '班夫' },
  'Banff': { lat: 51.1784, lng: -115.5708, name: '班夫' },
  '亚伯拉罕湖': { lat: 52.223, lng: -116.424, name: '亚伯拉罕湖' },
  '哈得孙湾': { lat: 60.0, lng: -85.0, name: '哈得孙湾' },
  '里约热内卢': { lat: -22.9068, lng: -43.1729, name: '里约热内卢' },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, name: '里约热内卢' },
  '亚马逊': { lat: -3.4653, lng: -62.2159, name: '亚马逊雨林' },
  'Amazon': { lat: -3.4653, lng: -62.2159, name: '亚马逊雨林' },
  '马丘比丘': { lat: -13.1631, lng: -72.545, name: '马丘比丘' },
  'Machu Picchu': { lat: -13.1631, lng: -72.545, name: '马丘比丘' },
  '加拉帕戈斯': { lat: -0.9538, lng: -90.9656, name: '加拉帕戈斯群岛' },
  '乞力马扎罗': { lat: -3.0674, lng: 37.3556, name: '乞力马扎罗山' },
  'Kilimanjaro': { lat: -3.0674, lng: 37.3556, name: '乞力马扎罗山' },
  '塞伦盖蒂': { lat: -2.3333, lng: 34.8333, name: '塞伦盖蒂' },
  '撒哈拉': { lat: 23.4162, lng: 25.6628, name: '撒哈拉沙漠' },
  'Sahara': { lat: 23.4162, lng: 25.6628, name: '撒哈拉沙漠' },
  '死海': { lat: 31.5, lng: 35.5, name: '死海' },
  '洛矶山': { lat: 51.4254, lng: -116.1777, name: '洛矶山' },
  '落基山': { lat: 51.4254, lng: -116.1777, name: '落基山' }
}

// 国家 → 坐标（key 中英文）
const COUNTRIES = {
  '中国': { lat: 35.8617, lng: 104.1954, name: '中国' },
  'China': { lat: 35.8617, lng: 104.1954, name: '中国' },
  '美国': { lat: 37.0902, lng: -95.7129, name: '美国' },
  'United States': { lat: 37.0902, lng: -95.7129, name: '美国' },
  'America': { lat: 37.0902, lng: -95.7129, name: '美国' },
  '加拿大': { lat: 56.1304, lng: -106.3468, name: '加拿大' },
  'Canada': { lat: 56.1304, lng: -106.3468, name: '加拿大' },
  '英国': { lat: 55.3781, lng: -3.436, name: '英国' },
  'United Kingdom': { lat: 55.3781, lng: -3.436, name: '英国' },
  '英格兰': { lat: 52.3555, lng: -1.1743, name: '英格兰' },
  'England': { lat: 52.3555, lng: -1.1743, name: '英格兰' },
  '苏格兰': { lat: 56.4907, lng: -4.2026, name: '苏格兰' },
  'Scotland': { lat: 56.4907, lng: -4.2026, name: '苏格兰' },
  '威尔士': { lat: 52.1307, lng: -3.7837, name: '威尔士' },
  '德国': { lat: 51.1657, lng: 10.4515, name: '德国' },
  'Germany': { lat: 51.1657, lng: 10.4515, name: '德国' },
  '法国': { lat: 46.2276, lng: 2.2137, name: '法国' },
  'France': { lat: 46.2276, lng: 2.2137, name: '法国' },
  '意大利': { lat: 41.8719, lng: 12.5674, name: '意大利' },
  'Italy': { lat: 41.8719, lng: 12.5674, name: '意大利' },
  '西班牙': { lat: 40.4637, lng: -3.7492, name: '西班牙' },
  'Spain': { lat: 40.4637, lng: -3.7492, name: '西班牙' },
  '葡萄牙': { lat: 39.3999, lng: -8.2245, name: '葡萄牙' },
  'Portugal': { lat: 39.3999, lng: -8.2245, name: '葡萄牙' },
  '希腊': { lat: 39.0742, lng: 21.8243, name: '希腊' },
  'Greece': { lat: 39.0742, lng: 21.8243, name: '希腊' },
  '日本': { lat: 36.2048, lng: 138.2529, name: '日本' },
  'Japan': { lat: 36.2048, lng: 138.2529, name: '日本' },
  '印度': { lat: 20.5937, lng: 78.9629, name: '印度' },
  'India': { lat: 20.5937, lng: 78.9629, name: '印度' },
  '巴西': { lat: -14.235, lng: -51.9253, name: '巴西' },
  'Brazil': { lat: -14.235, lng: -51.9253, name: '巴西' },
  '巴哈马': { lat: 25.0343, lng: -77.3963, name: '巴哈马' },
  'Bahamas': { lat: 25.0343, lng: -77.3963, name: '巴哈马' },
  '澳大利亚': { lat: -25.2744, lng: 133.7751, name: '澳大利亚' },
  'Australia': { lat: -25.2744, lng: 133.7751, name: '澳大利亚' },
  '新西兰': { lat: -40.9006, lng: 174.886, name: '新西兰' },
  'New Zealand': { lat: -40.9006, lng: 174.886, name: '新西兰' },
  '俄罗斯': { lat: 61.524, lng: 105.3188, name: '俄罗斯' },
  'Russia': { lat: 61.524, lng: 105.3188, name: '俄罗斯' },
  '韩国': { lat: 35.9078, lng: 127.7669, name: '韩国' },
  'Korea': { lat: 35.9078, lng: 127.7669, name: '韩国' },
  '泰国': { lat: 15.87, lng: 100.9925, name: '泰国' },
  'Thailand': { lat: 15.87, lng: 100.9925, name: '泰国' },
  '越南': { lat: 14.0583, lng: 108.2772, name: '越南' },
  'Vietnam': { lat: 14.0583, lng: 108.2772, name: '越南' },
  '印度尼西亚': { lat: -0.7893, lng: 113.9213, name: '印度尼西亚' },
  'Indonesia': { lat: -0.7893, lng: 113.9213, name: '印度尼西亚' },
  '菲律宾': { lat: 12.8797, lng: 121.774, name: '菲律宾' },
  '马来西亚': { lat: 4.2105, lng: 101.9758, name: '马来西亚' },
  '新加坡': { lat: 1.3521, lng: 103.8198, name: '新加坡' },
  'Singapore': { lat: 1.3521, lng: 103.8198, name: '新加坡' },
  '埃及': { lat: 26.8206, lng: 30.8025, name: '埃及' },
  'Egypt': { lat: 26.8206, lng: 30.8025, name: '埃及' },
  '南非': { lat: -30.5595, lng: 22.9375, name: '南非' },
  'South Africa': { lat: -30.5595, lng: 22.9375, name: '南非' },
  '肯尼亚': { lat: -0.0236, lng: 37.9062, name: '肯尼亚' },
  'Kenya': { lat: -0.0236, lng: 37.9062, name: '肯尼亚' },
  '坦桑尼亚': { lat: -6.369, lng: 34.8888, name: '坦桑尼亚' },
  '摩洛哥': { lat: 31.7917, lng: -7.0926, name: '摩洛哥' },
  'Morocco': { lat: 31.7917, lng: -7.0926, name: '摩洛哥' },
  '冰岛': { lat: 64.9631, lng: -19.0208, name: '冰岛' },
  'Iceland': { lat: 64.9631, lng: -19.0208, name: '冰岛' },
  '挪威': { lat: 60.472, lng: 8.4689, name: '挪威' },
  'Norway': { lat: 60.472, lng: 8.4689, name: '挪威' },
  '瑞典': { lat: 60.1282, lng: 18.6435, name: '瑞典' },
  'Sweden': { lat: 60.1282, lng: 18.6435, name: '瑞典' },
  '芬兰': { lat: 61.9241, lng: 25.7482, name: '芬兰' },
  'Finland': { lat: 61.9241, lng: 25.7482, name: '芬兰' },
  '丹麦': { lat: 56.2639, lng: 9.5018, name: '丹麦' },
  '荷兰': { lat: 52.1326, lng: 5.2913, name: '荷兰' },
  'Netherlands': { lat: 52.1326, lng: 5.2913, name: '荷兰' },
  '比利时': { lat: 50.5039, lng: 4.4699, name: '比利时' },
  '瑞士': { lat: 46.8182, lng: 8.2275, name: '瑞士' },
  'Switzerland': { lat: 46.8182, lng: 8.2275, name: '瑞士' },
  '奥地利': { lat: 47.5162, lng: 14.5501, name: '奥地利' },
  'Austria': { lat: 47.5162, lng: 14.5501, name: '奥地利' },
  '土耳其': { lat: 38.9637, lng: 35.2433, name: '土耳其' },
  'Turkey': { lat: 38.9637, lng: 35.2433, name: '土耳其' },
  '波兰': { lat: 51.9194, lng: 19.1451, name: '波兰' },
  '捷克': { lat: 49.8175, lng: 15.473, name: '捷克' },
  '匈牙利': { lat: 47.1625, lng: 19.5033, name: '匈牙利' },
  '罗马尼亚': { lat: 45.9432, lng: 24.9668, name: '罗马尼亚' },
  '乌克兰': { lat: 48.3794, lng: 31.1656, name: '乌克兰' },
  '爱尔兰': { lat: 53.4129, lng: -8.2439, name: '爱尔兰' },
  'Ireland': { lat: 53.4129, lng: -8.2439, name: '爱尔兰' },
  '阿根廷': { lat: -38.4161, lng: -63.6167, name: '阿根廷' },
  'Argentina': { lat: -38.4161, lng: -63.6167, name: '阿根廷' },
  '智利': { lat: -35.6751, lng: -71.543, name: '智利' },
  'Chile': { lat: -35.6751, lng: -71.543, name: '智利' },
  '秘鲁': { lat: -9.19, lng: -75.0152, name: '秘鲁' },
  'Peru': { lat: -9.19, lng: -75.0152, name: '秘鲁' },
  '墨西哥': { lat: 23.6345, lng: -102.5528, name: '墨西哥' },
  'Mexico': { lat: 23.6345, lng: -102.5528, name: '墨西哥' },
  '哥伦比亚': { lat: 4.5709, lng: -74.2973, name: '哥伦比亚' },
  '古巴': { lat: 21.5218, lng: -77.7812, name: '古巴' },
  'Cuba': { lat: 21.5218, lng: -77.7812, name: '古巴' },
  '阿联酋': { lat: 23.4241, lng: 53.8478, name: '阿联酋' },
  '沙特': { lat: 23.8859, lng: 45.0792, name: '沙特阿拉伯' },
  '伊朗': { lat: 32.4279, lng: 53.688, name: '伊朗' },
  '以色列': { lat: 31.0461, lng: 34.8516, name: '以色列' },
  'Israel': { lat: 31.0461, lng: 34.8516, name: '以色列' },
  '巴基斯坦': { lat: 30.3753, lng: 69.3451, name: '巴基斯坦' },
  '斯里兰卡': { lat: 7.8731, lng: 80.7718, name: '斯里兰卡' },
  '尼泊尔': { lat: 28.3949, lng: 84.124, name: '尼泊尔' },
  'Nepal': { lat: 28.3949, lng: 84.124, name: '尼泊尔' },
  '蒙古': { lat: 46.8625, lng: 103.8467, name: '蒙古' },
  '哈萨克斯坦': { lat: 48.0196, lng: 66.9237, name: '哈萨克斯坦' }
}

// 按 key 长度降序预排序，优先匹配更具体、更长的地名，避免短词误命中
const PLACES_KEYS = Object.keys(PLACES).sort((a, b) => b.length - a.length)
const COUNTRIES_KEYS = Object.keys(COUNTRIES).sort((a, b) => b.length - a.length)

function cleanText(text) {
  return (text || '')
    .replace(/[（(][^）)]*[）)]/g, ' ') // 去掉括号内容（含 © 版权信息）
    .replace(/[©®™]/g, ' ')
    .replace(/[，,、;；:：·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function matchDict(text, keys, dict) {
  for (const key of keys) {
    if (text.indexOf(key) !== -1) {
      return { lat: dict[key].lat, lng: dict[key].lng, name: dict[key].name }
    }
  }
  return null
}

// 把 copyright 地点文字解析为 { lat, lng, name }；无法识别时回退到地区市场中心
export function geocode(copyright, mkt) {
  const text = cleanText(copyright)
  if (text) {
    const place = matchDict(text, PLACES_KEYS, PLACES)
    if (place) return place
    const country = matchDict(text, COUNTRIES_KEYS, COUNTRIES)
    if (country) return country
  }
  const fallback = REGION_CENTER[mkt]
  return fallback ? { lat: fallback.lat, lng: fallback.lng, name: fallback.name } : null
}
