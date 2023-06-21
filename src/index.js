import './style.css'
import {createEvent} from './util'

const events = {
    open: createEvent('open'),
    close: createEvent('close'),
    save: createEvent('save'),
    cancel: createEvent('cancel'),
    changed: createEvent('changed')
};

// Holds the default settings.
const defaults = {
    size: 'medium',
    embed: true,
    pickerStyle: 0,
    allowOpacity: true,
    allowClearColor: false,
    showColorValue: true,
    colorFormat: 'hex',
    color: '#FF0000',
    showButtons: true,
    showPalette: true,
    paletteColors: ['#FFFFB5', '#FBBD87', '#F45151', '#7AEA89', '#91C8E7', '#8EB4E6', '#B0A7F1'],
    allowPaletteAddColor: true
};

export default class ColorPicker {
    /**
     * @param {Object} o
     * @constructor
     */
    constructor(o) {
        // dont install if runs on the server.
        if(typeof window === 'undefined') {
            return;
        }

        // Stores the HTML Elements.
        this.elm = {};
		
		if(typeof o.elm == 'string') {
			this.elm.main = document.querySelector(o.elm);
		} else {
			this.elm.main = o.elm;
		}
	    
        if(!this.elm.main) {
            throw new Error('Element could not be found');
        }

        this.el = this.elm.main; // For event listeners
        this.extractAttributes(o);

        // size
        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && !this.embed) {
            this.size = 'small';
        } else if(this.size != 'small' && this.size != 'large') {
            this.size = 'medium';
        }

        // picker sizes
        this.majorPicker = {};
        this.minorPicker = {};
        this.opacityPicker = {};

        if(this.size == 'small') {
            this.majorPicker.width = 125;
            this.majorPicker.height = 125;
            this.minorPicker.width = 20;
            this.minorPicker.height = 125;
        } else if(this.size == 'medium') {
            this.majorPicker.width = 175;
            this.majorPicker.height = 175;
            this.minorPicker.width = 30;
            this.minorPicker.height = 175;
        } else {
            this.majorPicker.width = 250;
            this.majorPicker.height = 250;
            this.minorPicker.width = 30;
            this.minorPicker.height = 250;
        }
        this.majorPicker.subtractedValue = 9;
        this.minorPicker.subtractedValue = 7;

        if(this.allowOpacity) {
            this.opacityPicker.width = this.minorPicker.width;
            this.opacityPicker.height = this.minorPicker.height;
            this.opacityPicker.subtractedValue = this.minorPicker.subtractedValue;
        }


        if(this.pickerStyle != 0) { this.pickerStyle = 1; }
        if(this.colorFormat != 'rgb' && this.colorFormat != 'rgba' && this.colorFormat != 'hsl' && this.colorFormat != 'hsla') { this.colorFormat = 'hex'; }
        if(!this.color) {
            if(this.allowClearColor) {
                this.color = null;
            } else {
                if(this.colorFormat == 'hex') { this.color = '#FF000'; }
                else if(this.colorFormat == 'rgb') { this.color = 'rgb(255,0,0)'; }
                else if(this.colorFormat == 'rgba') { this.color = 'rgba(255,0,0,1)'; }
                else if(this.colorFormat == 'hsl') { this.color = 'hsl(0,100%,50%)'; }
                else if(this.colorFormat == 'hsla') { this.color = 'hsla(0,100%,50%,1)'; }
            }
        }

