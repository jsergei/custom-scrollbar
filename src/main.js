import '../css/style.scss';
import { HorizontalScrollbar } from './horizontal-scrollbar';

const draggable = document.querySelector('.draggable');
const scrollCont = document.querySelector('.scroll-container');
const horScrollbar = new HorizontalScrollbar(draggable, scrollCont);

const contentCont = document.querySelector('.content-container');
// scroll-width = Sum of content width within the container (including margins) + padding-left and right of the container
const scrollbarSize = 300;
const draggableSize = Math.floor((contentCont.clientWidth / contentCont.scrollWidth) * scrollbarSize);
horScrollbar.init(1, draggableSize, 300);

horScrollbar.registerListener(progress => {
    contentCont.scrollLeft = Math.floor((contentCont.scrollWidth - contentCont.clientWidth) * progress);
});
