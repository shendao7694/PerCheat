class GameLog {
    moduleName = "Normal";
    name = "PerCheat";
    /**
     * Constructor the game log
     * @param {string} moduleName module name
     * @returns {boolean}
     */
    constructor (moduleName) {
        if(typeof moduleName !== 'string') return false;
        this.moduleName = moduleName;
        return true;
    }
    /**
     * Get Formatted Time
     * @returns {string}
     */
    getFormattedTime() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0'); 
        const day = String(now.getDate()).padStart(2, '0');       
        const hours = String(now.getHours()).padStart(2, '0');      
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${month}/${day} ${hours}:${minutes}`;
    }
    /**
     * 
     * @param {string} msg - Message
     * @returns {boolean}
     */
    log(msg) { 
        if(typeof msg !== 'string') return false;
        console.log(`[INFO ${this.getFormattedTime()}][${this.name}][${this.moduleName}]`,msg);
        return true;
    }
    warn(msg) {
        if(typeof msg !== 'string') return false;
        console.warn(`[WARN ${this.getFormattedTime()}][${this.name}][${this.moduleName}]`,msg);
        return true;
    }
    error(msg) {
        if(typeof msg !== 'string') return false;
        console.error(`[ERROR ${this.getFormattedTime()}][${this.name}][${this.moduleName}]`,msg);
        return true;
    }
}

module.exports = { GameLog }