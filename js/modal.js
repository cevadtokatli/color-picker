(function(global, factory) {
    global.modal = factory;
}(this, function() {
    'use strict';

    var requestAnimationFrame =
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        }

    var main = document.querySelector('main'),
        modals = document.querySelectorAll('.modal');

    for(var i=0; i<modals.length; i++) {
        (function(i) {
            var modal = modals[i],
                wrapper = modal.querySelector('.modal-wrapper');
            modal.addEventListener('click', function(e) {
                if(e.target == modal || e.target == wrapper) {
                    closeModal.call(modal);
                }
            });
            modal.querySelector('.close-trigger').addEventListener('click', function() {
                closeModal.call(modal);
            });
        }(i))
    }

    function openModal(d) {
        var elm;
        if(typeof d == 'string') {
            elm = document.querySelector(d);
        } else {
            elm = d;
        }

        if(elm) {
            requestAnimationFrame(function () {
                elm.classList.add('active');

                requestAnimationFrame(function() {
                    main.classList.add('blur-active');
                    elm.classList.add('animation-active');
                });
            })
        }
    }

    function closeModal() {
        this.addEventListener('transitionend', closeModalTransitionEnd);
        main.classList.remove('blur-active');
        this.classList.remove('animation-active');
    }


    function closeModalTransitionEnd() {
        this.removeEventListener('transitionend', closeModalTransitionEnd);
        this.classList.remove('active');
    }

    return {
        open: openModal,
        close: closeModal
    };
}()))