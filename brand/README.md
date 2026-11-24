# 霍尼韦尔官网风格

本版根据 [霍尼韦尔中国官网](https://www.honeywell.com.cn/) 调整，手机端于 2026-11-24 再次核对官网公开 HTML 和实际 CSS。

- 品牌红 `#E20100`：官网 Honeywell Technologies 标志。
- 紫色 `#5747D1`：官网按钮、链接和导航交互；用于平台主要操作及选中状态。
- 深灰 `#111927` / `#384250`、浅灰 `#F9FAFB`：标题、正文和工作区。
- 采用无衬线字体、清晰的标题层级、白底导航、细分隔线和小圆角；成功、待审、删除仍使用明确的语义颜色。

品牌标志来自官网公开资源：

- [完整标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies.svg)
- [紧凑标志](https://www.honeywell.com.cn/content/dam/honeywell/icons/HoneywellTechnologies-small.svg)

颜色依据官网 `clientlib-site`、`clientlib-header-footer` 的实际样式。中文沿用系统无衬线字体，不依赖外部字体服务。标志及颜色文件本地提供，演示页面无需实时访问官网。

手机端复核结果与调整：

- 标志、主操作紫色及灰阶与官网一致。手机端链接和主按钮悬停色补齐为官网 `#30248F`，目录、自身头像和四类互动图标统一使用紫色；文件格式图标保留语义识别色。
- 官网正文声明 `Noto Sans, Helvetica, Arial, sans-serif`。旧 Demo 只声明字体名，本版实际内嵌官网 Noto Sans 的 400、500、600 字重；中文使用系统无衬线字体回退，跨设备会有字形差异。
- 官网移动标题包含 24/32、30/38、36/44px 等层级。素材工具页面采用 28px 页面标题、24px 个人名称、15px 素材标题、14px 正文与操作、12px 辅助信息，避免直接套用官网营销大标题。字重统一为 400/500/600。
- 保留白色导航、浅灰页面、细分隔线及小圆角；搜索输入为 16px，便于手机输入时保持页面比例。

字体来源为官网 `clientlib-common/resources/fonts/noto-sans/` 下的 `NotoSans-Regular.ttf`、`NotoSans-Medium.ttf`、`NotoSans-SemiBold.ttf`（均不含中文字形）。字体按 SIL OFL 授权，仅保留拉丁字符、数字和常用标点并压缩为 WOFF2，三份合计约 94KB。许可证见 [fonts/OFL.txt](fonts/OFL.txt)。`mobile-fonts.css` 只用于手机端；构建时将字体数据一并嵌入，独立 HTML 不需要额外网络请求。

本次核对的官网样式：

- [通用样式与字体声明](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-common.min.d73e041641ff0abe9201f77128b6025c.css)
- [页面样式与文字层级](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-site.min.a82d4b316c524519bc6216ab8ed11df5.css)
- [导航及页脚样式](https://www.honeywell.com.cn/etc.clientlibs/honeywell/clientlibs/clientlib-header-footer.min.9427152289eae2886d4e1bb5bb7e76bc.css)

管理后台、评论列表/详情、手机端和双端展示页统一使用此视觉方向。手机端构建时会内嵌颜色文件及品牌标志，保留独立 HTML 的使用方式。
