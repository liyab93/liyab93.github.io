---
layout: post
title: 咔咔使用教程
permalink: /guides/kaka
language: cn
---

## 常见问题
1. MacOS 15.0 - MacOS 15.2 版本无法添加访达扩展问题?
    - 使用**FinderSyncer**
        [**FinderSyncer**](https://zigz.ag/FinderSyncer/) 是一款解决MacOS 15.0 以上版本无法添加访达扩展的一款开源软件。
    - 使用**终端**
        在**终端**中执行以下命令，开启或关闭访达扩展
        - 启用咔咔扩展:
        `sudo pluginkit -e use -i com.liyb.Kaka.KakaExtension`
        - 关闭咔咔扩展:
        `sudo pluginkit -e ignore -i com.liyb.Kaka.KakaExtension`