export function getContentWidth(elem) {
    const style = getComputedStyle(elem);
    const paddingWidth = parseFloat(style.paddingLeft) + parseFloat(style.paddingLeft);
    return elem.clientWidth - paddingWidth;
}
