//var fs = require('fs');
//var ft = require('freetype2');
//var SimpleJson = require('./SimpleJson');
//var defaultFields = require('./defaultFields');

var defaultFields = [
	'style_name', 'family_name', 'ascender',
	'descender', 'height', 'underline_thickness',
	'underline_position', 'units_per_EM', 
	'max_advance_width'
];

function getAvailableCharacters(ft, face) {
	var gindex = {},
		charcode,
		chars = [];

	charcode = ft.Get_First_Char(face, gindex);
	while (gindex.gindex !== 0) {
	  chars.push(charcode);
	  charcode = ft.Get_Next_Char(face, charcode, gindex);
	}

	return chars;
}

function basicASCII(extended) {
	var codes = [];
	for (var i=32; i<=126; i++)
		codes.push( i );
	if (extended) {
		for (i=161; i<255; i++)
			codes.push( i );
	}
	return codes;
}

function getKerning(ft, face, chars, available, kernMode) {
	var kernings = [];	
	kernMode = kernMode || ft.KERNING_DEFAULT;

	for (var i=0; i<chars.length; i++) {
		var leftCode = chars[i];
		var left = ft.Get_Char_Index(face, leftCode);

		for (var j=0; j<chars.length; j++) {
			var rightCode = chars[j];
			var right = ft.Get_Char_Index(face, rightCode);
			var kern = { x:0, y:0 };
			var err = ft.Get_Kerning(face, left, right, kernMode, kern);
			if (!err && kern.x !== 0) {
				kernings.push({
					left: leftCode,
					right: rightCode,
					value: kern.x
				});
			} 
		}
	}
	// console.log("Found", kernings.length, "kerning pairs");
	return kernings;
}

//this tool is a bit of a mess. gotta clean 'er up..

function parse(buffer, options) {
	options = options||{};
	
	// Create a font face
	var face = ft.New_Memory_Face(buffer, 0);
	var available = getAvailableCharacters(ft, face);

	// if ((face.face_flags & ft.FACE_FLAG_SCALABLE) !== ft.FACE_FLAG_SCALABLE)
	// 	console.warn("Font is not scalable");

	var codesToUse = options.charcodes;
	if (options.charcodes === "all")
		codesToUse = available;
	else if (!codesToUse || codesToUse === "ascii")
		codesToUse = basicASCII();
	else if (codesToUse === "ascii-extended")
		codesToUse = basicASCII(true);


	var exporter = options.exporter || new SimpleJson();
	var fontPtSize = options.size || 12;
	var fontResolution = options.resolution || 72;
	var ignoreKerning = options.ignoreKerning;
	var ignorePath = options.ignorePath;
	var exportFields = options.fields || defaultFields;

	//if 'all' is specified, run the tool on the entire set
	var charcodes = options.charcodes === "all" 
			? available 
			: codesToUse.filter(function(c) {
				return available.indexOf(c) !== -1;
			});

	//Set the point size
	ft.Set_Char_Size(face, fontPtSize * 64, fontPtSize * 64, fontResolution, fontResolution);

	var dataObj = {};
	dataObj.size = fontPtSize;
	dataObj.resolution = fontResolution;

	//copy contents..
	for (var k in face) {
		if (defaultFields.indexOf(k) !== -1)
			dataObj[k] = face[k];
	}

	if (!ignoreKerning) {
		//check if we have kerning in the font file
		if ( (face.face_flags & ft.FACE_FLAG_KERNING) === ft.FACE_FLAG_KERNING ) {
			dataObj.kerning = getKerning(ft, face, charcodes, available);
		} else {
			// console.warn("No kerning information in font file.");
			dataObj.kerning = [];
		}
	}

	dataObj.glyphs = [];
	for (var i=0; i<charcodes.length; i++) {
		var code = charcodes[i];
		var gindex = ft.Get_Char_Index(face, code);
		ft.Load_Glyph(face, gindex, ft.LOAD_NO_BITMAP);

		var metrics = {};

		for (var k in face.glyph.metrics) {
			metrics[k] = face.glyph.metrics[k];
		}

		var glyph = {
			code: charcodes[i],
			metrics: metrics
		};

		if (!ignorePath) {
			glyph.outline = exporter.getGlyphOutline(ft, face, code);
		}

		dataObj.glyphs.push(glyph);
	}
	exporter.export(dataObj, options);
}














