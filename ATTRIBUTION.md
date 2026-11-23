# 素材与资料来源

本项目参考 [Solar System Atlas](https://solar-system-atlas.pages.dev/) 的视觉与交互，界面、轨道计算和运行代码在本项目独立编写。下载的静态素材来自参考站公开分发的下列资源；原始路径、下载日期与字节大小记录在 `assets/manifest.json`。

## 三维库

- **Three.js / OrbitControls**：Three.js authors，MIT License。完整许可保存在 `assets/vendor/THREE-LICENSE.txt`。本项目从当前工作区已有的 vendor 文件复制。

## 行星与月球贴图

- **Solar System Scope**：[Textures](https://www.solarsystemscope.com/textures/)，CC BY 4.0。主要用于太阳、行星、月球、地球日面、夜面及土星环的摄影 / 制图纹理。
- **NASA / JPL Photojournal**：[Photojournal](https://science.nasa.gov/photojournal/)。参考站分发的地球云层、冥王星等影像涉及 NASA 任务素材。
- 冥王星源文件名为 `planets/pluto_nh-2k.jpg`，参考站标注 New Horizons MVIC：NASA / JHUAPL / SwRI。
- 太阳源文件名为 `planets/sun_sss-4k.jpg`；地球云层源文件名为 `planets/earth_clouds_nasa-2k.jpg`。
- 本地资源按展示对象重命名，例如 `earth_daymap-2k.jpg` 保存为 `assets/textures/earth.jpg`。`assets/mobile/` 是降采样JPEG副本，部分观测波段也降至1024像素；保留原图署名与出处，未去除作者标记。

## 银河背景

- **ESO / S. Brunier**：[The Milky Way panorama](https://www.eso.org/public/images/eso0932a/)。参考站提供的 `sky/milky-way-8k.jpg` 保存为 `assets/textures/milky-way.jpg`。
- 使用时保留 ESO / S. Brunier 署名；详细影像使用条款见 [ESO copyright](https://www.eso.org/public/outreach/copyright/)。

## 星表与星座

- `assets/catalog/constellations.json` 来自参考站的 `sky/catalog.json`，包含 J2000 恒星位置、88 个星座连线和精选亮星。
- 星座资料来源涉及 **Stellarium team**。原站提供的说明为：Text and data: **CC BY-SA**；Illustrations: **Free Art License**，插画作者 **Johan Meuris**。
- 本项目使用星座坐标、连线及85幅可用人物插画，位于 `assets/constellations/`。插画按锚点映射到天球，作者Johan Meuris，适用Free Art License。随项目保留 `assets/catalog/STELLARIUM-CREDITS.md`。
- `assets/catalog/bright-stars.json` 的来源字段注明 **d3-celestial / Olaf Frohn**，BSD-3-Clause。项目：[d3-celestial](https://github.com/ofrohn/d3-celestial)。该文件随目录保留，当前 UI 未逐条展示全部星名。
- `assets/catalog/dso.json` 来源字段注明 **OpenNGC / Mattia Verga**，CC BY-SA 4.0。项目：[OpenNGC](https://github.com/mattiaverga/OpenNGC)。当前UI支持完整目录搜索与亮目标标记；7张精选摄影的作者、来源页保存在 `assets/catalog/dso-photos.json`，页面显示摄影署名。
- `assets/stars/` 为参考站分发的分块恒星位置、星等与颜色资料，索引在 `assets/catalog/stars-index.json`。参考站署名 **ESA / Gaia / DPAC · CC BY-NC**；来源 [Gaia DR3](https://www.cosmos.esa.int/web/gaia/dr3)。本项目按视场加载和缓存淘汰，未改变资料许可。

## 新增目录和摄影

- `assets/catalog/missions.json` 与 `moons.json` 保存参考站公开目录中的任务、天体参数及官方来源链接。NASA、ESA、JAXA、CNSA任务事实用于本地说明；本项目不执行或发布原站应用代码。
- `assets/catalog/asteroids.bin` 为参考站的 `data/smallbodies/belt.bin`，160,129个压缩轨道记录；本项目独立解码并以开普勒模型传播。数据属于轨道目录，不表示高精度当前星历。
- `assets/catalog/satellites.json` 为参考站保存的 **CelesTrak Active Satellites GP** 快照，日期为2026-09-20。来源 [CelesTrak](https://celestrak.org/NORAD/elements/)。图谱明确标注快照和距离压缩。
- `assets/catalog/features-*.json` 为 **IAU WGPSN / USGS Astrogeology** 命名地形，文件内含来源URL、获取时间与Public domain说明；来源 [Gazetteer of Planetary Nomenclature](https://planetarynames.wr.usgs.gov/)。
- 月球LOLA与火星MOLA法线、太阳与行星的多波段摄影来源参考站分发的NASA/ESA任务影像。文件按展示需要降采样，界面说明颜色映射与非实时性质。
- `assets/catalog/ocean-facts.json` 包含海洋事实与18张物种照片的逐图 **作者、许可、许可URL、Wikimedia Commons来源URL**。`assets/species/` 为800像素以内的JPEG副本；物种档案逐图显示署名与许可。照片适用各自CC BY、CC BY-SA或Public domain条款。
- 全球天气采样元数据在 `assets/catalog/weather-grid.json`，由Open-Meteo逐点模型查询汇总并插值展示，**CC BY 4.0**；有效时间与采样分辨率保留在页面，未宣称是原始高分辨率栅格。

## 文字、计算与公开数据

- 基础天体数据与科普资料参考 [NASA Science](https://science.nasa.gov/)、[NASA Planetary Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/)、[ESA](https://www.esa.int/) 与 [CNSA](https://www.cnsa.gov.cn/)。档案页面保留相关入口。
- 简化轨道采用 J2000 根数与开普勒方程；方法参考 [JPL Approximate Positions](https://ssd.jpl.nasa.gov/planets/approx_pos.html)。当前根数为静态科普近似，未接入高精度星历。
- 洋流科普参考 [NOAA Ocean Service](https://oceanservice.noaa.gov/education/tutorial_currents/)；海洋物种参考 [WoRMS](https://www.marinespecies.org/) 与 [Smithsonian Ocean](https://ocean.si.edu/)。洋流路径、教学文字、粒子与温盐曲线是本项目的简化示意。
- 位置气象查询：[Open-Meteo](https://open-meteo.com/)，页面显示提供方、有效时间和获取时间。数据许可参考提供方的 CC BY 4.0 说明及服务条款。
- 太阳风查询：[NOAA Space Weather Prediction Center](https://www.swpc.noaa.gov/)，接口 `products/solar-wind/plasma-2-hour.json`。
- 背景环境声音由 Web Audio 正弦波合成，不包含参考站音乐文件。
- 在线详细地图使用 **Esri World Imagery** 和 **OpenStreetMap** 公共瓦片服务，页面保留Esri/Maxar/Earthstar或© OpenStreetMap contributors署名。瓦片在用户打开地图后按视口请求，不下载离线地图包；服务条款分别见 [Esri attribution](https://www.esri.com/en-us/legal/terms/full-master-agreement) 与 [OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/)。

第三方素材保留各自许可，不因本项目新增代码而改变其授权。分发时应保留本文件、随附许可与页面中的来源说明。
