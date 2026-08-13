const { createI18n } = require('./i18n.js')
const zh = require('./locales/zh.js')
const en = require('./locales/en.js')
const locale = localStorage.getItem("percheat_language");
const i18n = createI18n({
  locale: locale == undefined ? 'zh' : locale,
  fallbackLocale: 'en',
  messages: { zh, en }
})

module.exports = i18n