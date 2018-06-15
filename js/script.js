(function(global, factory) {
    global.methods = factory;
}(this, function() {
    'use strict';

    var demoSection = document.querySelector('.demo');
    var demoPicker = new Cordelia({
        elm: '#demo-picker',
        color: '#0f9aef',
        size: 'medium'
    });

    demoPicker.el.addEventListener('changed', function() {
        demoSection.style.background = demoPicker.get().value;
    });

    new Cordelia({
        elm: '#color-red',
        color: 'red'
    });
    new Cordelia({
        elm: '#color-blue',
        color: 'blue'
    });

    new Cordelia({
        elm: '#color-format-hex',
        color: '#0f9aef',
        colorFormat: 'hex'
    });
    new Cordelia({
        elm: '#color-format-hsl',
        color: '#0f9aef',
        colorFormat: 'hsl'
    });

    new Cordelia({
        elm: '#picker-style-0',
        color: '#007bff',
        colorFormat: 'hex',
        pickerStyle: 0
    });
    new Cordelia({
        elm: '#picker-style-1',
        color: '#007bff',
        colorFormat: 'rgb',
        pickerStyle: 1
    });

    new Cordelia({
        elm: '#embed-true',
        color: '#ebb512',
        pickerStyle: 0,
        embed: true
    });
    new Cordelia({
        elm: '#embed-false',
        color: '#ebb512',
        pickerStyle: 1,
        embed: false
    });

    new Cordelia({
        elm: '#size-small',
        color: '#1c2b36',
        pickerStyle: 0,
        size: 'small'
    });
    new Cordelia({
        elm: '#size-medium',
        color: '#1c2b36',
        pickerStyle: 1,
        size: 'medium'
    });

    new Cordelia({
        elm: '#opacity-true',
        color: '#36a53b',
        pickerStyle: 0,
        allowOpacity: true
    });
    new Cordelia({
        elm: '#opacity-false',
        color: '#36a53b',
        pickerStyle: 1,
        allowOpacity: false
    });

    new Cordelia({
        elm: '#clear-true',
        color: '#8c8f92',
        pickerStyle: 0,
        allowClearColor: true
    });
    new Cordelia({
        elm: '#clear-false',
        color: '#8c8f92',
        pickerStyle: 1,
        allowClearColor: false
    });

    new Cordelia({
        elm: '#color-value-true',
        color: '#f23e30',
        pickerStyle: 0,
        showColorValue: true
    });
    new Cordelia({
        elm: '#color-value-false',
        color: '#f23e30',
        pickerStyle: 1,
        showColorValue: false
    });

    new Cordelia({
        elm: '#buttons-true',
        color: '#23c3d7',
        pickerStyle: 0,
        showButtons: true
    });
    new Cordelia({
        elm: '#buttons-false',
        color: '#23c3d7',
        pickerStyle: 1,
        showButtons: false
    });

    new Cordelia({
        elm: '#palette-true',
        color: '#25282a',
        pickerStyle: 0,
        showPalette: true
    });
    new Cordelia({
        elm: '#palette-false',
        color: '#25282a',
        pickerStyle: 1,
        showPalette: false
    });

    new Cordelia({
        elm: '#default-palette-colors',
        color: '#eee',
        pickerStyle: 0,
        paletteColors: ['#FFFFB5', '#FBBD87', '#F45151', '#7AEA89', '#91C8E7', '#8EB4E6', '#B0A7F1']
    });
    new Cordelia({
        elm: '#rainbow-palette-colors',
        color: '#eee',
        pickerStyle: 1,
        paletteColors: ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
    });

    new Cordelia({
        elm: '#palette-add-color-true',
        color: '#8c8f92',
        pickerStyle: 0,
        allowPaletteAddColor: true
    });
    new Cordelia({
        elm: '#palette-add-color-false',
        color: '#8c8f92',
        pickerStyle: 1,
        allowPaletteAddColor: false
    });

    var eventPicker = new Cordelia({
        elm: '#events',
        color: '#EE82EE',
        embed: false
    });

    eventPicker.el.addEventListener('open', function() {
        alert('OPEN EVENT FIRES');
    });

    eventPicker.el.addEventListener('close', function() {
        alert('CLOSE EVENT FIRES');
    });

    eventPicker.el.addEventListener('save', function() {
        alert('SAVE EVENT FIRES');
    });

    eventPicker.el.addEventListener('cancel', function() {
        alert('CANCEL EVENT FIRES');
    });

    eventPicker.el.addEventListener('changed', function() {
        console.log('CHANGED EVENT FIRES');
    });

    var methodPicker = new Cordelia({
        elm: '#methods',
        color: '#8EB4E6'
    });

    function get() {
        alert(methodPicker.get().value);
    }

    function set() {
        var newColor = prompt('Enter the new color');
        methodPicker.set(newColor);
    }

    function show() {
        methodPicker.show();
    }

    function hide() {
        methodPicker.hide();
    }

    function saveM() {
        methodPicker.save();
    }

    function cancelM() {
        methodPicker.cancel();
    }

    return {
        get: get,
        set: set,
        show: show,
        hide: hide,
        save: saveM,
        cancel: cancelM
    };
}()))