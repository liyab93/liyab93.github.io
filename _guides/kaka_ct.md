---
layout: post
title: 咔咔使用教程
permalink: /ct/guides/kaka
language: ct
---

## 常見問題
1. MacOS 15.0 - MacOS 15.2 版本無法添加訪達擴展問題？
    - 使用**FinderSyncer**
        [**FinderSyncer**](https://zigz.ag/FinderSyncer/) 是一款解决MacOS 15.0以上版本無法添加訪達擴展的一款開源軟件。
    - 使用**終端**
        在**終端**中執行以下命令，開啟或關閉訪達擴展
        - 啟用咔咔擴展:
        `sudo pluginkit -e use -i com.liyb.Kaka.KakaExtension`
        - 關閉咔咔擴展:
        `sudo pluginkit -e ignore -i com.liyb.Kaka.KakaExtension`