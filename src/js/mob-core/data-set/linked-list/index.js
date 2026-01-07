/**
 * Define symbols for internal setter use in module.
 */
const SET_NEXT = Symbol('LinkedList.setNext');
const SET_PREV = Symbol('LinkedList.setPrev');
const MOVE_AFTER = 'after';
const MOVE_BEFORE = 'before';

/**
 * @template T
 */
export class LinkedListNode {
    /**
     * Next node
     *
     * @type {LinkedListNode<T> | null}
     */
    #next = null;

    /**
     * Previous node
     *
     * @type {LinkedListNode<T> | null}
     */
    #prev = null;

    /**
     * @param {T} data
     */
    constructor(data) {
        this.data = data;
    }

    /**
     * @returns {LinkedListNode<T> | null}
     */
    get next() {
        return this.#next;
    }

    /**
     * @param {LinkedListNode<T> | null} value
     */
    [SET_NEXT](value) {
        this.#next = value;
    }

    /**
     * @returns {LinkedListNode<T> | null}
     */
    get prev() {
        return this.#prev;
    }

    /**
     * @param {LinkedListNode<T> | null} value
     */
    [SET_PREV](value) {
        this.#prev = value;
    }

    dispose() {
        // @ts-ignore
        this.data = null;
        this.#next = null;
        this.#prev = null;
    }
}

/**
 * @template T
 */
export class LinkedList {
    /**
     * First node of list
     *
     * @type {LinkedListNode<T> | null}
     */
    #head = null;

    /**
     * Last node of list
     *
     * @type {LinkedListNode<T> | null}
     */
    #tail = null;

    /**
     * Number of element of list
     */
    #size = 0;

    /**
     * Use to check if node to remove is in map
     *
     * @type {WeakSet<LinkedListNode<T>>}
     */
    #nodes = new WeakSet();

