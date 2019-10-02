import { getContentWidth } from './utils';

export class HorizontalScrollbar {
    constructor(draggableElm, scrollContainerEl) {
        this.draggable = draggableElm;
        this.scrollCont = scrollContainerEl;
        this.isDragging = false;
        this.isPaging = false;
        this.draggableInnerClickPos = null;
        this.mouseXPaging = null;
        this.scrollContWidth = null;
        this.isInit = false;
        this.listeners = [];
    }

    init(initDraggableLeft, requestedDraggableWidth, requestedContainerWidth) {
        if (this.isInit) {
            throw new Error('you can only initialize the scrollbar once.');
        } else {
            this.isInit = true;
        }

        this.setDraggableWidth(requestedDraggableWidth);
        this.setContainerWidth(requestedContainerWidth);

        this.scrollContWidth = getContentWidth(this.scrollCont);
        this.setDraggablePos({
            width: requestedDraggableWidth,
            left: initDraggableLeft,
            right: initDraggableLeft + requestedDraggableWidth - 1
        });

        this.scrollCont.addEventListener('mousedown', event => {
            if (event.target === this.draggable) {
                this.draggableInnerClickPos = this.mouseXToInnerDraggablePos(event.clientX);
                this.isDragging = true;
            } else {
                // page left/right
                this.isPaging = true;
                this.mouseXPaging = event.clientX;
                this.scrollNextPage();
            }
        }, false);
        
        document.addEventListener('mousemove', event => {
            if (this.isDragging) {
                let draggablePos = this.getDraggablePosByMouse(event.clientX, this.draggableInnerClickPos);
                this.setDraggablePos(draggablePos);
            }
            if (this.isPaging) {
                this.mouseXPaging = event.clientX;
            }
        }, false);
        
        document.addEventListener('mouseup', event => {
            this.isDragging = false;
            this.isPaging = false;
            this.draggableInnerClickPos = null;
            this.mouseXPaging = null;
        }, false);
    }

    // Gets the position withing the content area of the scroll container
    mouseXToScrollPos(mouseX) {
        const style = getComputedStyle(this.scrollCont);
        return mouseX
            - this.scrollCont.getBoundingClientRect().left // left border pos
            - this.scrollCont.clientLeft // left border width
            - parseFloat(style.paddingLeft)
            + 1; // make local coords start with 1
    }

    // Gets the position withing the border area of draggable
    mouseXToInnerDraggablePos(mouseX) {
        return mouseX - this.draggable.getBoundingClientRect().left + 1; // make local coords start with 1
    }

    getDraggablePosByMouse(mouseX, innerClickPos) {
        const localMouseX = this.mouseXToScrollPos(mouseX);
        const draggableWidth = this.draggable.getBoundingClientRect().width;
        const draggableLeft = localMouseX - innerClickPos + 1;
        return {
            width: draggableWidth,
            left: draggableLeft + 1,
            right: draggableLeft + draggableWidth
        };
    }

    getDraggablePosStatic() {
        const draggableLeft = parseFloat(getComputedStyle(this.draggable).marginLeft) + 1;
        const draggableWidth = this.draggable.getBoundingClientRect().width;
        return {
            width: draggableWidth,
            left: draggableLeft,
            right: draggableLeft + draggableWidth - 1
        };
    }

    setDraggablePos(pos) {
        let finalLeft = null;
        if (pos.left < 1) {
            finalLeft = 1;
        } else if (pos.right > this.scrollContWidth) {
            finalLeft = this.scrollContWidth - pos.width + 1;
        } else {
            finalLeft = pos.left;
        }

        this.draggable.style.marginLeft = (finalLeft - 1) + 'px';

        this.reportProgress(finalLeft, this.scrollContWidth - pos.width + 1);
    }

    setDraggableWidth(width) {
        this.draggable.style.width = width + 'px';
    }

    setContainerWidth(width) {
        this.scrollCont.style.width = width + 'px';
    }

    scrollNextPage() {
        if (!this.isPaging) {
            return;
        }
        
        const localMouseX = this.mouseXToScrollPos(this.mouseXPaging);
        const draggablePos = this.getDraggablePosStatic();
        if (localMouseX < draggablePos.left) {
            this.setDraggablePos({
                left: draggablePos.left - draggablePos.width,
                right: draggablePos.right - draggablePos.width,
                width: draggablePos.width
            });
        } else if (localMouseX > draggablePos.right) {
            this.setDraggablePos({
                left: draggablePos.left + draggablePos.width,
                right: draggablePos.right + draggablePos.width,
                width: draggablePos.width
            });
        }
    
        setTimeout(this.scrollNextPage.bind(this), 300);
    }

    registerListener(listener) {
        this.listeners.push(listener);
    }

    reportProgress(left, width) {
        const progress = left === 1 ? 0 : (left / width);
        this.listeners.forEach(listener => listener(progress));
    }
}
