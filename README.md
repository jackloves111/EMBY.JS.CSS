## 配套EMBY插件使用
https://github.com/Shurelol/Emby.CustomCssJS

- [Telegram频道](https://t.me/embycustomcssjs)

## EMBY（Docker服务器端）安装方法
- 本方案仅`emby/embyserver:beta`镜像测试有效，其他镜像请自行测试
- root账户登录ssh，输入以下指令一键安装
```
wget -O script.sh --no-check-certificate https://raw.githubusercontent.com/jackloves111/Emby.CustomCssJS/main/src/script.sh && bash script.sh
```

- 服务器端安装完成，重启容器，网页端的控制台会多出一个自定义JS和CSS的插件，插件内输入以下代码即可实现对应功能
- 如果不显示插件，请检查映射的`config`文件夹权限是否正确！

![photo_2023-05-14_21-45-18](https://github.com/Shurelol/Emby.CustomCssJS/assets/16237201/b3890993-e5e7-497f-915c-8df75c53f64a)

## 自定义JS和CSS目录导航
1. [主页轮播大图版（和主页轮播图冲突，不要一起启用）]([https://github.com/jackloves111/EMBY.JS.CSS/tree/main/%E4%B8%BB%E9%A1%B5%E5%A4%A7%E5%9B%BE](https://github.com/jackloves111/EMBY.JS.CSS/tree/main/%E4%B8%BB%E9%A1%B5%E8%BD%AE%E6%92%AD%E5%A4%A7%E5%9B%BE%E7%89%88))
2. [主页轮播图（和主页轮播大图版冲突，不要一起启用）](https://github.com/jackloves111/EMBY.JS.CSS/tree/main/%E4%B8%BB%E9%A1%B5%E8%BD%AE%E6%92%AD%E5%9B%BE)
3. [外置播放器](https://github.com/jackloves111/EMBY.JS.CSS/tree/main/%E5%A4%96%E7%BD%AE%E6%92%AD%E6%94%BE%E5%99%A8)
4. [隐藏演员头像](https://github.com/jackloves111/EMBY.JS.CSS/tree/main/%E9%9A%90%E8%97%8F%E6%97%A0%E5%A4%B4%E5%83%8F%E6%BC%94%E5%91%98)
5. [页面美化合集](https://github.com/jackloves111/EMBY.JS.CSS/tree/main/页面美化合集)

## 推荐使用序号2和序号5进行搭配使用
- 效果图如下

![296552982-1190e531-0374-4912-ad00-c42ddd30086a_看图王](https://github.com/jackloves111/EMBY.JS.CSS/assets/89971817/18f8df26-9677-4f11-8120-7584ebe1c9a0)