function SimpleJson() {
}

SimpleJson.prototype.export = function(fontInfo, options) {
	var writer = options.output ? fs.createWriteStream(options.output) : process.stdout;

	var objOut = {};
	for (var k in fontInfo) {
		if (k !== 'glyphs' && k !== 'kerning')
			objOut[k] = fontInfo[k];
	}	

	//For better minification, a list of arrays
	//Format: [leftChar, rightChar, kerning]
	objOut.kerning = [];

	if (fontInfo.kerning) {
		for (var i=0; i<fontInfo.kerning.length; i++) {
			var kern = fontInfo.kerning[i];
			objOut.kerning.push( 
				[ String.fromCharCode(kern.left),
				  String.fromCharCode(kern.right),
				  kern.value ]);
		}
	}
		
	objOut.glyphs = {};
	for (var i=0; i<fontInfo.glyphs.length; i++) {
		var g = fontInfo.glyphs[i];
		var glyphOut = {
			xoff: g.metrics.horiAdvance,
			width: g.metrics.width,
			height: g.metrics.height,
			hbx: g.metrics.horiBearingX,
			hby: g.metrics.horiBearingY
		};
		if (g.outline)
			glyphOut.path = g.outline || [];
		objOut.glyphs[ String.fromCharCode(g.code) ] = glyphOut;
	}

	objOut.exporter = EXPORTER_NAME;
	objOut.version = pkg.version;

	var jsonOut = JSON.stringify(objOut, null, options.prettyPrint ? 2 : null);

	if (options.commonJS) {
		jsonOut = "module.exports = "+jsonOut+";";
	}

	writer.write(jsonOut);
}

SimpleJson.prototype.getGlyphOutline = function(ft, face, code) {
	if (face.glyph.format !== ft.GLYPH_FORMAT_OUTLINE) {
		// console.warn("Charcode", code, "("+String.fromCharCode(code)+") has no outline");
		return [];
	}
	var data = [];
	ft.Outline_Decompose(face, {
		move_to: function(x, y) {
			data.push(["m", x, y]);
		},
		line_to: function(x, y) {
			data.push(["l", x, y]);
		},
		quad_to: function(cx, cy, x, y) {
			data.push(["q", cx, cy, x, y]);
		},
		cubic_to: function(cx1, cy1, cx2, cy2, x, y) {
			data.push(["c", cx1, cy1, cx2, cy2, x, y]);
		},
	});
	return data;
}

//small decrease in filesize, worse to parse though.. worth it?
SimpleJson.prototype.getGlyphOutlineStr = function(ft, face, code) {
	if (face.glyph.format !== ft.GLYPH_FORMAT_OUTLINE) {
		// console.warn("Charcode", code, "("+String.fromCharCode(code)+") has no outline");
		return [];
	}
	var data = "";
	ft.Outline_Decompose(face, {
		move_to: function(x, y) {
			data += "m "+(Math.floor(x))+" "+(Math.floor(y))+" ";
		},
		line_to: function(x, y) {
			data += "l "+(Math.floor(x))+" "+(Math.floor(y))+" ";
		},
		quad_to: function(cx, cy, x, y) {
			data += "q "+(Math.floor(cx))+" "+(Math.floor(cy))+" "+(Math.floor(x))+" "+(Math.floor(y))+" ";
		},
		cubic_to: function(cx1, cy1, cx2, cy2, x, y) {
			data += "c "+(Math.floor(cx1))+" "+(Math.floor(cy1))+" "+(Math.floor(cx2))+" "+(Math.floor(cy2))+" "+(Math.floor(x))+" "+(Math.floor(y))+" ";
		},
	});
	return data.trim();
}



















module.exports = parse;