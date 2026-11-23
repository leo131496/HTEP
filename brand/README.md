# 霍尼韦尔官网风格

本版根据 2026-11-23 访问的 [霍尼韦尔中国官网](https://www.honeywell.com.cn/) 调整。

- 品牌红 `#E20100`：官网 Honeywell Technologies 标志。
- 紫色 `#5747D1`：官网按钮、链接和导航交互；用于平台主要操作及选中状态。
- 深灰 `#111927` / `#384250`、浅灰 `#F9FAFB`：标题、正文和工作区。
- 采用无衬线字体、清晰的标题层级、白底导航、细分隔线和小圆角；成功、待审、删除仍使用明确的语义颜色。

品牌标志来自官网公开资源：

- [完整标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies.svg)
- [紧凑标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies-small.svg)

颜色依据官网 `clientlib-site`、`clientlib-header-footer` 的实际样式。中文沿用系统无衬线字体，不依赖外部字体服务。标志及颜色文件本地提供，演示页面无需实时访问官网。

管理后台、评论列表/详情、手机端和双端展示页统一使用此视觉方向。手机端构建时会内嵌颜色文件及品牌标志，保留独立 HTML 的使用方式。
