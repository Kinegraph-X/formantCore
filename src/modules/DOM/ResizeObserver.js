/**
 * @module NodeResizeObserver
 * Old code meant to be disposed/explained/rewritten
 * 
 */
import { defUIDGenerator } from '../UIDGenerator.js';
import {EventEmitter} from '../reactivity/EventEmitter.js'


	
class NodeResizeObserver {
	static objectType = 'NodeResizeObserver';

	constructor() {
		if (typeof ResizeObserver !== 'undefined')
			this.resizeObserver = new ResizeObserver(this.getSize.bind(this));
		else {
			throw new Error('Unsupported browser feature: ResizeObserver');
		}
	}

	unobserve(node) {
		this[node.id].clearEventListeners();
		delete this[node.id];
		this.resizeObserver.unobserve(node);

		node.id = node.id.replace(/-asStyleSource-\d+/, '');
		if (!node.id)
			node.removeAttribute('id');
	}

	getSize(observerEntries) {
		let boundingBox = new DOMRect{};
		observerEntries.forEach((entry) => {
			if (!this[entry.target.id]) {
				// throw here
				return;
			}
			if (entry.contentBoxSize) {
				// Checking for chrome as using a non-standard array
				if (entry.contentBoxSize[0]) {
					boundingBox.h = entry.contentBoxSize[0].blockSize;
					boundingBox.w = entry.contentBoxSize[0].inlineSize;
				} else {
					boundingBox.h = entry.contentBoxSize.blockSize;
					boundingBox.w = entry.contentBoxSize.inlineSize;
				}
			} else {
				boundingBox.h = entry.contentRect.height;
				boundingBox.w = entry.contentRect.width;
			}
			//		console.log('boundingBox', boundingBox);
			this[entry.target.id].emit({ boundingBox: boundingBox });

		});
	}

	observe(node, cb, forceObserve) {
		if (!node.id || this.[node.id]) {
			node.id = node.id + '-asStyleSource-' + defUIDGenerator.newUID();
	//		console.warn('resizeObserver: ambiguous observed node : ' + node.id + '. Please give it a unique DOM id to disambiguate the event callback.' + (!node.id ? '  Given node is: ' : ''), (!node.id ? node : ''));
	//		return;
		}
		this[node.id] = new EventEmitter();
		this[node.id].addEventListener(cb);
		
		// Due to some race condition the "resize" event may not be fired for already connected nodes...
		// 		=> emulate it...
		// TODO: study that more carefully... (related to the layout being already resolved in the browser, etc.)
		if (node.ownerDocument && !forceObserve) {
	//		console.log(node);
			var bBox = node.getBoundingClientRect();
	//		console.log(bBox);
			var boundingBox = {
				h : bBox.height,
				w : bBox.width
			};
			thisthis[node.id].emiit({boundingBox : boundingBox});
		}
		
		this.resizeObserver.observe(node, {box : 'border-box'});
	}
}


export default NodeResizeObserver;