        this.init();
    }

    /**
     * Extracts and merges attributes.
     *
     * @param {Object} o
     */
    extractAttributes(o) {
        for(let i in defaults) {
            if(typeof o[i] !== 'undefined') {
                this[i] = o[i];
            } else {
                this[i] = defaults[i];
            }
        }
    }

    /**
     * Creates html and event listeners.
     */
    init() {
        // Stores the bound function to remove the event listener.
        this.pickerMovedBind = this.pickerMoved.bind(this);
        this.pickerReleasedBind = this.pickerReleased.bind(this);
        this.closePickerBind = this.closePicker.bind(this);
        this.setPositionBind = this.setPosition.bind(this);

        if(!this.embed) {
            this.elm.main.classList.add('cdp-wrapper');
            this.elm.main.classList.add('cdp-background-type-opacity');
            this.elm.main.addEventListener('click', this.openPicker.bind(this));

            this.elm.overlay = document.createElement('div');
            this.elm.overlay.classList.add('cdp-wrapper-overlay');
            this.elm.main.appendChild(this.elm.overlay);

            this.elm.picker = document.createElement('div');
            this.elm.picker.classList.add('cdp-hidden');
            this.elm.overlay.appendChild(this.elm.picker);
        } else {
            this.elm.picker = this.elm.main;
        }
        this.elm.picker.classList.add('cdp-container');
        this.elm.picker.setAttribute('cdp-size', this.size);

        // Creates a DOM element to get the color as RGBA using the getRgbaColor function.
        this.elm.rgbaColor = document.createElement('div');
        this.elm.rgbaColor.classList.add('cdp-hidden');
        this.elm.picker.appendChild(this.elm.rgbaColor);

        this.rgbaColor = {}; //Holds RGBA values of the current color
        this.rgbaColor.a = 1;
        this.rgbColor = {};  //Holds the latest RGB value to calculate the new value when the picker position is changed on the palette
        this.hslColor = {}; //Holds the latest HSL value to calculate the new value when the picker position is changed on the palette

        // Sets the current and initial colors according to the color type.
        if(this.color) {
            var rgba = this.getRgbaValue(this.color),
                currentColor = this.convertColor(rgba).value;

            this.color = currentColor;
            this.rgbaColor = rgba;
        }
        this.initialColor = this.color;


        // picker container
        var pickerContainer = document.createElement('div');
        pickerContainer.classList.add('cdp-picker-container');
        this.elm.picker.appendChild(pickerContainer);

        this.majorPicker.container = document.createElement('div');
        this.majorPicker.container.classList.add('cdp-major-picker');
        pickerContainer.appendChild(this.majorPicker.container);

        this.minorPicker.container = document.createElement('div');
        this.minorPicker.container.classList.add('cdp-minor-picker');
        pickerContainer.appendChild(this.minorPicker.container);

        if(this.pickerStyle == 0) {
            this.majorPicker.container.innerHTML = '<div class="cdp-major-picker-gradient cdp-background-type-current-color"><div class="cdp-major-picker-gradient cdp-gradient-type-lr-white"><div class="cdp-major-picker-gradient cdp-gradient-type-bt-black cdp-last-gradient-child"></div></div></div>';
            this.elm.pickerCurrentColorBackground = this.majorPicker.container.querySelector('.cdp-background-type-current-color');
            this.minorPicker.container.innerHTML = '<div class="cdp-minor-picker-gradient cdp-gradient-type-tb-colorful cdp-last-gradient-child"></div>';
        } else if(this.pickerStyle == 1) {
            this.majorPicker.container.innerHTML = '<div class="cdp-major-picker-gradient cdp-gradient-type-lr-colorful"><div class="cdp-major-picker-gradient cdp-gradient-type-bt-gray cdp-last-gradient-child"></div></div>';
            this.minorPicker.container.innerHTML = '<div class="cdp-minor-picker-gradient cdp-gradient-type-bt-white-current-color-black cdp-last-gradient-child"></div>';
            this.elm.pickerCurrentColorBackground = this.minorPicker.container.querySelector('.cdp-gradient-type-bt-white-current-color-black');
        }

        this.majorPicker.dragger = document.createElement('div');
        this.majorPicker.dragger.classList.add('cdp-major-dragger');
        this.majorPicker.container.querySelector('.cdp-last-gradient-child').appendChild(this.majorPicker.dragger);
        this.majorPicker.container.addEventListener('mousedown', (e) => { this.pickerClicked(e, 'major'); });
        this.majorPicker.container.addEventListener('touchstart', (e) => { this.pickerClicked(e, 'major'); });

        this.minorPicker.dragger = document.createElement('div');
        this.minorPicker.dragger.classList.add('cdp-minor-dragger');
        this.minorPicker.container.querySelector('.cdp-last-gradient-child').appendChild(this.minorPicker.dragger);
        this.minorPicker.container.addEventListener('mousedown', (e) => { this.pickerClicked(e, 'minor'); });
        this.minorPicker.container.addEventListener('touchstart', (e) => { this.pickerClicked(e, 'minor'); });

        // opacity picker
        if(this.allowOpacity) {
            this.opacityPicker.container = document.createElement('div');
            this.opacityPicker.container.classList.add('cdp-opacity-picker');
            this.opacityPicker.container.innerHTML = '<div class="cdp-opacity-picker-gradient cdp-background-type-opacity"><div class="cdp-opacity-picker-gradient cdp-gradient-type-bt-current-color cdp-last-gradient-child"><div class="cdp-opacity-dragger"></div></div></div>';
            pickerContainer.appendChild(this.opacityPicker.container);
            this.elm.pickerCurrentColorOpacityBackground = this.opacityPicker.container.querySelector('.cdp-gradient-type-bt-current-color');
            this.opacityPicker.dragger = this.opacityPicker.container.querySelector('.cdp-opacity-dragger');
            this.opacityPicker.container.addEventListener('mousedown', (e) => { this.pickerClicked(e, 'opacity'); });
            this.opacityPicker.container.addEventListener('touchstart', (e) => { this.pickerClicked(e, 'opacity'); });
        }

        // console
        if(this.allowClearColor || this.showColorValue || this.showButtons) {
            var consoleContainer = document.createElement('div');
            consoleContainer.classList.add('cdp-console-container');
            this.elm.picker.appendChild(consoleContainer);

            // color console
            if(this.allowClearColor || this.showColorValue) {
                var colorConsoleContainer = document.createElement('div');
                colorConsoleContainer.classList.add('cdp-color-console-container');
                colorConsoleContainer.classList.add('cdp-background-type-opacity');
                consoleContainer.appendChild(colorConsoleContainer);

                this.elm.currentColorConsole = document.createElement('div');
                this.elm.currentColorConsole.classList.add('cdp-current-color-console');
                colorConsoleContainer.appendChild(this.elm.currentColorConsole);

                if(this.showColorValue) {
                    this.elm.initialColor = document.createElement('div');
                    this.elm.initialColor.classList.add('cdp-initial-color');
                    this.elm.initialColor.innerHTML = '<i class="cdp-icons"></i>';
                    this.elm.initialColor.addEventListener('click', this.setColorWithInitialColor.bind(this));
                    colorConsoleContainer.insertBefore(this.elm.initialColor, this.elm.currentColorConsole);

                    this.elm.colorValueInput = document.createElement('input');
                    this.elm.colorValueInput.classList.add('cdp-current-color');
                    this.elm.colorValueInput.setAttribute('type', 'text');
                    this.elm.colorValueInput.setAttribute('spellcheck', false);
                    this.elm.colorValueInput.addEventListener('change', () => { this.setColorWithValue(); });
                    this.elm.currentColorConsole.appendChild(this.elm.colorValueInput);

                    this.elm.colorValueInput.value = this.color;
                    this.setInitialColorIcon();
                } else {
                    consoleContainer.classList.add('cdp-current-color-non-showing');
                }

                if(this.allowClearColor) {
                    this.elm.clearColor = document.createElement('div');
                    this.elm.clearColor.classList.add('cdp-clear-color');
                    this.elm.clearColor.innerHTML = '<i class="cdp-icons"></i>';

                    this.elm.clearColor.addEventListener('click', () => { this.clearColor(); });
                    this.elm.currentColorConsole.appendChild(this.elm.clearColor);
                } else {
                    consoleContainer.classList.add('cdp-clear-color-non-showing');
                }
            } else {
                consoleContainer.classList.add('cdp-color-console-non-showing');
            }

            // buttons
            if(this.showButtons) {
                var buttonContainer = document.createElement('div');
                buttonContainer.classList.add('cdp-button-container');
                buttonContainer.innerHTML = '<div class="cdp-button" cdp-function="save"><i class="cdp-icons"></i>SAVE</div><div class="cdp-button" cdp-function="cancel"><i class="cdp-icons"></i>CANCEL</div>';
                consoleContainer.appendChild(buttonContainer);

                var saveButton = buttonContainer.querySelector('div[cdp-function="save"]');
                var cancelButton = buttonContainer.querySelector('div[cdp-function="cancel"]');

                saveButton.addEventListener('click', this.save.bind(this));
                cancelButton.addEventListener('click', this.cancel.bind(this));
            }
        }

        // palette
        if(this.showPalette) {
            var arrowDiv = document.createElement('div');
            arrowDiv.classList.add('cdp-arrow-div');
            this.elm.picker.appendChild(arrowDiv);

            var arrowIcon = document.createElement('i');
            arrowIcon.classList.add('cdp-icons');
            arrowDiv.appendChild(arrowIcon);

            this.elm.paletteContainer = document.createElement('div');
            arrowIcon.addEventListener('click', () => { this.opacityToggle(this.elm.paletteContainer); });

            this.elm.paletteContainer.classList.add('cdp-palette-container');
            this.elm.paletteContainer.classList.add('cdp-hidden');
            this.elm.paletteContainer.innerHTML = '<hr class="cdp-palette-line" /><div class="cdp-palette"></div>';
            this.elm.picker.appendChild(this.elm.paletteContainer);

            this.elm.palette = this.elm.picker.querySelector('.cdp-palette');

            if(this.allowPaletteAddColor) {
                var addColor = document.createElement('div');
                addColor.classList.add('cdp-palette-add-element');
                addColor.innerHTML = '<i class="cdp-icons"></i>';
                addColor.addEventListener('click', this.addColorToPalette.bind(this));
                this.elm.palette.appendChild(addColor);
            }

            for(let i=0; i<this.paletteColors.length; i++) {
                let {r, g, b, a} = this.getRgbaValue(this.paletteColors[i]);
                this.paletteColors[i] = `rgba(${r}, ${g}, ${b}, ${a})`;
                this.addColorElementToPalette({r, g, b, a});
            }
        }

        if(this.color) {
            this.setColor(null, false, true, true);
        } else {
            this.clearColor(true);
        }
    }

    /**
     * Sets the color and the position of the picker on the palette and sets the input's value according to the new color.
     *
     * @param {Object} rgba
     * @param {Boolean} eventCall
     * @param {Boolean} input
     * @param {Boolean} picker
     */
    setColor(rgba, eventCall, input, picker) {
        var color,
            isDark;

        if(rgba) {
            color = this.convertColor(rgba);
            this.rgbaColor = rgba;
        }

        if((color && color.value != this.color) || !rgba) {

            if(rgba) {
                this.color = color.value;
            } else {
                rgba = this.rgbaColor;
            }

            isDark = this.isDark(rgba);

            if(!this.embed) {
                this.elm.overlay.style.background = this.color;
            }

            if(this.elm.currentColorConsole) {
                this.elm.currentColorConsole.style.background = this.color;
            }

            if(isDark) {
                if(this.pickerStyle == 0) { this.majorPicker.dragger.classList.add('cdp-dark'); }
                else if(this.pickerStyle == 1) { this.minorPicker.dragger.classList.add('cdp-dark'); }
            } else {
                if(this.pickerStyle == 0) { this.majorPicker.dragger.classList.remove('cdp-dark'); }
                else if(this.pickerStyle == 1) { this.minorPicker.dragger.classList.remove('cdp-dark'); }
            }

            if(this.allowOpacity) {
                if(isDark || rgba.a < 0.25) {
                    this.opacityPicker.dragger.classList.add('cdp-dark');
                } else {
                    this.opacityPicker.dragger.classList.remove('cdp-dark');
                }
            }

            if(this.showColorValue) {
                if(input) {
                    this.elm.colorValueInput.value = this.color;
                }

                if(isDark || rgba.a < 0.4) {
                    this.elm.colorValueInput.classList.add('cdp-dark');
                } else {
                    this.elm.colorValueInput.classList.remove('cdp-dark');
                }
            }

            if(this.elm.clearColor) {
                if(isDark || rgba.a < 0.4) {
                    this.elm.clearColor.classList.add('cdp-dark');
                } else {
                    this.elm.clearColor.classList.remove('cdp-dark');
                }
            }

            if(picker) {
                var {r, g, b, a} = rgba,
                    {h, s, l} = this.rgbTohsl({r, g, b});

                if(this.pickerStyle == 0) {
                    this.elm.pickerCurrentColorBackground.style.background = `hsl(${h}, 100%, 50%)`;

                    // major
                    var x = this.majorPicker.height,
                        maxColor = Math.max(r,g,b),
                        topCV = Math.abs(Math.round(((x/255) * maxColor) - x)),
                        minColor = Math.min(r,g,b),
                        leftV = Math.abs(Math.round(((x/255) * minColor) - x)),
                        leftCV = leftV - Math.abs(Math.round((topCV/maxColor) * minColor));
                    this.majorPicker.dragger.style.left = leftCV - this.majorPicker.subtractedValue + 'px';
                    this.majorPicker.dragger.style.top = topCV - this.majorPicker.subtractedValue + 'px';

                    // minor
                    this.minorPicker.dragger.style.left = `calc(50% - ${this.minorPicker.subtractedValue}px)`;
                    this.minorPicker.dragger.style.top = (Math.round(((this.minorPicker.height) / 360) * h)) - this.minorPicker.subtractedValue + 'px';

                    var rgb = this.getRgbaValue(`hsl(${h}, 100%, 50%)`);
                    this.rgbColor = rgb;
                } else {
                    this.elm.pickerCurrentColorBackground.style.background = `linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(${h}, 100%, 50%), hsl(0,0%,0%))`;

                    // major
                    var x = this.majorPicker.height,
                        leftCV = Math.round((x/360) * h),
                        topCV = Math.abs(Math.round(((x/100) * s) - x));
                    this.majorPicker.dragger.style.left = leftCV - this.majorPicker.subtractedValue + 'px';
                    this.majorPicker.dragger.style.top = topCV - this.majorPicker.subtractedValue + 'px';

                    // minor
                    this.minorPicker.dragger.style.left = `calc(50% - ${this.minorPicker.subtractedValue}px)`;
                    var y = this.minorPicker.height;
                    this.minorPicker.dragger.style.top = (Math.abs(Math.round(((y/100) * l) - y))) - this.minorPicker.subtractedValue + 'px';

                    this.hslColor = {
                        h,
                        s,
                        l
                    };
                }

                if(this.allowOpacity) {
                    this.elm.pickerCurrentColorOpacityBackground.style.background = `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))`;
                    this.opacityPicker.dragger.style.left = `calc(50% - ${this.opacityPicker.subtractedValue}px)`;
                    this.opacityPicker.dragger.style.top = Math.round(((this.opacityPicker.height) / 100) * (a * 100)) - this.opacityPicker.subtractedValue + 'px';
                }
            }

            if(eventCall) {
                this.el.dispatchEvent(events.changed);
            }
        }
    }

    /**
     * This function is called when a color is chosen using the picker.
     * Sets the color.
     *
     * @param {Object} event
     * @param {String} type
     */
    pickerClicked(event, type) {
        this.dragStatus = type;
        document.body.classList.add('cdp-dragging-active');

        if(type == 'major' && this.pickerStyle == 0 && !this.color) {
            this.setColorWithPosition({ x:(this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue), y:(this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue) }, 'minor');
        } else if(type == 'minor' && this.pickerStyle == 1 && !this.color) {
            this.setColorWithPosition({ x:(this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue), y:(this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue) }, 'major');
        } else if(type == 'opacity' && !this.color) {
            if(this.pickerStyle == 0) {
                this.setColorWithPosition({ x:(this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue), y:(this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue) }, 'minor');
            } else {
                this.setColorWithPosition({ x:(this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue), y:(this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue) }, 'major');
            }
        }

        this.pickerMoved(event);
        this.toggleDraggerListeners(true);
    }

    /**
     * This function is called when the picker is moved on the palette. Takes the event object as an argument. Calls the setColorWithPosition() to set the new color.
     *
     * @param {Object} event
     */
    pickerMoved(event) {
        var n;

        if(this.dragStatus == 'major') {
            n = this.newPosition(event, this.majorPicker);
        } else if(this.dragStatus == 'minor') {
            n = this.newPosition(event, this.minorPicker);
        } else {
            n = this.newPosition(event, this.opacityPicker);
        }
        this.setColorWithPosition(n, this.dragStatus, true);

        event.preventDefault();
    }

    /**
     * Sets and returns the new position of the picker.
     *
     * @param {Object} event
     * @param {Object} picker
     * @returns {x: Number, y: Number}
     */
    newPosition(event, picker) {
        var rect = picker.container.getBoundingClientRect(), eX, eY;
        if ('touches' in event) {
            eX = event.touches[0].clientX ? event.touches[0].clientX : event.touches[0].pageX - window.pageXOffset;
            eY = event.touches[0].clientY ? event.touches[0].clientY : event.touches[0].pageY - window.pageYOffset;
        } else {
            eX = event.clientX ? event.clientX : event.pageX - window.pageXOffset;
            eY = event.clientY ? event.clientY : event.pageY - window.pageYOffset;
        }
        var x = eX - (rect.left + picker.subtractedValue),
            y = eY - (rect.top + picker.subtractedValue);

        if(x < -picker.subtractedValue) { x = -picker.subtractedValue; } else if(x > (picker.width - picker.subtractedValue)) { x = picker.width - picker.subtractedValue; }
        if(y < -picker.subtractedValue) { y = -picker.subtractedValue; } else if(y > (picker.height - picker.subtractedValue)) { y = picker.height - picker.subtractedValue; }

        picker.dragger.style.left = x + 'px';
        picker.dragger.style.top = y + 'px';
        return { x:(x + picker.subtractedValue), y:(y + picker.subtractedValue) };
    }

    /**
     * Sets the color according to the new position.
     *
     * @param {Object} n
     * @param {String} type
     * @param {Boolean} eventCall
     */
    setColorWithPosition(n, type, eventCall=false) {
        var newColor;

        if(type == 'major') {
            if(this.pickerStyle == 0) {
                var rgb = [this.rgbColor.r, this.rgbColor.g, this.rgbColor.b],
                    x = this.majorPicker.height,
                    topCV,
                    leftV,
                    leftCV,
                    netV;

                for(let i=0; i<rgb.length; i++) {
                    let v = rgb[i];
                    if(v == 255) {
                        netV = Math.abs(Math.round(((255/x) * n.y) - 255));
                    } else {
                        topCV = Math.round((x - n.y) * (v/x));
                        leftV = Math.round((x - n.x) * ((255-v)/x));
                        leftCV = Math.abs(Math.round((x - n.y) * (leftV/x)));
                        netV = topCV+leftCV;
                    }
                    rgb[i] = netV;
                }

                var r = rgb[0],
                    g = rgb[1],
                    b = rgb[2];

                this.setColor({
                    r,
                    g,
                    b,
                    a: this.rgbaColor.a
                }, eventCall, true, false);

                if(this.allowOpacity) {
                    this.elm.pickerCurrentColorOpacityBackground.style.background = `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))`;
                }
            } else if(this.pickerStyle == 1) {
                var x = this.majorPicker.height,
                    h = Math.round(n.x * (360/x)),
                    s = Math.abs(Math.round(n.y * (100/x)) - 100);

                this.elm.pickerCurrentColorBackground.style.background = `linear-gradient(to bottom, hsl(0, 100%, 100%), hsl(${h}, ${s}%, 50%), hsl(0, 0%, 0%))`;
                this.hslColor.h = h;
                this.hslColor.s = s;

                var minorX = this.minorPicker.dragger.offsetLeft + this.minorPicker.subtractedValue,
                    minorY = this.minorPicker.dragger.offsetTop + this.minorPicker.subtractedValue;

                this.setColorWithPosition({ x:minorX, y:minorY }, 'minor', eventCall);
            }
        } else if(type == 'minor') {
            if(this.pickerStyle == 0) {
                var x = this.minorPicker.height,
                    h = Math.round(n.y * (360/x));

                this.elm.pickerCurrentColorBackground.style.background = `hsl(${h}, 100%, 50%)`;
                var rgb = this.getRgbaValue(`hsl(${h}, 100%, 50%)`);
                this.rgbColor = rgb;

                var majorX = this.majorPicker.dragger.offsetLeft + this.majorPicker.subtractedValue,
                    majorY = this.majorPicker.dragger.offsetTop + this.majorPicker.subtractedValue;

                this.setColorWithPosition({ x:majorX, y:majorY }, 'major', eventCall);
            } else if(this.pickerStyle == 1) {
                var x = this.minorPicker.height,
                    l = Math.abs(Math.round(n.y * (100/x)) - 100);
                this.hslColor.l = l;

                var {r, g, b} = this.getRgbaValue(`hsl(${this.hslColor.h}, ${this.hslColor.s}%, ${this.hslColor.l}%)`);

                this.setColor({
                    r,
                    g,
                    b,
                    a: this.rgbaColor.a
                }, eventCall, true, false);

                if(this.allowOpacity) {
                    this.elm.pickerCurrentColorOpacityBackground.style.background = `linear-gradient(to top, rgba(${r}, ${g}, ${b}, 1), rgba(${r}, ${g}, ${b}, 0))`;
                }
            }
        } else if(type == 'opacity') {
            var {r, g, b} = this.rgbaColor,
                a;

            var x = this.opacityPicker.height;
            a = Math.round((100/x) * n.y) / 100;

            this.setColor({
                r,
                g,
                b,
                a
            }, eventCall, true, false);
        }
    }

    /**
     * Ends the dragging.
     */
    pickerReleased() {
        document.body.classList.remove('cdp-dragging-active');
        this.toggleDraggerListeners(false);
    }

    /**
     * Toggles dragger listeners according to status.
     *
     * @param {Boolean} status
     */
    toggleDraggerListeners(status) {
        if(status) {
            document.addEventListener('mousemove', this.pickerMovedBind);
            document.addEventListener('touchmove', this.pickerMovedBind);
            document.addEventListener('mouseup', this.pickerReleasedBind);
            document.addEventListener('touchend', this.pickerReleasedBind);
        } else {
            document.removeEventListener('mousemove', this.pickerMovedBind);
            document.removeEventListener('touchmove', this.pickerMovedBind);
            document.removeEventListener('mouseup', this.pickerReleasedBind);
            document.removeEventListener('touchend', this.pickerReleasedBind);
        }
    }

    /**
     * This function is called when the input's value is changed.
     * Sets the new color.
     */
    setColorWithValue() {
        var value = this.elm.colorValueInput.value;
        if(value.trim() && value != this.color) {
            var rgba = this.getRgbaValue(value);
            this.setColor(rgba, true, false, true);
        }
    }

    /**
     *  Sets the initial color as current color.
     */
    setColorWithInitialColor() {
        if(this.initialColor != this.color) {
            if(this.initialColor) {
                var rgba = this.getRgbaValue(this.initialColor);
                this.setColor(rgba, true, true, true);
            } else {
                this.clearColor();
            }
        }
    }

    /**
     * Clears the color.
     *
     * @param {Boolean} pass
     */
    clearColor(pass=false) {
        if(this.color || pass) {
            this.majorPicker.dragger.style.left = this.majorPicker.subtractedValue * -1 + 'px';
            this.majorPicker.dragger.style.top = this.majorPicker.subtractedValue * -1 + 'px';
            this.minorPicker.dragger.style.left = `calc(50% - ${this.minorPicker.subtractedValue}px)`;
            this.minorPicker.dragger.style.top = this.minorPicker.subtractedValue * -1 + 'px';

            this.rgbaColor.a = 1;

            if(this.pickerStyle == 0) {
                this.elm.pickerCurrentColorBackground.style.background = 'hsl(0,100%,50%)';
                this.majorPicker.dragger.classList.add('cdp-dark');
            } else if(this.pickerStyle == 1) {
                this.elm.pickerCurrentColorBackground.style.background = 'linear-gradient(to bottom, hsl(0,100%,100%), hsl(0,100%,50%), hsl(0,0%,0%))';
                this.minorPicker.dragger.classList.add('cdp-dark');
            }

            if(this.allowOpacity) {
                this.elm.pickerCurrentColorOpacityBackground.style.background = 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))';
                this.opacityPicker.dragger.style.left = `calc(50% - ${this.opacityPicker.subtractedValue}px)`;
                this.opacityPicker.dragger.style.top = this.opacityPicker.height - this.opacityPicker.subtractedValue + 'px';
                this.opacityPicker.dragger.classList.add('cdp-dark');
            }

            if(this.showColorValue) {
                this.elm.colorValueInput.value = '';
                this.elm.colorValueInput.classList.add('cdp-dark');
            }
            this.elm.currentColorConsole.style.background = 'transparent';
            this.elm.clearColor.classList.add('cdp-dark');

            if(!this.embed) {
                this.elm.overlay.style.background = 'transparent';
            }

            if(!pass) {
                this.color = null;
                this.el.dispatchEvent(events.changed);
            }
        }
    }

    // palette
    /**
     * Adds a color element to the palette.
     *
     * @param {Object} rgba
     */
    addColorElementToPalette(rgba) {
        var {r, g, b, a} = rgba,
            color = `rgba(${r}, ${g}, ${b}, ${a})`,
            paletteElement = document.createElement('div');
        paletteElement.classList.add('cdp-palette-element');
        paletteElement.classList.add('cdp-background-type-opacity');
        paletteElement.innerHTML = `<div style="background:${color};"></div>`;
        paletteElement.addEventListener('click', () => { this.setColorFromPalette(rgba); });
        this.elm.palette.appendChild(paletteElement);
    }

    /**
	 * Adds a color to the palette.
	 */
    addColorToPalette() {
        var {r, g, b, a} = this.rgbaColor,
            color = `rgba(${r}, ${g}, ${b}, ${a})`;

        if(this.color && this.paletteColors.indexOf(color) == -1) {
            this.paletteColors.push(color);
            this.addColorElementToPalette(this.rgbaColor);
        }
    }

    /**
     * Sets the selected color as current color.
     *
     * @param {Object} rgba
     */
    setColorFromPalette(rgba) {
        this.setColor(rgba, true, true, true);
    }

    /**
     *  Sets the color of the icon of initial color according to initial color.
     */
    setInitialColorIcon() {
        if(!this.initialColor) {
            this.elm.initialColor.style.background = 'transparent';
            this.elm.initialColor.classList.add('cdp-dark');
        } else {
            this.elm.initialColor.style.background = this.initialColor;

            var rgba = this.getRgbaValue(this.initialColor),
                isDark = this.isDark(rgba);

            if(isDark || rgba.a < 0.4) {
                this.elm.initialColor.classList.add('cdp-dark');
            } else {
                this.elm.initialColor.classList.remove('cdp-dark');
            }
        }
    }

    /**
     * Checks if a color is dark or not.
     *
     * @param {Object} rgb
     * @returns {Boolean}
     */
    isDark(rgb) {
        var {r, g, b} = rgb,
            dark = Math.round(((r * 299) +
            (g * 587) +
            (b * 114)) / 1000);

        return (dark > 125) ? true : false;
    }

    /**
     * Shows or hides the given element with opacity animation.
     *
     * @param {HTML Element} elm
     * @param {String} c
     * @returns {Promise<void>}
     */
    opacityToggle(elm, c) {
        return new Promise(resolve => {
            if(!c) {
                if(elm.classList.contains('cdp-hidden')) {
                    c = 'appear';
                } else {
                    c = 'leave';
                }
            }

            var style = elm.getAttribute('style') ? elm.getAttribute('style').replace(/opacity[^;]+;?/g, '') : null,
                start = null,
                duration = 100;

            if(c == 'appear') {
                elm.classList.remove('cdp-hidden');
                elm.style.opacity = 0;
            } else {
                elm.style.opacity = 1;
            }

            function opacityAnimation(timestamp) {
                if(!start) {
                    start = timestamp || new Date.getTime();
                }

                var runtime = timestamp - start,
                    progress = runtime / duration;
                progress = Math.min(progress, 1);

                if(runtime < duration) {
                    var value = progress;
                    if(c == 'leave') {
                        value = Math.abs(progress - 1);
                    }
                    elm.style.opacity = value;
                    window.requestAnimationFrame(opacityAnimation);
                } else {
                    if(c == 'leave') {
                        elm.classList.add('cdp-hidden');
                    }
                    elm.setAttribute('style', style);

                    resolve();
                }
            }
            window.requestAnimationFrame(opacityAnimation);
        });
    }

    /**
     * Shows the color picker.
     */
    openPicker() {
        if(this.elm.picker.classList.contains('cdp-hidden') && !this.animationProcessing) {
            this.animationProcessing = true;

            if(!this.embed) {
                this.elm.picker.classList.add('cdp-visibility-hidden');
                this.setPosition();
                this.elm.picker.classList.remove('cdp-visibility-hidden');
            }

            this.opacityToggle(this.elm.picker, 'appear')
            .then(() => {
                this.animationProcessing = false;
            });

            if(!this.embed) {
                window.addEventListener('resize', this.setPositionBind, true);

                if(!this.showButtons) {
                    document.addEventListener('mousedown', this.closePickerBind, true);
                    document.addEventListener('touchstart', this.closePickerBind, true);
                }
            }

            this.el.dispatchEvent(events.open);
        }
    }

    /**
     * Hides the picker if the click target is not the picker itself.
     *
     * @param {Object} event
     * @param {Boolean} pass
     */
    closePicker(event, pass=false) {
        if(((event && !this.elm.picker.contains(event.target)) || pass) && !this.animationProcessing) {
            this.animationProcessing = true;

            this.opacityToggle(this.elm.picker, 'leave')
            .then(() => {
                this.animationProcessing = false;
            });

            if(!this.embed) {
                window.removeEventListener('resize', this.setPositionBind, true);

                if(!this.showButtons) {
                    document.removeEventListener('mousedown', this.closePickerBind, true);
                    document.removeEventListener('touchstart', this.closePickerBind, true);
                }
            }

            this.el.dispatchEvent(events.close);
        }
    }

    /**
     * Sets the picker's position.
     */
    setPosition() {
        var rect = this.elm.main.getBoundingClientRect(),
            left = rect.left + window.pageXOffset,
            top = rect.top + window.pageYOffset,
            x = left + this.elm.picker.offsetWidth + 10,
            _x = left - this.elm.picker.offsetWidth,
            y = top + this.elm.picker.offsetHeight + 40,
            _y = top - (this.elm.picker.offsetHeight + 10),
            w = window.innerWidth + window.pageXOffset,
            h = window.innerHeight + window.pageYOffset;

        if (x >= w && _x > 0) {
            this.elm.picker.classList.add('cdp-right');
        } else {
            this.elm.picker.classList.remove('cdp-right');
        }

        if (y >= h && _y > 0) {
            this.elm.picker.classList.add('cdp-bottom');
        } else {
            this.elm.picker.classList.remove('cdp-bottom');
        }
    }

    /**
     * Returns the current color.
     *
     * @returns {Object}
     */
    get() {
        return (!this.color) ? {value:null} : this.convertColor(this.rgbaColor);
    }

    /**
     * Sets a new color.
     *
     * @param {String} newColor
     */
    set(newColor) {
		if(!newColor && this.allowClearColor) {
            this.clearColor();
        } else if(!newColor) {
		    newColor = this.color;
        } else {
		    var rgba = this.getRgbaValue(newColor);
			this.setColor(rgba, true, true, true);
        }
    }

    /**
     * Shows the picker.
     */
    show() {
        this.openPicker();
    }

    /**
     * Hides the picker.
     */
    hide() {
        if(!this.elm.picker.classList.contains('cdp-hidden')) {
            this.closePicker(null, true);
        }
    }

    /**
	 * Sets current color as initial color and fires the save event.
	 */
    save() {
        this.initialColor = this.color;

        if(this.showColorValue) {
            this.setInitialColorIcon();
        }

        if(!this.embed) {
            this.hide();
        }

        this.el.dispatchEvent(events.save);
    }

	/**
	 * Sets initial color as current color and fires the cancel event.
	 */
    cancel() {
        this.setColorWithInitialColor();

        if(!this.embed) {
            this.hide();
        }

        this.el.dispatchEvent(events.cancel);
    }

    /**
     * Converts any color type to RGBA with getComputedStyle.
     *
     * @param {String} color
     * @returns {Object}
     */
    getRgbaValue(color) {
        this.elm.rgbaColor.style.background = color;

        var backgroundValue = window.getComputedStyle(this.elm.rgbaColor, false, null).getPropertyValue('background-color'),
            rgba = backgroundValue.replace(/^(rgb|rgba)\(/,'').replace(/\)$/,'').replace(/\s/g,'').split(',');

        return {
            r: parseInt(rgba[0]),
            g: parseInt(rgba[1]),
            b: parseInt(rgba[2]),
            a: (rgba[3]) ? parseFloat(rgba[3]) : 1
        };
    }

    /**
     * Converts and returns the current color according to the selected format that user chose.
     *
     * @param {Object} rgba
     * @returns {Object}
     */
    convertColor(rgba) {
        var {r, g, b, a} = rgba;

        if(a == 1 || !this.allowOpacity) {
            if(this.colorFormat == 'hex') {
                return { value:this.rgbTohex({ r, g, b }) };
            } else if(this.colorFormat == 'rgb') {
                return { value:`rgb(${r}, ${g}, ${b})`, r, g, b };
            } else if(this.colorFormat == 'rgba') {
                return { value:`rgba(${r}, ${g}, ${b}, 1)`, r, g, b, a:1 };
            } else {
                var {h, s, l} = this.rgbTohsl({ r, g, b });
                if(this.colorFormat == 'hsl') {
                    return { value:`hsl(${h}, ${s}%, ${l}%)`, h, s, l };
                } else {
                    return { value:`hsla(${h}, ${s}%, ${l}%, 1)`, h, s, l, a:1 };
                }
            }
        } else {
            if(this.colorFormat != 'hsl' && this.colorFormat != 'hsla') {
                return { value:`rgba(${r}, ${g}, ${b}, ${a})`, r, g, b, a };
            } else {
                var {h, s, l} = this.rgbTohsl({ r, g, b });
                return { value:`hsla(${h}, ${s}%, ${l}%, ${a})`, h, s, l, a };
            }
        }
    }

    /**
     * Converts RGB value to HEX.
     *
     * @param {Object} rgb
     * @returns {String}
     */
    rgbTohex(rgb) {
        var hex = '#' +
            ('0' + parseInt(rgb.r,10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb.g,10).toString(16)).slice(-2) +
            ('0' + parseInt(rgb.b,10).toString(16)).slice(-2);

        return hex.toUpperCase();
    }

    /**
     * Converts RGB value to HSL.
     *
     * @param {Object} rgb
     * @returns {Object}
     */
    rgbTohsl(rgb) {
        var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        var maxColor = Math.max(r,g,b);
        var minColor = Math.min(r,g,b);
        // calculate L:
        var l = (maxColor + minColor) / 2 ;
        var s = 0;
        var h = 0;
        if(maxColor != minColor){
            // calculate S:
            if(l < 0.5){
                s = (maxColor - minColor) / (maxColor + minColor);
            }else{
                s = (maxColor - minColor) / (2.0 - maxColor - minColor);
            }
            // calculate h:
            if(r == maxColor){
                h = (g-b) / (maxColor - minColor);
            }else if(g == maxColor){
                h = 2.0 + (b - r) / (maxColor - minColor);
            }else{
                h = 4.0 + (r - g) / (maxColor - minColor);
            }
        }

        l = Math.round(l * 100);
        s = Math.round(s * 100);
        h = Math.round(h * 60);
        if(h<0){
            h += 360;
        }

        return {h, s, l};
    }
}
