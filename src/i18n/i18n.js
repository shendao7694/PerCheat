/**
 * @typedef {Object} I18nConfig
 * @property {string} locale
 * @property {string} fallbackLocale
 * @property {Object} messages
 */

class I18n {
    /**
     * @param {I18nConfig} config
     */
    constructor(config) {
        this.global = {
            locale: config.locale || 'zh',
            fallbackLocale: config.fallbackLocale || 'en',
            messages: config.messages || {},
            /**
             * @param {string} key
             * @param {Object} params
             * @returns {string}
             */
            t: (key, params = {}) => {
                const langPack = this.global.messages[this.global.locale] || {}
                const fallbackPack = this.global.messages[this.global.fallbackLocale] || {}
                
                let text = this._getNestedValue(langPack, key)
                if (text === undefined || text === null) {
                    text = this._getNestedValue(fallbackPack, key)
                }
                if (text === undefined || text === null) {
                    return key
                }
                
                return this._interpolate(text, params)
            },
            /**
             * @param {string} locale
             * @param {Object} messages
             */
            addMessages: (locale, messages) => {
                this.global.messages[locale] = messages
            },
            /**
             * @param {Function} callback
             */
            onChange: (callback) => {
                this._listeners.push(callback)
            }
        }
        this._listeners = []
    }

    /**
     * @param {string} locale
     */
    setLocale(locale) {
        if (this.global.messages[locale]) {
            this.global.locale = locale
            this._notify()
        }
    }

    /**
     * @param {Object} obj
     * @param {string} path
     * @returns {any}
     */
    _getNestedValue(obj, path) {
        if (!obj || !path) return undefined
        const keys = path.split('.')
        let result = obj
        for (const key of keys) {
            if (result && result[key] !== undefined) {
                result = result[key]
            } else {
                return undefined
            }
        }
        return result
    }

    /**
     * @param {string} text
     * @param {Object} params
     * @returns {string}
     */
    _interpolate(text, params) {
        if (typeof text !== 'string') return text
        return text.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match
        })
    }

    _notify() {
        for (const cb of this._listeners) {
            cb(this.global.locale)
        }
    }
}

/**
 * @param {I18nConfig} config
 * @returns {{ global: { t: Function, locale: string, messages: Object, addMessages: Function, onChange: Function }, setLocale: Function }}
 */
function createI18n(config) {
    const instance = new I18n(config)
    return {
        global: instance.global,
        setLocale: instance.setLocale.bind(instance)
    }
}

module.exports = { createI18n }