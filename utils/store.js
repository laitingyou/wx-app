/*class Store {
    constructor() {
        this.PubSubCache = {
            $uid: 0
        };
    }

    on(type, handler) {
        let cache = this.PubSubCache[type] || (this.PubSubCache[type] = {});

        handler.$uid = handler.$uid || this.PubSubCache.$uid++;
        cache[handler.$uid] = handler;
    }

    emit(type, ...param) {
        let cache = this.PubSubCache[type],
            key,
            tmp;

        if(!cache) return;

        for(key in cache) {
            tmp = cache[key];
            cache[key].call(this, ...param);
        }
    }

    off(type, handler) {
        let counter = 0,
            $type,
            cache = this.PubSubCache[type];

        if(handler == null) {
            if(!cache) return true;
            return !!this.PubSubCache[type] && (delete this.PubSubCache[type]);
        } else {
            !!this.PubSubCache[type] && (delete this.PubSubCache[type][handler.$uid]);
        }

        for($type in cache) {
            counter++;
        }

        return !counter && (delete this.PubSubCache[type]);
    }
}

module.exports={
    store:new Store
}*/

/**
 * 小程序实现跨页面通信
 * 来自 https://github.com/dannnney/weapp-event
 */

function Store(){
    // 用于存绑定的事件
    var events = {};


    /**
     * [on 绑定事件]
     * @param  {String} name [事件名]
     * @param  {Object} self [this 可不传]
     * @param  {Function} callback [description]
     */
    this.on = function(name, self, callback) {
        let tuple = [self, callback]
        let callbacks = events[name]
        if (Array.isArray(callbacks)) {
            callbacks.push(tuple);
        } else {
            events[name] = [tuple]
        }
    }

    // 删除绑定时间
    /**
     * [remove 删除绑定时间]
     * @param  {String} name [事件名]
     * @param  {Object} self [this 可不传]
     */
    this.remove = function(name, self) {
        // let callbacks = events[name]
        // if (Array.isArray(callbacks)) {
        //     events[name] = callbacks.filter((tuple) => {
        //         return tuple[0] != self;
        //     })
        // }
        delete events[name]
    }

    /**
     * [emit 调用绑定的事件]
     * @param  {String} name [事件名]
     * @param  {} data       [调用事件所需参数，是非必填看回调参数是否需要]
     */
    this.emit = function(name, data) {
        let callbacks = events[name]
        if (Array.isArray(callbacks)) {
            callbacks.map((tuple) => {
                let self = tuple[0]
                let callback = tuple[1]
                callback.call(self, data);
            })
        }
    }    
}


/*exports.on = on;
exports.remove = remove;
exports.emit = emit;*/



module.exports = new Store