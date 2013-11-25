var path = require( 'path' );
var constructor = require( path.join('..', 'lib', 'directory-encoder') );
var SvgURIEncoder = require( path.join('..', 'lib', 'svg-uri-encoder') );
var PngURIEncoder = require( path.join('..', 'lib', 'png-uri-encoder') );
var fs = require( 'fs' );
var _ = require( 'lodash' );

"use strict";
var encoder, output = "test/output/encoded.css";

exports['encode'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", output );
		done();
	},

	output: function( test ) {
		encoder.encode();
		test.ok( fs.existsSync(output) );
		test.ok( /\.bear/.test(fs.readFileSync(output)) );
		test.done();
	},

	selector: function( test ) {
		encoder._css = function( name, data ){
			test.ok( name === "bear" || name === "dog" );

			return constructor.prototype._css(name, data);
		};

		encoder.encode();
		test.done();
	},

	dup: function( test ) {
		encoder = new constructor( "test/encoding-dup", output );
		test.throws(function() { encoder.encode(); });
		test.done();
	}
};

var encoders;

exports['encoderSelection'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", output );
		encoders = _.clone( constructor.encoders );
		done();
	},

	tearDown: function( done ) {
		constructor.encoders = encoders;

		done();
	},

	handler: function( test ) {
		constructor.encoders.svg = function(){};
		constructor.encoders.svg.prototype.encode = function() {
			return "foo";
		};

		constructor.encoders.png = function(){};
		constructor.encoders.png.prototype.encode = function() {
			return "bar";
		};

		encoder._css = function( filename, datauri ) {
			test.ok( datauri === "foo" || datauri === "bar" );
		};

		encoder.encode();

		test.done();
	}
};


exports['css'] = {
	setUp: function( done ) {
		encoder = new constructor( "test/encoding", "test/output/encoded.css" );
		encoder2 = new constructor( "test/encoding", "test/output/encoded2.css",
															{ template: "test/files/default-css.hbs"} );
		encoder3 = new constructor( "test/encoding", "test/output/encoded3.css",
															{
																template: "test/files/default-css.hbs",
																customselectors: {
																	"foo": ["icon-2"]
																}
															} );
		done();
	},

	rule: function( test ) {
		test.equal( encoder._css("foo", "bar"),
			".foo { background-image: url('bar'); background-repeat: no-repeat; }" );
		test.done();
	},

	withTemplate: function( test ) {
		test.equal( encoder2._css("foo", "bar"),
			"\n.icon-foo {\n" +
				"\tbackground-image: url('bar');\n" +
				"\tbackground-repeat: no-repeat;\n" +
			"}\n" );
		test.done();
	},

	withTemplateCustomSelectors: function( test ) {
		test.equal( encoder3._css("foo", "bar"),
			"\n.icon-2,\n" +
			"\n.icon-foo {\n" +
				"\tbackground-image: url('bar');\n" +
				"\tbackground-repeat: no-repeat;\n" +
			"}\n" );
		test.done();
	}

};
