/**
 * Creates a new event and initalizes it.
 *
 * @param {String} name
 * @returns {Event}
 */
export function createEvent(name) {
    let event;
    if(typeof document !== 'undefined') {
        event = document.createEvent('HTMLEvents') || document.createEvent('event');
        event.initEvent(name, false, true);
    }
    return event;
}