    /**
     * Add node at end of the list
     *
     * @param {T} data
     * @returns {LinkedList<T>}
     */
    addLast(data) {
        const newNode = new LinkedListNode(data);
        this.#nodes.add(newNode);

        /**
         * List is empty: new node is both head and tail
         */
        if (!this.#head) {
            this.#head = newNode;
            this.#tail = newNode;
            this.#size++;
            return this;
        }

        /**
         * Add to the end using tail reference
         */
        if (this.#tail) this.#tail[SET_NEXT](newNode);
        newNode[SET_PREV](this.#tail);
        this.#tail = newNode;
        this.#size++;

        return this;
    }

    /**
     * Add node at beginning of the list
     *
     * @param {T} data
     * @returns {LinkedList<T>}
     */
    addFirst(data) {
        const newNode = new LinkedListNode(data);
        this.#nodes.add(newNode);

        if (!this.#head) {
            this.#head = newNode;
            this.#tail = newNode;
            this.#size++;
            return this;
        }

        newNode[SET_NEXT](this.#head);
        this.#head[SET_PREV](newNode);
        this.#head = newNode;
        this.#size++;

        return this;
    }

    /**
     * Remove node
     *
     * @param {LinkedListNode<T>} node
     * @returns {LinkedList<T>}
     */
    removeNode(node) {
        if (!node || !this.#nodes.has(node)) return this;

        if (node === this.#head) return this.removeFirst();
        if (node === this.#tail) return this.removeLast();

        /**
         * Rimuovi nodi intermedi.
         */
        if (node.prev) node.prev[SET_NEXT](node.next);
        if (node.next) node.next[SET_PREV](node.prev);

        node.dispose();
        this.#size--;
        return this;
    }

    /**
     * Remove first element (head)
     *
     * @returns {LinkedList<T>}
     */
    removeFirst() {
        /**
         * List is empty
         */
        if (this.#head === null) {
            return this;
        }

        const nodeToDispose = this.#head;

        /**
         * New head is next node.
         */
        this.#head = this.#head.next;

        /**
         * Set head previous to null ( is first element )
         */
        if (this.#head) this.#head[SET_PREV](null);

        /**
         * If no head, tail is removed too.
         */
        if (this.#head === null) this.#tail = null;

        nodeToDispose.dispose();
        this.#size--;
        return this;
    }

    /**
     * Remove last element.
     *
     * @returns {LinkedList<T>}
     */
    removeLast() {
        if (this.#tail === null) {
            return this;
        }

        const nodeToDispose = this.#tail;

        /**
         * Now tail is previous node.
         */
        this.#tail = this.#tail.prev;

        /**
         * Set tail next to null ( is last element )
         */
        if (this.#tail) this.#tail[SET_NEXT](null);

        /**
         * If no tail, head is removed too.
         */
        if (this.#tail === null) this.#head = null;

        nodeToDispose.dispose();
        this.#size--;
        return this;
    }

    /**
     * Create node after other node.
     *
     * @param {LinkedListNode<T>} node
     * @param {T} data
     * @returns {LinkedList<T>}
     */
    insertAfter(node, data) {
        if (!node || !this.#nodes.has(node)) return this;

        const newNode = new LinkedListNode(data);
        this.#nodes.add(newNode);

        newNode[SET_PREV](node);
        newNode[SET_NEXT](node.next);

        if (node.next) node.next[SET_PREV](newNode);
        node[SET_NEXT](newNode);

        if (node === this.#tail) this.#tail = newNode;

        this.#size++;
        return this;
    }

    /**
     * Create node before other node.
     *
     * @param {LinkedListNode<T>} node
     * @param {T} data
     * @returns {LinkedList<T>}
     */
    insertBefore(node, data) {
        if (!node || !this.#nodes.has(node)) return this;

        const newNode = new LinkedListNode(data);
        this.#nodes.add(newNode);

        newNode[SET_NEXT](node);
        newNode[SET_PREV](node.prev);

        if (node.prev) node.prev[SET_NEXT](newNode);
        node[SET_PREV](newNode);

        if (node === this.#head) this.#head = newNode;

        this.#size++;
        return this;
    }

    /**
     * Create node before other node.
     *
     * @param {LinkedListNode<T>} node
     * @param {LinkedListNode<T>} target
     * @param {string} position
     * @returns {LinkedList<T>}
     */
    move(node, target, position = MOVE_AFTER) {
        /**
         * Il nodo non fá parte della lista
         */
        if (!this.#nodes.has(node) || !this.#nodes.has(target)) return this;

        /**
         * I due nodi sono uguali
         */
        if (node === target) return this;

        /**
         * Condizione di NOOP, i nodi sono giá nella giusta posizione.
         */
        if (position === MOVE_AFTER && target.next === node) return this;
        if (position === MOVE_BEFORE && target.prev === node) return this;

        /**
         * - Gestione degli adiacenti a node ( virtuale rimozione di node ).
         * - Il suo nodo precedente punta al suo node successivo.
         * - Il suo node successivo punta al suo node precendente.
         * - In pratica abbiamo eleminato il nodo dai suoi estremi.
         * - I suoi estremi puntano a se stessi saltando node.
         */
        if (node.prev) node.prev[SET_NEXT](node.next);
        if (node.next) node.next[SET_PREV](node.prev);

        /**
         * Se il nodo era head ora il nuov head sará il suo prossimo nodo.
         */
        if (node === this.#head) this.#head = node.next;

        /**
         * Se il nodo era tail ora il nuovo tail sará il suo precendente nodo.
         */
        if (node === this.#tail) this.#tail = node.prev;

        if (position == MOVE_AFTER) {
            /**
             * Aggiorniamo i valori prev e next del node.
             *
             * - In pratica lo rimettiamo nella lista dopo averlo scollegato.
             */
            node[SET_PREV](target);
            node[SET_NEXT](target.next);

            /**
             * Aggiorniamo il nodo adiacente ( next ) a target.
             *
             * - Il prev del nodo successico a target ora punta al node
             */
            if (target.next) target.next[SET_PREV](node);

            /**
             * Aggiorniamo il nodo next di target. Target next ora punta a node.
             */
            target[SET_NEXT](node);

            /**
             * Se target era la coda, ora node diventa la nuova coda perché si trova giá in posizione.
             */
            if (target === this.#tail) this.#tail = node;
        }

        if (position == MOVE_BEFORE) {
            /**
             * Aggiorniamo i valori prev e next del node.
             *
             * - In pratica lo rimettiamo nella lista dopo averlo scollegato.
             */
            node[SET_PREV](target.prev);
            node[SET_NEXT](target);

            /**
             * Aggiorniamo il nodo adiacente ( prev ) a target.
             *
             * - Il next del nodo precedente a target ora punta al node
             */
            if (target.prev) target.prev[SET_NEXT](node);

            /**
             * Aggiorniamo il nodo next di target. Target next ora punta a node.
             */
            target[SET_PREV](node);

            /**
             * Target era head, ora la nuova head é node.
             */
            if (target === this.#head) this.#head = node;
        }

        return this;
    }

    /**
     * Create node before other node.
     *
     * @param {LinkedListNode<T>} node
     * @param {LinkedListNode<T>} target
     * @returns {LinkedList<T>}
     */
    moveAfter(node, target) {
        return this.move(node, target, MOVE_AFTER);
    }

    /**
     * Create node before other node.
     *
     * @param {LinkedListNode<T>} node
     * @param {LinkedListNode<T>} target
     * @returns {LinkedList<T>}
     */
    moveBefore(node, target) {
        return this.move(node, target, MOVE_BEFORE);
    }

    /**
     * Create node before other node.
     *
     * @param {LinkedListNode<T>} nodeA
     * @param {LinkedListNode<T>} nodeB
     * @returns {LinkedList<T>}
     */
    swap(nodeA, nodeB) {
        if (!this.#nodes.has(nodeA) || !this.#nodes.has(nodeB)) return this;
        if (nodeA === nodeB) return this;

        /**
         * Nodi adiacenti.
         */
        if (nodeA.next === nodeB) return this.moveAfter(nodeA, nodeB);
        if (nodeB.next === nodeA) return this.moveAfter(nodeB, nodeA);

        /**
         * Salviamo le refernze dei nodi intorno.
         */
        const aPrev = nodeA.prev;
        const aNext = nodeA.next;
        const bPrev = nodeB.prev;
        const bNext = nodeB.next;

        /**
         * Controlliamo che siano head || tail
         */
        const aWasHead = nodeA === this.#head;
        const aWasTail = nodeA === this.#tail;
        const bWasHead = nodeB === this.#head;
        const bWasTail = nodeB === this.#tail;

        /**
         * Disconnetiamo il nodo dai vicini limitrofi.
         */
        if (aPrev) aPrev[SET_NEXT](aNext);
        if (aNext) aNext[SET_PREV](aPrev);
        if (bPrev) bPrev[SET_NEXT](bNext);
        if (bNext) bNext[SET_PREV](bPrev);

        /**
         * Ricolleghiamo i nodi `scolelgati`.
         */
        nodeA[SET_PREV](bPrev);
        nodeA[SET_NEXT](bNext);
        nodeB[SET_PREV](aPrev);
        nodeB[SET_NEXT](aNext);

        if (bPrev) bPrev[SET_NEXT](nodeA);
        if (bNext) bNext[SET_PREV](nodeA);
        if (aPrev) aPrev[SET_NEXT](nodeB);
        if (aNext) aNext[SET_PREV](nodeB);

        /**
         * Casi specifici per head.
         */
        if (aWasHead) this.#head = nodeB;
        else if (bWasHead) this.#head = nodeA;

        /**
         * Casi specifici per tail.
         */
        if (aWasTail) this.#tail = nodeB;
        else if (bWasTail) this.#tail = nodeA;

        return this;
    }

    /**
     * Find specific node
     *
     * @param {(node: LinkedListNode<T>) => boolean} callback
     * @returns {LinkedListNode<T> | undefined}
     */
    find(callback) {
        let current = this.#head;
        let returnNode;

        while (current !== null) {
            if (callback(current)) {
                returnNode = current;
                break;
            }

            current = current.next;
        }

        return returnNode;
    }

    /**
     * Filter list and create new list.
     *
     * @param {(arg0: LinkedListNode<T>, index: number) => boolean} callback
     * @returns {LinkedList<T>}
     */
    filter(callback) {
        let current = this.#head;
        const newList = new LinkedList();
        let index = 0;

        while (current !== null) {
            if (callback(current, index)) newList.addLast(current.data);
            current = current.next;
            index++;
        }

        return newList;
    }

    /**
     * Create new List
     *
     * @template K
     * @param {(arg0: LinkedListNode<T>, index: number) => K} callback
     * @returns {LinkedList<K>}
     */
    map(callback) {
        let current = this.#head;
        const newList = new LinkedList();
        let index = 0;

        while (current !== null) {
            newList.addLast(callback(current, index));
            current = current.next;
            index++;
        }

        return newList;
    }

    /**
     * Iterator
     */
    *[Symbol.iterator]() {
        let current = this.#head;

        while (current) {
            yield current;
            current = current.next;
        }
    }

    /**
     * Sync traverse forward through the list
     *
     * @param {(node: LinkedListNode<T>) => void} callback
     * @returns {LinkedList<T>}
     */
    traverse(callback) {
        let current = this.#head;

        while (current !== null) {
            callback(current);
            current = current.next;
        }

        return this;
    }

    /**
     * Async traverse forward through the list
     *
     * @param {(node: LinkedListNode<T>) => Promise<void>} callback
     * @returns {Promise<LinkedList<T>>}
     */
    async traverseAsync(callback) {
        let current = this.#head;

        while (current !== null) {
            await callback(current);
            current = current.next;
        }

        return this;
    }

    /**
     * Traverse backward through the list
     *
     * @param {(node: LinkedListNode<T>) => void} callback
     * @returns {LinkedList<T>}
     */
    traverseReverse(callback) {
        let current = this.#tail;

        while (current !== null) {
            callback(current);
            current = current.prev;
        }

        return this;
    }

    /**
     * Async Traverse backward through the list
     *
     * @param {(node: LinkedListNode<T>) => Promise<void>} callback
     * @returns {Promise<LinkedList<T>>}
     */
    async traverseReverseAsync(callback) {
        let current = this.#tail;

        while (current !== null) {
            await callback(current);
            current = current.prev;
        }

        return this;
    }

    /**
     * Execute custom operation in chaining
     *
     * @param {(list: LinkedList<T>) => void} callback
     * @returns {LinkedList<T>}
     */
    execute(callback) {
        callback(this);
        return this;
    }

    /**
     * Async execute custom operation in chaining
     *
     * @param {(list: LinkedList<T>) => Promise<void>} callback
     * @returns {Promise<LinkedList<T>>}
     */
    async executeAsync(callback) {
        await callback(this);
        return this;
    }

    /**
     * Print all elements in the list
     *
     * @returns {LinkedList<T>}
     */
    print() {
        let current = this.#head;
        const result = [];

        while (current !== null) {
            result.push(current.data);
            current = current.next;
        }

        console.log(result);
        return this;
    }

    /**
     * Clear list
     *
     * @returns {LinkedList<T>}
     */
    clear() {
        let current = this.#head;

        /**
         * First extract node list, then dispose one by one.
         */
        const nodes = [];
        while (current !== null) {
            nodes.push(current);
            current = current.next;
        }

        /**
         * Then dispose all to remove all reference ( like data ).
         */
        for (const node of nodes) {
            node.dispose();
        }

        this.#head = null;
        this.#tail = null;
        this.#size = 0;
        nodes.length = 0;

        return this;
    }

    /**
     * Reverse list
     *
     * @returns {LinkedList<T>}
     */
    reverse() {
        let current = this.#head;
        this.#head = this.#tail;
        this.#tail = current;

        while (current !== null) {
            const originalNext = current.next;
            const originalPrev = current.prev;

            current[SET_NEXT](originalPrev);
            current[SET_PREV](originalNext);

            current = originalNext;
        }

        return this;
    }

    /**
     * Convert to array
     *
     * @returns {T[]}
     */
    toArray() {
        const arr = [];
        let current = this.#head;

        while (current !== null) {
            arr.push(current.data);
            current = current.next;
        }

        return arr;
    }

    /**
     * Convert to array in reverse order
     *
     * @returns {T[]}
     */
    toArrayReverse() {
        const arr = [];
        let current = this.#tail;

        while (current !== null) {
            arr.push(current.data);
            current = current.prev;
        }

        return arr;
    }

    /**
     * Get first node (head)
     *
     * @returns {LinkedListNode<T> | null}
     */
    get first() {
        return this.#head;
    }

    /**
     * Get last node (tail)
     *
     * @returns {LinkedListNode<T> | null}
     */
    get last() {
        return this.#tail;
    }

    /**
     * Get size
     *
     * @returns {number}
     */
    get size() {
        return this.#size;
    }
}
