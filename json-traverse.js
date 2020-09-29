function traverse(obj, callbacks = null, flattenArray = false, level = 0, path = []) {
    let processValue = null;
    if (callbacks && callbacks.processValue) {
        processValue = callbacks.processValue;
    }
    if (callbacks && callbacks.enterLevel) {
        callbacks.enterLevel(level, path);
    }
    Object.entries(obj).forEach(([key, val]) => {
        if (val !== null && typeof val == 'object' && (!Array.isArray(val) || !flattenArray)) {
            if (Array.isArray(val)) {
                for (let i = 0; i < val.length; i++) {
                    let elem = val[i];
                    let itemKey = '_' + i;
                    let currentPath = Array.from(path);
                    currentPath.push(key);
                    if (elem !== null && typeof elem == 'object') {
                        if (processValue) {
                            processValue(itemKey, elem, level, currentPath, true, true, (newElem) => { obj[key][i] = newElem; });
                        }
                        currentPath.push(itemKey);
                        traverse(elem, callbacks, flattenArray, level + 1, currentPath);
                    }
                    else {
                        if (processValue) {
                            processValue(itemKey, elem, level, currentPath, false, true, (newElem) => { obj[key][i] = newElem; });
                        }
                    }
                }
            }
            else {
                if (processValue) {
                    processValue(key, val, level, path, true, false, (newVal) => { obj[key] = newVal; });
                }
                let currentPath = Array.from(path);
                currentPath.push(key);
                traverse(val, callbacks, flattenArray, level + 1, currentPath);
            }
        }
        else {
            if (processValue) {
                processValue(key, val, level, path, false, false, (newVal) => { obj[key] = newVal; });
            }
        }
    });
    if (callbacks && callbacks.leaveLevel) {
        callbacks.leaveLevel(level, path);
    }
};

module.exports.traverse = traverse;