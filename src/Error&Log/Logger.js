/**
 * @module errorHandler
 */


	var Logger = function() {
//		Factory.CoreModule.call(this);
		this.objectType = 'Logger';
		
		this._currentlyCallingObjectName;
	}
	Logger.prototype = {};//Object.create(Factory.CoreModule.prototype);
	Logger.prototype.objectType = 'Logger';
	Logger.prototype.constructor = Logger;

	Logger.prototype.colors = {
	                message : 'color:#777',
	                messageEven : 'color:#777',
	                messageOdd : 'color:#222',
	                target : 'color:#5555FF',
	                warning : 'color:#CC5500',
	                error : 'color:#CC0000',
	                serialized : 'color:#999'
					}

	Logger.prototype.changeCallingObject = function(e) {
		this._currentlyCallingObjectName = e.data;
	}

	Logger.prototype.log = function(isOfType) {
		var args = Array.apply(null, arguments), logs = [];
		if (Object.keys(this.colors).indexOf(args[0]) !== -1) {
			isOfType = args[0];
			preambule = '%c %s %c %s %c %s ';
			logs = [
			            preambule,
			            this.colors[isOfType],
			            isOfType
			            ];
			args.shift();
		}
		else {
			preambule = '%c %s %c %s ';
			logs = [preambule]
		}

		var message = args[0] || 'empty log',
		target = args[1] + ':' || 'empty target:',
		isSerialized = args[args.length - 1] === 'serialized' ? true : undefined,

		logs = logs.concat([
		            this.colors['target'],
		            args[1],
		            typeof isOfType !== 'undefined' ? this.colors[isOfType] : this.colors['message'],
		            args[0]		
		            ]);

		for (var i = 2, l = args.length, val; i < l; i++) {
			(function(i) {
				val = args[i];
				switch(typeof val) {
					case 'string':
						logs[0] += '%c %s ';
						break;
					case 'object':
						logs[0] += '%c %o ';
						break;
					case 'number':
						if (Math.round(val) === val)
							logs[0] += '%c %i ';
						else
							logs[0] += '%c %.2f ';
						break;
				}
				
				logs.push(typeof isSerialized !== 'undefined' ? this.colors['serialized'] : (i % 2 === 0) ? this.colors['messageOdd'] : this.colors['messageEven']);
				logs.push(val);
			}).call(this, i);
		}
//		console.log(args, logs);
		console.log.apply(null, logs);
	}
	
	Logger.prototype.warn = Logger.prototype.log.bind(Logger.prototype, 'warning');
	Logger.prototype.error = Logger.prototype.log.bind(Logger.prototype, 'error');

	Logger.prototype.m = {
			OK : 'OK'
	}
	
var logger =  new Logger();

module.exports = logger;
