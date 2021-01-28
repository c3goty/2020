// Global helper utilities

// This shouldn't be necessary
function isNullOrUndefined(x) { return x === undefined || x === null; }

/**
 * Wraps an HTMLElement so you can set multiple properties using method chaining, and quickly build
 * small DOM trees.
 */
class ElementSetter {
    /** @type {HTMLElement} */
    element = null;

    /**
     * 
     * @param {?(string|HTMLElement)} elOrTag - a tag name or an HTMLElement to wrap.  If undefined or null, creates a <div>
     */
    constructor(elOrTag) {
        if(elOrTag === undefined || elOrTag === null) {
            this.element = document.createElement('div');
        } else if(typeof elOrTag === 'string') {
            this.element = document.createElement(elOrTag);
        } else if(elOrTag instanceof HTMLElement) {
            this.element = elOrTag;
        } else {
            throw new TypeError('ElementSetter needs undefined, string, or HTMLElement, got ' + Object.prototype.toString.call(elOrTag));
        }
    }

    // Element accessor
    /** @returns {HTMLElement} */
    get() { return this.element; }

    // Single value setters
    setClass(classString) { if(typeof classString === 'string') { this.classes(...classString.split(' ')); } return this; }
    setAttribute(attr, val) { this.element.setAttribute(attr, val); return this; }
    setId(id_val) { this.id(id_val); return this; }
    setData(key, val) { if(this.element) { this.element.dataset[key] = val; } return this; }
    id(id_val) { this.element.setAttribute('id', id_val); return this; }
    body(html) { this.element.innerHTML = html; return this; }
    html(html) { return this.body(html); }
    text(textVal) { this.element.textContent = textVal; return this; }

    // Multi value setters
    classes(...classnames) { classnames?.filter(x => !isNullOrUndefined(x)).forEach(x => this.element?.classList.add(x)); return this; } 
    attributes(...kvs) { 
        kvs?.forEach(x => {
            if(Array.isArray(x)) { 
                this.element.setAttribute(x[0], x[1]);
            } else if(typeof x === 'string') {
                this.element.setAttribute(x, '');
            } else if(typeof x === 'object') { 
                this.attributes(...Object.entries(x)); 
            } 
        });
        return this;
    }
    children(...childs) { 
        if(this.children.length !== 0) { this.html(''); }
        childs = childs?.filter(x => !isNullOrUndefined(x)).map(x => x instanceof ElementSetter ? x.element : x)
        if(childs?.length > 0) { this.element.append(...childs); }
        return this; 
    }
    prepend(...childs) { 
        childs?.filter(x => !isNullOrUndefined(x))
               .map(x => x instanceof ElementSetter ? x.element : x)
               .forEach(x => this.element.prepend(x)); 
        return this; 
    }
    append(...childs) {
        childs?.filter(x => !isNullOrUndefined(x))
            .map(x => x instanceof ElementSetter ? x.element : x)
            .forEach(x => this.element.append(x)); 
        return this; 
    }
    data(...datums) { 
        datums.forEach(x => { 
            if(Array.isArray(x)) { this.setData(x[0], x[1]); }
            else if(typeof x === 'object') { this.data(...Object.entries(x)); }
            else if(typeof x === 'string') { 
                // Allow multiple space-separated data entries
                if(x.includes(' ')) {
                    x.split(' ').forEach(y => this.setData(...y.split('=')));
                } else {
                    this.setData(...x.split('='));
                }
            }
        });
        return this;
    }

    // Append/prepend
    appendTo(parent) { if(this.element) { parent.append(this.element); } return this; }
    prependTo(parent) { if(this.element) { parent.prepend(this.element); } return this; }
    before(sibling) { if(this.element) { sibling.before(this.element); } return this; }
    after(sibling) { if(this.element) { sibling.after(this.element); } return this; }
}

function create_element(tag) { return new ElementSetter(tag); }
const create = create_element;

function elementify(obj) {
    for(const key in obj) { 
        if(obj[key] instanceof ElementSetter) { obj[key] = obj[key].element; }
    }
}

// Copied straight from Bluebird
Promise.delay = function(ms, value) {
    if(value === undefined) { 
        return new Promise(resolve => setTimeout(resolve, ms));
    } else {
        return new Promise(resolve => {
            Promise.resolve(value).then(result => setTimeout(() => resolve(result), ms));
        });
    }
}
Promise.prototype.delay = function(ms) { return Promise.delay(ms, this); }

// Generate a Discord avatar url
function discord_avatar_url(discord_id, avatar, username, nogif) {
    if(avatar) {
        return `https://cdn.discordapp.com/avatars/${discord_id}/${avatar}.${!nogif && avatar.startsWith('a_') ? 'gif' : 'png'}`;
    } else {
        const discriminator = parseInt(username.substring(username.length - 4), 10);
        return `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`;
    }
}