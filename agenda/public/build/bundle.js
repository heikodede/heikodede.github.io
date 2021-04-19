
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/App.svelte generated by Svelte v3.37.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (182:1) {#if dataReady}
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*currentInfo*/ ctx[1].secondsAfterStart < 0) return create_if_block_1;
    		if (/*currentInfo*/ ctx[1].meetingEnded) return create_if_block_3;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(182:1) {#if dataReady}",
    		ctx
    	});

    	return block;
    }

    // (199:2) {:else}
    function create_else_block(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = /*currentInfo*/ ctx[1].title + "";
    	let t2;
    	let t3;
    	let t4;
    	let div5;
    	let div3;
    	let t6;
    	let div4;
    	let t7_value = /*currentInfo*/ ctx[1].endTime + "";
    	let t7;

    	function select_block_type_1(ctx, dirty) {
    		if (typeof /*currentInfo*/ ctx[1].nextTitle != "undefined") return create_if_block_4;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "current topic";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			div5 = element("div");
    			div3 = element("div");
    			div3.textContent = "Estimated End";
    			t6 = space();
    			div4 = element("div");
    			t7 = text(t7_value);
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 200, 4, 5720);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 201, 4, 5763);
    			attr_dev(div2, "class", "textContainer svelte-1982tx3");
    			add_location(div2, file, 199, 3, 5688);
    			attr_dev(div3, "class", "title svelte-1982tx3");
    			add_location(div3, file, 215, 4, 6356);
    			attr_dev(div4, "class", "text svelte-1982tx3");
    			add_location(div4, file, 216, 4, 6399);
    			attr_dev(div5, "class", "textContainer small svelte-1982tx3");
    			add_location(div5, file, 214, 3, 6318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			insert_dev(target, t3, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, t7);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentInfo*/ 2 && t2_value !== (t2_value = /*currentInfo*/ ctx[1].title + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t4.parentNode, t4);
    				}
    			}

    			if (dirty & /*currentInfo*/ 2 && t7_value !== (t7_value = /*currentInfo*/ ctx[1].endTime + "")) set_data_dev(t7, t7_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t3);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(199:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (194:37) 
    function create_if_block_3(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "thanks for the participation";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "The meeting has already ended.";
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 195, 4, 5550);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 196, 4, 5608);
    			attr_dev(div2, "class", "textContainer svelte-1982tx3");
    			add_location(div2, file, 194, 3, 5518);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(194:37) ",
    		ctx
    	});

    	return block;
    }

    // (183:2) {#if currentInfo.secondsAfterStart < 0 }
    function create_if_block_1(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(-1 * /*currentInfo*/ ctx[1].secondsAfterStart)) + "";
    	let t2;
    	let t3;
    	let t4_value = /*userInput*/ ctx[2].startTime + "";
    	let t4;
    	let t5;
    	let if_block_anchor;
    	let if_block = /*userInput*/ ctx[2].delayInMin > 0 && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Meeting will beginn in";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = text(" at ");
    			t4 = text(t4_value);
    			t5 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 184, 4, 5093);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 185, 4, 5145);
    			attr_dev(div2, "class", "textContainer svelte-1982tx3");
    			add_location(div2, file, 183, 3, 5061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, t4);
    			insert_dev(target, t5, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentInfo*/ 2 && t2_value !== (t2_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(-1 * /*currentInfo*/ ctx[1].secondsAfterStart)) + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*userInput*/ 4 && t4_value !== (t4_value = /*userInput*/ ctx[2].startTime + "")) set_data_dev(t4, t4_value);

    			if (/*userInput*/ ctx[2].delayInMin > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(183:2) {#if currentInfo.secondsAfterStart < 0 }",
    		ctx
    	});

    	return block;
    }

    // (209:3) {:else}
    function create_else_block_1(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2;
    	let t3_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(/*currentInfo*/ ctx[1].remainingTime)) + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "this is the last topic";
    			t1 = space();
    			div1 = element("div");
    			t2 = text("End in ");
    			t3 = text(t3_value);
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 210, 5, 6146);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 211, 5, 6199);
    			attr_dev(div2, "class", "textContainer secondary svelte-1982tx3");
    			add_location(div2, file, 209, 4, 6103);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentInfo*/ 2 && t3_value !== (t3_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(/*currentInfo*/ ctx[1].remainingTime)) + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(209:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (204:3) {#if typeof currentInfo.nextTitle != "undefined" }
    function create_if_block_4(ctx) {
    	let div2;
    	let div0;
    	let t0;
    	let t1_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(/*currentInfo*/ ctx[1].remainingTime)) + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = /*currentInfo*/ ctx[1].nextTitle + "";
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Next topic in ");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 205, 5, 5920);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 206, 5, 6027);
    			attr_dev(div2, "class", "textContainer secondary svelte-1982tx3");
    			add_location(div2, file, 204, 4, 5877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentInfo*/ 2 && t1_value !== (t1_value = /*beautifyHMS*/ ctx[3](formatSecondsToHMS(/*currentInfo*/ ctx[1].remainingTime)) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*currentInfo*/ 2 && t3_value !== (t3_value = /*currentInfo*/ ctx[1].nextTitle + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(204:3) {#if typeof currentInfo.nextTitle != \\\"undefined\\\" }",
    		ctx
    	});

    	return block;
    }

    // (188:3) {#if userInput.delayInMin > 0}
    function create_if_block_2(ctx) {
    	let div2;
    	let div0;
    	let t1;
    	let div1;
    	let t2_value = /*userInput*/ ctx[2].delayInMin + "";
    	let t2;
    	let t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Expected Delay";
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = text(" minutes");
    			attr_dev(div0, "class", "title svelte-1982tx3");
    			add_location(div0, file, 189, 5, 5355);
    			attr_dev(div1, "class", "text svelte-1982tx3");
    			add_location(div1, file, 190, 5, 5400);
    			attr_dev(div2, "class", "textContainer small svelte-1982tx3");
    			add_location(div2, file, 188, 4, 5316);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			append_dev(div1, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*userInput*/ 4 && t2_value !== (t2_value = /*userInput*/ ctx[2].delayInMin + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(188:3) {#if userInput.delayInMin > 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let if_block = /*dataReady*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container svelte-1982tx3");
    			add_location(div, file, 180, 0, 4974);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*dataReady*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getUrlVars() {
    	var vars = {};

    	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    		if (value == "true") {
    			value = true;
    		}

    		if (value == "false") {
    			value = false;
    		}

    		vars[key] = value;
    	});

    	return vars;
    }

    function getSecondsBetweenDates(firstDate, secondDate) {
    	return Math.round((secondDate - firstDate) / 1000);
    }

    function formatSecondsToHMS(durationInSeconds) {
    	let hours = Math.floor(durationInSeconds / (60 * 60));
    	let minutes = Math.floor(durationInSeconds / 60 - hours * 60);
    	let seconds = Math.round(durationInSeconds - (minutes * 60 + hours * 60 * 60));
    	return [hours, minutes, seconds];
    }

    function findCurrentAgendaItem(secondsAfterStart, agenda) {
    	let secCounter = 0;

    	let returnObj = {
    		item: undefined,
    		secondsInAgendaItem: 0,
    		nextItem: undefined,
    		totalAgendaTimeInSec: undefined
    	};

    	agenda.forEach((item, index) => {
    		secCounter += item.durationInMin * 60;

    		if (typeof returnObj.item == "undefined") {
    			if (secCounter > secondsAfterStart) {
    				returnObj.item = item;
    				let secondsBeforeCurrentItem = secCounter - item.durationInMin * 60;
    				returnObj.secondsInAgendaItem = secondsAfterStart - secondsBeforeCurrentItem;

    				if (typeof agenda[index + 1] != "undefined") {
    					returnObj.nextItem = agenda[index + 1];
    				}
    			}
    		}
    	});

    	returnObj.totalAgendaTimeInSec = secCounter;
    	return returnObj;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let dataInitialized = false;
    	let dataReady = false;

    	let currentInfo = {
    		secondsAfterStart: undefined,
    		meetingEnded: false,
    		title: undefined,
    		remainingTime: [0, 0, 0],
    		nextTitle: undefined,
    		endTime: undefined
    	};

    	let userInput;
    	let eventDate;

    	(async function initializeData() {
    		//e.g. ?blobId=70f730f3-a147-11eb-97b4-193adf2ba741
    		let blobId = getUrlVars()["blobId"];

    		const response = await fetch(`https://jsonblob.com/api/jsonBlob/${blobId}`);

    		if (response.ok) {
    			$$invalidate(2, userInput = await response.json());
    			console.log(userInput);
    		} else {
    			console.log("local fallback used, because blobId is invalid");

    			$$invalidate(2, userInput = {
    				"date": 20,
    				"month": 4,
    				"year": 2021,
    				"startTime": "09:00",
    				"delayInMin": 0,
    				"agenda": [
    					{
    						"durationInMin": 60,
    						"title": "Kennenlernen QA / MW"
    					},
    					{
    						"durationInMin": 30,
    						"title": "Aktueller Stand von Ceres - Pt. I"
    					},
    					{
    						"durationInMin": 15,
    						"title": "Kaffeepause"
    					},
    					{
    						"durationInMin": 60,
    						"title": "Aktueller Stand von Ceres - Pt. II"
    					},
    					{
    						"durationInMin": 60,
    						"title": "Auftrag an Ceres"
    					},
    					{
    						"durationInMin": 45,
    						"title": "Mittagspause"
    					},
    					{
    						"durationInMin": 60,
    						"title": "Zusammenarbeit von QA & MW"
    					},
    					{
    						"durationInMin": 10,
    						"title": "Kaffeepause"
    					},
    					{
    						"durationInMin": 30,
    						"title": "Ausblick: Timeline von Ceres"
    					},
    					{
    						"durationInMin": 20,
    						"title": "Blitzlicht-Runde"
    					}
    				]
    			});
    		}

    		if (getUrlVars()["test"]) {
    			$$invalidate(2, userInput.date = 19, userInput);
    			$$invalidate(2, userInput.month = 4, userInput);
    			$$invalidate(2, userInput.startTime = "22:00", userInput);

    			$$invalidate(
    				2,
    				userInput.agenda = [
    					{ durationInMin: 90, title: "testA" },
    					{ durationInMin: 45, title: "testB" }
    				],
    				userInput
    			);
    		}

    		eventDate = new Date();
    		eventDate.setFullYear(userInput.year);
    		eventDate.setMonth(userInput.month - 1); //0 = Jan, 1 = Feb, ...
    		eventDate.setDate(userInput.date);
    		eventDate.setHours(userInput.startTime.split(":")[0]);
    		eventDate.setMinutes(userInput.startTime.split(":")[1]);
    		eventDate.setMinutes(eventDate.getMinutes() + userInput.delayInMin);
    		eventDate.setSeconds(0, 0);
    		dataInitialized = true;
    	})();

    	const zeroPad = (num, places) => String(num).padStart(places, "0");

    	function beautifyHMS(hmsArray) {
    		let HmsString = "";

    		if (hmsArray[0] != 0) {
    			HmsString += zeroPad(hmsArray[0], 2); //hours
    			HmsString += "h ";
    		}

    		HmsString += zeroPad(hmsArray[1], 2); //minutes
    		HmsString += "m ";
    		HmsString += zeroPad(hmsArray[2], 2); //seconds
    		HmsString += "s";
    		return HmsString;
    	}

    	setInterval(
    		function () {
    			if (dataInitialized) {
    				let now = new Date();
    				$$invalidate(1, currentInfo.secondsAfterStart = getSecondsBetweenDates(eventDate, now), currentInfo);

    				if (currentInfo.secondsAfterStart >= 0) {
    					let currentAgenda = findCurrentAgendaItem(currentInfo.secondsAfterStart, userInput.agenda);

    					if (typeof currentAgenda.item == "undefined") {
    						$$invalidate(1, currentInfo.meetingEnded = true, currentInfo);
    					} else {
    						$$invalidate(1, currentInfo.title = currentAgenda.item.title, currentInfo);
    						$$invalidate(1, currentInfo.remainingTime = currentAgenda.item.durationInMin * 60 - currentAgenda.secondsInAgendaItem, currentInfo);

    						if (currentAgenda.nextItem) {
    							$$invalidate(1, currentInfo.nextTitle = currentAgenda.nextItem.title, currentInfo);
    						} else {
    							$$invalidate(1, currentInfo.nextTitle = undefined, currentInfo);
    						}

    						let endDate = new Date(eventDate.getTime() + currentAgenda.totalAgendaTimeInSec * 1000);
    						$$invalidate(1, currentInfo.endTime = `${endDate.getHours()}:${endDate.getMinutes()}`, currentInfo);
    					}
    				}

    				$$invalidate(0, dataReady = true);
    			}
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		dataInitialized,
    		dataReady,
    		currentInfo,
    		userInput,
    		eventDate,
    		getUrlVars,
    		zeroPad,
    		getSecondsBetweenDates,
    		formatSecondsToHMS,
    		beautifyHMS,
    		findCurrentAgendaItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("dataInitialized" in $$props) dataInitialized = $$props.dataInitialized;
    		if ("dataReady" in $$props) $$invalidate(0, dataReady = $$props.dataReady);
    		if ("currentInfo" in $$props) $$invalidate(1, currentInfo = $$props.currentInfo);
    		if ("userInput" in $$props) $$invalidate(2, userInput = $$props.userInput);
    		if ("eventDate" in $$props) eventDate = $$props.eventDate;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [dataReady, currentInfo, userInput, beautifyHMS];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
