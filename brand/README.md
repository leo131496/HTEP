# 霍尼韦尔视觉参考

手机端于 2026-11-25 根据客户指定的[霍尼韦尔科技微站](https://page2.ma.scrmtech.com/c/60018948)调整。管理后台延续[霍尼韦尔中国官网](https://www.honeywell.com.cn/)的紫色交互与灰阶体系。

## 手机端微站布局

- 白色页面、红色标志与主要操作、黑色标题，采用客户微站的实景图片和图卡入口。
- 首屏为城市影像与平台介绍；三个素材分类采用“一大两小”图卡，下方展示按发布日期排序的最新三份素材。
- 搜索和“全部素材”进入集中检索视图，隐藏首屏宣传区；类型筛选、目录路径、收藏及每批 20 项的加载方式继续可用。
- 底部“素材库 / 我的”采用浅灰悬浮胶囊外观，但仍在页面滚动区域之外，不遮挡内容。
- “我的”采用个人资料区及两列互动入口；姓名、部门、手机号和邮箱沿用当前员工数据。
- 字体采用内嵌 Noto Sans 400/500/600，中文回退系统无衬线字体。搜索输入为 16px，主体内容为 14–17px，图片入口的辅助说明为 11–12px。

手机端配色由 `mobile-fonts.css` 中的手机端变量覆盖提供：主红 `#E20100`、操作深红 `#BD0B09`、浅红 `#FFF0EF`、正文 `#333333`、白底 `#FFFFFF`。后台共享的 `tokens.css` 保持独立。

## 微站图片来源

`mobile/` 中的图片来自客户提供页面的公开展示资源，只导出用于首屏和分类导览的静态 WebP，总计约 149KB。构建时内嵌，因此 Demo 无需向参考网站请求图片。

- `library-hero.webp` / `product.webp`：微站首页动画的城市画面，第 60 帧，裁掉底部字幕；[原始动画](https://landingpage-1304468848.cos.ap-beijing.myqcloud.com/zq2025/2322cb35-0755-48e3-b11f-c0c267cd3396%E9%A6%96%E9%A1%B5%E9%A1%B6%E9%83%A8%E8%A7%86%E9%A2%91.gif)。
- `installation.webp`：微站“安全”卡片的作业人员图片，裁掉卡片标题与说明；[原图](https://img02.ma.scrmtech.com/5027/988/resource/1788157546/%E5%AE%89%E5%85%A8.png)。
- `care.webp`：微站“环境”卡片的技术人员图片，裁掉卡片标题与说明；[原图](https://img02.ma.scrmtech.com/5027/988/resource/1788157445/%E7%8E%AF%E5%A2%83.png)。

参考链接中的用户身份参数、联系信息和页面追踪脚本未包含在 Demo 中。

## 标志与字体

品牌标志来自官网公开资源：[完整标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies.svg)、[紧凑标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies-small.svg)。

字体来源为官网 `clientlib-common/resources/fonts/noto-sans/` 下的 `NotoSans-Regular.ttf`、`NotoSans-Medium.ttf`、`NotoSans-SemiBold.ttf`，均不含中文字形。按 SIL OFL 授权保留拉丁字符、数字和常用标点，压缩为三份 WOFF2，合计约 94KB。许可证见 [fonts/OFL.txt](fonts/OFL.txt)，并内嵌于独立 HTML。

后台官网样式依据：[通用样式](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-common.min.d73e041641ff0abe9201f77128b6025c.css)、[页面样式](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-site.min.a82d4b316c524519bc6216ab8ed11df5.css)、[导航与页脚](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-header-footer.min.9427152289eae2886d4e1bb5bb7e76bc.css)。
