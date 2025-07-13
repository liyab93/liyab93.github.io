---
layout: post
title: Kaka Configuration Tutorial
permalink: /en/guides/kaka
language: en
---

## Questions
1. MacOS 15.0- MacOS 15.2 version unable to add Finder extension issue?
    - Use **FinderSyncer**
        [**FinderSyncer**](https://zigz.ag/FinderSyncer/) is an open-source software that solves the problem of adding Finder extensions to MacOS 15.0 and above versions.
    - Use **Terminal**
        Execute the following command in **Terminal** to enable or disable access extension
        - Enable Kaka extension:
        `sudo pluginkit -e use -i com.liyb.Kaka.KakaExtension`
        - Disable Kaka extension:
        `sudo pluginkit -e ignore -i com.liyb.Kaka.KakaExtension`